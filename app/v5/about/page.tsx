"use client";
import { SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";
import { SOCK_COLORS } from "../_ui";

export default function V5About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="glass rounded-full px-3 py-1 text-xs text-[var(--dim)]">درباره‌ی دلوین</span>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.25] mt-5 tracking-tight">چیزی ساده،<br /><span className="grad-text">درست ساخته‌شده.</span></h1>
          <p className="mt-6 text-[var(--dim)] leading-8">
            دلوین یک فروشگاه جوراب کوچک است با سه دسته‌ی مردانه، زنانه و بچگانه. پرداخت آنلاین نداریم:
            شما سفارش را ثبت می‌کنید، ما تماس می‌گیریم، هزینه‌ی ارسال را هماهنگ می‌کنیم و در پایان همان روز با پست می‌فرستیم.
          </p>
        </div>
        <div className="relative h-72">
          <div className="absolute inset-0 gridbg" />
          <SockArt seed={5} colors={SOCK_COLORS} className="absolute inset-0 w-full h-full drop-shadow-[0_20px_40px_rgba(46,230,214,.3)]" />
        </div>
      </div>
      <div className="mt-14 grid sm:grid-cols-3 gap-3">
        {[["۳", "دسته‌ی محصول"], ["۱", "روز تا تحویل به پست"], ["۰", "پرداخت آنلاین"]].map(([n, t]) => (
          <div key={t} className="glass rounded-2xl p-6">
            <div className="text-5xl font-bold grad-text">{n}</div>
            <div className="text-sm text-[var(--dim)] mt-2">{t}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-3">
        <a href={`tel:${SHOP_PHONE}`} className="glass gborder rounded-2xl p-6 block hover:bg-white/[.07]">
          <div className="text-sm text-[var(--dim)]">تلفن</div>
          <div className="text-2xl font-semibold mt-1 num" dir="ltr">{SHOP_PHONE}</div>
        </a>
        <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="rounded-2xl p-6 block grad">
          <div className="text-sm opacity-80">تلگرام</div>
          <div className="text-2xl font-semibold mt-1">عضویت در کانال ←</div>
        </a>
      </div>
    </div>
  );
}
