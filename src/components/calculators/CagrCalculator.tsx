import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { TrendingUp, Copy, Check, Calculator, Info } from 'lucide-react';

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

export const CagrCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [initialValue, setInitialValue] = useState<number>(100000);
  const [finalValue, setFinalValue] = useState<number>(250000);
  const [years, setYears] = useState<number>(5);
  const [copied, setCopied] = useState(false);

  const { cagr, absoluteReturn } = useMemo(() => {
    let calculatedCagr = 0;
    let absReturn = 0;

    if (initialValue > 0 && years > 0) {
      calculatedCagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
      absReturn = ((finalValue - initialValue) / initialValue) * 100;
    }

    return {
      cagr: calculatedCagr,
      absoluteReturn: absReturn
    };
  }, [initialValue, finalValue, years]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`CAGR: ${cagr.toFixed(2)}% | Absolute Return: ${absoluteReturn.toFixed(2)}%`);
    }
  }, [cagr, absoluteReturn, onResultChange]);

  const copyToClipboard = () => {
    const text = `📈 CAGR Calculation
- Initial Value: ${formatINR(initialValue)}
- Final Value: ${formatINR(finalValue)}
- Duration: ${years} Years

✅ CAGR (Annual Growth): ${cagr.toFixed(2)}%
✅ Absolute Return: ${absoluteReturn.toFixed(2)}%

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
            <Calculator className="w-4 h-4 text-emerald-400" /> Investment Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Initial Investment Value (₹)</label>
              <input
                type="number" value={initialValue} onChange={(e) => setInitialValue(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Final Investment Value (₹)</label>
              <input
                type="number" value={finalValue} onChange={(e) => setFinalValue(Number(e.target.value))}
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

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
              Growth Results
            </h4>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">Compound Annual Growth Rate (CAGR)</span>
            <span className={`text-4xl font-black font-mono ${cagr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {cagr.toFixed(2)}%
            </span>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">Absolute Return</span>
            <span className={`text-3xl font-black font-mono ${absoluteReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {absoluteReturn.toFixed(2)}%
            </span>
            <div className="text-xs text-slate-500 mt-2">
              Total Profit/Loss: {formatINR(finalValue - initialValue)}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-[10px] text-blue-300">
              CAGR measures the smoothed annualized return of your investment over the given time period, assuming profits are reinvested each year.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
