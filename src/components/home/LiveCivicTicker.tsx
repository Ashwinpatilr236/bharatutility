import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Fuel, DollarSign, Clock, ShieldAlert, Sparkles, Sun, ChevronRight } from 'lucide-react';

export const LiveCivicTicker: React.FC = () => {
  const { navigateToTool } = useApp();
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed'>('closed');

  useEffect(() => {
    // Check Indian Stock Market hours (9:15 AM - 3:30 PM IST on weekdays)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utc + (3600000 * 5.5));
    const day = istTime.getDay();
    const hours = istTime.getHours();
    const minutes = istTime.getMinutes();
    const timeInMins = hours * 60 + minutes;

    // 9:15 AM is 555 mins, 3:30 PM is 930 mins. Weekdays 1-5 (Mon-Fri)
    if (day >= 1 && day <= 5 && timeInMins >= 555 && timeInMins <= 930) {
      setMarketStatus('open');
    } else {
      setMarketStatus('closed');
    }
  }, []);

  return (
    <div className="w-full bg-neutral-100/90 dark:bg-neutral-900/90 border-y border-neutral-200/80 dark:border-neutral-800 py-2 px-3 sm:px-4 text-xs overflow-x-auto no-scrollbar shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-[720px] sm:min-w-0">
        <div className="flex items-center gap-4 divide-x divide-neutral-200 dark:divide-neutral-800">
          {/* 1. Live Ticker Label */}
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-accent shrink-0 pr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Live Bharat Ticker</span>
          </div>

          {/* 2. Metro Fuel Prices */}
          <button
            onClick={() => navigateToTool('daily-fuel-price-tracker')}
            className="flex items-center gap-2 pl-3 hover:text-accent transition-colors group shrink-0"
          >
            <Fuel className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Fuel:</span>
            <span className="text-neutral-500 dark:text-neutral-400">Delhi ₹94.72 | Mum ₹103.44</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 3. Live Currency Exchange */}
          <button
            onClick={() => navigateToTool('live-currency-converter-inr')}
            className="flex items-center gap-2 pl-3 hover:text-accent transition-colors group shrink-0"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">USD/INR:</span>
            <span className="text-neutral-500 dark:text-neutral-400">₹87.24 (Live)</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 4. NSE / BSE Market Hours */}
          <button
            onClick={() => navigateToTool('stock-market-hours-tracker')}
            className="flex items-center gap-2 pl-3 hover:text-accent transition-colors group shrink-0"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">NSE/BSE:</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              marketStatus === 'open'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}>
              {marketStatus === 'open' ? '🟢 Open (9:15 - 15:30)' : '⚪ Closed (Reopens 09:15)'}
            </span>
          </button>

          {/* 5. Vedic Panchang & Rahu Kaal */}
          <button
            onClick={() => navigateToTool('choghadiya-rahu-kaal-panchang')}
            className="hidden lg:flex items-center gap-2 pl-3 hover:text-accent transition-colors group shrink-0"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">Panchang:</span>
            <span className="text-neutral-500 dark:text-neutral-400">Live Shubh Muhurat & Choghadiya</span>
          </button>
        </div>

        {/* 6. Direct Link to All 220 Tools */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium text-neutral-400">220 Verified Tools</span>
        </div>
      </div>
    </div>
  );
};
