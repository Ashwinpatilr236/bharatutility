import React, { useState, useEffect, useMemo } from 'react';
import {
  analyticsService,
  AnalyticsLogEvent,
  DateRangeFilter,
} from '../../services/analyticsService';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Eye,
  Calculator,
  Compass,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Clock,
  Download,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  Flame,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Share2,
  Star,
  ExternalLink,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { navigateToHome, navigateToTool, showToast } = useApp();
  const [range, setRange] = useState<DateRangeFilter>('7d');
  const [liveCount, setLiveCount] = useState<number>(analyticsService.getLiveVisitorsCount());
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'insights'>('overview');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Search & Filter in Logs table
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [rowsToShow, setRowsToShow] = useState<number>(25);

  // Re-render tick when analytics updates
  const [, setTick] = useState(0);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const unsubscribeAnalytics = analyticsService.subscribe(() => {
      setTick(t => t + 1);
    });

    const unsubscribeLive = analyticsService.subscribeLiveCount(count => {
      setLiveCount(count);
    });

    return () => {
      unsubscribeAnalytics();
      unsubscribeLive();
    };
  }, []);

  const metrics = useMemo(() => analyticsService.getMetricsForRange(range), [range]);
  const allLogs = useMemo(() => analyticsService.getAllLogs(), []);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    let result = allLogs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        item =>
          item.ip.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.region.toLowerCase().includes(q) ||
          item.targetName.toLowerCase().includes(q) ||
          item.target.toLowerCase().includes(q) ||
          item.referrer.toLowerCase().includes(q) ||
          item.os.toLowerCase().includes(q) ||
          item.browser.toLowerCase().includes(q)
      );
    }

    if (eventTypeFilter !== 'all') {
      result = result.filter(item => item.type === eventTypeFilter);
    }

    if (deviceFilter !== 'all') {
      result = result.filter(item => item.device === deviceFilter);
    }

    return result;
  }, [allLogs, searchQuery, eventTypeFilter, deviceFilter]);

  const displayedLogs = useMemo(() => {
    return filteredLogs.slice(0, rowsToShow);
  }, [filteredLogs, rowsToShow]);

  // Find peak hour
  const peakHour = useMemo(() => {
    let max = 0;
    let peakStr = '8 PM - 10 PM IST';
    metrics.hourlyData.forEach(item => {
      if (item.count > max) {
        max = item.count;
        const period = item.hour >= 12 ? 'PM' : 'AM';
        const displayHr = item.hour % 12 === 0 ? 12 : item.hour % 12;
        peakStr = `${displayHr}:00 ${period} IST (${item.count} hits)`;
      }
    });
    return peakStr;
  }, [metrics.hourlyData]);

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    showToast(`IP ${ip} copied to clipboard`, 'info');
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const handleExportCSV = () => {
    analyticsService.exportAsCSV();
    showToast('Analytics CSV report exported successfully', 'success');
  };

  const handleExportJSON = () => {
    analyticsService.exportAsJSON();
    showToast('Analytics JSON file exported successfully', 'success');
  };

  const handleResetSample = () => {
    analyticsService.resetSampleData();
    showToast('Sample telemetry re-seeded for testing', 'success');
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all stored analytics logs?')) {
      analyticsService.clearAllLogs();
      showToast('All analytics records cleared', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            <button
              onClick={navigateToHome}
              className="hover:text-accent flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </button>
            <span>/</span>
            <span className="text-neutral-900 dark:text-white font-bold">Admin Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
            Traffic & Audience Intelligence
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Telemetry Active
            </span>
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Real-time live visitors, geographic origins (Cities/States), peak hours, and IP records.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Range filter */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold">
            {(['today', '7d', '30d', 'all'] as DateRangeFilter[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  range === r
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 Days' : r === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center gap-1.5"
            title="Export full JSON"
          >
            JSON
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Overview & Charts
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Real-time Visitor & IP Logs
          <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
            {allLogs.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'insights'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Peak Time & Geo Insights
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KEY CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. Live Visitors Counter Card */}
            <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-950/30 dark:via-neutral-900 dark:to-neutral-900 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Live Online Right Now
                </span>
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight">
                  {liveCount}
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Citizens active
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Real-time active sessions using BharatUtility calculators across India.
              </p>
            </div>

            {/* 2. Total Tool Views */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Total Tool Views
                </span>
                <Eye className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight">
                  {metrics.totalPageViews}
                </span>
                {metrics.viewsTrendPercent !== 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    ↑ {metrics.viewsTrendPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Pageviews & tool impressions in selected timeframe.
              </p>
            </div>

            {/* 3. Calculations Performed */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Calculations Done
                </span>
                <Calculator className="w-5 h-5 text-purple-500" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight">
                  {metrics.totalCalculations}
                </span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  High Engagement
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Actual EMI, SIP, Tax & Utility calculations executed.
              </p>
            </div>

            {/* 4. Unique IP Visitors */}
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Unique IP Visitors
                </span>
                <ShieldCheck className="w-5 h-5 text-amber-500" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight">
                  {metrics.uniqueVisitors}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Distinct IPs
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                Unique IP addresses captured with geographic tagging.
              </p>
            </div>
          </div>

          {/* Section: Top 10 Most Popular Tools & Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top 10 Popular Tools (2 Cols) */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" /> Top 10 Most Popular Tools
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Calculators with the highest views and user conversion
                  </p>
                </div>
                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  Views / Calculations
                </span>
              </div>

              {metrics.topTools.length === 0 ? (
                <div className="py-12 text-center text-sm text-neutral-500">
                  No tool activity recorded yet in this timeframe.
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.topTools.map((tool, idx) => {
                    const maxViews = metrics.topTools[0]?.views || 1;
                    const percent = Math.round((tool.views / maxViews) * 100);

                    return (
                      <div
                        key={tool.slug}
                        className="group p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
                      >
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0">
                              <button
                                onClick={() => navigateToTool(tool.slug)}
                                className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-accent transition-colors truncate block text-left"
                              >
                                {tool.name}
                              </button>
                              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                /{tool.slug}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-sm text-neutral-900 dark:text-white">
                              {tool.views}{' '}
                              <span className="text-xs font-normal text-neutral-500">views</span>
                            </span>
                            <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                              {tool.calculations} calcs ({tool.conversionRate}%)
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percent, 4)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Device & Traffic Sources (1 Col) */}
            <div className="space-y-6">
              {/* Device Breakdown */}
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
                <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-accent" /> Device Breakdown
                </h3>
                <div className="space-y-3">
                  {metrics.deviceBreakdown.map(dev => (
                    <div key={dev.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                          {dev.icon === 'Smartphone' && <Smartphone className="w-3.5 h-3.5 text-neutral-500" />}
                          {dev.icon === 'Monitor' && <Monitor className="w-3.5 h-3.5 text-neutral-500" />}
                          {dev.icon === 'Tablet' && <Tablet className="w-3.5 h-3.5 text-neutral-500" />}
                          {dev.name}
                        </span>
                        <span className="text-neutral-900 dark:text-white font-bold">
                          {dev.count} ({dev.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${Math.max(dev.percentage, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Sources Breakdown */}
              <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
                <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-500" /> Traffic Acquisition Sources
                </h3>
                <div className="space-y-3">
                  {metrics.sourceBreakdown.map(src => (
                    <div key={src.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-neutral-700 dark:text-neutral-300">{src.name}</span>
                        <span className="text-neutral-900 dark:text-white font-bold">
                          {src.count} ({src.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.max(src.percentage, 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Geographic City & State Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h2 className="text-lg font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500" /> Geographic Origin of Visitors (Kaha Se Log Aate Hai)
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  State and City level audience breakdown across India
                </p>
              </div>
              <span className="text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-xl">
                Top Metros & Regions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.cityBreakdown.map((item, idx) => (
                <div
                  key={`${item.city}-${item.region}`}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500">#{idx + 1}</span>
                    <span className="text-xs font-extrabold text-accent">
                      {item.percentage}%
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <span>🇮🇳</span> {item.city}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.region}</p>
                  </div>
                  <div className="pt-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {item.count} visitors recorded
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISITOR & IP LOGS TABLE */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by IP, City, State, Tool Name, Device..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={eventTypeFilter}
                onChange={e => setEventTypeFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white font-medium focus:outline-none"
              >
                <option value="all">All Events</option>
                <option value="tool_view">Tool Views</option>
                <option value="calculation">Calculations</option>
                <option value="favorite">Favorites</option>
                <option value="share">Shares</option>
              </select>

              <select
                value={deviceFilter}
                onChange={e => setDeviceFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white font-medium focus:outline-none"
              >
                <option value="all">All Devices</option>
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
                <option value="tablet">Tablet</option>
              </select>

              <button
                onClick={handleClearLogs}
                className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1"
                title="Clear all stored logs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Time (IST)</th>
                    <th className="py-3.5 px-4">IP Address</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Tool / Target</th>
                    <th className="py-3.5 px-4">Event</th>
                    <th className="py-3.5 px-4">Device & OS</th>
                    <th className="py-3.5 px-4">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                  {displayedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        No telemetry logs matched your filter.
                      </td>
                    </tr>
                  ) : (
                    displayedLogs.map(log => (
                      <tr
                        key={log.id}
                        className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                      >
                        {/* Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
                          {log.timeStr}
                        </td>

                        {/* IP Address with 1-click copy */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleCopyIp(log.ip)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-mono text-[11px] transition-colors"
                            title="Click to copy IP"
                          >
                            <span>{log.ip}</span>
                            {copiedIp === log.ip ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-400" />
                            )}
                          </button>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">🇮🇳</span>
                            <div>
                              <span className="font-bold text-neutral-900 dark:text-white block">
                                {log.city}
                              </span>
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                                {log.region}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Tool / Target */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => navigateToTool(log.target)}
                            className="font-bold text-neutral-900 dark:text-white hover:text-accent transition-colors flex items-center gap-1"
                          >
                            {log.targetName}
                          </button>
                          <span className="text-[10px] text-neutral-500 block">/{log.target}</span>
                        </td>

                        {/* Event Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.type === 'calculation' ? (
                            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                              <Calculator className="w-3 h-3" /> Calculated
                            </span>
                          ) : log.type === 'favorite' ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                              <Star className="w-3 h-3" /> Favorited
                            </span>
                          ) : log.type === 'share' ? (
                            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                              <Share2 className="w-3 h-3" /> Shared
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-bold text-[10px] inline-flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Visited
                            </span>
                          )}
                        </td>

                        {/* Device & OS */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-neutral-600 dark:text-neutral-300">
                          <span className="font-semibold text-neutral-900 dark:text-white block">
                            {log.os} / {log.browser}
                          </span>
                          <span className="text-[10px] text-neutral-400 capitalize">
                            {log.device}
                          </span>
                        </td>

                        {/* Referrer */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                          {log.referrer}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
              <span>
                Showing {displayedLogs.length} of {filteredLogs.length} events
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium">Rows per page:</span>
                {[25, 50, 100].map(cnt => (
                  <button
                    key={cnt}
                    onClick={() => setRowsToShow(cnt)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      rowsToShow === cnt
                        ? 'bg-accent text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HOURLY USAGE & PEAK TIME INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-8">
          {/* Peak Hour Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-accent via-indigo-600 to-purple-600 text-white shadow-lg space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-amber-300">
              <Clock className="w-4 h-4" /> Usage Timing Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              Peak Traffic Time: {peakHour}
            </h2>
            <p className="text-sm text-indigo-100 max-w-2xl">
              Understand exact hours when Indian citizens visit calculators so you can schedule announcements, social media posts, and updates for maximum impact.
            </p>
          </div>

          {/* 24-Hour Timeline Bar Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" /> 24-Hour Traffic Distribution (IST Indian Standard Time)
                </h3>
                <p className="text-xs text-neutral-500">
                  Hits distribution across all 24 hours of the day
                </p>
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 items-end h-44 pt-4">
              {metrics.hourlyData.map(h => {
                const maxHour = Math.max(...metrics.hourlyData.map(d => d.count), 1);
                const heightPercent = Math.max(Math.round((h.count / maxHour) * 100), 6);
                const isDayPeak = h.hour >= 10 && h.hour <= 22;

                return (
                  <div key={h.hour} className="flex flex-col items-center gap-1 group h-full justify-end">
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      {h.count}
                    </span>
                    <div
                      className={`w-full rounded-t-md transition-all group-hover:scale-y-105 ${
                        isDayPeak
                          ? 'bg-gradient-to-t from-accent to-purple-500'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 truncate w-full text-center">
                      {h.hour}:00
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action Reset */}
          <div className="p-6 rounded-3xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                Need to re-test analytics or simulate fresh visitors?
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                You can re-generate realistic sample telemetry across Indian cities and tools anytime.
              </p>
            </div>
            <button
              onClick={handleResetSample}
              className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors shrink-0 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-seed Sample Telemetry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
