"use client";
import { fa, useCheckout } from "@/lib/shop";
import { formatPrice, CHECKOUT_NOTE } from "@/lib/site";
import { B } from "../_ui";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] text-[var(--stone)]">{label}</span>
      {children}
    </label>
  );
}

export default function V2Checkout() {
  const c = useCheckout(`${B}/success`);
  return (
    <form onSubmit={c.submit} className="mx-auto max-w-7xl px-5 md:px-10 py-14 grid md:grid-cols-12 gap-12">
      <div className="md:col-span-7">
        <div className="latin text-[var(--bronze)]" dir="ltr">Checkout</div>
        <h1 className="serif text-6xl mt-3">اطلاعات ارسال</h1>
        <p className="mt-6 text-[14px] leading-8 text-[var(--stone)] max-w-lg">{CHECKOUT_NOTE}</p>
        <div className="mt-12 grid gap-8">
          <Field label="نام و نام خانوادگی"><input {...c.field("fullname")} autoComplete="name" /></Field>
          <div className="grid sm:grid-cols-2 gap-8">
            <Field label="شماره موبایل"><input {...c.field("phone")} inputMode="numeric" placeholder="09123456789" autoComplete="tel" dir="ltr" /></Field>
            <Field label="کد پستی ۱۰ رقمی"><input {...c.field("postal_code")} inputMode="numeric" autoComplete="postal-code" dir="ltr" /></Field>
          </div>
          <Field label="نشانی"><textarea {...c.field("address")} rows={2} placeholder="شهر، خیابان، کوچه، پلاک، واحد" autoComplete="street-address" /></Field>
          <Field label="یادداشت (اختیاری)"><textarea {...c.field("note")} rows={1} placeholder="آیدی تلگرام، ساعت مناسب تماس…" /></Field>
        </div>
      </div>
      <aside className="md:col-span-5">
        <div className="bg-[var(--tile)] p-7 md:sticky md:top-24">
          <div className="latin text-[var(--stone)]" dir="ltr">Your order</div>
          <div className="mt-4">
            {c.rows.map(({ product: p, qty }) => (
              <div key={p.id} className="flex justify-between gap-4 py-3 border-b rule text-[14px]">
                <span><span className="serif text-xl">{p.title}</span> <span className="text-[var(--stone)]">× {fa(qty)}</span></span>
                <span className="whitespace-nowrap">{fa(p.price * qty)}</span>
              </div>
            ))}
            {c.empty && <div className="py-3 text-[14px] text-[var(--stone)]">سبد خالی است.</div>}
          </div>
          <div className="flex justify-between mt-5 serif text-2xl"><span>مبلغ کل</span><span>{formatPrice(c.total)}</span></div>
          {c.error && <div className="mt-5 text-[13px] text-[#9b2c1f] border-r-2 border-[#9b2c1f] pr-3">{c.error}</div>}
          <button type="submit" disabled={!c.canSubmit} className="btn w-full mt-7">{c.busy ? "در حال ثبت…" : "ثبت سفارش"}</button>
        </div>
      </aside>
    </form>
  );
}
