import React, { useState, useEffect } from 'react';
import { Fuel, TrendingUp, TrendingDown, MapPin, Calculator, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CityFuelData {
  city: string;
  state: string;
  petrol: number;
  diesel: number;
  cng: number;
  petrolChange: number; // e.g. +0.15 or -0.20
}

const INDIAN_CITIES_FUEL: CityFuelData[] = [
  { city: 'Delhi', state: 'Delhi', petrol: 94.72, diesel: 87.62, cng: 75.09, petrolChange: 0.00 },
  { city: 'Mumbai', state: 'Maharashtra', petrol: 104.21, diesel: 92.15, cng: 77.00, petrolChange: -0.12 },
  { city: 'Bengaluru', state: 'Karnataka', petrol: 102.86, diesel: 88.94, cng: 82.50, petrolChange: +0.08 },
  { city: 'Kolkata', state: 'West Bengal', petrol: 103.94, diesel: 90.76, cng: 84.00, petrolChange: 0.00 },
  { city: 'Chennai', state: 'Tamil Nadu', petrol: 100.75, diesel: 92.34, cng: 83.50, petrolChange: +0.15 },
  { city: 'Hyderabad', state: 'Telangana', petrol: 107.41, diesel: 95.65, cng: 89.00, petrolChange: 0.00 },
  { city: 'Pune', state: 'Maharashtra', petrol: 104.05, diesel: 90.58, cng: 86.00, petrolChange: -0.05 },
  { city: 'Ahmedabad', state: 'Gujarat', petrol: 94.42, diesel: 90.09, cng: 76.50, petrolChange: +0.10 },
  { city: 'Jaipur', state: 'Rajasthan', petrol: 104.88, diesel: 90.36, cng: 84.00, petrolChange: 0.00 },
  { city: 'Lucknow', state: 'Uttar Pradesh', petrol: 94.65, diesel: 87.76, cng: 83.00, petrolChange: 0.00 },
  { city: 'Chandigarh', state: 'Punjab/Haryana', petrol: 94.24, diesel: 82.40, cng: 81.00, petrolChange: -0.08 },
  { city: 'Patna', state: 'Bihar', petrol: 105.18, diesel: 92.04, cng: 84.50, petrolChange: +0.20 },
  { city: 'Bhopal', state: 'Madhya Pradesh', petrol: 106.47, diesel: 91.84, cng: 87.00, petrolChange: 0.00 },
  { city: 'Indore', state: 'Madhya Pradesh', petrol: 106.50, diesel: 91.89, cng: 87.50, petrolChange: 0.00 },
  { city: 'Guwahati', state: 'Assam', petrol: 96.12, diesel: 88.38, cng: 79.00, petrolChange: 0.00 },
  { city: 'Kochi', state: 'Kerala', petrol: 105.72, diesel: 94.66, cng: 84.50, petrolChange: 0.00 },
];

export const FuelPriceTrackerSuite: React.FC = () => {
  const { navigateToTool } = useApp();
  const [citiesData, setCitiesData] = useState<CityFuelData[]>(INDIAN_CITIES_FUEL);
  const [selectedCity, setSelectedCity] = useState<CityFuelData>(INDIAN_CITIES_FUEL[0]);
  const [distanceKm, setDistanceKm] = useState<number>(30);
  const [mileageKmpl, setMileageKmpl] = useState<number>(18);
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'cng'>('petrol');

  useEffect(() => {
    fetch('/data/fuel-prices.json')
      .then(res => res.json())
      .then(data => {
        if (data?.cities?.[0]) {
          const liveDelhi = data.cities[0];
          setCitiesData(prev => {
            const newCities = [...prev];
            const delhiIndex = newCities.findIndex(c => c.city === 'Delhi');
            if (delhiIndex !== -1) {
              newCities[delhiIndex] = {
                ...newCities[delhiIndex],
                petrol: liveDelhi.petrol || newCities[delhiIndex].petrol,
                diesel: liveDelhi.diesel || newCities[delhiIndex].diesel,
                cng: liveDelhi.cng || newCities[delhiIndex].cng,
              };
              // Update selected city if it's currently Delhi
              setSelectedCity(curr => curr.city === 'Delhi' ? newCities[delhiIndex] : curr);
            }
            return newCities;
          });
        }
      })
      .catch(err => console.log('Failed to fetch fuel prices', err));
  }, []);

  const unitPrice = selectedCity[fuelType];
  const dailyLitres = mileageKmpl > 0 ? distanceKm / mileageKmpl : 0;
  const dailyFuelCost = dailyLitres * unitPrice;
  const monthlyFuelCost = dailyFuelCost * 26; // 26 working days

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
              <Fuel className="w-3.5 h-3.5" />
              <span>Daily State Petroleum Retail Rates</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Daily Petrol, Diesel & CNG Price Tracker (India)
            </h2>
          </div>

          <span className="text-xs text-neutral-500 font-semibold self-start sm:self-auto px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
            📅 Today's Retail Rates
          </span>
        </div>

        {/* City Selection Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
            Select Your City / State:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {citiesData.map(item => (
              <button
                key={item.city}
                onClick={() => setSelectedCity(item)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer ${
                  selectedCity.city === item.city
                    ? 'bg-accent text-white border-accent shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-accent/40'
                }`}
              >
                {item.city}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Big Fuel Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Petrol */}
          <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400">
                Petrol Rate
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {selectedCity.city}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                ₹{selectedCity.petrol.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-500">/ Litre</span>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-500/20 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Daily Change:</span>
              <span className={selectedCity.petrolChange > 0 ? 'text-rose-500 font-bold' : selectedCity.petrolChange < 0 ? 'text-emerald-500 font-bold' : 'text-neutral-400'}>
                {selectedCity.petrolChange > 0 ? `+₹${selectedCity.petrolChange}` : selectedCity.petrolChange < 0 ? `-₹${Math.abs(selectedCity.petrolChange)}` : 'No Change'}
              </span>
            </div>
          </div>

          {/* Diesel */}
          <div className="p-5 rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-blue-700 dark:text-blue-400">
                Diesel Rate
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-500/20 text-blue-700 dark:text-blue-300">
                {selectedCity.city}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                ₹{selectedCity.diesel.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-500">/ Litre</span>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-500/20 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Commercial & Trucks:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">Standard Low VAT</span>
            </div>
          </div>

          {/* CNG */}
          <div className="p-5 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">
                CNG Auto Gas
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {selectedCity.city}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                ₹{selectedCity.cng.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-500">/ Kg</span>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-500/20 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Savings vs Petrol:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">~45% Cheaper</span>
            </div>
          </div>
        </div>

        {/* Quick Daily Commute Cost Estimator with Today's Rates */}
        <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-accent" />
              <span>Instant Commute Cost at {selectedCity.city}'s Rates</span>
            </h3>
            <button
              onClick={() => navigateToTool('vehicle-fuel-cost-calculator')}
              className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Full Trip Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500">Daily Round Trip (km)</label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="1"
                value={distanceKm}
                onChange={e => setDistanceKm(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 font-bold font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500">Vehicle Mileage (km/L or km/kg)</label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="1"
                value={mileageKmpl}
                onChange={e => setMileageKmpl(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 font-bold font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500">Fuel Type</label>
              <select
                value={fuelType}
                onChange={e => setFuelType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 font-bold text-sm"
              >
                <option value="petrol">Petrol (₹{selectedCity.petrol}/L)</option>
                <option value="diesel">Diesel (₹{selectedCity.diesel}/L)</option>
                <option value="cng">CNG (₹{selectedCity.cng}/kg)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs text-neutral-400 font-medium">Daily Outflow:</span>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                ₹{dailyFuelCost.toFixed(2)} <span className="text-xs text-neutral-500 font-normal">({dailyLitres.toFixed(2)} L/kg)</span>
              </p>
            </div>
            <div>
              <span className="text-xs text-neutral-400 font-medium">Monthly Commute Cost (26 Days):</span>
              <p className="text-2xl font-extrabold font-mono text-accent">
                ₹{Math.round(monthlyFuelCost).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
