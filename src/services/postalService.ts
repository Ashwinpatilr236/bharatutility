import { getSupabase } from './supabaseClient';

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
 * Normalizes Supabase database row into PostOfficeRecord
 */
function mapDbRowToRecord(row: any): PostOfficeRecord {
  return {
    id: row.id,
    pincode: row.pincode,
    name: row.name,
    description: row.description || '',
    branchType: row.branch_type || 'Sub Post Office',
    deliveryStatus: row.delivery_status || 'Delivery',
    circle: row.circle || '',
    district: row.district || '',
    division: row.division || '',
    region: row.region || '',
    state: row.state || '',
    country: row.country || 'India',
    source: row.source || 'api.postalpincode.in',
    lastUpdated: row.last_updated,
  };
}

/**
 * Asynchronously caches fetched records into Supabase PostgreSQL without blocking UI
 */
export async function cachePostOfficesToSupabase(records: PostOfficeRecord[]): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || records.length === 0) return;

  try {
    const payload = records.map((r) => ({
      pincode: r.pincode,
      name: r.name,
      name_normalized: r.name.toLowerCase().trim(),
      description: r.description,
      branch_type: r.branchType,
      delivery_status: r.deliveryStatus,
      circle: r.circle,
      district: r.district,
      division: r.division,
      region: r.region,
      state: r.state,
      country: r.country,
      source: r.source || 'api.postalpincode.in',
      last_updated: new Date().toISOString(),
    }));

    await supabase.from('india_post_offices').upsert(payload, {
      onConflict: 'pincode,name_normalized',
      ignoreDuplicates: false,
    });
  } catch (err) {
    console.warn('Background Supabase cache failed:', err);
  }
}

/**
 * Search post offices by 6-digit PIN code
 */
export async function searchByPincode(pincode: string): Promise<PostOfficeRecord[]> {
  const cleanPin = pincode.trim();
  if (!cleanPin || cleanPin.length < 3) return [];

  // 1. Query Supabase Application Database first
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('india_post_offices')
        .select('*')
        .eq('pincode', cleanPin);

      if (!error && data && data.length > 0) {
        return data.map(mapDbRowToRecord);
      }
    } catch (err) {
      console.warn('Supabase PIN lookup error, attempting API fallback:', err);
    }
  }

  // 2. Controlled Fallback to Postal API
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${encodeURIComponent(cleanPin)}`);
    if (!res.ok) return [];

    const jsonList: PostalApiResponse[] = await res.json();
    if (!Array.isArray(jsonList) || jsonList.length === 0) return [];

    const responseObj = jsonList[0];
    if (responseObj.Status === 'Success' && Array.isArray(responseObj.PostOffice)) {
      const records = responseObj.PostOffice.map((item) => normalizeApiPostOffice(item, cleanPin));
      
      // Asynchronously cache to Supabase
      cachePostOfficesToSupabase(records);
      return records;
    }
  } catch (err) {
    console.warn('Postal API PIN search failed:', err);
  }

  return [];
}

/**
 * Search post offices by Post Office branch name
 */
export async function searchByPostOffice(branchName: string): Promise<PostOfficeRecord[]> {
  const cleanName = branchName.trim();
  if (!cleanName || cleanName.length < 2) return [];

  // 1. Query Supabase Application Database first
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('india_post_offices')
        .select('*')
        .ilike('name_normalized', `%${cleanName.toLowerCase()}%`)
        .limit(50);

      if (!error && data && data.length > 0) {
        return data.map(mapDbRowToRecord);
      }
    } catch (err) {
      console.warn('Supabase Post Office lookup error, attempting API fallback:', err);
    }
  }

  // 2. Controlled Fallback to Postal API
  try {
    const res = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(cleanName)}`);
    if (!res.ok) return [];

    const jsonList: PostalApiResponse[] = await res.json();
    if (!Array.isArray(jsonList) || jsonList.length === 0) return [];

    const responseObj = jsonList[0];
    if (responseObj.Status === 'Success' && Array.isArray(responseObj.PostOffice)) {
      const records = responseObj.PostOffice.map((item) => normalizeApiPostOffice(item));
      
      // Asynchronously cache to Supabase
      cachePostOfficesToSupabase(records);
      return records;
    }
  } catch (err) {
    console.warn('Postal API Post Office search failed:', err);
  }

  return [];
}
