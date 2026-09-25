import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { Home, Copy, Check, Calculator, Info, IndianRupee, AlertCircle } from 'lucide-react';

interface Props {
  tool: Tool;
  onResultChange?: (result: string) => void;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(val) || 0);
};

export const HomeLoanEligibilityCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [netMonthlyIncome, setNetMonthlyIncome] = useState<number>(100000);
  const [existingMonthlyEMIs, setExistingMonthlyEMIs] = useState<number>(15000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [foirLimit, setFoirLimit] = useState<number>(50); // Default 50%
  const [copied, setCopied] = useState(false);

  const { maxEmiAffordable, maxLoanAmount } = useMemo(() => {
    // 1. Calculate Maximum EMI capacity using FOIR (Fixed Obligation to Income Ratio)
    const maxTotalEmi = netMonthlyIncome * (foirLimit / 100);
    const maxEmiAffordable = Math.max(0, maxTotalEmi - existingMonthlyEMIs);

    // 2. Reverse calculate Loan Amount from EMI
    // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
    // P = EMI / [ (R x (1+R)^N) / ((1+R)^N-1) ]
    let maxLoanAmount = 0;
    if (maxEmiAffordable > 0 && interestRate > 0 && tenureYears > 0) {
      const monthlyRate = interestRate / 12 / 100;
      const totalMonths = tenureYears * 12;
      const factor = Math.pow(1 + monthlyRate, totalMonths);
      maxLoanAmount = maxEmiAffordable / ((monthlyRate * factor) / (factor - 1));
    }

    return { maxEmiAffordable, maxLoanAmount };
  }, [netMonthlyIncome, existingMonthlyEMIs, interestRate, tenureYears, foirLimit]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Eligible Loan: ${formatINR(maxLoanAmount)} | Max EMI: ${formatINR(maxEmiAffordable)}`);
    }
  }, [maxLoanAmount, maxEmiAffordable, onResultChange]);

  const copyToClipboard = () => {
    const text = `🏠 Home Loan Eligibility 
- Net Monthly Income: ${formatINR(netMonthlyIncome)}
- Existing EMIs: ${formatINR(existingMonthlyEMIs)}
- Interest Rate: ${interestRate}% | Tenure: ${tenureYears} Years

✅ Max Eligible Loan Amount: ${formatINR(maxLoanAmount)}
✅ Max EMI Affordable: ${formatINR(maxEmiAffordable)}

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-pink-400" /> Income & Obligations
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Net Monthly Income (In-Hand) (₹)</label>
              <input
                type="number" value={netMonthlyIncome} onChange={(e) => setNetMonthlyIncome(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Existing Total Monthly EMIs (₹)</label>
              <input
                type="number" value={existingMonthlyEMIs} onChange={(e) => setExistingMonthlyEMIs(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Home className="w-4 h-4 text-pink-400" /> Loan Terms
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Interest Rate (% p.a.)</label>
                  <input
                    type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Tenure (Years)</label>
                  <input
                    type="number" value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex justify-between">
                <span>FOIR Limit (%)</span>
                <span className="text-pink-400">{foirLimit}%</span>
              </label>
              <input
                type="range" min="30" max="70" step="5" value={foirLimit} onChange={(e) => setFoirLimit(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">FOIR determines what % of your income can go towards EMIs (Banks usually use 50%).</p>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-pink-950/40 border-2 border-pink-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-pink-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-pink-300">
              Eligibility Assessment
            </h4>
            <IndianRupee className="w-5 h-5 text-pink-400" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">Maximum Eligible Loan Amount</span>
            <span className="text-4xl font-black font-mono text-pink-400">
              {formatINR(maxLoanAmount)}
            </span>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">Maximum New EMI You Can Afford</span>
            <span className="text-2xl font-bold font-mono text-slate-300">
              {formatINR(maxEmiAffordable)} <span className="text-sm text-slate-500 font-normal">/ month</span>
            </span>
          </div>

          {maxEmiAffordable === 0 && (
             <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex gap-2.5">
               <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
               <p className="text-[10px] text-rose-300">
                 Your existing EMIs consume your entire permissible limit. You are unlikely to get a new loan unless you clear existing debts or increase your income.
               </p>
             </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300">
              Note: Final loan eligibility depends on your credit score, employer category, and the bank's specific internal credit policies.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-pink-600 hover:bg-pink-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
