import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatIndianCompact, numberToIndianWords } from '../../utils/formatters';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { QuickAmountChips } from '../common/QuickAmountChips';
import { triggerHapticFeedback } from '../../utils/haptics';

interface FdCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const FdCalculator: React.FC<FdCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [principal, setPrincipal] = useState<number>(() => {
    return currentToolParams?.amount ? Number(currentToolParams.amount) : 500000;
  });
  const [interestRate, setInterestRate] = useState<number>(() => {
    return currentToolParams?.rate ? Number(currentToolParams.rate) : 7.1;
  });
  const [tenureYears, setTenureYears] = useState<number>(3);
  const [tenureMonths, setTenureMonths] = useState<number>(0);
  const [compounding, setCompounding] = useState<number>(4); // 4 = Quarterly
  const [isSeniorCitizen, setIsSeniorCitizen] = useState<boolean>(false);

  // Senior citizen +0.50% rate
  const effectiveRate = interestRate + (isSeniorCitizen ? 0.5 : 0);
  const totalTenureInYears = tenureYears + tenureMonths / 12;

  let maturityAmount = 0;
  let totalInterest = 0;

  if (principal > 0 && effectiveRate > 0 && totalTenureInYears > 0) {
    const rateDecimal = effectiveRate / 100;
    const n = compounding;
    maturityAmount = Math.round(principal * Math.pow(1 + rateDecimal / n, n * totalTenureInYears));
    totalInterest = Math.max(0, maturityAmount - principal);
  }

  useEffect(() => {
    if (onResultChange && maturityAmount > 0) {
      const summary = `FD Maturity: ${formatINR(maturityAmount)} | Interest: ${formatIndianCompact(totalInterest)} for ${formatIndianCompact(principal)} at ${effectiveRate}%`;
      onResultChange(summary, { amount: principal, rate: effectiveRate, tenure: totalTenureInYears });
    }
  }, [principal, effectiveRate, totalTenureInYears, compounding, maturityAmount]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              Deposit Parameters
            </h3>
            <button
              onClick={() => {
                triggerHapticFeedback('light');
                setPrincipal(500000);
                setInterestRate(7.1);
                setTenureYears(3);
                setIsSeniorCitizen(false);
              }}
              className="text-xs text-neutral-400 hover:text-accent font-medium flex items-center gap-1 active:scale-95 transition-transform"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* 1. Total Deposit Principal */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="fd-principal-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Total Fixed Deposit Amount
              </label>
              <span className="text-xs font-mono text-neutral-400">
                {numberToIndianWords(principal)}
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 font-bold">₹</span>
              <input
                id="fd-principal-input"
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="5000"
                max="50000000"
                step="5000"
                value={principal || ''}
                onChange={e => {
                  setPrincipal(Math.max(0, Number(e.target.value)));
                }}
                className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <input
              type="range"
              min="10000"
              max="5000000"
              step="10000"
              value={principal}
              onChange={e => {
                setPrincipal(Number(e.target.value));
              }}
              aria-label="FD Amount Slider"
              className="w-full accent-indigo-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />

            <QuickAmountChips
              currentValue={principal}
              onChange={val => setPrincipal(val)}
              chips={[
                { label: '+₹25K', value: 25000 },
                { label: '+₹50K', value: 50000 },
                { label: '+₹1L', value: 100000 },
                { label: '+₹5L', value: 500000 },
                { label: '+₹10L', value: 1000000 },
              ]}
              resetValue={500000}
            />
          </div>

          {/* 2. Interest Rate & Senior Citizen Checkbox */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="fd-interest-rate-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Rate of Interest (% p.a.)
              </label>
              <span className="text-xs text-neutral-400">
                Effective: {effectiveRate.toFixed(2)}%
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="fd-interest-rate-input"
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="1"
                max="15"
                step="0.05"
                value={interestRate || ''}
                onChange={e => setInterestRate(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 pr-8 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <span className="absolute right-3.5 text-neutral-400 font-bold">%</span>
            </div>

            <label htmlFor="senior-citizen-checkbox" className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 cursor-pointer">
              <input
                id="senior-citizen-checkbox"
                type="checkbox"
                checked={isSeniorCitizen}
                onChange={e => setIsSeniorCitizen(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">
                  Senior Citizen Special Rate (+0.50% extra)
                </span>
                <span className="text-[11px] text-amber-700/80 dark:text-amber-400">
                  Applicable for age 60+ in all Indian banks
                </span>
              </div>
            </label>
          </div>

          {/* 3. Tenure & Compounding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="fd-tenure-years-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Tenure (Years)
              </label>
              <input
                id="fd-tenure-years-input"
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="0"
                max="10"
                value={tenureYears}
                onChange={e => setTenureYears(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fd-compounding-frequency-select" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Compounding Frequency
              </label>
              <select
                id="fd-compounding-frequency-select"
                value={compounding}
                onChange={e => setCompounding(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white outline-none"
              >
                <option value={4}>Quarterly (Indian Standard)</option>
                <option value={12}>Monthly Payout</option>
                <option value={2}>Half-Yearly</option>
                <option value={1}>Annually</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Outputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
              Maturity Payout Value
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
              {formatINR(maturityAmount)}
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              ({formatIndianCompact(maturityAmount)}) after {tenureYears} Years at {effectiveRate.toFixed(2)}%
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Principal Deposited
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-white mt-0.5 block">
                  {formatINR(principal)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Total Interest Earned
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                  +{formatINR(totalInterest)}
                </span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm text-xs text-neutral-500 space-y-2">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>DICGC Insurance Guarantee</span>
            </div>
            <p className="leading-relaxed">
              In India, bank deposits including principal and accrued interest are insured up to ₹5,00,000 per depositor per bank by the RBI's DICGC subsidiary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
