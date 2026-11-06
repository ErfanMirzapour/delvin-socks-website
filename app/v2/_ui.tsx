"use client";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { categoryFa } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { fa, inStock, productPhoto } from "@/lib/shop";
import { formatPrice, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";

export const B = "/v2";
export const SOCK_COLORS = ["#d9d1c3", "#2a2826", "#9a6b3f", "#bfb6a6", "#ffffff"];

export function Logo() {
  return (
    <span className="inline-flex items-center gap-3">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r="19" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M16 9v13c0 3-2 4-4 5-3 1-2 5 1 4l7-3c3-1 4-3 4-6V9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M16 12.5h8" stroke="#9a6b3f" strokeWidth="1.3" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="latin text-[13px]! tracking-[.45em]!" dir="ltr">DELVIN</span>
        <span className="serif text-[15px] mt-1 text-[var(--stone)]">دلوین · جوراب‌دوزی</span>
      </span>
    </span>
  );
}

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/92 backdrop-blur border-b rule">
      <div className="mx-auto max-w-7xl px-5 md:px-10 relative h-[72px] flex items-center justify-between">
        <nav className="flex gap-6 text-[13px]">
          <Link className="ulink hidden sm:inline" href={B}>مجموعه</Link>
          <Link className="ulink" href={`${B}/about`}>درباره</Link>
        </nav>
        <Link href={B} className="absolute left-1/2 -translate-x-1/2"><Logo /></Link>
        <Link href={`${B}/cart`} className="ulink text-[13px]">سبد ({fa(count)})</Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-28 border-t rule">
      <div className="mx-auto max-w-7xl px-5 md:px-10 py-14 grid gap-10 md:grid-cols-4 text-[13px] leading-7 text-[var(--stone)]">
        <div className="md:col-span-2">
          <div className="serif text-3xl text-[var(--ink)]">کوچک می‌دوزیم، با دقت می‌فرستیم.</div>
          <p className="mt-3 max-w-sm">پرداخت آنلاین نداریم. سفارش را ثبت کنید؛ برای هماهنگی تماس می‌گیریم و در پایان روز با پست ارسال می‌کنیم.</p>
        </div>
        <div>
          <div className="latin text-[var(--ink)] mb-3">Contact</div>
          <a className="ulink block" href={`tel:${SHOP_PHONE}`} dir="ltr">{SHOP_PHONE}</a>
          <a className="ulink block" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">کانال تلگرام</a>
        </div>
        <div>
          <div className="latin text-[var(--ink)] mb-3">Delvin</div>
          <div>مردانه · زنانه · بچگانه</div>
          <div>ارسال پستی به سراسر کشور</div>
        </div>
      </div>
    </footer>
  );
}

export function Photo({ p, className = "" }: { p: Product; className?: string }) {
  const src = productPhoto(p);
  if (src) return <img src={src} alt={p.title} className={`object-cover ${className}`} />;
  return <SockArt seed={p.id} colors={SOCK_COLORS} bg="#ebe6dc" line="#161514" variant="flat" className={className} label={p.title} />;
}

export function Card({ p, i }: { p: Product; i: number }) {
  const ok = inStock(p);
  return (
    <Link href={`${B}/product/${p.id}`} className="group block">
      <div className="zoom overflow-hidden bg-[var(--tile)]">
        <Photo p={p} className={`w-full aspect-[4/5] ${ok ? "" : "opacity-50 grayscale"}`} />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <span className="latin text-[var(--stone)]" dir="ltr">N°{String(i + 1).padStart(2, "0")}</span>
        <span className="text-[12px] text-[var(--stone)]">{categoryFa(p.category)}</span>
      </div>
      <div className="serif text-[22px] leading-8 mt-1">{p.title}</div>
      <div className="text-[13px] mt-1">{ok ? formatPrice(p.price) : <span className="text-[var(--stone)]">ناموجود</span>}</div>
    </Link>
  );
}
