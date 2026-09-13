# BharatUtility Testing & Quality Assurance

This document details the test suites, verification runners, manual QA procedures, and continuous validation pipelines used across the BharatUtility project.

---

## 1. Test Architecture Overview

BharatUtility implements a multi-tier testing strategy ensuring mathematical precision, schema integrity, route accessibility, and SEO reliability across all 220 tools.

```
+-----------------------------------------------------------+
|                     QA & TEST MATRIX                      |
+-----------------------------------------------------------+
| 1. TypeScript & Lint Engine (tsc --noEmit & ESLint)       |
| 2. Programmatic QA Runner (scripts/qa-runner.ts)          |
| 3. Smoke Test & HTTP 200 Route Probing (scripts/smoke)    |
| 4. Production Bundle & Asset Verification (vite build)    |
| 5. XML Sitemap & SEO Canonical Audit (generate-sitemap)   |
+-----------------------------------------------------------+
```

---

## 2. Automated Test Runners

### A. Comprehensive QA Test Suite (`scripts/qa-runner.ts`)
Run command:
```bash
npx tsx scripts/qa-runner.ts
```
**Coverage:**
- **Route & Registry Integrity**:
  - Checks exact tool count (220 tools registered).
  - Checks exact category count (13 valid categories).
  - Validates zero duplicate tool slugs across the entire catalog.
  - Verifies that 100% of tools map to valid existing categories in `CATEGORIES`.
- **Discovery Loop Validation**:
  - Ensures every single tool resolves 3 to 4 related tools without broken links.
- **Mathematical Accuracy & Edge Case Testing**:
  - Home Loan EMI formula check (10 Lakhs @ 8.5% for 20 yrs = ₹8,678).
  - Zero percent interest handling (Principal / months).
  - Extreme scale inputs (₹100 Cr loan calculates cleanly without NaN or infinite recursion).
  - GST 18% inclusive vs. exclusive reconciliation.
  - Fuel cost & zero-mileage division-by-zero protection.
  - CBSE CGPA to percentage (9.5 conversion multiplier).
  - SIP Wealth compound wealth simulation.
  - Cash Denomination tally logic.
  - Regional Land Area unit conversion (UP / Bihar / Punjab bigha variations).
- **Network / Production Health**:
  - Checks HTTP 200 response on `https://bharatutility.tech`.

### B. Production Build & Static Analysis
Run command:
```bash
npm run build
```
Executes:
1. `tsx scripts/generate-sitemap.ts` (Generates 241 indexable XML URLs).
2. `vite build` (Compiles TypeScript, minifies chunks, splits vendor libraries).
3. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs` (Compiles production Express server).

---

## 3. Tool Verification Checklist (Manual & Automated)

When adding or modifying a utility tool:
1. **Registry Addition**: Add entry in `src/data/toolsRegistry.ts` with complete `formula`, `formulaExplanation`, `example`, and `faqs`.
2. **Category Verification**: Check that `category` string matches one of the 13 IDs in `CATEGORIES`.
3. **Component Mapping**: Add lazy import & render switch in `ToolPageLayout.tsx`.
4. **Interactive Validation**:
   - Verify input fields update dynamic state immediately.
   - Verify slider and text inputs stay in sync.
   - Check mobile layout responsive wrapping.
   - Click "Copy Results" and verify clipboard feedback.
   - Click "Download PDF Report" (`PDFButton`) and verify valid PDF generation.
5. **Run Test Suites**: Run `npx tsx scripts/qa-runner.ts` and `npm run build`.

---

## 4. Continuous Health Monitoring

- **Production Health Endpoint**: `GET https://bharatutility.tech/api/health`
- **Admin Health Check**: `GET https://bharatutility.tech/api/admin/health-check` (verifies Supabase connectivity and server uptime).
