import { kes } from "@/lib/format";
import type { Order } from "@/lib/store";

export function orderMessage(order: Pick<Order, "id" | "name" | "email" | "phone" | "city" | "address" | "lines" | "total" | "note">) {
  const items = order.lines
    .map((line) => `- ${line.title}${line.size ? ` size ${line.size}` : ""}${line.qty > 1 ? ` x${line.qty}` : ""} — ${kes(line.price * line.qty)}`)
    .join("\n");
  return [
    `BSO254 order ${order.id}`,
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    order.email ? `Email: ${order.email}` : "",
    `City: ${order.city}`,
    `Address: ${order.address}`,
    "",
    "I want:",
    items,
    `Total: ${kes(order.total)}`,
    order.note ? `Note: ${order.note}` : "",
    "",
    "Please send the payment details.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}
