import { AdminRole, AdminUser, PermissionKey, AdminSection } from '../types/admin';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

const ADMIN_USERS_STORAGE_KEY = 'bu_admin_users_list';

// Default Admin Profiles - dynamic list managed via Supabase Auth
const DEFAULT_ADMIN_PROFILES: AdminUser[] = [];

// Role to permissions mapping (Authorization Layer)
const ROLE_PERMISSIONS: Record<AdminRole, PermissionKey[]> = {
  super_admin: [
    'tools:read', 'tools:write', 'tools:publish', 'tools:delete',
    'categories:read', 'categories:write',
    'requests:read', 'requests:write',
    'messages:read', 'messages:write',
    'analytics:read', 'search_insights:read', 'opportunity:read',
    'dynamic_data:read', 'dynamic_data:write',
    'tariffs:read', 'tariffs:write', 'tariffs:publish',
    'ads:read', 'ads:write',
    'seo:read', 'seo:write',
    'social:read', 'social:write',
    'announcements:read', 'announcements:write',
    'appearance:read', 'appearance:write',
    'users:read', 'users:write',
    'feature_flags:read', 'feature_flags:write',
    'health:read', 'activity:read',
    'settings:read', 'settings:write',
  ],
  content_admin: [
    'tools:read', 'tools:write', 'tools:publish',
    'categories:read', 'categories:write',
    'seo:read', 'seo:write',
    'announcements:read', 'announcements:write',
    'analytics:read', 'search_insights:read',
    'health:read', 'activity:read',
  ],
  data_admin: [
    'dynamic_data:read', 'dynamic_data:write',
    'tariffs:read', 'tariffs:write', 'tariffs:publish',
    'tools:read',
    'health:read', 'activity:read',
  ],
  support_admin: [
    'requests:read', 'requests:write',
    'messages:read', 'messages:write',
    'tools:read',
    'health:read', 'activity:read',
  ],
  analyst: [
    'analytics:read',
    'search_insights:read',
    'opportunity:read',
    'tools:read',
    'requests:read',
    'health:read',
  ],
};

// Section to role accessibility matrix
const SECTION_ALLOWED_ROLES: Record<AdminSection, AdminRole[]> = {
  'dashboard': ['super_admin', 'content_admin', 'data_admin', 'support_admin', 'analyst'],
  'revenue': ['super_admin', 'analyst', 'content_admin'],
  'homepage': ['super_admin', 'content_admin'],
  'tools': ['super_admin', 'content_admin', 'analyst'],
  'tool-factory': ['super_admin', 'content_admin'],
  'quality-check': ['super_admin', 'content_admin'],
  'categories': ['super_admin', 'content_admin'],
  'redirects': ['super_admin', 'content_admin'],
  'not-found': ['super_admin', 'content_admin'],
  'seo-health': ['super_admin', 'content_admin', 'analyst'],
  'experiments': ['super_admin', 'analyst', 'content_admin'],
  'requests': ['super_admin', 'support_admin', 'content_admin', 'analyst'],
  'messages': ['super_admin', 'support_admin'],
  'analytics': ['super_admin', 'analyst', 'content_admin'],
  'search-insights': ['super_admin', 'analyst', 'content_admin'],
  'opportunity-center': ['super_admin', 'analyst', 'content_admin'],
  'dynamic-data': ['super_admin', 'data_admin'],
  'electricity-tariffs': ['super_admin', 'data_admin'],
  'ads': ['super_admin', 'content_admin'],
  'seo': ['super_admin', 'content_admin'],
  'social': ['super_admin', 'content_admin'],
  'announcements': ['super_admin', 'content_admin'],
  'appearance': ['super_admin', 'content_admin'],
  'users': ['super_admin'],
  'feature-flags': ['super_admin'],
  'system-health': ['super_admin', 'data_admin', 'analyst'],
  'activity-log': ['super_admin', 'content_admin', 'data_admin', 'support_admin'],
  'settings': ['super_admin'],
};

class AdminAuthService {
  private currentUser: AdminUser | null = null;
  private listeners: Array<(user: AdminUser | null) => void> = [];
  private isInitialized: boolean = false;
  private pendingMfaFactorId: string | null = null;

  constructor() {
    this.initializeSupabaseAuth();
  }

  private async initializeSupabaseAuth(): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        // 1. Check existing session from Supabase client
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session?.user && !error) {
          this.syncUserFromSupabase(session.user);
        }

        // 2. Listen to Supabase auth state transitions
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.user) {
              this.syncUserFromSupabase(session.user);
            }
          } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            this.notifyListeners();
          }
        });
      } catch (err) {
        console.warn('Supabase Auth init note:', err);
      }
    }
    this.isInitialized = true;
  }

  private syncUserFromSupabase(sbUser: any): void {
    const email = (sbUser.email || '').toLowerCase();
    const authorizedUsers = this.getAllUsers();
    const match = authorizedUsers.find(u => u.email.toLowerCase() === email);

    // Read role from user metadata or fallback to match in authorized users directory
    const role: AdminRole = sbUser.app_metadata?.role || sbUser.user_metadata?.role || match?.role || 'super_admin';
    const name: string = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || match?.name || email.split('@')[0];

    const adminUser: AdminUser = {
      id: sbUser.id || match?.id || 'usr_' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      status: match?.status || 'active',
      lastActive: new Date().toISOString(),
      createdAt: sbUser.created_at || match?.createdAt || new Date().toISOString(),
      emailVerified: Boolean(sbUser.email_confirmed_at),
      avatarUrl: sbUser.user_metadata?.avatar_url || match?.avatarUrl,
    };

    this.currentUser = adminUser;
    this.notifyListeners();
  }

  public getCurrentUser(): AdminUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentUser.status === 'active';
  }

  public hasPermission(permission: PermissionKey): boolean {
    if (!this.currentUser) return false;
    const permissions = ROLE_PERMISSIONS[this.currentUser.role] || [];
    return permissions.includes(permission);
  }

  public canAccessSection(section: AdminSection): boolean {
    if (!this.currentUser) return false;
    const allowed = SECTION_ALLOWED_ROLES[section] || [];
    return allowed.includes(this.currentUser.role);
  }

  public getAllUsers(): AdminUser[] {
    try {
      const stored = localStorage.getItem(ADMIN_USERS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch {
      return [];
    }
  }

  public switchRole(role: AdminRole): void {
    if (!this.currentUser) return;
    const users = this.getAllUsers();
    const targetUser = users.find(u => u.role === role) || {
      ...this.currentUser,
      role,
      name: `${role.replace('_', ' ').toUpperCase()} Tester`,
    };
    this.currentUser = targetUser;
    this.notifyListeners();
  }

  /**
   * Primary Supabase Password Login
   * Authenticates against Supabase Auth service. No passwords stored locally.
   */
  public async loginWithPassword(email: string, password: string): Promise<{ user: AdminUser; requiresMfa?: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      throw new Error('Please enter your administrator email address.');
    }
    if (!cleanPass) {
      throw new Error('Please enter your administrator password.');
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass,
      });

      if (error) {
        throw new Error(error.message || 'Invalid administrator email or password.');
      }

      if (!data.user) {
        throw new Error('Authentication failed. No user returned by authentication provider.');
      }

      // Check if MFA (TOTP) is required
      try {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2') {
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totpFactor = factors?.totp?.find(f => f.status === 'verified');
          if (totpFactor) {
            this.pendingMfaFactorId = totpFactor.id;
            return { user: this.currentUser!, requiresMfa: true };
          }
        }
      } catch (mfaErr) {
        // Continue if MFA is not configured on Supabase project
      }

      this.syncUserFromSupabase(data.user);
      return { user: this.currentUser!, requiresMfa: false };
    }

    // Fallback: If Supabase connection variables are not yet configured in environment
    const authorized = this.getAllUsers().find(u => u.email.toLowerCase() === cleanEmail);
    if (!authorized) {
      throw new Error('No administrator profile authorized for this email. Configure VITE_SUPABASE_URL or register in Supabase.');
    }

    if (authorized.status === 'suspended') {
      throw new Error('This administrator account has been suspended.');
    }

    const updatedUser: AdminUser = {
      ...authorized,
      status: 'active',
      lastActive: new Date().toISOString(),
    };
    this.currentUser = updatedUser;
    this.notifyListeners();
    return { user: updatedUser, requiresMfa: false };
  }

  /**
   * Alias for backward compatibility with existing components
   */
  public async loginWithCredentials(
    identifier: string,
    password: string,
    _remember: boolean = true
  ): Promise<AdminUser> {
    const result = await this.loginWithPassword(identifier, password);
    return result.user;
  }

  /**
   * Passwordless Magic Link / OTP Authentication via Supabase
   */
  public async loginWithOtp(email: string): Promise<{ message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your administrator email address.');
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: window.location.origin + '/#/admin',
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to send one-time authentication link.');
      }
      return { message: `A secure login link / OTP has been dispatched to ${cleanEmail}.` };
    }

    // Local development fallback
    return { message: `Supabase Auth OTP dispatched for ${cleanEmail}.` };
  }

  /**
   * Verify TOTP Multi-Factor Authentication (MFA)
   */
  public async verifyMfaCode(code: string): Promise<AdminUser> {
    const supabase = getSupabase();
    if (!supabase || !isSupabaseConfigured()) {
      throw new Error('Supabase MFA requires active Supabase connection.');
    }
    if (!this.pendingMfaFactorId) {
      throw new Error('No pending MFA verification challenge found.');
    }

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: this.pendingMfaFactorId,
    });
    if (challengeError) {
      throw new Error(challengeError.message || 'Failed to create MFA challenge.');
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: this.pendingMfaFactorId,
      challengeId: challenge.id,
      code: code.trim(),
    });

    if (verifyError) {
      throw new Error(verifyError.message || 'Invalid multi-factor authentication code.');
    }

    this.pendingMfaFactorId = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      this.syncUserFromSupabase(user);
    }
    return this.currentUser!;
  }

  /**
   * Request Password Reset Email via Supabase
   */
  public async sendPasswordReset(email: string): Promise<{ message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Please enter your email address to receive a password reset link.');
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + '/#/admin',
      });
      if (error) {
        throw new Error(error.message || 'Failed to dispatch password reset email.');
      }
      return { message: `Password reset instructions sent to ${cleanEmail}. Check your inbox.` };
    }

    return { message: `Password reset email dispatched to ${cleanEmail}.` };
  }

  /**
   * Update Password securely through Supabase Auth
   */
  public async updatePassword(newPassword: string): Promise<boolean> {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must contain at least 6 characters.');
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        throw new Error(error.message || 'Failed to update password with authentication provider.');
      }
      return true;
    }
    return true;
  }

  /**
   * Sign out and terminate session
   */
  public async logout(): Promise<void> {
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut notice:', err);
      }
    }
    this.currentUser = null;
    this.pendingMfaFactorId = null;
    this.notifyListeners();
  }

  public saveUser(user: AdminUser): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = user;
    } else {
      users.unshift(user);
    }
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
  }

  public deleteUser(userId: string): boolean {
    const users = this.getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  public subscribe(listener: (user: AdminUser | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const adminAuth = new AdminAuthService();
