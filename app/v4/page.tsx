"use client";
import { useState } from "react";
import { CATEGORIES, useAddToCart, useProducts } from "@/lib/shop";
import SockArt from "@/components/SockArt";
import { Card, SOCK_COLORS } from "./_ui";

const ICONS: Record<string, string> = { all: "🧺", men: "🧔", women: "👩", kids: "🧒" };

export default function V4Home() {
  const [cat, setCat] = useState("all");
  const { data, loading } = useProducts(cat);
  const { add, justAdded } = useAddToCart();

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="mt-6 rounded-[36px] bg-[var(--terra)] text-[var(--paper)] stitch-light overflow-hidden relative">
        <div className="grid md:grid-cols-2 items-center gap-6 p-8 md:p-14">
          <div>
            <span className="tag text-[var(--ink)] text-xs font-bold inline-block">زمستان نزدیک است ❄</span>
            <h1 className="hand text-5xl md:text-[68px] leading-[1.25] mt-5">گرمای خانه،<br />برای پاهای شما</h1>
            <p className="mt-4 leading-8 max-w-md opacity-90">جوراب‌های نرم و گرم برای همه‌ی خانواده. انتخاب کنید و نشانی بدهید؛ ما با حوصله می‌بندیم و با پست می‌فرستیم.</p>
            <a href="#shop" className="btn btn-forest inline-block mt-7">دیدن جوراب‌ها</a>
          </div>
          <div className="relative h-64 md:h-80">
            <div className="absolute inset-6 rounded-full bg-[var(--mustard)] opacity-90" />
            <SockArt seed={2} colors={SOCK_COLORS} className="float absolute inset-0 w-full h-full" />
          </div>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[["🧶", "نرم و نفس‌کش", "نخ پنبه و پشم با کیفیت"], ["📦", "بسته‌بندی با حوصله", "آخر هر روز به پست می‌سپاریم"], ["☎️", "هماهنگی تلفنی", "بدون پرداخت آنلاین"]].map(([i, t, d]) => (
          <div key={t} className="soft-card p-5 flex gap-4 items-center">
            <span className="text-3xl">{i}</span>
            <span><span className="hand text-lg block">{t}</span><span className="text-sm text-[var(--soft)]">{d}</span></span>
          </div>
        ))}
      </section>

      <section id="shop" className="mt-16 scroll-mt-24">
        <div className="text-center">
          <h2 className="hand text-4xl md:text-5xl">سبد جوراب‌ها</h2>
          <p className="text-[var(--soft)] mt-2">برای کی جوراب می‌خواهید؟</p>
          <div className="mt-6 flex justify-center gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCat(c.value)}
                className={`rounded-full px-5 py-2.5 font-bold text-sm transition ${cat === c.value ? "bg-[var(--ink)] text-[var(--paper)]" : "bg-[var(--paper)] hover:bg-white"}`}>
                {ICONS[c.value]} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {loading && data.length === 0
            ? Array.from({ length: 8 }, (_, i) => <div key={i} className="soft-card aspect-[3/4] animate-pulse" />)
            : data.map((p) => <Card key={p.id} p={p} onAdd={() => add(p.id)} added={justAdded === p.id} />)}
        </div>
        {!loading && data.length === 0 && <div className="soft-card p-12 text-center hand text-2xl">در این دسته هنوز چیزی نبافته‌ایم!</div>}
      </section>
    </div>
  );
}
