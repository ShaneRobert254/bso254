import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageHero } from "@/components/cards";
import { kes } from "@/lib/format";
import { orderMessage } from "@/lib/order-text";
import { whatsappLink } from "@/lib/site";
import { cartTotal, useCart, useOrders } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { hiddenMeta } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () => hiddenMeta("Checkout — Bso254"),
  component: CheckoutPage,
});

function CheckoutPage() {
  const ready = useHydrated();
  const lines = useCart((state) => state.lines);
  const clear = useCart((state) => state.clear);
  const place = useOrders((state) => state.place);
  const navigate = useNavigate();
  const shown = (ready ? lines : []).filter((line) => line.kind === "merch");
  const total = cartTotal(shown);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (shown.length === 0) {
      setError("Add a merch piece first. Songs are free to play.");
      return;
    }
    if (!name.trim() || phone.trim().length < 8 || !city.trim() || address.trim().length < 4) {
      setError("Name, phone, city, and delivery address are required.");
      return;
    }
    const id = `BSO-${Date.now().toString(36).toUpperCase()}`;
    const order = {
      id,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      pay: "mpesa" as const,
      lines: shown,
      total,
      note: note.trim(),
    };
    place(order);
    clear();
    window.open(whatsappLink(orderMessage(order)), "_blank", "noopener,noreferrer");
    void navigate({ to: "/order/$id", params: { id } });
  }

  return (
    <div>
      <PageHero
        kicker="ORDER"
        title="Send it on WhatsApp"
        text="The message already lists the pieces, sizes, and your address. Payment details come back on 0111 209 244."
      />
      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div className="panel grid gap-3 p-4">
          <label className="grid gap-1 text-sm text-muted">
            Name
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            WhatsApp phone
            <input className="field" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="07…" />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Email, if you have one
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            City
            <input className="field" value={city} onChange={(event) => setCity(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Delivery address
            <input className="field" value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Note
            <input className="field" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Colour, pickup, anything else" />
          </label>
          {error ? <p className="text-sm text-primary">{error}</p> : null}
          <button type="submit" className="btn-solid" disabled={shown.length === 0}>
            Open WhatsApp · {kes(total)}
          </button>
        </div>
        <aside className="panel h-fit p-4">
          <h2 className="font-display text-2xl">Bag</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {shown.map((line) => (
              <li key={line.key} className="flex justify-between gap-3">
                <span className="text-muted">
                  {line.title}
                  {line.size ? ` · ${line.size}` : ""}
                  {line.qty > 1 ? ` × ${line.qty}` : ""}
                </span>
                <span className="tabular-nums">{kes(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          {shown.length === 0 ? <p className="mt-3 text-sm text-muted">No merch in the bag.</p> : null}
        </aside>
      </form>
    </div>
  );
}
