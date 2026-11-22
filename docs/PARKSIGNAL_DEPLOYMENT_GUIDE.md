# PARKSIGNAL — Production Deployment & Supabase Architecture Guide
### Product: ParkSignal • By BharatUtility
**Tagline:** *"Your Vehicle. Your Privacy. Scan. Alert. Connect."*  
**Official Telegram Bot:** [`@ParkSignal_bot`](https://t.me/ParkSignal_bot)  
**Production URL:** `https://bharatutility.tech/parksignal`  
**Backend Architecture:** Supabase Auth + Supabase PostgreSQL (RLS) + Supabase Edge Functions

---

## 1. Overview
ParkSignal is a privacy-first, QR-based vehicle parking alert system built as an independent mini-product inside BharatUtility.
This guide details the complete setup for **Supabase Auth, PostgreSQL, Row Level Security, Edge Functions, and Telegram Webhook integration**, maintaining a genuine ₹0/month operational budget under Supabase's generous free tier.

---

## 2. Supabase Project Setup

1. Log in to [Supabase](https://supabase.com).
2. Select your existing BharatUtility project (or create a new project named `bharatutility`).
3. Note your project credentials under **Project Settings > API**:
   - `Project URL`: `https://<project-ref>.supabase.co`
   - `Anon / Public Key`: `eyJ...` (Publishable client key)
   - `Service Role Key`: `eyJ...` (Secret admin key used ONLY in Edge Functions and CI)

---

## 3. Database Schema & RLS Policies (SQL Migration)

Open **SQL Editor** in your Supabase Dashboard, click **New Query**, and execute the migration file located at:
`supabase/migrations/20261122_parksignal_schema.sql`

This creates:
- `parksignal_profiles`: Mirrors `auth.users` with user full name and Telegram connection metadata.
- `parksignal_vehicles`: Stores owner vehicles (Car, Bike, Scooter, Other) with RLS enforcing `auth.uid() = owner_id`.
- `parksignal_vehicle_settings`: Per-vehicle alert category toggles, custom text limits, and voice note controls.
- `parksignal_qr_tokens`: Cryptographic tokens linking physical QR stickers to vehicles.
- `parksignal_telegram_accounts`: Stores connected Telegram chat IDs with `auth.uid() = user_id` isolation.
- `parksignal_telegram_link_tokens`: One-time 10-minute expiring tokens for linking `@ParkSignal_bot`.
- `parksignal_alerts`: Audit log of sent text and voice parking alerts with scanner IP hashes.
- `parksignal_rate_limits`: Sliding-window rate limiting.
- `get_parksignal_vehicle_by_qr(p_qr_token)`: `SECURITY DEFINER` function for safe public scanner lookups without leaking owner identities.
- `create_parksignal_telegram_link(p_intent)`: Generates secure Telegram link tokens for the authenticated user.
- Trigger `on_auth_user_created_parksignal`: Auto-populates `parksignal_profiles` upon user sign up.

---

## 4. Telegram Bot Setup (@ParkSignal_bot)

1. Open Telegram and search for `@BotFather`.
2. Use an existing bot or send `/newbot`:
   - Name: `ParkSignal – Parking Alerts`
   - Username: `ParkSignal_bot`
3. Copy the Bot API Token (e.g. `123456789:ABCdefGhIJKlmNoPQRstuVWXyz`).
4. Set commands in BotFather (`/setcommands`):
   ```text
   start - Connect or test your ParkSignal account
   myvehicles - View your registered vehicles and statuses
   unlink - Disconnect your Telegram account from ParkSignal
   help - How ParkSignal works and privacy guide
   ```
5. Set description via `/setdescription`:
   ```text
   ParkSignal by BharatUtility delivers instant, privacy-protected vehicle parking alerts. When someone scans your vehicle QR sticker, you receive alerts here without sharing your phone number.
   ```

---

## 5. Supabase Edge Functions Deployment

ParkSignal uses two Supabase Edge Functions:
1. `parksignal-bot`: Handles Telegram Bot webhook updates, `/start link_<token>`, `/unlink`, and `/myvehicles`.
2. `parksignal-alert`: Dispatches text and voice alerts securely using the bot token without exposing it to the frontend.

### Set Edge Function Secrets in Supabase CLI:

```bash
# Set secrets in Supabase (Never commit bot tokens to git)
supabase secrets set TELEGRAM_BOT_TOKEN="<YOUR_TELEGRAM_BOT_TOKEN>"
supabase secrets set TELEGRAM_WEBHOOK_SECRET="<YOUR_32_CHAR_RANDOM_SECRET>"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<YOUR_SUPABASE_SERVICE_ROLE_KEY>"
```

*Or via the Supabase Dashboard:*
Navigate to **Project Settings > Edge Functions > Secrets** and add:
- `TELEGRAM_BOT_TOKEN`: Your BotFather token
- `TELEGRAM_WEBHOOK_SECRET`: Secure random string for webhook verification
- `SUPABASE_SERVICE_ROLE_KEY`: Your project's service role key

### Deploy Edge Functions:

```bash
supabase functions deploy parksignal-bot --no-verify-jwt
supabase functions deploy parksignal-alert --no-verify-jwt
```

---

## 6. Register Telegram Webhook to Supabase

Link the Telegram Bot API to your `parksignal-bot` Edge Function:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<your-project-ref>.supabase.co/functions/v1/parksignal-bot",
    "secret_token": "<YOUR_TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["message"]
  }'
```

Verify webhook status:
```bash
curl "https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

---

## 7. Frontend Environment Variables (Netlify)

In your **Netlify Site Configuration > Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://<your-project-ref>.supabase.co` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Supabase Anonymous Client Key |

*Note: The Telegram Bot Token is NEVER exposed in the frontend.*

---

## 8. Supabase Auth Configuration

1. In Supabase Dashboard, go to **Authentication > URL Configuration**:
   - **Site URL**: `https://bharatutility.tech`
   - **Redirect URLs**:
     - `https://bharatutility.tech/parksignal/login`
     - `https://bharatutility.tech/parksignal/dashboard`
     - `http://localhost:3000/parksignal/login`
2. Go to **Authentication > Email Templates**:
   - Configure **Confirm signup** and **Reset password** templates as desired.

---

## 9. Free-Tier Operational Limits (₹0/Month)

- **Supabase Database**: 500 MB PostgreSQL (Thousands of vehicles & alert logs).
- **Supabase Auth**: 50,000 monthly active users (Free).
- **Supabase Edge Functions**: 500,000 invocations / month (Free).
- **Telegram Bot API**: 100% Free, unlimited message delivery.
- **Audio Storage**: ₹0 (Voice notes are streamed ephemerally in memory via Telegram `sendVoice` without storing audio files on disk).
