import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { Car, Copy, Check, Calculator, Info, IndianRupee, ShieldCheck } from 'lucide-react';

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

export const CarIdvCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [exShowroomPrice, setExShowroomPrice] = useState<number>(800000);
  const [vehicleAge, setVehicleAge] = useState<number>(3); // years
  const [copied, setCopied] = useState(false);

  const { idv, depreciationRate } = useMemo(() => {
    // Standard IRDAI Depreciation Rates for IDV
    // Up to 6 months: 5%
    // 6 months - 1 year: 15%
    // 1 - 2 years: 20%
    // 2 - 3 years: 30%
    // 3 - 4 years: 40%
    // 4 - 5 years: 50%
    // > 5 years: Mutual agreement (we will use generic 10% drop per year after 5)

    let rate = 0;
    if (vehicleAge === 0) rate = 5; // Assuming brand new but left showroom
    else if (vehicleAge === 1) rate = 15;
    else if (vehicleAge === 2) rate = 20;
    else if (vehicleAge === 3) rate = 30;
    else if (vehicleAge === 4) rate = 40;
    else if (vehicleAge === 5) rate = 50;
    else {
      // Custom estimation beyond 5 years (typically drops 10% on previous year's IDV)
      rate = 50 + ((vehicleAge - 5) * 5); 
      if (rate > 90) rate = 90; // Floor IDV at 10%
    }

    const calculatedIdv = exShowroomPrice - (exShowroomPrice * (rate / 100));

    return {
      idv: calculatedIdv,
      depreciationRate: rate
    };
  }, [exShowroomPrice, vehicleAge]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Est. IDV: ${formatINR(idv)} | Dep: ${depreciationRate}%`);
    }
  }, [idv, depreciationRate, onResultChange]);

  const copyToClipboard = () => {
    const text = `🚗 Car/Bike Insurance IDV Estimate
- Ex-Showroom Price: ${formatINR(exShowroomPrice)}
- Age of Vehicle: ${vehicleAge} Years
- IRDAI Depreciation: ${depreciationRate}%

✅ Estimated IDV (Insured Declared Value): ${formatINR(idv)}

(Calculated via BharatUtility)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        
        {/* Basic Details */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Car className="w-4 h-4 text-amber-400" /> Vehicle Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Original Ex-Showroom Price (₹)</label>
              <input
                type="number" value={exShowroomPrice} onChange={(e) => setExShowroomPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
              />
              <p className="text-[10px] text-slate-500 mt-1">Do not include RTO, Road Tax, or Insurance costs.</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex justify-between">
                <span>Vehicle Age</span>
                <span className="text-amber-400 font-mono">{vehicleAge} Years</span>
              </label>
              <input
                type="range" min="0" max="15" step="1" value={vehicleAge} onChange={(e) => setVehicleAge(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-300">
              Estimated IDV
            </h4>
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-amber-500/30 shadow-inner">
            <span className="text-xs font-bold text-slate-400 mb-1 block uppercase tracking-wider">Maximum Claim Value (IDV)</span>
            <span className="text-4xl font-black font-mono text-amber-400">
              {formatINR(idv)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400">Standard Depreciation:</span>
              <span className="text-sm font-bold font-mono text-rose-400">-{depreciationRate}%</span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300">
              IDV represents the maximum amount your insurer will pay in case of total loss/theft. It is calculated strictly on the Ex-Showroom price using IRDAI's standard depreciation slab.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy IDV Estimate'}
          </button>
        </div>
      </div>
    </div>
  );
};
