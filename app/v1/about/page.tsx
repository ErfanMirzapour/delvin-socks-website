"use client";
import { SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";
import { SOCK_COLORS } from "../_ui";

const STEPS = [
  ["انتخاب کنید", "جوراب‌های دلخواه را به سبد اضافه کنید.", "var(--pink)"],
  ["ثبت کنید", "نام، شماره، آدرس و کد پستی را وارد کنید.", "var(--sky)"],
  ["تحویل بگیرید", "تماس می‌گیریم و آخر همان روز با پست می‌فرستیم.", "var(--mint)"],
];

export default function V1About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid md:grid-cols-[1fr_220px] gap-6 items-center">
        <div>
          <h1 className="display text-5xl md:text-6xl">ما دلوینیم 👋</h1>
          <p className="mt-4 leading-9 font-medium text-lg">
            یک جوراب‌فروشی کوچک که فکر می‌کند جوراب نباید خسته‌کننده باشد. برای آقایان، خانم‌ها و بچه‌ها جوراب نرم و رنگی داریم.
            پرداخت آنلاین نداریم: سفارش می‌دهید، تماس می‌گیریم و با پست می‌فرستیم.
          </p>
        </div>
        <SockArt seed={3} colors={SOCK_COLORS} variant="bold" line="#2b1b3d" className="w-48 mx-auto rotate-[10deg]" />
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map(([t, d, bg], i) => (
          <div key={t} className="chunky rounded-[28px] p-6" style={{ background: bg }}>
            <div className="display text-5xl">{["۱", "۲", "۳"][i]}</div>
            <div className="display text-2xl mt-2">{t}</div>
            <p className="mt-1 font-bold leading-7">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <a href={`tel:${SHOP_PHONE}`} className="chunky press rounded-[28px] bg-white p-6 block">
          <div className="text-sm font-bold text-[var(--muted)]">زنگ بزنید</div>
          <div className="display text-3xl mt-1" dir="ltr">{SHOP_PHONE}</div>
        </a>
        <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="chunky press rounded-[28px] bg-[var(--lemon)] p-6 block">
          <div className="text-sm font-bold">تلگرام</div>
          <div className="display text-3xl mt-1">عضو کانال شوید ✈</div>
        </a>
      </div>
    </div>
  );
}
