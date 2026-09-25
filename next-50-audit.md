# BharatUtility Next 50 — Audit Report

## Summary
A comprehensive audit of the proposed 50 tools has been conducted against the existing `toolsRegistry.ts` (which currently contains 225 tools). The purpose of this audit is to identify duplicates, map existing tools to the proposed intents, and isolate genuinely missing, high-value tools for implementation in the next phases.

## Internal Comparison Matrix

| Proposed Tool | Existing Tool | Duplicate? | Near Duplicate? | Action |
| ------------- | ------------- | ---------- | --------------- | ------ |
| **P0 Priority** | | | | |
| 1. Income Tax Calculator 2026-27 | `income-tax-calculator` | Yes (Recently Built) | - | Skip (Already Completed) |
| 2. Old vs New Tax Regime | `new-vs-old-tax-calculator` | Yes (Alias to IT) | - | Skip (Alias mapped to IT) |
| 3. HRA Exemption | `hra-tax-exemption-calculator` | Yes (Recently Built) | - | Skip (Already Completed) |
| 4. CTC to In-Hand Salary | `salary-calculator` | Yes | - | Skip (Existing Tool) |
| 5. Personal Loan EMI | `personal-loan-emi-calculator` | Yes (Alias to EMI) | - | Skip (Alias mapped to EMI) |
| 6. Home Loan Eligibility | `home-loan-eligibility-calculator` | Yes (Recently Built) | - | Skip (Already Completed) |
| 7. Loan Amortization | `emi-calculator` | - | Yes | Enhance existing EMI tool if needed |
| 8. Loan Eligibility / FOIR | `home-loan-eligibility-calculator` | Yes | - | Skip (Covered by #6) |
| 9. CAGR Calculator | `cagr-calculator` | Yes (Recently Built) | - | Skip (Already Completed) |
| 10. Lumpsum Investment | `lumpsum-calculator` | Yes (Recently Built) | - | Skip (Already Completed) |
| 11. SWP Calculator | `swp-calculator` | Yes (Recently Built) | - | Skip (Already Completed) |
| 12. XIRR Calculator | `xirr-calculator` | Yes (Recently Built) | - | Skip (Already Completed) |
| 13. Term Insurance Coverage | - | No | No | **IMPLEMENT (P0)** |
| 14. EV vs Petrol vs CNG TCO | `ev-tco-calculator` | Yes (Recently Built) | - | Skip (Already Completed) |
| 15. Capital Gains Tax | `mutual-fund-capital-gains-tax-calculator` | - | Yes | Enhance existing or build generic |
| 16. Loan Prepayment Savings | `home-loan-prepayment-calculator` | Yes | - | Skip (Existing Tool) |
| 17. Retirement Corpus | `fire-retirement-calculator` | Yes | - | Skip (Existing Tool) |
| 18. Health Insurance Coverage | - | No | No | **IMPLEMENT (P0)** |
| 19. Car Insurance IDV | - | No | No | **IMPLEMENT (P0)** |
| 20. Car Running Cost | `vehicle-fuel-cost-calculator` | Yes | - | Skip (Existing Tool) |
| 21. EV Charging Cost | `ev-fast-charging-cost-matrix` | Yes | - | Skip (Existing Tool) |
| 22. Car Depreciation | `vehicle-depreciation-calculator` | Yes | - | Skip (Existing Tool) |
| 23. Profit Margin & Markup | `mrp-margin-gst-breakdown-calculator` | Yes | - | Skip (Existing Tool) |
| 24. Break-Even Point | - | No | No | **IMPLEMENT (P0)** |
| 25. Business Loan EMI | `business-loan-emi-calculator` | Yes (Alias) | - | Add Alias to EMI |
| 26. TDS Calculator FY 2026-27 | - | No | No | **IMPLEMENT (P0)** |
| 27. 80C + 80D Planner | - | No | No | **IMPLEMENT (P0)** |
| 28. E-Invoice Applicability | - | No | No | **IMPLEMENT (P0)** |
| 29. E-Way Bill Applicability | - | No | No | **IMPLEMENT (P0)** |
| 30. Property Registration Cost| `property-stamp-duty-calculator` | Yes | - | Skip (Existing Tool) |
| **P1 Priority** | | | | |
| 31. Bike Loan EMI | `bike-loan-emi-calculator` | Yes (Alias) | - | Add Alias to EMI |
| 32. Home Loan Affordability | `home-loan-eligibility-calculator` | Yes | - | Skip (Duplicate Intent) |
| 33. Debt-to-Income Ratio | `home-loan-eligibility-calculator` | - | Yes | Skip (Included in FOIR) |
| 34. Credit Card EMI | `credit-card-emi-calculator` | Yes (Alias) | - | Add Alias to EMI |
| 35. Credit Card Interest | - | No | No | **IMPLEMENT (P1)** |
| 36. Inflation Calculator India| - | No | No | **IMPLEMENT (P1)** |
| 37. Retirement SIP | `fire-retirement-calculator` / SIP | Yes | - | Skip (Existing / Alias) |
| 38. Net Worth Calculator | - | No | No | **IMPLEMENT (P1)** |
| 39. Debt Payoff Calculator | - | No | No | **IMPLEMENT (P1)** |
| 40. Human Life Value | - | No | Yes | Combine with Term Coverage (#13) |
| 41. Bike Insurance IDV | - | No | Yes | Combine with Car IDV (#19) |
| 42. Car Insurance Premium | - | No | Yes | Combine with Car IDV (#19) |
| 43. EV Range & Trip Cost | `trip-cost-calculator` | Yes | - | Skip (Existing Tool) |
| 44. Car Resale Value | `old-vehicle-resale-valuation-calculator`| Yes | - | Skip (Existing Tool) |
| 45. Working Capital | - | No | No | **IMPLEMENT (P1)** |
| 46. Advance Tax Calculator | - | No | No | **IMPLEMENT (P1)** |
| 47. GST Reverse Charge | - | No | No | **IMPLEMENT (P1)** |
| 48. GST Composition Scheme | - | No | No | **IMPLEMENT (P1)** |
| 49. Rent vs Buy | `rent-vs-buy-calculator` | Yes | - | Skip (Existing Tool) |

## Audit Conclusions

**1. Duplication Prevention:** Out of the proposed 50 tools, **27 are already covered** either by recently implemented tools (Income Tax, EV TCO, CAGR, etc.), long-standing existing tools, or semantic aliases mapping to powerful parent calculators (like EMI, Salary). We will NOT create new UI instances for these to avoid cannibalizing SEO equity.

**2. Aliasing Strategy:** For tools like "Bike Loan EMI" and "Business Loan EMI", we will register URL slugs that resolve to the existing `EmiCalculator` component. We may augment the component to accept a `context` prop if needed to adjust the H1 dynamically.

**3. Genuine Missing Opportunities (To Implement):**
* **Insurance Cluster:** Term Insurance Coverage (HLV), Health Insurance Coverage, Car/Bike IDV Estimator.
* **Business/Tax Cluster:** General TDS Calculator, 80C/80D Planner, E-Invoice Applicability, E-Way Bill Applicability, Break-Even Point, GST Reverse Charge, GST Composition Scheme, Advance Tax, Working Capital.
* **Financial Cluster:** Credit Card Interest, Inflation, Net Worth, Debt Payoff.

**4. Implementation Plan:** Proceed to **Phase C (P0 Tools)** starting with the Insurance Cluster (Term Coverage & Health Coverage). 
