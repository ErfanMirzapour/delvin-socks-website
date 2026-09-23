import { NextResponse } from "next/server";
import { ensureSchema, type OrderItem } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: number;
  status: string;
  items_json: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const { id } = await params;
  const b = (await req.json().catch(() => ({}))) as { status?: string };
  const status = String(b.status || "new");
  if (status !== "new" && status !== "sent")
    return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });

  const db = await ensureSchema();
  const order = await db
    .prepare("SELECT id, status, items_json FROM orders WHERE id=?")
    .bind(Number(id))
    .first<OrderRow>();
  if (!order)
    return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
  if (order.status === status) return NextResponse.json({ ok: true });

  const items = JSON.parse(order.items_json || "[]") as OrderItem[];
  const stmts = [
    db.prepare("UPDATE orders SET status=? WHERE id=?").bind(status, Number(id)),
  ];
  if (order.status === "new" && status === "sent") {
    // Order processed/shipped: decrement stock now (floor at 0).
    for (const it of items)
      stmts.push(
        db
          .prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id=?")
          .bind(it.qty, it.product_id)
      );
  } else if (order.status === "sent" && status === "new") {
    // Moved back to new: give the stock back.
    for (const it of items)
      stmts.push(
        db
          .prepare("UPDATE products SET stock = stock + ? WHERE id=?")
          .bind(it.qty, it.product_id)
      );
  }
  // D1 batch is atomic (all or nothing).
  await db.batch(stmts);
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
