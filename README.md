# BharatUtility — India's Digital Utility Super-Site

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8.svg)](https://tailwindcss.com/)

> **Live Production Website:** [https://bharatutility.tech](https://bharatutility.tech)

**BharatUtility** is India's Digital Utility Super-Site — a fast, privacy-first, community-driven online platform with over 230+ interactive calculators, converters, financial tools, document generators, and everyday civic utilities tailored specifically for Indian citizens, students, professionals, and small businesses.

---

## 🌟 Key Features

BharatUtility hosts a wide variety of practical tools across 13 major Indian categories:

- 💰 **Money & Tax Calculators**: Loan EMI (Home, Personal, Car), SIP Investment, SWP, Lump Sum, FD with Quarterly Compounding, RD, Post Office MIS, Income Tax (Old vs New Regime comparisons), GST Invoicing & Reversals, Freelancer 44ADA Presumptive Tax, Capital Gains (LTCG / STCG), Gratuity & Leave Encashment, and Gold/Silver Making Charges.
- 📄 **Document & Legal Utilities**: Rent Agreement Stamp Duty Estimator, Legal Notice & Application Letter Generator, Non-Judicial Stamp Paper Value Guide, and PDF Tools.
- 🎓 **Education & Career**: Sarkari Exam Age Eligibility Calculator, College Cutoff Percentile Converter, and Student Grade Points.
- 🚗 **Travel & Vehicle Utilities**: Train Tatkal Berth Finder, Traffic Challan Portal Finder, Old Vehicle Resale Valuation, Mileage Trip Cost Estimator, and Speedometer Calibrator.
- 🏡 **Construction & Home Real Estate**: Land Area Converter (Bigha, Guntha, Ground, Gaj, Biswa, Acres, Sq Ft), Tile & Flooring Calculator, Paint Quantity Estimator, and Water Tank Capacity.
- ⚡ **Everyday Civic & Lifestyle**: Indian Baby Names by Rashi & Nakshatra, Vedic Choghadiya Muhurat Tracker, Jan Aushadhi Generic Medicine Cost Saver, Electricity Bill Tariff Estimator, and Stock Market Hours Countdown.
- 📺 **ARRJS IPTV & Media Utilities**: Modern TV-ready Smart Video Player with M3U playlist parsing, HLS playback, spatial D-pad navigation, channel categories, favorites, mini guide, and numeric zapping.
- 🛡️ **Privacy-First Design**: Over 95% of calculations occur client-side in the browser. Personal financial figures, loan amounts, and passwords are never harvested, saved to remote databases, or shared with third parties.

---

## 🛠️ Technology Stack

- **Frontend Core**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Vanilla CSS](src/index.css) & [Tailwind CSS v4](https://tailwindcss.com/) with dark mode support
- **Backend & Serving**: [Express 4](https://expressjs.com/) with TypeScript execution via [tsx](https://github.com/privatenumber/tsx)
- **Database & Telemetry**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`) with strict Row Level Security (RLS)
- **Media & Streaming**: [HLS.js](https://github.com/video-dev/hls.js) for live streaming and IPTV playback
- **Iconography & Visuals**: [Lucide React](https://lucide.dev/)
- **Document & Visual Engines**: `pdf-lib`, `qrcode`, `canvas-confetti`, and `recharts`

---

## 📁 Project Structure

```text
bharatutility/
├── public/                     # Static assets, favicon, sitemap.xml, robots.txt
├── scripts/                    # Maintenance, SEO audit, and dynamic sitemap generation scripts
│   ├── generate-sitemap.ts     # Generates production sitemap across all 230+ tools
│   ├── validate-seo.ts         # Automated SEO schema, canonical, and slug validation
│   └── importIndiaPostOffices.ts # Optional batch PIN code dataset importer
├── src/
│   ├── components/
│   │   ├── calculators/        # Individual calculator suites and formula implementations
│   │   ├── common/             # Global headers, footers, command palette, error boundaries
│   │   ├── home/               # Homepage discovery widgets, category panels, hero sections
│   │   ├── tools/              # Reusable tool page layout and category-specific components
│   │   └── views/              # Full page views (All Tools, Favorites, Legal, Contact, Articles)
│   ├── context/                # AppContext for routing, favorites, navigation, and theme
│   ├── data/                   # Registry definitions (categories.ts, toolsRegistry.ts, contentRegistry.ts)
│   ├── services/               # AdminStore, AnalyticsService, SupabaseClient, PostalService
│   ├── utils/                  # Math formulas, formatters, document parsers, and SEO utilities
│   ├── App.tsx                 # Main application root with global ErrorBoundary
│   ├── main.tsx                # React DOM root entry point
│   └── index.css               # Core CSS design system and Tailwind directives
├── supabase/                   # Supabase schema definitions and migration SQL
├── .env.example                # Safe environment variable configuration template
├── netlify.toml                # Netlify deployment and SPA routing configuration
├── server.ts                   # Express server with Vite middleware integration
└── package.json                # Project scripts and dependencies
```

---

## 🚀 Local Development

### 1. Clone the Repository
```bash
git clone https://github.com/Ashwinpatilr236/bharatutility.git
cd bharatutility
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
*(The default configuration is ready for immediate local testing of all client-side tools).*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build & Testing

Run the validation suite and create the production bundle:

```bash
# Typecheck & Lint
npm run lint

# Validate SEO Schemas & Registry Consistency
npm run test:seo

# Dynamically generate sitemap.xml
npm run sitemap

# Create optimized production build
npm run build

# Start the production server locally
npm start
```

---

## 🔐 Environment Variables

BharatUtility uses standard environment variables defined in `.env.example`:

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `APP_URL` | Canonical site URL for metadata & sitemaps | `https://bharatutility.tech` |
| `PORT` | Local server port for `server.ts` | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `VITE_SUPABASE_URL` | Supabase project endpoint URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public/anon API key for client-side queries | `your-anon-key` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional service key for offline CLI scripts | *Leave blank in browser* |

---

## 🌐 Deployment

### Netlify (Configured)
The repository includes a [netlify.toml](netlify.toml) configured for static and SPA hosting:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Redirects**: Automatically routed to `/index.html` with status `200` for client-side routing.

### Node.js / Docker / VPS
Build the production bundle with `npm run build` and run:
```bash
NODE_ENV=production node dist/server.cjs
```

---

## 🤝 Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on code style, testing requirements, and pull request workflows.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewIndianTool`)
3. Commit your Changes (`git commit -m 'feat: add new gold silver scrap rate calculator'`)
4. Verify tests (`npm run lint && npm run test:seo && npm run build`)
5. Push to the Branch (`git push origin feature/NewIndianTool`)
6. Open a Pull Request

---

## 🔒 Security

For security vulnerability reports or sensitive concerns, please review [SECURITY.md](SECURITY.md) and contact us privately at **support@bharatutility.tech**.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

© 2026 BharatUtility Contributors & ARRJS Technologies. Built for everyday India.
