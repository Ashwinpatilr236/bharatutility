import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { calculateJewelleryPrice } from '../../utils/goldPricing';
import { Zap, Sun, Coins, Banknote, Sparkles, Check, Copy, RefreshCw, Calculator, IndianRupee } from 'lucide-react';

interface Props {
  tool: Tool;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(val));
};

export const EnergyAndJewelrySuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. ELECTRICITY BILL CALCULATOR STATE ---
  const [unitsConsumed, setUnitsConsumed] = useState<number>(240);
  const [fixedCharge, setFixedCharge] = useState<number>(110);
  const [dutyPercent, setDutyPercent] = useState<number>(5);
  // Appliance calculator inputs
  const [acHours, setAcHours] = useState<number>(6); // 1.5 Ton AC ~ 1.5 kW
  const [fanCount, setFanCount] = useState<number>(3); // 75W * count * 12 hrs
  const [fridgeHours, setFridgeHours] = useState<number>(24); // ~1.2 kWh/day
  const [geyserHours, setGeyserHours] = useState<number>(1); // 2 kW

  // --- 2. SOLAR ROOFTOP CALCULATOR STATE ---
  const [currentMonthlyBill, setCurrentMonthlyBill] = useState<number>(3500);
  const [solarCapacityKW, setSolarCapacityKW] = useState<number>(3);

  // --- 3. GOLD & JEWELLERY CALCULATOR STATE ---
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(10);
  const [purityKarats, setPurityKarats] = useState<24 | 22 | 18>(22);
  const [baseGoldRate24k, setBaseGoldRate24k] = useState<number>(7250); // per gram for 24K
  const [makingChargePct, setMakingChargePct] = useState<number>(12); // %
  const [hallmarkingFee, setHallmarkingFee] = useState<number>(45); // statutory BIS charge

  // --- 4. CASH DENOMINATION COUNTER STATE ---
  const [notes500, setNotes500] = useState<number>(10);
  const [notes200, setNotes200] = useState<number>(15);
  const [notes100, setNotes100] = useState<number>(25);
  const [notes50, setNotes50] = useState<number>(20);
  const [notes20, setNotes20] = useState<number>(30);
  const [notes10, setNotes10] = useState<number>(50);

  // ================= CALCULATION 1: ELECTRICITY =================
  const electricityResult = useMemo(() => {
    const units = Math.max(0, unitsConsumed);
    // Indian standard tiered slab calculation:
    // 0 - 100 units @ ₹3.50/unit
    // 101 - 200 units @ ₹5.50/unit
    // 201 - 400 units @ ₹7.50/unit
    // 401+ units @ ₹9.50/unit
    let energyCharges = 0;
    const slab1 = Math.min(units, 100);
    const slab2 = Math.min(Math.max(0, units - 100), 100);
    const slab3 = Math.min(Math.max(0, units - 200), 200);
    const slab4 = Math.max(0, units - 400);

    energyCharges += slab1 * 3.5;
    energyCharges += slab2 * 5.5;
    energyCharges += slab3 * 7.5;
    energyCharges += slab4 * 9.5;

    const fuelAdjustmentCharge = units * 0.45; // FAC ~ ₹0.45/unit
    const subtotal = energyCharges + fixedCharge + fuelAdjustmentCharge;
    const dutyAmount = (subtotal * dutyPercent) / 100;
    const totalBill = subtotal + dutyAmount;

    // Appliance breakdown
    const acUnitsPerMonth = (1.5 * acHours * 30);
    const fanUnitsPerMonth = ((fanCount * 75 * 12 * 30) / 1000);
    const fridgeUnitsPerMonth = (1.2 * 30);
    const geyserUnitsPerMonth = (2.0 * geyserHours * 30);
    const estimatedApplianceTotalUnits = Math.round(acUnitsPerMonth + fanUnitsPerMonth + fridgeUnitsPerMonth + geyserUnitsPerMonth);

    return {
      units,
      energyCharges: Math.round(energyCharges),
      fixedCharge,
      fuelAdjustmentCharge: Math.round(fuelAdjustmentCharge),
      dutyAmount: Math.round(dutyAmount),
      totalBill: Math.round(totalBill),
      avgCostPerUnit: units > 0 ? (totalBill / units).toFixed(2) : '0',
      acUnitsPerMonth: Math.round(acUnitsPerMonth),
      fanUnitsPerMonth: Math.round(fanUnitsPerMonth),
      fridgeUnitsPerMonth: Math.round(fridgeUnitsPerMonth),
      geyserUnitsPerMonth: Math.round(geyserUnitsPerMonth),
      estimatedApplianceTotalUnits,
    };
  }, [unitsConsumed, fixedCharge, dutyPercent, acHours, fanCount, fridgeHours, geyserHours]);

  // ================= CALCULATION 2: SOLAR ROOFTOP =================
  const solarResult = useMemo(() => {
    // 1 kW solar generates ~4 units/day = ~120 units/month
    const monthlyUnitsGenerated = solarCapacityKW * 120;
    const annualUnitsGenerated = monthlyUnitsGenerated * 12;
    // Avg grid rate in India ~ ₹7.5/unit
    const monthlyBillSavings = Math.min(currentMonthlyBill, monthlyUnitsGenerated * 7.5);
    const annualBillSavings = monthlyBillSavings * 12;

    // Cost of solar setup (~ ₹60,000 per kW benchmark)
    const grossSystemCost = solarCapacityKW * 60000;
    
    // PM Surya Ghar Central Government Subsidy Scheme (2024-2026):
    // 1 kW: ₹30,000
    // 2 kW: ₹60,000
    // 3 kW+: ₹78,000 (capped at ₹78,000)
    let subsidyAmount = 0;
    if (solarCapacityKW <= 1) {
      subsidyAmount = 30000;
    } else if (solarCapacityKW <= 2) {
      subsidyAmount = 60000;
    } else {
      subsidyAmount = 78000;
    }

    const netCustomerCost = Math.max(0, grossSystemCost - subsidyAmount);
    const paybackYears = annualBillSavings > 0 ? (netCustomerCost / annualBillSavings).toFixed(1) : '0';
    const lifetime25YrSavings = annualBillSavings * 25 - netCustomerCost;
    const roofAreaRequiredSqFt = solarCapacityKW * 100; // ~100 sq ft per kW

    return {
      solarCapacityKW,
      monthlyUnitsGenerated,
      annualUnitsGenerated,
      monthlyBillSavings: Math.round(monthlyBillSavings),
      annualBillSavings: Math.round(annualBillSavings),
      grossSystemCost,
      subsidyAmount,
      netCustomerCost,
      paybackYears,
      lifetime25YrSavings: Math.max(0, Math.round(lifetime25YrSavings)),
      roofAreaRequiredSqFt,
    };
  }, [currentMonthlyBill, solarCapacityKW]);

  // ================= CALCULATION 3: GOLD & JEWELLERY (Shared Engine: src/utils/goldPricing.ts) =================
  const goldResult = useMemo(() => {
    const result = calculateJewelleryPrice({
      weightGrams: goldWeightGrams,
      base24kRatePerGram: baseGoldRate24k,
      karat: purityKarats,
      makingChargeValue: makingChargePct,
      makingChargeType: 'percentage',
      hallmarkingFee,
      gstRatePercent: 3,
    });

    return {
      effectiveRatePerGram: Math.round(result.effectiveRatePerGram),
      rawGoldValue: Math.round(result.rawGoldValue),
      makingCharges: Math.round(result.makingCharges),
      hallmarkingFee: result.hallmarkingFee,
      taxableSubtotal: Math.round(result.taxableSubtotal),
      gstAmount: Math.round(result.gstAmount),
      finalJewelleryPrice: Math.round(result.finalJewelleryPrice),
      costPerGramAllInclusive: Math.round(result.costPerGramAllInclusive),
    };
  }, [goldWeightGrams, purityKarats, baseGoldRate24k, makingChargePct, hallmarkingFee]);

  // ================= CALCULATION 4: CASH TALLY =================
  const cashResult = useMemo(() => {
    const total500 = notes500 * 500;
    const total200 = notes200 * 200;
    const total100 = notes100 * 100;
    const total50 = notes50 * 50;
    const total20 = notes20 * 20;
    const total10 = notes10 * 10;

    const totalNotesCount = notes500 + notes200 + notes100 + notes50 + notes20 + notes10;
    const grandTotalCash = total500 + total200 + total100 + total50 + total20 + total10;

    return {
      total500,
      total200,
      total100,
      total50,
      total20,
      total10,
      totalNotesCount,
      grandTotalCash,
    };
  }, [notes500, notes200, notes100, notes50, notes20, notes10]);

  return (
    <div className="space-y-8">
      {/* ================= 1. ELECTRICITY BILL CALCULATOR ================= */}
      {slug === 'electricity-bill-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Monthly Power Units & Charges</h3>
                <p className="text-xs text-slate-400">Standard Indian DISCOM slab tariff calculator</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span>Monthly Meter Units (kWh)</span>
                  <span className="font-mono text-amber-400 font-bold">{unitsConsumed} Units</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={1200}
                  step={10}
                  value={unitsConsumed}
                  onChange={(e) => setUnitsConsumed(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex gap-2 mt-2">
                  {[100, 180, 250, 400, 600].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setUnitsConsumed(val)}
                      className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                    >
                      {val} U
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Fixed Meter Charge (₹)</label>
                  <input
                    type="number"
                    value={fixedCharge}
                    onChange={(e) => setFixedCharge(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Electricity Duty (%)</label>
                  <input
                    type="number"
                    value={dutyPercent}
                    onChange={(e) => setDutyPercent(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              {/* Quick Appliance Estimator Accordion */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Estimate by Major Appliances
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">1.5 Ton AC (hrs/day)</span>
                    <input
                      type="number"
                      value={acHours}
                      onChange={(e) => setAcHours(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <span className="text-slate-400 block mb-1">Ceiling Fans (count)</span>
                    <input
                      type="number"
                      value={fanCount}
                      onChange={(e) => setFanCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUnitsConsumed(electricityResult.estimatedApplianceTotalUnits)}
                  className="w-full text-xs py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-amber-500/20 font-medium transition-colors"
                >
                  Apply Appliance Estimate ({electricityResult.estimatedApplianceTotalUnits} Units/mo)
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Estimated Monthly Electricity Bill
                  </span>
                  <span className="text-xs text-slate-400">Total Consumption: {electricityResult.units} Units</span>
                </div>
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                  {formatINR(electricityResult.totalBill)}
                </span>
              </div>

              {/* Bill Details Breakdown */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Energy Charges (Slab Rates):</span>
                  <span className="font-mono text-slate-200">{formatINR(electricityResult.energyCharges)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Fixed / Meter Rent Charges:</span>
                  <span className="font-mono text-slate-200">{formatINR(electricityResult.fixedCharge)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">FPPPA / Fuel Surcharge (FAC):</span>
                  <span className="font-mono text-slate-200">{formatINR(electricityResult.fuelAdjustmentCharge)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Electricity Duty ({dutyPercent}%):</span>
                  <span className="font-mono text-amber-400">{formatINR(electricityResult.dutyAmount)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Effective Average Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">₹{electricityResult.avgCostPerUnit} / Unit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. SOLAR ROOFTOP CALCULATOR ================= */}
      {slug === 'solar-rooftop-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Solar Panel & PM Surya Ghar Subsidy</h3>
                <p className="text-xs text-slate-400">Calculate 1kW, 2kW, 3kW solar savings & ROI</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span>Current Average Monthly Electricity Bill</span>
                  <span className="font-mono text-emerald-400 font-bold">{formatINR(currentMonthlyBill)}</span>
                </label>
                <input
                  type="range"
                  min={1000}
                  max={25000}
                  step={500}
                  value={currentMonthlyBill}
                  onChange={(e) => setCurrentMonthlyBill(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Recommended Solar Capacity (kW)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 5].map(kw => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setSolarCapacityKW(kw)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        solarCapacityKW === kw
                          ? 'bg-yellow-500/20 border-yellow-500 text-white font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="text-base font-bold">{kw} kW</div>
                      <div className="text-[10px] text-yellow-400 mt-0.5">{kw * 120} U/mo</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Solar Subsidy & Payback Summary */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-yellow-950/30 border-2 border-yellow-500/30 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                  PM Surya Ghar Subsidy Breakdown
                </span>
                <span className="text-xs text-slate-400">Area: ~{solarResult.roofAreaRequiredSqFt} sq ft</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Central Govt Subsidy</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 block">
                    {formatINR(solarResult.subsidyAmount)}
                  </span>
                  <span className="text-[10px] text-slate-400">(Direct DBT to Bank)</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Your Net Investment</span>
                  <span className="text-xl font-bold font-mono text-white block">
                    {formatINR(solarResult.netCustomerCost)}
                  </span>
                  <span className="text-[10px] text-slate-400">(After Subsidy)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Monthly Bill Savings:</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatINR(solarResult.monthlyBillSavings)} / month</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Estimated Payback Period:</span>
                  <span className="font-bold text-yellow-400">{solarResult.paybackYears} Years (Free Power After)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">25-Year Net Profit & Savings:</span>
                  <span className="font-bold text-emerald-300 font-mono">{formatINR(solarResult.lifetime25YrSavings)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. GOLD & JEWELLERY CALCULATOR ================= */}
      {slug === 'gold-jewellery-price-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400 border border-yellow-500/20">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Gold Jewellery Price & Making Charges</h3>
                <p className="text-xs text-slate-400">22K 916 Hallmark, 18K, Making Charges & 3% GST</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Gold Weight (Grams)</label>
                <input
                  type="number"
                  step={0.1}
                  value={goldWeightGrams}
                  onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Gold Purity (Karats)</label>
                <select
                  value={purityKarats}
                  onChange={(e) => setPurityKarats(Number(e.target.value) as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-yellow-400 font-semibold"
                >
                  <option value={22}>22K (91.6% BIS 916)</option>
                  <option value={24}>24K (99.9% Pure Bar)</option>
                  <option value={18}>18K (75.0% Diamond Ornaments)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">24K Gold Rate (₹/Gram)</label>
                <input
                  type="number"
                  value={baseGoldRate24k}
                  onChange={(e) => setBaseGoldRate24k(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Making Charges (%)</label>
                <input
                  type="number"
                  value={makingChargePct}
                  onChange={(e) => setMakingChargePct(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Jewellery Bill Breakdown */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-yellow-950/40 border-2 border-yellow-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex justify-between items-baseline border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
                  Total Final Jewellery Price
                </span>
                <span className="text-3xl font-extrabold font-mono text-white">
                  {formatINR(goldResult.finalJewelleryPrice)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">{purityKarats}K Rate per Gram:</span>
                  <span className="font-mono text-slate-200">₹{goldResult.effectiveRatePerGram.toLocaleString('en-IN')} / gm</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Raw Gold Value ({goldWeightGrams}g):</span>
                  <span className="font-mono text-slate-200">{formatINR(goldResult.rawGoldValue)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Making Charges ({makingChargePct}%):</span>
                  <span className="font-mono text-yellow-400">{formatINR(goldResult.makingCharges)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Hallmarking Fee:</span>
                  <span className="font-mono text-slate-200">₹{goldResult.hallmarkingFee}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">GST (3% on Gold & Making):</span>
                  <span className="font-mono text-amber-400">{formatINR(goldResult.gstAmount)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Effective All-Inclusive Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">₹{goldResult.costPerGramAllInclusive.toLocaleString('en-IN')} / gm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. CASH DENOMINATION TALLY COUNTER ================= */}
      {slug === 'cash-denomination-tally-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Notes Input Table */}
          <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Cash Note Denominations</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotes500(0); setNotes200(0); setNotes100(0);
                  setNotes50(0); setNotes20(0); setNotes10(0);
                }}
                className="text-xs px-2.5 py-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { denom: 500, val: notes500, set: setNotes500, total: cashResult.total500 },
                { denom: 200, val: notes200, set: setNotes200, total: cashResult.total200 },
                { denom: 100, val: notes100, set: setNotes100, total: cashResult.total100 },
                { denom: 50, val: notes50, set: setNotes50, total: cashResult.total50 },
                { denom: 20, val: notes20, set: setNotes20, total: cashResult.total20 },
                { denom: 10, val: notes10, set: setNotes10, total: cashResult.total10 },
              ].map((row) => (
                <div key={row.denom} className="flex items-center gap-3 p-2 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="w-20 font-bold text-sm text-emerald-400">
                    ₹{row.denom} ×
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={row.val || ''}
                    onChange={(e) => row.set(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex-1 text-right font-mono font-bold text-white text-sm">
                    = {formatINR(row.total)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tally Total Display */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Total Cash In Hand
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {formatINR(cashResult.grandTotalCash)}
              </div>
              <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
                <span>Total Note Count:</span>
                <span className="font-bold text-white">{cashResult.totalNotesCount} Notes</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
