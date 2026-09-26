import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getActiveTools } from '../src/data/toolsRegistry.ts';
const TOOLS_REGISTRY = getActiveTools();
import { CATEGORIES } from '../src/data/categories.ts';
import { getAllArticles } from '../src/data/contentRegistry.ts';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://bharatutility.tech';

interface SitemapUrl {
  loc: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

function generateSitemap(): void {
  const urls: SitemapUrl[] = [];

  // 1. Homepage
  urls.push({
    loc: `${BASE_URL}/`,
    changefreq: 'daily',
    priority: '1.0',
  });

  // 2. All Tools Directory
  urls.push({
    loc: `${BASE_URL}/tools`,
    changefreq: 'daily',
    priority: '0.9',
  });

  // 3. Category Hub Pages
  CATEGORIES.forEach(cat => {
    urls.push({
      loc: `${BASE_URL}/category/${cat.id}`,
      changefreq: 'weekly',
      priority: '0.85',
    });
  });

  // 4. Tool Detail Pages
  TOOLS_REGISTRY.forEach(tool => {
    const slug = tool.seo?.canonicalSlug || tool.slug;
    const isHighPriority = tool.popular || tool.featured || tool.trending;
    urls.push({
      loc: `${BASE_URL}/tools/${slug}`,
      changefreq: isHighPriority ? 'daily' : 'weekly',
      priority: isHighPriority ? '0.95' : '0.80',
    });
  });

  // 4.5. Guide/Article Detail Pages
  const articles = getAllArticles();
  articles.forEach(article => {
    urls.push({
      loc: `${BASE_URL}/article/${article.slug}`,
      changefreq: 'weekly',
      priority: '0.80',
    });
  });

  // 5. Static & Trust Pages
  const staticPages = [
    { path: '/sanatan-next', priority: '0.85', changefreq: 'weekly' as const },
    { path: '/about', priority: '0.7', changefreq: 'monthly' as const },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' as const },
    { path: '/request-tool', priority: '0.8', changefreq: 'weekly' as const },
    { path: '/legal/privacy', priority: '0.5', changefreq: 'yearly' as const },
    { path: '/legal/terms', priority: '0.5', changefreq: 'yearly' as const },
    { path: '/legal/disclaimer', priority: '0.5', changefreq: 'yearly' as const },
  ];

  staticPages.forEach(p => {
    urls.push({
      loc: `${BASE_URL}${p.path}`,
      changefreq: p.changefreq,
      priority: p.priority,
    });
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls
  .map(
    u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, xmlContent.trim(), 'utf-8');
  console.log(`✅ Sitemap successfully generated with ${urls.length} indexable URLs at: ${publicPath}`);
  console.log(`   - Tools indexed: ${TOOLS_REGISTRY.length}`);
  console.log(`   - Categories indexed: ${CATEGORIES.length}`);
  console.log(`   - Articles indexed: ${articles.length}`);
  console.log(`   - Static pages indexed: ${staticPages.length + 2}`);
}

generateSitemap();

