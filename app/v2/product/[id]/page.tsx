"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { categoryFa } from "@/lib/catalog";
import { fa, inStock, useAddToCart, useProduct } from "@/lib/shop";
import { formatPrice } from "@/lib/site";
import { B, Card, Photo } from "../../_ui";

export default function V2Product() {
  const { id } = useParams<{ id: string }>();
  const { product: p, notFound, related } = useProduct(id);
  const { add, justAdded } = useAddToCart(2500);

  if (notFound) return <div className="py-32 text-center serif text-3xl">این مدل یافت نشد. <Link href={B} className="block mt-4 text-sm ulink">بازگشت به مجموعه</Link></div>;
  if (!p) return <div className="mx-auto max-w-7xl px-5 md:px-10 py-12"><div className="bg-[var(--tile)] aspect-[16/9] animate-pulse" /></div>;
  const ok = inStock(p);

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-10 py-10">
      <div className="text-[12px] text-[var(--stone)]">
        <Link href={B} className="ulink">مجموعه</Link> / {categoryFa(p.category)}
      </div>
      <div className="mt-6 grid md:grid-cols-12 gap-10 md:gap-16">
        <div className="md:col-span-7 bg-[var(--tile)]">
          <Photo p={p} className="w-full aspect-[4/5]" />
        </div>
        <div className="md:col-span-5 md:pt-10">
          <div className="latin text-[var(--bronze)]" dir="ltr">Delvin — N°{String(p.id).padStart(2, "0")}</div>
          <h1 className="serif text-5xl md:text-6xl leading-[1.15] mt-4">{p.title}</h1>
          <div className="mt-5 text-lg">{ok ? formatPrice(p.price) : <span className="text-[var(--stone)]">ناموجود</span>}</div>
          <p className="mt-8 leading-8 text-[15px] text-[var(--stone)] border-t rule pt-8">{p.description || "یک جفت جوراب ساده و ماندگار از دلوین."}</p>
          <dl className="mt-8 grid grid-cols-2 text-[13px] border-t rule">
            <dt className="py-3 text-[var(--stone)] border-b rule">دسته</dt><dd className="py-3 border-b rule">{categoryFa(p.category)}</dd>
            <dt className="py-3 text-[var(--stone)] border-b rule">موجودی</dt><dd className="py-3 border-b rule">{ok ? `${fa(p.stock)} جفت` : "به‌زودی"}</dd>
            <dt className="py-3 text-[var(--stone)] border-b rule">ارسال</dt><dd className="py-3 border-b rule">پست، پس از تماس</dd>
          </dl>
          <button disabled={!ok} onClick={() => add(p.id)} className="btn w-full mt-10">
            {!ok ? "ناموجود" : justAdded === p.id ? "به سبد افزوده شد ✓" : "افزودن به سبد"}
          </button>
          {justAdded === p.id && <Link href={`${B}/cart`} className="btn-ghost block text-center mt-3">مشاهده‌ی سبد</Link>}
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-28">
          <h2 className="serif text-4xl border-b rule pb-5">ممکن است بپسندید</h2>
          <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-5 md:gap-x-8 gap-y-12">
            {related.map((r, i) => <Card key={r.id} p={r} i={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
