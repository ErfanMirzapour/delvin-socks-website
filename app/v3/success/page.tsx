"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fa } from "@/lib/shop";
import { POST_EXPLAINER, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import { B, btn } from "../_ui";

function Inner() {
  const id = useSearchParams().get("id");
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16">
      <div className="mono text-xs text-[var(--lime)]">● Order confirmed</div>
      <h1 className="mega text-[72px] md:text-[140px] mt-4">ثبت<br /><span className="text-[var(--lime)]">شد.</span></h1>
      {id && <div className="mt-6 inline-block bg-[var(--ink)] text-black mega text-2xl px-4 py-2">#{fa(Number(id))}</div>}
      <p className="mt-8 max-w-2xl leading-9 text-[var(--grey)]">{POST_EXPLAINER}</p>
      <div className="mt-6 flex gap-6 font-black text-sm">
        <a href={`tel:${SHOP_PHONE}`} dir="ltr" className="hover:text-[var(--lime)]">{SHOP_PHONE}</a>
        <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="hover:text-[var(--lime)]">تلگرام ↗</a>
      </div>
      <Link href={B} className={`${btn} inline-block mt-10`}>برگرد به شاپ</Link>
    </div>
  );
}

export default function V3Success() {
  return <Suspense><Inner /></Suspense>;
}
