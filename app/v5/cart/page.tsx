"use client";
import Link from "next/link";
import { fa, useCartView } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import { B, Photo } from "../_ui";

export default function V5Cart() {
  const { rows, total, count, empty, inc, dec, remove, clear } = useCartView();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold">سبد خرید <span className="text-[var(--dim)] text-2xl font-normal num">({fa(count)})</span></h1>
      {empty ? (
        <div className="mt-10 glass rounded-3xl p-14 text-center">
          <div className="text-xl font-semibold">سبد شما خالی است</div>
          <div className="text-[var(--dim)] mt-2 text-sm">محصولات را ببینید و مدل دلخواه را اضافه کنید.</div>
          <Link href={B} className="btn inline-block mt-6">مشاهده‌ی محصولات</Link>
        </div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="glass rounded-3xl divide-y divide-[var(--edge)]">
            {rows.map(({ product: p, qty }) => (
              <div key={p.id} className="p-4 flex gap-4 items-center">
                <Photo p={p} className="w-20 h-20 rounded-2xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`${B}/product/${p.id}`} className="font-medium leading-7 line-clamp-1 hover:underline">{p.title}</Link>
                  <div className="text-sm text-[var(--dim)] num">{formatPrice(p.price)}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center glass rounded-xl">
                    <button aria-label="کم کردن" onClick={() => dec(p, qty)} className="w-9 h-9 text-[var(--dim)] hover:text-white">−</button>
                    <span className="w-6 text-center num">{fa(qty)}</span>
                    <button aria-label="زیاد کردن" onClick={() => inc(p, qty)} className="w-9 h-9 text-[var(--dim)] hover:text-white">+</button>
                  </div>
                  <button onClick={() => remove(p.id)} className="text-xs text-[var(--dim)] hover:text-[#ff7a90]">حذف</button>
                </div>
              </div>
            ))}
          </div>
          <div className="glass gborder rounded-3xl p-6 lg:sticky lg:top-24">
            <div className="text-sm text-[var(--dim)]">خلاصه‌ی سفارش</div>
            <div className="flex justify-between mt-4 text-sm"><span className="text-[var(--dim)]">جمع اقلام</span><span className="num">{formatPrice(total)}</span></div>
            <div className="flex justify-between mt-2 text-sm"><span className="text-[var(--dim)]">ارسال</span><span>هماهنگی تلفنی</span></div>
            <div className="flex justify-between mt-4 pt-4 border-t border-[var(--edge)] text-xl font-bold"><span>مبلغ کل</span><span className="num">{formatPrice(total)}</span></div>
            <Link href={`${B}/checkout`} className="btn block text-center mt-6">ادامه‌ی ثبت سفارش</Link>
            <p className="text-xs text-[var(--dim)] mt-3 leading-6">پرداخت آنلاین نداریم؛ پس از ثبت، برای هماهنگی تماس می‌گیریم.</p>
            <button onClick={clear} className="text-xs text-[var(--dim)] underline mt-2">خالی کردن سبد</button>
          </div>
        </div>
      )}
    </div>
  );
}
