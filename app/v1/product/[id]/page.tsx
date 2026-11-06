"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { categoryFa } from "@/lib/catalog";
import { fa, inStock, useAddToCart, useProduct } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import { B, Btn, Card, Photo } from "../../_ui";

export default function V1Product() {
  const { id } = useParams<{ id: string }>();
  const { product: p, notFound, related } = useProduct(id);
  const { add, justAdded } = useAddToCart(2200);

  if (notFound) return <div className="mx-auto max-w-xl px-4 py-20 text-center display text-3xl">این جوراب پیدا نشد! <Link href={B} className="block mt-4 text-base underline">برگشت به فروشگاه</Link></div>;
  if (!p) return <div className="mx-auto max-w-5xl px-4 py-10"><div className="chunky rounded-[36px] bg-white h-96 animate-pulse" /></div>;
  const ok = inStock(p);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={B} className="text-sm font-bold underline">→ همه‌ی جوراب‌ها</Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2 items-start">
        <div className="chunky rounded-[36px] overflow-hidden bg-white rotate-[-1deg]">
          <Photo p={p} className="w-full aspect-square" />
        </div>
        <div>
          <span className="chunky-sm rounded-full bg-[var(--sky)] px-4 py-1 text-sm font-black">{categoryFa(p.category)}</span>
          <h1 className="display text-4xl md:text-5xl leading-tight mt-4">{p.title}</h1>
          <div className="display text-3xl text-[var(--orange)] mt-3">{ok ? formatPrice(p.price) : "ناموجود"}</div>
          <p className="mt-4 leading-8 text-[var(--muted)] font-medium">{p.description || "یک جفت جوراب شاد و نرم از دلوین."}</p>
          <div className="mt-4 inline-block rounded-2xl bg-white chunky-sm px-4 py-2 text-sm font-bold">
            {ok ? `🟢 ${fa(p.stock)} جفت آماده‌ی ارسال` : "⚪ فعلاً تمام شده، به‌زودی برمی‌گردد"}
          </div>
          <div className="mt-6 flex gap-3">
            <Btn disabled={!ok} onClick={() => add(p.id)} className={`flex-1 text-lg ${justAdded === p.id ? "bg-[var(--mint)] btn-pop" : "bg-[var(--lemon)]"}`}>
              {!ok ? "ناموجود" : justAdded === p.id ? "✓ رفت توی سبد!" : "بنداز توی سبد +"}
            </Btn>
            <Link href={`${B}/cart`} className="chunky press rounded-2xl px-6 py-3 font-black bg-white">سبد</Link>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="display text-3xl mb-5">اینا هم بامزه‌ان</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((r) => <Card key={r.id} p={r} onAdd={() => add(r.id)} added={justAdded === r.id} />)}
          </div>
        </section>
      )}
    </div>
  );
}
