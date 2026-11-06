import type { Metadata } from "next";
import { El_Messiri } from "next/font/google";
import { Header, Footer } from "./_ui";
import "./v4.css";

const messiri = El_Messiri({ subsets: ["arabic", "latin"], weight: ["500", "600", "700"], variable: "--v4-display" });

export const metadata: Metadata = {
  title: "دلوین | جوراب گرم خانگی",
  description: "جوراب‌های گرم و نرم مردانه، زنانه و بچگانه — ثبت سفارش و ارسال با پست",
};

export default function V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v4 ${messiri.variable} flex-1 flex flex-col`}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
