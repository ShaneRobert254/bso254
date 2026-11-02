import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/cards";
import { JoinForm } from "@/components/join-form";
import { useFans } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/community")({ component: CommunityPage });

function CommunityPage() {
  const ready = useHydrated();
  const fans = useFans((state) => state.fans);
  const shown = ready ? fans : [];

  return (
    <div>
      <PageHero
        kicker="COMMUNITY"
        title="Be part of the squad"
        text="Exclusive updates, fan features, and first listen on unreleased drops. Your name stays on this device until the list is connected to email."
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_1fr]">
        <section className="relative overflow-hidden panel min-h-80">
          <img src="/media/street.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
          <ul className="relative grid gap-3 p-6 text-fg">
            {["Exclusive updates before the drop", "Fan features and city roll calls", "Music previews and early access"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-lg">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="panel p-5">
          <h2 className="font-display text-4xl">Join the movement</h2>
          <p className="mb-4 text-sm text-muted">Name, email, city. That's the whole form.</p>
          <JoinForm />
        </section>
      </div>
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="font-display text-3xl">The wall</h2>
        {shown.length === 0 ? (
          <p className="mt-2 text-muted">Be the first name up.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((fan) => (
              <li key={fan.email} className="panel p-4">
                <p className="font-semibold">{fan.name}</p>
                <p className="text-sm text-dim">{fan.city}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
