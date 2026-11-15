import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/cards";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <div>
      <PageHero kicker="LEGAL" title="Terms" text="The house rules for the BSO254 shop." />
      <article className="mx-auto grid max-w-3xl gap-4 px-4 py-8 text-muted">
        <p>Music and merch on this site are sold by BSO254. Digital files you download are for personal listening, not for re-upload or resale.</p>
        <p>Payment is M-Pesa to the business number on checkout, in Kenyan shillings. A song stays locked until that receipt is confirmed, then it streams on the account that paid. It is not a download. Merchandise is on display only and is not for sale yet. International card checkout is not switched on.</p>
        <p>Previews in the player are short studio sketches, not the finished masters, until those files are added to the catalog.</p>
      </article>
    </div>
  );
}
