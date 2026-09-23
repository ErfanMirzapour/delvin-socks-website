import { getCloudflareContext } from "@opennextjs/cloudflare";
import crypto from "node:crypto";
import type { Category } from "./catalog";

export type { Category, Product, Order, OrderItem } from "./catalog";
export { categoryFa } from "./catalog";

// Server-only: D1 (production) or its local emulation (next dev / preview).
// Never import this module from client components — use lib/catalog.ts there.

function d1(): D1Database {
  return getCloudflareContext().env.DB;
}

// Worker secrets/env first, process.env (.env) fallback for local dev.
export function secret(name: string, fallback = ""): string {
  try {
    const v = (getCloudflareContext().env as unknown as Record<string, unknown>)[name];
    if (typeof v === "string" && v) return v;
  } catch {
    // Outside a request scope — fall through to process.env.
  }
  return process.env[name] ?? fallback;
}

// Same scheme as the admin cookie token: sha256("socks:" + password).
export function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update("socks:" + pw).digest("hex");
}

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'men',
    price INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    items_json TEXT NOT NULL DEFAULT '[]',
    total INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  )`,
];

let schemaReady = false;

// Idempotent per isolate; ensures tables exist on D1 or its local emulation.
// NOTE: D1 exec() takes a single statement and the local emulator only
// sends its first line — collapse whitespace so each statement is one line.
export async function ensureSchema(): Promise<D1Database> {
  const db = d1();
  if (!schemaReady) {
    for (const stmt of SCHEMA_STATEMENTS)
      await db.exec(stmt.replace(/\s+/g, " ").trim());
    schemaReady = true;
  }
  return db;
}

// Seed sample products in dev by default. Production starts EMPTY —
// override with DB_SEED=true/false explicitly if needed.
function shouldSeed(): boolean {
  const flag = secret("DB_SEED", "");
  if (flag === "true") return true;
  if (flag === "false") return false;
  return secret("NODE_ENV", process.env.NODE_ENV ?? "") !== "production";
}

// Per-isolate lock: concurrent requests must not seed twice (check-then-
// insert races). Production never seeds (shouldSeed), so this only matters
// for local dev/preview.
let seedPromise: Promise<void> | null = null;

export function seedIfEmpty(db: D1Database): Promise<void> {
  if (!seedPromise) seedPromise = doSeed(db);
  return seedPromise;
}

async function doSeed(db: D1Database) {
  if (!shouldSeed()) return;
  const row = await db
    .prepare("SELECT COUNT(*) as c FROM products")
    .first<{ c: number }>();
  if (row && row.c > 0) return;
  const seeds: Array<[string, Category, number, number, string, string]> = [
    ["جوراب نخی ساق‌دار کلاسیک", "men", 89000, 24, "/socks/sock-1.svg", "نخ پنبه، مناسب استفاده روزمره"],
    ["جوراب اسپرت تنفسی", "men", 120000, 15, "/socks/sock-2.svg", "کفی حوله‌ای، مچ کشباف"],
    ["جوراب مجلسی طرح‌دار", "men", 95000, 0, "/socks/sock-3.svg", "طرح لوزی، مناسب مهمانی"],
    ["جوراب زنانه مچی رنگی", "women", 75000, 30, "/socks/sock-4.svg", "لطیف و سبک، سه رنگ"],
    ["جوراب زنانه ساق‌بلند بافت", "women", 135000, 12, "/socks/sock-5.svg", "بافت گرم پاییزه"],
    ["جوراب فانتزی زنانه", "women", 69000, 0, "/socks/sock-6.svg", "طرح گل، هدیه‌ای دوست‌داشتنی"],
    ["جوراب بچگانه خرسی", "kids", 59000, 40, "/socks/sock-7.svg", "ضدحساسیت، کفی ضدلغزش"],
    ["جوراب بچگانه اسپرت", "kids", 65000, 18, "/socks/sock-8.svg", "کش نرم، بدون درز آزاردهنده"],
    ["جوراب نوزادی سه‌جفتی", "kids", 99000, 10, "/socks/sock-9.svg", "پک سه‌تایی، پنبه ارگانیک"],
  ];
  await db.batch(
    seeds.map((s) =>
      db
        .prepare(
          "INSERT INTO products (title, category, price, stock, image, description) VALUES (?,?,?,?,?,?)"
        )
        .bind(...s)
    )
  );
}

// First run (or fresh DB): bootstrap the admin hash from ADMIN_PASSWORD.
// After that the panel's "change password" owns the value.
export async function getAdminPasswordHash(): Promise<string> {
  const db = await ensureSchema();
  const row = await db
    .prepare("SELECT value FROM settings WHERE key='admin_password_hash'")
    .first<{ value: string }>();
  if (row) return row.value;
  const h = hashPassword(secret("ADMIN_PASSWORD", "admin123"));
  await db
    .prepare("INSERT INTO settings (key, value) VALUES ('admin_password_hash', ?)")
    .bind(h)
    .run();
  return h;
}

export async function setAdminPasswordHash(hash: string) {
  const db = await ensureSchema();
  await db
    .prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password_hash', ?)"
    )
    .bind(hash)
    .run();
}
