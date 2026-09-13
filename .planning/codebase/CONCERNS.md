# BharatUtility Known Concerns, Tech Debt & Future Considerations

This document outlines technical debt, potential architectural bottlenecks, security considerations, and future improvement areas identified during the codebase mapping.

---

## 1. Technical Debt & Codebase Health

| Item | Area | Description | Severity | Recommendation |
|---|---|---|---|---|
| **Large Component Files** | `src/components/calculators/` | Several calculator suites (`DocumentToolsSuiteCalculator.tsx`, `DailyIndianMassUtilitySuite.tsx`, `ToolPageLayout.tsx`) contain 1,000+ to 2,000+ lines. | Medium | As the application continues to grow, consider sub-modularizing related sub-calculators into dedicated domain directories (`src/components/calculators/finance/`, `src/components/calculators/citizen/`). |
| **Large Registry Catalog** | `src/data/toolsRegistry.ts` | The central tool catalog is now ~12,000 lines defining 220 tools with rich SEO metadata and FAQ datasets. | Low-Medium | Currently well-typed and fast to parse; in future milestones, splitting into category-based slices (e.g. `src/data/tools/finance.ts`, `src/data/tools/health.ts`) can improve developer ergonomics and editor performance. |
| **PDF Generation Bundle Size** | `PDFButton.tsx` (jsPDF & html2canvas) | The PDF bundle chunk is ~430 KB (178 KB gzip). | Low | It is already isolated in a lazy chunk, preventing impact on the initial page load. Keep it lazy-loaded. |

---

## 2. External API Dependency & Reliability

| API Integration | Dependency Type | Risk / Concern | Mitigation Strategy in Place |
|---|---|---|---|
| **Frankfurter (Currency)** | Free Public API | Third-party rate-limiting or brief downtime. | Bundled with a fallback currency rate matrix updated directly from official reserve ratios. |
| **Open-Meteo (AQI & Weather)** | Free Public API | Network timeout on slow 2G/3G mobile networks. | 5-second fetch timeout with automatic graceful fallback to verified standard seasonal metrics. |
| **ipapi.co (IP & ISP)** | Free Public API (Client-side) | Client-side adblockers or quota limits. | Catches network errors and returns simulated local connection diagnostics with ping probe. |
| **Supabase (Backend forms)** | Managed Backend | Free tier connection limits or pausing. | In-memory queue fallback and local logging ensures no UI crashes if database is unreachable. |

---

## 3. Security Considerations

- **Client-Side Data Privacy**:
  - All mathematical and sensitive citizen calculators (e.g., EPF Passbook analysis, 80C deductions, EMI amortization, salary CTC breakdown, Aadhaar masking guidelines, password leak audits) execute purely in memory in the user's browser.
  - Zero sensitive form inputs are saved or transmitted to backend servers.
- **Form Sanitization & Spam Protection**:
  - `contactService.ts` and `toolRequestService.ts` validate email regexes and sanitize inputs before writing to Supabase.
  - Environment variables (`SUPABASE_SERVICE_ROLE_KEY`) remain strictly on the backend server.
- **Clean Social Links**:
  - All public social links point to official ARRJS Technologies channels (`https://www.linkedin.com/company/arrjstechnologies`, `https://www.instagram.com/arrjstechnologies/`, `https://www.facebook.com/arrjstechnologies`, `https://x.com/arrjstech`).
  - No orphaned or insecure third-party bot tokens exist in the codebase.

---

## 4. Scalability & Future Roadmap

1. **PWA (Progressive Web App) Offline Support**:
   - Because 95%+ of calculators are purely client-side mathematical algorithms, adding a Service Worker / PWA manifest would allow BharatUtility to function 100% offline in rural or low-connectivity Indian regions.
2. **Multi-Lingual Localization (i18n)**:
   - High-demand regional languages (Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada) could be layered over the existing tool registry definitions.
3. **Structured Schema.org Expansion**:
   - Add `SoftwareApplication` and `FinancialProduct` JSON-LD rich snippets to `ToolPageLayout` for enhanced Google Search feature snippets.
