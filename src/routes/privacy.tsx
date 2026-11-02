import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/cards";

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });

function PrivacyPage() {
  return (
    <div>
      <PageHero kicker="LEGAL" title="Privacy" text="What this shop keeps, and where it keeps it." />
      <article className="mx-auto grid max-w-3xl gap-4 px-4 py-8 text-muted">
        <p>Orders, your library, and the fan list are stored in this browser. They are not sent to a server by this demo shop.</p>
        <p>If you later connect email or payments, update this page with who receives the data, why, and how someone asks for it to be deleted.</p>
        <p>Do not type card numbers into the checkout. The card option only records that you chose it.</p>
      </article>
    </div>
  );
}
