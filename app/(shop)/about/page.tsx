"use client";
import { SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";
import { SOCK_COLORS } from "../_ui";

export default function ShopAbout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="soft-card p-8 md:p-12 grid md:grid-cols-[1fr_240px] gap-8 items-center">
        <div>
          <h1 className="hand text-5xl leading-[1.3]">قصه‌ی دلوین</h1>
          <p className="mt-5 leading-9 text-[var(--soft)] text-[16px]">
            دلوین از یک خانه شروع شد؛ از این فکر که جوراب خوب، یک چیز کوچک است که کل روز را گرم‌تر می‌کند.
            حالا برای آقایان، خانم‌ها و بچه‌ها جوراب داریم. پرداخت آنلاین نداریم: شما سفارش می‌دهید،
            ما تماس می‌گیریم و آخر همان روز با پست می‌فرستیم.
          </p>
        </div>
        <SockArt seed={6} colors={SOCK_COLORS} className="w-52 mx-auto float" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[["۱", "انتخاب", "جوراب‌ها را به سبد اضافه کنید."], ["۲", "نشانی", "نام، تلفن، نشانی و کد پستی را بنویسید."], ["۳", "تحویل", "تماس می‌گیریم و با پست می‌فرستیم."]].map(([n, t, d], i) => (
          <div key={n} className="rounded-[26px] p-6 text-[var(--paper)]" style={{ background: ["var(--terra)", "var(--forest)", "var(--mustard)"][i] }}>
            <div className="hand text-5xl opacity-70">{n}</div>
            <div className="hand text-2xl mt-1">{t}</div>
            <p className="mt-1 text-sm leading-7 opacity-90">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <a href={`tel:${SHOP_PHONE}`} className="soft-card p-6 block">
          <div className="text-sm text-[var(--soft)] font-bold">☎️ تلفن</div>
          <div className="hand text-3xl mt-1" dir="ltr">{SHOP_PHONE}</div>
        </a>
        <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="soft-card p-6 block">
          <div className="text-sm text-[var(--soft)] font-bold">✈️ تلگرام</div>
          <div className="hand text-3xl mt-1">عضویت در کانال</div>
        </a>
      </div>
    </div>
  );
}
