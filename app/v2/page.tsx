"use client";
import { useState } from "react";
import { CATEGORIES, fa, useProducts } from "@/lib/shop";
import SockArt from "@/components/SockArt";
import { Card, SOCK_COLORS } from "./_ui";

export default function V2Home() {
  const [cat, setCat] = useState("all");
  const { data, loading } = useProducts(cat);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-5 md:px-10 pt-12 md:pt-20 grid md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-7">
          <div className="latin text-[var(--bronze)]" dir="ltr">Collection — Autumn 1405</div>
          <h1 className="serif text-[56px] md:text-[96px] leading-[1.05] mt-6">
            جورابی که<br />دیده نمی‌شود،<br /><span className="text-[var(--stone)]">حس می‌شود.</span>
          </h1>
          <p className="mt-8 max-w-md text-[15px] leading-8 text-[var(--stone)]">
            نخ مرغوب، دوخت بی‌درز و رنگ‌هایی که با همه‌چیز می‌آیند. سفارش را ثبت کنید؛ ما تماس می‌گیریم و با پست می‌فرستیم.
          </p>
          <a href="#collection" className="btn inline-block mt-10">دیدن مجموعه</a>
        </div>
        <div className="md:col-span-5">
          <div className="bg-[var(--tile)] aspect-[4/5] relative overflow-hidden">
            <SockArt seed={2} colors={SOCK_COLORS} variant="flat" className="absolute inset-0 w-full h-full p-10" />
            <div className="absolute bottom-4 right-4 left-4 flex justify-between latin text-[var(--stone)]" dir="ltr">
              <span>Merino blend</span><span>N°03</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-10 mt-24 grid grid-cols-3 border-y rule text-center [&>*+*]:border-r [&>*]:border-[var(--line)]">
        {[["۰۱", "نخ پنبه و پشم مرغوب"], ["۰۲", "ارسال پستی هر روز"], ["۰۳", "هماهنگی تلفنی"]].map(([n, t]) => (
          <div key={n} className="py-6 px-2">
            <div className="serif text-2xl text-[var(--bronze)]">{n}</div>
            <div className="text-[12px] md:text-[13px] mt-1 text-[var(--stone)]">{t}</div>
          </div>
        ))}
      </section>

      <section id="collection" className="mx-auto max-w-7xl px-5 md:px-10 mt-24 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b rule pb-5">
          <div>
            <div className="latin text-[var(--stone)]" dir="ltr">The collection</div>
            <h2 className="serif text-5xl mt-2">مجموعه</h2>
          </div>
          <div className="flex gap-6 text-[13px]">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCat(c.value)} className={`pb-1 border-b ${cat === c.value ? "border-[var(--ink)]" : "border-transparent text-[var(--stone)] hover:text-[var(--ink)]"}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-[12px] text-[var(--stone)] mt-4">{loading ? "…" : `${fa(data.length)} مدل`}</div>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-x-5 md:gap-x-8 gap-y-14">
          {loading && data.length === 0
            ? Array.from({ length: 6 }, (_, i) => <div key={i} className="bg-[var(--tile)] aspect-[4/5] animate-pulse" />)
            : data.map((p, i) => <Card key={p.id} p={p} i={i} />)}
        </div>
        {!loading && data.length === 0 && <div className="py-20 text-center serif text-2xl text-[var(--stone)]">در این دسته هنوز مدلی نداریم.</div>}
      </section>
    </div>
  );
}
