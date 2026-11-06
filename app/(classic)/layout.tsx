import Header from "@/components/Header";
import Footer from "@/components/Footer";

// The current live storefront. Kept as-is while the five redesigns at
// /v1–/v5 are reviewed.
export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
