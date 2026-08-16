import { Tool } from '../types';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';
import { CATEGORIES } from '../data/categories';
import { parseNaturalLanguageQuery, ParsedToolIntent } from './naturalLanguageParser';
import { adminStore } from '../services/adminStore';

const RECENT_SEARCHES_KEY = 'bu_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export interface SmartSearchResult {
  exactAndKeywordMatches: Tool[];
  categoryMatches: Array<{ id: string; name: string; icon: string; toolCount: number; description: string }>;
  naturalLanguageIntent: ParsedToolIntent | null;
  hasMatches: boolean;
  query: string;
}

// Common Indian Hindi/English Synonym Map
const SYNONYM_MAP: Record<string, string[]> = {
  salary: ['in hand', 'inhand', 'ctc', 'take home', 'epf', 'pf', 'gross', 'net salary', 'pay', 'monthly salary', 'increment', 'appraisal', 'deductions', 'tds'],
  emi: ['loan', 'home loan', 'car loan', 'personal loan', 'interest', 'monthly installment', 'byaj', 'karz', 'mortgage', 'sbi emi', 'hdfc emi', 'amortization'],
  gst: ['tax', 'cgst', 'sgst', 'igst', 'vat', 'invoice', 'gst 18', 'gst 12', 'gst 5', 'reverse gst', 'tax slab', 'hsn'],
  sip: ['mutual fund', 'investment', 'wealth', 'nifty', 'compounding', 'crorepati', 'equity', 'lumpsum', 'returns', 'cagr', 'nav'],
  age: ['dob', 'date of birth', 'janam din', 'umar', 'birthday', 'how old', 'years old', 'chronological'],
  unit: ['converter', 'gaj', 'bigha', 'katha', 'guntha', 'sq ft', 'square feet', 'acre', 'hectare', 'cent', 'ground', 'marla', 'kanal', 'land', 'area converter'],
  cgpa: ['cbse', 'percentage to cgpa', 'cgpa to percentage', 'grade', 'marks', '10th', '12th', 'college gpa', 'sgpa'],
  fd: ['fixed deposit', 'bank fd', 'sbi fd', 'hdfc fd', 'term deposit', 'interest payout', 'senior citizen', 'cumulative'],
  paint: ['wall paint', 'primer', 'room paint', 'asian paints', 'berger', 'coverage', 'liter', 'whitewash', 'distemper'],
  tile: ['flooring', 'bathroom tiles', 'kitchen tiles', 'vitrified', 'boxes', 'sq ft tiles', 'grout'],
  fuel: ['petrol', 'diesel', 'mileage', 'bike mileage', 'car mileage', 'trip expense', 'cng', 'petrol price', 'fuel cost'],
  letter: ['resignation', 'leave application', 'sick leave', 'casual leave', 'wfh', 'notice period', 'email format', 'resignation letter'],
  date: ['date difference', 'days between', 'working days', 'tenure', 'age diff', 'calendar days'],
  percentage: ['percent', 'prcnt', 'ratio', 'fraction', 'discount', 'markup', 'change percentage'],
};

// Common Indian / Search Typo Normalization Dictionary
const TYPO_MAP: Record<string, string> = {
  caluclator: 'calculator',
  calculater: 'calculator',
  calculatr: 'calculator',
  calcualtor: 'calculator',
  calc: 'calculator',
  salry: 'salary',
  slary: 'salary',
  salery: 'salary',
  selary: 'salary',
  percantage: 'percentage',
  persentage: 'percentage',
  percentge: 'percentage',
  prcentage: 'percentage',
  intrest: 'interest',
  interst: 'interest',
  homeloan: 'home loan',
  personalloan: 'personal loan',
  carloan: 'car loan',
  bithday: 'birthday',
  brithday: 'birthday',
  mutul: 'mutual',
  mutal: 'mutual',
  gratuity: 'gratuity',
  gratuty: 'gratuity',
  milage: 'mileage',
  mielage: 'mileage',
  flooring: 'tile',
  bighaa: 'bigha',
  gaaj: 'gaj',
  resigntion: 'resignation',
  resign: 'resignation',
};

export const TRENDING_SEARCH_KEYWORDS = [
  'Home Loan EMI',
  'In-Hand Salary',
  'GST 18% Slabs',
  'SIP Compounding',
  'Age & DOB',
  'Gaj to Sq Ft',
  'Bike Mileage & Petrol',
  'Resignation Letter Format'
];

/**
 * Lightweight Levenshtein Distance for fast typo tolerance
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], row[j], prev) + 1;
      row[j - 1] = prev;
      prev = val;
    }
    row[b.length] = prev;
  }
  return row[b.length];
}

/**
 * Checks if token is a fuzzy/typo match with target string
 */
export function isFuzzyMatch(word: string, target: string): boolean {
  if (word === target) return true;
  const maxDistance = word.length > 5 ? 2 : word.length >= 4 ? 1 : 0;
  if (maxDistance === 0) return false;
  if (Math.abs(word.length - target.length) > maxDistance) return false;
  return levenshteinDistance(word, target) <= maxDistance;
}

/**
 * Checks if a keyword matches a search term using word-boundary precision
 */
export function matchesKeyword(keyword: string, term: string): boolean {
  if (keyword === term) return true;
  const kwWords = keyword.split(/[\s,_\-]+/);
  const termWords = term.split(/[\s,_\-]+/);
  return kwWords.some(kw => termWords.some(tw => kw === tw || (tw.length >= 4 && kw.startsWith(tw)) || (kw.length >= 4 && tw.startsWith(kw))));
}

/**
 * Normalizes input query with typo fixes and synonyms
 */
function normalizeTokens(tokens: string[]): { original: string[]; normalized: string[]; expanded: Set<string> } {
  const normalized: string[] = [];
  const expanded = new Set<string>();

  for (const token of tokens) {
    const fixedToken = TYPO_MAP[token] || token;
    normalized.push(fixedToken);
    expanded.add(fixedToken);
    expanded.add(token);

    // Expand through synonym map
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (fixedToken === key || token === key || synonyms.some(s => s.includes(fixedToken) || fixedToken.includes(s))) {
        expanded.add(key);
        synonyms.forEach(s => expanded.add(s));
      }
    }
  }

  return { original: tokens, normalized, expanded };
}

/**
 * Executes high-performance local multi-attribute smart search with synonym expansion,
 * keyword matching, fuzzy category matching, and natural language intent parsing.
 */
export function executeSmartSearch(rawQuery: string): SmartSearchResult {
  const query = (rawQuery || '').trim();
  if (!query) {
    return {
      exactAndKeywordMatches: [],
      categoryMatches: [],
      naturalLanguageIntent: null,
      hasMatches: false,
      query: '',
    };
  }

  const clean = query.toLowerCase();
  const rawTokens = clean.split(/[\s,_\-]+/).filter(t => t.length > 0);
  const { normalized: tokens, expanded: searchTerms } = normalizeTokens(rawTokens);
  const normalizedClean = tokens.join(' ');

  // 1. Natural Language Intent & Parameter Detection
  const naturalLanguageIntent = parseNaturalLanguageQuery(clean);

  // 2. Search tools registry with ranked multi-attribute scoring
  const scoredTools: Array<{ tool: Tool; score: number }> = [];

  for (const tool of TOOLS_REGISTRY) {
    let score = 0;
    const nameLower = (tool.name || '').toLowerCase();
    const shortNameLower = (tool.shortName || '').toLowerCase();
    const slugLower = (tool.slug || '').toLowerCase();
    const taglineLower = (tool.tagline || '').toLowerCase();
    const descLower = (tool.description || '').toLowerCase();
    const categoryLower = (tool.category || '').toLowerCase();
    const keywords = (tool.keywords || []).map(k => k.toLowerCase());

    // ── PRIMARY DIRECT MATCHES (Highest Priority) ──

    // 1. Exact tool name or shortName
    if (nameLower === clean || shortNameLower === clean || nameLower === normalizedClean || shortNameLower === normalizedClean) {
      score += 1000;
    } else if (nameLower.startsWith(clean) || shortNameLower.startsWith(clean) || nameLower.startsWith(normalizedClean) || shortNameLower.startsWith(normalizedClean)) {
      score += 750;
    } else if (nameLower.includes(clean) || shortNameLower.includes(clean) || nameLower.includes(normalizedClean) || shortNameLower.includes(normalizedClean)) {
      score += 550;
    }

    // 2. Slug exact match or prefix
    if (slugLower === clean || slugLower === normalizedClean) {
      score += 500;
    } else if (slugLower.startsWith(clean)) {
      score += 350;
    } else if (slugLower.includes(clean)) {
      score += 250;
    }

    // 3. Exact keyword match
    if (keywords.includes(clean) || keywords.includes(normalizedClean)) {
      score += 400;
    } else if (keywords.some(k => k.startsWith(clean) || k.startsWith(normalizedClean))) {
      score += 250;
    } else if (keywords.some(k => k.includes(clean) || clean.includes(k))) {
      score += 180;
    }

    // 4. Tagline & Description direct match
    if (taglineLower.includes(clean) || taglineLower.includes(normalizedClean)) {
      score += 120;
    }
    if (descLower.includes(clean) || descLower.includes(normalizedClean)) {
      score += 80;
    }

    // 5. Category direct match
    if (categoryLower === clean || categoryLower === normalizedClean) {
      score += 100;
    }

    // ── TOKEN-LEVEL & SYNONYM MATCHES ──
    const toolWords = (nameLower + ' ' + shortNameLower).split(/[\s,_\-]+/);
    for (const term of searchTerms) {
      if (!term || term.length < 2) continue;

      const termWords = term.split(/[\s,_\-]+/);
      const isWordInTool = termWords.some(tw => toolWords.includes(tw) || (tw.length >= 4 && toolWords.some(w => w.startsWith(tw))));

      if (isWordInTool) {
        score += 45;
      }
      if (keywords.some(k => matchesKeyword(k, term))) {
        score += 35;
      }
      if (categoryLower === term || (term.length >= 4 && categoryLower.includes(term))) {
        score += 25;
      }
      if (term.length >= 4 && taglineLower.includes(term)) {
        score += 15;
      }
      if (term.length >= 4 && descLower.includes(term)) {
        score += 10;
      }
    }

    // ── TYPO & FUZZY MATCHES (When direct matches are insufficient) ──
    for (const token of tokens) {
      if (token.length >= 3) {
        // Check against words in tool name
        const nameWords = nameLower.split(/[\s,_\-]+/);
        for (const nw of nameWords) {
          if (isFuzzyMatch(token, nw)) {
            score += 90;
            break;
          }
        }

        // Check against keywords
        for (const kw of keywords) {
          if (isFuzzyMatch(token, kw)) {
            score += 70;
            break;
          }
        }
      }
    }

    // ── BOOST FOR NATURAL LANGUAGE INTENT ──
    if (naturalLanguageIntent && (tool.slug === naturalLanguageIntent.toolSlug || tool.id === naturalLanguageIntent.toolSlug)) {
      score += 300;
    }

    // ── SMALL TIE-BREAKER FOR CURATED POPULAR / TRENDING / NEW TOOLS (Only if query matched) ──
    if (score > 0) {
      if (tool.popular) score += 3;
      if (tool.trending) score += 2;
      if (tool.badge === 'New' || tool.badge === 'Top Tool') score += 1;
      scoredTools.push({ tool, score });
    }
  }

  // Sort strictly descending by relevance score
  scoredTools.sort((a, b) => b.score - a.score);
  const matchedTools = scoredTools.map(st => st.tool).slice(0, 10);

  // 3. Category Matches (Only if real match exists)
  const categoryMatches = (matchedTools.length > 0 || clean.length >= 3)
    ? CATEGORIES.filter(cat => {
        const catName = (cat.name || '').toLowerCase();
        const catDesc = (cat.description || '').toLowerCase();
        return (
          cat.id === clean ||
          catName === clean ||
          catName.includes(clean) ||
          (clean.length >= 3 && clean.includes(cat.id)) ||
          (clean.length >= 3 && Array.from(tokens).some(t => t.length >= 3 && (catName.includes(t) || cat.id.includes(t))))
        );
      }).map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        toolCount: cat.toolCount,
        description: cat.description,
      })).slice(0, 3)
    : [];

  const hasMatches = matchedTools.length > 0 || categoryMatches.length > 0 || naturalLanguageIntent !== null;

  return {
    exactAndKeywordMatches: matchedTools,
    categoryMatches,
    naturalLanguageIntent,
    hasMatches,
    query,
  };
}

/**
 * Safely record search query telemetry outside of render phase.
 */
export function recordSearchTelemetry(query: string, hasMatches: boolean, matchedToolSlug?: string): void {
  if (query && query.trim().length >= 2) {
    adminStore.recordSearchQuery(query, hasMatches, matchedToolSlug);
  }
}

// ── RECENT SEARCHES LOCAL STORAGE ──

export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(term: string): string[] {
  if (!term || term.trim().length < 2) return getRecentSearches();
  const clean = term.trim();
  const current = getRecentSearches().filter(t => t.toLowerCase() !== clean.toLowerCase());
  const updated = [clean, ...current].slice(0, MAX_RECENT_SEARCHES);
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function removeRecentSearch(term: string): string[] {
  const current = getRecentSearches().filter(t => t.toLowerCase() !== term.toLowerCase());
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(current));
  } catch {}
  return current;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {}
}
