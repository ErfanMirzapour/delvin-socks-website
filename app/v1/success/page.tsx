"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fa } from "@/lib/shop";
import { POST_EXPLAINER, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";
import { B, SOCK_COLORS } from "../_ui";

function Inner() {
  const id = useSearchParams().get("id");
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-center">
      <div className="flex justify-center -space-x-6">
        <SockArt seed={1} colors={SOCK_COLORS} variant="bold" line="#2b1b3d" className="w-28 rotate-[-15deg]" />
        <SockArt seed={6} colors={SOCK_COLORS} variant="bold" line="#2b1b3d" className="w-28 rotate-[15deg]" />
      </div>
      <h1 className="display text-5xl mt-4">ایول! سفارش ثبت شد</h1>
      {id && <div className="mt-4 inline-block chunky-sm rounded-full bg-[var(--lemon)] px-5 py-1.5 font-black">شماره سفارش: {fa(Number(id))}</div>}
      <p className="mt-6 chunky rounded-[28px] bg-white p-5 leading-9 font-medium">{POST_EXPLAINER}</p>
      <div className="mt-6 text-sm font-bold leading-8">
        تلفن: <a className="underline" href={`tel:${SHOP_PHONE}`} dir="ltr">{SHOP_PHONE}</a> · <a className="underline" href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer">کانال تلگرام</a>
      </div>
      <Link href={B} className="inline-block mt-6 chunky press rounded-full bg-[var(--orange)] text-white px-8 py-3 font-black">برگشت به فروشگاه</Link>
    </div>
  );
}

export default function V1Success() {
  return <Suspense><Inner /></Suspense>;
}
