import React, { useState, useMemo, useEffect } from 'react';
import { Tool } from '../../types';
import { Laptop, IndianRupee, Check, Copy, Calendar, ArrowRightLeft } from 'lucide-react';
import { calculate44ADABasic } from '../../utils/tax44ada';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

export const Freelancer44ADATaxCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [freelancerGrossReceipts, setFreelancerGrossReceipts] = useState<number>(3000000);
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    return calculate44ADABasic(freelancerGrossReceipts);
  }, [freelancerGrossReceipts]);

  useEffect(() => {
    if (onResultChange && freelancerGrossReceipts > 0) {
      onResultChange(`Gross: ₹${freelancerGrossReceipts.toLocaleString('en-IN')} | Est. Tax: ₹${results.estimatedTax.toLocaleString('en-IN')}`);
    }
  }, [freelancerGrossReceipts, results, onResultChange]);

  const handleCopy = () => {
    let schedText = results.advanceTaxSchedule.map(s => `${s.date} (${s.percent}): ₹${s.amount.toLocaleString('en-IN')}`).join('\n');
    const text = `Freelancer 44ADA Presumptive Tax Calculator:
Gross Receipts: ₹${freelancerGrossReceipts.toLocaleString('en-IN')}
Deemed Taxable Income (50%): ₹${results.deemedProfit.toLocaleString('en-IN')}
Estimated Income Tax: ₹${results.estimatedTax.toLocaleString('en-IN')}

Advance Tax Schedule (Quarterly):
${schedText}

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>Income Tax Act Section 44ADA (50% Deemed Profit Scheme)</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Laptop className="w-6 h-6 text-purple-600" />
          Freelancer & Professional 44ADA Tax Calculator
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Calculate taxable income for software devs, designers, doctors, and consultants under Section 44ADA with zero book-keeping audit and view the Advance Tax calendar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Annual Gross Professional Receipts (₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-neutral-500 font-bold">₹</span>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={freelancerGrossReceipts}
                  onChange={(e) => setFreelancerGrossReceipts(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>
              <span className="text-xs text-neutral-500 mt-2 block">Eligible up to ₹75 Lakhs under 44ADA</span>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-xl space-y-2">
               <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300">Eligibility Note:</h4>
               <p className="text-xs text-purple-700/80 dark:text-purple-400/80 leading-relaxed">
                  Under 44ADA, you don't need to maintain books of accounts. Directly show 50% of your gross receipts as taxable income (profit), and the remaining 50% is assumed as your business expenses.
               </p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 space-y-6">
                <div>
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">50% Deemed Taxable Income</div>
                    <div className="text-3xl font-black text-white font-mono">
                      ₹{results.deemedProfit.toLocaleString('en-IN')}
                    </div>
                </div>
                
                <div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1">Estimated Income Tax</div>
                    <div className="text-2xl font-black text-white font-mono">
                      ₹{results.estimatedTax.toLocaleString('en-IN')}
                    </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-300 mb-3">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        Advance Tax Schedule
                    </div>
                    <div className="space-y-2">
                        {results.advanceTaxSchedule.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-neutral-400">{s.date} <span className="text-neutral-500">({s.percent})</span></span>
                                <span className="font-mono font-bold text-purple-300">₹{s.amount.toLocaleString('en-IN')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-purple-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Tax Details'}
          </button>
        </div>
      </div>
    </div>
  );
};
