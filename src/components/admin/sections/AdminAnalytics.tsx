import React, { useState, useMemo } from 'react';
import { analyticsService, DateRangeFilter } from '../../../services/analyticsService';
import { adminStore } from '../../../services/adminStore';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Calculator,
  Bookmark,
  Share2,
  Smartphone,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export const AdminAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRangeFilter>('30d');

  const metrics = useMemo(() => {
    return analyticsService.getMetricsForRange(dateRange);
  }, [dateRange]);

  const tools = adminStore.getTools();
  const conversionRate = (
    (metrics.totalCalculations / (metrics.totalPageViews || 1)) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Platform Intelligence & Analytics
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Privacy-safe aggregated telemetry on tool usage, search discovery, and visitor engagement across India.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          {(['today', '7d', '30d', '90d'] as DateRangeFilter[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                dateRange === range
                  ? 'bg-white dark:bg-neutral-900 text-accent dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 5 Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-500" /> Page Views
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {metrics.totalPageViews.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
            +{metrics.viewsTrendPercent}% vs prev
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-amber-500" /> Calculations
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {metrics.totalCalculations.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
            +{metrics.calcTrendPercent}% vs prev
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Calc Completion Rate
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {conversionRate}%
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            Views to calculations
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-rose-500" /> Favorites Saved
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {metrics.totalFavorites.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 font-semibold mt-1 block">
            {metrics.totalFavorites > 0 ? `${metrics.totalFavorites} saved locally` : 'No saved favorites yet'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-purple-500" /> Shares & Exports
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {metrics.totalShares.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[10px] text-neutral-400 mt-1 block">
            WhatsApp & link shares
          </span>
        </div>
      </div>

      {/* Main Area Chart: Views & Calculations over Time */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Traffic & Calculation Volume Over Time
            </h2>
            <p className="text-xs text-neutral-400">
              Daily trend of visitors viewing tools vs actually completing calculations.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Page Views
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Calculations
            </span>
          </div>
        </div>

        <div className="h-72 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.chartData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCalcs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
              <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Page Views"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
              <Area
                type="monotone"
                dataKey="calculations"
                name="Calculations"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCalcs)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Top Performing Tools & Traffic / Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Tools Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
            Top Performing Utilities (Calculations Completed)
          </h3>
          <p className="text-xs text-neutral-400 mb-4">
            Most heavily utilized calculators by Indian citizens.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.topTools.slice(0, 6)}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" horizontal={false} />
                <XAxis type="number" stroke="#888888" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#888888"
                  fontSize={11}
                  width={110}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="calculations" name="Calculations" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device & Traffic Channel Breakdown (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-6">
          {/* Devices Pie */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-500" /> Device Split
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Distribution across mobile smartphones, tablets, and desktop computers.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {metrics.deviceBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Channel breakdown list */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-500" /> Acquisition Channels
            </h4>
            <div className="space-y-2">
              {metrics.sourceBreakdown.map((src, i) => (
                <div
                  key={src.name}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/40"
                >
                  <span className="text-neutral-600 dark:text-neutral-400">{src.name}</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {src.value.toLocaleString('en-IN')} sessions
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
