import { getProduct, getRelease } from "@/lib/catalog";

export type PayItem = {
  kind: "music" | "merch";
  ref: string;
  trackId?: string;
  qty: number;
  size?: string;
};

export type PricedLine = PayItem & {
  title: string;
  price: number;
  image: string;
};

export function quoteCart(items: PayItem[]): { ok: true; lines: PricedLine[]; total: number } | { ok: false; error: string } {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: "Your bag is empty." };
  if (items.length > 20) return { ok: false, error: "That bag is too large." };
  const lines: PricedLine[] = [];
  for (const item of items) {
    const qty = item.kind === "music" ? 1 : Math.floor(item.qty);
    if (!Number.isFinite(qty) || qty < 1 || qty > 10) return { ok: false, error: "Check the quantities in your bag." };
    if (item.kind === "music") {
      const release = getRelease(item.ref);
      if (!release) return { ok: false, error: "A release in your bag is no longer for sale." };
      if (item.trackId) {
        const track = release.tracks.find((entry) => entry.id === item.trackId);
        if (!track) return { ok: false, error: "A track in your bag is no longer for sale." };
        lines.push({
          kind: "music",
          ref: release.slug,
          trackId: track.id,
          qty: 1,
          title: track.title,
          price: track.price,
          image: release.cover,
        });
      } else {
        lines.push({
          kind: "music",
          ref: release.slug,
          qty: 1,
          title: release.title,
          price: release.price,
          image: release.cover,
        });
      }
      continue;
    }
    const product = getProduct(item.ref);
    if (!product) return { ok: false, error: "A piece in your bag is no longer for sale." };
    const size = item.size && product.sizes.includes(item.size) ? item.size : product.sizes[0];
    lines.push({
      kind: "merch",
      ref: product.slug,
      qty,
      size,
      title: product.name,
      price: product.price,
      image: product.image,
    });
  }
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  if (total < 1) return { ok: false, error: "That total cannot be charged." };
  return { ok: true, lines, total };
}

export function mpesaPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (/^2547\d{8}$/.test(digits) || /^2541\d{8}$/.test(digits)) return digits;
  if (/^07\d{8}$/.test(digits) || /^01\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^7\d{8}$/.test(digits) || /^1\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}
