import { Pause, Play, X } from "lucide-react";
import { clock } from "@/lib/format";
import { usePlayer } from "@/lib/player";

export function PlayerBar() {
  const player = usePlayer();
  if (!player.now) return null;
  const ratio = player.duration === 0 ? 0 : player.progress / player.duration;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-elev/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2">
        <img src={player.now.cover} alt="" className="h-12 w-12 rounded-md object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-fg">{player.now.title}</p>
            <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] tracking-wider text-dim uppercase sm:inline">
              {player.now.src ? "Song" : "Preview"}
            </span>
          </div>
          <p className="truncate text-xs text-muted">{player.now.artist}</p>
          <label className="mt-1 flex items-center gap-2">
            <span className="sr-only">Seek preview</span>
            <input
              type="range"
              min={0}
              max={player.duration}
              step={0.1}
              value={Math.min(player.duration, player.progress)}
              onChange={(event) => player.seek(Number(event.target.value))}
              className="h-1 w-full accent-primary"
              style={{ background: `linear-gradient(90deg, var(--color-primary) ${ratio * 100}%, var(--color-border) ${ratio * 100}%)` }}
            />
            <span className="w-16 shrink-0 text-right text-[11px] text-dim tabular-nums">
              {clock(player.progress)} / {clock(player.duration)}
            </span>
          </label>
        </div>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-fg" onClick={player.toggle} aria-label={player.playing ? "Pause" : "Play"}>
          {player.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button type="button" className="inline-flex h-11 w-11 items-center justify-center text-muted hover:text-fg" onClick={player.close} aria-label="Close player">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
