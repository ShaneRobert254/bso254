import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { PageHero } from "@/components/cards";
import { kes } from "@/lib/format";
import { checkMpesa, mpesaConfig, startMpesa } from "@/lib/mpesa";
import type { PricedLine } from "@/lib/quote";
import { cartTotal, useCart, useOrders } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState("");
  const [till, setTill] = useState("");
  const [kind, setKind] = useState("paybill");
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    void mpesaConfig()
      .then((config) => {
        setLive(config.configured);
        setTill(config.shortcode);
        setKind(config.kind);
      })
      .catch(() => setLive(false));
  }, []);

  async function finish(paid: { orderId: string; total: number; lines: PricedLine[]; receipt?: string }) {
    place({
      id: paid.orderId,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      pay: "mpesa",
      lines: paid.lines.map((line) => ({ ...line, key: `${line.kind}:${line.ref}:${line.trackId ?? line.size ?? "pack"}` })),
      total: paid.total,
      note: note.trim(),
      receipt: paid.receipt,
    });
    clear();
    await navigate({ to: "/order/$id", params: { id: paid.orderId } });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (shown.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    if (!name.trim() || !email.includes("@")) {
      setError("Name and email are required.");
      return;
    }
    if (needsAddress && (!city.trim() || !address.trim())) {
      setError("Merch needs a city and a delivery address.");
      return;
    }
    setWaiting("Sending the M-Pesa prompt…");
    try {
      const started = await startMpesa({
        data: {
          phone,
          items: shown.map((line) => ({
            kind: line.kind,
            ref: line.ref,
            trackId: line.trackId,
            qty: line.qty,
            size: line.size,
          })),
        },
      });
      if (!started.ok) {
        setWaiting("");
        setError(started.error);
        return;
      }
      setWaiting("Check your phone and enter your M-Pesa PIN.");
      for (let attempt = 0; attempt < 16; attempt += 1) {
        await sleep(4000);
        const check = await checkMpesa({ data: { checkoutRequestId: started.checkoutRequestId } });
        if (check.status === "paid") {
          await finish({ ...started, receipt: check.receipt });
          return;
        }
        if (check.status === "failed") {
          setWaiting("");
          setError(check.detail);
          return;
        }
      }
      setWaiting("");
      setError("No PIN came through in time. If you were not charged, you can try again. Do not pay twice.");
    } catch (reason) {
      setWaiting("");
      setError(reason instanceof Error ? reason.message : "M-Pesa could not start.");
    }
  }

  return (
    <div>
      <PageHero kicker="CHECKOUT" title="Pay with M-Pesa" text="Safaricom sends a prompt to your phone. Music unlocks here only after the PIN goes through." />
      <form onSubmit={submit} className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <div className="panel grid gap-3 p-4">
          <label className="grid gap-1 text-sm text-muted">
            Name
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" disabled={Boolean(waiting)} />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Email
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" disabled={Boolean(waiting)} />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            M-Pesa phone
            <input className="field" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" placeholder="07…" disabled={Boolean(waiting)} />
          </label>
          {needsAddress ? (
            <>
              <label className="grid gap-1 text-sm text-muted">
                City
                <input className="field" value={city} onChange={(event) => setCity(event.target.value)} disabled={Boolean(waiting)} />
              </label>
              <label className="grid gap-1 text-sm text-muted">
                Delivery address
                <input className="field" value={address} onChange={(event) => setAddress(event.target.value)} disabled={Boolean(waiting)} />
              </label>
            </>
          ) : null}
          <p className="text-sm text-fg">
            Pay with M-Pesa{till ? ` · ${kind} ${till}` : ""}
          </p>
          <label className="grid gap-1 text-sm text-muted">
            Note
            <input className="field" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" disabled={Boolean(waiting)} />
          </label>
          {live === false ? (
            <p className="text-xs text-dim">
              The prompt is not switched on yet. Safaricom Daraja keys still need to be added on the host. Nothing is charged until then.
            </p>
          ) : (
            <p className="text-xs text-dim">You will get an M-Pesa prompt. Enter your PIN to pay {kes(cartTotal(shown))}.</p>
          )}
          {waiting ? <p className="text-sm text-fg">{waiting}</p> : null}
          {error ? <p className="text-sm text-primary">{error}</p> : null}
          <button type="submit" className="btn-solid" disabled={shown.length === 0 || Boolean(waiting)}>
            {waiting ? "Waiting for PIN…" : `Pay with M-Pesa · ${kes(cartTotal(shown))}`}
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
