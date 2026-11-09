import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { adminLogin, adminLogout, adminSave, adminState, adminUploadAudio, getShopCatalog } from "@/lib/admin";
import type { Product, Release, Track } from "@/lib/catalog";
import { kes } from "@/lib/format";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Studio — BSO254" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

function blankRelease(): Release {
  return {
    slug: "new-release",
    title: "New release",
    type: "single",
    year: new Date().getFullYear(),
    cover: "/media/cover-flip.jpg",
    price: 200,
    blurb: "",
    tracks: [{ id: "new-track", title: "New track", duration: 180, price: 200 }],
  };
}

function blankProduct(): Product {
  return {
    slug: "new-piece",
    name: "New piece",
    price: 1500,
    image: "/media/tee.jpg",
    category: "Tee",
    sizes: ["M"],
    blurb: "",
    details: [],
  };
}

function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [releases, setReleases] = useState<Release[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void adminState()
      .then(async (state) => {
        setSignedIn(state.signedIn);
        if (state.signedIn) {
          const catalog = await getShopCatalog();
          setReleases(catalog.releases);
          setProducts(catalog.products);
        }
      })
      .catch(() => setError("The studio could not open."))
      .finally(() => setReady(true));
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await adminLogin({ data: { password } });
      const catalog = await getShopCatalog();
      setReleases(catalog.releases);
      setProducts(catalog.products);
      setPassword("");
      setSignedIn(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wrong password.");
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const saved = await adminSave({ data: { releases, products } });
      setReleases(saved.releases);
      setProducts(saved.products);
      await router.invalidate();
      toast.success("The site is updated.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return <div className="mx-auto max-w-3xl px-4 py-16 text-muted">Opening the studio…</div>;

  if (!signedIn) {
    return (
      <form onSubmit={signIn} className="mx-auto grid max-w-md gap-3 px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-primary">STUDIO</p>
        <h1 className="font-display text-5xl">Only Bso</h1>
        <p className="text-sm text-muted">This page changes the music and merch on the site. Fans cannot open it.</p>
        <label className="grid gap-1 text-sm text-muted">
          Password
          <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </label>
        {error ? <p className="text-sm text-primary">{error}</p> : null}
        <button type="submit" className="btn-solid">Enter</button>
      </form>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.2em] text-primary">STUDIO</p>
          <h1 className="font-display text-5xl">Music and merch</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-line"
            onClick={() => {
              void adminLogout().then(() => setSignedIn(false));
            }}
          >
            Lock
          </button>
          <button type="button" className="btn-solid" disabled={saving} onClick={() => void save()}>
            {saving ? "Saving…" : "Update the site"}
          </button>
        </div>
      </div>
      {error ? <p className="text-sm text-primary">{error}</p> : null}

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl">Music</h2>
          <button type="button" className="btn-line" onClick={() => setReleases([blankRelease(), ...releases])}>Add release</button>
        </div>
        {releases.map((release, index) => (
          <article key={`${release.slug}-${index}`} className="panel grid gap-3 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Title" value={release.title} onChange={(title) => editRelease(index, { title })} />
              <Field label="Price (KSh)" value={String(release.price)} onChange={(value) => editRelease(index, { price: Number(value) })} />
              <Field label="Cover image" value={release.cover} onChange={(cover) => editRelease(index, { cover })} />
              <label className="grid gap-1 text-sm text-muted">
                Type
                <select className="field" value={release.type} onChange={(event) => editRelease(index, { type: event.target.value === "single" ? "single" : "album" })}>
                  <option value="album">Album</option>
                  <option value="single">Single</option>
                </select>
              </label>
            </div>
            <Field label="Description" value={release.blurb} onChange={(blurb) => editRelease(index, { blurb })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(release.exclusive)} onChange={(event) => editRelease(index, { exclusive: event.target.checked })} />
              Unreleased
            </label>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted">Tracks · pack {kes(release.price)}</p>
                <button
                  type="button"
                  className="text-sm text-muted hover:text-fg"
                  onClick={() => editRelease(index, { tracks: [...release.tracks, { id: "track", title: "Track", duration: 180, price: 150 }] })}
                >
                  Add track
                </button>
              </div>
              {release.tracks.map((track, trackIndex) => (
                <div key={`${track.id}-${trackIndex}`} className="grid gap-2 border-t border-border pt-2 sm:grid-cols-[1fr_100px_100px_auto]">
                  <input className="field" value={track.title} aria-label="Track title" onChange={(event) => editTrack(index, trackIndex, { title: event.target.value })} />
                  <input className="field" value={String(track.price)} aria-label="Track price" inputMode="numeric" onChange={(event) => editTrack(index, trackIndex, { price: Number(event.target.value) })} />
                  <input className="field" value={String(track.duration)} aria-label="Track seconds" inputMode="numeric" onChange={(event) => editTrack(index, trackIndex, { duration: Number(event.target.value) })} />
                  <button type="button" className="text-sm text-primary" onClick={() => editRelease(index, { tracks: release.tracks.filter((_, item) => item !== trackIndex) })}>
                    Remove
                  </button>
                  <label className="grid gap-1 text-sm text-muted sm:col-span-4">
                    Song file (MP3 or WAV, under 12 MB)
                    <input
                      className="field"
                      type="file"
                      accept=".mp3,.wav,audio/mpeg,audio/wav,audio/x-wav"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void uploadSong(index, trackIndex, file);
                      }}
                    />
                    <span className="text-xs text-dim">{track.audio ? `Saved: ${track.audio}` : "No song file yet. The player uses a short sketch until you add one."}</span>
                  </label>
                </div>
              ))}
            </div>
            <button type="button" className="justify-self-start text-sm text-primary" onClick={() => setReleases(releases.filter((_, item) => item !== index))}>
              Remove release
            </button>
          </article>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-3xl">Merch</h2>
          <button type="button" className="btn-line" onClick={() => setProducts([blankProduct(), ...products])}>Add piece</button>
        </div>
        {products.map((product, index) => (
          <article key={`${product.slug}-${index}`} className="panel grid gap-3 p-4 sm:grid-cols-2">
            <Field label="Name" value={product.name} onChange={(name) => editProduct(index, { name })} />
            <Field label="Price (KSh)" value={String(product.price)} onChange={(value) => editProduct(index, { price: Number(value) })} />
            <Field label="Category" value={product.category} onChange={(category) => editProduct(index, { category })} />
            <Field label="Sizes, separated by commas" value={product.sizes.join(", ")} onChange={(value) => editProduct(index, { sizes: value.split(",").map((size) => size.trim()).filter(Boolean) })} />
            <Field label="Image" value={product.image} onChange={(image) => editProduct(index, { image })} />
            <Field label="Description" value={product.blurb} onChange={(blurb) => editProduct(index, { blurb })} />
            <button type="button" className="justify-self-start text-sm text-primary" onClick={() => setProducts(products.filter((_, item) => item !== index))}>
              Remove piece
            </button>
          </article>
        ))}
      </section>
    </div>
  );

  function editRelease(index: number, patch: Partial<Release>) {
    setReleases(releases.map((release, item) => (item === index ? { ...release, ...patch } : release)));
  }

  function editTrack(index: number, trackIndex: number, patch: Partial<Track>) {
    editRelease(index, {
      tracks: releases[index].tracks.map((track, item) => (item === trackIndex ? { ...track, ...patch } : track)),
    });
  }

  async function uploadSong(index: number, trackIndex: number, file: File) {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".mp3") && !lower.endsWith(".wav")) {
      setError("Use an MP3 or WAV file.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError("Keep the song under 12 MB.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const data = await fileToBase64(file);
      const saved = await adminUploadAudio({ data: { name: file.name, data } });
      const seconds = await fileSeconds(file);
      editTrack(index, trackIndex, { audio: saved.audio, ...(seconds ? { duration: seconds } : {}) });
      toast.success("Song file saved. Press Update the site.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not upload the song.");
    } finally {
      setSaving(false);
    }
  }

  function editProduct(index: number, patch: Partial<Product>) {
    setProducts(products.map((product, item) => (item === index ? { ...product, ...patch } : product)));
  }
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm text-muted">
      {label}
      <input className="field" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result ?? "");
      const comma = raw.indexOf(",");
      resolve(comma >= 0 ? raw.slice(comma + 1) : raw);
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function fileSeconds(file: File) {
  return new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      const seconds = Math.round(audio.duration);
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(seconds) ? seconds : 0);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
  });
}
