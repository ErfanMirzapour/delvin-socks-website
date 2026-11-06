"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fa } from "@/lib/shop";
import { POST_EXPLAINER, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import { B } from "../_ui";

function Inner() {
  const id = useSearchParams().get("id");
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="mx-auto w-20 h-20 rounded-full grad grid place-items-center text-4xl shadow-[0_0_60px_rgba(124,92,255,.6)]">✓</div>
      <h1 className="text-4xl font-bold mt-8">سفارش ثبت شد</h1>
      {id && <div className="mt-3 text-[var(--dim)] num">کد پیگیری: <span className="text-white font-semibold">{fa(Number(id))}</span></div>}
      <p className="mt-8 glass rounded-2xl p-5 text-[var(--dim)] leading-8 text-sm">{POST_EXPLAINER}</p>
      <div className="mt-6 flex justify-center gap-5 text-sm text-[var(--dim)]">
        <a href={`tel:${SHOP_PHONE}`} dir="ltr" className="hover:text-white">{SHOP_PHONE}</a>
        <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="hover:text-white">تلگرام</a>
      </div>
      <Link href={B} className="btn inline-block mt-10">بازگشت به محصولات</Link>
    </div>
  );
}

export default function V5Success() {
  return <Suspense><Inner /></Suspense>;
}
