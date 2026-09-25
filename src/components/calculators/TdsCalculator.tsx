import React, { useState } from 'react';
import { Calculator, AlertCircle, TrendingDown } from 'lucide-react';
import { AdSlot } from '../common/AdSlot';
import { QuickAmountChips } from '../common/QuickAmountChips';

const TDS_RATES = [
  { section: '192', description: 'Salary Income', rate: 'As per tax slab' },
  { section: '194A', description: 'Interest from Bank/Post Office (Non-Senior: ₹40K limit, Senior: ₹50K)', rate: '10%' },
  { section: '194C', description: 'Payment to Contractors (Individual/HUF)', rate: '1%' },
  { section: '194C', description: 'Payment to Contractors (Others)', rate: '2%' },
  { section: '194H', description: 'Commission or Brokerage', rate: '5%' },
  { section: '194I', description: 'Rent on Plant & Machinery', rate: '2%' },
  { section: '194I', description: 'Rent on Land/Building/Furniture', rate: '10%' },
  { section: '194J', description: 'Professional or Technical Fees', rate: '10%' },
];

export default function TdsCalculator() {
  const [amount, setAmount] = useState<string>('50000');
  const [selectedSection, setSelectedSection] = useState<number>(1);
  const [hasPan, setHasPan] = useState<boolean>(true);

  const calculateTds = () => {
    const principal = parseFloat(amount) || 0;
    const rateItem = TDS_RATES[selectedSection];
    
    let rate = 0;
    if (rateItem.rate !== 'As per tax slab') {
      rate = parseFloat(rateItem.rate);
    }
    
    // If no PAN, TDS is usually 20%
    if (!hasPan && rateItem.rate !== 'As per tax slab') {
      rate = 20;
    }

    const tdsAmount = (principal * rate) / 100;
    const netPayable = principal - tdsAmount;

    return { tdsAmount, netPayable, rate };
  };

  const results = calculateTds();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-400" />
          TDS Calculator (FY 2026-27)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Payment Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter amount"
              />
              <QuickAmountChips
                amounts={[10000, 50000, 100000, 500000]}
                onSelect={(val) => setAmount(val.toString())}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nature of Payment (Section)
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {TDS_RATES.map((rate, idx) => (
                  <option key={idx} value={idx}>
                    Sec {rate.section} - {rate.description} ({rate.rate})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="hasPan"
                checked={hasPan}
                onChange={(e) => setHasPan(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-950"
              />
              <label htmlFor="hasPan" className="text-sm font-medium text-slate-300">
                Payee has a valid PAN Card
              </label>
            </div>
            
            {!hasPan && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2 text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>Without a valid PAN, TDS is generally deducted at a higher rate of 20% (or the applicable rate, whichever is higher).</p>
              </div>
            )}
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-medium mb-4">Calculation Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-300">Gross Amount</span>
                <span className="text-white font-medium">₹{parseFloat(amount || '0').toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg border-l-2 border-rose-500">
                <div className="flex items-center gap-2 text-slate-300">
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                  <span>TDS Deducted ({results.rate}%)</span>
                </div>
                <span className="text-rose-400 font-bold">- ₹{results.tdsAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between items-end">
                  <span className="text-slate-300 font-medium">Net Payable to Deductee</span>
                  <span className="text-3xl font-bold text-emerald-400">
                    ₹{results.netPayable.toLocaleString('en-IN')}
                  </span>
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
