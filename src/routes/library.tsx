import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { PageHero } from "@/components/cards";
import { clock } from "@/lib/format";
import { playIfPaid } from "@/lib/listen";
import { usePlayer } from "@/lib/player";
import { useShop } from "@/lib/shop";
import { site } from "@/lib/site";
import { ownsTrack, useOrders } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { accountOwns, useAccountTracks } from "@/lib/use-owned";

export const Route = createFileRoute("/library")({ component: LibraryPage });

function LibraryPage() {
  const ready = useHydrated();
  const orders = useOrders((state) => state.orders);
  const player = usePlayer();
  const { releases } = useShop();
  const account = useAccountTracks();
  const owned = ready
    ? releases.flatMap((release) =>
        release.tracks
          .filter((track) => ownsTrack(orders, release.slug, track.id) || accountOwns(account, release.slug, track.id))
          .map((track) => ({ release, track })),
      )
    : [];

  return (
    <div>
      <PageHero
        kicker="LIBRARY"
        title="Your music"
        text="Pay once and the song stays with your Google or X account, and on this browser. Play it here. It does not download."
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        {owned.length === 0 ? (
          <div className="panel p-8">
            <p className="text-muted">Nothing owned yet.</p>
            <Link to="/music" className="btn-solid mt-4">Browse music</Link>
          </div>
        ) : (
          <ul className="panel divide-y divide-border">
            {owned.map(({ release, track }) => (
              <li key={track.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <img src={release.cover} alt="" className="h-14 w-14 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{track.title}</p>
                  <p className="text-xs text-dim">{release.title} · {clock(track.duration)}</p>
                </div>
                <button
                  type="button"
                  className="btn-line"
                  onClick={() => {
                    void playIfPaid(player, track, true, { artist: site.artist, cover: release.cover });
                  }}
                >
                  <Play className="h-4 w-4" />
                  Play
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
