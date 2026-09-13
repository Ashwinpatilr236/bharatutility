# Tech Stack — BharatUtility

## Runtime & Frameworks
- **Frontend Framework:** React 19 (`react` ^19.0.0, `react-dom` ^19.0.0)
- **Bundler & Build Tool:** Vite 6 (`vite` ^6.2.0, `@vitejs/plugin-react` ^4.3.4)
- **Language:** TypeScript 5 (`typescript` ~5.7.2)
- **Styling Engine:** Tailwind CSS 4 (`tailwindcss` ^4.0.9, `@tailwindcss/vite` ^4.0.9)
- **Server Runtime:** Node.js Express (`express` ^4.21.2) compiled via `esbuild` to `dist/server.cjs`

## Core Libraries & Dependencies
- **Iconography:** Lucide React (`lucide-react` ^0.475.0)
- **Charts & Data Visualization:** Chart.js (`chart.js` ^4.4.8, `react-chartjs-2` ^5.3.0), Recharts (`recharts` ^2.15.1)
- **Document & PDF Generation:** `jspdf` (^2.5.2), `jspdf-autotable` (^3.8.4), `pdf-lib` (^1.17.1), `html2canvas` (^1.4.1)
- **Animation & Delight:** `canvas-confetti` (^1.9.4), `canvas-txt` (^4.3.0)
- **Backend / Database Client:** `@supabase/supabase-js` (^2.49.1)
- **HTTP / Utilities:** `axios` (^1.7.9), `dotenv` (^16.4.7), `cors` (^2.8.5)

## Native Web APIs Utilized
- **Canvas 2D API:** For HTML5 interactive paint, image stamping, screenshot annotation, and QR barcode processing.
- **Web Speech API:** In-browser Speech-to-Text (`webkitSpeechRecognition`) for voice-activated typing & dictation.
- **Navigator Clipboard API:** 1-click rich text, markdown, and PNG image blob copying.
- **Geolocation & Network Information APIs:** Browser-side IP, ISP ping, latency diagnostics, and Vedic sunrise calculations.
- **Local Storage API:** Client-side persistence for favorite tools, recent searches, and auto-saved scratchpad notes.
