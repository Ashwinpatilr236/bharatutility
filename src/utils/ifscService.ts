/**
 * Real-Time Bank IFSC & Branch Lookup Service
 * Uses official Razorpay Open IFSC edge API (keyless, free, CORS-enabled)
 */

export interface IfscBankDetails {
  BANK: string;
  BANKCODE: string;
  IFSC: string;
  BRANCH: string;
  ADDRESS: string;
  CONTACT: string;
  CITY: string;
  DISTRICT: string;
  STATE: string;
  MICR?: string;
  RTGS?: boolean;
  NEFT?: boolean;
  IMPS?: boolean;
  UPI?: boolean;
  SWIFT?: string;
  ISO3166?: string;
}

// In-memory cache to prevent redundant network calls
const ifscMemoryCache = new Map<string, IfscBankDetails>();

export function isValidIfscFormat(code: string): boolean {
  if (!code) return false;
  const clean = code.trim().toUpperCase();
  // Standard RBI IFSC Format: 4 letters (Bank), 0 (Reserved), 6 alphanumeric (Branch)
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean);
}

/**
 * Fetch real-time bank branch details by IFSC code
 */
export async function fetchIfscDetails(code: string): Promise<IfscBankDetails | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!isValidIfscFormat(cleanCode)) {
    return null;
  }

  // Check in-memory cache first
  if (ifscMemoryCache.has(cleanCode)) {
    return ifscMemoryCache.get(cleanCode)!;
  }

  // Check localStorage cache
  const cacheKey = `bu_ifsc_${cleanCode}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: IfscBankDetails = JSON.parse(cached);
      ifscMemoryCache.set(cleanCode, parsed);
      return parsed;
    }
  } catch {
    // Ignore storage parse error
  }

  try {
    const response = await fetch(`https://ifsc.razorpay.com/${cleanCode}`);
    if (!response.ok) {
      return null;
    }

    const data: IfscBankDetails = await response.json();
    if (data && data.BANK) {
      ifscMemoryCache.set(cleanCode, data);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch {
        // LocalStorage quota may be full, ignore
      }
      return data;
    }
    return null;
  } catch (err) {
    console.warn(`IFSC lookup failed for ${cleanCode}:`, err);
    return null;
  }
}
