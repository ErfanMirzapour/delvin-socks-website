import type { Metadata } from "next";
import { Markazi_Text } from "next/font/google";
import { Header, Footer } from "./_ui";
import "./v2.css";

const serif = Markazi_Text({ subsets: ["arabic", "latin"], weight: ["400", "500", "600", "700"], variable: "--v2-serif" });

export const metadata: Metadata = {
  title: "دلوین | جوراب، با دقت",
  description: "جوراب‌های باکیفیت مردانه، زنانه و بچگانه — ثبت سفارش و ارسال با پست",
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v2 ${serif.variable} flex-1 flex flex-col`}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
