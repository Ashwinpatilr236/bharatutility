# Technical Concerns, Roadmap & Risk Assessment

**Application:** BharatUtility  
**Status:** Production Ready (112 Tools, 13 Categories, 133 Routes)  

---

## 1. Identified Technical Considerations & Debt

### A. SPA Client-Side Rendering (CSR) vs Static Prerendering
- **Current State:** The application is a React 19 Single Page Application. While `document.title`, `<meta>`, OpenGraph, and JSON-LD schema are dynamically injected on navigation, social media link preview bots (WhatsApp, Twitter/X scrapers, Telegram) that do not execute JavaScript may receive the default `index.html` fallback meta tags.
- **Mitigation / Next Step:** Implement a lightweight build-time static prerender step (e.g., via Puppeteer or Vite SSG plugin) to emit static HTML snapshots for all 133 routes in `dist/`.

### B. Third-Party Free API Rate Limiting & Network Caching
- **Current State:** Tools like Live Currency Converter (`open.er-api.com`), Indian AQI (`open-meteo.com`), and IP Inspector (`ipapi.co`) make fresh fetch requests upon mounting.
- **Risk:** High concurrent user spikes could trigger 429 Too Many Requests on free third-party endpoints.
- **Current Mitigation:** Embedded offline fallback datasets prevent UI breakage.
- **Recommended Enhancement:** Add `sessionStorage` caching with a 15-minute Time-To-Live (TTL) so repeated tool switches do not re-query external APIs.

### C. Large File Memory Consumption in Browser (PDF & Image Tools)
- **Current State:** `pdf-lib` and HTML5 Canvas operate directly on `ArrayBuffer` in browser memory.
- **Risk:** Processing 50MB+ scanned PDFs or 4K RAW images on budget Android smartphones (2GB RAM) could cause browser tab memory exhaustion.
- **Mitigation / Next Step:** Enforce a recommended max file size banner (e.g., 25MB) with client-side downsampling before memory allocation.

### D. Progressive Web App (PWA) & Offline Capabilities
- **Current State:** The site runs as a standard responsive web application.
- **Opportunity:** Since 95% of BharatUtility tools (106 out of 112) require zero internet connection and run entirely in pure JavaScript, adding a Service Worker (`vite-plugin-pwa`) would enable 100% offline functionality for Indian users in low-connectivity rural zones.

---

## 2. Security & Compliance Posture

| Area | Status | Notes |
|:---|:---|:---|
| **API Keys & Secrets** | ✅ Hardened | Zero exposed API secrets. All third-party endpoints are public or fallback-driven. |
| **Client Privacy** | ✅ 100% Private | User financial numbers, salaries, documents, photos, and camera streams never leave the device. |
| **Official Brand Links** | ✅ Compliant | Only verified ARRJS Technologies corporate social media profiles are linked. |
| **XSS & Injection** | ✅ Protected | Controlled inputs with sanitized numeric coercions and React JSX auto-escaping. |

---

## 3. High-Priority Next Enhancements

1. **PWA Service Worker:** Offline caching for instant loading on Indian 4G/5G and offline access.
2. **Session Storage API Cache:** 15-minute TTL caching for Currency, AQI, and Fuel prices.
3. **Static Prerenderer:** Build-time HTML prerender for Twitter/WhatsApp social link scrapers.
4. **Dark Mode Toggle:** User-switchable light/dark theme preference with automatic OS sync.
