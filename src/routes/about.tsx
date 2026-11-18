import { createFileRoute, Link } from "@tanstack/react-router";
import { getCopy } from "@/lib/settings";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => pageMeta("About Bso (Bso254)", "Bso254 is the Kenyan rapper Bso. The story, the name, and the music."),
  loader: () => getCopy(),
  component: AboutPage,
});

function AboutPage() {
  const copy = Route.useLoaderData();
  return (
    <div>
      <section className="relative min-h-[420px] overflow-hidden border-b border-border">
        <img src="/media/about.jpg" alt="Bso looking over the city" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/75 to-transparent" />
        <div className="relative mx-auto flex min-h-[420px] max-w-6xl flex-col justify-end px-4 py-12">
          <p className="font-display tracking-[0.28em] text-primary">ABOUT BSO</p>
          <h1 className="font-display text-6xl md:text-7xl">Bso. Bso254.</h1>
        </div>
      </section>
      <article className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 text-muted">
          <p className="text-lg text-fg">{copy.about[0]}</p>
          <p>{copy.about[1]}</p>
          <p>{copy.about[2]}</p>
          <p>{copy.about[3]}</p>
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
