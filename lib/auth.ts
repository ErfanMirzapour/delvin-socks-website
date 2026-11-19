import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import crypto from "node:crypto";
import { ensureSchema, getAdminPasswordHash, hashPassword } from "./db";
import { derive, securePasswordHash } from "./password";
export { securePasswordHash } from "./password";

const COOKIE = "socks_admin";
const LIFETIME = 60 * 60 * 24 * 7;

async function matches(pw: string, stored: string): Promise<boolean> {
  if (!stored.startsWith("pbkdf2-sha256$")) return hashPassword(pw) === stored;
  const [, rounds, salt, expected] = stored.split("$");
  const iterations = Number(rounds);
  if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > 1_000_000 || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{64}$/.test(expected)) return false;
  const actual = await derive(pw, Buffer.from(salt, "hex"), iterations);
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

export async function verifyAdminPassword(pw: string): Promise<string | null> {
  if (!pw || pw.length > 1024) return null;
  const saved = await getAdminPasswordHash();
  if (!(await matches(pw, saved))) return null;
  if (!saved.startsWith("pbkdf2-sha256$")) {
    const upgraded = await securePasswordHash(pw);
    const db = await ensureSchema();
    const result = await db.prepare("UPDATE settings SET value=? WHERE key='admin_password_hash' AND value=?").bind(upgraded, saved).run();
    if (!result.meta.changes) return null;
    return upgraded;
  }
  return saved;
}

function tokenHash(token: string) { return crypto.createHash("sha256").update(token).digest("hex"); }

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  const db = await ensureSchema();
  const row = await db.prepare("SELECT 1 AS ok FROM admin_sessions s JOIN settings p ON p.key='admin_password_hash' AND p.value=s.password_hash WHERE s.token_hash=? AND s.expires_at>?").bind(tokenHash(token), Math.floor(Date.now() / 1000)).first();
  return !!row;
}

export async function setAdminCookie(passwordHash: string): Promise<string> {
  const db = await ensureSchema();
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Math.floor(Date.now() / 1000) + LIFETIME;
  await db.prepare("INSERT INTO admin_sessions(token_hash,password_hash,expires_at) VALUES(?,?,?)").bind(tokenHash(token), passwordHash, expires).run();
  (await cookies()).set(COOKIE, token, { httpOnly: true, path: "/", maxAge: LIFETIME, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  return token;
}

export async function clearAdminCookie() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    const db = await ensureSchema();
    await db.prepare("DELETE FROM admin_sessions WHERE token_hash=?").bind(tokenHash(token)).run();
  }
  jar.delete(COOKIE);
}

export { COOKIE };
export function cfContext() { return getCloudflareContext(); }
