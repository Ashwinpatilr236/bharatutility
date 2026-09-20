import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, Receipt, Calendar, ArrowRight, Sparkles, Check, RefreshCw } from 'lucide-react';

export const InteractiveMiniTools: React.FC = () => {
  const { navigateToTool } = useApp();
  const [activeMiniTab, setActiveMiniTab] = useState<'gst' | 'age' | 'emi'>('gst');

  // 1. GST State
  const [gstAmount, setGstAmount] = useState<number>(10000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [isInclusive, setIsInclusive] = useState<boolean>(false);

  // 2. Age State
  const [dob, setDob] = useState<string>('1998-08-15');

  // 3. EMI State
  const [loanAmount, setLoanAmount] = useState<number>(2500000); // 25 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenureYears, setTenureYears] = useState<number>(20);

  // Calculations
  // GST
  const gstResult = (() => {
    if (gstAmount <= 0) return { base: 0, gst: 0, total: 0 };
    if (isInclusive) {
      const base = (gstAmount * 100) / (100 + gstRate);
      const gst = gstAmount - base;
      return { base, gst, total: gstAmount };
    } else {
      const gst = (gstAmount * gstRate) / 100;
      return { base: gstAmount, gst, total: gstAmount + gst };
    }
  })();

  // Age
  const ageResult = (() => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    if (isNaN(birthDate.getTime()) || birthDate > today) return null;

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      const prevMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months, days };
  })();

  // EMI
  const emiResult = (() => {
    if (loanAmount <= 0 || tenureYears <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    const months = tenureYears * 12;
    const monthlyRate = interestRate / 12 / 100;
    if (monthlyRate === 0) {
      return { emi: loanAmount / months, totalInterest: 0, totalPayment: loanAmount };
    }
    const factor = Math.pow(1 + monthlyRate, months);
    const emi = (loanAmount * monthlyRate * factor) / (factor - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmount;
    return { emi, totalInterest, totalPayment };
  })();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 sm:py-3">
      <div className="bg-white dark:bg-neutral-900 rounded-xl sm:rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-3 sm:p-4 shadow-xs space-y-2.5 sm:space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Instant Workspace</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold font-display text-neutral-900 dark:text-white">
              Instant Everyday Indian Calculators
            </h2>
          </div>

          {/* Mini-Tool Switcher Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl self-start sm:self-center max-w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveMiniTab('gst')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeMiniTab === 'gst'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-500" />
              <span>GST (5-28%)</span>
            </button>

            <button
              onClick={() => setActiveMiniTab('age')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeMiniTab === 'age'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span>Exact Age</span>
            </button>

            <button
              onClick={() => setActiveMiniTab('emi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeMiniTab === 'emi'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-500" />
              <span>Loan EMI</span>
            </button>
          </div>
        </div>

        {/* 1. GST Interactive Workspace */}
        {activeMiniTab === 'gst' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7 space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={gstAmount || ''}
                  onChange={e => setGstAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="Enter amount"
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold outline-none focus:border-accent"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    GST Slab Rate
                  </label>
                  <div className="flex items-center gap-1">
                    {[5, 12, 18, 28].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setGstRate(rate)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                          gstRate === rate
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Calculation Type
                  </label>
                  <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-medium">
                    <button
                      onClick={() => setIsInclusive(false)}
                      className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 ${!isInclusive ? 'bg-white dark:bg-neutral-900 font-bold text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'}`}
                    >
                      Exclusive (+)
                    </button>
                    <button
                      onClick={() => setIsInclusive(true)}
                      className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 ${isInclusive ? 'bg-white dark:bg-neutral-900 font-bold text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'}`}
                    >
                      Inclusive
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GST Output Card */}
            <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
              <div className="flex justify-between items-center text-xs text-neutral-500">
                <span>Net Base Amount:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">₹{Math.round(gstResult.base).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span>GST Tax ({gstRate}%):</span>
                <span className="font-bold">+ ₹{Math.round(gstResult.gst).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Total Bill Value:</span>
                <span className="text-base font-black text-neutral-900 dark:text-white font-mono">
                  ₹{Math.round(gstResult.total).toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={() => navigateToTool('gst-calculator')}
                className="w-full mt-1 py-1.5 px-3 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Full GST Invoice Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Age Interactive Workspace */}
        {activeMiniTab === 'age' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7 space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Select Date of Birth (DOB)
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold outline-none focus:border-accent"
                />
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Calculates exact completed years, months, and days as per official Indian Sarkari exam eligibility benchmarks.
              </p>
            </div>

            {/* Age Output Card */}
            <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
              {ageResult ? (
                <div className="text-center py-0.5">
                  <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider">Your Current Age</span>
                  <span className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                    {ageResult.years} <span className="text-xs font-normal text-neutral-500">Years</span>
                  </span>
                  <p className="text-xs font-semibold text-accent mt-0.5">
                    {ageResult.months} Months, {ageResult.days} Days
                  </p>
                </div>
              ) : (
                <div className="text-center py-3 text-xs text-neutral-500">
                  Please select a valid past date of birth.
                </div>
              )}

              <button
                onClick={() => navigateToTool('age-calculator')}
                className="w-full py-1.5 px-3 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Sarkari Exam Age Analyzer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 3. EMI Interactive Workspace */}
        {activeMiniTab === 'emi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-7 space-y-2.5">
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                  <span>Loan: ₹{(loanAmount / 100000).toFixed(1)} Lakhs</span>
                  <span className="font-mono text-accent">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="100000"
                  max="10000000"
                  step="50000"
                  value={loanAmount}
                  onChange={e => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={e => setInterestRate(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-0.5">
                    Tenure (Years)
                  </label>
                  <input
                    type="number"
                    value={tenureYears}
                    onChange={e => setTenureYears(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            {/* EMI Output Card */}
            <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
              <div className="text-center py-0.5">
                <span className="text-[10px] text-neutral-500 block uppercase font-bold tracking-wider">Monthly EMI</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  ₹{Math.round(emiResult.emi).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-neutral-500 pt-1 border-t border-neutral-200 dark:border-neutral-700">
                <span>Total Interest:</span>
                <span className="font-semibold text-rose-500">₹{Math.round(emiResult.totalInterest).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-neutral-500">
                <span>Total Repayment:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">₹{Math.round(emiResult.totalPayment).toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => navigateToTool('emi-calculator')}
                className="w-full mt-0.5 py-1.5 px-3 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
