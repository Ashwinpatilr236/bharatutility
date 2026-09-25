import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { IndianRupee, FileText, AlertCircle, Scale, Building2, Check, Copy, Info } from 'lucide-react';

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

export const IncomeTaxCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [grossSalary, setGrossSalary] = useState<number>(1200000);
  const [hraExemption, setHraExemption] = useState<number>(0);
  const [ltaExemption, setLtaExemption] = useState<number>(0);
  const [deduction80C, setDeduction80C] = useState<number>(150000);
  const [deduction80D, setDeduction80D] = useState<number>(25000);
  const [deduction80CCD1B, setDeduction80CCD1B] = useState<number>(50000);
  const [homeLoanInterest, setHomeLoanInterest] = useState<number>(200000);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);
  
  const [copied, setCopied] = useState<boolean>(false);

  const stdDeductionOld = 50000;
  const stdDeductionNew = 75000; // FY 2024-25 / 2025-26 Budget Update

  const calculateOldRegimeTax = (taxableIncome: number) => {
    let tax = 0;
    if (taxableIncome <= 250000) return 0;
    
    // Rebate 87A up to 5 Lakhs
    if (taxableIncome <= 500000) return 0;

    if (taxableIncome > 250000) tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
    if (taxableIncome > 500000) tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
    if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;

    return tax + (tax * 0.04); // 4% Health & Education Cess
  };

  const calculateNewRegimeTax = (taxableIncome: number) => {
    let tax = 0;
    if (taxableIncome <= 300000) return 0;
    
    // Rebate 87A up to 7 Lakhs (Effectively tax is 0 if income <= 7,00,000)
    if (taxableIncome <= 700000) return 0;

    // Slabs for New Regime
    if (taxableIncome > 300000) tax += Math.min(taxableIncome - 300000, 300000) * 0.05; // 3-6L
    if (taxableIncome > 600000) tax += Math.min(taxableIncome - 600000, 300000) * 0.10; // 6-9L
    if (taxableIncome > 900000) tax += Math.min(taxableIncome - 900000, 300000) * 0.15; // 9-12L
    if (taxableIncome > 1200000) tax += Math.min(taxableIncome - 1200000, 300000) * 0.20; // 12-15L
    if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30; // >15L

    return tax + (tax * 0.04);
  };

  const {
    oldTaxable,
    newTaxable,
    oldTax,
    newTax,
    recommended,
    savings
  } = useMemo(() => {
    // OLD REGIME (Allows all deductions & exemptions)
    const oldDeductions = stdDeductionOld + hraExemption + ltaExemption + Math.min(deduction80C, 150000) + Math.min(deduction80D, 100000) + Math.min(deduction80CCD1B, 50000) + Math.min(homeLoanInterest, 200000) + otherDeductions;
    const oldTaxable = Math.max(0, grossSalary - oldDeductions);
    const oldTax = calculateOldRegimeTax(oldTaxable);

    // NEW REGIME (Only standard deduction allowed for salaried)
    const newTaxable = Math.max(0, grossSalary - stdDeductionNew);
    const newTax = calculateNewRegimeTax(newTaxable);

    const isOldBetter = oldTax < newTax;
    const savings = Math.abs(oldTax - newTax);

    return {
      oldTaxable,
      newTaxable,
      oldTax,
      newTax,
      recommended: isOldBetter ? 'Old Tax Regime' : 'New Tax Regime',
      savings
    };
  }, [grossSalary, hraExemption, ltaExemption, deduction80C, deduction80D, deduction80CCD1B, homeLoanInterest, otherDeductions]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Recommended: ${recommended} | Tax: ${formatINR(Math.min(oldTax, newTax))}`);
    }
  }, [recommended, oldTax, newTax, onResultChange]);

  const copyToClipboard = () => {
    const text = `📊 Income Tax Comparison (FY 2026-27)
- Gross Salary: ${formatINR(grossSalary)}
- Recommended: ${recommended} (Save ${formatINR(savings)})

🏢 OLD REGIME:
- Taxable Income: ${formatINR(oldTaxable)}
- Total Tax Payable: ${formatINR(oldTax)}

✨ NEW REGIME:
- Taxable Income: ${formatINR(newTaxable)}
- Total Tax Payable: ${formatINR(newTax)}

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Income Details */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-400" /> Income Details
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Gross Annual Salary (Before Any Deductions)</label>
            <input
              type="number" value={grossSalary} onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg focus:border-emerald-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Exemptions (Old Regime Only) */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 border-l-4 border-l-rose-500">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-rose-400" /> Exemptions (Old Regime)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">HRA Exemption</label>
              <input
                type="number" value={hraExemption} onChange={(e) => setHraExemption(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">LTA Exemption</label>
              <input
                type="number" value={ltaExemption} onChange={(e) => setLtaExemption(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Deductions (Old Regime Only) */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Tax Deductions (Old Regime)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">80C (PPF, ELSS, EPF, LIC)</label>
              <input
                type="number" value={deduction80C} onChange={(e) => setDeduction80C(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                title="Max ₹1.5L allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">80D (Health Insurance)</label>
              <input
                type="number" value={deduction80D} onChange={(e) => setDeduction80D(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">80CCD(1B) (NPS Extra)</label>
              <input
                type="number" value={deduction80CCD1B} onChange={(e) => setDeduction80CCD1B(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Section 24B (Home Loan Int.)</label>
              <input
                type="number" value={homeLoanInterest} onChange={(e) => setHomeLoanInterest(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Results Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border-2 border-indigo-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              Old vs New Regime Comparison
            </h4>
            <Scale className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="space-y-4">
            {/* OLD REGIME CARD */}
            <div className={`p-4 rounded-xl border ${recommended === 'Old Tax Regime' ? 'bg-indigo-500/20 border-indigo-500 shadow-inner' : 'bg-slate-950/50 border-slate-800'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-300 tracking-wider">OLD REGIME (WITH DEDUCTIONS)</span>
                {recommended === 'Old Tax Regime' && <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">RECOMMENDED</span>}
              </div>
              <span className={`text-3xl font-black font-mono ${recommended === 'Old Tax Regime' ? 'text-indigo-400' : 'text-slate-400'}`}>
                {formatINR(oldTax)}
              </span>
              <div className="text-[10px] text-slate-500 mt-2 flex justify-between pt-2 border-t border-slate-800/50">
                <span>Taxable Income: {formatINR(oldTaxable)}</span>
                <span>Std. Ded: ₹50,000</span>
              </div>
            </div>

            {/* NEW REGIME CARD */}
            <div className={`p-4 rounded-xl border ${recommended === 'New Tax Regime' ? 'bg-indigo-500/20 border-indigo-500 shadow-inner' : 'bg-slate-950/50 border-slate-800'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-300 tracking-wider">NEW REGIME (NO DEDUCTIONS)</span>
                {recommended === 'New Tax Regime' && <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">RECOMMENDED</span>}
              </div>
              <span className={`text-3xl font-black font-mono ${recommended === 'New Tax Regime' ? 'text-indigo-400' : 'text-slate-400'}`}>
                {formatINR(newTax)}
              </span>
              <div className="text-[10px] text-slate-500 mt-2 flex justify-between pt-2 border-t border-slate-800/50">
                <span>Taxable Income: {formatINR(newTaxable)}</span>
                <span>Std. Ded: ₹75,000</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <span className="text-sm font-semibold text-slate-300 mb-1">
              You save <strong className="text-emerald-400">{formatINR(savings)}</strong> by choosing the
            </span>
            <div className="text-2xl font-black text-white tracking-tight">
              {recommended}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300">
              Note: This calculator uses the updated New Tax Regime slabs and the increased standard deduction of ₹75,000 as per the latest Union Budget. Under the New Regime, income up to ₹7 Lakhs is completely tax-free via Section 87A rebate.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy Tax Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
