import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { beatLive, beatTime, hashSeed, onBeat, seekBeat, startBeat, stopBeat } from "@/lib/beat";
import { PREVIEW_SECONDS } from "@/lib/format";

export type NowPlaying = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  seed: number;
};

type PlayerValue = {
  now: NowPlaying | null;
  playing: boolean;
  progress: number;
  duration: number;
  play: (track: Omit<NowPlaying, "seed"> & { seed?: number }) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState<NowPlaying | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return onBeat(() => {
      setPlaying(beatLive());
    });
  }, []);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      setProgress(beatTime());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, now?.id]);

  const api = useMemo<PlayerValue>(() => {
    const finish = () => {
      setPlaying(false);
      setProgress(PREVIEW_SECONDS);
    };
    return {
      now,
      playing,
      progress,
      duration: PREVIEW_SECONDS,
      play: (track) => {
        const next: NowPlaying = {
          id: track.id,
          title: track.title,
          artist: track.artist,
          cover: track.cover,
          seed: track.seed ?? hashSeed(track.id),
        };
        setNow(next);
        setProgress(0);
        setPlaying(true);
        startBeat(next.seed, PREVIEW_SECONDS, 0, finish);
      },
      toggle: () => {
        if (!now) return;
        if (playing) {
          const at = beatTime();
          stopBeat();
          setProgress(at);
          setPlaying(false);
          return;
        }
        setPlaying(true);
        startBeat(now.seed, PREVIEW_SECONDS, progress >= PREVIEW_SECONDS - 0.2 ? 0 : progress, finish);
      },
      seek: (seconds) => {
        const next = Math.min(PREVIEW_SECONDS, Math.max(0, seconds));
        setProgress(next);
        if (playing) seekBeat(next);
      },
      close: () => {
        stopBeat();
        setPlaying(false);
        setNow(null);
        setProgress(0);
      },
    };
  }, [now, playing, progress]);

  return <PlayerContext.Provider value={api}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("Player is missing");
  return value;
}
