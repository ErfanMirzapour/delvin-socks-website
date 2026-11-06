"use client";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { categoryFa } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { fa, inStock, productPhoto } from "@/lib/shop";
import { formatPrice, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";

export const B = "/v5";
export const SOCK_COLORS = ["#7c5cff", "#2ee6d6", "#eef0ff", "#5b8cff", "#1b2142"];

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 36 36" aria-hidden>
        <defs>
          <linearGradient id="v5lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c5cff" />
            <stop offset="1" stopColor="#2ee6d6" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#v5lg)" />
        <path d="M13 7h9v13c0 4-2 6-5 7l-5 2c-3 1-5-3-2-5l3-2z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="26.5" cy="9.5" r="2" fill="#fff" />
      </svg>
      <span className="leading-none">
        <span className="block text-[19px] font-semibold tracking-tight" dir="ltr">delvin</span>
        <span className="block text-[10px] text-[var(--dim)] mt-0.5">دلوین · sock lab</span>
      </span>
    </span>
  );
}

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto max-w-6xl glass rounded-2xl px-4 h-16 flex items-center justify-between">
        <Link href={B}><Logo /></Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link className="hidden sm:inline px-3 py-2 rounded-lg text-[var(--dim)] hover:text-white" href={B}>محصولات</Link>
          <Link className="px-3 py-2 rounded-lg text-[var(--dim)] hover:text-white" href={`${B}/about`}>درباره</Link>
          <Link href={`${B}/cart`} className="flex items-center gap-2 rounded-xl glass px-3.5 py-2 hover:border-[var(--violet)]">
            سبد <span className="grad rounded-md px-1.5 text-xs font-semibold num">{fa(count)}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-28 border-t border-[var(--edge)]">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-4 text-sm leading-7 text-[var(--dim)]">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm">جوراب، طراحی‌شده برای راحتی روزمره. پرداخت آنلاین نداریم؛ سفارش ثبت کنید، تماس می‌گیریم و با پست می‌فرستیم.</p>
        </div>
        <div>
          <div className="text-white font-medium mb-2">ارتباط</div>
          <a className="block hover:text-white" href={`tel:${SHOP_PHONE}`} dir="ltr">{SHOP_PHONE}</a>
          <a className="block hover:text-white" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">تلگرام</a>
        </div>
        <div>
          <div className="text-white font-medium mb-2">ارسال</div>
          <div>پست، هر روز</div>
          <div>هماهنگی تلفنی</div>
        </div>
      </div>
    </footer>
  );
}

export function Photo({ p, className = "" }: { p: Product; className?: string }) {
  const src = productPhoto(p);
  if (src) return <img src={src} alt={p.title} className={`object-cover ${className}`} />;
  return <SockArt seed={p.id} colors={SOCK_COLORS} bg="#11152b" line="#2ee6d6" variant="flat" className={className} label={p.title} />;
}

export function Card({ p, onAdd, added }: { p: Product; onAdd: () => void; added: boolean }) {
  const ok = inStock(p);
  return (
    <div className="group glass gborder rounded-3xl p-2.5 flex flex-col transition hover:-translate-y-1 hover:bg-white/[.07]">
      <Link href={`${B}/product/${p.id}`} className="relative block rounded-[18px] overflow-hidden">
        <Photo p={p} className={`w-full aspect-square ${ok ? "" : "opacity-40 grayscale"}`} />
        <span className="absolute top-2.5 right-2.5 rounded-full bg-black/40 backdrop-blur px-2.5 py-0.5 text-[11px] text-[var(--dim)]">{categoryFa(p.category)}</span>
        {ok ? (
          <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur px-2.5 py-0.5 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)]" /> {fa(p.stock)} موجود
          </span>
        ) : (
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] text-[var(--dim)]">ناموجود</span>
        )}
      </Link>
      <div className="px-2 pt-3 pb-1.5 flex-1 flex flex-col">
        <Link href={`${B}/product/${p.id}`} className="font-medium leading-7 line-clamp-2">{p.title}</Link>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="num font-semibold">{ok ? formatPrice(p.price) : <span className="text-[var(--dim)]">—</span>}</span>
          <button
            disabled={!ok}
            onClick={onAdd}
            aria-label="افزودن به سبد"
            className={`h-9 px-3 rounded-xl text-sm font-semibold disabled:opacity-25 ${added ? "bg-[var(--cyan)] text-[#06221f] btn-pop" : "grad"}`}
          >
            {added ? "✓" : "+ سبد"}
          </button>
        </div>
      </div>
    </div>
  );
}
