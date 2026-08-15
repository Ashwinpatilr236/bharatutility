import React, { useState } from 'react';
import { adminStore } from '../../../services/adminStore';
import { OpportunityItem } from '../../../types/admin';
import {
  Sparkles,
  TrendingUp,
  Search,
  Inbox,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Layers,
  Award,
  Zap,
  Clock
} from 'lucide-react';

import { AdminSection } from '../../../types/admin';

interface AdminOpportunityCenterProps {
  onActionClick?: (opp: OpportunityItem) => void;
  onNavigate?: (section: AdminSection) => void;
}

export const AdminOpportunityCenter: React.FC<AdminOpportunityCenterProps> = ({
  onActionClick,
  onNavigate,
}) => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>(adminStore.getOpportunities());

  const handleStatusChange = (id: string, status: OpportunityItem['status']) => {
    adminStore.updateOpportunityStatus(id, status);
    setOpportunities([...adminStore.getOpportunities()]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-purple-500" /> Utility Opportunity Center
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Algorithmic prioritization engine ranking new utility opportunities based on real Indian search volume, user requests, and traffic momentum.
          </p>
        </div>
      </div>

      {/* Opportunity Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {opportunities.map((opp) => {
          const score = opp.score;
          const isHighPriority = score >= 85;

          return (
            <div
              key={opp.id}
              className={`p-6 rounded-2xl bg-white dark:bg-neutral-900 border transition-all shadow-xs flex flex-col justify-between ${
                isHighPriority
                  ? 'border-accent/40 dark:border-accent/40 ring-1 ring-accent/20'
                  : 'border-neutral-200/80 dark:border-neutral-800'
              }`}
            >
              <div className="space-y-4">
                {/* Score & Type Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1 ${
                        score >= 90
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : score >= 80
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      Score: {score}/100
                    </span>

                    <span className="text-[10.5px] px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold uppercase">
                      {opp.type.replace('_', ' ')}
                    </span>
                  </div>

                  <span
                    className={`text-[10.5px] font-bold uppercase ${
                      opp.status === 'open'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : opp.status === 'in_progress'
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    ● {opp.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {opp.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                    {opp.description}
                  </p>
                </div>

                {/* Score Factors Breakdown */}
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Opportunity Score Breakdown
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300">
                      <span>Search Demand:</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {opp.scoreBreakdown.searchVolume}/40
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300">
                      <span>User Requests:</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {opp.scoreBreakdown.userRequests}/35
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300">
                      <span>Traffic Growth:</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {opp.scoreBreakdown.trafficTrend}/25
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300">
                      <span>Execution Speed:</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">
                        {opp.scoreBreakdown.competitionOrEase}/15
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/40">
                    <span className="text-[10px] text-neutral-400 block">Searches</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {opp.metrics.searchCount} / mo
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/40">
                    <span className="text-[10px] text-neutral-400 block">Requests</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {opp.metrics.requestCount} users
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/40">
                    <span className="text-[10px] text-neutral-400 block">Growth</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {opp.metrics.growthRate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleStatusChange(opp.id, opp.status === 'open' ? 'in_progress' : 'completed')}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  {opp.status === 'open' ? 'Mark In Progress' : 'Mark Completed'}
                </button>

                <button
                  onClick={() => {
                    if (onActionClick) {
                      onActionClick(opp);
                    } else if (onNavigate) {
                      onNavigate('tools');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {opp.recommendedAction} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
