import { getSupabase } from './supabaseClient';

export interface AnalyticsLogEvent {
  id?: string;
  site_id?: string;
  event_type: 'page_view' | 'tool_view' | 'tool_action' | 'calculation' | 'favorite' | 'share' | 'search' | 'heartbeat' | 'tool_error';
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
  ipMasked: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  cachedAt: number;
}

const LOCAL_STORAGE_KEY = 'bu_real_analytics_events';
const GEO_CACHE_KEY = 'bu_client_geo_cache_v2';
const VISITOR_ID_KEY = 'bu_anon_vid';
const SESSION_ID_KEY = 'bu_anon_sid';
const LAST_ACTIVITY_KEY = 'bu_last_activity_ts';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const GEO_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to mask IP address for privacy protection
export function maskIpAddress(ip: string): string {
  if (!ip || ip === 'Client' || ip === 'Unknown') return 'Unknown';
  // IPv4 masking
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }
  // IPv6 masking
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 4) {
      return `${parts.slice(0, 3).join(':')}::xxxx`;
    }
  }
  return 'Masked';
}

// Anonymous Visitor Identifier (Persistent across visits in localStorage)
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'vid_server';
  try {
    let vid = localStorage.getItem(VISITOR_ID_KEY);
    if (!vid) {
      vid = 'vid_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    return vid;
  } catch {
    return 'vid_' + Math.random().toString(36).substring(2, 9);
  }
}

// Anonymous Session Identifier (30-minute inactivity lifecycle in sessionStorage)
export function getOrCreateSessionId(): { sessionId: string; isNewSession: boolean } {
  if (typeof window === 'undefined') return { sessionId: 'sid_server', isNewSession: false };
  try {
    const now = Date.now();
    const lastActive = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0', 10);
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    let isNewSession = false;

    if (!sid || (lastActive > 0 && now - lastActive > SESSION_TIMEOUT_MS)) {
      sid = 'sid_' + now.toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      sessionStorage.setItem(SESSION_ID_KEY, sid);
      isNewSession = true;
    }

    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    return { sessionId: sid, isNewSession };
  } catch {
    return { sessionId: 'sid_' + Math.random().toString(36).substring(2, 8), isNewSession: false };
  }
}

// Conservative Bot / Search Crawler Classifier
export function detectIsBot(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  if (!ua) return false;
  return /bot|crawler|spider|googlebot|bingbot|yandex|duckduckbot|slurp|baiduspider|headless|lighthouse|pingdom|uptimerobot/i.test(ua);
}

export function detectBrowserAndOS(): { browser: string; os: string } {
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

export function detectDevice(): 'mobile' | 'desktop' | 'tablet' {
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

export function detectSource(): { source: AnalyticsLogEvent['source']; referrer: string } {
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
    const trimmed = events.slice(-500);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

class AnalyticsService {
  private events: AnalyticsLogEvent[] = [];
  private geoCache: GeoLocationCache | null = null;
  private isFetchingGeo = false;
  private listeners: Set<() => void> = new Set();
  private liveCountListeners: Set<(count: number) => void> = new Set();
  private currentLiveCount = 1;
  private pendingQueue: AnalyticsLogEvent[] = [];
  private lastSentTime = 0;
  private heartbeatInterval: any = null;

  constructor() {
    this.events = getLocalEvents();
    this.initGeoCache();
    this.initPresenceHeartbeat();
  }

  private initGeoCache(): void {
    try {
      const cached = localStorage.getItem(GEO_CACHE_KEY);
      if (cached) {
        const parsed: GeoLocationCache = JSON.parse(cached);
        if (Date.now() - parsed.cachedAt < GEO_CACHE_TTL_MS) {
          this.geoCache = parsed;
          return;
        }
      }
    } catch {}
    this.fetchClientGeo();
  }

  private async fetchClientGeo(): Promise<void> {
    if (this.isFetchingGeo) return;
    this.isFetchingGeo = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.ip) {
          this.geoCache = {
            ipMasked: maskIpAddress(data.ip),
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            country: data.country_name || 'India',
            countryCode: data.country_code || 'IN',
            cachedAt: Date.now(),
          };
          try {
            localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(this.geoCache));
          } catch {}
          this.flushPendingQueue();
          return;
        }
      }

      // Non-blocking fallback
      this.geoCache = {
        ipMasked: 'Masked',
        city: 'Unknown',
        region: 'India',
        country: 'India',
        countryCode: 'IN',
        cachedAt: Date.now(),
      };
      this.flushPendingQueue();
    } catch {
      this.geoCache = {
        ipMasked: 'Masked',
        city: 'Unknown',
        region: 'India',
        country: 'India',
        countryCode: 'IN',
        cachedAt: Date.now(),
      };
      this.flushPendingQueue();
    } finally {
      this.isFetchingGeo = false;
    }
  }

  private initPresenceHeartbeat(): void {
    if (typeof window === 'undefined') return;

    // Send heartbeat every 60s while tab is visible
    this.heartbeatInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        this.trackHeartbeat();
      }
    }, 60000);

    // Track tab focus / visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.trackHeartbeat();
      }
    });
  }

  private async flushPendingQueue(): Promise<void> {
    if (this.pendingQueue.length === 0 || !this.geoCache) return;
    const items = [...this.pendingQueue];
    this.pendingQueue = [];

    for (const item of items) {
      item.ip_address = this.geoCache.ipMasked;
      item.city = this.geoCache.city;
      item.region = this.geoCache.region;
      item.country = this.geoCache.country;
      item.country_code = this.geoCache.countryCode;
      this.recordEvent(item);
    }
  }

  private async recordEvent(event: AnalyticsLogEvent): Promise<void> {
    const { sessionId } = getOrCreateSessionId();
    const visitorId = getOrCreateVisitorId();
    const isBot = detectIsBot();

    // Attach anonymous metadata cleanly into details header without user inputs
    const metadataHeader = `[sid:${sessionId}|vid:${visitorId}|bot:${isBot ? '1' : '0'}]`;
    const cleanDetails = event.details ? `${metadataHeader} ${event.details}` : metadataHeader;

    // Save to local cache
    this.events.unshift({
      ...event,
      details: cleanDetails,
    });
    saveLocalEvents(this.events);
    this.notifyListeners();

    // Send to Supabase via lightweight single insert
    try {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('site_analytics_events').insert({
          site_id: 'bharatutility',
          event_type: event.event_type,
          target_slug: event.target_slug,
          target_name: event.target_name,
          category: event.category || null,
          ip_address: event.ip_address || (this.geoCache ? this.geoCache.ipMasked : 'Masked'),
          city: event.city || (this.geoCache ? this.geoCache.city : null),
          region: event.region || (this.geoCache ? this.geoCache.region : null),
          country: event.country || 'India',
          country_code: event.country_code || 'IN',
          device: event.device,
          browser: event.browser,
          os: event.os,
          source: event.source,
          referrer: event.referrer,
          details: cleanDetails,
        });
        this.lastSentTime = Date.now();
      }
    } catch (e) {
      // Non-blocking catch for network/offline resilience
      console.debug('Telemetry transmit notice:', e);
    }
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
      event.ip_address = this.geoCache.ipMasked;
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

  /**
   * Tracks when user interacts with calculator controls / inputs
   */
  public trackToolAction(
    targetSlug: string,
    targetName?: string,
    category?: string,
    actionType: string = 'interact'
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
      event_type: 'tool_action',
      target_slug: targetSlug,
      target_name: formattedName,
      category,
      device,
      browser,
      os,
      source,
      referrer,
      details: `Interacted with ${formattedName} (${actionType})`,
      created_at: new Date().toISOString(),
    };

    if (this.geoCache) {
      event.ip_address = this.geoCache.ipMasked;
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

  /**
   * Tracks calculation completion without capturing user input figures
   */
  public trackCalculation(
    targetSlug: string,
    targetName?: string,
    category?: string,
    genericSummary?: string
  ): void {
    const { browser, os } = detectBrowserAndOS();
    const device = detectDevice();
    const { source, referrer } = detectSource();

    const formattedName =
      targetName ||
      targetSlug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    // Sanitization: Ensure no numeric input figures or private data are in details
    const sanitizedDetails = genericSummary
      ? genericSummary.replace(/[0-9,₹$]/g, '#').slice(0, 100)
      : `Computed calculation on ${formattedName}`;

    const event: AnalyticsLogEvent = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      site_id: 'bharatutility',
      event_type: 'calculation',
      target_slug: targetSlug,
      target_name: formattedName,
      category,
      device,
      browser,
      os,
      source,
      referrer,
      details: sanitizedDetails,
      created_at: new Date().toISOString(),
    };

    if (this.geoCache) {
      event.ip_address = this.geoCache.ipMasked;
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

  /**
   * Tracks tool error or invalid calculation bounds
   */
  public trackToolError(
    targetSlug: string,
    errorType: string,
    targetName?: string
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
      event_type: 'tool_error',
      target_slug: targetSlug,
      target_name: formattedName,
      device,
      browser,
      os,
      source,
      referrer,
      details: `Tool error (${errorType}) on ${formattedName}`,
      created_at: new Date().toISOString(),
    };

    if (this.geoCache) {
      event.ip_address = this.geoCache.ipMasked;
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

  /**
   * Tracks active online heartbeat
   */
  public trackHeartbeat(): void {
    const { sessionId } = getOrCreateSessionId();
    const { browser, os } = detectBrowserAndOS();
    const device = detectDevice();
    const { source, referrer } = detectSource();

    const event: AnalyticsLogEvent = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      site_id: 'bharatutility',
      event_type: 'heartbeat',
      target_slug: 'heartbeat',
      target_name: 'Active Session Presence',
      device,
      browser,
      os,
      source,
      referrer,
      details: `Session heartbeat (${sessionId})`,
      created_at: new Date().toISOString(),
    };

    if (this.geoCache) {
      event.ip_address = this.geoCache.ipMasked;
      event.city = this.geoCache.city;
      event.region = this.geoCache.region;
      event.country = this.geoCache.country;
      event.country_code = this.geoCache.countryCode;
      this.recordEvent(event);
    }
  }

  public trackAction(
    type: 'calculation' | 'favorite' | 'share' | 'search',
    targetSlug: string,
    targetName?: string,
    category?: string,
    details?: string
  ): void {
    if (type === 'calculation') {
      this.trackCalculation(targetSlug, targetName, category, details);
      return;
    }

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
      event.ip_address = this.geoCache.ipMasked;
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
}

export const analyticsService = new AnalyticsService();
