import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { Shield, Copy, Check, Calculator, Info, IndianRupee, HeartPulse, AlertTriangle } from 'lucide-react';

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

export const TermInsuranceCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [annualIncome, setAnnualIncome] = useState<number>(1200000);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [existingLiabilities, setExistingLiabilities] = useState<number>(2500000); // e.g. home loan
  const [existingSavings, setExistingSavings] = useState<number>(1000000); // e.g. FD, mutual funds
  const [futureGoals, setFutureGoals] = useState<number>(3000000); // e.g. child education/marriage

  const [copied, setCopied] = useState(false);

  const {
    hlvMethod,
    needsMethod,
    recommendedCover
  } = useMemo(() => {
    const yearsLeft = Math.max(1, retirementAge - currentAge);

    // 1. Human Life Value (HLV) Method (Simplified rule of thumb based on age)
    let incomeMultiplier = 20; // Default for < 30
    if (currentAge >= 30 && currentAge < 40) incomeMultiplier = 15;
    if (currentAge >= 40 && currentAge < 50) incomeMultiplier = 12;
    if (currentAge >= 50) incomeMultiplier = 10;
    
    const hlvMethod = annualIncome * incomeMultiplier;

    // 2. Needs-Based Method (More accurate)
    // Present value of future living expenses + Liabilities + Goals - Existing Savings
    // Assuming 50% of income goes to family expenses
    const annualFamilyExpenses = annualIncome * 0.5;
    // Assuming 6% inflation and 8% safe return, real return ~2%
    const realReturnRate = 0.02;
    let presentValueOfExpenses = 0;
    for (let i = 0; i < yearsLeft; i++) {
      presentValueOfExpenses += annualFamilyExpenses / Math.pow(1 + realReturnRate, i);
    }
    
    const needsMethod = Math.max(0, presentValueOfExpenses + existingLiabilities + futureGoals - existingSavings);

    // Recommendation: Take the higher of the two, round to nearest Lakh
    let recommended = Math.max(hlvMethod, needsMethod);
    recommended = Math.ceil(recommended / 100000) * 100000;

    return {
      hlvMethod,
      needsMethod,
      recommendedCover: recommended
    };
  }, [annualIncome, currentAge, retirementAge, existingLiabilities, existingSavings, futureGoals]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Recommended Cover: ${formatINR(recommendedCover)}`);
    }
  }, [recommendedCover, onResultChange]);

  const copyToClipboard = () => {
    const text = `🛡️ Term Insurance Cover Estimate
- Annual Income: ${formatINR(annualIncome)}
- Age: ${currentAge} | Retirement: ${retirementAge}
- Liabilities: ${formatINR(existingLiabilities)}
- Savings: ${formatINR(existingSavings)}
- Future Goals: ${formatINR(futureGoals)}

✅ Recommended Life Cover: ${formatINR(recommendedCover)}

(Calculated via BharatUtility - Needs & HLV Methods used)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        
        {/* Basic Details */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-rose-400" /> Life Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Net Annual Income (₹)</label>
              <input
                type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Current Age</label>
                <input
                  type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Expected Retirement Age</label>
                <input
                  type="number" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 border-l-4 border-l-blue-500">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" /> Financial Snapshot
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Outstanding Liabilities/Loans (₹)</label>
              <input
                type="number" value={existingLiabilities} onChange={(e) => setExistingLiabilities(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Estimated Future Goals (Kids Edu, etc.) (₹)</label>
              <input
                type="number" value={futureGoals} onChange={(e) => setFutureGoals(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Existing Savings & Investments (₹)</label>
              <input
                type="number" value={existingSavings} onChange={(e) => setExistingSavings(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-rose-950/40 border-2 border-rose-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-rose-300">
              Coverage Recommendation
            </h4>
            <Shield className="w-5 h-5 text-rose-400" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-rose-500/30 shadow-inner">
            <span className="text-xs font-bold text-slate-400 mb-1 block uppercase tracking-wider">Recommended Life Cover</span>
            <span className="text-4xl font-black font-mono text-rose-400">
              {formatINR(recommendedCover)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400">Based on Rule of Thumb (HLV):</span>
              <span className="text-sm font-bold font-mono text-slate-300">{formatINR(hlvMethod)}</span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400">Based on Actual Needs:</span>
              <span className="text-sm font-bold font-mono text-slate-300">{formatINR(needsMethod)}</span>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex gap-2.5">
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-orange-300">
              Disclaimer: This is a planning estimate. Actual premium and coverage will depend on medical underwriting, lifestyle habits (smoking/drinking), and insurer policies.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy Cover Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
