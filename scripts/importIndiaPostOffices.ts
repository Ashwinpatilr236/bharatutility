import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export interface PostOfficeApiItem {
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
}

export interface ImportMetrics {
  totalPinsRequested: number;
  processedPins: number;
  successfulPins: number;
  failedPins: number;
  totalPostOfficesFound: number;
  upsertedCount: number;
  skippedCount: number;
  errors: Array<{ pin: string; error: string }>;
}

/**
 * Normalizes API response item into database row
 */
export function normalizePostOfficeRecord(item: PostOfficeApiItem, fallbackPin: string) {
  const pincode = (item.Pincode || item.PINCode || fallbackPin || '').toString().trim();
  const name = (item.Name || 'Unknown Branch').trim();

  return {
    pincode,
    name,
    name_normalized: name.toLowerCase().trim(),
    description: (item.Description || '').trim(),
    branch_type: (item.BranchType || 'Sub Post Office').trim(),
    delivery_status: (item.DeliveryStatus || 'Delivery').trim(),
    circle: (item.Circle || '').trim(),
    district: (item.District || '').trim(),
    division: (item.Division || '').trim(),
    region: (item.Region || '').trim(),
    state: (item.State || '').trim(),
    country: (item.Country || 'India').trim(),
    source: 'api.postalpincode.in',
    last_updated: new Date().toISOString(),
  };
}

/**
 * Fetches and imports postal records for a list of PIN codes
 */
export async function importPostOfficesForPins(pinList: string[]): Promise<ImportMetrics> {
  const metrics: ImportMetrics = {
    totalPinsRequested: pinList.length,
    processedPins: 0,
    successfulPins: 0,
    failedPins: 0,
    totalPostOfficesFound: 0,
    upsertedCount: 0,
    skippedCount: 0,
    errors: [],
  };

  console.log(`\n==================================================`);
  console.log(`📮 BHARATUTILITY POSTAL PIN CODE IMPORTER`);
  console.log(`==================================================`);
  console.log(`Total PIN codes queued: ${pinList.length}`);
  console.log(`Supabase connection: ${supabase ? 'CONNECTED (' + supabaseUrl + ')' : 'OFFLINE (Local Dry-Run)'}\n`);

  for (const rawPin of pinList) {
    const pin = rawPin.trim();
    metrics.processedPins++;

    if (!pin) {
      metrics.skippedCount++;
      continue;
    }

    console.log(`[${metrics.processedPins}/${metrics.totalPinsRequested}] Fetching PIN: ${pin}...`);

    try {
      const apiUrl = `https://api.postalpincode.in/pincode/${encodeURIComponent(pin)}`;
      const res = await fetch(apiUrl);

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();

      if (!Array.isArray(json) || json.length === 0) {
        throw new Error('Invalid JSON format returned by API');
      }

      const resultObj = json[0];

      if (resultObj.Status !== 'Success' || !Array.isArray(resultObj.PostOffice)) {
        console.log(`   ⚠️ Message: ${resultObj.Message || 'No records found'}`);
        metrics.skippedCount++;
        continue;
      }

      const postOffices: PostOfficeApiItem[] = resultObj.PostOffice;
      console.log(`   ✓ Success! Found ${postOffices.length} Post Office(s)`);
      metrics.totalPostOfficesFound += postOffices.length;
      metrics.successfulPins++;

      // Normalize records
      const normalizedRows = postOffices.map((item) => normalizePostOfficeRecord(item, pin));

      // Display preview of first 3 records
      normalizedRows.slice(0, 3).forEach((row, i) => {
        console.log(`     - [${i + 1}] ${row.name} (${row.branch_type}, ${row.delivery_status}) | ${row.district}, ${row.state}`);
      });

      // Upsert to Supabase if connected
      if (supabase) {
        const { data, error } = await supabase.from('india_post_offices').upsert(normalizedRows, {
          onConflict: 'pincode,name_normalized',
          ignoreDuplicates: false,
        });

        if (error) {
          console.error(`   ❌ Supabase Upsert Error for PIN ${pin}:`, error.message);
          metrics.errors.push({ pin, error: error.message });
        } else {
          console.log(`   💾 Upserted ${normalizedRows.length} records into Supabase`);
          metrics.upsertedCount += normalizedRows.length;
        }
      } else {
        metrics.upsertedCount += normalizedRows.length;
      }
    } catch (err: any) {
      console.error(`   ❌ Failed to import PIN ${pin}:`, err.message || err);
      metrics.failedPins++;
      metrics.errors.push({ pin, error: err.message || String(err) });
    }

    // Rate-limiting delay buffer (200ms)
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n==================================================`);
  console.log(`📊 IMPORT SUMMARY METRICS`);
  console.log(`==================================================`);
  console.log(`• PINs Requested     : ${metrics.totalPinsRequested}`);
  console.log(`• PINs Processed     : ${metrics.processedPins}`);
  console.log(`• PINs Successful    : ${metrics.successfulPins}`);
  console.log(`• PINs Failed        : ${metrics.failedPins}`);
  console.log(`• Post Offices Found : ${metrics.totalPostOfficesFound}`);
  console.log(`• Records Upserted   : ${metrics.upsertedCount}`);
  console.log(`• Errors             : ${metrics.errors.length}`);
  console.log(`==================================================\n`);

  return metrics;
}

// Direct CLI Execution handling
if (typeof process !== 'undefined' && process.argv) {
  const args = process.argv.slice(2);
  let pinsToImport = ['110001']; // Default test pin

  const pinsArgIndex = args.indexOf('--pins');
  if (pinsArgIndex !== -1 && args[pinsArgIndex + 1]) {
    pinsToImport = args[pinsArgIndex + 1].split(',').map((p) => p.trim());
  }

  // Execute import if invoked directly
  importPostOfficesForPins(pinsToImport).catch((err) => {
    console.error('CLI Import Execution Error:', err);
  });
}
