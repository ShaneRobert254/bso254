import { site } from "@/lib/site";

export function Platforms({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "" : "border-b border-border bg-surface"}>
      <div className={`mx-auto max-w-6xl px-4 ${compact ? "" : "py-8"}`}>
        {compact ? null : (
          <div className="mb-4 max-w-xl">
            <p className="font-display text-sm tracking-[0.28em] text-primary">STREAM FREE</p>
            <h2 className="font-display text-4xl text-fg sm:text-5xl">The records are out there</h2>
            <p className="mt-2 text-sm text-muted">
              Everyday songs live on the platforms. This site keeps the unreleased and the rare. Pay once, then listen here for life. Nothing downloads.
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {site.platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-bg px-3 py-3 hover:border-transparent"
              style={{ boxShadow: "inset 0 0 0 0 transparent" }}
            >
              <span className="h-9 w-1.5 shrink-0 rounded-full" style={{ background: platform.color }} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-fg group-hover:text-primary">{platform.name}</span>
                <span className="block truncate text-xs text-dim">{platform.handle}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
