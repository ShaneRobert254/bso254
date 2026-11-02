import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useFans } from "@/lib/store";

export function JoinForm({ compact = false }: { compact?: boolean }) {
  const join = useFans((state) => state.join);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.includes("@") || !city.trim()) {
      toast.error("Add your name, a real email, and your city.");
      return;
    }
    join({ name: name.trim(), email: email.trim(), city: city.trim(), at: new Date().toISOString() });
    setName("");
    setEmail("");
    setCity("");
    toast.success("You're in. Watch your inbox for drops.");
  }

  return (
    <form onSubmit={submit} className={compact ? "grid gap-2" : "grid gap-3"}>
      <label className="grid gap-1 text-sm">
        <span className="sr-only">Your name</span>
        <input className="field" placeholder="Your Name" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="sr-only">Email address</span>
        <input className="field" type="email" placeholder="Email Address" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="sr-only">Your city</span>
        <input className="field" placeholder="Your City" value={city} onChange={(event) => setCity(event.target.value)} />
      </label>
      <button type="submit" className="btn-solid w-full">
        <Send className="h-4 w-4" />
        Join Now
      </button>
    </form>
  );
}
