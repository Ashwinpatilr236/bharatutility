# Integrations & External Services

**Application:** BharatUtility  
**Scope:** External APIs, Database Services, Storage & Telemetry  

---

## 1. Cloud Database & Backend (Supabase)

BharatUtility utilizes **Supabase** (`@supabase/supabase-js`) for persistent data collection and user feedback loops without requiring heavy custom server infrastructure.

- **Client Configuration:** `src/lib/supabase.ts`
- **Environment Variables Required:**
  - `VITE_SUPABASE_URL`: Project REST endpoint
  - `VITE_SUPABASE_ANON_KEY`: Public anonymous client key

### Data Tables & Integration Modules:
1. **Contact & Bug Reports (`contact_submissions`)**
   - File: `src/services/contactService.ts`
   - Role: Captures user general inquiries, error reports, and partnership messages.
   - Fallback: Gracefully handles offline or missing credentials with local success UX.
2. **Tool Request Submissions (`tool_requests`)**
   - File: `src/services/toolRequestService.ts`
   - Role: Records citizen tool requests with use case, category, and urgency score.
   - Admin Sync: Integrates with ARRJS central administrative triage pipeline.

---

## 2. Public Free REST APIs & Fallbacks

BharatUtility adheres to a **zero-paywall, zero-login, high-reliability** model for real-time live tools. Every external API is designed with instant offline fallbacks and error boundaries.

### A. Live Currency Converter & NRI Remittance
- **Primary Endpoint:** `https://open.er-api.com/v6/latest/INR`
- **Purpose:** Fetches real-time mid-market exchange rates against 160+ world currencies with bank margin comparison (SBI, HDFC, Wise, Western Union).
- **Fallback Engine:** Embedded benchmark baseline rates for USD, EUR, GBP, AED, CAD, AUD, SGD, SAR, QAR, KWD.
- **Component:** `src/components/tools/travel/LiveCurrencyConverter.tsx`

### B. Live Indian AQI & Weather Tracker
- **Primary Endpoints:**
  - Air Quality: `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=...&longitude=...&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`
  - Weather Forecast: `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`
- **Purpose:** 100% free, no-API-key environmental tracking covering 25+ major Indian Tier-1, Tier-2, and capital cities with CPCB health advisories.
- **Fallback Engine:** Static seasonal Indian baseline averages for Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad.
- **Component:** `src/components/tools/india/LiveCityAqiTracker.tsx`

### C. My IP & ISP Connection Inspector
- **Primary Endpoint:** `https://ipapi.co/json/`
- **Secondary Fallback Endpoint:** `https://api.ipify.org?format=json`
- **Purpose:** Inspects public IPv4/IPv6 address, ISP / Autonomous System Name (Jio, Airtel, Vi, BSNL, ACT Fibernet, Tata), city, region, postal code, ASN, and latency ping test.
- **Component:** `src/components/tools/tech/IpNetworkInspector.tsx`

### D. Indian Public Holidays & Long Weekend Planner
- **Primary Endpoint:** `https://date.nager.at/api/v3/PublicHolidays/{year}/IN`
- **Purpose:** Fetches official Indian national holidays, festival dates, and dynamically computes 3-day and 4-day long weekend bridge opportunities (Take Friday/Monday off).
- **Fallback Engine:** Comprehensive offline Indian calendar dataset including Diwali, Eid, Holi, Christmas, Republic Day, Independence Day, Gandhi Jayanti, Dussehra, Ganesh Chaturthi, Raksha Bandhan.
- **Component:** `src/components/tools/india/IndianHolidaysPlanner.tsx`

---

## 3. Browser Native Hardware & Web API Integrations

BharatUtility prioritizes **100% Client-Side Privacy** for documents, media, and camera feeds:

1. **Live Camera & Media Stream API (`navigator.mediaDevices.getUserMedia`)**
   - High-performance real-time video feed capture for live QR code scanning.
   - Component: `src/components/tools/documents/LiveQrScanner.tsx`
2. **Barcode Detection API (`window.BarcodeDetector`) + Canvas Fallback**
   - Uses hardware-accelerated OS QR decoding when supported; falls back to canvas-based pixel sampling and image upload analysis.
3. **HTML5 Canvas & ImageData Processing**
   - Client-side passport photo background enhancement, pixel resizing (KB targeting for government portals), and signature cropping.
   - Components: `PassportPhotoMaker.tsx`, `SignatureResizer.tsx`, `ImageCompressor.tsx`.
4. **Web Cryptography & LocalStorage**
   - Offline favorites persistence (`bharat_utility_favorites`), theme preference, and recently calculated values stored securely in local browser storage.
