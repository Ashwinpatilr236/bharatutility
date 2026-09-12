import React, { useState, useMemo } from 'react';
import { Home, Building2, Calculator, ShieldCheck, CheckCircle2, User, AlertTriangle } from 'lucide-react';
import { formatINR } from '../../../utils/formatters';

interface PropertyStateRule {
  id: string;
  name: string;
  maleDutyPercent: number;
  femaleDutyPercent: number;
  jointDutyPercent: number;
  registrationPercent: number;
  cessPercent: number;
  description: string;
}

const PROPERTY_STATE_RULES: Record<string, PropertyStateRule> = {
  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra (Mumbai / Pune)',
    maleDutyPercent: 6.0,
    femaleDutyPercent: 5.0, // 1% women concession
    jointDutyPercent: 5.5,
    registrationPercent: 1.0, // Capped at ₹30,000 for properties > ₹30L
    cessPercent: 1.0, // Metro cess in Mumbai/Pune
    description: '6% standard stamp duty (5% for female buyers) + 1% Metro Cess + 1% Registration (max ₹30k).',
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    maleDutyPercent: 6.0,
    femaleDutyPercent: 4.0, // 2% women concession
    jointDutyPercent: 5.0,
    registrationPercent: 1.0,
    cessPercent: 0.0,
    description: '6% for male buyers, 4% for female buyers, 5% for joint ownership + 1% registration fee.',
  },
  uttar_pradesh: {
    id: 'uttar_pradesh',
    name: 'Uttar Pradesh (Noida / Lucknow)',
    maleDutyPercent: 7.0,
    femaleDutyPercent: 6.0,
    jointDutyPercent: 6.5,
    registrationPercent: 1.0,
    cessPercent: 0.0,
    description: '7% stamp duty with ₹10,000 rebate for female owners + 1% registration fee.',
  },
  karnataka: {
    id: 'karnataka',
    name: 'Karnataka (Bengaluru)',
    maleDutyPercent: 5.0,
    femaleDutyPercent: 5.0,
    jointDutyPercent: 5.0,
    registrationPercent: 1.0,
    cessPercent: 0.6, // 10% cess + 2% surcharge on stamp duty
    description: '5% stamp duty + 10% cess + 2% surcharge on duty + 1% sub-registrar registration.',
  },
  telangana: {
    id: 'telangana',
    name: 'Telangana (Hyderabad)',
    maleDutyPercent: 6.0,
    femaleDutyPercent: 6.0,
    jointDutyPercent: 6.0,
    registrationPercent: 0.5,
    cessPercent: 1.5, // 1.5% transfer duty
    description: '6% Stamp Duty + 1.5% Transfer Duty + 0.5% Registration fee (Total 7.5% payable).',
  },
  gujarat: {
    id: 'gujarat',
    name: 'Gujarat (Ahmedabad / Surat)',
    maleDutyPercent: 4.9,
    femaleDutyPercent: 0.0, // 100% stamp duty exemption for women
    jointDutyPercent: 2.45,
    registrationPercent: 1.0,
    cessPercent: 0.0,
    description: '4.9% basic duty for males; 100% full basic duty waiver for individual female owners!',
  },
  tamil_nadu: {
    id: 'tamil_nadu',
    name: 'Tamil Nadu (Chennai)',
    maleDutyPercent: 7.0,
    femaleDutyPercent: 7.0,
    jointDutyPercent: 7.0,
    registrationPercent: 4.0, // 4% registration in TN
    cessPercent: 0.0,
    description: '7% stamp duty + 4% registration fee (Combined total 11% consideration).',
  },
};

export const PropertyStampDutyCalculator: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('maharashtra');
  const [buyerType, setBuyerType] = useState<'male' | 'female' | 'joint'>('female');
  const [marketValue, setMarketValue] = useState<number>(7500000); // 75 Lakhs
  const [circleRateValue, setCircleRateValue] = useState<number>(6500000); // 65 Lakhs

  const stateRule = PROPERTY_STATE_RULES[selectedState] || PROPERTY_STATE_RULES.maharashtra;

  const propertyMath = useMemo(() => {
    // Stamp duty is calculated on higher of Market Agreement Value vs Circle Rate (Guideline Value)
    const taxableValue = Math.max(marketValue, circleRateValue);

    let dutyRate = stateRule.maleDutyPercent;
    if (buyerType === 'female') dutyRate = stateRule.femaleDutyPercent;
    if (buyerType === 'joint') dutyRate = stateRule.jointDutyPercent;

    const baseStampDuty = (taxableValue * dutyRate) / 100;
    const cessAmount = (taxableValue * stateRule.cessPercent) / 100;

    // Registration fee (Capped at 30k in Maharashtra for > 30L)
    let registrationFee = (taxableValue * stateRule.registrationPercent) / 100;
    if (stateRule.id === 'maharashtra' && taxableValue > 3000000) {
      registrationFee = 30000;
    }

    const totalGovtExpense = baseStampDuty + cessAmount + registrationFee;

    return {
      taxableValue,
      dutyRate,
      baseStampDuty,
      cessAmount,
      registrationFee,
      totalGovtExpense,
      effectivePercent: taxableValue > 0 ? (totalGovtExpense / taxableValue) * 100 : 0,
      isCircleRateHigher: circleRateValue > marketValue,
    };
  }, [stateRule, buyerType, marketValue, circleRateValue]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-amber-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Property Stamp Duty & Circle Rate Registration Estimator
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              State-wise Flat & Land Registry Costs, Women Buyer Concessions, Metro Cess & Section 50C Compliance
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            Property & Ownership Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select State / Region
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
            >
              {Object.entries(PROPERTY_STATE_RULES).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stateRule.description}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Buyer / Owner Gender (Women Concession)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'female', label: 'Female Owner 👩', desc: 'Govt Concession' },
                { id: 'male', label: 'Male Owner 👨', desc: 'Standard Rate' },
                { id: 'joint', label: 'Joint (Male + Female)', desc: 'Blended Slabs' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBuyerType(b.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    buyerType === b.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs">{b.label}</div>
                  <div className="text-[10px] text-slate-400">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Property Agreement Value / Purchase Price (₹)
              </label>
              <span className="text-xs font-bold text-amber-600">{formatINR(marketValue)}</span>
            </div>
            <input
              type="number"
              min="500000"
              step="50000"
              value={marketValue}
              onChange={(e) => setMarketValue(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Govt Circle Rate / Guideline Valuation (₹)
              </label>
              <span className="text-xs font-bold text-slate-500">{formatINR(circleRateValue)}</span>
            </div>
            <input
              type="number"
              min="500000"
              step="50000"
              value={circleRateValue}
              onChange={(e) => setCircleRateValue(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Right Output: Registry Summary */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Total Property Registry Expense
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <div className="text-xs text-slate-400">Total Govt Stamp & Registration</div>
            <div className="text-3xl font-black text-amber-400 mt-1">
              {formatINR(Math.round(propertyMath.totalGovtExpense))}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Effective Cost: <strong className="text-white">{propertyMath.effectivePercent.toFixed(2)}%</strong> of valuation
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Stamp Duty ({propertyMath.dutyRate}%):</span>
              <span className="font-semibold text-white">{formatINR(Math.round(propertyMath.baseStampDuty))}</span>
            </div>
            {propertyMath.cessAmount > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Metro / Local Cess ({stateRule.cessPercent}%):</span>
                <span className="font-semibold text-white">{formatINR(Math.round(propertyMath.cessAmount))}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Sub-Registrar Registration Fee:</span>
              <span className="font-semibold text-white">{formatINR(Math.round(propertyMath.registrationFee))}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Tax Saving Tip:
            </div>
            <p>
              Buying in a female spouse/mother's name saves between ₹50,000 to ₹1,50,000 in stamp duty across Delhi, Maharashtra, UP, and Gujarat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
