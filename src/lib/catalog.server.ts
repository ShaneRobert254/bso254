import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { useSession } from "@tanstack/react-start/server";
import { products as seedProducts, releases as seedReleases, type Product, type Release } from "@/lib/catalog";

export type ShopCatalog = { releases: Release[]; products: Product[] };

type AdminFile = { salt: string; hash: string; sessionKey: string };

const dataDir = path.join(process.cwd(), "data");
const catalogPath = path.join(dataDir, "catalog.json");
const adminPath = path.join(dataDir, "admin.json");

function fallback(): ShopCatalog {
  return { releases: seedReleases, products: seedProducts };
}

export async function readLiveCatalog(): Promise<ShopCatalog> {
  try {
    const raw = await readFile(catalogPath, "utf8");
    const parsed = JSON.parse(raw) as ShopCatalog;
    const clean = sanitizeCatalog(parsed);
    if (clean.releases.length > 0) return clean;
  } catch {
    // The built-in catalog is the shop until the studio saves one.
  }
  return fallback();
}

export async function saveAudio(name: string, data: string) {
  const lower = name.toLowerCase();
  const ext = lower.endsWith(".wav") ? "wav" : lower.endsWith(".mp3") ? "mp3" : "";
  if (!ext) throw new Error("Use an MP3 or WAV file.");
  const bytes = Buffer.from(data, "base64");
  if (bytes.length < 1000) throw new Error("That file looks empty.");
  if (bytes.length > 12 * 1024 * 1024) throw new Error("Keep the song under 12 MB.");
  const filename = `${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "media", "audio");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return { audio: `/media/audio/${filename}` };
}

export async function writeLiveCatalog(input: ShopCatalog) {
  const clean = sanitizeCatalog(input);
  if (clean.releases.length === 0) throw new Error("Keep at least one release.");
  await mkdir(dataDir, { recursive: true });
  await writeFile(catalogPath, JSON.stringify(clean, null, 2), "utf8");
  return clean;
}

async function readAdmin(): Promise<AdminFile | null> {
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv && fromEnv.length >= 8) {
    const salt = "bso254-studio";
    return { salt, hash: scryptSync(fromEnv, salt, 32).toString("hex"), sessionKey: scryptSync(`session:${fromEnv}`, salt, 32).toString("hex") };
  }
  try {
    const raw = await readFile(adminPath, "utf8");
    const parsed = JSON.parse(raw) as AdminFile;
    if (parsed.salt && parsed.hash && parsed.sessionKey.length >= 32) return parsed;
  } catch {
    return null;
  }
  return null;
}

function matches(password: string, file: AdminFile) {
  const got = scryptSync(password, file.salt, 32);
  const expected = Buffer.from(file.hash, "hex");
  return expected.length === got.length && timingSafeEqual(expected, got);
}

async function session() {
  const file = await readAdmin();
  if (!file) return null;
  return useSession<{ ok: boolean }>({
    password: file.sessionKey,
    name: "bso_admin",
    maxAge: 60 * 60 * 24 * 30,
    cookie: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
  });
}

export async function signedIn() {
  const active = await session();
  if (!active) return false;
  return active.data.ok === true;
}

export async function login(password: string) {
  const file = await readAdmin();
  if (!file || !matches(password, file)) return false;
  const active = await session();
  if (!active) return false;
  await active.update({ ok: true });
  return true;
}

export async function logout() {
  const active = await session();
  if (active) await active.clear();
}

export function sanitizeCatalog(input: ShopCatalog): ShopCatalog {
  const releases = (Array.isArray(input?.releases) ? input.releases : []).slice(0, 40).map((release, index) => {
    const title = text(release?.title, 80) || `Release ${index + 1}`;
    const slug = uniqueSlug(text(release?.slug, 60) || title, index);
    const tracks = (Array.isArray(release?.tracks) ? release.tracks : []).slice(0, 30).map((track, trackIndex) => {
      const audio = audioPath(track?.audio);
      return {
        id: uniqueSlug(text(track?.id, 60) || text(track?.title, 80) || `track-${trackIndex + 1}`, trackIndex),
        title: text(track?.title, 80) || `Track ${trackIndex + 1}`,
        duration: clamp(track?.duration, 30, 3600, 180),
        price: clamp(track?.price, 0, 100000, 150),
        ...(audio ? { audio } : {}),
      };
    });
    return {
      slug,
      title,
      type: release?.type === "single" ? "single" : "album",
      year: clamp(release?.year, 1990, 2100, new Date().getFullYear()),
      cover: asset(release?.cover, "/media/cover-flip.jpg"),
      price: clamp(release?.price, 0, 100000, 500),
      exclusive: Boolean(release?.exclusive),
      blurb: text(release?.blurb, 400),
      tracks: tracks.length > 0 ? tracks : [{ id: `${slug}-track`, title, duration: 180, price: clamp(release?.price, 0, 100000, 200) }],
    } satisfies Release;
  });
  const products = (Array.isArray(input?.products) ? input.products : []).slice(0, 40).map((product, index) => {
    const name = text(product?.name, 80) || `Piece ${index + 1}`;
    const sizes = (Array.isArray(product?.sizes) ? product.sizes : [])
      .map((size) => text(size, 24))
      .filter(Boolean)
      .slice(0, 8);
    return {
      slug: uniqueSlug(text(product?.slug, 60) || name, index),
      name,
      price: clamp(product?.price, 0, 100000, 1500),
      image: asset(product?.image, "/media/tee.jpg"),
      category: text(product?.category, 40) || "Tee",
      sizes: sizes.length > 0 ? sizes : ["One size"],
      blurb: text(product?.blurb, 400),
      details: (Array.isArray(product?.details) ? product.details : []).map((line) => text(line, 80)).filter(Boolean).slice(0, 6),
    } satisfies Product;
  });
  const seen = new Set<string>();
  for (const release of releases) {
    release.slug = dedupe(release.slug, seen);
    const trackIds = new Set<string>();
    for (const track of release.tracks) track.id = dedupe(track.id, trackIds);
  }
  const productIds = new Set<string>();
  for (const product of products) product.slug = dedupe(product.slug, productIds);
  return { releases, products };
}

function audioPath(value: unknown) {
  const raw = text(value, 180);
  if (raw.startsWith("/media/audio/") && (raw.endsWith(".mp3") || raw.endsWith(".wav"))) return raw;
  return "";
}

function text(value: unknown, max: number) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = Math.round(Number(value));
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function asset(value: unknown, fallback: string) {
  const raw = text(value, 240);
  if (raw.startsWith("/media/") || raw.startsWith("https://")) return raw;
  return fallback;
}

function uniqueSlug(value: string, index: number) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || `item-${index + 1}`;
}

function dedupe(slug: string, seen: Set<string>) {
  let next = slug;
  let n = 2;
  while (seen.has(next)) {
    next = `${slug}-${n}`;
    n += 1;
  }
  seen.add(next);
  return next;
}
