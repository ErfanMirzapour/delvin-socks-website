import crypto from "node:crypto";
import { ensureSchema } from "./db";

export async function readJson(req: Request, maxBytes: number): Promise<unknown> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("invalid_body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > maxBytes) { await reader.cancel(); throw new Error("body_too_large"); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export async function rateLimit(req: Request, action: string, limit: number, seconds: number): Promise<boolean> {
  // Cloudflare supplies this header in hosted deployments. Local requests share a bucket.
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const bucket = Math.floor(Date.now() / (seconds * 1000));
  const key = crypto.createHash("sha256").update(`${action}:${ip}:${bucket}`).digest("hex");
  const db = await ensureSchema();
  const row = await db.prepare("INSERT INTO rate_limits (key, count, expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count")
    .bind(key, (bucket + 1) * seconds).first<{ count: number }>();
  // Amortized cleanup; entries contain hashed IP addresses only.
  if (Math.random() < 0.01) await db.prepare("DELETE FROM rate_limits WHERE expires_at<?").bind(Math.floor(Date.now() / 1000)).run();
  return (row?.count ?? limit + 1) <= limit;
}
