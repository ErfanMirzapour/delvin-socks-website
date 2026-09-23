"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { categoryFa } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Product | null>(null);
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch("/api/products?category=all", { cache: "no-store" })
      .then((r) => r.json())
      .then((all: Product[]) => setP(all.find((x) => String(x.id) === String(id)) || null));
  }, [id]);

  if (!p) return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-neutral-500">در حال بارگذاری…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 grid gap-8 md:grid-cols-2">
      <img src={p.image || "/socks/sock-1.svg"} alt={p.title} className="w-full aspect-square object-cover rounded-3xl border" />
      <div>
        <div className="text-sm font-bold text-neutral-500">{categoryFa(p.category)}</div>
        <h1 className="text-2xl md:text-3xl font-black leading-10 mt-1">{p.title}</h1>
        <p className="mt-3 text-neutral-600 leading-8">{p.description || "—"}</p>
        <div className="mt-4 text-xl font-black">
          {p.stock <= 0 ? <span className="text-neutral-400">ناموجود</span> : formatPrice(p.price)}
        </div>
        <div className="mt-1 text-sm text-neutral-500">
          {p.stock <= 0 ? "این مدل فعلاً تمام شده، ولی همچنان نمایش داده می‌شود." : `${p.stock.toLocaleString("fa-IR")} جفت موجود`}
        </div>
        <div className="mt-6 flex gap-2">
          <button
            disabled={p.stock <= 0}
            onClick={() => { add(p.id); setAdded(true); }}
            className={`flex-1 py-3 rounded-2xl font-black disabled:opacity-30 ${added && p.stock > 0 ? "btn-pop bg-green-700 text-white" : "bg-black text-white"}`}
          >
            {p.stock <= 0 ? "ناموجود" : added ? "✓ به سبد اضافه شد" : "افزودن به سبد خرید"}
          </button>
          <Link href="/cart" className="px-6 py-3 rounded-2xl border font-bold">سبد</Link>
        </div>
        {added && p.stock > 0 && <div className="mt-3 text-sm bg-green-50 border border-green-200 rounded-2xl p-3">✓ به سبد اضافه شد. <Link className="underline font-bold" href="/cart">مشاهده سبد</Link></div>}
        <Link href="/" className="inline-block mt-6 text-sm underline text-neutral-500">← بازگشت به فروشگاه</Link>
      </div>
    </div>
  );
}
