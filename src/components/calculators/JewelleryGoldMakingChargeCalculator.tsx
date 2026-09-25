import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Gem, Check, Copy, Percent, IndianRupee, HandCoins, Scale } from 'lucide-react';

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

export const JewelleryGoldMakingChargeCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(10);
  const [goldPurityKarat, setGoldPurityKarat] = useState<number>(22);
  const [goldRatePerGram24K, setGoldRatePerGram24K] = useState<number>(8650);
  const [makingChargePercent, setMakingChargePercent] = useState<number>(12);
  const hallmarkCharges = 45;
  const [copied, setCopied] = useState<boolean>(false);

  const {
    basePurityRatePerGram,
    netGoldPrice,
    makingChargesAmt,
    gst3Percent,
    finalJewelleryPrice
  } = useMemo(() => {
    const weight = goldWeightGrams || 0;
    const rate24k = goldRatePerGram24K || 0;
    const karat = goldPurityKarat || 22;
    const makingPct = makingChargePercent || 0;
    
    if (weight <= 0 || rate24k <= 0) {
      return { basePurityRatePerGram: 0, netGoldPrice: 0, makingChargesAmt: 0, gst3Percent: 0, finalJewelleryPrice: 0 };
    }

    const effectiveRate = (rate24k * karat) / 24;
    const rawGoldValue = effectiveRate * weight;
    const makingAmt = (rawGoldValue * makingPct) / 100;
    const preGstPrice = rawGoldValue + makingAmt + hallmarkCharges;
    const gstAmt = (preGstPrice * 3) / 100;
    const finalPrice = preGstPrice + gstAmt;

    if (onResultChange) {
      onResultChange(`Total: ${formatINR(Math.round(finalPrice))}`);
    }

    return {
      basePurityRatePerGram: Math.round(effectiveRate),
      netGoldPrice: Math.round(rawGoldValue),
      makingChargesAmt: Math.round(makingAmt),
      gst3Percent: Math.round(gstAmt),
      finalJewelleryPrice: Math.round(finalPrice)
    };
  }, [goldWeightGrams, goldPurityKarat, goldRatePerGram24K, makingChargePercent]);

  const handleCopy = () => {
    const text = `Jewellery Bill Estimate:
Gold Weight: ${goldWeightGrams}g
Purity: ${goldPurityKarat}K
24K Rate: ${formatINR(goldRatePerGram24K)}/g

Breakdown:
Net Gold Price: ${formatINR(netGoldPrice)}
Making Charges (${makingChargePercent}%): ${formatINR(makingChargesAmt)}
Hallmarking: ${formatINR(hallmarkCharges)}
GST (3%): ${formatINR(gst3Percent)}

Final Price: ${formatINR(finalJewelleryPrice)}
Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Gem className="w-6 h-6 text-amber-600" />
          Jewellery Gold Making Charges & GST Calculator
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Calculate the real transparent price of gold jewellery with jeweller making charges (wastage), BIS hallmark fee (₹45), and 3% GST.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Gold Weight (Grams)
                </label>
                <div className="relative">
                    <input
                    type="number"
                    inputMode="decimal"
                    value={goldWeightGrams}
                    onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium text-xs">g</span>
                </div>
                </div>

                <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Gold Purity
                </label>
                <div className="relative">
                    <select
                        value={goldPurityKarat}
                        onChange={(e) => setGoldPurityKarat(Number(e.target.value))}
                        className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white appearance-none"
                    >
                        <option value="24">24K (999 Pure)</option>
                        <option value="22">22K (916 Std)</option>
                        <option value="18">18K (750 Diamond)</option>
                        <option value="14">14K (585 Daily)</option>
                    </select>
                </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    24K Rate (₹/Gram)
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                    <input
                    type="number"
                    inputMode="decimal"
                    value={goldRatePerGram24K}
                    onChange={(e) => setGoldRatePerGram24K(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white"
                    />
                </div>
                </div>
                <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Making Charges (%)
                </label>
                <div className="relative">
                    <input
                    type="number"
                    inputMode="decimal"
                    value={makingChargePercent}
                    onChange={(e) => setMakingChargePercent(Number(e.target.value))}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">%</span>
                </div>
                </div>
            </div>

            <div className="pt-2">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 flex justify-between items-center text-xs">
                    <span className="font-medium text-amber-800 dark:text-amber-400">Effective {goldPurityKarat}K Rate</span>
                    <span className="font-bold text-amber-900 dark:text-amber-200">₹{basePurityRatePerGram}/gram</span>
                </div>
            </div>
            
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-amber-500 dark:bg-amber-700 rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
                <p className="text-amber-100 text-sm font-medium uppercase tracking-wider mb-2">Final Billing Amount</p>
                <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight mb-6">
                    {formatINR(finalJewelleryPrice)}
                </div>

                <div className="space-y-3 pt-4 border-t border-amber-400/30">
                    <div className="flex items-center justify-between text-amber-50">
                        <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 opacity-80" />
                            <span className="text-sm">Net Gold Price</span>
                        </div>
                        <span className="font-bold font-mono">{formatINR(netGoldPrice)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-amber-50">
                        <div className="flex items-center gap-2">
                            <HandCoins className="w-4 h-4 opacity-80" />
                            <span className="text-sm">Making & Wastage ({makingChargePercent}%)</span>
                        </div>
                        <span className="font-bold font-mono">{formatINR(makingChargesAmt)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-amber-50">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 opacity-80" />
                            <span className="text-sm">BIS Hallmark + 3% GST</span>
                        </div>
                        <span className="font-bold font-mono">{formatINR(gst3Percent + hallmarkCharges)}</span>
                    </div>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-amber-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Estimate Copied!' : 'Copy Bill Estimate'}
          </button>
        </div>
      </div>
    </div>
  );
};
