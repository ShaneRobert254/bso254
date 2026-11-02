export function kes(amount: number) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function clock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export const PREVIEW_SECONDS = 24;
