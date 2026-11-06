"use client";
import Link from "next/link";
import { categoryFa } from "@/lib/catalog";
import { fa, useCartView } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import { B, Photo } from "../_ui";

export default function V2Cart() {
  const { rows, total, count, empty, inc, dec, remove, clear } = useCartView();

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-10 py-14">
      <h1 className="serif text-6xl">سبد خرید</h1>
      <div className="text-[13px] text-[var(--stone)] mt-2">{fa(count)} جفت</div>

      {empty ? (
        <div className="py-24 text-center border-t rule mt-10">
          <div className="serif text-3xl">سبد شما خالی است.</div>
          <Link href={B} className="btn inline-block mt-8">دیدن مجموعه</Link>
        </div>
      ) : (
        <div className="mt-10 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-8 border-t rule">
            {rows.map(({ product: p, qty }) => (
              <div key={p.id} className="py-6 border-b rule flex gap-5">
                <Link href={`${B}/product/${p.id}`} className="w-24 md:w-32 shrink-0 bg-[var(--tile)]"><Photo p={p} className="w-full aspect-[4/5]" /></Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <div className="text-[12px] text-[var(--stone)]">{categoryFa(p.category)}</div>
                      <div className="serif text-2xl leading-8">{p.title}</div>
                    </div>
                    <div className="text-[14px] whitespace-nowrap">{formatPrice(p.price * qty)}</div>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between text-[13px]">
                    <div className="flex items-center border rule">
                      <button aria-label="کم کردن" onClick={() => dec(p, qty)} className="w-9 h-9">−</button>
                      <span className="w-8 text-center">{fa(qty)}</span>
                      <button aria-label="زیاد کردن" onClick={() => inc(p, qty)} className="w-9 h-9">+</button>
                    </div>
                    <button onClick={() => remove(p.id)} className="ulink text-[var(--stone)]">حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="md:col-span-4">
            <div className="bg-[var(--tile)] p-7 md:sticky md:top-24">
              <div className="latin text-[var(--stone)]" dir="ltr">Summary</div>
              <div className="flex justify-between mt-5 text-[14px]"><span>جمع اقلام</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between mt-2 text-[13px] text-[var(--stone)]"><span>ارسال</span><span>تلفنی هماهنگ می‌شود</span></div>
              <div className="flex justify-between mt-5 pt-5 border-t rule serif text-2xl"><span>مبلغ کل</span><span>{formatPrice(total)}</span></div>
              <Link href={`${B}/checkout`} className="btn block text-center mt-7">ادامه‌ی خرید</Link>
              <p className="text-[12px] leading-6 text-[var(--stone)] mt-4">پرداخت آنلاین نداریم. پس از ثبت سفارش تماس می‌گیریم.</p>
              <button onClick={clear} className="ulink text-[12px] text-[var(--stone)] mt-3">خالی کردن سبد</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
