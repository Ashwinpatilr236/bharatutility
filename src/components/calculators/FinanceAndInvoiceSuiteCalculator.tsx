import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Gauge, Receipt, TrendingUp, Sparkles, Check, Copy, Printer, Plus, Trash2, ShieldCheck, IndianRupee } from 'lucide-react';

interface Props {
  tool: Tool;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(val));
};

export const FinanceAndInvoiceSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. CIBIL SCORE SIMULATOR STATE ---
  const [baseScore, setBaseScore] = useState<number>(720);
  const [paymentHistory, setPaymentHistory] = useState<'perfect' | 'minor-delay' | 'default'>('perfect');
  const [creditUtilizationPct, setCreditUtilizationPct] = useState<number>(25); // %
  const [creditAgeYears, setCreditAgeYears] = useState<number>(4);
  const [recentHardInquiries, setRecentHardInquiries] = useState<number>(1);
  const [creditMix, setCreditMix] = useState<'balanced' | 'unsecured-only'>('balanced');

  // --- 2. STEP-UP SIP CALCULATOR STATE ---
  const [stepUpInitialSip, setStepUpInitialSip] = useState<number>(10000);
  const [stepUpAnnualHikePct, setStepUpAnnualHikePct] = useState<number>(10); // 10% annual top-up
  const [stepUpYears, setStepUpYears] = useState<number>(15);
  const [stepUpExpectedReturn, setStepUpExpectedReturn] = useState<number>(12); // %

  // --- 3. GST TAX INVOICE GENERATOR STATE ---
  const [sellerName, setSellerName] = useState<string>('Bharat Traders & Services');
  const [sellerGstin, setSellerGstin] = useState<string>('27AAAAA0000A1Z5');
  const [buyerName, setBuyerName] = useState<string>('Client Enterprise Pvt Ltd');
  const [buyerGstin, setBuyerGstin] = useState<string>('27BBBBB1111B1Z2');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-2026-001');
  const [invoiceItems, setInvoiceItems] = useState<Array<{ id: number; desc: string; hsn: string; qty: number; rate: number; gstRate: number }>>([
    { id: 1, desc: 'Web Software Consulting Service', hsn: '998314', qty: 1, rate: 25000, gstRate: 18 },
    { id: 2, desc: 'Hardware Network Maintenance', hsn: '998713', qty: 2, rate: 5000, gstRate: 18 },
  ]);

  // ================= 1. CIBIL SCORE SIMULATOR =================
  const cibilResult = useMemo(() => {
    let simulatedScore = baseScore;

    // Payment History factor (35% weight)
    if (paymentHistory === 'perfect') {
      simulatedScore += 25;
    } else if (paymentHistory === 'minor-delay') {
      simulatedScore -= 40;
    } else {
      simulatedScore -= 110;
    }

    // Credit Utilization factor (30% weight) - Ideal is < 30%
    if (creditUtilizationPct <= 30) {
      simulatedScore += 20;
    } else if (creditUtilizationPct <= 50) {
      simulatedScore -= 15;
    } else {
      simulatedScore -= 45;
    }

    // Credit Age (15% weight)
    if (creditAgeYears >= 5) {
      simulatedScore += 15;
    } else if (creditAgeYears <= 1) {
      simulatedScore -= 10;
    }

    // Hard Inquiries (10% weight)
    if (recentHardInquiries === 0) {
      simulatedScore += 10;
    } else if (recentHardInquiries > 3) {
      simulatedScore -= (recentHardInquiries - 2) * 15;
    }

    // Credit Mix (10% weight)
    if (creditMix === 'balanced') {
      simulatedScore += 10;
    } else {
      simulatedScore -= 10;
    }

    simulatedScore = Math.max(300, Math.min(900, Math.round(simulatedScore)));

    let status = 'Excellent (Instant Approval)';
    let statusColor = 'text-emerald-400';
    let badgeBg = 'bg-emerald-500/20 text-emerald-300';
    let loanApprovalChance = '98% (Best Interest Rates)';

    if (simulatedScore < 600) {
      status = 'Poor (High Rejection Risk)';
      statusColor = 'text-rose-400';
      badgeBg = 'bg-rose-500/20 text-rose-300';
      loanApprovalChance = 'Low (<20%)';
    } else if (simulatedScore < 700) {
      status = 'Fair (Moderate Approval)';
      statusColor = 'text-amber-400';
      badgeBg = 'bg-amber-500/20 text-amber-300';
      loanApprovalChance = 'Moderate (60%)';
    } else if (simulatedScore < 750) {
      status = 'Good';
      statusColor = 'text-cyan-400';
      badgeBg = 'bg-cyan-500/20 text-cyan-300';
      loanApprovalChance = 'High (85%)';
    }

    return {
      simulatedScore,
      status,
      statusColor,
      badgeBg,
      loanApprovalChance,
    };
  }, [baseScore, paymentHistory, creditUtilizationPct, creditAgeYears, recentHardInquiries, creditMix]);

  // ================= 2. STEP-UP SIP CALCULATION =================
  const stepUpResult = useMemo(() => {
    const monthlyRate = stepUpExpectedReturn / 12 / 100;
    let normalSipTotalInvested = 0;
    let normalSipCorpus = 0;

    let stepUpTotalInvested = 0;
    let stepUpCorpus = 0;
    let currentMonthly = stepUpInitialSip;

    for (let yr = 1; yr <= stepUpYears; yr++) {
      for (let m = 1; m <= 12; m++) {
        // Normal flat SIP
        normalSipTotalInvested += stepUpInitialSip;
        normalSipCorpus = (normalSipCorpus + stepUpInitialSip) * (1 + monthlyRate);

        // Step-Up SIP
        stepUpTotalInvested += currentMonthly;
        stepUpCorpus = (stepUpCorpus + currentMonthly) * (1 + monthlyRate);
      }
      // Increase by annual percentage for next year
      currentMonthly += (currentMonthly * stepUpAnnualHikePct) / 100;
    }

    const stepUpGain = stepUpCorpus - stepUpTotalInvested;
    const normalGain = normalSipCorpus - normalSipTotalInvested;
    const extraCorpusCreated = stepUpCorpus - normalSipCorpus;

    return {
      stepUpCorpus: Math.round(stepUpCorpus),
      stepUpTotalInvested: Math.round(stepUpTotalInvested),
      stepUpGain: Math.round(stepUpGain),
      normalSipCorpus: Math.round(normalSipCorpus),
      normalSipTotalInvested: Math.round(normalSipTotalInvested),
      normalGain: Math.round(normalGain),
      extraCorpusCreated: Math.round(extraCorpusCreated),
      finalYearMonthlySip: Math.round(currentMonthly / (1 + stepUpAnnualHikePct / 100)),
    };
  }, [stepUpInitialSip, stepUpAnnualHikePct, stepUpYears, stepUpExpectedReturn]);

  // ================= 3. GST INVOICE CALCULATION =================
  const invoiceResult = useMemo(() => {
    let taxableTotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    const itemDetails = invoiceItems.map(item => {
      const taxable = item.qty * item.rate;
      const cgst = (taxable * (item.gstRate / 2)) / 100;
      const sgst = (taxable * (item.gstRate / 2)) / 100;
      const total = taxable + cgst + sgst;

      taxableTotal += taxable;
      totalCgst += cgst;
      totalSgst += sgst;

      return {
        ...item,
        taxable,
        cgst,
        sgst,
        total,
      };
    });

    const grandTotal = taxableTotal + totalCgst + totalSgst;

    return {
      itemDetails,
      taxableTotal: Math.round(taxableTotal),
      totalCgst: Math.round(totalCgst),
      totalSgst: Math.round(totalSgst),
      totalGst: Math.round(totalCgst + totalSgst),
      grandTotal: Math.round(grandTotal),
    };
  }, [invoiceItems]);

  const addItem = () => {
    setInvoiceItems(prev => [
      ...prev,
      { id: Date.now(), desc: 'New Service / Product Item', hsn: '998311', qty: 1, rate: 1000, gstRate: 18 }
    ]);
  };

  const removeItem = (id: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(prev => prev.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8">
      {/* ================= 1. CIBIL SCORE SIMULATOR ================= */}
      {slug === 'cibil-score-simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Credit Profile Simulator</h3>
                <p className="text-xs text-slate-400">See how financial habits impact your CIBIL score</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Current Baseline CIBIL Score</span>
                  <span className="font-mono font-bold text-cyan-400">{baseScore}</span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={850}
                  value={baseScore}
                  onChange={(e) => setBaseScore(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Payment History Track Record</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'perfect', label: '100% On-Time', impact: '+25 Pts' },
                    { id: 'minor-delay', label: '1-2 Delays (30d)', impact: '-40 Pts' },
                    { id: 'default', label: 'Default / Settle', impact: '-110 Pts' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPaymentHistory(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-left ${
                        paymentHistory === opt.id ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="text-xs">{opt.label}</div>
                      <div className="text-[10px] text-cyan-400">{opt.impact}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Credit Card Limit Utilization (%)</span>
                  <span className={`font-mono font-bold ${creditUtilizationPct <= 30 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {creditUtilizationPct}% ({creditUtilizationPct <= 30 ? 'Safe <30%' : 'High Utilization'})
                  </span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={95}
                  value={creditUtilizationPct}
                  onChange={(e) => setCreditUtilizationPct(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Recent Loan Inquiries</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={recentHardInquiries}
                    onChange={(e) => setRecentHardInquiries(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Oldest Credit Age</label>
                  <select
                    value={creditAgeYears}
                    onChange={(e) => setCreditAgeYears(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value={1}>&lt; 1 Year</option>
                    <option value={3}>2 - 4 Years</option>
                    <option value={6}>5+ Years</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulated CIBIL Score
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${cibilResult.badgeBg}`}>
                  {cibilResult.status}
                </span>
              </div>

              <div className="text-5xl font-extrabold font-mono text-white">
                {cibilResult.simulatedScore} <span className="text-sm font-normal text-slate-400">/ 900</span>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank Loan Approval Likelihood:</span>
                  <span className="font-bold text-emerald-400">{cibilResult.loanApprovalChance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Score Range:</span>
                  <span className="font-mono text-white">300 (Poor) to 900 (Excellent)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. STEP-UP SIP CALCULATOR ================= */}
      {slug === 'sip-step-up-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Annual Step-Up SIP Parameters</h3>
                <p className="text-xs text-slate-400">Increase SIP every year with your salary increment</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Starting Monthly SIP Amount</span>
                  <span className="font-mono font-bold text-emerald-400">{formatINR(stepUpInitialSip)} / mo</span>
                </label>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={stepUpInitialSip}
                  onChange={(e) => setStepUpInitialSip(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Annual Step-Up Hike Rate (%)</span>
                  <span className="font-mono font-bold text-cyan-400">+{stepUpAnnualHikePct}% every year</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map(hike => (
                    <button
                      key={hike}
                      type="button"
                      onClick={() => setStepUpAnnualHikePct(hike)}
                      className={`py-2 text-xs font-semibold rounded-xl border ${
                        stepUpAnnualHikePct === hike ? 'bg-cyan-500/20 border-cyan-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      +{hike}% {hike === 10 ? '(Standard)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Tenure (Years)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={stepUpYears}
                    onChange={(e) => setStepUpYears(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Expected Return (%)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={stepUpExpectedReturn}
                    onChange={(e) => setStepUpExpectedReturn(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Total Wealth with Step-Up SIP
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {formatINR(stepUpResult.stepUpCorpus)}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Total Invested:</span>
                  <span className="font-bold text-white mt-1 block">{formatINR(stepUpResult.stepUpTotalInvested)}</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Extra Gain vs Flat SIP:</span>
                  <span className="font-bold text-emerald-400 mt-1 block">+{formatINR(stepUpResult.extraCorpusCreated)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. GST TAX INVOICE GENERATOR ================= */}
      {slug === 'gst-tax-invoice-generator' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">GST Tax Invoice Builder</h3>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="font-bold text-emerald-400 block">Seller Details</span>
                <input
                  type="text"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Business Name"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white"
                />
                <input
                  type="text"
                  value={sellerGstin}
                  onChange={(e) => setSellerGstin(e.target.value)}
                  placeholder="Seller GSTIN"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
                />
              </div>

              <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="font-bold text-cyan-400 block">Buyer (B2B / B2C) Details</span>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="Client / Buyer Name"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white"
                />
                <input
                  type="text"
                  value={buyerGstin}
                  onChange={(e) => setBuyerGstin(e.target.value)}
                  placeholder="Buyer GSTIN (Optional)"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white font-mono"
                />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 uppercase">Itemized Products / Services</span>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>

              {invoiceItems.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center text-xs p-2 bg-slate-800/40 rounded-xl border border-slate-800">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.desc}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInvoiceItems(prev => prev.map(i => i.id === item.id ? { ...i, desc: val } : i));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={item.hsn}
                      placeholder="HSN"
                      onChange={(e) => {
                        const val = e.target.value;
                        setInvoiceItems(prev => prev.map(i => i.id === item.id ? { ...i, hsn: val } : i));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      value={item.rate}
                      placeholder="Rate"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setInvoiceItems(prev => prev.map(i => i.id === item.id ? { ...i, rate: val } : i));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={item.gstRate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setInvoiceItems(prev => prev.map(i => i.id === item.id ? { ...i, gstRate: val } : i));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-mono"
                    >
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total invoice sum */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-emerald-950/40 rounded-xl border border-emerald-500/30 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Taxable: {formatINR(invoiceResult.taxableTotal)} | CGST+SGST: {formatINR(invoiceResult.totalGst)}</span>
                <span className="font-bold text-emerald-400 text-sm">Invoice Grand Total (INR)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {formatINR(invoiceResult.grandTotal)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
