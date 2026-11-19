import crypto from "node:crypto";

// OWASP's 16 MiB scrypt configuration; compatible with Workers' node:crypto.
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 5;
const MAX_MEMORY = 64 * 1024 * 1024;

export async function derive(pw: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.webcrypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.webcrypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return Buffer.from(bits).toString("hex");
}

export function deriveScrypt(pw: string, salt: Uint8Array): string {
  return crypto.scryptSync(pw, salt, 32, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: MAX_MEMORY }).toString("hex");
}

export async function securePasswordHash(pw: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString("hex")}$${deriveScrypt(pw, salt)}`;
}
