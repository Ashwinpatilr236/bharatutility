# Integrations & External Services — BharatUtility

## 1. Supabase Backend
- **Client Configuration:** `src/lib/supabase.ts` initializes `@supabase/supabase-js` with graceful fallback when environment keys are missing or offline.
- **Database Tables:**
  - `contact_messages`: Handles Contact Us inquiries (`src/services/contactService.ts`).
  - `tool_requests`: Handles User Tool Suggestions & Requests (`src/services/toolRequestService.ts`).
- **Security Posture:**
  - Frontend client connects via public anonymous keys (`VITE_SUPABASE_ANON_KEY`) with Row-Level Security (RLS) policies enforcing insert-only permissions for public users.

## 2. Public & Free APIs
- **Exchange Rates & Forex:**
  - `https://open.er-api.com/v6/latest/INR` for live foreign currency rates against Indian Rupee.
- **Live Weather & Air Quality Index (AQI):**
  - `https://air-quality-api.open-meteo.com/v1/air-quality` (European AQI / US AQI, PM2.5, PM10, Ozone, NO2).
  - `https://api.open-meteo.com/v1/forecast` (Live temperature, humidity, wind speed, weather conditions).
- **Network & IP Diagnostics:**
  - `https://api.ipify.org?format=json` (Public IPv4 resolver).
  - `https://ipapi.co/json` / `http://ip-api.com/json` (ISP, ASN, Organization, city, region detection).
- **Public Holidays & Long Weekend Planner:**
  - `https://date.nager.at/api/v3/PublicHolidays/{year}/IN` (Official gazetted Indian holidays).
- **Panchang & Astronomical Muhurats:**
  - High-precision astronomical solar geometry algorithms calculating Sun declination, sunrise/sunset, Yamagandam, Gulika Kaal, and Choghadiya periods for all major Indian cities.

## 3. Official Government & Citizen Service Portals
- Deep-link integrations and step-by-step verified action guides to official Indian citizen portals:
  - Income Tax e-Filing & 26AS/AIS (`incometax.gov.in`)
  - UIDAI Aadhaar Self-Service Update Portal (`myaadhaar.uidai.gov.in`)
  - National Consumer Helpline (NCH 1915 / `consumerhelpline.gov.in`)
  - National Cyber Crime Reporting Portal (1930 / `cybercrime.gov.in`)
  - Ministry of Health ABHA / ABDM PHR (`healthid.ndhm.gov.in`)
  - Parivahan Sewa E-Challan & Sarathi (`echallan.parivahan.gov.in`)
  - CEIR Lost / Stolen Mobile Tracking & Blocking (`ceir.gov.in`)
  - Jan Aushadhi Generic Medicine Scheme (`janaushadhi.gov.in`)
