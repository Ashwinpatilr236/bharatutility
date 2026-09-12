# Codebase Directory Structure & File Map

**Application:** BharatUtility  
**Total Tools:** 112 Tools across 13 Categories  
**Canonical Routes:** 133 Indexable URLs  

---

## 1. Directory Tree Overview

```
bharatutility/
├── .planning/                     # Project planning & codebase maps
│   └── codebase/                  # GSD Codebase Intelligence maps (7 docs)
├── public/                        # Static assets served at root
│   ├── favicon.svg                # High-res BharatUtility tri-color flag logo
│   ├── robots.txt                 # Search engine crawler directives
│   └── sitemap.xml                # Automated 133-route XML sitemap
├── scripts/                       # Build-time automation & QA test suites
│   ├── generate-sitemap.ts        # Dynamic sitemap.xml generator
│   ├── qa-runner.ts               # 19-point automated system & SEO QA test runner
│   └── validate-seo.ts            # Canonical SEO, meta & OpenGraph validator
├── src/
│   ├── components/
│   │   ├── common/                # Shared UI primitives (Buttons, Badges, Modals)
│   │   │   ├── CategoryBadge.tsx
│   │   │   ├── SearchModal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ...
│   │   ├── home/                  # High-converting 8-section Homepage
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PopularToolsSection.tsx
│   │   │   ├── CategoryGridSection.tsx
│   │   │   ├── WhyBharatUtilitySection.tsx
│   │   │   ├── YouMayAlsoNeedSection.tsx
│   │   │   ├── HomeFaqSection.tsx
│   │   │   └── FinalDiscoveryCtaSection.tsx
│   │   ├── layout/                # Global navigation shell
│   │   │   ├── Header.tsx         # Responsive navbar with search & quick actions
│   │   │   ├── Footer.tsx         # Comprehensive multi-column footer & ARRJS links
│   │   │   └── MobileNav.tsx      # Slide-out drawer for smartphone navigation
│   │   └── tools/                 # Tool calculators organized by category
│   │       ├── ToolPageLayout.tsx # Universal container with 4-tool discovery loop
│   │       ├── money/             # 14 Finance & Tax tools (EMI, SIP, PPF, GST, Tax)
│   │       ├── daily/             # 8 Everyday utilities (Age, Percentage, Ratios)
│   │       ├── home/              # 8 Construction tools (Tiles, Paint, Land Units)
│   │       ├── education/         # 6 Academic tools (CGPA, Attendance, Marks)
│   │       ├── travel/            # 5 Commute tools (Mileage, Fuel Split)
│   │       ├── business/          # 6 Commerce tools (Margin, Break-even, Invoices)
│   │       ├── tech/              # 5 Tech tools (Bandwidth, IP & ISP Inspector)
│   │       ├── documents/         # 8 Formal letters (Resignation, Leave, NOC) + QR Scanner
│   │       ├── datetime/          # 5 Date & time calculators (Countdown, Working days)
│   │       ├── india/             # 8 India services (IFSC, PIN, AQI, Holiday Planner)
│   │       ├── doctools/          # 11 Client-side PDF & Image tools (Merge, Split, Photo)
│   │       ├── vehicle/           # 9 Vehicle tools (EV Savings, Daily Fuel Tracker)
│   │       └── travelhub/         # 8 Travel tools (Currency Converter, Trip Planner)
│   ├── context/
│   │   └── AppContext.tsx         # Universal state: router, search, favorites, theme
│   ├── data/                      # Offline datasets & registry single sources of truth
│   │   ├── categories.ts          # 13 Category definitions & metadata
│   │   ├── toolsRegistry.ts       # 112 Tool registry with keywords & SEO metadata
│   │   ├── ifscData.ts            # Indian bank IFSC lookup database
│   │   ├── pinCodes.ts            # Major Indian PIN codes & post offices
│   │   ├── rtoCodes.ts            # State-wise RTO vehicle registration codes
│   │   └── bankHolidays.ts        # Indian national & gazetted holidays
│   ├── lib/
│   │   ├── supabase.ts            # Supabase JS client initializer
│   │   └── utils.ts               # Formatting (INR Currency formatting, Lakh/Crore)
│   ├── services/
│   │   ├── contactService.ts      # Contact form submission pipeline
│   │   └── toolRequestService.ts  # Tool request submission pipeline
│   ├── types/
│   │   └── index.ts               # Global TypeScript interfaces & type definitions
│   ├── App.tsx                    # Root routing & layout orchestrator
│   ├── index.css                  # Tailwind CSS v4 design tokens & base typography
│   └── main.tsx                   # React 19 entrypoint mounting to DOM
├── server.ts                      # Express production & Vite dev server
├── tsconfig.json                  # TypeScript compiler options
├── vite.config.ts                 # Vite bundler configuration
├── package.json                   # Dependencies, dev scripts & metadata
└── netlify.toml                   # Edge hosting configuration & caching rules
```

---

## 2. Key Category & Tool Breakdown

| Category ID | Category Name | Tool Count | Core Highlights |
|:---|:---|:---|:---|
| `money` | Money & Finance | 14 | Loan EMI, SIP, Step-Up SIP, Mutual Funds, New Tax Regime |
| `daily-life` | Daily Life & Utilities | 8 | Age Calculator, Date Difference, Percentage, Ratio |
| `home` | Home & Construction | 8 | Tiles Estimator, Wall Paint, Land Area (Gaj/Bigha/Guntha) |
| `education` | Education & Career | 6 | CGPA to Percentage, Attendance Planner, Marks Percentage |
| `travel` | Travel & Commute | 5 | Petrol/Diesel Trip Cost, Vehicle Mileage (km/L) |
| `business` | Business & Commerce | 6 | GST Invoice Maker, Margin & Markup, Break-even |
| `technology` | Technology & Digital | 5 | Download Time, Data Usage, My IP & ISP Inspector |
| `documents` | Documents & Letters | 9 | Resignation Letter, Casual Leave, Live QR Scanner |
| `date-time` | Date & Time | 5 | Working Days Countdown, IST to Global Timezone |
| `india-services` | India Services Hub | 10 | IFSC Finder, PIN Code, Live Indian AQI, Holidays Planner |
| `document-tools` | Document Tools | 11 | PDF Merge, Compress, Split, Passport Photo Maker |
| `vehicle-utility` | Vehicle Utility | 10 | EV vs Petrol, Tyre Size, Daily Fuel Price Tracker |
| `travel-utility` | Travel Utility | 9 | Live Currency Converter, Group Expense Splitter |
| **Total** | **13 Categories** | **112 Tools** | **Complete Indian Utility Coverage** |
