import React, { useState, useMemo } from 'react';
import { adminStore } from '../../../services/adminStore';
import { SearchInsightItem } from '../../../types/admin';
import {
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Filter,
  Layers,
  Wrench
} from 'lucide-react';

import { AdminSection } from '../../../types/admin';

interface AdminSearchInsightsProps {
  onCreateToolFromSearch?: (prefill: { name: string; category: string; description: string }) => void;
  onNavigate?: (section: AdminSection) => void;
}

export const AdminSearchInsights: React.FC<AdminSearchInsightsProps> = ({
  onCreateToolFromSearch,
  onNavigate,
}) => {
  const [insights, setInsights] = useState<SearchInsightItem[]>(adminStore.getSearchInsights());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'zeroResults' | 'highGrowth'>('all');

  const filteredInsights = useMemo(() => {
    return insights.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.term.toLowerCase().includes(q)) return false;
      }

      if (filterType === 'zeroResults' && item.resultFound) return false;
      if (filterType === 'highGrowth' && item.growthPercent < 25) return false;

      return true;
    });
  }, [insights, searchQuery, filterType]);

  const zeroResultCount = insights.filter((s) => !s.resultFound).length;
  const totalVolume = insights.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Search className="w-5 h-5 text-amber-500" /> Search Intelligence & Discovery Gaps
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Identify exact search terms queried by Indian users, 0-result discovery gaps, and high-growth keyword demand.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400">Total Discovery Queries</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {totalVolume.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">+24.5% vs last mo</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400">0-Result Search Gaps</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400">
              {zeroResultCount} Terms
            </span>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold uppercase">
              Opportunity
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-0.5 block">
            Searches where users found no matching calculator
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400">Search Match Rate</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-emerald-600 dark:text-emerald-400">
              {(((insights.length - zeroResultCount) / (insights.length || 1)) * 100).toFixed(1)}%
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Healthy</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queried keywords..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-1 sm:flex-none transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            All ({insights.length})
          </button>
          <button
            onClick={() => setFilterType('zeroResults')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-1 sm:flex-none transition-all ${
              filterType === 'zeroResults'
                ? 'bg-white dark:bg-neutral-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            0-Result Gaps ({zeroResultCount})
          </button>
          <button
            onClick={() => setFilterType('highGrowth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-1 sm:flex-none transition-all ${
              filterType === 'highGrowth'
                ? 'bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            High Growth (+25%)
          </button>
        </div>
      </div>

      {/* Insights Table */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-3.5">Search Query</th>
                <th className="p-3.5">Monthly Volume</th>
                <th className="p-3.5">Growth Trend</th>
                <th className="p-3.5">Status & Match</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredInsights.map((item) => (
                <tr
                  key={item.term}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="p-3.5">
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {item.term}
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        Last queried {item.lastSearched}
                      </span>
                    </div>
                  </td>

                  <td className="p-3.5 font-bold text-neutral-800 dark:text-neutral-200">
                    {item.count.toLocaleString('en-IN')} searches
                  </td>

                  <td className="p-3.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +{item.growthPercent}%
                    </span>
                  </td>

                  <td className="p-3.5">
                    {item.resultFound ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Matched: {item.matchedToolName || item.matchedToolSlug}
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Zero-Result Gap (No Tool)
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right">
                    {!item.resultFound ? (
                      <button
                        onClick={() => {
                          if (onCreateToolFromSearch) {
                            onCreateToolFromSearch({
                              name: item.term,
                              category: item.suggestedCategory || 'money',
                              description: `Everyday utility for calculating ${item.term} in India.`,
                            });
                          } else if (onNavigate) {
                            onNavigate('tools');
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-accent text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs hover:bg-accent/90 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Build Tool
                      </button>
                    ) : (
                      <span className="text-[11px] text-neutral-400 font-medium">
                        Optimized
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
