import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const vazir = Vazirmatn({ subsets: ["arabic", "latin"], weight: ["400", "500", "700", "900"] });

export const metadata: Metadata = {
  title: "Delvin Socks | جوراب‌فروشی",
  description: "فروشگاه جوراب مردانه، زنانه و بچگانه — ثبت سفارش با ارسال پستی",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} min-h-screen flex flex-col`}>
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
