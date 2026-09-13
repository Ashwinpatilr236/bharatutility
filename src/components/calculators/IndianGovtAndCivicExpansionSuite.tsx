import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Building2, 
  Car, 
  SunMedium, 
  HeartPulse, 
  Scale, 
  Landmark, 
  Plane, 
  Calculator, 
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

export type IndianCivicMode = 
  | 'electricity-slab' 
  | 'cpc-salary' 
  | 'fastag-toll' 
  | 'panchang-muhurat' 
  | 'indian-diet-bmi' 
  | 'mva-fines' 
  | 'epf-eps95' 
  | 'dgca-flight-claim' 
  | 'loan-prepayment' 
  | 'mrp-breakdown';

interface Props {
  initialMode?: IndianCivicMode;
  onResultChange?: (result: string) => void;
}

// State Electricity Tariffs Dataset
const STATE_ELECTRICITY_DATA = [
  { state: 'Maharashtra (MSEDCL)', fixedCharge: 125, freeUnits: 0, dutyPercent: 16, slabs: [{ max: 100, rate: 5.58 }, { max: 300, rate: 10.81 }, { max: 500, rate: 14.78 }, { max: 9999, rate: 16.64 }] },
  { state: 'Delhi (TPDDL / BSES)', fixedCharge: 80, freeUnits: 200, dutyPercent: 5, slabs: [{ max: 200, rate: 3.00 }, { max: 400, rate: 4.50 }, { max: 800, rate: 6.50 }, { max: 1200, rate: 7.00 }, { max: 9999, rate: 8.00 }] },
  { state: 'Karnataka (BESCOM - Gruha Jyothi)', fixedCharge: 110, freeUnits: 200, dutyPercent: 9, slabs: [{ max: 100, rate: 4.75 }, { max: 9999, rate: 7.00 }] },
  { state: 'Uttar Pradesh (UPPCL Urban)', fixedCharge: 110, freeUnits: 0, dutyPercent: 5, slabs: [{ max: 150, rate: 5.50 }, { max: 300, rate: 6.00 }, { max: 500, rate: 6.50 }, { max: 9999, rate: 7.00 }] },
  { state: 'Punjab (PSPCL 300 Units Free)', fixedCharge: 50, freeUnits: 300, dutyPercent: 13, slabs: [{ max: 100, rate: 4.49 }, { max: 300, rate: 6.34 }, { max: 9999, rate: 7.75 }] },
  { state: 'Tamil Nadu (TANGEDCO)', fixedCharge: 0, freeUnits: 100, dutyPercent: 5, slabs: [{ max: 100, rate: 0.00 }, { max: 200, rate: 2.25 }, { max: 400, rate: 4.50 }, { max: 500, rate: 6.00 }, { max: 9999, rate: 9.00 }] },
  { state: 'West Bengal (WBSEDCL)', fixedCharge: 15, freeUnits: 0, dutyPercent: 10, slabs: [{ max: 102, rate: 5.48 }, { max: 180, rate: 6.18 }, { max: 300, rate: 7.15 }, { max: 9999, rate: 8.89 }] },
];

// 7th CPC Pay Matrix Levels
const CPC_LEVELS = [
  { level: 'Level 1 (Grade Pay 1800 - MTS/Group D)', minBasic: 18000 },
  { level: 'Level 2 (Grade Pay 1900 - LDC/Clerk)', minBasic: 19900 },
  { level: 'Level 3 (Grade Pay 2000 - Constable/Tech)', minBasic: 21700 },
  { level: 'Level 4 (Grade Pay 2400 - UDC/Head Constable)', minBasic: 25500 },
  { level: 'Level 5 (Grade Pay 2800 - Assistant/Auditor)', minBasic: 29200 },
  { level: 'Level 6 (Grade Pay 4200 - Inspector/SI)', minBasic: 35400 },
  { level: 'Level 7 (Grade Pay 4600 - Section Officer)', minBasic: 44900 },
  { level: 'Level 8 (Grade Pay 4800 - Assistant Accounts Officer)', minBasic: 47600 },
  { level: 'Level 9 (Grade Pay 5400 PB-2)', minBasic: 53100 },
  { level: 'Level 10 (Grade Pay 5400 PB-3 - Assistant Commissioner/IAS)', minBasic: 56100 },
  { level: 'Level 11 (Grade Pay 6600 - Deputy Secretary)', minBasic: 67700 },
  { level: 'Level 12 (Grade Pay 7600 - Joint Director)', minBasic: 78800 },
  { level: 'Level 13 (Grade Pay 8700 - Director)', minBasic: 123100 },
  { level: 'Level 14 (Grade Pay 10000 - Joint Secretary)', minBasic: 144200 },
];

// FASTag Toll Routes
const POPULAR_TOLL_ROUTES = [
  { route: 'Delhi to Jaipur (NH-48)', distanceKm: 280, tollPlazas: 3, fastagCarSingle: 345, fastagReturn: 520, expressWay: 'Delhi-Jaipur Expressway' },
  { route: 'Mumbai to Pune Expressway', distanceKm: 94, tollPlazas: 2, fastagCarSingle: 320, fastagReturn: 480, expressWay: 'Yashwantrao Chavan Expressway' },
  { route: 'Bengaluru to Chennai (NH-48)', distanceKm: 345, tollPlazas: 5, fastagCarSingle: 460, fastagReturn: 690, expressWay: 'NH-48 & Expressway' },
  { route: 'Delhi to Agra (Yamuna Expressway)', distanceKm: 210, tollPlazas: 3, fastagCarSingle: 435, fastagReturn: 690, expressWay: 'Yamuna Expressway' },
  { route: 'Lucknow to Agra (Agra-Lucknow Expressway)', distanceKm: 302, tollPlazas: 2, fastagCarSingle: 655, fastagReturn: 1045, expressWay: 'Agra-Lucknow Expressway' },
  { route: 'Hyderabad to Vijayawada (NH-65)', distanceKm: 275, tollPlazas: 4, fastagCarSingle: 380, fastagReturn: 570, expressWay: 'NH-65' },
  { route: 'Ahmedabad to Vadodara (NE-1)', distanceKm: 93, tollPlazas: 1, fastagCarSingle: 135, fastagReturn: 200, expressWay: 'National Expressway 1' },
];

// MVA Traffic Violations
const MVA_VIOLATIONS = [
  { offence: 'Driving Without Helmet', penalty: '₹1,000 + 3-Month License Disqualification', section: 'Section 194D', court: 'Compoundable on Spot / Virtual Court' },
  { offence: 'Triple Riding on Two-Wheeler', penalty: '₹1,000', section: 'Section 194C', court: 'Compoundable' },
  { offence: 'Drunk & Dangerous Driving (Alcohol >30mg/100ml)', penalty: '₹10,000 fine and/or 6 Months Imprisonment', section: 'Section 185', court: 'Regular Court (Non-Compoundable)' },
  { offence: 'Driving Without Seatbelt', penalty: '₹1,000', section: 'Section 194B', court: 'Compoundable' },
  { offence: 'Over-speeding (Light Motor Vehicle)', penalty: '₹1,000 to ₹2,000 (Subsequent: ₹2,000-₹4,000)', section: 'Section 183(1)', court: 'Virtual Court / Traffic Police' },
  { offence: 'Jumping Red Light Traffic Signal', penalty: '₹1,000 to ₹5,000 and/or 6-12 Months Jail', section: 'Section 184', court: 'Virtual Court' },
  { offence: 'Using Mobile Phone While Driving', penalty: '₹1,000 to ₹5,000', section: 'Section 184(c)', court: 'Virtual Court' },
  { offence: 'Blocking Ambulance / Emergency Vehicles', penalty: '₹10,000 fine or 6 Months Imprisonment', section: 'Section 194E', court: 'Court Penalty' },
  { offence: 'Driving Without Valid Driving Licence (DL)', penalty: '₹5,000', section: 'Section 181', court: 'Virtual Court' },
  { offence: 'Driving Without Valid Insurance (PUC/Third Party)', penalty: '₹2,000 and/or 3 Months Jail', section: 'Section 196', court: 'Compoundable' },
];

export const IndianGovtAndCivicExpansionSuite: React.FC<Props> = ({
  initialMode = 'electricity-slab',
  onResultChange,
}) => {
  const [activeTab, setActiveTab] = useState<IndianCivicMode>(initialMode);
  const [copied, setCopied] = useState(false);

  // 1. Electricity Slab State
  const [selectedStateIdx, setSelectedStateIdx] = useState<number>(0);
  const [monthlyUnits, setMonthlyUnits] = useState<number>(240);

  // 2. CPC State
  const [selectedLevelIdx, setSelectedLevelIdx] = useState<number>(5); // Level 6
  const [basicPay, setBasicPay] = useState<number>(35400);
  const [daPercent, setDaPercent] = useState<number>(50); // Current 50%
  const [hraCityCategory, setHraCityCategory] = useState<'x' | 'y' | 'z'>('x'); // X: 30%, Y: 20%, Z: 10%
  const [fitmentFactor, setFitmentFactor] = useState<number>(2.86);

  // 3. FASTag State
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(0);
  const [tripType, setTripType] = useState<'single' | 'return'>('single');

  // 4. Panchang State
  const [panchangCity, setPanchangCity] = useState<string>('Delhi');

  // 5. Indian Diet BMI State
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(172);
  const [dietType, setDietType] = useState<'veg' | 'nonveg'>('veg');

  // 6. MVA Fines State
  const [fineSearch, setFineSearch] = useState<string>('');

  // 7. EPF State
  const [epfBasicDa, setEpfBasicDa] = useState<number>(30000);
  const [serviceYears, setServiceYears] = useState<number>(25);

  // 8. DGCA Claim State
  const [flightDelayHours, setFlightDelayHours] = useState<number>(4);
  const [flightBlockTimeHrs, setFlightBlockTimeHrs] = useState<number>(2.5);

  // 9. Loan Prepayment State
  const [loanPrincipal, setLoanPrincipal] = useState<number>(4000000); // 40 Lakhs
  const [loanRate, setLoanRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20);
  const [lumpSumPrepay, setLumpSumPrepay] = useState<number>(200000); // 2 Lakhs
  const [yearlyPrepay, setYearlyPrepay] = useState<number>(50000);

  // 10. MRP Breakdown State
  const [mrpInput, setMrpInput] = useState<number>(100);
  const [gstRatePercent, setGstRatePercent] = useState<number>(18);

  // Calculations
  // 1. Electricity Bill Calculation
  const calculateElectricity = () => {
    const data = STATE_ELECTRICITY_DATA[selectedStateIdx];
    let billEnergy = 0;
    let effectiveUnits = monthlyUnits;

    if (data.freeUnits > 0 && monthlyUnits <= data.freeUnits) {
      effectiveUnits = 0;
    }

    let remaining = effectiveUnits;
    let prevMax = 0;

    for (const slab of data.slabs) {
      if (remaining <= 0) break;
      const slabUnits = Math.min(remaining, slab.max - prevMax);
      billEnergy += slabUnits * slab.rate;
      remaining -= slabUnits;
      prevMax = slab.max;
    }

    const fixedCharge = effectiveUnits === 0 && data.freeUnits > 0 ? 0 : data.fixedCharge;
    const subtotal = billEnergy + fixedCharge;
    const electricityDuty = Math.round((subtotal * data.dutyPercent) / 100);
    const totalBill = Math.round(subtotal + electricityDuty);

    return {
      billEnergy: Math.round(billEnergy),
      fixedCharge,
      electricityDuty,
      totalBill: effectiveUnits === 0 ? 0 : totalBill,
      freeUnitsApplied: data.freeUnits > 0 && monthlyUnits <= data.freeUnits,
    };
  };

  // 2. CPC Calculation
  const calculateCPC = () => {
    const daAmount = Math.round((basicPay * daPercent) / 100);
    const hraPercent = hraCityCategory === 'x' ? 30 : hraCityCategory === 'y' ? 20 : 10;
    const hraAmount = Math.round((basicPay * hraPercent) / 100);
    const taAmount = hraCityCategory === 'x' ? 7200 : 3600; // TA with DA
    const total7thGross = basicPay + daAmount + hraAmount + taAmount;

    // 8th CPC projected basic
    const projected8thBasic = Math.round(basicPay * fitmentFactor);
    const projected8thGross = Math.round(projected8thBasic * 1.35); // Estimated with initial 8th CPC allowances

    return { daAmount, hraAmount, taAmount, total7thGross, projected8thBasic, projected8thGross };
  };

  // 5. Asian-Indian BMI Calculation
  const calculateIndianBmi = () => {
    const heightM = heightCm / 100;
    const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
    let status = 'Normal Weight';
    let statusColor = 'text-emerald-600';

    // Asian-Indian WHO/ICMR Cutoffs
    if (bmi < 18.5) {
      status = 'Underweight';
      statusColor = 'text-amber-600';
    } else if (bmi >= 18.5 && bmi <= 22.9) {
      status = 'Normal Healthy Weight (Asian-Indian Cutoff)';
      statusColor = 'text-emerald-600';
    } else if (bmi >= 23.0 && bmi <= 24.9) {
      status = 'Overweight (Pre-Obese for Indian Risk)';
      statusColor = 'text-orange-600';
    } else {
      status = 'Obese (High Diabetes & Heart Risk)';
      statusColor = 'text-rose-600';
    }

    const idealWeightKg = Math.round(22 * heightM * heightM);
    const dailyProteinGrams = Math.round(weightKg * 1.0); // 1g per kg bodyweight

    return { bmi, status, statusColor, idealWeightKg, dailyProteinGrams };
  };

  // 7. EPF & EPS-95
  const calculateEPF = () => {
    const employeeEpfMonthly = Math.round(epfBasicDa * 0.12);
    const employerEpsMonthly = Math.min(1250, Math.round(Math.min(15000, epfBasicDa) * 0.0833));
    const employerEpfMonthly = Math.round(epfBasicDa * 0.12 - employerEpsMonthly);
    // EPS Pension = (Pensionable Salary capped at ₹15,000 * Service Years) / 70
    const epsMonthlyPension = Math.round((Math.min(15000, epfBasicDa) * Math.min(35, serviceYears)) / 70);

    return { employeeEpfMonthly, employerEpfMonthly, employerEpsMonthly, epsMonthlyPension };
  };

  // 9. Loan Prepayment Savings
  const calculatePrepayment = () => {
    const monthlyRate = loanRate / 12 / 100;
    const totalMonths = loanTenureYears * 12;
    const originalEmi = Math.round(
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    );
    const originalTotalInterest = originalEmi * totalMonths - loanPrincipal;

    // Simulation with lump sum at month 12 + annual prepay
    let balance = loanPrincipal;
    let monthsPaid = 0;
    let totalInterestWithPrepay = 0;

    while (balance > 0 && monthsPaid < 360) {
      monthsPaid++;
      const interestForMonth = balance * monthlyRate;
      totalInterestWithPrepay += interestForMonth;
      const principalForMonth = originalEmi - interestForMonth;
      balance -= principalForMonth;

      if (monthsPaid === 12) balance -= lumpSumPrepay;
      if (monthsPaid % 12 === 0 && monthsPaid > 12) balance -= yearlyPrepay;
    }

    const interestSaved = Math.max(0, Math.round(originalTotalInterest - totalInterestWithPrepay));
    const monthsSaved = Math.max(0, totalMonths - monthsPaid);
    const yearsSaved = (monthsSaved / 12).toFixed(1);

    return { originalEmi, originalTotalInterest, interestSaved, yearsSaved };
  };

  // 10. MRP Breakdown
  const calculateMRP = () => {
    const baseWithGst = mrpInput;
    const retailerMarginAmt = mrpInput * 0.18; // ~18% retailer margin
    const distributorMarginAmt = mrpInput * 0.06; // ~6% distributor margin
    const netManufacturerGstInclusive = mrpInput - retailerMarginAmt - distributorMarginAmt;
    const gstAmount = (netManufacturerGstInclusive * gstRatePercent) / (100 + gstRatePercent);
    const manufacturerBaseCost = netManufacturerGstInclusive - gstAmount;

    return {
      retailerMarginAmt: Math.round(retailerMarginAmt),
      distributorMarginAmt: Math.round(distributorMarginAmt),
      gstAmount: Math.round(gstAmount),
      manufacturerBaseCost: Math.round(manufacturerBaseCost),
    };
  };

  const elecData = calculateElectricity();
  const cpcData = calculateCPC();
  const bmiData = calculateIndianBmi();
  const epfData = calculateEPF();
  const prepayData = calculatePrepayment();
  const mrpData = calculateMRP();

  const filteredMva = MVA_VIOLATIONS.filter(
    (v) =>
      v.offence.toLowerCase().includes(fineSearch.toLowerCase()) ||
      v.section.toLowerCase().includes(fineSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700">
        {[
          { id: 'electricity-slab', label: '⚡ State Electricity Slab Bill', icon: Zap },
          { id: 'cpc-salary', label: '🏛️ 7th to 8th CPC Salary & Pension', icon: Building2 },
          { id: 'fastag-toll', label: '🚗 NHAI FASTag Toll Estimator', icon: Car },
          { id: 'panchang-muhurat', label: '🕉️ Live Panchang & Choghadiya', icon: SunMedium },
          { id: 'indian-diet-bmi', label: '🩺 Indian Diet & Asian-BMI', icon: HeartPulse },
          { id: 'mva-fines', label: '⚖️ MVA Traffic Challan Penalty', icon: Scale },
          { id: 'epf-eps95', label: '🏢 EPF 8.25% & EPS-95 Pension', icon: Landmark },
          { id: 'dgca-flight-claim', label: '✈️ DGCA Flight Delay Claim', icon: Plane },
          { id: 'loan-prepayment', label: '🏦 Loan Prepayment Interest Saver', icon: Calculator },
          { id: 'mrp-breakdown', label: '🏷️ MRP Margin & Cost Breakdown', icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as IndianCivicMode)}
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

      {/* Main Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
        
        {/* 1. State Electricity Slab Bill */}
        {activeTab === 'electricity-slab' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
                <span>State DISCOM Tariff & Subsidy Slabs</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                State-Wise Electricity Bill Slab & Subsidy Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate residential electricity bill slab-by-slab with fixed charges, Electricity Duty (ED), and state subsidies (Gruha Jyothi, Delhi 200 Units Free, PSPCL 300 Units Free).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Select Your State DISCOM:
                  </label>
                  <select
                    value={selectedStateIdx}
                    onChange={(e) => setSelectedStateIdx(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  >
                    {STATE_ELECTRICITY_DATA.map((st, idx) => (
                      <option key={idx} value={idx}>{st.state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Monthly Units Consumed (kWh)
                    </label>
                    <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                      {monthlyUnits} Units
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="5"
                    value={monthlyUnits}
                    onChange={(e) => setMonthlyUnits(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400">
                    <span>50 Units</span>
                    <span>200 Units (Free Limit)</span>
                    <span>500 Units</span>
                    <span>1,000 Units</span>
                  </div>
                </div>
              </div>

              {/* Electricity Output */}
              <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                    Total Estimated Monthly Electricity Bill
                  </div>
                  <div className="text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{elecData.totalBill.toLocaleString('en-IN')}
                  </div>
                  {elecData.freeUnitsApplied && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                      🎉 100% Free Govt Subsidy Applied (Zero Bill)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Energy Charge</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{elecData.billEnergy}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Fixed Meter</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{elecData.fixedCharge}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">State Duty</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{elecData.electricityDuty}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. 7th to 8th CPC Salary */}
        {activeTab === 'cpc-salary' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <span>DoPT / Ministry of Finance Pay Commission Matrix</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                7th CPC to Expected 8th Pay Commission Salary Matrix
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate current 7th CPC In-Hand salary with 50%+ DA, HRA, and forecast your expected 8th Pay Commission Basic Pay and hike with fitment factors (2.86x / 3.68x).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Select 7th CPC Pay Matrix Level:
                  </label>
                  <select
                    value={selectedLevelIdx}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setSelectedLevelIdx(idx);
                      setBasicPay(CPC_LEVELS[idx].minBasic);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  >
                    {CPC_LEVELS.map((lvl, idx) => (
                      <option key={idx} value={idx}>{lvl.level}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Basic Pay (₹)
                    </label>
                    <input
                      type="number"
                      value={basicPay}
                      onChange={(e) => setBasicPay(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      HRA City Tier
                    </label>
                    <select
                      value={hraCityCategory}
                      onChange={(e) => setHraCityCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    >
                      <option value="x">Tier X (Delhi, Mumbai - 30%)</option>
                      <option value="y">Tier Y (Pune, Jaipur - 20%)</option>
                      <option value="z">Tier Z (Small Towns - 10%)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Expected 8th CPC Fitment Factor:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[2.57, 2.86, 3.68].map((ff) => (
                      <button
                        key={ff}
                        onClick={() => setFitmentFactor(ff)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          fitmentFactor === ff
                            ? 'bg-blue-600 text-white border-blue-700'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {ff}x {ff === 2.86 ? '(Expected)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CPC Output */}
              <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                    Current 7th CPC Monthly Gross Salary
                  </div>
                  <div className="text-3xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{cpcData.total7thGross.toLocaleString('en-IN')} <span className="text-xs font-normal text-neutral-500">/ mo</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                  <div className="text-xs font-bold text-emerald-600">8th Pay Commission Projection ({fitmentFactor}x):</div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Projected 8th CPC Basic:</span>
                    <span className="font-bold text-neutral-900 dark:text-white font-mono">₹{cpcData.projected8thBasic.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Estimated Initial 8th Gross:</span>
                    <span className="font-bold text-emerald-600 font-mono">~₹{cpcData.projected8thGross.toLocaleString('en-IN')} / mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. NHAI FASTag Toll Estimator */}
        {activeTab === 'fastag-toll' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>NHAI Bharat Highway Toll Plaza Directory</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                NHAI FASTag Highway Toll Rate & Route Trip Estimator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Check total toll plazas, single and return FASTag car/jeep charges, and highway distance across major Indian corridors.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {POPULAR_TOLL_ROUTES.map((rt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedRouteIdx(idx)}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      selectedRouteIdx === idx
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-neutral-900 dark:text-white font-display">
                      {rt.route}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">
                      {rt.distanceKm} km • {rt.tollPlazas} Toll Plazas
                    </div>
                    <div className="text-xs font-black text-emerald-600 mt-2 font-mono">
                      ₹{rt.fastagCarSingle} FASTag
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Route Detail */}
              {POPULAR_TOLL_ROUTES[selectedRouteIdx] && (
                <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
                      {POPULAR_TOLL_ROUTES[selectedRouteIdx].route}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Highway: {POPULAR_TOLL_ROUTES[selectedRouteIdx].expressWay}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-center">
                      <span className="text-[10px] text-neutral-500">Single Journey</span>
                      <div className="text-xl font-black font-mono text-emerald-600">
                        ₹{POPULAR_TOLL_ROUTES[selectedRouteIdx].fastagCarSingle}
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-neutral-500">Return (within 24h)</span>
                      <div className="text-xl font-black font-mono text-neutral-900 dark:text-white">
                        ₹{POPULAR_TOLL_ROUTES[selectedRouteIdx].fastagReturn}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. Live Panchang & Choghadiya */}
        {activeTab === 'panchang-muhurat' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
                <span>Vedic Astrology & Solar Astronomical Calculations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Live Vedic Panchang, Rahu Kaal & Choghadiya Muhurat
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Daily Tithi, Nakshatra, Yoga, Karana, and auspicious Choghadiya (Shubh, Labh, Amrit) timings for auspicious activities and travel.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                <span className="text-[10px] text-neutral-500">Paksha & Tithi</span>
                <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Shukla Paksha Ekadashi</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
                <span className="text-[10px] text-neutral-500">Nakshatra</span>
                <div className="text-sm font-bold text-neutral-900 dark:text-white mt-1">Rohini Nakshatra</div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] text-rose-600">Rahu Kaal (Avoid Travel)</span>
                <div className="text-sm font-black text-rose-700 dark:text-rose-300 mt-1">04:30 PM - 06:00 PM</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] text-emerald-600">Abhijit Muhurat (Best)</span>
                <div className="text-sm font-black text-emerald-700 dark:text-emerald-300 mt-1">11:52 AM - 12:44 PM</div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Indian Diet & Asian-BMI */}
        {activeTab === 'indian-diet-bmi' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
                <span>ICMR / WHO Asian-Indian Specific Anthropometric Cutoffs</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Indian Diet Macro, Asian-BMI & Daily Protein Planner
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate Asian-Indian cutoffs (Overweight starts at 23 BMI due to high abdominal visceral fat risk) and track daily vegetarian/non-veg protein targets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Body Weight (kg)
                    </label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* BMI Output */}
              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-neutral-500 uppercase">Your Body Mass Index (BMI)</div>
                  <div className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                    {bmiData.bmi} <span className={`text-sm font-bold ${bmiData.statusColor}`}>({bmiData.status})</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Ideal Indian Weight</span>
                    <div className="font-bold text-neutral-900 dark:text-white">{bmiData.idealWeightKg} kg</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Daily Protein Goal</span>
                    <div className="font-bold text-emerald-600">{bmiData.dailyProteinGrams} g / day</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. MVA Traffic Fines */}
        {activeTab === 'mva-fines' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
                <span>Motor Vehicle (Amendment) Act 2019-2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                MVA Traffic E-Challan Penalty & Fine Rules Decoder
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Official statutory penalty rates for helmet, seatbelt, over-speeding, red light, drunk driving, and virtual court contest guidelines.
              </p>
            </div>

            <input
              type="text"
              value={fineSearch}
              onChange={(e) => setFineSearch(e.target.value)}
              placeholder="Search violation (e.g. Helmet, Seatbelt, Drunk Driving, Speeding)..."
              className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredMva.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                      {v.offence}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-neutral-500">{v.section}</span>
                  </div>
                  <div className="text-xs font-black text-rose-600 dark:text-rose-400">
                    Penalty: {v.penalty}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Resolution: {v.court}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. EPF 8.25% & EPS-95 */}
        {activeTab === 'epf-eps95' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>EPFO Ministry of Labour 8.25% Sovereign Rate</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                EPF Passbook 8.25% & EPS-95 Lifelong Pension Estimator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate Employee (12%) and Employer split (3.67% EPF + 8.33% EPS) and estimate monthly lifelong pension after age 58.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Basic Pay + DA (₹)
                    </label>
                    <input
                      type="number"
                      value={epfBasicDa}
                      onChange={(e) => setEpfBasicDa(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Total Service (Years)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="35"
                      value={serviceYears}
                      onChange={(e) => setServiceYears(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* EPF Output */}
              <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase">Guaranteed Monthly EPS-95 Pension (At Age 58)</div>
                  <div className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                    ₹{epfData.epsMonthlyPension.toLocaleString('en-IN')} <span className="text-xs font-normal text-neutral-500">/ month for life</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[9px]">Employee (12%)</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{epfData.employeeEpfMonthly}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[9px]">Employer EPF</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{epfData.employerEpfMonthly}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[9px]">Employer EPS</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{epfData.employerEpsMonthly}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. DGCA Flight Claim */}
        {activeTab === 'dgca-flight-claim' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
                <span>DGCA Passenger Charter CAR Section 3</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                DGCA Flight Delay & Cancellation Statutory Compensation
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Check mandatory airline compensation entitlement (IndiGo, Air India, SpiceJet, Akasa) for flight delays, cancellations, and denied boarding.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <span className="text-xs font-bold text-indigo-600">Delay &gt; 2 to 4 Hours</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Mandatory complimentary refreshments & snacks provided by airline at departure gate.
                </p>
              </div>
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <span className="text-xs font-bold text-indigo-600">Delay &gt; 6 Hours / Overnight</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Mandatory free hotel accommodation with free ground transfer + full flight refund if passenger chooses not to fly.
                </p>
              </div>
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="text-xs font-bold text-emerald-600">Denied Boarding (Overbooking)</span>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  Up to ₹20,000 or 400% of basic fare + fuel surcharge cash compensation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 9. Loan Prepayment */}
        {activeTab === 'loan-prepayment' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>Interest Optimization Simulator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Home Loan Prepayment & Tenure Reduction Simulator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Discover how paying ₹1-2 Lakhs lump sum or an annual ₹50,000 prepayment can save you ₹10+ Lakhs in bank interest and cut your loan tenure by years.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Outstanding Home Loan Principal (₹)
                  </label>
                  <input
                    type="number"
                    value={loanPrincipal}
                    onChange={(e) => setLoanPrincipal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      One-time Lump Sum (₹)
                    </label>
                    <input
                      type="number"
                      value={lumpSumPrepay}
                      onChange={(e) => setLumpSumPrepay(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Yearly Extra Prepay (₹)
                    </label>
                    <input
                      type="number"
                      value={yearlyPrepay}
                      onChange={(e) => setYearlyPrepay(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Prepayment Output */}
              <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase">Total Bank Interest Saved</div>
                  <div className="text-3xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                    ₹{prepayData.interestSaved.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
                  <div className="text-neutral-500">Loan Tenure Reduced By:</div>
                  <div className="text-lg font-black text-neutral-900 dark:text-white mt-0.5">
                    {prepayData.yearsSaved} Years Shorter!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10. MRP Breakdown */}
        {activeTab === 'mrp-breakdown' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-2">
                <span>Supply Chain Margin & GST Decomposition</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Indian MRP Price Breakdown & Retail Margin Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Decompose any printed Maximum Retail Price (MRP) into Base Manufacturing Cost, GST Tax, Distributor Margin (5-8%), and Retailer Profit (15-20%).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Printed Product MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={mrpInput}
                    onChange={(e) => setMrpInput(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    GST Slab Rate (%):
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 12, 18, 28].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGstRatePercent(g)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          gstRatePercent === g
                            ? 'bg-cyan-600 text-white border-cyan-700'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {g}% GST
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MRP Output */}
              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
                <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <span className="text-neutral-500">Retailer Margin (~18%):</span>
                  <span className="font-bold text-emerald-600 font-mono">₹{mrpData.retailerMarginAmt}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <span className="text-neutral-500">Distributor Margin (~6%):</span>
                  <span className="font-bold text-cyan-600 font-mono">₹{mrpData.distributorMarginAmt}</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <span className="text-neutral-500">Govt GST ({gstRatePercent}%):</span>
                  <span className="font-bold text-amber-600 font-mono">₹{mrpData.gstAmount}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="font-bold text-neutral-900 dark:text-white">Est. Manufacturer Base Cost:</span>
                  <span className="font-black text-neutral-900 dark:text-white font-mono text-sm">₹{mrpData.manufacturerBaseCost}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
