import { randomBytes } from "node:crypto";
import { gallery as seedGallery, type Shot } from "@/lib/catalog";

function cleanShot(input: Partial<Shot> | undefined, index: number): Shot {
  const src = String(input?.src ?? "").trim().slice(0, 240);
  const safeSrc = src.startsWith("/media/") || src.startsWith("/api/media/") ? src : seedGallery[0].src;
  return {
    src: safeSrc,
    alt: String(input?.alt ?? "Bso").replace(/\s+/g, " ").trim().slice(0, 120) || `Photo ${index + 1}`,
    caption: String(input?.caption ?? "").replace(/\s+/g, " ").trim().slice(0, 80) || "Bso",
  };
}

async function sqlClient() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

export async function readGallery(): Promise<Shot[]> {
  try {
    const sql = await sqlClient();
    const rows = await sql.query<{ body: Shot[] | string }>("select body from site_content where id = 'gallery'");
    const body = rows[0]?.body;
    const parsed = typeof body === "string" ? (JSON.parse(body) as Shot[]) : body;
    if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 40).map(cleanShot);
  } catch {
    // Use the built-in photos until Studio publishes a gallery.
  }
  return seedGallery;
}

export async function writeGallery(shots: Shot[]) {
  const clean = shots.slice(0, 40).map(cleanShot);
  if (clean.length === 0) throw new Error("Keep at least one photo.");
  const sql = await sqlClient();
  await sql.query(
    "insert into site_content (id, body) values ('gallery', $1::jsonb) on conflict (id) do update set body = excluded.body",
    [JSON.stringify(clean)],
  );
  return clean;
}

export async function saveImage(name: string, data: string) {
  const bytes = Buffer.from(data, "base64");
  if (bytes.length < 100 || bytes.length > 4 * 1024 * 1024) throw new Error("Use a photo under 4 MB.");
  let ext = "";
  let mime = "";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    ext = "jpg";
    mime = "image/jpeg";
  } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    ext = "png";
    mime = "image/png";
  } else if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    ext = "webp";
    mime = "image/webp";
  }
  if (!ext) throw new Error("Use a JPG, PNG, or WEBP photo.");
  const filename = `${randomBytes(8).toString("hex")}.${ext}`;
  const sql = await sqlClient();
  await sql.query("insert into media_files (name, mime, bytes) values ($1, $2, $3)", [filename, mime, bytes]);
  return { image: `/api/media/${filename}` };
}

export async function readMediaFile(name: string) {
  if (!/^[a-f0-9]{16}\.(jpg|png|webp)$/.test(name)) return null;
  const sql = await sqlClient();
  const rows = await sql.query<{ mime: string; bytes: Uint8Array | Buffer | string }>(
    "select mime, bytes from media_files where name = $1",
    [name],
  );
  const row = rows[0];
  if (!row?.bytes) return null;
  const bytes = typeof row.bytes === "string" ? Buffer.from(row.bytes, "base64") : Buffer.from(row.bytes);
  return { bytes, type: row.mime };
}

export async function storeMessage(data: { name: string; email: string; topic: string; message: string }) {
  const sql = await sqlClient();
  const id = randomBytes(8).toString("hex");
  await sql.query(
    "insert into messages (id, name, email, topic, body) values ($1, $2, $3, $4, $5)",
    [id, data.name, data.email, data.topic, data.message],
  );
}

export async function storeFan(data: { name: string; email: string; city: string }) {
  const sql = await sqlClient();
  await sql.query(
    `insert into fans (email, name, city) values ($1, $2, $3)
     on conflict (email) do update set name = excluded.name, city = excluded.city`,
    [data.email, data.name, data.city],
  );
}

export async function listInbox() {
  const sql = await sqlClient();
  const messages = await sql.query<{ id: string; name: string; email: string; topic: string; body: string; status: string }>(
    "select id, name, email, topic, body, status from messages order by created_at desc limit 40",
  );
  const fans = await sql.query<{ email: string; name: string; city: string }>(
    "select email, name, city from fans order by created_at desc limit 80",
  );
  return { messages, fans };
}

export async function markMessage(id: string) {
  const sql = await sqlClient();
  await sql.query("update messages set status = 'read' where id = $1", [id]);
}

