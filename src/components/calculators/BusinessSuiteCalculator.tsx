import React, { useState, useEffect } from 'react';
import { formatINR, formatIndianNumber } from '../../utils/formatters';
import { Briefcase, TrendingUp, DollarSign, Percent, Calculator, Check, ArrowRight } from 'lucide-react';

export type BusinessMode = 'margin' | 'breakeven' | 'commission' | 'salary-cost' | 'business-loan';

interface BusinessSuiteCalculatorProps {
  initialMode?: BusinessMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const BusinessSuiteCalculator: React.FC<BusinessSuiteCalculatorProps> = ({
  initialMode = 'margin',
  onResultChange,
}) => {
  const [mode, setMode] = useState<BusinessMode>(initialMode);

  // Profit Margin State
  const [costPrice, setCostPrice] = useState<number>(5000);
  const [sellingPrice, setSellingPrice] = useState<number>(7500);

  // Break-even State
  const [fixedCosts, setFixedCosts] = useState<number>(50000);
  const [pricePerUnit, setPricePerUnit] = useState<number>(1000);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<number>(600);

  // Commission State
  const [salesAmount, setSalesAmount] = useState<number>(100000);
  const [commissionRate, setCommissionRate] = useState<number>(5);

  // Salary Cost (CTC)
  const [monthlyGross, setMonthlyGross] = useState<number>(50000);
  const [employerPfBonusPercent, setEmployerPfBonusPercent] = useState<number>(12);

  // Business Loan
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(14);
  const [tenureYears, setTenureYears] = useState<number>(3);

  // Calculations
  const profit = Math.max(0, sellingPrice - costPrice);
  const profitMargin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(2) : '0';
  const markup = costPrice > 0 ? (((sellingPrice - costPrice) / costPrice) * 100).toFixed(2) : '0';

  const contributionMargin = Math.max(0, pricePerUnit - variableCostPerUnit);
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * pricePerUnit;

  const commissionEarned = (salesAmount * commissionRate) / 100;

  const annualGross = monthlyGross * 12;
  const employerBenefits = (annualGross * employerPfBonusPercent) / 100;
  const totalCTC = annualGross + employerBenefits;

  const monthlyRate = interestRate / 12 / 100;
  const totalMonths = tenureYears * 12;
  const emi =
    monthlyRate > 0 && totalMonths > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : loanAmount / (totalMonths || 1);
  const totalRepayment = emi * totalMonths;
  const totalInterest = totalRepayment - loanAmount;

  useEffect(() => {
    if (!onResultChange) return;

    if (mode === 'margin') {
      onResultChange(`Profit: ${formatINR(profit)} | Margin: ${profitMargin}% | Markup: ${markup}%`, {
        costPrice,
        sellingPrice,
        profit,
      });
    } else if (mode === 'breakeven') {
      onResultChange(`Break-even: ${breakEvenUnits} Units (${formatINR(breakEvenRevenue)})`, {
        fixedCosts,
        breakEvenUnits,
      });
    } else if (mode === 'commission') {
      onResultChange(`Commission: ${formatINR(commissionEarned)} @ ${commissionRate}% on ${formatINR(salesAmount)}`, {
        salesAmount,
        commissionEarned,
      });
    } else if (mode === 'salary-cost') {
      onResultChange(`Total Employer CTC: ${formatINR(totalCTC)}/yr (Gross: ${formatINR(annualGross)}/yr)`, {
        monthlyGross,
        totalCTC,
      });
    } else if (mode === 'business-loan') {
      onResultChange(`Monthly EMI: ${formatINR(emi)} | Total Interest: ${formatINR(totalInterest)}`, {
        loanAmount,
        emi,
      });
    }
  }, [
    mode,
    costPrice,
    sellingPrice,
    fixedCosts,
    pricePerUnit,
    variableCostPerUnit,
    salesAmount,
    commissionRate,
    monthlyGross,
    employerPfBonusPercent,
    loanAmount,
    interestRate,
    tenureYears,
  ]);

  return (
    <div className="w-full space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { id: 'margin', label: 'Profit Margin' },
          { id: 'breakeven', label: 'Break-Even Analysis' },
          { id: 'commission', label: 'Sales Commission' },
          { id: 'salary-cost', label: 'Employer CTC Cost' },
          { id: 'business-loan', label: 'Business Loan EMI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as BusinessMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              mode === tab.id
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'margin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Cost Price (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={costPrice || ''}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Selling Price (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={sellingPrice || ''}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Margin Breakdown</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Net Profit per Unit:</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(profit)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Profit Margin:</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{profitMargin}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Markup on Cost:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{markup}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'breakeven' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Fixed Costs (₹/Month)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={fixedCosts || ''}
                onChange={(e) => setFixedCosts(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Selling Price Per Unit (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={pricePerUnit || ''}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Variable Cost Per Unit (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={variableCostPerUnit || ''}
                onChange={(e) => setVariableCostPerUnit(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Break-Even Point</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Contribution per Unit:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatINR(contributionMargin)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Units to Break Even:</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{breakEvenUnits} Units</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Required Revenue:</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{formatINR(breakEvenRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'commission' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Sales Volume (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={salesAmount || ''}
                onChange={(e) => setSalesAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Commission Rate (%)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={commissionRate || ''}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Commission Payout</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Commission Earned:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatINR(commissionEarned)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Net Retained Sales:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatINR(salesAmount - commissionEarned)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'salary-cost' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Monthly Gross Pay (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={monthlyGross || ''}
                onChange={(e) => setMonthlyGross(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Employer PF / Gratuity / Insurance (%)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={employerPfBonusPercent || ''}
                onChange={(e) => setEmployerPfBonusPercent(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Employer Annual Cost</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Annual Gross Salary:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatINR(annualGross)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Employer Contributions:</span>
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{formatINR(employerBenefits)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Total Annual CTC:</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(totalCTC)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'business-loan' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Loan Amount (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={loanAmount || ''}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={interestRate || ''}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Tenure (Years)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={tenureYears || ''}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Loan Schedule</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Monthly EMI:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(emi)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Interest:</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatINR(totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Payable:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatINR(totalRepayment)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
