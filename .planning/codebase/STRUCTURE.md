# Directory & File Structure — BharatUtility

```
bharatutility/
├── .planning/                  # GSD Project Management & Intelligence
│   └── codebase/               # Codebase Map Documents (STACK, ARCHITECTURE, etc.)
├── public/                     # Static Web Assets
│   ├── favicon.svg             # Official SVG favicon
│   ├── robots.txt              # Search engine crawler instructions
│   └── sitemap.xml             # Generated 243+ URL XML sitemap
├── scripts/                    # Build & QA Automation Runners
│   ├── generate-sitemap.ts     # Build-time XML sitemap generator
│   └── qa-runner.ts            # Mathematical & Route QA Test Suite
├── src/                        # Application Source Code
│   ├── components/             # Reusable UI & Page Modules
│   │   ├── calculators/        # 40+ Isolated Calculator Suites & Tools
│   │   │   ├── AqiAndWeatherSuite.tsx
│   │   │   ├── CurrencyConverterSuite.tsx
│   │   │   ├── EmiCalculator.tsx
│   │   │   ├── FuelPriceTrackerSuite.tsx
│   │   │   ├── IpInspectorSuite.tsx
│   │   │   ├── LongWeekendPlannerSuite.tsx
│   │   │   ├── OnlineNotepadSuite.tsx
│   │   │   ├── OnlinePaintCanvasSuite.tsx
│   │   │   ├── QrScannerSuite.tsx
│   │   │   └── ... (40+ suites)
│   │   ├── common/             # Shared Design System Elements (Header, Footer, Icons)
│   │   ├── home/               # 8 Modular Homepage Sections
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PopularToolsSection.tsx
│   │   │   ├── CategorizedToolsSection.tsx
│   │   │   ├── YouMayAlsoNeedSection.tsx
│   │   │   ├── LiveStatsSection.tsx
│   │   │   ├── HomeFaqSection.tsx
│   │   │   └── FinalDiscoveryCtaSection.tsx
│   │   ├── tools/              # Tool View Container & Layout Engine
│   │   │   └── ToolPageLayout.tsx
│   │   └── views/              # Main App Route Views
│   │       ├── AllToolsView.tsx
│   │       ├── CategoryView.tsx
│   │       ├── ContactView.tsx
│   │       ├── FavoritesView.tsx
│   │       ├── LegalView.tsx
│   │       └── RequestToolView.tsx
│   ├── context/                # Global Application State
│   │   └── AppContext.tsx      # Routing, Theme, Search, and Favorites
│   ├── data/                   # Static Data Registries & Catalogs
│   │   ├── categories.ts       # 13 Official Categories
│   │   └── toolsRegistry.ts    # 222 Typed Tools with Formulas & FAQs
│   ├── lib/                    # Third-Party Initializers
│   │   └── supabase.ts         # Supabase client singleton
│   ├── services/               # API & DB Service Layers
│   │   ├── contactService.ts
│   │   └── toolRequestService.ts
│   ├── types/                  # Global TypeScript Interfaces
│   │   └── index.ts
│   ├── App.tsx                 # Root Component & Layout Shell
│   ├── index.css               # Tailwind CSS 4 Design Tokens & Theme
│   └── main.tsx                # React DOM Mount Entrypoint
├── server.ts                   # Express Production Server
├── vite.config.ts              # Vite & Rollup Bundler Configuration
├── package.json                # Project Manifest & Script Definitions
└── tsconfig.json               # TypeScript Compiler Options
```
