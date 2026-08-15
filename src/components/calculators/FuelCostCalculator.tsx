import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Fuel, Users, MapPin, Navigation, Car, Gauge, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface FuelCostCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

interface RoutePreset {
  name: string;
  distanceKm: number;
  tollEstimate: number;
}

const POPULAR_ROUTES: RoutePreset[] = [
  { name: 'Mumbai ⇄ Goa', distanceKm: 580, tollEstimate: 650 },
  { name: 'Delhi ⇄ Jaipur', distanceKm: 280, tollEstimate: 420 },
  { name: 'Bengaluru ⇄ Mysuru', distanceKm: 145, tollEstimate: 330 },
  { name: 'Mumbai ⇄ Pune (Expressway)', distanceKm: 150, tollEstimate: 320 },
  { name: 'Delhi ⇄ Chandigarh', distanceKm: 245, tollEstimate: 390 },
  { name: 'Hyderabad ⇄ Vijayawada', distanceKm: 275, tollEstimate: 380 }
];

export const FuelCostCalculator: React.FC<FuelCostCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [distanceKm, setDistanceKm] = useState<number>(350);
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'cng' | 'ev'>('petrol');
  const [fuelPrice, setFuelPrice] = useState<number>(104);
  const [mileage, setMileage] = useState<number>(16); // km per liter
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(false);
  const [acUsage, setAcUsage] = useState<boolean>(true); // 10% penalty
  const [tollCost, setTollCost] = useState<number>(450);
  const [passengers, setPassengers] = useState<number>(4);

  // Sync default price on fuel type change
  const handleFuelTypeChange = (type: 'petrol' | 'diesel' | 'cng' | 'ev') => {
    setFuelType(type);
    if (type === 'petrol') {
      setFuelPrice(104);
      setMileage(16);
    } else if (type === 'diesel') {
      setFuelPrice(92);
      setMileage(19);
    } else if (type === 'cng') {
      setFuelPrice(84);
      setMileage(24);
    } else if (type === 'ev') {
      setFuelPrice(9); // ₹9 per kWh unit
      setMileage(7.5); // 7.5 km per kWh
    }
  };

  // Calculations
  const totalDistance = isRoundTrip ? distanceKm * 2 : distanceKm;
  const effectiveMileage = acUsage ? mileage * 0.9 : mileage;
  
  const fuelRequired = effectiveMileage > 0 ? totalDistance / effectiveMileage : 0;
  const totalFuelCost = fuelRequired * fuelPrice;
  const effectiveToll = isRoundTrip ? tollCost * 2 : tollCost;
  const grandTripCost = totalFuelCost + effectiveToll;
  
  const perPersonFuel = passengers > 0 ? totalFuelCost / passengers : totalFuelCost;
  const perPersonTotal = passengers > 0 ? grandTripCost / passengers : grandTripCost;

  useEffect(() => {
    if (onResultChange) {
      const summary = `${totalDistance} km road trip: ${fuelRequired.toFixed(1)}L fuel (${formatINR(Math.round(grandTripCost))}) — ${formatINR(Math.round(perPersonTotal))} / person`;
      onResultChange(summary, {
        distanceKm: totalDistance,
        fuelType,
        fuelRequired,
        totalFuelCost,
        grandTripCost,
        passengers,
        perPersonTotal
      });
    }
  }, [distanceKm, fuelType, fuelPrice, mileage, isRoundTrip, acUsage, tollCost, passengers, totalDistance, fuelRequired, grandTripCost, perPersonTotal]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          {/* Quick Route Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
              Popular Indian Highway Routes
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROUTES.map(r => (
                <button
                  key={r.name}
                  onClick={() => {
                    setDistanceKm(r.distanceKm);
                    setTollCost(r.tollEstimate);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                >
                  {r.name} ({r.distanceKm} km)
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                One-Way Distance (km)
              </label>
              <input
                type="number"
                value={distanceKm || ''}
                onChange={e => setDistanceKm(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Fuel Type
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'petrol', label: 'Petrol' },
                  { id: 'diesel', label: 'Diesel' },
                  { id: 'cng', label: 'CNG' },
                  { id: 'ev', label: 'EV' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleFuelTypeChange(f.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      fuelType === f.id
                        ? 'bg-accent text-white border-accent'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Fuel Price ({fuelType === 'cng' ? '₹/kg' : fuelType === 'ev' ? '₹/unit' : '₹/Liter'})
              </label>
              <input
                type="number"
                step="0.5"
                value={fuelPrice || ''}
                onChange={e => setFuelPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Vehicle Mileage ({fuelType === 'cng' ? 'km/kg' : fuelType === 'ev' ? 'km/kWh' : 'km/L'})
              </label>
              <input
                type="number"
                step="0.5"
                value={mileage || ''}
                onChange={e => setMileage(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                FASTag / Tolls Estimate (₹)
              </label>
              <input
                type="number"
                value={tollCost}
                onChange={e => setTollCost(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Passengers (Split Count)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={passengers}
                onChange={e => setPassengers(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isRoundTrip}
                onChange={e => setIsRoundTrip(e.target.checked)}
                className="w-4 h-4 rounded text-accent accent-accent"
              />
              Round Trip (Return × 2 = {totalDistance} km)
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={acUsage}
                onChange={e => setAcUsage(e.target.checked)}
                className="w-4 h-4 rounded text-accent accent-accent"
              />
              Air Conditioning AC ON (+10% fuel factor)
            </label>
          </div>
        </div>

        {/* Outputs */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
              Total Trip Expense
            </span>
            <div className="text-4xl font-extrabold font-mono text-white mb-1">
              {formatINR(Math.round(grandTripCost))}
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              For {totalDistance} km total drive ({passengers} passengers)
            </p>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-0.5">
                Per Person Share (Split by {passengers})
              </span>
              <div className="text-3xl font-mono font-extrabold text-emerald-300">
                {formatINR(Math.round(perPersonTotal))}
              </div>
              <span className="text-[10px] text-neutral-400 block mt-1">
                Fuel ({formatINR(Math.round(perPersonFuel))}) + Tolls ({formatINR(Math.round(effectiveToll / passengers))})
              </span>
            </div>

            <div className="space-y-2 pt-4 border-t border-neutral-800 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>Fuel Required:</span>
                <span className="font-mono font-semibold text-white">
                  {fuelRequired.toFixed(1)} {fuelType === 'cng' ? 'kg' : fuelType === 'ev' ? 'kWh' : 'Liters'}
                </span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Total Fuel Cost:</span>
                <span className="font-mono font-semibold">{formatINR(Math.round(totalFuelCost))}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>FASTag / Tolls Total:</span>
                <span className="font-mono font-semibold">{formatINR(effectiveToll)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
