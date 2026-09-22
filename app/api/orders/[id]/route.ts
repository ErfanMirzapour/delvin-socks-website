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
  getDb()
    .prepare("UPDATE orders SET status=? WHERE id=?")
    .run(String(b.status || "new"), Number(id));
  return NextResponse.json({ ok: true });
}
