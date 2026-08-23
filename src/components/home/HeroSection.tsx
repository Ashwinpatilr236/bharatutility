import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { executeSmartSearch, recordSearchTelemetry, getRecentSearches, saveRecentSearch, removeRecentSearch, TRENDING_SEARCH_KEYWORDS } from '../../utils/smartSearch';
import { Search, Sparkles, ArrowRight, Zap, TrendingUp, Clock, X, MessageSquarePlus, Compass } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { navigateToTool, navigateToAllTools, navigateToRequestTool, setCommandPaletteOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
  };

  const handleRequestTool = () => {
    if (searchQuery) {
      try {
        sessionStorage.setItem('bu_requested_tool_prefill', searchQuery);
      } catch {}
    }
    navigateToRequestTool();
  };

  return (
    <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-18 overflow-hidden">
      {/* Background Floating Math & Currency Glyphs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none opacity-30 dark:opacity-20">
        <span className="absolute top-10 left-[8%] text-4xl sm:text-6xl font-display font-black text-indigo-500/30 animate-pulse">
          ₹
        </span>
        <span className="absolute top-20 right-[12%] text-3xl sm:text-5xl font-mono font-bold text-emerald-500/25">
          %
        </span>
        <span className="absolute bottom-12 left-[15%] text-4xl sm:text-5xl font-mono text-amber-500/25">
          =
        </span>
        <span className="absolute bottom-16 right-[18%] text-3xl sm:text-5xl font-mono text-rose-500/25">
          ×
        </span>
        <span className="absolute top-1/2 left-[3%] text-2xl font-bold text-neutral-400/20">
          ㎡
        </span>
        <span className="absolute top-1/3 right-[5%] text-2xl font-bold text-neutral-400/20">
          yr
        </span>

        {/* Ambient Subtle Radial Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Top Mini Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-xs font-semibold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>India's Utility Super-Site • Free & No Sign-up</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display text-neutral-900 dark:text-white leading-[1.15] mb-2">
          BharatUtility
        </h1>
        <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-4">
          India's Utility Super-Site
        </p>

        {/* Subhead */}
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Free, fast and modern online calculators and utility tools for everyday India.
        </p>

        {/* Large Smart Search Box */}
        <div className="relative max-w-2xl mx-auto mb-6 text-left">
          <div
            className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 bg-white dark:bg-neutral-900 rounded-2xl border-2 transition-all shadow-xl shadow-neutral-900/5 dark:shadow-black/40 ${
              isFocused
                ? 'border-accent ring-4 ring-accent/15'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <Search className="w-5 h-5 text-neutral-400 shrink-0" />
            <input
              id="hero-tool-search-input"
              type="text"
              placeholder="Search e.g. EMI, 75000 salary ka in hand, GST, SIP wealth, bike mileage..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              className="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 px-1.5 py-0.5"
              >
                Clear
              </button>
            ) : (
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
              >
                Ctrl+K
              </button>
            )}
          </div>

          {/* Real-time Inline Dropdown Matching */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2.5 bg-white/98 dark:bg-neutral-900/98 backdrop-blur-2xl rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] border-2 border-accent/40 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[460px] overflow-y-auto space-y-2">
              {/* Natural Language Intent suggestion card */}
              {naturalLanguageIntent && (
                <div
                  onMouseDown={() => handleToolSelect(naturalLanguageIntent.toolSlug, naturalLanguageIntent.params)}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-accent/15 via-purple-500/15 to-indigo-500/15 border border-accent/40 hover:border-accent cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                          Smart Intent Suggestion
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-accent/20 text-accent font-bold">
                          Prefilled
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
                        {naturalLanguageIntent.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent shrink-0">
                    <span className="hidden sm:inline">Launch Tool</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )}

              {/* Matched Tools List */}
              {exactAndKeywordMatches.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-3 py-1 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-1.5 mb-1">
                    <span>Matching Utilities ({exactAndKeywordMatches.length})</span>
                    <span className="text-[10px] text-accent font-mono font-medium">1-Click Launch</span>
                  </div>
                  {exactAndKeywordMatches.slice(0, 6).map(tool => (
                    <div
                      key={tool.id}
                      onMouseDown={() => handleToolSelect(tool.slug)}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-800/60 hover:bg-accent-subtle hover:border-accent/30 border border-neutral-200/60 dark:border-neutral-700/60 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-800 text-accent shadow-xs border border-neutral-200/50 dark:border-neutral-700 shrink-0 group-hover:scale-105 transition-transform">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-accent transition-colors">
                              {tool.name}
                            </span>
                            {tool.badge === 'New' && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                                New
                              </span>
                            )}
                            {tool.trending && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/20">
                                Trending
                              </span>
                            )}
                            {tool.popular && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                                Popular
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate block mt-0.5">
                            {tool.tagline}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400 group-hover:text-accent shrink-0 ml-2">
                        <span className="text-[10px] font-mono font-medium hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Zero-Result Search Experience */}
              {searchQuery.trim().length >= 2 && !hasMatches && (
                <div className="p-5 text-center space-y-3 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
                  <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    No matching utility found for "{searchQuery}"
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    Try another keyword like EMI, GST, SIP, PIN code, or request a custom tool.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onMouseDown={handleRequestTool}
                      className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 shadow-xs"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Request a Tool</span>
                    </button>
                    <button
                      onMouseDown={navigateToAllTools}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Browse All 35+ Tools</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Search History / Recent searches when input is empty */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="p-2 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        onMouseDown={() => handleRecentClick(term)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-accent hover:text-accent text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer transition-all hover:scale-102"
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
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mr-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-rose-500" />
            Trending:
          </span>
          {TRENDING_SEARCH_KEYWORDS.slice(0, 6).map(keyword => (
            <button
              key={keyword}
              onClick={() => {
                setSearchQuery(keyword);
                setIsFocused(true);
              }}
              className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800 transition-all hover:scale-105 active:scale-95"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
