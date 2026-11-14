import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageHero } from "@/components/cards";
import { kes } from "@/lib/format";
import { cartTotal, useCart } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { hiddenMeta } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () => hiddenMeta("Bag — Bso254"),
  component: CartPage,
});

function CartPage() {
  const ready = useHydrated();
  const lines = useCart((state) => state.lines);
  const setQty = useCart((state) => state.setQty);
  const remove = useCart((state) => state.remove);
  const shown = ready ? lines : [];
  const total = cartTotal(shown);

  return (
    <div>
      <PageHero kicker="BAG" title="Your bag" text="Music unlocks in your library. Merch is reserved for delivery across Kenya." />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_280px]">
        {shown.length === 0 ? (
          <div className="panel p-8">
            <p className="text-muted">The bag is empty.</p>
            <div className="mt-4 flex gap-3">
              <Link to="/music" className="btn-solid">Shop music</Link>
              <Link to="/merch" className="btn-line">Shop merch</Link>
            </div>
          </div>
        ) : (
          <ul className="panel divide-y divide-border">
            {shown.map((line) => (
              <li key={line.key} className="flex gap-3 p-4">
                <img src={line.image} alt="" className="h-20 w-20 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-fg">{line.title}</p>
                  <p className="text-xs tracking-wide text-dim uppercase">
                    {line.kind === "music" ? "Digital" : line.size}
                  </p>
                  <p className="mt-1 text-sm tabular-nums text-muted">{kes(line.price)}</p>
                </div>
                {line.kind === "merch" ? (
                  <div className="flex items-center gap-1">
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border" aria-label="Decrease quantity" onClick={() => setQty(line.key, line.qty - 1)}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center tabular-nums">{line.qty}</span>
                    <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border" aria-label="Increase quantity" onClick={() => setQty(line.key, line.qty + 1)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : null}
                <button type="button" className="inline-flex h-10 w-10 items-center justify-center text-muted hover:text-primary" aria-label={`Remove ${line.title}`} onClick={() => remove(line.key)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <aside className="panel h-fit p-4">
          <p className="text-sm text-muted">Total</p>
          <p className="font-display text-4xl">{kes(total)}</p>
          <Link to="/checkout" className={`btn-solid mt-4 w-full ${shown.length === 0 ? "pointer-events-none opacity-40" : ""}`} aria-disabled={shown.length === 0}>
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
