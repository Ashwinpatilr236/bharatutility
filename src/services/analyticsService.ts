export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'tool_view' | 'calculation' | 'favorite' | 'share' | 'search';
  target?: string;
  category?: string;
  timestamp: number;
  device: 'desktop' | 'mobile' | 'tablet';
  source: 'direct' | 'organic_search' | 'social' | 'referral';
  country?: string;
}

export type DateRangeFilter = 'today' | '7d' | '30d' | '90d' | 'custom';

const ANALYTICS_STORAGE_KEY = 'bu_analytics_events';

// Real-time privacy-compliant Client Telemetry Store
function getStoredEvents(): AnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.loadEvents();
  }

  private loadEvents(): void {
    this.events = getStoredEvents();
  }

  private saveEvents(): void {
    try {
      // Keep most recent 5,000 events
      const sliced = this.events.slice(-5000);
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(sliced));
    } catch (e) {
      console.warn('Analytics storage full, trimming:', e);
    }
  }

  public trackEvent(type: AnalyticsEvent['type'], target?: string, category?: string): void {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const device = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    const ref = document.referrer.toLowerCase();
    let source: AnalyticsEvent['source'] = 'direct';
    if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) {
      source = 'organic_search';
    } else if (ref.includes('instagram') || ref.includes('facebook') || ref.includes('t.co') || ref.includes('x.com') || ref.includes('youtube') || ref.includes('whatsapp') || ref.includes('telegram')) {
      source = 'social';
    } else if (ref) {
      source = 'referral';
    }

    const event: AnalyticsEvent = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      type,
      target,
      category,
      timestamp: Date.now(),
      device,
      source,
      country: 'India',
    };

    this.events.push(event);
    this.saveEvents();
  }

  public getMetricsForRange(range: DateRangeFilter): {
    totalPageViews: number;
    totalCalculations: number;
    totalFavorites: number;
    totalShares: number;
    viewsTrendPercent: number;
    calcTrendPercent: number;
    chartData: { date: string; views: number; calculations: number }[];
    deviceBreakdown: { name: string; value: number }[];
    sourceBreakdown: { name: string; value: number }[];
    topTools: { slug: string; name: string; views: number; calculations: number; favorites: number }[];
  } {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = range === 'today' ? 1 : range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startTime = now - days * dayMs;
    const prevStartTime = startTime - days * dayMs;

    const currentPeriodEvents = this.events.filter(e => e.timestamp >= startTime);
    const prevPeriodEvents = this.events.filter(e => e.timestamp >= prevStartTime && e.timestamp < startTime);

    const totalPageViews = currentPeriodEvents.filter(e => e.type === 'page_view' || e.type === 'tool_view').length;
    const totalCalculations = currentPeriodEvents.filter(e => e.type === 'calculation').length;
    const totalFavorites = currentPeriodEvents.filter(e => e.type === 'favorite').length;
    const totalShares = currentPeriodEvents.filter(e => e.type === 'share').length;

    const prevViews = prevPeriodEvents.filter(e => e.type === 'page_view' || e.type === 'tool_view').length;
    const prevCalcs = prevPeriodEvents.filter(e => e.type === 'calculation').length;

    const viewsTrendPercent = prevViews > 0
      ? Number((((totalPageViews - prevViews) / prevViews) * 100).toFixed(1))
      : totalPageViews > 0 ? 100 : 0;
    const calcTrendPercent = prevCalcs > 0
      ? Number((((totalCalculations - prevCalcs) / prevCalcs) * 100).toFixed(1))
      : totalCalculations > 0 ? 100 : 0;

    // Chart Data grouped by day
    const chartMap = new Map<string, { views: number; calculations: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
      chartMap.set(key, { views: 0, calculations: 0 });
    }

    currentPeriodEvents.forEach(e => {
      const d = new Date(e.timestamp);
      const key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
      if (chartMap.has(key)) {
        const item = chartMap.get(key)!;
        if (e.type === 'page_view' || e.type === 'tool_view') item.views += 1;
        if (e.type === 'calculation') item.calculations += 1;
      }
    });

    const chartData = Array.from(chartMap.entries()).map(([date, data]) => ({
      date,
      views: data.views,
      calculations: data.calculations,
    }));

    // Device breakdown
    const devicesMap = { mobile: 0, desktop: 0, tablet: 0 };
    currentPeriodEvents.forEach(e => {
      if (devicesMap[e.device] !== undefined) devicesMap[e.device] += 1;
    });

    const deviceBreakdown = [
      { name: 'Mobile (Smartphones)', value: devicesMap.mobile },
      { name: 'Desktop / Laptops', value: devicesMap.desktop },
      { name: 'Tablet & iPad', value: devicesMap.tablet },
    ];

    // Traffic Source breakdown
    const sourceMap = { organic_search: 0, direct: 0, social: 0, referral: 0 };
    currentPeriodEvents.forEach(e => {
      if (sourceMap[e.source] !== undefined) sourceMap[e.source] += 1;
    });

    const sourceBreakdown = [
      { name: 'Google & Organic Search', value: sourceMap.organic_search },
      { name: 'Direct & Bookmarks', value: sourceMap.direct },
      { name: 'Social (WhatsApp / X / IG)', value: sourceMap.social },
      { name: 'Referrals & External Blogs', value: sourceMap.referral },
    ];

    // Top Tools aggregations
    const toolAggMap = new Map<string, { views: number; calculations: number; favorites: number }>();
    currentPeriodEvents.forEach(e => {
      if (e.target) {
        if (!toolAggMap.has(e.target)) {
          toolAggMap.set(e.target, { views: 0, calculations: 0, favorites: 0 });
        }
        const curr = toolAggMap.get(e.target)!;
        if (e.type === 'page_view' || e.type === 'tool_view') curr.views += 1;
        if (e.type === 'calculation') curr.calculations += 1;
        if (e.type === 'favorite') curr.favorites += 1;
      }
    });

    const topTools = Array.from(toolAggMap.entries())
      .map(([slug, stats]) => ({
        slug,
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        views: stats.views,
        calculations: stats.calculations,
        favorites: stats.favorites,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      totalPageViews,
      totalCalculations,
      totalFavorites,
      totalShares,
      viewsTrendPercent,
      calcTrendPercent,
      chartData,
      deviceBreakdown,
      sourceBreakdown,
      topTools,
    };
  }
}

export const analyticsService = new AnalyticsService();
