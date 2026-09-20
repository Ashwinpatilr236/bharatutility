# Project Context — BharatUtility

## 1. Project Identity

* **Project Name**: BharatUtility
* **Purpose**: India's comprehensive utility super-platform offering 50+ high-utility, privacy-centric, instant web tools across Financial Calculators, Document & PDF Utilities, Travel & Transit Tools, Civic & Daily Life Calculators, and Developer Tools.
* **Current Status**: Active & Production-ready.
* **Exact Local Path**: `C:\Users\USER\Desktop\bharatutility`
* **Canonical Live URL**: `https://bharatutility.tech`
* **GitHub Repository**: `https://github.com/Ashwinpatilr236/bharatutility.git`
* **Deployment Platform**: Netlify (via `netlify.toml` and custom domain `bharatutility.tech`)

---

## 2. Technology Stack

* **Frontend Framework**: React 19 (`react` 19.0.1, `react-dom` 19.0.1)
* **Build System & Bundler**: Vite 6 (`vite` 6.2.3, `@vitejs/plugin-react` 5.0.4, `typescript` 5.8.2, `tsx` 4.21.0, `esbuild` 0.25.0)
* **Styling / UI**: Tailwind CSS v4 (`tailwindcss` 4.1.14, `@tailwindcss/vite` 4.1.14), Dark/Light theme system via `src/context/AppContext.tsx`
* **Icons & Animation**: Lucide React (`lucide-react` 0.546.0), Motion (`motion` 12.23.24), Canvas Confetti (`canvas-confetti` 1.9.4)
* **Charts & Media**: Recharts (`recharts` 3.10.1), PDF-Lib (`pdf-lib` 1.17.1), QRCode (`qrcode` 1.5.4)
* **Database / Backend**: Supabase JS (`@supabase/supabase-js` 2.112.3), Express 4 (`express` 4.21.2) for node server bundling (`server.ts`)
* **SEO Automation**: Custom scripts for sitemap generation (`scripts/generate-sitemap.ts`) and validation (`scripts/validate-seo.ts`)

---

## 3. Architecture & Source Layout

```
bharatutility/
├── scripts/                # Automated SEO & Sitemap generation scripts
│   ├── generate-sitemap.ts
│   └── validate-seo.ts
├── src/
│   ├── components/
│   │   ├── common/         # Header, Footer, CommandPalette, MobileNavDock, OfflineIndicator, PwaBanner, Toast, ErrorBoundary
│   │   ├── home/           # Home Landing sections: HeroSection, PopularToolsSection, CategoryShowcase, InteractiveMiniTools, TrendingToolsSection, SanatanNextShowcaseSection, TrustSection, HomeFaqSection
│   │   ├── tools/          # Individual specialized tool implementations (50+ tools)
│   │   └── views/          # Code-split views: AllToolsView, CategoryView, FavoritesView, RequestToolView, ContactView, LegalView, SanatanNextPromoView
│   ├── context/            # AppContext.tsx (state management for navigation view, favorites, recents, dark mode, command palette)
│   ├── data/
│   │   ├── categories.ts   # Category definitions (Finance, PDF, Travel, Daily, Dev, etc.)
│   │   └── toolsRegistry.ts # Master registry of all 50+ tools with metadata, keywords, SEO tags, input schemas
│   ├── hooks/              # Custom React utility hooks
│   ├── services/           # Supabase client, Pincode search service, tool request submission
│   ├── types.ts            # Core TypeScript definitions (Tool, Category, ViewState, etc.)
│   ├── App.tsx             # SPA view switcher & eager/lazy layout orchestrator
│   ├── main.tsx            # Application entry & PWA service worker registration
│   └── index.css           # Global Tailwind CSS and custom layout styling
├── supabase/
│   └── migrations/         # SQL migration scripts (site_config, admin_profiles, tool_requests, contact_messages, india_post_offices)
├── netlify.toml            # Netlify deployment and header config
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Existing Features

1. **50+ Instant Client-Side Tools**:
   - **Financial Calculators**: GST Calculator, EMI Calculator, SIP Calculator, Income Tax Regime Calculator, Salary (In-Hand/CTC) Calculator, EPF/PPF/FD/RD Calculators, Gratuity, Inflation, Compound Interest.
   - **PDF & Document Utilities**: Merge PDF, Split PDF, Compress PDF, Image to PDF, Aadhaar Card Masking, PDF Watermark, e-Signature Maker.
   - **Travel & Transit**: Fuel Cost Calculator, Vehicle Mileage Calculator, Toll Estimator, EV vs Petrol Savings, PNR Status Guide.
   - **India Daily & Civic Utilities**: Electricity Bill Estimator, Gold/Silver Rate Estimator, Land & Area Unit Converter (Bigha, Guntha, Acre, SqFt), Age Calculator, Pincode & Post Office Directory, QR Code & Barcode Generator, Typing Speed Test.
   - **Developer Tools**: JSON Formatter/Validator, Base64 Encoder/Decoder, Hash Generator, URL Encoder, Color Palette Converter.
2. **Client-Side Privacy Guarantee**: All calculations and document operations run 100% in the client's browser without uploading sensitive files to servers.
3. **PWA & Offline Ready**: Service worker registration for offline tool availability and install-to-home-screen banner.
4. **Quick Command Palette (Ctrl+K)**: Instant fuzzy search across all tools and categories.
5. **Personalization**: LocalStorage-persisted favorite tools and recently used history.
6. **Sister App Showcase**: Built-in promotion and direct navigation for Sanatan Next.

---

## 5. Important Files

* `src/data/toolsRegistry.ts`: Master metadata registry. When adding or modifying a tool, register its ID, title, description, category, and slug here.
* `src/App.tsx`: Controls the SPA view system (`home`, `tool`, `category`, `all-tools`, `favorites`, `request-tool`, `contact`, `legal`).
* `src/context/AppContext.tsx`: Global application state, routing handler (`navigateToTool`, `navigateToCategory`), theme switching, and local favorites/history persistence.
* `netlify.toml`: Defines Netlify build settings, caching headers, and SPA redirects.
* `scripts/generate-sitemap.ts`: Generates sitemap XML dynamically from `toolsRegistry.ts` during build.

---

## 6. Database & Supabase Integration

* **Supabase Client**: Configured in `src/services/supabaseClient.ts`.
* **Database Tables**:
  - `site_config`: Dynamic announcement banners and feature toggles.
  - `tool_requests`: Captures user requests for new tools.
  - `contact_messages`: Feedback and user inquiries.
  - `india_post_offices`: Database of Indian pincodes, districts, and post offices.
  - `admin_profiles`: Role-based access definitions for admin users.
* **Security**: Client-side inserts use Supabase anonymous keys with RLS. Tool moderation occurs in `arrjs-central-admin`.

---

## 7. Deployment Configuration

* **Hosting**: Netlify
* **Build Command**: `npm run build` (`tsx scripts/generate-sitemap.ts && vite build && esbuild server.ts ...`)
* **Publish Directory**: `dist`
* **Custom Domain**: `https://bharatutility.tech`

---

## 8. Do Not Change / Project Boundaries

* **Do NOT move BharatUtility tools or calculations into ARRJS Technologies or Sanatan Next.**
* **Do NOT remove client-side privacy boundaries** (do not send user-uploaded PDF/images to remote servers).
* **Administrative control of tool requests and contact submissions belongs in `arrjs-central-admin`.**

---

## 9. Known Issues & Notes

* All tool calculations are pure TypeScript logic; verify unit math whenever adjusting tax, interest, or unit conversion formulas.

---

## 10. Future Context

* *Reserved for notes on new tool releases, categories, or API integrations.*
