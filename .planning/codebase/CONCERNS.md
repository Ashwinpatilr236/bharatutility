# Security, Performance & Technical Considerations — BharatUtility

## 1. Security & Privacy Posture
- **Zero Exposed Secret Tokens:**
  - Hardcoded tokens (e.g. Telegram Bot tokens) have been completely eliminated.
  - Supabase client operates exclusively via public anon keys (`VITE_SUPABASE_ANON_KEY`) with Row-Level Security (RLS) policies on the backend database.
- **Client-Side Privacy Guarantee (k-Anonymity):**
  - Features such as the **Password & Data Breach Exposure Checker** never send user credentials across the internet.
  - Hashes are generated locally via the browser's native `crypto.subtle` API, and only the 5-character prefix is used to query public collision ranges.
- **Client-Side Document & PDF Security:**
  - All document processing (PDF merge, split, image compression, passport photo cropping) executes 100% locally in browser memory without transmitting user documents or images to external servers.

---

## 2. Performance & Code-Splitting Architecture
- **Lazy Chunk Loading:**
  - Individual tool components are lazily evaluated via `React.lazy()`.
  - Heavy chart and PDF libraries (`chart.js`, `jspdf`, `pdf-lib`) are isolated in independent vendor chunks, preventing initial page load bottlenecks.
- **Vite Build Bundle Profile:**
  - CSS Bundle: ~165 kB (~20 kB gzip).
  - Main Framework: ~390 kB (~119 kB gzip).
  - Individual Tool Chunks: 5 kB to 25 kB (1.5 kB to 6 kB gzip).

---

## 3. Resilience & Fallback Mechanisms
- **Offline & API Fallbacks:**
  - Currency, Crypto, AQI, Weather, and Fuel price tools include hardcoded Indian benchmark rates that activate seamlessly if external network endpoints experience rate limits or downtime.
- **Graceful Supabase Degradation:**
  - If Supabase environment variables are missing in local dev or offline mode, contact and tool request forms safely store entries to browser `localStorage` with user notification rather than crashing.

---

## 4. Maintenance & Evolution Checklist
- **Adding New Tools:**
  1. Add entry to `src/data/toolsRegistry.ts`.
  2. Update tool count in `src/data/categories.ts`.
  3. Mount lazy import & case in `src/components/tools/ToolPageLayout.tsx`.
  4. Run `npm run lint` and `npm run test:seo`.
  5. Run `npm run sitemap` to refresh `public/sitemap.xml`.
