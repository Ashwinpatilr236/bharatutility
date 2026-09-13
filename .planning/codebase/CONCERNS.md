# Technical Debt, Concerns & Security Posture — BharatUtility

## 1. Security & Privacy Hardening
- **Client-Side Privacy:** No user text from the Online Notepad or sketches from the Paint tool are sent to remote servers; all data is contained within the user's browser `localStorage` and memory.
- **Bot Token Hardening:** Removed exposed Telegram bot tokens previously flagged during the security review. Contact and tool requests route securely to Supabase via RLS.
- **CORS & Micro-API Resilience:** External APIs (Open-Meteo AQI, Open ER-API Forex, IPify) are called with fallback state to ensure that network dropouts or CORS restrictions do not crash the UI.

## 2. Bundle Optimization & Performance
- **`vendor-charts` and `PDFButton` chunks:** `jspdf` and `chart.js` are code-split into dedicated asynchronous bundles to avoid degrading initial page load metrics.
- **Canvas Memory Management:** Large image annotations and drawing history limit undo states to 20 frames to protect mobile RAM and avoid memory leak issues.

## 3. Future Roadmap Considerations
- **PWA / Service Worker Caching:** Enable full progressive web app offline caching for instant home-screen installation on Android and iOS.
- **Dynamic Government Slabs Sync:** Monitor annual Union Budget tax slab adjustments (e.g. Budget 2025/2026 8th CPC & 12A/12B revisions) to keep default tax formulas up-to-date.
