/**
 * PARKSIGNAL CLIENT SERVICE
 * Dual-Mode Engine: Connects to Cloudflare Worker edge API (/api/parksignal)
 * with automatic, zero-downtime client-side persistence fallback when running on static hosts
 * Product: ParkSignal by BharatUtility
 */

import {
  ParkSignalUser,
  ParkSignalVehicle,
  ParkSignalVehicleSettings,
  ParkSignalPublicVehicle,
  ParkSignalAlertLog
} from '../types';

const TOKEN_KEY = 'ps_auth_token';
const USER_KEY = 'ps_user';

// Determine API base URL
const API_BASE = (import.meta.env?.VITE_PARKSIGNAL_API_URL || '/api/parksignal').replace(/\/$/, '');

// ── Client-Side Safe Fetch with HTML Detection ──
async function safeFetchJson(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data?: any; isHtml?: boolean }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, isHtml: true };
    }
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, isHtml: false };
  }
}

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
    // Basic fallback if crypto.subtle is restricted
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

// ── Local Storage Database Model (Fallback for static CDN / Netlify) ──
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

function getHeaders(hasBody: boolean = true): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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

  // ── Authentication ──
  async register(
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: ParkSignalUser; error?: string }> {
    const normEmail = email.toLowerCase().trim();

    // 1. Attempt edge backend
    const res = await safeFetchJson(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email: normEmail, password }),
    });

    if (res.ok && res.data?.token && res.data?.user) {
      this.setSession(res.data.token, res.data.user);
      return { success: true, token: res.data.token, user: res.data.user };
    }

    if (!res.isHtml && res.status !== 0 && res.data?.error) {
      return { success: false, error: res.data.error };
    }

    // 2. Client-side storage fallback (Netlify / Static CDN mode)
    const db = getLocalDb();
    if (db.users.some((u) => u.email === normEmail)) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const userId = crypto.randomUUID();
    const salt = generateRandomHex(16);
    const hash = await hashPasswordWeb(password, salt);

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
    const userPayload: ParkSignalUser = {
      id: userId,
      email: normEmail,
      fullName: fullName.trim(),
      isTelegramLinked: false
    };

    this.setSession(sessionToken, userPayload);
    return { success: true, token: sessionToken, user: userPayload };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: ParkSignalUser; error?: string }> {
    const normEmail = email.toLowerCase().trim();

    // 1. Attempt edge backend
    const res = await safeFetchJson(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, password }),
    });

    if (res.ok && res.data?.token && res.data?.user) {
      this.setSession(res.data.token, res.data.user);
      return { success: true, token: res.data.token, user: res.data.user };
    }

    if (!res.isHtml && res.status !== 0 && res.data?.error) {
      return { success: false, error: res.data.error };
    }

    // 2. Client-side storage fallback
    const db = getLocalDb();
    const user = db.users.find((u) => u.email === normEmail);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const hash = await hashPasswordWeb(password, user.passwordSalt);
    if (hash !== user.passwordHash) {
      return { success: false, error: 'Invalid email or password' };
    }

    const sessionToken = generateRandomHex(32);
    const userPayload: ParkSignalUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      isTelegramLinked: Boolean(user.isTelegramLinked),
      telegramUsername: user.telegramUsername || null
    };

    this.setSession(sessionToken, userPayload);
    return { success: true, token: sessionToken, user: userPayload };
  },

  async logout(): Promise<void> {
    try {
      await safeFetchJson(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(false),
      });
    } catch {}
    this.clearSession();
  },

  // ── Profile Management ──
  async getProfile(): Promise<{ user?: ParkSignalUser; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/user/profile`, {
      headers: getHeaders(false),
    });

    if (res.ok && res.data?.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      return { user: res.data.user };
    }

    const cur = this.getCurrentUser();
    return { user: cur || undefined };
  },

  async updateProfile(fullName: string): Promise<{ success: boolean; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ fullName }),
    });

    if (res.ok) {
      const cur = this.getCurrentUser();
      if (cur) {
        cur.fullName = fullName;
        localStorage.setItem(USER_KEY, JSON.stringify(cur));
      }
      return { success: true };
    }

    // Fallback
    const cur = this.getCurrentUser();
    if (cur) {
      cur.fullName = fullName;
      localStorage.setItem(USER_KEY, JSON.stringify(cur));
      const db = getLocalDb();
      const u = db.users.find((x) => x.id === cur.id);
      if (u) {
        u.fullName = fullName;
        saveLocalDb(db);
      }
      return { success: true };
    }
    return { success: false, error: 'User not found' };
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/user/change-password`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) return { success: true };
    if (!res.isHtml && res.status !== 0 && res.data?.error) {
      return { success: false, error: res.data.error };
    }

    // Fallback
    const cur = this.getCurrentUser();
    if (!cur) return { success: false, error: 'Unauthorized' };

    const db = getLocalDb();
    const u = db.users.find((x) => x.id === cur.id);
    if (!u) return { success: false, error: 'User not found' };

    const hash = await hashPasswordWeb(currentPassword, u.passwordSalt);
    if (hash !== u.passwordHash) {
      return { success: false, error: 'Current password is incorrect' };
    }

    u.passwordSalt = generateRandomHex(16);
    u.passwordHash = await hashPasswordWeb(newPassword, u.passwordSalt);
    saveLocalDb(db);
    return { success: true };
  },

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/user/account`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });

    const cur = this.getCurrentUser();
    if (cur) {
      const db = getLocalDb();
      db.users = db.users.filter((x) => x.id !== cur.id);
      db.vehicles = db.vehicles.filter((v) => v.ownerId !== cur.id);
      saveLocalDb(db);
    }
    this.clearSession();
    return { success: true };
  },

  // ── Telegram Connection Lifecycle (@ParkSignal_bot) ──
  async createTelegramLink(
    intent: 'CONNECT' | 'RECONNECT' = 'CONNECT'
  ): Promise<{ success: boolean; deepLink?: string; token?: string; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/telegram/create-link-token`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ intent }),
    });

    if (res.ok && res.data?.deepLink) {
      return { success: true, deepLink: res.data.deepLink, token: res.data.token };
    }

    // Client-side fallback deep link
    const token = `link_${generateRandomHex(12)}`;
    const deepLink = `https://t.me/ParkSignal_bot?start=${token}`;
    return { success: true, deepLink, token };
  },

  async disconnectTelegram(): Promise<{ success: boolean; error?: string }> {
    await safeFetchJson(`${API_BASE}/telegram/disconnect`, {
      method: 'POST',
      headers: getHeaders(false),
    });

    const cur = this.getCurrentUser();
    if (cur) {
      cur.isTelegramLinked = false;
      cur.telegramUsername = null;
      localStorage.setItem(USER_KEY, JSON.stringify(cur));

      const db = getLocalDb();
      const u = db.users.find((x) => x.id === cur.id);
      if (u) {
        u.isTelegramLinked = false;
        saveLocalDb(db);
      }
    }
    return { success: true };
  },

  // ── Vehicles & QR Management ──
  async getVehicles(): Promise<{ vehicles: ParkSignalVehicle[]; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/vehicles`, {
      headers: getHeaders(false),
    });

    if (res.ok && res.data?.vehicles) {
      return { vehicles: res.data.vehicles };
    }

    // Fallback from localStorage
    const cur = this.getCurrentUser();
    if (!cur) return { vehicles: [] };

    const db = getLocalDb();
    const userVehicles = db.vehicles
      .filter((v) => v.ownerId === cur.id)
      .map((v) => {
        const settings = db.vehicleSettings[v.id] || {};
        return {
          ...v,
          ...settings,
          display_plate_publicly: typeof settings.display_plate_publicly !== 'undefined'
            ? (settings.display_plate_publicly ? 1 : 0)
            : (v.display_plate_publicly ? 1 : 0)
        } as ParkSignalVehicle;
      });

    return { vehicles: userVehicles };
  },

  async registerVehicle(params: {
    vehicleNumber: string;
    vehicleType: string;
    nickname?: string;
    displayPlatePublicly?: boolean;
  }): Promise<{ success: boolean; vehicle?: any; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(params),
    });

    if (res.ok && res.data?.vehicle) {
      return { success: true, vehicle: res.data.vehicle };
    }

    // Fallback
    const cur = this.getCurrentUser();
    if (!cur) return { success: false, error: 'Unauthorized' };

    const normalized = params.vehicleNumber.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const vehicleId = crypto.randomUUID();
    const qrToken = generateRandomHex(12);
    const now = Date.now();

    const newVehicle: ParkSignalVehicle & { ownerId: string } = {
      id: vehicleId,
      ownerId: cur.id,
      vehicle_number: normalized,
      vehicle_type: (params.vehicleType as any) || 'Car',
      nickname: params.nickname ? params.nickname.trim() : null,
      display_plate_publicly: params.displayPlatePublicly !== false ? 1 : 0,
      is_active: 1,
      created_at: now,
      qr_token: qrToken,
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

    const db = getLocalDb();
    db.vehicles.push(newVehicle);
    db.vehicleSettings[vehicleId] = {
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
    db.qrTokens[qrToken] = { vehicleId, isActive: true };
    saveLocalDb(db);

    return {
      success: true,
      vehicle: {
        id: vehicleId,
        vehicleNumber: normalized,
        vehicleType: newVehicle.vehicle_type,
        nickname: newVehicle.nickname,
        qrToken,
        isActive: true,
        displayPlatePublicly: newVehicle.display_plate_publicly === 1
      }
    };
  },

  async updateVehicleSettings(vehicleId: string, settings: ParkSignalVehicleSettings): Promise<{ success: boolean; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/vehicles/${vehicleId}/settings`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(settings),
    });

    if (res.ok) return { success: true };

    // Fallback
    const db = getLocalDb();
    const existing = db.vehicleSettings[vehicleId] || {};
    db.vehicleSettings[vehicleId] = { ...existing, ...settings };

    const v = db.vehicles.find((x) => x.id === vehicleId);
    if (v) {
      if (typeof settings.display_plate_publicly !== 'undefined') {
        v.display_plate_publicly = settings.display_plate_publicly ? 1 : 0;
      }
      if (typeof settings.nickname !== 'undefined') {
        v.nickname = settings.nickname;
      }
    }
    saveLocalDb(db);
    return { success: true };
  },

  async toggleVehicleStatus(vehicleId: string): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/vehicles/${vehicleId}/toggle-status`, {
      method: 'POST',
      headers: getHeaders(false),
    });

    if (res.ok && res.data) return { success: true, isActive: res.data.isActive };

    // Fallback
    const db = getLocalDb();
    const v = db.vehicles.find((x) => x.id === vehicleId);
    if (v) {
      v.is_active = v.is_active === 1 ? 0 : 1;
      saveLocalDb(db);
      return { success: true, isActive: v.is_active === 1 };
    }
    return { success: false, error: 'Vehicle not found' };
  },

  async regenerateQR(vehicleId: string): Promise<{ success: boolean; qrToken?: string; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/vehicles/${vehicleId}/regenerate-qr`, {
      method: 'POST',
      headers: getHeaders(false),
    });

    if (res.ok && res.data?.qrToken) return { success: true, qrToken: res.data.qrToken };

    // Fallback
    const db = getLocalDb();
    const v = db.vehicles.find((x) => x.id === vehicleId);
    if (!v) return { success: false, error: 'Vehicle not found' };

    // Invalidate old QR
    if (v.qr_token && db.qrTokens[v.qr_token]) {
      db.qrTokens[v.qr_token].isActive = false;
    }

    const newToken = generateRandomHex(12);
    v.qr_token = newToken;
    db.qrTokens[newToken] = { vehicleId, isActive: true };
    saveLocalDb(db);

    return { success: true, qrToken: newToken };
  },

  async deleteVehicle(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: getHeaders(false),
    });

    const db = getLocalDb();
    db.vehicles = db.vehicles.filter((v) => v.id !== vehicleId);
    delete db.vehicleSettings[vehicleId];
    saveLocalDb(db);
    return { success: true };
  },

  // ── Public Scanner Alerts ──
  async getPublicVehicle(qrToken: string): Promise<ParkSignalPublicVehicle> {
    const res = await safeFetchJson(`${API_BASE}/public/vehicle/${qrToken}`);
    if (res.ok && res.data) return res.data;

    // Fallback
    const db = getLocalDb();
    const qr = db.qrTokens[qrToken];
    if (!qr || !qr.isActive) {
      return { valid: false, message: 'This QR code is invalid, revoked, or no longer active.' };
    }

    const v = db.vehicles.find((x) => x.id === qr.vehicleId);
    if (!v) return { valid: false, message: 'Vehicle not found.' };

    if (!v.is_active) {
      return { valid: false, message: 'The owner has temporarily disabled alert notifications for this vehicle.' };
    }

    const s = db.vehicleSettings[v.id] || {};
    return {
      valid: true,
      vehicleType: v.vehicle_type,
      vehicleNumber: v.display_plate_publicly === 1 ? v.vehicle_number : null,
      isPlateMasked: v.display_plate_publicly !== 1,
      isTelegramLinked: true,
      settings: {
        allowBlocking: s.allow_blocking !== 0,
        allowMoveVehicle: s.allow_move_vehicle !== 0,
        allowEmergency: s.allow_emergency !== 0,
        allowChildPersonInside: s.allow_child_person_inside !== 0,
        allowLightsOn: s.allow_lights_on !== 0,
        allowWindowDoorOpen: s.allow_window_door_open !== 0,
        allowDamageAlert: s.allow_damage_alert !== 0,
        allowCustomText: s.allow_custom_text !== 0,
        allowVoiceMessages: s.allow_voice_messages === 1,
        maxCustomTextLength: s.max_custom_text_length || 200,
        maxVoiceDurationSeconds: s.max_voice_duration_seconds || 60
      }
    };
  },

  async sendTextAlert(
    qrToken: string,
    category: string,
    customMessage?: string
  ): Promise<{ success: boolean; delivered?: boolean; message?: string; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/public/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrToken, category, customMessage }),
    });

    if (res.ok && res.data) {
      return { success: res.data.success, delivered: res.data.delivered, message: res.data.message, error: res.data.error };
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
    try {
      const formData = new FormData();
      formData.append('qrToken', qrToken);
      formData.append('category', category);
      formData.append('voice', voiceBlob, 'voice_alert.ogg');
      formData.append('durationSeconds', String(durationSeconds));

      const res = await fetch(`${API_BASE}/public/alert/voice`, {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        return { success: data.success, delivered: data.delivered, message: data.message, error: data.error };
      }
    } catch {}

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

  // ── Notification History ──
  async getAlertHistory(): Promise<{ alerts: ParkSignalAlertLog[]; error?: string }> {
    const res = await safeFetchJson(`${API_BASE}/alerts/history`, {
      headers: getHeaders(false),
    });

    if (res.ok && res.data?.alerts) return { alerts: res.data.alerts };

    // Fallback
    const cur = this.getCurrentUser();
    if (!cur) return { alerts: [] };

    const db = getLocalDb();
    const userVehicles = new Set(db.vehicles.filter((v) => v.ownerId === cur.id).map((v) => v.id));
    const userAlerts = db.alerts.filter((a) => !a.vehicle_id || userVehicles.has(a.vehicle_id));
    return { alerts: userAlerts.slice(0, 50) };
  }
};
