import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { Car, BatteryCharging, Fuel, Settings, IndianRupee, TrendingDown, Info, Calculator, Check, Copy } from 'lucide-react';

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

export const EvTcoCalculator: React.FC<Props> = ({ onResultChange }) => {
  // Common inputs
  const [dailyKm, setDailyKm] = useState<number>(50);
  const [ownershipYears, setOwnershipYears] = useState<number>(5);

  // Petrol Car inputs
  const [petrolPrice, setPetrolPrice] = useState<number>(100);
  const [petrolMileage, setPetrolMileage] = useState<number>(15);
  const [petrolCarCost, setPetrolCarCost] = useState<number>(1000000);
  const [petrolMaintenance, setPetrolMaintenance] = useState<number>(10000); // per year

  // EV inputs
  const [evCost, setEvCost] = useState<number>(1400000);
  const [electricityRate, setElectricityRate] = useState<number>(8); // per kWh
  const [evEfficiency, setEvEfficiency] = useState<number>(7); // km per kWh
  const [evMaintenance, setEvMaintenance] = useState<number>(4000); // per year

  const [copied, setCopied] = useState<boolean>(false);

  const {
    totalKm,
    petrolRunningCost,
    evRunningCost,
    petrolTotalMaint,
    evTotalMaint,
    petrolTco,
    evTco,
    savings,
    breakevenKm,
    breakevenYears
  } = useMemo(() => {
    const totalKm = dailyKm * 365 * ownershipYears;
    
    // Running Costs
    const petrolCostPerKm = petrolPrice / petrolMileage;
    const petrolRunningCost = petrolCostPerKm * totalKm;
    
    const evCostPerKm = electricityRate / evEfficiency;
    const evRunningCost = evCostPerKm * totalKm;

    // Maintenance Costs
    const petrolTotalMaint = petrolMaintenance * ownershipYears;
    const evTotalMaint = evMaintenance * ownershipYears;

    // Total Cost of Ownership (TCO) - Assuming full cash purchase for simplicity
    const petrolTco = petrolCarCost + petrolRunningCost + petrolTotalMaint;
    const evTco = evCost + evRunningCost + evTotalMaint;

    const savings = petrolTco - evTco;

    // Breakeven Analysis
    const costDiff = evCost - petrolCarCost;
    const savingsPerKm = petrolCostPerKm - evCostPerKm;
    
    let breakevenKm = 0;
    let breakevenYears = 0;
    
    if (costDiff > 0 && savingsPerKm > 0) {
      breakevenKm = costDiff / savingsPerKm;
      breakevenYears = breakevenKm / (dailyKm * 365);
    }

    return {
      totalKm,
      petrolRunningCost,
      evRunningCost,
      petrolTotalMaint,
      evTotalMaint,
      petrolTco,
      evTco,
      savings,
      breakevenKm,
      breakevenYears
    };
  }, [dailyKm, ownershipYears, petrolPrice, petrolMileage, petrolCarCost, petrolMaintenance, evCost, electricityRate, evEfficiency, evMaintenance]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`EV vs Petrol Savings: ${formatINR(savings)} over ${ownershipYears} years`);
    }
  }, [savings, ownershipYears, onResultChange]);

  const copyToClipboard = () => {
    const text = `🚗 EV vs Petrol Cost Breakdown (${ownershipYears} Years)
- Total Distance: ${totalKm.toLocaleString()} KM
- Petrol TCO: ${formatINR(petrolTco)}
- EV TCO: ${formatINR(evTco)}

✅ Total EV Savings: ${formatINR(savings)}
📈 Break-even Time: ${breakevenYears > 0 ? breakevenYears.toFixed(1) + ' Years' : 'Immediate'}

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Usage Profile */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-400" /> Usage Profile
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Daily Driving (KM)</label>
              <input
                type="number" value={dailyKm} onChange={(e) => setDailyKm(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Ownership (Years)</label>
              <input
                type="number" value={ownershipYears} onChange={(e) => setOwnershipYears(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Petrol Car Details */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 border-l-4 border-l-rose-500">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Fuel className="w-4 h-4 text-rose-400" /> Petrol Car Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Car On-Road Price (₹)</label>
              <input
                type="number" value={petrolCarCost} onChange={(e) => setPetrolCarCost(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Real Mileage (km/l)</label>
              <input
                type="number" value={petrolMileage} onChange={(e) => setPetrolMileage(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Petrol Price (₹/L)</label>
              <input
                type="number" value={petrolPrice} onChange={(e) => setPetrolPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Yearly Maintenance (₹)</label>
              <input
                type="number" value={petrolMaintenance} onChange={(e) => setPetrolMaintenance(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* EV Details */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 border-l-4 border-l-emerald-500">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-emerald-400" /> Electric Vehicle Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">EV On-Road Price (₹)</label>
              <input
                type="number" value={evCost} onChange={(e) => setEvCost(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Efficiency (km/kWh)</label>
              <input
                type="number" value={evEfficiency} onChange={(e) => setEvEfficiency(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Electricity Rate (₹/kWh)</label>
              <input
                type="number" value={electricityRate} onChange={(e) => setElectricityRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Yearly Maintenance (₹)</label>
              <input
                type="number" value={evMaintenance} onChange={(e) => setEvMaintenance(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Results Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-800 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {ownershipYears}-Year Cost Comparison
            </h4>
            <Car className="w-5 h-5 text-slate-500" />
          </div>

          <div className="space-y-4">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-rose-500/20">
              <span className="text-xs font-semibold text-rose-400 mb-1 block">Petrol TCO</span>
              <span className="text-2xl font-black text-rose-300 font-mono">{formatINR(petrolTco)}</span>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>Fuel: {formatINR(petrolRunningCost)}</span>
                <span>Maint: {formatINR(petrolTotalMaint)}</span>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-emerald-500/20">
              <span className="text-xs font-semibold text-emerald-400 mb-1 block">EV TCO</span>
              <span className="text-2xl font-black text-emerald-300 font-mono">{formatINR(evTco)}</span>
              <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                <span>Power: {formatINR(evRunningCost)}</span>
                <span>Maint: {formatINR(evTotalMaint)}</span>
              </div>
            </div>
          </div>

          <div className={`p-5 rounded-xl border ${savings > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'} flex flex-col items-center justify-center text-center`}>
            <span className="text-sm font-semibold text-slate-300 mb-1">
              {savings > 0 ? 'Total Savings with EV' : 'Total Loss with EV'}
            </span>
            <div className={`text-4xl font-black font-mono tracking-tight ${savings > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatINR(Math.abs(savings))}
            </div>
          </div>

          {breakevenYears > 0 && savings > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
              <TrendingDown className="w-5 h-5 text-blue-400 shrink-0" />
              <div className="text-xs text-blue-300 leading-relaxed">
                You will recover the extra <strong>{formatINR(evCost - petrolCarCost)}</strong> spent on the EV in <strong>{breakevenYears.toFixed(1)} years</strong> (after driving {breakevenKm.toLocaleString(undefined, {maximumFractionDigits:0})} km).
              </div>
            </div>
          )}

          <button
            onClick={copyToClipboard}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
