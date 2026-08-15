import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Sliders,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle2,
  Archive,
  X,
  Zap,
} from 'lucide-react';
import { adminStore } from '../../services/adminStore';
import { AdminNotification, AdminSection, NotificationRuleConfig } from '../../types/admin';

interface AdminNotificationBellProps {
  onNavigateSection?: (section: AdminSection) => void;
}

export const AdminNotificationBell: React.FC<AdminNotificationBellProps> = ({ onNavigateSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>(adminStore.getNotifications());
  const [rules, setRules] = useState<NotificationRuleConfig[]>(adminStore.getNotificationRules());
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'archived'>('all');
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setNotifications(adminStore.getNotifications());
      setRules(adminStore.getNotificationRules());
    });
    return unsub;
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'archived') return n.status === 'archived';
    if (filter === 'critical') return n.severity === 'critical' || n.severity === 'high';
    return n.status !== 'archived'; // 'all' excludes archived unless on archived tab
  });

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    adminStore.markNotificationAsRead(id);
  };

  const handleArchive = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    adminStore.archiveNotification(id);
  };

  const handleMarkAllRead = () => {
    adminStore.markAllNotificationsAsRead();
  };

  const handleClearAll = () => {
    if (confirm('Clear all notifications?')) {
      adminStore.clearNotifications();
    }
  };

  const handleNotificationClick = (n: AdminNotification) => {
    if (n.status === 'unread') {
      adminStore.markNotificationAsRead(n.id);
    }
    if (n.targetSection && onNavigateSection) {
      onNavigateSection(n.targetSection);
      setIsOpen(false);
    }
  };

  const handleToggleRule = (id: string, enabled: boolean) => {
    adminStore.updateNotificationRule(id, { enabled });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-hidden"
        title="Admin Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                Admin Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-accent text-white">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsRulesModalOpen(true);
                  setIsOpen(false);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Alert Rules Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1 px-3 py-2 bg-neutral-50/70 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800 text-[11px]">
            {(['all', 'unread', 'critical', 'archived'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded-md font-semibold capitalize transition-colors ${
                  filter === f
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500/70 mb-1" />
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">No notifications</p>
                <p className="text-[11px]">All administrative events are up to date.</p>
              </div>
            ) : (
              filteredNotifications.map(n => {
                const isUnread = n.status === 'unread';

                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 transition-colors cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-start gap-2.5 ${
                      isUnread ? 'bg-accent/5 dark:bg-accent/10' : ''
                    }`}
                  >
                    {/* Severity Icon */}
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        n.severity === 'critical'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                          : n.severity === 'high'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                          : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30'
                      }`}
                    >
                      {n.severity === 'critical' ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : n.severity === 'high' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${isUnread ? 'font-bold text-neutral-900 dark:text-white' : 'font-medium text-neutral-700 dark:text-neutral-300'}`}>
                          {n.title}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5">
                        <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                        
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          {isUnread && (
                            <button
                              onClick={e => handleMarkAsRead(n.id, e)}
                              className="hover:text-accent font-semibold"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={e => handleArchive(n.id, e)}
                            className="hover:text-neutral-600 dark:hover:text-neutral-200"
                            title="Archive"
                          >
                            <Archive className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between text-[11px] px-3">
              <span className="text-neutral-400">{notifications.length} total events</span>
              <button
                onClick={handleClearAll}
                className="text-neutral-400 hover:text-rose-600 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear all</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Alert Rules Settings Modal */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Notification & Alert Rules Engine
                </h3>
              </div>
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Customize event triggers and severity thresholds. Alerts will automatically notify administrators when triggered.
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 dark:text-white">{rule.title}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase ${
                          rule.severity === 'critical'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                            : rule.severity === 'high'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">{rule.description}</p>
                  </div>

                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={e => handleToggleRule(rule.id, e.target.checked)}
                    className="w-4 h-4 accent-accent rounded"
                  />
                </div>
              ))}
            </div>

            <div className="pt-3 flex justify-end border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 shadow-2xs"
              >
                Save Alert Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
