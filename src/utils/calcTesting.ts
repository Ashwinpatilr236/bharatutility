/**
 * Calculator Reliability & Formula Verification Suite
 * Verifies key mathematical calculation logic across core calculators.
 */

export interface TestResult {
  name: string;
  passed: boolean;
  expected: number;
  actual: number;
  delta: number;
}

/**
 * Calculates Monthly EMI for a loan.
 * Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) return 0;
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.round(emi);
}

/**
 * Calculates GST amount (Exclusive vs Inclusive).
 */
export function calculateGST(amount: number, ratePercent: number, isInclusive: boolean = false) {
  if (amount <= 0 || ratePercent <= 0) {
    return { gstAmount: 0, totalAmount: amount, baseAmount: amount };
  }

  if (isInclusive) {
    const baseAmount = amount / (1 + ratePercent / 100);
    const gstAmount = amount - baseAmount;
    return {
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalAmount: amount,
      baseAmount: Math.round(baseAmount * 100) / 100,
    };
  } else {
    const gstAmount = amount * (ratePercent / 100);
    const totalAmount = amount + gstAmount;
    return {
      gstAmount: Math.round(gstAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      baseAmount: amount,
    };
  }
}

/**
 * Calculates SIP Maturity Amount.
 * Formula: A = P * ((1 + i)^n - 1) / i * (1 + i)
 */
export function calculateSIP(monthlyInvestment: number, expectedReturnRate: number, tenureYears: number): number {
  if (monthlyInvestment <= 0 || expectedReturnRate <= 0 || tenureYears <= 0) return 0;
  const i = expectedReturnRate / 12 / 100;
  const n = tenureYears * 12;
  const maturityValue = monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  return Math.round(maturityValue);
}

/**
 * Converts Indian Land Units (Gaj to Sq Ft).
 * 1 Gaj = 9 Sq Ft.
 */
export function convertGajToSqFt(gaj: number): number {
  return Math.round(gaj * 9 * 100) / 100;
}

/**
 * Runs automated calculation verification suite.
 */
export function runCalculatorTestSuite(): TestResult[] {
  const results: TestResult[] = [];

  // 1. EMI Test: ₹1,00,000 at 10% for 12 months => Expected ~₹8,792
  const emiActual = calculateEMI(100000, 10, 12);
  const emiExpected = 8792;
  results.push({
    name: 'Home/Personal Loan EMI Verification',
    passed: Math.abs(emiActual - emiExpected) <= 5,
    expected: emiExpected,
    actual: emiActual,
    delta: Math.abs(emiActual - emiExpected),
  });

  // 2. GST Exclusive Test: ₹10,000 at 18% GST => Expected GST ₹1,800
  const gstRes = calculateGST(10000, 18, false);
  results.push({
    name: 'GST Exclusive Amount Verification',
    passed: Math.abs(gstRes.gstAmount - 1800) < 0.1,
    expected: 1800,
    actual: gstRes.gstAmount,
    delta: Math.abs(gstRes.gstAmount - 1800),
  });

  // 3. SIP Test: ₹5,000/mo at 12% for 10 years => Expected ~₹11,61,695
  const sipActual = calculateSIP(5000, 12, 10);
  const sipExpected = 1161695;
  results.push({
    name: 'Mutual Fund SIP Maturity Verification',
    passed: Math.abs(sipActual - sipExpected) <= 50,
    expected: sipExpected,
    actual: sipActual,
    delta: Math.abs(sipActual - sipExpected),
  });

  // 4. Land Unit Conversion Test: 100 Gaj => 900 Sq Ft
  const landActual = convertGajToSqFt(100);
  results.push({
    name: 'Indian Land Conversion (Gaj to Sq Ft)',
    passed: landActual === 900,
    expected: 900,
    actual: landActual,
    delta: Math.abs(landActual - 900),
  });

  return results;
}
