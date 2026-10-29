/**
 * Real-Time AMFI Mutual Fund API Service
 * Fetches live NAV, scheme search, and calculates 1Y/3Y/5Y CAGR returns
 * Official AMFI dataset via keyless, free mfapi.in edge API
 */

export interface MfSchemeSearchItem {
  schemeCode: number;
  schemeName: string;
}

export interface MfNavPoint {
  date: string; // DD-MM-YYYY
  nav: string;
}

export interface MfSchemeDetails {
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  category: string;
  schemeType: string;
  latestNav: number;
  navDate: string;
  cagr1y?: number | null;
  cagr3y?: number | null;
  cagr5y?: number | null;
}

// Popular starter schemes for instant zero-latency loading
export const POPULAR_STARTER_SCHEMES: MfSchemeSearchItem[] = [
  { schemeCode: 122639, schemeName: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth' },
  { schemeCode: 120503, schemeName: 'SBI Bluechip Fund - Direct Plan - Growth' },
  { schemeCode: 118989, schemeName: 'HDFC Small Cap Fund - Direct Plan - Growth' },
  { schemeCode: 120586, schemeName: 'Nippon India Small Cap Fund - Direct Plan - Growth' },
  { schemeCode: 120716, schemeName: 'Mirae Asset Large Cap Fund - Direct Plan - Growth' },
  { schemeCode: 147481, schemeName: 'Parag Parikh ELSS Tax Saver Fund - Direct Plan - Growth' },
  { schemeCode: 120828, schemeName: 'Quant Active Fund - Direct Plan - Growth' },
  { schemeCode: 119551, schemeName: 'ICICI Prudential Bluechip Fund - Direct Plan - Growth' },
];

const mfSearchMemoryCache = new Map<string, MfSchemeSearchItem[]>();
const mfDetailMemoryCache = new Map<number, MfSchemeDetails>();

/**
 * Search mutual fund schemes by text (e.g. "Parag Parikh", "Nifty 50", "SBI Small Cap")
 */
export async function searchMutualFunds(query: string): Promise<MfSchemeSearchItem[]> {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 2) {
    return POPULAR_STARTER_SCHEMES;
  }

  if (mfSearchMemoryCache.has(clean)) {
    return mfSearchMemoryCache.get(clean)!;
  }

  try {
    const res = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(clean)}`);
    if (!res.ok) throw new Error('Search failed');
    const data: MfSchemeSearchItem[] = await res.json();
    const results = Array.isArray(data) ? data.slice(0, 20) : [];
    mfSearchMemoryCache.set(clean, results);
    return results;
  } catch (err) {
    console.warn('MF search fallback:', err);
    return POPULAR_STARTER_SCHEMES.filter(s => s.schemeName.toLowerCase().includes(clean));
  }
}

/**
 * Parse DD-MM-YYYY to Date
 */
function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

/**
 * Fetch scheme metadata, latest NAV, and compute 1Y, 3Y, 5Y CAGR returns
 */
export async function fetchSchemeDetails(schemeCode: number): Promise<MfSchemeDetails | null> {
  if (!schemeCode) return null;

  if (mfDetailMemoryCache.has(schemeCode)) {
    return mfDetailMemoryCache.get(schemeCode)!;
  }

  // Check localStorage
  const cacheKey = `bu_mf_${schemeCode}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Cache valid for 6 hours
      if (Date.now() - (parsed._ts || 0) < 6 * 3600 * 1000) {
        delete parsed._ts;
        mfDetailMemoryCache.set(schemeCode, parsed);
        return parsed;
      }
    }
  } catch {
    // Ignore cache error
  }

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!res.ok) throw new Error('Scheme fetch failed');
    const json = await res.json();

    if (!json?.meta || !Array.isArray(json?.data) || json.data.length === 0) {
      return null;
    }

    const navPoints: MfNavPoint[] = json.data;
    const latestEntry = navPoints[0];
    const latestNav = parseFloat(latestEntry.nav);
    const latestDate = parseDate(latestEntry.date);

    // Calculate CAGR for 1Y, 3Y, 5Y
    const calculateCagr = (years: number): number | null => {
      const targetTime = latestDate.getTime() - years * 365.25 * 24 * 3600 * 1000;
      // Find point closest to targetTime
      let closestPoint: MfNavPoint | null = null;
      let minDiff = Infinity;

      for (const p of navPoints) {
        const pTime = parseDate(p.date).getTime();
        const diff = Math.abs(pTime - targetTime);
        if (diff < minDiff && diff < 30 * 24 * 3600 * 1000) { // within 30 days
          minDiff = diff;
          closestPoint = p;
        }
      }

      if (closestPoint) {
        const oldNav = parseFloat(closestPoint.nav);
        if (oldNav > 0 && latestNav > 0) {
          const cagr = (Math.pow(latestNav / oldNav, 1 / years) - 1) * 100;
          return Math.round(cagr * 10) / 10;
        }
      }
      return null;
    };

    const details: MfSchemeDetails = {
      schemeCode,
      schemeName: json.meta.scheme_name || 'Mutual Fund Scheme',
      fundHouse: json.meta.fund_house || 'Asset Management Co.',
      category: json.meta.scheme_category || 'Mutual Fund',
      schemeType: json.meta.scheme_type || 'Open Ended',
      latestNav,
      navDate: latestEntry.date,
      cagr1y: calculateCagr(1),
      cagr3y: calculateCagr(3),
      cagr5y: calculateCagr(5),
    };

    mfDetailMemoryCache.set(schemeCode, details);

    try {
      localStorage.setItem(cacheKey, JSON.stringify({ ...details, _ts: Date.now() }));
    } catch {
      // Ignore quota error
    }

    return details;
  } catch (err) {
    console.warn(`Failed to fetch scheme ${schemeCode}:`, err);
    return null;
  }
}
