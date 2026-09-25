import React, { useState, useMemo, useEffect } from 'react';
import { Tool } from '../../types';
import { Building, Droplets, Check, Copy, ArrowRightLeft } from 'lucide-react';
import { formatIndianNumber } from '../../utils/formatters';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

export const ConcreteCementSandCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState<number>(1000);
  const [copied, setCopied] = useState<boolean>(false);

  // Standard Indian Construction Averages per 1,000 sq ft:
  // Cement: ~400 bags (0.4 bags/sqft)
  // Steel: ~3,500 kg (3.5 kg/sqft)
  // Sand: ~1,800 cu ft (1.8 cuft/sqft)
  // Aggregate: ~1,350 cu ft (1.35 cuft/sqft)
  // Bricks: ~20,000 bricks
  const results = useMemo(() => {
    if (builtUpAreaSqFt <= 0) {
        return { cementBags: 0, steelKg: 0, sandCuFt: 0, bricksCount: 0 };
    }
    const cementBags = Math.round(builtUpAreaSqFt * 0.4);
    const steelKg = Math.round(builtUpAreaSqFt * 3.5);
    const sandCuFt = Math.round(builtUpAreaSqFt * 1.8);
    const bricksCount = Math.round(builtUpAreaSqFt * 20);

    return { cementBags, steelKg, sandCuFt, bricksCount };
  }, [builtUpAreaSqFt]);

  useEffect(() => {
    if (onResultChange && builtUpAreaSqFt > 0) {
      onResultChange(`Materials for ${builtUpAreaSqFt} sq ft: ${results.cementBags} Cement Bags, ${results.steelKg}kg Steel, ${results.bricksCount} Bricks`);
    }
  }, [builtUpAreaSqFt, results, onResultChange]);

  const handleCopy = () => {
    const text = `Construction Materials Estimator:
Total Built-up Area: ${builtUpAreaSqFt} sq ft

Estimated Requirements:
Cement (50kg Bags): ~${results.cementBags} Bags
TMT Steel Rebar: ~${formatIndianNumber(results.steelKg)} kg
Sand (River/M-Sand): ~${formatIndianNumber(results.sandCuFt)} cu.ft
Red Clay Bricks: ~${formatIndianNumber(results.bricksCount)} Bricks

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-indigo-600" />
          Concrete, Cement & Sand Calculator (Material Estimator)
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Estimate cement bags (50kg), steel rebar, sand, and bricks needed for house construction based on standard Indian thumb rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Total Built-up Slab Area (Sq Ft)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={builtUpAreaSqFt}
                onChange={(e) => setBuiltUpAreaSqFt(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
              />
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Estimated Raw Materials</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Cement (50kg)</span>
                        <span className="font-bold text-white font-mono text-xl">~{results.cementBags} <span className="text-xs text-neutral-500 font-normal">Bags</span></span>
                    </div>
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">TMT Steel Rebar</span>
                        <span className="font-bold text-white font-mono text-xl">~{formatIndianNumber(results.steelKg)} <span className="text-xs text-neutral-500 font-normal">kg</span></span>
                    </div>
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Sand (River/M-Sand)</span>
                        <span className="font-bold text-white font-mono text-xl">~{formatIndianNumber(results.sandCuFt)} <span className="text-xs text-neutral-500 font-normal">cu.ft</span></span>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                        <span className="text-neutral-400 text-sm">Red Clay Bricks</span>
                        <span className="font-black text-indigo-400 font-mono text-2xl">~{formatIndianNumber(results.bricksCount)} <span className="text-xs text-indigo-500 font-normal">Bricks</span></span>
                    </div>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-indigo-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Estimates'}
          </button>
        </div>
      </div>
    </div>
  );
};
