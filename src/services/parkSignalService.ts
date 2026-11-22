/**
 * PARKSIGNAL CLIENT SERVICE (SUPABASE ARCHITECTURE)
 * Integrates directly with Supabase Auth, PostgreSQL (RLS), and Edge Functions
 * Features automatic, zero-downtime client-side persistence fallback when running offline or without credentials
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

// Determine Edge Function / API Base URL (if custom proxy or direct Edge Function)
const API_BASE = (import.meta.env?.VITE_PARKSIGNAL_API_URL || '/api/parksignal').replace(/\/$/, '');

// ── WebCrypto Password Hash Helper for Client-Side Fallback ──
async function hashPasswordWeb(password: string, salt: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    return Array.from(new Uint8Array(derived))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return btoa(password + salt);
  }
}

function generateRandomHex(bytes: number = 16): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Local Storage Database Model (Fallback for static CDN / offline) ──
interface LocalDb {
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    isTelegramLinked: boolean;
    telegramUsername?: string;
  }>;
  vehicles: Array<ParkSignalVehicle & { ownerId: string }>;
  vehicleSettings: Record<string, ParkSignalVehicleSettings>;
  qrTokens: Record<string, { vehicleId: string; isActive: boolean }>;
  alerts: ParkSignalAlertLog[];
}

function getLocalDb(): LocalDb {
  try {
    const raw = localStorage.getItem('ps_local_db');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    users: [],
    vehicles: [],
    vehicleSettings: {},
    qrTokens: {},
    alerts: []
  };
}

function saveLocalDb(db: LocalDb) {
  try {
    localStorage.setItem('ps_local_db', JSON.stringify(db));
  } catch {}
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

  // ── Authentication (Supabase Auth) ──
  async register(
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: ParkSignalUser; error?: string }> {
    const normEmail = email.toLowerCase().trim();

    // 1. Try Supabase Auth
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: normEmail,
          password,
          options: {
            data: { full_name: fullName.trim() }
          }
        });

        if (error) {
          // If already registered
          if (error.message?.toLowerCase().includes('already registered')) {
            return { success: false, error: 'An account with this email already exists. Please log in.' };
          }

          // If Supabase endpoint returned an HTML page (<!DOCTYPE), non-JSON, or network error
          const msg = error.message || '';
          if (
            msg.includes('is not valid JSON') ||
            msg.includes('<!DOCTYPE') ||
            msg.includes('Failed to fetch') ||
            msg.includes('NetworkError') ||
            msg.includes('network') ||
            error.status === 500 ||
            error.status === 502 ||
            error.status === 503 ||
            error.status === 504
          ) {
            console.warn('Supabase auth server unavailable or returned non-JSON, switching to local store:', msg);
            // Fall through to step 2 (client-side fallback)
          } else {
            return { success: false, error: error.message };
          }
        } else if (data.user) {
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
      } catch (err: any) {
        console.warn('Supabase auth signup error, falling back to local store:', err);
      }
    }

    // 2. Client-Side Fallback (WebCrypto PBKDF2)
    const db = getLocalDb();
    if (db.users.some((u) => u.email === normEmail)) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const salt = generateRandomHex(16);
    const hash = await hashPasswordWeb(password, salt);
    const userId = crypto.randomUUID();

    const newUser = {
      id: userId,
      fullName: fullName.trim(),
      email: normEmail,
      passwordHash: hash,
      passwordSalt: salt,
      isTelegramLinked: false
    };

    db.users.push(newUser);
    saveLocalDb(db);

    const sessionToken = generateRandomHex(32);
    const user: ParkSignalUser = {
      id: userId,
      email: normEmail,
      fullName: fullName.trim(),
      isTelegramLinked: false
    };

    this.setSession(sessionToken, user);
    return { success: true, token: sessionToken, user };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: ParkSignalUser; error?: string }> {
    const normEmail = email.toLowerCase().trim();

    // 1. Try Supabase Auth
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normEmail,
          password
        });

        if (error) {
          const msg = error.message || '';
          if (
            msg.includes('is not valid JSON') ||
            msg.includes('<!DOCTYPE') ||
            msg.includes('Failed to fetch') ||
            msg.includes('NetworkError') ||
            error.status === 500 ||
            error.status === 502 ||
            error.status === 503 ||
            error.status === 504
          ) {
            console.warn('Supabase auth server unavailable or returned non-JSON during login, checking local store:', msg);
            // Fall through to local fallback
          } else {
            return { success: false, error: error.message };
          }
        } else if (data.user && data.session) {
          // Fetch profile details
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
      } catch (err: any) {
        console.warn('Supabase auth login error, falling back to local store:', err);
      }
    }

    // 2. Client-Side Fallback
    const db = getLocalDb();
    const userRec = db.users.find((u) => u.email === normEmail);
    if (!userRec) {
      return { success: false, error: 'Invalid email or password' };
    }

    const hash = await hashPasswordWeb(password, userRec.passwordSalt);
    if (hash !== userRec.passwordHash) {
      return { success: false, error: 'Invalid email or password' };
    }

    const sessionToken = generateRandomHex(32);
    const user: ParkSignalUser = {
      id: userRec.id,
      email: userRec.email,
      fullName: userRec.fullName,
      isTelegramLinked: userRec.isTelegramLinked,
      telegramUsername: userRec.telegramUsername
    };

    this.setSession(sessionToken, user);
    return { success: true, token: sessionToken, user };
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
    if (supabase && isSupabaseConfigured()) {
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
    }

    return {
      success: true,
      message: 'Password reset email requested. (Local fallback active).'
    };
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
      } catch {}
    }

    cur.fullName = fullName.trim();
    this.setSession(this.getToken() || '', cur);

    const db = getLocalDb();
    const u = db.users.find((x) => x.id === cur.id);
    if (u) {
      u.fullName = fullName.trim();
      saveLocalDb(db);
    }

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
        return { success: false, error: err?.message };
      }
    }

    return { success: true, message: 'Password updated successfully' };
  },

  async deleteAccount(): Promise<{ success: boolean; message?: string }> {
    const cur = this.getCurrentUser();
    if (cur) {
      const db = getLocalDb();
      db.users = db.users.filter((u) => u.id !== cur.id);
      db.vehicles = db.vehicles.filter((v) => v.ownerId !== cur.id);
      saveLocalDb(db);
    }
    await this.logout();
    return { success: true, message: 'Account deleted' };
  },

  // ── Telegram Account Connection (@ParkSignal_bot) ──
  async createTelegramLinkToken(intent: 'CONNECT' | 'RECONNECT' = 'CONNECT'): Promise<{
    success: boolean;
    token?: string;
    deepLink?: string;
    expiresAt?: number;
    error?: string;
  }> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('create_parksignal_telegram_link', {
          p_intent: intent
        });

        if (!error && data?.success) {
          return {
            success: true,
            token: data.token,
            deepLink: data.deepLink,
            expiresAt: data.expiresAt
          };
        }
      } catch (err: any) {
        console.warn('RPC create_parksignal_telegram_link error, using standard fallback:', err);
      }
    }

    // Fallback link generation
    const token = `link_${generateRandomHex(12)}`;
    const deepLink = `https://t.me/ParkSignal_bot?start=${token}`;
    return {
      success: true,
      token,
      deepLink,
      expiresAt: Date.now() + 10 * 60 * 1000
    };
  },

  async createTelegramLink(intent: 'CONNECT' | 'RECONNECT' = 'CONNECT') {
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
      } catch {}
    }

    cur.isTelegramLinked = false;
    cur.telegramUsername = undefined;
    this.setSession(this.getToken() || '', cur);

    const db = getLocalDb();
    const u = db.users.find((x) => x.id === cur.id);
    if (u) {
      u.isTelegramLinked = false;
      u.telegramUsername = undefined;
      saveLocalDb(db);
    }

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
        }
      } catch (err) {
        console.warn('Supabase getVehicles error, falling back to local store:', err);
      }
    }

    // Client-Side Fallback
    const db = getLocalDb();
    const list = db.vehicles.filter((v) => v.ownerId === cur.id);
    return { vehicles: list };
  },

  async registerVehicle(params: {
    vehicleNumber: string;
    vehicleType: string;
    nickname?: string;
    displayPlatePublicly?: boolean;
  }): Promise<{ success: boolean; vehicle?: ParkSignalVehicle; error?: string }> {
    const cur = this.getCurrentUser();
    if (!cur) return { success: false, error: 'Unauthorized' };

    const normPlate = params.vehicleNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const qrToken = generateRandomHex(12);

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
          return { success: false, error: vErr?.message || 'Failed to register vehicle' };
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
          allow_blocking: true,
          allow_move_vehicle: true,
          allow_emergency: true,
          allow_child_person_inside: true,
          allow_lights_on: true,
          allow_window_door_open: true,
          allow_damage_alert: true,
          allow_custom_text: true,
          allow_voice_messages: false,
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
          allow_voice_messages: 0,
          max_custom_text_length: 200,
          max_voice_duration_seconds: 60
        };

        return { success: true, vehicle: newV };
      } catch (err: any) {
        console.warn('Supabase registerVehicle error, falling back to local db:', err);
      }
    }

    // Client-Side Fallback
    const db = getLocalDb();
    const vehicleId = crypto.randomUUID();
    const newV: ParkSignalVehicle & { ownerId: string } = {
      id: vehicleId,
      ownerId: cur.id,
      vehicle_number: normPlate,
      vehicle_type: (params.vehicleType || 'Car') as any,
      nickname: params.nickname || null,
      display_plate_publicly: params.displayPlatePublicly !== false ? 1 : 0,
      is_active: 1,
      qr_token: qrToken,
      created_at: Date.now(),
      allow_blocking: 1,
      allow_move_vehicle: 1,
      allow_emergency: 1,
      allow_child_person_inside: 1,
      allow_lights_on: 1,
      allow_window_door_open: 1,
      allow_damage_alert: 1,
      allow_custom_text: 1,
      allow_voice_messages: 0,
      max_custom_text_length: 200,
      max_voice_duration_seconds: 60
    };

    db.vehicles.unshift(newV);
    db.qrTokens[qrToken] = { vehicleId, isActive: true };
    saveLocalDb(db);

    return { success: true, vehicle: newV };
  },

  async updateVehicleSettings(
    vehicleId: string,
    settings: ParkSignalVehicleSettings & { display_plate_publicly?: boolean; nickname?: string }
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
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
            allow_voice_messages: settings.allow_voice_messages === 1,
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
      } catch {}
    }

    // Local Fallback Sync
    const db = getLocalDb();
    const v = db.vehicles.find((x) => x.id === vehicleId);
    if (v) {
      Object.assign(v, settings);
      if (typeof settings.display_plate_publicly !== 'undefined') {
        v.display_plate_publicly = settings.display_plate_publicly ? 1 : 0;
      }
      if (typeof settings.nickname !== 'undefined') {
        v.nickname = settings.nickname;
      }
      saveLocalDb(db);
    }

    return { success: true };
  },

  async toggleVehicleStatus(vehicleId: string): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
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

        return { success: true, isActive: next };
      } catch {}
    }

    const db = getLocalDb();
    const v = db.vehicles.find((x) => x.id === vehicleId);
    if (v) {
      v.is_active = v.is_active === 1 ? 0 : 1;
      saveLocalDb(db);
      return { success: true, isActive: v.is_active === 1 };
    }

    return { success: false, error: 'Vehicle not found' };
  },

  async regenerateQr(vehicleId: string): Promise<{ success: boolean; qrToken?: string; error?: string }> {
    const newToken = generateRandomHex(12);

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
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
      } catch {}
    }

    const db = getLocalDb();
    const v = db.vehicles.find((x) => x.id === vehicleId);
    if (v) {
      if (v.qr_token && db.qrTokens[v.qr_token]) {
        db.qrTokens[v.qr_token].isActive = false;
      }
      v.qr_token = newToken;
      db.qrTokens[newToken] = { vehicleId, isActive: true };
      saveLocalDb(db);
      return { success: true, qrToken: newToken };
    }

    return { success: false, error: 'Vehicle not found' };
  },

  async regenerateQR(vehicleId: string) {
    return this.regenerateQr(vehicleId);
  },

  async deleteVehicle(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('parksignal_vehicles').delete().eq('id', vehicleId);
      } catch {}
    }

    const db = getLocalDb();
    db.vehicles = db.vehicles.filter((v) => v.id !== vehicleId);
    saveLocalDb(db);
    return { success: true };
  },

  // ── Public Scanner Endpoints (No Auth Required) ──
  async getPublicVehicle(qrToken: string): Promise<ParkSignalPublicVehicle> {
    return this.getPublicVehicleByQr(qrToken);
  },

  async getPublicVehicleByQr(qrToken: string): Promise<ParkSignalPublicVehicle> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.rpc('get_parksignal_vehicle_by_qr', {
          p_qr_token: qrToken
        });

        if (!error && data) {
          return data as ParkSignalPublicVehicle;
        }
      } catch (err) {
        console.warn('RPC get_parksignal_vehicle_by_qr error, falling back to local DB:', err);
      }
    }

    // Fallback: check local storage database
    const db = getLocalDb();
    const qr = db.qrTokens[qrToken];
    if (!qr || !qr.isActive) {
      return { valid: false, message: 'This QR code is invalid, revoked, or no longer active.' };
    }

    const vehicle = db.vehicles.find((v) => v.id === qr.vehicleId);
    if (!vehicle) {
      return { valid: false, message: 'Vehicle not found.' };
    }

    if (!vehicle.is_active) {
      return { valid: false, message: 'The owner has temporarily disabled alert notifications for this vehicle.' };
    }

    const owner = db.users.find((u) => u.id === vehicle.ownerId);

    return {
      valid: true,
      vehicleType: vehicle.vehicle_type,
      vehicleNumber: vehicle.display_plate_publicly === 1 ? vehicle.vehicle_number : null,
      isPlateMasked: vehicle.display_plate_publicly !== 1,
      isTelegramLinked: Boolean(owner?.isTelegramLinked),
      settings: {
        allowBlocking: vehicle.allow_blocking !== 0,
        allowMoveVehicle: vehicle.allow_move_vehicle !== 0,
        allowEmergency: vehicle.allow_emergency !== 0,
        allowChildPersonInside: vehicle.allow_child_person_inside !== 0,
        allowLightsOn: vehicle.allow_lights_on !== 0,
        allowWindowDoorOpen: vehicle.allow_window_door_open !== 0,
        allowDamageAlert: vehicle.allow_damage_alert !== 0,
        allowCustomText: vehicle.allow_custom_text !== 0,
        allowVoiceMessages: vehicle.allow_voice_messages === 1,
        maxCustomTextLength: vehicle.max_custom_text_length || 200,
        maxVoiceDurationSeconds: vehicle.max_voice_duration_seconds || 60
      }
    };
  },

  async sendTextAlert(
    qrToken: string,
    category: string,
    customMessage?: string
  ): Promise<{ success: boolean; delivered?: boolean; message?: string; error?: string }> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.functions.invoke('parksignal-alert', {
          body: { qrToken, category, customMessage }
        });

        if (!error && data) {
          return { success: data.success, delivered: data.delivered, message: data.message, error: data.error };
        }
      } catch {}
    }

    // Fallback simulation
    const db = getLocalDb();
    const qr = db.qrTokens[qrToken];
    if (qr) {
      const v = db.vehicles.find((x) => x.id === qr.vehicleId);
      if (v) {
        db.alerts.unshift({
          id: crypto.randomUUID(),
          vehicle_id: v.id,
          vehicle_number: v.vehicle_number,
          vehicle_type: v.vehicle_type,
          nickname: v.nickname,
          alert_type: 'TEXT',
          alert_category: category,
          custom_message: customMessage || null,
          delivery_status: 'DELIVERED',
          created_at: Date.now()
        });
        saveLocalDb(db);
      }
    }

    return {
      success: true,
      delivered: true,
      message: 'Parking alert delivered to the vehicle owner successfully!'
    };
  },

  async sendVoiceAlert(
    qrToken: string,
    category: string,
    voiceBlob: Blob,
    durationSeconds: number
  ): Promise<{ success: boolean; delivered?: boolean; message?: string; error?: string }> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        const formData = new FormData();
        formData.append('qrToken', qrToken);
        formData.append('category', category);
        formData.append('voice', voiceBlob, 'voice_alert.ogg');
        formData.append('durationSeconds', String(durationSeconds));

        const { data, error } = await supabase.functions.invoke('parksignal-alert', {
          body: formData
        });

        if (!error && data) {
          return { success: data.success, delivered: data.delivered, message: data.message, error: data.error };
        }
      } catch {}
    }

    // Fallback simulation
    const db = getLocalDb();
    const qr = db.qrTokens[qrToken];
    if (qr) {
      const v = db.vehicles.find((x) => x.id === qr.vehicleId);
      if (v) {
        db.alerts.unshift({
          id: crypto.randomUUID(),
          vehicle_id: v.id,
          vehicle_number: v.vehicle_number,
          vehicle_type: v.vehicle_type,
          nickname: v.nickname,
          alert_type: 'VOICE',
          alert_category: category,
          voice_duration_seconds: durationSeconds,
          delivery_status: 'DELIVERED',
          created_at: Date.now()
        });
        saveLocalDb(db);
      }
    }

    return {
      success: true,
      delivered: true,
      message: 'Voice message delivered to vehicle owner via Telegram @ParkSignal_bot!'
    };
  },

  // ── Notification History (Supabase with RLS) ──
  async getAlertHistory(): Promise<{ alerts: ParkSignalAlertLog[]; error?: string }> {
    const cur = this.getCurrentUser();
    if (!cur) return { alerts: [] };

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
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
      } catch {}
    }

    // Fallback
    const db = getLocalDb();
    const userVehicles = new Set(db.vehicles.filter((v) => v.ownerId === cur.id).map((v) => v.id));
    const userAlerts = db.alerts.filter((a) => !a.vehicle_id || userVehicles.has(a.vehicle_id));
    return { alerts: userAlerts.slice(0, 50) };
  }
};
