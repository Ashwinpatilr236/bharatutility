import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Home, TrendingUp, Target, Flame, Sparkles, Check, Copy, ArrowRight, ShieldCheck, IndianRupee } from 'lucide-react';

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

export const RealEstateAndRetirementSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. RENT VS BUY STATE ---
  const [propertyPrice, setPropertyPrice] = useState<number>(7500000); // 75 Lakhs
  const [monthlyRent, setMonthlyRent] = useState<number>(25000);
  const [tenureYears, setTenureYears] = useState<number>(20);
  const [homeLoanRate, setHomeLoanRate] = useState<number>(8.5); // %
  const [sipReturnRate, setSipReturnRate] = useState<number>(12); // %
  const [propertyAppreciation, setPropertyAppreciation] = useState<number>(6); // %

  // --- 2. RENTAL YIELD STATE ---
  const [flatCost, setFlatCost] = useState<number>(6000000); // 60 Lakhs
  const [annualRentIncome, setAnnualRentIncome] = useState<number>(216000); // 18k/month
  const [maintenanceAndTaxYearly, setMaintenanceAndTaxYearly] = useState<number>(30000);

  // --- 3. CROREPATI SIP GOAL STATE ---
  const [targetCorpus, setTargetCorpus] = useState<number>(10000000); // ₹1 Crore
  const [goalYears, setGoalYears] = useState<number>(15);
  const [expectedSipReturn, setExpectedSipReturn] = useState<number>(12); // %

  // --- 4. FIRE RETIREMENT STATE ---
  const [monthlyExpenseToday, setMonthlyExpenseToday] = useState<number>(60000);
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [targetFireAge, setTargetFireAge] = useState<number>(45);
  const [inflationRate, setInflationRate] = useState<number>(6); // %
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(3.5); // %

  // ================= 1. RENT VS BUY CALCULATION =================
  const rentVsBuyResult = useMemo(() => {
    const downPayment = propertyPrice * 0.2; // 20% down
    const loanAmount = propertyPrice * 0.8;
    const r = homeLoanRate / 12 / 100;
    const n = tenureYears * 12;
    const emi = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    // Buy side total cost & asset value
    const totalEmiPaid = emi * n;
    const futurePropertyValue = propertyPrice * Math.pow(1 + propertyAppreciation / 100, tenureYears);
    const netWealthBuy = futurePropertyValue;

    // Rent side: invest down payment + monthly difference (EMI - Rent) in Equity SIP
    const sipMonthlyDiff = Math.max(0, emi - monthlyRent);
    const sipRate = sipReturnRate / 12 / 100;
    // SIP future value of down payment
    const fvDownPayment = downPayment * Math.pow(1 + sipReturnRate / 100, tenureYears);
    // SIP future value of monthly installments
    const fvMonthlySip = (sipMonthlyDiff * (Math.pow(1 + sipRate, n) - 1) * (1 + sipRate)) / sipRate;
    const netWealthRent = fvDownPayment + fvMonthlySip;

    const isBuyBetter = netWealthBuy > netWealthRent;
    const difference = Math.abs(netWealthBuy - netWealthRent);

    return {
      emi: Math.round(emi),
      downPayment: Math.round(downPayment),
      futurePropertyValue: Math.round(futurePropertyValue),
      totalEmiPaid: Math.round(totalEmiPaid),
      netWealthBuy: Math.round(netWealthBuy),
      netWealthRent: Math.round(netWealthRent),
      isBuyBetter,
      difference: Math.round(difference),
    };
  }, [propertyPrice, monthlyRent, tenureYears, homeLoanRate, sipReturnRate, propertyAppreciation]);

  // ================= 2. RENTAL YIELD CALCULATION =================
  const rentalYieldResult = useMemo(() => {
    const grossYield = (annualRentIncome / Math.max(1, flatCost)) * 100;
    const netIncome = Math.max(0, annualRentIncome - maintenanceAndTaxYearly);
    const netYield = (netIncome / Math.max(1, flatCost)) * 100;
    const monthlyIncome = Math.round(annualRentIncome / 12);
    const paybackYears = netIncome > 0 ? (flatCost / netIncome).toFixed(1) : '0';

    return {
      grossYield: grossYield.toFixed(2),
      netYield: netYield.toFixed(2),
      monthlyIncome,
      netAnnualIncome: Math.round(netIncome),
      paybackYears,
    };
  }, [flatCost, annualRentIncome, maintenanceAndTaxYearly]);

  // ================= 3. CROREPATI SIP GOAL CALCULATION =================
  const crorepatiResult = useMemo(() => {
    const i = expectedSipReturn / 12 / 100;
    const n = goalYears * 12;
    // Target = P * [((1+i)^n - 1)/i] * (1+i)
    // P = Target / ([((1+i)^n - 1)/i] * (1+i))
    const denominator = ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const monthlySipRequired = targetCorpus / denominator;
    const totalInvested = monthlySipRequired * n;
    const wealthGain = targetCorpus - totalInvested;

    // Timeline comparison across 5, 10, 15, 20 years
    const timeline = [5, 10, 15, 20].map(y => {
      const ny = y * 12;
      const den = ((Math.pow(1 + i, ny) - 1) / i) * (1 + i);
      const req = targetCorpus / den;
      return {
        years: y,
        sip: Math.round(req),
        invested: Math.round(req * ny),
      };
    });

    return {
      monthlySipRequired: Math.round(monthlySipRequired),
      totalInvested: Math.round(totalInvested),
      wealthGain: Math.round(wealthGain),
      timeline,
    };
  }, [targetCorpus, goalYears, expectedSipReturn]);

  // ================= 4. FIRE RETIREMENT CALCULATION =================
  const fireResult = useMemo(() => {
    const yearsToFire = Math.max(1, targetFireAge - currentAge);
    // Future monthly expense adjusted for inflation
    const futureMonthlyExpense = monthlyExpenseToday * Math.pow(1 + inflationRate / 100, yearsToFire);
    const futureAnnualExpense = futureMonthlyExpense * 12;

    // Required FIRE Corpus = Annual Expense / Safe Withdrawal Rate (e.g. 3.5% rule = ~28x annual expenses)
    const requiredFireCorpus = futureAnnualExpense / (safeWithdrawalRate / 100);
    const leanFireCorpus = requiredFireCorpus * 0.75;
    const fatFireCorpus = requiredFireCorpus * 1.5;

    return {
      yearsToFire,
      futureMonthlyExpense: Math.round(futureMonthlyExpense),
      futureAnnualExpense: Math.round(futureAnnualExpense),
      requiredFireCorpus: Math.round(requiredFireCorpus),
      leanFireCorpus: Math.round(leanFireCorpus),
      fatFireCorpus: Math.round(fatFireCorpus),
      multiplier: Math.round(100 / safeWithdrawalRate),
    };
  }, [monthlyExpenseToday, currentAge, targetFireAge, inflationRate, safeWithdrawalRate]);

  return (
    <div className="space-y-8">
      {/* ================= 1. RENT VS BUY CALCULATOR ================= */}
      {slug === 'rent-vs-buy-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Rent vs Buy Parameters</h3>
                <p className="text-xs text-slate-400">20-year net wealth & equity compounding comparison</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Property Purchase Price</span>
                  <span className="font-mono font-bold text-emerald-400">{formatINR(propertyPrice)}</span>
                </label>
                <input
                  type="range"
                  min={2500000}
                  max={25000000}
                  step={500000}
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Equivalent Monthly Rent</span>
                  <span className="font-mono font-bold text-cyan-400">{formatINR(monthlyRent)} / mo</span>
                </label>
                <input
                  type="range"
                  min={8000}
                  max={100000}
                  step={1000}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Loan Interest (%)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={homeLoanRate}
                    onChange={(e) => setHomeLoanRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">SIP Return (%)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={sipReturnRate}
                    onChange={(e) => setSipReturnRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className={`p-6 rounded-2xl border-2 shadow-xl space-y-5 ${
              rentVsBuyResult.isBuyBetter
                ? 'bg-gradient-to-br from-slate-900 to-emerald-950/40 border-emerald-500/40'
                : 'bg-gradient-to-br from-slate-900 to-cyan-950/40 border-cyan-500/40'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  20-Year Financial Verdict
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  rentVsBuyResult.isBuyBetter ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  {rentVsBuyResult.isBuyBetter ? 'Buying Creates More Wealth' : 'Renting & Investing SIP Wins'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Net Wealth (BUY)</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 block">
                    {formatINR(rentVsBuyResult.netWealthBuy)}
                  </span>
                  <span className="text-[10px] text-slate-400">Property Future Value</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Net Wealth (RENT + SIP)</span>
                  <span className="text-lg font-bold font-mono text-cyan-400 block">
                    {formatINR(rentVsBuyResult.netWealthRent)}
                  </span>
                  <span className="text-[10px] text-slate-400">Equity Portfolio at 12%</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Home Loan Monthly EMI:</span>
                  <span className="font-mono text-slate-200">{formatINR(rentVsBuyResult.emi)} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wealth Difference:</span>
                  <span className="font-bold text-white">{formatINR(rentVsBuyResult.difference)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. RENTAL YIELD CALCULATOR ================= */}
      {slug === 'rental-yield-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Property & Rental Income</h3>
                <p className="text-xs text-slate-400">Calculate Gross & Net Rental Yield for Indian properties</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Total Property Cost (Purchase + Registration)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={flatCost}
                  onChange={(e) => setFlatCost(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Annual Rental Income (₹)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={annualRentIncome}
                  onChange={(e) => setAnnualRentIncome(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Annual Maintenance & Property Tax (₹)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={maintenanceAndTaxYearly}
                  onChange={(e) => setMaintenanceAndTaxYearly(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950/30 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                Rental Yield Metrics
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Gross Rental Yield</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400 block">
                    {rentalYieldResult.grossYield}%
                  </span>
                  <span className="text-[10px] text-slate-400">(Indian Avg: 2.5% - 3.5%)</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Net Rental Yield</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 block">
                    {rentalYieldResult.netYield}%
                  </span>
                  <span className="text-[10px] text-slate-400">(After maintenance/tax)</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Cash Inflow:</span>
                  <span className="font-mono text-white">{formatINR(rentalYieldResult.monthlyIncome)} / mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Payback Period:</span>
                  <span className="font-mono text-slate-200">{rentalYieldResult.paybackYears} Years</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. CROREPATI SIP GOAL CALCULATOR ================= */}
      {slug === 'crorepati-sip-goal-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Target ₹1 Crore Corpus Planner</h3>
                <p className="text-xs text-slate-400">Reverse SIP calculation for 5, 10, 15, 20 years</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Target Wealth Goal</span>
                  <span className="font-mono font-bold text-emerald-400">{formatINR(targetCorpus)}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[5000000, 10000000, 20000000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTargetCorpus(val)}
                      className={`py-2 text-xs font-semibold rounded-xl border ${
                        targetCorpus === val ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      ₹{val / 10000000} Crore
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Time Horizon to Reach Goal</span>
                  <span className="font-mono font-bold text-cyan-400">{goalYears} Years</span>
                </label>
                <input
                  type="range"
                  min={3}
                  max={25}
                  value={goalYears}
                  onChange={(e) => setGoalYears(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Expected Annual Return (% CAGR)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={expectedSipReturn}
                  onChange={(e) => setExpectedSipReturn(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Required Monthly SIP
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {formatINR(crorepatiResult.monthlySipRequired)} <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Total Invested:</span>
                  <span className="font-bold text-white mt-1 block">{formatINR(crorepatiResult.totalInvested)}</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Compounding Gain:</span>
                  <span className="font-bold text-emerald-400 mt-1 block">{formatINR(crorepatiResult.wealthGain)}</span>
                </div>
              </div>

              {/* Timeline comparison table */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SIP vs Tenure Comparison</span>
                <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                  {crorepatiResult.timeline.map(t => (
                    <div key={t.years} className={`p-2 rounded-lg border ${t.years === goalYears ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                      <div className="text-[10px] text-slate-400">{t.years} Yrs</div>
                      <div className="font-mono font-bold text-xs mt-0.5">{formatINR(t.sip)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. FIRE RETIREMENT CALCULATOR ================= */}
      {slug === 'fire-retirement-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400 border border-orange-500/20">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">FIRE Number (Retire Early)</h3>
                <p className="text-xs text-slate-400">Financial Independence Retire Early India benchmark</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Monthly Living Expenses Today (₹)</label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={monthlyExpenseToday}
                  onChange={(e) => setMonthlyExpenseToday(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Current Age</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Retirement Age</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={targetFireAge}
                    onChange={(e) => setTargetFireAge(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-orange-950/40 border-2 border-orange-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block">
                Target FIRE Retirement Corpus
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {formatINR(fireResult.requiredFireCorpus)}
              </div>
              <div className="text-xs text-slate-400">
                (Based on {fireResult.multiplier}x future annual expenses @ Age {targetFireAge})
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Lean FIRE (Minimalist):</span>
                  <span className="font-bold text-white mt-1 block">{formatINR(fireResult.leanFireCorpus)}</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Fat FIRE (Luxury):</span>
                  <span className="font-bold text-orange-400 mt-1 block">{formatINR(fireResult.fatFireCorpus)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
