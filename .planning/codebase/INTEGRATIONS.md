# External Integrations & APIs — BharatUtility

## 1. Supabase (Database & Tool Requests)
- **Client Configuration:** `src/lib/supabase.ts`
- **Environment Variables:**
  - `VITE_SUPABASE_URL` (Public Project URL)
  - `VITE_SUPABASE_ANON_KEY` (Public Anon Key)
- **Services:**
  - `contactService.ts`: Stores contact form submissions in table `contact_submissions`.
  - `toolRequestService.ts`: Stores user feature & tool suggestions in table `tool_requests`.
  - **Graceful Degradation:** Local storage fallback when Supabase credentials are not provided or offline.

## 2. Zero-Cost Live Open APIs
All external live features operate on free, public, CORS-enabled open endpoints with offline fallback baselines:

1. **Exchange Rates (Currency Converter & NRI Remittance):**
   - **Endpoint:** `https://open.er-api.com/v6/latest/INR`
   - **Data:** Live foreign exchange rates (USD, EUR, GBP, AED, CAD, SGD, SAR, etc.) vs Indian Rupee.
2. **Crypto Market Rates (Crypto to INR & 30% Tax):**
   - **Endpoint:** `https://api.coingecko.com/api/v3/simple/price`
   - **Parameters:** `ids=bitcoin,ethereum,solana,tether,ripple,cardano&vs_currencies=inr&include_24hr_change=true`
3. **Air Quality Index & Weather:**
   - **Endpoint:** `https://air-quality-api.open-meteo.com/v1/air-quality` & `https://api.open-meteo.com/v1/forecast`
   - **Data:** US AQI, PM2.5, PM10, Temperature, Humidity across major Indian cities (Delhi, Mumbai, Bengaluru, etc.).
4. **IP Address & ISP Network Intelligence:**
   - **Endpoints:** `https://api.ipify.org?format=json` & `https://ipapi.co/json/`
   - **Data:** Public IP address, ASN, ISP Detection (Jio, Airtel, Vi, BSNL, ACT Fibernet), city, latitude, and longitude.
5. **Password Data Breach Exposure (k-Anonymity):**
   - **Endpoint:** `https://api.pwnedpasswords.com/range/{5_char_sha1_prefix}`
   - **Privacy Model:** Browser computes SHA-1 locally via Web Crypto API; only the 5-char prefix is transmitted over the network.
6. **Edge CDN Latency Probing:**
   - **Endpoints:** Indian Cloudflare CDN edge nodes and Google endpoints with cache-busting timestamps.

## 3. Official Government Portal Links (Direct Deep-Links)
- **e-Challan Payments:** MoRTH Parivahan (`echallan.parivahan.gov.in`), State Police Portals (MahaTraffic, Delhi Police, BTP), Virtual Courts (`vcourts.gov.in`).
- **Lost Mobile Phone Blocking:** DoT Sanchar Saathi CEIR (`ceir.sancharsaathi.gov.in`).
- **Generic Medicines Directory:** Pradhan Mantri Bhartiya Janaushadhi Pariyojana (`janaushadhi.gov.in`).
- **Banking & Verification:** NPCI UPI Directory, RBI Bank Holidays, UIDAI Aadhaar, Income Tax e-Filing, GST Portal.

## 4. Backend Express Endpoints (`server.ts`)
- `GET /api/health` — Returns JSON server health status and uptime.
- `GET /api/admin/health-check` — Verification endpoint for admin infrastructure.
- `GET /*` — Serves Vite static build output (`dist/`) with SPA fallback to `index.html`.
