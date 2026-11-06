"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { categoryFa } from "@/lib/catalog";
import { fa, inStock, useAddToCart, useProduct } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import { B, Card, Photo } from "../../_ui";

export default function V5Product() {
  const { id } = useParams<{ id: string }>();
  const { product: p, notFound, related } = useProduct(id);
  const { add, justAdded } = useAddToCart(2500);

  if (notFound) return <div className="py-32 text-center"><div className="text-6xl font-bold grad-text">۴۰۴</div><Link href={B} className="block mt-4 text-[var(--dim)] underline">بازگشت به محصولات</Link></div>;
  if (!p) return <div className="mx-auto max-w-6xl px-4 py-12"><div className="glass rounded-3xl h-[460px] animate-pulse" /></div>;
  const ok = inStock(p);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-sm text-[var(--dim)]"><Link href={B} className="hover:text-white">محصولات</Link> <span className="mx-1">/</span> {categoryFa(p.category)}</div>
      <div className="mt-6 grid md:grid-cols-2 gap-8">
        <div className="glass gborder rounded-[28px] p-3"><Photo p={p} className="w-full aspect-square rounded-[22px]" /></div>
        <div className="md:pt-4 flex flex-col">
          <span className="self-start glass rounded-full px-3 py-1 text-xs text-[var(--dim)]">{categoryFa(p.category)} · SKU-{String(p.id).padStart(4, "0")}</span>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.25] mt-4 tracking-tight">{p.title}</h1>
          <div className="mt-4 text-2xl font-semibold num">{ok ? formatPrice(p.price) : <span className="text-[var(--dim)]">ناموجود</span>}</div>
          <p className="mt-5 text-[var(--dim)] leading-8">{p.description || "جوراب روزمره‌ی دلوین؛ راحت، بادوام و نفس‌کش."}</p>
          <div className="mt-6 glass rounded-2xl divide-y divide-[var(--edge)] text-sm">
            {[["دسته", categoryFa(p.category)], ["موجودی", ok ? `${fa(p.stock)} جفت` : "تمام شده"], ["ارسال", "پست · هماهنگی تلفنی"], ["پرداخت", "پس از تماس، بدون پرداخت آنلاین"]].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3"><span className="text-[var(--dim)]">{k}</span><span className="num">{v}</span></div>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <button disabled={!ok} onClick={() => add(p.id)} className={`btn flex-1 ${justAdded === p.id ? "btn-pop" : ""}`}>
              {!ok ? "ناموجود" : justAdded === p.id ? "✓ به سبد اضافه شد" : "افزودن به سبد"}
            </button>
            <Link href={`${B}/cart`} className="btn-glass">سبد</Link>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold mb-6">محصولات مشابه</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {related.map((r) => <Card key={r.id} p={r} onAdd={() => add(r.id)} added={justAdded === r.id} />)}
          </div>
        </section>
      )}
    </div>
  );
}
