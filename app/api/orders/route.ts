import { NextResponse } from "next/server";
import { ensureSchema, seedIfEmpty, type OrderItem } from "@/lib/db";
import { cfContext, isAdmin } from "@/lib/auth";
import { notifyTelegram } from "@/lib/telegram";
import crypto from "node:crypto";
import { readJson, rateLimit } from "@/lib/request";

export const dynamic = "force-dynamic";

const PHONE_RE = /^09\d{9}$/;
const POSTAL_RE = /^\d{10}$/;

function normalizePhone(p: string): string {
  return p.replace(/[\s-]/g, "").replace(/۰|٠/g, "0").replace(/۱|١/g, "1").replace(/۲|٢/g, "2").replace(/۳|٣/g, "3").replace(/۴|٤/g, "4").replace(/۵|٥/g, "5").replace(/۶|٦/g, "6").replace(/۷|٧/g, "7").replace(/۸|٨/g, "8").replace(/۹|٩/g, "9");
}

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const db = await ensureSchema();
  const { results } = await db
    .prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 200")
    .all<Record<string, unknown>>();
  return NextResponse.json(
    results.map((r) => ({ ...r, items: JSON.parse(String(r.items_json)) }))
  );
}

export async function POST(req: Request) {
  if (!(await rateLimit(req, "order", 20, 3600))) return NextResponse.json({ error: "تعداد درخواست‌ها بیش از حد مجاز است؛ بعداً دوباره تلاش کنید" }, { status: 429 });
  let parsed: unknown;
  try { parsed = await readJson(req, 16_384); } catch (error) {
    return NextResponse.json({ error: "درخواست نامعتبر یا بیش از حد بزرگ است" }, { status: String(error).includes("body_too_large") ? 413 : 400 });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  const raw = JSON.stringify(parsed);
  const b = parsed as {
    website?: string;
    fullname?: string;
    phone?: string;
    address?: string;
    postal_code?: string;
    note?: string;
    items?: Array<{ id: number; qty?: number }>;
  };
  if (b.website) return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  const fullname = String(b.fullname || "").trim();
  const phone = normalizePhone(String(b.phone || "").trim());
  const address = String(b.address || "").trim();
  const postal = String(b.postal_code || "").trim().replace(/[^0-9۰-۹٠-٩]/g, "");
  const postalEn = postal.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const note = String(b.note || "");
  const lines = Array.isArray(b.items) ? b.items : [];

  if (fullname.length > 120 || phone.length > 30 || address.length > 1000 || postal.length > 20 || note.length > 1000 || lines.length > 50)
    return NextResponse.json({ error: "اطلاعات سفارش بیش از حد مجاز است" }, { status: 400 });
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

  const key = req.headers.get("idempotency-key");
  if (!key || !/^[a-f0-9-]{36}$/.test(key)) return NextResponse.json({ error: "شناسه سفارش نامعتبر است" }, { status: 400 });
  const payloadHash = crypto.createHash("sha256").update(raw).digest("hex");
  const db = await ensureSchema();
  async function previous() {
    return db.prepare("SELECT r.payload_hash, o.id, o.total FROM order_requests r JOIN orders o ON o.id=r.order_id WHERE r.request_key=?").bind(key).first<{ payload_hash: string; id: number; total: number }>();
  }
  const existing = await previous();
  if (existing) return existing.payload_hash === payloadHash ? NextResponse.json({ id: existing.id, total: existing.total }) : NextResponse.json({ error: "شناسه سفارش قبلاً استفاده شده است" }, { status: 409 });
  await seedIfEmpty(db);
  // NOTE: stock is NOT decremented here. It is decremented only when an
  // admin marks the order "sent" (PATCH /api/orders/[id]).
  const quantities = new Map<number, number>();
  for (const line of lines) {
    if (!line || !Number.isSafeInteger(line.id) || line.id <= 0 ||
        !Number.isSafeInteger(line.qty) || line.qty! <= 0 || line.qty! > 99)
      return NextResponse.json({ error: "محصول یا تعداد نامعتبر است" }, { status: 400 });
    const qty = (quantities.get(line.id) || 0) + line.qty!;
    if (qty > 99) return NextResponse.json({ error: "تعداد محصول بیش از حد مجاز است" }, { status: 400 });
    quantities.set(line.id, qty);
  }
  const ids = [...quantities.keys()];
  const placeholders = ids.map(() => "?").join(",");
  const { results: products } = await db
    .prepare(`SELECT id, title, price, stock FROM products WHERE id IN (${placeholders})`)
    .bind(...ids)
    .all<{ id: number; title: string; price: number; stock: number }>();
  const pmap = new Map(products.map((p) => [p.id, p]));
  const items: OrderItem[] = [];
  let total = 0;
  for (const [id, qty] of quantities) {
    const p = pmap.get(id);
    if (!p) return NextResponse.json({ error: "محصولی یافت نشد" }, { status: 400 });
    if (p.stock < qty)
      return NextResponse.json({ error: `موجودی «${p.title}» کافی نیست` }, { status: 400 });
    items.push({ product_id: p.id, title: p.title, price: p.price, qty });
    total += p.price * qty;
  }

  let orderId: number;
  try {
    const [insert] = await db.batch([
      db.prepare("INSERT INTO orders (fullname, phone, address, postal_code, note, items_json, total) VALUES (?,?,?,?,?,?,?)")
        .bind(fullname, phone, address, postalEn, note, JSON.stringify(items), total),
      db.prepare("INSERT INTO order_requests (request_key, order_id, payload_hash) VALUES (?,last_insert_rowid(),?)").bind(key, payloadHash),
    ]);
    orderId = Number(insert.meta.last_row_id);
  } catch (error) {
    const prior = await previous();
    if (prior) return prior.payload_hash === payloadHash ? NextResponse.json({ id: prior.id, total: prior.total }) : NextResponse.json({ error: "شناسه سفارش قبلاً استفاده شده است" }, { status: 409 });
    throw error;
  }

  const order = {
    id: orderId,
    fullname, phone, address, postal_code: postalEn, note,
    items, total, status: "new", created_at: new Date().toLocaleString("fa-IR"),
  };
  // Fire-and-forget Telegram (kept alive via waitUntil on Workers).
  try {
    cfContext().ctx.waitUntil(notifyTelegram(order).catch(() => {}));
  } catch {
    notifyTelegram(order).catch(() => {});
  }
  return NextResponse.json({ id: order.id, total });
}
