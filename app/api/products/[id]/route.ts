import { readJson } from "@/lib/request";
import { NextResponse } from "next/server";
import { ensureSchema } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { deleteUploadByUrl } from "@/lib/storage";

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
  const b = parsed as {
    title?: string;
    category?: string;
    price?: number;
    stock?: number;
    image?: string;
    description?: string;
  };
  if (typeof b.title !== "string" || b.title.trim().length < 1 || b.title.length > 200 || String(b.category || "").length > 30 || String(b.image || "").length > 2048 || String(b.description || "").length > 4000) return NextResponse.json({ error: "اطلاعات محصول نامعتبر است" }, { status: 400 });
  if (!Number.isSafeInteger(b.price) || b.price! < 0 || !Number.isSafeInteger(b.stock) || b.stock! < 0)
    return NextResponse.json({ error: "قیمت و موجودی باید اعداد صحیح نامنفی باشند" }, { status: 400 });
  const db = await ensureSchema();
  await db
    .prepare(
      "UPDATE products SET title=?, category=?, price=?, stock=?, image=?, description=? WHERE id=?"
    )
    .bind(
      String(b.title),
      String(b.category || "men"),
      Number(b.price || 0),
      Number(b.stock || 0),
      String(b.image || ""),
      String(b.description || ""),
      Number(id)
    )
    .run();
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
  const row = await db
    .prepare("SELECT image FROM products WHERE id=?")
    .bind(Number(id))
    .first<{ image: string }>();
  await db.prepare("DELETE FROM products WHERE id=?").bind(Number(id)).run();
  if (row?.image) await deleteUploadByUrl(row.image);
  return NextResponse.json({ ok: true });
}
