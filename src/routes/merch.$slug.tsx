import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/lib/shop";
import { getProduct } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/merch/$slug")({
  head: ({ params }) => {
    const product = getProduct(params.slug);
    return pageMeta(
      `${product?.name ?? "Merch"} — Bso254`,
      product?.blurb ?? "Official Bso254 merch from the Kenyan rapper Bso.",
    );
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { products } = useShop();
  const product = products.find((item) => item.slug === slug);
  if (!product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h1 className="font-display text-5xl">Piece not found</h1>
        <Link to="/merch" className="btn-solid mt-6">Back to merch</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
      <img src={product.image} alt={product.name} className="w-full rounded-xl border border-border bg-surface" />
      <div>
        <p className="text-xs tracking-[0.2em] text-dim uppercase">{product.category}</p>
        <h1 className="font-display text-6xl text-fg">{product.name}</h1>
        <p className="mt-3 text-muted">{product.blurb}</p>
        <p className="mt-6 text-sm tracking-[0.18em] text-primary uppercase">Coming soon</p>
        <p className="mt-2 text-sm text-muted">These pieces are not ready yet. Nothing can be ordered or paid for.</p>
        <ul className="mt-6 grid gap-2 text-sm text-muted">
          {product.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
