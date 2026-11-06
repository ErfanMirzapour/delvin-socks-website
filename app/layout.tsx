import type { Metadata } from "next";
// Fonts are bundled from npm (Fontsource) instead of next/font/google:
// the Cloudflare build can't download Google Fonts reliably.
import "@fontsource-variable/vazirmatn/index.css";
import "@fontsource/el-messiri/arabic-500.css";
import "@fontsource/el-messiri/arabic-600.css";
import "@fontsource/el-messiri/arabic-700.css";
import "@fontsource/el-messiri/latin-500.css";
import "@fontsource/el-messiri/latin-600.css";
import "@fontsource/el-messiri/latin-700.css";
import "./globals.css";
import "./knit.css";
import { CartProvider } from "@/lib/cart";

export const metadata: Metadata = {
  title: "دلوین | جوراب گرم خانگی",
  description: "جوراب‌های گرم و نرم مردانه، زنانه و بچگانه — ثبت سفارش و ارسال با پست",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="knit min-h-screen flex flex-col">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
