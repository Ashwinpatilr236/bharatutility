import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatIndianCompact, formatIndianNumber, numberToIndianWords } from '../../utils/formatters';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { QuickAmountChips } from '../common/QuickAmountChips';

interface SipCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const SipCalculator: React.FC<SipCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [investmentType, setInvestmentType] = useState<'sip' | 'lumpsum'>('sip');
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(() => {
    return currentToolParams?.amount ? Number(currentToolParams.amount) : 10000;
  });
  const [expectedRate, setExpectedRate] = useState<number>(() => {
    return currentToolParams?.rate ? Number(currentToolParams.rate) : 12;
  });
  const [timePeriodYears, setTimePeriodYears] = useState<number>(() => {
    return currentToolParams?.tenure ? Number(currentToolParams.tenure) : 15;
  });
  const [adjustInflation, setAdjustInflation] = useState<boolean>(false);
  const inflationRate = 6; // Standard Indian CPI assumption

  // Calculation
  let investedAmount = 0;
  let totalMaturityValue = 0;
  let estimatedReturns = 0;

  if (investmentType === 'sip') {
    const totalMonths = timePeriodYears * 12;
    const monthlyRate = expectedRate / 12 / 100;
    investedAmount = monthlyInvestment * totalMonths;

    if (monthlyRate === 0) {
      totalMaturityValue = investedAmount;
    } else {
      totalMaturityValue = Math.round(
        monthlyInvestment *
          ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
          (1 + monthlyRate)
      );
    }
  } else {
    // Lumpsum
    investedAmount = monthlyInvestment;
    const annualRate = expectedRate / 100;
    totalMaturityValue = Math.round(investedAmount * Math.pow(1 + annualRate, timePeriodYears));
  }

  estimatedReturns = Math.max(0, totalMaturityValue - investedAmount);

  // Inflation adjusted real value
  const realPurchasingPower = adjustInflation
    ? Math.round(totalMaturityValue / Math.pow(1 + inflationRate / 100, timePeriodYears))
    : totalMaturityValue;

  useEffect(() => {
    if (onResultChange && totalMaturityValue > 0) {
      const summary = `Maturity: ${formatINR(totalMaturityValue)} (${formatIndianCompact(totalMaturityValue)}) | Invested: ${formatIndianCompact(investedAmount)} at ${expectedRate}% for ${timePeriodYears} yrs`;
      onResultChange(summary, {
        type: investmentType,
        amount: monthlyInvestment,
        rate: expectedRate,
        tenure: timePeriodYears,
      });
    }
  }, [investmentType, monthlyInvestment, expectedRate, timePeriodYears, totalMaturityValue]);

  // Generate Year-by-Year Growth Chart Data
  const chartData = [];
  for (let yr = 1; yr <= timePeriodYears; yr++) {
    let inv = 0;
    let val = 0;
    if (investmentType === 'sip') {
      const m = yr * 12;
      const r = expectedRate / 12 / 100;
      inv = monthlyInvestment * m;
      val = r === 0 ? inv : Math.round(monthlyInvestment * ((Math.pow(1 + r, m) - 1) / r) * (1 + r));
    } else {
      inv = monthlyInvestment;
      val = Math.round(inv * Math.pow(1 + expectedRate / 100, yr));
    }
    chartData.push({
      year: `Yr ${yr}`,
      invested: inv,
      maturity: val,
    });
  }

  const presets = [
    { label: '₹2,500/m', value: 2500 },
    { label: '₹5,000/m', value: 5000 },
    { label: '₹10,000/m', value: 10000 },
    { label: '₹25,000/m', value: 25000 },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          {/* SIP vs Lumpsum Toggle */}
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setInvestmentType('sip')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  investmentType === 'sip'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                Monthly SIP
              </button>
              <button
                onClick={() => setInvestmentType('lumpsum')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  investmentType === 'lumpsum'
                    ? 'bg-accent text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-300'
                }`}
              >
                One-Time Lumpsum
              </button>
            </div>

            <button
              onClick={() => {
                setMonthlyInvestment(10000);
                setExpectedRate(12);
                setTimePeriodYears(15);
              }}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* 1. Monthly Investment */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="investment-amount-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {investmentType === 'sip' ? 'Monthly Investment Amount' : 'One-Time Lumpsum Investment'}
              </label>
              <span className="text-xs font-mono text-neutral-400">
                {numberToIndianWords(monthlyInvestment)}
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 font-bold">₹</span>
              <input
                id="investment-amount-input"
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="500"
                max="5000000"
                step="500"
                value={monthlyInvestment || ''}
                onChange={e => setMonthlyInvestment(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <input
              type="range"
              min={investmentType === 'sip' ? 500 : 5000}
              max={investmentType === 'sip' ? 100000 : 2000000}
              step={investmentType === 'sip' ? 500 : 5000}
              value={monthlyInvestment}
              onChange={e => setMonthlyInvestment(Number(e.target.value))}
              aria-label="Investment Amount Slider"
              className="w-full accent-indigo-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />

            {/* Quick Amount Chips (+1k, +2.5k, +5k, +10k, +25k) */}
            <QuickAmountChips
              currentValue={monthlyInvestment}
              onValueChange={setMonthlyInvestment}
              defaultValue={10000}
              chips={
                investmentType === 'sip'
                  ? [
                      { label: '+1K', value: 1000 },
                      { label: '+2.5K', value: 2500 },
                      { label: '+5K', value: 5000 },
                      { label: '+10K', value: 10000 },
                      { label: '+25K', value: 25000 },
                    ]
                  : [
                      { label: '+10K', value: 10000 },
                      { label: '+50K', value: 50000 },
                      { label: '+1L', value: 100000 },
                      { label: '+5L', value: 500000 },
                    ]
              }
            />

            {investmentType === 'sip' && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {presets.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setMonthlyInvestment(p.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      monthlyInvestment === p.value
                        ? 'bg-accent text-white border-accent shadow-xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Expected Return Rate */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="expected-return-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Expected Return Rate (% p.a.)
              </label>
              <span className="text-xs text-neutral-400">
                Nifty 50 historical 10-yr CAGR: ~12-14%
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="expected-return-input"
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="1"
                max="35"
                step="0.5"
                value={expectedRate || ''}
                onChange={e => setExpectedRate(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 pr-8 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <span className="absolute right-3.5 text-neutral-400 font-bold">%</span>
            </div>

            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedRate}
              onChange={e => setExpectedRate(Number(e.target.value))}
              aria-label="Expected Return Rate Slider"
              className="w-full accent-indigo-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Time Period */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="time-period-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Time Period (Years)
              </label>
              <span className="text-xs font-mono text-neutral-400">
                {timePeriodYears * 12} Months
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="time-period-input"
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="1"
                max="40"
                value={timePeriodYears || ''}
                onChange={e => setTimePeriodYears(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 pr-16 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
              <span className="absolute right-3.5 text-xs text-neutral-400 font-semibold uppercase">
                Years
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={timePeriodYears}
              onChange={e => setTimePeriodYears(Number(e.target.value))}
              aria-label="Time Period Slider"
              className="w-full accent-indigo-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Inflation Toggle */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <label htmlFor="adjust-inflation-checkbox" className="flex items-center gap-2 cursor-pointer">
              <input
                id="adjust-inflation-checkbox"
                type="checkbox"
                checked={adjustInflation}
                onChange={e => setAdjustInflation(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Show Inflation-Adjusted Purchasing Power (6% p.a.)
              </span>
            </label>
          </div>
        </div>

        {/* Right Output Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Hero Result */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Expected Maturity Value
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
              {formatINR(totalMaturityValue)}
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              ({formatIndianCompact(totalMaturityValue)}) over {timePeriodYears} years
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Total Invested
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-neutral-200 mt-0.5 block">
                  {formatINR(investedAmount)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Est. Wealth Gain
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                  +{formatINR(estimatedReturns)}
                </span>
              </div>
            </div>

            {adjustInflation && (
              <div className="mt-3 p-3 rounded-2xl bg-amber-950/40 border border-amber-800/50 flex items-center justify-between text-xs text-amber-200">
                <span>Real Purchasing Power (Today's value):</span>
                <span className="font-bold font-mono text-amber-300">
                  {formatINR(realPurchasingPower)}
                </span>
              </div>
            )}
          </div>

          {/* Growth Area Chart */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
              Wealth Accumulation Trajectory
            </h4>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMaturity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#888888"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={val => formatIndianCompact(val)}
                  />
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="maturity"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMaturity)"
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs mt-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Total Invested
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Total Value (Compound Growth)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
