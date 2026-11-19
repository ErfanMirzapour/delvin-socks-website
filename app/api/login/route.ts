import { NextResponse } from "next/server";
import { readJson, rateLimit } from "@/lib/request";
import { setAdminCookie, clearAdminCookie, verifyAdminPassword } from "@/lib/auth";

export async function POST(req: Request) {
  if (!(await rateLimit(req, "login", 10, 900))) return NextResponse.json({ error: "تعداد تلاش‌ها بیش از حد مجاز است؛ بعداً دوباره تلاش کنید" }, { status: 429 });
  let b: { password?: string };
  try { b = await readJson(req, 4096) as { password?: string }; } catch { return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 }); }
  if (!b || typeof b !== "object") return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  const pw = String(b.password || "");
  const verifiedHash = await verifyAdminPassword(pw);
  if (verifiedHash) {
    await setAdminCookie(verifiedHash);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "رمز اشتباه است" }, { status: 401 });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
