import { quoteCart, mpesaPhone, type PayItem, type PricedLine } from "@/lib/quote";

type StartInput = {
  phone: string;
  items: PayItem[];
};

type StartResult =
  | { ok: true; checkoutRequestId: string; orderId: string; total: number; lines: PricedLine[] }
  | { ok: false; error: string };

type CheckResult = { status: "pending" | "paid" | "failed"; detail: string; receipt?: string };

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : "";
}

function configured() {
  return Boolean(env("MPESA_CONSUMER_KEY") && env("MPESA_CONSUMER_SECRET") && env("MPESA_SHORTCODE") && env("MPESA_PASSKEY"));
}

export function publicConfig() {
  return {
    configured: configured(),
    shortcode: configured() ? env("MPESA_SHORTCODE") : "",
    kind: env("MPESA_TYPE") === "till" ? "till" : "paybill",
  };
}

function baseUrl() {
  return env("MPESA_ENV") === "live" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

function stamp() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${pick("year")}${pick("month")}${pick("day")}${pick("hour")}${pick("minute")}${pick("second")}`;
}

function password(shortcode: string, passkey: string, time: string) {
  return Buffer.from(`${shortcode}${passkey}${time}`).toString("base64");
}

function callbackUrl() {
  if (env("MPESA_CALLBACK_URL")) return env("MPESA_CALLBACK_URL");
  const host = env("VERCEL_PROJECT_PRODUCTION_URL") || env("VERCEL_URL");
  if (host) return `https://${host.replace(/^https?:\/\//, "")}/api/mpesa/callback`;
  return "https://example.com/api/mpesa/callback";
}

async function token() {
  const key = env("MPESA_CONSUMER_KEY");
  const secret = env("MPESA_CONSUMER_SECRET");
  const response = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}` },
  });
  if (!response.ok) return "";
  const body = (await response.json()) as { access_token?: string };
  return body.access_token ?? "";
}

export async function pushStk(input: StartInput): Promise<StartResult> {
  if (!configured()) {
    return { ok: false, error: "M-Pesa is not switched on yet. Add the Safaricom Daraja keys on the host before taking payment." };
  }
  const phone = mpesaPhone(input.phone);
  if (!phone) return { ok: false, error: "Use a Safaricom number, like 07… or 01…." };
  const quote = quoteCart(input.items);
  if (!quote.ok) return quote;
  const access = await token();
  if (!access) return { ok: false, error: "Safaricom did not accept the shop keys. Check the Daraja consumer key and secret." };
  const shortcode = env("MPESA_SHORTCODE");
  const time = stamp();
  const orderId = `B${Date.now().toString(36)}`.toUpperCase().slice(0, 12);
  const response = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password(shortcode, env("MPESA_PASSKEY"), time),
      Timestamp: time,
      TransactionType: env("MPESA_TYPE") === "till" ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
      Amount: quote.total,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl(),
      AccountReference: orderId,
      TransactionDesc: "BSO254",
    }),
  });
  const body = (await response.json()) as {
    CheckoutRequestID?: string;
    ResponseCode?: string;
    ResponseDescription?: string;
    errorMessage?: string;
  };
  if (!response.ok || body.ResponseCode !== "0" || !body.CheckoutRequestID) {
    return { ok: false, error: body.errorMessage || body.ResponseDescription || "Safaricom did not send the prompt." };
  }
  return {
    ok: true,
    checkoutRequestId: body.CheckoutRequestID,
    orderId,
    total: quote.total,
    lines: quote.lines,
  };
}

export async function queryStk(checkoutRequestId: string): Promise<CheckResult> {
  if (!configured()) return { status: "failed", detail: "M-Pesa is not switched on." };
  if (!/^ws_CO_\w+$/.test(checkoutRequestId) && checkoutRequestId.length < 8) {
    return { status: "failed", detail: "That payment check is not valid." };
  }
  const access = await token();
  if (!access) return { status: "failed", detail: "Could not reach Safaricom to confirm the payment." };
  const shortcode = env("MPESA_SHORTCODE");
  const time = stamp();
  const response = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password(shortcode, env("MPESA_PASSKEY"), time),
      Timestamp: time,
      CheckoutRequestID: checkoutRequestId,
    }),
  });
  const body = (await response.json()) as {
    ResultCode?: string | number;
    ResultDesc?: string;
    errorMessage?: string;
  };
  const desc = body.ResultDesc || body.errorMessage || "";
  if (/process/i.test(desc)) return { status: "pending", detail: "Waiting for the M-Pesa PIN." };
  const code = body.ResultCode === undefined ? "" : String(body.ResultCode);
  if (code === "0") return { status: "paid", detail: "Payment received.", receipt: checkoutRequestId };
  if (!code) return { status: "pending", detail: "Waiting for the M-Pesa PIN." };
  return { status: "failed", detail: desc || "The M-Pesa payment did not go through." };
}
