import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { SpotifyIcon, TikTokIcon } from "@/components/brand-icons";
import { Logo } from "@/components/logo";
import { site } from "@/lib/site";

const socials = [
  { href: site.socials.youtube, label: "YouTube", icon: Youtube },
  { href: site.socials.instagram, label: "Instagram", icon: Instagram },
  { href: site.socials.tiktok, label: "TikTok", icon: TikTokIcon },
  { href: site.socials.spotify, label: "Spotify", icon: SpotifyIcon },
  { href: site.socials.x, label: "X", icon: Twitter },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <Logo compact />
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <span>Follow {site.artist}:</span>
          {socials.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-fg hover:text-primary">
              <item.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
          <Link to="/community" className="hover:text-fg">Community</Link>
          <Link to="/privacy" className="hover:text-fg">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-fg">Terms & Conditions</Link>
          <Link to="/support" className="hover:text-fg">Support</Link>
          <Link to="/library" className="hover:text-fg">Library</Link>
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
