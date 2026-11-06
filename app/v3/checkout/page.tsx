"use client";
import { fa, useCheckout } from "@/lib/shop";
import { formatPrice, CHECKOUT_NOTE } from "@/lib/site";
import { B, btn } from "../_ui";

export default function V3Checkout() {
  const c = useCheckout(`${B}/success`);
  const L = "grid gap-2 text-xs mono text-[var(--grey)]";
  return (
    <form onSubmit={c.submit} className="mx-auto max-w-[1400px] px-4 py-10">
      <h1 className="mega text-6xl md:text-8xl">آدرس<span className="text-[var(--lime)]">.</span></h1>
      <div className="mt-6 border-r-4 border-[var(--lime)] pr-4 text-sm leading-8 text-[var(--grey)] max-w-3xl">{CHECKOUT_NOTE}</div>
      <div className="mt-10 grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="grid gap-5">
          <label className={L}>01 — اسم کامل *<input {...c.field("fullname")} autoComplete="name" placeholder="سارا محمدی" /></label>
          <div className="grid sm:grid-cols-2 gap-5">
            <label className={L}>02 — موبایل *<input {...c.field("phone")} inputMode="numeric" placeholder="09123456789" autoComplete="tel" dir="ltr" /></label>
            <label className={L}>03 — کد پستی (۱۰ رقم) *<input {...c.field("postal_code")} inputMode="numeric" placeholder="1234567890" autoComplete="postal-code" dir="ltr" /></label>
          </div>
          <label className={L}>04 — آدرس *<textarea {...c.field("address")} rows={3} placeholder="شهر، خیابان، کوچه، پلاک" autoComplete="street-address" /></label>
          <label className={L}>05 — توضیحات<textarea {...c.field("note")} rows={2} placeholder="آیدی تلگرام، ساعت تماس…" /></label>
        </div>
        <div className="hard-lime p-6 lg:sticky lg:top-24">
          <div className="mono text-xs text-[var(--lime)]">Order — {fa(c.rows.length)} items</div>
          <div className="mt-4">
            {c.rows.map(({ product: p, qty }) => (
              <div key={p.id} className="flex justify-between gap-3 py-2 border-b border-dashed border-[var(--grey)] text-sm font-bold">
                <span>{p.title} ×{fa(qty)}</span><span className="whitespace-nowrap">{fa(p.price * qty)}</span>
              </div>
            ))}
            {c.empty && <div className="text-sm text-[var(--grey)]">سبد خالیه.</div>}
          </div>
          <div className="mt-4 flex justify-between mega text-2xl"><span>جمع</span><span>{formatPrice(c.total)}</span></div>
          {c.error && <div className="mt-4 bg-[var(--red)] text-white font-bold text-sm p-3">{c.error}</div>}
          <button type="submit" disabled={!c.canSubmit} className={`${btn} w-full mt-6 text-lg`}>{c.busy ? "صبر کن…" : "ثبت سفارش ✓"}</button>
        </div>
      </div>
    </form>
  );
}
