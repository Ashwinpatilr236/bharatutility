import React from 'react';
import { AdminSection } from '../../types/admin';
import {
  PlusCircle,
  Inbox,
  DollarSign,
  Sparkles,
  BellRing,
  Activity,
  Globe
} from 'lucide-react';

interface AdminQuickActionsProps {
  onNavigate: (section: AdminSection) => void;
  onOpenNewToolModal?: () => void;
  onOpenNewAnnouncementModal?: () => void;
}

export const AdminQuickActions: React.FC<AdminQuickActionsProps> = ({
  onNavigate,
  onOpenNewToolModal,
  onOpenNewAnnouncementModal,
}) => {
  const actions = [
    {
      id: 'add-tool',
      label: 'Add Tool',
      description: 'Create & publish a new calculator',
      icon: PlusCircle,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20',
      action: () => {
        if (onOpenNewToolModal) onOpenNewToolModal();
        else onNavigate('tools');
      },
    },
    {
      id: 'review-requests',
      label: 'Review Requests',
      description: 'User tool suggestions & requests',
      icon: Inbox,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20',
      action: () => onNavigate('requests'),
    },
    {
      id: 'seo-health',
      label: 'SEO Health Audit',
      description: 'Review meta tags & structured schemas',
      icon: Globe,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20',
      action: () => onNavigate('seo-health'),
    },
    {
      id: 'manage-ads',
      label: 'Manage Ads',
      description: 'Ad slots, placements & publisher ID',
      icon: DollarSign,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20',
      action: () => onNavigate('ads'),
    },
    {
      id: 'search-opportunities',
      label: 'Search Opportunities',
      description: 'High-demand missing utilities',
      icon: Sparkles,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20',
      action: () => onNavigate('opportunity-center'),
    },
    {
      id: 'create-announcement',
      label: 'Create Announcement',
      description: 'Broadcast notice to website visitors',
      icon: BellRing,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20',
      action: () => {
        if (onOpenNewAnnouncementModal) onOpenNewAnnouncementModal();
        else onNavigate('announcements');
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={act.action}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-accent/40 dark:hover:border-accent/40 shadow-xs hover:shadow-sm text-left transition-all group"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${act.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-accent transition-colors truncate">
                {act.label}
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                {act.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
