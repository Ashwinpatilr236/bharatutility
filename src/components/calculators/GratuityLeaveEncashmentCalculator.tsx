import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Banknote, Check, Copy, AlertTriangle, Building, Clock, FileCheck } from 'lucide-react';

interface Props {
  tool: Tool;
  onResultChange?: (result: string) => void;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const GratuityLeaveEncashmentCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [gratuityBasicDa, setGratuityBasicDa] = useState<number>(45000);
  const [gratuityYears, setGratuityYears] = useState<number>(8);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    calculatedGratuity,
    taxFreeLimit,
    isEligible,
    taxableAmount
  } = useMemo(() => {
    const basicDa = gratuityBasicDa || 0;
    const years = gratuityYears || 0;

    if (basicDa <= 0 || years <= 0) {
      return { calculatedGratuity: 0, taxFreeLimit: 2500000, isEligible: false, taxableAmount: 0 };
    }

    // Formula: (15 * Last Basic+DA * Years) / 26
    const gratuity = Math.round((15 * basicDa * years) / 26);
    const limit = 2500000; // ₹25 Lakhs as per latest Amendment
    const eligible = years >= 5;
    const taxable = Math.max(0, gratuity - limit);

    if (onResultChange) {
      onResultChange(`Gratuity: ${formatINR(gratuity)}`);
    }

    return {
      calculatedGratuity: gratuity,
      taxFreeLimit: limit,
      isEligible: eligible,
      taxableAmount: taxable
    };
  }, [gratuityBasicDa, gratuityYears]);

  const handleCopy = () => {
    const text = `Gratuity Calculation (Payment of Gratuity Act 1972):
Last Basic + DA: ${formatINR(gratuityBasicDa)}
Completed Years of Service: ${gratuityYears}

Total Payable Gratuity: ${formatINR(calculatedGratuity)}
Status: ${isEligible ? 'Eligible' : 'Not Eligible (Needs 5+ years)'}
Tax Exemption Limit: ${formatINR(taxFreeLimit)}
Taxable Gratuity: ${formatINR(taxableAmount)}

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Banknote className="w-6 h-6 text-emerald-600" />
          Gratuity & Leave Encashment Calculator
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Calculate statutory gratuity payout on job change or retirement based on 15/26 Formula with Section 10(10) ₹25 Lakhs tax exemption rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
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
                  className="w-full pl-3 pr-12 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs uppercase">Years</span>
              </div>
            </div>
            
            <div className="pt-2">
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <p>Note: Service of more than 6 months is rounded off to the next year (e.g., 4 years 7 months = 5 years) for eligibility and calculation.</p>
                </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 text-center mb-6">
                <p className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Total Payable Gratuity Amount</p>
                <div className={`text-4xl sm:text-5xl font-black tabular-nums tracking-tight ${isEligible ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    {formatINR(calculatedGratuity)}
                </div>
                {!isEligible && (
                    <div className="mt-3 inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-xs font-bold uppercase">
                        Not Eligible (Min 5 Yrs Required)
                    </div>
                )}
                {isEligible && (
                    <div className="mt-3 inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold uppercase flex items-center justify-center gap-1.5 w-max mx-auto">
                        <FileCheck className="w-3.5 h-3.5" /> Eligible for Payout
                    </div>
                )}
            </div>
            
            <div className="relative z-10 pt-4 border-t border-neutral-800 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Formula Used:</span>
                    <span className="font-mono text-neutral-300">(15/26) × Basic × Years</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Tax Exemption Limit:</span>
                    <span className="font-mono font-bold text-white">{formatINR(taxFreeLimit)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Taxable Portion:</span>
                    <span className="font-mono font-bold text-rose-400">{formatINR(taxableAmount)}</span>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Gratuity Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
