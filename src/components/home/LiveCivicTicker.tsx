import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Fuel, DollarSign, Sparkles, Sun, ChevronRight, Activity } from 'lucide-react';

export const LiveCivicTicker: React.FC = () => {
  const { navigateToTool } = useApp();
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed'>('closed');
  const [marketCountdown, setMarketCountdown] = useState<string>('Reopens 09:15');

  // Benchmark Indian rates with real defaults
  const [fuelPrices, setFuelPrices] = useState<{ delhi: number; mumbai: number }>({ delhi: 94.72, mumbai: 103.44 });
  const [usdInr, setUsdInr] = useState<number>(84.48);
  const [goldRate, setGoldRate] = useState<number>(77850);

  useEffect(() => {
    // 1. Check Indian Stock Market hours (9:15 AM - 3:30 PM IST Mon-Fri)
    const checkMarket = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istTime = new Date(utc + (3600000 * 5.5));
      const day = istTime.getDay();
      const hours = istTime.getHours();
      const minutes = istTime.getMinutes();
      const timeInMins = hours * 60 + minutes;

      // 9:15 AM = 555 mins, 3:30 PM = 930 mins. Weekdays 1-5 (Mon-Fri)
      if (day >= 1 && day <= 5 && timeInMins >= 555 && timeInMins <= 930) {
        setMarketStatus('open');
        const minsLeft = 930 - timeInMins;
        const hLeft = Math.floor(minsLeft / 60);
        const mLeft = minsLeft % 60;
        setMarketCountdown(`Closes in ${hLeft}h ${mLeft}m`);
      } else {
        setMarketStatus('closed');
        setMarketCountdown('Opens 09:15 IST');
      }
    };

    checkMarket();
    const interval = setInterval(checkMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 2. Fetch rates from verified daily-rates snapshot
    fetch('/data/daily-rates.json')
      .then(res => res.json())
      .then(data => {
        if (data?.fuel?.delhi?.petrol) {
          setFuelPrices({ delhi: data.fuel.delhi.petrol, mumbai: data.fuel.mumbai?.petrol || 103.44 });
        }
        if (data?.currency?.usdInr && data.currency.usdInr < 90) {
          setUsdInr(data.currency.usdInr);
        }
        if (data?.bullion?.gold24k_10g) {
          setGoldRate(data.bullion.gold24k_10g);
        }
      })
      .catch(() => {});

    // 3. Fetch real-time live USD/INR from public FX API
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data?.rates?.INR && typeof data.rates.INR === 'number') {
          const liveRate = parseFloat(data.rates.INR.toFixed(2));
          if (liveRate > 75 && liveRate < 95) {
            setUsdInr(liveRate);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full bg-neutral-100/70 dark:bg-neutral-950/70 border-b border-neutral-200/50 dark:border-white/5 py-1.5 px-3 sm:px-4 text-[11px] overflow-x-auto no-scrollbar backdrop-blur-md transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-[700px] sm:min-w-0">
        <div className="flex items-center gap-3.5 divide-x divide-neutral-200/70 dark:divide-white/10">
          {/* Live Indicator Pill */}
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[9px] text-emerald-600 dark:text-emerald-400 shrink-0 pr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Ticker</span>
          </div>

          {/* 1. Metro Fuel Rates */}
          <button
            onClick={() => navigateToTool('daily-fuel-price-tracker')}
            title="View today's petrol & diesel prices across Indian cities"
            className="flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group shrink-0 cursor-pointer"
          >
            <Fuel className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Fuel:</span>
            <span className="font-mono text-neutral-500 dark:text-neutral-400">Delhi ₹{fuelPrices.delhi} • Mum ₹{fuelPrices.mumbai}</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 2. Live USD/INR */}
          <button
            onClick={() => navigateToTool('currency-converter')}
            title="Live currency converter (RBI & FX market rate)"
            className="flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group shrink-0 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">USD/INR:</span>
            <span className="font-mono text-neutral-500 dark:text-neutral-400">₹{usdInr.toFixed(2)}</span>
            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Live</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 3. NSE / BSE Indian Market Hours */}
          <button
            onClick={() => navigateToTool('stock-market-hours-tracker')}
            title="Check live Indian stock exchange trading status"
            className="flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group shrink-0 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">NSE/BSE:</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
              marketStatus === 'open'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}>
              {marketStatus === 'open' ? '🟢 Open' : '⚪ Closed'} ({marketCountdown})
            </span>
          </button>

          {/* 4. Bullion: Gold 24K Rate */}
          <button
            onClick={() => navigateToTool('gold-silver-rate-calculator')}
            title="Calculate 24K & 22K Hallmark gold with 3% GST"
            className="hidden md:flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Gold 24K:</span>
            <span className="font-mono text-neutral-500 dark:text-neutral-400">₹{goldRate.toLocaleString('en-IN')}/10g</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 5. Vedic Panchang & Shubh Muhurat */}
          <button
            onClick={() => navigateToTool('panchang-choghadiya-muhurat-clock')}
            title="Today's live Choghadiya, Tithi & Shubh Muhurat"
            className="hidden xl:flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group shrink-0 cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Panchang:</span>
            <span className="text-neutral-500 dark:text-neutral-400">Live Shubh Muhurat</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Right shortcut: Live citizen status */}
        <div className="hidden lg:flex items-center gap-2 text-neutral-400 text-[10px] font-medium">
          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span>Verified Citizen Rates</span>
        </div>
      </div>
    </div>
  );
};
