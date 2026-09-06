import fs from 'fs';
import path from 'path';

const toolsPath = path.resolve('src/data/toolsRegistry.ts');
const toolsCode = fs.readFileSync(toolsPath, 'utf8');

// Match slugs
const matches = [...toolsCode.matchAll(/slug:\s*'([^']+)'/g)];
const toolSlugs = matches.map(m => m[1]);
const uniqueToolSlugs = [...new Set(toolSlugs)];

const categories = [
  'money',
  'daily-life',
  'home',
  'education',
  'travel',
  'business',
  'technology',
  'documents',
  'date-time',
  'india-services',
  'document-tools',
  'vehicle-utility',
  'travel-utility'
];

const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { loc: 'https://bharatutility.tech/', changefreq: 'daily', priority: '1.0' },
  { loc: 'https://bharatutility.tech/tools', changefreq: 'daily', priority: '0.9' },
  { loc: 'https://bharatutility.tech/categories', changefreq: 'weekly', priority: '0.8' },
  { loc: 'https://bharatutility.tech/about', changefreq: 'monthly', priority: '0.6' },
  { loc: 'https://bharatutility.tech/contact', changefreq: 'monthly', priority: '0.6' },
  { loc: 'https://bharatutility.tech/request-tool', changefreq: 'monthly', priority: '0.7' },
  { loc: 'https://bharatutility.tech/legal/privacy', changefreq: 'monthly', priority: '0.4' },
  { loc: 'https://bharatutility.tech/legal/terms', changefreq: 'monthly', priority: '0.4' },
  { loc: 'https://bharatutility.tech/legal/disclaimer', changefreq: 'monthly', priority: '0.4' }
];

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

for (const p of staticPages) {
  xml += `  <url>\n    <loc>${p.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
}

for (const cat of categories) {
  xml += `  <url>\n    <loc>https://bharatutility.tech/category/${cat}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
}

for (const slug of uniqueToolSlugs) {
  xml += `  <url>\n    <loc>https://bharatutility.tech/tool/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
}

xml += `</urlset>\n`;

const sitemapPath = path.resolve('public/sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');

console.log(`Generated public/sitemap.xml with ${staticPages.length + categories.length + uniqueToolSlugs.length} total URLs.`);
