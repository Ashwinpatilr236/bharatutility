import React, { useState, useMemo, useEffect } from 'react';
import { Tool } from '../../types';
import { Pill, Check, Copy, ArrowRightLeft } from 'lucide-react';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

const POPULAR_MEDICINES = [
  { brand: 'Augmentin 625 Duo', salt: 'Amoxycillin (500mg) + Clavulanic Acid (125mg)', brandPrice: 205, genericPrice: 55, use: 'Bacterial infections, respiratory tract' },
  { brand: 'Pan-D (Pantocid DSR)', salt: 'Pantoprazole (40mg) + Domperidone (30mg)', brandPrice: 195, genericPrice: 32, use: 'Acidity, GERD, Heartburn' },
  { brand: 'Telma-40 (Telmikind)', salt: 'Telmisartan (40mg)', brandPrice: 145, genericPrice: 18, use: 'High Blood Pressure (Hypertension)' },
  { brand: 'Glycomet-GP 2', salt: 'Glimepiride (2mg) + Metformin (500mg)', brandPrice: 185, genericPrice: 28, use: 'Type-2 Diabetes Blood Sugar control' },
  { brand: 'Calpol 650 (Dolo 650)', salt: 'Paracetamol (650mg)', brandPrice: 34, genericPrice: 10, use: 'Fever, Body pain, Headache' },
  { brand: 'Shelcal 500', salt: 'Calcium (500mg) + Vitamin D3 (250 IU)', brandPrice: 135, genericPrice: 24, use: 'Bone strength, Calcium deficiency' },
  { brand: 'Montair-LC', salt: 'Montelukast (10mg) + Levocetirizine (5mg)', brandPrice: 215, genericPrice: 35, use: 'Allergy, Asthma, Runny nose' },
  { brand: 'Rosuvas 10 (Rozavel)', salt: 'Rosuvastatin (10mg)', brandPrice: 240, genericPrice: 30, use: 'High Cholesterol, Heart health' },
];

export const BrandedVsGenericMedicineComparator: React.FC<Props> = ({ onResultChange }) => {
  const [selectedMedIdx, setSelectedMedIdx] = useState<number>(0);
  const [monthlyStrips, setMonthlyStrips] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    const med = POPULAR_MEDICINES[selectedMedIdx];
    const brandedCostYearly = med.brandPrice * monthlyStrips * 12;
    const genericCostYearly = med.genericPrice * monthlyStrips * 12;
    const annualSavings = brandedCostYearly - genericCostYearly;
    const savingsPercent = Math.round((annualSavings / brandedCostYearly) * 100);

    return { med, brandedCostYearly, genericCostYearly, annualSavings, savingsPercent };
  }, [selectedMedIdx, monthlyStrips]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Save ₹${results.annualSavings.toLocaleString('en-IN')}/yr (${results.savingsPercent}%) by switching ${results.med.brand} to generic`);
    }
  }, [results, onResultChange]);

  const handleCopy = () => {
    const text = `Branded vs Generic Medicine Comparison:
Medicine: ${results.med.brand}
Chemical Salt: ${results.med.salt}

Branded Cost (Yearly): ₹${results.brandedCostYearly.toLocaleString('en-IN')}
Generic Cost (Yearly): ₹${results.genericCostYearly.toLocaleString('en-IN')}

Total Annual Savings: ₹${results.annualSavings.toLocaleString('en-IN')} (${results.savingsPercent}%)

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          <Pill className="w-3.5 h-3.5" />
          <span>PM Jan Aushadhi Generic Medicine Comparison</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Pill className="w-6 h-6 text-emerald-500" />
          Branded vs Generic Medicine Savings
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Compare prices between popular branded medicines and their exact chemical salt generic equivalents to save up to 80-90% on medical bills.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Select Popular Branded Medicine
              </label>
              <select
                value={selectedMedIdx}
                onChange={(e) => setSelectedMedIdx(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-sm text-neutral-900 dark:text-white appearance-none"
              >
                {POPULAR_MEDICINES.map((m, idx) => (
                  <option key={idx} value={idx}>{m.brand} ({m.use})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Monthly Consumption (Strips / Packs)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="1"
                max="50"
                value={monthlyStrips}
                onChange={(e) => setMonthlyStrips(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
              />
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
               <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">Chemical Salt composition:</div>
               <div className="text-sm text-emerald-900 dark:text-emerald-100 font-medium leading-relaxed">
                  {results.med.salt}
               </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Annual Branded Cost</div>
                        <div className="text-sm font-bold text-rose-400">₹{results.brandedCostYearly.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                        <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Annual Generic Cost</div>
                        <div className="text-sm font-bold text-emerald-400">₹{results.genericCostYearly.toLocaleString('en-IN')}</div>
                    </div>
                </div>
                
                <div className="pt-2">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Your Total Annual Savings</div>
                    <div className="text-4xl font-black text-white font-mono">
                      ₹{results.annualSavings.toLocaleString('en-IN')}
                    </div>
                    <div className="inline-block mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-sm rounded-full border border-emerald-500/30">
                        {results.savingsPercent}% Cheaper
                    </div>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Savings Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
