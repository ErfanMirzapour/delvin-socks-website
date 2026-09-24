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
| `ADMIN_PASSWORD` | yes (first run) | Bootstrap admin password (default `admin123`). Stored into the DB on first run; afterwards the panel's "تغییر رمز" owns it |
| `TELEGRAM_BOT_TOKEN` | for Telegram alerts | Bot token from `@BotFather` |
| `TELEGRAM_CHAT_ID` | for Telegram alerts | Your numeric chat ID (see below) |
| `TELEGRAM_NOTIFY_IN_DEV` | no | Set `true` only for an explicit dev notify test. Default: notify in production only |
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

## Telegram notifications (one message per order, production only)

When `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` are set **and** `NODE_ENV=production`, `POST /api/orders` sends a fire-and-forget message with order id, name, phone, address, postal code, note, items and total. In development nothing is sent (your dev orders won't spam the production bot). If unset, orders are only stored in the panel — no error.

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

Not linked from the site header — open the URL directly. Login with the admin password (first run: `ADMIN_PASSWORD` from `.env`, default `admin123`).

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

Then attach the domain: Cloudflare dashboard → Workers & Pages → `delvin-socks` → Settings → Domains & Routes → Add `delvin-socks.ir` (move the domain's nameservers to Cloudflare if needed). HTTPS is automatic.

## TODO

- [x] Production deploy for delvin-socks.ir → Cloudflare Workers + D1 + R2 (done, free tier)
- [ ] Attach `delvin-socks.ir` custom domain in the Cloudflare dashboard
- [ ] Set real `NEXT_PUBLIC_SHOP_PHONE` and `NEXT_PUBLIC_TELEGRAM_CHANNEL`
- [ ] Change `ADMIN_PASSWORD` from default `admin123` (or change it from the panel after first deploy)
- [ ] Decide product catalog + real photos (replace `public/socks/*.svg` placeholders where needed)
- [ ] Add `robots.txt` / sitemap + real shop name in `app/layout.tsx` metadata
- [ ] Upload hygiene: image resize/compress on upload (R2 object is already deleted with its product)
- [ ] Order management: search/filter, export CSV
- [ ] Harden checkout: rate-limit `POST /api/orders`, basic spam honeypot
- [ ] Optional later: online payment gateway, SMS confirmation, multi-admin accounts

## License

Private MVP for Delvin socks shop. No license granted yet — add one before public launch if needed.
