import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "socks_admin";

function expectedToken(): string {
  const pw = process.env.ADMIN_PASSWORD || "admin123";
  return crypto.createHash("sha256").update("socks:" + pw).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === expectedToken();
}

export async function setAdminCookie(): Promise<string> {
  const jar = await cookies();
  const token = expectedToken();
  jar.set(COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
  return token;
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export { COOKIE };
