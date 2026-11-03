import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Line = {
  key: string;
  kind: "music" | "merch";
  ref: string;
  trackId?: string;
  title: string;
  price: number;
  image: string;
  qty: number;
  size?: string;
};

export type Order = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  pay: "mpesa" | "card";
  receipt?: string;
  lines: Line[];
  total: number;
  note: string;
};

export type Fan = {
  name: string;
  email: string;
  city: string;
  at: string;
};

type CartState = {
  lines: Line[];
  add: (line: Omit<Line, "qty" | "key"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

function lineKey(line: { kind: string; ref: string; trackId?: string; size?: string }) {
  if (line.kind === "music") return `music:${line.ref}:${line.trackId ?? "pack"}`;
  return `merch:${line.ref}:${line.size ?? "os"}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (incoming) => {
        const key = lineKey(incoming);
        const qty = incoming.qty ?? 1;
        const existing = get().lines.find((line) => line.key === key);
        if (existing) {
          const nextQty = incoming.kind === "music" ? 1 : existing.qty + qty;
          set({
            lines: get().lines.map((line) => (line.key === key ? { ...line, qty: nextQty } : line)),
          });
          return;
        }
        set({
          lines: [
            ...get().lines,
            {
              key,
              kind: incoming.kind,
              ref: incoming.ref,
              trackId: incoming.trackId,
              title: incoming.title,
              price: incoming.price,
              image: incoming.image,
              qty: incoming.kind === "music" ? 1 : qty,
              size: incoming.size,
            },
          ],
        });
      },
      setQty: (key, qty) => {
        if (qty <= 0) {
          set({ lines: get().lines.filter((line) => line.key !== key) });
          return;
        }
        set({
          lines: get().lines.map((line) =>
            line.key === key ? { ...line, qty: line.kind === "music" ? 1 : qty } : line,
          ),
        });
      },
      remove: (key) => set({ lines: get().lines.filter((line) => line.key !== key) }),
      clear: () => set({ lines: [] }),
    }),
    { name: "bso254-cart", skipHydration: true },
  ),
);

type OrderState = {
  orders: Order[];
  place: (order: Order) => void;
};

export const useOrders = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (order) => set({ orders: [order, ...get().orders] }),
    }),
    { name: "bso254-orders", skipHydration: true },
  ),
);

type FanState = {
  fans: Fan[];
  join: (fan: Fan) => void;
};

export const useFans = create<FanState>()(
  persist(
    (set, get) => ({
      fans: [],
      join: (fan) => {
        const exists = get().fans.some((item) => item.email.toLowerCase() === fan.email.toLowerCase());
        if (exists) return;
        set({ fans: [fan, ...get().fans] });
      },
    }),
    { name: "bso254-fans", skipHydration: true },
  ),
);

export function cartCount(lines: Line[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function cartTotal(lines: Line[]) {
  return lines.reduce((sum, line) => sum + line.price * line.qty, 0);
}

export function ownsRelease(orders: Order[], slug: string) {
  return orders.some((order) =>
    order.lines.some((line) => line.kind === "music" && line.ref === slug && !line.trackId),
  );
}

export function ownsTrack(orders: Order[], slug: string, trackId: string) {
  if (ownsRelease(orders, slug)) return true;
  return orders.some((order) =>
    order.lines.some((line) => line.kind === "music" && line.ref === slug && line.trackId === trackId),
  );
}
