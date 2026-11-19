"use client";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { categoryFa } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { fa, inStock, productPhoto } from "@/lib/shop";
import { formatPrice, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";

// Base path for storefront links ("" = site root).
export const B = "";
export const SOCK_COLORS = ["#c65d3b", "#fbf6ec", "#2f4a3a", "#d9a23b", "#e8b4a0"];
const TILES = ["#ead9c2", "#e3d9c4", "#efd3c4", "#dfe0cc"];

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="42" height="42" viewBox="0 0 48 48" aria-hidden>
        <circle cx="22" cy="26" r="17" fill="#c65d3b" />
        <path d="M8 20c8 2 20 2 28-4M6 28c10 3 24 2 32-6M10 36c8 2 18 1 26-6M16 11c4 8 5 20 2 31M27 9c3 9 3 21-1 33" fill="none" stroke="#fbf6ec" strokeWidth="1.6" strokeLinecap="round" opacity=".85" />
        <path d="M37 32c4 2 7 0 8 4s-3 6-6 7" fill="none" stroke="#c65d3b" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className="hand text-[28px] block">دلوین</span>
        <span className="text-[10px] tracking-wide text-[var(--soft)] font-bold">جوراب گرم، از دل خانه</span>
      </span>
    </span>
  );
}

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-[76px] flex items-center justify-between">
        <Link href="/"><Logo /></Link>
        <nav className="flex items-center gap-1 text-sm font-bold">
          <Link className="hidden sm:inline px-4 py-2 rounded-full hover:bg-[var(--paper)]" href="/">فروشگاه</Link>
          <Link className="px-4 py-2 rounded-full hover:bg-[var(--paper)]" href={`${B}/about`}>قصه‌ی ما</Link>
          <Link href={`${B}/cart`} className="flex items-center gap-2 rounded-full bg-[var(--forest)] text-[var(--paper)] pl-2 pr-4 py-2">
            سبد
            <span className="w-6 h-6 rounded-full bg-[var(--mustard)] text-[var(--ink)] grid place-items-center text-xs">{fa(count)}</span>
          </Link>
        </nav>
      </div>
      <div className="knit" style={{ ["--c" as string]: "rgba(198,93,59,.25)" }} />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-[var(--forest)] text-[var(--paper)]">
      <div className="knit" style={{ ["--c" as string]: "var(--bg)" }} />
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-3 text-sm leading-8">
        <div>
          <div className="hand text-3xl">دلوین</div>
          <p className="opacity-80 mt-2">پرداخت آنلاین نداریم. سفارش بدهید؛ تماس می‌گیریم و جوراب‌ها را با حوصله بسته‌بندی و پست می‌کنیم.</p>
        </div>
        <div>
          <div className="hand text-xl text-[var(--mustard)]">در تماس باشیم</div>
          <a className="block hover:underline" href={`tel:${SHOP_PHONE}`} dir="ltr">{SHOP_PHONE}</a>
          <a className="block hover:underline" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">کانال تلگرام</a>
        </div>
        <div>
          <div className="hand text-xl text-[var(--mustard)]">ارسال</div>
          <div className="opacity-80">آخر هر روز سفارش‌ها را به پست می‌سپاریم. هزینه‌ی ارسال تلفنی هماهنگ می‌شود.</div>
        </div>
      </div>
    </footer>
  );
}

export function Photo({ p, className = "" }: { p: Product; className?: string }) {
  const src = productPhoto(p);
  // Our own uploads (/img/...) go through Cloudflare Images (resized, AVIF/WebP).
  // External URLs are shown as-is.
  if (src.startsWith("/img/"))
    return <Image src={src} alt={p.title} width={600} height={600} sizes="(min-width: 768px) 33vw, 50vw" className={`object-cover ${className}`} />;
  // oxlint-disable-next-line nextjs/no-img-element
  if (src) return <img src={src} alt={p.title} className={`object-cover ${className}`} />;
  return <SockArt seed={p.id} colors={SOCK_COLORS} bg={TILES[p.id % TILES.length]} variant="flat" className={className} label={p.title} />;
}

export function Card({ p, onAdd, added }: { p: Product; onAdd: () => void; added: boolean }) {
  const ok = inStock(p);
  return (
    <div className="soft-card p-3 flex flex-col">
      <Link href={`${B}/product/${p.id}`} className="relative block rounded-[20px] overflow-hidden">
        <Photo p={p} className={`w-full aspect-square ${ok ? "" : "opacity-55 saturate-50"}`} />
        {!ok && <span className="absolute bottom-3 right-3 tag text-xs font-bold text-[var(--soft)]">تمام شده</span>}
      </Link>
      <div className="px-2 pt-3 pb-1 flex-1 flex flex-col">
        <div className="text-xs font-bold text-[var(--terra)]">{categoryFa(p.category)}</div>
        <Link href={`${B}/product/${p.id}`} className="hand text-xl leading-8 mt-0.5 line-clamp-2">{p.title}</Link>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="font-black text-[15px]">{ok ? formatPrice(p.price) : <span className="text-[var(--soft)]">ناموجود</span>}</span>
          <button
            disabled={!ok}
            onClick={onAdd}
            aria-label="افزودن به سبد"
            className={`w-11 h-11 rounded-full grid place-items-center text-xl font-black text-white transition disabled:opacity-30 ${added ? "bg-[var(--forest)] btn-pop" : "bg-[var(--terra)] hover:scale-105"}`}
          >
            {added ? "✓" : "+"}
          </button>
        </div>
      </div>
    </div>
  );
}
