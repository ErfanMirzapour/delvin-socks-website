"use client";
import { SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import { Ticker } from "../_ui";

export default function V3About() {
  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-4 py-12">
        <div className="mono text-xs text-[var(--lime)]">About / Manifesto</div>
        <h1 className="mega text-6xl md:text-[120px] mt-4">جوراب<br />حرف<br /><span className="text-[var(--lime)]">داره.</span></h1>
        <p className="mt-10 max-w-2xl text-lg leading-9 text-[var(--grey)] font-medium">
          دلوین یه جوراب‌فروشی کوچیکه برای آقایون، خانم‌ها و بچه‌ها. پرداخت آنلاین نداریم:
          انتخاب می‌کنی، آدرس می‌دی، ما زنگ می‌زنیم و آخر همون روز پست می‌کنیم. ساده.
        </p>
      </div>
      <Ticker text="انتخاب کن — آدرس بده — تحویل بگیر" className="py-4 bg-[var(--lime)] text-black mega text-2xl border-y-2 border-black" />
      <div className="mx-auto max-w-[1400px] px-4 mt-12 grid md:grid-cols-2 pt-[2px] pr-[2px]">
        <a href={`tel:${SHOP_PHONE}`} className="border-2 border-[var(--ink)] -mt-[2px] -mr-[2px] p-8 hover:bg-[var(--ink)] hover:text-black block">
          <div className="mono text-xs opacity-60">Call</div>
          <div className="mega text-4xl md:text-5xl mt-3" dir="ltr">{SHOP_PHONE}</div>
        </a>
        <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="border-2 border-[var(--ink)] -mt-[2px] -mr-[2px] p-8 bg-[var(--lime)] text-black block">
          <div className="mono text-xs opacity-60">Telegram</div>
          <div className="mega text-4xl md:text-5xl mt-3">کانال ↗</div>
        </a>
      </div>
    </div>
  );
}
