# Testing & Quality Assurance Workflow — BharatUtility

## Automated QA Runner
BharatUtility includes a built-in automated verification script:
```bash
npx tsx scripts/qa-runner.ts
```

### Coverage Matrix:
1. **Registry & Route Integrity:**
   - Validates that all 222 tools in `TOOLS_REGISTRY` match the 13 defined categories in `src/data/categories.ts`.
   - Checks that zero duplicate slugs or invalid characters exist.
2. **Discovery Loop & Related Tools Audit:**
   - Ensures all 222 tools have working fallbacks (3-4 related tools displayed on every single page).
3. **Core Mathematical Unit Tests:**
   - **EMI:** Exact amortization formula validation (e.g. ₹10 Lakhs @ 8.5% for 20 yrs = ₹8,678).
   - **GST:** Forward calculation and backward reverse-GST extraction.
   - **Fuel Cost & Trip:** Distance, mileage, and unit rates with zero-mileage safety check.
   - **CGPA & Marks:** Indian university multiplier conversion (`CGPA * 9.5`).
   - **SIP Compound Interest:** Compound monthly growth calculation over 10-year horizon.
   - **Cash Denomination Tally:** Cash note breakdown summing correctly.
   - **Land Unit Conversion:** Multi-state Bigha, Guntha, Gaj, and Square Foot conversions.

## Production Build & Bundle Verification
```bash
npm run build
```
- Validates full TypeScript compilation (`tsc`).
- Generates updated `public/sitemap.xml` with 243+ clean indexable URLs.
- Produces tree-shaken static assets in `dist/` with chunk size warnings checked.
- Compiles Express server into `dist/server.cjs`.
