/**
 * PARKSIGNAL CLIENT SERVICE (SUPABASE ARCHITECTURE)
 * Integrates directly with Supabase Auth, PostgreSQL (RLS), and Edge Functions.
 * Supabase Auth is the SOLE trusted authentication and identity provider.
 * Product: ParkSignal by BharatUtility
 */

import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import {
  ParkSignalUser,
  ParkSignalVehicle,
  ParkSignalVehicleSettings,
  ParkSignalPublicVehicle,
  ParkSignalAlertLog
} from '../types';

const TOKEN_KEY = 'ps_auth_token';
const USER_KEY = 'ps_user';

// Clean up legacy offline local database and synthetic mock sessions
try {
  localStorage.removeItem('ps_local_db');
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !token.startsWith('sb-') && token.length < 50 && !token.includes('.')) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
} catch {
  // Storage unavailable
}

function generateRandomHex(bytes: number = 16): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const parkSignalService = {
  // ── Auth Token & User Storage ──
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser(): ParkSignalUser | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setSession(token: string, user: ParkSignalUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken() && this.getCurrentUser());
  },

  // ── Authentication (Supabase Auth Sole Identity Provider) ──
  async register(
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: ParkSignalUser; error?: string }> {
    const normEmail = email.toLowerCase().trim();
    const supabase = getSupabase();

    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        error: 'ParkSignal cloud service is currently unavailable. Please check your internet connection or try again later.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normEmail,
        password,
        options: {
          data: { full_name: fullName.trim() }
        }
      });

      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          return { success: false, error: 'An account with this email already exists. Please log in.' };
        }
        return { success: false, error: error.message || 'Registration failed. Please check your details.' };
      }

      if (data.user) {
        const user: ParkSignalUser = {
          id: data.user.id,
          email: normEmail,
          fullName: fullName.trim(),
          isTelegramLinked: false
        };
        const sessionToken = data.session?.access_token || `sb_${data.user.id}`;
        this.setSession(sessionToken, user);
        return { success: true, token: sessionToken, user };
      }

      return { success: false, error: 'Registration could not be completed. Please try again.' };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error connecting to ParkSignal authentication service.'
      };
    }
  },

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: ParkSignalUser; error?: string }> {
    const normEmail = email.toLowerCase().trim();
    const supabase = getSupabase();

    if (!supabase || !isSupabaseConfigured()) {
      return {
        success: false,
        error: 'ParkSignal cloud service is currently unavailable. Please check your connection.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normEmail,
        password
      });

      if (error) {
        return { success: false, error: error.message || 'Invalid email address or password.' };
      }

      if (data.user && data.session) {
        // Fetch verified profile details from database
        const { data: profile } = await supabase
          .from('parksignal_profiles')
          .select('full_name, is_telegram_linked, telegram_username')
          .eq('id', data.user.id)
          .maybeSingle();

        const user: ParkSignalUser = {
          id: data.user.id,
          email: normEmail,
          fullName: profile?.full_name || data.user.user_metadata?.full_name || 'Owner',
          isTelegramLinked: Boolean(profile?.is_telegram_linked),
          telegramUsername: profile?.telegram_username
        };

        this.setSession(data.session.access_token, user);
        return { success: true, token: data.session.access_token, user };
      }

      return { success: false, error: 'Login failed. Please check your credentials.' };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error connecting to ParkSignal service.'
      };
    }
  },

  async logout(): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    this.clearSession();
  },

  // ── Password Reset (Supabase Auth) ──
  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const normEmail = email.toLowerCase().trim();
    const supabase = getSupabase();

    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Supabase authentication service unavailable.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normEmail, {
        redirectTo: `${window.location.origin}/parksignal/login`
      });
      if (error) return { success: false, error: error.message };
      return {
        success: true,
        message: 'Password reset link sent! Please check your email inbox to reset your password.'
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send reset email' };
    }
  },

  // ── Owner Profile ──
  async getProfile(): Promise<{ user?: ParkSignalUser; error?: string }> {
    const cur = this.getCurrentUser();
    if (!cur) return { error: 'Not logged in' };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: profile } = await supabase
          .from('parksignal_profiles')
          .select('full_name, is_telegram_linked, telegram_username')
          .eq('id', cur.id)
          .maybeSingle();

        if (profile) {
          const updated: ParkSignalUser = {
            ...cur,
            fullName: profile.full_name || cur.fullName,
            isTelegramLinked: Boolean(profile.is_telegram_linked),
            telegramUsername: profile.telegram_username
          };
          this.setSession(this.getToken() || '', updated);
          return { user: updated };
        }
      } catch {}
    }

    return { user: cur };
  },

  async updateProfile(fullName: string): Promise<{ success: boolean; error?: string }> {
    const cur = this.getCurrentUser();
    if (!cur) return { success: false, error: 'Unauthorized' };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase
          .from('parksignal_profiles')
          .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
          .eq('id', cur.id);

        await supabase.auth.updateUser({
          data: { full_name: fullName.trim() }
        });
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update profile.' };
      }
    }

    cur.fullName = fullName.trim();
    this.setSession(this.getToken() || '', cur);
    return { success: true };
  },

  async changePassword(
    _currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters' };
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) return { success: false, error: error.message };
        return { success: true, message: 'Password updated successfully' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to change password' };
      }
    }

    return { success: false, error: 'Authentication service unavailable' };
  },

  async deleteAccount(): Promise<{ success: boolean; message?: string; error?: string }> {
    await this.logout();
    return { success: true, message: 'Account session closed.' };
  },

  // ── Telegram Account Connection (@ParkSignal_bot) ──
  async createTelegramLinkToken(intent: 'CONNECT' | 'RECONNECT' = 'CONNECT'): Promise<{
    success: boolean;
    token?: string;
    deepLink?: string;
    expiresAt?: number;
    error?: string;
  }> {
    const cur = this.getCurrentUser();
    const endpoint = 'https://nyqjcfutsqgxpnisvggv.supabase.co/functions/v1/parksignal-alert';

    // 1. Primary: Secure Edge Function (Writes directly to Supabase with Service Role)
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_telegram_link',
          userId: cur?.id,
          email: cur?.email,
          fullName: cur?.fullName,
          intent,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.deepLink) {
          return {
            success: true,
            token: data.token,
            deepLink: data.deepLink,
            expiresAt: data.expiresAt,
          };
        }
      }
    } catch (err: any) {
      console.warn('Edge Function create_telegram_link error, trying client RPC fallback:', err);
    }

    // 2. Client RPC fallback
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('create_parksignal_telegram_link', {
          p_intent: intent,
        });

        if (!error && data?.success) {
          return {
            success: true,
            token: data.token,
            deepLink: data.deepLink,
            expiresAt: data.expiresAt,
          };
        }
      } catch (err: any) {
        console.warn('RPC create_parksignal_telegram_link error:', err);
      }
    }

    return {
      success: false,
      error: 'Unable to connect to ParkSignal database. Please check your internet connection or try again.',
    };
  },

  async createTelegramLink(intent: 'CONNECT' | 'RECONNECT' = 'CONNECT') {
    return this.createTelegramLinkToken(intent);
  },

  async getTelegramLinkToken(intent: 'CONNECT' | 'RECONNECT' = 'CONNECT') {
    return this.createTelegramLinkToken(intent);
  },

  async disconnectTelegram(): Promise<{ success: boolean; error?: string }> {
    const cur = this.getCurrentUser();
    if (!cur) return { success: false, error: 'Unauthorized' };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase
          .from('parksignal_telegram_accounts')
          .update({ is_active: false })
          .eq('user_id', cur.id);

        await supabase
          .from('parksignal_profiles')
          .update({ is_telegram_linked: false, telegram_username: null })
          .eq('id', cur.id);
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to disconnect Telegram' };
      }
    }

    cur.isTelegramLinked = false;
    cur.telegramUsername = undefined;
    this.setSession(this.getToken() || '', cur);
    return { success: true };
  },

  // ── Vehicle Management (Supabase PostgreSQL with RLS) ──
  async getVehicles(): Promise<{ vehicles: ParkSignalVehicle[]; error?: string }> {
    const cur = this.getCurrentUser();
    if (!cur) return { vehicles: [] };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: vList, error } = await supabase
          .from('parksignal_vehicles')
          .select(`
            id, vehicle_number, vehicle_type, nickname,
            display_plate_publicly, is_active, created_at,
            parksignal_qr_tokens(token, is_active),
            parksignal_vehicle_settings(*)
          `)
          .eq('owner_id', cur.id)
          .order('created_at', { ascending: false });

        if (!error && vList) {
          const mapped: ParkSignalVehicle[] = vList.map((row: any) => {
            const activeQr = Array.isArray(row.parksignal_qr_tokens)
              ? row.parksignal_qr_tokens.find((q: any) => q.is_active)
              : row.parksignal_qr_tokens;
            const settings = Array.isArray(row.parksignal_vehicle_settings)
              ? row.parksignal_vehicle_settings[0]
              : row.parksignal_vehicle_settings;

            return {
              id: row.id,
              vehicle_number: row.vehicle_number,
              vehicle_type: row.vehicle_type,
              nickname: row.nickname,
              display_plate_publicly: row.display_plate_publicly ? 1 : 0,
              is_active: row.is_active ? 1 : 0,
              qr_token: activeQr?.token || null,
              created_at: new Date(row.created_at).getTime(),
              allow_blocking: settings?.allow_blocking !== false ? 1 : 0,
              allow_move_vehicle: settings?.allow_move_vehicle !== false ? 1 : 0,
              allow_emergency: settings?.allow_emergency !== false ? 1 : 0,
              allow_child_person_inside: settings?.allow_child_person_inside !== false ? 1 : 0,
              allow_lights_on: settings?.allow_lights_on !== false ? 1 : 0,
              allow_window_door_open: settings?.allow_window_door_open !== false ? 1 : 0,
              allow_damage_alert: settings?.allow_damage_alert !== false ? 1 : 0,
              allow_custom_text: settings?.allow_custom_text !== false ? 1 : 0,
              allow_voice_messages: settings?.allow_voice_messages ? 1 : 0,
              max_custom_text_length: settings?.max_custom_text_length || 200,
              max_voice_duration_seconds: settings?.max_voice_duration_seconds || 60,
              quiet_hours_enabled: settings?.quiet_hours_enabled ? 1 : 0,
              quiet_hours_start: settings?.quiet_hours_start || '22:00',
              quiet_hours_end: settings?.quiet_hours_end || '07:00'
            };
          });

          return { vehicles: mapped };
        } else if (error) {
          return { vehicles: [], error: error.message };
        }
      } catch (err: any) {
        console.warn('Supabase getVehicles error:', err);
        return { vehicles: [], error: err?.message || 'Failed to load vehicles' };
      }
    }

    return { vehicles: [] };
  },

  async registerVehicle(
    paramsOrNumber:
      | string
      | {
          vehicleNumber: string;
          vehicleType: string;
          nickname?: string;
          displayPlatePublicly?: boolean;
          rules?: any;
        },
    vehicleTypeArg?: string,
    nicknameArg?: string,
    displayPlatePubliclyArg?: boolean,
    rulesArg?: any
  ): Promise<{ success: boolean; vehicle?: ParkSignalVehicle; error?: string }> {
    const params = typeof paramsOrNumber === 'string'
      ? {
          vehicleNumber: paramsOrNumber,
          vehicleType: vehicleTypeArg || 'Car',
          nickname: nicknameArg,
          displayPlatePublicly: displayPlatePubliclyArg !== false,
          rules: rulesArg || {}
        }
      : (paramsOrNumber || { vehicleNumber: '', vehicleType: 'Car' });

    const cur = this.getCurrentUser();
    if (!cur) return { success: false, error: 'Unauthorized. Please sign in.' };

    const rawPlate = params.vehicleNumber || '';
    const normPlate = rawPlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!normPlate) {
      return { success: false, error: 'Please enter a valid vehicle plate number.' };
    }

    const qrToken = generateRandomHex(12);

    // 1. Primary: Secure Edge Function (Writes directly to Supabase with Service Role)
    const endpoint = 'https://nyqjcfutsqgxpnisvggv.supabase.co/functions/v1/parksignal-alert';
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register_vehicle',
          userId: cur.id,
          email: cur.email,
          fullName: cur.fullName,
          vehicleNumber: normPlate,
          vehicleType: params.vehicleType || 'Car',
          nickname: params.nickname ? params.nickname.trim() : null,
          displayPlatePublicly: params.displayPlatePublicly !== false,
          rules: params.rules || {},
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.vehicle) {
          return { success: true, vehicle: data.vehicle };
        }
        if (data.error) {
          return { success: false, error: data.error };
        }
      } else {
        try {
          const errData = await resp.json();
          if (errData.error) {
            return { success: false, error: errData.error };
          }
        } catch {}
      }
    } catch (err: any) {
      console.warn('Edge Function register_vehicle error, trying direct client insert:', err);
    }

    // 2. Direct client insert
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: vRec, error: vErr } = await supabase
          .from('parksignal_vehicles')
          .insert({
            owner_id: cur.id,
            vehicle_number: normPlate,
            vehicle_type: params.vehicleType || 'Car',
            nickname: params.nickname ? params.nickname.trim() : null,
            display_plate_publicly: params.displayPlatePublicly !== false,
            is_active: true
          })
          .select('id, created_at')
          .single();

        if (vErr || !vRec) {
          const msg = vErr?.message || '';
          if (msg.includes('duplicate') || msg.includes('unique')) {
            return { success: false, error: `Vehicle ${normPlate} is already registered.` };
          }
          return { success: false, error: msg || 'Could not register vehicle in database.' };
        }

        // Insert QR token
        await supabase.from('parksignal_qr_tokens').insert({
          token: qrToken,
          vehicle_id: vRec.id,
          is_active: true
        });

        // Insert default vehicle alert settings
        await supabase.from('parksignal_vehicle_settings').insert({
          vehicle_id: vRec.id,
          allow_blocking: params.rules?.allow_blocking !== false,
          allow_move_vehicle: params.rules?.allow_move_vehicle !== false,
          allow_emergency: params.rules?.allow_emergency !== false,
          allow_child_person_inside: params.rules?.allow_child_person_inside !== false,
          allow_lights_on: params.rules?.allow_lights_on !== false,
          allow_window_door_open: params.rules?.allow_window_door_open !== false,
          allow_damage_alert: params.rules?.allow_damage_alert !== false,
          allow_custom_text: params.rules?.allow_custom_text !== false,
          allow_voice_messages: Boolean(params.rules?.allow_voice_messages ?? true),
          max_custom_text_length: 200,
          max_voice_duration_seconds: 60
        });

        const newV: ParkSignalVehicle = {
          id: vRec.id,
          vehicle_number: normPlate,
          vehicle_type: (params.vehicleType || 'Car') as any,
          nickname: params.nickname || null,
          display_plate_publicly: params.displayPlatePublicly !== false ? 1 : 0,
          is_active: 1,
          qr_token: qrToken,
          created_at: new Date(vRec.created_at).getTime(),
          allow_blocking: 1,
          allow_move_vehicle: 1,
          allow_emergency: 1,
          allow_child_person_inside: 1,
          allow_lights_on: 1,
          allow_window_door_open: 1,
          allow_damage_alert: 1,
          allow_custom_text: 1,
          allow_voice_messages: Boolean(params.rules?.allow_voice_messages ?? true) ? 1 : 0,
          max_custom_text_length: 200,
          max_voice_duration_seconds: 60
        };

        return { success: true, vehicle: newV };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to register vehicle.' };
      }
    }

    return { success: false, error: 'Database service unavailable. Please try again.' };
  },

  async updateVehicleSettings(
    vehicleId: string,
    settings: ParkSignalVehicleSettings & { display_plate_publicly?: boolean; nickname?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Database service unavailable.' };
    }

    try {
      await supabase
        .from('parksignal_vehicle_settings')
        .upsert({
          vehicle_id: vehicleId,
          allow_blocking: settings.allow_blocking !== 0,
          allow_move_vehicle: settings.allow_move_vehicle !== 0,
          allow_emergency: settings.allow_emergency !== 0,
          allow_child_person_inside: settings.allow_child_person_inside !== 0,
          allow_lights_on: settings.allow_lights_on !== 0,
          allow_window_door_open: settings.allow_window_door_open !== 0,
          allow_damage_alert: settings.allow_damage_alert !== 0,
          allow_custom_text: settings.allow_custom_text !== 0,
          allow_voice_messages: Boolean(settings.allow_voice_messages),
          max_custom_text_length: settings.max_custom_text_length || 200,
          max_voice_duration_seconds: settings.max_voice_duration_seconds || 60,
          quiet_hours_enabled: settings.quiet_hours_enabled === 1,
          quiet_hours_start: settings.quiet_hours_start || '22:00',
          quiet_hours_end: settings.quiet_hours_end || '07:00',
          updated_at: new Date().toISOString()
        });

      if (typeof settings.display_plate_publicly !== 'undefined' || typeof settings.nickname !== 'undefined') {
        await supabase
          .from('parksignal_vehicles')
          .update({
            display_plate_publicly: settings.display_plate_publicly,
            nickname: settings.nickname,
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicleId);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update vehicle settings.' };
    }
  },

  async toggleVehicleStatus(vehicleId: string): Promise<{ success: boolean; isActive?: boolean; vehicle?: { is_active: boolean }; error?: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Database service unavailable.' };
    }

    try {
      const { data: v } = await supabase
        .from('parksignal_vehicles')
        .select('is_active')
        .eq('id', vehicleId)
        .single();

      const next = !v?.is_active;
      await supabase
        .from('parksignal_vehicles')
        .update({ is_active: next, updated_at: new Date().toISOString() })
        .eq('id', vehicleId);

      return { success: true, isActive: next, vehicle: { is_active: next } };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to toggle vehicle status.' };
    }
  },

  async regenerateQr(vehicleId: string): Promise<{ success: boolean; qrToken?: string; error?: string }> {
    const newToken = generateRandomHex(12);
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Database service unavailable.' };
    }

    try {
      // Revoke existing
      await supabase
        .from('parksignal_qr_tokens')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('vehicle_id', vehicleId);

      // Insert new
      await supabase.from('parksignal_qr_tokens').insert({
        token: newToken,
        vehicle_id: vehicleId,
        is_active: true
      });

      return { success: true, qrToken: newToken };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to regenerate QR.' };
    }
  },

  async regenerateQR(vehicleId: string) {
    return this.regenerateQr(vehicleId);
  },

  async deleteVehicle(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Database service unavailable.' };
    }

    try {
      await supabase.from('parksignal_vehicles').delete().eq('id', vehicleId);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to delete vehicle.' };
    }
  },

  // ── Public Scanner Endpoints (No Auth Required) ──
  async getPublicVehicle(qrToken: string): Promise<ParkSignalPublicVehicle> {
    return this.getPublicVehicleByQr(qrToken);
  },

  async getPublicVehicleByQr(qrToken: string): Promise<ParkSignalPublicVehicle> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { valid: false, message: 'Scanner service is temporarily unavailable.' };
    }

    try {
      const { data, error } = await supabase.rpc('get_parksignal_vehicle_by_qr', {
        p_qr_token: qrToken
      });

      if (!error && data) {
        return data as ParkSignalPublicVehicle;
      }
      return { valid: false, message: 'This QR code is invalid, revoked, or no longer active.' };
    } catch (err) {
      return { valid: false, message: 'Could not verify vehicle QR. Please try again.' };
    }
  },

  async sendTextAlert(
    qrToken: string,
    category: string,
    customMessage?: string,
    locationText?: string,
    locationCoords?: string
  ): Promise<{ success: boolean; delivered?: boolean; message?: string; error?: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Alert service is currently unavailable.' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('parksignal-alert', {
        body: { qrToken, category, customMessage, locationText, locationCoords }
      });

      if (!error && data) {
        return { success: data.success, delivered: data.delivered, message: data.message, error: data.error };
      }
      return { success: false, error: error?.message || data?.error || 'Failed to send alert.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Alert service request failed.' };
    }
  },

  async sendVoiceAlert(
    qrToken: string,
    category: string,
    voiceBlob: Blob,
    durationSeconds: number,
    locationText?: string,
    locationCoords?: string
  ): Promise<{ success: boolean; delivered?: boolean; message?: string; error?: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Voice alert service is currently unavailable.' };
    }

    try {
      const formData = new FormData();
      formData.append('qrToken', qrToken);
      formData.append('category', category);
      formData.append('voice', voiceBlob, 'voice_alert.ogg');
      formData.append('durationSeconds', String(durationSeconds));
      if (locationText) formData.append('locationText', locationText);
      if (locationCoords) formData.append('locationCoords', locationCoords);

      const { data, error } = await supabase.functions.invoke('parksignal-alert', {
        body: formData
      });

      if (!error && data) {
        return { success: data.success, delivered: data.delivered, message: data.message, error: data.error };
      }
      return { success: false, error: error?.message || data?.error || 'Failed to dispatch voice message.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Voice alert request failed.' };
    }
  },

  // ── Notification History (Supabase with RLS) ──
  async getAlertHistory(): Promise<{ alerts: ParkSignalAlertLog[]; error?: string }> {
    const cur = this.getCurrentUser();
    if (!cur) return { alerts: [] };

    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { alerts: [] };
    }

    try {
      const { data: alertList, error } = await supabase
        .from('parksignal_alerts')
        .select(`
          id, alert_type, alert_category, custom_message,
          voice_duration_seconds, delivery_status, created_at,
          parksignal_vehicles!inner(id, vehicle_number, vehicle_type, nickname, owner_id)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && alertList) {
        const mapped: ParkSignalAlertLog[] = alertList.map((a: any) => ({
          id: a.id,
          vehicle_id: a.parksignal_vehicles?.id || '',
          vehicle_number: a.parksignal_vehicles?.vehicle_number || '',
          vehicle_type: a.parksignal_vehicles?.vehicle_type || '',
          nickname: a.parksignal_vehicles?.nickname || null,
          alert_type: a.alert_type as 'TEXT' | 'VOICE',
          alert_category: a.alert_category,
          custom_message: a.custom_message,
          voice_duration_seconds: a.voice_duration_seconds,
          delivery_status: a.delivery_status as any,
          created_at: new Date(a.created_at).getTime()
        }));
        return { alerts: mapped };
      }
      return { alerts: [] };
    } catch {
      return { alerts: [] };
    }
  },

  // ── Customer Reviews & Ratings ──
  async submitReview(review: {
    rating: number;
    reviewerName?: string;
    reviewerRole?: string;
    comment?: string;
    vehicleNumber?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, error: 'Database service unavailable' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('parksignal-alert', {
        body: {
          action: 'submit_review',
          ...review,
        }
      });
      if (!error && data?.success) {
        return { success: true, message: 'Thank you for your review! Your feedback helps us protect more vehicles across India.' };
      }
    } catch (err: any) {
      console.warn('Review submission edge function fallback:', err);
    }

    // Direct insert fallback
    try {
      await supabase.from('parksignal_reviews').insert({
        rating: review.rating,
        reviewer_name: review.reviewerName || 'Bystander',
        reviewer_role: review.reviewerRole || 'Bystander',
        comment: review.comment || null,
        vehicle_number: review.vehicleNumber || null,
      });
      return { success: true, message: 'Thank you for your feedback!' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Could not submit review.' };
    }
  }
};
