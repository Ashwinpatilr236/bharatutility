/**
 * Section 44ADA Presumptive Taxation Utility
 * Shared calculation engine for Freelance & Professional Presumptive Tax under Section 44ADA
 * Applicable for FY 2024-25 & FY 2025-26
 */

export interface Tax44ADABasicResult {
  deemedProfit: number;
  estimatedTax: number;
  advanceTaxSchedule: Array<{
    date: string;
    percent: string;
    amount: number;
  }>;
}

export interface Tax44ADAComprehensiveParams {
  grossReceipts: number;
  otherIncome?: number;
  regime?: 'new' | 'old';
  old80CDeductions?: number;
}

export interface Tax44ADAComprehensiveResult {
  gross: number;
  isEligible: boolean;
  deemedProfit: number;
  expensesSaved: number;
  newRegimeTotalTax: number;
  oldRegimeTotalTax: number;
  chosenTax: number;
  effectiveTaxRate: string;
  netTakeHome: number;
  advTax1: number;
  advTax2: number;
  advTax3: number;
  advTax4: number;
}

/**
 * Calculates New Tax Regime tax liability before cess
 * FY 2024-25 / FY 2025-26 slabs:
 * - Up to ₹3L: Nil
 * - ₹3L - ₹7L: 5%
 * - ₹7L - ₹10L: 10%
 * - ₹10L - ₹12L: 15%
 * - ₹12L - ₹15L: 20%
 * - Above ₹15L: 30%
 * Section 87A rebate applies for taxable income up to ₹7,00,000 (tax = ₹0).
 */
export function computeNewRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 700000) return 0; // Section 87A Full Rebate
  let tax = 0;
  if (taxableIncome > 1500000) {
    tax += (taxableIncome - 1500000) * 0.30 + (300000 * 0.20) + (200000 * 0.15) + (300000 * 0.10) + (400000 * 0.05);
  } else if (taxableIncome > 1200000) {
    tax += (taxableIncome - 1200000) * 0.20 + (200000 * 0.15) + (300000 * 0.10) + (400000 * 0.05);
  } else if (taxableIncome > 1000000) {
    tax += (taxableIncome - 1000000) * 0.15 + (300000 * 0.10) + (400000 * 0.05);
  } else if (taxableIncome > 700000) {
    tax += (taxableIncome - 700000) * 0.10 + (400000 * 0.05);
  } else if (taxableIncome > 300000) {
    tax += (taxableIncome - 300000) * 0.05;
  }
  return tax;
}

/**
 * Calculates Old Tax Regime tax liability before cess
 */
export function computeOldRegimeTax(taxableIncome: number): number {
  if (taxableIncome <= 500000) return 0; // Section 87A rebate for Old Regime
  let tax = 0;
  if (taxableIncome > 1000000) {
    tax += 112500 + (taxableIncome - 1000000) * 0.30;
  } else if (taxableIncome > 500000) {
    tax += 12500 + (taxableIncome - 500000) * 0.20;
  } else if (taxableIncome > 250000) {
    tax += (taxableIncome - 250000) * 0.05;
  }
  return tax;
}

/**
 * Basic 44ADA calculation for quick estimators
 */
export function calculate44ADABasic(grossReceipts: number): Tax44ADABasicResult {
  const deemedProfit = grossReceipts * 0.5; // 50% deemed profit
  const taxableIncome = deemedProfit;
  
  let estimatedTax = 0;
  if (taxableIncome > 700000) {
    if (taxableIncome > 1500000) estimatedTax = 140000 + (taxableIncome - 1500000) * 0.3;
    else if (taxableIncome > 1200000) estimatedTax = 90000 + (taxableIncome - 1200000) * 0.2;
    else if (taxableIncome > 1000000) estimatedTax = 60000 + (taxableIncome - 1000000) * 0.15;
    else estimatedTax = (taxableIncome - 700000) * 0.1;
  }

  const advanceTaxSchedule = [
    { date: '15th June', percent: '15%', amount: Math.round(estimatedTax * 0.15) },
    { date: '15th September', percent: '45%', amount: Math.round(estimatedTax * 0.45) },
    { date: '15th December', percent: '75%', amount: Math.round(estimatedTax * 0.75) },
    { date: '15th March', percent: '100%', amount: Math.round(estimatedTax) },
  ];

  return {
    deemedProfit,
    estimatedTax: Math.round(estimatedTax),
    advanceTaxSchedule,
  };
}

/**
 * Comprehensive 44ADA calculation supporting New & Old Regimes, deductions, and 4% Health & Education cess
 */
export function calculate44ADAComprehensive({
  grossReceipts,
  otherIncome = 0,
  regime = 'new',
  old80CDeductions = 0,
}: Tax44ADAComprehensiveParams): Tax44ADAComprehensiveResult {
  const gross = Math.min(7500000, Math.max(0, grossReceipts));
  const isEligible = grossReceipts <= 7500000;
  
  // 50% Deemed taxable income
  const deemedProfit = gross * 0.5;
  const totalTaxableIncomeNew = deemedProfit + otherIncome;
  const totalTaxableIncomeOld = Math.max(0, deemedProfit + otherIncome - old80CDeductions);

  const newRegimeBaseTax = computeNewRegimeTax(totalTaxableIncomeNew);
  const newRegimeTotalTax = Math.round(newRegimeBaseTax * 1.04); // 4% cess

  const oldRegimeBaseTax = computeOldRegimeTax(totalTaxableIncomeOld);
  const oldRegimeTotalTax = Math.round(oldRegimeBaseTax * 1.04); // 4% cess

  const chosenTax = regime === 'new' ? newRegimeTotalTax : oldRegimeTotalTax;
  const effectiveTaxRate = gross > 0 ? (chosenTax / gross) * 100 : 0;
  const netTakeHome = gross - chosenTax;

  // Advance Tax Installments: 15% (Jun 15), 45% (Sep 15), 75% (Dec 15), 100% (Mar 15)
  const advTax1 = Math.round(chosenTax * 0.15);
  const advTax2 = Math.round(chosenTax * 0.45);
  const advTax3 = Math.round(chosenTax * 0.75);
  const advTax4 = chosenTax;

  return {
    gross,
    isEligible,
    deemedProfit: Math.round(deemedProfit),
    expensesSaved: Math.round(deemedProfit),
    newRegimeTotalTax,
    oldRegimeTotalTax,
    chosenTax,
    effectiveTaxRate: effectiveTaxRate.toFixed(1),
    netTakeHome: Math.round(netTakeHome),
    advTax1,
    advTax2,
    advTax3,
    advTax4,
  };
}
