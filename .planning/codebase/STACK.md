# Stack & Technologies

**Application:** BharatUtility — India's Utility Super-Site  
**Production Domain:** [https://bharatutility.tech](https://bharatutility.tech)  
**Repository Path:** `c:\Users\USER\Desktop\bharatutility`  

---

## 1. Core Framework & Runtime

| Component | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Frontend Framework** | React | `^19.0.1` | Core UI library for component rendering & hooks |
| **DOM Renderer** | React DOM | `^19.0.1` | React web rendering engine |
| **Build Tool & Dev Server** | Vite | `^6.2.3` | Ultra-fast ESM bundler and HMR development server |
| **Language** | TypeScript | `~5.8.2` | Static typing, strict mode, interfaces & types |
| **Backend / SSR Server** | Express | `^4.21.2` | Lightweight Node.js server for static assets & health probes |
| **Backend Execution** | TSX / Node.js | `tsx ^4.21.0` / Node `^22.x` | TypeScript execution in development and node runtime in production |
| **Server Bundler** | esbuild | `^0.25.0` | Compiles `server.ts` into single CJS bundle `dist/server.cjs` |

---

## 2. Styling & Design System

| Library | Version | Role | Notes |
|:---|:---|:---|:---|
| **Tailwind CSS** | `^4.1.14` | Utility-first CSS engine | Integrated via `@tailwindcss/vite` plugin |
| **Autoprefixer** | `^10.4.21` | Vendor prefix post-processing | Cross-browser CSS compatibility |
| **Lucide Icons** | `lucide-react ^0.546.0` | Comprehensive iconography | Consistent Indian UI / utility icons |
| **Framer Motion / Motion** | `motion ^12.23.24` | Animation primitives | Micro-animations, transitions, stagger effects |
| **Canvas Confetti** | `canvas-confetti ^1.9.4` | Visual celebration feedback | Goal completion, calculations reward |

---

## 3. Data Visualization & Client-side Utilities

| Library | Version | Key Use Cases |
|:---|:---|:---|
| **Recharts** | `^3.10.1` | Interactive EMI loan amortization, SIP compound interest graphs, investment projections |
| **PDF-Lib** | `^1.17.1` | 100% Client-side PDF merge, split, compress, page reordering, watermark insertion |
| **QRCode** | `^1.5.4` | UPI QR code generator, dynamic Wi-Fi QR, vCard generation |
| **HTML5 Canvas** | Native Web API | Live QR code scanning, camera frame analysis, passport photo maker & background cropping |

---

## 4. Backend, Database & Cloud Services

| Service / Tool | Version | Purpose |
|:---|:---|:---|
| **Supabase Client** | `@supabase/supabase-js ^2.112.3` | User feedback, contact messages, tool requests persistence |
| **Dotenv** | `^17.2.3` | Environment variable management across server & build pipelines |
| **Netlify Deploy Engine** | `netlify.toml` | Production edge deployment with static routing and header caching |

---

## 5. Build Scripts & Automation

Defined in `package.json`:
- `npm run dev`: Starts local server via `tsx server.ts` (Vite middleware on port `3000` or fallback).
- `npm run sitemap`: Executes `scripts/generate-sitemap.ts` to output `public/sitemap.xml` with all 133 canonical routes.
- `npm run test:seo`: Runs `scripts/validate-seo.ts` verifying meta tags, OpenGraph, Twitter cards, and JSON-LD schema across all tools.
- `npm run build`: Pipeline executing sitemap generation → `vite build` → `esbuild server.ts` outputting `dist/server.cjs`.
- `npm run start`: Production server runner via `node dist/server.cjs`.
- `npm run lint`: Strict TypeScript dry-run verification via `tsc --noEmit`.
