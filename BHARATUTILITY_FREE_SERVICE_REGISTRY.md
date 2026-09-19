# BharatUtility — Free External Services & APIs Registry

This document records all external services, APIs, and data sources integrated into BharatUtility, verifying strict adherence to the **₹0 Ongoing Cost Policy**.

---

## 1. Hierarchy of Implementation

```
   ┌──────────────────────────────────────────────────────────┐
   │  1. LOCAL CALCULATION & DETERMINISTIC ALGORITHMS         │
   │     (Math formulas, Tax 44ADA, SSY, Gold price, Units)   │
   └────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │  2. LOCAL CURATED STATIC DATASETS                        │
   │     (Bank holidays, RTO codes, Legal Indian laws, IFSC)  │
   └────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │  3. VERIFIED ₹0 FREE EXTERNAL APIS (No-Key / Open)       │
   │     (Open-Meteo, Postal PIN, Open ER FX, CoinGecko, HIBP)│
   └────────────────────────────┬─────────────────────────────┘
                                │
                                ▼
   ┌──────────────────────────────────────────────────────────┐
   │  4. SUPABASE CLOUD DATABASE                              │
   │     (Persistent User Contacts, Citizen Tool Requests,    │
   │      Write-Only Anonymous Telemetry Ingestion)           │
   └──────────────────────────────────────────────────────────┘
```

---

## 2. Free Service Registry Details

| # | Provider | Purpose / Tool Integration | Auth / Key Required | Free Tier Terms & Limits | Fallback Strategy | Billing Risk |
|---|---|---|---|---|---|---|
| **1** | **Open-Meteo** (`open-meteo.com`) | Real-time weather, temperature, humidity, wind & Air Quality Index (CPCB PM2.5/PM10) in `AqiAndWeatherSuite` | **None** (Public Open API) | Free for non-commercial and public web apps up to 10,000 calls/day. Zero credit card. | Hardcoded realistic regional baseline weather and AQI averages. | **₹0 (Zero risk)** |
| **2** | **Open Exchange Rates / ER-API** (`open.er-api.com`) | Real-time foreign exchange conversion rates (USD, EUR, GBP, AED, SAR, INR, etc.) in `CurrencyConverterSuite` | **None** (Open Endpoint) | Public open rates endpoint updated daily. Free, no rate-limit restrictions for standard queries. | Local `localStorage` rate cache + offline baseline rates. | **₹0 (Zero risk)** |
| **3** | **India Post Pincode API** (`api.postalpincode.in`) | 6-digit Indian PIN code and Post Office branch lookup in `IndiaServicesSuiteCalculator` and `LivePublicApisSuiteCalculator` | **None** (Open Government Data proxy) | Free public API for Indian postal code queries. | Fast in-memory LRU cache + regional zone index mapping. | **₹0 (Zero risk)** |
| **4** | **Razorpay Open IFSC API** (`ifsc.razorpay.com`) | Real-time Bank branch, MICR, address, and RTGS/NEFT/IMPS lookup by IFSC in `LivePublicApisSuiteCalculator` | **None** (Open Open-Source repository) | 100% free open dataset hosted on Razorpay edge CDN. | Curated top-10 national bank branches index. | **₹0 (Zero risk)** |
| **5** | **CoinGecko Simple Price API** (`api.coingecko.com`) | Live cryptocurrency prices (BTC, ETH, SOL, USDT, XRP, ADA) in INR in `CryptoInrTaxCalculator` | **None** (Public Free V3 Endpoint) | Free public demo tier (30 calls/min). No payment card required. | Hardcoded baseline coin prices. | **₹0 (Zero risk)** |
| **6** | **HaveIBeenPwned / Cloudflare API** (`api.pwnedpasswords.com`) | k-Anonymity password data breach checker in `PasswordBreachChecker` | **None** (Public k-Anonymity) | Free open security service hosted globally on Cloudflare edge. Only sends 5-char SHA-1 prefix. | Offline length & complexity heuristics. | **₹0 (Zero risk)** |
| **7** | **WhereTheISS.at API** (`api.wheretheiss.at`) | Live International Space Station (ISS) orbital velocity, latitude & longitude in `LivePublicApisSuiteCalculator` | **None** (Open Educational API) | Free public endpoint for space telemetry. | Static orbital baseline coordinates. | **₹0 (Zero risk)** |
| **8** | **IP-API / Ipify** (`ipapi.co` / `api.ipify.org`) | Client IP network diagnostics, public IP detection, and approximate city geocoding in `IpInspectorSuite` & `analyticsService` | **None** (Public Free Tiers) | Free public lookup (up to 1,000 daily requests) with 3-second timeout. | Non-blocking fallback to local network / "India" default. | **₹0 (Zero risk)** |
| **9** | **Supabase Database** (`supabase.co`) | Persistent storage for User Contact submissions, Citizen Tool Requests, and Write-Only Telemetry Events | Publishable Anon Key | Generous free tier (500MB database, 50,000 monthly active users). Zero public read leaks. | Local `localStorage` submission caching on network failures. | **₹0 (Zero risk)** |

---

## 3. Rejected Services & Rationale

| Service / Provider | Evaluated For | Rejection Reason |
|---|---|---|
| **OpenAI / Claude / Gemini Paid APIs** | Form generator, Tax advice | **Rejected**: Requires paid API credits or credit card on file, violating the strict ₹0 cost policy. Replaced with deterministic local calculations. |
| **Google Maps Geocoding API** | PIN Code and City mapping | **Rejected**: Requires Google Cloud billing account and credit card with pay-as-you-go pricing. Replaced with `api.postalpincode.in` and Open-Meteo. |
| **Fixer.io / CurrencyLayer** | Currency rates | **Rejected**: Paid plans with 250 req/month hard limits and payment method requirements. Replaced with open `open.er-api.com`. |
| **OpenWeatherMap OneCall** | Weather and AQI | **Rejected**: Requires credit card subscription for modern v3 API. Replaced with Open-Meteo. |
| **Supabase Storage for Static Post Offices** | Indian Post Office lookup table | **Rejected**: Unnecessary database bloat (1.5 lakh rows) and database connection consumption. Replaced with free direct API and in-memory LRU cache. |

---

## 4. Verification & Guarantees

* **Zero Paid Services**: No Stripe, PayPal, OpenAI, or paid subscription SDKs are present in the project.
* **No Client Key Exposure**: All adopted external APIs are no-key open endpoints.
* **Zero Billing Risk**: No credit card or billing instrument is linked or capable of generating surprise charges.
