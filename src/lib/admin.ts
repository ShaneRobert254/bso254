import { createServerFn } from "@tanstack/react-start";
import type { ShopCatalog } from "@/lib/catalog.server";

export const getShopCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { readLiveCatalog } = await import("./catalog.server");
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
