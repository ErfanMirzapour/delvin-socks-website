import { readJson } from "@/lib/request";
import { NextResponse } from "next/server";
import { isAdmin, setAdminCookie, verifyAdminPassword, securePasswordHash } from "@/lib/auth";
import {
  ensureSchema,
} from "@/lib/db";

// Change the admin password from inside the panel.
// Body: { current: string, next: string }
export async function PATCH(req: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "دسترسی ندارید" }, { status: 401 });
  let parsed: unknown;
  try { parsed = await readJson(req, 16_384); } catch { return NextResponse.json({ error: "درخواست نامعتبر یا بیش از حد بزرگ است" }, { status: 400 }); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  const b = parsed as { current?: string; next?: string };
  const current = String(b.current || "");
  const nextPw = String(b.next || "");
  const verifiedHash = await verifyAdminPassword(current);
  if (!verifiedHash)
    return NextResponse.json({ error: "رمز فعلی اشتباه است" }, { status: 400 });
  if (nextPw.length > 1024) return NextResponse.json({ error: "رمز بیش از حد طولانی است" }, { status: 400 });
  if (nextPw.length < 6)
    return NextResponse.json(
      { error: "رمز جدید حداقل ۶ کاراکتر باشد" },
      { status: 400 }
    );
  const nextHash = await securePasswordHash(nextPw);
  const db = await ensureSchema();
  const result = await db.prepare("UPDATE settings SET value=? WHERE key='admin_password_hash' AND value=?").bind(nextHash, verifiedHash).run();
  if (!result.meta.changes) return NextResponse.json({ error: "رمز تغییر کرده است؛ دوباره وارد شوید" }, { status: 409 });
  // Refresh own session so the admin stays logged in; everyone else is logged out.
  await setAdminCookie(nextHash);
  return NextResponse.json({ ok: true });
}
