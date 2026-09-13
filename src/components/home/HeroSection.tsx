import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { DynamicIcon } from '../common/DynamicIcon';
import { executeSmartSearch, recordSearchTelemetry, getRecentSearches, saveRecentSearch, TRENDING_SEARCH_KEYWORDS } from '../../utils/smartSearch';
import { Search, Sparkles, ArrowRight, Zap, TrendingUp, Clock, X, MessageSquarePlus, Compass } from 'lucide-react';
import { LiveCivicTicker } from './LiveCivicTicker';

export const HeroSection: React.FC = () => {
  useAdminStore();
  const { navigateToTool, navigateToAllTools, navigateToRequestTool, setCommandPaletteOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [isFocused]);

  const searchResults = useMemo(() => executeSmartSearch(searchQuery), [searchQuery]);
  const { exactAndKeywordMatches, naturalLanguageIntent, hasMatches } = searchResults;

  // Record search telemetry debounced outside of render
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        recordSearchTelemetry(searchQuery, hasMatches, exactAndKeywordMatches[0]?.slug);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, hasMatches, exactAndKeywordMatches]);

  const handleToolSelect = (slug: string, params?: Record<string, any>, queryToSave?: string) => {
    if (queryToSave || searchQuery) {
      saveRecentSearch(queryToSave || searchQuery);
    }
    navigateToTool(slug, params);
    setIsFocused(false);
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
    setIsFocused(true);
  };

  const handleTrendingClick = (keyword: string) => {
    setSearchQuery(keyword);
    setIsFocused(true);
    inputRef.current?.focus();
  };

  const handleRequestTool = () => {
    if (searchQuery) {
      try {
        sessionStorage.setItem('bu_requested_tool_prefill', searchQuery);
      } catch {}
    }
    navigateToRequestTool();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (naturalLanguageIntent) {
        handleToolSelect(naturalLanguageIntent.toolSlug, naturalLanguageIntent.params);
      } else if (exactAndKeywordMatches.length > 0) {
        handleToolSelect(exactAndKeywordMatches[0].slug);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <section className="relative pt-1 pb-4 sm:pt-2 sm:pb-6 overflow-hidden">
      {/* Background Floating Subtle Ambient Light */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[600px] h-[260px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      {/* Live Civic Status Bar */}
      <div className="mb-4 sm:mb-5">
        <LiveCivicTicker />
      </div>

      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Top Mini Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-semibold mb-3 shadow-2xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>BharatUtility • India's Practical Utility Super-Site</span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-neutral-900 dark:text-white leading-tight mb-2.5">
          Useful tools for everyday India
        </h1>

        {/* Subhead */}
        <p className="text-xs sm:text-sm lg:text-base text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-4 sm:mb-5 leading-relaxed">
          Fast, privacy-focused calculators, official citizen lookups, document converters, and financial utilities — 100% free with zero signups.
        </p>

        {/* Large Clean Native Inline Search Box */}
        <div className="relative max-w-2xl mx-auto mb-3.5 text-left">
          <div
            className={`flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 rounded-2xl border-2 transition-all shadow-lg shadow-neutral-900/5 dark:shadow-black/40 ${
              isFocused
                ? 'border-accent ring-4 ring-accent/15'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <Search className="w-4 h-4 text-accent shrink-0" />
            <input
              ref={inputRef}
              id="hero-tool-search-input"
              type="text"
              placeholder="Search 220+ tools (e.g. PIN, IFSC, EMI, GST, Salary)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none pr-2"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition-colors shrink-0"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-accent/40 hover:text-accent transition-colors shrink-0"
              >
                <span>Spotlight</span>
                <kbd className="text-[10px]">Ctrl+K</kbd>
              </button>
            )}
          </div>

          {/* Clean Elevated Real-time Dropdown */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border-2 border-accent/40 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[580px] sm:max-h-[640px] overflow-y-auto space-y-2">
              {/* Natural Language Intent suggestion card */}
              {naturalLanguageIntent && (
                <div
                  onMouseDown={() => handleToolSelect(naturalLanguageIntent.toolSlug, naturalLanguageIntent.params)}
                  className="p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-accent/15 via-purple-500/15 to-indigo-500/15 border border-accent/40 hover:border-accent cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-accent text-white shrink-0 group-hover:scale-105 transition-transform">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                          Smart Intent Match
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-accent/20 text-accent font-bold">
                          Prefilled
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                        {naturalLanguageIntent.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-accent shrink-0">
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}

              {/* Matched Tools */}
              {exactAndKeywordMatches.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 py-1 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1 mb-1">
                    <span>Matching Utilities ({exactAndKeywordMatches.length})</span>
                    <span className="text-[10px] text-accent font-mono">Press Enter ↵ to launch</span>
                  </div>
                  {exactAndKeywordMatches.slice(0, 12).map(tool => (
                    <div
                      key={tool.id}
                      onMouseDown={() => handleToolSelect(tool.slug)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-accent-subtle text-accent shrink-0 group-hover:scale-105 transition-transform">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-accent transition-colors">
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/10 text-accent font-bold border border-accent/20">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate block mt-0.5">
                            {tool.tagline}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-accent shrink-0 ml-2">
                        <span className="hidden sm:inline text-[11px]">Open</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Zero-Result Search Experience */}
              {searchQuery.trim().length >= 2 && !hasMatches && (
                <div className="p-4 text-center space-y-3 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    No matching utility found for "{searchQuery}"
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    Try searching EMI, GST, SIP, PIN code, or submit a request for a custom utility.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onMouseDown={handleRequestTool}
                      className="px-3.5 py-2 rounded-xl bg-accent text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 shadow-xs"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Request this Tool</span>
                    </button>
                    <button
                      onMouseDown={navigateToAllTools}
                      className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Browse All 220 Tools</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="p-2 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        onMouseDown={() => handleRecentClick(term)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-accent hover:text-accent text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer transition-all hover:scale-102"
                      >
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Search Shortcut Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 sm:mb-5">
          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mr-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            Trending:
          </span>
          {TRENDING_SEARCH_KEYWORDS.slice(0, 7).map(keyword => (
            <button
              key={keyword}
              onClick={() => handleTrendingClick(keyword)}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 hover:bg-accent-subtle hover:text-accent hover:border-accent/40 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* 8 Instant Quick-Access Bento Hero Cards (Spacious 4x2 Grid on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1 text-left">
          {[
            {
              slug: 'emi-calculator',
              name: 'Home Loan EMI Calculator',
              tagline: 'Principal, interest & monthly amortization schedule',
              icon: 'Calculator',
              badge: 'Finance',
              color: 'text-indigo-500 bg-indigo-500/10'
            },
            {
              slug: 'gst-calculator',
              name: 'GST Rate Calculator',
              tagline: '5%, 12%, 18%, 28% inclusive & exclusive tax',
              icon: 'Receipt',
              badge: 'Tax & Bill',
              color: 'text-emerald-500 bg-emerald-500/10'
            },
            {
              slug: 'pin-code-finder',
              name: 'PIN Code & Post Office',
              tagline: 'Search 1.5L+ Indian Post Offices & delivery status',
              icon: 'MapPin',
              badge: 'India Hub',
              color: 'text-amber-500 bg-amber-500/10'
            },
            {
              slug: 'dairy-milk-fat-snf-rate-calculator',
              name: 'Dairy Milk Fat & SNF Payout',
              tagline: 'Cow & Buffalo milk rate chart per litre',
              icon: 'Sparkles',
              badge: 'Daily Agro',
              color: 'text-sky-500 bg-sky-500/10'
            },
            {
              slug: 'used-car-bike-resale-valuation-calculator',
              name: 'Used Vehicle Valuation',
              tagline: 'Year, odometer & brand depreciation guide',
              icon: 'Car',
              badge: 'Vehicle',
              color: 'text-rose-500 bg-rose-500/10'
            },
            {
              slug: 'generic-medicine-jan-aushadhi-saver',
              name: 'Jan Aushadhi Medicine Saver',
              tagline: 'Find generic salt substitutes & save 50-90%',
              icon: 'Sparkles',
              badge: 'Health Saver',
              color: 'text-teal-500 bg-teal-500/10'
            },
            {
              slug: 'pdf-merge-split-compress-tool',
              name: 'PDF & Document Suite',
              tagline: '100% private client-side merge, split & compress',
              icon: 'FileText',
              badge: 'Documents',
              color: 'text-purple-500 bg-purple-500/10'
            },
            {
              slug: 'age-calculator',
              name: 'Sarkari Exam Age Calculator',
              tagline: 'Exact DOB, cutoff dates & eligibility analyzer',
              icon: 'Calendar',
              badge: 'Education',
              color: 'text-blue-500 bg-blue-500/10'
            }
          ].map(tool => (
            <button
              key={tool.slug}
              onClick={() => navigateToTool(tool.slug)}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 hover:border-accent dark:hover:border-accent hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`p-2 rounded-xl ${tool.color} group-hover:scale-105 transition-transform`}>
                    <DynamicIcon name={tool.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-accent transition-colors leading-snug">
                  {tool.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-accent">
                <span>Open Calculator</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
