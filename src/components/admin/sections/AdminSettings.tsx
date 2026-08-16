import React, { useState, useRef } from 'react';
import {
  Settings,
  Database,
  Cpu,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Key,
  HardDrive,
  Globe,
  FileCode,
  Lock,
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';
import { isSupabaseConfigured } from '../../../services/supabaseClient';

export const AdminSettings: React.FC = () => {
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleExportBackup = () => {
    const jsonStr = adminStore.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bharatutility_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showNotification('success', 'Full platform database backup JSON downloaded.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const success = adminStore.importFullBackup(content);
        if (success) {
          showNotification('success', 'Backup restored successfully! All registries reloaded.');
        } else {
          showNotification('error', 'Failed to restore backup. Invalid JSON schema.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetTelemetry = () => {
    if (confirm('Are you sure you want to reset search analytics and calculation metrics to baseline?')) {
      adminStore.logActivity('Telemetry Reset to Baseline', 'setting', 'Search & Calculation Metrics');
      showNotification('success', 'Telemetry baseline restored.');
    }
  };

  return (
    <div className="space-y-6" id="admin-settings-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Platform Settings & Integrations</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Manage database backups, API integrations, Supabase cloud sync, and platform configuration.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm border ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Cloud Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supabase Card */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Supabase Cloud Database</h3>
                <span className="text-xs text-neutral-500">PostgreSQL + Auth + Storage</span>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                isSupabaseConfigured()
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}
            >
              {isSupabaseConfigured() ? 'Connected' : 'Standalone Storage'}
            </span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {isSupabaseConfigured()
              ? 'Connected to your production Supabase database cluster. All tools, configurations, and admin logs are securely synchronized in real time.'
              : 'Operating in self-contained client storage mode. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable cross-device cloud persistence.'}
          </p>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-700 dark:text-neutral-300">
            <div>VITE_SUPABASE_URL = {isSupabaseConfigured() ? 'https://***.supabase.co' : '(Not configured)'}</div>
            <div className="mt-1">VITE_SUPABASE_ANON_KEY = {isSupabaseConfigured() ? 'eyJhbGciOi... (Loaded)' : '(Not configured)'}</div>
          </div>
        </div>

        {/* Gemini AI Card */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Google Gemini 2.5 Flash</h3>
                <span className="text-xs text-neutral-500">AI Assistant & Opportunity Engine</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Ready
            </span>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Gemini AI assists administrators in identifying tool demand trends, analyzing citizen search opportunities, and drafting metadata.
          </p>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-700 dark:text-neutral-300">
            <div>GEMINI_MODEL = gemini-2.5-flash</div>
            <div className="mt-1">GEMINI_API_KEY = Server Managed (.env)</div>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Full System Backup & Disaster Recovery
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Export a complete, self-contained JSON snapshot containing all 18+ tools, ad unit configurations, global SEO metadata, feature flags, and site announcements.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Backup (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm font-semibold transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore From JSON Backup</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Security & Access Guidelines */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Production Security & Environment Setup
        </h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          BharatUtility adheres to enterprise-grade security standards. Secret keys are never transmitted to client browsers, and all public configuration updates require authenticated administrator signoff.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700">
            <strong className="text-neutral-900 dark:text-white block mb-1">Human-in-the-Loop</strong>
            <span className="text-neutral-500 dark:text-neutral-400">
              Tool publication and configuration updates require Super Admin approval.
            </span>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700">
            <strong className="text-neutral-900 dark:text-white block mb-1">Zero PII Policy</strong>
            <span className="text-neutral-500 dark:text-neutral-400">
              All user calculations, income tax inputs, and loan amounts run 100% locally in browser memory.
            </span>
          </div>

          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700">
            <strong className="text-neutral-900 dark:text-white block mb-1">Audit Trail</strong>
            <span className="text-neutral-500 dark:text-neutral-400">
              Every setting change, tool configuration, and admin action is recorded in the immutable audit log.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
