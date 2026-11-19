import crypto from "node:crypto";

const ITERATIONS = 210_000;

export async function derive(pw: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.webcrypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.webcrypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return Buffer.from(bits).toString("hex");
}

export async function securePasswordHash(pw: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  return `pbkdf2-sha256$${ITERATIONS}$${salt.toString("hex")}$${await derive(pw, salt, ITERATIONS)}`;
}

