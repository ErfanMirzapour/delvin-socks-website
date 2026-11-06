import { SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-black">درباره ما</h1>
      <p className="mt-4 leading-9 text-neutral-700">
        ما یک جوراب‌فروشی کوچکیم با سه دسته مردانه، زنانه و بچگانه. پرداخت آنلاین نداریم:
        شما مدل‌ها را انتخاب می‌کنید، سبد را ثبت می‌کنید و مشخصات (نام، تماس، آدرس، کدپستی) را می‌دهید.
        ما در پایان روز سفارش‌ها را با پست ارسال می‌کنیم و برای هماهنگی با شما تماس می‌گیریم.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <a href={`tel:${SHOP_PHONE}`} className="rounded-3xl border p-6 bg-white hover:shadow">
          <div className="text-sm text-neutral-500 font-bold">تلفن تماس</div>
          <div className="text-2xl font-black mt-1" dir="ltr">{SHOP_PHONE}</div>
        </a>
        <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="rounded-3xl border p-6 bg-white hover:shadow">
          <div className="text-sm text-neutral-500 font-bold">کانال تلگرام</div>
          <div className="text-lg font-black mt-1 underline">عضویت در کانال ✈</div>
        </a>
      </div>
    </div>
  );
}
