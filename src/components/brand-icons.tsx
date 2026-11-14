import type { ReactNode } from "react";

function Icon({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function YoutubeIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path fill="currentColor" d="M9.2 8.6v7.2l6.4-3.6-6.4-3.6z" />
    </Icon>
  );
}

export function SpotifyIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path fill="currentColor" d="M17.6 16.2a.8.8 0 0 1-1.1.3c-2.7-1.6-6.1-2-10.1-1.1a.8.8 0 1 1-.4-1.5c4.4-1 8.2-.5 11.2 1.2a.8.8 0 0 1 .4 1.1zm1.4-3.1a1 1 0 0 1-1.3.3c-3.1-1.9-7.8-2.4-11.5-1.3a1 1 0 1 1-.6-1.9c4.2-1.3 9.4-.6 13 1.5a1 1 0 0 1 .4 1.4zm.1-3.2C15.6 7.6 9.6 7.4 6.4 8.4a1.1 1.1 0 1 1-.6-2.1c3.7-1.2 10-.9 13.9 1.5a1.1 1.1 0 0 1-1.1 1.9z" />
    </Icon>
  );
}

export function AppleMusicIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path
        fill="currentColor"
        d="M16.8 2.2c.2.1.4.3.4.6v11.4a3.3 3.3 0 1 1-1.6-2.8V7.2l-8.2 2.1v7.4a3.3 3.3 0 1 1-1.6-2.8V6.4c0-.3.2-.6.5-.7l10-2.6c.2 0 .4 0 .5.1z"
      />
    </Icon>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path
        fill="currentColor"
        d="M12 7.4A4.6 4.6 0 1 0 16.6 12 4.6 4.6 0 0 0 12 7.4zm0 7.6A3 3 0 1 1 15 12a3 3 0 0 1-3 3z"
      />
      <path
        fill="currentColor"
        d="M17.2 2.8H6.8A4 4 0 0 0 2.8 6.8v10.4a4 4 0 0 0 4 4h10.4a4 4 0 0 0 4-4V6.8a4 4 0 0 0-4-4zm2.4 14.4a2.4 2.4 0 0 1-2.4 2.4H6.8a2.4 2.4 0 0 1-2.4-2.4V6.8a2.4 2.4 0 0 1 2.4-2.4h10.4a2.4 2.4 0 0 1 2.4 2.4z"
      />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" />
    </Icon>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <Icon className={className}>
      <path fill="#25f4ee" d="M14.2 3.2c.4 2.2 1.7 3.8 3.8 4.1v2.2c-1.3 0-2.5-.4-3.6-1.1v6.1a5.3 5.3 0 1 1-5.3-5.3c.2 0 .5 0 .7.1v2.4a2.9 2.9 0 1 0 2 2.8V3.2h2.4z" />
      <path fill="#fe2c55" d="M15 3.2c.4 2.2 1.7 3.8 3.8 4.1v2.2c-1.3 0-2.5-.4-3.6-1.1v6.1a5.3 5.3 0 1 1-5.3-5.3c.2 0 .5 0 .7.1v2.4a2.9 2.9 0 1 0 2 2.8V3.2H15z" />
      <path fill="currentColor" d="M14.6 3c.4 2.2 1.7 3.8 3.8 4.1v2.2a6 6 0 0 1-3.6-1.1v6.1a5.3 5.3 0 1 1-5.3-5.3c.2 0 .5 0 .7.1v2.4a2.9 2.9 0 1 0 2 2.8V3h2.4z" />
    </Icon>
  );
}
