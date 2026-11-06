"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { categoryFa } from "@/lib/catalog";
import { fa, inStock, useAddToCart, useProduct } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import { B, Card, Photo } from "../../_ui";

export default function ShopProduct() {
  const { id } = useParams<{ id: string }>();
  const { product: p, notFound, related } = useProduct(id);
  const { add, justAdded } = useAddToCart(2500);

  if (notFound) return <div className="py-28 text-center hand text-3xl">این جوراب را پیدا نکردیم. <Link href="/" className="block mt-4 text-base underline">برگشت به فروشگاه</Link></div>;
  if (!p) return <div className="mx-auto max-w-6xl px-4 py-10"><div className="soft-card h-[460px] animate-pulse" /></div>;
  const ok = inStock(p);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/" className="text-sm font-bold text-[var(--soft)] hover:text-[var(--ink)]">→ برگشت به فروشگاه</Link>
      <div className="mt-5 soft-card p-4 md:p-6 grid md:grid-cols-2 gap-8">
        <div className="rounded-[22px] overflow-hidden"><Photo p={p} className="w-full aspect-square" /></div>
        <div className="py-2 md:py-6 flex flex-col">
          <span className="tag self-start text-xs font-bold text-[var(--terra)] !bg-[var(--bg)]">{categoryFa(p.category)}</span>
          <h1 className="hand text-4xl md:text-5xl leading-[1.3] mt-4">{p.title}</h1>
          <div className="mt-3 text-2xl font-black text-[var(--terra)]">{ok ? formatPrice(p.price) : <span className="text-[var(--soft)]">ناموجود</span>}</div>
          <p className="mt-5 leading-8 text-[var(--soft)]">{p.description || "یک جفت جوراب گرم و نرم از دلوین."}</p>
          <div className="mt-5 rounded-2xl bg-[var(--bg)] p-4 text-sm leading-7">
            {ok ? <>🧶 <b>{fa(p.stock)} جفت</b> آماده‌ی ارسال داریم.</> : "این مدل فعلاً تمام شده؛ به‌زودی دوباره می‌آوریم."}
            <br />📦 ارسال با پست، پس از تماس تلفنی.
          </div>
          <div className="mt-auto pt-8 flex gap-3">
            <button disabled={!ok} onClick={() => add(p.id)} className={`btn flex-1 text-lg ${justAdded === p.id ? "btn-forest btn-pop" : ""}`}>
              {!ok ? "ناموجود" : justAdded === p.id ? "✓ به سبد اضافه شد" : "افزودن به سبد"}
            </button>
            <Link href={`${B}/cart`} className="rounded-full px-6 grid place-items-center font-bold bg-[var(--bg)]">سبد</Link>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="hand text-3xl mb-6">شاید این‌ها را هم دوست داشته باشید</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {related.map((r) => <Card key={r.id} p={r} onAdd={() => add(r.id)} added={justAdded === r.id} />)}
          </div>
        </section>
      )}
    </div>
  );
}
