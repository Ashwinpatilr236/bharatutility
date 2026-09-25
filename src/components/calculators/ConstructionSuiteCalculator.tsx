import React, { useState, useEffect } from 'react';
import { Home, Layers, Droplets, ArrowRight } from 'lucide-react';
import { formatIndianNumber } from '../../utils/formatters';

export type ConstructionMode = 'materials' | 'land-area' | 'water-tank';

interface ConstructionSuiteCalculatorProps {
  initialMode?: ConstructionMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const ConstructionSuiteCalculator: React.FC<ConstructionSuiteCalculatorProps> = ({
  initialMode = 'materials',
  onResultChange,
}) => {
  const [mode, setMode] = useState<ConstructionMode>(initialMode);

  // Materials Estimation
  const [builtUpAreaSqFt, setBuiltUpAreaSqFt] = useState<number>(1000);

  // Land Area Conversion
  const [landAreaValue, setLandAreaValue] = useState<number>(1);
  const [landUnit, setLandUnit] = useState<'acre' | 'guntha' | 'bigha' | 'sqft' | 'sqyard'>('guntha');

  // Water Tank
  const [tankLengthFt, setTankLengthFt] = useState<number>(6);
  const [tankWidthFt, setTankWidthFt] = useState<number>(5);
  const [tankDepthFt, setTankDepthFt] = useState<number>(5);

  // Standard Indian Construction Averages per 1,000 sq ft:
  // Cement: ~400 bags (0.4 bags/sqft)
  // Steel: ~3,500 kg (3.5 kg/sqft)
  // Sand: ~1,800 cu ft (1.8 cuft/sqft)
  // Aggregate: ~1,350 cu ft (1.35 cuft/sqft)
  // Bricks: ~20,000 bricks
  const cementBags = Math.round(builtUpAreaSqFt * 0.4);
  const steelKg = Math.round(builtUpAreaSqFt * 3.5);
  const sandCuFt = Math.round(builtUpAreaSqFt * 1.8);
  const bricksCount = Math.round(builtUpAreaSqFt * 20);

  // Land Area calculations (Standard benchmark: 1 Guntha = 1,089 sq ft, 1 Acre = 43,560 sq ft, 1 Bigha (Std) = 27,225 sq ft, 1 Sq Yard / Gaj = 9 sq ft)
  let sqftBase = builtUpAreaSqFt;
  if (landUnit === 'acre') sqftBase = landAreaValue * 43560;
  if (landUnit === 'guntha') sqftBase = landAreaValue * 1089;
  if (landUnit === 'bigha') sqftBase = landAreaValue * 27225;
  if (landUnit === 'sqft') sqftBase = landAreaValue;
  if (landUnit === 'sqyard') sqftBase = landAreaValue * 9;

  const resGuntha = (sqftBase / 1089).toFixed(2);
  const resAcre = (sqftBase / 43560).toFixed(4);
  const resBigha = (sqftBase / 27225).toFixed(3);
  const resGaj = (sqftBase / 9).toFixed(1);
  const resSqMtr = (sqftBase / 10.764).toFixed(1);

  // Water Tank: Volume in Cu Ft = L * W * D. 1 Cu Ft water = ~28.317 Litres
  const tankCuFt = tankLengthFt * tankWidthFt * tankDepthFt;
  const tankCapacityLitres = Math.round(tankCuFt * 28.317);
  const familyDaysSupply = (tankCapacityLitres / (4 * 135)).toFixed(1); // 4 member family @ 135 L/person/day

  useEffect(() => {
    if (!onResultChange) return;

    if (mode === 'materials') {
      onResultChange(`Materials for ${builtUpAreaSqFt} sq ft: ${cementBags} Cement Bags, ${steelKg}kg Steel, ${bricksCount} Bricks`, {
        builtUpAreaSqFt,
        cementBags,
        steelKg,
      });
    } else if (mode === 'land-area') {
      onResultChange(`${landAreaValue} ${landUnit} = ${formatIndianNumber(sqftBase)} Sq Ft (${resGuntha} Guntha, ${resGaj} Gaj)`, {
        landAreaValue,
        landUnit,
        sqftBase,
      });
    } else if (mode === 'water-tank') {
      onResultChange(`Tank Volume: ${formatIndianNumber(tankCapacityLitres)} Litres (~${familyDaysSupply} days for 4-member family)`, {
        tankCapacityLitres,
        tankCuFt,
      });
    }
  }, [
    mode,
    builtUpAreaSqFt,
    landAreaValue,
    landUnit,
    sqftBase,
    tankLengthFt,
    tankWidthFt,
    tankDepthFt,
    tankCapacityLitres,
  ]);

  return (
    <div className="w-full space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { id: 'materials', label: 'Material Estimator' },
          { id: 'land-area', label: 'Indian Land Converter' },
          { id: 'water-tank', label: 'Water Tank Capacity' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as ConstructionMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              mode === tab.id
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Built-up Slab Area (Sq Ft)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={builtUpAreaSqFt || ''}
                onChange={(e) => setBuiltUpAreaSqFt(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Estimated Raw Materials</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Cement:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">~{cementBags} Bags (50kg)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">TMT Steel Rebar:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">~{formatIndianNumber(steelKg)} kg ({Math.round(steelKg / 1000)} MT)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Sand (River/M-Sand):</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">~{sandCuFt} cu.ft</span>
              </div>
              <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Red Clay Bricks:</span>
                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">~{formatIndianNumber(bricksCount)} Bricks</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'land-area' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Area Measure
              </label>
              <div className="flex gap-2">
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={landAreaValue || ''}
                  onChange={(e) => setLandAreaValue(Number(e.target.value))}
                  className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
                />
                <select
                  value={landUnit}
                  onChange={(e) => setLandUnit(e.target.value as any)}
                  className="px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white"
                >
                  <option value="guntha">Guntha</option>
                  <option value="acre">Acre</option>
                  <option value="bigha">Bigha</option>
                  <option value="sqyard">Gaj / Sq Yard</option>
                  <option value="sqft">Sq Ft</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Unit Equivalents</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Square Feet (Sq.Ft):</span>
                <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">{formatIndianNumber(sqftBase)} sq.ft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Gaj / Square Yards:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{resGaj} Gaj</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Guntha:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{resGuntha} Guntha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Acres:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{resAcre} Acres</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'water-tank' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">Length (Ft)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={tankLengthFt || ''}
                  onChange={(e) => setTankLengthFt(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">Width (Ft)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={tankWidthFt || ''}
                  onChange={(e) => setTankWidthFt(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">Depth (Ft)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={tankDepthFt || ''}
                  onChange={(e) => setTankDepthFt(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Storage Volume</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Capacity:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatIndianNumber(tankCapacityLitres)} Litres</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Cubical Volume:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{tankCuFt} cu.ft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">4-Member Family Supply:</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">~{familyDaysSupply} Days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
