/** Edit these before you take real orders or point fans at your profiles. */
export const site = {
  brand: "BSO254",
  artist: "Bso",
  tagline: "From the trenches. To the throne.",
  email: "hello@bso254.com",
  city: "Kenya",
  /** Leave blank until your YouTube video id is ready. A visualizer plays instead. */
  youtubeId: "",
  /** Fans pay this Pochi / business line from the M-Pesa menu. */
  mpesaBusiness: "0111209244",
  /** Released music. The site itself only sells the unreleased and rare. */
  platforms: [
    { name: "YouTube", handle: "Bso254", href: "https://www.youtube.com/@bso254", color: "#ff0033" },
    { name: "Spotify", handle: "Bso", href: "https://open.spotify.com/artist/0Hhlb0qyBGY1hK0WEWbiVt", color: "#1db954" },
    { name: "Apple Music", handle: "Bso", href: "https://music.apple.com/ke/artist/bso/1675426096", color: "#fc3c44" },
    { name: "Boomplay", handle: "Bso", href: "https://www.boomplay.com/search/Bso", color: "#ff7a00" },
    { name: "SoundCloud", handle: "Bso", href: "https://soundcloud.com/bso", color: "#ff5500" },
  ],
} as const;
