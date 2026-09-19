export interface PostOfficeRecord {
  id?: string;
  pincode: string;
  name: string;
  description?: string;
  branchType: string;
  deliveryStatus: string;
  circle: string;
  district: string;
  division: string;
  region: string;
  state: string;
  country: string;
  source?: string;
  lastUpdated?: string;
}

export interface PostalApiResponse {
  Message: string;
  Status: 'Success' | 'Error';
  PostOffice: Array<{
    Name: string;
    Description: string;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    State: string;
    Country: string;
    Pincode?: string;
    PINCode?: string;
  }> | null;
}

// In-Memory LRU Caches for instant 0ms retrieval and zero backend load
const pinMemoryCache = new Map<string, PostOfficeRecord[]>();
const branchMemoryCache = new Map<string, PostOfficeRecord[]>();
const MAX_CACHE_ENTRIES = 200;

// Representative offline fallback for major Indian zones
const INDICATIVE_PIN_ZONE_MAP: Record<string, { state: string; region: string }> = {
  '11': { state: 'Delhi', region: 'Northern Zone' },
  '12': { state: 'Haryana', region: 'Northern Zone' },
  '14': { state: 'Punjab', region: 'Northern Zone' },
  '16': { state: 'Chandigarh', region: 'Northern Zone' },
  '18': { state: 'Jammu & Kashmir', region: 'Northern Zone' },
  '20': { state: 'Uttar Pradesh', region: 'Northern Zone' },
  '22': { state: 'Uttar Pradesh (East)', region: 'Northern Zone' },
  '24': { state: 'Uttarakhand', region: 'Northern Zone' },
  '30': { state: 'Rajasthan', region: 'Western Zone' },
  '36': { state: 'Gujarat', region: 'Western Zone' },
  '38': { state: 'Gujarat', region: 'Western Zone' },
  '39': { state: 'Gujarat', region: 'Western Zone' },
  '40': { state: 'Maharashtra', region: 'Western Zone' },
  '41': { state: 'Maharashtra (Pune)', region: 'Western Zone' },
  '44': { state: 'Maharashtra (Nagpur)', region: 'Western Zone' },
  '45': { state: 'Madhya Pradesh', region: 'Central Zone' },
  '46': { state: 'Madhya Pradesh (Bhopal)', region: 'Central Zone' },
  '49': { state: 'Chhattisgarh', region: 'Central Zone' },
  '50': { state: 'Telangana', region: 'Southern Zone' },
  '51': { state: 'Andhra Pradesh', region: 'Southern Zone' },
  '56': { state: 'Karnataka (Bengaluru)', region: 'Southern Zone' },
  '57': { state: 'Karnataka', region: 'Southern Zone' },
  '60': { state: 'Tamil Nadu (Chennai)', region: 'Southern Zone' },
  '64': { state: 'Tamil Nadu', region: 'Southern Zone' },
  '67': { state: 'Kerala', region: 'Southern Zone' },
  '68': { state: 'Kerala (Kochi)', region: 'Southern Zone' },
  '70': { state: 'West Bengal (Kolkata)', region: 'Eastern Zone' },
  '71': { state: 'West Bengal', region: 'Eastern Zone' },
  '75': { state: 'Odisha', region: 'Eastern Zone' },
  '78': { state: 'Assam', region: 'North Eastern Zone' },
  '79': { state: 'North East States', region: 'North Eastern Zone' },
  '80': { state: 'Bihar (Patna)', region: 'Eastern Zone' },
  '83': { state: 'Jharkhand (Ranchi)', region: 'Eastern Zone' },
};

/**
 * Normalizes API item into standard PostOfficeRecord
 */
export function normalizeApiPostOffice(item: any, fallbackPin: string = ''): PostOfficeRecord {
  const pin = (item.Pincode || item.PINCode || item.pincode || fallbackPin || '').toString().trim();
  const name = (item.Name || item.name || 'Unknown Branch').trim();

  return {
    pincode: pin,
    name: name,
    description: item.Description || item.description || '',
    branchType: item.BranchType || item.branch_type || 'Sub Post Office',
    deliveryStatus: item.DeliveryStatus || item.delivery_status || 'Delivery',
    circle: item.Circle || item.circle || '',
    district: item.District || item.district || '',
    division: item.Division || item.division || '',
    region: item.Region || item.region || '',
    state: item.State || item.state || '',
    country: item.Country || item.country || 'India',
    source: 'api.postalpincode.in',
  };
}

/**
 * Search post offices by 6-digit PIN code using Free Postal API + In-Memory Caching
 */
export async function searchByPincode(pincode: string): Promise<PostOfficeRecord[]> {
  const cleanPin = pincode.trim();
  if (!cleanPin || cleanPin.length < 3) return [];

  // 1. Check in-memory LRU cache
  if (pinMemoryCache.has(cleanPin)) {
    return pinMemoryCache.get(cleanPin)!;
  }

  // 2. Fetch from Free Open Indian Postal API (api.postalpincode.in)
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(cleanPin)}`);
    if (res.ok) {
      const jsonList: PostalApiResponse[] = await res.json();
      if (Array.isArray(jsonList) && jsonList.length > 0) {
        const responseObj = jsonList[0];
        if (responseObj.Status === 'Success' && Array.isArray(responseObj.PostOffice)) {
          const records = responseObj.PostOffice.map((item) => normalizeApiPostOffice(item, cleanPin));
          
          // Cache in memory
          if (pinMemoryCache.size >= MAX_CACHE_ENTRIES) {
            const firstKey = pinMemoryCache.keys().next().value;
            if (firstKey) pinMemoryCache.delete(firstKey);
          }
          pinMemoryCache.set(cleanPin, records);
          return records;
        }
      }
    }
  } catch (err) {
    console.warn('Postal API PIN search notice:', err);
  }

  // 3. Indicative Fallback for known postal zone prefixes if offline
  const prefix = cleanPin.slice(0, 2);
  if (cleanPin.length === 6 && INDICATIVE_PIN_ZONE_MAP[prefix]) {
    const zoneInfo = INDICATIVE_PIN_ZONE_MAP[prefix];
    const fallbackRecord: PostOfficeRecord = {
      pincode: cleanPin,
      name: `Head Post Office (${cleanPin})`,
      description: `Indicative postal hub for PIN zone ${cleanPin}`,
      branchType: 'Head Post Office',
      deliveryStatus: 'Delivery',
      circle: zoneInfo.state,
      district: zoneInfo.state,
      division: `${zoneInfo.state} Postal Division`,
      region: zoneInfo.region,
      state: zoneInfo.state,
      country: 'India',
      source: 'indicative_regional_index',
    };
    return [fallbackRecord];
  }

  return [];
}

/**
 * Search post offices by Post Office branch name
 */
export async function searchByPostOffice(branchName: string): Promise<PostOfficeRecord[]> {
  const cleanName = branchName.trim().toLowerCase();
  if (!cleanName || cleanName.length < 2) return [];

  // 1. Check in-memory cache
  if (branchMemoryCache.has(cleanName)) {
    return branchMemoryCache.get(cleanName)!;
  }

  // 2. Fetch from Free Open Indian Postal API
  try {
    const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(cleanName)}`);
    if (res.ok) {
      const jsonList: PostalApiResponse[] = await res.json();
      if (Array.isArray(jsonList) && jsonList.length > 0) {
        const responseObj = jsonList[0];
        if (responseObj.Status === 'Success' && Array.isArray(responseObj.PostOffice)) {
          const records = responseObj.PostOffice.map((item) => normalizeApiPostOffice(item));
          
          if (branchMemoryCache.size >= MAX_CACHE_ENTRIES) {
            const firstKey = branchMemoryCache.keys().next().value;
            if (firstKey) branchMemoryCache.delete(firstKey);
          }
          branchMemoryCache.set(cleanName, records);
          return records;
        }
      }
    }
  } catch (err) {
    console.warn('Postal API branch search notice:', err);
  }

  return [];
}
