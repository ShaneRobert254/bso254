import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Play } from "lucide-react";
import { hashSeed, renderPreviewWav } from "@/lib/beat";
import { PageHero } from "@/components/cards";
import { clock, PREVIEW_SECONDS } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { useShop } from "@/lib/shop";
import { site } from "@/lib/site";
import { ownsTrack, useOrders } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/library")({ component: LibraryPage });

function LibraryPage() {
  const ready = useHydrated();
  const orders = useOrders((state) => state.orders);
  const player = usePlayer();
  const { releases } = useShop();
  const owned = ready
    ? releases.flatMap((release) =>
        release.tracks
          .filter((track) => ownsTrack(orders, release.slug, track.id))
          .map((track) => ({ release, track })),
      )
    : [];

  return (
    <div>
      <PageHero
        kicker="LIBRARY"
        title="Your music"
        text="Anything you buy on this device shows up here. Preview files download as WAV until the masters are added."
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
                  onClick={() =>
                    player.play({
                      id: track.id,
                      title: track.title,
                      artist: site.artist,
                      cover: release.cover,
                    })
                  }
                >
                  <Play className="h-4 w-4" />
                  Play
                </button>
                <button
                  type="button"
                  className="btn-solid"
                  onClick={() => {
                    void renderPreviewWav(hashSeed(track.id), PREVIEW_SECONDS).then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${site.brand}-${track.id}-preview.wav`;
                      link.click();
                      URL.revokeObjectURL(url);
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
