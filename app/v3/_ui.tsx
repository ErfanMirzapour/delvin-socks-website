"use client";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { categoryFa } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { fa, inStock, productPhoto } from "@/lib/shop";
import { formatPrice, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";

export const B = "/v3";
export const SOCK_COLORS = ["#c6ff00", "#0b0b0b", "#f4f4f0", "#ff3b1f"];

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2" dir="ltr">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" fill="#c6ff00" />
        <path d="M11 5h9v14c0 4-2 6-5 7l-6 2c-3 1-5-3-2-5l4-2z" fill="#0b0b0b" />
        <rect x="11" y="9" width="9" height="3" fill="#c6ff00" />
      </svg>
      <span className="mega text-2xl tracking-tight">DELVIN<sup className="text-[10px] align-top">®</sup></span>
    </span>
  );
}

export function Ticker({ text, className = "" }: { text: string; className?: string }) {
  const items = Array.from({ length: 12 }, (_, i) => (
    <span key={i} className="px-6 whitespace-nowrap">{text} <span className="opacity-60">✶</span></span>
  ));
  return (
    <div className={`overflow-hidden ${className}`} aria-hidden>
      <div className="ticker">{items}{items}</div>
    </div>
  );
}

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)] border-b-2 border-[var(--ink)]">
      <div className="mx-auto max-w-[1400px] px-4 h-16 flex items-center justify-between">
        <Link href={B}><Logo /></Link>
        <nav className="flex items-stretch h-full text-sm font-black">
          <Link className="hidden sm:flex items-center px-5 border-r-2 border-[var(--ink)] hover:bg-[var(--lime)] hover:text-black" href={B}>شاپ</Link>
          <Link className="flex items-center px-4 sm:px-5 border-r-2 border-[var(--ink)] hover:bg-[var(--lime)] hover:text-black" href={`${B}/about`}>درباره</Link>
          <Link href={`${B}/cart`} className="flex items-center gap-2 px-4 sm:px-5 bg-[var(--lime)] text-black">
            سبد <span className="mono text-xs bg-black text-[var(--lime)] px-1.5 py-0.5">{fa(count)}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-[var(--ink)]">
      <Ticker text="بدون پرداخت آنلاین — سفارش بده، پست می‌کنیم — DELVIN®" className="bg-[var(--lime)] text-black font-black py-3 border-b-2 border-black" />
      <div className="mx-auto max-w-[1400px] px-4 py-12 grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
        <div className="mega text-[64px] md:text-[120px] text-[var(--lime)]" dir="ltr">DELVIN®</div>
        <div className="text-sm leading-8">
          <div className="mono text-[var(--grey)] text-xs mb-2">Contact</div>
          <a className="block hover:text-[var(--lime)]" href={`tel:${SHOP_PHONE}`} dir="ltr">{SHOP_PHONE}</a>
          <a className="block hover:text-[var(--lime)]" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">تلگرام ↗</a>
        </div>
        <div className="text-sm leading-8">
          <div className="mono text-[var(--grey)] text-xs mb-2">How</div>
          <div>انتخاب کن، آدرس بده.</div>
          <div>زنگ می‌زنیم، پست می‌کنیم.</div>
        </div>
      </div>
    </footer>
  );
}

export function Photo({ p, className = "" }: { p: Product; className?: string }) {
  const src = productPhoto(p);
  if (src) return <img src={src} alt={p.title} className={`object-cover ${className}`} />;
  return <SockArt seed={p.id} colors={SOCK_COLORS} bg={p.id % 2 ? "#161616" : "#c6ff00"} line={p.id % 2 ? "#c6ff00" : "#0b0b0b"} variant="bold" className={className} label={p.title} />;
}

export function Card({ p, i, onAdd, added }: { p: Product; i: number; onAdd: () => void; added: boolean }) {
  const ok = inStock(p);
  return (
    <div className="group border-2 border-[var(--ink)] -mt-[2px] -mr-[2px] flex flex-col bg-[var(--bg)]">
      <Link href={`${B}/product/${p.id}`} className="relative block overflow-hidden border-b-2 border-[var(--ink)]">
        <Photo p={p} className={`w-full aspect-square transition-transform duration-300 group-hover:scale-105 ${ok ? "" : "grayscale opacity-40"}`} />
        <span className="absolute top-0 right-0 mono text-[11px] bg-[var(--ink)] text-black px-2 py-1">#{String(i + 1).padStart(3, "0")}</span>
        {!ok && <span className="absolute top-1/2 inset-x-0 -translate-y-1/2 -rotate-6 bg-[var(--red)] text-white text-center mega text-2xl py-1">SOLD OUT</span>}
      </Link>
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <div className="mono text-[11px] text-[var(--grey)]">{categoryFa(p.category)}</div>
        <Link href={`${B}/product/${p.id}`} className="font-black leading-7 mt-1 line-clamp-2 group-hover:text-[var(--lime)]">{p.title}</Link>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="font-black text-sm">{ok ? formatPrice(p.price) : "ناموجود"}</span>
          <button
            disabled={!ok}
            onClick={onAdd}
            aria-label="افزودن به سبد"
            className={`w-10 h-10 shrink-0 font-black text-xl disabled:opacity-20 ${added ? "bg-[var(--ink)] text-black btn-pop" : "bg-[var(--lime)] text-black hover:bg-[var(--ink)]"}`}
          >
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const btn = "slam bg-[var(--lime)] text-black font-black px-7 py-4 disabled:opacity-30 disabled:shadow-none";
