import { createServerFn } from "@tanstack/react-start";
import type { ShopCatalog } from "@/lib/catalog.server";
import { authMiddleware } from "@/lib/auth/middleware";

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
  const { needsSetup, signedIn, readLiveCatalog } = await import("./catalog.server");
  const catalog = await readLiveCatalog();
  return {
    signedIn: await signedIn(),
    needsSetup: await needsSetup(),
    releases: catalog.releases.length,
    products: catalog.products.length,
  };
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

export const adminSetup = createServerFn({ method: "POST" })
  .validator((input: { setupKey: string; password: string }) => {
    const setupKey = String(input?.setupKey ?? "").trim();
    const password = String(input?.password ?? "");
    if (setupKey.length < 8 || password.length < 12 || password.length > 80) throw new Error("Check the setup key and use 12 or more characters.");
    return { setupKey, password };
  })
  .handler(async ({ data }) => {
    const { setupStudio, login } = await import("./catalog.server");
    await setupStudio(data.setupKey, data.password);
    const ok = await login(data.password);
    if (!ok) throw new Error("The studio was created, but the sign-in did not stick. Try the password.");
    return { ok: true as const };
  });

export const adminPayments = createServerFn({ method: "GET" }).handler(async () => {
  const { signedIn, listPendingPurchases } = await import("./catalog.server");
  if (!(await signedIn())) throw new Error("Sign in first.");
  return listPendingPurchases();
});

export const adminConfirm = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => {
    const id = String(input?.id ?? "");
    if (id.length < 3 || id.length > 200) throw new Error("Unknown payment.");
    return { id };
  })
  .handler(async ({ data }) => {
    const { signedIn, confirmPurchase } = await import("./catalog.server");
    if (!(await signedIn())) throw new Error("Sign in first.");
    await confirmPurchase(data.id);
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { logout } = await import("./catalog.server");
  await logout();
  return { ok: true as const };
});

export const adminUploadImage = createServerFn({ method: "POST" })
  .validator((input: { name: string; data: string }) => {
    const name = String(input?.name ?? "");
    const data = String(input?.data ?? "").replace(/\s/g, "");
    if (data.length < 100 || data.length > 6_000_000) throw new Error("Use a photo under 4 MB.");
    return { name, data };
  })
  .handler(async ({ data }) => {
    const { signedIn } = await import("./catalog.server");
    const { saveImage } = await import("./inbox.server");
    if (!(await signedIn())) throw new Error("Sign in first.");
    return saveImage(data.name, data.data);
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

export const openPreview = createServerFn({ method: "POST" })
  .validator((input: { trackId: string }) => {
    const trackId = String(input?.trackId ?? "");
    if (!/^[a-z0-9-]{1,60}$/.test(trackId)) throw new Error("Unknown track.");
    return { trackId };
  })
  .handler(async ({ data }) => {
    const { grantPreview } = await import("./catalog.server");
    const name = await grantPreview(data.trackId);
    if (!name) throw new Error("No preview on this song.");
    return { src: `/api/preview/${name}` };
  });

export const openTrack = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { trackId: string }) => {
    const trackId = String(input?.trackId ?? "");
    if (!/^[a-z0-9-]{1,60}$/.test(trackId)) throw new Error("Unknown track.");
    return { trackId };
  })
  .handler(async ({ data, context }) => {
    const { getCookie, setCookie } = await import("@tanstack/react-start/server");
    const { grantFiles, userOwnsConfirmed } = await import("./catalog.server");
    if (!(await userOwnsConfirmed(context.userId, data.trackId))) throw new Error("This song is still locked.");
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
