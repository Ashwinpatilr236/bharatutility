import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { DynamicIcon } from '../common/DynamicIcon';
import { executeSmartSearch, recordSearchTelemetry, getRecentSearches, saveRecentSearch } from '../../utils/smartSearch';
import { getActiveTools } from '../../data/toolsRegistry';
import { Search, Sparkles, ArrowRight, Zap, TrendingUp, Clock, X, MessageSquarePlus, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AntigravityParticles } from '../common/AntigravityParticles';
import { VoiceSearchButton } from '../common/VoiceSearchButton';

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

  // Record search telemetry debounced
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
    <section className="relative pt-6 pb-8 sm:pt-12 sm:pb-14 overflow-hidden">
      {/* Background Subtle Ambient Light & Particles */}
      <AntigravityParticles className="opacity-40 dark:opacity-60" particleCount={24} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[280px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Modern Minimal Top Pill */}
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200 text-xs font-semibold shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{getActiveTools().length}+ Digital Utilities • 100% Free &amp; Private • Zero Signups</span>
          </div>
        </div>

        {/* Clean, High-Impact Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display text-neutral-900 dark:text-white leading-[1.12] mb-3">
          Everyday Utilities for{' '}
          <span className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Modern India
          </span>
        </h1>

        {/* Focused Subtitle */}
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto mb-7 leading-relaxed">
          Fast, privacy-focused calculators, live bank & citizen lookups, and daily utilities — verified, ad-lite, and completely free.
        </p>

        {/* Spotlight Centerpiece Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-4 text-left">
          <div
            className={`flex items-center gap-3 px-4 py-3.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl border-2 transition-all shadow-xl shadow-neutral-900/5 dark:shadow-black/50 ${
              isFocused
                ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-indigo-500/10'
                : 'border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-500 shrink-0" />
            <input
              ref={inputRef}
              id="hero-tool-search-input"
              type="text"
              placeholder="Search 233+ tools (e.g. Bank IFSC, AMFI SIP NAV, FASTag, EMI, GST)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 250)}
              onKeyDown={handleKeyDown}
              className="w-full min-w-0 bg-transparent text-sm sm:text-base font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none pr-2"
            />
            {/* Voice Search Mic Button (Hindi/English) */}
            <VoiceSearchButton
              onTranscript={text => {
                setSearchQuery(text);
                setIsFocused(true);
              }}
            />

            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs transition-colors shrink-0 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-500/40 hover:text-indigo-500 transition-colors shrink-0 cursor-pointer"
              >
                <span>Spotlight</span>
                <kbd className="text-[10px]">Ctrl+K</kbd>
              </button>
            )}
          </div>

          {/* Elevated Real-time Dropdown */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-indigo-500/40 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[580px] sm:max-h-[640px] overflow-y-auto space-y-2">
              {/* Natural Language Intent suggestion card */}
              {naturalLanguageIntent && (
                <div
                  onMouseDown={() => handleToolSelect(naturalLanguageIntent.toolSlug, naturalLanguageIntent.params)}
                  className="p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 border border-indigo-500/40 hover:border-indigo-500 cursor-pointer transition-all flex items-center justify-between gap-3 group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Smart Intent Match
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                          Prefilled
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                        {naturalLanguageIntent.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
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
                    <span className="text-[10px] text-indigo-500 font-mono">Press Enter ↵ to launch</span>
                  </div>
                  {exactAndKeywordMatches.slice(0, 12).map(tool => (
                    <div
                      key={tool.id}
                      onMouseDown={() => handleToolSelect(tool.slug)}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate block mt-0.5">
                            {tool.tagline}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-neutral-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 ml-2">
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
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-xs"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                      <span>Request this Tool</span>
                    </button>
                    <button
                      onMouseDown={navigateToAllTools}
                      className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Browse All Tools</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div className="p-2 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-1 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-indigo-500" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map(term => (
                      <button
                        key={term}
                        onMouseDown={() => handleRecentClick(term)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-indigo-500 hover:text-indigo-500 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer transition-all hover:scale-102"
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

        {/* Clean Trending Quick-Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs">
          <span className="font-bold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            Trending:
          </span>
          {['Bank IFSC', 'FASTag Toll', 'SIP & Mutual Funds', 'Income Tax & HRA', 'ParkSignal QR', 'Home Loan EMI'].map(keyword => (
            <button
              key={keyword}
              onClick={() => handleTrendingClick(keyword)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs cursor-pointer"
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* Clean Quick Launch Category Pills (No Clutter, 100% Sleek) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 text-left">
          {[
            { name: 'Bank IFSC', desc: '1.5L+ Branches', slug: 'ifsc-code-finder', icon: 'Building', color: 'text-emerald-500' },
            { name: 'Mutual Fund SIP', desc: '45,000+ Schemes', slug: 'sip-calculator', icon: 'TrendingUp', color: 'text-indigo-500' },
            { name: 'Home Loan EMI', desc: 'Monthly Schedule', slug: 'emi-calculator', icon: 'Calculator', color: 'text-blue-500' },
            { name: 'GST & Tax', desc: '5% to 28% Slab', slug: 'gst-calculator', icon: 'Receipt', color: 'text-rose-500' },
            { name: 'PIN Code Finder', desc: '1.5L+ Post Offices', slug: 'pin-code-finder', icon: 'MapPin', color: 'text-teal-500' },
            { name: 'ParkSignal QR', desc: 'Vehicle Privacy QR', slug: 'parksignal', icon: 'Car', color: 'text-cyan-500' },
          ].map(item => (
            <button
              key={item.slug}
              onClick={() => navigateToTool(item.slug)}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-white/5 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-neutral-800/80 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 ${item.color} group-hover:scale-110 transition-transform shrink-0`}>
                  <DynamicIcon name={item.icon} className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate group-hover:text-indigo-500 transition-colors">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {item.desc}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
