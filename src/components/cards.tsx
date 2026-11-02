import { Link } from "@tanstack/react-router";
import type { Product, Release } from "@/lib/catalog";
import { kes } from "@/lib/format";

export function ReleaseCard({ release }: { release: Release }) {
  return (
    <Link
      to="/music/$slug"
      params={{ slug: release.slug }}
      className="group panel block overflow-hidden transition-colors hover:border-primary"
    >
      <div className="relative aspect-square overflow-hidden bg-bg">
        <img
          src={release.cover}
          alt={`${release.title} cover`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {release.exclusive ? (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-2 py-1 text-[10px] font-bold tracking-wider text-fg">
            EXCLUSIVE
          </span>
        ) : null}
      </div>
      <div className="flex items-start justify-between gap-3 p-3">
        <div>
          <h3 className="font-semibold text-fg">{release.title}</h3>
          <p className="text-xs tracking-wide text-dim uppercase">
            {release.type} · {release.year}
          </p>
        </div>
        <span className="tabular-nums text-sm text-muted">{kes(release.price)}</span>
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/merch/$slug"
      params={{ slug: product.slug }}
      className="group panel block overflow-hidden p-3 transition-colors hover:border-primary"
    >
      <div className="aspect-square overflow-hidden rounded-lg bg-bg-elev">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <h3 className="font-semibold text-fg">{product.name}</h3>
        <span className="tabular-nums text-sm text-muted">{kes(product.price)}</span>
      </div>
      <p className="text-xs tracking-wide text-dim uppercase">{product.category}</p>
    </Link>
  );
}

export function PageHero({
  kicker,
  title,
  text,
}: {
  kicker: string;
  title: string;
  text: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <img src="/media/skyline.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-bg/50" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <p className="font-display text-sm tracking-[0.28em] text-primary">{kicker}</p>
        <h1 className="mt-1 font-display text-5xl text-fg md:text-6xl">{title}</h1>
        <p className="mt-3 max-w-xl text-muted">{text}</p>
      </div>
    </section>
  );
}
