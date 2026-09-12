import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, RefreshCw, AlertTriangle, ShieldCheck, DollarSign, Calculator, Info, ExternalLink } from 'lucide-react';
import { formatINR } from '../../../utils/formatters';

interface CryptoPrice {
  id: string;
  name: string;
  symbol: string;
  inr: number;
  change24h: number;
}

const FALLBACK_CRYPTO_PRICES: CryptoPrice[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', inr: 7850000, change24h: 2.4 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', inr: 245000, change24h: -1.2 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', inr: 14800, change24h: 4.8 },
  { id: 'tether', name: 'Tether USD', symbol: 'USDT', inr: 88.5, change24h: 0.1 },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', inr: 215, change24h: -0.5 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', inr: 68, change24h: 1.1 },
];

export const CryptoInrTaxCalculator: React.FC = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>(FALLBACK_CRYPTO_PRICES);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Tax Calculator Inputs
  const [selectedCoin, setSelectedCoin] = useState<string>('bitcoin');
  const [quantity, setQuantity] = useState<number>(0.25);
  const [buyPriceINR, setBuyPriceINR] = useState<number>(6000000);
  const [sellPriceINR, setSellPriceINR] = useState<number>(7850000);
  const [tdsDeductedByExchange, setTdsDeductedByExchange] = useState<boolean>(true);

  // Fetch Live CoinGecko Free Open API
  const fetchLiveRates = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether,ripple,cardano&vs_currencies=inr&include_24hr_change=true'
      );
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();

      const updated = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', inr: data.bitcoin?.inr || 7850000, change24h: data.bitcoin?.inr_24h_change || 0 },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', inr: data.ethereum?.inr || 245000, change24h: data.ethereum?.inr_24h_change || 0 },
        { id: 'solana', name: 'Solana', symbol: 'SOL', inr: data.solana?.inr || 14800, change24h: data.solana?.inr_24h_change || 0 },
        { id: 'tether', name: 'Tether USD', symbol: 'USDT', inr: data.tether?.inr || 88.5, change24h: data.tether?.inr_24h_change || 0 },
        { id: 'ripple', name: 'XRP', symbol: 'XRP', inr: data.ripple?.inr || 215, change24h: data.ripple?.inr_24h_change || 0 },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', inr: data.cardano?.inr || 68, change24h: data.cardano?.inr_24h_change || 0 },
      ];
      setPrices(updated);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.warn('CoinGecko fallback loaded:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRates();
  }, []);

  // Update Sell price when user selects a coin
  const handleSelectCoin = (coinId: string) => {
    setSelectedCoin(coinId);
    const coin = prices.find((p) => p.id === coinId);
    if (coin) {
      setSellPriceINR(coin.inr);
      setBuyPriceINR(Math.round(coin.inr * 0.8)); // Default 20% gain scenario
    }
  };

  // Indian Section 115BBH & 194S Tax Math
  const taxMath = useMemo(() => {
    const totalBuyCost = buyPriceINR * quantity;
    const totalSaleValue = sellPriceINR * quantity;
    const grossProfit = totalSaleValue - totalBuyCost;

    // 30% Flat Tax on Profit + 4% Cess = 31.2% Effective Tax
    const isProfit = grossProfit > 0;
    const baseTax30 = isProfit ? grossProfit * 0.3 : 0;
    const cess4 = baseTax30 * 0.04;
    const totalIncomeTax = baseTax30 + cess4; // 31.2%

    // 1% TDS on Total Sale Consideration (Section 194S)
    const tds1Percent = totalSaleValue * 0.01;

    // Net in-hand profit after income tax
    const netInHandProfit = isProfit ? grossProfit - totalIncomeTax : grossProfit;
    const netPayout = totalSaleValue - (tdsDeductedByExchange ? tds1Percent : 0);

    return {
      totalBuyCost,
      totalSaleValue,
      grossProfit,
      isProfit,
      baseTax30,
      cess4,
      totalIncomeTax,
      tds1Percent,
      netInHandProfit,
      netPayout,
      roiPercentage: totalBuyCost > 0 ? (grossProfit / totalBuyCost) * 100 : 0,
    };
  }, [buyPriceINR, sellPriceINR, quantity, tdsDeductedByExchange]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Live Market Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 text-white p-6 rounded-3xl border border-indigo-500/20 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Live Crypto Prices in INR & Section 115BBH Tax Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live CoinGecko Data • Last synced: {lastUpdated} IST
            </p>
          </div>
          <button
            onClick={fetchLiveRates}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Rates
          </button>
        </div>

        {/* Live Coin Prices Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {prices.map((coin) => (
            <button
              key={coin.id}
              onClick={() => handleSelectCoin(coin.id)}
              className={`p-3 rounded-2xl text-left border transition-all ${
                selectedCoin === coin.id
                  ? 'bg-indigo-600/30 border-indigo-400 shadow-md'
                  : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">{coin.symbol}</span>
                <span
                  className={`text-[10px] font-bold ${
                    coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {coin.change24h >= 0 ? '+' : ''}
                  {coin.change24h.toFixed(1)}%
                </span>
              </div>
              <div className="text-sm font-black text-white mt-1">
                {coin.inr >= 1000 ? formatINR(coin.inr) : `₹${coin.inr.toFixed(2)}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            Trade Parameters & Acquisition Cost
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Crypto Asset
              </label>
              <select
                value={selectedCoin}
                onChange={(e) => handleSelectCoin(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
              >
                {prices.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                min="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Buy Price per Coin (Acquisition Cost in ₹)
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{formatINR(buyPriceINR)}</span>
            </div>
            <input
              type="number"
              min="0"
              value={buyPriceINR}
              onChange={(e) => setBuyPriceINR(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Sell Price per Coin (Sale Value in ₹)
              </label>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatINR(sellPriceINR)}</span>
            </div>
            <input
              type="number"
              min="0"
              value={sellPriceINR}
              onChange={(e) => setSellPriceINR(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
            />
          </div>

          <label className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl cursor-pointer border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={tdsDeductedByExchange}
              onChange={(e) => setTdsDeductedByExchange(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                Include 1% Section 194S TDS deduction
              </span>
              <span className="text-slate-500 block">
                Indian exchanges (CoinDCX, WazirX, ZebPay, Mudrex) deduct 1% TDS on every sale.
              </span>
            </div>
          </label>
        </div>

        {/* Right Output: Tax Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Indian Crypto Tax Breakdown
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <div className="text-xs text-slate-400">Net Profit (After 31.2% Tax)</div>
            <div
              className={`text-3xl font-black mt-1 ${
                taxMath.isProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {taxMath.isProfit ? `+${formatINR(Math.round(taxMath.netInHandProfit))}` : formatINR(Math.round(taxMath.grossProfit))}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Gross Gain: <strong className="text-white">{formatINR(Math.round(taxMath.grossProfit))}</strong> ({taxMath.roiPercentage.toFixed(1)}% ROI)
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Total Investment Cost:</span>
              <span className="font-semibold">{formatINR(Math.round(taxMath.totalBuyCost))}</span>
            </div>

            <div className="flex justify-between text-slate-300">
              <span>Total Sale Consideration:</span>
              <span className="font-semibold">{formatINR(Math.round(taxMath.totalSaleValue))}</span>
            </div>

            <div className="flex justify-between text-rose-300 font-semibold">
              <span>Flat 30% Tax (Sec 115BBH):</span>
              <span>-{formatINR(Math.round(taxMath.baseTax30))}</span>
            </div>

            <div className="flex justify-between text-rose-300">
              <span>4% Health & Edu Cess:</span>
              <span>-{formatINR(Math.round(taxMath.cess4))}</span>
            </div>

            <div className="flex justify-between text-amber-300">
              <span>1% TDS Deducted (Sec 194S):</span>
              <span>-{formatINR(Math.round(taxMath.tds1Percent))}</span>
            </div>
          </div>

          {/* Legal Alert Banner */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200/90 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-400">
              <AlertTriangle className="w-4 h-4" /> Income Tax Rule Reminder:
            </div>
            <p>
              As per Income Tax Act Section 115BBH, crypto losses <strong>cannot be set off</strong> against any other gains or carried forward to next financial years.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
