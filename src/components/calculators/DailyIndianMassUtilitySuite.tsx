import React, { useState } from 'react';
import { calculate44ADABasic } from '../../utils/tax44ada';
import { calculateJewelleryPrice, getEffectiveGoldRatePerGram } from '../../utils/goldPricing';
import { REGIONAL_LAND_UNITS, convertRegionalLand } from '../../data/landUnits';
import { 
  Sparkles, 
  Coins, 
  Milk, 
  MapPin, 
  Landmark, 
  Baby, 
  FileText, 
  Car, 
  Laptop, 
  Scale, 
  Pill,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Calendar,
  ArrowRight
} from 'lucide-react';

export type IndianMassUtilityMode =
  | 'gold-jewellery'
  | 'milk-fat'
  | 'land-units'
  | 'gratuity-calc'
  | 'baby-vaccine'
  | 'stamp-paper'
  | 'car-valuation'
  | 'tax-44ada'
  | 'consumer-notice'
  | 'medicine-compare';

interface Props {
  initialMode?: IndianMassUtilityMode;
  onResultChange?: (result: string) => void;
}

// 1. Common Indian Medicines Database
const POPULAR_MEDICINES = [
  { brand: 'Augmentin 625 Duo', salt: 'Amoxycillin (500mg) + Clavulanic Acid (125mg)', brandPrice: 205, genericPrice: 55, use: 'Bacterial infections, respiratory tract' },
  { brand: 'Pan-D (Pantocid DSR)', salt: 'Pantoprazole (40mg) + Domperidone (30mg)', brandPrice: 195, genericPrice: 32, use: 'Acidity, GERD, Heartburn' },
  { brand: 'Telma-40 (Telmikind)', salt: 'Telmisartan (40mg)', brandPrice: 145, genericPrice: 18, use: 'High Blood Pressure (Hypertension)' },
  { brand: 'Glycomet-GP 2', salt: 'Glimepiride (2mg) + Metformin (500mg)', brandPrice: 185, genericPrice: 28, use: 'Type-2 Diabetes Blood Sugar control' },
  { brand: 'Calpol 650 (Dolo 650)', salt: 'Paracetamol (650mg)', brandPrice: 34, genericPrice: 10, use: 'Fever, Body pain, Headache' },
  { brand: 'Shelcal 500', salt: 'Calcium (500mg) + Vitamin D3 (250 IU)', brandPrice: 135, genericPrice: 24, use: 'Bone strength, Calcium deficiency' },
  { brand: 'Montair-LC', salt: 'Montelukast (10mg) + Levocetirizine (5mg)', brandPrice: 215, genericPrice: 35, use: 'Allergy, Asthma, Runny nose' },
  { brand: 'Rosuvas 10 (Rozavel)', salt: 'Rosuvastatin (10mg)', brandPrice: 240, genericPrice: 30, use: 'High Cholesterol, Heart health' },
];

// 3. Indian Baby Vaccination Milestone Schedule
const VACCINE_SCHEDULE = [
  { ageLabel: 'At Birth (0 Days)', vaccines: 'BCG, OPV 0 Dose, Hepatitis B (Birth Dose)', notes: 'Given within 24 hours of birth at hospital' },
  { ageLabel: '6 Weeks (1.5 Months)', vaccines: 'Pentavalent 1, Rotavirus 1, OPV 1, fIPV 1, PCV 1', notes: 'Protects against Diphtheria, Tetanus, Polio, Diarrhea, Pneumonia' },
  { ageLabel: '10 Weeks (2.5 Months)', vaccines: 'Pentavalent 2, Rotavirus 2, OPV 2', notes: 'Second primary immunisation dose' },
  { ageLabel: '14 Weeks (3.5 Months)', vaccines: 'Pentavalent 3, Rotavirus 3, OPV 3, fIPV 2, PCV 2', notes: 'Third primary immunisation dose' },
  { ageLabel: '9 to 12 Months', vaccines: 'MR 1st Dose (Measles Rubella), JE 1, PCV Booster, Vitamin A (1st Dose)', notes: 'Major milestone for measles and brain fever protection' },
  { ageLabel: '16 to 24 Months', vaccines: 'MR 2nd Dose, DPT 1st Booster, OPV Booster, JE 2', notes: 'Toddler booster protection' },
  { ageLabel: '5 to 6 Years', vaccines: 'DPT 2nd Booster', notes: 'School entry immunization' },
  { ageLabel: '10 & 16 Years', vaccines: 'Td Vaccine (Tetanus & adult Diphtheria)', notes: 'Adolescent tetanus protection' },
];

// 4. Non-Judicial Stamp Paper Values by State & Purpose
const STAMP_PAPER_RULES = [
  { purpose: 'Residential Rent Agreement (Up to 11 Months)', stampValue: '₹100 to ₹500 (Maharashtra: 0.25% of annual rent)', validity: '11 Months', eStampAvailable: true },
  { purpose: 'General Affidavit / Name Change / Address Proof', stampValue: '₹10, ₹20, ₹50 or ₹100 Non-Judicial Stamp', validity: 'Permanent until superseded', eStampAvailable: true },
  { purpose: 'General Power of Attorney (GPA - Family Member)', stampValue: '₹100 to ₹500 (Non-family: 2% to 5% of property value)', validity: 'As specified or life of principal', eStampAvailable: true },
  { purpose: 'Indemnity Bond / Bank Account Deceased Claim', stampValue: '₹100 to ₹500', validity: 'Permanent', eStampAvailable: true },
  { purpose: 'Partnership Deed Formation', stampValue: '₹500 to ₹2,000 depending on capital contribution', validity: 'Duration of partnership', eStampAvailable: true },
  { purpose: 'Will & Testament (Vasiyat)', stampValue: 'Zero (No stamp paper required; can be on plain paper)', validity: 'Takes effect after testator passing', eStampAvailable: false },
];

export const DailyIndianMassUtilitySuite: React.FC<Props> = ({
  initialMode = 'gold-jewellery',
  onResultChange,
}) => {
  const [activeTab, setActiveTab] = useState<IndianMassUtilityMode>(initialMode);
  const [copied, setCopied] = useState(false);

  // 1. Gold Jewellery State
  const [goldWeightGrams, setGoldWeightGrams] = useState<number>(10);
  const [goldPurityKarat, setGoldPurityKarat] = useState<number>(22);
  const [goldRatePerGram24K, setGoldRatePerGram24K] = useState<number>(8650); // ₹8,650/g
  const [makingChargePercent, setMakingChargePercent] = useState<number>(12); // 12% making charges
  const [hallmarkCharges, setHallmarkCharges] = useState<number>(45); // BIS Hallmark fee ₹45

  // 2. Milk Fat & SNF State
  const [milkType, setMilkType] = useState<'buffalo' | 'cow'>('buffalo');
  const [fatPercent, setFatPercent] = useState<number>(6.5);
  const [snfPercent, setSnfPercent] = useState<number>(9.0);
  const [milkQuantityLiters, setMilkQuantityLiters] = useState<number>(25);
  const [baseFatRatePerKg, setBaseFatRatePerKg] = useState<number>(800); // Standard Indian dairy fat rate

  // 3. Land Unit State
  const [selectedLandRegionIdx, setSelectedLandRegionIdx] = useState<number>(0);
  const [inputLandValue, setInputLandValue] = useState<number>(2); // 2 Bigha
  const [inputLandUnit, setInputLandUnit] = useState<'bigha' | 'acre' | 'gaj' | 'guntha'>('bigha');

  // 4. Gratuity State
  const [gratuityBasicDa, setGratuityBasicDa] = useState<number>(45000);
  const [gratuityYears, setGratuityYears] = useState<number>(8);

  // 5. Baby Vaccine State
  const [babyDob, setBabyDob] = useState<string>('2026-01-15');

  // 6. Resale Car Valuation State
  const [originalCarExShowroom, setOriginalCarExShowroom] = useState<number>(900000); // 9 Lakhs
  const [carAgeYears, setCarAgeYears] = useState<number>(3);
  const [odometerKm, setOdometerKm] = useState<number>(35000);

  // 7. Freelancer 44ADA State
  const [freelancerGrossReceipts, setFreelancerGrossReceipts] = useState<number>(1800000); // 18 Lakhs
  const [otherDeductions80C, setOtherDeductions80C] = useState<number>(150000);

  // 8. Medicine Comparison State
  const [selectedMedIdx, setSelectedMedIdx] = useState<number>(0);
  const [monthlyStrips, setMonthlyStrips] = useState<number>(2);

  // Calculations
  // 1. Gold Jewellery Calculation (Shared Engine: src/utils/goldPricing.ts)
  const calculateGold = () => {
    const basePurityRatePerGram = getEffectiveGoldRatePerGram(goldRatePerGram24K, goldPurityKarat);
    const result = calculateJewelleryPrice({
      weightGrams: goldWeightGrams,
      base24kRatePerGram: goldRatePerGram24K,
      karat: goldPurityKarat,
      makingChargeValue: makingChargePercent,
      makingChargeType: 'percentage',
      hallmarkingFee: hallmarkCharges,
      gstRatePercent: 3,
    });

    return {
      basePurityRatePerGram: Math.round(basePurityRatePerGram),
      netGoldPrice: Math.round(result.rawGoldValue),
      makingChargesAmt: Math.round(result.makingCharges),
      gst3Percent: Math.round(result.gstAmount),
      finalJewelleryPrice: Math.round(result.finalJewelleryPrice),
    };
  };

  // 2. Dairy Milk Payout Calculation
  const calculateMilk = () => {
    // Standard Indian Dairy Fat/SNF Formula: Rate = (Fat * FatRate/100) + (SNF * SNFRate/100)
    // Common heuristic: Fat ~ ₹8.0 per 1.0 Fat point, SNF ~ ₹3.5 per 1.0 SNF point
    const ratePerLiter = Number(((fatPercent * 5.8) + (snfPercent * 2.8)).toFixed(2));
    const totalPayout = Math.round(ratePerLiter * milkQuantityLiters);

    return { ratePerLiter, totalPayout };
  };

  // 3. Land Unit Conversion (Shared Engine: src/data/landUnits.ts)
  const calculateLand = () => {
    const region = REGIONAL_LAND_UNITS[selectedLandRegionIdx];
    return convertRegionalLand(inputLandValue, inputLandUnit, region);
  };

  // 4. Gratuity Calculation
  const calculateGratuity = () => {
    // Formula: (15 * Last Basic+DA * Years) / 26
    const calculatedGratuity = Math.round((15 * gratuityBasicDa * gratuityYears) / 26);
    const taxFreeLimit = 2500000; // ₹25 Lakhs as per latest Amendment
    const isEligible = gratuityYears >= 5;

    return { calculatedGratuity, taxFreeLimit, isEligible };
  };

  // 6. Car Valuation Calculation
  const calculateCarValuation = () => {
    let depRate = 0.15; // Year 1
    if (carAgeYears === 2) depRate = 0.25;
    else if (carAgeYears === 3) depRate = 0.38;
    else if (carAgeYears === 4) depRate = 0.48;
    else if (carAgeYears >= 5) depRate = Math.min(0.75, 0.55 + (carAgeYears - 5) * 0.05);

    // Mileage adjustment
    const expectedKm = carAgeYears * 12000;
    const kmDiff = odometerKm - expectedKm;
    const mileageFactor = (kmDiff / 10000) * 0.02; // 2% per 10k extra km

    const effectiveDep = Math.min(0.85, depRate + mileageFactor);
    const estimatedValue = Math.round(originalCarExShowroom * (1 - effectiveDep));

    return { estimatedValue, depPercent: Math.round(effectiveDep * 100) };
  };

  // 7. 44ADA Tax Calculation (Shared Engine: src/utils/tax44ada.ts)
  const calculate44ADA = () => {
    return calculate44ADABasic(freelancerGrossReceipts);
  };

  // 8. Medicine Savings Calculation
  const calculateMedicine = () => {
    const med = POPULAR_MEDICINES[selectedMedIdx];
    const brandedCostYearly = med.brandPrice * monthlyStrips * 12;
    const genericCostYearly = med.genericPrice * monthlyStrips * 12;
    const annualSavings = brandedCostYearly - genericCostYearly;
    const savingsPercent = Math.round((annualSavings / brandedCostYearly) * 100);

    return { brandedCostYearly, genericCostYearly, annualSavings, savingsPercent };
  };

  const goldData = calculateGold();
  const milkData = calculateMilk();
  const landData = calculateLand();
  const gratuityData = calculateGratuity();
  const carData = calculateCarValuation();
  const tax44adaData = calculate44ADA();
  const medData = calculateMedicine();

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700">
        {[
          { id: 'gold-jewellery', label: '💍 Gold Making & Hallmark GST', icon: Coins },
          { id: 'milk-fat', label: '🥛 Dairy Milk Fat & SNF Rate', icon: Milk },
          { id: 'land-units', label: '📐 Multi-State Bigha Land Units', icon: MapPin },
          { id: 'gratuity-calc', label: '💰 Gratuity ₹25L Tax Exemption', icon: Landmark },
          { id: 'baby-vaccine', label: '👶 Baby Vaccine UIP Calendar', icon: Baby },
          { id: 'stamp-paper', label: '📜 Non-Judicial Stamp Paper Value', icon: FileText },
          { id: 'car-valuation', label: '🚗 Used Car/Bike Resale Valuation', icon: Car },
          { id: 'tax-44ada', label: '💻 Freelancer 44ADA 50% Tax', icon: Laptop },
          { id: 'consumer-notice', label: '📢 Jago Grahak 1915 Legal Notice', icon: Scale },
          { id: 'medicine-compare', label: '💊 Branded vs Generic Medicine', icon: Pill },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as IndianMassUtilityMode)}
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

      {/* Main Content Area */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">

        {/* 1. Gold Jewellery Making Charges & GST */}
        {activeTab === 'gold-jewellery' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
                <span>BIS Hallmark & Jewellery Bill Decomposition</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Jewellery Gold/Silver Making Charges, Hallmark & 3% GST Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate the real transparent price of gold jewellery (22K / 18K) with jeweller making charges (wastage), BIS hallmark fee (₹45), and 3% GST.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Gold Weight (Grams)
                    </label>
                    <input
                      type="number"
                      value={goldWeightGrams}
                      onChange={(e) => setGoldWeightGrams(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Gold Purity (Karat)
                    </label>
                    <select
                      value={goldPurityKarat}
                      onChange={(e) => setGoldPurityKarat(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    >
                      <option value="22">22 Karat (916 Hallmark - Standard Jewellery)</option>
                      <option value="24">24 Karat (999 Pure Bullion/Coin)</option>
                      <option value="18">18 Karat (750 Diamond Jewellery)</option>
                      <option value="14">14 Karat (585 Daily Wear)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      24K Pure Rate (₹ / Gram)
                    </label>
                    <input
                      type="number"
                      value={goldRatePerGram24K}
                      onChange={(e) => setGoldRatePerGram24K(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Making Charges (%)
                    </label>
                    <input
                      type="number"
                      value={makingChargePercent}
                      onChange={(e) => setMakingChargePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Gold Output */}
              <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                    Final Net Jewellery Billing Amount
                  </div>
                  <div className="text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{goldData.finalJewelleryPrice.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    22K Effective Rate: ₹{goldData.basePurityRatePerGram} / gram
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Net Gold Price</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{goldData.netGoldPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Making ({makingChargePercent}%)</span>
                    <div className="font-bold text-amber-600 font-mono">₹{goldData.makingChargesAmt.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">3% Govt GST</span>
                    <div className="font-bold text-neutral-900 dark:text-white font-mono">₹{goldData.gst3Percent.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Dairy Milk Fat & SNF Rate */}
        {activeTab === 'milk-fat' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <span>Dairy Collection Centre (Dudh Dairy Payout Formula)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Dairy Milk Fat & SNF Rate Chart Calculator (Farmer Payout)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate milk purchase rate per litre and total farmer payout based on Fat % (3.5% to 10%) and Solid-Not-Fat (SNF %) for Buffalo and Cow milk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Milk Fat % (3.5 - 10.0%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fatPercent}
                      onChange={(e) => setFatPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      SNF % (8.0 - 9.5%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={snfPercent}
                      onChange={(e) => setSnfPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Total Milk Quantity (Litres)
                  </label>
                  <input
                    type="number"
                    value={milkQuantityLiters}
                    onChange={(e) => setMilkQuantityLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Milk Output */}
              <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                    Total Dairy Payout to Farmer
                  </div>
                  <div className="text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{milkData.totalPayout.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    For {milkQuantityLiters} Litres @ ₹{milkData.ratePerLiter} / Litre
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs flex justify-between items-center">
                  <span className="text-neutral-500">Calculated Rate Per Litre:</span>
                  <span className="font-bold text-blue-600 font-mono text-base">₹{milkData.ratePerLiter} / L</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Multi-State Bigha Land Units */}
        {activeTab === 'land-units' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>Revenue Department & Patwari Land Measure Standards</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                All-India Multi-State Land Unit Converter (Bigha, Gaj, Guntha, Cent)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Convert local regional land measurements (UP Pucca Bigha, MP Bigha, Maharashtra Guntha, South Cent/Ground, Punjab Kanal/Marla) into standard Acres and Sq Ft.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Select State / Regional Measurement Standard:
                  </label>
                  <select
                    value={selectedLandRegionIdx}
                    onChange={(e) => setSelectedLandRegionIdx(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  >
                    {REGIONAL_LAND_UNITS.map((r, idx) => (
                      <option key={idx} value={idx}>{r.region}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Enter Quantity
                    </label>
                    <input
                      type="number"
                      value={inputLandValue}
                      onChange={(e) => setInputLandValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Unit
                    </label>
                    <select
                      value={inputLandUnit}
                      onChange={(e) => setInputLandUnit(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    >
                      <option value="bigha">Bigha</option>
                      <option value="acre">Acre</option>
                      <option value="gaj">Gaj (Sq Yard)</option>
                      <option value="guntha">Guntha</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Land Output */}
              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
                <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <span className="text-neutral-500">Total Square Feet:</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono text-sm">{landData.totalSqFt.toLocaleString('en-IN')} sq ft</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <span className="text-neutral-500">Standard Acres:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">{landData.inAcres} Acres</span>
                </div>
                <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <span className="text-neutral-500">Gaj (Square Yards):</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">{landData.inGaj.toLocaleString('en-IN')} Gaj</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-neutral-500">Square Metres:</span>
                  <span className="font-bold text-neutral-900 dark:text-white font-mono">{landData.inSqMeters.toLocaleString('en-IN')} sq m</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Gratuity ₹25L Tax Exemption */}
        {activeTab === 'gratuity-calc' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>Payment of Gratuity Act 1972 (15/26 Formula)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Gratuity & Leave Encashment Calculator (₹25 Lakhs Tax Free)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate statutory gratuity payout on job change or retirement based on `(15 × Last Basic+DA × Completed Years) / 26` with Section 10(10) ₹25 Lakhs tax exemption.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Last Drawn Basic + DA (₹)
                    </label>
                    <input
                      type="number"
                      value={gratuityBasicDa}
                      onChange={(e) => setGratuityBasicDa(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Completed Years of Service
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={gratuityYears}
                      onChange={(e) => setGratuityYears(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Gratuity Output */}
              <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    Total Payable Gratuity Amount
                  </div>
                  <div className="text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{gratuityData.calculatedGratuity.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 mt-1 font-bold">
                    ✓ 100% Tax-Free under Section 10(10) (Limit: ₹25 Lakhs)
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
                  <span className="text-neutral-500">Eligibility Status:</span>
                  <div className="font-bold text-neutral-900 dark:text-white mt-0.5">
                    {gratuityData.isEligible ? '✅ Eligible (>= 5 Years continuous service completed)' : '⚠️ Minimum 5 years service required for gratuity claim'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Baby Vaccine UIP Calendar */}
        {activeTab === 'baby-vaccine' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300 text-xs font-semibold mb-2">
                <span>Ministry of Health (U-WIN & UIP Universal Immunization)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Indian Baby Vaccination & Immunization Schedule (0 to 16 Years)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Official Universal Immunization Programme (UIP) India calendar with exact milestone dates for BCG, Pentavalent, Polio, MR, and Boosters.
              </p>
            </div>

            <div className="space-y-3">
              {VACCINE_SCHEDULE.map((v, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <span className="text-xs font-bold text-pink-600 dark:text-pink-400 font-display">
                      {v.ageLabel}
                    </span>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                      {v.vaccines}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{v.notes}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    Govt Hospital Free
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Non-Judicial Stamp Paper Value */}
        {activeTab === 'stamp-paper' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
                <span>Indian Stamp Act & SHCIL e-Stamping Directory</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Indian Non-Judicial Stamp Paper & e-Stamping Value Guide
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Check mandatory stamp paper denominations for Rent Agreements, Affidavits, GPA, Indemnity Bonds, and Partnership Deeds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {STAMP_PAPER_RULES.map((s, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                      {s.purpose}
                    </h4>
                  </div>
                  <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                    Stamp Value: {s.stampValue}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Validity: {s.validity} {s.eStampAvailable && '• e-Stamp Available Online'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Used Car Resale Valuation */}
        {activeTab === 'car-valuation' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>Indian Automobile Market Depreciation Matrix</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Old Car & Bike Resale Valuation & Depreciation Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate realistic fair market price for used cars and two-wheelers in India based on vehicle age, odometer reading, and insurance IDV schedules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Original Ex-Showroom Price (₹)
                  </label>
                  <input
                    type="number"
                    value={originalCarExShowroom}
                    onChange={(e) => setOriginalCarExShowroom(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Vehicle Age (Years)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={carAgeYears}
                      onChange={(e) => setCarAgeYears(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Odometer (KM Driven)
                    </label>
                    <input
                      type="number"
                      value={odometerKm}
                      onChange={(e) => setOdometerKm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Car Output */}
              <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-neutral-500 uppercase">Estimated Fair Market Resale Value</div>
                  <div className="text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ₹{carData.estimatedValue.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Total Cumulative Depreciation: {carData.depPercent}%
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
                  <span className="text-neutral-500">Buying / Selling Recommendation:</span>
                  <div className="font-bold text-neutral-900 dark:text-white mt-0.5">
                    Target range: ₹{(carData.estimatedValue * 0.95).toFixed(0)} to ₹{(carData.estimatedValue * 1.05).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. Freelancer 44ADA 50% Tax */}
        {activeTab === 'tax-44ada' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
                <span>Income Tax Act Section 44ADA (50% Deemed Profit Scheme)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Freelancer & Professional 44ADA 50% Presumptive Tax Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Calculate taxable income for software devs, designers, doctors, and consultants under Section 44ADA with zero book-keeping audit and view the Advance Tax calendar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Annual Gross Professional Receipts (₹)
                  </label>
                  <input
                    type="number"
                    value={freelancerGrossReceipts}
                    onChange={(e) => setFreelancerGrossReceipts(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                  <span className="text-[10px] text-neutral-400">Eligible up to ₹75 Lakhs under 44ADA</span>
                </div>
              </div>

              {/* 44ADA Output */}
              <div className="p-6 rounded-3xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-purple-600 uppercase">50% Deemed Taxable Income</div>
                  <div className="text-3xl font-black font-mono text-neutral-900 dark:text-white">
                    ₹{tax44adaData.deemedProfit.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Estimated Income Tax: ₹{tax44adaData.estimatedTax.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
                  <div className="font-bold text-neutral-900 dark:text-white">Advance Tax Schedule (Quarterly):</div>
                  {tax44adaData.advanceTaxSchedule.map((s, idx) => (
                    <div key={idx} className="flex justify-between text-neutral-600 dark:text-neutral-400">
                      <span>{s.date} ({s.percent}):</span>
                      <span className="font-bold font-mono">₹{s.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. Jago Grahak 1915 Legal Notice */}
        {activeTab === 'consumer-notice' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
                <span>Consumer Protection Act 2019 & NCH 1915</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                National Consumer Court (NCH 1915) Legal Notice Generator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Draft legal notice and e-Daakhil consumer complaint for e-commerce fraud, builder flat delay, defective products, and wrongful airline/insurance claim rejection.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
              <div className="font-bold text-neutral-900 dark:text-white text-sm">
                Steps to File Consumer Dispute in India:
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-600 dark:text-neutral-400">
                <li><strong>Call National Consumer Helpline (NCH):</strong> Dial toll-free <strong>1915</strong> or register online at <code>consumerhelpline.gov.in</code>.</li>
                <li><strong>Send Written Legal Notice:</strong> Send 15-day notice via Registered Post / Email giving the company a final chance to resolve the dispute.</li>
                <li><strong>File Online on e-Daakhil Portal:</strong> If unresolved within 15 days, file case at District Consumer Commission via <code>edaakhil.nic.in</code> (Claims up to ₹50 Lakhs).</li>
              </ol>
            </div>
          </div>
        )}

        {/* 10. Branded vs Generic Medicine */}
        {activeTab === 'medicine-compare' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>PM Jan Aushadhi Generic Medicine Comparison</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Branded vs PM Jan Aushadhi Generic Salt Price Comparator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Compare prices between popular branded medicines (Augmentin, Pan-D, Telma-40, Glycomet) and their exact chemical salt generic equivalents to save up to 80-90% on medical bills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Select Popular Branded Medicine:
                  </label>
                  <select
                    value={selectedMedIdx}
                    onChange={(e) => setSelectedMedIdx(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  >
                    {POPULAR_MEDICINES.map((m, idx) => (
                      <option key={idx} value={idx}>{m.brand} ({m.use})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Monthly Consumption (Strips / Packs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={monthlyStrips}
                    onChange={(e) => setMonthlyStrips(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Medicine Output */}
              <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase">Your Annual Medicine Savings</div>
                  <div className="text-4xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                    Save ₹{medData.annualSavings.toLocaleString('en-IN')} / yr
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {medData.savingsPercent}% Cheaper with same WHO-GMP certified chemical salt
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Branded Annual Cost</span>
                    <div className="font-bold text-rose-600 font-mono">₹{medData.brandedCostYearly}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Jan Aushadhi Cost</span>
                    <div className="font-bold text-emerald-600 font-mono">₹{medData.genericCostYearly}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
