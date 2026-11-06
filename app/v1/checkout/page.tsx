"use client";
import { fa, useCheckout } from "@/lib/shop";
import { formatPrice, CHECKOUT_NOTE } from "@/lib/site";
import { B, Btn } from "../_ui";

export default function V1Checkout() {
  const c = useCheckout(`${B}/success`);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="display text-5xl">آخرین قدم!</h1>
      <div className="mt-4 chunky-sm rounded-3xl bg-[var(--sky)] p-4 text-sm font-bold leading-8">📮 {CHECKOUT_NOTE}</div>

      <form onSubmit={c.submit} className="mt-8 grid gap-8 md:grid-cols-[1fr_340px] items-start">
        <div className="chunky rounded-[32px] bg-white p-5 md:p-7 grid gap-4">
          <div className="display text-2xl">کجا بفرستیم؟</div>
          <label className="grid gap-1.5 text-sm font-black">نام و نام خانوادگی *<input {...c.field("fullname")} placeholder="مثلاً سارا محمدی" autoComplete="name" /></label>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="grid gap-1.5 text-sm font-black">شماره موبایل *<input {...c.field("phone")} inputMode="numeric" placeholder="09123456789" autoComplete="tel" dir="ltr" /></label>
            <label className="grid gap-1.5 text-sm font-black">کد پستی (۱۰ رقم) *<input {...c.field("postal_code")} inputMode="numeric" placeholder="1234567890" autoComplete="postal-code" dir="ltr" /></label>
          </div>
          <label className="grid gap-1.5 text-sm font-black">آدرس کامل *<textarea {...c.field("address")} rows={3} placeholder="شهر، خیابان، کوچه، پلاک، واحد" autoComplete="street-address" /></label>
          <label className="grid gap-1.5 text-sm font-black">توضیحات (اختیاری)<textarea {...c.field("note")} rows={2} placeholder="مثلاً آیدی تلگرام یا ساعت تماس" /></label>
        </div>

        <div className="chunky rounded-[32px] bg-[var(--lemon)] p-5 md:sticky md:top-24">
          <div className="display text-2xl">فاکتور ({fa(c.rows.length)} مدل)</div>
          <div className="mt-3 divide-y-2 divide-dashed divide-[var(--ink)]/30">
            {c.rows.map(({ product: p, qty }) => (
              <div key={p.id} className="py-2 flex justify-between gap-2 text-sm font-bold">
                <span>{p.title} × {fa(qty)}</span>
                <span className="whitespace-nowrap">{fa(p.price * qty)}</span>
              </div>
            ))}
            {c.empty && <div className="py-3 text-sm font-bold">سبد خالی است.</div>}
          </div>
          <div className="mt-3 pt-3 border-t-[3px] border-[var(--ink)] flex justify-between display text-2xl"><span>جمع</span><span>{formatPrice(c.total)}</span></div>
          {c.error && <div className="mt-3 rounded-2xl bg-white border-2 border-red-500 text-red-700 p-3 text-sm font-bold">{c.error}</div>}
          <Btn type="submit" disabled={!c.canSubmit} className="w-full mt-4 bg-[var(--orange)] text-white text-lg">{c.busy ? "در حال ثبت…" : "ثبت سفارش ✓"}</Btn>
        </div>
      </form>
    </div>
  );
}
