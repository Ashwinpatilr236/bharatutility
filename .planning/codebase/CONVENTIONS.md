# Code Conventions & Engineering Standards

**Application:** BharatUtility  
**Domain Standards:** Indian Utility Localization & Privacy-First Architecture  

---

## 1. Indian Localization & Number Formatting

All monetary and demographic calculations must strictly follow Indian standards:

- **Currency Formatting:** Always use the Indian Numbering System (`en-IN`) with Lakhs (1,00,000) and Crores (1,00,00,000).
  ```typescript
  export const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  ```
- **Lakh / Crore Converter Helper:** When displaying high values (loans, investments), provide quick human-readable units (`₹ 1.25 Cr`, `₹ 45.5 Lakh`).
- **Date Format:** Use standard Indian date format (`DD/MM/YYYY`) and Indian Standard Time (IST, UTC+5:30).

---

## 2. Component Design & Architecture Patterns

### A. Functional Components & Typed Props
All components are written as clean React 19 functional components with explicit TypeScript interfaces:
```typescript
interface CalculatorProps {
  initialAmount?: number;
  onCalculate?: (result: CalculationResult) => void;
}

export const SipCalculator: React.FC<CalculatorProps> = ({ initialAmount = 5000 }) => {
  // Logic here
};
```

### B. Controlled Inputs with Live Responsive Sliders
For high-conversion user experience, mathematical tools pair numeric inputs with interactive range sliders (`<input type="range">`), allowing instant visual recalculation without requiring a separate "Submit" click.

### C. Privacy-First Computation Rule
- **Never transmit user calculation inputs to external APIs.**
- All loan schedules, salary breakdowns, tile dimensions, and PDF data are computed locally in the browser.

---

## 3. Styling & Design Tokens (Tailwind CSS v4)

- **Color Palette:**
  - Primary Accent: Indian Emerald / Green (`emerald-600`, `emerald-500`)
  - Warm Saffron Accents: Indian Saffron (`amber-500`, `orange-500`)
  - Navy / Slate Neutrals: Deep Indigo / Slate (`slate-900`, `slate-800`, `slate-700`)
- **Card & Container Styling:**
  - Modern rounded cards (`rounded-2xl` / `rounded-3xl`)
  - Subtle borders (`border border-slate-200 dark:border-slate-800`)
  - Smooth hover elevations (`hover:shadow-xl hover:-translate-y-1 transition-all duration-300`)
- **Accessibility & Focus:**
  - Clear focus rings for keyboard navigation (`focus:ring-2 focus:ring-emerald-500 focus:outline-none`)
  - Meaningful `aria-label` tags on all icon buttons and interactive controls.

---

## 4. Iconography Conventions

- Use `lucide-react` icons uniformly throughout the application.
- Use semantic icon mappings (e.g., `IndianRupee` for money, `Landmark` for government services, `FileCheck` for document tools, `Zap` for popular tools).
- Avoid inline raw SVGs where a Lucide equivalent exists.
