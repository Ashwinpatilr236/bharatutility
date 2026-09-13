# BharatUtility Coding Conventions & Standards

This document establishes the patterns, styling guidelines, TypeScript practices, and architectural idioms observed across the BharatUtility project.

---

## 1. Naming & File Conventions

| Entity | Pattern | Examples |
|---|---|---|
| **Components** | PascalCase `.tsx` | `HeroSection.tsx`, `ToolPageLayout.tsx`, `EmiCalculator.tsx` |
| **Data & Catalog Files** | camelCase `.ts` | `toolsRegistry.ts`, `categories.ts` |
| **Contexts** | PascalCase `.tsx` | `AppContext.tsx` |
| **Services / Clients** | camelCase `.ts` | `supabaseClient.ts`, `contactService.ts`, `toolRequestService.ts` |
| **Scripts** | kebab-case `.ts` / `.mjs` | `generate-sitemap.ts`, `qa-runner.ts`, `smoke-test.ts` |
| **Routes / Slugs** | kebab-case | `home-loan-emi-calculator`, `daily-fuel-price-tracker` |

---

## 2. Component Design & Architecture Patterns

### A. Lazy-Loaded Calculator Suites
- Standalone or suite-level calculator components are dynamically loaded in `ToolPageLayout.tsx` via `React.lazy()` and rendered within a `Suspense` boundary with a skeleton shimmer fallback.
- Components take optional or standard props (`tool?: Tool`, `onNavigate?: (view: string, slug?: string) => void`).

```tsx
// Pattern: Lazy import in ToolPageLayout
const EmiCalculator = lazy(() => import('../calculators/EmiCalculator'));
const LivePublicApisSuite = lazy(() => import('../calculators/LivePublicApisSuiteCalculator'));
```

### B. Standard Tool Section Hierarchy
Every tool view rendered under `ToolPageLayout` delivers a standardized user journey:
1. **Breadcrumb Bar**: Home > Category > Tool Name
2. **Hero Header**: Category badge, icon badge, verified tag, H1 title, descriptive subtitle, favorite/share buttons.
3. **Interactive Workspace**: Form inputs, live slider / input dual controls, instant dynamic recalculation, result breakdown cards, and visual charts / indicators.
4. **Action Bar**: Instant Reset, Copy Calculation Results, Export PDF report (`PDFButton`).
5. **SEO & Educational Deep-Dive**: Mathematical formula explanation, step-by-step calculation example, rules & statutory tax exemptions (e.g., Section 80C, RBI guidelines, MoRTH guidelines), and interactive Accordion FAQs.
6. **Related Tools Discovery Grid**: 4 contextual tools from same category or curated recommendation slugs.

---

## 3. TypeScript Guidelines

- **Strict Type Safety**: `strict: true` and `noImplicitAny: true` enabled in `tsconfig.json`.
- **Tool Model (`src/data/toolsRegistry.ts`)**:
  ```typescript
  export interface Tool {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    tagline: string;
    description: string;
    category: CategoryId;
    icon: string;
    popular?: boolean;
    trending?: boolean;
    featured?: boolean;
    badge?: string;
    keywords: string[];
    formula?: string;
    formulaExplanation?: string;
    example?: string;
    faqs?: Array<{ q: string; a: string }>;
    relatedToolSlugs?: string[];
  }
  ```
- **Avoid `any`**: Explicitly model API responses and component props.

---

## 4. Styling & Design System

- **Framework**: Tailwind CSS v4 (`@tailwindcss/vite`).
- **Color Palette**:
  - Primary / Indian Theme: Emerald (`emerald-600`, `emerald-500`), Amber/Saffron (`amber-500`), Slate/Indigo tones (`slate-900`, `slate-50`).
  - Dark Mode: Slate/Zinc dark palette (`bg-slate-900`, `bg-slate-800`, `border-slate-700`, `text-slate-100`).
- **Utility Classes**:
  - Glassmorphism: `backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80`
  - Subtle shadows: `shadow-sm hover:shadow-md transition-all duration-200`
  - Rounded aesthetic: `rounded-2xl` for major cards, `rounded-xl` for interactive elements.
- **Icons**: Lucide React icons dynamically mapped via `src/components/tools/IconRenderer.tsx`.

---

## 5. State Management & Navigation

- **Navigation**: Hash/SPA routing managed via `AppContext`.
  - `navigateTo(view, slug?, categoryId?)` updates internal view state and pushes hash to URL window history (`#tool/slug` or `#category/id`).
  - Back-button support via `window.addEventListener('hashchange', ...)`.
- **Persistence**: User preferences (favorites, search history, theme mode) stored in `localStorage` with fallback defaults.
- **No Heavy Global Stores**: State remains local to components or lightweight context providers.

---

## 6. Client-Side Performance & Safety

- **Client-Side Compute**: 100% of arithmetic, date calculations, file conversions (Canvas/PDF/SVG), and validation algorithms execute locally in the user's browser.
- **Privacy Assurance**: Sensitive user numbers (salary, loans, PAN formats, Aadhaar masking guidelines, passwords) are NEVER transmitted across networks.
- **Graceful API Fallbacks**: Tools utilizing free public APIs (Open-Meteo, Frankfurter, ipapi.co) include resilient timeout handlers and realistic fallback datasets to guarantee zero screen breaks if a third-party service is unreachable or rate-limited.
