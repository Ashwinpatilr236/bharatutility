import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Droplet, Flame, HeartPulse, Sparkles, Check, Copy, AlertTriangle, CheckCircle2, Info, IndianRupee } from 'lucide-react';

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

export const HomeAndHealthSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. WATER TANK MOTOR FILLING TIME STATE ---
  const [tankCapacityLitres, setTankCapacityLitres] = useState<number>(1000);
  const [motorHP, setMotorHP] = useState<number>(1.0); // 0.5, 0.75, 1.0, 1.5, 2.0 HP
  const [deliveryHeightFeet, setDeliveryHeightFeet] = useState<number>(30); // 2-3 floors ~ 30 ft
  const [pipeDiameterInches, setPipeDiameterInches] = useState<number>(1.0); // 0.75 or 1 or 1.25 inch

  // --- 2. LPG CYLINDER STATE ---
  const [cylinderType, setCylinderType] = useState<'domestic' | 'commercial'>('domestic');
  const [cylinderCountYear, setCylinderCountYear] = useState<number>(10);
  const [isUjjwalaBeneficiary, setIsUjjwalaBeneficiary] = useState<boolean>(false);
  const [basePriceDomestic, setBasePriceDomestic] = useState<number>(850);
  const [basePriceCommercial, setBasePriceCommercial] = useState<number>(1780);

  // --- 3. BMI INDIAN HEALTH STATE ---
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(28);

  // ================= 1. WATER TANK CALCULATION =================
  const waterTankResult = useMemo(() => {
    // Standard Indian Submersible / Monoblock discharge rate:
    // 0.5 HP ~ 20-25 Litres/minute @ 30ft
    // 1.0 HP ~ 45-55 Litres/minute @ 30ft
    // 1.5 HP ~ 70-85 Litres/minute @ 30ft
    // 2.0 HP ~ 100-120 Litres/minute @ 30ft
    const baseFlowRateLpm = motorHP * 50; // Litres per min benchmark
    // Height head loss factor
    const headFactor = Math.max(0.6, 1 - (deliveryHeightFeet - 20) * 0.008);
    const effectiveFlowRateLpm = baseFlowRateLpm * headFactor * (pipeDiameterInches >= 1 ? 1 : 0.85);

    const fillingTimeMinutes = Math.max(1, Math.round(tankCapacityLitres / effectiveFlowRateLpm));
    // Power consumption (1 HP ~ 0.746 kW)
    const powerKw = motorHP * 0.746;
    const unitsPerFill = (powerKw * (fillingTimeMinutes / 60)).toFixed(2);
    const electricityCostPerFill = (Number(unitsPerFill) * 7.5).toFixed(1); // @ ₹7.5/unit

    return {
      tankCapacityLitres,
      effectiveFlowRateLpm: Math.round(effectiveFlowRateLpm),
      fillingTimeMinutes,
      unitsPerFill,
      electricityCostPerFill,
    };
  }, [tankCapacityLitres, motorHP, deliveryHeightFeet, pipeDiameterInches]);

  // ================= 2. LPG CYLINDER CALCULATION =================
  const lpgResult = useMemo(() => {
    // PM Ujjwala subsidy in India is ₹300 per 14.2kg cylinder (up to 12 cylinders/yr)
    const subsidyPerCylinder = isUjjwalaBeneficiary && cylinderType === 'domestic' ? 300 : 0;
    const activeBasePrice = cylinderType === 'domestic' ? basePriceDomestic : basePriceCommercial;
    const netPricePerCylinder = Math.max(0, activeBasePrice - subsidyPerCylinder);
    const totalAnnualCost = netPricePerCylinder * cylinderCountYear;
    const totalAnnualSubsidy = subsidyPerCylinder * cylinderCountYear;

    return {
      cylinderType,
      activeBasePrice,
      subsidyPerCylinder,
      netPricePerCylinder,
      totalAnnualCost,
      totalAnnualSubsidy,
      weightKg: cylinderType === 'domestic' ? 14.2 : 19.0,
    };
  }, [cylinderType, cylinderCountYear, isUjjwalaBeneficiary, basePriceDomestic, basePriceCommercial]);

  // ================= 3. INDIAN BMI CALCULATION =================
  const bmiResult = useMemo(() => {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiFormatted = bmi.toFixed(1);

    // ICMR / WHO South Asian Guidelines for Indian adults:
    // Underweight: < 18.5
    // Normal: 18.5 - 22.9
    // Overweight: 23.0 - 24.9
    // Obese: >= 25.0
    let category = 'Normal Weight';
    let categoryColor = 'text-emerald-400';
    let badgeBg = 'bg-emerald-500/20 text-emerald-300';
    let recommendation = 'Your BMI is optimal according to ICMR Indian standards. Maintain a balanced diet and regular physical activity.';

    if (bmi < 18.5) {
      category = 'Underweight';
      categoryColor = 'text-cyan-400';
      badgeBg = 'bg-cyan-500/20 text-cyan-300';
      recommendation = 'You are below the recommended Indian healthy weight range. Consider nutrient-dense wholesome meals.';
    } else if (bmi >= 23.0 && bmi < 25.0) {
      category = 'Overweight (Indian Cutoff)';
      categoryColor = 'text-amber-400';
      badgeBg = 'bg-amber-500/20 text-amber-300';
      recommendation = 'In South Asian populations, health risks rise above 23 BMI. Incorporate 30 minutes of daily cardio.';
    } else if (bmi >= 25.0) {
      category = 'Obese Class I/II';
      categoryColor = 'text-rose-400';
      badgeBg = 'bg-rose-500/20 text-rose-300';
      recommendation = 'Your BMI is above 25.0. Focus on portion control, reducing refined sugars, and consulting a physician.';
    }

    // Ideal weight range for this height (18.5 to 22.9 BMI)
    const minIdealWeight = (18.5 * heightM * heightM).toFixed(1);
    const maxIdealWeight = (22.9 * heightM * heightM).toFixed(1);

    return {
      bmi: bmiFormatted,
      category,
      categoryColor,
      badgeBg,
      recommendation,
      minIdealWeight,
      maxIdealWeight,
    };
  }, [heightCm, weightKg]);

  return (
    <div className="space-y-8">
      {/* ================= 1. WATER TANK MOTOR TIME ================= */}
      {slug === 'water-tank-filling-time-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <Droplet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Water Tank & Motor Pump Parameters</h3>
                <p className="text-xs text-slate-400">Calculate tank filling duration & power units</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Overhead Tank Capacity</span>
                  <span className="font-mono font-bold text-blue-400">{tankCapacityLitres} Litres</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 1500, 2000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTankCapacityLitres(val)}
                      className={`py-2 text-xs font-semibold rounded-xl border ${
                        tankCapacityLitres === val ? 'bg-blue-500/20 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {val} L
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Motor Pump Horsepower (HP)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1.0, 1.5, 2.0].map(hp => (
                    <button
                      key={hp}
                      type="button"
                      onClick={() => setMotorHP(hp)}
                      className={`py-2 text-xs font-semibold rounded-xl border ${
                        motorHP === hp ? 'bg-blue-500/20 border-blue-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      {hp} HP {hp === 1.0 ? '(Common)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Height Head (Feet)</label>
                  <input
                    type="number"
                    value={deliveryHeightFeet}
                    onChange={(e) => setDeliveryHeightFeet(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pipe Diameter (Inch)</label>
                  <select
                    value={pipeDiameterInches}
                    onChange={(e) => setPipeDiameterInches(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value={0.75}>0.75 Inch (3/4&quot;)</option>
                    <option value={1.0}>1.0 Inch (Standard)</option>
                    <option value={1.25}>1.25 Inch</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-blue-950/40 border-2 border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                Estimated Tank Filling Time
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {waterTankResult.fillingTimeMinutes} Minutes
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Flow Discharge Rate:</span>
                  <span className="font-bold text-white mt-1 block">~{waterTankResult.effectiveFlowRateLpm} Litres/min</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Electricity per Fill:</span>
                  <span className="font-bold text-emerald-400 mt-1 block">{waterTankResult.unitsPerFill} Units (₹{waterTankResult.electricityCostPerFill})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. LPG CYLINDER ================= */}
      {slug === 'lpg-cylinder-price-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">LPG Gas Cylinder & Subsidy</h3>
                <p className="text-xs text-slate-400">Domestic 14.2kg, Commercial 19kg & PM Ujjwala</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Cylinder Category</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCylinderType('domestic')}
                    className={`p-3 rounded-xl border text-left ${
                      cylinderType === 'domestic' ? 'bg-rose-500/20 border-rose-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-sm">Domestic (14.2 kg)</div>
                    <div className="text-[10px] text-slate-400">Household Kitchen</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCylinderType('commercial')}
                    className={`p-3 rounded-xl border text-left ${
                      cylinderType === 'commercial' ? 'bg-rose-500/20 border-rose-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-sm">Commercial (19 kg)</div>
                    <div className="text-[10px] text-slate-400">Hotel / Restaurant</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Estimated Annual Cylinders Used</span>
                  <span className="font-mono font-bold text-rose-400">{cylinderCountYear} Cylinders</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={cylinderCountYear}
                  onChange={(e) => setCylinderCountYear(Number(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {cylinderType === 'domestic' && (
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2 border-t border-slate-800">
                  <input
                    type="checkbox"
                    checked={isUjjwalaBeneficiary}
                    onChange={(e) => setIsUjjwalaBeneficiary(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-rose-500 w-4 h-4"
                  />
                  <span>PM Ujjwala Yojana Beneficiary (₹300 Subsidy per cylinder)</span>
                </label>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-rose-950/40 border-2 border-rose-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                Net Cylinder Price & Annual Budget
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {formatINR(lpgResult.netPricePerCylinder)} <span className="text-xs text-slate-400 font-normal">/ refill</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Total Annual Cost:</span>
                  <span className="font-bold text-white mt-1 block">{formatINR(lpgResult.totalAnnualCost)}</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Annual Subsidy Saved:</span>
                  <span className="font-bold text-emerald-400 mt-1 block">{formatINR(lpgResult.totalAnnualSubsidy)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. INDIAN BMI ================= */}
      {slug === 'bmi-indian-health-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Body Parameters (Indian ICMR Cutoffs)</h3>
                <p className="text-xs text-slate-400">South Asian BMI & Ideal Body Weight Standards</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your Body Mass Index (BMI)
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bmiResult.badgeBg}`}>
                  {bmiResult.category}
                </span>
              </div>

              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white">
                {bmiResult.bmi} <span className="text-sm font-normal text-slate-400">kg/m²</span>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <p>{bmiResult.recommendation}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400">
                  <span>Ideal Weight for {heightCm} cm:</span>
                  <span className="font-bold text-emerald-400">{bmiResult.minIdealWeight} - {bmiResult.maxIdealWeight} kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
