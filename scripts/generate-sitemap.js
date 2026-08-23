import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const DOMAIN = 'https://bharatutility.tools';

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/tools', priority: '0.9', changefreq: 'daily' },
  { path: '/categories', priority: '0.8', changefreq: 'weekly' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/legal/privacy', priority: '0.5', changefreq: 'monthly' },
  { path: '/legal/terms', priority: '0.5', changefreq: 'monthly' },
  { path: '/legal/disclaimer', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
  { path: '/request-tool', priority: '0.7', changefreq: 'monthly' },
];

const categorySlugs = [
  'money',
  'daily-life',
  'home',
  'education',
  'travel',
  'business',
  'technology',
  'documents',
  'date-time',
];

const toolSlugs = [
  'emi-calculator',
  'sip-calculator',
  'salary-calculator',
  'gst-calculator',
  'age-calculator',
  'percentage-calculator',
  'unit-converter',
  'paint-calculator',
  'tile-calculator',
  'fuel-cost-calculator',
  'cgpa-calculator',
  'marks-percentage-calculator',
  'letter-generator',
  'fd-calculator',
  'date-difference-calculator',
];

export function buildSitemapXml() {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static routes
  staticRoutes.forEach(r => {
    xml += `  <url>\n    <loc>${DOMAIN}${r.path}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
  });

  // Category routes
  categorySlugs.forEach(c => {
    xml += `  <url>\n    <loc>${DOMAIN}/category/${c}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  // Tool routes
  toolSlugs.forEach(t => {
    const priority = ['emi-calculator', 'sip-calculator', 'salary-calculator', 'gst-calculator'].includes(t) ? '0.9' : '0.8';
    xml += `  <url>\n    <loc>${DOMAIN}/tool/${t}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  });

  xml += `</urlset>\n`;
  return xml;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, '../public/sitemap.xml');

fs.writeFileSync(outputPath, buildSitemapXml(), 'utf8');
console.log(`Sitemap written successfully to ${outputPath}`);
