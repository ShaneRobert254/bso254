import { createFileRoute } from "@tanstack/react-router";
import { PageHero, ProductCard } from "@/components/cards";
import { useShop } from "@/lib/shop";

export const Route = createFileRoute("/merch/")({ component: MerchPage });

function MerchPage() {
  const { products } = useShop();
  return (
    <div>
      <PageHero
        kicker="MERCH"
        title="Wear the movement"
        text="Tees, hoodies, the throne cap, prints, and vinyl. Priced in Kenyan shillings."
      />
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
