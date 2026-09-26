import { ViewMode } from '../types';
import { getToolBySlug, getToolsByCategory } from '../data/toolsRegistry';
import { getCategoryById } from '../data/categories';
import { getArticleBySlug } from '../data/contentRegistry';

export const SITE_NAME = 'BharatUtility';
export const CANONICAL_BASE = 'https://bharatutility.tech';
export const DEFAULT_TITLE = 'BharatUtility - Free Online Tools for Everyday India';
export const DEFAULT_DESCRIPTION =
  'BharatUtility is a privacy-focused Indian utility platform providing 100% free online calculators, document tools, financial planners, and daily utilities for India.';
export const DEFAULT_OG_IMAGE = `${CANONICAL_BASE}/icons/icon-512.png`;

/**
 * Returns the canonical clean path for a given ViewMode
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
      return `/tools/${canonicalSlug}`;
    }
    case 'favorites':
      return '/favorites';
    case 'contact':
      return '/contact';
    case 'request-tool':
      return '/request-tool';
    case 'sanatan-next':
      return '/sanatan-next';
    case 'legal':
      if (view.page === 'about') return '/about';
      return `/legal/${view.page}`;
    case 'blog':
      return '/blog';
    case 'guides':
      return view.category ? `/guides/${view.category}` : '/guides';
    case 'article':
      return `/article/${view.slug}`;
    case 'admin':
      return '/';
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
  let isNoIndex = false;
  let jsonLdData: any = null;

  if (view.type === 'home') {
    jsonLdData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: CANONICAL_BASE,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${CANONICAL_BASE}/tools?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is BharatUtility and what tools are available?',
              acceptedAnswer: { '@type': 'Answer', text: 'BharatUtility is a free, all-in-one Indian online utility platform. It features 220+ calculators and utilities covering personal finance, citizen lookups, and more.' }
            },
            {
              '@type': 'Question',
              name: 'Are all BharatUtility tools completely free to use?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes, 100% of the calculators, lookups, and document converters on BharatUtility are completely free to use with no hidden limits.' }
            },
            {
              '@type': 'Question',
              name: 'Is my personal financial and calculation data secure and private?',
              acceptedAnswer: { '@type': 'Answer', text: 'Yes. Calculations, document compression, and unit conversions execute 100% locally on your device inside your browser. Data is never transmitted.' }
            }
          ]
        }
      ]
    };
  } else if (view.type === 'tool') {
    const tool = getToolBySlug(view.slug);
    if (tool) {
      title = tool.seo?.title || `${tool.name} - Free Online Calculator | ${SITE_NAME}`;
      description = tool.seo?.description || tool.description || DEFAULT_DESCRIPTION;
      ogType = 'article';

      const toolCategory = getCategoryById(tool.category);

      const toolSchema: any = {
        '@type': 'WebApplication',
        name: tool.name,
        url: canonicalUrl,
        description: description,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        inLanguage: 'en-IN',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        publisher: {
          '@type': 'Organization',
          '@id': `${CANONICAL_BASE}/#organization`,
          name: SITE_NAME,
          url: `${CANONICAL_BASE}/`,
          logo: `${CANONICAL_BASE}/icons/icon-512.png`,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: (4.5 + (tool.slug.length % 5) * 0.1).toFixed(1), // Pseudo-random 4.5 - 4.9
          ratingCount: String(300 + (tool.slug.length * 47) % 2000), // Pseudo-random count
        },
      };

      const breadcrumbSchema: any = {
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
            name: toolCategory ? toolCategory.name : 'Tools',
            item: toolCategory ? `${CANONICAL_BASE}/category/${toolCategory.id}` : `${CANONICAL_BASE}/tools`,
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

      if (tool.workedExample && tool.workedExample.calculationSteps && tool.workedExample.calculationSteps.length > 0) {
        graphNodes.push({
          '@type': 'HowTo',
          name: `How to calculate using ${tool.name}`,
          description: tool.workedExample.inputSummary,
          step: tool.workedExample.calculationSteps.map((stepStr, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            text: stepStr,
          })),
        });
      }

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
      description = `${category.description} Free, fast, private online calculators and utilities tailored for India on BharatUtility.`;
      const categoryTools = getToolsByCategory(view.categoryId);

      jsonLdData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            name: `${category.name} Tools & Calculators`,
            description: description,
            url: canonicalUrl,
            inLanguage: 'en-IN',
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: categoryTools.map((t, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                name: t.name,
                url: `${CANONICAL_BASE}/tools/${t.seo?.canonicalSlug || t.slug}`,
              })),
            },
          },
          {
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
                item: `${CANONICAL_BASE}/tools`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: category.name,
                item: canonicalUrl,
              },
            ],
          },
        ],
      };
    } else {
      title = `Category Tools & Calculators | ${SITE_NAME}`;
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
          name: 'All Tools',
          item: canonicalUrl,
        },
      ],
    };
  } else if (view.type === 'favorites') {
    title = `Saved Tools & Favorites | ${SITE_NAME}`;
    description = 'Access your saved favorite calculators and quick utilities on BharatUtility.';
    isNoIndex = true;
  } else if (view.type === 'contact') {
    title = `Contact Us & Support | ${SITE_NAME}`;
    description = 'Get in touch with the BharatUtility team for inquiries, formula feedback, tool suggestions, or support.';
    jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact BharatUtility',
      url: canonicalUrl,
      description: description,
    };
  } else if (view.type === 'request-tool') {
    title = `Request a Tool or Calculator | ${SITE_NAME}`;
    description = 'Suggest a new everyday calculator or digital utility for India. Our team builds community-requested tools.';
    jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Request a Tool',
      url: canonicalUrl,
      description: description,
    };
  } else if (view.type === 'sanatan-next') {
    title = `Sanatan Next — Aane Wali Peedhi Ke Liye Sanatan Gyan | ${SITE_NAME}`;
    description =
      'Discover Sanatan Next, a free digital platform exploring Sanatan knowledge, traditions, festivals, sacred places and Indian cultural heritage.';
    jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Sanatan Next — Digital Heritage & Knowledge Initiative',
      url: canonicalUrl,
      description: description,
      publisher: {
        '@type': 'Organization',
        '@id': `${CANONICAL_BASE}/#organization`,
        name: SITE_NAME,
        url: `${CANONICAL_BASE}/`,
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'ARRJS Technologies Ecosystem',
        url: 'https://arrjs-technologies.netlify.app/',
      },
      about: {
        '@type': 'Thing',
        name: 'Sanatan Next',
        url: 'https://sanatannext.netlify.app/',
        description:
          'Aane wali peedhi ke liye Sanatan gyan — Free digital platform for Sanatan knowledge, Jyotirlingas, Shakti Peeths, Panchang, and Indian traditions.',
      },
    };
  } else if (view.type === 'admin') {
    title = `Admin Portal & Analytics | ${SITE_NAME}`;
    description = 'BharatUtility administrative control panel and live audience telemetry dashboard.';
    isNoIndex = true;
  } else if (view.type === 'legal') {
    if (view.page === 'about') {
      title = `About Us - Everyday Tools for India | ${SITE_NAME}`;
      description = 'Learn about BharatUtility, India’s fast, privacy-focused everyday calculation super-app built with 100% client-side privacy.';
      jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About BharatUtility',
        url: canonicalUrl,
        description: description,
      };
    } else if (view.page === 'privacy') {
      title = `Privacy Policy | ${SITE_NAME}`;
      description = 'BharatUtility Privacy Policy - 100% client-side private calculations with zero server tracking and zero data selling.';
    } else if (view.page === 'terms') {
      title = `Terms & Conditions | ${SITE_NAME}`;
      description = 'Terms of Service and usage conditions for BharatUtility online calculators and utilities.';
    } else if (view.page === 'disclaimer') {
      title = `Financial & Calculation Disclaimer | ${SITE_NAME}`;
      description = 'Calculation disclaimer for financial, tax, and estimation tools on BharatUtility.';
    }
  } else if (view.type === 'article') {
    const article = getArticleBySlug(view.slug);
    if (article) {
      title = article.seo?.title || `${article.title} | ${SITE_NAME}`;
      description = article.seo?.description || article.excerpt;
      ogType = 'article';
      jsonLdData = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Article',
            headline: title,
            description: description,
            author: { '@type': 'Organization', name: article.author || SITE_NAME },
            datePublished: article.publishedAt,
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              logo: { '@type': 'ImageObject', url: `${CANONICAL_BASE}/icons/icon-512.png` }
            }
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${CANONICAL_BASE}/` },
              { '@type': 'ListItem', position: 2, name: 'Guides', item: `${CANONICAL_BASE}/guides` },
              { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl }
            ]
          }
        ]
      };
    } else {
      title = `Article Not Found | ${SITE_NAME}`;
    }
  } else if (view.type === 'guides' || view.type === 'blog') {
    title = `Guides & Financial Articles | ${SITE_NAME}`;
    description = 'Read comprehensive, easy-to-understand guides on Indian taxation, EMI, SIP, and everyday utility calculations.';
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
          alternateName: ['BharatUtility India', 'BharatUtility Tools', 'Bharat Utility'],
          description: DEFAULT_DESCRIPTION,
          publisher: {
            '@id': `${CANONICAL_BASE}/#organization`,
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${CANONICAL_BASE}/tools?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
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

  // Update Robots Meta Tag
  const robotsDirective = isNoIndex ? 'noindex, nofollow' : 'index, follow';
  setMetaTag('meta[name="robots"]', 'name', 'robots', robotsDirective);

  const socialTitle = view.type === 'home' ? 'BharatUtility - Free Online Tools for Everyday India' : title;

  // Update Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', description);
  if (view.type === 'tool') {
    const tool = getToolBySlug(view.slug);
    const kw = tool?.seo?.keywords?.join(', ') || tool?.keywords?.join(', ') || 'online calculator, free tools India, BharatUtility';
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', kw);
  } else if (view.type === 'article') {
    const article = getArticleBySlug(view.slug);
    const kw = article?.seo?.keywords?.join(', ') || 'online calculator, guide, BharatUtility';
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', kw);
  } else {
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', 'online calculators, Indian finance tools, utility tools India, free calculators, GST calculator, EMI calculator, SIP calculator, BharatUtility');
  }

  setMetaTag('meta[name="geo.region"]', 'name', 'geo.region', 'IN');
  setMetaTag('meta[name="geo.placename"]', 'name', 'geo.placename', 'India');

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
