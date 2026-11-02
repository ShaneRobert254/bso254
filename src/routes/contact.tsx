import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/cards";
import { site } from "@/lib/site";

export const Route = createFileRoute("/contact")({ component: ContactPage });

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Booking");
  const [message, setMessage] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.includes("@") || message.trim().length < 8) {
      toast.error("Name, email, and a real message.");
      return;
    }
    const notes = JSON.parse(localStorage.getItem("bso254-notes") ?? "[]") as unknown[];
    notes.unshift({ name, email, topic, message, at: new Date().toISOString() });
    localStorage.setItem("bso254-notes", JSON.stringify(notes.slice(0, 40)));
    setName("");
    setEmail("");
    setMessage("");
    toast.success("Message saved. We'll read it from this device's inbox until mail is connected.");
  }

  return (
    <div>
      <PageHero kicker="CONTACT" title="Talk to Bso" text="Bookings, press, stores, and fans who need a hand with an order." />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_280px]">
        <form onSubmit={submit} className="panel grid gap-3 p-5">
          <label className="grid gap-1 text-sm text-muted">
            Name
            <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Email
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Topic
            <select className="field" value={topic} onChange={(event) => setTopic(event.target.value)}>
              <option>Booking</option>
              <option>Press</option>
              <option>Merch order</option>
              <option>Music</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm text-muted">
            Message
            <textarea className="field h-32 py-2" value={message} onChange={(event) => setMessage(event.target.value)} />
          </label>
          <button type="submit" className="btn-solid w-fit">Send</button>
        </form>
        <aside className="panel h-fit p-5 text-sm text-muted">
          <p className="font-semibold text-fg">{site.brand}</p>
          <p className="mt-2">{site.city}</p>
          <a className="mt-3 block text-fg hover:text-primary" href={`mailto:${site.email}`}>{site.email}</a>
          <p className="mt-4 text-xs text-dim">
            Swap this address in the site settings when your real inbox is ready. Messages typed here stay in this browser for now.
          </p>
        </aside>
      </div>
    </div>
  );
}
