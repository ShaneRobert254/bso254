import { createFileRoute, Link } from "@tanstack/react-router";
import { site } from "@/lib/site";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <div>
      <section className="relative min-h-[420px] overflow-hidden border-b border-border">
        <img src="/media/about.jpg" alt="Bso looking over the city" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/75 to-transparent" />
        <div className="relative mx-auto flex min-h-[420px] max-w-6xl flex-col justify-end px-4 py-12">
          <p className="font-display tracking-[0.28em] text-primary">ABOUT BSO</p>
          <h1 className="font-display text-6xl md:text-7xl">The journey. The dream.</h1>
        </div>
      </section>
      <article className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 text-muted">
          <p className="text-lg text-fg">
            From the streets of Kenya to the global stage, Bso is more than music — it's a movement.
          </p>
          <p>
            BSO254 carries the country code in the name. The work is the climb that tagline keeps repeating:
            from the trenches, to the throne. Not a costume. A record of what it took to get the mic,
            then what it takes to keep it.
          </p>
          <p>
            The shop is the front door. Albums and singles live next to the clothes, because the people who
            play the songs are the same people who wear the crown. Flip A Page is the latest chapter.
            Run It Up is still behind the lock, for the fans who show up early.
          </p>
          <p>
            {site.artist} writes for the night bus, the booth light, and the city that stays up after the
            clubs close. If you are booking a show, a feature, or a press sit-down, the contact page is open.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link to="/music" className="btn-solid">Hear the music</Link>
            <Link to="/contact" className="btn-line">Bookings</Link>
          </div>
        </div>
        <img src="/media/portrait.jpg" alt="Portrait of Bso" className="w-full rounded-xl border border-border object-cover" />
      </article>
    </div>
  );
}
