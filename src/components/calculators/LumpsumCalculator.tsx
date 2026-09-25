import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { PieChart, Copy, Check, Calculator, Info, IndianRupee } from 'lucide-react';

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

export const LumpsumCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [investment, setInvestment] = useState<number>(100000);
  const [rate, setRate] = useState<number>(12); // Expected return rate
  const [years, setYears] = useState<number>(10);
  const [copied, setCopied] = useState(false);

  const { totalValue, estimatedReturn } = useMemo(() => {
    // Future Value formula for Compound Interest: A = P(1 + r/n)^(nt)
    // Here n=1 (compounded annually) is standard for Indian mutual funds lumpsum returns estimation
    const total = investment * Math.pow(1 + rate / 100, years);
    const estReturn = total - investment;

    return {
      totalValue: total,
      estimatedReturn: estReturn
    };
  }, [investment, rate, years]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Total Value: ${formatINR(totalValue)} | Profit: ${formatINR(estimatedReturn)}`);
    }
  }, [totalValue, estimatedReturn, onResultChange]);

  const copyToClipboard = () => {
    const text = `💰 Mutual Fund Lumpsum Return
- Investment: ${formatINR(investment)}
- Expected Return: ${rate}% p.a.
- Duration: ${years} Years

✅ Total Wealth: ${formatINR(totalValue)}
✅ Estimated Profit: ${formatINR(estimatedReturn)}

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
            <Calculator className="w-4 h-4 text-purple-400" /> Lumpsum Details
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
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Expected Return Rate (% p.a.)</label>
              <input
                type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Time Period (Years)</label>
              <input
                type="number" value={years} onChange={(e) => setYears(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-purple-950/40 border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-purple-300">
              Wealth Projection
            </h4>
            <IndianRupee className="w-5 h-5 text-purple-400" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">Total Expected Value</span>
            <span className="text-4xl font-black font-mono text-purple-400">
              {formatINR(totalValue)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-semibold text-slate-400 mb-1 block uppercase">Invested</span>
              <span className="text-xl font-bold font-mono text-slate-300">
                {formatINR(investment)}
              </span>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] font-semibold text-emerald-400 mb-1 block uppercase">Est. Profit</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatINR(estimatedReturn)}
              </span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300">
              Lumpsum returns are calculated using annual compounding. Mutual fund investments are subject to market risks, and actual returns may vary.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
