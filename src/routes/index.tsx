import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Pause, Play } from "lucide-react";
import { useState } from "react";
import { Crown } from "@/components/logo";
import { JoinForm } from "@/components/join-form";
import { gallery, type Release } from "@/lib/catalog";
import { kes } from "@/lib/format";
import { usePlayer } from "@/lib/player";
import { useShop } from "@/lib/shop";
import { site } from "@/lib/site";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const player = usePlayer();
  const { releases, products } = useShop();
  const [video, setVideo] = useState(false);
  const leadRelease = releases[0];
  const lead = leadRelease.tracks[0];

  function playRelease(release: Release) {
    const track = release.tracks[0];
    player.play({
      id: track.id,
      title: track.title,
      artist: site.artist,
      cover: release.cover,
    });
  }

  function playLead() {
    playRelease(leadRelease);
  }

  return (
    <div>
      <section className="relative min-h-[36rem] overflow-hidden border-b border-border lg:min-h-screen">
        <img
          src="/media/hero.jpg"
          alt="Bso in a black hoodie against a stormy skyline"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/75 to-bg/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/50" />
        <div className="relative mx-auto flex min-h-[36rem] max-w-6xl flex-col justify-end px-4 py-16 lg:min-h-screen lg:justify-center lg:py-24">
          <div className="max-w-xl">
            <Crown className="mb-2 h-8 w-12 text-primary" />
            <h1 className="font-brush text-7xl leading-none text-fg sm:text-8xl">
              BSO
              <span className="text-primary">254</span>
            </h1>
            <p className="mt-4 font-display text-3xl tracking-wide text-fg sm:text-4xl">
              FROM THE TRENCHES <span className="text-primary">TO THE THRONE</span>
            </p>
            <p className="mt-3 max-w-md text-sm text-muted sm:text-base">
              Music, merch, and the movement. Latest chapter: {leadRelease.title}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" className="btn-solid" onClick={playLead}>
                <Play className="h-4 w-4" />
                Listen Now
              </button>
              <Link to="/merch" className="btn-line">
                Shop Now
              </Link>
            </div>
            <button
              type="button"
              className="mt-5 inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg"
              onClick={() => setVideo(true)}
            >
              <Play className="h-4 w-4 text-primary" />
              Watch the {lead.title} visualizer
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-sm tracking-[0.28em] text-primary">MUSIC</p>
            <h2 className="font-display text-5xl text-fg sm:text-6xl">The Sound</h2>
          </div>
          <Link to="/music" className="btn-line">
            All music
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {releases.slice(0, 6).map((release) => {
            const track = release.tracks[0];
            const active = player.now?.id === track.id && player.playing;
            return (
              <article key={release.slug} className="panel overflow-hidden">
                <div className="relative">
                  <Link to="/music/$slug" params={{ slug: release.slug }}>
                    <img src={release.cover} alt={`${release.title} cover`} className="aspect-square w-full object-cover" />
                  </Link>
                  {release.exclusive ? (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs font-bold tracking-wide text-fg">
                      <Lock className="h-3 w-3" />
                      Exclusive
                    </span>
                  ) : null}
                  <button
                    type="button"
                    aria-label={active ? `Pause ${track.title}` : `Play ${track.title}`}
                    className="absolute right-3 bottom-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-fg"
                    onClick={() => (active ? player.toggle() : playRelease(release))}
                  >
                    {active ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <h3 className="font-display text-2xl leading-none text-fg">{release.title}</h3>
                    <p className="mt-1 text-xs tracking-wide text-dim uppercase">
                      {release.type} · {release.year}
                    </p>
                  </div>
                  <span className="tabular-nums text-sm text-muted">{kes(release.price)}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-bg-elev">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm tracking-[0.28em] text-primary">MERCH</p>
              <h2 className="font-display text-5xl text-fg sm:text-6xl">The Drip</h2>
            </div>
            <Link to="/merch" className="btn-line">
              Shop the drop
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.slug}
                to="/merch/$slug"
                params={{ slug: product.slug }}
                className="group panel overflow-hidden bg-bg"
              >
                <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
                <div className="flex items-baseline justify-between gap-3 p-4">
                  <div>
                    <h3 className="font-semibold text-fg">{product.name}</h3>
                    <p className="text-xs tracking-wide text-dim uppercase">{product.category}</p>
                  </div>
                  <span className="tabular-nums text-sm text-muted">{kes(product.price)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
        <img
          src="/media/portrait.jpg"
          alt="Bso in a black hoodie against the city"
          className="aspect-[4/5] w-full rounded-xl border border-border object-cover"
        />
        <div>
          <p className="font-display text-sm tracking-[0.28em] text-primary">ABOUT</p>
          <h2 className="font-display text-5xl text-fg sm:text-6xl">The Story</h2>
          <p className="mt-4 text-lg text-fg">
            From the streets of Kenya to the global stage, Bso is more than music — it's a movement.
          </p>
          <p className="mt-3 text-muted">
            BSO254 carries the country code in the name. The climb is the whole record: cold mornings,
            night buses, and the turn from survival to a throne. Flip A Page is the latest chapter.
            Run It Up is still locked for the people who show up early.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/about" className="btn-solid">
              Read the story
            </Link>
            <Link to="/community" className="btn-line">
              Join the movement
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-display text-sm tracking-[0.28em] text-primary">PHOTOS</p>
              <h2 className="font-display text-5xl text-fg sm:text-6xl">Gallery</h2>
            </div>
            <Link to="/gallery" className="btn-line">
              View gallery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {gallery.slice(0, 8).map((shot) => (
              <Link key={shot.src} to="/gallery" className="group overflow-hidden rounded-lg border border-border">
                <img src={shot.src} alt={shot.alt} className="aspect-[3/4] w-full object-cover" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-bg-elev">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="font-display text-sm tracking-[0.28em] text-primary">LIST</p>
            <h2 className="font-display text-5xl text-fg sm:text-6xl">Get the next drop</h2>
            <p className="mt-3 max-w-md text-muted">
              Name, email, city. Exclusive updates, unreleased previews, and merch before it hits the rack.
            </p>
          </div>
          <div className="panel p-4 sm:p-5">
            <JoinForm />
          </div>
        </div>
      </section>

      {video ? <VideoModal onClose={() => setVideo(false)} onPlay={playLead} /> : null}
    </div>
  );
}

function VideoModal({ onClose, onPlay }: { onClose: () => void; onPlay: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-bg/80 p-4" role="dialog" aria-modal="true" aria-label="Latest video">
      <div className="panel w-full max-w-3xl overflow-hidden">
        <div className="relative aspect-video bg-bg">
          {site.youtubeId ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${site.youtubeId}?autoplay=1`}
              title="Latest BSO254 video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <>
              <img src="/media/portrait.jpg" alt="" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="font-display text-4xl text-fg">FLIP A PAGE</p>
                <p className="max-w-md text-sm text-muted">
                  Visualizer preview. The official video plays here once the YouTube id is set.
                </p>
                <button
                  type="button"
                  className="btn-solid"
                  onClick={() => {
                    onPlay();
                    onClose();
                  }}
                >
                  <Play className="h-4 w-4" />
                  Play preview
                </button>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end p-3">
          <button type="button" className="btn-line" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
