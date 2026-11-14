import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { kes } from "@/lib/format";
import { useShop } from "@/lib/shop";
import { useCart } from "@/lib/store";
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
  const add = useCart((state) => state.add);
  const [size, setSize] = useState(product?.sizes[0] ?? "");
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
        <p className="mt-4 font-display text-4xl">{kes(product.price)}</p>
        <p className="mt-6 text-sm text-muted">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.sizes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSize(item)}
              className={cn(
                "h-11 min-w-11 rounded-full border px-4 text-sm",
                size === item ? "border-primary bg-primary text-fg" : "border-border text-muted",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn-solid mt-6"
          onClick={() => {
            add({
              kind: "merch",
              ref: product.slug,
              title: product.name,
              price: product.price,
              image: product.image,
              size,
            });
            toast.success(`${product.name} · ${size} added`);
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          Add to bag
        </button>
        <ul className="mt-6 grid gap-2 text-sm text-muted">
          {product.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
