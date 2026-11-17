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
    const { getSql } = await import("./db");
    const sql = await getSql();
    const rows = await sql.query<{ body: ShopCatalog | string }>("select body from site_content where id = 'catalog'");
    const body = rows[0]?.body;
    if (body) {
      const parsed = typeof body === "string" ? (JSON.parse(body) as ShopCatalog) : body;
      const clean = sanitizeCatalog(parsed);
      if (clean.releases.length > 0) return clean;
    }
  } catch {
    // The database is not ready yet. Fall through to the file, then the built-in shop.
  }
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

export function publicCatalog(catalog: ShopCatalog): ShopCatalog {
  return {
    products: catalog.products,
    releases: catalog.releases.map((release) => ({
      ...release,
      tracks: release.tracks.map((track) => {
        const { audio: _audio, ...rest } = track;
        return { ...rest, hasAudio: Boolean(track.audio) };
      }),
    })),
  };
}

export async function grantFiles(trackIds: string[]) {
  const catalog = await readLiveCatalog();
  const wanted = new Set(trackIds);
  const files: string[] = [];
  for (const release of catalog.releases) {
    for (const track of release.tracks) {
      if (!wanted.has(track.id) || !track.audio) continue;
      const name = track.audio.split("/").pop() ?? "";
      if (/^[a-f0-9]{12}\.(mp3|wav)$/.test(name)) files.push(name);
    }
  }
  return files;
}

export async function readAudioFile(name: string) {
  if (!/^[a-f0-9]{12}\.(mp3|wav)$/.test(name)) return null;
  try {
    const { getSql } = await import("./db");
    const sql = await getSql();
    const rows = await sql.query<{ mime: string; bytes: Uint8Array | Buffer | string }>(
      "select mime, bytes from audio_files where name = $1",
      [name],
    );
    const row = rows[0];
    if (row?.bytes) {
      const bytes = typeof row.bytes === "string" ? Buffer.from(row.bytes, "base64") : Buffer.from(row.bytes);
      return { bytes, type: row.mime || (name.endsWith(".mp3") ? "audio/mpeg" : "audio/wav") };
    }
  } catch {
    // Fall through to a file saved before the database store existed.
  }
  const candidates = [
    path.join(process.cwd(), "data", "audio", name),
    path.join(process.cwd(), "public", "media", "audio", name),
  ];
  for (const file of candidates) {
    try {
      const bytes = await readFile(file);
      return { bytes, type: name.endsWith(".mp3") ? "audio/mpeg" : "audio/wav" };
    } catch {
      // Try the next folder.
    }
  }
  return null;
}

export async function saveAudio(name: string, data: string) {
  const lower = name.toLowerCase();
  const ext = lower.endsWith(".wav") ? "wav" : lower.endsWith(".mp3") ? "mp3" : "";
  if (!ext) throw new Error("Use an MP3 or WAV file.");
  const bytes = Buffer.from(data, "base64");
  if (bytes.length < 1000) throw new Error("That file looks empty.");
  if (bytes.length > 12 * 1024 * 1024) throw new Error("Keep the song under 12 MB.");
  const filename = `${randomBytes(6).toString("hex")}.${ext}`;
  const mime = ext === "mp3" ? "audio/mpeg" : "audio/wav";
  const { getSql } = await import("./db");
  const sql = await getSql();
  await sql.query("insert into audio_files (name, mime, bytes) values ($1, $2, $3)", [filename, mime, bytes]);
  return { audio: `/media/audio/${filename}` };
}

export async function writeLiveCatalog(input: ShopCatalog) {
  const clean = sanitizeCatalog(input);
  if (clean.releases.length === 0) throw new Error("Keep at least one release.");
  const { getSql } = await import("./db");
  const sql = await getSql();
  await sql.query(
    "insert into site_content (id, body) values ('catalog', $1::jsonb) on conflict (id) do update set body = excluded.body",
    [JSON.stringify(clean)],
  );
  try {
    await mkdir(dataDir, { recursive: true });
    await writeFile(catalogPath, JSON.stringify(clean, null, 2), "utf8");
  } catch {
    // A live host may not allow writing files. The database copy is the one that lasts.
  }
  return clean;
}

const setupSalt = "bso254-setup-v1";
const setupHash = "9e3b80b508570a093df379d8aa48f86962ba950e442da767785d661e4ecd4466";

async function db() {
  const { getSql } = await import("./db");
  return getSql();
}

async function readDbAdmin(): Promise<AdminFile | null> {
  try {
    const sql = await db();
    const rows = await sql.query<{ salt: string; hash: string; session_key: string }>(
      "select salt, hash, session_key from studio_admin where id = 'owner'",
    );
    const row = rows[0];
    if (!row?.salt || !row.hash || !row.session_key) return null;
    return { salt: row.salt, hash: row.hash, sessionKey: row.session_key };
  } catch {
    return null;
  }
}

async function readAdmin(): Promise<AdminFile | null> {
  const stored = await readDbAdmin();
  if (stored) return stored;
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  if (fromEnv && fromEnv.length >= 12) {
    const salt = "bso254-studio";
    return { salt, hash: scryptSync(fromEnv, salt, 32).toString("hex"), sessionKey: scryptSync(`session:${fromEnv}`, salt, 32).toString("hex") };
  }
  try {
    const raw = await readFile(adminPath, "utf8");
    const parsed = JSON.parse(raw) as AdminFile;
    if (parsed.salt && parsed.hash && parsed.sessionKey.length >= 32) return parsed;
  } catch {
    // No local lock file.
  }
  return null;
}

export async function needsSetup() {
  if (await readDbAdmin()) return false;
  if ((process.env.ADMIN_PASSWORD?.trim().length ?? 0) >= 12) return false;
  return true;
}

async function tooManyAttempts() {
  const sql = await db();
  const rows = await sql.query<{ n: number }>(
    "select count(*)::int as n from studio_attempts where at > now() - interval '15 minutes'",
  );
  return Number(rows[0]?.n ?? 0) >= 8;
}

async function noteAttempt() {
  const sql = await db();
  await sql.query("insert into studio_attempts (at) values (now())");
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
  if (await tooManyAttempts()) throw new Error("Too many tries. Wait 15 minutes.");
  const file = await readAdmin();
  if (!file || !matches(password, file)) {
    await noteAttempt();
    return false;
  }
  const active = await session();
  if (!active) return false;
  await active.update({ ok: true });
  return true;
}

export async function setupStudio(setupKey: string, password: string) {
  if (!(await needsSetup())) throw new Error("Studio is already set up.");
  if (await tooManyAttempts()) throw new Error("Too many tries. Wait 15 minutes.");
  const got = scryptSync(setupKey, setupSalt, 32);
  const expected = Buffer.from(setupHash, "hex");
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) {
    await noteAttempt();
    throw new Error("That setup key is wrong.");
  }
  if (password.length < 12 || password.length > 80) throw new Error("Use 12 to 80 characters.");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  const sessionKey = scryptSync(`session:${password}:${salt}`, salt, 32).toString("hex");
  const sql = await db();
  await sql.query(
    "insert into studio_admin (id, salt, hash, session_key) values ('owner', $1, $2, $3)",
    [salt, hash, sessionKey],
  );
  return true;
}

export async function listPendingPurchases() {
  const sql = await db();
  return sql.query<{ id: string; receipt: string; title: string; user_id: string }>(
    "select id, receipt, title, user_id from purchases where status = 'pending' order by created_at desc limit 40",
  );
}

export async function confirmPurchase(id: string) {
  const sql = await db();
  await sql.query("update purchases set status = 'confirmed' where id = $1 and status = 'pending'", [id]);
}

export async function userOwnsConfirmed(userId: string, trackId: string) {
  const sql = await db();
  const rows = await sql.query<{ id: string }>(
    "select id from purchases where user_id = $1 and track_id = $2 and status = 'confirmed' limit 1",
    [userId, trackId],
  );
  return Boolean(rows[0]);
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
  if (raw.startsWith("/media/") || raw.startsWith("/api/media/") || raw.startsWith("https://")) return raw;
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
