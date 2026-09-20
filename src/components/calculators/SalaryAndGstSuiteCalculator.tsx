import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { TrendingUp, AlertCircle, Percent, Sparkles, Check, Copy, IndianRupee, Clock, ShieldAlert } from 'lucide-react';

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

export const SalaryAndGstSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. SALARY HIKE STATE ---
  const [oldCtc, setOldCtc] = useState<number>(800000); // 8 Lakhs
  const [newCtc, setNewCtc] = useState<number>(1100000); // 11 Lakhs

  // --- 2. GST LATE FEE STATE ---
  const [daysDelayed, setDaysDelayed] = useState<number>(25);
  const [returnType, setReturnType] = useState<'regular' | 'nil'>('regular');
  const [taxPayableAmount, setTaxPayableAmount] = useState<number>(25000);

  // --- 3. DAILY COMPOUND INTEREST STATE ---
  const [principalAmount, setPrincipalAmount] = useState<number>(100000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(12); // %
  const [durationDays, setDurationDays] = useState<number>(90);
  const [compoundFrequency, setCompoundFrequency] = useState<'daily' | 'monthly' | 'quarterly' | 'annually'>('daily');

  // ================= 1. SALARY HIKE CALCULATION =================
  const salaryHikeResult = useMemo(() => {
    const diff = newCtc - oldCtc;
    const percentageHike = oldCtc > 0 ? (diff / oldCtc) * 100 : 0;

    const oldMonthlyGross = Math.round(oldCtc / 12);
    const newMonthlyGross = Math.round(newCtc / 12);
    const monthlyGrossIncrease = newMonthlyGross - oldMonthlyGross;

    // Approximate in-hand estimate (~82% of gross after PF & standard tax)
    const oldEstInHand = Math.round(oldMonthlyGross * 0.82);
    const newEstInHand = Math.round(newMonthlyGross * 0.82);
    const monthlyInHandIncrease = newEstInHand - oldEstInHand;

    return {
      percentageHike: percentageHike.toFixed(2),
      diff,
      oldMonthlyGross,
      newMonthlyGross,
      monthlyGrossIncrease,
      oldEstInHand,
      newEstInHand,
      monthlyInHandIncrease,
    };
  }, [oldCtc, newCtc]);

  // ================= 2. GST LATE FEE CALCULATION =================
  const gstLateFeeResult = useMemo(() => {
    const days = Math.max(0, daysDelayed);
    // CGST + SGST late fee rate per day:
    // Regular: ₹25 CGST + ₹25 SGST = ₹50/day (Capped at ₹5,000 for regular)
    // Nil: ₹10 CGST + ₹10 SGST = ₹20/day (Capped at ₹500 for Nil)
    const dailyFee = returnType === 'nil' ? 20 : 50;
    const maxLateFeeCap = returnType === 'nil' ? 500 : 5000;
    const computedLateFee = Math.min(maxLateFeeCap, days * dailyFee);

    // Statutory interest under Section 50 @ 18% per annum on net tax payable
    const interestPerYear = (taxPayableAmount * 18) / 100;
    const interestAmount = returnType === 'nil' ? 0 : (interestPerYear * (days / 365));

    const totalLiability = computedLateFee + interestAmount;

    return {
      days,
      dailyFee,
      computedLateFee,
      interestAmount: Math.round(interestAmount),
      totalLiability: Math.round(totalLiability),
    };
  }, [daysDelayed, returnType, taxPayableAmount]);

  // ================= 3. DAILY COMPOUND INTEREST CALCULATION =================
  const compoundResult = useMemo(() => {
    const P = Math.max(0, principalAmount);
    const r = annualInterestRate / 100;
    const tYears = durationDays / 365;

    let n = 365; // daily
    if (compoundFrequency === 'monthly') n = 12;
    if (compoundFrequency === 'quarterly') n = 4;
    if (compoundFrequency === 'annually') n = 1;

    // A = P * (1 + r/n)^(n*t)
    const totalMaturity = P * Math.pow(1 + r / n, n * tYears);
    const totalInterest = totalMaturity - P;

    return {
      totalMaturity: Math.round(totalMaturity),
      totalInterest: Math.round(totalInterest),
      effectiveDailyInterest: (totalInterest / Math.max(1, durationDays)).toFixed(2),
    };
  }, [principalAmount, annualInterestRate, durationDays, compoundFrequency]);

  return (
    <div className="space-y-8">
      {/* ================= 1. SALARY HIKE ================= */}
      {slug === 'salary-hike-percentage-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Salary Hike & CTC Increment</h3>
                <p className="text-xs text-slate-400">Calculate appraisal percentage and in-hand increase</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Current / Previous Annual CTC (₹)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={oldCtc}
                  onChange={(e) => setOldCtc(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">New Offered / Appraised Annual CTC (₹)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={newCtc}
                  onChange={(e) => setNewCtc(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-lg"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 text-xs">
                <span className="text-slate-400 self-center">Presets:</span>
                {[
                  { label: '+10% Hike', val: Math.round(oldCtc * 1.1) },
                  { label: '+20% Hike', val: Math.round(oldCtc * 1.2) },
                  { label: '+30% Hike', val: Math.round(oldCtc * 1.3) },
                  { label: '+50% Hike', val: Math.round(oldCtc * 1.5) },
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setNewCtc(p.val)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Total Salary Hike Percentage
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white">
                +{salaryHikeResult.percentageHike}%
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Annual CTC Increase:</span>
                  <span className="font-bold text-emerald-400 mt-1 block">{formatINR(salaryHikeResult.diff)} / yr</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Estimated In-Hand Increase:</span>
                  <span className="font-bold text-cyan-400 mt-1 block">+{formatINR(salaryHikeResult.monthlyInHandIncrease)} / mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. GST LATE FEE ================= */}
      {slug === 'gst-late-fee-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">GSTR-3B & GSTR-1 Late Filing Details</h3>
                <p className="text-xs text-slate-400">Calculate per day penalty fee and 18% statutory interest</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReturnType('regular')}
                  className={`p-3 rounded-xl border text-left ${
                    returnType === 'regular' ? 'bg-amber-500/20 border-amber-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-sm">Regular Tax Return</div>
                  <div className="text-[10px] text-slate-400">₹50/day fee (₹25 CGST + ₹25 SGST)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setReturnType('nil')}
                  className={`p-3 rounded-xl border text-left ${
                    returnType === 'nil' ? 'bg-amber-500/20 border-amber-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-sm">NIL Return (Zero Sale)</div>
                  <div className="text-[10px] text-slate-400">₹20/day fee (₹10 CGST + ₹10 SGST)</div>
                </button>
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Days Delayed Past Due Date</span>
                  <span className="font-mono font-bold text-amber-400">{daysDelayed} Days</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={120}
                  value={daysDelayed}
                  onChange={(e) => setDaysDelayed(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {returnType === 'regular' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Net GST Tax Payable Amount (₹)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={taxPayableAmount}
                    onChange={(e) => setTaxPayableAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border-2 border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Total Late Filing Penalty & Interest
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {formatINR(gstLateFeeResult.totalLiability)}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Late Filing Fee ({gstLateFeeResult.days} days @ ₹{gstLateFeeResult.dailyFee}/d):</span>
                  <span className="font-mono text-slate-200">{formatINR(gstLateFeeResult.computedLateFee)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Section 50 Interest (18% p.a.):</span>
                  <span className="font-mono text-amber-400">{formatINR(gstLateFeeResult.interestAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. DAILY COMPOUND INTEREST ================= */}
      {slug === 'compound-daily-interest-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <Percent className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Compound Interest Parameters</h3>
                <p className="text-xs text-slate-400">Daily, monthly, quarterly compounding interest</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Principal Amount (₹)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Interest Rate (% p.a.)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Duration (Days)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Compounding Frequency</label>
                <select
                  value={compoundFrequency}
                  onChange={(e) => setCompoundFrequency(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="daily">Daily Compounding (365 times/yr)</option>
                  <option value="monthly">Monthly Compounding</option>
                  <option value="quarterly">Quarterly Compounding</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                Total Compounded Interest Earned
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {formatINR(compoundResult.totalInterest)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Total Final Balance:</span>
                  <span className="font-bold text-white mt-1 block">{formatINR(compoundResult.totalMaturity)}</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Avg Interest / Day:</span>
                  <span className="font-bold text-cyan-400 mt-1 block">₹{compoundResult.effectiveDailyInterest} / day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
