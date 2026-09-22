import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  const db = getDb();
  db.prepare(
    "UPDATE products SET title=?, category=?, price=?, stock=?, image=?, description=? WHERE id=?"
  ).run(
    String(b.title),
    String(b.category || "men"),
    Number(b.price || 0),
    Number(b.stock || 0),
    String(b.image || ""),
    String(b.description || ""),
    Number(id)
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const { id } = await params;
  getDb().prepare("DELETE FROM products WHERE id=?").run(Number(id));
  return NextResponse.json({ ok: true });
}
