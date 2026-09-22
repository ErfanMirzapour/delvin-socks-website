import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "فایلی نیست" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length > 3 * 1024 * 1024)
    return NextResponse.json({ error: "حجم عکس حداکثر ۳ مگابایت" }, { status: 400 });
  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ext = (file.name.split(".").pop() || "jpg").slice(0, 5).replace(/[^a-zA-Z0-9]/g, "");
  const name = `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
  fs.writeFileSync(path.join(dir, name), bytes);
  return NextResponse.json({ url: `/uploads/${name}` });
}
