# Delvin Socks Website 🧦

Farsi (RTL) socks shop MVP — no online payment. Customers fill a cart, see an invoice-style receipt, submit postal details, and the order is stored in the admin panel + optionally notified instantly via Telegram. Shipping is done by post with a phone follow-up.

Live design: **v1 "Warm Bazaar"** is the main storefront at `/`. Old `/v2`–`/v5` experiments were removed (`/v1` redirects to `/`).

## Stack

- Next.js 16 App Router + React 19
- `better-sqlite3` (SQLite at `data/shop.db`, auto-seeded with 9 sample products)
- Tailwind CSS 4, Vazirmatn font, `lang="fa" dir="rtl"`
- Cart in `localStorage` (`socks_cart_v1`)
- Admin auth via `ADMIN_PASSWORD` + httpOnly cookie `socks_admin`

> Build constraint: this project **must use webpack**. All scripts already use `--webpack` because Turbopack fails on the `better-sqlite3` native binding. `next.config.ts` sets `serverExternalPackages: ["better-sqlite3"]`.

## Routes

| Route | Description |
|---|---|
| `/` | Main shop (v1 design), category filter: all / men / women / kids (همه / مردانه / زنانه / بچگانه) |
| `/product/[id]` | Product page — `stock == 0` shows ناموجود instead of price, buy button disabled (product still visible) |
| `/cart` | Cart (localStorage) |
| `/checkout` | Invoice + form: fullname*, phone* (`/^09\d{9}$/`), address*, postal_code* (10 digits), note (optional) |
| `/success` | Receipt + post-shipping explainer |
| `/about` | About + shop phone + Telegram channel |
| `/admin` | Mobile-first panel: Products / Orders / Help tabs |
| `/v1` | Redirect → `/` (kept for old bookmarks) |

## Quick start

```bash
cp .env.example .env   # fill admin password + Telegram + shop phone
npm install
npm run dev            # http://localhost:3000 (webpack)
npm run build          # production build (webpack)
npm start              # serve production build
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_PASSWORD` | yes | Admin panel password (default `admin123` — change it!) |
| `TELEGRAM_BOT_TOKEN` | for Telegram alerts | Bot token from `@BotFather` |
| `TELEGRAM_CHAT_ID` | for Telegram alerts | Your numeric chat ID (see below) |
| `NEXT_PUBLIC_SHOP_PHONE` | yes | Shop phone shown in footer + About + success page |
| `NEXT_PUBLIC_TELEGRAM_CHANNEL` | no | Public channel link, e.g. `https://t.me/delvin_socks` |

Example `.env`:

```ini
ADMIN_PASSWORD=change-me-to-something-long
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
TELEGRAM_CHAT_ID=987654321
NEXT_PUBLIC_SHOP_PHONE=0912-000-0000
NEXT_PUBLIC_TELEGRAM_CHANNEL=https://t.me/your_channel
```

`.env` is gitignored and never pushed. Only `.env.example` is committed.

## Telegram notifications (one message per order)

When `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` are set, `POST /api/orders` sends a fire-and-forget message with order id, name, phone, address, postal code, note, items and total. If unset, orders are only stored in the panel — no error.

Setup (5 minutes, phone + laptop):

1. In Telegram, message `@BotFather` → send `/newbot` → follow prompts → copy the token → put it in `TELEGRAM_BOT_TOKEN`.
2. In Telegram, open your new bot and press **Start** (send any message, e.g. `hi`).
3. In a browser, open `https://api.telegram.org/bot<TOKEN>/getUpdates` (replace `<TOKEN>`). Find `"chat":{"id":123456789}` — that number is your `TELEGRAM_CHAT_ID`.
4. Put both in `.env` and restart the server (`npm run dev`).
5. Place a test order. You should get a `🧦 سفارش جدید #...` message within seconds.

Notes:
- `getUpdates` only works while the bot has no webhook. If it returns `{"ok":true,"result":[]}`, send another message to the bot and retry.
- To notify a group/channel instead of yourself: add the bot to the group, send a message, read `getUpdates` again for the group id (often negative, e.g. `-100...`).
- Never commit the token. Revoke via `@BotFather` → `/revoke` if leaked.

## Admin panel (`/admin`)

- Login with `ADMIN_PASSWORD`. Session = httpOnly cookie `socks_admin` (7 days).
- Products tab: add / edit / delete, set price (تومان) and stock. `stock = 0` → storefront shows ناموجود. Image via mobile upload (`/public/uploads`, 3 MB max) or direct URL.
- Orders tab: list, expand for details, toggle status `new` / `sent`, tap-to-call customer.
- Help tab: in-app Telegram + stock guide.

## Database

- SQLite file `data/shop.db` (auto-created + seeded). Tables: `products`, `orders`.
- To reset: stop the server, delete `data/shop.db*`, restart — it re-seeds.
- `data/*.db*` is gitignored; production needs a persistent volume or regular backup (see TODO).

## TODO

- [ ] **Change admin password from inside the panel** — not implemented yet; today it requires editing `ADMIN_PASSWORD` in `.env` + restart. Planned: settings form in `/admin` that updates the stored hash.
- [ ] Set real `NEXT_PUBLIC_SHOP_PHONE` and `NEXT_PUBLIC_TELEGRAM_CHANNEL`.
- [ ] Change `ADMIN_PASSWORD` from default `admin123` in production + rotate if ever shared.
- [ ] Decide product catalog + real photos (replace `public/socks/*.svg` placeholders where needed).
- [ ] Add `robots.txt` / sitemap + real shop name in `app/layout.tsx` metadata.
- [ ] Production deploy: persistent disk for `data/shop.db`, `public/uploads` backup, HTTPS, `ADMIN_PASSWORD` via secret manager.
- [ ] Upload hygiene: image resize/compress, delete orphan files on product delete.
- [ ] Order management: delete/cancel order, search/filter, export CSV.
- [ ] Harden checkout: rate-limit `POST /api/orders`, basic spam honeypot.
- [ ] Optional later: online payment gateway, SMS confirmation, multi-admin accounts.

## License

Private MVP for Delvin socks shop. No license granted yet — add one before public launch if needed.
