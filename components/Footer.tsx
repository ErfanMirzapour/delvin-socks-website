import { SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-[#171310] text-[#F7EDDE]">
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-3 text-sm leading-8">
        <div>
          <div className="text-lg font-black mb-2">🧦 جوراب‌فروشی</div>
          <p className="opacity-80">
            مردانه، زنانه، بچگانه — بدون پرداخت آنلاین. ثبت سفارش کنید، ما با پست می‌فرستیم.
          </p>
        </div>
        <div>
          <div className="font-bold mb-2">تماس</div>
          <div>تلفن: <a className="underline" href={`tel:${SHOP_PHONE}`}>{SHOP_PHONE}</a></div>
          <div>
            تلگرام:{" "}
            <a className="underline" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">
              کانال تلگرام ما
            </a>
          </div>
        </div>
        <div>
          <div className="font-bold mb-2">راهنما</div>
          <div>اگر موجودی تمام شده باشد روی محصول «ناموجود» می‌بینید.</div>
          <div>هزینه ارسال پس از تماس هماهنگ می‌شود.</div>
        </div>
      </div>
    </footer>
  );
}
