# Testing & Quality Assurance Workflows — BharatUtility

## Quality Assurance Pipeline
BharatUtility employs a 4-tier verification and regression pipeline prior to production builds:

```
Step 1: TypeScript Static Typecheck (tsc --noEmit)
Step 2: Automated SEO & Schema Audit (scripts/validate-seo.ts)
Step 3: Functional & Mathematical Unit Verification (scripts/qa-runner.ts)
Step 4: Sitemap & Production Bundle Generation (scripts/generate-sitemap.ts + vite build)
```

---

## 1. Typechecking (`npm run lint`)
- **Command:** `npm run lint` -> `tsc --noEmit`
- **Scope:** Verifies 100% of TypeScript source code, interface contracts, React component props, and imports across all 125 tools without emitting JavaScript.

---

## 2. Dynamic SEO & Schema Validation (`npm run test:seo`)
- **Command:** `npm run test:seo` -> `tsx scripts/validate-seo.ts`
- **Validations Checked:**
  - Dynamic loading of all 125 tools.
  - 100% uniqueness of slugs and IDs.
  - Verification of canonical production domain `https://bharatutility.tech` (with 0 `.com` regressions).
  - Validation of `WebApplication`, `BreadcrumbList`, `FAQPage`, and `HowTo` structured JSON-LD schemas.
  - Verification of `robots.txt` and `public/sitemap.xml` presence.

---

## 3. Mathematical & Functional QA Runner (`scripts/qa-runner.ts`)
- **Command:** `npx tsx scripts/qa-runner.ts`
- **Automated Mathematical Checks:**
  - **EMI Calculator:** Validates standard reducing balance math (₹10L @ 8.5% for 20 yrs -> ₹8,678), 0% edge case, and large 100 Cr numbers.
  - **GST Calculator:** Validates inclusive (₹11,800 -> ₹10,000 base) and exclusive (₹10,000 + 18% -> ₹1,800) calculations.
  - **Fuel Cost & Mileage:** Tests 500 km @ 20 kmpl & ₹100/L -> ₹2,500 with divide-by-zero protections.
  - **CGPA to Percentage:** Tests standard 9.5 multiplier (8.4 CGPA -> 79.8%).
  - **SIP & Compound Interest:** Tests monthly compounding (₹5,000/mo @ 12% for 10 yrs -> ₹11.61 Lakhs).
  - **Cash Tally & Denomination Counter:** Tests multi-currency note summation.
  - **Land Area Conversion:** Tests state-wise Bigha, Gaj, Guntha conversions.
  - **Discovery Loop Audit:** Tests that all tools have at least 3-4 working related tool fallback links.

---

## 4. Sitemap Generation (`npm run sitemap`)
- **Command:** `npm run sitemap` -> `tsx scripts/generate-sitemap.ts`
- **Output:** Regenerates `public/sitemap.xml` with priority weights (`1.0` for home, `0.9` for top tools, `0.8` for categories, `0.6` for legal).
