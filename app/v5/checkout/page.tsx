"use client";
import { fa, useCheckout } from "@/lib/shop";
import { formatPrice, CHECKOUT_NOTE } from "@/lib/site";
import { B } from "../_ui";

export default function V5Checkout() {
  const c = useCheckout(`${B}/success`);
  const L = "grid gap-1.5 text-sm text-[var(--dim)]";
  return (
    <form onSubmit={c.submit} className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">ثبت سفارش</h1>
      <div className="mt-5 glass rounded-2xl p-4 text-sm leading-7 text-[var(--dim)] flex gap-3"><span className="w-1 rounded-full grad shrink-0" />{CHECKOUT_NOTE}</div>
      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="glass rounded-3xl p-5 md:p-7 grid gap-4">
          <div className="font-semibold">اطلاعات ارسال</div>
          <label className={L}>نام و نام خانوادگی *<input {...c.field("fullname")} placeholder="مثلاً علی رضایی" autoComplete="name" /></label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className={L}>شماره موبایل *<input {...c.field("phone")} inputMode="numeric" placeholder="09123456789" autoComplete="tel" dir="ltr" /></label>
            <label className={L}>کد پستی (۱۰ رقم) *<input {...c.field("postal_code")} inputMode="numeric" placeholder="1234567890" autoComplete="postal-code" dir="ltr" /></label>
          </div>
          <label className={L}>نشانی *<textarea {...c.field("address")} rows={3} placeholder="شهر، خیابان، کوچه، پلاک، واحد" autoComplete="street-address" /></label>
          <label className={L}>توضیحات (اختیاری)<textarea {...c.field("note")} rows={2} placeholder="آیدی تلگرام یا ساعت مناسب تماس" /></label>
        </div>
        <div className="glass gborder rounded-3xl p-6 lg:sticky lg:top-24">
          <div className="text-sm text-[var(--dim)]">سفارش شما · {fa(c.rows.length)} مدل</div>
          <div className="mt-3 divide-y divide-[var(--edge)]">
            {c.rows.map(({ product: p, qty }) => (
              <div key={p.id} className="flex justify-between gap-3 py-2.5 text-sm">
                <span>{p.title} <span className="text-[var(--dim)] num">× {fa(qty)}</span></span>
                <span className="num whitespace-nowrap">{fa(p.price * qty)}</span>
              </div>
            ))}
            {c.empty && <div className="py-2.5 text-sm text-[var(--dim)]">سبد خالی است.</div>}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-[var(--edge)] text-xl font-bold"><span>مبلغ کل</span><span className="num">{formatPrice(c.total)}</span></div>
          {c.error && <div className="mt-4 rounded-xl border border-[#ff7a90]/40 bg-[#ff7a90]/10 text-[#ffb3c0] p-3 text-sm">{c.error}</div>}
          <button type="submit" disabled={!c.canSubmit} className="btn w-full mt-6">{c.busy ? "در حال ثبت…" : "ثبت نهایی سفارش"}</button>
        </div>
      </div>
    </form>
  );
}
