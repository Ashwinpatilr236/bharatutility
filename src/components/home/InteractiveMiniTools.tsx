import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calculator, Receipt, Calendar, ArrowRight, Sparkles, Building, Check, Search, ExternalLink } from 'lucide-react';
import { fetchIfscDetails, isValidIfscFormat, IfscBankDetails } from '../../utils/ifscService';

export const InteractiveMiniTools: React.FC = () => {
  const { navigateToTool } = useApp();
  const [activeMiniTab, setActiveMiniTab] = useState<'gst' | 'age' | 'emi' | 'ifsc'>('gst');

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

  // 4. IFSC State
  const [ifscInput, setIfscInput] = useState<string>('SBIN0000691');
  const [ifscLoading, setIfscLoading] = useState<boolean>(false);
  const [ifscResult, setIfscResult] = useState<IfscBankDetails | null>(null);
  const [ifscError, setIfscError] = useState<string | null>(null);

  const handleLookupIfsc = async (codeToSearch?: string) => {
    const target = (codeToSearch || ifscInput).trim().toUpperCase();
    if (!target) return;
    if (!isValidIfscFormat(target)) {
      setIfscError('IFSC must be 11 characters (e.g. SBIN0000691)');
      setIfscResult(null);
      return;
    }
    setIfscLoading(true);
    setIfscError(null);
    try {
      const details = await fetchIfscDetails(target);
      if (details) {
        setIfscResult(details);
        setIfscError(null);
      } else {
        setIfscError('Branch details not found. Please verify the code.');
        setIfscResult(null);
      }
    } catch {
      setIfscError('Network error looking up IFSC. Please try again.');
      setIfscResult(null);
    } finally {
      setIfscLoading(false);
    }
  };

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
      <div className="bg-white dark:bg-neutral-900 rounded-xl sm:rounded-2xl border border-neutral-200/90 dark:border-neutral-800 p-3 sm:p-5 shadow-sm space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Instant Interactive Workbench</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold font-display text-neutral-900 dark:text-white">
              Perform Quick Calculations Without Leaving Home
            </h2>
          </div>

          {/* Mini-Tool Switcher Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl self-start sm:self-center max-w-full overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveMiniTab('gst')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeMiniTab === 'emi'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-500" />
              <span>Loan EMI</span>
            </button>

            <button
              onClick={() => {
                setActiveMiniTab('ifsc');
                if (!ifscResult && !ifscLoading) {
                  handleLookupIfsc('SBIN0000691');
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeMiniTab === 'ifsc'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-teal-500" />
              <span>Bank IFSC (Live)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                        className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
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
                      className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${!isInclusive ? 'bg-white dark:bg-neutral-900 font-bold text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'}`}
                    >
                      Exclusive (+)
                    </button>
                    <button
                      onClick={() => setIsInclusive(true)}
                      className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer ${isInclusive ? 'bg-white dark:bg-neutral-900 font-bold text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'}`}
                    >
                      Inclusive (-)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* GST Output Card */}
            <div className="lg:col-span-5 p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">Base Net Amount:</span>
                <span className="font-mono font-semibold">₹{Math.round(gstResult.base).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500">GST Amount ({gstRate}%):</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  + ₹{Math.round(gstResult.gst).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Total Gross:</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ₹{Math.round(gstResult.total).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                onClick={() => navigateToTool('gst-calculator')}
                className="w-full mt-1 py-1.5 px-3 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Full GST Breakdown (CGST/SGST)</span>
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
                className="w-full mt-0.5 py-1.5 px-3 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Open Full Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 4. Bank IFSC Real-Time Interactive Workspace */}
        {activeMiniTab === 'ifsc' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  11-Digit Bank IFSC Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={11}
                    value={ifscInput}
                    onChange={e => setIfscInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleLookupIfsc();
                      }
                    }}
                    placeholder="e.g. SBIN0000691, HDFC0000240"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => handleLookupIfsc()}
                    disabled={ifscLoading}
                    className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{ifscLoading ? 'Searching...' : 'Find'}</span>
                  </button>
                </div>
                {ifscError && (
                  <p className="text-[11px] text-rose-500 font-semibold mt-1">{ifscError}</p>
                )}
              </div>

              {/* Sample Quick IFSC Pills */}
              <div>
                <span className="text-[10px] text-neutral-400 block mb-1">Quick Sample Banks:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: 'SBI Main', code: 'SBIN0000691' },
                    { label: 'HDFC Bank', code: 'HDFC0000240' },
                    { label: 'ICICI Bank', code: 'ICIC0000001' },
                    { label: 'PNB', code: 'PUNB0000100' },
                    { label: 'Bank of Baroda', code: 'BARB0ALHROA' }
                  ].map(b => (
                    <button
                      key={b.code}
                      onClick={() => {
                        setIfscInput(b.code);
                        handleLookupIfsc(b.code);
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-600 transition-colors cursor-pointer"
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* IFSC Output Card */}
            <div className="lg:col-span-6 p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2">
              {ifscResult ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 dark:text-white leading-tight">
                        {ifscResult.BANK}
                      </h4>
                      <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                        Branch: <span className="text-teal-600 dark:text-teal-400 font-bold">{ifscResult.BRANCH}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 shrink-0">
                      Verified
                    </span>
                  </div>

                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                    {ifscResult.ADDRESS}, {ifscResult.CITY}, {ifscResult.STATE}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ifscResult.UPI !== false ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' : 'bg-neutral-200 text-neutral-500'}`}>
                      UPI: {ifscResult.UPI !== false ? 'Yes' : 'No'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ifscResult.NEFT !== false ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300' : 'bg-neutral-200 text-neutral-500'}`}>
                      NEFT: {ifscResult.NEFT !== false ? 'Yes' : 'No'}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ifscResult.RTGS !== false ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300' : 'bg-neutral-200 text-neutral-500'}`}>
                      RTGS: {ifscResult.RTGS !== false ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <button
                    onClick={() => navigateToTool('ifsc-code-finder', { ifsc: ifscResult.IFSC })}
                    className="w-full mt-1 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Full Branch & MICR Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-neutral-500">
                  <p>Enter any 11-digit IFSC code to view instant live branch data</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
