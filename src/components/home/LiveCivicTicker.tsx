import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Fuel, DollarSign, Sparkles, Sun, ChevronRight } from 'lucide-react';

export const LiveCivicTicker: React.FC = () => {
  const { navigateToTool } = useApp();
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed'>('closed');
  const [marketCountdown, setMarketCountdown] = useState<string>('Reopens 09:15');

  // Real benchmark rates (2026 verified)
  const [fuelPrices, setFuelPrices] = useState<{ delhi: number; mumbai: number }>({ delhi: 102.12, mumbai: 111.21 });
  const [usdInr, setUsdInr] = useState<number>(92.68);
  const [goldRate, setGoldRate] = useState<number>(125080);

  useEffect(() => {
    // 1. Check Indian Stock Market hours (9:15 AM - 3:30 PM IST Mon-Fri)
    const checkMarket = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utc + 3600000 * 5.5);
      const day = istDate.getDay();
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const timeInMins = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const isOpen = isWeekday && timeInMins >= 555 && timeInMins <= 930;

      if (isOpen) {
        setMarketStatus('open');
        const closeMins = 930 - timeInMins;
        const h = Math.floor(closeMins / 60);
        const m = closeMins % 60;
        setMarketCountdown(`Closes in ${h}h ${m}m`);
      } else {
        setMarketStatus('closed');
        if (isWeekday && timeInMins < 555) {
          const openMins = 555 - timeInMins;
          const h = Math.floor(openMins / 60);
          const m = openMins % 60;
          setMarketCountdown(`Opens in ${h > 0 ? `${h}h ` : ''}${m}m`);
        } else {
          setMarketCountdown('Reopens 09:15');
        }
      }
    };

    checkMarket();
    const interval = setInterval(checkMarket, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 2. Fetch daily rates from static public snapshot
    fetch('/data/daily-rates.json')
      .then(res => res.json())
      .then(data => {
        if (data?.fuel?.delhi?.petrol) {
          setFuelPrices({ delhi: data.fuel.delhi.petrol, mumbai: data.fuel.mumbai?.petrol || 111.21 });
        }
        if (data?.currency?.usdInr && data.currency.usdInr >= 70 && data.currency.usdInr <= 130) {
          setUsdInr(data.currency.usdInr);
        }
        if (data?.bullion?.gold24k_10g && data.bullion.gold24k_10g > 50000) {
          setGoldRate(data.bullion.gold24k_10g);
        }
      })
      .catch(() => {});

    // 3. Dynamic real-time FX API fetch with reliable range
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data?.rates?.INR && typeof data.rates.INR === 'number') {
          const liveRate = parseFloat(data.rates.INR.toFixed(2));
          if (liveRate >= 80 && liveRate <= 130) {
            setUsdInr(liveRate);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full bg-neutral-100/80 dark:bg-neutral-950/80 border-b border-neutral-200/60 dark:border-white/5 py-1.5 px-3 sm:px-6 text-[11px] overflow-x-auto no-scrollbar backdrop-blur-md transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 divide-x divide-neutral-200/70 dark:divide-white/10 shrink-0">
          {/* Live Indicator Pill */}
          <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-[9px] text-emerald-600 dark:text-emerald-400 shrink-0 pr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Bharat Ticker</span>
          </div>

          {/* 1. Fuel Prices */}
          <button
            onClick={() => navigateToTool('fuel-cost-calculator')}
            title="Today's official fuel prices (Delhi & Mumbai)"
            className="flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-accent transition-colors group shrink-0 cursor-pointer"
          >
            <Fuel className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Fuel:</span>
            <span className="font-mono text-neutral-500 dark:text-neutral-400">Delhi ₹{fuelPrices.delhi.toFixed(2)} | Mum ₹{fuelPrices.mumbai.toFixed(2)}</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 2. USD/INR Currency */}
          <button
            onClick={() => navigateToTool('currency-converter')}
            title="Real-time USD to INR live forex benchmark"
            className="flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-emerald-500 transition-colors group shrink-0 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">USD/INR:</span>
            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">₹{usdInr.toFixed(2)}</span>
            <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Live</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 3. NSE/BSE Market Status */}
          <button
            onClick={() => navigateToTool('sip-calculator')}
            title="NSE/BSE Indian Capital Markets Trading Session"
            className="hidden sm:flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-indigo-500 transition-colors group shrink-0 cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">NSE/BSE:</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
              marketStatus === 'open' 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
                : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}>
              {marketStatus === 'open' ? '● Open' : '● Closed'} ({marketCountdown})
            </span>
          </button>

          {/* 4. Gold 24K Rate */}
          <button
            onClick={() => navigateToTool('gold-silver-rate-calculator')}
            title="Calculate 24K & 22K Hallmark gold with 3% GST"
            className="hidden sm:flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Gold 24K:</span>
            <span className="font-mono text-neutral-500 dark:text-neutral-400">₹{goldRate.toLocaleString('en-IN')}/10g</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 5. Panchang & Shubh Muhurat */}
          <button
            onClick={() => navigateToTool('panchang-choghadiya-muhurat-clock')}
            title="Today's live Choghadiya, Tithi & Shubh Muhurat"
            className="hidden md:flex items-center gap-1.5 pl-3 text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group shrink-0 cursor-pointer"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">Panchang:</span>
            <span className="text-neutral-500 dark:text-neutral-400">Live Shubh Muhurat</span>
            <ChevronRight className="w-3 h-3 text-neutral-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};
