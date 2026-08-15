import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIndianNumber, formatINR } from '../../utils/formatters';
import { Percent, RefreshCw, ArrowRight, Tag, TrendingUp, TrendingDown } from 'lucide-react';

interface PercentageCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const PercentageCalculator: React.FC<PercentageCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  // Mode: 'simple' | 'change' | 'discount' | 'what-percent'
  const [activeTab, setActiveTab] = useState<'simple' | 'change' | 'discount' | 'what-percent'>('simple');

  // Mode 1: What is X% of Y?
  const [percent1, setPercent1] = useState<number>(18);
  const [value1, setValue1] = useState<number>(50000);

  // Mode 2: Percentage Change (Increase/Decrease from A to B)
  const [initialVal, setInitialVal] = useState<number>(12000);
  const [finalVal, setFinalVal] = useState<number>(15000);

  // Mode 3: Discount & Sale Price
  const [originalPrice, setOriginalPrice] = useState<number>(3999);
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [extraGst, setExtraGst] = useState<number>(0);

  // Mode 4: X is what % of Y?
  const [partVal, setPartVal] = useState<number>(450);
  const [totalVal, setTotalVal] = useState<number>(600);

  // Calculations
  const resultSimple = (percent1 * value1) / 100;
  
  const changeDiff = finalVal - initialVal;
  const changePercent = initialVal !== 0 ? (changeDiff / initialVal) * 100 : 0;
  
  const discountAmount = (originalPrice * discountPercent) / 100;
  const discountedPrice = Math.max(0, originalPrice - discountAmount);
  const finalPriceWithGst = discountedPrice * (1 + extraGst / 100);

  const whatPercentResult = totalVal !== 0 ? (partVal / totalVal) * 100 : 0;

  useEffect(() => {
    if (onResultChange) {
      if (activeTab === 'simple') {
        const summary = `${percent1}% of ${formatIndianNumber(value1)} = ${formatIndianNumber(resultSimple)}`;
        onResultChange(summary, { tab: 'simple', percent: percent1, value: value1, result: resultSimple });
      } else if (activeTab === 'change') {
        const sign = changeDiff >= 0 ? '+' : '';
        const summary = `${initialVal} → ${finalVal} (${sign}${changePercent.toFixed(2)}%)`;
        onResultChange(summary, { tab: 'change', initial: initialVal, final: finalVal, changePercent });
      } else if (activeTab === 'discount') {
        const summary = `MRP ${formatINR(originalPrice)} with ${discountPercent}% off = ${formatINR(finalPriceWithGst)} (Saved ${formatINR(discountAmount)})`;
        onResultChange(summary, { tab: 'discount', originalPrice, discountPercent, finalPriceWithGst });
      } else {
        const summary = `${partVal} is ${whatPercentResult.toFixed(2)}% of ${totalVal}`;
        onResultChange(summary, { tab: 'what-percent', partVal, totalVal, result: whatPercentResult });
      }
    }
  }, [activeTab, percent1, value1, resultSimple, initialVal, finalVal, changePercent, originalPrice, discountPercent, finalPriceWithGst, partVal, totalVal, whatPercentResult]);

  return (
    <div className="space-y-8">
      {/* Sub Mode Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 max-w-2xl">
        <button
          onClick={() => setActiveTab('simple')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'simple'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          X% of Y
        </button>
        <button
          onClick={() => setActiveTab('change')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'change'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          % Change (Increase / Decrease)
        </button>
        <button
          onClick={() => setActiveTab('discount')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'discount'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Discount & Sale
        </button>
        <button
          onClick={() => setActiveTab('what-percent')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            activeTab === 'what-percent'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          X is what % of Y
        </button>
      </div>

      {/* Mode 1: What is X% of Y */}
      {activeTab === 'simple' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Calculate Percentage of a Number
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Percentage (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={percent1 || ''}
                    onChange={e => setPercent1(Number(e.target.value))}
                    className="w-full px-4 pr-8 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                  <span className="absolute right-3.5 top-2.5 text-neutral-400 font-bold">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Of Value (Total Amount)
                </label>
                <input
                  type="number"
                  value={value1 || ''}
                  onChange={e => setValue1(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {[5, 10, 12, 18, 20, 25, 50, 75].map(p => (
                <button
                  key={p}
                  onClick={() => setPercent1(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    percent1 === p
                      ? 'bg-accent text-white border-accent'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                Result
              </span>
              <div className="text-4xl font-extrabold font-mono text-white mb-2">
                {formatIndianNumber(resultSimple)}
              </div>
              <p className="text-xs text-neutral-400">
                {percent1}% of {formatIndianNumber(value1)} is {formatIndianNumber(resultSimple)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Percentage Change */}
      {activeTab === 'change' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Percentage Increase / Decrease
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Initial / Old Value
                </label>
                <input
                  type="number"
                  value={initialVal || ''}
                  onChange={e => setInitialVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Final / New Value
                </label>
                <input
                  type="number"
                  value={finalVal || ''}
                  onChange={e => setFinalVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                {changeDiff >= 0 ? 'Percentage Increase' : 'Percentage Decrease'}
              </span>
              <div className={`text-4xl font-extrabold font-mono mb-2 flex items-center gap-2 ${
                changeDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {changeDiff >= 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
                <span>{Math.abs(changePercent).toFixed(2)}%</span>
              </div>
              <p className="text-xs text-neutral-400">
                Absolute difference: {changeDiff >= 0 ? '+' : ''}{formatIndianNumber(changeDiff)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Discount Calculator */}
      {activeTab === 'discount' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Discount & Savings Calculator
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Original MRP (₹)
                </label>
                <input
                  type="number"
                  value={originalPrice || ''}
                  onChange={e => setOriginalPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent || ''}
                  onChange={e => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {[10, 20, 30, 40, 50, 60, 70].map(d => (
                <button
                  key={d}
                  onClick={() => setDiscountPercent(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    discountPercent === d
                      ? 'bg-accent text-white border-accent'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  {d}% OFF
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Final Deal Price
              </span>
              <div className="text-4xl font-extrabold font-mono text-white mb-2">
                {formatINR(finalPriceWithGst)}
              </div>
              <p className="text-xs text-neutral-400 mb-6">
                You save <strong className="text-emerald-400">{formatINR(discountAmount)}</strong> ({discountPercent}% off MRP)
              </p>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800 text-xs">
                <div className="p-3 rounded-2xl bg-neutral-800/60">
                  <span className="text-neutral-400 block">Original MRP</span>
                  <span className="text-sm font-bold font-mono text-neutral-200">{formatINR(originalPrice)}</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-800/60">
                  <span className="text-neutral-400 block">Total Savings</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{formatINR(discountAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 4: X is what % of Y */}
      {activeTab === 'what-percent' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Find Proportion Percentage
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Obtained Part (X)
                </label>
                <input
                  type="number"
                  value={partVal || ''}
                  onChange={e => setPartVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Out of Total (Y)
                </label>
                <input
                  type="number"
                  value={totalVal || ''}
                  onChange={e => setTotalVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                Percentage Share
              </span>
              <div className="text-4xl font-extrabold font-mono text-white mb-2">
                {whatPercentResult.toFixed(2)}%
              </div>
              <p className="text-xs text-neutral-400">
                {partVal} represents {whatPercentResult.toFixed(2)}% of {totalVal}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
