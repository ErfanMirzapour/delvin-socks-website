"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useProducts } from "@/components/shop";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";
import { categoryFa } from "@/lib/catalog";

const CATS = [["all", "همه"], ["men", "مردانه"], ["women", "زنانه"], ["kids", "بچگانه"]] as const;

export default function Home() {
  const [cat, setCat] = useState<string>("all");
  const { data } = useProducts(cat);
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleAdd(id: number) {
    add(id);
    setJustAdded(id);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(null), 1400);
  }
  return (
    <div className="theme-v1 min-h-screen" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-[2rem] p-8 md:p-12 text-center border" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
          <div className="text-sm font-bold opacity-70 mb-2">🧶 از بازار تا خانه شما</div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">جوراب گرم،<br />پای راحت</h1>
          <p className="opacity-70 leading-8 max-w-xl mx-auto">نخی، پشمی و اسپرت — ثبت سفارش بدون پرداخت آنلاین، ارسال با پست.</p>
          <div className="mt-5 flex justify-center gap-2 flex-wrap">
            {CATS.map(([v, label]) => (
              <button key={v} onClick={() => setCat(v)}
                className="px-5 py-2 rounded-full border font-bold text-sm"
                style={cat === v ? { background: "var(--ink)", color: "var(--bg)" } : { borderColor: "var(--line)", background: "transparent" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="knit-divider my-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((p) => (
            <div key={p.id} className="rounded-3xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--line)" }}>
              <Link href={`/product/${p.id}`}><img src={p.image || "/socks/sock-1.svg"} alt={p.title} className="w-full aspect-square object-cover" /></Link>
              <div className="p-4">
                <div className="text-xs opacity-60 font-bold">{categoryFa(p.category)}</div>
                <Link href={`/product/${p.id}`} className="font-black leading-7 block">{p.title}</Link>
                <div className="mt-2 min-h-8">
                  {p.stock <= 0 ? <span className="font-black text-neutral-400">ناموجود</span>
                    : <span className="font-black" style={{ color: "#8a5a00" }}>{formatPrice(p.price)}</span>}
                </div>
                <button disabled={p.stock <= 0} onClick={() => handleAdd(p.id)}
                  className={`mt-3 w-full py-2.5 rounded-2xl font-bold text-sm disabled:opacity-40 ${justAdded === p.id ? "btn-pop" : ""}`}
                  style={justAdded === p.id ? { background: "#1a7f37", color: "#fff" } : { background: "var(--accent)", color: "#fff" }}>
                  {p.stock <= 0 ? "ناموجود" : justAdded === p.id ? "✓ به سبد اضافه شد" : "افزودن به سبد +"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
