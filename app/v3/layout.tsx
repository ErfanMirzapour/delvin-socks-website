import type { Metadata } from "next";
import { Alexandria } from "next/font/google";
import { Header, Footer } from "./_ui";
import "./v3.css";

const kufi = Alexandria({ subsets: ["arabic", "latin"], weight: ["500", "700", "900"], variable: "--v3-kufi" });

export const metadata: Metadata = {
  title: "DELVIN® | جوراب خیابانی",
  description: "جوراب‌های اسپرت و خیابانی مردانه، زنانه و بچگانه — ثبت سفارش و ارسال با پست",
};

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v3 ${kufi.variable} flex-1 flex flex-col`}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
