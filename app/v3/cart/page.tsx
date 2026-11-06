"use client";
import Link from "next/link";
import { fa, useCartView } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import { B, btn, Photo } from "../_ui";

export default function V3Cart() {
  const { rows, total, count, empty, inc, dec, remove, clear } = useCartView();
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10">
      <h1 className="mega text-6xl md:text-8xl">سبد<span className="text-[var(--lime)]">/</span>{fa(count)}</h1>
      {empty ? (
        <div className="mt-10 hard p-12 text-center">
          <div className="mega text-4xl">خالیه.</div>
          <Link href={B} className={`${btn} inline-block mt-8`}>برو شاپ</Link>
        </div>
      ) : (
        <div className="mt-10 grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          <div className="border-2 border-[var(--ink)]">
            {rows.map(({ product: p, qty }) => (
              <div key={p.id} className="flex gap-4 p-3 border-b-2 last:border-b-0 border-[var(--ink)]">
                <Photo p={p} className="w-24 h-24 md:w-28 md:h-28 shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between gap-3">
                    <Link href={`${B}/product/${p.id}`} className="font-black leading-7 hover:text-[var(--lime)]">{p.title}</Link>
                    <span className="font-black whitespace-nowrap text-sm">{fa(p.price * qty)}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex border-2 border-[var(--ink)] font-black">
                      <button aria-label="کم کردن" onClick={() => dec(p, qty)} className="w-9 h-9 hover:bg-[var(--lime)] hover:text-black">−</button>
                      <span className="w-9 h-9 grid place-items-center border-x-2 border-[var(--ink)]">{fa(qty)}</span>
                      <button aria-label="زیاد کردن" onClick={() => inc(p, qty)} className="w-9 h-9 hover:bg-[var(--lime)] hover:text-black">+</button>
                    </div>
                    <button onClick={() => remove(p.id)} className="mono text-xs text-[var(--red)]">حذف ✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hard-lime p-6 lg:sticky lg:top-24">
            <div className="mono text-xs text-[var(--lime)]">Total</div>
            <div className="mega text-4xl mt-2">{formatPrice(total)}</div>
            <div className="text-xs text-[var(--grey)] mt-2">پرداخت آنلاین نداریم. هزینه‌ی پست تلفنی هماهنگ می‌شه.</div>
            <Link href={`${B}/checkout`} className={`${btn} block text-center mt-6`}>ادامه ←</Link>
            <button onClick={clear} className="mono text-xs text-[var(--grey)] mt-5 underline">خالی کردن سبد</button>
          </div>
        </div>
      )}
    </div>
  );
}
