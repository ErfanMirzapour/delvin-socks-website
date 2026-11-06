"use client";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { categoryFa } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { fa, inStock, productPhoto } from "@/lib/shop";
import { formatPrice, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";

export const B = "/v1";
export const SOCK_COLORS = ["#ff7a3d", "#ff8fc2", "#6ec6ff", "#ffd84d", "#7be0b0"];
const TILE_BG = ["#ffe3d3", "#ffe1ef", "#ddf1ff", "#fff3c4", "#daf7e8"];

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <path d="M32 3c15 0 29 9 29 27 0 19-14 31-30 31C15 61 3 49 3 32 3 14 17 3 32 3z" fill="#ff7a3d" stroke="#2b1b3d" strokeWidth="3" />
        <path d="M26 14h14v20c0 7-3 10-8 12l-8 3c-5 2-9-5-4-8l6-3z" fill="#fff" stroke="#2b1b3d" strokeWidth="3" strokeLinejoin="round" />
        <path d="M26 20h14" stroke="#ff8fc2" strokeWidth="4" />
        <circle cx="47" cy="15" r="5" fill="#ffd84d" stroke="#2b1b3d" strokeWidth="2.5" />
      </svg>
      <span className="display text-3xl leading-none pt-1">دلوین</span>
    </span>
  );
}

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur border-b-[3px] border-[var(--ink)]">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href={B} className="wiggle"><Logo /></Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-sm font-bold">
          <Link className="hidden sm:inline px-3 py-2 rounded-full hover:bg-[var(--lemon)]" href={B}>فروشگاه</Link>
          <Link className="px-3 py-2 rounded-full hover:bg-[var(--lemon)]" href={`${B}/about`}>درباره ما</Link>
          <Link href={`${B}/cart`} className="relative chunky-sm press rounded-full bg-[var(--pink)] px-4 py-2">
            سبد
            {count > 0 && (
              <span className="absolute -top-3 -left-3 min-w-7 h-7 px-1 rounded-full bg-[var(--ink)] text-white text-xs grid place-items-center">{fa(count)}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20">
      <div className="wave" />
      <div className="bg-[var(--ink)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm leading-8">
          <div>
            <div className="display text-3xl text-[var(--lemon)]">دلوین</div>
            <p className="opacity-80 mt-2">جوراب‌های شاد برای همه‌ی پاها. پرداخت آنلاین نداریم؛ سفارش بدهید، با پست می‌فرستیم.</p>
          </div>
          <div>
            <div className="display text-xl text-[var(--pink)]">تماس</div>
            <div>تلفن: <a className="underline" href={`tel:${SHOP_PHONE}`} dir="ltr">{SHOP_PHONE}</a></div>
            <div>تلگرام: <a className="underline" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">کانال دلوین</a></div>
          </div>
          <div>
            <div className="display text-xl text-[var(--sky)]">چطور کار می‌کند؟</div>
            <div>۱. جوراب انتخاب کنید ۲. مشخصات بدهید ۳. ما تماس می‌گیریم و پست می‌کنیم.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Photo({ p, className = "" }: { p: Product; className?: string }) {
  const src = productPhoto(p);
  if (src) return <img src={src} alt={p.title} className={`object-cover ${className}`} />;
  return <SockArt seed={p.id} colors={SOCK_COLORS} bg={TILE_BG[p.id % TILE_BG.length]} line="#2b1b3d" variant="line" className={className} label={p.title} />;
}

export function Card({ p, onAdd, added }: { p: Product; onAdd: () => void; added: boolean }) {
  const ok = inStock(p);
  return (
    <div className="chunky rounded-[28px] bg-white overflow-hidden flex flex-col">
      <Link href={`${B}/product/${p.id}`} className="relative block">
        <Photo p={p} className="w-full aspect-square" />
        <span className="absolute top-3 right-3 rounded-full bg-white chunky-sm px-3 py-0.5 text-xs font-bold">{categoryFa(p.category)}</span>
        {!ok && <span className="absolute inset-0 grid place-items-center bg-white/60 display text-2xl">تمام شد!</span>}
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`${B}/product/${p.id}`} className="font-black leading-7 line-clamp-2">{p.title}</Link>
        <div className="mt-1 display text-xl text-[var(--orange)]">{ok ? formatPrice(p.price) : "ناموجود"}</div>
        <button
          disabled={!ok}
          onClick={onAdd}
          className={`mt-auto pt-0 chunky-sm press rounded-2xl py-2.5 font-black text-sm disabled:opacity-40 disabled:shadow-none ${added ? "bg-[var(--mint)] btn-pop" : "bg-[var(--lemon)]"}`}
          style={{ marginTop: 12 }}
        >
          {!ok ? "ناموجود" : added ? "✓ رفت توی سبد!" : "بنداز توی سبد +"}
        </button>
      </div>
    </div>
  );
}

export function Btn({ children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`chunky press rounded-2xl px-6 py-3 font-black disabled:opacity-40 disabled:shadow-none ${className}`}>
      {children}
    </button>
  );
}
