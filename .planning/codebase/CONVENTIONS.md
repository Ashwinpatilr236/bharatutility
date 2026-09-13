# Coding Conventions & Design Patterns — BharatUtility

## 1. Component Design & Code Structure
- **Functional Components:** All UI components are written as React Functional Components (`React.FC<Props>`) using modern React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`).
- **Isolation of Heavy Logic:** Heavy tools and interactive canvases are packaged as standalone suite components in `src/components/calculators/` and lazy loaded via `React.lazy()` inside `ToolPageLayout.tsx`.
- **Zero-Crash Defensive State:** All numeric inputs parse defensively with fallbacks (`parseFloat(val) || 0`) and math operations include explicit safeguards against division-by-zero, `NaN`, or infinite recursion.

## 2. Indian Localization & Formatting Conventions
- **Currency & Numbers:** All Rupee amounts use the standard Indian numbering system (`en-IN`), formatting with Lakhs and Crores (e.g. `₹12,50,000`).
- **Bilingual & Hinglish Support:** Natural Indian language terminology (e.g. *Bigha*, *Guntha*, *Gaj*, *Choghadiya*, *Rahu Kaal*, *Tatkal*, *APMC Mandi*) is natively respected across tool tags and explanations.
- **Color Palette & Design Tokens:**
  - Standard light and dark mode classes using Tailwind CSS 4 (`bg-white dark:bg-neutral-900`, `text-neutral-900 dark:text-white`).
  - Primary interactive accent: `#2563eb` / `accent` (India Navy Blue) with vibrant emerald, amber, and purple category accents.

## 3. Tool Registration & Routing Contract
- Any newly created tool **must** satisfy three contracts:
  1. **Registry Entry:** Fully typed object in `TOOLS_REGISTRY` in `src/data/toolsRegistry.ts` specifying valid `slug`, `category`, `seo`, `formulaDescription`, `workedExample`, and `faqs`.
  2. **Page Component Mapping:** Switch-case in `src/components/tools/ToolPageLayout.tsx` returning the interactive suite.
  3. **Automated Sitemap Pickup:** `scripts/generate-sitemap.ts` picks up all entries automatically during `npm run build`.
