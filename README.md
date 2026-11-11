# Delvin Socks Website 🧦

Farsi (RTL) socks shop MVP — no online payment. Customers fill a cart, see an invoice-style receipt, submit postal details, and the order is stored in the admin panel + optionally notified instantly via Telegram. Shipping is done by post with a phone follow-up.

Live design: **v1 "Warm Bazaar"** is the main storefront at `/` (`/v1` redirects to `/`).

## Stack

- Next.js 16 App Router + React 19, deployed on **Cloudflare Workers** via `@opennextjs/cloudflare` (free tier)
- **Cloudflare D1** (SQLite-compatible) for products/orders/settings — local emulation in dev, remote D1 in production
- **Supabase Storage** (free tier, no credit card) as origin for product photos, served via `/img/...` proxy
- Tailwind CSS 4, Vazirmatn font, `lang="fa" dir="rtl"`
- Cart in `localStorage` (`socks_cart_v1`)
- Admin auth via password hash in DB + httpOnly cookie `socks_admin`

## Routes

| Route | Description |
|---|---|
| `/` | Main shop, category filter: all / men / women / kids (همه / مردانه / زنانه / بچگانه). In-stock first, out-of-stock (`ناموجود`) last |
| `/product/[id]` | Product page — `stock == 0` shows ناموجود instead of price, buy button disabled (product still visible) |
| `/cart` | Cart (localStorage) |
| `/checkout` | Invoice + form: fullname*, phone* (`/^09\d{9}$/`), address*, postal_code* (10 digits), note (optional) |
| `/success` | Receipt + post-shipping explainer |
| `/about` | About + shop phone + Telegram channel |
| `/admin` | Panel (not linked anywhere — open the URL directly): Products / Orders tabs, password change |

## Quick start

```bash
npm install
# create .env (see Environment variables below)
npm run dev            # http://localhost:3000, local D1+R2 emulation, seeds samples
npm run preview        # production build on the real Workers runtime, locally
npm run deploy         # build + deploy to Cloudflare (after one-time setup below)
```

## Environment variables

All in `.env` (gitignored, never committed):

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | yes (first run) | Required bootstrap admin password. Stored into the DB on first run; afterwards the panel's "تغییر رمز" owns it |
| `TELEGRAM_BOT_TOKEN` | for Telegram alerts | Bot token from `@BotFather` |
| `TELEGRAM_CHAT_ID` | for Telegram alerts | Your numeric chat ID (see below) |
| `TELEGRAM_NOTIFICATIONS_ENABLED` | no | Set `true` to enable delivery in this deployment. Missing or any other value disables delivery |
| `NEXT_PUBLIC_SHOP_PHONE` | yes | Shop phone shown in footer + About + success page |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | no | Public channel link, e.g. `https://t.me/delvin_socks` |
| `SUPABASE_URL` | for photo uploads | e.g. `https://xyz.supabase.co` (Project Settings → Data API) |
| `SUPABASE_SERVICE_KEY` | for photo uploads | `service_role` key (Project Settings → API Keys — keep secret!) |
| `SUPABASE_BUCKET` | no | Bucket name (default `product-images` — create it in Supabase Storage, private is fine) |
| `DB_SEED` | no | `true`/`false`. Default: seed samples in dev, no seed in production |

Locally these come from `.env`. **In production they must be Worker secrets/vars** (`.env` is never uploaded):

```bash
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

Example `.env`:

```ini
ADMIN_PASSWORD=change-me-to-something-long
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=987654321
NEXT_PUBLIC_SHOP_PHONE=0912-000-0000
NEXT_PUBLIC_TELEGRAM_CHANNEL=https://t.me/your_channel
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_BUCKET=product-images
```

## Telegram notifications (one message per order when enabled)

When `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `TELEGRAM_NOTIFICATIONS_ENABLED=true` are set, `POST /api/orders` sends a fire-and-forget message with order id, name, phone, address, postal code, note, items and total. Set the opt-in as a production Worker variable in Cloudflare, not in the top-level Wrangler configuration: local production-runtime previews also use that configuration. Previews explicitly opt out. Use a separate test bot and chat for preview delivery tests. If disabled or credentials are missing, orders are only stored in the panel — no error. `NODE_ENV` does not identify the deployment environment.

Setup (5 minutes, phone + laptop):

1. In Telegram, message `@BotFather` → send `/newbot` → follow prompts → copy the token → put it in `TELEGRAM_BOT_TOKEN`.
2. In Telegram, open your new bot and press **Start** (send any message, e.g. `hi`).
3. In a browser, open `https://api.telegram.org/bot<TOKEN>/getUpdates` (replace `<TOKEN>`). Find `"chat":{"id":123456789}` — that number is your `TELEGRAM_CHAT_ID`.
4. Put both in the production `.env` and (re)start the server.
5. Place a test order. You should get a `🧦 سفارش جدید #...` message within seconds.

Notes:
- `getUpdates` only works while the bot has no webhook. If it returns `{"ok":true,"result":[]}`, send another message to the bot and retry.
- To notify a group/channel instead of yourself: add the bot to the group, send a message, read `getUpdates` again for the group id (often negative, e.g. `-100...`).
- Never commit the token. Revoke via `@BotFather` → `/revoke` if leaked.

## Admin panel (`/admin`)

Not linked from the site header — open the URL directly. Login with the admin password (first run: `ADMIN_PASSWORD` from `.env` or a Worker secret).

- **تغییر رمز** (next to logout): change the password without touching `.env`. You stay logged in; all other sessions are logged out.
- Products tab: add / edit / delete, set price (تومان) and stock. `stock = 0` → storefront shows ناموجود and the item sinks to the end of the list. Image via mobile upload (Supabase, 3 MB max) or direct URL. Deleting a product also deletes its uploaded photo.
- Orders tab: list (newest first), expand for details, toggle status `new` / `sent`, tap-to-call customer, 🗑 delete order.

## Stock & order lifecycle

- Placing an order does **not** touch stock. It only validates (item exists, enough stock for the requested qty) and stores the order as `new`.
- Marking an order **sent** decrements stock (floored at 0). Moving it back to **new** restores stock.
- Deleting a **new** order changes nothing. Deleting a **sent** order does **not** restore stock (those items already shipped).

## Database & storage

- **D1** (SQLite API). Tables: `products`, `orders`, `settings` (admin password hash). Schema is ensured by the app on first request — no manual migration needed.
- Dev (`npm run dev`): local D1 emulation (state in `.wrangler/`, gitignored), auto-seeds 9 sample products on an empty DB.
- Production: remote D1, starts **empty** — add real products via `/admin`.
- Product photos live in **Supabase Storage** (free 1 GB, no credit card), served via `/img/...` (local emulation in dev).

## Deploy to Cloudflare (one-time setup, all free, no credit card)

1. Create a free Supabase project (no card needed) → Storage → New bucket `product-images` (private is fine).
2. Project Settings → Data API → copy the URL + `service_role` key.

```bash
npx wrangler login
npx wrangler d1 create delvin-socks-db        # copy database_id into wrangler.jsonc
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_KEY
npm run deploy
```

The production custom domain `delvin-socks.ir` is recorded in `wrangler.jsonc` and was verified in the Worker Domains tab. Cloudflare DNS proxies `www` and a Single Redirect sends HTTPS requests to the apex, preserving paths and query strings. Keep that DNS record and redirect rule when changing the domain setup.

### Hosted previews

Workers Builds uses `wrangler preview` for branch builds. The `previews` block binds `DB` to the dedicated `delvin-socks-preview` D1 database, seeds sample products when empty, and disables Telegram. All branch previews share this database, so they are isolated from production but not from one another. Preview settings and secrets are separate from production; do not import production secrets. The preview database was created empty on 2026-11-11.

Before testing admin or uploads, configure Previews Base secrets in Cloudflare for **new** previews: a unique `ADMIN_PASSWORD`, and `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` for a separate test Supabase project with a private `product-images` bucket. Do not use the production service-role key, which can access production storage even with another bucket name. Existing previews must be recreated or configured individually after base secrets change. For a Telegram delivery test, use a dedicated test bot and chat, set their preview secrets, and explicitly enable `TELEGRAM_NOTIFICATIONS_ENABLED` for that test preview only. Turn it off again afterward. Preview URLs are public unless protected with Cloudflare Access; use only disposable test data.

## TODO

Deployment checks on 2026-11-11: `https://delvin-socks.ir` and the production Worker URL returned HTTP 200. The products API returned three products, and `/admin`, `/cart`, `/checkout`, and `/about` returned HTTP 200. The Cloudflare build for `main` commit `1789cea` passed. The latest check for redesign branch commit `b8c05ca` failed. These are availability checks. Admin actions, checkout submission, uploads, Telegram delivery, and a working hosted preview still need verification.

### Production and previews

- [x] Deploy the production Worker with D1 and Supabase Storage (production build check passed)
- [x] Restore HTTPS availability at `delvin-socks.ir` (HTTP 200 verified)
- [x] Verify the custom domain binding in Cloudflare and record it in deployment configuration so future deploys preserve it
- [x] Investigate the failed branch preview build and verify a fresh branch produces a working preview URL. The [old build](https://dash.cloudflare.com/5c6e3d8ea8ddeae6f56b5620e52a8c76/workers/services/view/delvin-socks/production/builds/9ba1192b-66ab-4052-81f2-a8c7b7644099) lacked a `previews` D1 binding. The new branch also needed a lint fix and preview deploy script; its hosted build and sample products API passed on 2026-11-11.
- [ ] Isolate hosted previews from production with a separate D1 database, storage location, admin credentials, and notification settings. Version URLs alone do not establish data isolation
- [ ] Gate Telegram notifications by deployment environment. Code and production opt-in are prepared; verify after deployment
- [ ] Verify the local production-runtime preview with `pnpm run preview`, including database access and explicit sample-data configuration
- [x] Configure `www.delvin-socks.ir` with HTTPS and a redirect to the apex domain (HTTPS 301 and path/query preservation verified 2026-11-11)
- [ ] Verify a complete order flow in an isolated preview, including login, password change, image upload, order persistence, shipment status, stock updates, and Telegram delivery. Repeat a controlled production smoke check before launch
- [ ] Document and verify D1 backup/restore, image recovery, and deployment rollback procedures. Add uptime and runtime-error monitoring

### Admin and order correctness

- [x] Await the admin password database write before refreshing the session or returning success
- [ ] Verify the new password persists and existing sessions are invalidated in an isolated environment
- [ ] Verify the saved production admin password has been changed through the panel. `ADMIN_PASSWORD` initializes a fresh database only. Updating the secret does not replace an existing saved password
- [x] Remove the `admin123` bootstrap fallback, require an explicit nonempty bootstrap password, and make concurrent initialization safe
- [ ] Enforce a strong bootstrap password policy
- [ ] Replace the password-hash cookie with revocable random session tokens, set Secure cookies in production, and use a salted password hashing scheme with a work factor. Preserve password-change session invalidation
- [ ] Rate-limit login and order submission, add basic checkout spam protection, and enforce request size and field length limits
- [ ] Validate finite positive integer quantities and product IDs, aggregate duplicate product lines before stock checks, and validate nonnegative integer prices and stock in admin endpoints
- [ ] Prevent duplicate orders when checkout is retried or submitted twice
- [ ] Make shipment status changes safe under concurrent requests so stock changes once per transition. Handle insufficient stock explicitly and prevent stock inflation when reversing a shipment after a floored deduction
- [ ] Confirm the pending-order stock policy. Stock is checked at checkout and deducted at shipment, so multiple pending orders can exceed available inventory
- [ ] Add focused regression checks for password bootstrap, checkout validation, duplicate submissions, and concurrent order status changes. Resolve the cart lint issue reported in the redesign PR and establish required build/type/lint checks

### Catalog and launch

- [ ] Set real `NEXT_PUBLIC_SHOP_PHONE` and `NEXT_PUBLIC_TELEGRAM_CHANNEL`, then verify their displayed production values
- [ ] Finalize the product catalog, prices, stock, and real photos
- [ ] Add `robots.txt`, sitemap, canonical URLs, and product/share metadata for the current Knit design
- [ ] Validate image content and resize/compress uploads. Verify Supabase image cleanup on replacement, product deletion, and failed saves
- [ ] Update README routes and design references for Knit, replace stale R2 instructions with Supabase Storage, and document production versus preview commands and environment variables
- [ ] Standardize package management on pnpm or Bun, commit its lockfile, and align Cloudflare build commands
- [ ] Order management: search/filter and CSV export
- [ ] Optional later: online payment gateway, SMS confirmation, and multiple admin accounts

## License

Private MVP for Delvin socks shop. No license granted yet — add one before public launch if needed.
