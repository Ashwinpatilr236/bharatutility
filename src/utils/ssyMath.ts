/**
 * Sukanya Samriddhi Yojana (SSY) Calculation Engine
 * Sovereign small savings scheme for the girl child under Ministry of Finance, Govt of India
 * Rules:
 * - Deposit period: 15 years from account opening
 * - Account maturity: 21 years from account opening
 * - Current interest rate: 8.2% p.a. (compounded annually)
 * - Tax status: EEE (Exempt-Exempt-Exempt) under Section 80C & Section 10(11D)
 */

export interface SSYYearlyBreakdown {
  year: number;
  age: number;
  deposit: number;
  interest: number;
  balance: number;
}

export interface SSYCalculationResult {
  totalInvested: number;
  totalInterest: number;
  maturityAmount: number;
  yearByYear: SSYYearlyBreakdown[];
}

export interface SSYSummaryResult {
  totalInvested: number;
  totalInterest: number;
  maturityAmount: number;
  maturityYear: number;
}

export interface SSYvsPPFResult {
  ssyCorpus: number;
  ppfCorpus: number;
  totalInvested: number;
  extraWealthSSY: number;
}

/**
 * Calculates detailed year-by-year SSY schedule for 21 years
 */
export function calculateSSYSchedule({
  annualDeposit,
  girlAge = 0,
  startYear = new Date().getFullYear(),
  interestRatePercent = 8.2,
}: {
  annualDeposit: number;
  girlAge?: number;
  startYear?: number;
  interestRatePercent?: number;
}): SSYCalculationResult {
  const rate = interestRatePercent / 100;
  let balance = 0;
  let totalInvested = 0;
  const yearByYear: SSYYearlyBreakdown[] = [];

  for (let yr = 1; yr <= 21; yr++) {
    const currentAge = girlAge + yr;
    const deposit = yr <= 15 ? annualDeposit : 0;
    totalInvested += deposit;
    const interest = (balance + deposit) * rate;
    balance = balance + deposit + interest;
    
    yearByYear.push({
      year: startYear + yr,
      age: currentAge,
      deposit,
      interest: Math.round(interest),
      balance: Math.round(balance),
    });
  }

  const totalInterest = Math.round(balance - totalInvested);
  const maturityAmount = Math.round(balance);

  return {
    totalInvested,
    totalInterest,
    maturityAmount,
    yearByYear,
  };
}

/**
 * Quick summary SSY calculation (15 years deposit, compounding up to 21 years)
 */
export function calculateSSYSummary(
  yearlyDeposit: number,
  interestRatePercent: number = 8.2
): SSYSummaryResult {
  let balance = 0;
  let totalInvested = 0;
  const rate = interestRatePercent / 100;

  for (let yr = 1; yr <= 21; yr++) {
    if (yr <= 15) {
      balance = (balance + yearlyDeposit) * (1 + rate);
      totalInvested += yearlyDeposit;
    } else {
      balance = balance * (1 + rate);
    }
  }

  const totalInterest = Math.max(0, balance - totalInvested);
  return {
    totalInvested,
    totalInterest,
    maturityAmount: balance,
    maturityYear: 21,
  };
}

/**
 * Compares SSY (8.2% sovereign) vs PPF (7.1% sovereign) over their respective standard terms
 */
export function calculateSSYvsPPF(
  annualInvestment: number,
  ssyRatePercent: number = 8.2,
  ppfRatePercent: number = 7.1
): SSYvsPPFResult {
  const ssyRate = ssyRatePercent / 100;
  let ssyCorpus = 0;
  for (let yr = 1; yr <= 15; yr++) {
    ssyCorpus = (ssyCorpus + annualInvestment) * (1 + ssyRate);
  }
  for (let yr = 16; yr <= 21; yr++) {
    ssyCorpus = ssyCorpus * (1 + ssyRate);
  }

  const ppfRate = ppfRatePercent / 100;
  let ppfCorpus = 0;
  for (let yr = 1; yr <= 15; yr++) {
    ppfCorpus = (ppfCorpus + annualInvestment) * (1 + ppfRate);
  }

  const totalInvested = annualInvestment * 15;
  const extraWealthSSY = Math.round(ssyCorpus - ppfCorpus);

  return {
    ssyCorpus: Math.round(ssyCorpus),
    ppfCorpus: Math.round(ppfCorpus),
    totalInvested,
    extraWealthSSY,
  };
}
