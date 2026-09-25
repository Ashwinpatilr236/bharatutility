import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Calculator, IndianRupee, TrendingDown, Clock, Info, Check, Copy } from 'lucide-react';

interface Props {
  tool: Tool;
  onResultChange?: (result: string) => void;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const HomeLoanPrepaymentTenureCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [loanPrincipal, setLoanPrincipal] = useState<number>(4000000);
  const [loanRate, setLoanRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  const [lumpSumPrepay, setLumpSumPrepay] = useState<number>(200000);
  const [yearlyPrepay, setYearlyPrepay] = useState<number>(50000);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    originalEmi,
    originalTotalInterest,
    totalInterestWithPrepay,
    interestSaved,
    monthsSaved,
    yearsSaved,
    originalTotalMonths
  } = useMemo(() => {
    const principal = loanPrincipal || 0;
    const rate = loanRate || 0;
    const years = loanTenureYears || 0;
    
    if (principal <= 0 || rate <= 0 || years <= 0) {
      return {
        originalEmi: 0, originalTotalInterest: 0, totalInterestWithPrepay: 0,
        interestSaved: 0, monthsSaved: 0, yearsSaved: "0.0", originalTotalMonths: 0
      };
    }

    const monthlyRate = rate / 12 / 100;
    const totalMonths = years * 12;
    const origEmi = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
    const origTotalInterest = origEmi * totalMonths - principal;

    let balance = principal;
    let monthsPaid = 0;
    let interestWithPrepay = 0;

    const lump = lumpSumPrepay || 0;
    const yearly = yearlyPrepay || 0;

    while (balance > 0 && monthsPaid < 360) { // Safety break at 30 years
      monthsPaid++;
      const interestForMonth = balance * monthlyRate;
      interestWithPrepay += interestForMonth;
      const principalForMonth = origEmi - interestForMonth;
      balance -= principalForMonth;

      if (monthsPaid === 12) balance -= lump;
      if (monthsPaid % 12 === 0 && monthsPaid > 12) balance -= yearly;
    }

    const savedInterest = Math.max(0, Math.round(origTotalInterest - interestWithPrepay));
    const savedMonths = Math.max(0, totalMonths - monthsPaid);
    const savedYears = (savedMonths / 12).toFixed(1);

    if (onResultChange) {
        onResultChange(`Saved ${formatINR(savedInterest)} & ${savedYears} years`);
    }

    return {
      originalEmi: origEmi,
      originalTotalInterest: origTotalInterest,
      totalInterestWithPrepay: Math.round(interestWithPrepay),
      interestSaved: savedInterest,
      monthsSaved: savedMonths,
      yearsSaved: savedYears,
      originalTotalMonths: totalMonths
    };
  }, [loanPrincipal, loanRate, loanTenureYears, lumpSumPrepay, yearlyPrepay]);

  const handleCopy = () => {
    const text = `Home Loan Prepayment Savings:
Loan Amount: ${formatINR(loanPrincipal)}
Interest Rate: ${loanRate}%
Original Tenure: ${loanTenureYears} Years

Prepayment:
Lump Sum (Month 12): ${formatINR(lumpSumPrepay)}
Yearly Extra (After Yr 1): ${formatINR(yearlyPrepay)}

Results:
Original Total Interest: ${formatINR(originalTotalInterest)}
Interest Saved: ${formatINR(interestSaved)}
Tenure Reduced By: ${yearsSaved} Years

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Calculator className="w-6 h-6 text-emerald-600" />
          Home Loan Prepayment & Tenure Reduction Simulator
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Discover how paying lump sum or an annual extra amount can save you lakhs in bank interest and cut your loan tenure by years.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Outstanding Loan Principal (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={loanRate}
                    onChange={(e) => setLoanRate(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">%</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Tenure (Years)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="pt-2">
                <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <p>Your current EMI is <strong>{formatINR(originalEmi)}</strong>. This EMI will remain constant in the simulation, while the prepayment reduces the principal faster.</p>
                </div>
            </div>
          </div>

          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-4">
            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" /> Prepayment Strategy
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    One-time Lump Sum (Month 12)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                    <input
                    type="number"
                    inputMode="numeric"
                    value={lumpSumPrepay}
                    onChange={(e) => setLumpSumPrepay(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-emerald-700 dark:text-emerald-300"
                    />
                </div>
                </div>
                <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Yearly Extra Prepay
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                    <input
                    type="number"
                    inputMode="numeric"
                    value={yearlyPrepay}
                    onChange={(e) => setYearlyPrepay(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-emerald-700 dark:text-emerald-300"
                    />
                </div>
                </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full">
          <div className="flex-grow p-6 sm:p-8 bg-emerald-600 dark:bg-emerald-800 rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-center">
            {/* Background Decoration */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 text-center space-y-6">
              <div>
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-2">Total Interest Saved</p>
                <h3 className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight">
                  {formatINR(interestSaved)}
                </h3>
              </div>
              
              <div className="h-px w-16 bg-emerald-400/50 mx-auto"></div>

              <div>
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-2">Loan Tenure Reduced By</p>
                <div className="inline-flex items-center gap-2 bg-emerald-500/30 px-4 py-2 rounded-full border border-emerald-400/50">
                    <Clock className="w-5 h-5 text-emerald-100" />
                    <h3 className="text-2xl font-bold tabular-nums">
                        {yearsSaved} <span className="text-lg font-medium opacity-90">Years</span>
                    </h3>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Original Total Interest</p>
                  <p className="font-bold text-neutral-900 dark:text-white tabular-nums">{formatINR(originalTotalInterest)}</p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-xl border border-neutral-100 dark:border-neutral-700">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">New Total Interest</p>
                  <p className="font-bold text-neutral-900 dark:text-white tabular-nums">{formatINR(totalInterestWithPrepay)}</p>
              </div>
          </div>

          <button
            onClick={handleCopy}
            className="mt-4 w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Results Copied!' : 'Copy Prepayment Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};
