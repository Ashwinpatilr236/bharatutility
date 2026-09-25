import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Milk, Check, Copy, TrendingUp, FlaskConical, Scale, Info } from 'lucide-react';

interface Props {
  tool: Tool;
  onResultChange?: (result: string) => void;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(val || 0);
};

export const DairyMilkFatSnfCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [fatPercent, setFatPercent] = useState<number>(6.5);
  const [snfPercent, setSnfPercent] = useState<number>(9.0);
  const [milkQuantityLiters, setMilkQuantityLiters] = useState<number>(25);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    ratePerLiter,
    totalPayout,
    fatComponent,
    snfComponent
  } = useMemo(() => {
    const fat = fatPercent || 0;
    const snf = snfPercent || 0;
    const qty = milkQuantityLiters || 0;

    if (fat <= 0 || snf <= 0 || qty <= 0) {
      return { ratePerLiter: 0, totalPayout: 0, fatComponent: 0, snfComponent: 0 };
    }

    // Standard Indian Dairy Fat/SNF Formula approximation used by rural dairies
    // Rate = (Fat * FatRateMultiplier) + (SNF * SNFRateMultiplier)
    // Common multiplier for illustration: Fat * 5.8 + SNF * 2.8
    const fatVal = Number((fat * 5.8).toFixed(2));
    const snfVal = Number((snf * 2.8).toFixed(2));
    const rate = Number((fatVal + snfVal).toFixed(2));
    const payout = Math.round(rate * qty);

    if (onResultChange) {
      onResultChange(`Payout: ${formatINR(payout)}`);
    }

    return {
      ratePerLiter: rate,
      totalPayout: payout,
      fatComponent: fatVal,
      snfComponent: snfVal
    };
  }, [fatPercent, snfPercent, milkQuantityLiters]);

  const handleCopy = () => {
    const text = `Dairy Milk Rate & Payout:
Milk Quantity: ${milkQuantityLiters} Litres
Fat Percentage: ${fatPercent}%
SNF Percentage: ${snfPercent}%

Rate Per Litre: ${formatINR(ratePerLiter)}/L
Total Farmer Payout: ${formatINR(totalPayout)}

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Milk className="w-6 h-6 text-blue-600" />
          Dairy Milk Fat & SNF Rate Calculator
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Calculate milk purchase rate per litre and total farmer payout based on Fat % (3.5% to 10%) and Solid-Not-Fat (SNF %) for Buffalo and Cow milk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5" /> Milk Fat %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="3"
                    max="12"
                    step="0.1"
                    inputMode="decimal"
                    value={fatPercent}
                    onChange={(e) => setFatPercent(Number(e.target.value))}
                    className="w-full pl-3 pr-10 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs uppercase">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> SNF %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="7"
                    max="11"
                    step="0.1"
                    inputMode="decimal"
                    value={snfPercent}
                    onChange={(e) => setSnfPercent(Number(e.target.value))}
                    className="w-full pl-3 pr-10 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs uppercase">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Total Milk Quantity (Litres)
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  value={milkQuantityLiters}
                  onChange={(e) => setMilkQuantityLiters(Number(e.target.value))}
                  className="w-full pl-3 pr-16 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium text-sm">Litres</span>
              </div>
            </div>
            
            <div className="pt-2">
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <p>Buffalo milk typically has 6-8% Fat and 9% SNF. Cow milk typically has 3.5-4.5% Fat and 8.5% SNF. Payouts are directly proportional to these solids.</p>
                </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 text-center mb-6">
                <p className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Total Dairy Payout</p>
                <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-blue-400">
                    {formatINR(totalPayout)}
                </div>
            </div>
            
            <div className="relative z-10 pt-4 border-t border-neutral-800 space-y-4">
                
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/50 border border-neutral-700">
                    <div className="text-sm text-neutral-300">Rate Per Litre</div>
                    <span className="font-bold font-mono text-white text-lg">{formatINR(ratePerLiter)}<span className="text-xs text-neutral-500 font-normal">/L</span></span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/50">
                        <div className="text-[10px] uppercase text-neutral-500 mb-1 font-bold">Fat Contribution</div>
                        <div className="text-sm font-mono text-neutral-300">₹{fatComponent.toFixed(2)}/L</div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-900/50">
                        <div className="text-[10px] uppercase text-neutral-500 mb-1 font-bold">SNF Contribution</div>
                        <div className="text-sm font-mono text-neutral-300">₹{snfComponent.toFixed(2)}/L</div>
                    </div>
                </div>
                
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-blue-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Slip Copied!' : 'Copy Dairy Slip'}
          </button>
        </div>
      </div>
    </div>
  );
};
