import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { calculateSSYSummary } from '../../utils/ssyMath';
import { IndianRupee, TrendingUp, ShieldCheck, Calculator, Sparkles, Check, Copy } from 'lucide-react';

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

export const GovernmentSavingsSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const [copied, setCopied] = useState(false);

  // Common State
  // 1. PPF
  const [ppfYearlyDeposit, setPpfYearlyDeposit] = useState<number>(150000);
  const [ppfTenureYears, setPpfTenureYears] = useState<number>(15);
  const [ppfInterestRate, setPpfInterestRate] = useState<number>(7.1);

  // 2. SSY (Sukanya Samriddhi)
  const [ssyYearlyDeposit, setSsyYearlyDeposit] = useState<number>(100000);
  const [ssyGirlAge, setSsyGirlAge] = useState<number>(3);
  const [ssyInterestRate, setSsyInterestRate] = useState<number>(8.2);

  // 3. Gratuity
  const [monthlyBasicSalary, setMonthlyBasicSalary] = useState<number>(50000);
  const [completedTenureYears, setCompletedTenureYears] = useState<number>(7);

  // 4. NPS
  const [npsMonthlyInvestment, setNpsMonthlyInvestment] = useState<number>(10000);
  const [npsCurrentAge, setNpsCurrentAge] = useState<number>(28);
  const [npsExpectedReturn, setNpsExpectedReturn] = useState<number>(10);
  const [npsAnnuityPercent, setNpsAnnuityPercent] = useState<number>(40);
  const [npsAnnuityRate, setNpsAnnuityRate] = useState<number>(6);

  // 5. EPF
  const [epfBasicMonthly, setEpfBasicMonthly] = useState<number>(40000);
  const [epfCurrentAge, setEpfCurrentAge] = useState<number>(25);
  const [epfRetirementAge, setEpfRetirementAge] = useState<number>(58);
  const [epfCurrentBalance, setEpfCurrentBalance] = useState<number>(50000);
  const [epfAnnualIncrement, setEpfAnnualIncrement] = useState<number>(5);
  const [epfInterestRate, setEpfInterestRate] = useState<number>(8.25);

  // 6. Home Loan Prepayment
  const [hlPrincipal, setHlPrincipal] = useState<number>(5000000);
  const [hlRate, setHlRate] = useState<number>(8.5);
  const [hlTenureYears, setHlTenureYears] = useState<number>(20);
  const [hlExtraMonthly, setHlExtraMonthly] = useState<number>(5000);

  // PPF Calculation
  const ppfResult = useMemo(() => {
    let balance = 0;
    let totalInvested = 0;
    const rate = ppfInterestRate / 100;

    for (let yr = 1; yr <= ppfTenureYears; yr++) {
      balance = (balance + ppfYearlyDeposit) * (1 + rate);
      totalInvested += ppfYearlyDeposit;
    }

    const totalInterest = Math.max(0, balance - totalInvested);
    return {
      totalInvested,
      totalInterest,
      maturityAmount: balance,
    };
  }, [ppfYearlyDeposit, ppfTenureYears, ppfInterestRate]);

  // SSY Calculation (Deposits for 15 years, interest compounds till 21 years) (Shared Engine: src/utils/ssyMath.ts)
  const ssyResult = useMemo(() => {
    return calculateSSYSummary(ssyYearlyDeposit, ssyInterestRate);
  }, [ssyYearlyDeposit, ssyInterestRate]);

  // Gratuity Calculation (Payment of Gratuity Act 1972)
  const gratuityResult = useMemo(() => {
    // Formula: (15 * Last Drawn Basic * Tenure) / 26
    const calculated = (15 * monthlyBasicSalary * completedTenureYears) / 26;
    const taxExemptLimit = 2000000; // 20 Lakhs
    const isTaxFree = calculated <= taxExemptLimit;

    return {
      gratuityAmount: calculated,
      taxExemptLimit,
      isTaxFree,
      eligible: completedTenureYears >= 5,
    };
  }, [monthlyBasicSalary, completedTenureYears]);

  // NPS Calculation
  const npsResult = useMemo(() => {
    const years = Math.max(1, 60 - npsCurrentAge);
    const months = years * 12;
    const monthlyRate = npsExpectedReturn / 12 / 100;

    let totalCorpus = 0;
    for (let m = 1; m <= months; m++) {
      totalCorpus = (totalCorpus + npsMonthlyInvestment) * (1 + monthlyRate);
    }

    const totalInvested = npsMonthlyInvestment * months;
    const totalGains = Math.max(0, totalCorpus - totalInvested);
    const annuityCorpus = totalCorpus * (npsAnnuityPercent / 100);
    const lumpsumWithdrawn = totalCorpus - annuityCorpus;
    const monthlyPension = (annuityCorpus * (npsAnnuityRate / 100)) / 12;

    return {
      totalInvested,
      totalGains,
      totalCorpus,
      annuityCorpus,
      lumpsumWithdrawn,
      monthlyPension,
      investmentYears: years,
    };
  }, [npsMonthlyInvestment, npsCurrentAge, npsExpectedReturn, npsAnnuityPercent, npsAnnuityRate]);

  // EPF Calculation
  const epfResult = useMemo(() => {
    const years = Math.max(1, epfRetirementAge - epfCurrentAge);
    let balance = epfCurrentBalance;
    let employeeTotal = 0;
    let employerTotal = 0;
    let currentSalary = epfBasicMonthly;
    const rate = epfInterestRate / 100;

    for (let y = 1; y <= years; y++) {
      const empContribution = currentSalary * 0.12 * 12;
      const emplyrContribution = currentSalary * 0.0367 * 12; // 3.67% to EPF, rest 8.33% to EPS

      employeeTotal += empContribution;
      employerTotal += emplyrContribution;

      const annualDeposit = empContribution + emplyrContribution;
      balance = (balance + annualDeposit) * (1 + rate);

      currentSalary = currentSalary * (1 + epfAnnualIncrement / 100);
    }

    const totalDeposited = employeeTotal + employerTotal + epfCurrentBalance;
    const totalInterest = Math.max(0, balance - totalDeposited);

    return {
      employeeTotal,
      employerTotal,
      totalDeposited,
      totalInterest,
      maturityCorpus: balance,
      yearsToRetire: years,
    };
  }, [epfBasicMonthly, epfCurrentAge, epfRetirementAge, epfCurrentBalance, epfAnnualIncrement, epfInterestRate]);

  // Home Loan Prepayment Calculation
  const hlPrepayResult = useMemo(() => {
    const r = hlRate / 12 / 100;
    const n = hlTenureYears * 12;
    const normalEmi = (hlPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const normalTotalPay = normalEmi * n;
    const normalTotalInterest = normalTotalPay - hlPrincipal;

    // Simulation with extra monthly payment
    let balance = hlPrincipal;
    let totalPaidExtra = 0;
    let monthsExtra = 0;

    while (balance > 0 && monthsExtra < n) {
      monthsExtra++;
      const interestForMonth = balance * r;
      const principalPaid = normalEmi - interestForMonth + hlExtraMonthly;

      if (balance <= principalPaid) {
        totalPaidExtra += balance + interestForMonth;
        balance = 0;
      } else {
        balance -= principalPaid;
        totalPaidExtra += normalEmi + hlExtraMonthly;
      }
    }

    const prepayTotalInterest = Math.max(0, totalPaidExtra - hlPrincipal);
    const interestSaved = Math.max(0, normalTotalInterest - prepayTotalInterest);
    const monthsSaved = Math.max(0, n - monthsExtra);

    return {
      normalEmi,
      normalTotalInterest,
      prepayTotalInterest,
      interestSaved,
      monthsSaved,
      yearsSaved: (monthsSaved / 12).toFixed(1),
      newTenureYears: (monthsExtra / 12).toFixed(1),
    };
  }, [hlPrincipal, hlRate, hlTenureYears, hlExtraMonthly]);

  const handleCopySummary = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render Based on active tool slug
  switch (tool.slug) {
    case 'ppf-calculator':
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">Public Provident Fund (PPF) Calculator</h2>
              <p className="text-xs text-neutral-500">Government guaranteed 7.1% tax-free compounding under EEE tax status</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">7.1% p.a.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Yearly Deposit (₹500 - ₹1,50,000)</span>
                  <span className="text-accent font-bold">{formatINR(ppfYearlyDeposit)}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="150000"
                  step="500"
                  value={ppfYearlyDeposit}
                  onChange={(e) => setPpfYearlyDeposit(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Tenure (Years)</span>
                  <span className="text-accent font-bold">{ppfTenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="30"
                  step="5"
                  value={ppfTenureYears}
                  onChange={(e) => setPpfTenureYears(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Interest Rate (% p.a.)</span>
                  <span className="text-accent font-bold">{ppfInterestRate}%</span>
                </div>
                <input
                  type="range"
                  min="6.5"
                  max="8.5"
                  step="0.1"
                  value={ppfInterestRate}
                  onChange={(e) => setPpfInterestRate(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 space-y-3">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Total Investment</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{formatINR(ppfResult.totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Total Interest Earned</span>
                  <span className="font-bold text-emerald-600">{formatINR(ppfResult.totalInterest)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">Maturity Corpus</span>
                  <span className="text-xl font-extrabold text-accent">{formatINR(ppfResult.maturityAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => handleCopySummary(`PPF Maturity Summary: Invested: ${formatINR(ppfResult.totalInvested)}, Interest: ${formatINR(ppfResult.totalInterest)}, Maturity: ${formatINR(ppfResult.maturityAmount)}`)}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied Summary' : 'Copy Maturity Summary'}</span>
              </button>
            </div>
          </div>
        </div>
      );

    case 'sukanya-samriddhi-calculator':
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">Sukanya Samriddhi Yojana (SSY) Calculator</h2>
              <p className="text-xs text-neutral-500">High 8.2% tax-free growth for girl child higher education and marriage</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-500/20">8.2% p.a.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Yearly Deposit (Max ₹1.5 Lakh)</span>
                  <span className="text-accent font-bold">{formatINR(ssyYearlyDeposit)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="150000"
                  step="1000"
                  value={ssyYearlyDeposit}
                  onChange={(e) => setSsyYearlyDeposit(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Girl Child Age (0 - 10 Years)</span>
                  <span className="text-accent font-bold">{ssyGirlAge} Years</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={ssyGirlAge}
                  onChange={(e) => setSsyGirlAge(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 space-y-3">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Total Deposit (15 Years)</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{formatINR(ssyResult.totalInvested)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Total Compound Interest</span>
                  <span className="font-bold text-emerald-600">{formatINR(ssyResult.totalInterest)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">Maturity Amount (21 Yrs)</span>
                  <span className="text-xl font-extrabold text-accent">{formatINR(ssyResult.maturityAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'gratuity-calculator':
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">Gratuity Calculator (Payment of Gratuity Act)</h2>
              <p className="text-xs text-neutral-500">Calculate gratuity entitlement based on last drawn basic salary and completed service</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold border border-blue-500/20">Tax Exempt ≤ ₹20L</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Monthly Basic Salary + DA</span>
                  <span className="text-accent font-bold">{formatINR(monthlyBasicSalary)}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="500000"
                  step="5000"
                  value={monthlyBasicSalary}
                  onChange={(e) => setMonthlyBasicSalary(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Completed Service Years</span>
                  <span className="text-accent font-bold">{completedTenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={completedTenureYears}
                  onChange={(e) => setCompletedTenureYears(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 space-y-3">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>5-Year Eligibility Status</span>
                  <span className={`font-bold ${gratuityResult.eligible ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {gratuityResult.eligible ? 'Eligible (≥ 5 Years)' : 'Ineligible (< 5 Years continuous service)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Govt Tax Exemption</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">100% Tax Free (under ₹20 Lakhs)</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">Total Gratuity Payable</span>
                  <span className="text-xl font-extrabold text-accent">{formatINR(gratuityResult.gratuityAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'nps-calculator':
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">National Pension Scheme (NPS) Calculator</h2>
              <p className="text-xs text-neutral-500">Retirement corpus, 60% tax-free lumpsum, and monthly pension projector</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Monthly Contribution</span>
                  <span className="text-accent font-bold">{formatINR(npsMonthlyInvestment)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={npsMonthlyInvestment}
                  onChange={(e) => setNpsMonthlyInvestment(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Current Age (Retirement @ 60)</span>
                  <span className="text-accent font-bold">{npsCurrentAge} Years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="55"
                  step="1"
                  value={npsCurrentAge}
                  onChange={(e) => setNpsCurrentAge(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Expected Annual Return</span>
                  <span className="text-accent font-bold">{npsExpectedReturn}%</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="14"
                  step="0.5"
                  value={npsExpectedReturn}
                  onChange={(e) => setNpsExpectedReturn(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 space-y-3">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Total Maturity Corpus</span>
                  <span className="font-bold text-accent text-sm">{formatINR(npsResult.totalCorpus)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>60% Tax-Free Lumpsum</span>
                  <span className="font-bold text-emerald-600">{formatINR(npsResult.lumpsumWithdrawn)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">Monthly Pension</span>
                  <span className="text-xl font-extrabold text-accent">{formatINR(npsResult.monthlyPension)} / mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'epf-calculator':
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">Employees' Provident Fund (EPF) Calculator</h2>
              <p className="text-xs text-neutral-500">Project total PF balance at retirement with 8.25% interest and yearly salary increments</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">8.25% p.a.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Monthly Basic + DA</span>
                  <span className="text-accent font-bold">{formatINR(epfBasicMonthly)}</span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="300000"
                  step="5000"
                  value={epfBasicMonthly}
                  onChange={(e) => setEpfBasicMonthly(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Current Age & Retirement (58)</span>
                  <span className="text-accent font-bold">{epfCurrentAge} Years</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="55"
                  step="1"
                  value={epfCurrentAge}
                  onChange={(e) => setEpfCurrentAge(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Expected Annual Salary Increment (%)</span>
                  <span className="text-accent font-bold">{epfAnnualIncrement}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={epfAnnualIncrement}
                  onChange={(e) => setEpfAnnualIncrement(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 space-y-3">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Total Contribution (Employee + Employer)</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{formatINR(epfResult.totalDeposited)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Total Accumulated Interest</span>
                  <span className="font-bold text-emerald-600">{formatINR(epfResult.totalInterest)}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">PF Balance @ Age 58</span>
                  <span className="text-xl font-extrabold text-accent">{formatINR(epfResult.maturityCorpus)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'home-loan-prepayment-calculator':
      return (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">Home Loan Prepayment & Savings Calculator</h2>
              <p className="text-xs text-neutral-500">Calculate how much interest you save and how many years you shave off your loan</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">Interest Saver</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Loan Principal Amount</span>
                  <span className="text-accent font-bold">{formatINR(hlPrincipal)}</span>
                </div>
                <input
                  type="range"
                  min="500000"
                  max="20000000"
                  step="100000"
                  value={hlPrincipal}
                  onChange={(e) => setHlPrincipal(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Interest Rate (% p.a.)</span>
                  <span className="text-accent font-bold">{hlRate}%</span>
                </div>
                <input
                  type="range"
                  min="7.5"
                  max="12.0"
                  step="0.1"
                  value={hlRate}
                  onChange={(e) => setHlRate(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Tenure (Years)</span>
                  <span className="text-accent font-bold">{hlTenureYears} Years</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={hlTenureYears}
                  onChange={(e) => setHlTenureYears(Number(e.target.value))}
                  className="w-full accent-accent cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-neutral-700 dark:text-neutral-300">Extra Monthly Prepayment</span>
                  <span className="text-emerald-600 font-bold">+{formatINR(hlExtraMonthly)} / mo</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={hlExtraMonthly}
                  onChange={(e) => setHlExtraMonthly(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 space-y-3">
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>Regular Monthly EMI</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{formatINR(hlPrepayResult.normalEmi)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>New Reduced Tenure</span>
                  <span className="font-bold text-emerald-600">{hlPrepayResult.newTenureYears} Years (Saved {hlPrepayResult.yearsSaved} Years)</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">Total Interest Saved</span>
                  <span className="text-xl font-extrabold text-emerald-600">{formatINR(hlPrepayResult.interestSaved)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};
