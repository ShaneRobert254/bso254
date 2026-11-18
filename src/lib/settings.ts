import { createServerFn } from "@tanstack/react-start";
import { site } from "@/lib/site";

const linkNames = ["YouTube", "Spotify", "Apple Music", "Instagram", "TikTok"] as const;

export type SiteCopy = {
  email: string;
  about: [string, string, string, string];
  links: Record<(typeof linkNames)[number], string>;
};

function defaultLinks() {
  return Object.fromEntries(site.platforms.map((platform) => [platform.name, platform.href])) as SiteCopy["links"];
}

export const defaultCopy: SiteCopy = {
  email: site.email,
  about: [
    "Bso254 is the Kenyan rapper who records as Bso. From the streets of Kenya to the booth, the name carries the country code.",
    "BSO254 carries the country code in the name. The work is the climb that tagline keeps repeating: from the trenches, to the throne. Not a costume. A record of what it took to get the mic, then what it takes to keep it.",
    "The shop is the front door. Albums and singles live next to the clothes, because the people who play the songs are the same people who wear the crown. Flip A Page is the latest chapter. Run It Up is still behind the lock, for the fans who show up early.",
    "Bso writes for the night bus, the booth light, and the city that stays up after the clubs close. If you are booking a show, a feature, or a press sit-down, the contact page is open.",
  ],
  links: defaultLinks(),
};

function httpsLink(value: unknown, fallback: string) {
  const raw = String(value ?? "").trim().slice(0, 240);
  if (/^https:\/\/[^\s]+$/.test(raw)) return raw;
  return fallback;
}

function cleanCopy(input: Partial<SiteCopy> | undefined): SiteCopy {
  const about = Array.isArray(input?.about) ? input.about : [];
  const lines = [0, 1, 2, 3].map((index) => {
    const line = String(about[index] ?? "").replace(/\s+/g, " ").trim().slice(0, 500);
    return line || defaultCopy.about[index];
  }) as SiteCopy["about"];
  const email = String(input?.email ?? "").trim().slice(0, 120);
  const links = Object.fromEntries(
    linkNames.map((name) => [name, httpsLink(input?.links?.[name], defaultCopy.links[name])]),
  ) as SiteCopy["links"];
  return { email: email.includes("@") ? email : defaultCopy.email, about: lines, links };
}

async function readCopy(): Promise<SiteCopy> {
  try {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql.query<{ body: SiteCopy | string }>("select body from site_content where id = 'copy'");
    const body = rows[0]?.body;
    if (!body) return defaultCopy;
    const parsed = typeof body === "string" ? (JSON.parse(body) as SiteCopy) : body;
    return cleanCopy(parsed);
  } catch {
    return defaultCopy;
  }
}

export const getCopy = createServerFn({ method: "GET" }).handler(async () => readCopy());

export const adminSaveCopy = createServerFn({ method: "POST" })
  .validator((input: SiteCopy) => cleanCopy(input))
  .handler(async ({ data }) => {
    const { signedIn } = await import("@/lib/catalog.server");
    if (!(await signedIn())) throw new Error("Sign in first.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql.query(
      "insert into site_content (id, body) values ('copy', $1::jsonb) on conflict (id) do update set body = excluded.body",
      [JSON.stringify(data)],
    );
    return data;
  });

