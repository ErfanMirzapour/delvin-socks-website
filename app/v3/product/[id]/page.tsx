"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { categoryFa } from "@/lib/catalog";
import { fa, inStock, useAddToCart, useProduct } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import { B, btn, Card, Photo } from "../../_ui";

export default function V3Product() {
  const { id } = useParams<{ id: string }>();
  const { product: p, notFound, related } = useProduct(id);
  const { add, justAdded } = useAddToCart(2500);

  if (notFound) return <div className="py-32 text-center mega text-5xl">404 <Link href={B} className="block mt-6 text-base text-[var(--lime)] underline">برگرد به شاپ</Link></div>;
  if (!p) return <div className="mx-auto max-w-[1400px] px-4 py-10"><div className="hard h-[480px] bg-[var(--panel)] animate-pulse" /></div>;
  const ok = inStock(p);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <Link href={B} className="mono text-xs text-[var(--grey)] hover:text-[var(--lime)]">← Back / شاپ</Link>
      <div className="mt-5 grid md:grid-cols-2 border-2 border-[var(--ink)]">
        <div className="border-b-2 md:border-b-0 md:border-l-2 border-[var(--ink)] relative">
          <Photo p={p} className="w-full aspect-square" />
          {!ok && <span className="absolute top-6 right-0 bg-[var(--red)] text-white mega text-2xl px-4 py-1" dir="ltr">SOLD OUT</span>}
        </div>
        <div className="p-6 md:p-10 flex flex-col">
          <div className="mono text-xs text-[var(--lime)]">{categoryFa(p.category)} / #{String(p.id).padStart(3, "0")}</div>
          <h1 className="mega text-5xl md:text-6xl mt-4 leading-[1.1]">{p.title}</h1>
          <div className="mt-6 inline-block self-start bg-[var(--ink)] text-black font-black text-2xl px-4 py-2">{ok ? formatPrice(p.price) : "ناموجود"}</div>
          <p className="mt-6 leading-8 text-[var(--grey)] font-medium">{p.description || "جوراب دلوین. همین."}</p>
          <div className="mt-6 mono text-xs">{ok ? `● ${fa(p.stock)} pairs left` : "○ restock soon"}</div>
          <div className="mt-auto pt-10 flex gap-3">
            <button disabled={!ok} onClick={() => add(p.id)} className={`${btn} flex-1 text-lg ${justAdded === p.id ? "btn-pop" : ""}`}>
              {!ok ? "ناموجود" : justAdded === p.id ? "✓ رفت تو سبد" : "بنداز تو سبد"}
            </button>
            <Link href={`${B}/cart`} className="hard px-6 grid place-items-center font-black hover:bg-[var(--ink)] hover:text-black">سبد</Link>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mega text-4xl md:text-5xl mb-6">اینم ببین<span className="text-[var(--lime)]">.</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 pt-[2px] pr-[2px]">
            {related.map((r, i) => <Card key={r.id} p={r} i={i} onAdd={() => add(r.id)} added={justAdded === r.id} />)}
          </div>
        </section>
      )}
    </div>
  );
}
