import { getSupabase } from './supabaseClient';

export interface AnalyticsLogEvent {
  id?: string;
  site_id?: string;
  event_type: 'page_view' | 'tool_view' | 'calculation' | 'favorite' | 'share' | 'search';
  target_slug: string;
  target_name: string;
  category?: string;
  ip_address?: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  device: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  source: 'organic_search' | 'direct' | 'social' | 'referral';
  referrer: string;
  details?: string;
  created_at?: string;
}

export type AnalyticsEvent = AnalyticsLogEvent;

export type DateRangeFilter = 'today' | '7d' | '30d' | '90d' | 'all';

interface GeoLocationCache {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
}

const LOCAL_STORAGE_KEY = 'bu_real_analytics_events';
const GEO_CACHE_KEY = 'bu_client_geo_cache';

function getLocalEvents(): AnalyticsLogEvent[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalEvents(events: AnalyticsLogEvent[]): void {
  try {
    const trimmed = events.slice(-1000);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

function detectBrowserAndOS(): { browser: string; os: string } {
  if (typeof window === 'undefined') return { browser: 'Browser', os: 'Unknown' };
  const ua = navigator.userAgent;

  let os = 'Windows';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/windows/i.test(ua)) os = 'Windows';

  let browser = 'Chrome';
  if (/chrome|crios/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';

  return { browser, os };
}

function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua) || (width >= 768 && width < 1024)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua) || width < 768) {
    return 'mobile';
  }
  return 'desktop';
}

function detectSource(): { source: AnalyticsLogEvent['source']; referrer: string } {
  if (typeof document === 'undefined') return { source: 'direct', referrer: 'Direct' };
  const ref = document.referrer.toLowerCase();
  if (!ref) return { source: 'direct', referrer: 'Direct Navigation' };

  if (ref.includes('google')) return { source: 'organic_search', referrer: 'Google Search' };
  if (ref.includes('bing')) return { source: 'organic_search', referrer: 'Bing Search' };
  if (ref.includes('yahoo') || ref.includes('duckduckgo')) return { source: 'organic_search', referrer: 'Search Engine' };
  if (ref.includes('reddit')) return { source: 'social', referrer: 'Reddit' };
  if (ref.includes('whatsapp') || ref.includes('wa.me')) return { source: 'social', referrer: 'WhatsApp' };
  if (ref.includes('instagram')) return { source: 'social', referrer: 'Instagram' };
  if (ref.includes('t.co') || ref.includes('x.com') || ref.includes('twitter')) return { source: 'social', referrer: 'X / Twitter' };
  if (ref.includes('linkedin')) return { source: 'social', referrer: 'LinkedIn' };
  if (ref.includes('youtube')) return { source: 'social', referrer: 'YouTube' };
  if (ref.includes('telegram')) return { source: 'social', referrer: 'Telegram' };

  try {
    const url = new URL(ref);
    return { source: 'referral', referrer: url.hostname };
  } catch {
    return { source: 'referral', referrer: ref.slice(0, 40) };
  }
}

class AnalyticsService {
  private events: AnalyticsLogEvent[] = [];
  private geoCache: GeoLocationCache | null = null;
  private isFetchingGeo = false;
  private listeners: Set<() => void> = new Set();
  private liveCountListeners: Set<(count: number) => void> = new Set();
  private currentLiveCount = 1;
  private pendingQueue: AnalyticsLogEvent[] = [];

  constructor() {
    this.events = getLocalEvents();
    this.initGeoCache();
    this.fetchEventsFromSupabase();
    if (typeof window !== 'undefined') {
      setInterval(() => this.fetchEventsFromSupabase(), 15000);
    }
  }

  private initGeoCache(): void {
    try {
      const cached = sessionStorage.getItem(GEO_CACHE_KEY);
      if (cached) {
        this.geoCache = JSON.parse(cached);
      } else {
        this.fetchClientGeo();
      }
    } catch {
      this.fetchClientGeo();
    }
  }

  private async fetchClientGeo(): Promise<void> {
    if (this.isFetchingGeo) return;
    this.isFetchingGeo = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          this.geoCache = {
            ip: data.ip,
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            country: data.country_name || 'India',
            countryCode: data.country_code || 'IN',
          };
          sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(this.geoCache));
          this.flushPendingQueue();
          return;
        }
      }

      const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
      if (ipRes && ipRes.ok) {
        const ipData = await ipRes.json();
        this.geoCache = {
          ip: ipData.ip || 'Client',
          city: 'India',
          region: 'India',
          country: 'India',
          countryCode: 'IN',
        };
        sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(this.geoCache));
        this.flushPendingQueue();
      }
    } catch {
      // Ignore network errors
    } finally {
      this.isFetchingGeo = false;
    }
  }

  private async flushPendingQueue(): Promise<void> {
    if (this.pendingQueue.length === 0 || !this.geoCache) return;
    const items = [...this.pendingQueue];
    this.pendingQueue = [];

    for (const item of items) {
      item.ip_address = this.geoCache.ip;
      item.city = this.geoCache.city;
      item.region = this.geoCache.region;
      item.country = this.geoCache.country;
      item.country_code = this.geoCache.countryCode;
      this.recordEvent(item);
    }
  }

  private async recordEvent(event: AnalyticsLogEvent): Promise<void> {
    // Save to local cache
    this.events.unshift(event);
    saveLocalEvents(this.events);
    this.notifyListeners();

    // Send to Supabase
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('site_analytics_events').insert({
          site_id: 'bharatutility',
          event_type: event.event_type,
          target_slug: event.target_slug,
          target_name: event.target_name,
          category: event.category || null,
          ip_address: event.ip_address || null,
          city: event.city || null,
          region: event.region || null,
          country: event.country || 'India',
          country_code: event.country_code || 'IN',
          device: event.device,
          browser: event.browser,
          os: event.os,
          source: event.source,
          referrer: event.referrer,
          details: event.details || null,
        });
      }
    } catch (e) {
      console.warn('Supabase telemetry sync error:', e);
    }
  }

  public async fetchEventsFromSupabase(): Promise<void> {
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('site_analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!error && data && data.length > 0) {
        this.events = data.map((d: any) => ({
          id: d.id,
          site_id: d.site_id,
          event_type: d.event_type,
          target_slug: d.target_slug,
          target_name: d.target_name,
          category: d.category,
          ip_address: d.ip_address,
          city: d.city,
          region: d.region,
          country: d.country,
          country_code: d.country_code,
          device: d.device,
          browser: d.browser,
          os: d.os,
          source: d.source,
          referrer: d.referrer,
          details: d.details,
          created_at: d.created_at,
        }));
        saveLocalEvents(this.events);
        this.computeLiveVisitors();
        this.notifyListeners();
      }
    } catch (e) {
      console.warn('Failed to fetch telemetry from Supabase:', e);
    }
  }

  private computeLiveVisitors(): void {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recent = this.events.filter(e => {
      const t = e.created_at ? new Date(e.created_at).getTime() : 0;
      return t >= tenMinutesAgo;
    });
    const uniqueIps = new Set(recent.map(e => e.ip_address).filter(Boolean));
    this.currentLiveCount = Math.max(uniqueIps.size, 1);
    this.liveCountListeners.forEach(cb => cb(this.currentLiveCount));
  }

  private notifyListeners(): void {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error('Analytics listener error:', e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeLiveCount(listener: (count: number) => void): () => void {
    this.liveCountListeners.add(listener);
    listener(this.currentLiveCount);
    return () => this.liveCountListeners.delete(listener);
  }

  public getLiveVisitorsCount(): number {
    return this.currentLiveCount;
  }

  public getAllLogs(): AnalyticsLogEvent[] {
    return this.events;
  }

  public trackView(
    targetSlug: string,
    targetName?: string,
    category?: string,
    type: 'tool_view' | 'page_view' = 'tool_view'
  ): void {
    const { browser, os } = detectBrowserAndOS();
    const device = detectDevice();
    const { source, referrer } = detectSource();

    const formattedName =
      targetName ||
      targetSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const event: AnalyticsLogEvent = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      site_id: 'bharatutility',
      event_type: type,
      target_slug: targetSlug,
      target_name: formattedName,
      category,
      device,
      browser,
      os,
      source,
      referrer,
      details: `Viewed ${formattedName}`,
      created_at: new Date().toISOString(),
    };

    if (this.geoCache) {
      event.ip_address = this.geoCache.ip;
      event.city = this.geoCache.city;
      event.region = this.geoCache.region;
      event.country = this.geoCache.country;
      event.country_code = this.geoCache.countryCode;
      this.recordEvent(event);
    } else {
      this.pendingQueue.push(event);
      this.fetchClientGeo();
    }
  }

  public trackAction(
    type: 'calculation' | 'favorite' | 'share' | 'search',
    targetSlug: string,
    targetName?: string,
    category?: string,
    details?: string
  ): void {
    const { browser, os } = detectBrowserAndOS();
    const device = detectDevice();
    const { source, referrer } = detectSource();

    const formattedName =
      targetName ||
      targetSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    const event: AnalyticsLogEvent = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      site_id: 'bharatutility',
      event_type: type,
      target_slug: targetSlug,
      target_name: formattedName,
      category,
      device,
      browser,
      os,
      source,
      referrer,
      details: details || `Performed ${type} on ${formattedName}`,
      created_at: new Date().toISOString(),
    };

    if (this.geoCache) {
      event.ip_address = this.geoCache.ip;
      event.city = this.geoCache.city;
      event.region = this.geoCache.region;
      event.country = this.geoCache.country;
      event.country_code = this.geoCache.countryCode;
      this.recordEvent(event);
    } else {
      this.pendingQueue.push(event);
      this.fetchClientGeo();
    }
  }

  public exportAsCSV(): void {
    if (this.events.length === 0) return;
    const headers = [
      'ID',
      'Timestamp UTC',
      'Event Type',
      'Tool / Target',
      'Category',
      'IP Address',
      'City',
      'State / Region',
      'Country',
      'Device',
      'Browser',
      'OS',
      'Traffic Source',
      'Referrer',
    ];

    const rows = this.events.map(e => [
      `"${e.id || ''}"`,
      `"${e.created_at || ''}"`,
      `"${e.event_type}"`,
      `"${(e.target_name || e.target_slug || '').replace(/"/g, '""')}"`,
      `"${e.category || ''}"`,
      `"${e.ip_address || ''}"`,
      `"${e.city || ''}"`,
      `"${e.region || ''}"`,
      `"${e.country || 'India'}"`,
      `"${e.device}"`,
      `"${e.browser}"`,
      `"${e.os}"`,
      `"${e.source}"`,
      `"${(e.referrer || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bharatutility_real_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public exportAsJSON(): void {
    const jsonStr = JSON.stringify(this.events, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bharatutility_real_analytics_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public getMetricsForRange(range: DateRangeFilter): {
    liveVisitors: number;
    totalPageViews: number;
    totalCalculations: number;
    totalFavorites: number;
    totalShares: number;
    uniqueVisitors: number;
    viewsTrendPercent: number;
    calcTrendPercent: number;
    chartData: { date: string; views: number; calculations: number }[];
    hourlyData: { hourStr: string; hour: number; count: number }[];
    deviceBreakdown: { name: string; value: number; count: number; percentage: number }[];
    sourceBreakdown: { name: string; value: number; count: number; percentage: number }[];
    cityBreakdown: { city: string; region: string; count: number; percentage: number }[];
    topTools: {
      slug: string;
      name: string;
      category?: string;
      views: number;
      calculations: number;
      conversionRate: number;
    }[];
  } {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const days =
      range === 'today' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;

    const startTime = range === 'today' ? new Date().setHours(0, 0, 0, 0) : now - days * dayMs;
    const prevStartTime = startTime - days * dayMs;

    const currentPeriodEvents = this.events.filter(e => {
      const t = e.created_at ? new Date(e.created_at).getTime() : now;
      return t >= startTime;
    });

    const prevPeriodEvents = this.events.filter(e => {
      const t = e.created_at ? new Date(e.created_at).getTime() : now;
      return t >= prevStartTime && t < startTime;
    });

    const totalPageViews = currentPeriodEvents.filter(
      e => e.event_type === 'page_view' || e.event_type === 'tool_view'
    ).length;
    const totalCalculations = currentPeriodEvents.filter(e => e.event_type === 'calculation').length;
    const totalFavorites = currentPeriodEvents.filter(e => e.event_type === 'favorite').length;
    const totalShares = currentPeriodEvents.filter(e => e.event_type === 'share').length;

    const uniqueIps = new Set(currentPeriodEvents.map(e => e.ip_address).filter(Boolean)).size;

    const prevViews = prevPeriodEvents.filter(
      e => e.event_type === 'page_view' || e.event_type === 'tool_view'
    ).length;
    const prevCalcs = prevPeriodEvents.filter(e => e.event_type === 'calculation').length;

    const viewsTrendPercent =
      prevViews > 0
        ? Number((((totalPageViews - prevViews) / prevViews) * 100).toFixed(1))
        : totalPageViews > 0
        ? 100
        : 0;
    const calcTrendPercent =
      prevCalcs > 0
        ? Number((((totalCalculations - prevCalcs) / prevCalcs) * 100).toFixed(1))
        : totalCalculations > 0
        ? 100
        : 0;

    // Timeline Chart Data
    const chartMap = new Map<string, { views: number; calculations: number }>();
    const numBuckets = Math.min(days, 30);
    for (let i = numBuckets - 1; i >= 0; i--) {
      const d = new Date(now - i * dayMs);
      const key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
      chartMap.set(key, { views: 0, calculations: 0 });
    }

    currentPeriodEvents.forEach(e => {
      const d = e.created_at ? new Date(e.created_at) : new Date();
      const key = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
      if (chartMap.has(key)) {
        const item = chartMap.get(key)!;
        if (e.event_type === 'page_view' || e.event_type === 'tool_view') item.views += 1;
        if (e.event_type === 'calculation') item.calculations += 1;
      }
    });

    const chartData = Array.from(chartMap.entries()).map(([date, data]) => ({
      date,
      views: data.views,
      calculations: data.calculations,
    }));

    // 24-Hour Timeline in IST
    const hourlyCounts = Array(24).fill(0);
    currentPeriodEvents.forEach(e => {
      const d = e.created_at ? new Date(e.created_at) : new Date();
      const istHour = (d.getUTCHours() + 5 + Math.floor((d.getUTCMinutes() + 30) / 60)) % 24;
      hourlyCounts[istHour] += 1;
    });

    const hourlyData = hourlyCounts.map((count, hr) => {
      const period = hr >= 12 ? 'PM' : 'AM';
      const displayHr = hr % 12 === 0 ? 12 : hr % 12;
      return {
        hourStr: `${displayHr} ${period}`,
        hour: hr,
        count,
      };
    });

    // Device breakdown
    const devicesMap = { mobile: 0, desktop: 0, tablet: 0 };
    currentPeriodEvents.forEach(e => {
      if (devicesMap[e.device] !== undefined) {
        devicesMap[e.device] += 1;
      }
    });
    const totalEventsCount = currentPeriodEvents.length || 1;

    const deviceBreakdown = [
      {
        name: 'Mobile Smartphone',
        value: devicesMap.mobile,
        count: devicesMap.mobile,
        percentage: Math.round((devicesMap.mobile / totalEventsCount) * 100),
      },
      {
        name: 'Desktop / Laptops',
        value: devicesMap.desktop,
        count: devicesMap.desktop,
        percentage: Math.round((devicesMap.desktop / totalEventsCount) * 100),
      },
      {
        name: 'Tablet & iPad',
        value: devicesMap.tablet,
        count: devicesMap.tablet,
        percentage: Math.round((devicesMap.tablet / totalEventsCount) * 100),
      },
    ];

    // Source breakdown
    const sourceMap = { organic_search: 0, direct: 0, social: 0, referral: 0 };
    currentPeriodEvents.forEach(e => {
      if (sourceMap[e.source] !== undefined) sourceMap[e.source] += 1;
    });

    const sourceBreakdown = [
      {
        name: 'Google & Organic Search',
        value: sourceMap.organic_search,
        count: sourceMap.organic_search,
        percentage: Math.round((sourceMap.organic_search / totalEventsCount) * 100),
      },
      {
        name: 'Direct & Bookmarks',
        value: sourceMap.direct,
        count: sourceMap.direct,
        percentage: Math.round((sourceMap.direct / totalEventsCount) * 100),
      },
      {
        name: 'Social (WhatsApp / Reddit)',
        value: sourceMap.social,
        count: sourceMap.social,
        percentage: Math.round((sourceMap.social / totalEventsCount) * 100),
      },
      {
        name: 'Referrals & External',
        value: sourceMap.referral,
        count: sourceMap.referral,
        percentage: Math.round((sourceMap.referral / totalEventsCount) * 100),
      },
    ];

    // City & State breakdown
    const cityMap = new Map<string, { city: string; region: string; count: number }>();
    currentPeriodEvents.forEach(e => {
      if (e.city && e.city !== 'Unknown') {
        const cityKey = `${e.city}, ${e.region || 'India'}`;
        if (!cityMap.has(cityKey)) {
          cityMap.set(cityKey, {
            city: e.city,
            region: e.region || 'India',
            count: 0,
          });
        }
        cityMap.get(cityKey)!.count += 1;
      }
    });

    const cityBreakdown = Array.from(cityMap.values())
      .map(item => ({
        city: item.city,
        region: item.region,
        count: item.count,
        percentage: Math.round((item.count / totalEventsCount) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top Tools Aggregation
    const toolAggMap = new Map<
      string,
      { name: string; category?: string; views: number; calculations: number }
    >();

    currentPeriodEvents.forEach(e => {
      const slug = e.target_slug;
      if (slug && slug !== 'home' && slug !== 'all-tools') {
        if (!toolAggMap.has(slug)) {
          toolAggMap.set(slug, {
            name: e.target_name || slug.replace(/-/g, ' '),
            category: e.category,
            views: 0,
            calculations: 0,
          });
        }
        const curr = toolAggMap.get(slug)!;
        if (e.event_type === 'page_view' || e.event_type === 'tool_view') curr.views += 1;
        if (e.event_type === 'calculation') curr.calculations += 1;
      }
    });

    const topTools = Array.from(toolAggMap.entries())
      .map(([slug, stats]) => ({
        slug,
        name: stats.name,
        category: stats.category,
        views: stats.views,
        calculations: stats.calculations,
        conversionRate:
          stats.views > 0 ? Math.min(100, Math.round((stats.calculations / stats.views) * 100)) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      liveVisitors: this.currentLiveCount,
      totalPageViews,
      totalCalculations,
      totalFavorites,
      totalShares,
      uniqueVisitors: Math.max(uniqueIps, 0),
      viewsTrendPercent,
      calcTrendPercent,
      chartData,
      hourlyData,
      deviceBreakdown,
      sourceBreakdown,
      cityBreakdown,
      topTools,
    };
  }
}

export const analyticsService = new AnalyticsService();
