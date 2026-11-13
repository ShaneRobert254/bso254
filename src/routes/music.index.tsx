import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, ReleaseCard } from "@/components/cards";
import { cn } from "@/lib/cn";
import { useShop } from "@/lib/shop";

export const Route = createFileRoute("/music/")({ component: MusicPage });

const filters = ["All", "Albums", "Singles", "Unreleased"] as const;

function MusicPage() {
  const { releases } = useShop();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const shown = releases.filter((release) => {
    if (filter === "Albums") return release.type === "album";
    if (filter === "Singles") return release.type === "single" && !release.exclusive;
    if (filter === "Unreleased") return release.exclusive;
    return true;
  });

  return (
    <div>
      <PageHero
        kicker="THE VAULT"
        title="Unreleased & rare"
        text="These do not live on Spotify. Pay once and the song stays open in this browser for life. It never downloads."
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter music">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={filter === item}
              onClick={() => setFilter(item)}
              className={cn(
                "h-10 rounded-full border px-4 text-sm",
                filter === item ? "border-primary bg-primary text-fg" : "border-border text-muted hover:text-fg",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((release) => (
            <ReleaseCard key={release.slug} release={release} />
          ))}
        </div>
      </div>
    </div>
  );
}
