import { NextResponse } from "next/server";
import { setAdminCookie, clearAdminCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const pw = String(b.password || "");
  if (pw && pw === (process.env.ADMIN_PASSWORD || "admin123")) {
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "رمز اشتباه است" }, { status: 401 });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
