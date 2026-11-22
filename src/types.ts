import { AdminSection } from './types/admin';

export type CategoryId =
  | 'money'
  | 'daily-life'
  | 'home'
  | 'documents'
  | 'technology'
  | 'education'
  | 'travel'
  | 'business'
  | 'date-time'
  | 'india-services'
  | 'document-tools'
  | 'vehicle-utility'
  | 'travel-utility';

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
  toolCount: number;
  order?: number;
  active?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export type AccentColor = 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolSEO {
  title: string;
  description: string;
  keywords: string[];
  canonicalSlug: string;
  h1?: string;
  ogImage?: string;
  schemaType?: string;
  indexEnabled?: boolean;
}

export interface SEOSection {
  h2: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  tagline?: string;
  description: string;
  category: CategoryId;
  icon: string;
  keywords?: string[];
  popular?: boolean;
  trending?: boolean;
  featured?: boolean;
  isNew?: boolean;
  isEditorsPick?: boolean;
  featuredRank?: number;
  status?: 'published' | 'draft' | 'unpublished' | 'archived' | 'inactive';
  badge?: string;
  views?: number;
  calculationCount?: number;
  favoritesCount?: number;
  sharesCount?: number;
  createdAt?: string;
  updatedAt?: string;
  introContent?: string;
  seo: ToolSEO;
  formulaDescription?: string;
  formulaLatex?: string;
  workedExample?: {
    inputSummary: string;
    calculationSteps: string[];
    finalResult: string;
  };
  faqs?: FAQItem[];
  relatedToolSlugs?: string[];
  relatedTools?: string[];
  seoSections?: SEOSection[];
  disclaimer?: string;
  lastUpdated?: string;
  officialSource?: string;
  needsManualVerification?: boolean;
  features?: string[];
}

export interface CalculationHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  timestamp: number;
  summary: string;
  params: Record<string, any>;
}

export interface SavedVaultItem {
  id: string;
  customName: string;
  toolId: string;
  toolName: string;
  toolSlug: string;
  timestamp: number;
  summary: string;
  params: Record<string, any>;
  notes?: string;
}

export type ViewMode =
  | { type: 'home' }
  | { type: 'tool'; slug: string }
  | { type: 'category'; categoryId: CategoryId }
  | { type: 'all-tools' }
  | { type: 'favorites' }
  | { type: 'contact' }
  | { type: 'request-tool' }
  | { type: 'sanatan-next' }
  | { type: 'admin'; section?: AdminSection; subParam?: string }
  | { type: 'legal'; page: 'privacy' | 'terms' | 'disclaimer' | 'about' | 'contact' }
  | { type: 'blog' }
  | { type: 'guides'; category?: string }
  | { type: 'article'; slug: string }
  | {
      type: 'parksignal';
      subView: 'landing' | 'register' | 'login' | 'dashboard' | 'vehicles' | 'alert' | 'privacy' | 'help';
      token?: string;
    };

export type ToolRequestStatus =
  | 'new'
  | 'reviewing'
  | 'planned'
  | 'in_development'
  | 'completed'
  | 'rejected'
  | 'New'
  | 'Reviewing'
  | 'Planned'
  | 'In Development'
  | 'Completed'
  | 'Declined';

export interface ToolRequest {
  id: string;
  name?: string;
  email?: string;
  requested_tool?: string;
  toolName: string;
  title?: string;
  category: string;
  description: string;
  status: ToolRequestStatus;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  usefulness?: string;
  useCase?: string;
  referenceUrl?: string;
  upvotes?: number;
  votes?: number;
}

export type ContactReason =
  | 'General Question'
  | 'Bug Report'
  | 'Tool Suggestion'
  | 'Partnership'
  | 'Advertising'
  | 'Feedback'
  | 'Other';

export type ContactMessageStatus = 'new' | 'read' | 'replied' | 'closed' | 'spam' | 'New' | 'Read' | 'Replied' | 'Closed' | 'Spam';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  reason?: ContactReason | string;
  subject?: string;
  message: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  status?: ContactMessageStatus;
  priority?: 'low' | 'medium' | 'high';
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  x: string;
  linkedin: string;
  youtube?: string;
  telegram?: string;
}

export type ArticleCategory = 'finance' | 'tax' | 'loans' | 'education' | 'utilities' | 'business' | 'home';

export interface ArticleMetadata {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // ReactNode or raw string, currently using raw string for PoC
  type: 'blog' | 'guide';
  category: ArticleCategory;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readTimeMinutes: number;
  featuredImage?: string;
  relatedToolSlugs: string[];
  relatedArticleSlugs?: string[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// ── ParkSignal Types ──
export type VehicleType = 'Car' | 'Bike' | 'Scooter' | 'Other';

export interface ParkSignalUser {
  id: string;
  email: string;
  fullName: string;
  isTelegramLinked: boolean;
  telegramUsername?: string | null;
  linkedAt?: number | null;
}

export interface ParkSignalVehicleSettings {
  allow_blocking?: number | boolean;
  allow_move_vehicle?: number | boolean;
  allow_emergency?: number | boolean;
  allow_child_person_inside?: number | boolean;
  allow_lights_on?: number | boolean;
  allow_window_door_open?: number | boolean;
  allow_damage_alert?: number | boolean;
  allow_custom_text?: number | boolean;
  allow_voice_messages?: number | boolean;
  max_custom_text_length?: number;
  max_voice_duration_seconds?: number;
  quiet_hours_enabled?: number | boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  display_plate_publicly?: number | boolean;
  nickname?: string;
}

export interface ParkSignalVehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: VehicleType;
  nickname?: string | null;
  display_plate_publicly: number;
  is_active: number;
  created_at: number;
  qr_token?: string;
  // Included from vehicle_alert_settings
  allow_blocking?: number;
  allow_move_vehicle?: number;
  allow_emergency?: number;
  allow_child_person_inside?: number;
  allow_lights_on?: number;
  allow_window_door_open?: number;
  allow_damage_alert?: number;
  allow_custom_text?: number;
  allow_voice_messages?: number;
  max_custom_text_length?: number;
  max_voice_duration_seconds?: number;
  quiet_hours_enabled?: number;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

export interface ParkSignalPublicVehicle {
  valid: boolean;
  message?: string;
  vehicleType?: VehicleType;
  vehicleNumber?: string | null;
  isPlateMasked?: boolean;
  isTelegramLinked?: boolean;
  settings?: {
    allowBlocking: boolean;
    allowMoveVehicle: boolean;
    allowEmergency: boolean;
    allowChildPersonInside: boolean;
    allowLightsOn: boolean;
    allowWindowDoorOpen: boolean;
    allowDamageAlert: boolean;
    allowCustomText: boolean;
    allowVoiceMessages: boolean;
    maxCustomTextLength: number;
    maxVoiceDurationSeconds: number;
  };
}

export interface ParkSignalAlertLog {
  id: string;
  vehicle_id?: string;
  vehicle_number: string;
  vehicle_type: string;
  nickname?: string | null;
  alert_type: 'TEXT' | 'VOICE';
  alert_category: string;
  custom_message?: string | null;
  voice_duration_seconds?: number | null;
  delivery_status: 'DELIVERED' | 'FAILED_BOT_ERROR' | 'UNLINKED' | 'QUIET_HOURS';
  created_at: number;
}

