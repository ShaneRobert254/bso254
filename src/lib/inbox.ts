import { createServerFn } from "@tanstack/react-start";
import type { Shot } from "@/lib/catalog";

async function studio() {
  const { signedIn } = await import("@/lib/catalog.server");
  if (!(await signedIn())) throw new Error("Sign in first.");
}

export const getGallery = createServerFn({ method: "GET" }).handler(async () => {
  const { readGallery } = await import("./inbox.server");
  return readGallery();
});

export const sendMessage = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; topic: string; message: string }) => {
    const name = String(input?.name ?? "").trim().slice(0, 80);
    const email = String(input?.email ?? "").trim().slice(0, 120);
    const topic = String(input?.topic ?? "Music").trim().slice(0, 40);
    const message = String(input?.message ?? "").trim().slice(0, 2000);
    if (name.length < 2 || !email.includes("@") || message.length < 8) throw new Error("Name, email, and a real message.");
    return { name, email, topic, message };
  })
  .handler(async ({ data }) => {
    const { storeMessage } = await import("./inbox.server");
    await storeMessage(data);
    return { ok: true as const };
  });

export const joinFan = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; city: string }) => {
    const name = String(input?.name ?? "").trim().slice(0, 80);
    const email = String(input?.email ?? "").trim().toLowerCase().slice(0, 120);
    const city = String(input?.city ?? "").trim().slice(0, 80);
    if (name.length < 2 || !email.includes("@") || city.length < 2) throw new Error("Add your name, a real email, and your city.");
    return { name, email, city };
  })
  .handler(async ({ data }) => {
    const { storeFan } = await import("./inbox.server");
    await storeFan(data);
    return { ok: true as const };
  });

export const adminGallery = createServerFn({ method: "GET" }).handler(async () => {
  await studio();
  const { readGallery } = await import("./inbox.server");
  return readGallery();
});

export const adminSaveGallery = createServerFn({ method: "POST" })
  .validator((input: Shot[]) => (Array.isArray(input) ? input : []))
  .handler(async ({ data }) => {
    await studio();
    const { writeGallery } = await import("./inbox.server");
    return writeGallery(data);
  });

export const adminInbox = createServerFn({ method: "GET" }).handler(async () => {
  await studio();
  const { listInbox } = await import("./inbox.server");
  return listInbox();
});

export const adminReadMessage = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => {
    const id = String(input?.id ?? "");
    if (!/^[a-f0-9]{16}$/.test(id)) throw new Error("Unknown message.");
    return { id };
  })
  .handler(async ({ data }) => {
    await studio();
    const { markMessage } = await import("./inbox.server");
    await markMessage(data.id);
    return { ok: true as const };
  });
