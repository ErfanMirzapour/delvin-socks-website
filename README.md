# Delvin Socks Website 🧦

Farsi (RTL) socks shop MVP — no online payment. Customers fill a cart, see an invoice-style receipt, submit postal details, and the order is stored in the admin panel + optionally notified instantly via Telegram. Shipping is done by post with a phone follow-up.

Live design: **v1 "Warm Bazaar"** is the main storefront at `/` (`/v1` redirects to `/`).

## Stack

- Next.js 16 App Router + React 19
- `better-sqlite3` (SQLite, auto-created; seeded with samples in dev, empty in production)
- Tailwind CSS 4, Vazirmatn font, `lang="fa" dir="rtl"`
- Cart in `localStorage` (`socks_cart_v1`)
- Admin auth via password hash in DB + httpOnly cookie `socks_admin`

> Build constraint: this project **must use webpack**. All scripts already use `--webpack` because Turbopack fails on the `better-sqlite3` native binding. `next.config.ts` sets `serverExternalPackages: ["better-sqlite3"]`.

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
npm run dev            # http://localhost:3000 (webpack)
npm run build          # production build (webpack)
npm start              # serve production build
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
| `DB_PATH` | no | SQLite file path (default `data/shop.db`). Point to a persistent volume in production |
| `DB_SEED` | no | `true`/`false`. Default: seed samples in dev, no seed in production |

Example `.env`:

```ini
ADMIN_PASSWORD=change-me-to-something-long
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=987654321
NEXT_PUBLIC_SHOP_PHONE=0912-000-0000
NEXT_PUBLIC_TELEGRAM_CHANNEL=https://t.me/your_channel
DB_PATH=data/shop.db
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
- Products tab: add / edit / delete, set price (تومان) and stock. `stock = 0` → storefront shows ناموجود and the item sinks to the end of the list. Image via mobile upload (`/public/uploads`, 3 MB max) or direct URL.
- Orders tab: list (newest first), expand for details, toggle status `new` / `sent`, tap-to-call customer, 🗑 delete order.

## Stock & order lifecycle

- Placing an order does **not** touch stock. It only validates (item exists, enough stock for the requested qty) and stores the order as `new`.
- Marking an order **sent** decrements stock (floored at 0). Moving it back to **new** restores stock.
- Deleting a **new** order changes nothing. Deleting a **sent** order does **not** restore stock (those items already shipped).

## Database

- SQLite file (default `data/shop.db`), auto-created. Tables: `products`, `orders`, `settings` (admin password hash).
- Dev (`npm run dev`): auto-seeds 9 sample products on an empty DB.
- Production (`NODE_ENV=production`): starts **empty** — add real products via `/admin`.
- To reset dev: stop the server, delete `data/shop.db*`, restart — it re-seeds.
- `data/*.db*` is gitignored; production needs a persistent volume (`DB_PATH`) + regular backup (see TODO).

## TODO

- [ ] Production deploy for delvin-socks.ir (VPS + Docker + persistent `DB_PATH` volume + HTTPS — see deployment options below)
- [ ] Set real `NEXT_PUBLIC_SHOP_PHONE` and `NEXT_PUBLIC_TELEGRAM_CHANNEL`
- [ ] Change `ADMIN_PASSWORD` from default `admin123` (or change it from the panel after first deploy)
- [ ] Decide product catalog + real photos (replace `public/socks/*.svg` placeholders where needed)
- [ ] Add `robots.txt` / sitemap + real shop name in `app/layout.tsx` metadata
- [ ] Upload hygiene: image resize/compress, delete orphan files on product delete
- [ ] Order management: search/filter, export CSV
- [ ] Harden checkout: rate-limit `POST /api/orders`, basic spam honeypot
- [ ] Optional later: online payment gateway, SMS confirmation, multi-admin accounts

## License

Private MVP for Delvin socks shop. No license granted yet — add one before public launch if needed.
