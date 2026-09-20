import React, { useState, useEffect } from 'react';
import { RefreshCw, ArrowRightLeft, TrendingUp, DollarSign, Copy, Check, Sparkles, Building, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RatesResponse {
  result: string;
  time_last_update_utc: string;
  rates: Record<string, number>;
}

const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'AU$', flag: '🇦🇺' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', flag: '🇰🇼' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
];

export const CurrencyConverterSuite: React.FC = () => {
  const { showToast } = useApp();
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [bankSpread, setBankSpread] = useState<number>(1.5); // 1.5% typical forex markup

  // Fetch Live Rates with fallback cache
  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!res.ok) throw new Error('Network error fetching rates');
      const data: RatesResponse = await res.json();
      if (data.rates) {
        setRates(data.rates);
        setLastUpdated(data.time_last_update_utc || new Date().toUTCString());
        localStorage.setItem('bu_fx_rates_cache', JSON.stringify({
          rates: data.rates,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      // Fallback cache or default approximation
      const cached = localStorage.getItem('bu_fx_rates_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setRates(parsed.rates);
        setLastUpdated('Cached / Offline');
      } else {
        // Safe offline baseline
        setRates({
          USD: 1,
          INR: 87.25,
          EUR: 0.95,
          GBP: 0.81,
          AED: 3.67,
          SAR: 3.75,
          CAD: 1.41,
          AUD: 1.58,
          SGD: 1.34,
          JPY: 153.5,
          QAR: 3.64,
          KWD: 0.31,
          MYR: 4.45
        });
        setLastUpdated('Offline Baseline');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  // Calculate conversion
  const getRate = (from: string, to: string) => {
    if (!rates[from] || !rates[to]) return 1;
    const inUsd = 1 / rates[from];
    return inUsd * rates[to];
  };

  const currentRate = getRate(fromCurrency, toCurrency);
  const convertedValue = amount * currentRate;

  // Remittance estimation (Deducting bank forex spread)
  const bankFee = (convertedValue * bankSpread) / 100;
  const netInHand = convertedValue - bankFee;

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${amount} ${fromCurrency} = ₹${convertedValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${toCurrency} (Rate: 1 ${fromCurrency} = ${currentRate.toFixed(4)} ${toCurrency}) via BharatUtility`
    );
    setCopied(true);
    showToast('Currency conversion copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main Converter Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Real-Time Open Exchange Rates</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Live Currency Converter & Remittance Calculator
            </h2>
          </div>
          <button
            onClick={fetchRates}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-accent font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent' : ''}`} />
            <span>Refresh Rates</span>
          </button>
        </div>

        {/* Input & Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Amount & From */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
              You Send / Convert
            </label>
            <div className="flex rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 focus-within:border-accent overflow-hidden bg-neutral-50 dark:bg-neutral-800/50">
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                min="0"
                step="any"
                value={amount}
                onChange={e => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-4 py-3.5 bg-transparent text-lg sm:text-xl font-bold font-mono text-neutral-900 dark:text-white outline-none"
                placeholder="Enter amount..."
              />
              <select
                value={fromCurrency}
                onChange={e => setFromCurrency(e.target.value)}
                className="px-3 bg-neutral-200/80 dark:bg-neutral-700 font-bold text-sm sm:text-base text-neutral-800 dark:text-neutral-200 border-l border-neutral-300 dark:border-neutral-600 outline-none cursor-pointer"
              >
                <option value="INR">🇮🇳 INR - Indian Rupee</option>
                {COMMON_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-2 md:pt-6">
            <button
              onClick={handleSwap}
              className="p-3 rounded-2xl bg-accent-subtle text-accent hover:bg-accent hover:text-white transition-all hover:scale-110 active:scale-95 shadow-xs cursor-pointer"
              title="Swap Currencies"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Result & To */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
              Converted Total
            </label>
            <div className="flex rounded-2xl border-2 border-accent/40 bg-accent/5 overflow-hidden">
              <div className="w-full px-4 py-3.5 text-lg sm:text-xl font-extrabold font-mono text-accent truncate flex items-center">
                {convertedValue.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}
              </div>
              <select
                value={toCurrency}
                onChange={e => setToCurrency(e.target.value)}
                className="px-3 bg-accent/10 font-bold text-sm sm:text-base text-accent border-l border-accent/20 outline-none cursor-pointer"
              >
                <option value="INR">🇮🇳 INR - Indian Rupee</option>
                {COMMON_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Mid-Market Exchange Rate Banner */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-bold text-neutral-800 dark:text-neutral-200">
              1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500 dark:text-neutral-400">
              1 {toCurrency} = {(1 / (currentRate || 1)).toFixed(4)} {fromCurrency}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400">
              Rates updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-IN') : 'Live'}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:text-accent transition-colors"
              title="Copy result"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-neutral-500" />}
            </button>
          </div>
        </div>

        {/* NRI / Freelancer Remittance & Bank Forex Markup Section */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/60 dark:border-indigo-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                NRI & Freelancer In-Hand Remittance Estimator
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Bank Markup: {bankSpread}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-semibold uppercase">Mid-Market Value</span>
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {toCurrency === 'INR' ? '₹' : ''}{convertedValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] text-rose-500 font-semibold uppercase">Est. Bank Spread & GST ({bankSpread}%)</span>
              <p className="text-sm font-bold text-rose-500 mt-0.5">
                -{toCurrency === 'INR' ? '₹' : ''}{bankFee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-500/30 bg-emerald-50/10">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Estimated Net In-Hand</span>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {toCurrency === 'INR' ? '₹' : ''}{netInHand.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Reference Conversion Table (INR against Top Global Currencies) */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Today's Currency Rates Against Indian Rupee (₹ INR)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {COMMON_CURRENCIES.slice(0, 8).map(c => {
              const rateToInr = getRate(c.code, 'INR');
              return (
                <div
                  key={c.code}
                  onClick={() => {
                    setFromCurrency(c.code);
                    setToCurrency('INR');
                  }}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 hover:border-accent cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.flag}</span>
                    <div>
                      <span className="text-xs font-bold text-neutral-900 dark:text-white block">1 {c.code}</span>
                      <span className="text-[10px] text-neutral-400">{c.name}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-accent font-mono">
                    ₹{rateToInr.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
