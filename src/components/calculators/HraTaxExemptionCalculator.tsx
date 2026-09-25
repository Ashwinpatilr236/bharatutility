import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { Building2, MapPin, IndianRupee, Landmark, ShieldCheck, Copy, Check, Info } from 'lucide-react';

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

export const HraTaxExemptionCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [basicSalary, setBasicSalary] = useState<number>(50000);
  const [da, setDa] = useState<number>(0); // Dearness Allowance
  const [hraReceived, setHraReceived] = useState<number>(20000);
  const [rentPaid, setRentPaid] = useState<number>(15000);
  const [isMetro, setIsMetro] = useState<boolean>(true); // Delhi, Mumbai, Kolkata, Chennai are 50%
  const [copied, setCopied] = useState<boolean>(false);

  const {
    exemptionAmount,
    taxableHra,
    condition1,
    condition2,
    condition3
  } = useMemo(() => {
    // Basic + DA
    const salary = basicSalary + da;
    
    // Condition 1: Actual HRA received
    const c1 = hraReceived;
    
    // Condition 2: 50% of salary for metro, 40% for non-metro
    const c2 = isMetro ? salary * 0.5 : salary * 0.4;
    
    // Condition 3: Actual rent paid minus 10% of salary
    const c3 = Math.max(0, rentPaid - (salary * 0.1));

    const exempted = Math.min(c1, c2, c3);
    const taxable = Math.max(0, hraReceived - exempted);

    return {
      exemptionAmount: exempted,
      taxableHra: taxable,
      condition1: c1,
      condition2: c2,
      condition3: c3
    };
  }, [basicSalary, da, hraReceived, rentPaid, isMetro]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`HRA Exempted: ${formatINR(exemptionAmount)}/month | Taxable HRA: ${formatINR(taxableHra)}/month`);
    }
  }, [exemptionAmount, taxableHra, onResultChange]);

  const copyToClipboard = () => {
    const text = `🏠 HRA Exemption Calculation
- Basic + DA: ${formatINR(basicSalary + da)}
- Rent Paid: ${formatINR(rentPaid)}
- HRA Received: ${formatINR(hraReceived)}
- City Type: ${isMetro ? 'Metro (50%)' : 'Non-Metro (40%)'}

✅ Tax Exempt HRA: ${formatINR(exemptionAmount)}/month
⚠️ Taxable HRA: ${formatINR(taxableHra)}/month

Calculated via BharatUtility`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Monthly HRA Details</h3>
              <p className="text-xs text-slate-400">Enter your monthly salary and rent amounts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-indigo-400" />
                Basic Salary (Monthly)
              </label>
              <input
                type="number"
                min="0"
                value={basicSalary || ''}
                onChange={(e) => setBasicSalary(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-indigo-400" />
                Dearness Allowance (DA)
              </label>
              <input
                type="number"
                min="0"
                value={da === 0 ? '' : da}
                onChange={(e) => setDa(Number(e.target.value))}
                placeholder="0 if none"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-blue-400" />
                HRA Received (from Employer)
              </label>
              <input
                type="number"
                min="0"
                value={hraReceived || ''}
                onChange={(e) => setHraReceived(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                Actual Rent Paid
              </label>
              <input
                type="number"
                min="0"
                value={rentPaid || ''}
                onChange={(e) => setRentPaid(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono text-sm focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              City Type (for 50% vs 40% rule)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsMetro(true)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  isMetro 
                    ? 'bg-rose-500/20 border-rose-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Metro City (Delhi, Mumbai, Kolkata, Chennai)
              </button>
              <button
                onClick={() => setIsMetro(false)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  !isMetro 
                    ? 'bg-rose-500/20 border-rose-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Non-Metro City
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex gap-2.5 mt-2">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-300">
              Note: HRA Exemption is available only under the <strong>Old Tax Regime</strong>. Under the New Tax Regime, HRA is fully taxable.
            </p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border-2 border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-6 sticky top-6">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              Monthly HRA Exemption
            </h4>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 shadow-inner flex flex-col items-center justify-center text-center">
            <span className="text-slate-400 text-sm font-semibold mb-1">Exempt HRA (Tax-Free)</span>
            <div className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
              {formatINR(exemptionAmount)}
            </div>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-rose-500/20 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-rose-300 mb-1">Taxable HRA</span>
            <span className="text-2xl font-bold text-rose-400 font-mono">{formatINR(taxableHra)}</span>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-400 text-center mb-2">Exemption is the least of the following three:</p>
            
            <div className={`flex justify-between items-center text-xs p-2 rounded-lg ${exemptionAmount === condition1 ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-400'}`}>
              <span>1. Actual HRA Received</span>
              <span className="font-mono">{formatINR(condition1)}</span>
            </div>
            
            <div className={`flex justify-between items-center text-xs p-2 rounded-lg ${exemptionAmount === condition2 ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-400'}`}>
              <span>2. {isMetro ? '50%' : '40%'} of (Basic+DA)</span>
              <span className="font-mono">{formatINR(condition2)}</span>
            </div>
            
            <div className={`flex justify-between items-center text-xs p-2 rounded-lg ${exemptionAmount === condition3 ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-400'}`}>
              <span>3. Rent Paid - 10% of (Basic+DA)</span>
              <span className="font-mono">{formatINR(condition3)}</span>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy HRA Calculation'}
          </button>
        </div>
      </div>
    </div>
  );
};
