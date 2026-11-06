"use client";
import Link from "next/link";
import { fa, useCartView } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import SockArt from "@/components/SockArt";
import { B, Photo, SOCK_COLORS } from "../_ui";

export default function V1Cart() {
  const { rows, total, empty, loading, inc, dec, remove, clear } = useCartView();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="display text-5xl">سبد خرید</h1>
      <p className="mt-2 text-sm font-bold text-[var(--muted)] leading-7">پرداخت آنلاین نداریم. در مرحله‌ی بعد فاکتور را می‌بینید و آدرس می‌دهید تا با پست بفرستیم.</p>

      {empty ? (
        <div className="mt-8 chunky rounded-[36px] bg-white p-10 text-center">
          <SockArt seed={2} colors={SOCK_COLORS} variant="bold" line="#2b1b3d" className="w-32 mx-auto" />
          <div className="display text-3xl mt-3">سبد خالیه!</div>
          <Link href={B} className="inline-block mt-5 chunky press rounded-full bg-[var(--orange)] text-white px-7 py-3 font-black">بریم جوراب ببینیم</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_300px] items-start">
          <div className="space-y-4">
            {loading && rows.length === 0 && <div className="chunky rounded-3xl bg-white h-28 animate-pulse" />}
            {rows.map(({ product: p, qty }) => (
              <div key={p.id} className="chunky-sm rounded-3xl bg-white p-3 flex gap-3 items-center">
                <Photo p={p} className="w-20 h-20 rounded-2xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`${B}/product/${p.id}`} className="font-black leading-7 line-clamp-1">{p.title}</Link>
                  <div className="text-sm font-bold text-[var(--orange)]">{formatPrice(p.price)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button aria-label="کم کردن" onClick={() => dec(p, qty)} className="chunky-sm rounded-full w-8 h-8 bg-[var(--pink)] font-black">−</button>
                    <span className="display text-xl w-7 text-center">{fa(qty)}</span>
                    <button aria-label="زیاد کردن" onClick={() => inc(p, qty)} className="chunky-sm rounded-full w-8 h-8 bg-[var(--mint)] font-black">+</button>
                    <button onClick={() => remove(p.id)} className="mr-auto text-xs font-bold underline text-[var(--muted)]">حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="chunky rounded-[28px] bg-[var(--lemon)] p-5 md:sticky md:top-24">
            <div className="font-black">جمع فاکتور</div>
            <div className="display text-3xl mt-1">{formatPrice(total)}</div>
            <div className="text-xs font-bold mt-1 opacity-70">هزینه‌ی ارسال تلفنی هماهنگ می‌شود.</div>
            <Link href={`${B}/checkout`} className="block text-center mt-4 chunky press rounded-2xl bg-[var(--ink)] text-white py-3 font-black">ادامه و ثبت آدرس ←</Link>
            <button onClick={clear} className="w-full mt-3 text-xs font-bold underline">خالی کردن سبد</button>
          </div>
        </div>
      )}
    </div>
  );
}
