import { NextResponse } from "next/server";
import { getDb, type OrderItem } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { notifyTelegram } from "@/lib/telegram";

const PHONE_RE = /^09\d{9}$/;
const POSTAL_RE = /^\d{10}$/;

function normalizePhone(p: string): string {
  return p.replace(/[\s-]/g, "").replace(/۰|٠/g, "0").replace(/۱|١/g, "1").replace(/۲|٢/g, "2").replace(/۳|٣/g, "3").replace(/۴|٤/g, "4").replace(/۵|٥/g, "5").replace(/۶|٦/g, "6").replace(/۷|٧/g, "7").replace(/۸|٨/g, "8").replace(/۹|٩/g, "9");
}

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 200")
    .all() as Array<Record<string, unknown>>;
  return NextResponse.json(
    rows.map((r) => ({ ...r, items: JSON.parse(String(r.items_json)) }))
  );
}

export async function POST(req: Request) {
  const b = await req.json();
  const fullname = String(b.fullname || "").trim();
  const phone = normalizePhone(String(b.phone || "").trim());
  const address = String(b.address || "").trim();
  const postal = String(b.postal_code || "").trim().replace(/[^0-9۰-۹٠-٩]/g, "");
  const postalEn = postal.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const note = String(b.note || "");
  const lines = Array.isArray(b.items) ? b.items : [];

  if (fullname.length < 2)
    return NextResponse.json({ error: "نام و نام خانوادگی لازم است" }, { status: 400 });
  if (!PHONE_RE.test(phone))
    return NextResponse.json({ error: "شماره تماس معتبر نیست (مثل 09123456789)" }, { status: 400 });
  if (address.length < 5)
    return NextResponse.json({ error: "آدرس لازم است" }, { status: 400 });
  if (!POSTAL_RE.test(postalEn))
    return NextResponse.json({ error: "کد پستی باید ۱۰ رقم باشد" }, { status: 400 });
  if (lines.length === 0)
    return NextResponse.json({ error: "سبد خرید خالی است" }, { status: 400 });

  const db = getDb();
  // validate stock + compute total in a transaction
  const ids = lines.map((l: { id: number }) => Number(l.id));
  const placeholders = ids.map(() => "?").join(",");
  const products = db
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders})`)
    .all(...ids) as Array<{ id: number; title: string; price: number; stock: number }>;
  const pmap = new Map(products.map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  let total = 0;
  for (const l of lines) {
    const p = pmap.get(Number(l.id));
    const qty = Math.min(99, Math.max(1, Number(l.qty || 1)));
    if (!p) return NextResponse.json({ error: "محصولی یافت نشد" }, { status: 400 });
    if (p.stock < qty)
      return NextResponse.json({ error: `موجودی «${p.title}» کافی نیست` }, { status: 400 });
    items.push({ product_id: p.id, title: p.title, price: p.price, qty });
    total += p.price * qty;
  }

  const tx = db.transaction(() => {
    for (const it of items)
      db.prepare("UPDATE products SET stock = stock - ? WHERE id=?").run(it.qty, it.product_id);
    return db
      .prepare(
        "INSERT INTO orders (fullname, phone, address, postal_code, note, items_json, total) VALUES (?,?,?,?,?,?,?)"
      )
      .run(fullname, phone, address, postalEn, note, JSON.stringify(items), total);
  });
  const r = tx();

  const order = {
    id: Number(r.lastInsertRowid),
    fullname, phone, address, postal_code: postalEn, note,
    items, total, status: "new", created_at: new Date().toLocaleString("fa-IR"),
  };
  // fire-and-forget telegram
  notifyTelegram(order as never).catch(() => {});
  return NextResponse.json({ id: order.id, total });
}
