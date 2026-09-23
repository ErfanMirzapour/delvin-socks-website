import { NextResponse } from "next/server";
import { ensureSchema, seedIfEmpty } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("category");
  const db = await ensureSchema();
  await seedIfEmpty(db);
  // In-stock first, out-of-stock last; newest first within each group.
  const ORDER = "ORDER BY (stock > 0) DESC, id DESC";
  const { results } =
    cat && cat !== "all"
      ? await db.prepare(`SELECT * FROM products WHERE category=? ${ORDER}`).bind(cat).all()
      : await db.prepare(`SELECT * FROM products ${ORDER}`).all();
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const b = (await req.json()) as {
    title?: string;
    category?: string;
    price?: number;
    stock?: number;
    image?: string;
    description?: string;
  };
  if (!b.title) return NextResponse.json({ error: "عنوان لازم است" }, { status: 400 });
  const db = await ensureSchema();
  const r = await db
    .prepare(
      "INSERT INTO products (title, category, price, stock, image, description) VALUES (?,?,?,?,?,?)"
    )
    .bind(
      String(b.title),
      String(b.category || "men"),
      Number(b.price || 0),
      Number(b.stock || 0),
      String(b.image || ""),
      String(b.description || "")
    )
    .run();
  return NextResponse.json({ id: Number(r.meta.last_row_id) });
}
