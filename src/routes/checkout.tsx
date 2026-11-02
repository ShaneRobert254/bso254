import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageHero } from "@/components/cards";
import { kes } from "@/lib/format";
import { site } from "@/lib/site";
import { cartTotal, useCart, useOrders, type Order } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const ready = useHydrated();
  const lines = useCart((state) => state.lines);
  const clear = useCart((state) => state.clear);
  const place = useOrders((state) => state.place);
  const navigate = useNavigate();
  const shown = ready ? lines : [];
  const needsAddress = shown.some((line) => line.kind === "merch");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [pay, setPay] = useState<Order["pay"]>("mpesa");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (shown.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    if (!name.trim() || !email.includes("@") || phone.trim().length < 8) {
      setError("Name, email, and a phone number are required.");
      return;
    }
    if (needsAddress && (!city.trim() || !address.trim())) {
      setError("Merch needs a city and a delivery address.");
      return;
    }
    const id = `BSO-${Date.now().toString(36).toUpperCase()}`;
    place({
      id,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      pay,
      lines: shown,
      total: cartTotal(shown),
      note: note.trim(),
    });
    clear();
    void navigate({ to: "/order/$id", params: { id } });
  }

  return (
    <div>
      <PageHero kicker="CHECKOUT" title="Place your order" text="Digital music lands in your library on this device. Merch is a delivery reservation." />
      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div className="panel grid gap-3 p-4">
          <label className="grid gap-1 text-sm text-muted">
            Name
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Email
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Phone {pay === "mpesa" ? "(M-Pesa)" : ""}
            <input className="field" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="07…" />
          </label>
          {needsAddress ? (
            <>
              <label className="grid gap-1 text-sm text-muted">
                City
                <input className="field" value={city} onChange={(event) => setCity(event.target.value)} />
              </label>
              <label className="grid gap-1 text-sm text-muted">
                Delivery address
                <input className="field" value={address} onChange={(event) => setAddress(event.target.value)} />
              </label>
            </>
          ) : null}
          <fieldset className="grid gap-2">
            <legend className="text-sm text-muted">Pay with</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="pay" checked={pay === "mpesa"} onChange={() => setPay("mpesa")} />
              M-Pesa {site.mpesaTill ? `· till ${site.mpesaTill}` : ""}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="pay" checked={pay === "card"} onChange={() => setPay("card")} />
              Card
            </label>
          </fieldset>
          <label className="grid gap-1 text-sm text-muted">
            Note
            <input className="field" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
          </label>
          <p className="text-xs text-dim">
            This checkout saves the order in your browser so you can run the shop before a live till or card processor is connected. Do not collect real payment until that is switched on.
          </p>
          {error ? <p className="text-sm text-primary">{error}</p> : null}
          <button type="submit" className="btn-solid" disabled={shown.length === 0}>
            Place order · {kes(cartTotal(shown))}
          </button>
        </div>
        <aside className="panel h-fit p-4">
          <h2 className="font-display text-2xl">Bag</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {shown.map((line) => (
              <li key={line.key} className="flex justify-between gap-3">
                <span className="text-muted">
                  {line.title}
                  {line.qty > 1 ? ` × ${line.qty}` : ""}
                </span>
                <span className="tabular-nums">{kes(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
        </aside>
      </form>
    </div>
  );
}
