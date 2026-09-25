import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Car, Check, Copy, AlertTriangle, TrendingDown, Clock, Info } from 'lucide-react';

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

export const OldVehicleResaleValuationCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [originalCarExShowroom, setOriginalCarExShowroom] = useState<number>(900000);
  const [carAgeYears, setCarAgeYears] = useState<number>(3);
  const [odometerKm, setOdometerKm] = useState<number>(35000);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    estimatedValue,
    depPercent,
    expectedKm,
    kmDiff,
    baseDepRate,
    mileageFactor,
    targetMin,
    targetMax
  } = useMemo(() => {
    const exShowroom = originalCarExShowroom || 0;
    const age = carAgeYears || 0;
    const km = odometerKm || 0;

    if (exShowroom <= 0 || age <= 0) {
      return { estimatedValue: 0, depPercent: 0, expectedKm: 0, kmDiff: 0, baseDepRate: 0, mileageFactor: 0, targetMin: 0, targetMax: 0 };
    }

    let depRate = 0.15; // Year 1
    if (age === 2) depRate = 0.25;
    else if (age === 3) depRate = 0.38;
    else if (age === 4) depRate = 0.48;
    else if (age >= 5) depRate = Math.min(0.75, 0.55 + (age - 5) * 0.05);

    // Mileage adjustment
    const expKm = age * 12000;
    const diff = km - expKm;
    const milFactor = (diff / 10000) * 0.02; // 2% per 10k extra km

    const effectiveDep = Math.max(0.05, Math.min(0.85, depRate + milFactor));
    const value = Math.max(0, Math.round(exShowroom * (1 - effectiveDep)));

    const minVal = Math.round(value * 0.95);
    const maxVal = Math.round(value * 1.05);

    if (onResultChange) {
      onResultChange(`Value: ${formatINR(minVal)} - ${formatINR(maxVal)}`);
    }

    return {
      estimatedValue: value,
      depPercent: Math.round(effectiveDep * 100),
      expectedKm: expKm,
      kmDiff: diff,
      baseDepRate: Math.round(depRate * 100),
      mileageFactor: Math.round(milFactor * 100),
      targetMin: minVal,
      targetMax: maxVal
    };
  }, [originalCarExShowroom, carAgeYears, odometerKm]);

  const handleCopy = () => {
    const text = `Used Vehicle Resale Valuation:
Original Ex-Showroom: ${formatINR(originalCarExShowroom)}
Age: ${carAgeYears} Years
Odometer: ${odometerKm.toLocaleString('en-IN')} km

Estimated Market Value: ${formatINR(estimatedValue)}
Suggested Buying/Selling Range: ${formatINR(targetMin)} to ${formatINR(targetMax)}
Total Depreciation: ${depPercent}%

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Car className="w-6 h-6 text-emerald-600" />
          Old Car & Bike Resale Valuation & Depreciation
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Calculate realistic fair market price for used cars and two-wheelers in India based on vehicle age, odometer reading, and standard depreciation matrix.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Original Ex-Showroom Price (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={originalCarExShowroom}
                  onChange={(e) => setOriginalCarExShowroom(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Vehicle Age
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    inputMode="numeric"
                    value={carAgeYears}
                    onChange={(e) => setCarAgeYears(Number(e.target.value))}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium text-xs">Yrs</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> Odometer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={odometerKm}
                    onChange={(e) => setOdometerKm(Number(e.target.value))}
                    className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-medium text-xs">KM</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                    <p>Expected average usage is ~12,000 KM per year. For {carAgeYears} years, expected is {expectedKm.toLocaleString('en-IN')} KM.
                    Your vehicle is driven {Math.abs(kmDiff).toLocaleString('en-IN')} KM {kmDiff > 0 ? 'more' : 'less'} than expected, which {kmDiff > 0 ? 'decreases' : 'increases'} its value by {Math.abs(mileageFactor)}%.</p>
                </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 text-center">
                <p className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Estimated Fair Market Value</p>
                <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-emerald-400">
                    {formatINR(estimatedValue)}
                </div>
                
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700">
                    <TrendingDown className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="text-xs font-bold text-neutral-300">Total Depreciation: {depPercent}%</span>
                </div>
            </div>
            
            <div className="relative z-10 mt-8 pt-5 border-t border-neutral-800 text-center">
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold mb-2">Buying / Selling Target Range</p>
                <div className="text-xl font-bold font-mono text-white">
                    {formatINR(targetMin)} <span className="text-neutral-500 mx-1">to</span> {formatINR(targetMax)}
                </div>
                {kmDiff > 20000 && (
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 py-1.5 px-2 rounded">
                        <AlertTriangle className="w-3 h-3" /> Note: High mileage vehicle may require deeper physical inspection.
                    </div>
                )}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Valuation Copied!' : 'Copy Valuation Estimate'}
          </button>
        </div>
      </div>
    </div>
  );
};
