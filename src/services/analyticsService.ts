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

export type AnalyticsEvent = {
  id: string;
  type: 'page_view' | 'tool_view' | 'calculation' | 'favorite' | 'share' | 'search';
  target?: string;
  category?: string;
  timestamp: number;
  device: 'desktop' | 'mobile' | 'tablet';
  source: 'direct' | 'organic_search' | 'social' | 'referral';
  country?: string;
};

export type DateRangeFilter = 'today' | '7d' | '30d' | '90d' | 'all';

interface GeoLocationCache {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
}

const GEO_CACHE_KEY = 'bu_client_geo_cache';

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
  private geoCache: GeoLocationCache | null = null;
  private isFetchingGeo = false;
  private liveCountListeners: Set<(count: number) => void> = new Set();
  private currentLiveCount = 1;
  private pendingQueue: AnalyticsLogEvent[] = [];

  constructor() {
    this.initGeoCache();
    this.syncLiveVisitorsCount();
    if (typeof window !== 'undefined') {
      setInterval(() => this.syncLiveVisitorsCount(), 30000);
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

      // Real client geo detection
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

      // Secondary fallback
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
      this.sendToSupabase(item);
    }
  }

  private async sendToSupabase(event: AnalyticsLogEvent): Promise<void> {
    try {
      const supabase = getSupabase();
      if (!supabase) return;

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
    } catch (e) {
      console.warn('Telemetry sync error:', e);
    }
  }

  private async syncLiveVisitorsCount(): Promise<void> {
    try {
      const supabase = getSupabase();
      if (!supabase) return;

      // Count distinct active IP visitors in last 15 minutes
      const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('site_analytics_events')
        .select('ip_address')
        .gte('created_at', fifteenMinAgo);

      if (!error && data) {
        const uniqueIps = new Set(data.map(d => d.ip_address).filter(Boolean));
        this.currentLiveCount = Math.max(uniqueIps.size, 1);
        this.liveCountListeners.forEach(fn => fn(this.currentLiveCount));
      }
    } catch {
      // Fallback
    }
  }

  public subscribeLiveCount(listener: (count: number) => void): () => void {
    this.liveCountListeners.add(listener);
    listener(this.currentLiveCount);
    return () => this.liveCountListeners.delete(listener);
  }

  public getLiveVisitorsCount(): number {
    return this.currentLiveCount;
  }

  /**
   * Tracks a real page view or tool view to Supabase
   */
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
    };

    if (this.geoCache) {
      event.ip_address = this.geoCache.ip;
      event.city = this.geoCache.city;
      event.region = this.geoCache.region;
      event.country = this.geoCache.country;
      event.country_code = this.geoCache.countryCode;
      this.sendToSupabase(event);
    } else {
      this.pendingQueue.push(event);
      this.fetchClientGeo();
    }
  }

  /**
   * Tracks a real user action (calculation, favorite, share) to Supabase
   */
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
    };

    if (this.geoCache) {
      event.ip_address = this.geoCache.ip;
      event.city = this.geoCache.city;
      event.region = this.geoCache.region;
      event.country = this.geoCache.country;
      event.country_code = this.geoCache.countryCode;
      this.sendToSupabase(event);
    } else {
      this.pendingQueue.push(event);
      this.fetchClientGeo();
    }
  }

  // Compatibility wrappers
  public trackEvent(type: AnalyticsEvent['type'], target?: string, category?: string): void {
    if (type === 'page_view' || type === 'tool_view') {
      this.trackView(target || 'home', undefined, category, type);
    } else {
      this.trackAction(type, target || 'general', undefined, category);
    }
  }

  public subscribe(listener: () => void): () => void {
    return () => {};
  }
}

export const analyticsService = new AnalyticsService();
