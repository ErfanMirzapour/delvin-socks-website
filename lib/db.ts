import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import type { Category } from "./catalog";

export type { Category, Product, Order, OrderItem } from "./catalog";
export { categoryFa } from "./catalog";

let db: Database.Database | null = null;

// Same scheme as the admin cookie token: sha256("socks:" + password).
export function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update("socks:" + pw).digest("hex");
}

function resolveDbPath(): string {
  const custom = process.env.DB_PATH;
  if (custom)
    return path.isAbsolute(custom) ? custom : path.join(process.cwd(), custom);
  return path.join(process.cwd(), "data", "shop.db");
}

// Seed sample products in dev by default. Production starts EMPTY —
// override with DB_SEED=true/false explicitly if needed.
function shouldSeed(): boolean {
  if (process.env.DB_SEED === "true") return true;
  if (process.env.DB_SEED === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function getDb(): Database.Database {
  if (db) return db;
  const dbPath = resolveDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'men',
      price INTEGER NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      image TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS orders (
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
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    );
  `);
  ensureAdminPassword(db);
  if (shouldSeed()) seedIfEmpty(db);
  return db;
}

// First run (or fresh DB): bootstrap the admin hash from ADMIN_PASSWORD env.
// After that the panel's "change password" owns the value — env is ignored.
function ensureAdminPassword(database: Database.Database) {
  const row = database
    .prepare("SELECT value FROM settings WHERE key='admin_password_hash'")
    .get() as { value: string } | undefined;
  if (!row) {
    database
      .prepare("INSERT INTO settings (key, value) VALUES ('admin_password_hash', ?)")
      .run(hashPassword(process.env.ADMIN_PASSWORD || "admin123"));
  }
}

export function getAdminPasswordHash(): string {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key='admin_password_hash'")
    .get() as { value: string } | undefined;
  if (row) return row.value;
  // Should not happen (ensureAdminPassword runs in getDb), fallback to env:
  return hashPassword(process.env.ADMIN_PASSWORD || "admin123");
}

export function setAdminPasswordHash(hash: string) {
  getDb()
    .prepare(
      "INSERT OR REPLACE INTO settings (key, value) VALUES ('admin_password_hash', ?)"
    )
    .run(hash);
}

function seedIfEmpty(database: Database.Database) {
  const count = (
    database.prepare("SELECT COUNT(*) as c FROM products").get() as {
      c: number;
    }
  ).c;
  if (count > 0) return;
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
  const stmt = database.prepare(
    "INSERT INTO products (title, category, price, stock, image, description) VALUES (?,?,?,?,?,?)"
  );
  for (const s of seeds) stmt.run(...s);
}
