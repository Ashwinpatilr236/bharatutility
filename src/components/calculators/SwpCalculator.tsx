import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { IndianRupee, ArrowDownCircle, Copy, Check, Calculator, Info } from 'lucide-react';

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

export const SwpCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [investment, setInvestment] = useState<number>(5000000);
  const [withdrawal, setWithdrawal] = useState<number>(30000); // monthly
  const [rate, setRate] = useState<number>(10); // annual return
  const [years, setYears] = useState<number>(10);
  const [copied, setCopied] = useState(false);

  const { finalBalance, totalWithdrawn } = useMemo(() => {
    let balance = investment;
    let withdrawn = 0;
    const monthlyRate = rate / 12 / 100;
    const totalMonths = years * 12;

    for (let i = 0; i < totalMonths; i++) {
      balance = balance * (1 + monthlyRate) - withdrawal;
      if (balance < 0) {
        // Funds depleted early
        withdrawn += (balance + withdrawal); // whatever was left
        balance = 0;
        break;
      }
      withdrawn += withdrawal;
    }

    return {
      finalBalance: balance,
      totalWithdrawn: withdrawn
    };
  }, [investment, withdrawal, rate, years]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Total Withdrawn: ${formatINR(totalWithdrawn)} | Final Balance: ${formatINR(finalBalance)}`);
    }
  }, [totalWithdrawn, finalBalance, onResultChange]);

  const copyToClipboard = () => {
    const text = `🔄 SWP (Systematic Withdrawal Plan)
- Initial Investment: ${formatINR(investment)}
- Monthly Withdrawal: ${formatINR(withdrawal)}
- Return Rate: ${rate}% p.a.
- Duration: ${years} Years

✅ Total Amount Withdrawn: ${formatINR(totalWithdrawn)}
✅ Final Fund Balance: ${formatINR(finalBalance)}

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
            <Calculator className="w-4 h-4 text-orange-400" /> SWP Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Total Investment (₹)</label>
              <input
                type="number" value={investment} onChange={(e) => setInvestment(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Monthly Withdrawal (₹)</label>
              <input
                type="number" value={withdrawal} onChange={(e) => setWithdrawal(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Expected Return (% p.a.)</label>
                <input
                  type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Duration (Years)</label>
                <input
                  type="number" value={years} onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-orange-950/40 border-2 border-orange-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-orange-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-orange-300">
              Withdrawal Summary
            </h4>
            <ArrowDownCircle className="w-5 h-5 text-orange-400" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">Total Amount Withdrawn</span>
            <span className="text-4xl font-black font-mono text-orange-400">
              {formatINR(totalWithdrawn)}
            </span>
            {finalBalance === 0 && (
              <div className="text-xs text-rose-400 mt-2 font-bold bg-rose-500/10 px-2 py-1 rounded inline-block">
                ⚠️ Fund Depleted Early
              </div>
            )}
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-emerald-500/20">
            <span className="text-xs font-semibold text-emerald-400 mb-1 block">Final Value (Left in Fund)</span>
            <span className="text-3xl font-black font-mono text-emerald-400">
              {formatINR(finalBalance)}
            </span>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300">
              SWP allows you to withdraw a fixed amount every month while the remaining balance continues to earn returns. If your withdrawal rate exceeds the return rate, your fund will eventually deplete.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy Summary'}
          </button>
        </div>
      </div>
    </div>
  );
};
