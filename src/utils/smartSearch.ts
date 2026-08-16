import { Tool } from '../types';
import { TOOLS_REGISTRY } from '../data/toolsRegistry';
import { CATEGORIES } from '../data/categories';
import { parseNaturalLanguageQuery, ParsedToolIntent } from './naturalLanguageParser';
import { adminStore } from '../services/adminStore';

const RECENT_SEARCHES_KEY = 'bu_recent_searches';

export interface SmartSearchResult {
  exactAndKeywordMatches: Tool[];
  categoryMatches: Array<{ id: string; name: string; icon: string; toolCount: number; description: string }>;
  naturalLanguageIntent: ParsedToolIntent | null;
  hasMatches: boolean;
  query: string;
}

// Common Indian Hindi/English Synonym Map
const SYNONYM_MAP: Record<string, string[]> = {
  salary: ['in hand', 'inhand', 'ctc', 'take home', 'epf', 'pf', 'gross', 'net salary', 'pay', 'monthly salary', 'increment', 'appraisal'],
  emi: ['loan', 'home loan', 'car loan', 'personal loan', 'interest', 'monthly installment', 'byaj', 'karz', 'mortgage', 'sbi emi', 'hdfc emi'],
  gst: ['tax', 'cgst', 'sgst', 'igst', 'vat', 'invoice', 'gst 18', 'gst 12', 'gst 5', 'reverse gst', 'tax slab'],
  sip: ['mutual fund', 'investment', 'wealth', 'nifty', 'compounding', 'crorepati', 'equity', 'lumpsum', 'returns'],
  age: ['dob', 'date of birth', 'janam din', 'umar', 'birthday', 'how old', 'years old'],
  unit: ['converter', 'gaj', 'bigha', 'katha', 'guntha', 'sq ft', 'square feet', 'acre', 'hectare', 'cent', 'ground', 'marla', 'kanal', 'land'],
  cgpa: ['cbse', 'percentage to cgpa', 'cgpa to percentage', 'grade', 'marks', '10th', '12th', 'college gpa'],
  fd: ['fixed deposit', 'bank fd', 'sbi fd', 'hdfc fd', 'term deposit', 'interest payout', 'senior citizen'],
  paint: ['wall paint', 'primer', 'room paint', 'asian paints', 'berger', 'coverage', 'liter', 'whitewash'],
  tile: ['flooring', 'bathroom tiles', 'kitchen tiles', 'vitrified', 'boxes', 'sq ft tiles'],
  fuel: ['petrol', 'diesel', 'mileage', 'bike mileage', 'car mileage', 'trip expense', 'cng', 'petrol price'],
  letter: ['resignation', 'leave application', 'sick leave', 'casual leave', 'wfh', 'notice period', 'email format', 'resignation letter'],
  date: ['date difference', 'days between', 'working days', 'tenure', 'age diff'],
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
 * Executes high-performance local multi-attribute smart search with synonym expansion,
 * keyword matching, fuzzy category matching, and natural language intent parsing.
 */
export function executeSmartSearch(rawQuery: string): SmartSearchResult {
  const query = rawQuery.trim();
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
  const tokens = clean.split(/\s+/).filter(t => t.length > 0);

  // 1. Natural Language Intent & Parameter Detection
  const naturalLanguageIntent = parseNaturalLanguageQuery(clean);

  // 2. Expand tokens with synonyms
  const searchTerms = new Set<string>(tokens);
  for (const token of tokens) {
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (token === key || synonyms.some(s => s.includes(token) || token.includes(s))) {
        searchTerms.add(key);
        synonyms.forEach(s => searchTerms.add(s));
      }
    }
  }

  // 3. Search tools registry
  const scoredTools: Array<{ tool: Tool; score: number }> = [];

  for (const tool of TOOLS_REGISTRY) {
    let score = 0;
    const nameLower = tool.name.toLowerCase();
    const shortNameLower = (tool.shortName || '').toLowerCase();
    const taglineLower = tool.tagline.toLowerCase();
    const descLower = tool.description.toLowerCase();
    const categoryLower = tool.category.toLowerCase();
    const keywords = tool.keywords.map(k => k.toLowerCase());

    // Direct exact or substring match in name (highest weight)
    if (nameLower === clean || shortNameLower === clean) {
      score += 100;
    } else if (nameLower.includes(clean) || shortNameLower.includes(clean)) {
      score += 60;
    }

    // Direct keyword exact matches
    if (keywords.includes(clean)) {
      score += 50;
    }

    // Token & synonym matches
    for (const term of searchTerms) {
      if (nameLower.includes(term) || shortNameLower.includes(term)) {
        score += 25;
      }
      if (keywords.some(k => k.includes(term) || term.includes(k))) {
        score += 20;
      }
      if (categoryLower === term) {
        score += 15;
      }
      if (taglineLower.includes(term)) {
        score += 10;
      }
      if (descLower.includes(term)) {
        score += 5;
      }
    }

    // Boost if matching natural language parsed target
    if (naturalLanguageIntent && (tool.slug === naturalLanguageIntent.toolSlug || tool.id === naturalLanguageIntent.toolSlug)) {
      score += 80;
    }

    // Popular / Trending slight boost
    if (tool.popular) score += 2;
    if (tool.trending) score += 2;

    if (score > 0) {
      scoredTools.push({ tool, score });
    }
  }

  // Sort descending by relevance score
  scoredTools.sort((a, b) => b.score - a.score);
  const matchedTools = scoredTools.map(st => st.tool).slice(0, 10);

  // 4. Category Matches
  const categoryMatches = CATEGORIES.filter(cat => {
    const catName = cat.name.toLowerCase();
    const catDesc = cat.description.toLowerCase();
    return clean.includes(cat.id) || catName.includes(clean) || catDesc.includes(clean) || Array.from(searchTerms).some(t => catName.includes(t));
  }).map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    toolCount: cat.toolCount,
    description: cat.description,
  })).slice(0, 3);

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
  const updated = [clean, ...current].slice(0, 8);
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
