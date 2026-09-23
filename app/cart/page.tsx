"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { useCart, joinCart } from "@/lib/cart";
import { formatPrice } from "@/lib/site";

export default function CartPage() {
  const cart = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    fetch("/api/products?category=all", { cache: "no-store" }).then((r) => r.json() as Promise<Product[]>).then(setProducts);
  }, []);
  const rows = joinCart(cart.lines, products);
  const total = rows.reduce((s, r) => s + r.product.price * r.qty, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-black mb-1">🧺 سبد خرید</h1>
      <p className="text-sm text-neutral-500 mb-6 leading-7">این سبد واقعی نیست — پرداخت بانکی نداریم. در مرحله بعد فاکتور را می‌بینید و مشخصات می‌دهید تا با پست بفرستیم.</p>
      {rows.length === 0 ? (
        <div className="rounded-3xl border p-10 text-center leading-8">
          سبد خالی است.
          <br /><Link href="/" className="inline-block mt-4 px-6 py-2.5 rounded-full bg-black text-white font-bold text-sm">رفتن به فروشگاه</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {rows.map(({ product: p, qty }) => (
              <div key={p.id} className="rounded-2xl border p-3 flex gap-3 items-center bg-white">
                <img src={p.image || "/socks/sock-1.svg"} alt={p.title} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1">
                  <div className="font-black leading-7">{p.title}</div>
                  <div className="text-sm text-neutral-500">{p.stock <= 0 ? "ناموجود" : formatPrice(p.price)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => cart.setQty(p.id, qty - 1)} className="w-8 h-8 rounded-full border font-black">−</button>
                    <span className="font-black w-8 text-center">{qty.toLocaleString("fa-IR")}</span>
                    <button onClick={() => cart.setQty(p.id, Math.min(p.stock || 99, qty + 1))} className="w-8 h-8 rounded-full border font-black">+</button>
                    <button onClick={() => cart.remove(p.id)} className="mr-2 text-xs text-red-600 underline">حذف</button>
                  </div>
                </div>
                <div className="font-black text-sm whitespace-nowrap">{(p.price * qty).toLocaleString("fa-IR")}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl border p-5 bg-neutral-50">
            <div className="flex justify-between font-black text-lg"><span>جمع فاکتور:</span><span>{formatPrice(total)}</span></div>
            <Link href="/checkout" className="block text-center mt-4 py-3 rounded-2xl bg-black text-white font-black">مشاهده فاکتور و ادامه ←</Link>
            <button onClick={cart.clear} className="w-full mt-2 text-xs text-neutral-500 underline">خالی کردن سبد</button>
          </div>
        </>
      )}
    </div>
  );
}
