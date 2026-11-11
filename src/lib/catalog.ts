export type Track = {
  id: string;
  title: string;
  /** Full song length, shown in the tracklist. Previews are shorter. */
  duration: number;
  price: number;
  /** Public path kept for the studio. Shoppers only see hasAudio. */
  audio?: string;
  hasAudio?: boolean;
};

export type Release = {
  slug: string;
  title: string;
  type: "album" | "single";
  year: number;
  cover: string;
  price: number;
  exclusive?: boolean;
  blurb: string;
  tracks: Track[];
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes: string[];
  blurb: string;
  details: string[];
};

export type Shot = {
  src: string;
  alt: string;
  caption: string;
};

export const releases: Release[] = [
  {
    slug: "flip-a-page",
    title: "Flip A Page",
    type: "album",
    year: 2026,
    cover: "/media/cover-flip.jpg",
    price: 800,
    blurb: "The latest album. Night roads, tall towers, and the turn from survival to a throne.",
    tracks: [
      { id: "flip-a-page", title: "Flip A Page", duration: 192, price: 200 },
      { id: "trenches", title: "Trenches", duration: 178, price: 150 },
      { id: "to-the-throne", title: "To the Throne", duration: 221, price: 150 },
      { id: "night-drive", title: "Night Drive", duration: 185, price: 150 },
      { id: "two-five-four", title: "254", duration: 164, price: 150 },
      { id: "no-sleep", title: "No Sleep", duration: 202, price: 150 },
      { id: "from-the-block", title: "From the Block", duration: 171, price: 150 },
      { id: "crown", title: "Crown", duration: 242, price: 150 },
    ],
  },
  {
    slug: "from-the-trenches",
    title: "From the Trenches",
    type: "album",
    year: 2024,
    cover: "/media/cover-trenches.jpg",
    price: 700,
    blurb: "The record that named the climb. Cold mornings, long buses, and bars that refused to fold.",
    tracks: [
      { id: "block-on-fire", title: "Block on Fire", duration: 188, price: 150 },
      { id: "cold-mornings", title: "Cold Mornings", duration: 176, price: 150 },
      { id: "red-dust", title: "Red Dust", duration: 203, price: 150 },
      { id: "still-here", title: "Still Here", duration: 194, price: 150 },
      { id: "night-bus", title: "Night Bus", duration: 211, price: 150 },
      { id: "oath", title: "Oath", duration: 168, price: 150 },
    ],
  },
  {
    slug: "street-scriptures",
    title: "Street Scriptures",
    type: "album",
    year: 2023,
    cover: "/media/cover-scriptures.jpg",
    price: 600,
    blurb: "Early pages. Studio nights, market lights, and the first vows Bso put on record.",
    tracks: [
      { id: "open-verse", title: "Open Verse", duration: 156, price: 120 },
      { id: "market-lights", title: "Market Lights", duration: 184, price: 120 },
      { id: "pressure", title: "Pressure", duration: 199, price: 120 },
      { id: "letters", title: "Letters", duration: 173, price: 120 },
      { id: "home", title: "Home", duration: 208, price: 120 },
      { id: "scriptures", title: "Scriptures", duration: 226, price: 120 },
    ],
  },
  {
    slug: "run-it-up",
    title: "Run It Up",
    type: "single",
    year: 2026,
    cover: "/media/cover-run.jpg",
    price: 300,
    exclusive: true,
    blurb: "Unreleased. Early access for the movement — hear it here before it hits the platforms.",
    tracks: [{ id: "run-it-up", title: "Run It Up", duration: 207, price: 300 }],
  },
  {
    slug: "city-lights",
    title: "City Lights",
    type: "single",
    year: 2025,
    cover: "/media/cover-city.jpg",
    price: 150,
    blurb: "A night-drive single. Towers in the glass, one more take before sunrise.",
    tracks: [{ id: "city-lights", title: "City Lights", duration: 188, price: 150 }],
  },
  {
    slug: "mama-said",
    title: "Mama Said",
    type: "single",
    year: 2025,
    cover: "/media/cover-mama.jpg",
    price: 150,
    blurb: "A letter home. Soft where it needs to be, still standing where it counts.",
    tracks: [{ id: "mama-said", title: "Mama Said", duration: 214, price: 150 }],
  },
  {
    slug: "254-anthem",
    title: "254 Anthem",
    type: "single",
    year: 2024,
    cover: "/media/cover-anthem.jpg",
    price: 150,
    blurb: "Country code on the chest. A chant for anyone who built something from the ground.",
    tracks: [{ id: "254-anthem", title: "254 Anthem", duration: 196, price: 150 }],
  },
];

export const products: Product[] = [
  {
    slug: "classic-tee",
    name: "Classic Tee",
    price: 2500,
    image: "/media/tee.jpg",
    category: "Tee",
    sizes: ["S", "M", "L", "XL", "XXL"],
    blurb: "Heavyweight black tee. Crown on the chest, BSO in white.",
    details: ["100% cotton, heavyweight", "Printed in Kenya", "Ships nationwide"],
  },
  {
    slug: "crown-hoodie",
    name: "Crown Hoodie",
    price: 4500,
    image: "/media/hoodie.jpg",
    category: "Hoodie",
    sizes: ["S", "M", "L", "XL", "XXL"],
    blurb: "The movement hoodie. Black fleece, red crown, brush logo.",
    details: ["Fleece, kangaroo pocket", "Unisex fit", "Ships nationwide"],
  },
  {
    slug: "throne-cap",
    name: "Throne Cap",
    price: 1800,
    image: "/media/cap.jpg",
    category: "Cap",
    sizes: ["One size"],
    blurb: "Structured black cap with the crown and BSO on the front.",
    details: ["Structured crown", "Adjustable back", "One size"],
  },
  {
    slug: "trenches-print",
    name: "Trenches Art Print",
    price: 1200,
    image: "/media/poster.jpg",
    category: "Print",
    sizes: ["A2"],
    blurb: "Night skyline poster. From the trenches, on the wall.",
    details: ["A2 art print", "Matte stock", "Ships flat"],
  },
  {
    slug: "flip-vinyl",
    name: "Flip A Page Vinyl",
    price: 4500,
    image: "/media/vinyl.jpg",
    category: "Vinyl",
    sizes: ["12 inch"],
    blurb: "The album on wax. Black disc, red label, for the people who still flip a side.",
    details: ["12-inch black vinyl", "Includes digital album", "Limited run"],
  },
];

export const gallery: Shot[] = [
  { src: "/media/studio.jpg", alt: "Bso in the booth with headphones and a microphone", caption: "In the booth" },
  { src: "/media/sidewalk.jpg", alt: "Bso on a night sidewalk in a cap and sunglasses", caption: "After hours" },
  { src: "/media/portrait.jpg", alt: "Bso in a black hoodie, chain, and sunglasses against the city", caption: "The look" },
  { src: "/media/street.jpg", alt: "A lone figure walking a rain-soaked city avenue", caption: "Flip A Page" },
  { src: "/media/about.jpg", alt: "Bso from behind, overlooking a cloudy skyline", caption: "Above the city" },
  { src: "/media/skyline.jpg", alt: "Night skyline with a cylindrical tower and red haze", caption: "254 nights" },
  { src: "/media/hero.jpg", alt: "Bso in red smoke with the tower behind him", caption: "To the throne" },
  { src: "/media/cover-run.jpg", alt: "Hooded figure facing a dark skyline", caption: "Run It Up" },
];

export function getRelease(slug: string) {
  return releases.find((release) => release.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function findTrack(trackId: string) {
  for (const release of releases) {
    const track = release.tracks.find((item) => item.id === trackId);
    if (track) return { release, track };
  }
  return undefined;
}

export const latest = releases[0];
