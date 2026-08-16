export type AdminRole =
  | 'super_admin'
  | 'content_admin'
  | 'data_admin'
  | 'support_admin'
  | 'analyst';

export type AdminSection =
  | 'dashboard'
  | 'tools'
  | 'categories'
  | 'tool-factory'
  | 'quality-check'
  | 'homepage'
  | 'revenue'
  | 'redirects'
  | 'not-found'
  | 'seo-health'
  | 'experiments'
  | 'requests'
  | 'messages'
  | 'analytics'
  | 'search-insights'
  | 'opportunity-center'
  | 'dynamic-data'
  | 'ads'
  | 'seo'
  | 'social'
  | 'announcements'
  | 'appearance'
  | 'users'
  | 'feature-flags'
  | 'system-health'
  | 'activity-log'
  | 'settings';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: AdminRole;
  status: 'active' | 'suspended' | 'invited';
  lastActive: string;
  createdAt: string;
  mfaEnabled?: boolean;
  emailVerified?: boolean;
}

export type PermissionKey =
  | 'tools:read'
  | 'tools:write'
  | 'tools:publish'
  | 'tools:delete'
  | 'categories:read'
  | 'categories:write'
  | 'requests:read'
  | 'requests:write'
  | 'messages:read'
  | 'messages:write'
  | 'analytics:read'
  | 'search_insights:read'
  | 'opportunity:read'
  | 'dynamic_data:read'
  | 'dynamic_data:write'
  | 'ads:read'
  | 'ads:write'
  | 'seo:read'
  | 'seo:write'
  | 'social:read'
  | 'social:write'
  | 'announcements:read'
  | 'announcements:write'
  | 'appearance:read'
  | 'appearance:write'
  | 'users:read'
  | 'users:write'
  | 'feature_flags:read'
  | 'feature_flags:write'
  | 'health:read'
  | 'activity:read'
  | 'settings:read'
  | 'settings:write';

export interface AdminActivityLogItem {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  entityType: 'tool' | 'category' | 'ad' | 'seo' | 'announcement' | 'user' | 'setting' | 'dynamic_data' | 'feature_flag' | 'request' | 'message' | 'notification' | 'redirect' | 'experiment';
  entityId?: string;
  entityName?: string;
  details?: string;
  timestamp: string;
}

export interface SiteAnnouncement {
  id: string;
  title: string;
  message: string;
  ctaText?: string;
  ctaUrl?: string;
  style: 'info' | 'success' | 'new' | 'warning';
  startDate?: string;
  endDate?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdSlotConfig {
  id: string;
  name: string;
  placement: 'homepage_hero' | 'homepage_bottom' | 'tool_top' | 'tool_sidebar' | 'category_page' | 'footer' | 'inline_content';
  format: 'banner' | 'rectangle' | 'leaderboard' | 'inline';
  slotId: string;
  enabled: boolean;
}

export interface AdsManagementConfig {
  adsEnabled: boolean;
  devPlaceholderMode: boolean;
  publisherId: string;
  slots: AdSlotConfig[];
  updatedAt: string;
}

export interface GlobalSEOConfig {
  defaultTitle: string;
  defaultDescription: string;
  defaultMetaTitle?: string;
  defaultMetaDescription?: string;
  defaultKeywords: string[];
  defaultOgImage: string;
  siteName: string;
  canonicalDomain: string;
  twitterHandle: string;
  robotsTxt: string;
  sitemapEnabled: boolean;
  indexingEnabled: boolean;
  updatedAt: string;
}

export interface AppearanceConfig {
  siteTitle: string;
  tagline: string;
  logoText: string;
  logoBadge: string;
  heroHeading: string;
  heroSubheading: string;
  footerCopyright: string;
  footerTagline: string;
  primaryAccent: string;
  showCategoryCounts: boolean;
  showRecentCalculations: boolean;
  updatedAt: string;
}

export interface FeatureFlagItem {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'core' | 'ui' | 'ai' | 'monetization' | 'experimental';
  rolloutPercentage: number;
  updatedAt: string;
}

export interface DynamicDataset {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  currentVersion: string;
  previousVersion?: string;
  effectiveDate: string;
  sourceName: string;
  sourceUrl: string;
  lastChecked: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  recordsCount: number;
  dataPreview: Record<string, any>[];
  notes?: string;
  updatedAt: string;
}

export interface OpportunityItem {
  id: string;
  type: 'search_gap' | 'high_growth' | 'user_demand' | 'seo_potential';
  title: string;
  description: string;
  score: number; // 0 - 100
  scoreBreakdown: {
    searchVolume: number;
    userRequests: number;
    trafficTrend: number;
    competitionOrEase: number;
  };
  metrics: {
    searchCount?: number;
    requestCount?: number;
    growthRate?: string;
    existingTool?: string | null;
  };
  recommendedAction: string;
  actionPayload?: {
    toolName?: string;
    category?: string;
    description?: string;
    targetSlug?: string;
  };
  status: 'open' | 'in_progress' | 'dismissed' | 'completed';
}

export interface SearchInsightItem {
  term: string;
  count: number;
  lastSearched: string;
  resultFound: boolean;
  matchedToolSlug?: string;
  matchedToolName?: string;
  growthPercent?: number;
  suggestedCategory?: string;
}

// ── 1. NOTIFICATION CENTER ──
export type { Tool } from '../types';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success' | 'critical' | 'high' | 'medium' | 'low';

export type NotificationCategory =
  | 'tool_request'
  | 'contact_message'
  | 'system_error'
  | 'ai_error'
  | 'email_error'
  | 'tool_published'
  | 'quality_failed'
  | 'analytics_spike'
  | 'search_opportunity';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  category?: NotificationCategory;
  severity: NotificationSeverity;
  timestamp: string;
  status: 'unread' | 'read' | 'archived';
  linkSection?: AdminSection;
  linkParam?: string;
  targetSection?: AdminSection;
}

export interface NotificationRuleConfig {
  id: string;
  name: string;
  description: string;
  category: NotificationCategory;
  enabled: boolean;
  threshold?: number;
  unit?: string;
}

// ── 2. REVENUE DASHBOARD ──
export interface RevenueConfig {
  isConfigured: boolean;
  provider: 'adsense' | 'custom_ad_server' | 'direct_sponsor';
  publisherId?: string;
  apiConnected: boolean;
  lastSyncedAt?: string;
  currency: string;
  autoSyncEnabled: boolean;
}

export interface RevenueMetricSnapshot {
  date: string;
  estimatedRevenue: number;
  impressions: number;
  clicks: number;
  ctr: number;
  rpm: number;
  pageRpm: number;
}

export interface PageRevenueBreakdown {
  path: string;
  pageName: string;
  category: string;
  impressions: number;
  clicks: number;
  ctr: number;
  rpm: number;
  estimatedEarnings: number;
}

// ── 3. HOMEPAGE BUILDER ──
export type HomepageSectionType =
  | 'hero'
  | 'popular'
  | 'trending'
  | 'categories'
  | 'featured'
  | 'recently_added'
  | 'announcements'
  | 'social'
  | 'ads'
  | 'custom_info';

export interface HomepageSectionConfig {
  id: string;
  type: HomepageSectionType;
  title: string;
  subtitle?: string;
  enabled: boolean;
  displayOrder: number;
  itemCount?: number;
  selectedToolSlugs?: string[];
  backgroundStyle?: 'default' | 'subtle' | 'card' | 'accent-border';
  customContent?: {
    badge?: string;
    buttonText?: string;
    buttonUrl?: string;
    bodyText?: string;
  };
}

export interface HomepageBuilderConfig {
  draftSections: HomepageSectionConfig[];
  publishedSections: HomepageSectionConfig[];
  lastPublishedAt?: string;
  lastSavedAt?: string;
}

// ── 4. REDIRECT MANAGER ──
export interface UrlRedirect {
  id: string;
  oldUrl: string;
  newUrl: string;
  type: 301 | 302;
  status: 'active' | 'disabled';
  hits: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ── 5. 404 / BROKEN URL MANAGER ──
export interface BrokenUrlLog {
  id: string;
  requestedUrl: string;
  hits: number;
  lastRequested: string;
  referrer?: string;
  suggestedDestination?: string;
  resolvedRedirectId?: string;
  status: 'unresolved' | 'resolved';
}

// ── 6. SEO HEALTH CENTER ──
export type SeoIssueSeverity = 'critical' | 'warning' | 'info';

export type SeoIssueType =
  | 'missing_title'
  | 'missing_meta_description'
  | 'duplicate_title'
  | 'duplicate_meta_description'
  | 'missing_h1'
  | 'multiple_h1'
  | 'missing_canonical'
  | 'missing_og_image'
  | 'missing_structured_data'
  | 'missing_faq'
  | 'broken_internal_link'
  | 'missing_related_tools'
  | 'noindex_page'
  | 'orphan_page'
  | 'missing_breadcrumb'
  | 'invalid_slug';

export interface SeoAuditIssue {
  id: string;
  pageUrl: string;
  pageTitle: string;
  type: SeoIssueType;
  severity: SeoIssueSeverity;
  problem: string;
  recommendation: string;
  fixAction?: {
    type: 'edit_tool' | 'edit_seo' | 'edit_category';
    targetId: string;
  };
}

// ── 7. TOOL FACTORY & QUALITY CHECK ──
export type ToolFactoryType =
  | 'calculator'
  | 'converter'
  | 'generator'
  | 'finder'
  | 'lookup'
  | 'comparison'
  | 'utility'
  | 'form';

export interface ToolFactoryInputConfig {
  id: string;
  name: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'radio' | 'date' | 'slider' | 'toggle';
  defaultValue: any;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: any }[];
  helpText?: string;
  required: boolean;
}

export interface ToolFactoryOutputConfig {
  id: string;
  name: string;
  label: string;
  formulaType: 'loan_emi' | 'percentage' | 'tax_slab' | 'unit_converter' | 'date_diff' | 'custom_math' | 'text_template';
  customExpression?: string;
  formatter: 'inr_currency' | 'percentage' | 'number_commas' | 'days_years' | 'raw_text';
  description?: string;
  highlighted?: boolean;
}

export interface ToolQualityCheckResult {
  toolId?: string;
  toolName: string;
  isReady: boolean;
  score: number; // 0 - 100
  criticalErrorsCount: number;
  warningsCount: number;
  passedChecksCount: number;
  checks: {
    id: string;
    label: string;
    category: 'metadata' | 'seo' | 'content' | 'calculation' | 'compliance' | 'mobile';
    status: 'pass' | 'fail' | 'warn';
    message: string;
    isCritical: boolean;
  }[];
  overriddenBy?: string;
  overriddenAt?: string;
}

// ── 9. A/B TESTING & EXPERIMENTS ──
export interface ExperimentVariant {
  id: string;
  name: string;
  value?: string;
  trafficAllocation?: number;
  views: number;
  clicks: number;
  conversions: number;
}

export interface ExperimentItem {
  id: string;
  name: string;
  type?: 'cta_button' | 'headline' | 'layout' | 'default_inputs' | 'ad_placement';
  targetComponent?: 'hero_heading' | 'search_cta' | 'tool_card_layout' | 'cta_text' | 'ad_placement' | 'tool_ordering' | 'announcement_design';
  targetToolId?: string;
  hypothesis?: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'ended' | 'concluded';
  variants: ExperimentVariant[];
  winningVariantId?: string;
  startDate?: string;
  startedAt?: string;
  endDate?: string;
  metricGoal?: string;
  updatedAt?: string;
}

