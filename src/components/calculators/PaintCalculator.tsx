import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Paintbrush, Home, CheckCircle2, DollarSign, Layers } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface PaintCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const PaintCalculator: React.FC<PaintCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [calcType, setCalcType] = useState<'room' | 'bhk'>('room');

  // Single Room dimensions
  const [length, setLength] = useState<number>(14);
  const [width, setWidth] = useState<number>(12);
  const [height, setHeight] = useState<number>(10);
  const [includeCeiling, setIncludeCeiling] = useState<boolean>(true);
  const [doorCount, setDoorCount] = useState<number>(1);
  const [windowCount, setWindowCount] = useState<number>(2);
  const [coats, setCoats] = useState<number>(2);

  // BHK Preset
  const [bhkPreset, setBhkPreset] = useState<'1bhk' | '2bhk' | '3bhk'>('2bhk');

  // BHK Built-up carpet areas (sq ft)
  const bhkCarpetAreas: Record<string, number> = {
    '1bhk': 550,
    '2bhk': 900,
    '3bhk': 1350
  };

  // Calculations
  let totalPaintableArea = 0;

  if (calcType === 'room') {
    // 2 * (L + W) * H
    const wallPerimeter = 2 * (length + width);
    const grossWallArea = wallPerimeter * height;
    const ceilingArea = includeCeiling ? length * width : 0;
    const deductions = (doorCount * 21) + (windowCount * 16);
    totalPaintableArea = Math.max(0, (grossWallArea - deductions) + ceilingArea);
  } else {
    // Standard Indian formula for BHK: Paintable Wall+Ceiling Area ≈ Carpet Area * 3.2
    totalPaintableArea = bhkCarpetAreas[bhkPreset] * 3.2;
  }

  // Paint Coverage: 1 Liter covers ~130 sq ft for 1 coat (so for 2 coats, ~65 sq ft per liter)
  const coveragePerLiterSingleCoat = 130;
  const paintLiters = Math.ceil((totalPaintableArea * coats) / coveragePerLiterSingleCoat);
  
  // Primer: 1 coat @ 140 sq ft / liter
  const primerLiters = Math.ceil(totalPaintableArea / 140);

  // Cost Tiers (Paint + Labor)
  // 1. Distemper/Economy: Paint ₹100/L, Labor ₹8/sqft
  const economyPaintCost = paintLiters * 110 + primerLiters * 90;
  const laborCost = Math.round(totalPaintableArea * 10);
  const economyTotal = economyPaintCost + laborCost;

  // 2. Standard Emulsion (Tractor / Bison): Paint ₹240/L
  const standardPaintCost = paintLiters * 240 + primerLiters * 130;
  const standardTotal = standardPaintCost + laborCost;

  // 3. Premium Royale (Royale Luxury / Silk): Paint ₹520/L + Luxury labor ₹14/sqft
  const royalePaintCost = paintLiters * 520 + primerLiters * 180;
  const royaleLabor = Math.round(totalPaintableArea * 14);
  const royaleTotal = royalePaintCost + royaleLabor;

  useEffect(() => {
    if (onResultChange) {
      const summary = `${totalPaintableArea.toFixed(0)} sq ft area requires ~${paintLiters}L paint (Est: ${formatINR(standardTotal)})`;
      onResultChange(summary, {
        calcType,
        totalPaintableArea,
        paintLiters,
        primerLiters,
        coats,
        economyTotal,
        standardTotal,
        royaleTotal
      });
    }
  }, [calcType, length, width, height, includeCeiling, doorCount, windowCount, coats, bhkPreset, totalPaintableArea, paintLiters, standardTotal]);

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 max-w-md">
        <button
          onClick={() => setCalcType('room')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            calcType === 'room'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Single / Custom Room
        </button>
        <button
          onClick={() => setCalcType('bhk')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            calcType === 'bhk'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Entire Apartment (BHK)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          {calcType === 'room' ? (
            <>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
                Room Dimensions (in Feet)
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    value={length || ''}
                    onChange={e => setLength(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Width (ft)
                  </label>
                  <input
                    type="number"
                    value={width || ''}
                    onChange={e => setWidth(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Height (ft)
                  </label>
                  <input
                    type="number"
                    value={height || ''}
                    onChange={e => setHeight(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Doors (21 sq ft deduction)
                  </label>
                  <input
                    type="number"
                    value={doorCount}
                    onChange={e => setDoorCount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Windows (16 sq ft deduction)
                  </label>
                  <input
                    type="number"
                    value={windowCount}
                    onChange={e => setWindowCount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCeiling}
                    onChange={e => setIncludeCeiling(e.target.checked)}
                    className="w-4 h-4 rounded text-accent accent-accent"
                  />
                  Include Ceiling Painting ({length * width} sq ft)
                </label>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
                Select Apartment Configuration
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: '1bhk', name: '1 BHK', carpet: '550 sq ft' },
                  { id: '2bhk', name: '2 BHK', carpet: '900 sq ft' },
                  { id: '3bhk', name: '3 BHK', carpet: '1350 sq ft' }
                ].map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBhkPreset(b.id as any)}
                    className={`p-4 rounded-2xl text-center border transition-all ${
                      bhkPreset === b.id
                        ? 'border-accent bg-accent/5 text-neutral-900 dark:text-white font-bold ring-2 ring-accent/20'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <span className="text-base block">{b.name}</span>
                    <span className="text-[11px] font-normal text-neutral-400">{b.carpet}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Number of coats */}
          <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
              Number of Paint Coats
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(c => (
                <button
                  key={c}
                  onClick={() => setCoats(c)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    coats === c
                      ? 'bg-accent text-white border-accent'
                      : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                  }`}
                >
                  {c} {c === 1 ? 'Coat (Touchup)' : c === 2 ? 'Coats (Standard)' : 'Coats (Rich)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results & Budget */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
              Required Paint Quantity
            </span>
            <div className="text-4xl font-extrabold font-mono text-white mb-1">
              {paintLiters} <span className="text-xl font-normal text-neutral-400">Liters</span>
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              For {Math.round(totalPaintableArea)} Sq Ft paintable area ({coats} coats) + {primerLiters}L Primer
            </p>

            {/* Estimated Budget Cards by Paint Grade */}
            <div className="space-y-2.5 pt-4 border-t border-neutral-800 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                Estimated Indian Cost Tiers (Paint + Labor)
              </span>

              <div className="p-3 rounded-2xl bg-neutral-800/60 flex justify-between items-center">
                <div>
                  <span className="font-bold text-neutral-200 block">Standard Emulsion (Tractor/Bison)</span>
                  <span className="text-[10px] text-neutral-400">Most Popular choice for Indian homes</span>
                </div>
                <span className="font-mono font-bold text-sm text-white">{formatINR(standardTotal)}</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60 flex justify-between items-center">
                <div>
                  <span className="font-bold text-neutral-200 block">Royale Luxury Emulsion</span>
                  <span className="text-[10px] text-neutral-400">High sheen, washable finish</span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-400">{formatINR(royaleTotal)}</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60 flex justify-between items-center">
                <div>
                  <span className="font-bold text-neutral-200 block">Economy Distemper</span>
                  <span className="text-[10px] text-neutral-400">Budget rental / temporary painting</span>
                </div>
                <span className="font-mono font-bold text-sm text-neutral-300">{formatINR(economyTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
