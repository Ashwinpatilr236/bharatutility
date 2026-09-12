import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Clock, Calendar, CheckCircle2, AlertCircle, ShieldCheck, DollarSign, ArrowUpRight } from 'lucide-react';
import { formatINR } from '../../../utils/formatters';

interface MarketHoliday {
  date: string;
  name: string;
  day: string;
  clearingHoliday: boolean;
}

const NSE_HOLIDAYS_2026: MarketHoliday[] = [
  { date: '2026-01-26', name: 'Republic Day', day: 'Monday', clearingHoliday: true },
  { date: '2026-02-17', name: 'Mahashivratri', day: 'Tuesday', clearingHoliday: true },
  { date: '2026-03-04', name: 'Holi', day: 'Wednesday', clearingHoliday: true },
  { date: '2026-03-27', name: 'Id-Ul-Fitr (Ramzan Id)', day: 'Friday', clearingHoliday: true },
  { date: '2026-04-03', name: 'Good Friday', day: 'Friday', clearingHoliday: true },
  { date: '2026-04-14', name: 'Dr. Baba Saheb Ambedkar Jayanti', day: 'Tuesday', clearingHoliday: true },
  { date: '2026-05-01', name: 'Maharashtra Day', day: 'Friday', clearingHoliday: true },
  { date: '2026-08-15', name: 'Independence Day', day: 'Saturday', clearingHoliday: true },
  { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', day: 'Friday', clearingHoliday: true },
  { date: '2026-10-20', name: 'Dussehra (Vijay Dashami)', day: 'Tuesday', clearingHoliday: true },
  { date: '2026-11-08', name: 'Diwali (Laxmi Pujan - Muhurat Trading Only)', day: 'Sunday', clearingHoliday: false },
  { date: '2026-11-24', name: 'Guru Nanak Jayanti', day: 'Tuesday', clearingHoliday: true },
  { date: '2026-12-25', name: 'Christmas', day: 'Friday', clearingHoliday: true },
];

export const StockMarketHoursTracker: React.FC = () => {
  const [now, setNow] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'sessions' | 'holidays' | 'charges'>('sessions');

  // Brokerage / Turnover Estimator Inputs
  const [tradeType, setTradeType] = useState<'delivery' | 'intraday' | 'fn_options'>('delivery');
  const [turnoverAmount, setTurnoverAmount] = useState<number>(100000); // 1 Lakh
  const [brokeragePerOrder, setBrokeragePerOrder] = useState<number>(0); // Zero on delivery (Zerodha/Groww)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Market Status Logic
  const marketStatus = useMemo(() => {
    const dayOfWeek = now.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const currentTimeMin = now.getHours() * 60 + now.getMinutes();

    const preMarketStart = 9 * 60; // 09:00 AM
    const regularStart = 9 * 60 + 15; // 09:15 AM
    const regularEnd = 15 * 60 + 30; // 03:30 PM
    const postMarketEnd = 16 * 60; // 04:00 PM

    let status = 'CLOSED';
    let statusText = 'Market Closed';
    let badgeColor = 'bg-slate-500/10 text-slate-500 border-slate-500/20';

    if (isWeekend) {
      status = 'WEEKEND';
      statusText = 'Weekend (Closed)';
    } else if (currentTimeMin >= preMarketStart && currentTimeMin < regularStart) {
      status = 'PRE_OPEN';
      statusText = 'Pre-Open Session (09:00 - 09:15 AM)';
      badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    } else if (currentTimeMin >= regularStart && currentTimeMin < regularEnd) {
      status = 'OPEN';
      statusText = 'Live Normal Trading (09:15 AM - 03:30 PM)';
      badgeColor = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse';
    } else if (currentTimeMin >= regularEnd && currentTimeMin < postMarketEnd) {
      status = 'POST_CLOSE';
      statusText = 'Post-Closing Session (03:30 - 04:00 PM)';
      badgeColor = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }

    return {
      status,
      statusText,
      badgeColor,
      isWeekend,
      currentTimeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  }, [now]);

  // Statutory Charges Math
  const chargesMath = useMemo(() => {
    // STT (Securities Transaction Tax)
    let sttRate = 0.001; // 0.1% on delivery (both buy/sell or sell)
    if (tradeType === 'intraday') sttRate = 0.00025; // 0.025% on sell
    if (tradeType === 'fn_options') sttRate = 0.001; // 0.1% on premium

    const stt = turnoverAmount * sttRate;
    const exchangeTurnoverCharge = turnoverAmount * 0.0000345; // 0.00345% NSE
    const sebiCharges = (turnoverAmount / 10000000) * 10; // ₹10 per crore
    const stampDuty = tradeType === 'delivery' ? turnoverAmount * 0.00015 : turnoverAmount * 0.00003;
    const gst18 = (brokeragePerOrder + exchangeTurnoverCharge + sebiCharges) * 0.18;

    const totalStatutoryCharges = stt + exchangeTurnoverCharge + sebiCharges + stampDuty + gst18 + brokeragePerOrder;

    return {
      stt,
      exchangeTurnoverCharge,
      sebiCharges,
      stampDuty,
      gst18,
      totalStatutoryCharges,
      effectiveCostPercentage: turnoverAmount > 0 ? (totalStatutoryCharges / turnoverAmount) * 100 : 0,
    };
  }, [tradeType, turnoverAmount, brokeragePerOrder]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-emerald-500/20 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                NSE & BSE Indian Stock Market Hours & Holiday Calendar
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Live Trading Session Clock, Muhurat Trading, Settlement Holidays & Statutory Charges Calculator
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${marketStatus.badgeColor}`}>
              {marketStatus.statusText}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">IST: {marketStatus.currentTimeStr}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'sessions'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Market Sessions & Timings
        </button>
        <button
          onClick={() => setActiveTab('holidays')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'holidays'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Trading Holidays (2026-2027)
        </button>
        <button
          onClick={() => setActiveTab('charges')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'charges'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          STT & Turnover Charges
        </button>
      </div>

      {activeTab === 'sessions' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Session 1</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">Pre-Open Session</h3>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">09:00 AM - 09:15 AM</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              09:00-09:08 Order entry & cancellation; 09:08-09:12 Order matching & opening price discovery.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-emerald-500/30 shadow-sm">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Main Session
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">Normal Market (Equities & F&O)</h3>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              09:15 AM - 03:30 PM
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Continuous live order matching for NSE Nifty 50, BSE Sensex, Stocks, Futures & Options.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Session 3</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">Post-Market Closing</h3>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">03:40 PM - 04:00 PM</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Trade execution at the discovered closing price for retail and institutional investors.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">Commodity (MCX)</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1">Evening MCX Session</h3>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">05:00 PM - 11:30 PM</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Trading for Gold, Silver, Crude Oil, Natural Gas aligned with US NYMEX market hours.
            </p>
          </div>
        </div>
      ) : activeTab === 'holidays' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Official NSE / BSE Trading Holidays (2026)</h3>
            <span className="text-xs text-slate-500">13 Official Gazetted Holidays</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {NSE_HOLIDAYS_2026.map((h, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{h.name}</div>
                  <div className="text-xs text-slate-500">{h.day} • {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <span className="text-xs px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full font-semibold border border-rose-500/20">
                  Trading Closed
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Charges Estimator Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Trade Turnover Parameters</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Segment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'delivery', label: 'Equity Delivery (CNC)' },
                  { id: 'intraday', label: 'Equity Intraday (MIS)' },
                  { id: 'fn_options', label: 'F&O Options Premium' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTradeType(s.id as any)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      tradeType === s.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Total Turnover Value (Buy + Sell in ₹)
                </label>
                <span className="text-xs font-bold text-emerald-600">{formatINR(turnoverAmount)}</span>
              </div>
              <input
                type="number"
                min="1000"
                value={turnoverAmount}
                onChange={(e) => setTurnoverAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Statutory Charges Breakdown
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div>
              <div className="text-xs text-slate-400">Total Taxes & Regulatory Charges</div>
              <div className="text-3xl font-black text-rose-400 mt-1">
                {formatINR(Math.round(chargesMath.totalStatutoryCharges))}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Effective Cost: <strong className="text-white">{chargesMath.effectiveCostPercentage.toFixed(3)}%</strong> of Turnover
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>STT (Securities Transaction Tax):</span>
                <span className="font-semibold text-white">{formatINR(Math.round(chargesMath.stt))}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Exchange Turnover Charges:</span>
                <span className="font-semibold text-white">₹{chargesMath.exchangeTurnoverCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>SEBI Turnover Charges:</span>
                <span className="font-semibold text-white">₹{chargesMath.sebiCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Stamp Duty:</span>
                <span className="font-semibold text-white">₹{chargesMath.stampDuty.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>18% GST on Brokerage/Exchange:</span>
                <span className="font-semibold text-white">₹{chargesMath.gst18.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
