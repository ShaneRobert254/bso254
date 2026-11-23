import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/cards";
import { hiddenMeta } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () => hiddenMeta("Checkout — Bso254"),
  component: CheckoutPage,
});

function CheckoutPage() {
  return (
    <div>
      <PageHero
        kicker="ORDER"
        title="Merch is coming soon"
        text="These pieces are not ready. Nothing can be ordered or paid for yet."
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-muted">Songs stay free to play. Merch will open when the pieces are actually in hand.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/music" className="btn-solid">Play music</Link>
          <Link to="/merch" className="btn-line">See the preview</Link>
        </div>
      </div>
    </div>
  );
}
