import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Logo compact />
          <p className="max-w-sm text-sm text-muted">Free streams live on the platforms. The vault on this site does not download.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {site.platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-3 text-sm text-fg hover:border-primary hover:text-primary"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: platform.color }} />
              {platform.name}
              <span className="text-dim">{platform.handle}</span>
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
          <Link to="/community" className="hover:text-fg">Community</Link>
          <Link to="/privacy" className="hover:text-fg">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-fg">Terms & Conditions</Link>
          <Link to="/support" className="hover:text-fg">Support</Link>
          <Link to="/library" className="hover:text-fg">Library</Link>
          <Link to="/admin" className="hover:text-fg">Studio</Link>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BSO OFFICIAL. All rights reserved.</p>
          <p className="font-display tracking-[0.18em] text-fg">
            FROM THE TRENCHES. <span className="text-primary">TO THE THRONE.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}