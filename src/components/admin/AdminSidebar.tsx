import React from 'react';
import { AdminSection, AdminRole } from '../../types/admin';
import { adminAuth } from '../../services/adminAuthService';
import {
  LayoutDashboard,
  Wrench,
  FolderTree,
  Inbox,
  MessageSquare,
  BarChart3,
  Search,
  Sparkles,
  Database,
  DollarSign,
  Globe,
  Share2,
  BellRing,
  Palette,
  Users,
  Flag,
  Activity,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Shield,
  X,
  Layout,
  Link2,
  ShieldCheck,
  Split,
  PlusCircle,
  TrendingUp,
} from 'lucide-react';

interface AdminSidebarProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onReturnToPublic: () => void;
}

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  category: 'core' | 'content' | 'intelligence' | 'data' | 'growth' | 'system';
}

const NAV_ITEMS: NavItem[] = [
  // Core
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'core' },
  { id: 'revenue', label: 'Revenue & RPM', icon: DollarSign, badge: 'Telemetry', category: 'core' },
  { id: 'homepage', label: 'Homepage Builder', icon: Layout, category: 'core' },

  // Content & Tools
  { id: 'tools', label: 'Tools Registry', icon: Wrench, category: 'content' },
  { id: 'tool-factory', label: 'Tool Factory', icon: PlusCircle, badge: 'Wizard', category: 'content' },
  { id: 'categories', label: 'Categories', icon: FolderTree, category: 'content' },

  // User interactions
  { id: 'requests', label: 'Tool Requests', icon: Inbox, category: 'content' },
  { id: 'messages', label: 'Contact Messages', icon: MessageSquare, category: 'content' },

  // SEO & Routing
  { id: 'redirects', label: 'Redirects & 404s', icon: Link2, category: 'intelligence' },
  { id: 'seo-health', label: 'SEO Health Center', icon: ShieldCheck, badge: 'Audit', category: 'intelligence' },
  { id: 'search-insights', label: 'Search Insights', icon: Search, badge: 'Live', category: 'intelligence' },
  { id: 'opportunity-center', label: 'Opportunity Center', icon: Sparkles, badge: 'AI', category: 'intelligence' },

  // Data
  { id: 'dynamic-data', label: 'Dynamic Data', icon: Database, category: 'data' },

  // Growth & Monetization
  { id: 'experiments', label: 'A/B Experiments', icon: Split, category: 'growth' },
  { id: 'ads', label: 'Ads Manager', icon: DollarSign, category: 'growth' },
  { id: 'seo', label: 'SEO Config', icon: Globe, category: 'growth' },
  { id: 'social', label: 'Social Media', icon: Share2, category: 'growth' },
  { id: 'announcements', label: 'Announcements', icon: BellRing, category: 'growth' },
  { id: 'appearance', label: 'Appearance', icon: Palette, category: 'growth' },

  // System
  { id: 'users', label: 'Admin Users', icon: Users, category: 'system' },
  { id: 'feature-flags', label: 'Feature Flags', icon: Flag, category: 'system' },
  { id: 'system-health', label: 'System Health', icon: Activity, category: 'system' },
  { id: 'activity-log', label: 'Activity Log', icon: History, category: 'system' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'system' },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onSelectSection,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onReturnToPublic,
}) => {
  const currentUser = adminAuth.getCurrentUser();

  const handleNavClick = (section: AdminSection) => {
    onSelectSection(section);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            BU
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">
                  BharatUtility
                </span>
                <span className="px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono font-semibold text-accent uppercase">
                  Admin
                </span>
              </div>
              <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 truncate">
                Master Control Center
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = currentSection === item.id;
          const isAllowed = adminAuth.canAccessSection(item.id);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => isAllowed && handleNavClick(item.id)}
              disabled={!isAllowed}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-accent text-white font-semibold shadow-sm'
                  : isAllowed
                  ? 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-neutral-100'
                  : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed opacity-60'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : ''}`} />
              
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile / Public Return Footer */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
        <button
          onClick={onReturnToPublic}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Return to Public Website"
        >
          <ExternalLink className="w-4 h-4 shrink-0 text-accent" />
          {!isCollapsed && <span className="font-medium text-xs">Public Website</span>}
        </button>

        {!isCollapsed && currentUser && (
          <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2.5 px-1">
            <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center text-xs font-bold shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {currentUser.name}
              </span>
              <div className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-accent" />
                <span className="text-[10px] text-accent font-medium capitalize truncate">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 z-30 sticky top-0 h-screen ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
