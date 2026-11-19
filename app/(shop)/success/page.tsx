"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fa } from "@/lib/shop";
import { POST_EXPLAINER, SHOP_PHONE, TELEGRAM_CHANNEL } from "@/lib/site";
import SockArt from "@/components/SockArt";
import { SOCK_COLORS } from "../_ui";

function Inner() {
  const id = useSearchParams().get("id");
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="soft-card p-8 md:p-10 text-center">
        <SockArt seed={3} colors={SOCK_COLORS} className="w-32 mx-auto float" />
        <h1 className="hand text-4xl md:text-5xl mt-2">ممنون که به ما سپردید 🧡</h1>
        {id && <div className="mt-4 tag inline-block !bg-[var(--bg)] font-bold">سفارش شماره‌ی {fa(Number(id))}</div>}
        <p className="mt-6 leading-9 text-[var(--soft)]">{POST_EXPLAINER}</p>
        <div className="mt-6 text-sm font-bold flex justify-center gap-5">
          <a href={`tel:${SHOP_PHONE}`} dir="ltr" className="underline">{SHOP_PHONE}</a>
          <a href={TELEGRAM_CHANNEL} target="_blank" rel="noreferrer" className="underline">کانال تلگرام</a>
        </div>
        <Link href="/" className="btn inline-block mt-8">برگشت به فروشگاه</Link>
      </div>
    </div>
  );
}

export default function ShopSuccess() {
  return <Suspense><Inner /></Suspense>;
}
