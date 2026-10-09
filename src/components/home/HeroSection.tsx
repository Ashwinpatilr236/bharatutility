import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { DynamicIcon } from '../common/DynamicIcon';
import { executeSmartSearch, recordSearchTelemetry, getRecentSearches, saveRecentSearch, TRENDING_SEARCH_KEYWORDS } from '../../utils/smartSearch';
import { Search, Sparkles, ArrowRight, Zap, TrendingUp, Clock, X, MessageSquarePlus, Compass, ShieldCheck, MonitorPlay } from 'lucide-react';
import { LiveCivicTicker } from './LiveCivicTicker';
import { AntigravityParticles } from '../common/AntigravityParticles';
import { SpotlightCard } from '../common/SpotlightCard';
import { CommandPalette } from '../common/CommandPalette';
import { ScrollableCarousel } from '../common/ScrollableCarousel';
import { FloatingBadge } from '../common/FloatingBadge';
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
    <section className="relative pt-1 pb-3 sm:pt-2 sm:pb-5 overflow-hidden">
      {/* Background Interactive Antigravity Particles & Cosmic Glow */}
      <AntigravityParticles className="opacity-70 dark:opacity-80" particleCount={48} />

      {/* Background Floating Subtle Ambient Light */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none -z-10 rounded-full animate-antigravity-pulse" />

      {/* Live Civic Status Bar */}
      <div className="mb-2 sm:mb-3 relative z-10">
        <LiveCivicTicker />
      </div>

      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        {/* Antigravity Floating Top Badge */}
        <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
          <FloatingBadge duration={3.5} distance={5}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-accent/30 text-accent text-xs font-semibold shadow-xs hover:border-accent/60 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span>BharatUtility • 100% Private & Free Utility Super-Site</span>
            </div>
          </FloatingBadge>
        </div>

        {/* Kinetic Shimmer Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display text-neutral-900 dark:text-white leading-tight mb-1.5 sm:mb-2">
          Useful tools for{' '}
          <span className="bg-gradient-to-r from-accent via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-antigravity-shimmer">
            everyday India
          </span>
        </h1>

        {/* Subhead with Subtle Floating Levitation Badges */}
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto mb-2 sm:mb-4 leading-relaxed">
          Fast, privacy-focused calculators, official citizen lookups, document converters, and financial utilities — 100% free with zero signups.
        </p>

        {/* Floating Quick Feature Badges */}
        <div className="hidden sm:flex items-center justify-center gap-3 mb-5">
          <FloatingBadge delay={0.2} duration={4.2} distance={6}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 backdrop-blur-xs border border-neutral-200/60 dark:border-neutral-700/60">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Client-Side Privacy
            </span>
          </FloatingBadge>
          <FloatingBadge delay={0.6} duration={3.8} distance={7}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 backdrop-blur-xs border border-neutral-200/60 dark:border-neutral-700/60">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Zero Server Latency
            </span>
          </FloatingBadge>
          <FloatingBadge delay={1.0} duration={4.5} distance={5}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 backdrop-blur-xs border border-neutral-200/60 dark:border-neutral-700/60">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              220+ Native Indian Tools
            </span>
          </FloatingBadge>
        </div>

        {/* New OTT Tool Promo Banner */}
        <div 
          onClick={() => navigateToTool('ott-stream-finder')}
          className="max-w-2xl mx-auto mb-6 p-4 sm:p-5 rounded-2xl cursor-pointer bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-white/20 transition-colors"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl shrink-0 backdrop-blur-md">
                <MonitorPlay className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1 backdrop-blur-md border border-white/20">
                  <Sparkles className="w-3 h-3" /> New Tool
                </div>
                <h3 className="font-bold text-lg sm:text-xl leading-tight">Where to Watch? OTT Stream Finder</h3>
                <p className="text-white/80 text-sm mt-0.5 hidden sm:block">Find which platform is streaming your favorite movie in India!</p>
              </div>
            </div>
            <div className="shrink-0 flex justify-end">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white text-white group-hover:text-purple-600 transition-colors backdrop-blur-md">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
        {/* Large Clean Native Inline Search Box with Antigravity Glow */}
        <div className="relative max-w-2xl mx-auto mb-2.5 sm:mb-3.5 text-left">
          <div
            className={`flex items-center gap-3 px-4 py-3.5 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl border-2 transition-all shadow-xl shadow-neutral-900/5 dark:shadow-black/50 ${
              isFocused
                ? 'border-accent ring-4 ring-accent/20 shadow-accent/10'
                : 'border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-300 dark:hover:border-neutral-700'
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
              className="w-full min-w-0 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none pr-2"
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-accent/40 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[580px] sm:max-h-[640px] overflow-y-auto space-y-2">
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
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2 sm:mb-3.5">
          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mr-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            Trending:
          </span>
          {TRENDING_SEARCH_KEYWORDS.slice(0, 7).map(keyword => (
            <button
              key={keyword}
              onClick={() => handleTrendingClick(keyword)}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/70 hover:bg-accent-subtle hover:text-accent hover:border-accent/40 dark:bg-neutral-900/70 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800 backdrop-blur-xs transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* 8 Instant Quick-Access Bento Hero Cards with Spotlight & 3D Tilt */}
        <ScrollableCarousel className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-0.5 text-left">
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
              slug: 'dairy-milk-fat-snf-calculator',
              name: 'Dairy Milk Fat & SNF Payout',
              tagline: 'Cow & Buffalo milk rate chart per litre',
              icon: 'Sparkles',
              badge: 'Daily Agro',
              color: 'text-sky-500 bg-sky-500/10'
            },
            {
              slug: 'old-vehicle-resale-valuation-calculator',
              name: 'Used Vehicle Valuation',
              tagline: 'Year, odometer & brand depreciation guide',
              icon: 'Car',
              badge: 'Vehicle',
              color: 'text-rose-500 bg-rose-500/10'
            },
            {
              slug: 'jan-aushadhi-generic-saver',
              name: 'Jan Aushadhi Medicine Saver',
              tagline: 'Find generic salt substitutes & save 50-90%',
              icon: 'Sparkles',
              badge: 'Health Saver',
              color: 'text-teal-500 bg-teal-500/10'
            },
            {
              slug: 'exam-photo-date-stamp',
              name: 'Exam Photo & Signature Stamping',
              tagline: '100% private client-side name & date stamp generator',
              icon: 'FileText',
              badge: 'Exam Prep',
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
            <SpotlightCard
              key={tool.slug}
              onClick={() => navigateToTool(tool.slug)}
              className="p-3 sm:p-3.5 cursor-pointer group flex flex-col justify-between min-w-[68vw] sm:min-w-[220px] snap-start sm:snap-start"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className={`p-2 rounded-xl ${tool.color} group-hover:scale-110 transition-transform`}>
                    <DynamicIcon name={tool.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-accent/15 group-hover:text-accent transition-colors">
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
              <div className="mt-2.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-semibold text-accent">
                <span>Open Utility</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </SpotlightCard>
          ))}
        </ScrollableCarousel>
      </div>
    </section>
  );
};
