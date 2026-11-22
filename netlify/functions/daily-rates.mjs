import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://nyqjcfutsqgxpnisvggv.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_QisWrr_KQ1e88SxD__QcXw_uewssBzn';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

const getTodayIST = () => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

async function fetchFuelPrice(url, fallbackRate) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return fallbackRate;
    const html = await res.text();
    const ndtvMatch = html.match(/Today's .*? Price is ([0-9.]+) rupee/i);
    if (ndtvMatch && ndtvMatch[1]) {
      const val = parseFloat(ndtvMatch[1]);
      if (val > 80 && val < 150) return val;
    }
    const priceMatch = html.match(/(?:Rs\.?|₹)\s*([0-9]{2,3}\.[0-9]{2})/i);
    if (priceMatch && priceMatch[1]) {
      const val = parseFloat(priceMatch[1]);
      if (val > 80 && val < 150) return val;
    }
    return fallbackRate;
  } catch {
    return fallbackRate;
  }
}

async function fetchUsdInr() {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (res.ok) {
      const d = await res.json();
      if (d?.rates?.INR && typeof d.rates.INR === 'number' && d.rates.INR >= 70 && d.rates.INR <= 130) {
        return parseFloat(d.rates.INR.toFixed(2));
      }
    }
  } catch {}

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const d = await res.json();
      if (d?.rates?.INR && typeof d.rates.INR === 'number' && d.rates.INR >= 70 && d.rates.INR <= 130) {
        return parseFloat(d.rates.INR.toFixed(2));
      }
    }
  } catch {}

  return 92.68;
}

async function fetchGoldSilver() {
  try {
    const res = await fetch('https://www.goodreturns.in/gold-rates/', { headers: HEADERS });
    if (res.ok) {
      const html = await res.text();
      const gramMatch = html.match(/(?:Rs\.?|₹)\s*([1-2][0-9],[0-9]{3})/i);
      if (gramMatch && gramMatch[1]) {
        const perGram = parseInt(gramMatch[1].replace(/[^0-9]/g, ''), 10);
        if (perGram >= 10000 && perGram <= 20000) {
          return { gold24k: perGram * 10, silver1kg: 98500 };
        }
      }
    }
  } catch {}
  return { gold24k: 125400, silver1kg: 98500 };
}

export const handler = async (event, context) => {
  const todayIST = getTodayIST();
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // 1. Check Central Database (Supabase site_config: id = 'daily_rates')
    const { data: configData } = await supabase
      .from('site_config')
      .select('config_json, updated_at')
      .eq('id', 'daily_rates')
      .maybeSingle();

    if (configData?.config_json && configData.config_json.date === todayIST) {
      // Data is ALREADY fresh for today! Return immediately from Central Cache.
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          source: 'central_cache',
          date: todayIST,
          rates: configData.config_json
        })
      };
    }

    // 2. If NOT updated today (i.e. FIRST VISITOR of the day, or after 15 days of inactivity):
    // Refresh live benchmark rates in the backend Node.js environment
    const delhiPetrol = await fetchFuelPrice('https://www.ndtv.com/fuel-prices/petrol-price-in-new-delhi-city', 102.12);
    const delhiDiesel = await fetchFuelPrice('https://www.ndtv.com/fuel-prices/diesel-price-in-new-delhi-city', 95.20);
    const mumbaiPetrol = await fetchFuelPrice('https://www.goodreturns.in/petrol-price-in-mumbai.html', 111.21);
    const mumbaiDiesel = 97.80;
    const usdInr = await fetchUsdInr();
    const { gold24k, silver1kg } = await fetchGoldSilver();

    const freshRates = {
      date: todayIST,
      lastUpdated: new Date().toISOString(),
      fuel: {
        delhi: { petrol: delhiPetrol, diesel: delhiDiesel, cng: 79.5 },
        mumbai: { petrol: mumbaiPetrol, diesel: mumbaiDiesel }
      },
      currency: {
        usdInr: usdInr
      },
      bullion: {
        gold24k_10g: gold24k,
        silver_1kg: silver1kg
      }
    };

    // 3. Save into Supabase site_config so the rest of today's visitors (10 to 10,000 users) reuse this record!
    await supabase.from('site_config').upsert({
      id: 'daily_rates',
      config_json: freshRates,
      updated_at: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        source: 'backend_refreshed',
        date: todayIST,
        rates: freshRates
      })
    };
  } catch (err) {
    // Graceful fallback to static verified benchmark if anything fails
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        source: 'static_fallback',
        date: todayIST,
        rates: {
          date: todayIST,
          fuel: { delhi: { petrol: 102.12, diesel: 95.20 }, mumbai: { petrol: 111.21, diesel: 97.80 } },
          currency: { usdInr: 92.68 },
          bullion: { gold24k_10g: 125080, silver_1kg: 98500 }
        }
      })
    };
  }
};
