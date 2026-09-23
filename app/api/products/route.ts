import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("category");
  const db = getDb();
  // In-stock first, out-of-stock last; newest first within each group.
  const ORDER = "ORDER BY (stock > 0) DESC, id DESC";
  const rows =
    cat && cat !== "all"
      ? db.prepare(`SELECT * FROM products WHERE category=? ${ORDER}`).all(cat)
      : db.prepare(`SELECT * FROM products ${ORDER}`).all();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const b = await req.json();
  if (!b.title) return NextResponse.json({ error: "عنوان لازم است" }, { status: 400 });
  const db = getDb();
  const r = db
    .prepare(
      "INSERT INTO products (title, category, price, stock, image, description) VALUES (?,?,?,?,?,?)"
    )
    .run(
      String(b.title),
      String(b.category || "men"),
      Number(b.price || 0),
      Number(b.stock || 0),
      String(b.image || ""),
      String(b.description || "")
    );
  return NextResponse.json({ id: Number(r.lastInsertRowid) });
}
