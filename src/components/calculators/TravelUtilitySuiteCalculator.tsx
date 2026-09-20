import React, { useState, useEffect } from 'react';
import { formatINR } from '../../utils/formatters';
import { Compass, DollarSign, Users, Calendar, Globe, CheckSquare, MapPin, Clock, Luggage, Navigation } from 'lucide-react';

export type TravelMode =
  | 'trip-cost'
  | 'road-trip'
  | 'group-split'
  | 'travel-budget'
  | 'currency-converter'
  | 'timezone-converter'
  | 'packing-checklist';

interface TravelUtilitySuiteCalculatorProps {
  initialMode?: TravelMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', rateToInr: 86.5 },
  { code: 'EUR', name: 'Euro', rateToInr: 91.2 },
  { code: 'GBP', name: 'British Pound', rateToInr: 109.8 },
  { code: 'AED', name: 'UAE Dirham', rateToInr: 23.55 },
  { code: 'THB', name: 'Thai Baht', rateToInr: 2.52 },
  { code: 'SGD', name: 'Singapore Dollar', rateToInr: 64.2 },
  { code: 'JPY', name: 'Japanese Yen', rateToInr: 0.56 },
  { code: 'AUD', name: 'Australian Dollar', rateToInr: 54.8 },
];

const TIMEZONES = [
  { name: 'India (IST)', offset: 5.5 },
  { name: 'Dubai (GST)', offset: 4.0 },
  { name: 'London (GMT/BST)', offset: 1.0 },
  { name: 'Singapore (SGT)', offset: 8.0 },
  { name: 'Bangkok (ICT)', offset: 7.0 },
  { name: 'New York (EST)', offset: -5.0 },
  { name: 'San Francisco (PST)', offset: -8.0 },
  { name: 'Tokyo (JST)', offset: 9.0 },
  { name: 'Sydney (AEST)', offset: 10.0 },
];

export const TravelUtilitySuiteCalculator: React.FC<TravelUtilitySuiteCalculatorProps> = ({
  initialMode = 'trip-cost',
  onResultChange,
}) => {
  const [mode, setMode] = useState<TravelMode>(initialMode);

  // 1. Trip Cost state
  const [stayDays, setStayDays] = useState<number>(4);
  const [hotelPerNight, setHotelPerNight] = useState<number>(3500);
  const [foodPerDay, setFoodPerDay] = useState<number>(1500);
  const [transportCost, setTransportCost] = useState<number>(4000);
  const [activitiesCost, setActivitiesCost] = useState<number>(3000);
  const [numTravelers, setNumTravelers] = useState<number>(2);

  // 1b. Road Trip Planner State
  const [stops, setStops] = useState<string[]>(['Vadodara', 'Ahmedabad', 'Udaipur', 'Jaipur']);
  const [roadTripDistanceKm, setRoadTripDistanceKm] = useState<number>(850);
  const [roadTripMileage, setRoadTripMileage] = useState<number>(16);
  const [roadTripFuelPrice, setRoadTripFuelPrice] = useState<number>(105);

  const handleAddStop = () => {
    if (stops.length < 8) {
      setStops([...stops, '']);
    }
  };

  const handleRemoveStop = (index: number) => {
    if (stops.length > 2) {
      setStops(stops.filter((_, i) => i !== index));
    }
  };

  const handleUpdateStop = (index: number, val: string) => {
    const updated = [...stops];
    updated[index] = val;
    setStops(updated);
  };

  // 2. Group Split state
  const [totalExpense, setTotalExpense] = useState<number>(24000);
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [payerName, setPayerName] = useState<string>('Rahul');

  // 3. Travel Budget state
  const [totalBudget, setTotalBudget] = useState<number>(50000);
  const [tripDays, setTripDays] = useState<number>(7);

  // 4. Currency Converter state
  const [amountInr, setAmountInr] = useState<number>(10000);
  const [targetCurrency, setTargetCurrency] = useState<string>('USD');

  // 5. Time Zone state
  const [istHour, setIstHour] = useState<number>(14); // 2:00 PM IST

  // 6. Packing checklist state
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Aadhaar / Passport / Original ID Cards', category: 'Documents', checked: true },
    { id: 2, text: 'Hotel & Flight Booking PDFs', category: 'Documents', checked: true },
    { id: 3, text: 'Phone Charger & Powerbank (10000mAh+)', category: 'Electronics', checked: true },
    { id: 4, text: 'First Aid & Essential Personal Medicines', category: 'Medical', checked: false },
    { id: 5, text: 'Comfortable Walking Shoes & Flip Flops', category: 'Clothing', checked: false },
    { id: 6, text: 'Cash in INR & International Forex Card', category: 'Money', checked: false },
    { id: 7, text: 'Toiletries & Sunscreen Kit', category: 'Personal Care', checked: false },
  ]);

  // Calculations
  const totalHotelCost = stayDays * hotelPerNight;
  const totalFoodCost = stayDays * foodPerDay;
  const grandTripTotal = totalHotelCost + totalFoodCost + transportCost + activitiesCost;
  const perPersonTripCost = numTravelers > 0 ? grandTripTotal / numTravelers : grandTripTotal;

  const equalSplitPerPerson = peopleCount > 0 ? totalExpense / peopleCount : totalExpense;
  const dailyAllowance = tripDays > 0 ? totalBudget / tripDays : totalBudget;

  const selectedCurr = CURRENCIES.find(c => c.code === targetCurrency) || CURRENCIES[0];
  const convertedForeignAmount = selectedCurr.rateToInr > 0 ? amountInr / selectedCurr.rateToInr : 0;

  const toggleCheckItem = (id: number) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  useEffect(() => {
    if (!onResultChange) return;

    if (mode === 'trip-cost') {
      onResultChange(`Total Trip Cost: ${formatINR(grandTripTotal)} (${formatINR(perPersonTripCost)} per person)`, {
        grandTripTotal,
        perPersonTripCost,
      });
    } else if (mode === 'group-split') {
      onResultChange(`Group Split (${peopleCount} people): ${formatINR(equalSplitPerPerson)} / person (Paid by ${payerName})`, {
        totalExpense,
        equalSplitPerPerson,
      });
    } else if (mode === 'travel-budget') {
      onResultChange(`Daily Travel Allowance: ${formatINR(dailyAllowance)} / day (${tripDays} Days Total ${formatINR(totalBudget)})`, {
        totalBudget,
        dailyAllowance,
      });
    } else if (mode === 'currency-converter') {
      onResultChange(`${formatINR(amountInr)} = ${convertedForeignAmount.toFixed(2)} ${targetCurrency}`, {
        amountInr,
        targetCurrency,
        convertedForeignAmount,
      });
    } else if (mode === 'timezone-converter') {
      onResultChange(`IST ${istHour}:00 Time Zone Offset Breakdown`, { istHour });
    } else if (mode === 'packing-checklist') {
      const done = checklist.filter(i => i.checked).length;
      onResultChange(`Packing Checklist: ${done}/${checklist.length} items packed`, { done, total: checklist.length });
    }
  }, [
    mode,
    stayDays,
    hotelPerNight,
    foodPerDay,
    transportCost,
    activitiesCost,
    numTravelers,
    totalExpense,
    peopleCount,
    payerName,
    totalBudget,
    tripDays,
    amountInr,
    targetCurrency,
    istHour,
    checklist,
  ]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { id: 'trip-cost', label: 'Trip Cost Calculator', icon: Compass },
          { id: 'road-trip', label: 'Road Trip Planner', icon: Navigation },
          { id: 'group-split', label: 'Group Expense Split', icon: Users },
          { id: 'travel-budget', label: 'Travel Budget Planner', icon: DollarSign },
          { id: 'currency-converter', label: 'Currency Converter', icon: Globe },
          { id: 'timezone-converter', label: 'Time Zone Converter', icon: Clock },
          { id: 'packing-checklist', label: 'Packing Checklist', icon: Luggage },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id as TravelMode)}
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

      {/* Mode: Road Trip Planner */}
      {mode === 'road-trip' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
              <span>Road Trip Waypoints & Destinations</span>
              <button
                onClick={handleAddStop}
                disabled={stops.length >= 8}
                className="text-accent hover:underline text-xs font-bold"
              >
                + Add Destination Stop
              </button>
            </div>

            <div className="space-y-2">
              {stops.map((stop, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-accent/10 text-accent font-bold text-xs flex items-center justify-center shrink-0 font-mono">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={stop}
                    onChange={e => handleUpdateStop(idx, e.target.value)}
                    placeholder={idx === 0 ? 'Start Location (e.g. Vadodara)' : idx === stops.length - 1 ? 'Final Destination (e.g. Jaipur)' : `Stop ${idx} (e.g. Udaipur)`}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-900 dark:text-white"
                  />
                  {stops.length > 2 && (
                    <button
                      onClick={() => handleRemoveStop(idx)}
                      className="text-neutral-400 hover:text-rose-500 text-xs font-bold px-2 py-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Total Distance (km)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={roadTripDistanceKm}
                  onChange={e => setRoadTripDistanceKm(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Mileage (km / L)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={roadTripMileage}
                  onChange={e => setRoadTripMileage(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Fuel Price (₹ / L)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={roadTripFuelPrice}
                  onChange={e => setRoadTripFuelPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Road Trip Summary</div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Route Waypoints ({stops.length}):</span>
                <span className="font-bold text-neutral-900 dark:text-white">{stops.filter(Boolean).join(' → ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Distance:</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono">{roadTripDistanceKm} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimated Fuel Needed:</span>
                <span className="font-bold text-neutral-900 dark:text-white font-mono">{(roadTripMileage > 0 ? roadTripDistanceKm / roadTripMileage : 0).toFixed(1)} L</span>
              </div>
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <span className="text-base font-extrabold text-neutral-900 dark:text-white">Estimated Fuel Cost:</span>
                <span className="text-xl font-black text-accent">{formatINR(Math.round((roadTripMileage > 0 ? roadTripDistanceKm / roadTripMileage : 0) * roadTripFuelPrice))}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 1: Trip Cost Calculator */}
      {mode === 'trip-cost' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Trip Duration (Days / Nights)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                min={1}
                value={stayDays || 1}
                onChange={e => setStayDays(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Hotel Room Rate (₹ / Night)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={hotelPerNight || 0}
                onChange={e => setHotelPerNight(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Food & Dining Budget (₹ / Day)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={foodPerDay || 0}
                onChange={e => setFoodPerDay(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Transport / Fuel / Flights Cost (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={transportCost || 0}
                onChange={e => setTransportCost(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Number of Travelers
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                min={1}
                value={numTravelers || 1}
                onChange={e => setNumTravelers(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Trip Cost Breakdown</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Accommodation ({stayDays} Nights):</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatINR(totalHotelCost)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Meals & Food ({stayDays} Days):</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatINR(totalFoodCost)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Transport:</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatINR(transportCost)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-neutral-200 dark:border-neutral-700 pt-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Grand Total Trip Outflow:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(grandTripTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Share per Traveler ({numTravelers}):</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatINR(perPersonTripCost)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Group Splitter */}
      {mode === 'group-split' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Bill / Hotel / Taxi Amount (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={totalExpense || ''}
                onChange={e => setTotalExpense(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Number of People in Group
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                min={2}
                value={peopleCount || 2}
                onChange={e => setPeopleCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Name of Person Who Paid
              </label>
              <input
                type="text"
                value={payerName}
                onChange={e => setPayerName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Settlement Summary</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Equal Share per Person:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatINR(equalSplitPerPerson)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-medium leading-relaxed">
                Each of the other {peopleCount - 1} group members owes <strong>{payerName}</strong> exact sum of <strong>{formatINR(equalSplitPerPerson)}</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Travel Budget Planner */}
      {mode === 'travel-budget' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Allocated Travel Corpus (₹)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={totalBudget || ''}
                onChange={e => setTotalBudget(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Trip Duration (Days)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                min={1}
                value={tripDays || 1}
                onChange={e => setTripDays(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Daily Allowance Limit</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Max Spend Cap per Day:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(dailyAllowance)} / day</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 4: Currency Converter */}
      {mode === 'currency-converter' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Amount in Indian Rupees (₹ INR)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={amountInr || ''}
                onChange={e => setAmountInr(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Select Destination Currency
              </label>
              <select
                value={targetCurrency}
                onChange={e => setTargetCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code}) - approx ₹{c.rateToInr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Converted Output</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Equivalent Foreign Sum:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {convertedForeignAmount.toFixed(2)} {targetCurrency}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 5: Time Zone Converter */}
      {mode === 'timezone-converter' && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
              Select Time in India (IST): {istHour}:00 {istHour >= 12 ? 'PM' : 'AM'}
            </label>
            <input
              type="range"
              min={0}
              max={23}
              value={istHour}
              onChange={e => setIstHour(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TIMEZONES.map((tz, idx) => {
              const diffFromIst = tz.offset - 5.5;
              let localH = (istHour + diffFromIst + 24) % 24;
              const mins = localH % 1 === 0 ? '00' : '30';
              const hourInt = Math.floor(localH);
              return (
                <div key={idx} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-1">
                  <div className="text-xs font-bold text-neutral-500">{tz.name}</div>
                  <div className="text-lg font-black text-neutral-900 dark:text-white font-mono">
                    {hourInt.toString().padStart(2, '0')}:{mins} {hourInt >= 12 ? 'PM' : 'AM'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 6: Packing Checklist */}
      {mode === 'packing-checklist' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Essential India Travel Checklist</div>
            <div className="text-xs font-bold text-emerald-600">
              {checklist.filter(i => i.checked).length} / {checklist.length} Packed
            </div>
          </div>

          <div className="space-y-2">
            {checklist.map(item => (
              <label
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-colors ${
                  item.checked
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-neutral-900 dark:text-white line-through opacity-80'
                    : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleCheckItem(item.id)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-xs font-semibold flex-1">{item.text}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400">
                  {item.category}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
