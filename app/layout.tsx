import type { Metadata } from "next";
import { El_Messiri, Vazirmatn } from "next/font/google";
import "./globals.css";
import "./knit.css";
import { CartProvider } from "@/lib/cart";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"], weight: ["400", "500", "700", "900"] });
const messiri = El_Messiri({ subsets: ["arabic", "latin"], weight: ["500", "600", "700"], variable: "--knit-display" });

export const metadata: Metadata = {
  title: "دلوین | جوراب گرم خانگی",
  description: "جوراب‌های گرم و نرم مردانه، زنانه و بچگانه — ثبت سفارش و ارسال با پست",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} ${messiri.variable} knit min-h-screen flex flex-col`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
