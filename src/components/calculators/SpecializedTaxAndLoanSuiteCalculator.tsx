import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { calculate44ADAComprehensive } from '../../utils/tax44ada';
import {
  Coins,
  TrendingUp,
  Percent,
  Sparkles,
  Check,
  Copy,
  IndianRupee,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Scale
} from 'lucide-react';

interface Props {
  tool: Tool;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(val));
};

export const SpecializedTaxAndLoanSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // =========================================================================
  // 1. MUTUAL FUND CAPITAL GAINS TAX STATE (Budget 2024-2026 Rules)
  // =========================================================================
  const [mfFundType, setMfFundType] = useState<'equity' | 'debt'>('equity');
  const [mfHoldingMonths, setMfHoldingMonths] = useState<number>(24);
  const [mfPurchaseAmount, setMfPurchaseAmount] = useState<number>(300000);
  const [mfSaleAmount, setMfSaleAmount] = useState<number>(550000);
  const [mfAlreadyUtilizedExemption, setMfAlreadyUtilizedExemption] = useState<number>(0);

  // =========================================================================
  // 2. GOLD LOAN & PER GRAM ELIGIBILITY STATE (RBI 75% LTV)
  // =========================================================================
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(35);
  const [goldKarat, setGoldKarat] = useState<number>(22); // 24, 22, 18, 14
  const [goldRatePerGram24K, setGoldRatePerGram24K] = useState<number>(7400); // ₹ per gram for 24K
  const [goldLoanTenureMonths, setGoldLoanTenureMonths] = useState<number>(12);
  const [goldInterestRatePa, setGoldInterestRatePa] = useState<number>(10.5); // % p.a.
  const [goldRepaymentType, setGoldRepaymentType] = useState<'bullet' | 'emi'>('bullet');

  // =========================================================================
  // 3. FREELANCE 44ADA TAX STATE (50% Presumptive Taxation)
  // =========================================================================
  const [freelanceGrossReceipts, setFreelanceGrossReceipts] = useState<number>(2400000); // 24 Lakhs
  const [freelanceProfession, setFreelanceProfession] = useState<string>('Software & Tech Consultant');
  const [freelanceOtherIncome, setFreelanceOtherIncome] = useState<number>(0);
  const [freelanceRegime, setFreelanceRegime] = useState<'new' | 'old'>('new');
  const [freelanceOld80CDeductions, setFreelanceOld80CDeductions] = useState<number>(150000);

  // =========================================================================
  // 4. POST OFFICE MIS STATE (7.4% p.a. Monthly Guaranteed)
  // =========================================================================
  const [pomisAccountType, setPomisAccountType] = useState<'single' | 'joint'>('single');
  const [pomisDepositAmount, setPomisDepositAmount] = useState<number>(900000); // Max ₹9L for single, ₹15L for joint

  // =========================================================================
  // 1. MUTUAL FUND CAPITAL GAINS CALCULATION
  // =========================================================================
  const mfResult = useMemo(() => {
    const totalGains = Math.max(0, mfSaleAmount - mfPurchaseAmount);
    const isEquity = mfFundType === 'equity';
    const isLongTerm = isEquity ? mfHoldingMonths > 12 : false; // Equity >12m LTCG, Debt is taxed as per slab/STCG

    let taxRatePercent = 0;
    let exemptionAvailable = 0;
    let taxableGains = 0;
    let baseTax = 0;

    if (isEquity) {
      if (isLongTerm) {
        // Budget 2024 LTCG: 12.5% on gains exceeding ₹1,25,000
        const annualExemptionLimit = 125000;
        const remainingExemption = Math.max(0, annualExemptionLimit - mfAlreadyUtilizedExemption);
        exemptionAvailable = Math.min(totalGains, remainingExemption);
        taxableGains = Math.max(0, totalGains - exemptionAvailable);
        taxRatePercent = 12.5;
        baseTax = (taxableGains * 12.5) / 100;
      } else {
        // Budget 2024 STCG: 20% flat
        taxRatePercent = 20;
        taxableGains = totalGains;
        baseTax = (taxableGains * 20) / 100;
      }
    } else {
      // Debt Fund (Investments after April 1, 2023 taxed at slab rate, approx 30% slab benchmark)
      taxRatePercent = 30;
      taxableGains = totalGains;
      baseTax = (taxableGains * 30) / 100;
    }

    const cess = baseTax * 0.04;
    const totalTaxLiability = Math.round(baseTax + cess);
    const postTaxReturns = mfSaleAmount - totalTaxLiability;
    const netProfitPostTax = postTaxReturns - mfPurchaseAmount;
    const absoluteReturnPercent = mfPurchaseAmount > 0 ? (totalGains / mfPurchaseAmount) * 100 : 0;
    const postTaxReturnPercent = mfPurchaseAmount > 0 ? (netProfitPostTax / mfPurchaseAmount) * 100 : 0;

    return {
      totalGains,
      isLongTerm,
      isEquity,
      taxRatePercent,
      exemptionAvailable,
      taxableGains,
      baseTax: Math.round(baseTax),
      cess: Math.round(cess),
      totalTaxLiability,
      postTaxReturns,
      netProfitPostTax,
      absoluteReturnPercent: absoluteReturnPercent.toFixed(1),
      postTaxReturnPercent: postTaxReturnPercent.toFixed(1),
    };
  }, [mfFundType, mfHoldingMonths, mfPurchaseAmount, mfSaleAmount, mfAlreadyUtilizedExemption]);

  // =========================================================================
  // 2. GOLD LOAN ELIGIBILITY CALCULATION (RBI 75% LTV)
  // =========================================================================
  const goldResult = useMemo(() => {
    // Purity factor: 24K = 1.0, 22K = 22/24 = 0.9167, 18K = 18/24 = 0.75, 14K = 14/24 = 0.5833
    const purityMultiplier = goldKarat / 24;
    const ratePerGramEffective = goldRatePerGram24K * purityMultiplier;
    const totalMarketValue = goldWeightGrams * ratePerGramEffective;

    // RBI LTV is capped at 75%
    const maxLoanEligibility = totalMarketValue * 0.75;
    const perGramLoanAmount = maxLoanEligibility / Math.max(1, goldWeightGrams);

    const monthlyInterestRate = goldInterestRatePa / (12 * 100);
    const months = Math.max(1, goldLoanTenureMonths);

    let monthlyPayment = 0;
    let totalInterestPayable = 0;
    let totalRepayment = 0;

    if (goldRepaymentType === 'bullet') {
      // Monthly simple interest payment, principal at end
      monthlyPayment = maxLoanEligibility * monthlyInterestRate;
      totalInterestPayable = monthlyPayment * months;
      totalRepayment = maxLoanEligibility + totalInterestPayable;
    } else {
      // Standard Reducing Balance EMI
      const P = maxLoanEligibility;
      const R = monthlyInterestRate;
      const N = months;
      monthlyPayment = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      totalRepayment = monthlyPayment * N;
      totalInterestPayable = totalRepayment - P;
    }

    return {
      purityMultiplier: (purityMultiplier * 100).toFixed(1),
      ratePerGramEffective: Math.round(ratePerGramEffective),
      totalMarketValue: Math.round(totalMarketValue),
      maxLoanEligibility: Math.round(maxLoanEligibility),
      perGramLoanAmount: Math.round(perGramLoanAmount),
      monthlyPayment: Math.round(monthlyPayment),
      totalInterestPayable: Math.round(totalInterestPayable),
      totalRepayment: Math.round(totalRepayment),
    };
  }, [goldWeightGrams, goldKarat, goldRatePerGram24K, goldLoanTenureMonths, goldInterestRatePa, goldRepaymentType]);

  // =========================================================================
  // 3. FREELANCE 44ADA TAX CALCULATION (Shared Engine: src/utils/tax44ada.ts)
  // =========================================================================
  const freelanceResult = useMemo(() => {
    return calculate44ADAComprehensive({
      grossReceipts: freelanceGrossReceipts,
      otherIncome: freelanceOtherIncome,
      regime: freelanceRegime,
      old80CDeductions: freelanceOld80CDeductions,
    });
  }, [freelanceGrossReceipts, freelanceOtherIncome, freelanceRegime, freelanceOld80CDeductions]);

  // =========================================================================
  // 4. POST OFFICE MIS CALCULATION (7.4% p.a.)
  // =========================================================================
  const pomisResult = useMemo(() => {
    const maxLimit = pomisAccountType === 'single' ? 900000 : 1500000;
    const deposit = Math.min(maxLimit, Math.max(1000, pomisDepositAmount));
    const annualInterestRate = 7.4; // 7.4% p.a.
    
    // Monthly Interest = Deposit * (7.4 / 100) / 12
    const monthlyIncome = (deposit * (annualInterestRate / 100)) / 12;
    const annualIncome = monthlyIncome * 12;
    const fiveYearTotalIncome = annualIncome * 5;
    const totalMaturityPayout = deposit + fiveYearTotalIncome;

    return {
      maxLimit,
      deposit,
      monthlyIncome: Math.round(monthlyIncome),
      annualIncome: Math.round(annualIncome),
      fiveYearTotalIncome: Math.round(fiveYearTotalIncome),
      totalMaturityPayout: Math.round(totalMaturityPayout),
    };
  }, [pomisAccountType, pomisDepositAmount]);

  return (
    <div className="space-y-8">
      {/* =========================================================================
          1. MUTUAL FUND CAPITAL GAINS TAX CALCULATOR (Budget 2024-2026)
      ========================================================================= */}
      {slug === 'mutual-fund-capital-gains-tax-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Mutual Fund Capital Gains Tax</h3>
                <p className="text-xs text-slate-400">Budget 2024-2026 updated LTCG (12.5%) & STCG (20%)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Mutual Fund Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMfFundType('equity')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      mfFundType === 'equity'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Equity Fund (&gt;65% Equity)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMfFundType('debt')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      mfFundType === 'debt'
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Debt Fund (Taxed at Slab)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Total Purchase / Invested Amount (₹)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={mfPurchaseAmount}
                    onChange={(e) => setMfPurchaseAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Total Redemption / Sale Value (₹)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={mfSaleAmount}
                    onChange={(e) => setMfSaleAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Holding Period: {mfHoldingMonths} Months ({(mfHoldingMonths / 12).toFixed(1)} Yrs)</span>
                  <span className="text-indigo-400 font-semibold">
                    {mfFundType === 'equity'
                      ? mfHoldingMonths > 12
                        ? 'Long Term (LTCG > 1 Year)'
                        : 'Short Term (STCG ≤ 1 Year)'
                      : 'Debt Fund'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="1"
                  value={mfHoldingMonths}
                  onChange={(e) => setMfHoldingMonths(Number(e.target.value))}
                  className="w-full accent-indigo-500 bg-slate-700 h-2 rounded-lg"
                />
              </div>

              {mfFundType === 'equity' && mfHoldingMonths > 12 && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    LTCG Exemption Already Claimed elsewhere this FY (₹) (Max ₹1.25L)
                  </label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    max={125000}
                    value={mfAlreadyUtilizedExemption}
                    onChange={(e) => setMfAlreadyUtilizedExemption(Math.min(125000, Number(e.target.value)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tax Assessment</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Budget 2024-2026 Compliant
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Gross Capital Gains</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{formatINR(mfResult.totalGains)}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Gain: +{mfResult.absoluteReturnPercent}%</span>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Tax Liability (Incl. 4% Cess)</span>
                  <span className="text-xl font-bold font-mono text-rose-400">{formatINR(mfResult.totalTaxLiability)}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Rate: {mfResult.taxRatePercent}%</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-emerald-300">Net Post-Tax In-Hand Value</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{formatINR(mfResult.postTaxReturns)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-300 border-t border-emerald-500/20 pt-1.5">
                  <span>Net Post-Tax Profit</span>
                  <span className="font-semibold text-emerald-400">{formatINR(mfResult.netProfitPostTax)} (+{mfResult.postTaxReturnPercent}%)</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
                {mfResult.isEquity ? (
                  mfResult.isLongTerm ? (
                    <p className="text-slate-300">
                      ✅ <strong>Equity LTCG:</strong> ₹{mfResult.exemptionAvailable.toLocaleString('en-IN')} exempted under Section 112A. Taxable portion ₹{mfResult.taxableGains.toLocaleString('en-IN')} taxed at 12.5% + 4% cess.
                    </p>
                  ) : (
                    <p className="text-slate-300">
                      ⚡ <strong>Equity STCG:</strong> Flat 20% tax on full gain under Section 111A as holding is ≤ 12 months.
                    </p>
                  )
                ) : (
                  <p className="text-slate-300">
                    🏦 <strong>Debt Fund:</strong> Taxed at marginal income tax slab rate (calculated @ 30% slab bracket).
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `Mutual Fund Tax Breakdown:\nPurchase: ${formatINR(mfPurchaseAmount)}\nRedemption: ${formatINR(mfSaleAmount)}\nCapital Gains: ${formatINR(mfResult.totalGains)}\nTax Liability: ${formatINR(mfResult.totalTaxLiability)}\nNet In-Hand: ${formatINR(mfResult.postTaxReturns)}`,
                  'mf-tax'
                )
              }
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              {copiedId === 'mf-tax' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedId === 'mf-tax' ? 'Copied Calculation!' : 'Copy Tax Summary'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. GOLD LOAN & PER GRAM ELIGIBILITY CALCULATOR
      ========================================================================= */}
      {slug === 'gold-loan-eligibility-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gold Loan Eligibility & EMI</h3>
                <p className="text-xs text-slate-400">RBI 75% LTV Cap & Per-Gram Sanction Valuation</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Net Gold Weight (Grams)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    min="1"
                    value={goldWeightGrams}
                    onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Gold Purity / Karat</label>
                  <select
                    value={goldKarat}
                    onChange={(e) => setGoldKarat(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  >
                    <option value={24}>24 Karat (99.9% Pure)</option>
                    <option value={22}>22 Karat (91.6% Hallmark)</option>
                    <option value={18}>18 Karat (75.0% Jewellery)</option>
                    <option value={14}>14 Karat (58.3% Ornaments)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Current 24K Gold Market Rate (₹/Gram)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={goldRatePerGram24K}
                  onChange={(e) => setGoldRatePerGram24K(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Interest Rate (% p.a.)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    step="0.1"
                    value={goldInterestRatePa}
                    onChange={(e) => setGoldInterestRatePa(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Tenure (Months)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    min="1"
                    max="36"
                    value={goldLoanTenureMonths}
                    onChange={(e) => setGoldLoanTenureMonths(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Repayment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGoldRepaymentType('bullet')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      goldRepaymentType === 'bullet'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Monthly Interest (Bullet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoldRepaymentType('emi')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      goldRepaymentType === 'emi'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Regular Monthly EMI
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sanction Valuation</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  RBI 75% LTV Cap
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Max Loan Eligibility</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">{formatINR(goldResult.maxLoanEligibility)}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">75% of Gold Value</span>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Loan Per Gram</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">{formatINR(goldResult.perGramLoanAmount)}/g</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">For {goldKarat}K Gold</span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Total Gold Market Value</span>
                  <span className="font-semibold text-white">{formatINR(goldResult.totalMarketValue)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{goldRepaymentType === 'bullet' ? 'Monthly Interest Outflow' : 'Monthly Loan EMI'}</span>
                  <span className="font-semibold text-amber-400">{formatINR(goldResult.monthlyPayment)}/mo</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Interest Cost ({goldLoanTenureMonths} mo)</span>
                  <span className="font-semibold text-rose-400">{formatINR(goldResult.totalInterestPayable)}</span>
                </div>
                <div className="flex justify-between text-slate-300 border-t border-slate-700 pt-1.5 font-bold">
                  <span>Total Repayment Amount</span>
                  <span className="text-white">{formatINR(goldResult.totalRepayment)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `Gold Loan Summary:\nGold Weight: ${goldWeightGrams}g (${goldKarat}K)\nMarket Value: ${formatINR(goldResult.totalMarketValue)}\nMax Loan Sanction (75% LTV): ${formatINR(goldResult.maxLoanEligibility)}\nLoan Per Gram: ${formatINR(goldResult.perGramLoanAmount)}/g\nMonthly Payment: ${formatINR(goldResult.monthlyPayment)}`,
                  'gold-loan'
                )
              }
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              {copiedId === 'gold-loan' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedId === 'gold-loan' ? 'Copied Calculation!' : 'Copy Gold Loan Quote'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. FREELANCE & TECH CONSULTANT 44ADA TAX CALCULATOR
      ========================================================================= */}
      {slug === 'section-44ada-freelance-tax-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Freelance & Consultant 44ADA Tax</h3>
                <p className="text-xs text-slate-400">Section 44ADA 50% Deemed Profit Scheme (Up to ₹75 Lakhs)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Profession / Nature of Service</label>
                <select
                  value={freelanceProfession}
                  onChange={(e) => setFreelanceProfession(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium"
                >
                  <option value="Software & Tech Consultant">Software Developer / Tech Consultant / UI-UX</option>
                  <option value="Doctors & Medical Practitioners">Doctor / Medical Practitioner</option>
                  <option value="Chartered Accountants & Legal">Lawyer / CA / Financial Auditor</option>
                  <option value="Architects & Engineers">Architect / Interior Decorator / Engineer</option>
                  <option value="Other Specified Professional">Author / Freelance Designer / Content Creator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Gross Annual Receipts / Invoiced Amount (₹) (Max ₹75L)
                </label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={freelanceGrossReceipts}
                  onChange={(e) => setFreelanceGrossReceipts(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Tax Regime Selection</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFreelanceRegime('new')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      freelanceRegime === 'new'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    New Tax Regime (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFreelanceRegime('old')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      freelanceRegime === 'old'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Old Regime (With 80C/80D)
                  </button>
                </div>
              </div>

              {freelanceRegime === 'old' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Section 80C / 80D Deductions (₹) (PPF, ELSS, Insurance)
                  </label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={freelanceOld80CDeductions}
                    onChange={(e) => setFreelanceOld80CDeductions(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">44ADA Presumptive Tax</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  No Audit / No Books Required
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">50% Deemed Profit</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{formatINR(freelanceResult.deemedProfit)}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">50% Flat Deduction</span>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Annual Tax Liability</span>
                  <span className="text-xl font-bold font-mono text-rose-400">{formatINR(freelanceResult.chosenTax)}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Eff. Rate: {freelanceResult.effectiveTaxRate}%</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-medium text-emerald-300 block">Net In-Hand Post Tax</span>
                  <span className="text-xs text-slate-400">From ₹{freelanceResult.gross.toLocaleString('en-IN')} gross</span>
                </div>
                <span className="text-xl font-bold font-mono text-emerald-400">{formatINR(freelanceResult.netTakeHome)}</span>
              </div>

              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Quarterly Advance Tax Schedule:</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>15% by 15 June: <strong>{formatINR(freelanceResult.advTax1)}</strong></div>
                  <div>45% by 15 Sept: <strong>{formatINR(freelanceResult.advTax2)}</strong></div>
                  <div>75% by 15 Dec: <strong>{formatINR(freelanceResult.advTax3)}</strong></div>
                  <div>100% by 15 March: <strong>{formatINR(freelanceResult.advTax4)}</strong></div>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `Section 44ADA Tax Summary:\nGross Receipts: ${formatINR(freelanceResult.gross)}\n50% Deemed Taxable Profit: ${formatINR(freelanceResult.deemedProfit)}\nEstimated Tax Liability: ${formatINR(freelanceResult.chosenTax)}\nEffective Tax Rate: ${freelanceResult.effectiveTaxRate}%\nNet Post-Tax Income: ${formatINR(freelanceResult.netTakeHome)}`,
                  'freelance-tax'
                )
              }
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              {copiedId === 'freelance-tax' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedId === 'freelance-tax' ? 'Copied Calculation!' : 'Copy 44ADA Tax Summary'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. POST OFFICE MONTHLY INCOME SCHEME (MIS) CALCULATOR
      ========================================================================= */}
      {slug === 'post-office-mis-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Post Office MIS Calculator</h3>
                <p className="text-xs text-slate-400">Guaranteed 7.4% p.a. Monthly Regular Income Scheme</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Holding Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPomisAccountType('single');
                      if (pomisDepositAmount > 900000) setPomisDepositAmount(900000);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      pomisAccountType === 'single'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Single Account (Max ₹9 Lakh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPomisAccountType('joint')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      pomisAccountType === 'joint'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Joint Account (Max ₹15 Lakh)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Deposit Amount: {formatINR(pomisDepositAmount)}</span>
                  <span className="text-emerald-400 font-semibold">Max {formatINR(pomisResult.maxLimit)}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max={pomisResult.maxLimit}
                  step="10000"
                  value={pomisDepositAmount}
                  onChange={(e) => setPomisDepositAmount(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg"
                />
              </div>

              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Current Sovereign Interest Rate:</span>
                  <span className="font-bold text-emerald-400">7.4% p.a. (Fixed for 5 Yrs)</span>
                </div>
                <div className="flex justify-between">
                  <span>Tenure / Lock-in:</span>
                  <span className="font-bold text-white">5 Years (60 Months)</span>
                </div>
                <div className="flex justify-between">
                  <span>Sovereign Safety:</span>
                  <span className="font-bold text-emerald-400">100% Govt of India Backed</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Guaranteed Monthly Payout</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Direct Bank Credit
                </span>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                <span className="text-xs text-emerald-300 font-medium">Guaranteed Monthly Pension/Income</span>
                <div className="text-4xl font-extrabold font-mono text-emerald-400">
                  {formatINR(pomisResult.monthlyIncome)}
                </div>
                <span className="text-[11px] text-slate-400 block pt-1">Directly credited to your savings account every month</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Annual Income (12 Mos)</span>
                  <span className="text-lg font-bold font-mono text-white">{formatINR(pomisResult.annualIncome)}</span>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">5-Year Total Interest</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{formatINR(pomisResult.fiveYearTotalIncome)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700 text-xs text-slate-300 flex justify-between items-center">
                <span>Principal Refund at Maturity (After 5 Years):</span>
                <strong className="text-white">{formatINR(pomisResult.deposit)}</strong>
              </div>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `Post Office MIS Payout Summary:\nDeposit Amount: ${formatINR(pomisResult.deposit)}\nInterest Rate: 7.4% p.a.\nGuaranteed Monthly Income: ${formatINR(pomisResult.monthlyIncome)}/month\n5-Year Total Earnings: ${formatINR(pomisResult.fiveYearTotalIncome)}\nPrincipal Returned: ${formatINR(pomisResult.deposit)}`,
                  'pomis-quote'
                )
              }
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              {copiedId === 'pomis-quote' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedId === 'pomis-quote' ? 'Copied Calculation!' : 'Copy Monthly Income Breakdown'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
