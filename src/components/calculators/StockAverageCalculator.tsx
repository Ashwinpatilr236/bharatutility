import React, { useState, useEffect } from 'react';
import { Tool } from '../../types';
import { TrendingUp, Plus, Trash2, IndianRupee, PieChart, Info } from 'lucide-react';

interface Props {
  tool: Tool;
  onResultChange?: (result: string) => void;
}

interface Trade {
  id: string;
  shares: number | '';
  price: number | '';
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val || 0);
};

export const StockAverageCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [trades, setTrades] = useState<Trade[]>([
    { id: '1', shares: 100, price: 150 },
    { id: '2', shares: 50, price: 120 },
  ]);

  const addTrade = () => {
    setTrades([...trades, { id: Math.random().toString(), shares: '', price: '' }]);
  };

  const removeTrade = (id: string) => {
    if (trades.length > 1) {
      setTrades(trades.filter((t) => t.id !== id));
    }
  };

  const updateTrade = (id: string, field: 'shares' | 'price', value: string) => {
    setTrades(
      trades.map((t) => {
        if (t.id === id) {
          return { ...t, [field]: value === '' ? '' : Number(value) };
        }
        return t;
      })
    );
  };

  // Calculations
  const validTrades = trades.filter((t) => typeof t.shares === 'number' && t.shares > 0 && typeof t.price === 'number' && t.price > 0);
  
  const totalShares = validTrades.reduce((acc, t) => acc + (t.shares as number), 0);
  const totalInvestment = validTrades.reduce((acc, t) => acc + ((t.shares as number) * (t.price as number)), 0);
  const averagePrice = totalShares > 0 ? totalInvestment / totalShares : 0;

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Total Investment: ${formatINR(totalInvestment)} | Avg Price: ${formatINR(averagePrice)}`);
    }
  }, [totalInvestment, averagePrice, onResultChange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Stock / Crypto Average Price</h3>
                <p className="text-xs text-slate-400">Calculate average buy price when buying the dip</p>
              </div>
            </div>
            <button
              onClick={addTrade}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-bold rounded-lg text-sm flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Purchase
            </button>
          </div>

          <div className="space-y-3">
            {trades.map((trade, index) => (
              <div key={trade.id} className="flex items-end gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <div className="w-8 shrink-0 flex items-center justify-center text-slate-500 font-bold bg-slate-900 rounded-lg h-[42px] mb-0.5">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Quantity (Units)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={trade.shares}
                    onChange={(e) => updateTrade(trade.id, 'shares', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="e.g. 100"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Buy Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={trade.price}
                    onChange={(e) => updateTrade(trade.id, 'price', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="e.g. 150.5"
                  />
                </div>
                <button
                  onClick={() => removeTrade(trade.id)}
                  disabled={trades.length === 1}
                  className="p-2.5 bg-slate-900 text-rose-400 hover:text-white hover:bg-rose-500 rounded-lg transition-colors border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed mb-0.5 shrink-0"
                  title="Remove trade"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Useful for finding the actual cost price when averaging down during market corrections (buying the dip) or doing Systematic Investment Plans (SIP).
            </p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-blue-950/40 border-2 border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-6 sticky top-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400 border-b border-blue-500/20 pb-2">
            Average Analysis
          </h4>

          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center text-center">
            <span className="text-slate-400 text-sm font-semibold mb-1">Average Buy Price</span>
            <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono tracking-tight">
              {formatINR(averagePrice)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5" />
                Total Quantity
              </span>
              <span className="text-xl font-bold text-white font-mono">{totalShares.toLocaleString('en-IN', { maximumFractionDigits: 4 })}</span>
            </div>
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                Total Invested
              </span>
              <span className="text-xl font-bold text-blue-300 font-mono">{formatINR(totalInvestment)}</span>
            </div>
          </div>
          
          <div className="pt-2 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            BharatUtility FinTools
          </div>
        </div>
      </div>
    </div>
  );
};
