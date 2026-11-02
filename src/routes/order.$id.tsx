import { createFileRoute, Link } from "@tanstack/react-router";
import { kes } from "@/lib/format";
import { useOrders } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/order/$id")({ component: OrderPage });

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-xs tracking-[0.2em] text-primary">ORDER RESERVED</p>
      <h1 className="font-display text-6xl">{order.id}</h1>
      <p className="mt-2 text-muted">
        {order.name}, we saved this for {order.email}. {order.pay === "mpesa" ? `M-Pesa phone ${order.phone}.` : `Card checkout noted for ${order.phone}.`}
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
        {hasMusic ? <Link to="/library" className="btn-solid">Open library</Link> : null}
        <Link to="/music" className="btn-line">Keep browsing</Link>
      </div>
    </div>
  );
}

function needsShip(address: string) {
  return address.length > 0;
}
