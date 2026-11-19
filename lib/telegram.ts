import type { Order } from "./db";
import { secret } from "./db";

export function telegramConfigured(): boolean {
  return Boolean(
    secret("TELEGRAM_NOTIFICATIONS_ENABLED") === "true" &&
      secret("TELEGRAM_BOT_TOKEN") &&
      secret("TELEGRAM_CHAT_ID")
  );
}

export async function notifyTelegram(order: Order): Promise<boolean> {
  // NODE_ENV is also production in local builds and hosted previews.
  // Require an explicit opt-in in each deployment instead.
  if (!telegramConfigured()) return false;
  const token = secret("TELEGRAM_BOT_TOKEN");
  const chatId = secret("TELEGRAM_CHAT_ID");
  if (!token || !chatId) return false;
  const lines = order.items.map(
    (it, i) =>
      `${(i + 1).toLocaleString("fa-IR")}. ${it.title} × ${it.qty.toLocaleString(
        "fa-IR"
      )} — ${(it.price * it.qty).toLocaleString("fa-IR")} تومان`
  );
  const text = [
    `🧦 سفارش جدید #${order.id}`,
    `👤 ${order.fullname}`,
    `📞 ${order.phone}`,
    `📮 کدپستی: ${order.postal_code}`,
    `📍 ${order.address}`,
    order.note ? `📝 ${order.note}` : null,
    ``,
    ...lines,
    ``,
    `💰 جمع: ${order.total.toLocaleString("fa-IR")} تومان`,
    `🕐 ${order.created_at}`,
  ]
    .filter(Boolean)
    .join("\n");
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
