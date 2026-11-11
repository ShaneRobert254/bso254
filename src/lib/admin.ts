import { createServerFn } from "@tanstack/react-start";
import type { ShopCatalog } from "@/lib/catalog.server";

export const getShopCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { publicCatalog, readLiveCatalog } = await import("./catalog.server");
  return publicCatalog(await readLiveCatalog());
});

export const adminCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { readLiveCatalog, signedIn } = await import("./catalog.server");
  if (!(await signedIn())) throw new Error("Sign in first.");
  return readLiveCatalog();
});

export const adminState = createServerFn({ method: "GET" }).handler(async () => {
  const { signedIn, readLiveCatalog } = await import("./catalog.server");
  const catalog = await readLiveCatalog();
  return { signedIn: await signedIn(), releases: catalog.releases.length, products: catalog.products.length };
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input: { password: string }) => {
    const password = String(input?.password ?? "");
    if (password.length < 8 || password.length > 80) throw new Error("Wrong password.");
    return { password };
  })
  .handler(async ({ data }) => {
    const { login } = await import("./catalog.server");
    const ok = await login(data.password);
    if (!ok) throw new Error("Wrong password.");
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { logout } = await import("./catalog.server");
  await logout();
  return { ok: true as const };
});

export const adminUploadAudio = createServerFn({ method: "POST" })
  .validator((input: { name: string; data: string }) => {
    const name = String(input?.name ?? "");
    const data = String(input?.data ?? "").replace(/\s/g, "");
    if (data.length < 100 || data.length > 18_000_000) throw new Error("Keep the song under 12 MB.");
    return { name, data };
  })
  .handler(async ({ data }) => {
    const { signedIn, saveAudio } = await import("./catalog.server");
    if (!(await signedIn())) throw new Error("Sign in first.");
    return saveAudio(data.name, data.data);
  });

export const adminSave = createServerFn({ method: "POST" })
  .validator((input: ShopCatalog) => input)
  .handler(async ({ data }) => {
    const { signedIn, writeLiveCatalog } = await import("./catalog.server");
    if (!(await signedIn())) throw new Error("Sign in first.");
    return writeLiveCatalog(data);
  });

export const openTrack = createServerFn({ method: "POST" })
  .validator((input: { trackId: string }) => {
    const trackId = String(input?.trackId ?? "");
    if (!/^[a-z0-9-]{1,60}$/.test(trackId)) throw new Error("Unknown track.");
    return { trackId };
  })
  .handler(async ({ data }) => {
    const { getCookie, setCookie } = await import("@tanstack/react-start/server");
    const { grantFiles } = await import("./catalog.server");
    const files = await grantFiles([data.trackId]);
    if (files.length === 0) throw new Error("This song is not up yet.");
    const already = (getCookie("bso_paid") ?? "").split(",").filter(Boolean);
    const next = [...new Set([...already, ...files])].slice(0, 80);
    setCookie("bso_paid", next.join(","), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
      maxAge: 60 * 60 * 24 * 365,
    });
    return { src: `/api/audio/${files[0]}` };
  });
