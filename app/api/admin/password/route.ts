import { NextResponse } from "next/server";
import { isAdmin, setAdminCookie } from "@/lib/auth";
import {
  getAdminPasswordHash,
  hashPassword,
  setAdminPasswordHash,
} from "@/lib/db";

// Change the admin password from inside the panel.
// Body: { current: string, next: string }
export async function PATCH(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const current = String(b.current || "");
  const nextPw = String(b.next || "");
  if (hashPassword(current) !== getAdminPasswordHash())
    return NextResponse.json({ error: "رمز فعلی اشتباه است" }, { status: 400 });
  if (nextPw.length < 6)
    return NextResponse.json(
      { error: "رمز جدید حداقل ۶ کاراکتر باشد" },
      { status: 400 }
    );
  setAdminPasswordHash(hashPassword(nextPw));
  // Refresh own session so the admin stays logged in; everyone else is logged out.
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
