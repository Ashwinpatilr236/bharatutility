import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getActiveTools } from '../src/data/toolsRegistry.ts';
import { CATEGORIES, getCategoryById } from '../src/data/categories.ts';
import { getAllArticles } from '../src/data/contentRegistry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://bharatutility.tech';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface PageData {
  routePath: string; // e.g. '/tools/salary-calculator'
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl: string;
  ogType?: string;
  jsonLd?: object;
  bodyHtml: string;
}

function renderHtml(template: string, data: PageData): string {
  let html = template;

  // 1. Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(data.title)}</title>`);

  // 2. Meta Description
  html = html.replace(
    /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
    `<meta name="description" content="${escapeAttr(data.description)}" />`
  );

  // 3. Meta Keywords
  const kw = data.keywords && data.keywords.length > 0
    ? data.keywords.join(', ')
    : 'online calculator, free tools India, BharatUtility';
  if (html.match(/<meta\s+name="keywords"\s+content=".*?"\s*\/?>/i)) {
    html = html.replace(
      /<meta\s+name="keywords"\s+content=".*?"\s*\/?>/i,
      `<meta name="keywords" content="${escapeAttr(kw)}" />`
    );
  }

  // 4. Canonical URL
  if (html.match(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i)) {
    html = html.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${data.canonicalUrl}" />`
    );
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${data.canonicalUrl}" />\n  </head>`);
  }

  // 5. OpenGraph Tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapeAttr(data.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapeAttr(data.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${data.canonicalUrl}" />`
  );
  if (data.ogType) {
    html = html.replace(
      /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:type" content="${data.ogType}" />`
    );
  }

  // 6. Twitter Card Tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeAttr(data.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeAttr(data.description)}" />`
  );

  // 7. Structured Data JSON-LD
  if (data.jsonLd) {
    const jsonLdString = JSON.stringify(data.jsonLd, null, 2);
    // Replace the default script or append
    if (html.includes('<script type="application/ld+json">')) {
      html = html.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
        `<script type="application/ld+json">\n${jsonLdString}\n    </script>`
      );
    } else {
      html = html.replace('</head>', `  <script type="application/ld+json">\n${jsonLdString}\n  </script>\n  </head>`);
    }
  }

  // 8. Inject Semantic Crawlable Content into #root
  // Keeps client JavaScript intact so React hydrates immediately on mount
  html = html.replace(
    /<div id="root">[\s\S]*?<\/body>/i,
    `<div id="root">\n${data.bodyHtml}\n    </div>\n  </body>`
  );

  return html;
}

function writePage(routePath: string, htmlContent: string) {
  let targetDir: string;
  if (routePath === '' || routePath === '/') {
    targetDir = DIST_DIR;
  } else {
    const clean = routePath.startsWith('/') ? routePath.slice(1) : routePath;
    targetDir = path.join(DIST_DIR, clean);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), htmlContent, 'utf-8');
}

export function prerenderAllRoutes() {
  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf-8');
  const tools = getActiveTools();
  const articles = getAllArticles();
  let generatedCount = 0;

  console.log('🚀 Starting Technical SEO Static Pre-rendering...');

  // 1. Tool Pages (233+ tools)
  tools.forEach(tool => {
    const canonicalSlug = tool.seo?.canonicalSlug || tool.slug;
    const canonicalUrl = `${BASE_URL}/tools/${canonicalSlug}`;
    const category = getCategoryById(tool.category);
    const title = tool.seo?.title || `${tool.name} - Free Online Calculator | BharatUtility`;
    const description = tool.seo?.description || tool.description || `Free online ${tool.name} on BharatUtility. Fast, private, Indian-tailored calculations.`;

    // Semantic JSON-LD schema
    const graphNodes: any[] = [
      {
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
          '@id': `${BASE_URL}/#organization`,
          name: 'BharatUtility',
          url: `${BASE_URL}/`,
          logo: `${BASE_URL}/icons/icon-512.png`,
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: category?.name || 'Tools', item: category ? `${BASE_URL}/category/${category.id}` : `${BASE_URL}/tools` },
          { '@type': 'ListItem', position: 3, name: tool.shortName || tool.name, item: canonicalUrl },
        ],
      },
    ];

    if (tool.workedExample?.calculationSteps && tool.workedExample.calculationSteps.length > 0) {
      graphNodes.push({
        '@type': 'HowTo',
        name: `How to calculate using ${tool.name}`,
        description: tool.workedExample.inputSummary,
        step: tool.workedExample.calculationSteps.map((step, idx) => ({
          '@type': 'HowToStep',
          position: idx + 1,
          text: step,
        })),
      });
    }

    if (tool.faqs && tool.faqs.length > 0) {
      graphNodes.push({
        '@type': 'FAQPage',
        mainEntity: tool.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      });
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': graphNodes,
    };

    // Semantic visible body
    let bodyHtml = `
      <header class="bu-seo-header" style="max-width:1200px;margin:0 auto;padding:16px 20px;">
        <nav aria-label="Breadcrumb" style="font-size:12px;color:#64748b;margin-bottom:12px;">
          <a href="/" style="color:#4f46e5;text-decoration:none;">Home</a> &gt; 
          <a href="/category/${tool.category}" style="color:#4f46e5;text-decoration:none;">${escapeHtml(category?.name || 'Tools')}</a> &gt; 
          <span style="color:#334155;">${escapeHtml(tool.name)}</span>
        </nav>
        <h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 8px 0;letter-spacing:-0.02em;">${escapeHtml(tool.name)}</h1>
        <p style="font-size:14px;color:#475569;max-width:800px;line-height:1.6;margin:0 0 16px 0;">${escapeHtml(tool.description)}</p>
      </header>

      <main class="bu-seo-workbench" style="max-width:1200px;margin:0 auto;padding:20px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.05);min-height:200px;">
        <div style="text-align:center;padding:40px 20px;color:#6366f1;">
          <div style="font-weight:700;font-size:16px;margin-bottom:6px;">Interactive ${escapeHtml(tool.name)}</div>
          <div style="font-size:13px;color:#64748b;">Loading calculation engine directly in your browser...</div>
        </div>
      </main>

      <section class="bu-seo-content" style="max-width:1200px;margin:24px auto;padding:0 20px;color:#334155;line-height:1.7;">
    `;

    // Formula section
    if (tool.formulaDescription) {
      bodyHtml += `
        <article style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-top:0;">Formula &amp; Calculation Methodology</h2>
          <p style="font-size:14px;color:#475569;">${escapeHtml(tool.formulaDescription)}</p>
          ${tool.formulaLatex ? `<pre style="background:#f8fafc;padding:12px;border-radius:8px;font-family:monospace;font-size:13px;overflow-x:auto;"><code>${escapeHtml(tool.formulaLatex)}</code></pre>` : ''}
        </article>
      `;
    }

    // Worked Example
    if (tool.workedExample) {
      bodyHtml += `
        <article style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-top:0;">Step-by-Step Worked Example</h2>
          <p style="font-weight:600;font-size:14px;color:#1e293b;">${escapeHtml(tool.workedExample.inputSummary)}</p>
          <ol style="font-size:13px;color:#475569;padding-left:20px;">
            ${tool.workedExample.calculationSteps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>
          <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:6px;font-size:13px;font-weight:600;color:#1e40af;margin-top:12px;">
            Result: ${escapeHtml(tool.workedExample.finalResult)}
          </div>
        </article>
      `;
    }

    // SEO Sections
    if (tool.seoSections && tool.seoSections.length > 0) {
      tool.seoSections.forEach(sec => {
        bodyHtml += `
          <article style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:20px;">
            <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-top:0;">${escapeHtml(sec.h2)}</h2>
            ${sec.paragraphs ? sec.paragraphs.map(p => `<p style="font-size:14px;color:#475569;">${escapeHtml(p)}</p>`).join('') : ''}
            ${sec.bullets ? `<ul style="font-size:13px;color:#475569;padding-left:20px;">${sec.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>` : ''}
            ${sec.steps ? `<div style="font-size:13px;color:#475569;">${sec.steps.map(s => `<p style="background:#f8fafc;padding:8px 12px;border-radius:6px;margin:4px 0;">${escapeHtml(s)}</p>`).join('')}</div>` : ''}
          </article>
        `;
      });
    }

    // FAQs
    if (tool.faqs && tool.faqs.length > 0) {
      bodyHtml += `
        <article style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:20px;">
          <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-top:0;">Frequently Asked Questions</h2>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${tool.faqs.map(faq => `
              <div style="border:1px solid #e2e8f0;border-radius:8px;padding:14px;">
                <h3 style="font-size:14px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">${escapeHtml(faq.question)}</h3>
                <p style="font-size:13px;color:#475569;margin:0;line-height:1.5;">${escapeHtml(faq.answer)}</p>
              </div>
            `).join('')}
          </div>
        </article>
      `;
    }

    // Related Tools
    if (tool.relatedToolSlugs && tool.relatedToolSlugs.length > 0) {
      const relTools = tool.relatedToolSlugs
        .map(s => tools.find(t => t.slug === s || t.id === s))
        .filter(Boolean);

      if (relTools.length > 0) {
        bodyHtml += `
          <div style="margin-top:24px;">
            <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:12px;">Related Tools &amp; Calculators</h3>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${relTools.map(rt => `<a href="/tools/${rt!.seo?.canonicalSlug || rt!.slug}" style="display:inline-block;padding:8px 14px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;color:#4f46e5;text-decoration:none;font-size:13px;font-weight:500;">${escapeHtml(rt!.name)}</a>`).join('')}
            </div>
          </div>
        `;
      }
    }

    bodyHtml += `</section>`;

    const pageHtml = renderHtml(baseTemplate, {
      routePath: `/tools/${canonicalSlug}`,
      title,
      description,
      keywords: tool.seo?.keywords || tool.keywords,
      canonicalUrl,
      ogType: 'article',
      jsonLd,
      bodyHtml,
    });

    writePage(`/tools/${canonicalSlug}`, pageHtml);
    generatedCount++;

    // If tool has a distinct slug from canonicalSlug, also generate alias pointing canonical to canonicalSlug
    if (tool.slug !== canonicalSlug) {
      writePage(`/tools/${tool.slug}`, pageHtml);
      generatedCount++;
    }
  });

  // 2. Category Pages (13 categories)
  CATEGORIES.forEach(cat => {
    const canonicalUrl = `${BASE_URL}/category/${cat.id}`;
    const catTools = tools.filter(t => t.category === cat.id);
    const title = `${cat.name} Calculators & Tools | BharatUtility`;
    const description = `${cat.description} Explore free, private online tools for everyday India on BharatUtility.`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: `${cat.name} Tools & Calculators`,
          description,
          url: canonicalUrl,
          inLanguage: 'en-IN',
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: catTools.map((t, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: t.name,
              url: `${BASE_URL}/tools/${t.seo?.canonicalSlug || t.slug}`,
            })),
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Categories', item: `${BASE_URL}/tools` },
            { '@type': 'ListItem', position: 3, name: cat.name, item: canonicalUrl },
          ],
        },
      ],
    };

    let bodyHtml = `
      <header style="max-width:1200px;margin:0 auto;padding:16px 20px;">
        <nav aria-label="Breadcrumb" style="font-size:12px;color:#64748b;margin-bottom:12px;">
          <a href="/" style="color:#4f46e5;text-decoration:none;">Home</a> &gt; 
          <a href="/tools" style="color:#4f46e5;text-decoration:none;">Categories</a> &gt; 
          <span style="color:#334155;">${escapeHtml(cat.name)}</span>
        </nav>
        <h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 8px 0;">${escapeHtml(cat.name)} Tools &amp; Calculators</h1>
        <p style="font-size:14px;color:#475569;max-width:800px;line-height:1.6;margin:0 0 20px 0;">${escapeHtml(cat.description)} (${catTools.length} tools available)</p>
      </header>

      <main style="max-width:1200px;margin:0 auto;padding:0 20px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;">
          ${catTools.map(t => `
            <a href="/tools/${t.seo?.canonicalSlug || t.slug}" style="display:block;padding:20px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-decoration:none;transition:box-shadow 0.2s;">
              <h2 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">${escapeHtml(t.name)}</h2>
              <p style="font-size:12px;color:#64748b;margin:0;line-height:1.5;">${escapeHtml(t.description.slice(0, 120))}...</p>
            </a>
          `).join('')}
        </div>
      </main>
    `;

    const pageHtml = renderHtml(baseTemplate, {
      routePath: `/category/${cat.id}`,
      title,
      description,
      canonicalUrl,
      jsonLd,
      bodyHtml,
    });

    writePage(`/category/${cat.id}`, pageHtml);
    generatedCount++;
  });

  // 3. /tools Directory Page
  {
    const canonicalUrl = `${BASE_URL}/tools`;
    const title = 'All Indian Calculators & Everyday Utilities | BharatUtility';
    const description = 'Complete directory of 233+ free online calculators, converters, document tools, tax estimators, and civic utilities for India.';

    let bodyHtml = `
      <header style="max-width:1200px;margin:0 auto;padding:16px 20px;">
        <h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 8px 0;">All Tools &amp; Calculators Directory</h1>
        <p style="font-size:14px;color:#475569;margin:0 0 24px 0;">Browse all 233+ tools across 13 Indian utility categories.</p>
      </header>
      <main style="max-width:1200px;margin:0 auto;padding:0 20px;">
        ${CATEGORIES.map(cat => {
          const cTools = tools.filter(t => t.category === cat.id);
          return `
            <section style="margin-bottom:32px;">
              <h2 style="font-size:20px;font-weight:700;color:#0f172a;border-bottom:2px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px;">
                <a href="/category/${cat.id}" style="color:#0f172a;text-decoration:none;">${escapeHtml(cat.name)} (${cTools.length})</a>
              </h2>
              <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:12px;">
                ${cTools.map(t => `
                  <a href="/tools/${t.seo?.canonicalSlug || t.slug}" style="display:block;padding:14px;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;text-decoration:none;">
                    <div style="font-weight:600;font-size:14px;color:#0f172a;margin-bottom:4px;">${escapeHtml(t.name)}</div>
                    <div style="font-size:12px;color:#64748b;line-height:1.4;">${escapeHtml(t.description.slice(0, 80))}...</div>
                  </a>
                `).join('')}
              </div>
            </section>
          `;
        }).join('')}
      </main>
    `;

    const pageHtml = renderHtml(baseTemplate, {
      routePath: '/tools',
      title,
      description,
      canonicalUrl,
      bodyHtml,
    });
    writePage('/tools', pageHtml);
    generatedCount++;
  }

  // 4. /guides Directory Page
  {
    const canonicalUrl = `${BASE_URL}/guides`;
    const title = 'Financial, Legal & Civic Guides for Everyday India | BharatUtility';
    const description = 'Actionable step-by-step guides on home loan EMIs, tax saving, property registration, and everyday Indian financial planning.';

    let bodyHtml = `
      <header style="max-width:1200px;margin:0 auto;padding:16px 20px;">
        <h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 8px 0;">Guides &amp; Practical Articles</h1>
        <p style="font-size:14px;color:#475569;margin:0 0 24px 0;">In-depth explanations of Indian financial formulas, legal documents, and civic rules.</p>
      </header>
      <main style="max-width:1200px;margin:0 auto;padding:0 20px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:20px;">
          ${articles.map(art => `
            <article style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;padding:24px;">
              <h2 style="font-size:18px;font-weight:700;margin:0 0 8px 0;">
                <a href="/article/${art.slug}" style="color:#0f172a;text-decoration:none;">${escapeHtml(art.title)}</a>
              </h2>
              <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0 0 12px 0;">${escapeHtml(art.excerpt)}</p>
              <a href="/article/${art.slug}" style="color:#4f46e5;font-weight:600;font-size:13px;text-decoration:none;">Read Full Guide &rarr;</a>
            </article>
          `).join('')}
        </div>
      </main>
    `;

    const pageHtml = renderHtml(baseTemplate, {
      routePath: '/guides',
      title,
      description,
      canonicalUrl,
      bodyHtml,
    });
    writePage('/guides', pageHtml);
    generatedCount++;
  }

  // 5. Article Pages (7 articles)
  articles.forEach(art => {
    const canonicalUrl = `${BASE_URL}/article/${art.slug}`;
    const title = art.seo?.title || `${art.title} | BharatUtility`;
    const description = art.seo?.description || art.excerpt;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: art.title,
          description,
          url: canonicalUrl,
          inLanguage: 'en-IN',
          author: {
            '@type': 'Organization',
            name: art.author || 'BharatUtility Editorial Team',
            url: `${BASE_URL}/`,
          },
          publisher: {
            '@type': 'Organization',
            name: 'BharatUtility',
            url: `${BASE_URL}/`,
            logo: `${BASE_URL}/icons/icon-512.png`,
          },
          datePublished: art.publishedAt,
          dateModified: art.publishedAt,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: `${BASE_URL}/guides` },
            { '@type': 'ListItem', position: 3, name: art.title, item: canonicalUrl },
          ],
        },
      ],
    };

    let bodyHtml = `
      <article style="max-width:900px;margin:0 auto;padding:24px 20px;line-height:1.7;color:#334155;">
        <nav aria-label="Breadcrumb" style="font-size:12px;color:#64748b;margin-bottom:16px;">
          <a href="/" style="color:#4f46e5;text-decoration:none;">Home</a> &gt; 
          <a href="/guides" style="color:#4f46e5;text-decoration:none;">Guides</a> &gt; 
          <span style="color:#334155;">${escapeHtml(art.title)}</span>
        </nav>
        <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 12px 0;line-height:1.2;">${escapeHtml(art.title)}</h1>
        <div style="font-size:13px;color:#64748b;margin-bottom:24px;border-bottom:1px solid #e2e8f0;padding-bottom:12px;">
          <span>By ${escapeHtml(art.author || 'BharatUtility Team')}</span> &bull; 
          <span>${art.readTimeMinutes || 5} min read</span>
        </div>
        <div class="bu-article-content" style="font-size:15px;color:#334155;">
          ${art.content}
        </div>
      </article>
    `;

    const pageHtml = renderHtml(baseTemplate, {
      routePath: `/article/${art.slug}`,
      title,
      description,
      keywords: art.seo?.keywords,
      canonicalUrl,
      ogType: 'article',
      jsonLd,
      bodyHtml,
    });
    writePage(`/article/${art.slug}`, pageHtml);
    generatedCount++;
  });

  // 6. Static Trust Pages
  const staticPages = [
    {
      path: '/about',
      title: 'About Us - Everyday Tools for India | BharatUtility',
      description: 'Learn about BharatUtility, India’s fast, privacy-focused everyday calculation super-app built with client-side privacy.',
      h1: 'About BharatUtility',
      content: '<p>BharatUtility is dedicated to empowering everyday Indian citizens, professionals, students, and small business owners with unified, fast, free, and privacy-conscious web utilities.</p><p>We solve the daily digital friction of finding reliable calculators for Indian tax slabs, land units (Bigha, Guntha, Biswa), financial planning (PPF, EPF, EMI, SIP), and civic helpers.</p>'
    },
    {
      path: '/contact',
      title: 'Contact Us & Support | BharatUtility',
      description: 'Get in touch with the BharatUtility team for inquiries, formula feedback, tool suggestions, or support.',
      h1: 'Contact BharatUtility',
      content: '<p>Have feedback, found a formula discrepancy, or want to suggest a new Indian utility? Email us at <a href="mailto:arrjstechnologies@gmail.com">arrjstechnologies@gmail.com</a>.</p>'
    },
    {
      path: '/request-tool',
      title: 'Request a Tool or Calculator | BharatUtility',
      description: 'Suggest a new everyday calculator or digital utility for India. Our team builds community-requested tools.',
      h1: 'Request a New Tool',
      content: '<p>BharatUtility evolves through user requests. If there is a calculation, conversion, or document tool you need, let us know!</p>'
    },
    {
      path: '/sanatan-next',
      title: 'Sanatan Next — Aane Wali Peedhi Ke Liye Sanatan Gyan | BharatUtility',
      description: 'Discover Sanatan Next, a digital platform exploring Sanatan knowledge, traditions, festivals, sacred places and Indian cultural heritage.',
      h1: 'Sanatan Next Initiative',
      content: '<p>Explore Sanatan wisdom, Jyotirlingas, Shakti Peeths, Panchang, and Vedic knowledge on our sister platform Sanatan Next.</p>'
    },
    {
      path: '/legal/privacy',
      title: 'Privacy Policy | BharatUtility',
      description: 'BharatUtility privacy policy: Calculations process in your browser. No personal financial numbers or passwords harvested.',
      h1: 'Privacy Policy',
      content: '<p>Your privacy is central to BharatUtility. Many calculation tools process inputs directly in the browser, helping keep ordinary calculation data local to your session.</p>'
    },
    {
      path: '/legal/terms',
      title: 'Terms of Service | BharatUtility',
      description: 'BharatUtility terms of service and usage conditions.',
      h1: 'Terms of Service',
      content: '<p>BharatUtility tools are provided for general educational, estimation, and informational purposes. Always consult certified financial or legal advisors for critical decisions.</p>'
    },
    {
      path: '/legal/disclaimer',
      title: 'Disclaimer | BharatUtility',
      description: 'Disclaimer regarding calculator estimations, government rules, and formulas.',
      h1: 'Disclaimer',
      content: '<p>While every calculation formula is based on current Indian laws and official standards, calculations represent estimates and should be verified against official authorities.</p>'
    }
  ];

  staticPages.forEach(p => {
    const canonicalUrl = `${BASE_URL}${p.path}`;
    let bodyHtml = `
      <main style="max-width:900px;margin:0 auto;padding:32px 20px;line-height:1.7;color:#334155;">
        <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:0 0 16px 0;">${escapeHtml(p.h1)}</h1>
        <div style="font-size:15px;color:#475569;">${p.content}</div>
      </main>
    `;

    const pageHtml = renderHtml(baseTemplate, {
      routePath: p.path,
      title: p.title,
      description: p.description,
      canonicalUrl,
      bodyHtml,
    });
    writePage(p.path, pageHtml);
    generatedCount++;
  });

  // 7. Update Homepage dist/index.html with canonical and rich semantic content
  {
    const canonicalUrl = `${BASE_URL}/`;
    const title = 'BharatUtility - Free Online Tools for Everyday India';
    const description = 'BharatUtility provides free, fast, and 100% private online calculators, document tools, financial planners, and daily utilities for India.';

    let bodyHtml = `
      <header style="max-width:1200px;margin:0 auto;padding:24px 20px;text-align:center;">
        <h1 style="font-size:36px;font-weight:900;color:#0f172a;margin:0 0 12px 0;letter-spacing:-0.03em;">BharatUtility — India's Digital Utility Super-Site</h1>
        <p style="font-size:16px;color:#475569;max-width:750px;margin:0 auto 24px auto;line-height:1.6;">Over 233+ free, fast, and private online calculators, tax planners, converters, and civic utilities tailored for India.</p>
        <div style="margin-bottom:32px;">
          <a href="/tools" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">Explore All 233+ Tools</a>
        </div>
      </header>

      <main style="max-width:1200px;margin:0 auto;padding:0 20px;">
        <h2 style="font-size:22px;font-weight:800;color:#0f172a;margin-bottom:16px;">Core Indian Utility Categories</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:16px;margin-bottom:36px;">
          ${CATEGORIES.map(cat => `
            <a href="/category/${cat.id}" style="display:block;padding:20px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;text-decoration:none;">
              <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:0 0 6px 0;">${escapeHtml(cat.name)}</h3>
              <p style="font-size:12px;color:#64748b;margin:0;">${escapeHtml(cat.description)}</p>
            </a>
          `).join('')}
        </div>
      </main>
    `;

    const homeHtml = renderHtml(baseTemplate, {
      routePath: '/',
      title,
      description,
      canonicalUrl,
      bodyHtml,
    });
    fs.writeFileSync(templatePath, homeHtml, 'utf-8');
    generatedCount++;
  }

  console.log(`✅ Technical SEO Pre-rendering complete! Generated ${generatedCount} static crawlable HTML pages in "dist/".`);
}

prerenderAllRoutes();
