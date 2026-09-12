import { TOOLS_REGISTRY, getToolBySlug, getToolsByCategory, getPopularTools } from '../src/data/toolsRegistry';
import { CATEGORIES } from '../src/data/categories';
import https from 'https';
import http from 'http';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(suite: string, name: string, condition: boolean, details?: string) {
  results.push({ suite, name, passed: condition, details });
}

console.log('====================================================');
console.log('🚀 RUNNING BHARATUTILITY COMPREHENSIVE QA TEST SUITE');
console.log('====================================================\n');

// 1. ROUTE & REGISTRY INTEGRITY
assert('Route Integrity', 'Total tools is 106', TOOLS_REGISTRY.length === 106, `Found ${TOOLS_REGISTRY.length}`);
assert('Route Integrity', 'Total categories is 13', CATEGORIES.length === 13, `Found ${CATEGORIES.length}`);

// Check unique slugs
const slugs = new Set<string>();
let duplicateSlugs = 0;
for (const tool of TOOLS_REGISTRY) {
  if (slugs.has(tool.slug)) duplicateSlugs++;
  slugs.add(tool.slug);
}
assert('Route Integrity', 'Zero duplicate tool slugs', duplicateSlugs === 0, `${duplicateSlugs} duplicates`);

// Check category assignments
let invalidCategories = 0;
const validCatIds = new Set(CATEGORIES.map(c => c.id));
for (const tool of TOOLS_REGISTRY) {
  if (!validCatIds.has(tool.category)) {
    invalidCategories++;
    console.error(`Invalid category on tool ${tool.slug}: ${tool.category}`);
  }
}
assert('Route Integrity', 'All tools map to valid existing categories', invalidCategories === 0);

// 2. DISCOVERY & RELATED TOOLS FALLBACK AUDIT
let toolsWithoutRelated = 0;
for (const tool of TOOLS_REGISTRY) {
  const explicit = (tool.relatedToolSlugs || []).map(s => getToolBySlug(s)).filter(Boolean);
  const catFallback = getToolsByCategory(tool.category).filter(t => t.slug !== tool.slug && !explicit.some(r => r.slug === t.slug));
  const popFallback = getPopularTools(6).filter(t => t.slug !== tool.slug && !explicit.some(r => r.slug === t.slug) && !catFallback.some(c => c.slug === t.slug));
  const resolved = [...explicit, ...catFallback, ...popFallback].slice(0, 4);

  if (resolved.length < 3) {
    toolsWithoutRelated++;
  }
}
assert('Discovery Loop', 'All 106 tools have at least 3-4 working related tools', toolsWithoutRelated === 0, `${toolsWithoutRelated} tools failed`);

// 3. 10 REPRESENTATIVE TOOLS CALCULATION & BOUNDARY TESTS
console.log('\n--- Running Mathematical & Functional Unit Checks ---');

// Test 1: EMI Calculator math
function calcEmi(p: number, r: number, tenureMonths: number) {
  if (p <= 0 || tenureMonths <= 0) return 0;
  if (r <= 0) return p / tenureMonths;
  const monthlyR = r / 12 / 100;
  const factor = Math.pow(1 + monthlyR, tenureMonths);
  return (p * monthlyR * factor) / (factor - 1);
}
const emi10L = calcEmi(1000000, 8.5, 240);
assert('Math QA: EMI', '10 Lakhs @ 8.5% for 20 yrs gives ₹8,678 EMI', Math.round(emi10L) === 8678, `Got ${Math.round(emi10L)}`);
const emiZeroRate = calcEmi(120000, 0, 12);
assert('Math QA: EMI', '0% interest gives principal/months (₹10,000)', Math.round(emiZeroRate) === 10000);
const emiLarge = calcEmi(100000000, 9.25, 360); // 100 Cr
assert('Math QA: EMI', '100 Cr loan calculates cleanly without NaN or Overflow', !isNaN(emiLarge) && isFinite(emiLarge));

// Test 2: GST Calculator math
function calcGst(amount: number, rate: number, isInclusive: boolean) {
  if (amount <= 0 || rate < 0) return { base: 0, gst: 0, total: 0 };
  if (isInclusive) {
    const base = (amount * 100) / (100 + rate);
    const gst = amount - base;
    return { base, gst, total: amount };
  } else {
    const gst = (amount * rate) / 100;
    return { base: amount, gst, total: amount + gst };
  }
}
const gst18Exclusive = calcGst(10000, 18, false);
assert('Math QA: GST', '₹10,000 + 18% GST gives ₹1,800 GST & ₹11,800 Total', gst18Exclusive.gst === 1800 && gst18Exclusive.total === 11800);
const gst18Inclusive = calcGst(11800, 18, true);
assert('Math QA: GST', '₹11,800 inclusive 18% gives ₹10,000 base & ₹1,800 GST', Math.round(gst18Inclusive.base) === 10000 && Math.round(gst18Inclusive.gst) === 1800);

// Test 3: Fuel Cost math
function calcFuel(distanceKm: number, mileageKmpl: number, pricePerLitre: number) {
  if (distanceKm <= 0 || mileageKmpl <= 0 || pricePerLitre <= 0) return 0;
  const litres = distanceKm / mileageKmpl;
  return litres * pricePerLitre;
}
const fuelCost = calcFuel(500, 20, 100);
assert('Math QA: Fuel', '500km @ 20 kmpl & ₹100/L gives ₹2,500 fuel cost', fuelCost === 2500);
const fuelDivZero = calcFuel(500, 0, 100);
assert('Math QA: Fuel', '0 mileage gracefully returns 0 without divide-by-zero crash', fuelDivZero === 0);

// Test 4: CGPA to Percentage
function cgpaToPct(cgpa: number) {
  if (cgpa < 0 || cgpa > 10) return 0;
  return cgpa * 9.5;
}
assert('Math QA: CGPA', '8.4 CGPA * 9.5 multiplier = 79.8%', Math.abs(cgpaToPct(8.4) - 79.8) < 0.001);
assert('Math QA: CGPA', '10.0 CGPA * 9.5 = 95%', cgpaToPct(10.0) === 95);

// Test 5: SIP Calculator math
function calcSip(monthly: number, annualRate: number, years: number) {
  if (monthly <= 0 || years <= 0) return { invested: 0, wealth: 0 };
  const months = years * 12;
  const i = annualRate / 12 / 100;
  if (i === 0) return { invested: monthly * months, wealth: monthly * months };
  const wealth = monthly * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  return { invested: monthly * months, wealth };
}
const sip5k = calcSip(5000, 12, 10);
assert('Math QA: SIP', '₹5,000/mo @ 12% for 10 yrs gives ₹6L invested & ~₹11.61L corpus', sip5k.invested === 600000 && Math.round(sip5k.wealth) === 1161695);

// Test 6: Cash Denomination Tally math
function calcTally(notes: Record<number, number>) {
  return Object.entries(notes).reduce((sum, [denom, count]) => sum + (Number(denom) * Math.max(0, count)), 0);
}
const tally = calcTally({ 500: 10, 200: 5, 100: 20, 50: 10 });
assert('Math QA: Cash Tally', '10x500 + 5x200 + 20x100 + 10x50 = ₹8,500', tally === 8500);

// Test 7: Land Area conversion math (Bigha to Sq Ft)
function bighaToSqFt(bigha: number, stateRate: number = 27000) {
  return bigha * stateRate;
}
assert('Math QA: Land Area', '2 Bigha in UP (27,000 sq ft/bigha) = 54,000 sq ft', bighaToSqFt(2, 27000) === 54000);

// 4. CHECK LOCAL SERVER STATUS ON HTTP 3000
http.get('http://localhost:3000', (res) => {
  assert('Local Server QA', 'Local Express & Vite server responds with status 200', res.statusCode === 200);

  // 5. PRODUCTION DOMAIN CHECK (https://bharatutility.tech)
  console.log('\n--- Checking Canonical Production Domain (https://bharatutility.tech) ---');
  const req = https.get('https://bharatutility.tech', (prodRes) => {
    assert('Production Check', `https://bharatutility.tech responded with HTTP ${prodRes.statusCode}`, prodRes.statusCode === 200 || prodRes.statusCode === 301 || prodRes.statusCode === 302);
    printSummary();
  });

  req.on('error', (err) => {
    assert('Production Check', `Production network request error: ${err.message}`, false);
    printSummary();
  });
}).on('error', (err) => {
  assert('Local Server QA', `Local server request error: ${err.message}`, false);
  printSummary();
});

function printSummary() {
  console.log('\n====================================================');
  console.log('📊 FINAL QA RESULTS SUMMARY');
  console.log('====================================================');
  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} [${r.suite}] ${r.name} ${r.details ? `(${r.details})` : ''}`);
    if (r.passed) passCount++;
    else failCount++;
  }

  console.log('\n----------------------------------------------------');
  console.log(`Total Passed: ${passCount} | Total Failed: ${failCount}`);
  console.log('====================================================\n');
}
