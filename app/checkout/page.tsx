"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/catalog";
import { useCart, joinCart } from "@/lib/cart";
import { formatPrice, POST_EXPLAINER } from "@/lib/site";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ fullname: "", phone: "", address: "", postal_code: "", note: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/products?category=all", { cache: "no-store" }).then((r) => r.json() as Promise<Product[]>).then(setProducts);
  }, []);

  const rows = joinCart(cart.lines, products);
  const total = rows.reduce((s, r) => s + r.product.price * r.qty, 0);

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items: cart.lines }),
      });
      const j = (await res.json()) as { id: number; error?: string };
      if (!res.ok) throw new Error(j.error || "خطا");
      cart.clear();
      router.push(`/success?id=${j.id}`);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "خطا در ثبت سفارش");
    } finally {
      setBusy(false);
    }
  }

  const inp = "w-full rounded-2xl border px-4 py-3 text-[15px] bg-white outline-none focus:border-black";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-black">🧾 فاکتور و ثبت سفارش</h1>
      <div className="mt-3 text-sm leading-8 bg-blue-50 border border-blue-200 rounded-2xl p-4">{POST_EXPLAINER}</div>

      <h2 className="font-black mt-6 mb-3">اقلام خرید ({rows.length.toLocaleString("fa-IR")})</h2>
      <div className="rounded-3xl border overflow-hidden bg-white">
        {rows.map(({ product: p, qty }) => (
          <div key={p.id} className="flex justify-between gap-2 px-4 py-3 border-b last:border-0 text-sm">
            <span className="font-bold">{p.title} <span className="text-neutral-400">× {qty.toLocaleString("fa-IR")}</span></span>
            <span className="font-black whitespace-nowrap">{(p.price * qty).toLocaleString("fa-IR")} تومان</span>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-center text-neutral-500">سبد خالی است.</div>}
        <div className="px-4 py-3 bg-neutral-50 flex justify-between font-black"><span>جمع:</span><span>{formatPrice(total)}</span></div>
      </div>

      <h2 className="font-black mt-6 mb-3">مشخصات ارسال (پست)</h2>
      <div className="grid gap-3">
        <label className="block"><span className="text-sm font-bold">نام و نام خانوادگی *</span>
          <input className={inp} value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} placeholder="مثلاً علی رضایی" /></label>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block"><span className="text-sm font-bold">شماره تماس *</span>
            <input className={inp} inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="09123456789" /></label>
          <label className="block"><span className="text-sm font-bold">کد پستی * (۱۰ رقم)</span>
            <input className={inp} inputMode="numeric" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} placeholder="1234567890" /></label>
        </div>
        <label className="block"><span className="text-sm font-bold">آدرس *</span>
          <textarea className={inp} rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="شهر، خیابان، کوچه، پلاک، واحد…" /></label>
        <label className="block"><span className="text-sm font-bold">توضیحات (اختیاری — مثل آیدی تلگرام)</span>
          <textarea className={inp} rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="هر چیزی که لازم است بدانیم…" /></label>
      </div>

      {err && <div className="mt-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3">{err}</div>}

      <button disabled={busy || rows.length === 0} onClick={submit}
        className="w-full mt-5 py-4 rounded-2xl bg-black text-white font-black text-lg disabled:opacity-40">
        {busy ? "در حال ثبت…" : "ثبت سفارش ✓"}
      </button>
    </div>
  );
}
