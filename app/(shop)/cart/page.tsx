"use client";
import Link from "next/link";
import { fa, useCartView } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import SockArt from "@/components/SockArt";
import { B, Photo, SOCK_COLORS } from "../_ui";

export default function ShopCart() {
  const { rows, total, count, empty, inc, dec, remove, clear } = useCartView();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="hand text-5xl">سبد شما</h1>
      <p className="text-[var(--soft)] mt-2 text-sm leading-7">پرداخت آنلاین نداریم. در مرحله‌ی بعد نشانی را می‌گیریم و برای هماهنگی تماس می‌گیریم.</p>
      {empty ? (
        <div className="mt-8 soft-card p-10 text-center">
          <SockArt seed={5} colors={SOCK_COLORS} className="w-36 mx-auto" />
          <div className="hand text-3xl mt-2">سبدتان هنوز خالی است</div>
          <Link href="/" className="btn inline-block mt-6">بریم جوراب ببینیم</Link>
        </div>
      ) : (
        <div className="mt-8 grid md:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-3">
            {rows.map(({ product: p, qty }) => (
              <div key={p.id} className="soft-card p-3 flex gap-4 items-center">
                <Photo p={p} className="w-20 h-20 md:w-24 md:h-24 rounded-[18px] shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`${B}/product/${p.id}`} className="hand text-xl leading-8 line-clamp-1">{p.title}</Link>
                  <div className="text-sm text-[var(--soft)]">{formatPrice(p.price)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center rounded-full bg-[var(--bg)] p-1">
                      <button aria-label="کم کردن" onClick={() => dec(p, qty)} className="w-8 h-8 rounded-full bg-white font-black">−</button>
                      <span className="w-8 text-center font-black">{fa(qty)}</span>
                      <button aria-label="زیاد کردن" onClick={() => inc(p, qty)} className="w-8 h-8 rounded-full bg-white font-black">+</button>
                    </div>
                    <button onClick={() => remove(p.id)} className="mr-auto text-xs font-bold text-[var(--terra)]">برداشتن</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="soft-card p-6 md:sticky md:top-28">
            <div className="hand text-2xl">صورت‌حساب</div>
            <div className="flex justify-between mt-4 text-sm"><span>{fa(count)} جفت جوراب</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between mt-1 text-sm text-[var(--soft)]"><span>ارسال</span><span>هماهنگی تلفنی</span></div>
            <div className="my-4 knit !h-2.5" style={{ ["--c" as string]: "#e3d6c2" }} />
            <div className="flex justify-between font-black text-lg"><span>جمع</span><span>{formatPrice(total)}</span></div>
            <Link href={`${B}/checkout`} className="btn block text-center mt-5">ادامه و ثبت نشانی</Link>
            <button onClick={clear} className="w-full mt-4 text-xs text-[var(--soft)] underline">خالی کردن سبد</button>
          </div>
        </div>
      )}
    </div>
  );
}
