import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { Calculator, Copy, Check, TrendingUp, Info, Plus, Trash2 } from 'lucide-react';

interface Props {
  tool: Tool;
  onResultChange?: (result: string) => void;
}

interface CashFlow {
  id: string;
  amount: number;
  date: string;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(val) || 0);
};

// XIRR Calculation Helper
const xnpv = (rate: number, values: number[], dates: Date[]) => {
  let xnpv = 0.0;
  for (let i = 0; i < values.length; i++) {
    const x = (dates[i].getTime() - dates[0].getTime()) / (1000 * 3600 * 24);
    xnpv += values[i] / Math.pow(1 + rate, x / 365);
  }
  return xnpv;
};

const xirr = (values: number[], dates: Date[], guess = 0.1) => {
  const maxIterations = 100;
  const tol = 0.0001;
  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    const npv = xnpv(rate, values, dates);
    // Derivative of XNPV
    let dnpv = 0.0;
    for (let j = 0; j < values.length; j++) {
      const x = (dates[j].getTime() - dates[0].getTime()) / (1000 * 3600 * 24);
      dnpv -= (x / 365) * values[j] / Math.pow(1 + rate, x / 365 + 1);
    }
    const newRate = rate - npv / dnpv;
    if (Math.abs(newRate - rate) < tol) return newRate;
    rate = newRate;
  }
  return null; // Could not converge
};

export const XirrCalculator: React.FC<Props> = ({ onResultChange }) => {
  // Pre-fill some default data to make it look active
  const today = new Date().toISOString().split('T')[0];
  const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

  const [cashFlows, setCashFlows] = useState<CashFlow[]>([
    { id: '1', amount: -100000, date: lastYear }, // Initial Investment (negative)
    { id: '2', amount: -50000, date: lastMonth },  // Second Investment
    { id: '3', amount: 180000, date: today }       // Current Value (positive)
  ]);
  const [copied, setCopied] = useState(false);

  const addCashFlow = () => {
    setCashFlows([...cashFlows, { id: Date.now().toString(), amount: 0, date: today }]);
  };

  const removeCashFlow = (id: string) => {
    if (cashFlows.length > 2) {
      setCashFlows(cashFlows.filter(cf => cf.id !== id));
    }
  };

  const updateCashFlow = (id: string, field: 'amount' | 'date', value: string) => {
    setCashFlows(cashFlows.map(cf => {
      if (cf.id === id) {
        return { ...cf, [field]: field === 'amount' ? Number(value) : value };
      }
      return cf;
    }));
  };

  const { calculatedXirr, totalInvestment, currentValuation } = useMemo(() => {
    const validFlows = cashFlows.filter(cf => cf.amount !== 0 && cf.date !== '');
    
    let totalInv = 0;
    let currVal = 0;
    validFlows.forEach(cf => {
      if (cf.amount < 0) totalInv += Math.abs(cf.amount);
      if (cf.amount > 0) currVal += cf.amount;
    });

    if (validFlows.length < 2) return { calculatedXirr: null, totalInvestment: totalInv, currentValuation: currVal };

    const hasNegative = validFlows.some(cf => cf.amount < 0);
    const hasPositive = validFlows.some(cf => cf.amount > 0);

    if (!hasNegative || !hasPositive) return { calculatedXirr: null, totalInvestment: totalInv, currentValuation: currVal };

    // Sort chronologically
    const sortedFlows = [...validFlows].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const values = sortedFlows.map(cf => cf.amount);
    const dates = sortedFlows.map(cf => new Date(cf.date));

    try {
      const result = xirr(values, dates);
      return { 
        calculatedXirr: result !== null ? result * 100 : null,
        totalInvestment: totalInv,
        currentValuation: currVal
      };
    } catch (e) {
      return { calculatedXirr: null, totalInvestment: totalInv, currentValuation: currVal };
    }
  }, [cashFlows]);

  useEffect(() => {
    if (onResultChange && calculatedXirr !== null) {
      onResultChange(`XIRR: ${calculatedXirr.toFixed(2)}% | Total Invested: ${formatINR(totalInvestment)}`);
    }
  }, [calculatedXirr, totalInvestment, onResultChange]);

  const copyToClipboard = () => {
    const text = `📊 XIRR Calculation
- Total Invested: ${formatINR(totalInvestment)}
- Current Valuation: ${formatINR(currentValuation)}

✅ XIRR (Annualized Return): ${calculatedXirr ? calculatedXirr.toFixed(2) + '%' : 'N/A'}

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" /> Cash Flows
            </h3>
            <button 
              onClick={addCashFlow}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Row
            </button>
          </div>
          
          <div className="space-y-3">
            {cashFlows.map((cf, index) => (
              <div key={cf.id} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                    {index === cashFlows.length - 1 ? 'Current Value (Positive)' : 'Investment (Negative)'}
                  </label>
                  <input
                    type="number" 
                    value={cf.amount || ''} 
                    onChange={(e) => updateCashFlow(cf.id, 'amount', e.target.value)}
                    className={`w-full bg-slate-800 border ${cf.amount < 0 ? 'border-rose-500/50' : 'border-emerald-500/50'} rounded-lg px-3 py-2 text-white font-mono text-sm`}
                    placeholder={index === cashFlows.length - 1 ? "e.g. 150000" : "e.g. -50000"}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1">Date</label>
                  <input
                    type="date" 
                    value={cf.date} 
                    onChange={(e) => updateCashFlow(cf.id, 'date', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
                {cashFlows.length > 2 && (
                  <button 
                    onClick={() => removeCashFlow(cf.id)}
                    className="p-2.5 bg-slate-800 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-lg border border-slate-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-[10px] text-slate-500">
            * Enter investments as <strong>negative numbers</strong> (e.g., -50000). Enter current valuation or withdrawals as <strong>positive numbers</strong> (e.g., 180000).
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
              XIRR Result
            </h4>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 mb-1 block">XIRR (Annualized Return)</span>
            {calculatedXirr !== null ? (
              <span className={`text-4xl font-black font-mono ${calculatedXirr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {calculatedXirr.toFixed(2)}%
              </span>
            ) : (
              <span className="text-xl font-bold text-slate-500">Calculating...</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Invested:</span>
              <span className="text-slate-200 font-mono font-bold">{formatINR(totalInvestment)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Current Value:</span>
              <span className="text-slate-200 font-mono font-bold">{formatINR(currentValuation)}</span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300">
              XIRR (Extended Internal Rate of Return) calculates annualized returns for investments made at irregular intervals (like multiple SIPs or lumpsums over time).
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            disabled={calculatedXirr === null}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy XIRR Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
