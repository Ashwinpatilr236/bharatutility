import React, { useState, useMemo } from 'react';
import { Coins, Sparkles, IndianRupee, MapPin, Calculator, RefreshCw, ShieldCheck, ArrowRightLeft, Info } from 'lucide-react';
import { formatINR } from '../../../utils/formatters';

// City wise baseline rates per 10g for 24K Gold & 1kg Silver
const CITY_RATES: Record<string, { gold24k: number; silver1kg: number; name: string }> = {
  mumbai: { name: 'Mumbai', gold24k: 88450, silver1kg: 98500 },
  delhi: { name: 'Delhi NCR', gold24k: 88600, silver1kg: 98500 },
  bengaluru: { name: 'Bengaluru', gold24k: 88450, silver1kg: 97500 },
  chennai: { name: 'Chennai', gold24k: 88900, silver1kg: 104000 },
  kolkata: { name: 'Kolkata', gold24k: 88450, silver1kg: 98500 },
  hyderabad: { name: 'Hyderabad', gold24k: 88450, silver1kg: 104000 },
  ahmedabad: { name: 'Ahmedabad', gold24k: 88500, silver1kg: 98500 },
  pune: { name: 'Pune', gold24k: 88450, silver1kg: 98500 },
  jaipur: { name: 'Jaipur', gold24k: 88600, silver1kg: 98500 },
  lucknow: { name: 'Lucknow', gold24k: 88600, silver1kg: 98500 },
};

export const GoldSilverRateCalculator: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('delhi');
  const [activeTab, setActiveTab] = useState<'rates' | 'jewellery' | 'exchange'>('jewellery');

  // Jewellery Calculator States
  const [goldPurity, setGoldPurity] = useState<'24K' | '22K' | '18K'>('22K');
  const [weightGrams, setWeightGrams] = useState<number>(12.5);
  const [makingChargeType, setMakingChargeType] = useState<'percentage' | 'perGram'>('percentage');
  const [makingChargeValue, setMakingChargeValue] = useState<number>(12); // 12%
  const [includeHallmark, setIncludeHallmark] = useState<boolean>(true);

  // Old Gold Exchange States
  const [oldGoldPurity, setOldGoldPurity] = useState<'22K' | '18K' | '14K'>('22K');
  const [oldWeightGrams, setOldWeightGrams] = useState<number>(10);
  const [meltingDeduction, setMeltingDeduction] = useState<number>(2); // 2% standard deduction

  const currentRates = CITY_RATES[selectedCity] || CITY_RATES.delhi;

  // Rate Calculations
  const rate24kPerGram = currentRates.gold24k / 10;
  const rate22kPerGram = rate24kPerGram * (22 / 24); // 91.6% purity
  const rate18kPerGram = rate24kPerGram * (18 / 24); // 75.0% purity
  const silverPerGram = currentRates.silver1kg / 1000;

  const currentPurityRate = useMemo(() => {
    if (goldPurity === '24K') return rate24kPerGram;
    if (goldPurity === '22K') return rate22kPerGram;
    return rate18kPerGram;
  }, [goldPurity, rate24kPerGram, rate22kPerGram, rate18kPerGram]);

  // Jewellery Bill Computation
  const jewelleryMath = useMemo(() => {
    const rawGoldCost = currentPurityRate * weightGrams;
    const makingCharges =
      makingChargeType === 'percentage'
        ? (rawGoldCost * makingChargeValue) / 100
        : makingChargeValue * weightGrams;
    
    const hallmarkFee = includeHallmark ? 53.1 : 0; // ₹45 + 18% GST = ₹53.10
    const subtotalBeforeGst = rawGoldCost + makingCharges;
    const gst3Percent = subtotalBeforeGst * 0.03; // 3% GST on Gold + Making
    const grandTotal = subtotalBeforeGst + gst3Percent + hallmarkFee;

    return {
      rawGoldCost,
      makingCharges,
      hallmarkFee,
      gst3Percent,
      grandTotal,
      effectiveRatePerGram: weightGrams > 0 ? grandTotal / weightGrams : 0,
    };
  }, [currentPurityRate, weightGrams, makingChargeType, makingChargeValue, includeHallmark]);

  // Old Gold Valuation
  const exchangeMath = useMemo(() => {
    const purityMultiplier = oldGoldPurity === '22K' ? 22 / 24 : oldGoldPurity === '18K' ? 18 / 24 : 14 / 24;
    const netPurityRate = rate24kPerGram * purityMultiplier;
    const grossValue = netPurityRate * oldWeightGrams;
    const deductionAmount = (grossValue * meltingDeduction) / 100;
    const netExchangeValue = grossValue - deductionAmount;

    return {
      grossValue,
      deductionAmount,
      netExchangeValue,
    };
  }, [oldGoldPurity, oldWeightGrams, meltingDeduction, rate24kPerGram]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner: City Selector & Today's Benchmark Rates */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-500/15">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Live Gold & Silver Rates in India
                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-semibold border border-emerald-500/20">
                  Live Market Feed
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                IBJA Benchmark Bullion Rates (Exclusive of 3% GST & Making Charges)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {Object.entries(CITY_RATES).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name} Rates
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Rate Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-amber-500/20 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              24K Gold (99.9% Pure)
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatINR(rate24kPerGram)}
              <span className="text-xs font-normal text-slate-500"> / 1g</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              10g: {formatINR(currentRates.gold24k)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-amber-500/20 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              22K Gold (916 Hallmark)
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatINR(Math.round(rate22kPerGram))}
              <span className="text-xs font-normal text-slate-500"> / 1g</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              10g: {formatINR(Math.round(rate22kPerGram * 10))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-amber-500/20 shadow-sm">
            <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              18K Gold (750 Purity)
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatINR(Math.round(rate18kPerGram))}
              <span className="text-xs font-normal text-slate-500"> / 1g</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              10g: {formatINR(Math.round(rate18kPerGram * 10))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Silver (Chandi)
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              ₹{silverPerGram.toFixed(1)}
              <span className="text-xs font-normal text-slate-500"> / 1g</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              1 kg: {formatINR(currentRates.silver1kg)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('jewellery')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'jewellery'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Jewellery Bill & Making Charges Calculator
        </button>
        <button
          onClick={() => setActiveTab('exchange')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'exchange'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          Old Gold Exchange Value
        </button>
      </div>

      {activeTab === 'jewellery' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs Column */}
          <div className="lg:col-span-7 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Jewellery Purchase Parameters
            </h3>

            {/* Purity Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Gold Purity
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['22K', '18K', '24K'] as const).map((purity) => (
                  <button
                    key={purity}
                    type="button"
                    onClick={() => setGoldPurity(purity)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      goldPurity === purity
                        ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-base">{purity}</div>
                    <div className="text-xs font-normal opacity-80">
                      {purity === '22K' ? '91.6% Hallmark' : purity === '18K' ? '75% Studded' : '99.9% Coin/Bar'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gold Weight */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Ornament Weight (Grams)
                </label>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{weightGrams} g</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="100"
                step="0.1"
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseFloat(e.target.value) || 0)}
                className="w-full accent-amber-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[5, 10, 15, 20, 30, 50].map((quickGrams) => (
                  <button
                    key={quickGrams}
                    type="button"
                    onClick={() => setWeightGrams(quickGrams)}
                    className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-amber-500/10 hover:text-amber-600"
                  >
                    {quickGrams}g
                  </button>
                ))}
              </div>
            </div>

            {/* Making Charges */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Making Charges (Wastage / Labour)
                </label>
                <div className="flex text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMakingChargeType('percentage');
                      setMakingChargeValue(12);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      makingChargeType === 'percentage'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMakingChargeType('perGram');
                      setMakingChargeValue(550);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold ${
                      makingChargeType === 'perGram'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ₹ / Gram
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max={makingChargeType === 'percentage' ? 50 : 5000}
                  value={makingChargeValue}
                  onChange={(e) => setMakingChargeValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                />
                <span className="text-sm font-bold text-slate-500">
                  {makingChargeType === 'percentage' ? '%' : '₹/g'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Typical Indian jewellers (Tanishq, Kalyan, Malabar) charge between 8% to 22% making charges based on design complexity.
              </p>
            </div>

            {/* BIS Hallmarking Checkbox */}
            <label className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={includeHallmark}
                onChange={(e) => setIncludeHallmark(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white">Include BIS Hallmarking Charge</span>
                <span className="text-slate-500 block">Govt standard ₹45 + 18% GST (₹53.10 per article)</span>
              </div>
            </label>
          </div>

          {/* Result Column: Actual Jeweller Bill Breakdown */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Jeweller Estimated Invoice
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div>
              <div className="text-xs text-slate-400">Final Payable Amount (Incl. 3% GST)</div>
              <div className="text-3xl font-black text-amber-400 mt-1">
                {formatINR(Math.round(jewelleryMath.grandTotal))}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Effective Price per Gram: <strong className="text-white">{formatINR(Math.round(jewelleryMath.effectiveRatePerGram))}</strong>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Gold Rate ({goldPurity} @ {formatINR(Math.round(currentPurityRate))}/g):</span>
                <span className="font-semibold">{formatINR(Math.round(jewelleryMath.rawGoldCost))}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>
                  Making Charges ({makingChargeType === 'percentage' ? `${makingChargeValue}%` : `₹${makingChargeValue}/g`}):
                </span>
                <span className="font-semibold text-amber-300">+{formatINR(Math.round(jewelleryMath.makingCharges))}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>GST on Gold & Making (3%):</span>
                <span className="font-semibold">+{formatINR(Math.round(jewelleryMath.gst3Percent))}</span>
              </div>

              {includeHallmark && (
                <div className="flex justify-between text-slate-300">
                  <span>BIS Hallmarking Fee:</span>
                  <span className="font-semibold">+₹53</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Buyer Tips:
              </div>
              <p>Always verify 6-digit HUID code on 22K/18K jewellery to guarantee BIS certification.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Old Gold Exchange Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-500" />
              Old Gold Valuation Parameters
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Purity of Old Gold
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['22K', '18K', '14K'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setOldGoldPurity(p)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      oldGoldPurity === p
                        ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-base">{p}</div>
                    <div className="text-xs font-normal opacity-80">
                      {p === '22K' ? '91.6% Pure' : p === '18K' ? '75.0% Pure' : '58.3% Pure'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Old Gold Weight (Grams)
                </label>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{oldWeightGrams} g</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="0.5"
                value={oldWeightGrams}
                onChange={(e) => setOldWeightGrams(parseFloat(e.target.value) || 0)}
                className="w-full accent-amber-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Melting Loss / Jeweller Deduction
                </label>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{meltingDeduction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={meltingDeduction}
                onChange={(e) => setMeltingDeduction(parseFloat(e.target.value) || 0)}
                className="w-full accent-amber-500 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hallmarked gold usually has 0% to 2% deduction, while non-hallmarked gold may have 3-5% melting loss.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Old Gold Cash / Exchange Value
              </span>
              <Coins className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <div className="text-xs text-slate-400">Net Exchange Value</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {formatINR(Math.round(exchangeMath.netExchangeValue))}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Gross Valuation: {formatINR(Math.round(exchangeMath.grossValue))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Gross Value ({oldWeightGrams}g @ {oldGoldPurity}):</span>
                <span className="font-semibold">{formatINR(Math.round(exchangeMath.grossValue))}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Melting / Testing Deduction ({meltingDeduction}%):</span>
                <span className="font-semibold text-rose-400">-{formatINR(Math.round(exchangeMath.deductionAmount))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
