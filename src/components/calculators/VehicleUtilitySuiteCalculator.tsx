import React, { useState, useEffect } from 'react';
import { formatINR, formatIndianNumber } from '../../utils/formatters';
import { Car, Zap, Fuel, DollarSign, Calculator, RefreshCw, Layers, Gauge, ShieldAlert, MapPin, Navigation, Compass } from 'lucide-react';
import { calculateRoute, RouteResult } from '../../services/googleMapsService';
import { GoogleMapView } from '../common/GoogleMapView';

export type VehicleMode =
  | 'fuel-cost'
  | 'ev-charging'
  | 'ev-vs-petrol'
  | 'vehicle-depreciation'
  | 'car-loan-emi'
  | 'tyre-size';

interface VehicleUtilitySuiteCalculatorProps {
  initialMode?: VehicleMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const VehicleUtilitySuiteCalculator: React.FC<VehicleUtilitySuiteCalculatorProps> = ({
  initialMode = 'fuel-cost',
  onResultChange,
}) => {
  const [mode, setMode] = useState<VehicleMode>(initialMode);

  // 1. Fuel Cost state
  const [distanceKm, setDistanceKm] = useState<number>(600);
  const [mileageKmpl, setMileageKmpl] = useState<number>(18);
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState<number>(105);
  const [passengers, setPassengers] = useState<number>(4);
  const [origin, setOrigin] = useState<string>('Mumbai');
  const [destination, setDestination] = useState<string>('Pune');
  const [routeLoading, setRouteLoading] = useState<boolean>(false);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  const handleFetchRoute = async () => {
    if (!origin.trim() || !destination.trim()) return;
    setRouteLoading(true);
    const res = await calculateRoute(origin.trim(), destination.trim(), 'DRIVING');
    setRouteLoading(false);
    if (res) {
      setRouteResult(res);
      setDistanceKm(res.distanceKm);
    }
  };

  // 2. EV Charging state
  const [batteryCapacityKwh, setBatteryCapacityKwh] = useState<number>(40.5); // Nexon EV
  const [evRangeKm, setEvRangeKm] = useState<number>(312);
  const [electricityCostPerUnit, setElectricityCostPerUnit] = useState<number>(8);
  const [chargerKw, setChargerKw] = useState<number>(7.2); // AC Fast Charger

  // 3. EV vs Petrol state
  const [monthlyKm, setMonthlyKm] = useState<number>(1200);
  const [petrolMileage, setPetrolMileage] = useState<number>(15);
  const [petrolCostLitre, setPetrolCostLitre] = useState<number>(105);

  // 4. Vehicle Depreciation state
  const [purchasePrice, setPurchasePrice] = useState<number>(1000000);
  const [vehicleAgeYears, setVehicleAgeYears] = useState<number>(3);
  const [depreciationRate, setDepreciationRate] = useState<number>(15);

  // 5. Car/Bike Loan EMI state
  const [vehicleLoanAmount, setVehicleLoanAmount] = useState<number>(700000);
  const [downPayment, setDownPayment] = useState<number>(150000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(5);

  // 6. Tyre Size state
  const [origWidth, setOrigWidth] = useState<number>(185);
  const [origAspect, setOrigAspect] = useState<number>(65);
  const [origRim, setOrigRim] = useState<number>(15);
  const [newWidth, setNewWidth] = useState<number>(195);
  const [newAspect, setNewAspect] = useState<number>(60);
  const [newRim, setNewRim] = useState<number>(15);

  // ── Fuel Calculations ──
  const fuelRequiredLitres = mileageKmpl > 0 ? distanceKm / mileageKmpl : 0;
  const totalFuelCost = fuelRequiredLitres * fuelPricePerLitre;
  const costPerPassenger = passengers > 0 ? totalFuelCost / passengers : totalFuelCost;

  // ── EV Calculations ──
  const evFullChargeCost = batteryCapacityKwh * electricityCostPerUnit;
  const evCostPerKm = evRangeKm > 0 ? evFullChargeCost / evRangeKm : 0;
  const evChargingTimeHours = chargerKw > 0 ? (batteryCapacityKwh / chargerKw) * 1.15 : 0; // 15% buffer

  // ── EV vs Petrol Savings ──
  const monthlyPetrolLitres = petrolMileage > 0 ? monthlyKm / petrolMileage : 0;
  const monthlyPetrolExpense = monthlyPetrolLitres * petrolCostLitre;
  const monthlyEvExpense = (monthlyKm / (evRangeKm || 300)) * evFullChargeCost;
  const monthlySavings = Math.max(0, monthlyPetrolExpense - monthlyEvExpense);
  const yearlySavings = monthlySavings * 12;
  const fiveYearSavings = yearlySavings * 5;

  // ── Vehicle Depreciation Calculations ──
  const currentResaleValue = purchasePrice * Math.pow(1 - depreciationRate / 100, vehicleAgeYears);
  const totalDepreciationLoss = purchasePrice - currentResaleValue;

  // ── Loan EMI Calculations ──
  const netLoanAmount = Math.max(0, vehicleLoanAmount - downPayment);
  const r = interestRate / 12 / 100;
  const n = loanTenureYears * 12;
  const vehicleEmi = r > 0 && n > 0 ? (netLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : netLoanAmount / (n || 1);
  const totalLoanRepayment = vehicleEmi * n;
  const totalLoanInterest = totalLoanRepayment - netLoanAmount;

  // ── Tyre Size Calculations ──
  const origSidewallMm = (origWidth * origAspect) / 100;
  const origDiameterMm = origRim * 25.4 + origSidewallMm * 2;
  const newSidewallMm = (newWidth * newAspect) / 100;
  const newDiameterMm = newRim * 25.4 + newSidewallMm * 2;
  const diameterDiffPct = origDiameterMm > 0 ? ((newDiameterMm - origDiameterMm) / origDiameterMm) * 100 : 0;
  const speedometerErrorPct = diameterDiffPct;

  useEffect(() => {
    if (!onResultChange) return;

    if (mode === 'fuel-cost') {
      onResultChange(`Total Fuel Cost: ${formatINR(totalFuelCost)} (${fuelRequiredLitres.toFixed(1)}L) | ${formatINR(costPerPassenger)}/passenger`, {
        distanceKm,
        totalFuelCost,
        costPerPassenger,
      });
    } else if (mode === 'ev-charging') {
      onResultChange(`EV Full Charge Cost: ${formatINR(evFullChargeCost)} (${evCostPerKm.toFixed(2)} ₹/km) | Charging Time: ${evChargingTimeHours.toFixed(1)} hrs`, {
        batteryCapacityKwh,
        evFullChargeCost,
      });
    } else if (mode === 'ev-vs-petrol') {
      onResultChange(`5-Year EV Savings vs Petrol: ${formatINR(fiveYearSavings)} (${formatINR(monthlySavings)}/month)`, {
        monthlyKm,
        monthlySavings,
        fiveYearSavings,
      });
    } else if (mode === 'vehicle-depreciation') {
      onResultChange(`Estimated Resale Value after ${vehicleAgeYears} yrs: ${formatINR(currentResaleValue)} (Loss: ${formatINR(totalDepreciationLoss)})`, {
        purchasePrice,
        currentResaleValue,
      });
    } else if (mode === 'car-loan-emi') {
      onResultChange(`Vehicle Monthly EMI: ${formatINR(vehicleEmi)} | Total Interest: ${formatINR(totalLoanInterest)}`, {
        netLoanAmount,
        vehicleEmi,
      });
    } else if (mode === 'tyre-size') {
      onResultChange(`Tyre Diameter Difference: ${diameterDiffPct.toFixed(2)}% | Speedometer Error: ${speedometerErrorPct.toFixed(2)}%`, {
        diameterDiffPct,
      });
    }
  }, [
    mode,
    distanceKm,
    mileageKmpl,
    fuelPricePerLitre,
    passengers,
    batteryCapacityKwh,
    evRangeKm,
    electricityCostPerUnit,
    chargerKw,
    monthlyKm,
    petrolMileage,
    petrolCostLitre,
    purchasePrice,
    vehicleAgeYears,
    depreciationRate,
    vehicleLoanAmount,
    downPayment,
    interestRate,
    loanTenureYears,
    origWidth,
    origAspect,
    origRim,
    newWidth,
    newAspect,
    newRim,
  ]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { id: 'fuel-cost', label: 'Fuel & Trip Cost', icon: Fuel },
          { id: 'ev-charging', label: 'EV Charging & Range', icon: Zap },
          { id: 'ev-vs-petrol', label: 'EV vs Petrol Savings', icon: Layers },
          { id: 'vehicle-depreciation', label: 'Resale & Depreciation', icon: RefreshCw },
          { id: 'car-loan-emi', label: 'Car / Bike EMI', icon: DollarSign },
          { id: 'tyre-size', label: 'Tyre Size Calculator', icon: Gauge },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as VehicleMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                mode === tab.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Mode 1: Fuel Cost & Trip Split */}
      {mode === 'fuel-cost' && (
        <div className="space-y-6">
          {/* Route Distance Lookup via Google Maps */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-accent" />
              <span>Calculate Distance via Google Routes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Origin City / Location</label>
                <input
                  type="text"
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Destination City / Location</label>
                <input
                  type="text"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="e.g. Pune"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleFetchRoute}
              disabled={routeLoading}
              className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>{routeLoading ? 'Calculating Google Route...' : 'Fetch Route Distance & Travel Duration'}</span>
            </button>

            {routeResult && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">Route Distance: {routeResult.formattedDistance}</span>
                  <span className="text-neutral-500 block">Est. Duration: {routeResult.formattedDuration}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                  Auto-Applied
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Trip Distance (km)
                </label>
                <input
                  type="number"
                  value={distanceKm || ''}
                  onChange={e => setDistanceKm(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Vehicle Mileage (km / Litre)
                </label>
                <input
                  type="number"
                  value={mileageKmpl || ''}
                  onChange={e => setMileageKmpl(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Fuel Price (₹ / Litre)
                </label>
                <input
                  type="number"
                  value={fuelPricePerLitre || ''}
                  onChange={e => setFuelPricePerLitre(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Number of Passengers
                </label>
                <input
                  type="number"
                  min={1}
                  value={passengers || 1}
                  onChange={e => setPassengers(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Trip Expense Summary</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Fuel Required:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{fuelRequiredLitres.toFixed(1)} L</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-500">Cost per km:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{formatINR(distanceKm > 0 ? totalFuelCost / distanceKm : 0)}</span>
                  </div>
                  <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                    <span className="text-base font-extrabold text-neutral-900 dark:text-white">Total Trip Cost:</span>
                    <span className="text-xl font-black text-accent">{formatINR(totalFuelCost)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-700 dark:text-amber-300">Cost Per Passenger ({passengers}):</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{formatINR(costPerPassenger)}</span>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <GoogleMapView
                fallbackTitle={`Trip Route: ${origin} → ${destination}`}
                directionsResult={routeResult?.directionsResult}
                height="220px"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: EV Charging */}
      {mode === 'ev-charging' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Battery Capacity (kWh)
              </label>
              <input
                type="number"
                value={batteryCapacityKwh || ''}
                onChange={e => setBatteryCapacityKwh(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Full Charge Range (km)
              </label>
              <input
                type="number"
                value={evRangeKm || ''}
                onChange={e => setEvRangeKm(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Electricity Rate (₹ / Unit / kWh)
              </label>
              <input
                type="number"
                value={electricityCostPerUnit || ''}
                onChange={e => setElectricityCostPerUnit(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Charger Rating (kW)
              </label>
              <input
                type="number"
                value={chargerKw || ''}
                onChange={e => setChargerKw(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">EV Running Cost</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Full 0-100% Charge Cost:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatINR(evFullChargeCost)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Running Cost per KM:</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">₹{evCostPerKm.toFixed(2)} / km</span>
              </div>
              <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Est. Charging Time:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{evChargingTimeHours.toFixed(1)} Hours</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: EV vs Petrol Savings */}
      {mode === 'ev-vs-petrol' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Monthly Driving Distance (km)
              </label>
              <input
                type="number"
                value={monthlyKm || ''}
                onChange={e => setMonthlyKm(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Petrol Vehicle Mileage (km / L)
              </label>
              <input
                type="number"
                value={petrolMileage || ''}
                onChange={e => setPetrolMileage(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Petrol Price (₹ / L)
              </label>
              <input
                type="number"
                value={petrolCostLitre || ''}
                onChange={e => setPetrolCostLitre(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Savings Comparison</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Monthly Petrol Outflow:</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatINR(monthlyPetrolExpense)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Monthly EV Outflow:</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatINR(monthlyEvExpense)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Net 1-Year EV Savings:</span>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{formatINR(yearlySavings)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Net 5-Year EV Savings:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatINR(fiveYearSavings)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 4: Vehicle Depreciation */}
      {mode === 'vehicle-depreciation' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Original On-Road Purchase Price (₹)
              </label>
              <input
                type="number"
                value={purchasePrice || ''}
                onChange={e => setPurchasePrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Vehicle Age (Years)
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={vehicleAgeYears || 1}
                onChange={e => setVehicleAgeYears(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Annual Depreciation Rate (%)
              </label>
              <input
                type="number"
                value={depreciationRate || 15}
                onChange={e => setDepreciationRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Estimated Resale Valuation</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Current Resale Market Value:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(currentResaleValue)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Value Loss:</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatINR(totalDepreciationLoss)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 5: Car / Bike Loan EMI */}
      {mode === 'car-loan-emi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Vehicle Price (₹)
              </label>
              <input
                type="number"
                value={vehicleLoanAmount || ''}
                onChange={e => setVehicleLoanAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Down Payment (₹)
              </label>
              <input
                type="number"
                value={downPayment || 0}
                onChange={e => setDownPayment(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                value={interestRate || 9.5}
                onChange={e => setInterestRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Tenure (Years)
              </label>
              <input
                type="number"
                value={loanTenureYears || 5}
                onChange={e => setLoanTenureYears(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Vehicle EMI Breakdown</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Net Principal Financed:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatINR(netLoanAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Monthly EMI Payment:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(vehicleEmi)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Interest Payable:</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{formatINR(totalLoanInterest)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 6: Tyre Size Calculator */}
      {mode === 'tyre-size' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Original Tyre Specs</div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Width (185)" value={origWidth} onChange={e => setOrigWidth(Number(e.target.value))} className="p-2.5 rounded-xl border text-xs font-mono text-center" />
              <input type="number" placeholder="Aspect (65)" value={origAspect} onChange={e => setOrigAspect(Number(e.target.value))} className="p-2.5 rounded-xl border text-xs font-mono text-center" />
              <input type="number" placeholder="Rim (15)" value={origRim} onChange={e => setOrigRim(Number(e.target.value))} className="p-2.5 rounded-xl border text-xs font-mono text-center" />
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 pt-2">New Tyre Specs</div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Width (195)" value={newWidth} onChange={e => setNewWidth(Number(e.target.value))} className="p-2.5 rounded-xl border text-xs font-mono text-center" />
              <input type="number" placeholder="Aspect (60)" value={newAspect} onChange={e => setNewAspect(Number(e.target.value))} className="p-2.5 rounded-xl border text-xs font-mono text-center" />
              <input type="number" placeholder="Rim (15)" value={newRim} onChange={e => setNewRim(Number(e.target.value))} className="p-2.5 rounded-xl border text-xs font-mono text-center" />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Comparison & Speedometer Variance</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Diameter Diff:</span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{(newDiameterMm - origDiameterMm).toFixed(1)} mm ({diameterDiffPct.toFixed(2)}%)</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Speedometer Error:</span>
                <span className={`font-mono font-bold ${Math.abs(speedometerErrorPct) > 2.5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {speedometerErrorPct > 0 ? '+' : ''}{speedometerErrorPct.toFixed(2)}%
                </span>
              </div>
              {Math.abs(diameterDiffPct) > 2.5 && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> Variance is over 2.5%. May affect ABS & speedometer calibration.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
