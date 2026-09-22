export const SHOP_PHONE =
  process.env.NEXT_PUBLIC_SHOP_PHONE || "0912-000-0000";
export const TELEGRAM_CHANNEL =
  process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || "https://t.me/your_channel";

export const POST_EXPLAINER =
  "سفارش شما ثبت شد! پرداخت آنلاین نداریم — ما در پایان روز سفارش‌ها را با پست ارسال می‌کنیم و برای هماهنگی هزینه و ارسال با شما تماس می‌گیریم. لطفاً تلفن‌تان در دسترس باشد.";

export function formatPrice(n: number): string {
  return n.toLocaleString("fa-IR") + " تومان";
}
