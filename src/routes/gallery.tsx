import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/cards";
import { gallery } from "@/lib/catalog";

export const Route = createFileRoute("/gallery")({ component: GalleryPage });

function GalleryPage() {
  const [active, setActive] = useState<number | null>(null);
  const shot = active === null ? null : gallery[active];

  return (
    <div>
      <PageHero kicker="GALLERY" title="Moments & vibes" text="Booth, street, and the skyline the records were written under." />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-8 md:grid-cols-3">
        {gallery.map((item, index) => (
          <button
            key={item.src}
            type="button"
            className="group overflow-hidden rounded-xl border border-border text-left"
            onClick={() => setActive(index)}
          >
            <img src={item.src} alt={item.alt} className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <span className="block px-3 py-2 text-sm text-muted">{item.caption}</span>
          </button>
        ))}
      </div>
      {shot ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-bg/85 p-4" role="dialog" aria-modal="true" aria-label={shot.caption}>
          <button type="button" className="absolute inset-0" aria-label="Close" onClick={() => setActive(null)} />
          <figure className="relative max-h-[90vh] max-w-4xl">
            <img src={shot.src} alt={shot.alt} className="max-h-[80vh] w-full rounded-xl object-contain" />
            <figcaption className="mt-2 text-center text-sm text-muted">{shot.caption}</figcaption>
          </figure>
        </div>
      ) : null}
    </div>
  );
}
