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

        {/* Large Smart Search Box - Triggers Spotlight Command Palette */}
        <div className="relative max-w-2xl mx-auto mb-6 text-left">
          <div
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-neutral-900 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 hover:border-accent dark:hover:border-accent transition-all shadow-xl shadow-neutral-900/5 dark:shadow-black/40 cursor-pointer group"
          >
            <Search className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-colors shrink-0" />
            <div className="w-full text-sm sm:text-base text-neutral-400 dark:text-neutral-400 font-sans select-none flex items-center justify-between">
              <span>Search e.g. EMI, 75000 salary ka in hand, GST, SIP, PIN code...</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCommandPaletteOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 shrink-0 group-hover:border-accent/40 group-hover:text-accent transition-colors"
            >
              <kbd className="text-[10px]">Ctrl+K</kbd>
            </button>
          </div>

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
