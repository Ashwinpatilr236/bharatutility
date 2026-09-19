import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatIndianCompact, formatIndianNumber, numberToIndianWords } from '../../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { IndianRupee, Percent, Calendar, RefreshCw, ChevronDown, ChevronUp, Check, ShieldCheck } from 'lucide-react';

interface EmiCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const EmiCalculator: React.FC<EmiCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [loanAmount, setLoanAmount] = useState<number>(() => {
    return currentToolParams?.amount ? Number(currentToolParams.amount) : 2500000;
  });
  const [interestRate, setInterestRate] = useState<number>(() => {
    return currentToolParams?.rate ? Number(currentToolParams.rate) : 8.5;
  });
  const [tenureYears, setTenureYears] = useState<number>(() => {
    return currentToolParams?.tenure ? Number(currentToolParams.tenure) : 20;
  });
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [showAmortization, setShowAmortization] = useState(false);

  // Quick Amount Presets
  const amountPresets = [
    { label: '₹10 Lakh', value: 1000000 },
    { label: '₹25 Lakh', value: 2500000 },
    { label: '₹50 Lakh', value: 5000000 },
    { label: '₹1 Crore', value: 10000000 },
  ];

  // Mathematical Calculation
  const totalMonths = tenureType === 'years' ? tenureYears * 12 : tenureYears;
  const monthlyRate = interestRate / 12 / 100;

  let monthlyEmi = 0;
  let totalPayable = 0;
  let totalInterest = 0;

  if (loanAmount > 0 && interestRate >= 0 && totalMonths > 0) {
    if (monthlyRate === 0) {
      monthlyEmi = Math.round(loanAmount / totalMonths);
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
      monthlyEmi = Math.round((loanAmount * monthlyRate * compoundFactor) / (compoundFactor - 1));
    }
    totalPayable = monthlyEmi * totalMonths;
    totalInterest = Math.max(0, totalPayable - loanAmount);
  }

  useEffect(() => {
    if (onResultChange && monthlyEmi > 0) {
      const summary = `EMI: ${formatINR(monthlyEmi)}/mo | Total Interest: ${formatIndianCompact(totalInterest)} for Loan of ${formatIndianCompact(loanAmount)}`;
      onResultChange(summary, { amount: loanAmount, rate: interestRate, tenure: tenureYears });
    }
  }, [loanAmount, interestRate, tenureYears, monthlyEmi]);

  // Chart data
  const pieData = [
    { name: 'Principal Loan Amount', value: loanAmount, color: '#6366f1' },
    { name: 'Total Interest Payable', value: totalInterest, color: '#f43f5e' },
  ];

  // Generate Year-by-Year Amortization Schedule
  const amortizationSchedule = [];
  if (monthlyEmi > 0 && loanAmount > 0) {
    let balance = loanAmount;
    const numYears = Math.ceil(totalMonths / 12);
    for (let yr = 1; yr <= Math.min(numYears, 30); yr++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;
      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestForMonth = balance * monthlyRate;
        const principalForMonth = Math.min(balance, monthlyEmi - interestForMonth);
        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        balance -= principalForMonth;
      }
      amortizationSchedule.push({
        year: yr,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        totalPayment: Math.round(yearlyPrincipal + yearlyInterest),
        remainingBalance: Math.max(0, Math.round(balance)),
      });
      if (balance <= 0) break;
    }
  }

  const resetValues = () => {
    setLoanAmount(2500000);
    setInterestRate(8.5);
    setTenureYears(20);
  };

  return (
    <div className="space-y-8">
      {/* Interactive Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs Section (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              Loan Details
            </h3>
            <button
              onClick={resetValues}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-accent font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
          </div>

          {/* 1. Loan Amount */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="loan-amount-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Loan Amount
              </label>
              <span className="text-xs font-mono text-neutral-400">
                {numberToIndianWords(loanAmount)}
              </span>
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-neutral-400 font-bold">₹</span>
              <input
                id="loan-amount-input"
                type="number"
                min="50000"
                max="100000000"
                step="50000"
                value={loanAmount || ''}
                onChange={e => setLoanAmount(Math.max(0, Number(e.target.value)))}
                className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            {/* Slider */}
            <input
              type="range"
              min="100000"
              max="20000000"
              step="50000"
              value={loanAmount}
              onChange={e => setLoanAmount(Number(e.target.value))}
              aria-label="Loan Amount Slider"
              className="w-full accent-indigo-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {amountPresets.map(p => (
                <button
                  key={p.value}
                  onClick={() => setLoanAmount(p.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    loanAmount === p.value
                      ? 'bg-accent text-white border-accent shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-accent'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Interest Rate */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="interest-rate-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Interest Rate (% p.a.)
              </label>
              <span className="text-xs text-neutral-400">
                Current Home Loan avg: 8.4% - 9.25%
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="interest-rate-input"
                type="number"
                min="1"
                max="30"
                step="0.05"
                value={interestRate || ''}
                onChange={e => setInterestRate(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 pr-8 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <span className="absolute right-3.5 text-neutral-400 font-bold">%</span>
            </div>

            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value))}
              aria-label="Interest Rate Slider"
              className="w-full accent-indigo-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* 3. Loan Tenure */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="tenure-input" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Loan Tenure
              </label>
              <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setTenureType('years')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    tenureType === 'years'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  Years
                </button>
                <button
                  onClick={() => setTenureType('months')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    tenureType === 'months'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500'
                  }`}
                >
                  Months
                </button>
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                id="tenure-input"
                type="number"
                min="1"
                max={tenureType === 'years' ? 35 : 420}
                value={tenureYears || ''}
                onChange={e => setTenureYears(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 pr-16 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <span className="absolute right-3.5 text-xs text-neutral-400 font-semibold uppercase">
                {tenureType === 'years' ? 'Years' : 'Months'}
              </span>
            </div>

            <input
              type="range"
              min="1"
              max={tenureType === 'years' ? 30 : 360}
              step="1"
              value={tenureYears}
              onChange={e => setTenureYears(Number(e.target.value))}
              aria-label="Tenure Slider"
              className="w-full accent-indigo-600 h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right Output Results Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Hero Result Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Monthly Loan EMI
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white mb-1">
              {formatINR(monthlyEmi)}
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              per month for {totalMonths} months ({tenureYears} {tenureType})
            </p>

            {/* Split Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Principal Amount
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-indigo-400 mt-0.5 block">
                  {formatINR(loanAmount)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Total Interest Payable
                </span>
                <span className="text-sm sm:text-base font-bold font-mono text-rose-400 mt-0.5 block">
                  {formatINR(totalInterest)}
                </span>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-2xl bg-neutral-800/40 border border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Total Amount Payable</span>
              <span className="text-sm font-bold font-mono text-white">
                {formatINR(totalPayable)}
              </span>
            </div>
          </div>

          {/* Visual Pie Breakdown Chart */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Payment Breakdown
            </h4>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatINR(Number(val))}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs mt-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Principal ({Math.round((loanAmount / (totalPayable || 1)) * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                  Interest ({Math.round((totalInterest / (totalPayable || 1)) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Accordion */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <button
          onClick={() => setShowAmortization(!showAmortization)}
          className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
        >
          <div>
            <h4 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              Year-by-Year Amortization Schedule
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              View how your principal reduces and interest accumulates over {tenureYears} years
            </p>
          </div>
          <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAmortization && (
          <div className="p-4 sm:p-6 border-t border-neutral-200 dark:border-neutral-800 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Principal (₹)</th>
                  <th className="py-2.5 px-3">Interest (₹)</th>
                  <th className="py-2.5 px-3">Total Paid (₹)</th>
                  <th className="py-2.5 px-3">Ending Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-neutral-800 dark:text-neutral-200">
                {amortizationSchedule.map(row => (
                  <tr key={row.year} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                    <td className="py-2.5 px-3 font-bold font-sans">Year {row.year}</td>
                    <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400">{formatIndianNumber(row.principalPaid)}</td>
                    <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">{formatIndianNumber(row.interestPaid)}</td>
                    <td className="py-2.5 px-3 font-semibold">{formatIndianNumber(row.totalPayment)}</td>
                    <td className="py-2.5 px-3 text-neutral-500">{formatIndianNumber(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
