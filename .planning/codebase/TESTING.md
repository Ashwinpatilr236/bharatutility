# Testing, QA & Validation Strategy

**Application:** BharatUtility  
**Test Harness:** Automated QA Runner (`scripts/qa-runner.ts`) & TypeScript Typecheck  

---

## 1. Automated QA Test Suite (`scripts/qa-runner.ts`)

BharatUtility includes a dedicated 19-point automated system and regression testing suite designed to prevent regressions and verify production readiness.

### How to Run:
```bash
npx tsx scripts/qa-runner.ts
```

### Verified Test Areas:
1. **Core Configuration & File Integrity:** Verifies `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `server.ts`, and `netlify.toml`.
2. **Tools Registry Single Source of Truth:** Validates that all 112 tools have unique IDs, valid category IDs, paths, names, keywords, and formula descriptions.
3. **Category Integrity:** Validates that all 13 categories are defined with valid names, colors, and Lucide icons.
4. **Sitemap Synchronization:** Verifies that `public/sitemap.xml` contains all 133 canonical routes without broken links.
5. **SEO & Metadata Health:** Ensures every tool provides a targeted `seoTitle` and `seoDescription` optimized for Indian search intent.
6. **Homepage Discovery Loop:** Verifies presence of all 8 core homepage sections (Hero, Popular Tools, Categories, Why BharatUtility, Discovery CTA, FAQs).
7. **Official ARRJS Social Media Links:** Ensures strict compliance with company social accounts (LinkedIn, X, Instagram, Facebook) and zero unapproved channels (e.g. Telegram / YouTube).
8. **Server Health Endpoints:** Confirms `/api/health` and `/api/admin/health-check` endpoints are correctly mapped in `server.ts`.

---

## 2. SEO Validation Suite (`scripts/validate-seo.ts`)

### How to Run:
```bash
npm run test:seo
```

### Checks Performed:
- Validates canonical URL structure (`https://bharatutility.tech/{toolPath}`).
- Checks meta description character lengths (optimally between 120-160 characters).
- Verifies OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`) tags.
- Verifies JSON-LD Structured Data schema syntax (`@type: "WebApplication"`).

---

## 3. Type Checking & Production Build Validation

### TypeScript Dry-Run Linting:
```bash
npm run lint
```
Executes `tsc --noEmit` under strict TypeScript compiler options (`strict: true`, `noUnusedLocals: false`, `noUnusedParameters: false`).

### Full Production Build Test:
```bash
npm run build
```
Executes the full 3-step pipeline:
1. `tsx scripts/generate-sitemap.ts` (Generates XML sitemap)
2. `vite build` (Compiles optimized client bundle to `dist/`)
3. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs` (Bundles Express server)

---

## 4. Manual QA Verification Checklist

- [ ] **Mobile Navigation:** Test hamburger menu, drawer links, and category navigation on viewport widths < 640px.
- [ ] **Sliders & Real-time Recalculation:** Verify instant responsiveness of EMI, SIP, Tile, and Paint sliders.
- [ ] **Live APIs:** Verify fallback handling when network is throttled or offline for Currency, AQI, IP, and Holidays tools.
- [ ] **Document Processing:** Test PDF merging and passport photo cropping with sample files up to 25MB.
- [ ] **Copy & Share Links:** Verify clipboard copy toast triggers and copies the correct canonical URL.
