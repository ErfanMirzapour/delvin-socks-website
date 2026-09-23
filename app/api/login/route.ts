import { NextResponse } from "next/server";
import { setAdminCookie, clearAdminCookie, verifyAdminPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as { password?: string };
  const pw = String(b.password || "");
  if (await verifyAdminPassword(pw)) {
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "رمز اشتباه است" }, { status: 401 });
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
