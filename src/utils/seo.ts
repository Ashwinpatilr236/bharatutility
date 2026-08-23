import { ViewMode } from '../types';
import { getToolBySlug } from '../data/toolsRegistry';
import { getCategoryById } from '../data/categories';

const SITE_NAME = 'BharatUtility';
const CANONICAL_BASE = 'https://bharatutility.tech';
const DEFAULT_TITLE = 'BharatUtility — Free Online Tools for Everyday India';
const DEFAULT_DESCRIPTION =
  'BharatUtility provides free, fast and easy-to-use online calculators and utility tools for everyday India.';
const DEFAULT_OG_IMAGE = `${CANONICAL_BASE}/icons/icon-512.png`;

/**
 * Returns the clean path for a given ViewMode
 */
export function getPathForView(view: ViewMode): string {
  switch (view.type) {
    case 'home':
      return '/';
    case 'all-tools':
      return '/tools';
    case 'category':
      return `/category/${view.categoryId}`;
    case 'tool': {
      const tool = getToolBySlug(view.slug);
      const canonicalSlug = tool?.seo?.canonicalSlug || view.slug;
      return `/tool/${canonicalSlug}`;
    }
    case 'favorites':
      return '/favorites';
    case 'contact':
      return '/contact';
    case 'request-tool':
      return '/request-tool';
    case 'legal':
      if (view.page === 'about') return '/about';
      return `/legal/${view.page}`;
    case 'admin': {
      let path = '/admin';
      if (view.section && view.section !== 'dashboard') {
        path += `/${view.section}`;
        if (view.subParam) {
          path += `/${view.subParam}`;
        }
      }
      return path;
    }
    default:
      return '/';
  }
}

/**
 * Helper to create or update a meta tag in document head
 */
function setMetaTag(selector: string, attrName: string, attrValue: string, content: string): void {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Helper to update or create canonical link tag
 */
function setCanonicalUrl(url: string): void {
  // Remove ALL existing canonical link elements to guarantee exactly 1 canonical tag exists
  const existingLinks = document.querySelectorAll('link[rel="canonical"]');
  existingLinks.forEach(el => el.remove());

  const canonicalLink = document.createElement('link');
  canonicalLink.setAttribute('rel', 'canonical');
  canonicalLink.setAttribute('href', url);
  document.head.appendChild(canonicalLink);
}

/**
 * Helper to inject or update JSON-LD Schema.org structured data
 */
function setStructuredData(data: object | null): void {
  let scriptEl = document.getElementById('schema-jsonld') as HTMLScriptElement | null;
  if (!data) {
    if (scriptEl) scriptEl.remove();
    return;
  }
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'schema-jsonld';
    scriptEl.setAttribute('type', 'application/ld+json');
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(data, null, 2);
}

/**
 * Dynamically updates document title, SEO metadata, canonical link, and JSON-LD schema
 */
export function updateSeoMetadata(view: ViewMode): void {
  if (typeof document === 'undefined') return;

  const path = getPathForView(view);
  const canonicalUrl = `${CANONICAL_BASE}${path === '/' ? '/' : path}`;

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;
  let ogType = 'website';
  let jsonLdData: any = null;

  if (view.type === 'tool') {
    const tool = getToolBySlug(view.slug);
    if (tool) {
      title = tool.seo?.title ? tool.seo.title : `${tool.name} | ${SITE_NAME}`;
      description = tool.seo?.description || tool.description;

      const toolSchema: any = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: tool.name,
        url: canonicalUrl,
        description: description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        publisher: {
          '@type': 'Organization',
          '@id': `${CANONICAL_BASE}/#organization`,
          name: SITE_NAME,
          url: `${CANONICAL_BASE}/`,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      };

      const breadcrumbSchema: any = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${CANONICAL_BASE}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tools',
            item: `${CANONICAL_BASE}/tools`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tool.shortName || tool.name,
            item: canonicalUrl,
          },
        ],
      };

      const graphNodes: any[] = [toolSchema, breadcrumbSchema];

      if (tool.faqs && tool.faqs.length > 0) {
        graphNodes.push({
          '@type': 'FAQPage',
          mainEntity: tool.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        });
      }

      jsonLdData = {
        '@context': 'https://schema.org',
        '@graph': graphNodes,
      };
    }
  } else if (view.type === 'category') {
    const category = getCategoryById(view.categoryId);
    if (category) {
      title = `${category.name} Tools & Calculators | ${SITE_NAME}`;
      description = category.description;
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${CANONICAL_BASE}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Categories',
            item: `${CANONICAL_BASE}/categories`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: category.name,
            item: canonicalUrl,
          },
        ],
      };
    } else {
      title = `Category Tools | ${SITE_NAME}`;
    }
  } else if (view.type === 'all-tools') {
    title = `All Indian Calculators & Everyday Utilities | ${SITE_NAME}`;
    description =
      'Explore all free, fast everyday calculators and utilities for loan EMI, GST, SIP, salary in-hand, age, unit conversion, and document generation in India.';
    jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${CANONICAL_BASE}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tools',
          item: canonicalUrl,
        },
      ],
    };
  } else if (view.type === 'favorites') {
    title = `Saved Tools & Favorites | ${SITE_NAME}`;
    description = 'Access your saved favorite calculators and quick utilities on BharatUtility.';
  } else if (view.type === 'contact') {
    title = `Contact Us & Support | ${SITE_NAME}`;
    description = 'Get in touch with the BharatUtility team for inquiries, formula feedback, or support.';
  } else if (view.type === 'request-tool') {
    title = `Request a Tool or Calculator | ${SITE_NAME}`;
    description = 'Suggest a new everyday calculator or digital utility for India. Our team builds community-requested tools.';
  } else if (view.type === 'legal') {
    if (view.page === 'about') {
      title = `About Us — Everyday Tools for India | ${SITE_NAME}`;
      description = 'Learn about BharatUtility, India’s fast, privacy-focused everyday calculation super-app.';
    } else if (view.page === 'privacy') {
      title = `Privacy Policy | ${SITE_NAME}`;
      description = 'BharatUtility Privacy Policy — Client-side private calculations with zero data selling.';
    } else if (view.page === 'terms') {
      title = `Terms & Conditions | ${SITE_NAME}`;
      description = 'Terms of Service and usage conditions for BharatUtility.';
    } else if (view.page === 'disclaimer') {
      title = `Financial & Calculation Disclaimer | ${SITE_NAME}`;
      description = 'Calculation disclaimer for financial, tax, and estimation tools on BharatUtility.';
    }
  } else if (view.type === 'admin') {
    title = `Master Admin Control | ${SITE_NAME}`;
    description = 'BharatUtility Master Administration Portal.';
  } else {
    // Home view structured data
    jsonLdData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${CANONICAL_BASE}/#website`,
          url: `${CANONICAL_BASE}/`,
          name: SITE_NAME,
          alternateName: ['BharatUtility India', 'BharatUtility Tools'],
          description: DEFAULT_DESCRIPTION,
          publisher: {
            '@id': `${CANONICAL_BASE}/#organization`,
          },
        },
        {
          '@type': 'Organization',
          '@id': `${CANONICAL_BASE}/#organization`,
          name: SITE_NAME,
          url: `${CANONICAL_BASE}/`,
          logo: `${CANONICAL_BASE}/icons/icon-512.png`,
          description: DEFAULT_DESCRIPTION,
        },
      ],
    };
  }

  // Update Page Title
  document.title = title;

  // Update Robots Meta Tag (Excludes admin from indexing while keeping all public tools indexed)
  if (view.type === 'admin') {
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
  } else {
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
  }

  const socialTitle = view.type === 'home' ? 'BharatUtility — Free Online Tools for Everyday India' : title;

  // Update Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', socialTitle);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', DEFAULT_OG_IMAGE);

  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', socialTitle);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_OG_IMAGE);

  // Update Canonical URL
  setCanonicalUrl(canonicalUrl);

  // Update Structured Data JSON-LD
  setStructuredData(jsonLdData);
}
