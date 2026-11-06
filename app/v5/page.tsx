"use client";
import { useState } from "react";
import { CATEGORIES, fa, useAddToCart, useProducts } from "@/lib/shop";
import SockArt from "@/components/SockArt";
import { Card, SOCK_COLORS } from "./_ui";

export default function V5Home() {
  const [cat, setCat] = useState("all");
  const { data, loading } = useProducts(cat);
  const { add, justAdded } = useAddToCart();
  const inStockCount = data.filter((p) => p.stock > 0).length;

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="relative pt-14 md:pt-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-[var(--dim)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" /> ارسال پستی فعال است
          </span>
          <h1 className="text-[44px] md:text-[64px] font-bold leading-[1.2] mt-6 tracking-tight">
            جوراب، <span className="grad-text">مهندسی‌شده</span><br />برای هر قدم.
          </h1>
          <p className="mt-5 text-[var(--dim)] leading-8 max-w-md">
            الیاف نفس‌کش، دوخت بی‌درز و اندازه‌ی دقیق. برای آقایان، خانم‌ها و بچه‌ها. سفارش را ثبت کنید؛ ما تماس می‌گیریم و با پست می‌فرستیم.
          </p>
          <div className="mt-8 flex gap-3">
            <a href="#products" className="btn">مشاهده‌ی محصولات</a>
            <a href="#how" className="btn-glass">چطور کار می‌کند؟</a>
          </div>
        </div>
        <div className="relative h-80 md:h-[420px]">
          <div className="absolute inset-0 gridbg" />
          <div className="absolute inset-10 rounded-full border border-dashed border-[var(--edge)] orbit" />
          <div className="absolute inset-20 rounded-full grad opacity-25 blur-3xl" />
          <SockArt seed={0} colors={SOCK_COLORS} variant="flat" className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] drop-shadow-[0_20px_40px_rgba(124,92,255,.45)]" />
          <div className="absolute top-8 left-0 glass rounded-2xl px-3 py-2 text-xs"><div className="text-[var(--dim)]">جنس</div><div className="font-semibold">پنبه + الیاف نفس‌کش</div></div>
          <div className="absolute bottom-10 right-0 glass rounded-2xl px-3 py-2 text-xs"><div className="text-[var(--dim)]">دوخت</div><div className="font-semibold">بی‌درز</div></div>
        </div>
      </section>

      <section id="how" className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-3 scroll-mt-24">
        {[["۰۱", "انتخاب", "مدل و تعداد را به سبد بیفزایید."], ["۰۲", "ثبت", "مشخصات ارسال را وارد کنید. پرداخت آنلاین نداریم."], ["۰۳", "تحویل", "تماس می‌گیریم و همان روز به پست می‌سپاریم."]].map(([n, t, d]) => (
          <div key={n} className="glass rounded-2xl p-5">
            <div className="grad-text font-bold num">{n}</div>
            <div className="font-semibold mt-2">{t}</div>
            <div className="text-sm text-[var(--dim)] mt-1 leading-7">{d}</div>
          </div>
        ))}
      </section>

      <section id="products" className="mt-20 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">محصولات</h2>
            <div className="text-sm text-[var(--dim)] mt-1 num">{loading ? "در حال بارگذاری…" : `${fa(data.length)} مدل · ${fa(inStockCount)} موجود`}</div>
          </div>
          <div className="glass rounded-xl p-1 flex text-sm">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCat(c.value)}
                className={`px-4 py-2 rounded-lg transition ${cat === c.value ? "grad font-semibold" : "text-[var(--dim)] hover:text-white"}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {loading && data.length === 0
            ? Array.from({ length: 8 }, (_, i) => <div key={i} className="glass rounded-3xl aspect-[3/4] animate-pulse" />)
            : data.map((p) => <Card key={p.id} p={p} onAdd={() => add(p.id)} added={justAdded === p.id} />)}
        </div>
        {!loading && data.length === 0 && <div className="glass rounded-3xl p-12 text-center text-[var(--dim)]">در این دسته هنوز محصولی نیست.</div>}
      </section>
    </div>
  );
}
