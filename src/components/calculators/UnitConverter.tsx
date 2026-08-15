import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowLeftRight, Copy, Check, Sparkles, Layers, Maximize2 } from 'lucide-react';
import { formatIndianNumber } from '../../utils/formatters';

interface UnitConverterProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

type UnitCategory = 'land' | 'length' | 'weight' | 'temperature' | 'speed';

interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  factor: number; // relative to base unit
  region?: string;
}

const UNIT_GROUPS: Record<UnitCategory, { name: string; baseUnit: string; units: UnitDefinition[] }> = {
  land: {
    name: 'Indian Land & Area',
    baseUnit: 'sqft',
    units: [
      { id: 'sqft', name: 'Square Feet (Sq Ft)', symbol: 'sq ft', factor: 1 },
      { id: 'gaj', name: 'Gaj (Square Yard)', symbol: 'Gaj', factor: 9, region: 'North/Central India' },
      { id: 'guntha', name: 'Guntha', symbol: 'Guntha', factor: 1089, region: 'Maharashtra / Karnataka / AP' },
      { id: 'bigha_pucca', name: 'Bigha (Standard Pucca)', symbol: 'Bigha', factor: 27225, region: 'UP / Bihar / Punjab' },
      { id: 'bigha_kaccha', name: 'Bigha (Kaccha / Bengal)', symbol: 'Bigha (K)', factor: 14400, region: 'West Bengal / MP' },
      { id: 'biswa', name: 'Biswa (1/20th Bigha)', symbol: 'Biswa', factor: 1361.25, region: 'North India' },
      { id: 'cent', name: 'Cent', symbol: 'Cent', factor: 435.6, region: 'Tamil Nadu / Kerala' },
      { id: 'ground', name: 'Ground', symbol: 'Ground', factor: 2400, region: 'Tamil Nadu (Chennai)' },
      { id: 'acre', name: 'Acre', symbol: 'Acre', factor: 43560, region: 'Standard' },
      { id: 'hectare', name: 'Hectare', symbol: 'Ha', factor: 107639.104, region: 'Standard' },
      { id: 'sqm', name: 'Square Meter', symbol: 'sq m', factor: 10.7639, region: 'Standard' }
    ]
  },
  length: {
    name: 'Length & Distance',
    baseUnit: 'meter',
    units: [
      { id: 'meter', name: 'Meter', symbol: 'm', factor: 1 },
      { id: 'kilometer', name: 'Kilometer', symbol: 'km', factor: 1000 },
      { id: 'centimeter', name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { id: 'millimeter', name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { id: 'foot', name: 'Foot / Feet', symbol: 'ft', factor: 0.3048 },
      { id: 'inch', name: 'Inch', symbol: 'in', factor: 0.0254 },
      { id: 'yard', name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { id: 'mile', name: 'Mile', symbol: 'mi', factor: 1609.344 }
    ]
  },
  weight: {
    name: 'Weight & Gold Mass',
    baseUnit: 'gram',
    units: [
      { id: 'gram', name: 'Gram', symbol: 'g', factor: 1 },
      { id: 'kilogram', name: 'Kilogram', symbol: 'kg', factor: 1000 },
      { id: 'quintal', name: 'Quintal', symbol: 'q', factor: 100000, region: 'Indian Mandi' },
      { id: 'metric_ton', name: 'Metric Ton (Tonne)', symbol: 't', factor: 1000000 },
      { id: 'tola', name: 'Tola (Gold/Jewelry)', symbol: 'Tola', factor: 11.6638, region: 'Indian Bullion' },
      { id: 'ratti', name: 'Ratti (Gemstones)', symbol: 'Ratti', factor: 0.182, region: 'Indian Gemstones' },
      { id: 'pound', name: 'Pound (lb)', symbol: 'lb', factor: 453.592 },
      { id: 'ounce', name: 'Ounce (oz)', symbol: 'oz', factor: 28.3495 }
    ]
  },
  temperature: {
    name: 'Temperature',
    baseUnit: 'celsius',
    units: [
      { id: 'celsius', name: 'Celsius', symbol: '°C', factor: 1 },
      { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', factor: 1 },
      { id: 'kelvin', name: 'Kelvin', symbol: 'K', factor: 1 }
    ]
  },
  speed: {
    name: 'Speed & Velocity',
    baseUnit: 'kmh',
    units: [
      { id: 'kmh', name: 'Kilometers per Hour', symbol: 'km/h', factor: 1 },
      { id: 'ms', name: 'Meters per Second', symbol: 'm/s', factor: 3.6 },
      { id: 'mph', name: 'Miles per Hour', symbol: 'mph', factor: 1.60934 },
      { id: 'knot', name: 'Knot', symbol: 'kn', factor: 1.852 }
    ]
  }
};

export const UnitConverter: React.FC<UnitConverterProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [category, setCategory] = useState<UnitCategory>('land');
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnitId, setFromUnitId] = useState<string>('gaj');
  const [toUnitId, setToUnitId] = useState<string>('sqft');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync category changes
  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const units = UNIT_GROUPS[newCat].units;
    setFromUnitId(units[0].id);
    setToUnitId(units[1]?.id || units[0].id);
  };

  const currentGroup = UNIT_GROUPS[category];
  const fromUnit = currentGroup.units.find(u => u.id === fromUnitId) || currentGroup.units[0];
  const toUnit = currentGroup.units.find(u => u.id === toUnitId) || currentGroup.units[1] || currentGroup.units[0];

  // Convert calculation
  const calculateResult = (val: number, from: UnitDefinition, to: UnitDefinition, cat: UnitCategory): number => {
    if (isNaN(val)) return 0;
    if (from.id === to.id) return val;

    if (cat === 'temperature') {
      // Temp conversion
      let celsiusVal = val;
      if (from.id === 'fahrenheit') {
        celsiusVal = (val - 32) * (5 / 9);
      } else if (from.id === 'kelvin') {
        celsiusVal = val - 273.15;
      }

      if (to.id === 'celsius') return celsiusVal;
      if (to.id === 'fahrenheit') return (celsiusVal * (9 / 5)) + 32;
      if (to.id === 'kelvin') return celsiusVal + 273.15;
      return celsiusVal;
    }

    // Standard factor conversion
    const baseValue = val * from.factor;
    return baseValue / to.factor;
  };

  const convertedValue = calculateResult(inputValue, fromUnit, toUnit, category);

  // Quick swap
  const swapUnits = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  useEffect(() => {
    if (onResultChange) {
      const summary = `${inputValue} ${fromUnit.symbol} = ${convertedValue.toLocaleString('en-IN', { maximumFractionDigits: 4 })} ${toUnit.symbol}`;
      onResultChange(summary, { category, inputValue, fromUnit: fromUnit.id, toUnit: toUnit.id, result: convertedValue });
    }
  }, [category, inputValue, fromUnitId, toUnitId, convertedValue]);

  const copyToClipboard = () => {
    const text = `${inputValue} ${fromUnit.symbol} = ${convertedValue.toLocaleString('en-IN', { maximumFractionDigits: 4 })} ${toUnit.symbol}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 max-w-2xl">
        {(Object.keys(UNIT_GROUPS) as UnitCategory[]).map(catKey => (
          <button
            key={catKey}
            onClick={() => handleCategoryChange(catKey)}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all text-center ${
              category === catKey
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            {UNIT_GROUPS[catKey].name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Card */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              {currentGroup.name} Converter
            </h3>
            <button
              onClick={swapUnits}
              className="p-1.5 rounded-lg text-xs font-semibold text-accent hover:bg-accent/10 flex items-center gap-1 transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" /> Swap Units
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Enter Value to Convert
            </label>
            <input
              type="number"
              value={inputValue || ''}
              onChange={e => setInputValue(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-lg text-neutral-900 dark:text-white outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                From Unit
              </label>
              <select
                value={fromUnitId}
                onChange={e => setFromUnitId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
              >
                {currentGroup.units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.region ? `(${u.region})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                To Unit
              </label>
              <select
                value={toUnitId}
                onChange={e => setToUnitId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
              >
                {currentGroup.units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.region ? `(${u.region})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick All-Unit Conversion Table */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Equivalent in Other Common Units
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentGroup.units.filter(u => u.id !== fromUnitId).slice(0, 6).map(u => {
                const equiv = calculateResult(inputValue, fromUnit, u, category);
                return (
                  <button
                    key={u.id}
                    onClick={() => setToUnitId(u.id)}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-800 text-left hover:border-accent transition-colors"
                  >
                    <span className="text-[11px] text-neutral-500 block truncate">{u.name}</span>
                    <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200">
                      {equiv < 0.001 && equiv > 0
                        ? equiv.toExponential(2)
                        : equiv.toLocaleString('en-IN', { maximumFractionDigits: 3 })}{' '}
                      <span className="text-[10px] text-neutral-400">{u.symbol}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block">
                Converted Equivalent
              </span>
              <button
                onClick={copyToClipboard}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs flex items-center gap-1"
                title="Copy result"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mb-2 break-all">
              {convertedValue.toLocaleString('en-IN', { maximumFractionDigits: 4 })}
            </div>
            <p className="text-sm font-semibold text-accent mb-6">
              {toUnit.name} ({toUnit.symbol})
            </p>

            <div className="p-3.5 rounded-2xl bg-neutral-800/60 text-xs text-neutral-300 space-y-1.5 border border-neutral-700/50">
              <div className="text-neutral-400 font-medium">Conversion Formula:</div>
              <div className="font-mono text-[11px] text-neutral-200">
                1 {fromUnit.symbol} = {calculateResult(1, fromUnit, toUnit, category).toLocaleString('en-IN', { maximumFractionDigits: 5 })} {toUnit.symbol}
              </div>
              {fromUnit.region && (
                <div className="text-[10px] text-neutral-400 pt-1">
                  Region standard: {fromUnit.region}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
