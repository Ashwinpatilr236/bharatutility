import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registryPath = path.join(__dirname, '../src/data/toolsRegistry.ts');
let registryCode = fs.readFileSync(registryPath, 'utf8');

// 1. DUPLICATES TO REMOVE (as per audit)
const duplicatesToRemove = [
  'home-loan-prepayment-tenure-calculator',
  'sukanya-samriddhi-yojana-calculator',
  'jewellery-gold-making-charge-calculator',
  'state-electricity-slab-calculator',
  'mobile-imei-luhn-validator-ceir-guide'
];

let removedCount = 0;
// We will use a regex to match the tool object if it's well-formatted.
// Alternatively, since it's hard to parse with regex, we can just let TS compiler or babel do it, but we don't have babel setup for writing.
// Let's use a simpler approach: Just filter out the objects from the array in memory and re-write the file? No, re-writing the file from JSON loses all comments, components, latex math, etc.

// Instead of removing, let's just mark them as `status: 'inactive'` so they don't break anything.
// We can find `slug: '...'` and then add `status: 'inactive',` right after it.
duplicatesToRemove.forEach(slug => {
  const regex = new RegExp(`slug:\\s*['"]${slug}['"],`);
  if (regex.test(registryCode)) {
    registryCode = registryCode.replace(regex, `slug: '${slug}',\n  status: 'inactive',`);
    removedCount++;
  }
});
console.log(`Deactivated ${removedCount} duplicates.`);

// 2. TIME-SENSITIVE FLAGS
const timeSensitiveKeywords = [
  'interest', 'tax', 'gst', 'deduction', 'scheme', 'subsidy', 'rbi', 'rate', 
  'price', 'epf', 'ppf', 'ssy', 'nps', 'apy', 'limit', 'challan', 'fee', 'duty', 'tariff', '2024', '2025', '2026'
];

// Instead of parsing the whole file, let's just find `id: '...',` and if the slug matches our audit, add the flag.
import { TOOLS_REGISTRY } from '../src/data/toolsRegistry.js';

let flaggedCount = 0;
TOOLS_REGISTRY.forEach(t => {
  const content = (t.name + " " + t.description + " " + t.seo.title + " " + t.seo.description).toLowerCase();
  const found = timeSensitiveKeywords.filter(k => content.includes(k));
  if (found.length > 0) {
    // Flag it in the source code
    const regex = new RegExp(`slug:\\s*['"]${t.slug}['"],`);
    if (regex.test(registryCode)) {
      registryCode = registryCode.replace(regex, `slug: '${t.slug}',\n  needsManualVerification: true,\n  lastUpdated: '2026-09-25',`);
      flaggedCount++;
    }
  }
});
console.log(`Flagged ${flaggedCount} tools for manual verification & added lastUpdated.`);

fs.writeFileSync(registryPath, registryCode);
console.log('Successfully updated toolsRegistry.ts');
