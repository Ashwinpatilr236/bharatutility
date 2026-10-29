import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Banknote, Check, Copy, AlertTriangle, Building, Clock, FileCheck, CalendarCheck, ShieldCheck, HelpCircle } from 'lucide-react';

interface Props {
  tool: Tool;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const GratuityLeaveEncashmentCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState<'gratuity' | 'leave'>('gratuity');

  // Gratuity State
  const [gratuityBasicDa, setGratuityBasicDa] = useState<number>(50000);
  const [gratuityYears, setGratuityYears] = useState<number>(7);
  const [isCoveredByAct, setIsCoveredByAct] = useState<boolean>(true);

  // Leave Encashment State
  const [employeeType, setEmployeeType] = useState<'private' | 'govt'>('private');
  const [leaveBasicDa, setLeaveBasicDa] = useState<number>(50000);
  const [leaveBalanceDays, setLeaveBalanceDays] = useState<number>(45);

  const [copied, setCopied] = useState<boolean>(false);

  // Gratuity Calculation
  const gratuityResult = useMemo(() => {
    const basicDa = gratuityBasicDa || 0;
    const years = gratuityYears || 0;

    if (basicDa <= 0 || years <= 0) {
      return { calculatedGratuity: 0, taxFreeLimit: 2500000, isEligible: false, taxableAmount: 0 };
    }

    // Formula:
    // Covered: (15 * Last Basic+DA * Years) / 26
    // Non-Covered: (15 * 10-month Avg Basic+DA * Years) / 30
    const gratuity = isCoveredByAct
      ? Math.round((15 * basicDa * years) / 26)
      : Math.round((15 * basicDa * years) / 30);

    const limit = 2500000; // ₹25 Lakhs statutory limit (Section 10(10))
    const eligible = years >= 5;
    const taxable = eligible ? Math.max(0, gratuity - limit) : gratuity;

    return {
      calculatedGratuity: gratuity,
      taxFreeLimit: limit,
      isEligible: eligible,
      taxableAmount: taxable,
    };
  }, [gratuityBasicDa, gratuityYears, isCoveredByAct]);

  // Leave Encashment Calculation
  const leaveResult = useMemo(() => {
    const basicDa = leaveBasicDa || 0;
    const leaves = leaveBalanceDays || 0;

    if (basicDa <= 0 || leaves <= 0) {
      return { encashmentAmount: 0, exemptAmount: 0, taxableAmount: 0 };
    }

    // Per day salary = Basic+DA / 30
    const encashmentAmount = Math.round((basicDa / 30) * leaves);

    // Govt employees: 100% exempt. Private employees: exempt up to ₹25,00,000 (Section 10(10AA))
    let exemptAmount = 0;
    if (employeeType === 'govt') {
      exemptAmount = encashmentAmount;
    } else {
      const maxExemption = 2500000; // Increased to ₹25 Lakhs
      exemptAmount = Math.min(encashmentAmount, maxExemption);
    }

    const taxableAmount = Math.max(0, encashmentAmount - exemptAmount);

    return {
      encashmentAmount,
      exemptAmount,
      taxableAmount,
    };
  }, [leaveBasicDa, leaveBalanceDays, employeeType]);

  // Inform parent of result change for sharing & URL sync
  React.useEffect(() => {
    if (onResultChange) {
      if (activeTab === 'gratuity') {
        const summary = `Gratuity Payout: ${formatINR(gratuityResult.calculatedGratuity)} (${gratuityYears} yrs service | Basic: ${formatINR(gratuityBasicDa)})`;
        onResultChange(summary, { tab: 'gratuity', basic: gratuityBasicDa, years: gratuityYears, covered: isCoveredByAct });
      } else {
        const summary = `Leave Encashment: ${formatINR(leaveResult.encashmentAmount)} for ${leaveBalanceDays} earned leaves (Tax-Free: ${formatINR(leaveResult.exemptAmount)})`;
        onResultChange(summary, { tab: 'leave', basic: leaveBasicDa, leaves: leaveBalanceDays, type: employeeType });
      }
    }
  }, [activeTab, gratuityResult, leaveResult, gratuityYears, gratuityBasicDa, isCoveredByAct, leaveBasicDa, leaveBalanceDays, employeeType]);

  const handleCopy = () => {
    let text = '';
    if (activeTab === 'gratuity') {
      text = `Gratuity Calculation (Payment of Gratuity Act 1972):
Last Basic + DA: ${formatINR(gratuityBasicDa)}
Completed Years of Service: ${gratuityYears}
Establishment: ${isCoveredByAct ? 'Covered by Act (15/26 Formula)' : 'Not Covered (15/30 Formula)'}

Total Payable Gratuity: ${formatINR(gratuityResult.calculatedGratuity)}
Status: ${gratuityResult.isEligible ? 'Eligible (5+ years met)' : 'Not Eligible (< 5 years)'}
Tax Exemption Limit: ${formatINR(gratuityResult.taxFreeLimit)}
Taxable Gratuity: ${formatINR(gratuityResult.taxableAmount)}

Calculated on BharatUtility: ${window.location.href}`;
    } else {
      text = `Leave Encashment Calculation (Section 10(10AA)):
Monthly Basic + DA: ${formatINR(leaveBasicDa)}
Accumulated Earned Leaves: ${leaveBalanceDays} days
Employment Type: ${employeeType === 'govt' ? 'Central/State Government Employee' : 'Private Sector / Non-Govt'}

Total Leave Encashment Payout: ${formatINR(leaveResult.encashmentAmount)}
Tax-Exempt Amount: ${formatINR(leaveResult.exemptAmount)}
Taxable Encashment: ${formatINR(leaveResult.taxableAmount)}

Calculated on BharatUtility: ${window.location.href}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      {/* Header & Tabs */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
              <Banknote className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Gratuity & Leave Encashment Calculator
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Accurate statutory calculation under Payment of Gratuity Act 1972 & Section 10(10AA) with ₹25 Lakhs tax exemption.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('gratuity')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'gratuity'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Gratuity Calculator
            </button>
            <button
              onClick={() => setActiveTab('leave')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'leave'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Leave Encashment
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'gratuity' ? (
        /* GRATUITY TAB */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> Last Drawn Basic + DA (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={gratuityBasicDa}
                    onChange={(e) => setGratuityBasicDa(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Completed Years of Service
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    inputMode="numeric"
                    value={gratuityYears}
                    onChange={(e) => setGratuityYears(Number(e.target.value))}
                    className="w-full pl-3 pr-16 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs uppercase">Years</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2 uppercase tracking-wider">
                  Establishment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCoveredByAct(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      isCoveredByAct
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Covered by Act (10+ Staff)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCoveredByAct(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      !isCoveredByAct
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Not Covered (15/30 Formula)
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p>5 years continuous service is mandatory for gratuity payout. Service &gt; 6 months rounds up to the next year (e.g. 4 yrs 7 months = 5 yrs).</p>
              </div>
            </div>
          </div>

          {/* Gratuity Output */}
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-neutral-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

              <div className="relative z-10 text-center mb-6">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Estimated Gratuity Payable</p>
                <div className={`text-4xl sm:text-5xl font-black tabular-nums tracking-tight ${gratuityResult.isEligible ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  {formatINR(gratuityResult.calculatedGratuity)}
                </div>
                {!gratuityResult.isEligible ? (
                  <div className="mt-3 inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold uppercase">
                    Not Eligible (&lt; 5 Years Service)
                  </div>
                ) : (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold uppercase">
                    <FileCheck className="w-3.5 h-3.5" /> Eligible for Payout
                  </div>
                )}
              </div>

              <div className="relative z-10 pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Calculation Formula:</span>
                  <span className="font-mono text-neutral-300">
                    {isCoveredByAct ? '(15 × Basic × Years) / 26' : '(15 × Basic × Years) / 30'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Statutory Tax Exemption:</span>
                  <span className="font-mono font-bold text-white">Up to ₹25,00,000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Taxable Portion:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatINR(gratuityResult.taxableAmount)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Gratuity Breakdown'}
            </button>
          </div>
        </div>
      ) : (
        /* LEAVE ENCASHMENT TAB */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2 uppercase tracking-wider">
                  Employment Sector
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEmployeeType('private')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      employeeType === 'private'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Private Sector
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmployeeType('govt')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      employeeType === 'govt'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    Govt Employee (100% Tax Free)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Building className="w-3.5 h-3.5" /> Monthly Basic + DA (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={leaveBasicDa}
                    onChange={(e) => setLeaveBasicDa(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <CalendarCheck className="w-3.5 h-3.5" /> Accumulated Earned Leaves (EL Days)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    inputMode="numeric"
                    value={leaveBalanceDays}
                    onChange={(e) => setLeaveBalanceDays(Number(e.target.value))}
                    className="w-full pl-3 pr-16 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs uppercase">Days</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p>As per the Finance Act, the leave encashment tax exemption for non-government salaried employees has been raised to ₹25,00,000 under Section 10(10AA).</p>
              </div>
            </div>
          </div>

          {/* Leave Encashment Output */}
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-neutral-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

              <div className="relative z-10 text-center mb-6">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Leave Encashment Payout</p>
                <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-blue-400">
                  {formatINR(leaveResult.encashmentAmount)}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-xs font-bold uppercase">
                  {leaveBalanceDays} Days Balance
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">1 Day Leave Value:</span>
                  <span className="font-mono text-neutral-300">{formatINR(Math.round(leaveBasicDa / 30))}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Tax-Free Exemption (Sec 10(10AA)):</span>
                  <span className="font-mono font-bold text-emerald-400">{formatINR(leaveResult.exemptAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Taxable Portion:</span>
                  <span className="font-mono font-bold text-rose-400">{formatINR(leaveResult.taxableAmount)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Leave Encashment Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
