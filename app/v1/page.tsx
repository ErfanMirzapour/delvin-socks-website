"use client";
import { useState } from "react";
import { CATEGORIES, useAddToCart, useProducts } from "@/lib/shop";
import SockArt from "@/components/SockArt";
import { Card, SOCK_COLORS } from "./_ui";

const CAT_COLORS: Record<string, string> = { all: "var(--lemon)", men: "var(--sky)", women: "var(--pink)", kids: "var(--mint)" };

export default function V1Home() {
  const [cat, setCat] = useState("all");
  const { data, loading } = useProducts(cat);
  const { add, justAdded } = useAddToCart();

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="relative mt-6 chunky rounded-[36px] bg-[var(--orange)] overflow-hidden">
        <div className="grid md:grid-cols-[1.2fr_1fr] items-center gap-4 p-7 md:p-12">
          <div className="text-white relative z-10">
            <span className="inline-block rotate-[-3deg] bg-[var(--lemon)] text-[var(--ink)] chunky-sm rounded-full px-4 py-1 text-sm font-black">✦ هر روز با پست</span>
            <h1 className="display text-5xl md:text-7xl leading-[1.15] mt-4 text-[var(--ink)]">
              پاهات رو<br />
              <span className="text-white [text-shadow:3px_3px_0_var(--ink)]">شاد کن!</span>
            </h1>
            <p className="mt-4 max-w-md leading-8 font-bold text-[var(--ink)]">جوراب‌های رنگی، نرم و بامزه برای آقایان، خانم‌ها و بچه‌ها. سفارش بدهید، ما با پست می‌فرستیم.</p>
            <a href="#shop" className="inline-block mt-6 chunky press rounded-full bg-white text-[var(--ink)] px-7 py-3 font-black">بریم خرید ↓</a>
          </div>
          <div className="relative h-64 md:h-80">
            <div className="absolute inset-4 blob bg-[var(--pink)] border-[3px] border-[var(--ink)]" />
            <SockArt seed={0} colors={SOCK_COLORS} variant="bold" line="#2b1b3d" className="absolute w-48 md:w-64 right-0 top-0 rotate-[-12deg]" />
            <SockArt seed={5} colors={SOCK_COLORS} variant="bold" line="#2b1b3d" className="absolute w-40 md:w-52 left-2 bottom-0 rotate-[14deg]" />
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm font-black">
        {["🧦 نخ نرم و باکیفیت", "📦 ارسال پستی", "📞 هماهنگی تلفنی"].map((t, i) => (
          <div key={t} className="chunky-sm rounded-2xl bg-white px-2 py-3" style={{ transform: `rotate(${[-1.5, 1, -0.5][i]}deg)` }}>{t}</div>
        ))}
      </div>

      <section id="shop" className="mt-14 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-4xl">جوراب‌ها</h2>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCat(c.value)}
                className={`chunky-sm press rounded-full px-5 py-2 font-black text-sm ${cat === c.value ? "" : "bg-white"}`}
                style={cat === c.value ? { background: CAT_COLORS[c.value] } : undefined}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading && data.length === 0
            ? Array.from({ length: 8 }, (_, i) => <div key={i} className="chunky rounded-[28px] bg-white aspect-[3/4] animate-pulse" />)
            : data.map((p) => <Card key={p.id} p={p} onAdd={() => add(p.id)} added={justAdded === p.id} />)}
        </div>
        {!loading && data.length === 0 && (
          <div className="chunky rounded-[28px] bg-white p-10 text-center font-bold">فعلاً جورابی در این دسته نداریم. به‌زودی!</div>
        )}
      </section>
    </div>
  );
}
