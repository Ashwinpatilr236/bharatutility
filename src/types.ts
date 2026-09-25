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
  keywords: string[];
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
  faqs: FAQItem[];
  relatedToolSlugs: string[];
  relatedTools?: string[];
  seoSections?: SEOSection[];
  disclaimer?: string;
  lastUpdated?: string;
  officialSource?: string;
  needsManualVerification?: boolean;
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
  | { type: 'article'; slug: string };

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
