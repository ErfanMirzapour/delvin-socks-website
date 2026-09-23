import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAdminPasswordHash, hashPassword } from "./db";

const COOKIE = "socks_admin";

// The cookie token IS the stored password hash. Changing the password
// invalidates all existing sessions (they must log in again).
async function expectedToken(): Promise<string> {
  return getAdminPasswordHash();
}

export async function verifyAdminPassword(pw: string): Promise<boolean> {
  if (!pw) return false;
  return hashPassword(pw) === (await getAdminPasswordHash());
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === (await expectedToken());
}

export async function setAdminCookie(): Promise<string> {
  const jar = await cookies();
  const token = await expectedToken();
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

// Cloudflare request context (env bindings, waitUntil). Available in routes.
export function cfContext() {
  return getCloudflareContext();
}
