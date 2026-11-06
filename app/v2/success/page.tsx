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
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <div className="latin text-[var(--bronze)]" dir="ltr">Thank you</div>
      <h1 className="serif text-6xl mt-4">سپاسگزاریم.</h1>
      {id && <div className="mt-4 text-[14px] text-[var(--stone)]">سفارش شماره‌ی {fa(Number(id))}</div>}
      <p className="mt-10 leading-9 text-[15px] border-y rule py-8">{POST_EXPLAINER}</p>
      <div className="mt-8 text-[13px] text-[var(--stone)] flex justify-center gap-6">
        <a className="ulink" href={`tel:${SHOP_PHONE}`} dir="ltr">{SHOP_PHONE}</a>
        <a className="ulink" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">کانال تلگرام</a>
      </div>
      <Link href={B} className="btn inline-block mt-12">بازگشت به مجموعه</Link>
    </div>
  );
}

export default function V2Success() {
  return <Suspense><Inner /></Suspense>;
}
