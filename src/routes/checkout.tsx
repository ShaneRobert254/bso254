import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageHero } from "@/components/cards";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { kes, spacedLine } from "@/lib/format";
import { savePurchases } from "@/lib/purchases";
import { site } from "@/lib/site";
import { cartTotal, useCart, useOrders } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

const payTo = spacedLine(site.mpesaBusiness);

function CheckoutPage() {
  const ready = useHydrated();
  const lines = useCart((state) => state.lines);
  const clear = useCart((state) => state.clear);
  const place = useOrders((state) => state.place);
  const { user } = useCurrentUserState();
  const navigate = useNavigate();
  const shown = ready ? lines : [];
  const needsAddress = shown.some((line) => line.kind === "merch");
  const total = cartTotal(shown);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (shown.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    if (!name.trim() || !email.includes("@") || phone.trim().length < 8) {
      setError("Name, email, and the phone you paid from are required.");
      return;
    }
    if (needsAddress && (!city.trim() || !address.trim())) {
      setError("Merch needs a city and a delivery address.");
      return;
    }
    const receipt = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{10}$/.test(receipt)) {
      setError("Paste the 10-character code from the M-Pesa message.");
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
      pay: "mpesa",
      lines: shown,
      total,
      note: note.trim(),
      receipt,
    });
    if (user) {
      const items = shown
        .filter((line) => line.kind === "music")
        .map((line) => ({ ref: line.ref, trackId: line.trackId, title: line.title }));
      if (items.length > 0) {
        await savePurchases({ data: { receipt, items } }).catch(() => undefined);
      }
    }
    clear();
    void navigate({ to: "/order/$id", params: { id } });
  }

  return (
    <div>
      <PageHero
        kicker="CHECKOUT"
        title="Pay the business number"
        text={`Lipa na M-Pesa, then Pochi la Biashara. Send the total to ${payTo}.`}
      />
      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div className="panel grid gap-3 p-4">
          <div className="rounded-xl border border-border bg-bg px-4 py-4">
            <p className="text-xs tracking-[0.2em] text-primary">M-PESA BUSINESS NUMBER</p>
            <p className="mt-1 font-display text-5xl tracking-wide">{payTo}</p>
            <p className="mt-2 text-sm text-muted">Amount {kes(total)}</p>
            <ol className="mt-3 grid list-decimal gap-1 pl-4 text-sm text-muted">
              <li>Open M-Pesa and choose Lipa na M-Pesa.</li>
              <li>Choose Pochi la Biashara.</li>
              <li>Enter {site.mpesaBusiness}.</li>
              <li>Enter {kes(total)} and your PIN.</li>
              <li>Paste the code from the confirmation text below.</li>
            </ol>
          </div>
          <label className="grid gap-1 text-sm text-muted">
            Name
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Email
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Phone you paid from
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
          <label className="grid gap-1 text-sm text-muted">
            M-Pesa code
            <input className="field uppercase" value={code} onChange={(event) => setCode(event.target.value)} placeholder="RK71H2M9XQ" autoCapitalize="characters" />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Note
            <input className="field" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
          </label>
          <p className="text-xs text-dim">The code is the one in the M-Pesa text, not your PIN. Music on this device opens after you save it. Merch ships once that text is on {payTo}.</p>
          {error ? <p className="text-sm text-primary">{error}</p> : null}
          <button type="submit" className="btn-solid" disabled={shown.length === 0}>
            I have paid · {kes(total)}
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
