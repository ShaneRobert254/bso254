import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type SavedPurchase = {
  id: string;
  title: string;
  ref: string;
  track_id: string | null;
};

export const listPurchases = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    return sql<SavedPurchase>`
      select id, title, ref, track_id
      from purchases
      where user_id = ${context.userId}
      order by created_at desc
    `;
  });

export const savePurchases = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { receipt: string; items: { ref: string; trackId?: string; title: string }[] }) => {
    const receipt = String(input?.receipt ?? "").trim().slice(0, 16);
    const items = (Array.isArray(input?.items) ? input.items : []).slice(0, 40).map((item) => ({
      ref: String(item?.ref ?? "").slice(0, 80),
      trackId: item?.trackId ? String(item.trackId).slice(0, 80) : undefined,
      title: String(item?.title ?? "").slice(0, 120),
    }));
    if (!/^[A-Z0-9]{10}$/.test(receipt)) throw new Error("Need the M-Pesa code.");
    return { receipt, items };
  })
  .handler(async ({ context, data }) => {
    const { getSql } = await import("@/lib/db");
    const { readLiveCatalog } = await import("@/lib/catalog.server");
    const catalog = await readLiveCatalog();
    const sql = await getSql();
    let saved = 0;
    for (const item of data.items) {
      const release = catalog.releases.find((entry) => entry.slug === item.ref);
      if (!release) continue;
      const tracks = item.trackId ? release.tracks.filter((track) => track.id === item.trackId) : release.tracks;
      for (const track of tracks) {
        const id = `${context.userId}:${release.slug}:${track.id}`;
        await sql`
          insert into purchases (id, user_id, receipt, title, ref, track_id)
          values (${id}, ${context.userId}, ${data.receipt}, ${track.title}, ${release.slug}, ${track.id})
          on conflict (id) do nothing
        `;
        saved += 1;
      }
    }
    return { saved };
  });
