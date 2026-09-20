import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatIndianCompact, numberToIndianWords } from '../../utils/formatters';
import { RefreshCw, Building2, HelpCircle } from 'lucide-react';
import { QuickAmountChips } from '../common/QuickAmountChips';
import { triggerHapticFeedback } from '../../utils/haptics';

interface SalaryCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const SalaryCalculator: React.FC<SalaryCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [annualCtc, setAnnualCtc] = useState<number>(() => {
    return currentToolParams?.ctc ? Number(currentToolParams.ctc) : 1200000;
  });
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new');
  const [bonusPercentage, setBonusPercentage] = useState<number>(0);
  const [includeEpf, setIncludeEpf] = useState<boolean>(true);
  const [includeProfTax, setIncludeProfTax] = useState<boolean>(true);

  // Calculations
  const grossAnnual = annualCtc * (1 - bonusPercentage / 100);
  const monthlyGross = Math.round(grossAnnual / 12);

  // Standard salary breakdown approximations in Indian corporate
  const basicAnnual = grossAnnual * 0.45; // 45% basic
  const hraAnnual = basicAnnual * 0.40; // 40% HRA
  const specialAllowanceAnnual = Math.max(0, grossAnnual - basicAnnual - hraAnnual);

  // Monthly breakdown
  const monthlyBasic = Math.round(basicAnnual / 12);
  const monthlyHra = Math.round(hraAnnual / 12);
  const monthlySpecial = Math.round(specialAllowanceAnnual / 12);

  // Employee EPF (12% of Basic, standard limit or actual)
  const monthlyEpf = includeEpf ? Math.round(Math.min(monthlyBasic, 15000) * 0.12) : 0;
  const annualEpf = monthlyEpf * 12;

  // Professional Tax (Standard ₹2,400/yr in states like Maharashtra, Karnataka, Telangana)
  const monthlyProfTax = includeProfTax ? 200 : 0;
  const annualProfTax = monthlyProfTax * 12;

  // Standard Deduction (₹75,000 for New Tax Regime; ₹50,000 for Old Tax Regime)
  const standardDeduction = taxRegime === 'new' ? 75000 : 50000;

  // Taxable Income Calculation
  let taxableIncome = Math.max(0, grossAnnual - standardDeduction - (taxRegime === 'old' ? annualEpf + annualProfTax : 0));

  // Income Tax Computation (New Tax Regime FY 2024-25 / FY 2025-26)
  let annualIncomeTax = 0;

  if (taxRegime === 'new') {
    if (taxableIncome <= 700000) {
      annualIncomeTax = 0;
    } else {
      let tax = 0;
      if (taxableIncome > 300000) {
        tax += Math.min(taxableIncome - 300000, 400000) * 0.05;
      }
      if (taxableIncome > 700000) {
        tax += Math.min(taxableIncome - 700000, 300000) * 0.10;
      }
      if (taxableIncome > 1000000) {
        tax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
      }
      if (taxableIncome > 1200000) {
        tax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
      }
      if (taxableIncome > 1500000) {
        tax += (taxableIncome - 1500000) * 0.30;
      }
      // Add 4% Health & Education Cess
      annualIncomeTax = Math.round(tax * 1.04);
    }
  } else {
    if (taxableIncome <= 500000) {
      annualIncomeTax = 0;
    } else {
      let tax = 0;
      if (taxableIncome > 250000) {
        tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
      }
      if (taxableIncome > 500000) {
        tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
      }
      if (taxableIncome > 1000000) {
        tax += (taxableIncome - 1000000) * 0.30;
      }
      annualIncomeTax = Math.round(tax * 1.04);
    }
  }

  const monthlyTdsTax = Math.round(annualIncomeTax / 12);
  const totalMonthlyDeductions = monthlyTdsTax + monthlyEpf + monthlyProfTax;
  const monthlyInHand = Math.max(0, monthlyGross - totalMonthlyDeductions);
  const annualInHand = monthlyInHand * 12;

  useEffect(() => {
    if (onResultChange && monthlyInHand > 0) {
      const summary = `In-Hand: ${formatINR(monthlyInHand)}/mo (${formatIndianCompact(annualInHand)}/yr) from CTC of ${formatIndianCompact(annualCtc)}`;
      onResultChange(summary, { ctc: annualCtc, regime: taxRegime });
    }
  }, [annualCtc, taxRegime, bonusPercentage, monthlyInHand]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          {/* Header & Regime Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
                Annual CTC & Tax Settings
              </h3>
              <span className="text-xs text-neutral-400">
                Standard Deduction: {formatINR(standardDeduction)} included
              </span>
            </div>

            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  triggerHapticFeedback('light');
                  setTaxRegime('new');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  taxRegime === 'new'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                New Regime (Default)
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('light');
                  setTaxRegime('old');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  taxRegime === 'old'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Old Regime
              </button>
            </div>
          </div>

          {/* 1. Annual CTC Input */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="annual-ctc-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Annual CTC (Cost to Company)
              </label>
              <span className="text-xs font-mono text-neutral-400">
                {numberToIndianWords(annualCtc)}
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 font-bold">₹</span>
              <input
                id="annual-ctc-input"
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="100000"
                max="100000000"
                step="50000"
                value={annualCtc || ''}
                onChange={e => setAnnualCtc(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <input
              type="range"
              min="300000"
              max="5000000"
              step="50000"
              value={annualCtc}
              onChange={e => setAnnualCtc(Number(e.target.value))}
              aria-label="Annual CTC Slider"
              className="w-full accent-indigo-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />

            <QuickAmountChips
              currentValue={annualCtc}
              onChange={val => setAnnualCtc(val)}
              chips={[
                { label: '+₹1L', value: 100000 },
                { label: '+₹2L', value: 200000 },
                { label: '+₹5L', value: 500000 },
                { label: '+₹10L', value: 1000000 },
                { label: '+₹25L', value: 2500000 },
              ]}
              resetValue={1200000}
            />
          </div>

          {/* 2. Optional Deductions Toggles */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Salary Component Adjustments
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label htmlFor="include-epf-checkbox" className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  id="include-epf-checkbox"
                  type="checkbox"
                  checked={includeEpf}
                  onChange={e => setIncludeEpf(e.target.checked)}
                  className="rounded text-accent focus:ring-accent accent-indigo-600 cursor-pointer"
                />
                <div>
                  <span className="font-semibold block text-neutral-800 dark:text-neutral-200">
                    Deduct EPF (12%)
                  </span>
                  <span className="text-[11px] text-neutral-400">Employee Provident Fund</span>
                </div>
              </label>

              <label htmlFor="include-prof-tax-checkbox" className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                <input
                  id="include-prof-tax-checkbox"
                  type="checkbox"
                  checked={includeProfTax}
                  onChange={e => setIncludeProfTax(e.target.checked)}
                  className="rounded text-accent focus:ring-accent accent-indigo-600 cursor-pointer"
                />
                <div>
                  <span className="font-semibold block text-neutral-800 dark:text-neutral-200">
                    Professional Tax (PT)
                  </span>
                  <span className="text-[11px] text-neutral-400">₹200/month standard</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Outputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Take Home Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Estimated Monthly In-Hand Salary
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
              {formatINR(monthlyInHand)}
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              Take-home pay deposited directly in bank ({formatIndianCompact(annualInHand)} / year)
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Monthly Gross Salary
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-white mt-0.5 block">
                  {formatINR(monthlyGross)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Total Deductions
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-rose-400 mt-0.5 block">
                  -{formatINR(totalMonthlyDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Payslip Breakdown Table */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Monthly Salary Slip Breakdown
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400 font-sans">Basic Salary (45%)</span>
                <span className="font-semibold">{formatINR(monthlyBasic)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400 font-sans">HRA (House Rent)</span>
                <span className="font-semibold">{formatINR(monthlyHra)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400 font-sans">Special / Other Allowances</span>
                <span className="font-semibold">{formatINR(monthlySpecial)}</span>
              </div>
              <div className="flex justify-between py-1 text-rose-500 border-b border-neutral-100 dark:border-neutral-800">
                <span className="font-sans">Income Tax / TDS (monthly)</span>
                <span className="font-semibold">-{formatINR(monthlyTdsTax)}</span>
              </div>
              {includeEpf && (
                <div className="flex justify-between py-1 text-rose-500 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-sans">EPF Employee Contribution</span>
                  <span className="font-semibold">-{formatINR(monthlyEpf)}</span>
                </div>
              )}
              {includeProfTax && (
                <div className="flex justify-between py-1 text-rose-500 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-sans">Professional Tax (PT)</span>
                  <span className="font-semibold">-{formatINR(monthlyProfTax)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm font-sans">
                <span>Net Monthly In-Hand</span>
                <span className="font-mono">{formatINR(monthlyInHand)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
