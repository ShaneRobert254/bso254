import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { beatLive, beatTime, hashSeed, onBeat, seekBeat, startBeat, stopBeat } from "@/lib/beat";
import { PREVIEW_SECONDS } from "@/lib/format";

export type NowPlaying = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  seed: number;
  src?: string;
};

type PlayInput = Omit<NowPlaying, "seed"> & { seed?: number; duration?: number };

type PlayerValue = {
  now: NowPlaying | null;
  playing: boolean;
  progress: number;
  duration: number;
  play: (track: PlayInput) => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerValue | null>(null);
const fileAudio = { el: null as HTMLAudioElement | null };

function stopFile() {
  const el = fileAudio.el;
  if (!el) return;
  el.pause();
  el.removeAttribute("src");
  el.load();
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [now, setNow] = useState<NowPlaying | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(PREVIEW_SECONDS);

  useEffect(() => {
    return onBeat(() => {
      if (fileAudio.el && !fileAudio.el.paused) return;
      setPlaying(beatLive());
    });
  }, []);

  useEffect(() => {
    if (!playing || now?.src) return;
    let frame = 0;
    const tick = () => {
      setProgress(beatTime());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, now?.id, now?.src]);

  useEffect(() => {
    const el = fileAudio.el;
    if (!playing || !now?.src || !el) return;
    const tick = () => setProgress(el.currentTime || 0);
    el.addEventListener("timeupdate", tick);
    return () => el.removeEventListener("timeupdate", tick);
  }, [playing, now?.id, now?.src]);

  const api = useMemo<PlayerValue>(() => {
    const finish = () => {
      setPlaying(false);
      setProgress((current) => (now?.src ? duration : PREVIEW_SECONDS) || current);
    };
    return {
      now,
      playing,
      progress,
      duration,
      play: (track) => {
        stopBeat();
        stopFile();
        const next: NowPlaying = {
          id: track.id,
          title: track.title,
          artist: track.artist,
          cover: track.cover,
          seed: track.seed ?? hashSeed(track.id),
          src: track.src,
        };
        const length = track.src ? Math.max(1, track.duration || PREVIEW_SECONDS) : PREVIEW_SECONDS;
        setNow(next);
        setDuration(length);
        setProgress(0);
        setPlaying(true);
        if (track.src) {
          const el = fileAudio.el ?? new Audio();
          fileAudio.el = el;
          el.src = track.src;
          el.onended = () => {
            setPlaying(false);
            setProgress(el.duration || length);
          };
          el.onloadedmetadata = () => {
            if (Number.isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
          };
          void el.play();
          return;
        }
        startBeat(next.seed, PREVIEW_SECONDS, 0, finish);
      },
      toggle: () => {
        if (!now) return;
        const el = fileAudio.el;
        if (now.src && el) {
          if (playing) {
            el.pause();
            setProgress(el.currentTime);
            setPlaying(false);
            return;
          }
          setPlaying(true);
          if (el.ended || el.currentTime >= (el.duration || duration) - 0.2) el.currentTime = 0;
          void el.play();
          return;
        }
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
        const next = Math.min(duration, Math.max(0, seconds));
        setProgress(next);
        if (now?.src && fileAudio.el) {
          fileAudio.el.currentTime = next;
          return;
        }
        if (playing) seekBeat(next);
      },
      close: () => {
        stopBeat();
        stopFile();
        setPlaying(false);
        setNow(null);
        setProgress(0);
      },
    };
  }, [duration, now, playing, progress]);

  return <PlayerContext.Provider value={api}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error("Player is missing");
  return value;
}