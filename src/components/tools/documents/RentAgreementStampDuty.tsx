import React, { useState, useMemo } from 'react';
import { FileText, Calculator, Building, ShieldCheck, CheckCircle2, Info, ArrowRight, Download } from 'lucide-react';
import { formatINR } from '../../../utils/formatters';

interface StateRule {
  id: string;
  name: string;
  stampDutyFormula: (rent: number, deposit: number, months: number) => number;
  registrationFee: number;
  description: string;
}

const STATE_RENT_RULES: Record<string, StateRule> = {
  maharashtra: {
    id: 'maharashtra',
    name: 'Maharashtra (Mumbai / Pune / Thane)',
    stampDutyFormula: (rent, deposit, months) => {
      // 0.25% of Total Rent + 10% of refundable deposit per year
      const years = months / 12;
      const totalRent = rent * months;
      const depositConsideration = (deposit * 0.1) * years;
      const totalTaxable = totalRent + depositConsideration;
      return Math.max(100, Math.round(totalTaxable * 0.0025));
    },
    registrationFee: 1000, // Urban ₹1000, Rural ₹500
    description: 'Calculated as 0.25% on (Total Rent + 10% Deposit per year) as per Maharashtra Stamp Act.',
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi NCR',
    stampDutyFormula: (rent, deposit, months) => {
      const annualRent = rent * Math.min(12, months);
      // Up to 5 yrs: 2% of avg annual rent
      return Math.max(100, Math.round(annualRent * 0.02));
    },
    registrationFee: 1100,
    description: '2% of Average Annual Rent for lease periods up to 5 years.',
  },
  karnataka: {
    id: 'karnataka',
    name: 'Karnataka (Bengaluru / Mysuru)',
    stampDutyFormula: (rent, deposit, months) => {
      const annualConsideration = (rent * Math.min(12, months)) + deposit;
      return Math.max(200, Math.round(annualConsideration * 0.005));
    },
    registrationFee: 500,
    description: '0.5% to 1% of total consideration (Annual Rent + Advance Deposit).',
  },
  uttar_pradesh: {
    id: 'uttar_pradesh',
    name: 'Uttar Pradesh (Noida / Lucknow)',
    stampDutyFormula: (rent, deposit, months) => {
      if (months <= 11) return 100; // Common ₹100 e-stamp for 11 months
      const annualRent = (rent * 12) + deposit;
      return Math.max(100, Math.round(annualRent * 0.02));
    },
    registrationFee: 1000,
    description: '₹100 e-Stamp for 11-month unregistered lease; 2% for registered agreements.',
  },
  telangana: {
    id: 'telangana',
    name: 'Telangana (Hyderabad)',
    stampDutyFormula: (rent, deposit, months) => {
      const totalRent = (rent * months) + deposit;
      return Math.max(100, Math.round(totalRent * 0.004));
    },
    registrationFee: 1000,
    description: '0.4% of total rent & deposit consideration for lease up to 5 years.',
  },
  tamil_nadu: {
    id: 'tamil_nadu',
    name: 'Tamil Nadu (Chennai)',
    stampDutyFormula: (rent, deposit, months) => {
      const totalRent = (rent * Math.min(12, months)) + deposit;
      return Math.max(100, Math.round(totalRent * 0.01));
    },
    registrationFee: 1000,
    description: '1% of total annual rent and advance deposit under TN Tenancy Act.',
  },
};

export const RentAgreementStampDuty: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string>('maharashtra');
  const [monthlyRent, setMonthlyRent] = useState<number>(25000);
  const [securityDeposit, setSecurityDeposit] = useState<number>(100000);
  const [leaseMonths, setLeaseMonths] = useState<number>(11);

  const stateRule = STATE_RENT_RULES[selectedState] || STATE_RENT_RULES.maharashtra;

  const costMath = useMemo(() => {
    const stampDuty = stateRule.stampDutyFormula(monthlyRent, securityDeposit, leaseMonths);
    const registration = stateRule.registrationFee;
    const notaryCharge = 500; // Typical advocate notary
    const totalCost = stampDuty + registration + notaryCharge;

    return {
      stampDuty,
      registration,
      notaryCharge,
      totalCost,
    };
  }, [stateRule, monthlyRent, securityDeposit, leaseMonths]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-cyan-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 text-cyan-300 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Rent Agreement Stamp Duty & E-Registration Cost Calculator
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              State-wise 11-Month Lease Stamp Paper, Biometric E-Registration Fees & Legal Clause Checklist
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
            Tenancy & Lease Parameters
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
              {Object.entries(STATE_RENT_RULES).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stateRule.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Refundable Security Deposit (₹)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Agreement Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { months: 11, label: '11 Months', desc: 'Standard Rental' },
                { months: 24, label: '24 Months', desc: '2-Year Term' },
                { months: 36, label: '36 Months', desc: '3-Year Term' },
              ].map((d) => (
                <button
                  key={d.months}
                  type="button"
                  onClick={() => setLeaseMonths(d.months)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    leaseMonths === d.months
                      ? 'bg-cyan-600 text-white font-bold border-cyan-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs">{d.label}</div>
                  <div className={`text-[10px] ${leaseMonths === d.months ? 'text-cyan-200' : 'text-slate-400'}`}>
                    {d.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output: Total Cost */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Registration Cost Summary
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <div className="text-xs text-slate-400">Estimated Total Legal Expense</div>
            <div className="text-3xl font-black text-cyan-400 mt-1">
              {formatINR(costMath.totalCost)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              For {leaseMonths} Months lease @ {formatINR(monthlyRent)}/mo
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Govt Stamp Duty:</span>
              <span className="font-semibold text-white">{formatINR(costMath.stampDuty)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Sub-Registrar Registration Fee:</span>
              <span className="font-semibold text-white">{formatINR(costMath.registration)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Notary / Biometric Service Charge:</span>
              <span className="font-semibold text-white">{formatINR(costMath.notaryCharge)}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/70 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Must-Have Agreement Clauses:
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
              <li>1-Month Notice Period & Lock-in Clause</li>
              <li>5% - 10% Annual Rent Escalation Clause</li>
              <li>Security Deposit Refund Timeline (Within 7 Days)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
