import { AppleMusicIcon, InstagramIcon, SpotifyIcon, TikTokIcon, YoutubeIcon } from "@/components/brand-icons";
import { site } from "@/lib/site";

const icons = {
  YouTube: YoutubeIcon,
  Spotify: SpotifyIcon,
  "Apple Music": AppleMusicIcon,
  Instagram: InstagramIcon,
  TikTok: TikTokIcon,
} as const;

export function Platforms({ compact = false }: { compact?: boolean }) {
  return (
    <section className={compact ? "" : "border-b border-border bg-surface"}>
      <div className={`mx-auto max-w-6xl px-4 ${compact ? "" : "py-8"}`}>
        {compact ? null : (
          <div className="mb-4 max-w-xl">
            <p className="font-display text-sm tracking-[0.28em] text-primary">FIND BSO</p>
            <h2 className="font-display text-4xl text-fg sm:text-5xl">The records and the pages</h2>
            <p className="mt-2 text-sm text-muted">
              Everyday songs live on YouTube, Spotify, and Apple Music. Instagram and TikTok are the daily pages. This site keeps the unreleased and the rare.
            </p>
          </div>
        )}
        <ul className="flex flex-wrap gap-x-4 gap-y-3">
          {site.platforms.map((platform) => {
            const Icon = icons[platform.name];
            return (
              <li key={platform.name}>
                <a
                  href={platform.href}
                  target="_blank"
                  rel="me noreferrer"
                  aria-label={`${platform.name}, ${platform.handle}`}
                  title={`${platform.name} · ${platform.handle}`}
                  className="group flex w-16 flex-col items-center gap-1.5"
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-full text-white ring-1 ring-white/10 transition group-hover:scale-105 group-hover:ring-primary"
                    style={{ background: platform.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-center text-[11px] leading-tight text-muted group-hover:text-fg">{platform.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
