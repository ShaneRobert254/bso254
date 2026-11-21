import { createFileRoute, Link } from "@tanstack/react-router";
import { Pause, Play } from "lucide-react";
import { clock } from "@/lib/format";
import { playIfPaid } from "@/lib/listen";
import { usePlayer } from "@/lib/player";
import { useShop } from "@/lib/shop";
import { site } from "@/lib/site";
import { getRelease } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/music/$slug")({
  head: ({ params }) => {
    const release = getRelease(params.slug);
    return pageMeta(
      `${release?.title ?? "Music"} — Bso254 (Bso)`,
      release?.blurb ?? "A song by Bso, the Kenyan rapper Bso254.",
    );
  },
  component: ReleasePage,
});

function ReleasePage() {
  const { slug } = Route.useParams();
  const { releases } = useShop();
  const release = releases.find((item) => item.slug === slug);
  const player = usePlayer();
  if (!release) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="font-display text-5xl">Not in the catalog</h1>
        <Link to="/music" className="btn-solid mt-6">Back to music</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[320px_1fr]">
      <div>
        <img src={release.cover} alt={`${release.title} cover`} className="w-full rounded-xl border border-border" />
        <p className="mt-4 text-xs tracking-[0.2em] text-dim uppercase">
          {release.type} · {release.year}
          {release.released ? ` · ${release.released}` : ""}
          {release.exclusive ? " · Exclusive" : ""}
        </p>
        <h1 className="font-display text-5xl text-fg">{release.title}</h1>
        <p className="mt-2 text-muted">{release.blurb}</p>
        <p className="mt-4 text-sm text-muted">Free to listen on this site for now. It does not download.</p>
      </div>
      <ol className="panel divide-y divide-border">
        {release.tracks.map((track, index) => {
          const active = player.now?.id === track.id;
          return (
            <li key={track.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="w-6 text-sm text-dim tabular-nums">{index + 1}</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-fg"
                aria-label={active && player.playing ? `Pause ${track.title}` : `Play ${track.title}`}
                onClick={() => {
                  if (active) player.toggle();
                  else {
                    void playIfPaid(player, track, true, {
                      artist: `${site.artist} — ${release.title}`,
                      cover: release.cover,
                    });
                  }
                }}
              >
                {active && player.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{track.title}{track.feat ? ` feat. ${track.feat}` : ""}</p>
                <p className="text-xs text-dim tabular-nums">{clock(track.duration)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
