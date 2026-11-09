import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Pause, Play, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { hashSeed, renderPreviewWav } from "@/lib/beat";
import { clock, kes, PREVIEW_SECONDS } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { useShop } from "@/lib/shop";
import { site } from "@/lib/site";
import { ownsRelease, ownsTrack, useCart, useOrders } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/music/$slug")({ component: ReleasePage });

function ReleasePage() {
  const { slug } = Route.useParams();
  const { releases } = useShop();
  const release = releases.find((item) => item.slug === slug);
  const player = usePlayer();
  const add = useCart((state) => state.add);
  const orders = useOrders((state) => state.orders);
  const ready = useHydrated();
  if (!release) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="font-display text-5xl">Not in the catalog</h1>
        <Link to="/music" className="btn-solid mt-6">Back to music</Link>
      </div>
    );
  }
  const ownedPack = ready && ownsRelease(orders, release.slug);

  function buyPack() {
    add({
      kind: "music",
      ref: release!.slug,
      title: release!.title,
      price: release!.price,
      image: release!.cover,
    });
    toast.success(`${release!.title} added to your bag`);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[320px_1fr]">
      <div>
        <img src={release.cover} alt={`${release.title} cover`} className="w-full rounded-xl border border-border" />
        <p className="mt-4 text-xs tracking-[0.2em] text-dim uppercase">
          {release.type} · {release.year}
          {release.exclusive ? " · Exclusive" : ""}
        </p>
        <h1 className="font-display text-5xl text-fg">{release.title}</h1>
        <p className="mt-2 text-muted">{release.blurb}</p>
        <p className="mt-4 font-display text-3xl text-fg">{kes(release.price)}</p>
        {ownedPack ? (
          <Link to="/library" className="btn-line mt-4 w-full">In your library</Link>
        ) : (
          <button type="button" className="btn-solid mt-4 w-full" onClick={buyPack}>
            <ShoppingBag className="h-4 w-4" />
            {release.type === "album" ? "Buy album" : "Buy single"}
          </button>
        )}
        <p className="mt-3 text-xs text-dim">
          {release.tracks.some((track) => track.audio)
            ? "Play uses the song file from Studio. Tracks without a file still play a short sketch."
            : `No song file yet. Previews are ${PREVIEW_SECONDS}s sketches until you upload an MP3 or WAV in Studio.`}
        </p>
      </div>
      <ol className="panel divide-y divide-border">
        {release.tracks.map((track, index) => {
          const active = player.now?.id === track.id;
          const owned = ready && (ownedPack || ownsTrack(orders, release.slug, track.id));
          return (
            <li key={track.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="w-6 text-sm text-dim tabular-nums">{index + 1}</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-fg"
                aria-label={`Preview ${track.title}`}
                onClick={() => {
                  if (active) player.toggle();
                  else {
                    player.play({
                      id: track.id,
                      title: track.title,
                      artist: `${site.artist} — ${release.title}`,
                      cover: release.cover,
                      src: track.audio,
                      duration: track.duration,
                    });
                  }
                }}
              >
                {active && player.playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{track.title}</p>
                <p className="text-xs text-dim tabular-nums">{clock(track.duration)}</p>
              </div>
              {release.type === "album" ? (
                owned ? (
                  <span className="text-xs text-primary">Owned</span>
                ) : (
                  <button
                    type="button"
                    className="text-sm text-muted hover:text-fg"
                    onClick={() => {
                      add({
                        kind: "music",
                        ref: release.slug,
                        trackId: track.id,
                        title: track.title,
                        price: track.price,
                        image: release.cover,
                      });
                      toast.success(`${track.title} added`);
                    }}
                  >
                    {kes(track.price)}
                  </button>
                )
              ) : null}
              {owned ? (
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm text-fg hover:text-primary"
                  onClick={() => {
                    void renderPreviewWav(hashSeed(track.id), PREVIEW_SECONDS).then((blob) => {
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${site.brand}-${track.title}-preview.wav`;
                      link.click();
                      URL.revokeObjectURL(url);
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  Preview
                </button>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
