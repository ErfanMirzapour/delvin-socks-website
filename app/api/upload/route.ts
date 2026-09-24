import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "فایلی نیست" }, { status: 400 });
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "فقط فایل تصویری" }, { status: 400 });
  const bytes = await file.arrayBuffer();
  if (bytes.byteLength > 3 * 1024 * 1024)
    return NextResponse.json({ error: "حجم عکس حداکثر ۳ مگابایت" }, { status: 400 });
  const ext = (file.name.split(".").pop() || "jpg").slice(0, 5).replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const name = `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
  try {
    await uploadImage(name, bytes, file.type || "image/jpeg");
  } catch {
    return NextResponse.json({ error: "خطا در آپلود عکس" }, { status: 500 });
  }
  return NextResponse.json({ url: `/img/${name}` });
}
