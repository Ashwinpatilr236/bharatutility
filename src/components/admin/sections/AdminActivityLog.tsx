import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AdminActivityLogItem } from '../../../types/admin';
import { adminStore } from '../../../services/adminStore';

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  tool: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
  ad: <Sparkles className="w-3.5 h-3.5 text-emerald-500" />,
  user: <Shield className="w-3.5 h-3.5 text-rose-500" />,
  setting: <FileText className="w-3.5 h-3.5 text-purple-500" />,
  category: <Tag className="w-3.5 h-3.5 text-sky-500" />,
  announcement: <FileText className="w-3.5 h-3.5 text-orange-500" />,
  feature_flag: <Sparkles className="w-3.5 h-3.5 text-teal-500" />,
  dynamic_data: <Layers className="w-3.5 h-3.5 text-blue-500" />,
  seo: <FileText className="w-3.5 h-3.5 text-cyan-500" />,
};

export const AdminActivityLog: React.FC = () => {
  const [logs, setLogs] = useState<AdminActivityLogItem[]>(adminStore.getActivityLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setLogs(adminStore.getActivityLogs());
    });
    return unsub;
  }, []);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Entity Type', 'Entity Name', 'Details'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.adminName.replace(/"/g, '""')}"`,
      `"${l.adminEmail.replace(/"/g, '""')}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.entityType}"`,
      `"${(l.entityName || '').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bharatutility_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification('Audit log exported to CSV.');
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityName && log.entityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6" id="admin-activity-log-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Admin Activity & Audit Trail</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Immutable historical event log tracking all tool releases, configuration changes, SEO saves, and admin logins.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit logs by action, admin, or entity..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={entityFilter}
            onChange={e => setEntityFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Entity Types ({logs.length})</option>
            <option value="tool">Tools & Calculators</option>
            <option value="category">Categories</option>
            <option value="ad">Ad Slots</option>
            <option value="seo">SEO Settings</option>
            <option value="announcement">Announcements</option>
            <option value="user">Admin Users</option>
            <option value="feature_flag">Feature Flags</option>
            <option value="dynamic_data">Dynamic Datasets</option>
            <option value="setting">Global Settings</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-sm">
              No matching activity log entries found.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div key={log.id} className="p-5 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-neutral-100 dark:bg-neutral-800">
                      {ENTITY_ICONS[log.entityType] || <FileText className="w-3.5 h-3.5 text-neutral-500" />}
                    </span>
                    <span className="text-sm font-bold text-neutral-900 dark:text-white">
                      {log.action}
                    </span>
                    {log.entityName && (
                      <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                        {log.entityName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {log.details && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 pl-7">
                    {log.details}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-neutral-500 pl-7">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-neutral-400" />
                    <strong className="text-neutral-700 dark:text-neutral-300">{log.adminName}</strong> ({log.adminEmail})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
