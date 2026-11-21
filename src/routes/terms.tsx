import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/cards";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  return (
    <div>
      <PageHero kicker="LEGAL" title="Terms" text="The house rules for the BSO254 shop." />
      <article className="mx-auto grid max-w-3xl gap-4 px-4 py-8 text-muted">
        <p>Music and merch on this site are sold by BSO254. Digital files you download are for personal listening, not for re-upload or resale.</p>
        <p>Songs can be played on this site for free for now. They are not a download. Merch is ordered by WhatsApp to 0111 209 244. The message lists what you want. Payment details are sent in that chat. Nothing is charged on the website yet.</p>
        <p>Previews in the player are short studio sketches, not the finished masters, until those files are added to the catalog.</p>
      </article>
    </div>
  );
}
