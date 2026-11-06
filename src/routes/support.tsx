import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/cards";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/support")({ component: SupportPage });

const faqs = [
  {
    q: "Where is my music after I buy it?",
    a: "Open Library. Purchases stay on the browser you checked out with. Download the preview WAV from the track, or play it in the bar.",
  },
  {
    q: "Do you ship merch?",
    a: "Yes, inside Kenya. Pay the business number on checkout with Pochi la Biashara, then send the receipt on WhatsApp. The piece ships after that text is on the business line.",
  },
  {
    q: "How do I put the real songs in?",
    a: "Add an audio file under public/media and point the track at it when you are ready. Until then, every play button runs an original preview beat.",
  },
  {
    q: "How do I change prices, the till, or social links?",
    a: "Prices live with the catalog. The business number, email, and profile links live in the site settings file at the top of the project.",
  },
];

function SupportPage() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      <PageHero kicker="SUPPORT" title="Need a hand?" text="Orders, downloads, and how the shop is set up." />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ul className="grid gap-2">
          {faqs.map((item, index) => (
            <li key={item.q} className="panel">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium"
                aria-expanded={open === index}
                onClick={() => setOpen(open === index ? -1 : index)}
              >
                {item.q}
                <span className="text-primary">{open === index ? "–" : "+"}</span>
              </button>
              <p className={cn("px-4 pb-4 text-sm text-muted", open === index ? "block" : "hidden")}>{item.a}</p>
            </li>
          ))}
        </ul>
        <Link to="/contact" className="btn-solid mt-6">Contact</Link>
      </div>
    </div>
  );
}
