import React, { useState, useEffect } from 'react';
import { AdminSection, AdminUser, AdminRole } from '../../types/admin';
import { adminAuth } from '../../services/adminAuthService';
import { adminStore } from '../../services/adminStore';

// Layout Components
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminQuickActions } from './AdminQuickActions';

// Lazy Loaded Section Views for isolated admin bundle chunks
const AdminDashboard = React.lazy(() => import('./sections/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminRevenue = React.lazy(() => import('./sections/AdminRevenue').then(m => ({ default: m.AdminRevenue })));
const AdminHomepageBuilder = React.lazy(() => import('./sections/AdminHomepageBuilder').then(m => ({ default: m.AdminHomepageBuilder })));
const AdminRedirects = React.lazy(() => import('./sections/AdminRedirects').then(m => ({ default: m.AdminRedirects })));
const AdminSeoHealth = React.lazy(() => import('./sections/AdminSeoHealth').then(m => ({ default: m.AdminSeoHealth })));
const AdminToolFactory = React.lazy(() => import('./sections/AdminToolFactory').then(m => ({ default: m.AdminToolFactory })));
const AdminExperiments = React.lazy(() => import('./sections/AdminExperiments').then(m => ({ default: m.AdminExperiments })));
const AdminTools = React.lazy(() => import('./sections/AdminTools').then(m => ({ default: m.AdminTools })));
const AdminCategories = React.lazy(() => import('./sections/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminRequests = React.lazy(() => import('./sections/AdminRequests').then(m => ({ default: m.AdminRequests })));
const AdminMessages = React.lazy(() => import('./sections/AdminMessages').then(m => ({ default: m.AdminMessages })));
const AdminSearchInsights = React.lazy(() => import('./sections/AdminSearchInsights').then(m => ({ default: m.AdminSearchInsights })));
const AdminOpportunityCenter = React.lazy(() => import('./sections/AdminOpportunityCenter').then(m => ({ default: m.AdminOpportunityCenter })));
const AdminDynamicData = React.lazy(() => import('./sections/AdminDynamicData').then(m => ({ default: m.AdminDynamicData })));
const AdminElectricityTariffs = React.lazy(() => import('./sections/AdminElectricityTariffs').then(m => ({ default: m.AdminElectricityTariffs })));
const AdminAds = React.lazy(() => import('./sections/AdminAds').then(m => ({ default: m.AdminAds })));
const AdminSEO = React.lazy(() => import('./sections/AdminSEO').then(m => ({ default: m.AdminSEO })));
const AdminSocial = React.lazy(() => import('./sections/AdminSocial').then(m => ({ default: m.AdminSocial })));
const AdminAnnouncements = React.lazy(() => import('./sections/AdminAnnouncements').then(m => ({ default: m.AdminAnnouncements })));
const AdminAppearance = React.lazy(() => import('./sections/AdminAppearance').then(m => ({ default: m.AdminAppearance })));
const AdminUsers = React.lazy(() => import('./sections/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminFeatureFlags = React.lazy(() => import('./sections/AdminFeatureFlags').then(m => ({ default: m.AdminFeatureFlags })));
const AdminSystemHealth = React.lazy(() => import('./sections/AdminSystemHealth').then(m => ({ default: m.AdminSystemHealth })));
const AdminActivityLog = React.lazy(() => import('./sections/AdminActivityLog').then(m => ({ default: m.AdminActivityLog })));
const AdminSettings = React.lazy(() => import('./sections/AdminSettings').then(m => ({ default: m.AdminSettings })));
import { AdminCommandPalette } from './AdminCommandPalette';

// Icons for Auth & Gates
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Zap,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  KeyRound,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';

interface AdminViewProps {
  onReturnToPublic: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  initialSection?: AdminSection;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onReturnToPublic,
  isDarkMode,
  onToggleTheme,
  initialSection = 'dashboard',
}) => {
  const [currentSection, setCurrentSection] = useState<AdminSection>(initialSection);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(adminAuth.getCurrentUser());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState('');

  // Auth State
  const [authMode, setAuthMode] = useState<'password' | 'otp' | 'mfa' | 'reset'>('password');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsub = adminAuth.subscribe(user => setCurrentUser(user));
    return unsub;
  }, []);

  // Keyboard shortcut listener for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your administrator email address.');
      return;
    }

    setIsLoggingIn(true);
    try {
      if (authMode === 'password') {
        if (!loginPassword) {
          setLoginError('Please enter your administrator password.');
          setIsLoggingIn(false);
          return;
        }

        const result = await adminAuth.loginWithPassword(
          loginIdentifier.trim(),
          loginPassword
        );

        if (result.requiresMfa) {
          setAuthMode('mfa');
          setLoginSuccess('Password verified. Enter your 6-digit Authenticator MFA code.');
          return;
        }

        adminStore.logActivity(
          'Admin Authenticated',
          'user',
          result.user.email,
          `Role: ${result.user.role} | Verified via Supabase Auth`
        );
      } else if (authMode === 'otp') {
        if (otpToken.trim()) {
          const user = await adminAuth.verifyEmailOtp(loginIdentifier.trim(), otpToken.trim());
          adminStore.logActivity(
            'Admin Authenticated (OTP)',
            'user',
            user.email,
            `Role: ${user.role} | Verified via Supabase Email OTP`
          );
        } else {
          const result = await adminAuth.loginWithOtp(loginIdentifier.trim());
          setLoginSuccess(result.message);
        }
      } else if (authMode === 'mfa') {
        if (!mfaCode || mfaCode.trim().length < 6) {
          setLoginError('Please enter a valid 6-digit MFA code.');
          setIsLoggingIn(false);
          return;
        }
        const user = await adminAuth.verifyMfaCode(mfaCode);
        adminStore.logActivity(
          'Admin MFA Verified',
          'user',
          user.email,
          `Role: ${user.role} | Verified via Supabase MFA`
        );
      } else if (authMode === 'reset') {
        const result = await adminAuth.sendPasswordReset(loginIdentifier.trim());
        setLoginSuccess(result.message);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Render Login Gate if unauthenticated
  if (!currentUser || !adminAuth.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-neutral-100/90 dark:bg-neutral-950 flex flex-col justify-center items-center p-4 sm:p-6 select-none font-sans text-neutral-900 dark:text-neutral-100">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md shadow-indigo-600/20">
              BU
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              BharatUtility Master Admin
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Enterprise administration portal backed by Supabase Auth.
            </p>
          </div>

          {/* Auth Mode Switcher */}
          {authMode !== 'mfa' && (
            <div className="flex rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 border border-neutral-200/60 dark:border-neutral-700/60">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setLoginError('');
                  setLoginSuccess('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'password'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setLoginError('');
                  setLoginSuccess('');
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'otp'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800'
                }`}
              >
                Magic Link / OTP
              </button>
            </div>
          )}

          {/* Notification Messages */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{loginError}</div>
            </div>
          )}

          {loginSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{loginSuccess}</div>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {authMode !== 'mfa' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Administrator Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="admin@bharatutility.in"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {authMode === 'password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Administrator Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('reset');
                      setLoginError('');
                      setLoginSuccess('');
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'otp' && loginSuccess && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    6-Digit Email Code (Optional)
                  </label>
                  <span className="text-[10px] text-neutral-400">Or click email link</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpToken}
                    onChange={e => setOtpToken(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 text-sm tracking-widest font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {authMode === 'mfa' && (
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  6-Digit Authenticator Code (2FA)
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={mfaCode}
                    onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 text-sm tracking-widest font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            )}

            {authMode === 'password' && (
              <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 border-neutral-300 dark:border-neutral-700"
                  />
                  <span>Keep session signed in</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {isLoggingIn
                  ? 'Authenticating with Supabase...'
                  : authMode === 'password'
                  ? 'Sign In with Supabase'
                  : authMode === 'otp'
                  ? (otpToken.trim().length >= 6 ? 'Verify 6-Digit Email Code' : 'Send Magic Link / OTP')
                  : authMode === 'mfa'
                  ? 'Verify 2FA Code'
                  : 'Send Password Reset Email'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {authMode === 'reset' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('password')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                ← Return to Password Sign In
              </button>
            </div>
          )}

          <div className="text-center pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={onReturnToPublic}
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors underline"
            >
              ← Back to BharatUtility Public Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Permission Check for Active Section
  const isSectionAllowed = adminAuth.canAccessSection(currentSection);

  // Command Palette Items
  const navCommands = [
    { section: 'dashboard' as AdminSection, title: 'Executive Dashboard', desc: 'KPI metrics, revenue overview, traffic volume' },
    { section: 'tools' as AdminSection, title: 'Tools Registry', desc: 'Create, edit, duplicate, and publish calculators' },
    { section: 'categories' as AdminSection, title: 'Category Taxonomy', desc: 'Organize utilities into categories and adjust hierarchy' },
    { section: 'electricity-tariffs' as AdminSection, title: 'Electricity Tariffs (36 States)', desc: 'DISCOM telescopic slabs, SERC orders, Gruha Jyothi subsidy' },
    { section: 'requests' as AdminSection, title: 'Tool Requests', desc: 'Review user suggestions and convert into tools' },
    { section: 'opportunity-center' as AdminSection, title: 'Opportunity Center', desc: 'AI discovery engine for high-demand missing calculators' },
    { section: 'search-insights' as AdminSection, title: 'Search Insights', desc: 'Top searched terms, 0-result gap analysis' },
    { section: 'dynamic-data' as AdminSection, title: 'Dynamic Datasets', desc: 'Metro fuel prices, GST slabs, TRAI DTH tariffs, IBJA bullion' },
    { section: 'ads' as AdminSection, title: 'Ads Manager', desc: 'Google AdSense publisher ID & ad slot placements' },
    { section: 'seo' as AdminSection, title: 'SEO Manager', desc: 'Meta tags, OG images, sitemap, and robots.txt' },
    { section: 'announcements' as AdminSection, title: 'Site Announcements', desc: 'Top broadcast notice banners' },
    { section: 'users' as AdminSection, title: 'Admin Users & RBAC', desc: 'Manage administrators, roles, and permissions' },
    { section: 'feature-flags' as AdminSection, title: 'Feature Flags', desc: 'Toggle feature gates and beta calculator rollouts' },
    { section: 'system-health' as AdminSection, title: 'System Health', desc: 'Live latency, Supabase DB status, Gemini API' },
    { section: 'activity-log' as AdminSection, title: 'Activity Audit Trail', desc: 'Immutable audit logs and CSV export' },
    { section: 'settings' as AdminSection, title: 'Platform Settings', desc: 'Full JSON backup download & restore' },
  ];

  const filteredCommands = navCommands.filter(
    cmd =>
      cmd.title.toLowerCase().includes(cmdSearch.toLowerCase()) ||
      cmd.desc.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-100/70 dark:bg-neutral-950 flex select-none font-sans text-neutral-900 dark:text-neutral-100">
      {/* Sidebar */}
      <AdminSidebar
        currentSection={currentSection}
        onSelectSection={sec => setCurrentSection(sec)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onReturnToPublic={onReturnToPublic}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <AdminHeader
          currentSection={currentSection}
          onNavigate={sec => setCurrentSection(sec)}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenLiveSite={onReturnToPublic}
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {!isSectionAllowed ? (
            /* Restricted Access Gate */
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Access Restricted
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Your current administrative role (
                <strong className="capitalize">{currentUser.role.replace('_', ' ')}</strong>) does
                not possess the requisite permissions to view or edit this section.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentSection('dashboard')}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => adminAuth.switchRole('super_admin')}
                  className="px-4 py-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Switch to Super Admin
                </button>
              </div>
            </div>
          ) : (
            <React.Suspense
              fallback={
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 space-y-6 animate-pulse">
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-1/4"></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-28 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl"></div>
                    <div className="h-28 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl"></div>
                    <div className="h-28 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl"></div>
                  </div>
                  <div className="h-64 bg-neutral-100 dark:bg-neutral-800/60 rounded-2xl"></div>
                </div>
              }
            >
              {/* Active Section View */}
              {currentSection === 'dashboard' && (
                <AdminDashboard onNavigate={sec => setCurrentSection(sec)} />
              )}
              {currentSection === 'revenue' && (
                <AdminRevenue />
              )}
              {currentSection === 'homepage' && (
                <AdminHomepageBuilder onNavigateToTools={() => setCurrentSection('tools')} />
              )}
              {currentSection === 'redirects' && (
                <AdminRedirects />
              )}
              {currentSection === 'seo-health' && (
                <AdminSeoHealth />
              )}
              {currentSection === 'tool-factory' && (
                <AdminToolFactory onNavigateTools={() => setCurrentSection('tools')} />
              )}
              {currentSection === 'experiments' && (
                <AdminExperiments />
              )}
              {currentSection === 'tools' && (
                <AdminTools />
              )}
              {currentSection === 'categories' && (
                <AdminCategories onNavigateToTools={() => setCurrentSection('tools')} />
              )}
              {currentSection === 'requests' && (
                <AdminRequests onNavigate={sec => setCurrentSection(sec)} />
              )}
              {currentSection === 'messages' && (
                <AdminMessages />
              )}
              {currentSection === 'search-insights' && (
                <AdminSearchInsights onNavigate={sec => setCurrentSection(sec)} />
              )}
              {currentSection === 'opportunity-center' && (
                <AdminOpportunityCenter onNavigate={sec => setCurrentSection(sec)} />
              )}
              {currentSection === 'dynamic-data' && (
                <AdminDynamicData />
              )}
              {currentSection === 'electricity-tariffs' && (
                <AdminElectricityTariffs />
              )}
              {currentSection === 'ads' && (
                <AdminAds />
              )}
              {currentSection === 'seo' && (
                <AdminSEO onNavigate={sec => setCurrentSection(sec)} />
              )}
              {currentSection === 'social' && (
                <AdminSocial />
              )}
              {currentSection === 'announcements' && (
                <AdminAnnouncements />
              )}
              {currentSection === 'appearance' && (
                <AdminAppearance />
              )}
              {currentSection === 'users' && (
                <AdminUsers />
              )}
              {currentSection === 'feature-flags' && (
                <AdminFeatureFlags />
              )}
              {currentSection === 'system-health' && (
                <AdminSystemHealth />
              )}
              {currentSection === 'activity-log' && (
                <AdminActivityLog />
              )}
              {currentSection === 'settings' && (
                <AdminSettings />
              )}
            </React.Suspense>
          )}
        </main>
      </div>

      {/* Command Palette Modal (Cmd+K) */}
      <AdminCommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateSection={sec => setCurrentSection(sec)}
      />
    </div>
  );
};
