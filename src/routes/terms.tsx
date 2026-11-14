import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/cards";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <div>
      <PageHero kicker="LEGAL" title="Terms" text="The house rules for the BSO254 shop." />
      <article className="mx-auto grid max-w-3xl gap-4 px-4 py-8 text-muted">
        <p>Music and merch on this site are sold by BSO254. Digital files you download are for personal listening, not for re-upload or resale.</p>
        <p>Payment is M-Pesa to the business number on checkout, in Kenyan shillings. A paid song opens on that browser for life. It is a listen, not a download, and it is not for re-upload. Released songs stay on YouTube, Spotify, and Apple Music.</p>
        <p>Previews in the player are short studio sketches, not the finished masters, until those files are added to the catalog.</p>
      </article>
    </div>
  );
}
