# Delvin Socks Website 🧦

Farsi (RTL) socks shop MVP — no online payment. Customers fill a cart, see an invoice-style receipt, submit postal details, and the order is stored in the admin panel + optionally notified instantly via Telegram. Shipping is done by post with a phone follow-up.

Live design: **v1 "Warm Bazaar"** is the main storefront at `/` (`/v1` redirects to `/`).

## Stack

- Next.js 16 App Router API + React 19, built with **[vinext](https://vinext.dev)** (Vite) and deployed on **Cloudflare Workers** with the `cf` CLI (free tier)
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
pnpm install
# create .env (see Environment variables below)
pnpm dev               # http://localhost:5173, local D1 emulation, seeds samples
pnpm preview           # production build on the real Workers runtime, locally
pnpm run deploy        # build + deploy to Cloudflare (after one-time setup below)
pnpm lint              # oxlint
pnpm typecheck         # generate Worker + route types, then tsc
```

## Environment variables

All in `.env` (gitignored, never committed):

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | yes (first run) | Required bootstrap admin password. Stored into the DB on first run; afterwards the panel's "تغییر رمز" owns it |
| `TELEGRAM_BOT_TOKEN` | for Telegram alerts | Bot token from `@BotFather` |
| `TELEGRAM_CHAT_ID` | for Telegram alerts | Your numeric chat ID (see below) |
| `TELEGRAM_NOTIFICATIONS_ENABLED` | no | Set `true` explicitly to send notifications; otherwise delivery is disabled |
| `NEXT_PUBLIC_SHOP_PHONE` | yes | Shop phone shown in footer + About + success page |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | no | Public channel link, e.g. `https://t.me/delvin_socks` |
| `SUPABASE_URL` | for photo uploads | e.g. `https://xyz.supabase.co` (Project Settings → Data API) |
| `SUPABASE_SERVICE_KEY` | for photo uploads | `service_role` key (Project Settings → API Keys — keep secret!) |
| `SUPABASE_BUCKET` | no | Bucket name (default `product-images` — create it in Supabase Storage, private is fine) |
| `DB_SEED` | no | `true`/`false`. Default: seed samples in dev, no seed in production |

Locally these come from `.env`. Server secrets must be declared in `cloudflare.config.ts` (`bindings.secret()`) to reach the Worker in dev. **In production they must be Worker secrets/vars** (`.env` is never uploaded):

```bash
pnpm exec cf workers secrets update ADMIN_PASSWORD --worker delvin-socks --text "<value>"
pnpm exec cf workers secrets update TELEGRAM_BOT_TOKEN --worker delvin-socks --text "<value>"
pnpm exec cf workers secrets update TELEGRAM_CHAT_ID --worker delvin-socks --text "<value>"
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

## Telegram notifications (one message per order, production only)

When `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `TELEGRAM_NOTIFICATIONS_ENABLED=true` are set, `POST /api/orders` sends a fire-and-forget message with order id, name, phone, address, postal code, note, items and total. Production must have the opt-in configured as a Worker secret before deploying this change. Previews explicitly default to `false`; local runs remain off unless opted in. Use a separate test bot and chat for preview tests. `NODE_ENV` does not identify the deployment environment.

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
- Dev (`pnpm dev`): local D1 emulation (Miniflare, via the Cloudflare Vite plugin), auto-seeds 9 sample products on an empty DB.
- Production: remote D1, starts **empty** — add real products via `/admin`.
- Product photos live in **Supabase Storage** (free 1 GB, no credit card), served via `/img/...` (local emulation in dev).

## Deploy to Cloudflare (one-time setup, all free, no credit card)

1. Create a free Supabase project (no card needed) → Storage → New bucket `product-images` (private is fine).
2. Project Settings → Data API → copy the URL + `service_role` key.

```bash
pnpm exec cf auth login
pnpm exec cf d1 create                         # copy the id into cloudflare.config.ts (env.DB)
pnpm exec cf workers secrets update ADMIN_PASSWORD --worker delvin-socks --text "<value>"
pnpm exec cf workers secrets update TELEGRAM_BOT_TOKEN --worker delvin-socks --text "<value>"
pnpm exec cf workers secrets update TELEGRAM_CHAT_ID --worker delvin-socks --text "<value>"
pnpm exec cf workers secrets update SUPABASE_URL --worker delvin-socks --text "<value>"
pnpm exec cf workers secrets update SUPABASE_SERVICE_KEY --worker delvin-socks --text "<value>"
pnpm run deploy
```

Then attach the domain: Cloudflare dashboard → Workers & Pages → `delvin-socks` → Settings → Domains & Routes → Add `delvin-socks.ir` (move the domain's nameservers to Cloudflare if needed). HTTPS is automatic.

## TODO

Deployment checks on 2026-11-11: `https://delvin-socks.ir` and the production Worker URL returned HTTP 200. The products API returned three products, and `/admin`, `/cart`, `/checkout`, and `/about` returned HTTP 200. The Cloudflare build for `main` commit `1789cea` passed. The latest check for redesign branch commit `b8c05ca` failed. These are availability checks. Admin actions, checkout submission, uploads, Telegram delivery, and a working hosted preview still need verification.

### Production and previews

The production custom domain is recorded in `cloudflare.config.ts`. Cloudflare DNS proxies `www`, and a redirect rule sends HTTPS requests to the apex while preserving paths and query strings.

Worker Previews bind `DB` to the separate `delvin-socks-preview` D1 database and seed sample products when empty. All branch previews share that database, so they are isolated from production but not from one another. Preview runtime secrets are separate from production. Previews Base has a unique `ADMIN_PASSWORD` and credentials for the separate `delvin-socks-preview` Supabase project and its private `product-images` bucket. Never use the production service-role key in a preview. Preview notifications can use the same bot as production, but Previews Base must have separate `TELEGRAM_BOT_TOKEN` and `PREVIEW_TELEGRAM_CHAT_ID` secrets. Preview code never falls back to the production chat ID. The receiving account must start a conversation with the bot. Preview URLs are public unless protected with Cloudflare Access; use only disposable data.

- [x] Deploy the production Worker with D1 and Supabase Storage (production build check passed)
- [x] Restore HTTPS availability at `delvin-socks.ir` (HTTP 200 verified)
- [x] Verify the custom domain binding in Cloudflare and record it in deployment configuration so future deploys preserve it
- [ ] Investigate the failed branch preview build and verify a fresh branch or PR produces a working preview URL. Inspect the [failed Cloudflare build](https://dash.cloudflare.com/5c6e3d8ea8ddeae6f56b5620e52a8c76/workers/services/view/delvin-socks/production/builds/9ba1192b-66ab-4052-81f2-a8c7b7644099)
- [ ] Isolate hosted previews from production with a separate D1 database, storage location, admin credentials, and notification settings. Version URLs alone do not establish data isolation
- [ ] Gate Telegram notifications by deployment environment. Local production builds and hosted previews can have `NODE_ENV=production`, so the current check can send real alerts when real bot credentials are present
- [ ] Verify the local production-runtime preview with `pnpm run preview`, including database access and explicit sample-data configuration
- [x] Configure `www.delvin-socks.ir` with HTTPS and a redirect to the apex domain (HTTPS 301 with path and query preservation verified on 2026-11-11)
- [ ] Verify a complete order flow in an isolated preview, including login, password change, image upload, order persistence, shipment status, stock updates, and Telegram delivery. Repeat a controlled production smoke check before launch
- [ ] Document and verify D1 backup/restore, image recovery, and deployment rollback procedures. Add uptime and runtime-error monitoring

### Admin and order correctness

- [x] Await the admin password database write before refreshing the session or returning success
- [x] Verify the new password persists and existing sessions are invalidated in an isolated environment
- [x] Confirm the saved production admin password was changed through the panel (confirmed by the owner on 2026-11-19). `ADMIN_PASSWORD` initializes a fresh database only; updating the secret does not replace an existing saved password.
- [x] Remove the `admin123` bootstrap fallback, require an explicit nonempty bootstrap password, and make concurrent initialization safe
- [ ] Enforce a strong bootstrap password policy
- [x] Replace the password-hash cookie with revocable random session tokens, set Secure cookies in production, and use a salted password hashing scheme with a work factor. Preserve password-change session invalidation
- [x] Rate-limit login and order submission, add basic checkout spam protection, and enforce request size and field length limits
- [x] Validate finite positive integer quantities and product IDs, aggregate duplicate product lines before stock checks, and validate nonnegative integer prices and stock in admin endpoints
- [x] Prevent duplicate orders when checkout is retried or submitted twice
- [x] Make shipment status changes safe under concurrent requests so stock changes once per transition. Handle insufficient stock explicitly and prevent stock inflation when reversing a shipment after a floored deduction
- [x] Confirm the pending-order stock policy: stock is checked at checkout and deducted at shipment; multiple pending orders can exceed available inventory
- [ ] Enforce the build/type/lint and regression workflow as required checks in repository branch protection. The workflow and focused local regression checks are included, and the cart lint error is resolved.

### Catalog and launch

- [ ] Set real `NEXT_PUBLIC_SHOP_PHONE` and `NEXT_PUBLIC_TELEGRAM_CHANNEL`, then verify their displayed production values
- [ ] Finalize the product catalog, prices, stock, and real photos
- [ ] Add `robots.txt`, sitemap, canonical URLs, and product/share metadata for the current Knit design
- [ ] Validate image content and resize/compress uploads. Verify Supabase image cleanup on replacement, product deletion, and failed saves
- [ ] Update README routes and design references for Knit, replace stale R2 instructions with Supabase Storage, and document production versus preview commands and environment variables
- [x] Standardize package management on pnpm and commit its lockfile
- [ ] Align Cloudflare Workers Builds commands with pnpm + vinext (`pnpm run build` / `pnpm run deploy`)
- [ ] Order management: search/filter and CSV export
- [ ] Optional later: online payment gateway, SMS confirmation, and multiple admin accounts

## License

Private MVP for Delvin socks shop. No license granted yet — add one before public launch if needed.
