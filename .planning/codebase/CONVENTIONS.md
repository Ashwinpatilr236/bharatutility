# Coding Standards, Patterns & Conventions — BharatUtility

## 1. Indian Numbering & Currency Conventions
- **Currency Formatting:** Always use `formatINR(val)` from `src/utils/formatters.ts` rather than `toLocaleString()` or hardcoded `₹` formatting.
  - Correct: `formatINR(2500000)` -> `₹25,00,000`
  - Compact Format: `formatIndianCompact(15000000)` -> `₹1.5 Cr`, `formatIndianCompact(500000)` -> `₹5 Lakh`.
- **Date Formatting:** Format dates using Indian locale format `en-IN`:
  - `date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })` -> `15 August 2026`.

## 2. Tool Architecture Conventions
Every new tool added to BharatUtility must satisfy the following checklist:
1. **Registered in `src/data/toolsRegistry.ts`:**
   - Must have a unique `id` and `slug`.
   - Must belong to a valid `category` in `CATEGORIES`.
   - Must have complete `seo` metadata (`title`, `description`, `keywords`, `canonicalSlug`, `h1`).
   - Must contain `formulaDescription`, `formulaLatex`, and `workedExample`.
   - Must contain at least 2 relevant `faqs` for Schema validation.
   - Must specify `relatedToolSlugs` connecting to other active tools.
2. **Category Count Synchronization:**
   - Increment `toolCount` in `src/data/categories.ts`.
3. **Mounted in `ToolPageLayout.tsx`:**
   - Lazy-load component: `const MyTool = React.lazy(() => import('./path/MyTool').then(m => ({ default: m.MyTool })));`
   - Add switch case in `renderCalculator()` matching `tool.slug`.
4. **Standalone Client-Side Component:**
   - Responsive UI using Tailwind CSS (supporting both light and dark modes).
   - Clear input controls (sliders, number inputs, dropdowns).
   - Prominent result cards with color-coded key metrics (Emerald for savings/profits, Rose for taxes/deductions, Blue/Amber for indicators).
   - Helpful context tips & official guidelines.

## 3. Styling & Tailwind CSS 4 Patterns
- **Colors:** Use semantic Tailwind tokens with dark mode variants:
  - Dark mode surfaces: `bg-white dark:bg-slate-900`, `border-slate-200 dark:border-slate-800`.
  - Gradient headers: `bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6`.
  - Contrast text: `text-slate-900 dark:text-white` for headings, `text-slate-600 dark:text-slate-400` for subtitles.
- **Micro-interactions:**
  - `transition-all duration-200`, `hover:scale-[1.01]`, `active:scale-[0.99]`.
  - Rounded corners: `rounded-2xl` for inputs/cards, `rounded-3xl` for main panels.

## 4. TypeScript Typing Standards
- **Zero `any` Policy:** Define strict interfaces for tool states, API responses, and calculation results.
- **Type Imports:** Import `Tool`, `Category`, `CategoryId`, `FAQItem` directly from `src/types.ts`.
