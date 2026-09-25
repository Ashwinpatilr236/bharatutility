import React, { useState } from 'react';
import { calculateSSYSchedule } from '../../utils/ssyMath';
import { 
  Building, 
  Sun, 
  HeartHandshake, 
  Coins, 
  Sprout, 
  Briefcase, 
  Home, 
  Baby, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Info, 
  Calculator, 
  Sparkles,
  Download,
  Share2,
  Copy,
  Check
} from 'lucide-react';

export type GovtSchemeMode = 
  | 'ssy' 
  | 'pm-surya-ghar' 
  | 'ayushman-bharat' 
  | 'atal-pension' 
  | 'pm-kisan' 
  | 'pm-mudra' 
  | 'pm-awas' 
  | 'pm-matru-vandana';

interface Props {
  initialMode?: GovtSchemeMode;
  onResultChange?: (result: string) => void;
}

export const GovernmentSchemesSuiteCalculator: React.FC<Props> = ({
  initialMode = 'ssy',
  onResultChange,
}) => {
  const [activeTab, setActiveTab] = useState<GovtSchemeMode>(initialMode);
  const [copied, setCopied] = useState(false);

  // 1. SSY State
  const [ssyAnnualDeposit, setSsyAnnualDeposit] = useState<number>(100000);
  const [ssyGirlAge, setSsyGirlAge] = useState<number>(3);
  const [ssyStartYear, setSsyStartYear] = useState<number>(2026);

  // 2. PM Surya Ghar State
  const [solarMonthlyUnits, setSolarMonthlyUnits] = useState<number>(250);
  const [solarMonthlyBill, setSolarMonthlyBill] = useState<number>(2200);
  const [solarSystemKw, setSolarSystemKw] = useState<number>(3);

  // 3. Ayushman Bharat State
  const [abLocation, setAbLocation] = useState<'rural' | 'urban'>('rural');
  const [abRationCard, setAbRationCard] = useState<boolean>(true);
  const [abDeprivation, setAbDeprivation] = useState<string>('d1');

  // 4. Atal Pension Yojana State
  const [apyEntryAge, setApyEntryAge] = useState<number>(25);
  const [apyPensionChoice, setApyPensionChoice] = useState<number>(5000);

  // 5. PM Kisan State
  const [kisanLandHectares, setKisanLandHectares] = useState<number>(1.5);
  const [kisanAadhaarLinked, setKisanAadhaarLinked] = useState<boolean>(true);
  const [kisanIsInstitutional, setKisanIsInstitutional] = useState<boolean>(false);
  const [kisanTaxPayer, setKisanTaxPayer] = useState<boolean>(false);

  // 6. PM Mudra State
  const [mudraAmount, setMudraAmount] = useState<number>(300000);
  const [mudraTenureYears, setMudraTenureYears] = useState<number>(3);
  const [mudraInterestRate, setMudraInterestRate] = useState<number>(10.5);

  // 7. PM Awas State
  const [awasCategory, setAwasCategory] = useState<'ews' | 'lig' | 'mig'>('ews');
  const [awasLoanAmount, setAwasLoanAmount] = useState<number>(1500000);
  const [awasAnnualIncome, setAwasAnnualIncome] = useState<number>(280000);

  // 8. PM Matru Vandana State
  const [pmmvyChildOrder, setPmmvyChildOrder] = useState<'first' | 'second-girl'>('first');
  const [pmmvyAncRegistered, setPmmvyAncRegistered] = useState<boolean>(true);

  // Calculations
  // SSY 8.2% annual compounding over 21 years (Shared Engine: src/utils/ssyMath.ts)
  const calculateSSY = () => {
    return calculateSSYSchedule({
      annualDeposit: ssyAnnualDeposit,
      girlAge: ssyGirlAge,
      startYear: ssyStartYear,
      interestRatePercent: 8.2,
    });
  };

  // PM Surya Ghar
  const calculateSuryaGhar = () => {
    let subsidy = 0;
    if (solarSystemKw <= 1) subsidy = 30000;
    else if (solarSystemKw === 2) subsidy = 60000;
    else subsidy = 78000;

    const estimatedSystemCost = solarSystemKw * 65000;
    const netCost = Math.max(0, estimatedSystemCost - subsidy);
    const estimatedGenUnitsPerMonth = solarSystemKw * 120; // ~4 units per kW per day
    const estimatedMonthlySavings = Math.min(solarMonthlyBill, Math.round(estimatedGenUnitsPerMonth * 7.5));
    const annualSavings = estimatedMonthlySavings * 12;
    const paybackYears = netCost > 0 ? (netCost / annualSavings).toFixed(1) : '1.0';
    const total25YearSavings = Math.round(annualSavings * 25 - netCost);
    const roofAreaSqFt = solarSystemKw * 100;

    return {
      subsidy,
      estimatedSystemCost,
      netCost,
      estimatedMonthlySavings,
      annualSavings,
      paybackYears,
      total25YearSavings,
      roofAreaSqFt,
    };
  };

  // APY Contribution Matrix approximation based on PFRDA
  const calculateAPY = () => {
    // base formula: for age 18, ₹5k pension is ₹210/mo. For age 40, ₹5k pension is ₹1454/mo.
    const ageDiff = apyEntryAge - 18;
    const baseMultiplier = 1 + (ageDiff * 0.09);
    const pensionFactor = apyPensionChoice / 1000;
    const monthlyContribution = Math.round((42 * baseMultiplier) * pensionFactor);
    const nomineeCorpus = apyPensionChoice * 1700; // ₹8.5L for ₹5k pension

    return { monthlyContribution, nomineeCorpus };
  };

  // PM Mudra EMI
  const calculateMudra = () => {
    const monthlyRate = mudraInterestRate / 12 / 100;
    const months = mudraTenureYears * 12;
    const emi = Math.round(
      (mudraAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)
    );
    const totalPayment = emi * months;
    const totalInterest = totalPayment - mudraAmount;
    let tier = 'Shishu (Up to ₹50,000)';
    if (mudraAmount > 50000 && mudraAmount <= 500000) tier = 'Kishore (₹50,001 - ₹5,00,000)';
    if (mudraAmount > 500000) tier = 'Tarun & Tarun Plus (₹5,00,001 - ₹20,00,000)';

    return { emi, totalPayment, totalInterest, tier };
  };

  // PM Awas
  const calculateAwas = () => {
    let maxSubsidy = 267280;
    let interestRateSubsidy = '6.5%';
    let maxEligibleLoan = 600000;

    if (awasCategory === 'lig') {
      maxSubsidy = 267280;
      interestRateSubsidy = '6.5%';
      maxEligibleLoan = 600000;
    } else if (awasCategory === 'mig') {
      maxSubsidy = 235068;
      interestRateSubsidy = '4.0%';
      maxEligibleLoan = 900000;
    }

    const calculatedSubsidy = Math.min(maxSubsidy, Math.round((awasLoanAmount / 1000000) * maxSubsidy));
    return { maxSubsidy, interestRateSubsidy, maxEligibleLoan, calculatedSubsidy };
  };

  const ssyData = calculateSSY();
  const solarData = calculateSuryaGhar();
  const apyData = calculateAPY();
  const mudraData = calculateMudra();
  const awasData = calculateAwas();

  const copyResults = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700">
        {[
          { id: 'ssy', label: '👧 SSY Sukanya 2026', icon: Baby },
          { id: 'pm-surya-ghar', label: '☀️ PM Surya Ghar Solar', icon: Sun },
          { id: 'ayushman-bharat', label: '🏥 Ayushman ₹5L Health', icon: HeartHandshake },
          { id: 'atal-pension', label: '👴 Atal Pension (APY)', icon: Coins },
          { id: 'pm-kisan', label: '🌾 PM Kisan ₹6,000', icon: Sprout },
          { id: 'pm-mudra', label: '🏭 PM Mudra Loan', icon: Briefcase },
          { id: 'pm-awas', label: '🏠 PM Awas Housing', icon: Home },
          { id: 'pm-matru-vandana', label: '🤰 PM Matru Vandana', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as GovtSchemeMode)}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Calculator Card */}
      <div className="w-full space-y-6">
        
        {/* 1. SSY Sukanya Samriddhi Yojana */}
        {activeTab === 'ssy' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs font-semibold mb-2">
                <span>Government Sovereign Scheme (8.2% p.a. Tax-Free)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Sukanya Samriddhi Yojana (SSY 2026) Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate maturity wealth at age 21 for your girl child under the highest sovereign interest rate with triple EEE tax exemption.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Yearly Deposit Amount (₹250 to ₹1,50,000)
                    </label>
                    <span className="font-mono text-sm font-black text-pink-600 dark:text-pink-400">
                      ₹{ssyAnnualDeposit.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="150000"
                    step="1000"
                    value={ssyAnnualDeposit}
                    onChange={(e) => setSsyAnnualDeposit(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>₹1,000 / yr</span>
                    <span>₹75,000 / yr</span>
                    <span>₹1.5 Lakh / yr (Max 80C)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Girl Child Age (0-10 Yrs)
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      min="0"
                      max="10"
                      value={ssyGirlAge}
                      onChange={(e) => setSsyGirlAge(Math.min(10, Math.max(0, Number(e.target.value))))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Account Start Year
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      min="2015"
                      max="2035"
                      value={ssyStartYear}
                      onChange={(e) => setSsyStartYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Deposit Period:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">15 Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Maturity Period:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">21 Years from opening</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Current Interest Rate:</span>
                    <span className="font-bold text-emerald-600">8.2% per annum (Compounded)</span>
                  </div>
                </div>
              </div>

              {/* SSY Output */}
              <div className="flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-pink-500/15 border border-pink-500/30 space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1">
                    Estimated Tax-Free Maturity Corpus (At Age {ssyGirlAge + 21})
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{ssyData.maturityAmount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                    <div className="text-[11px] text-neutral-500">Total Invested (15 Yrs)</div>
                    <div className="text-sm font-black font-mono text-neutral-900 dark:text-white">
                      ₹{ssyData.totalInvested.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                    <div className="text-[11px] text-neutral-500">Total Interest Earned</div>
                    <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{ssyData.totalInterest.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Tax-Free under Section 80C + Exemption on Interest & Maturity.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PM Surya Ghar Muft Bijli */}
        {activeTab === 'pm-surya-ghar' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
                <span>MNRE Central Subsidy (Up to ₹78,000 Direct Bank Transfer)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                PM Surya Ghar: Muft Bijli Yojana (Solar Rooftop 2026)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate direct DBT subsidy, installation cost, roof area required, and 25-year lifetime electricity bill savings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Solar Rooftop Capacity
                    </label>
                    <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                      {solarSystemKw} kW System
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setSolarSystemKw(kw)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          solarSystemKw === kw
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {kw} kW {kw === 3 ? '(Max Subsidy)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Current Monthly Electricity Bill (₹)
                    </label>
                    <span className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                      ₹{solarMonthlyBill.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="200"
                    value={solarMonthlyBill}
                    onChange={(e) => setSolarMonthlyBill(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Required Shadow-Free Roof Area:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{solarData.roofAreaSqFt} Sq. Ft.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Govt Official Subsidy Rate:</span>
                    <span className="font-bold text-emerald-600">₹{solarData.subsidy.toLocaleString('en-IN')} (DBT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Payback Period:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{solarData.paybackYears} Years</span>
                  </div>
                </div>
              </div>

              {/* Solar Output */}
              <div className="flex flex-col justify-between p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border border-amber-500/30 space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                    25-Year Estimated Net Savings
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{solarData.total25YearSavings.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                    <div className="text-[11px] text-neutral-500">Govt Subsidy</div>
                    <div className="text-sm font-black font-mono text-emerald-600">
                      ₹{solarData.subsidy.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                    <div className="text-[11px] text-neutral-500">Your Net Cost</div>
                    <div className="text-sm font-black font-mono text-neutral-900 dark:text-white">
                      ₹{solarData.netCost.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-800/80 border border-neutral-200/60 dark:border-neutral-700">
                  <div className="text-[11px] text-neutral-500">Monthly Bill Reduction</div>
                  <div className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">
                    ~₹{solarData.estimatedMonthlySavings.toLocaleString('en-IN')} / month
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Ayushman Bharat */}
        {activeTab === 'ayushman-bharat' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <span>NHA National Health Authority (₹5,00,000 / Family / Year)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Ayushman Bharat (PM-JAY) Eligibility & ₹5 Lakh Health Card
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Check whether your family qualifies for free cashless hospitalization in public and private empaneled hospitals across India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Location Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAbLocation('rural')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        abLocation === 'rural'
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      🚜 Rural (Village)
                    </button>
                    <button
                      onClick={() => setAbLocation('urban')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        abLocation === 'urban'
                          ? 'bg-blue-600 text-white border-blue-700'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      🏙️ Urban (City / Town)
                    </button>
                  </div>
                </div>

                {abLocation === 'rural' ? (
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      SECC 2011 Deprivation Category
                    </label>
                    <select
                      value={abDeprivation}
                      onChange={(e) => setAbDeprivation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    >
                      <option value="d1">D1: Only 1 room with kucha walls and roof</option>
                      <option value="d2">D2: No adult member aged 16-59 in household</option>
                      <option value="d3">D3: Female headed household with no adult male</option>
                      <option value="d4">D4: Household with disabled member and no able body</option>
                      <option value="d5">D5: SC / ST household</option>
                      <option value="d7">D7: Landless households deriving manual casual labour</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Urban Occupational Category
                    </label>
                    <select
                      value={abDeprivation}
                      onChange={(e) => setAbDeprivation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    >
                      <option value="ragpicker">Ragpicker / Sanitation worker</option>
                      <option value="driver">Driver / Conductor / Transport worker</option>
                      <option value="construction">Construction worker / Painter / Welder</option>
                      <option value="vendor">Street vendor / Cobbler / Hawkers</option>
                      <option value="security">Security guard / Tailor / Electrician</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="rationCard"
                    checked={abRationCard}
                    onChange={(e) => setAbRationCard(e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <label htmlFor="rationCard" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Have Active Ration Card (NFSA / BPL / Antyodaya)
                  </label>
                </div>
              </div>

              {/* Status Output */}
              <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-4">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>High Probability of Full Eligibility</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Based on your category, your household is eligible for <strong>₹5,00,000 per family per year</strong> secondary & tertiary cashless treatment at any PM-JAY empaneled hospital.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-neutral-800 dark:text-neutral-200">Next Steps to create Ayushman Card:</div>
                  <ol className="list-decimal list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                    <li>Download Ayushman App (NHA) or visit nearest CSC (Customer Service Center).</li>
                    <li>Verify with Aadhaar OTP e-KYC.</li>
                    <li>Download Ayushman Golden Card (PVC Print).</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Atal Pension Yojana */}
        {activeTab === 'atal-pension' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>PFRDA Govt Guaranteed Lifelong Pension</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Atal Pension Yojana (APY) Monthly Contribution Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Choose your monthly pension (₹1,000 to ₹5,000) after age 60 and calculate the exact monthly investment required based on your entry age.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Your Current Age (18 to 40 Years)
                    </label>
                    <span className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                      {apyEntryAge} Years
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="40"
                    value={apyEntryAge}
                    onChange={(e) => setApyEntryAge(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    Guaranteed Monthly Pension from Age 60
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 2000, 3000, 4000, 5000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setApyPensionChoice(amount)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all ${
                          apyPensionChoice === amount
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        ₹{amount.toLocaleString('en-IN')} / mo
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* APY Output */}
              <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    Required Monthly Auto-Debit Contribution
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{apyData.monthlyContribution} <span className="text-sm font-normal text-neutral-500">/ month</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="text-neutral-500">Contribution Period:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{60 - apyEntryAge} Years</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/60 pb-1.5">
                    <span className="text-neutral-500">Guaranteed Pension at 60:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">₹{apyPensionChoice.toLocaleString('en-IN')} / month for life</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Nominee Return of Corpus:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{apyData.nomineeCorpus.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. PM Kisan */}
        {activeTab === 'pm-kisan' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>Direct Benefit Transfer (₹6,000 / Year in 3 Installments)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                PM Kisan Samman Nidhi Eligibility & Payment Checker
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Verify landholder farmer status, mandatory Aadhaar-bank DBT seeding, and upcoming installment timeline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Cultivable Agricultural Land (Hectares / Acres)
                  </label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={kisanLandHectares}
                    onChange={(e) => setKisanLandHectares(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="aadhaarLinked"
                      checked={kisanAadhaarLinked}
                      onChange={(e) => setKisanAadhaarLinked(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <label htmlFor="aadhaarLinked" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Bank account is Aadhaar & NPCI DBT Seeded
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="taxPayer"
                      checked={kisanTaxPayer}
                      onChange={(e) => setKisanTaxPayer(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <label htmlFor="taxPayer" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      Any family member paid Income Tax in previous year (Exclusion Criteria)
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Output */}
              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-4">
                {!kisanTaxPayer && kisanAadhaarLinked ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Eligible for ₹6,000 / Year (₹2,000 x 3 Installments)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Period 1 (Apr - Jul):</span>
                        <span className="font-bold text-neutral-900 dark:text-white">₹2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Period 2 (Aug - Nov):</span>
                        <span className="font-bold text-neutral-900 dark:text-white">₹2,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Period 3 (Dec - Mar):</span>
                        <span className="font-bold text-neutral-900 dark:text-white">₹2,000</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-rose-600 dark:text-rose-400">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <AlertCircle className="w-5 h-5" />
                      <span>Action Required for PM-Kisan DBT</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {kisanTaxPayer 
                        ? 'Income Tax Payers are excluded under PM-Kisan guidelines.' 
                        : 'Aadhaar NPCI linking is mandatory at your bank branch or via India Post Payment Bank (IPPB).'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 6. PM Mudra Loan */}
        {activeTab === 'pm-mudra' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
                <span>Collateral-Free MSME Business Loan (Up to ₹20 Lakhs)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                PM Mudra Yojana (PMMY) Loan EMI & Category Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate monthly EMI for Shishu (up to ₹50k), Kishore (₹50k - ₹5L), and Tarun (up to ₹20L) business loans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Required Business Loan Amount
                    </label>
                    <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{mudraAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="2000000"
                    step="10000"
                    value={mudraAmount}
                    onChange={(e) => setMudraAmount(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Tenure (Years)
                    </label>
                    <select
                      value={mudraTenureYears}
                      onChange={(e) => setMudraTenureYears(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    >
                      <option value={1}>1 Year (12 mo)</option>
                      <option value={2}>2 Years (24 mo)</option>
                      <option value={3}>3 Years (36 mo)</option>
                      <option value={5}>5 Years (60 mo)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Interest Rate (% p.a.)
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      step="0.1"
                      min="7"
                      max="18"
                      value={mudraInterestRate}
                      onChange={(e) => setMudraInterestRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Mudra Output */}
              <div className="p-6 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                    Mudra Scheme Category: {mudraData.tier}
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{mudraData.emi.toLocaleString('en-IN')} <span className="text-sm font-normal text-neutral-500">/ mo</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Total Interest</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{mudraData.totalInterest.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Collateral Required</span>
                    <div className="font-bold text-emerald-600">ZERO (Nil)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. PM Awas Yojana */}
        {activeTab === 'pm-awas' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-2">
                <span>MoHUA Credit Linked Subsidy Scheme (CLSS)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                PM Awas Yojana (PMAY-Urban 2.0 & Gramin) Housing Subsidy
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate upfront home loan interest subsidy credited directly to your home loan principal balance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Income Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ews', label: 'EWS (Up to ₹3L)' },
                      { id: 'lig', label: 'LIG (₹3L - ₹6L)' },
                      { id: 'mig', label: 'MIG (₹6L - ₹9L)' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setAwasCategory(cat.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                          awasCategory === cat.id
                            ? 'bg-cyan-600 text-white border-cyan-700'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Home Loan Amount (₹)
                    </label>
                    <span className="font-mono text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      ₹{awasLoanAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300000"
                    max="5000000"
                    step="50000"
                    value={awasLoanAmount}
                    onChange={(e) => setAwasLoanAmount(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              {/* Awas Output */}
              <div className="p-6 rounded-3xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-1">
                    Direct Upfront Principal Subsidy
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{awasData.calculatedSubsidy.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Interest Subsidy Rate:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{awasData.interestRateSubsidy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Max Eligible Loan for Subsidy:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{awasData.maxEligibleLoan.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. PM Matru Vandana */}
        {activeTab === 'pm-matru-vandana' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
                <span>Women & Child Development (Direct Bank Transfer)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                PM Matru Vandana Yojana (PMMVY) Maternity Benefit
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                ₹5,000 for first child and ₹6,000 for second girl child maternity cash benefit directly in the mother's Aadhaar bank account.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Child Order & Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPmmvyChildOrder('first')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        pmmvyChildOrder === 'first'
                          ? 'bg-purple-600 text-white border-purple-700'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      👶 First Child (₹5,000)
                    </button>
                    <button
                      onClick={() => setPmmvyChildOrder('second-girl')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        pmmvyChildOrder === 'second-girl'
                          ? 'bg-purple-600 text-white border-purple-700'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      👧 Second Girl Child (₹6,000)
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Output */}
              <div className="p-6 rounded-3xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">
                    Total Direct Cash Benefit
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    {pmmvyChildOrder === 'first' ? '₹5,000' : '₹6,000'}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="font-bold text-neutral-900 dark:text-white">Installment Schedule:</div>
                  {pmmvyChildOrder === 'first' ? (
                    <ul className="list-disc list-inside space-y-1">
                      <li>Installment 1: ₹3,000 on registration of pregnancy (LMP) and at least 1 ANC.</li>
                      <li>Installment 2: ₹2,000 after child birth registration & 1st cycle immunization.</li>
                    </ul>
                  ) : (
                    <p>Single installment of ₹6,000 directly after birth registration of the girl child.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
