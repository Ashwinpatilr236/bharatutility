import React, { useState } from 'react';
import { Shield, Calculator, CheckCircle2 } from 'lucide-react';
import { AdSlot } from '../common/AdSlot';

export default function InvestmentPlanner80C80D() {
  const [investments80c, setInvestments80c] = useState({
    ppf: '',
    elss: '',
    lic: '',
    pf: '',
    homeLoan: '',
    childrenTuition: ''
  });

  const [investments80d, setInvestments80d] = useState({
    self: '',
    parents: '',
    parentsSenior: false
  });

  const calculate80CTotal = (): number => {
    return Object.values(investments80c).reduce<number>((acc, val) => acc + (parseFloat(val as string) || 0), 0);
  };

  const total80C = calculate80CTotal();
  const remaining80C = Math.max(0, 150000 - total80C);
  const eligible80C = Math.min(150000, total80C);

  const calculate80DTotal = () => {
    const self = parseFloat(investments80d.self) || 0;
    const parents = parseFloat(investments80d.parents) || 0;
    const parentLimit = investments80d.parentsSenior ? 50000 : 25000;
    
    const eligibleSelf = Math.min(25000, self);
    const eligibleParents = Math.min(parentLimit, parents);
    
    return {
      total: self + parents,
      eligible: eligibleSelf + eligibleParents,
      remainingSelf: Math.max(0, 25000 - self),
      remainingParents: Math.max(0, parentLimit - parents)
    };
  };

  const data80D = calculate80DTotal();
  const totalDeduction = eligible80C + data80D.eligible;
  // Assumes a conservative 30% tax bracket for tax saved visualization
  const taxSaved = totalDeduction * 0.312; // 30% + 4% cess

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          80C & 80D Investment Planner
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            
            {/* Section 80C */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <h3 className="text-lg font-semibold text-white">Section 80C</h3>
                <span className="text-xs font-medium text-slate-400">Max Limit: ₹1.5 Lakh</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'ppf', label: 'PPF / EPF' },
                  { key: 'elss', label: 'ELSS Mutual Funds' },
                  { key: 'lic', label: 'Life Insurance Premium' },
                  { key: 'pf', label: 'Provident Fund (VPF)' },
                  { key: 'homeLoan', label: 'Home Loan Principal' },
                  { key: 'childrenTuition', label: 'Children Tuition Fee' },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs font-medium text-slate-400 mb-1">{item.label}</label>
                    <input
                      type="number"
                      value={(investments80c as any)[item.key]}
                      onChange={(e) => setInvestments80c({...investments80c, [item.key]: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      placeholder="₹ 0"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-300 text-sm">Total 80C Investment:</span>
                <span className="text-white font-bold">₹{total80C.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Section 80D */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                <h3 className="text-lg font-semibold text-white">Section 80D (Health Insurance)</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Self & Family (Max ₹25,000)</label>
                  <input
                    type="number"
                    value={investments80d.self}
                    onChange={(e) => setInvestments80d({...investments80d, self: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="₹ 0"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-slate-300">Parents Insurance</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="senior"
                        checked={investments80d.parentsSenior}
                        onChange={(e) => setInvestments80d({...investments80d, parentsSenior: e.target.checked})}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                      />
                      <label htmlFor="senior" className="text-xs text-slate-400">Parents are Senior Citizens</label>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={investments80d.parents}
                    onChange={(e) => setInvestments80d({...investments80d, parents: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="₹ 0"
                  />
                  <p className="text-xs text-slate-500 mt-1">Limit: ₹{investments80d.parentsSenior ? '50,000' : '25,000'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Results Panel */}
          <div>
            <div className="bg-slate-950 sticky top-6 rounded-2xl border border-slate-800 p-6 space-y-6">
              <h3 className="text-slate-400 text-sm font-medium">Eligible Tax Deductions</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-slate-300">Sec 80C Eligible</span>
                  <div className="text-right">
                    <div className="text-white font-medium">₹{eligible80C.toLocaleString('en-IN')}</div>
                    {remaining80C > 0 && <div className="text-xs text-rose-400">Can invest ₹{remaining80C.toLocaleString('en-IN')} more</div>}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                  <span className="text-slate-300">Sec 80D Eligible</span>
                  <div className="text-right">
                    <div className="text-white font-medium">₹{data80D.eligible.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-300 font-medium">Total Deductions</span>
                    <span className="text-2xl font-bold text-white">
                      ₹{totalDeduction.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5">
                    <div 
                      className="bg-emerald-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (totalDeduction / (150000 + 75000)) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Calculator className="w-4 h-4" />
                    <span className="font-medium text-sm">Estimated Tax Saved</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ~₹{taxSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Assuming 30% tax bracket + cess.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AdSlot />
    </div>
  );
}
