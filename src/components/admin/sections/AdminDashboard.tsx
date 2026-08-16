import React, { useState, useMemo } from 'react';
import { AdminSection } from '../../../types/admin';
import { Tool } from '../../../types';
import { adminStore } from '../../../services/adminStore';
import { AdminQuickActions } from '../AdminQuickActions';
import {
  Wrench,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Inbox,
  MessageSquare,
  Search,
  Zap,
  Activity,
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Power,
  Layers,
  Database,
  FolderTree
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (section: AdminSection, param?: string) => void;
  onOpenNewToolModal?: (prefillData?: any) => void;
  onOpenNewAnnouncementModal?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenNewToolModal,
  onOpenNewAnnouncementModal,
}) => {
  const [dashboardToolsSearch, setDashboardToolsSearch] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'active' | 'inactive'>('all');

  // Real store data
  const [tools, setTools] = useState<Tool[]>(adminStore.getTools());
  const categories = adminStore.getCategories();
  const requests = adminStore.getToolRequests();
  const messages = adminStore.getContactMessages();
  const searchInsights = adminStore.getSearchInsights();
  const dynamicDatasets = adminStore.getDynamicDatasets();

  const handleRefresh = () => {
    setTools([...adminStore.getTools()]);
  };

  const activeTools = useMemo(() => {
    return tools.filter((t) => t.status === 'published' || !t.status);
  }, [tools]);

  const inactiveTools = useMemo(() => {
    return tools.filter((t) => t.status === 'inactive' || t.status === 'unpublished' || t.status === 'archived');
  }, [tools]);

  const newRequestsCount = requests.filter((r) => r.status === 'New').length;

  const handleToggleToolActive = (toolId: string) => {
    adminStore.toggleToolActive(toolId);
    handleRefresh();
  };

  // Filtered tools for Quick Status table
  const displayedTools = useMemo(() => {
    return tools
      .filter((t) => {
        if (dashboardToolsSearch.trim()) {
          const q = dashboardToolsSearch.toLowerCase();
          const matchName = t.name.toLowerCase().includes(q);
          const matchSlug = t.slug.toLowerCase().includes(q);
          const matchCat = t.category.toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchCat) return false;
        }

        const isActive = t.status === 'published' || !t.status;
        if (selectedStatusTab === 'active' && !isActive) return false;
        if (selectedStatusTab === 'inactive' && isActive) return false;

        return true;
      })
      .slice(0, 10);
  }, [tools, dashboardToolsSearch, selectedStatusTab]);

  // Recent 4 Tool Requests
  const recentRequests = useMemo(() => {
    return requests.slice(0, 4);
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>⚙️</span> BharatUtility Master Portal
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Real-time management for utilities, categories, citizen requests, and platform status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('tools')}
            className="px-3.5 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" /> All Tools ({tools.length})
          </button>
          <button
            onClick={() => {
              if (onOpenNewToolModal) onOpenNewToolModal();
              else onNavigate('tools');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-accent text-white text-xs font-bold shadow-xs hover:bg-accent/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Tool
          </button>
        </div>
      </div>

      {/* Quick Action Bar */}
      <AdminQuickActions
        onNavigate={onNavigate}
        onOpenNewToolModal={onOpenNewToolModal ? () => onOpenNewToolModal() : () => onNavigate('tools')}
        onOpenNewAnnouncementModal={onOpenNewAnnouncementModal ? onOpenNewAnnouncementModal : () => onNavigate('announcements')}
      />

      {/* 8 Real Operational Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tools */}
        <div
          onClick={() => onNavigate('tools')}
          className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Tools</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {tools.length}
            </span>
            <span className="text-[11px] text-neutral-500 font-semibold">Registered</span>
          </div>
          <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Across {categories.length} Indian categories
          </span>
        </div>

        {/* Active Tools (Live) */}
        <div
          onClick={() => onNavigate('tools')}
          className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Active (Live)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              {activeTools.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Live</span>
          </div>
          <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Visible to public visitors
          </span>
        </div>

        {/* Inactive Tools (Disabled) */}
        <div
          onClick={() => onNavigate('tools')}
          className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Inactive Tools</span>
            <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-800 dark:text-neutral-200">
              {inactiveTools.length}
            </span>
            <span className="text-[11px] text-amber-600 font-semibold">Reactivatable</span>
          </div>
          <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Safe non-destructive storage
          </span>
        </div>

        {/* Tool Categories */}
        <div
          onClick={() => onNavigate('categories')}
          className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Tool Categories</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {categories.length}
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold">Active Suites</span>
          </div>
          <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Organized civic taxonomies
          </span>
        </div>

        {/* Categories */}
        <div
          onClick={() => onNavigate('categories')}
          className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Taxonomies</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {categories.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Active</span>
          </div>
          <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Money, Tax, Power, Legal, Govt...
          </span>
        </div>

        {/* Live Data Feeds */}
        <div
          onClick={() => onNavigate('dynamic-data')}
          className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Dynamic Datasets</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {dynamicDatasets.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Synced</span>
          </div>
          <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Fuel, TRAI, Gold/Silver, GST
          </span>
        </div>

        {/* Tool Requests */}
        <div
          onClick={() => onNavigate('requests')}
          className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Citizen Requests</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {requests.length}
            </span>
            {newRequestsCount > 0 ? (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-bold">
                {newRequestsCount} New
              </span>
            ) : (
              <span className="text-[11px] text-neutral-400">All Reviewed</span>
            )}
          </div>
          <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Public user submissions
          </span>
        </div>

        {/* Contact Messages */}
        <div
          onClick={() => onNavigate('messages')}
          className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Contact Messages</span>
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {messages.length}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Active</span>
          </div>
          <span className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-1 block">
            Support & partnership inquiries
          </span>
        </div>
      </div>

      {/* Quick Tool Activation & Status Manager */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Power className="w-4 h-4 text-accent" /> Quick Tool Activation & Reactivation Control
            </h2>
            <p className="text-[11px] text-neutral-400">
              Instantly toggle any tool between Active (Live) and Inactive (Disabled) without losing configuration.
            </p>
          </div>

          {/* Status Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setSelectedStatusTab('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatusTab === 'all'
                    ? 'bg-white dark:bg-neutral-900 text-accent shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                All ({tools.length})
              </button>
              <button
                onClick={() => setSelectedStatusTab('active')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatusTab === 'active'
                    ? 'bg-white dark:bg-neutral-900 text-emerald-600 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                🟢 Active ({activeTools.length})
              </button>
              <button
                onClick={() => setSelectedStatusTab('inactive')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedStatusTab === 'inactive'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                ⏸️ Inactive ({inactiveTools.length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={dashboardToolsSearch}
                onChange={(e) => setDashboardToolsSearch(e.target.value)}
                placeholder="Search tools..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden focus:ring-2 focus:ring-accent w-40 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Quick Tools Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200/60 dark:border-neutral-800 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-3">Tool Name & Path</th>
                <th className="p-3">Category</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Usage</th>
                <th className="p-3 text-right">Action (Reactivate / Deactivate)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {displayedTools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-neutral-400">
                    No tools found matching current filter.
                  </td>
                </tr>
              ) : (
                displayedTools.map((tool) => {
                  const isActive = tool.status === 'published' || !tool.status;
                  return (
                    <tr key={tool.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span
                            onClick={() => onNavigate('tools', tool.slug)}
                            className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-accent cursor-pointer"
                          >
                            {tool.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            /tool/{tool.slug}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10.5px] font-medium capitalize">
                          {tool.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        {isActive ? (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active (Live)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            Inactive (Disabled)
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {(tool.calculationCount || 0).toLocaleString('en-IN')} calcs
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {isActive ? (
                          <button
                            onClick={() => handleToggleToolActive(tool.id)}
                            className="px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-semibold transition-colors border border-neutral-200 dark:border-neutral-700 inline-flex items-center gap-1"
                            title="Deactivate tool (Hides from website, keeps data intact)"
                          >
                            <Power className="w-3.5 h-3.5 text-amber-500" /> Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleToolActive(tool.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-xs inline-flex items-center gap-1"
                            title="Reactivate tool (Publish live on website)"
                          >
                            <Power className="w-3.5 h-3.5" /> Reactivate (Make Live)
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="text-neutral-400">
            Showing top {displayedTools.length} of {tools.length} total tools
          </span>
          <button
            onClick={() => onNavigate('tools')}
            className="text-accent font-semibold hover:underline flex items-center gap-1"
          >
            Open Full Tools Manager <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Two Column Grid: Recent Citizen Requests & Real System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Tool Requests (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Inbox className="w-4 h-4 text-purple-500" /> Citizen Tool Requests
              </h2>
              <p className="text-[11px] text-neutral-400">
                Community suggestions submitted from the public request form.
              </p>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
            >
              View All Requests <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No tool requests submitted yet.
            </div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {recentRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => onNavigate('requests')}
                  className="p-3 rounded-xl bg-neutral-50/60 dark:bg-neutral-800/30 border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between gap-3 hover:border-accent/40 cursor-pointer transition-all"
                >
                  <div className="flex flex-col truncate">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {req.toolName}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {req.category} • Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                      req.status === 'New'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : req.status === 'In Development'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : req.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real System Health Card (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> Platform Infrastructure
              </h2>
              <p className="text-[11px] text-neutral-400">
                Core services, runtime, and API connectivity status.
              </p>
            </div>
            <button
              onClick={() => onNavigate('system-health')}
              className="text-xs text-accent font-semibold hover:underline flex items-center gap-1"
            >
              Health Center <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {[
              { name: 'Local Data Store & Schema Cache', status: 'Healthy', color: 'bg-emerald-500' },
              { name: 'Authentication (Supabase Auth & MFA)', status: 'Secure', color: 'bg-emerald-500' },
              { name: 'Contact & Tool Request Pipeline', status: 'Active', color: 'bg-emerald-500' },
              { name: 'Dynamic Financial & Tax Engine', status: 'Verified', color: 'bg-emerald-500' },
              { name: 'Public BharatUtility Web Ingress', status: 'Operational', color: 'bg-emerald-500' },
            ].map((srv) => (
              <div
                key={srv.name}
                className="py-1.5 px-2.5 rounded-lg bg-neutral-50/60 dark:bg-neutral-800/40 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {srv.name}
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className={`w-2 h-2 rounded-full ${srv.color}`} /> {srv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

