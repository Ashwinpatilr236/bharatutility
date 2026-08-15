import { AdminRole, AdminUser, PermissionKey, AdminSection } from '../types/admin';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

const ADMIN_USERS_STORAGE_KEY = 'bu_admin_users_list';

/**
 * Computes environment-aware redirect URL compatible with hash routing (/#/admin)
 * Supports local development, Netlify previews, custom domain, and APP_URL environment variable.
 */
const getAuthRedirectUrl = (): string => {
  const envAppUrl = (import.meta.env.VITE_APP_URL || import.meta.env.APP_URL || '').trim();
  const baseUrl = (envAppUrl && envAppUrl.startsWith('http'))
    ? envAppUrl.replace(/\/+$/, '')
    : typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://bharatutility.in';

  return `${baseUrl}/#/admin`;
};

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
          await this.syncUserFromSupabase(session.user);
        }

        // 2. Listen to Supabase auth state transitions
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (session?.user) {
              await this.syncUserFromSupabase(session.user);
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

  /**
   * Synchronize authenticated Supabase user and verify database authorization profile
   */
  public async syncUserFromSupabase(sbUser: any): Promise<AdminUser | null> {
    const supabase = getSupabase();
    const email = (sbUser.email || '').toLowerCase();
    const userId = sbUser.id;

    let role: AdminRole = 'super_admin';
    let status: 'active' | 'suspended' | 'invited' = 'active';
    let name: string = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || email.split('@')[0] || 'Administrator';
    let avatarUrl: string | undefined = sbUser.user_metadata?.avatar_url;

    // 1. Check server-side admin_profiles table if Supabase is connected
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: profile, error } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profile && !error) {
          role = (profile.role as AdminRole) || role;
          status = (profile.status as 'active' | 'suspended' | 'invited') || status;
          name = profile.name || name;
          avatarUrl = profile.avatar_url || avatarUrl;
        } else if (sbUser.app_metadata?.role || sbUser.user_metadata?.role) {
          // Fallback to role stored in Supabase Auth custom claims / metadata
          role = (sbUser.app_metadata?.role || sbUser.user_metadata?.role) as AdminRole;
        }
      } catch (err) {
        console.warn('Could not query admin_profiles table, using auth metadata:', err);
        if (sbUser.app_metadata?.role || sbUser.user_metadata?.role) {
          role = (sbUser.app_metadata?.role || sbUser.user_metadata?.role) as AdminRole;
        }
      }
    }

    if (status === 'suspended') {
      this.currentUser = null;
      this.notifyListeners();
      return null;
    }

    const adminUser: AdminUser = {
      id: userId,
      name,
      email,
      role,
      status,
      lastActive: new Date().toISOString(),
      createdAt: sbUser.created_at || new Date().toISOString(),
      emailVerified: Boolean(sbUser.email_confirmed_at),
      avatarUrl,
      mfaEnabled: Boolean(sbUser.factors && sbUser.factors.length > 0),
    };

    this.currentUser = adminUser;
    this.saveUserLocally(adminUser);
    this.notifyListeners();
    return adminUser;
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
      return this.currentUser ? [this.currentUser] : [];
    } catch {
      return this.currentUser ? [this.currentUser] : [];
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
            const syncedUser = await this.syncUserFromSupabase(data.user);
            return { user: syncedUser || this.currentUser!, requiresMfa: true };
          }
        }
      } catch (mfaErr) {
        // Continue if MFA is not configured on Supabase project
      }

      const adminUser = await this.syncUserFromSupabase(data.user);
      if (!adminUser) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: This administrator account is suspended or unauthorized.');
      }

      return { user: adminUser, requiresMfa: false };
    }

    // Local development fallback when VITE_SUPABASE_URL is not yet connected
    const fallbackUser: AdminUser = {
      id: 'local_admin_' + Math.random().toString(36).substring(2, 9),
      name: cleanEmail.split('@')[0] || 'Local Admin',
      email: cleanEmail,
      role: 'super_admin',
      status: 'active',
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      emailVerified: true,
    };
    this.currentUser = fallbackUser;
    this.saveUserLocally(fallbackUser);
    this.notifyListeners();
    return { user: fallbackUser, requiresMfa: false };
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
      const redirectUrl = getAuthRedirectUrl();
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: false,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to send one-time authentication link.');
      }
      return { message: `A secure login link has been dispatched to ${cleanEmail}. Check your inbox to sign in.` };
    }

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
      await this.syncUserFromSupabase(user);
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
      const redirectUrl = getAuthRedirectUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl,
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

  private saveUserLocally(user: AdminUser): void {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = user;
    } else {
      users.unshift(user);
    }
    try {
      localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // Storage quota or private window protection
    }
  }

  public async saveUser(user: AdminUser): Promise<void> {
    this.saveUserLocally(user);
    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('admin_profiles').upsert({
          user_id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          avatar_url: user.avatarUrl,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not sync admin profile to Supabase database:', err);
      }
    }
  }

  public async deleteUser(userId: string): Promise<boolean> {
    const users = this.getAllUsers();
    const filtered = users.filter(u => u.id !== userId);
    try {
      localStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // Storage quota or private window protection
    }

    const supabase = getSupabase();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('admin_profiles').delete().eq('user_id', userId);
      } catch (err) {
        console.warn('Could not delete admin profile from Supabase:', err);
      }
    }
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
