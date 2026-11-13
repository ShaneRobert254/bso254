import { Link, useNavigate } from "@tanstack/react-router";
import {
  House,
  Image as ImageIcon,
  Info,
  Mail,
  Menu,
  Music2,
  Search,
  ShoppingBag,
  Users,
  X,
  Headphones,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Logo } from "@/components/logo";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/cn";
import { useShop } from "@/lib/shop";
import { cartCount, useCart } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

const nav = [
  { to: "/", label: "Home", icon: House, exact: true },
  { to: "/music", label: "Music", icon: Music2, exact: false },
  { to: "/merch", label: "Merch", icon: ShoppingBag, exact: false },
  { to: "/community", label: "Community", icon: Users, exact: false },
  { to: "/gallery", label: "Gallery", icon: ImageIcon, exact: false },
  { to: "/about", label: "About", icon: Info, exact: false },
  { to: "/contact", label: "Contact", icon: Mail, exact: false },
] as const;

export function Header() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const hydrated = useHydrated();
  const { isPending } = useCurrentUserState();
  const count = useCart((state) => cartCount(state.lines));
  const { releases, products } = useShop();
  const shown = hydrated ? count : 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    const music = releases
      .filter((release) => release.title.toLowerCase().includes(q) || release.blurb.toLowerCase().includes(q))
      .map((release) => ({
        kind: "music" as const,
        slug: release.slug,
        title: release.title,
        label: release.type,
        image: release.cover,
      }));
    const merch = products
      .filter((product) => product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q))
      .map((product) => ({
        kind: "merch" as const,
        slug: product.slug,
        title: product.name,
        label: product.category,
        image: product.image,
      }));
    return [...music, ...merch].slice(0, 8);
  }, [products, query, releases]);

  function openResult(result: (typeof results)[number]) {
    setSearching(false);
    setQuery("");
    if (result.kind === "music") {
      void navigate({ to: "/music/$slug", params: { slug: result.slug } });
      return;
    }
    void navigate({ to: "/merch/$slug", params: { slug: result.slug } });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav
            .filter((item) => item.to !== "/merch" && item.to !== "/community")
            .map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="relative inline-flex h-10 items-center px-2 text-xs tracking-[0.16em] uppercase"
            >
              {({ isActive }) => (
                <span className={cn(isActive ? "text-fg" : "text-muted")}>
                  {item.label}
                  {isActive ? <span className="absolute right-2 bottom-1 left-2 h-0.5 rounded-full bg-primary" /> : null}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          {isPending ? <span className="h-8 w-8 animate-pulse rounded-full bg-surface-2" /> : null}
          <SignedOut>
            <Link to="/login" className="hidden h-10 items-center px-2 text-sm text-muted hover:text-fg sm:inline-flex">
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <span className="hidden max-w-40 truncate lg:inline">
              <UserButton />
            </span>
          </SignedIn>
          <Link to="/merch" className="btn-solid mr-1 hidden h-10 px-4 sm:inline-flex">
            Shop Now
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-fg hover:text-primary"
            aria-label="Search music and merch"
            onClick={() => setSearching(true)}
          >
            <Search className="h-4 w-4" />
          </button>
          <Link
            to="/library"
            className="hidden h-10 items-center gap-1.5 rounded-full px-2 text-sm text-muted hover:text-fg sm:inline-flex"
            activeProps={{ className: "text-fg" }}
          >
            <Headphones className="h-4 w-4" />
            <span className="hidden md:inline">Library</span>
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-fg hover:text-primary"
            aria-label={`Cart, ${shown} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            {shown > 0 ? (
              <span className="absolute top-1 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-fg tabular-nums">
                {shown}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-fg lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="border-t border-border bg-bg px-4 py-3 lg:hidden" aria-label="Mobile">
          <ul className="grid gap-1">
            <li>
              <Link to="/merch" onClick={() => setOpen(false)} className="btn-solid mb-2 w-full">
                Shop Now
              </Link>
            </li>
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.exact }}
                  onClick={() => setOpen(false)}
                  className="flex h-11 items-center gap-2 rounded-lg px-2 text-muted"
                  activeProps={{ className: "bg-surface text-fg" }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/library" onClick={() => setOpen(false)} className="flex h-11 items-center gap-2 rounded-lg px-2 text-muted">
                <Headphones className="h-4 w-4" />
                Library
              </Link>
              <Link to="/login" onClick={() => setOpen(false)} className="flex h-11 items-center gap-2 rounded-lg px-2 text-muted">
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
      {searching ? (
        <div className="fixed inset-0 z-50 bg-bg/80 p-4" role="dialog" aria-modal="true" aria-label="Search">
          <div className="mx-auto mt-16 max-w-lg panel p-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-dim" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search albums, singles, merch"
                className="field border-0 bg-transparent px-0"
                aria-label="Search"
              />
              <button type="button" className="inline-flex h-10 w-10 items-center justify-center" aria-label="Close search" onClick={() => { setSearching(false); setQuery(""); }}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="mt-3 grid gap-1">
              {query.trim() && results.length === 0 ? <li className="px-2 py-3 text-sm text-muted">Nothing under that name yet.</li> : null}
              {results.map((result) => (
                <li key={`${result.kind}-${result.slug}`}>
                  <button
                    type="button"
                    onClick={() => openResult(result)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2"
                  >
                    <img src={result.image} alt="" className="h-12 w-12 rounded-md object-cover" />
                    <span>
                      <span className="block text-sm font-medium text-fg">{result.title}</span>
                      <span className="text-xs tracking-wide text-dim uppercase">{result.label}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </header>
  );
}
