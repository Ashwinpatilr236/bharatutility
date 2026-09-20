import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { LAND_UNITS, convertLandAreaToAll } from '../../data/landUnits';
import { GraduationCap, MapPin, Building, Sparkles, Check, Copy, AlertTriangle, CheckCircle2, Info, ArrowRight } from 'lucide-react';

interface Props {
  tool: Tool;
}

export const StudentAndLandSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- 1. ATTENDANCE CALCULATOR STATE ---
  const [classesHeld, setClassesHeld] = useState<number>(60);
  const [classesAttended, setClassesAttended] = useState<number>(42);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  // --- 2. LAND AREA CONVERTER STATE ---
  const [landValue, setLandValue] = useState<number>(1000);
  const [fromUnit, setFromUnit] = useState<string>('gaj');

  // --- 3. CONCRETE & CEMENT CALCULATOR STATE ---
  const [slabLength, setSlabLength] = useState<number>(40); // feet
  const [slabWidth, setSlabWidth] = useState<number>(30); // feet
  const [slabThickness, setSlabThickness] = useState<number>(5); // inches
  const [concreteGrade, setConcreteGrade] = useState<'M15' | 'M20' | 'M25'>('M20');
  const [cementBagPrice, setCementBagPrice] = useState<number>(380); // INR

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- ATTENDANCE CALCULATION ---
  const attendanceResult = useMemo(() => {
    const held = Math.max(1, classesHeld);
    const attended = Math.min(held, Math.max(0, classesAttended));
    const target = Math.min(100, Math.max(1, targetPercentage));
    const currentPercent = (attended / held) * 100;
    const isSafe = currentPercent >= target;

    let classesToAttend = 0;
    let classesToBunk = 0;

    if (currentPercent < target) {
      // Formula: (attended + x) / (held + x) = target / 100
      // 100*attended + 100*x = target*held + target*x
      // x*(100 - target) = target*held - 100*attended
      // x = ceil((target * held - 100 * attended) / (100 - target))
      const needed = Math.ceil((target * held - 100 * attended) / (100 - target));
      classesToAttend = Math.max(0, needed);
    } else {
      // Formula: attended / (held + y) >= target / 100
      // 100*attended >= target*held + target*y
      // target*y <= 100*attended - target*held
      // y = floor((100 * attended - target * held) / target)
      const canMiss = Math.floor((100 * attended - target * held) / target);
      classesToBunk = Math.max(0, canMiss);
    }

    return {
      held,
      attended,
      target,
      currentPercent: currentPercent.toFixed(1),
      isSafe,
      classesToAttend,
      classesToBunk,
      deficit: (target - currentPercent).toFixed(1),
    };
  }, [classesHeld, classesAttended, targetPercentage]);

  // --- LAND AREA CONVERSION (Shared Engine: src/data/landUnits.ts) ---
  const landConversions = useMemo(() => {
    return convertLandAreaToAll(landValue, fromUnit);
  }, [landValue, fromUnit]);

  // --- CONCRETE & CEMENT ESTIMATOR ---
  const concreteResult = useMemo(() => {
    const l = Math.max(1, slabLength);
    const w = Math.max(1, slabWidth);
    const tInFeet = Math.max(0.1, slabThickness) / 12; // convert inches to feet

    // Wet volume in cubic feet
    const wetVolumeCuFt = l * w * tInFeet;
    const wetVolumeCuM = wetVolumeCuFt * 0.0283168;

    // Dry volume factor for concrete is approx 1.54 (54% extra for dry voids)
    const dryVolumeCuM = wetVolumeCuM * 1.54;

    // Ratios for grades:
    // M15 (1 : 2 : 4) -> sum = 7
    // M20 (1 : 1.5 : 3) -> sum = 5.5
    // M25 (1 : 1 : 2) -> sum = 4
    let cementPart = 1;
    let sandPart = 1.5;
    let aggPart = 3;

    if (concreteGrade === 'M15') {
      sandPart = 2;
      aggPart = 4;
    } else if (concreteGrade === 'M25') {
      sandPart = 1;
      aggPart = 2;
    }

    const totalRatio = cementPart + sandPart + aggPart;

    // Cement volume in m3
    const cementVolumeCuM = (cementPart / totalRatio) * dryVolumeCuM;
    // Density of cement = 1440 kg/m3. 1 bag = 50kg -> (1440 / 50) = 28.8 bags per m3
    const cementBags = Math.ceil(cementVolumeCuM * 28.8);

    // Sand volume in m3 & Cu Ft (1 m3 = 35.3147 cu ft)
    const sandVolumeCuM = (sandPart / totalRatio) * dryVolumeCuM;
    const sandCuFt = Math.round(sandVolumeCuM * 35.3147);
    const sandBrass = (sandCuFt / 100).toFixed(2); // 1 Brass = 100 Cu Ft
    const sandQuintals = ((sandCuFt * 45) / 100).toFixed(1); // approx 45 kg per cu ft

    // Aggregate volume in m3 & Cu Ft
    const aggVolumeCuM = (aggPart / totalRatio) * dryVolumeCuM;
    const aggCuFt = Math.round(aggVolumeCuM * 35.3147);
    const aggBrass = (aggCuFt / 100).toFixed(2);
    const aggQuintals = ((aggCuFt * 48) / 100).toFixed(1);

    // Water in litres (approx 28-30 litres per cement bag)
    const waterLitres = cementBags * 28;

    // Estimated Material Cost in INR
    const cementCost = cementBags * cementBagPrice;
    const sandCost = sandCuFt * 55; // approx ₹55 per cu ft
    const aggCost = aggCuFt * 45; // approx ₹45 per cu ft
    const totalEstCost = cementCost + sandCost + aggCost;

    return {
      areaSqFt: Math.round(l * w),
      wetVolumeCuFt: wetVolumeCuFt.toFixed(1),
      wetVolumeCuM: wetVolumeCuM.toFixed(2),
      dryVolumeCuM: dryVolumeCuM.toFixed(2),
      cementBags,
      sandCuFt,
      sandBrass,
      sandQuintals,
      aggCuFt,
      aggBrass,
      aggQuintals,
      waterLitres,
      cementCost,
      sandCost,
      aggCost,
      totalEstCost,
    };
  }, [slabLength, slabWidth, slabThickness, concreteGrade, cementBagPrice]);

  return (
    <div className="space-y-8">
      {/* ================= 1. ATTENDANCE CALCULATOR ================= */}
      {slug === 'attendance-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">College Attendance Parameters</h3>
                <p className="text-xs text-slate-400">Calculate 75% rule & safe bunks easily</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span>Total Classes Conducted / Held</span>
                  <span className="font-mono text-indigo-400 font-bold">{classesHeld} Classes</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={200}
                  value={classesHeld}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setClassesHeld(val);
                    if (classesAttended > val) setClassesAttended(val);
                  }}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="flex gap-2 mt-2">
                  {[30, 45, 60, 90, 120].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setClassesHeld(val);
                        if (classesAttended > val) setClassesAttended(val);
                      }}
                      className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700/60"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span>Classes You Attended</span>
                  <span className="font-mono text-emerald-400 font-bold">{classesAttended} Attended</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={classesHeld}
                  value={classesAttended}
                  onChange={(e) => setClassesAttended(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
                <div className="text-xs text-slate-400 mt-1">
                  Classes missed so far: <strong className="text-rose-400">{classesHeld - classesAttended}</strong>
                </div>
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                  <span>Target Minimum Attendance Criteria</span>
                  <span className="font-mono text-cyan-400 font-bold">{targetPercentage}%</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[65, 75, 80, 85].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTargetPercentage(pct)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        targetPercentage === pct
                          ? 'bg-indigo-600/30 border-indigo-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {pct}% {pct === 75 ? '(Standard)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results & Recommendation Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className={`p-6 rounded-2xl border-2 transition-all shadow-xl ${
              attendanceResult.isSafe
                ? 'bg-gradient-to-br from-slate-900 to-emerald-950/40 border-emerald-500/40'
                : 'bg-gradient-to-br from-slate-900 to-rose-950/40 border-rose-500/40'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Attendance Status
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  attendanceResult.isSafe ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {attendanceResult.isSafe ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {attendanceResult.isSafe ? 'Eligible for Exams' : 'Shortage / In Danger'}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className={`text-4xl sm:text-5xl font-extrabold font-mono ${
                  attendanceResult.isSafe ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {attendanceResult.currentPercent}%
                </span>
                <span className="text-sm text-slate-400 font-medium">
                  (Goal: {attendanceResult.target}%)
                </span>
              </div>

              {/* Action Directive */}
              <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                {attendanceResult.isSafe ? (
                  <div>
                    <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> You have Attendance Bunk Margin!
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      You can safely miss up to <strong className="text-white font-mono text-sm underline decoration-emerald-500">{attendanceResult.classesToBunk} next consecutive classes</strong> and still stay above the required {attendanceResult.target}% threshold.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Immediate Action Required!
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      You need to attend the next <strong className="text-white font-mono text-sm underline decoration-rose-500">{attendanceResult.classesToAttend} consecutive classes without missing</strong> to bring your attendance back to {attendanceResult.target}%.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-800">
                <div className="p-2.5 bg-slate-900/80 rounded-lg">
                  <span className="text-slate-400 block">Attended vs Total</span>
                  <span className="font-semibold text-white mt-0.5 block">{attendanceResult.attended} / {attendanceResult.held}</span>
                </div>
                <div className="p-2.5 bg-slate-900/80 rounded-lg">
                  <span className="text-slate-400 block">{attendanceResult.isSafe ? 'Buffer Cushion' : 'Deficit'}</span>
                  <span className={`font-semibold mt-0.5 block ${attendanceResult.isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {Math.abs(Number(attendanceResult.deficit))}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" /> College Attendance Rule Insights
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Most Indian universities (UGC, AICTE, AKTU, VTU, Mumbai University, Anna University) mandate <strong>75% minimum</strong> to appear in end-semester exams.</li>
                <li>Medical certificates (Condonation) typically provide 10% relaxation (allowing 65% minimum).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. INDIAN LAND AREA CONVERTER ================= */}
      {slug === 'land-area-converter' && (
        <div className="space-y-6">
          {/* Top Converter Input Bar */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Indian Regional Land Unit Converter</h3>
                <p className="text-xs text-slate-400">Convert Bigha, Guntha, Gaj, Cent, Ground, Biswa, Acres, and Sq Ft across all Indian states</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Land Area Quantity</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={landValue}
                  onChange={(e) => setLandValue(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-lg focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="md:col-span-7">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">From Unit</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-emerald-400 font-semibold text-sm focus:outline-none focus:border-emerald-500"
                >
                  {Object.entries(LAND_UNITS).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label} - ({config.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick shortcuts */}
            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <span className="text-slate-400 self-center">Presets:</span>
              {[100, 200, 500, 1000, 2400, 43560].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLandValue(val)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                >
                  {val.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {landConversions.map((item) => (
              <div
                key={item.key}
                className={`p-4 rounded-xl border transition-all ${
                  item.key === fromUnit
                    ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="pr-2">
                    <span className="text-xs font-bold text-white block">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.region}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.value, item.key)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors shrink-0"
                    title="Copy Value"
                  >
                    {copiedId === item.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="font-mono text-xl font-bold text-emerald-400 pt-1 border-t border-slate-800/80 break-all select-all">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= 3. CONCRETE & CEMENT CALCULATOR ================= */}
      {slug === 'concrete-cement-sand-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Dimension Inputs */}
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Slab & RCC Dimensions</h3>
                <p className="text-xs text-slate-400">Calculate cement bags, sand, aggregate & budget</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Length (Feet)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={slabLength}
                  onChange={(e) => setSlabLength(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Width (Feet)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={slabWidth}
                  onChange={(e) => setSlabWidth(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Slab Thickness (Inches)</span>
                <span className="font-bold text-amber-400">{slabThickness} inches ({slabThickness === 5 ? 'Standard Chhat' : ''})</span>
              </label>
              <input
                type="range"
                min={3}
                max={12}
                step={0.5}
                value={slabThickness}
                onChange={(e) => setSlabThickness(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>3&quot; (Thin)</span>
                <span>5&quot; (Standard House Slab)</span>
                <span>6&quot;+ (Commercial/Heavy)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Concrete Mix Ratio Grade</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { grade: 'M15', ratio: '1 : 2 : 4', use: 'PCC / Floor' },
                  { grade: 'M20', ratio: '1 : 1.5 : 3', use: 'Roof Slabs' },
                  { grade: 'M25', ratio: '1 : 1 : 2', use: 'Pillars / Beams' },
                ].map((item) => (
                  <button
                    key={item.grade}
                    type="button"
                    onClick={() => setConcreteGrade(item.grade as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      concreteGrade === item.grade
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow-md'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.grade}</div>
                    <div className="text-[10px] text-amber-400 font-mono">{item.ratio}</div>
                    <div className="text-[9px] text-slate-400 truncate">{item.use}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Avg Cement Bag Price (₹/50kg)</label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={cementBagPrice}
                onChange={(e) => setCementBagPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm"
              />
            </div>
          </div>

          {/* Material Requirement Output */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-amber-950/30 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Total Material Requirement
                </span>
                <span className="text-xs text-slate-300">
                  Area: <strong>{concreteResult.areaSqFt} sq ft</strong>
                </span>
              </div>

              {/* 3 Main Materials */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">Cement Bags</span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 block">
                    {concreteResult.cementBags}
                  </span>
                  <span className="text-[10px] text-slate-400">(50 kg bags)</span>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">Sand (Reti)</span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 block">
                    {concreteResult.sandCuFt}
                  </span>
                  <span className="text-[10px] text-slate-400">cu ft ({concreteResult.sandBrass} brass)</span>
                </div>

                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-1">Aggregate (Gitti)</span>
                  <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400 block">
                    {concreteResult.aggCuFt}
                  </span>
                  <span className="text-[10px] text-slate-400">cu ft ({concreteResult.aggBrass} brass)</span>
                </div>
              </div>

              {/* Water & Volume Details */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Water Needed:</span>
                  <span className="font-semibold text-blue-400">{concreteResult.waterLitres.toLocaleString('en-IN')} Litres</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Wet Concrete Volume:</span>
                  <span className="font-mono text-slate-200">{concreteResult.wetVolumeCuFt} cu ft ({concreteResult.wetVolumeCuM} m³)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Dry Mix Volume (+54% bulking):</span>
                  <span className="font-mono text-slate-200">{concreteResult.dryVolumeCuM} m³</span>
                </div>
              </div>

              {/* Estimated Cost Breakdown */}
              <div className="pt-2">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase">Estimated Material Cost</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    ₹{concreteResult.totalEstCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 text-center">
                  <div className="p-2 bg-slate-900/80 rounded-lg">Cement: ₹{concreteResult.cementCost.toLocaleString('en-IN')}</div>
                  <div className="p-2 bg-slate-900/80 rounded-lg">Sand: ₹{concreteResult.sandCost.toLocaleString('en-IN')}</div>
                  <div className="p-2 bg-slate-900/80 rounded-lg">Gitti: ₹{concreteResult.aggCost.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
