import type { Metadata } from "next";
import { Lalezar } from "next/font/google";
import { Header, Footer } from "./_ui";
import "./v1.css";

const display = Lalezar({ subsets: ["arabic", "latin"], weight: "400", variable: "--v1-display" });

export const metadata: Metadata = {
  title: "دلوین | جوراب‌های شاد",
  description: "جوراب‌های رنگی مردانه، زنانه و بچگانه — ثبت سفارش و ارسال با پست",
};

export default function V1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v1 ${display.variable} flex-1 flex flex-col`}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
