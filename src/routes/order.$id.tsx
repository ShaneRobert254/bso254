import { createFileRoute, Link } from "@tanstack/react-router";
import { kes, spacedLine } from "@/lib/format";
import { site } from "@/lib/site";
import { useOrders, type Order } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

function receiptText(order: Order) {
  const items = order.lines
    .map((line) => `${line.title}${line.size ? ` (${line.size})` : ""}${line.qty > 1 ? ` x${line.qty}` : ""}`)
    .join(", ");
  const ship = order.address ? `\nShip to ${order.address}, ${order.city}` : "";
  return `BSO254 ${order.id}\n${order.name}\n${order.email}\nPaid from ${order.phone}\n${items}\n${kes(order.total)}\nM-Pesa ${order.receipt ?? ""}${ship}`;
}

function OrderPage() {
  const { id } = Route.useParams();
  const ready = useHydrated();
  const order = useOrders((state) => state.orders.find((item) => item.id === id));

  if (!ready) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-muted">Loading your receipt…</div>;
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-5xl">No receipt on this device</h1>
        <p className="mt-3 text-muted">Orders stay in this browser. If you placed it elsewhere, it will not show here.</p>
        <Link to="/" className="btn-solid mt-6">Home</Link>
      </div>
    );
  }
  const hasMusic = order.lines.some((line) => line.kind === "music");
  const whatsapp = `https://wa.me/254${site.mpesaBusiness.slice(1)}?text=${encodeURIComponent(receiptText(order))}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs tracking-[0.2em] text-primary">SENT TO {spacedLine(site.mpesaBusiness)}</p>
      <h1 className="font-display text-6xl">{order.id}</h1>
      <p className="mt-2 text-muted">
        {order.name}, M-Pesa code {order.receipt}. Paid from {order.phone}. Send this receipt so the order can be matched to the text on the business number.
      </p>
      <ul className="panel mt-6 divide-y divide-border">
        {order.lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-3 px-4 py-3 text-sm">
            <span>
              {line.title}
              {line.size ? ` · ${line.size}` : ""}
              {line.qty > 1 ? ` × ${line.qty}` : ""}
            </span>
            <span className="tabular-nums">{kes(line.price * line.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between px-4 py-3 font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{kes(order.total)}</span>
        </li>
      </ul>
      {needsShip(order.address) ? <p className="mt-4 text-sm text-muted">Ship to {order.address}, {order.city}.</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <a className="btn-solid" href={whatsapp} target="_blank" rel="noreferrer">Send receipt on WhatsApp</a>
        {hasMusic ? <Link to="/library" className="btn-line">Open library</Link> : null}
        <Link to="/music" className="btn-line">Keep browsing</Link>
      </div>
    </div>
  );
}

function needsShip(address: string) {
  return address.length > 0;
}