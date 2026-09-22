"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { POST_EXPLAINER, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";

function Inner() {
  const q = useSearchParams();
  const id = q.get("id");
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <div className="text-6xl">🎉</div>
      <h1 className="text-3xl font-black mt-4">سفارش ثبت شد!</h1>
      {id && <div className="mt-2 font-black">شماره سفارش: {Number(id).toLocaleString("fa-IR")}</div>}
      <p className="mt-4 leading-9 bg-green-50 border border-green-200 rounded-3xl p-5 text-[15px]">{POST_EXPLAINER}</p>
      <div className="mt-5 text-sm leading-8 text-neutral-600">
        تلفن ما: <a className="underline font-bold" href={`tel:${SHOP_PHONE}`}>{SHOP_PHONE}</a>
        <br />کانال تلگرام: <a className="underline font-bold" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">مشاهده کانال</a>
      </div>
      <Link href="/" className="inline-block mt-6 px-8 py-3 rounded-full bg-black text-white font-black">بازگشت به فروشگاه</Link>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense><Inner /></Suspense>;
}
