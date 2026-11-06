"use client";
import { fa, useCheckout } from "@/lib/shop";
import { formatPrice, CHECKOUT_NOTE } from "@/lib/site";
import { B } from "../_ui";

export default function ShopCheckout() {
  const c = useCheckout(`${B}/success`);
  const L = "grid gap-1.5 text-sm font-bold";
  return (
    <form onSubmit={c.submit} className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="hand text-5xl">نشانی‌تان را بنویسید</h1>
      <div className="mt-5 rounded-[22px] bg-[var(--mustard)]/30 p-4 text-sm leading-8">✉️ {CHECKOUT_NOTE}</div>
      <div className="mt-8 grid md:grid-cols-[1fr_330px] gap-6 items-start">
        <div className="soft-card p-5 md:p-7 grid gap-4">
          <label className={L}>نام و نام خانوادگی *<input {...c.field("fullname")} placeholder="مثلاً مریم احمدی" autoComplete="name" /></label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className={L}>شماره موبایل *<input {...c.field("phone")} inputMode="numeric" placeholder="09123456789" autoComplete="tel" dir="ltr" /></label>
            <label className={L}>کد پستی ۱۰ رقمی *<input {...c.field("postal_code")} inputMode="numeric" placeholder="1234567890" autoComplete="postal-code" dir="ltr" /></label>
          </div>
          <label className={L}>نشانی کامل *<textarea {...c.field("address")} rows={3} placeholder="شهر، خیابان، کوچه، پلاک، واحد" autoComplete="street-address" /></label>
          <label className={L}>یادداشت برای ما (اختیاری)<textarea {...c.field("note")} rows={2} placeholder="آیدی تلگرام، ساعت مناسب تماس…" /></label>
        </div>
        <div className="soft-card p-6 md:sticky md:top-28">
          <div className="hand text-2xl">صورت‌حساب ({fa(c.rows.length)} مدل)</div>
          <div className="mt-3">
            {c.rows.map(({ product: p, qty }) => (
              <div key={p.id} className="flex justify-between gap-3 py-2 text-sm border-b border-dashed border-[#e3d6c2]">
                <span>{p.title} <span className="text-[var(--soft)]">× {fa(qty)}</span></span>
                <span className="font-bold whitespace-nowrap">{fa(p.price * qty)}</span>
              </div>
            ))}
            {c.empty && <div className="text-sm text-[var(--soft)] py-2">سبد خالی است.</div>}
          </div>
          <div className="flex justify-between font-black text-lg mt-4"><span>جمع</span><span>{formatPrice(c.total)}</span></div>
          {c.error && <div className="mt-4 rounded-2xl bg-[#f6d5cb] text-[#8f2f17] p-3 text-sm font-bold">{c.error}</div>}
          <button type="submit" disabled={!c.canSubmit} className="btn w-full mt-5 text-lg">{c.busy ? "در حال ثبت…" : "ثبت سفارش ✓"}</button>
        </div>
      </div>
    </form>
  );
}
