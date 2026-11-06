"use client";
import { useState } from "react";
import { CATEGORIES, fa, useAddToCart, useProducts } from "@/lib/shop";
import SockArt from "@/components/SockArt";
import { Card, SOCK_COLORS, Ticker } from "./_ui";

export default function V3Home() {
  const [cat, setCat] = useState("all");
  const { data, loading } = useProducts(cat);
  const { add, justAdded } = useAddToCart();

  return (
    <div>
      <section className="relative border-b-2 border-[var(--ink)] overflow-hidden noise">
        <div className="mx-auto max-w-[1400px] px-4 pt-10 pb-6 md:pt-16 grid md:grid-cols-[1.4fr_1fr] gap-6 items-end">
          <div>
            <div className="mono text-xs text-[var(--lime)]">● Drop 01 — Live now</div>
            <h1 className="mega text-[72px] sm:text-[110px] md:text-[150px] mt-2">
              پاها
              <br /><span className="text-[var(--lime)]">بالا.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-8 font-medium text-[var(--grey)]">
              جوراب برای کسایی که پاشون رو نشون می‌دن. اسپرت، رنگی، بی‌خیال. سفارش بده، زنگ می‌زنیم، پست می‌کنیم.
            </p>
            <a href="#drop" className="slam inline-block mt-8 bg-[var(--lime)] text-black font-black px-8 py-4 text-lg">ببین چی داریم ↓</a>
          </div>
          <div className="relative h-72 md:h-[440px]">
            <div className="absolute inset-x-6 bottom-0 top-10 stripes opacity-30" />
            <SockArt seed={0} colors={SOCK_COLORS} variant="bold" line="#c6ff00" className="absolute inset-0 w-full h-full drop-shadow-[0_0_40px_rgba(198,255,0,.25)]" />
            <div className="absolute top-2 left-0 bg-[var(--red)] text-white mega text-lg px-3 py-1 rotate-6" dir="ltr">NEW</div>
          </div>
        </div>
      </section>
      <Ticker text="مردانه / زنانه / بچگانه — ارسال پستی — بدون پرداخت آنلاین" className="py-3 font-black text-[var(--bg)] bg-[var(--ink)] border-b-2 border-[var(--ink)]" />

      <section id="drop" className="mx-auto max-w-[1400px] px-4 mt-14 scroll-mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="mega text-5xl md:text-7xl">دراپ<span className="text-[var(--lime)]">.</span></h2>
          <div className="flex border-2 border-[var(--ink)] font-black text-sm">
            {CATEGORIES.map((c, i) => (
              <button key={c.value} onClick={() => setCat(c.value)}
                className={`px-4 md:px-6 py-3 ${i ? "border-r-2 border-[var(--ink)]" : ""} ${cat === c.value ? "bg-[var(--lime)] text-black" : "hover:bg-[var(--panel)]"}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mono text-xs text-[var(--grey)] mt-3">{loading ? "loading…" : `${fa(data.length)} items`}</div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pt-[2px] pr-[2px]">
          {loading && data.length === 0
            ? Array.from({ length: 8 }, (_, i) => <div key={i} className="border-2 border-[var(--ink)] -mt-[2px] -mr-[2px] aspect-[3/4] bg-[var(--panel)] animate-pulse" />)
            : data.map((p, i) => <Card key={p.id} p={p} i={i} onAdd={() => add(p.id)} added={justAdded === p.id} />)}
        </div>
        {!loading && data.length === 0 && <div className="hard p-12 text-center mega text-3xl">فعلاً خالیه. به‌زودی دراپ بعدی.</div>}
      </section>
    </div>
  );
}
