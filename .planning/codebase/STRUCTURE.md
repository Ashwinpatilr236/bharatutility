# Directory Structure & File Hierarchy — BharatUtility

```
bharatutility/
├── .planning/                  # GSD Planning & Architecture Intelligence
│   └── codebase/               # 7 Codebase intelligence documents
│       ├── STACK.md
│       ├── INTEGRATIONS.md
│       ├── ARCHITECTURE.md
│       ├── STRUCTURE.md
│       ├── CONVENTIONS.md
│       ├── TESTING.md
│       └── CONCERNS.md
│
├── public/                     # Static Web Assets
│   ├── favicon.svg             # Favicon
│   ├── robots.txt              # Search engine crawler directives
│   └── sitemap.xml             # 146 dynamically generated XML routes
│
├── scripts/                    # Automation & Quality Scripts
│   ├── generate-sitemap.ts     # Generates public/sitemap.xml from toolsRegistry.ts
│   ├── qa-runner.ts            # Mathematical & functional unit test runner
│   └── validate-seo.ts         # Automated SEO, Schema, and canonical auditor
│
├── src/                        # Core Application Source Code
│   ├── components/             # React Component Library
│   │   ├── calculators/        # Multi-tool suites (Finance, Vehicle, Document, etc.)
│   │   ├── common/             # Reusable UI primitives (Breadcrumbs, DynamicIcon, ShareModal)
│   │   ├── home/               # 8 Modular Homepage Sections (Hero, Popular, FAQ, etc.)
│   │   ├── layout/             # Layout components (Header, Footer, Navigation)
│   │   ├── search/             # Global search & command palette
│   │   ├── seo/                # SEOHead component with dynamic JSON-LD injection
│   │   └── tools/              # Specialized domain tool components:
│   │       ├── business/       # StockMarketHoursTracker, etc.
│   │       ├── daily/          # JanAushadhiGenericSaver, IndianBabyNamesRashi
│   │       ├── documents/      # RentAgreementStampDuty, etc.
│   │       ├── education/      # SarkariExamAgeCalculator, etc.
│   │       ├── home/           # PropertyStampDutyCalculator, etc.
│   │       ├── money/          # GoldSilverRateCalculator, CryptoInrTaxCalculator
│   │       ├── tech/           # NetworkSpeedPingProbe, ImeiCeirGuideValidator, PasswordBreachChecker
│   │       ├── travel/         # TrainBerthTatkalFinder, etc.
│   │       ├── vehicle/        # TrafficChallanPortalFinder, etc.
│   │       └── ToolPageLayout.tsx # Universal dynamic tool layout engine
│   │
│   ├── context/                # Global React Context
│   │   └── AppContext.tsx      # Routing, active tool/category, favorites, history
│   │
│   ├── data/                   # Central Catalogs & Registries
│   │   ├── categories.ts       # 13 Categories with metadata & tool counts
│   │   └── toolsRegistry.ts    # 125 Fully typed Tools with SEO, math formulas & FAQs
│   │
│   ├── lib/                    # Library Initializations
│   │   └── supabase.ts         # Supabase client singleton
│   │
│   ├── services/               # Data & API Services
│   │   ├── contactService.ts   # Contact form handler with local fallback
│   │   └── toolRequestService.ts # Tool suggestion handler
│   │
│   ├── utils/                  # Pure Utility & Helper Functions
│   │   ├── formatters.ts       # formatINR, formatIndianNumber, formatIndianCompact
│   │   ├── pdfGenerator.ts     # Client-side PDF generation
│   │   └── calculations.ts     # Standard mathematical formulas
│   │
│   ├── types.ts                # Core TypeScript interfaces (Tool, Category, ToolSEO, FAQItem)
│   ├── App.tsx                 # Root application view switcher
│   ├── main.tsx                # React DOM root entrypoint
│   └── index.css               # Tailwind CSS 4 theme tokens & glassmorphism utilities
│
├── server.ts                   # Express.js production backend server
├── vite.config.ts              # Vite 6 configuration with chunk splitting
├── tsconfig.json               # TypeScript compiler configuration
└── package.json                # NPM scripts and dependencies
```
