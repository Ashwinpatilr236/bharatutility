import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from environment if configured with default Central Admin database fallback
const rawSupabaseUrl = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://nyqjcfutsqgxpnisvggv.supabase.co').trim();
const rawSupabaseAnonKey = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_QisWrr_KQ1e88SxD__QcXw_uewssBzn').trim();

let supabaseInstance: SupabaseClient | null = null;

/**
 * Validates that Supabase is configured with a valid project endpoint (e.g., https://xyz.supabase.co)
 * Note: api.supabase.com is the management API and must not be used as the project URL.
 */
export const isSupabaseConfigured = (): boolean => {
  if (!rawSupabaseUrl || !rawSupabaseAnonKey) return false;
  if (!rawSupabaseUrl.startsWith('http')) return false;
  if (rawSupabaseUrl.includes('api.supabase.com')) {
    console.warn(
      'Invalid VITE_SUPABASE_URL: "https://api.supabase.com" is the management API. Please provide your project URL in the format "https://<project-ref>.supabase.co"'
    );
    return false;
  }
  return true;
};

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseInstance && isSupabaseConfigured()) {
    try {
      supabaseInstance = createClient(rawSupabaseUrl, rawSupabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'implicit',
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
};
