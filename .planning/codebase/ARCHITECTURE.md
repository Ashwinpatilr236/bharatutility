# Architecture Patterns & Component Hierarchy — BharatUtility

## Architectural Philosophy
BharatUtility is built as a **High-Performance Client-Side Utility Super-App** tailored specifically for Indian citizens, professionals, students, and businesses.

Key design principles:
1. **Zero-Latency Client-Side Computation:** Calculations, conversions, PDF processing, and image resizing occur locally in the browser with 0ms server roundtrips.
2. **Aggressive Code-Splitting:** All 125 tool suites are lazy-loaded on-demand via `React.lazy()` and Vite dynamic imports, keeping the initial bundle size minimal (~160 kB gzipped).
3. **Structured SEO Architecture:** Every tool includes canonical tags, OpenGraph metadata, JSON-LD Schema (`WebApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`), and high-quality formula explanations.
4. **Infinite Discovery Loop:** Every tool page guarantees 3-6 relevant related tools via dynamic fallback (`explicit` -> `category` -> `popular`), ensuring zero dead-ends.

## Global State & Navigation (`src/context/AppContext.tsx`)
- **Routing Engine:** Custom hash-based and path-aware SPA router supporting deep-linking (`#tool/emi-calculator`, `/category/money`, `/all-tools`, `/favorites`, `/contact`, `/legal`).
- **Global Context Provider:**
  - `activeView`: Current view (`home` | `tool` | `category` | `all-tools` | `favorites` | `contact` | `request-tool` | `legal`).
  - `activeToolSlug` & `activeCategoryId`: Currently loaded tool and category.
  - `searchQuery` & `commandPaletteOpen`: Global instant search (Cmd+K / Ctrl+K).
  - `favorites`: Persistent list of favorited tools stored in `localStorage`.
  - `calculationHistory`: Local snapshot of recent calculations.
  - `theme`: Light, Dark, or System mode with smooth transitions.

## Component Tree Layout
```
App.tsx
├── Header.tsx (Logo, Navigation Links, Global Search Trigger, Theme Toggle)
├── GlobalCommandPalette.tsx (Instant search across all 125 tools with keyboard navigation)
│
├── Views:
│   ├── Home View:
│   │   ├── HeroSection.tsx (Headline, Quick Category Pills, Quick Search Bar)
│   │   ├── PopularToolsSection.tsx (Top 12 curated daily utility tools)
│   │   ├── CategoryGridSection.tsx (13 Category Cards with live tool counters)
│   │   ├── TrendingLiveSection.tsx (Live trending tools with real-time badges)
│   │   ├── WhyBharatUtilitySection.tsx (Privacy-first, 100% free, Indian standards)
│   │   ├── YouMayAlsoNeedSection.tsx (Cross-category discovery grid)
│   │   ├── HomeFaqSection.tsx (Accordion FAQ with JSON-LD schema)
│   │   └── FinalDiscoveryCtaSection.tsx (Full tool library CTA + Request tool trigger)
│   │
│   ├── Tool View:
│   │   └── ToolPageLayout.tsx
│   │       ├── Breadcrumbs.tsx
│   │       ├── Tool Header Banner (Icon, Name, Tagline, Favorite, Share, Copy Result, Print)
│   │       ├── Lazy-loaded Tool Component (e.g., GoldSilverRateCalculator, EmiCalculator)
│   │       ├── Formula & Worked Example Box (Latex, step-by-step mathematical breakdown)
│   │       ├── SEO Content Sections & Detailed Guidelines
│   │       ├── FAQ Accordion
│   │       ├── Discovery Loop: "You May Also Need" (4 Related Tools)
│   │       ├── AdSlot.tsx & ToolFeedbackWidget.tsx
│   │       └── RequestToolCta.tsx & BookmarkPrompt.tsx
│   │
│   ├── CategoryView.tsx (Filtered tool grid by category)
│   ├── AllToolsView.tsx (A-Z searchable directory of all 125 tools)
│   ├── FavoritesView.tsx (User's bookmarked tools)
│   ├── ContactView.tsx & RequestToolView.tsx (Form submissions with Supabase integration)
│   └── LegalPages.tsx (Privacy Policy, Terms of Service, Disclaimer)
│
└── Footer.tsx (Category Links, Legal Links, Social Links to ARRJS Technologies, Copyright)
```
