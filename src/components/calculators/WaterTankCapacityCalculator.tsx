import React, { useState, useMemo, useEffect } from 'react';
import { Tool } from '../../types';
import { Droplets, Check, Copy, ArrowRightLeft } from 'lucide-react';
import { formatIndianNumber } from '../../utils/formatters';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

export const WaterTankCapacityCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [tankLengthFt, setTankLengthFt] = useState<number>(6);
  const [tankWidthFt, setTankWidthFt] = useState<number>(5);
  const [tankDepthFt, setTankDepthFt] = useState<number>(5);
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    const tankCuFt = tankLengthFt * tankWidthFt * tankDepthFt;
    const tankCapacityLitres = Math.round(tankCuFt * 28.317);
    const familyDaysSupply = (tankCapacityLitres / (4 * 135)).toFixed(1); // 4 member family @ 135 L/person/day

    return { tankCuFt, tankCapacityLitres, familyDaysSupply };
  }, [tankLengthFt, tankWidthFt, tankDepthFt]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Tank Volume: ${formatIndianNumber(results.tankCapacityLitres)} Litres (~${results.familyDaysSupply} days for 4-member family)`);
    }
  }, [results, onResultChange]);

  const handleCopy = () => {
    const text = `Water Tank Capacity Calculator:
Dimensions: ${tankLengthFt} ft (L) x ${tankWidthFt} ft (W) x ${tankDepthFt} ft (D)

Results:
Storage Volume: ${results.tankCuFt} Cubic Feet
Water Capacity: ${formatIndianNumber(results.tankCapacityLitres)} Litres
Estimated Supply (4-Member Family): ~${results.familyDaysSupply} Days

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-6 h-6 text-cyan-500" />
          Underground Water Tank Capacity Calculator
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Calculate the exact storage capacity (in Litres) for your underground or syntax water tank based on its dimensions in feet.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Length (Ft)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={tankLengthFt}
                  onChange={(e) => setTankLengthFt(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-bold text-lg text-center text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Width (Ft)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={tankWidthFt}
                  onChange={(e) => setTankWidthFt(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-bold text-lg text-center text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Depth (Ft)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={tankDepthFt}
                  onChange={(e) => setTankDepthFt(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-bold text-lg text-center text-neutral-900 dark:text-white"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <ArrowRightLeft className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Storage Volume</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Cubic Feet (Volume)</span>
                        <span className="font-bold text-white font-mono text-xl">{results.tankCuFt} <span className="text-xs text-neutral-500 font-normal">cu.ft</span></span>
                    </div>
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Total Capacity</span>
                        <span className="font-black text-cyan-400 font-mono text-2xl">{formatIndianNumber(results.tankCapacityLitres)} <span className="text-xs text-cyan-500 font-normal">Litres</span></span>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                        <span className="text-neutral-400 text-sm">Supply (4-Person Family)</span>
                        <span className="font-bold text-white font-mono text-xl">~{results.familyDaysSupply} <span className="text-xs text-neutral-500 font-normal">Days</span></span>
                    </div>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-cyan-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Results'}
          </button>
        </div>
      </div>
    </div>
  );
};
