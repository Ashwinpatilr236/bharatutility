/**
 * PARKSIGNAL CLIENT SERVICE
 * Handles communication with /api/parksignal endpoints
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

// Determine API base URL: defaults to relative /api/parksignal or env variable
const API_BASE = (import.meta.env?.VITE_PARKSIGNAL_API_URL || '/api/parksignal').replace(/\/$/, '');

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
  async register(fullName: string, email: string, password: string): Promise<{ success: boolean; token?: string; user?: ParkSignalUser; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Registration failed' };
      if (data.token && data.user) {
        this.setSession(data.token, data.user);
      }
      return { success: true, token: data.token, user: data.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during registration' };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; token?: string; user?: ParkSignalUser; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Invalid credentials' };
      if (data.token && data.user) {
        this.setSession(data.token, data.user);
      }
      return { success: true, token: data.token, user: data.user };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during login' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(false),
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearSession();
    }
  },

  // ── Profile Management ──
  async getProfile(): Promise<{ user?: ParkSignalUser; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to fetch profile' };
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return { user: data.user };
    } catch (err: any) {
      return { error: err?.message || 'Network error' };
    }
  },

  async updateProfile(fullName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify({ fullName }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      const current = this.getCurrentUser();
      if (current) {
        current.fullName = fullName;
        localStorage.setItem(USER_KEY, JSON.stringify(current));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/user/change-password`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/user/account`, {
        method: 'DELETE',
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      this.clearSession();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  // ── Telegram Connection Lifecycle (@ParkSignal_bot) ──
  async createTelegramLink(intent: 'CONNECT' | 'RECONNECT' = 'CONNECT'): Promise<{ success: boolean; deepLink?: string; token?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/telegram/create-link-token`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ intent }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, deepLink: data.deepLink, token: data.token };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  async disconnectTelegram(): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/telegram/disconnect`, {
        method: 'POST',
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      const current = this.getCurrentUser();
      if (current) {
        current.isTelegramLinked = false;
        current.telegramUsername = null;
        localStorage.setItem(USER_KEY, JSON.stringify(current));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  // ── Vehicles & QR Management ──
  async getVehicles(): Promise<{ vehicles: ParkSignalVehicle[]; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) return { vehicles: [], error: data.error };
      return { vehicles: data.vehicles || [] };
    } catch (err: any) {
      return { vehicles: [], error: err?.message };
    }
  },

  async registerVehicle(params: {
    vehicleNumber: string;
    vehicleType: string;
    nickname?: string;
    displayPlatePublicly?: boolean;
  }): Promise<{ success: boolean; vehicle?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, vehicle: data.vehicle };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  async updateVehicleSettings(vehicleId: string, settings: ParkSignalVehicleSettings): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/settings`, {
        method: 'PUT',
        headers: getHeaders(true),
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  async toggleVehicleStatus(vehicleId: string): Promise<{ success: boolean; isActive?: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/toggle-status`, {
        method: 'POST',
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, isActive: data.isActive };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  async regenerateQR(vehicleId: string): Promise<{ success: boolean; qrToken?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${vehicleId}/regenerate-qr`, {
        method: 'POST',
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, qrToken: data.qrToken };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  async deleteVehicle(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message };
    }
  },

  // ── Public Scanner Alerts ──
  async getPublicVehicle(qrToken: string): Promise<ParkSignalPublicVehicle> {
    try {
      const res = await fetch(`${API_BASE}/public/vehicle/${qrToken}`);
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { valid: false, message: 'Could not connect to alert service. Please verify your internet connection.' };
    }
  },

  async sendTextAlert(qrToken: string, category: string, customMessage?: string): Promise<{ success: boolean; delivered?: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/public/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken, category, customMessage }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to dispatch alert' };
      return { success: data.success, delivered: data.delivered, message: data.message, error: data.error };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  async sendVoiceAlert(qrToken: string, category: string, voiceBlob: Blob, durationSeconds: number): Promise<{ success: boolean; delivered?: boolean; message?: string; error?: string }> {
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
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to send voice alert' };
      return { success: data.success, delivered: data.delivered, message: data.message, error: data.error };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  },

  // ── Notification History ──
  async getAlertHistory(): Promise<{ alerts: ParkSignalAlertLog[]; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/alerts/history`, {
        headers: getHeaders(false),
      });
      const data = await res.json();
      if (!res.ok) return { alerts: [], error: data.error };
      return { alerts: data.alerts || [] };
    } catch (err: any) {
      return { alerts: [], error: err?.message };
    }
  }
};
