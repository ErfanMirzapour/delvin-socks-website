"use client";
import { SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";
import { SOCK_COLORS } from "../_ui";

export default function V2About() {
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-10 py-16">
      <div className="grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <div className="latin text-[var(--bronze)]" dir="ltr">About Delvin</div>
          <h1 className="serif text-5xl md:text-7xl leading-[1.1] mt-5">چیزهای کوچک،<br />با دقت ساخته می‌شوند.</h1>
          <p className="mt-8 leading-9 text-[16px] text-[var(--stone)] max-w-xl">
            دلوین یک جوراب‌فروشی کوچک است با سه دسته‌ی مردانه، زنانه و بچگانه. پرداخت آنلاین نداریم:
            شما مدل‌ها را انتخاب می‌کنید و مشخصات ارسال را ثبت می‌کنید. ما تماس می‌گیریم، هزینه‌ی ارسال را هماهنگ می‌کنیم
            و در پایان همان روز با پست می‌فرستیم.
          </p>
        </div>
        <div className="md:col-span-5 bg-[var(--tile)] aspect-square">
          <SockArt seed={7} colors={SOCK_COLORS} className="w-full h-full p-12" />
        </div>
      </div>
      <div className="mt-24 grid md:grid-cols-3 border-t rule">
        {[["۰۱", "انتخاب", "مدل و تعداد را به سبد بیفزایید."], ["۰۲", "ثبت", "نام، تماس، نشانی و کد پستی را بدهید."], ["۰۳", "ارسال", "تماس می‌گیریم و با پست می‌فرستیم."]].map(([n, t, d]) => (
          <div key={n} className="py-8 md:pl-8 border-b md:border-b-0 rule">
            <div className="serif text-3xl text-[var(--bronze)]">{n}</div>
            <div className="serif text-3xl mt-2">{t}</div>
            <p className="text-[14px] text-[var(--stone)] mt-2 leading-7">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 grid md:grid-cols-2 gap-5">
        <a href={`tel:${SHOP_PHONE}`} className="bg-[var(--tile)] p-8 block group">
          <div className="latin text-[var(--stone)]" dir="ltr">Telephone</div>
          <div className="serif text-4xl mt-3" dir="ltr">{SHOP_PHONE}</div>
        </a>
        <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="bg-[var(--ink)] text-[var(--bg)] p-8 block">
          <div className="latin opacity-60" dir="ltr">Telegram</div>
          <div className="serif text-4xl mt-3">کانال دلوین ←</div>
        </a>
      </div>
    </div>
  );
}
