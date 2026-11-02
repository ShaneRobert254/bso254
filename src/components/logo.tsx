import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/cn";

export function Crown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 32 8 10l14 12L32 4l10 18 14-12 4 22H4zm2 4h52v4H6v-4z"
      />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("group inline-flex items-end gap-1 leading-none", className)} aria-label="BSO254 home">
      <span className="relative">
        <Crown
          className={cn(
            "absolute left-1/2 -translate-x-1/2 text-primary",
            compact ? "-top-2 h-3 w-5" : "-top-3.5 h-4 w-7",
          )}
        />
        <span className={cn("font-brush text-fg", compact ? "text-2xl" : "text-[2rem]")}>BSO</span>
      </span>
      <span className={cn("font-brush text-primary", compact ? "mb-0.5 text-lg" : "mb-0.5 text-2xl")}>254</span>
    </Link>
  );
}
