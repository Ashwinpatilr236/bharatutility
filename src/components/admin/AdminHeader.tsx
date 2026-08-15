import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  Settings,
  CheckCircle2,
  AlertCircle,
  FileText,
  Zap,
  Sparkles,
} from 'lucide-react';
import { AdminSection, AdminRole, AdminUser } from '../../types/admin';
import { adminAuth } from '../../services/adminAuthService';
import { adminStore } from '../../services/adminStore';

import { AdminNotificationBell } from './AdminNotificationBell';

interface AdminHeaderProps {
  currentSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  onToggleSidebar: () => void;
  onOpenLiveSite?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenCommandPalette?: () => void;
}

const SECTION_TITLES: Record<AdminSection, string> = {
  dashboard: 'Executive Dashboard',
  revenue: 'Revenue & Monetization Analytics',
  homepage: 'Homepage Layout Builder',
  redirects: 'Redirect & 404 URL Manager',
  'not-found': '404 Broken URLs & Crawl Log',
  'seo-health': 'SEO Health & Rich Snippets',
  'tool-factory': 'Tool Factory & Quality Wizard',
  'quality-check': 'Quality Gate & Compliance Inspector',
  experiments: 'A/B Testing & Experiments',
  tools: 'Tools & Utilities Registry',
  categories: 'Category Taxonomy',
  requests: 'User Tool Requests',
  messages: 'Contact & Support Inbox',
  analytics: 'Platform Telemetry & Metrics',
  'search-insights': 'Search Discovery & Gap Analysis',
  'opportunity-center': 'Tool Opportunity Center',
  'dynamic-data': 'Dynamic External Datasets',
  'electricity-tariffs': 'Electricity Tariffs (SERC)',
  ads: 'Google AdSense & Ad Placements',
  seo: 'Global SEO & Meta Optimization',
  social: 'Social & Community Channels',
  announcements: 'Site-wide Announcements',
  appearance: 'Branding & UI Customizer',
  users: 'Admin Users & RBAC',
  'feature-flags': 'Feature Flags & Rollout',
  'system-health': 'System Health & Latency',
  'activity-log': 'Audit & Activity Log',
  settings: 'Platform Settings & Backup',
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentSection,
  onNavigate,
  onToggleSidebar,
  onOpenLiveSite,
  isDarkMode,
  onToggleTheme,
  onOpenCommandPalette,
}) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(adminAuth.getCurrentUser());
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const logs = adminStore.getActivityLogs().slice(0, 5);

  useEffect(() => {
    const unsub = adminAuth.subscribe(u => setCurrentUser(u));
    return unsub;
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = (role: AdminRole) => {
    adminAuth.switchRole(role);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    adminAuth.logout();
    setIsProfileOpen(false);
  };

  return (
    <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left side: Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Admin
          </span>
          <span className="hidden sm:inline text-neutral-300 dark:text-neutral-700">/</span>
          <h1 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
            {SECTION_TITLES[currentSection] || 'Control Center'}
          </h1>
        </div>
      </div>

      {/* Right side: Search, View Site, Notifications, Theme, User profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs transition-colors border border-neutral-200/60 dark:border-neutral-700/60"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search or jump to...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
              ⌘K
            </kbd>
          </button>
        )}

        {/* View Live Public Site */}
        {onOpenLiveSite && (
          <button
            onClick={onOpenLiveSite}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold border border-neutral-200 dark:border-neutral-700 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </button>
        )}

        {/* Notification Bell Component */}
        <AdminNotificationBell onNavigateSection={onNavigate} />

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition-colors"
          title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs uppercase shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                {currentUser?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
                {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Super Admin'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-3 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                <div className="font-bold text-xs text-neutral-900 dark:text-white">{currentUser?.name}</div>
                <div className="text-[11px] text-neutral-500 truncate">{currentUser?.email}</div>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" />
                  {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Super Admin'}
                </div>
              </div>

              {/* Quick RBAC Role Switcher */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2">
                  Preview As Role
                </div>
                {(['super_admin', 'content_admin', 'data_admin', 'support_admin', 'analyst'] as AdminRole[]).map(r => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between transition-colors ${
                      currentUser?.role === r
                        ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="capitalize">{r.replace('_', ' ')}</span>
                    {currentUser?.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Platform Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
