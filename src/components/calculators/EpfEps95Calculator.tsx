import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Landmark, Check, Copy, UserCheck, Briefcase, Info, TrendingUp } from 'lucide-react';

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

export const EpfEps95Calculator: React.FC<Props> = ({ onResultChange }) => {
  const [epfBasicDa, setEpfBasicDa] = useState<number>(30000);
  const [serviceYears, setServiceYears] = useState<number>(25);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    employeeEpfMonthly,
    employerEpfMonthly,
    employerEpsMonthly,
    epsMonthlyPension,
    totalEpfMonthly
  } = useMemo(() => {
    const basic = epfBasicDa || 0;
    const years = serviceYears || 0;

    if (basic <= 0 || years <= 0) {
      return { employeeEpfMonthly: 0, employerEpfMonthly: 0, employerEpsMonthly: 0, epsMonthlyPension: 0, totalEpfMonthly: 0 };
    }

    const employeeEpf = Math.round(basic * 0.12);
    const employerEps = Math.min(1250, Math.round(Math.min(15000, basic) * 0.0833));
    const employerEpf = Math.round(basic * 0.12 - employerEps);
    
    // EPS Pension = (Pensionable Salary capped at ₹15,000 * Service Years) / 70
    // Service years max capped at 35 for EPS calculation standard
    const epsPension = Math.round((Math.min(15000, basic) * Math.min(35, years)) / 70);

    if (onResultChange) {
      onResultChange(`Pension: ${formatINR(epsPension)}/mo`);
    }

    return {
      employeeEpfMonthly: employeeEpf,
      employerEpfMonthly: employerEpf,
      employerEpsMonthly: employerEps,
      epsMonthlyPension: epsPension,
      totalEpfMonthly: employeeEpf + employerEpf
    };
  }, [epfBasicDa, serviceYears]);

  const handleCopy = () => {
    const text = `EPF & EPS-95 Estimation:
Basic Pay + DA: ${formatINR(epfBasicDa)}
Service Years: ${serviceYears}

Monthly Contributions:
Employee EPF (12%): ${formatINR(employeeEpfMonthly)}
Employer EPF (3.67%): ${formatINR(employerEpfMonthly)}
Employer EPS (8.33%): ${formatINR(employerEpsMonthly)}

Total Monthly EPF Savings: ${formatINR(totalEpfMonthly)}

Estimated EPS-95 Lifelong Pension (Post 58 Yrs): ${formatINR(epsMonthlyPension)} / month
Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Landmark className="w-6 h-6 text-emerald-600" />
          EPF 8.25% & EPS-95 Pension Estimator
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Calculate your 12% Employee and Employer split (3.67% EPF + 8.33% EPS) and estimate your monthly lifelong pension after age 58.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Monthly Basic Pay + DA (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={epfBasicDa}
                  onChange={(e) => setEpfBasicDa(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Total Service (Years)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="40"
                  inputMode="numeric"
                  value={serviceYears}
                  onChange={(e) => setServiceYears(Number(e.target.value))}
                  className="w-full pl-3 pr-12 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs uppercase">Years</span>
              </div>
            </div>
            
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <p>EPS pension is capped by a maximum pensionable salary of ₹15,000. For service &gt; 10 years, you qualify for lifelong EPS-95 pension at age 58.</p>
                </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 text-center mb-6">
                <p className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2">Estimated EPS-95 Pension</p>
                <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-emerald-400 flex justify-center items-end gap-1">
                    {formatINR(epsMonthlyPension)}
                    <span className="text-lg font-medium text-emerald-400/70 pb-1">/mo</span>
                </div>
                <div className="inline-flex items-center gap-1 mt-2 text-[10px] uppercase font-bold text-emerald-500/80 tracking-wider">
                    Guaranteed for life post 58 years
                </div>
            </div>
            
            <div className="relative z-10 pt-4 border-t border-neutral-800 space-y-4">
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold text-center mb-4">Monthly Provident Fund Split</p>
                
                <div className="flex items-center justify-between text-neutral-300">
                    <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">Employee EPF (12%)</span>
                    </div>
                    <span className="font-bold font-mono">{formatINR(employeeEpfMonthly)}</span>
                </div>
                
                <div className="flex items-center justify-between text-neutral-300">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm">Employer EPF (3.67%)</span>
                    </div>
                    <span className="font-bold font-mono">{formatINR(employerEpfMonthly)}</span>
                </div>
                
                <div className="flex items-center justify-between text-neutral-300">
                    <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-amber-500" />
                        <span className="text-sm">Employer EPS (8.33%)</span>
                    </div>
                    <span className="font-bold font-mono">{formatINR(employerEpsMonthly)}</span>
                </div>
                
                <div className="pt-3 border-t border-neutral-800/50 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400">
                        <TrendingUp className="w-3.5 h-3.5" /> Total EPF Savings
                    </div>
                    <span className="font-bold text-white text-lg font-mono">{formatINR(totalEpfMonthly)}<span className="text-xs font-normal text-neutral-500">/mo</span></span>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Estimate Copied!' : 'Copy Pension Estimate'}
          </button>
        </div>
      </div>
    </div>
  );
};
