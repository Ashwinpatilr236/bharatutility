import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, numberToIndianWords } from '../../utils/formatters';
import { RefreshCw } from 'lucide-react';
import { QuickAmountChips } from '../common/QuickAmountChips';
import { triggerHapticFeedback } from '../../utils/haptics';

interface GstCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const GstCalculator: React.FC<GstCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [amount, setAmount] = useState<number>(() => {
    return currentToolParams?.amount ? Number(currentToolParams.amount) : 10000;
  });
  const [gstRate, setGstRate] = useState<number>(() => {
    return currentToolParams?.rate ? Number(currentToolParams.rate) : 18;
  });
  const [calcType, setCalcType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [supplyType, setSupplyType] = useState<'intra' | 'inter'>('intra');

  const gstSlabs = [
    { label: '0%', rate: 0, desc: 'Essential Foods' },
    { label: '5%', rate: 5, desc: 'Apparel <₹1k, Packaged food' },
    { label: '12%', rate: 12, desc: 'Computers, Processed food' },
    { label: '18%', rate: 18, desc: 'Standard Services & Goods' },
    { label: '28%', rate: 28, desc: 'Automobiles & Luxury' },
  ];

  // Mathematical Calculation
  let baseAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (calcType === 'exclusive') {
    // Add GST
    baseAmount = amount;
    gstAmount = (amount * gstRate) / 100;
    totalAmount = baseAmount + gstAmount;
  } else {
    // Remove GST (Inclusive)
    totalAmount = amount;
    baseAmount = amount / (1 + gstRate / 100);
    gstAmount = totalAmount - baseAmount;
  }

  const cgstAmount = supplyType === 'intra' ? gstAmount / 2 : 0;
  const sgstAmount = supplyType === 'intra' ? gstAmount / 2 : 0;
  const igstAmount = supplyType === 'inter' ? gstAmount : 0;

  useEffect(() => {
    if (onResultChange && totalAmount > 0) {
      const summary = `GST (${gstRate}%): ${formatINR(gstAmount)} | Net Base: ${formatINR(baseAmount)} | Total: ${formatINR(totalAmount)}`;
      onResultChange(summary, { amount, rate: gstRate, type: calcType });
    }
  }, [amount, gstRate, calcType, supplyType, totalAmount]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          {/* Inclusive vs Exclusive toggle */}
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => {
                  triggerHapticFeedback('light');
                  setCalcType('exclusive');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  calcType === 'exclusive'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Add GST (Exclusive)
              </button>
              <button
                onClick={() => {
                  triggerHapticFeedback('light');
                  setCalcType('inclusive');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  calcType === 'inclusive'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Remove GST (Inclusive)
              </button>
            </div>

            <button
              onClick={() => {
                triggerHapticFeedback('light');
                setAmount(10000);
                setGstRate(18);
              }}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white flex items-center gap-1 active:scale-95 transition-transform"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* 1. Initial Amount Input */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="gst-amount-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {calcType === 'exclusive' ? 'Base Amount (without GST)' : 'Total MRP (including GST)'}
              </label>
              <span className="text-xs font-mono text-neutral-400">
                {numberToIndianWords(amount)}
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 font-bold">₹</span>
              <input
                id="gst-amount-input"
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="1"
                max="100000000"
                step="100"
                value={amount || ''}
                onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <QuickAmountChips
              currentValue={amount}
              onChange={val => setAmount(val)}
              chips={[
                { label: '+₹1K', value: 1000 },
                { label: '+₹5K', value: 5000 },
                { label: '+₹10K', value: 10000 },
                { label: '+₹50K', value: 50000 },
                { label: '+₹1L', value: 100000 },
              ]}
              resetValue={10000}
            />
          </div>

          {/* 2. Indian Standard GST Rate Slabs */}
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 block">
              GST Tax Slab
            </label>

            <div className="grid grid-cols-5 gap-2">
              {gstSlabs.map(slab => (
                <button
                  key={slab.rate}
                  onClick={() => {
                    triggerHapticFeedback('light');
                    setGstRate(slab.rate);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all active:scale-95 ${
                    gstRate === slab.rate
                      ? 'bg-accent text-white border-accent shadow-md scale-102'
                      : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 hover:border-accent text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <span className="text-base font-extrabold font-mono">{slab.label}</span>
                  <span
                    className={`text-[10px] truncate max-w-[70px] mt-0.5 ${
                      gstRate === slab.rate ? 'text-white/80' : 'text-neutral-400'
                    }`}
                  >
                    {slab.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Transaction Supply Type (Intra vs Inter state) */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Tax Split Scheme:
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setSupplyType('intra')}
                className={`px-3 py-1 rounded-lg border font-medium transition-colors ${
                  supplyType === 'intra'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'text-neutral-500 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                Same State (CGST + SGST)
              </button>
              <button
                onClick={() => setSupplyType('inter')}
                className={`px-3 py-1 rounded-lg border font-medium transition-colors ${
                  supplyType === 'inter'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent shadow-xs'
                    : 'text-neutral-500 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                Inter-State (IGST)
              </button>
            </div>
          </div>
        </div>

        {/* Right Outputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Hero Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
              Total Invoice Amount
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
              {formatINR(totalAmount, 2)}
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              Includes {gstRate}% GST ({formatINR(gstAmount, 2)})
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Net Base Amount
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-white mt-0.5 block">
                  {formatINR(baseAmount, 2)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Total GST Tax
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                  +{formatINR(gstAmount, 2)}
                </span>
              </div>
            </div>
          </div>

          {/* Tax Breakdown Bill Table */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Tax Invoice Itemization
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-600 dark:text-neutral-400 font-sans">Base Price (Taxable Value)</span>
                <span className="font-semibold">{formatINR(baseAmount, 2)}</span>
              </div>

              {supplyType === 'intra' ? (
                <>
                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                    <span className="font-sans">CGST ({gstRate / 2}%)</span>
                    <span>+{formatINR(cgstAmount, 2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                    <span className="font-sans">SGST / UTGST ({gstRate / 2}%)</span>
                    <span>+{formatINR(sgstAmount, 2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                  <span className="font-sans">IGST ({gstRate}%)</span>
                  <span>+{formatINR(igstAmount, 2)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 text-neutral-900 dark:text-white font-bold text-sm font-sans">
                <span>Total Payable Amount</span>
                <span className="font-mono">{formatINR(totalAmount, 2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
