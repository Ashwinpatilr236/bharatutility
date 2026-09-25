import React, { useState } from 'react';
import { Target, TrendingUp, Briefcase } from 'lucide-react';
import { AdSlot } from '../common/AdSlot';

export default function BreakEvenPointCalculator() {
  const [fixedCosts, setFixedCosts] = useState<string>('50000');
  const [pricePerUnit, setPricePerUnit] = useState<string>('500');
  const [variableCostPerUnit, setVariableCostPerUnit] = useState<string>('200');

  const calculateBreakEven = () => {
    const fixed = parseFloat(fixedCosts) || 0;
    const price = parseFloat(pricePerUnit) || 0;
    const variable = parseFloat(variableCostPerUnit) || 0;

    const contributionMargin = price - variable;
    let units = 0;
    let revenue = 0;

    if (contributionMargin > 0) {
      units = Math.ceil(fixed / contributionMargin);
      revenue = units * price;
    }

    return {
      units,
      revenue,
      contributionMargin,
      marginRatio: price > 0 ? (contributionMargin / price) * 100 : 0
    };
  };

  const results = calculateBreakEven();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Break-Even Point Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fixed Costs (₹)
              </label>
              <input
                type="number"
                value={fixedCosts}
                onChange={(e) => setFixedCosts(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="e.g., Rent, Salaries"
              />
              <p className="text-xs text-slate-500 mt-1">Costs that don't change with volume.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Selling Price per Unit (₹)
              </label>
              <input
                type="number"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Price of one item"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Variable Cost per Unit (₹)
              </label>
              <input
                type="number"
                value={variableCostPerUnit}
                onChange={(e) => setVariableCostPerUnit(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder="Cost to make one item"
              />
            </div>
            
            {results.contributionMargin <= 0 && parseFloat(pricePerUnit) > 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                Warning: Variable costs are higher than selling price. You will never break even.
              </div>
            )}
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-medium mb-6">Break-Even Analysis</h3>
            
            <div className="space-y-6">
              <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="text-sm text-purple-300 mb-1">Units to Sell</div>
                <div className="text-4xl font-bold text-purple-400">{results.units.toLocaleString('en-IN')}</div>
              </div>
              
              <div className="text-center p-4 bg-slate-900 rounded-xl">
                <div className="text-sm text-slate-400 mb-1">Break-Even Revenue</div>
                <div className="text-2xl font-bold text-white">₹{results.revenue.toLocaleString('en-IN')}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Contribution Margin</div>
                  <div className="text-lg font-medium text-slate-200">₹{results.contributionMargin.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Margin Ratio</div>
                  <div className="text-lg font-medium text-slate-200">{results.marginRatio.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AdSlot />
    </div>
  );
}
