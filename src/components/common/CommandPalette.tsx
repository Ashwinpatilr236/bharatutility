import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from './DynamicIcon';
import { executeSmartSearch, recordSearchTelemetry, getRecentSearches, saveRecentSearch, removeRecentSearch, clearRecentSearches, TRENDING_SEARCH_KEYWORDS } from '../../utils/smartSearch';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles, Zap, Clock, MessageSquarePlus, Compass, Trash2 } from 'lucide-react';
import { Tool } from '../../types';
import { getPopularTools } from '../../data/toolsRegistry';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    navigateToTool,
    navigateToCategory,
    navigateToAllTools,
    navigateToRequestTool
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const searchResults = useMemo(() => executeSmartSearch(query), [query]);
  const { exactAndKeywordMatches, categoryMatches, naturalLanguageIntent, hasMatches } = searchResults;

  // Record telemetry safely outside render
  useEffect(() => {
    if (isCommandPaletteOpen && query.trim().length >= 2) {
      const timer = setTimeout(() => {
        recordSearchTelemetry(query, hasMatches, exactAndKeywordMatches[0]?.slug);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isCommandPaletteOpen, query, hasMatches, exactAndKeywordMatches]);

  if (!isCommandPaletteOpen) return null;

  const handleSelectTool = (toolSlug: string, params?: Record<string, any>) => {
    if (query.trim()) {
      saveRecentSearch(query.trim());
    }
    navigateToTool(toolSlug, params);
    setCommandPaletteOpen(false);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const handleRemoveRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeRecentSearch(term);
    setRecentSearches(updated);
  };

  const handleClearRecents = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleRequestTool = () => {
    if (query) {
      try {
        sessionStorage.setItem('bu_requested_tool_prefill', query);
      } catch {}
    }
    setCommandPaletteOpen(false);
    navigateToRequestTool();
  };

  const popularFallbacks = getPopularTools(4);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, exactAndKeywordMatches.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + exactAndKeywordMatches.length) % Math.max(1, exactAndKeywordMatches.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (naturalLanguageIntent && selectedIndex === 0) {
        handleSelectTool(naturalLanguageIntent.toolSlug, naturalLanguageIntent.params);
      } else if (exactAndKeywordMatches[selectedIndex]) {
        handleSelectTool(exactAndKeywordMatches[selectedIndex].slug);
      }
    }
  };

  return (
    <div
      onClick={() => setCommandPaletteOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools, calculate EMI, 75000 salary ka in hand, GST, SIP..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Quick Suggestion Trending Pills when empty */}
        {!query && (
          <div className="px-5 py-2.5 bg-neutral-50/80 dark:bg-neutral-900/60 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-accent" />
              Trending:
            </span>
            {TRENDING_SEARCH_KEYWORDS.slice(0, 5).map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-accent hover:text-accent transition-colors shrink-0 text-xs font-medium"
              >
                {term}
              </button>
            ))}
          </div>
        )}

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          {/* Natural Language Intent suggestion card */}
          {naturalLanguageIntent && (
            <div
              onClick={() => handleSelectTool(naturalLanguageIntent.toolSlug, naturalLanguageIntent.params)}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-accent/15 via-purple-500/10 to-indigo-500/10 border border-accent/40 hover:border-accent cursor-pointer transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent text-white shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                      Smart Suggestion
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
              <div className="flex items-center gap-2 text-xs font-bold text-accent shrink-0">
                <span className="hidden sm:inline">Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          )}

          {/* Category Matches */}
          {categoryMatches.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Categories
              </div>
              {categoryMatches.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => {
                    navigateToCategory(cat.id as any);
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-accent-subtle text-accent">
                      <DynamicIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {cat.toolCount} tools →
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tools List */}
          {exactAndKeywordMatches.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                <span>{query ? 'Matching Utilities' : 'Popular Indian Utilities'}</span>
                <span className="text-[10px] text-neutral-400 font-normal">
                  {exactAndKeywordMatches.length} tools
                </span>
              </div>

              {exactAndKeywordMatches.map((tool, idx) => (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.slug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl cursor-pointer transition-all ${
                    selectedIndex === idx
                      ? 'bg-accent text-white shadow-xs'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl ${
                        selectedIndex === idx
                          ? 'bg-white/20 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-accent'
                      }`}
                    >
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate">
                          {tool.name}
                        </span>
                        {tool.trending && (
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                              selectedIndex === idx
                                ? 'bg-white text-neutral-900'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            Trending
                          </span>
                        )}
                        {tool.popular && (
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                              selectedIndex === idx
                                ? 'bg-white text-neutral-900'
                                : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            Popular
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate ${
                          selectedIndex === idx ? 'text-white/80' : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {tool.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span
                      className={`text-[11px] capitalize hidden sm:inline ${
                        selectedIndex === idx ? 'text-white/70' : 'text-neutral-400'
                      }`}
                    >
                      {tool.category}
                    </span>
                    <CornerDownLeft
                      className={`w-4 h-4 ${
                        selectedIndex === idx ? 'text-white' : 'text-neutral-400'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zero-Result Search State */}
          {query.trim().length >= 2 && !hasMatches && (
            <div className="py-8 px-4 text-center space-y-4 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-white font-display">
                  We don't have that tool yet.
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1">
                  Tell us what you need and our team will build it for you for free.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={handleRequestTool}
                  className="px-4 py-2.5 rounded-xl bg-accent text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 shadow-xs"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Request This Tool</span>
                </button>
                <button
                  onClick={() => {
                    navigateToAllTools();
                    setCommandPaletteOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold text-xs inline-flex items-center gap-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Browse All Tools</span>
                </button>
              </div>

              {/* Popular recommendations fallback */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-left">
                <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1 mb-2">
                  Popular Tools You May Like
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularFallbacks.map(tool => (
                    <div
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.slug)}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer border border-neutral-100 dark:border-neutral-700/60 transition-colors"
                    >
                      <div className="p-1.5 rounded-lg bg-accent-subtle text-accent">
                        <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {tool.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search History / Recent searches when input is empty */}
          {!query && recentSearches.length > 0 && (
            <div className="pt-2 px-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-1 mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </span>
                <button
                  onClick={handleClearRecents}
                  className="text-neutral-400 hover:text-rose-500 font-normal lowercase transition-colors"
                >
                  clear history
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map(term => (
                  <div
                    key={term}
                    onClick={() => handleRecentClick(term)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-accent-subtle hover:text-accent text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors"
                  >
                    <span>{term}</span>
                    <button
                      onClick={e => handleRemoveRecent(term, e)}
                      aria-label="Remove search term"
                      className="text-neutral-400 hover:text-rose-500 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-5 py-3 bg-neutral-50 dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">↑</kbd>{' '}
              <kbd className="font-mono bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="font-mono bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">↵</kbd>{' '}
              Select
            </span>
          </div>
          <button
            onClick={() => {
              navigateToAllTools();
              setCommandPaletteOpen(false);
            }}
            className="text-accent hover:underline font-semibold"
          >
            Browse All 24+ Utilities →
          </button>
        </div>
      </div>
    </div>
  );
};
