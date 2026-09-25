import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { MapPin, Check, Copy, ArrowRightLeft } from 'lucide-react';
import { REGIONAL_LAND_UNITS, convertRegionalLand } from '../../data/landUnits';

interface Props {
  tool: Tool;
  onResultChange?: (result: string) => void;
}

export const AllIndiaLandUnitConverter: React.FC<Props> = ({ onResultChange }) => {
  const [selectedLandRegionIdx, setSelectedLandRegionIdx] = useState<number>(0);
  const [inputLandValue, setInputLandValue] = useState<number>(1);
  const [inputLandUnit, setInputLandUnit] = useState<'bigha' | 'acre' | 'gaj' | 'guntha'>('bigha');
  const [copied, setCopied] = useState<boolean>(false);

  const region = REGIONAL_LAND_UNITS[selectedLandRegionIdx] || REGIONAL_LAND_UNITS[0];

  const landData = useMemo(() => {
    if (inputLandValue <= 0) {
      return { totalSqFt: 0, inAcres: 0, inBigha: 0, inGaj: 0, inGuntha: 0, inSqMeters: 0 };
    }

    const res = convertRegionalLand(inputLandValue, inputLandUnit, region);

    if (onResultChange) {
      onResultChange(`${res.inAcres} Acres | ${res.totalSqFt.toLocaleString('en-IN')} sq ft`);
    }
    
    return res;
  }, [inputLandValue, inputLandUnit, region]);

  const handleCopy = () => {
    const text = `Land Unit Conversion (${region.region}):
Input: ${inputLandValue} ${inputLandUnit}

Total Square Feet: ${landData.totalSqFt.toLocaleString('en-IN')} sq ft
Standard Acres: ${landData.inAcres} Acres
Gaj (Sq Yards): ${landData.inGaj.toLocaleString('en-IN')} Gaj
Square Metres: ${landData.inSqMeters.toLocaleString('en-IN')} sq m

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-600" />
          All-India Land Unit Converter
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Convert local regional land measurements (UP Pucca Bigha, MP Bigha, Maharashtra Guntha, South Cent/Ground, Punjab Kanal/Marla) into standard Acres, Gaj, and Sq Ft.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Select State / Regional Standard
              </label>
              <select
                value={selectedLandRegionIdx}
                onChange={(e) => setSelectedLandRegionIdx(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-sm text-neutral-900 dark:text-white"
              >
                {REGIONAL_LAND_UNITS.map((r, idx) => (
                  <option key={idx} value={idx}>{r.region}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Quantity
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={inputLandValue}
                  onChange={(e) => setInputLandValue(Number(e.target.value))}
                  className="w-full px-3 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Unit
                </label>
                <select
                  value={inputLandUnit}
                  onChange={(e) => setInputLandUnit(e.target.value as any)}
                  className="w-full px-3 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-sm text-neutral-900 dark:text-white"
                >
                  <option value="bigha">Bigha</option>
                  <option value="acre">Acre</option>
                  <option value="gaj">Gaj (Sq Yard)</option>
                  <option value="guntha">Guntha</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Conversion Results</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Total Square Feet</span>
                        <span className="font-bold text-white font-mono text-xl">{landData.totalSqFt.toLocaleString('en-IN')} <span className="text-xs text-neutral-500 font-normal">sq ft</span></span>
                    </div>
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Standard Acres</span>
                        <span className="font-black text-emerald-400 font-mono text-2xl">{landData.inAcres} <span className="text-xs text-emerald-500 font-normal">Acres</span></span>
                    </div>
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Gaj (Square Yards)</span>
                        <span className="font-bold text-white font-mono text-xl">{landData.inGaj.toLocaleString('en-IN')} <span className="text-xs text-neutral-500 font-normal">Gaj</span></span>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                        <span className="text-neutral-400 text-sm">Square Metres</span>
                        <span className="font-bold text-white font-mono text-xl">{landData.inSqMeters.toLocaleString('en-IN')} <span className="text-xs text-neutral-500 font-normal">sq m</span></span>
                    </div>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Conversions'}
          </button>
        </div>
      </div>
    </div>
  );
};
