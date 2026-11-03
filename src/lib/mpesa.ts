import { createServerFn } from "@tanstack/react-start";
import { mpesaPhone, type PayItem } from "@/lib/quote";

type StartData = { phone: string; items: PayItem[] };

function asItems(value: unknown): PayItem[] {
  if (!Array.isArray(value)) throw new Error("Your bag could not be read.");
  return value.map((entry) => {
    if (!entry || typeof entry !== "object") throw new Error("Your bag could not be read.");
    const item = entry as Record<string, unknown>;
    const kind = item.kind === "merch" ? "merch" : item.kind === "music" ? "music" : null;
    if (!kind || typeof item.ref !== "string") throw new Error("Your bag could not be read.");
    const qty = typeof item.qty === "number" ? item.qty : 1;
    return {
      kind,
      ref: item.ref,
      trackId: typeof item.trackId === "string" ? item.trackId : undefined,
      qty,
      size: typeof item.size === "string" ? item.size : undefined,
    };
  });
}

export const mpesaConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { publicConfig } = await import("./mpesa.server");
  return publicConfig();
});

export const startMpesa = createServerFn({ method: "POST" })
  .validator((input: StartData) => {
    const phone = mpesaPhone(input?.phone ?? "");
    if (!phone) throw new Error("Use a Safaricom number, like 07… or 01….");
    return { phone, items: asItems(input.items) };
  })
  .handler(async ({ data }) => {
    const { pushStk } = await import("./mpesa.server");
    return pushStk(data);
  });

export const checkMpesa = createServerFn({ method: "POST" })
  .validator((input: { checkoutRequestId: string }) => {
    const id = input?.checkoutRequestId?.trim() ?? "";
    if (id.length < 8 || id.length > 80) throw new Error("That payment check is not valid.");
    return { checkoutRequestId: id };
  })
  .handler(async ({ data }) => {
    const { queryStk } = await import("./mpesa.server");
    return queryStk(data.checkoutRequestId);
  });
