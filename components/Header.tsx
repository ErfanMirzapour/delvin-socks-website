"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { usePathname } from "next/navigation";

export default function Header() {
  const { count } = useCart();
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <header className="sticky top-0 z-40 border-b bg-[#FFFDF8]/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="text-xl font-black">
          🧦 جوراب‌فروشی
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link className="px-3 py-2 rounded-full hover:bg-black/5" href="/">فروشگاه</Link>
          <Link className="px-3 py-2 rounded-full hover:bg-black/5" href="/about">درباره ما</Link>
          <Link
            href="/cart"
            className="relative px-4 py-2 rounded-full bg-black text-white font-bold"
          >
            سبد خرید
            {count > 0 && (
              <span className="absolute -top-2 -left-2 min-w-6 h-6 px-1 rounded-full bg-red-600 text-white text-xs grid place-items-center">
                {count.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
