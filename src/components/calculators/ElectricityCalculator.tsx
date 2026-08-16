import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  HelpCircle,
  Flame,
  Tv,
  Wind,
  CheckCircle2,
  Sliders,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Calendar,
  Layers,
  FileText,
  RotateCcw,
  DollarSign
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import {
  ALL_ELECTRICITY_TARIFFS,
  getStateDiscomGroups,
  getTariffById,
  getDefaultTariffForState
} from '../../data/electricityTariffs';
import { tariffRepository } from '../../services/tariffRepository';
import { calculateElectricityBill } from '../../utils/electricityCalculationEngine';
import { ElectricityTariff, StateDiscomGroup } from '../../types/electricity';

interface ElectricityCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

const POPULAR_STATES = [
  { slug: 'maharashtra', name: 'Maharashtra' },
  { slug: 'delhi', name: 'Delhi' },
  { slug: 'gujarat', name: 'Gujarat' },
  { slug: 'tamil-nadu', name: 'Tamil Nadu' },
  { slug: 'karnataka', name: 'Karnataka' },
  { slug: 'uttar-pradesh', name: 'Uttar Pradesh' },
  { slug: 'rajasthan', name: 'Rajasthan' },
  { slug: 'punjab', name: 'Punjab' },
  { slug: 'west-bengal', name: 'West Bengal' },
  { slug: 'kerala', name: 'Kerala' },
  { slug: 'telangana', name: 'Telangana' },
  { slug: 'andhra-pradesh', name: 'Andhra Pradesh' },
];

export const ElectricityCalculator: React.FC<ElectricityCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [stateGroups, setStateGroups] = useState<StateDiscomGroup[]>(() => tariffRepository.getStateGroups());
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(() => tariffRepository.isFallbackActive());

  useEffect(() => {
    const unsub = tariffRepository.subscribe(() => {
      setStateGroups([...tariffRepository.getStateGroups()]);
      setIsUsingFallback(tariffRepository.isFallbackActive());
    });
    // Trigger remote fetch if not yet loaded
    tariffRepository.fetchPublishedTariffs().then(() => {
      setStateGroups([...tariffRepository.getStateGroups()]);
      setIsUsingFallback(tariffRepository.isFallbackActive());
    });
    return unsub;
  }, []);

  // Selected state slug
  const [selectedStateSlug, setSelectedStateSlug] = useState<string>(() => {
    if (currentToolParams?.state && typeof currentToolParams.state === 'string') {
      const match = stateGroups.find(g =>
        g.stateSlug === currentToolParams.state.toLowerCase() ||
        g.stateName.toLowerCase().includes(currentToolParams.state.toLowerCase())
      );
      if (match) return match.stateSlug;
    }
    return 'maharashtra';
  });

  // Selected tariff ID
  const [selectedTariffId, setSelectedTariffId] = useState<string>(() => {
    const defaultTariff = getDefaultTariffForState('maharashtra');
    return defaultTariff.id;
  });

  // Basic inputs
  const [totalUnits, setTotalUnits] = useState<number>(240);
  const [activeInputMode, setActiveInputMode] = useState<'units' | 'appliances'>('units');
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState<number>(2);
  const [applySubsidy, setApplySubsidy] = useState<boolean>(true);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);

  // Appliance Estimator state
  const [acCount, setAcCount] = useState<number>(1);
  const [acHours, setAcHours] = useState<number>(6); // ~1.5 kW
  const [fanCount, setFanCount] = useState<number>(3); // 75W * 12h
  const [hasFridge, setHasFridge] = useState<boolean>(true); // ~35 units/mo
  const [tvHours, setTvHours] = useState<number>(4); // 100W * 4h
  const [geyserMinutes, setGeyserMinutes] = useState<number>(30); // 2 kW * 0.5h
  const [washingMachineLoads, setWashingMachineLoads] = useState<number>(15); // loads per month (~1 kWh/load)

  // Current State group and tariffs
  const currentStateGroup = useMemo(() => {
    return stateGroups.find(g => g.stateSlug === selectedStateSlug) || stateGroups[0];
  }, [stateGroups, selectedStateSlug]);

  const availableTariffsForState = useMemo(() => {
    return currentStateGroup.tariffs;
  }, [currentStateGroup]);

  // Current active tariff
  const currentTariff: ElectricityTariff = useMemo(() => {
    const found = availableTariffsForState.find(t => t.id === selectedTariffId);
    return found || availableTariffsForState[0] || ALL_ELECTRICITY_TARIFFS[0];
  }, [availableTariffsForState, selectedTariffId]);

  // Handle State Change
  const handleStateChange = (newSlug: string) => {
    setSelectedStateSlug(newSlug);
    const targetGroup = stateGroups.find(g => g.stateSlug === newSlug);
    if (targetGroup && targetGroup.tariffs.length > 0) {
      setSelectedTariffId(targetGroup.defaultTariffId);
      setSanctionedLoadKw(targetGroup.tariffs[0].defaultSanctionedLoadKw || 2);
    }
  };

  // Calculate units from appliances
  const applianceUnitsCalculated = useMemo(() => {
    // AC: count * 1.5 kW * hours * 30 days * 0.65 (compressor duty factor)
    const acUnits = acCount * 1.5 * acHours * 30 * 0.65;
    // Ceiling Fans: count * 0.075 kW * 12h * 30 days
    const fanUnits = fanCount * 0.075 * 12 * 30;
    // Refrigerator: ~35 units per month
    const fridgeUnits = hasFridge ? 35 : 0;
    // Smart TV: 0.1 kW * hours * 30 days
    const tvUnits = 0.1 * tvHours * 30;
    // Water Geyser: 2.0 kW * (minutes/60) * 30 days
    const geyserUnits = 2.0 * (geyserMinutes / 60) * 30;
    // Washing Machine: ~1.2 units per load
    const wmUnits = washingMachineLoads * 1.2;
    // LED Lights & Home electronics baseline: ~25 units
    const miscUnits = 25;

    return Math.max(10, Math.round(acUnits + fanUnits + fridgeUnits + tvUnits + geyserUnits + wmUnits + miscUnits));
  }, [acCount, acHours, fanCount, hasFridge, tvHours, geyserMinutes, washingMachineLoads]);

  const effectiveUnits = activeInputMode === 'appliances' ? applianceUnitsCalculated : totalUnits;

  // Run calculation through the decoupled engine
  const calculationResult = useMemo(() => {
    return calculateElectricityBill({
      tariff: currentTariff,
      units: effectiveUnits,
      sanctionedLoadKw,
      applySubsidy,
      billingCycleMonths: currentTariff.billingCycle === 'bimonthly' ? 2 : 1
    });
  }, [currentTariff, effectiveUnits, sanctionedLoadKw, applySubsidy]);

  // Sync result with parent layout
  useEffect(() => {
    if (onResultChange) {
      const summary = `${effectiveUnits} Units in ${currentTariff.state} (${currentTariff.discomShort}) = ${formatINR(calculationResult.netPayable)} / mo`;
      onResultChange(summary, {
        state: currentTariff.state,
        discom: currentTariff.discom,
        units: effectiveUnits,
        netPayable: calculationResult.netPayable,
        energyCharges: calculationResult.energyCharges,
        fixedCharges: calculationResult.fixedCharges,
        dutyCharges: calculationResult.dutyCharges,
        subsidyAmount: calculationResult.subsidyAmount,
        effectiveCostPerUnit: calculationResult.effectiveCostPerUnit
      });
    }
  }, [calculationResult, effectiveUnits, currentTariff, onResultChange]);

  return (
    <div className="space-y-8">
      {/* 1. STATE / UT SELECTION HERO BANNER */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-display">
                Select Your Indian State or Union Territory
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Tariffs, slab rates, fixed charges, and government subsidy schemes are customized for all 36 States & UTs.
            </p>
          </div>

          <div className="w-full md:w-80 shrink-0">
            <label htmlFor="state-ut-select" className="sr-only">
              Select Indian State or Union Territory
            </label>
            <select
              id="state-ut-select"
              value={selectedStateSlug}
              onChange={e => handleStateChange(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-700 font-bold text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all shadow-xs cursor-pointer"
            >
              <optgroup label="── States of India ──">
                {stateGroups.filter(g => !g.isUnionTerritory).map(g => (
                  <option key={g.stateSlug} value={g.stateSlug}>
                    {g.stateName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="── Union Territories (UTs) ──">
                {stateGroups.filter(g => g.isUnionTerritory).map(g => (
                  <option key={g.stateSlug} value={g.stateSlug}>
                    {g.stateName} (UT)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Popular Quick-Select Chips */}
        <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
            Popular Indian States:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_STATES.map(s => {
              const isActive = selectedStateSlug === s.slug;
              return (
                <button
                  key={s.slug}
                  onClick={() => handleStateChange(s.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-accent text-white shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. MAIN CALCULATION WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs & Appliance Config */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
            {/* DISCOM Selector (Only if multiple DISCOMs exist for state) */}
            {availableTariffsForState.length > 1 && (
              <div className="space-y-2 p-4 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between">
                  <label htmlFor="discom-select" className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-accent" />
                    Electricity Distribution Company (DISCOM):
                  </label>
                  <span className="text-[11px] font-semibold text-accent">
                    {availableTariffsForState.length} Options Available
                  </span>
                </div>
                <select
                  id="discom-select"
                  value={selectedTariffId}
                  onChange={e => setSelectedTariffId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:border-accent shadow-xs"
                >
                  {availableTariffsForState.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.discom} ({t.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Input Mode Selector */}
            <div className="flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80">
              <button
                type="button"
                onClick={() => setActiveInputMode('units')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  activeInputMode === 'units'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Direct Units (kWh)
              </button>
              <button
                type="button"
                onClick={() => setActiveInputMode('appliances')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
                  activeInputMode === 'appliances'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-accent" />
                Appliance Power Estimator
              </button>
            </div>

            {/* DIRECT UNITS INPUT */}
            {activeInputMode === 'units' ? (
              <div className="space-y-5">
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="units-numeric-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      Monthly Consumption (Units / kWh):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="units-numeric-input"
                        type="number"
                        min="0"
                        max="3000"
                        value={totalUnits}
                        onChange={e => setTotalUnits(Math.max(0, Number(e.target.value)))}
                        className="w-24 px-2.5 py-1 text-right font-mono font-bold text-base text-accent bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 outline-none focus:border-accent"
                      />
                      <span className="text-xs font-semibold text-neutral-400">kWh</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="1200"
                    step="10"
                    value={totalUnits}
                    onChange={e => setTotalUnits(Number(e.target.value))}
                    className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>0 Units</span>
                    <span>300 Units</span>
                    <span>600 Units</span>
                    <span>1200+ Units</span>
                  </div>
                </div>

                {/* Quick Unit Preset Buttons */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Quick Consumption Presets:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[50, 100, 150, 200, 300, 500].map(u => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setTotalUnits(u)}
                        className={`p-2 rounded-xl text-xs font-semibold transition-colors border ${
                          totalUnits === u
                            ? 'bg-accent text-white border-accent shadow-xs'
                            : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {u} Units
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* APPLIANCE ESTIMATOR TAB */
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Indian Household Appliances
                  </span>
                  <span className="text-xs font-mono font-bold text-accent">
                    Total: {applianceUnitsCalculated} kWh / month
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Air Conditioner */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                        <Wind className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          Air Conditioner (1.5 Ton Inverter AC)
                        </span>
                        <span className="text-[11px] text-neutral-400">~1.5 kW power consumption</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAcHours(Math.max(0, acHours - 1))}
                          className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-mono font-bold text-xs">{acHours} hrs/day</span>
                        <button
                          type="button"
                          onClick={() => setAcHours(acHours + 1)}
                          className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ceiling Fans */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          Ceiling Fans (~12 hrs/day)
                        </span>
                        <span className="text-[11px] text-neutral-400">75W standard / BLDC fans</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setFanCount(Math.max(0, fanCount - 1))}
                        className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-mono font-bold text-xs">{fanCount} fans</span>
                      <button
                        type="button"
                        onClick={() => setFanCount(fanCount + 1)}
                        className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Water Geyser */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Flame className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          Water Geyser (2000 Watts)
                        </span>
                        <span className="text-[11px] text-neutral-400">Winter/Daily bath water heater</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setGeyserMinutes(Math.max(0, geyserMinutes - 15))}
                        className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-mono font-bold text-xs">{geyserMinutes} min</span>
                      <button
                        type="button"
                        onClick={() => setGeyserMinutes(geyserMinutes + 15)}
                        className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Smart TV */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <Tv className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                          Smart TV / Set-Top Box
                        </span>
                        <span className="text-[11px] text-neutral-400">~100W running power</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setTvHours(Math.max(0, tvHours - 1))}
                        className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-mono font-bold text-xs">{tvHours} hrs/day</span>
                      <button
                        type="button"
                        onClick={() => setTvHours(tvHours + 1)}
                        className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Refrigerator Toggle */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                        Frost-Free Refrigerator (24x7)
                      </span>
                      <span className="text-[11px] text-neutral-400">Standard 4-Star Double Door (~35 units/mo)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setHasFridge(!hasFridge)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        hasFridge
                          ? 'bg-accent text-white'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {hasFridge ? 'Included' : 'None'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Settings & Subsidy Toggles */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="w-full flex items-center justify-between py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-accent transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-accent" />
                  Tariff Parameters & Subsidy Rules
                </span>
                {showAdvancedSettings ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              {showAdvancedSettings && (
                <div className="pt-3 space-y-4 animate-in fade-in duration-200">
                  {/* Sanctioned Load Selector */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                        Sanctioned Load:
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {currentTariff.fixedChargeUnit === 'per_kw_month'
                          ? `₹${currentTariff.fixedCharge}/kW per month`
                          : `₹${currentTariff.fixedCharge} flat fixed monthly charge`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 5].map(kw => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => setSanctionedLoadKw(kw)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            sanctionedLoadKw === kw
                              ? 'bg-accent text-white'
                              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          {kw} kW
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Government Subsidy Scheme Toggle (if state has a subsidy) */}
                  {currentTariff.subsidy && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            {currentTariff.subsidy.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setApplySubsidy(!applySubsidy)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                            applySubsidy
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {applySubsidy ? 'Applied' : 'Opted Out'}
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                        {currentTariff.subsidy.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. INTERACTIVE SLAB PROGRESSION VISUALIZER */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  {currentTariff.state} Tariff Slab Structure
                </h3>
              </div>
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                {currentTariff.slabs.length} Tariff Slabs
              </span>
            </div>

            <div className="space-y-2.5">
              {calculationResult.slabBreakdown.map((s, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    s.isActive
                      ? 'bg-accent/5 dark:bg-accent/15 border-accent shadow-xs'
                      : s.isFilled
                      ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/60'
                      : 'bg-neutral-50/50 dark:bg-neutral-900/40 border-neutral-200/40 dark:border-neutral-800 text-neutral-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          s.isActive
                            ? 'bg-accent text-white'
                            : s.isFilled
                            ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                            : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {s.slabRangeLabel}
                      </span>
                      {s.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white">
                          Active Slab
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        ₹{s.ratePerUnit.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-neutral-400"> / unit</span>
                    </div>
                  </div>

                  {s.unitsInSlab > 0 && (
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-neutral-200/60 dark:border-neutral-700/40 text-[11px]">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        {s.unitsInSlab} units consumed in this slab:
                      </span>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {formatINR(s.costInSlab)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Estimated Bill Output & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden space-y-6">
            {/* Header / Net Bill */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-accent mb-1">
                <span>Estimated Monthly Bill</span>
                <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px]">
                  {currentTariff.billingCycle === 'bimonthly' ? 'Bi-Monthly' : 'Monthly'}
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tight my-2">
                {formatINR(calculationResult.netPayable)}
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                <span>Effective Rate:</span>
                <span className="font-mono font-bold text-neutral-200">
                  ₹{calculationResult.effectiveCostPerUnit.toFixed(2)} / kWh
                </span>
              </div>
            </div>

            {/* Bill Breakdown Line Items */}
            <div className="space-y-3 pt-4 border-t border-neutral-800 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>1. Energy Charges (Slab Total):</span>
                <span className="font-mono font-semibold">{formatINR(calculationResult.energyCharges)}</span>
              </div>

              <div className="flex justify-between text-neutral-300">
                <span>2. Fixed Charge ({sanctionedLoadKw} kW Load):</span>
                <span className="font-mono font-semibold">{formatINR(calculationResult.fixedCharges)}</span>
              </div>

              {calculationResult.meterCharges > 0 && (
                <div className="flex justify-between text-neutral-300">
                  <span>3. Meter Rent / Service Fee:</span>
                  <span className="font-mono font-semibold">{formatINR(calculationResult.meterCharges)}</span>
                </div>
              )}

              {calculationResult.fuelAdjustmentCharges > 0 && (
                <div className="flex justify-between text-neutral-300">
                  <span>4. Fuel Adj. Charge (FAC/PPAC):</span>
                  <span className="font-mono font-semibold">{formatINR(calculationResult.fuelAdjustmentCharges)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-300">
                <span>
                  5. Electricity Duty & Statutory Tax ({currentTariff.dutyType === 'percentage' ? `${currentTariff.dutyRate}%` : `₹${currentTariff.dutyRate}/unit`}):
                </span>
                <span className="font-mono font-semibold">{formatINR(calculationResult.dutyCharges)}</span>
              </div>

              {/* Gross Total */}
              <div className="flex justify-between text-neutral-400 pt-2 border-t border-neutral-800/80 font-medium">
                <span>Gross Calculated Total:</span>
                <span className="font-mono">{formatINR(calculationResult.grossTotal)}</span>
              </div>

              {/* Subsidy Benefit (Green discount) */}
              {calculationResult.subsidyApplied && calculationResult.subsidyAmount > 0 && (
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Govt. Subsidy Deduction:
                  </span>
                  <span className="font-mono">- {formatINR(calculationResult.subsidyAmount)}</span>
                </div>
              )}
            </div>

            {/* Annual Estimate Projection */}
            <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                Annual Electricity Cost Projection:
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl font-bold text-white">
                  {formatINR(calculationResult.estimatedAnnualBill)}
                </span>
                <span className="text-[11px] text-neutral-400">
                  ~ {formatINR(Math.round(calculationResult.estimatedAnnualBill / 12))} / month avg
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed pt-1">
                Note: Actual summer bills may increase by 30–50% due to air conditioning and cooling loads.
              </p>
            </div>
          </div>

          {/* Regulatory Authority & Official Source Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold font-display">
              <FileText className="w-4 h-4 text-accent" />
              <span>Official Tariff Order Reference</span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-400">Regulatory Body:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 text-right">{currentTariff.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Schedule Period:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{currentTariff.lastUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Tariff Class:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{currentTariff.category}</span>
              </div>
            </div>

            {currentTariff.sourceUrl && (
              <a
                href={currentTariff.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-accent font-bold text-[11px] hover:underline pt-1"
              >
                View Official Regulatory Tariff Schedule <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400 leading-relaxed">
              <strong>Disclaimer:</strong> Electricity tariffs vary by state, DISCOM, consumer category and tariff period. This calculator provides an estimate based on the selected tariff schedule.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
