import type { Metadata } from "next";
import { Readex_Pro } from "next/font/google";
import { Header, Footer } from "./_ui";
import "./v5.css";

const readex = Readex_Pro({ subsets: ["arabic", "latin"], weight: ["300", "400", "500", "600", "700"], variable: "--v5-sans" });

export const metadata: Metadata = {
  title: "delvin — جوراب هوشمندانه",
  description: "جوراب‌های فنی و راحت مردانه، زنانه و بچگانه — ثبت سفارش و ارسال با پست",
};

export default function V5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v5 ${readex.variable} flex-1 flex flex-col`}>
      <div className="v5-glow" aria-hidden />
      <Header />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}
