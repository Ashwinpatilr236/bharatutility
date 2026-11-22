# PARKSIGNAL — Production Deployment & Operator Guide
### Product: ParkSignal • By BharatUtility
**Primary Tagline:** *"Your Vehicle. Your Privacy."*  
**Secondary Tagline:** *"Scan. Alert. Connect."*  
**Official Bot:** [`@ParkSignal_bot`](https://t.me/ParkSignal_bot)  
**Live URL:** `https://bharatutility.tech/parksignal`

---

## 1. Overview
ParkSignal is a privacy-first, QR-based vehicle parking alert system built as an independent mini-product inside BharatUtility.
This guide details how to configure the Cloudflare Worker, Cloudflare D1 database, and Telegram Bot API webhook for production deployment, achieving a 100% ₹0/month operational budget.

---

## 2. Telegram Bot Setup (@ParkSignal_bot)

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot`.
3. Set the Bot Name: `ParkSignal – Parking Alerts`
4. Set the Bot Username: **`ParkSignal_bot`** (or your verified username).
5. Copy the generated HTTP API Bot Token (e.g. `123456789:ABCdefGhIJKlmNoPQRstuVWXyz`).
6. Configure Bot Commands in BotFather:
   Send `/setcommands` and enter:
   ```text
   start - Connect or test your ParkSignal account
   myvehicles - View your registered vehicles and statuses
   unlink - Disconnect your Telegram account from ParkSignal
   help - How ParkSignal works and privacy guide
   ```
7. Set description via `/setdescription`:
   ```text
   ParkSignal by BharatUtility delivers instant, privacy-protected vehicle parking alerts. When someone scans your car's QR sticker, you receive alerts here without sharing your phone number.
   ```

---

## 3. Cloudflare D1 Database Provisioning

From the project root:

```bash
cd workers/parksignal

# 1. Login to Cloudflare
npx wrangler login

# 2. Create the Cloudflare D1 Database
npx wrangler d1 create parksignal-d1
```

Copy the `database_id` output by Wrangler and update `workers/parksignal/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "parksignal-d1"
database_id = "<PASTE_DATABASE_ID_HERE>"
```

### Apply Schema Migration to Production D1:

```bash
npx wrangler d1 execute parksignal-d1 --file=./schema.sql --remote
```

---

## 4. Cloudflare Worker Deployment & Secrets

Set the required production secrets in Cloudflare (never commit tokens to git):

```bash
cd workers/parksignal

# Set the Telegram Bot Token obtained from BotFather
npx wrangler secret put TELEGRAM_BOT_TOKEN

# Set a secure random string for Telegram Webhook Secret verification
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

### Deploy Worker:

```bash
npx wrangler deploy
```

Take note of the deployed Worker URL, e.g.:
`https://parksignal-api.<your-subdomain>.workers.dev`

---

## 5. Register Telegram Webhook

Link the Telegram Bot API to your Cloudflare Worker:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://parksignal-api.<your-subdomain>.workers.dev/api/parksignal/telegram/webhook",
    "secret_token": "<YOUR_TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["message"]
  }'
```

Verify webhook registration:
```bash
curl "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

---

## 6. Frontend Integration (Netlify / BharatUtility)

In your Netlify environment settings (or `.env.production`):

```env
VITE_PARKSIGNAL_API_URL="https://parksignal-api.<your-subdomain>.workers.dev/api/parksignal"
```

Alternatively, you can proxy requests through `netlify.toml` for same-origin calls on `bharatutility.tech`:

```toml
[[redirects]]
  from = "/api/parksignal/*"
  to = "https://parksignal-api.<your-subdomain>.workers.dev/api/parksignal/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 7. Local Development Workflow

To develop and test ParkSignal offline or locally without requiring live Cloudflare credentials:

```bash
# 1. Start local development server (Express 5 + Vite dev server)
npm run dev
```

- Open `http://localhost:3000/parksignal` in your browser.
- All `/api/parksignal/*` requests are intercepted by `server.ts` and served locally.
- You can register accounts, add vehicles, preview printable stickers, and test scanner URLs (`http://localhost:3000/parksignal/alert/<token>`).
- If you add `TELEGRAM_BOT_TOKEN` to your local `.env`, the dev server will also dispatch real Telegram alerts!

---

## 8. Quotas & Free-Tier Limits

- **Cloudflare Workers**: 100,000 requests / day (Free).
- **Cloudflare D1**: 5,000,000 read rows / day, 100,000 write rows / day, 5 GB storage (Free).
- **Telegram Bot API**: 100% Free, unlimited alerts (30 msg/sec rate limit).
- **Audio Storage**: ₹0 (Voice notes are streamed ephemerally in memory to Telegram via `sendVoice` without storing files on disk).
- **Netlify CDN**: 100 GB monthly bandwidth allowance.
