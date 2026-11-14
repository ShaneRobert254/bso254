import { site } from "@/lib/site";

export const searchTitle = "Bso254 (Bso) — Official Site | Kenyan Rapper";

export const searchDescription =
  "Official site of Bso, the Kenyan rapper Bso254. Unreleased and rare songs, merch, and links to YouTube, Spotify, Apple Music, Instagram, and TikTok.";

export const artistJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Bso",
  alternateName: ["Bso254", "BSO254", "BSO 254"],
  jobTitle: "Rapper",
  nationality: "Kenyan",
  description: searchDescription,
  sameAs: site.platforms.map((platform) => platform.href),
};

export function pageMeta(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
    ],
  };
}

export function hiddenMeta(title: string) {
  return {
    meta: [
      { title },
      { name: "robots", content: "noindex, follow" },
    ],
  };
}
