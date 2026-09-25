import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { ShoppingBag, Check, Copy, Percent, IndianRupee, Factory, Truck, Store } from 'lucide-react';

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

export const MrpMarginBreakdownCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [mrpInput, setMrpInput] = useState<number>(1000);
  const [gstRatePercent, setGstRatePercent] = useState<number>(18);
  const [retailerMarginPercent, setRetailerMarginPercent] = useState<number>(18);
  const [distributorMarginPercent, setDistributorMarginPercent] = useState<number>(6);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    retailerMarginAmt,
    distributorMarginAmt,
    gstAmount,
    manufacturerBaseCost
  } = useMemo(() => {
    const mrp = mrpInput || 0;
    
    if (mrp <= 0) {
      return { retailerMarginAmt: 0, distributorMarginAmt: 0, gstAmount: 0, manufacturerBaseCost: 0 };
    }

    const retailerAmt = (mrp * retailerMarginPercent) / 100;
    const distributorAmt = (mrp * distributorMarginPercent) / 100;
    const netManufacturerGstInclusive = mrp - retailerAmt - distributorAmt;
    const gstAmt = (netManufacturerGstInclusive * gstRatePercent) / (100 + gstRatePercent);
    const mfgCost = netManufacturerGstInclusive - gstAmt;

    if (onResultChange) {
      onResultChange(`Base Cost: ${formatINR(Math.round(mfgCost))}`);
    }

    return {
      retailerMarginAmt: Math.round(retailerAmt),
      distributorMarginAmt: Math.round(distributorAmt),
      gstAmount: Math.round(gstAmt),
      manufacturerBaseCost: Math.round(mfgCost)
    };
  }, [mrpInput, gstRatePercent, retailerMarginPercent, distributorMarginPercent]);

  const handleCopy = () => {
    const text = `MRP Price Breakdown:
Printed MRP: ${formatINR(mrpInput)}
GST Rate: ${gstRatePercent}%

Decomposition:
Retailer Margin (~${retailerMarginPercent}%): ${formatINR(retailerMarginAmt)}
Distributor Margin (~${distributorMarginPercent}%): ${formatINR(distributorMarginAmt)}
Govt GST: ${formatINR(gstAmount)}

Estimated Manufacturer Base Cost: ${formatINR(manufacturerBaseCost)}
Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-cyan-600" />
          Indian MRP Price Breakdown & Retail Margin Calculator
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Decompose any printed Maximum Retail Price (MRP) into Base Manufacturing Cost, GST Tax, Distributor Margin, and Retailer Profit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                Printed Product MRP (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={mrpInput}
                  onChange={(e) => setMrpInput(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-bold text-xl text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2 uppercase tracking-wider">
                Product GST Rate (%)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 12, 18, 28].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGstRatePercent(g)}
                    className={`py-2 rounded-xl text-sm font-bold border transition-all ${
                      gstRatePercent === g
                        ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-cyan-300'
                    }`}
                  >
                    {g}%
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Retailer Margin (%)
                </label>
                <div className="relative">
                    <input
                    type="number"
                    value={retailerMarginPercent}
                    onChange={(e) => setRetailerMarginPercent(Number(e.target.value))}
                    className="w-full pl-3 pr-7 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">%</span>
                </div>
                </div>
                <div>
                <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Distributor Margin (%)
                </label>
                <div className="relative">
                    <input
                    type="number"
                    value={distributorMarginPercent}
                    onChange={(e) => setDistributorMarginPercent(Number(e.target.value))}
                    className="w-full pl-3 pr-7 py-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-bold">%</span>
                </div>
                </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span className="text-neutral-400 text-sm font-medium">Retailer Profit</span>
                </div>
                <span className="font-bold text-emerald-400 font-mono text-lg">{formatINR(retailerMarginAmt)}</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-400" />
                    <span className="text-neutral-400 text-sm font-medium">Distributor Profit</span>
                </div>
                <span className="font-bold text-cyan-400 font-mono text-lg">{formatINR(distributorMarginAmt)}</span>
              </div>
              
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-amber-400" />
                    <span className="text-neutral-400 text-sm font-medium">Govt GST ({gstRatePercent}%)</span>
                </div>
                <span className="font-bold text-amber-400 font-mono text-lg">{formatINR(gstAmount)}</span>
              </div>
            </div>
            
            <div className="relative z-10 mt-6 pt-4 border-t-2 border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                    <Factory className="w-5 h-5 text-neutral-300" />
                    <span className="font-bold text-neutral-300 uppercase tracking-wide text-xs">Est. Manufacturer Base Cost</span>
                </div>
                <div className="text-4xl font-black text-white tabular-nums tracking-tight">
                    {formatINR(manufacturerBaseCost)}
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-cyan-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Breakdown Copied!' : 'Copy Breakdown Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
