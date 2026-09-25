import { TOOLS_REGISTRY } from '../src/data/toolsRegistry.js';
import fs from 'fs';

let report = "# BHARATUTILITY SEO & CONTENT AUDIT REPORT\n\n";

// 1. INVENTORY
report += "## 1. INVENTORY\n";
report += `- Exact public tool count: ${TOOLS_REGISTRY.length}\n`;
report += `- Exact public route count: ${TOOLS_REGISTRY.length} (tools) + 13 (categories) + 1 (home) = ${TOOLS_REGISTRY.length + 14}\n\n`;

// 2. DUPLICATE AUDIT
report += "## 2. DUPLICATE / OVERLAPPING AUDIT\n";
report += "| Tool A | Tool B | Status | Action |\n";
report += "| ------ | ------ | ------ | ------ |\n";

const overlaps = [];
for (let i = 0; i < TOOLS_REGISTRY.length; i++) {
  for (let j = i + 1; j < TOOLS_REGISTRY.length; j++) {
    const t1 = TOOLS_REGISTRY[i];
    const t2 = TOOLS_REGISTRY[j];
    
    const kwOverlap = t1.keywords.filter(k => t2.keywords.includes(k));
    const title1Words = t1.seo.title.toLowerCase().split(/[\s,-]+/).filter(w => w.length > 3);
    const title2Words = t2.seo.title.toLowerCase().split(/[\s,-]+/).filter(w => w.length > 3);
    const titleOverlap = title1Words.filter(w => title2Words.includes(w));
    
    if (kwOverlap.length >= 4 || titleOverlap.length >= 4 || t1.name === t2.name) {
       overlaps.push({ a: t1.name, b: t2.name, slugA: t1.slug, slugB: t2.slug });
       report += `| ${t1.name} | ${t2.name} | Needs manual review | TBD |\n`;
    }
  }
}
report += "\n";

// 3. FRESHNESS / TIME-SENSITIVE CONTENT
report += "## 3. TIME-SENSITIVE CONTENT AUDIT\n";
const timeSensitiveKeywords = [
  'interest', 'tax', 'gst', 'deduction', 'scheme', 'subsidy', 'rbi', 'rate', 
  'price', 'epf', 'ppf', 'ssy', 'nps', 'apy', 'limit', 'challan', 'fee', 'duty', 'tariff', '2024', '2025', '2026'
];
let timeSensitiveCount = 0;
report += "The following tools contain time-sensitive claims (based on keywords):\n";
TOOLS_REGISTRY.forEach(t => {
  const content = (t.name + " " + t.description + " " + t.seo.title + " " + t.seo.description).toLowerCase();
  const found = timeSensitiveKeywords.filter(k => content.includes(k));
  if (found.length > 0) {
    timeSensitiveCount++;
    report += `- **${t.name}** (Matches: ${found.slice(0, 3).join(', ')})\n`;
  }
});
report += `\nTotal time-sensitive tools flagged: ${timeSensitiveCount}\n\n`;

// 4. METADATA AUDIT
report += "## 4. METADATA AUDIT\n";
let longTitles = 0;
let missingDescriptions = 0;
TOOLS_REGISTRY.forEach(t => {
  if (t.seo.title.length > 70) longTitles++;
  if (!t.seo.description || t.seo.description.length < 10) missingDescriptions++;
});
report += `- Titles > 70 chars: ${longTitles}\n`;
report += `- Missing/Short descriptions: ${missingDescriptions}\n\n`;

fs.writeFileSync('audit-report.md', report);
console.log('Audit completed and saved to audit-report.md');
