import Link from "next/link";

// Temporary index of the five redesign candidates. Remove once one is picked.
const DESIGNS = [
  { href: "/v1", name: "شاد و رنگی", en: "Pom — playful", colors: ["#ff7a3d", "#ff8fc2", "#ffd84d", "#2b1b3d"], bg: "#fff6ec", ink: "#2b1b3d" },
  { href: "/v2", name: "لوکس و مینیمال", en: "Atelier — premium", colors: ["#f5f2ec", "#161514", "#9a6b3f", "#ddd7cc"], bg: "#f5f2ec", ink: "#161514" },
  { href: "/v3", name: "خیابانی و جسور", en: "Street — bold", colors: ["#0b0b0b", "#c6ff00", "#f4f4f0", "#ff3b1f"], bg: "#0b0b0b", ink: "#f4f4f0" },
  { href: "/v4", name: "گرم و دست‌ساز", en: "Knit — cozy", colors: ["#c65d3b", "#2f4a3a", "#d9a23b", "#f3eadb"], bg: "#f3eadb", ink: "#3a2a20" },
  { href: "/v5", name: "مدرن و فنی", en: "Lab — modern tech", colors: ["#090c1a", "#7c5cff", "#2ee6d6", "#eef0ff"], bg: "#090c1a", ink: "#eef0ff" },
];

export const metadata = { title: "Delvin — پنج طرح", robots: { index: false } };

export default function Designs() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 w-full">
      <h1 className="text-3xl font-black">پنج طرح برای دلوین</h1>
      <p className="mt-2 text-neutral-600 leading-8">هر طرح یک فروشگاه کامل و قابل استفاده است: صفحه‌ی اصلی، محصول، سبد، ثبت سفارش، تأیید و درباره. سبد خرید بین همه‌ی طرح‌ها مشترک است.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {DESIGNS.map((d, i) => (
          <Link key={d.href} href={d.href} className="rounded-3xl p-6 block border border-black/10 hover:-translate-y-0.5 transition" style={{ background: d.bg, color: d.ink }}>
            <div className="text-sm opacity-70" dir="ltr">v{i + 1} · {d.en}</div>
            <div className="text-2xl font-black mt-1">{d.name}</div>
            <div className="mt-5 flex gap-2">
              {d.colors.map((c) => <span key={c} className="w-8 h-8 rounded-full border border-black/15" style={{ background: c }} />)}
            </div>
            <div className="mt-5 text-sm font-bold">مشاهده ←</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
