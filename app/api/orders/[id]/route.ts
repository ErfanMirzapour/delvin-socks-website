import { readJson } from "@/lib/request";
import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const { id } = await params;
  let parsed: unknown;
  try { parsed = await readJson(req, 16_384); } catch { return NextResponse.json({ error: "درخواست نامعتبر یا بیش از حد بزرگ است" }, { status: 400 }); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  const b = parsed as { status?: string };
  const status = String(b.status || "new");
  if (status !== "new" && status !== "sent")
    return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });

  const db = await ensureSchema();
  try {
    // SQLite triggers perform stock and status changes in one atomic statement.
    const result = await db.prepare("UPDATE orders SET status=? WHERE id=?").bind(status, Number(id)).run();
    if (!result.meta.changes)
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
  } catch (error) {
    const message = String(error);
    if (message.includes("insufficient_stock"))
      return NextResponse.json({ error: "موجودی برای ارسال این سفارش کافی نیست" }, { status: 409 });
    if (message.includes("shipment_history_missing"))
      return NextResponse.json({ error: "مقدار کسرشده برای این سفارش قدیمی مشخص نیست؛ موجودی را دستی بررسی کنید" }, { status: 409 });
    throw error;
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const { id } = await params;
  const db = await ensureSchema();
  // NOTE: deleting a "new" order never touched stock. Deleting a "sent"
  // order does NOT restore stock — those items already shipped.
  const r = await db
    .prepare("DELETE FROM orders WHERE id=?")
    .bind(Number(id))
    .run();
  if (r.meta.changes === 0)
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
