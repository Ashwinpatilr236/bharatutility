# Technology Stack — BharatUtility

## Core Runtime & Frameworks
- **Frontend Framework:** React 19 (`react` 19.0.0, `react-dom` 19.0.0)
- **Language:** TypeScript 5.7+ (`typescript` ~5.7.2)
- **Build Tool & Bundler:** Vite 6 (`vite` ^6.0.5) with `@vitejs/plugin-react`
- **Styling Engine:** Tailwind CSS v4 (`tailwindcss` ^4.0.0, `@tailwindcss/vite` ^4.0.0)
- **Backend Runtime:** Node.js (ESM / CommonJS dual support)
- **Backend Server:** Express v4 (`express` ^4.21.2) compiled via `esbuild` to `dist/server.cjs`
- **Database & Backend-as-a-Service:** Supabase (`@supabase/supabase-js` ^2.47.10)

## UI & Visual Design Components
- **Icons Library:** Lucide React (`lucide-react` ^0.468.0) with dynamic icon fallback resolution
- **Animations & Micro-interactions:** Canvas Confetti (`canvas-confetti` ^1.9.4)
- **Charts & Data Visualization:** Chart.js (`chart.js` ^4.4.7) & React ChartJS 2 (`react-chartjs-2` ^5.3.0)

## Client-Side File Processing & Parsing
- **PDF Generation & Manipulation:** `jspdf` (^2.5.2), `pdf-lib` (^1.17.9)
- **Excel & Spreadsheet Processing:** `xlsx` (^0.18.5)
- **Word Document Parsing:** `mammoth` (^1.9.0)
- **Image Compression & Canvas Utilities:** Native Web Canvas API & `browser-image-compression`

## Tooling & Verification Scripts
- **TypeScript Runner:** `tsx` (^4.19.2)
- **Production Bundling:** `esbuild` (^0.24.2)
- **Linting & Typechecking:** `tsc --noEmit`
- **Sitemap Generator:** Custom script (`scripts/generate-sitemap.ts`)
- **Automated QA Runner:** Custom test suite (`scripts/qa-runner.ts`)
- **SEO Validation:** Custom validator (`scripts/validate-seo.ts`)

## Production Hosting & Environment
- **Canonical Production Domain:** `https://bharatutility.tech`
- **Deployment Strategy:** Node.js container or Static SPA + Express API server
