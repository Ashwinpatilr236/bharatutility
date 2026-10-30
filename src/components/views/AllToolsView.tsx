import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { getActiveTools } from '../../data/toolsRegistry';
import { CATEGORIES } from '../../data/categories';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Search, Star, X, Sparkles, Filter } from 'lucide-react';
import { RequestToolCta } from '../common/RequestToolCta';
import { AntigravityParticles } from '../common/AntigravityParticles';
import { FloatingBadge } from '../common/FloatingBadge';
import { ToolCard } from '../common/ToolCard';

export const AllToolsView: React.FC = () => {
  useAdminStore();
  const { isFavorite, toggleFavorite } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'trending'>('popular');

  const allActiveTools = useMemo(() => getActiveTools(), []);

  const filteredTools = useMemo(() => {
    return allActiveTools.filter(tool => {
      // Category filter
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesTagline = tool.tagline.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesKeywords = tool.keywords.some(k => k.toLowerCase().includes(q));
        if (!matchesName && !matchesTagline && !matchesDesc && !matchesKeywords) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'trending') {
        return (b.views || 0) - (a.views || 0);
      }
      // Popular default
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    });
  }, [allActiveTools, searchQuery, selectedCategory, sortBy]);

  const [visibleCount, setVisibleCount] = useState(24);
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  // Reset pagination when filters change
  React.useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedCategory, sortBy]);

  const currentTools = filteredTools.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTools.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-4 sm:space-y-8 animate-in fade-in duration-200 relative">
      {/* Background Subtle Antigravity Ambient Light & Particles */}
      <AntigravityParticles className="opacity-35 dark:opacity-50" particleCount={25} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[280px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full animate-antigravity-pulse" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3 relative z-10">
        <FloatingBadge duration={3.5} distance={4}>
          <span className="text-xs font-bold uppercase tracking-widest text-accent bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-accent/30 shadow-2xs">
            All-in-One Utility Suite • {allActiveTools.length}+ Tools
          </span>
        </FloatingBadge>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight">
          Browse All Free Everyday{' '}
          <span className="bg-gradient-to-r from-accent via-purple-500 to-indigo-500 bg-clip-text text-transparent animate-antigravity-shimmer">
            Indian Calculators
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          From Loan EMIs, AMFI SIPs, and GST to Land Measurement, Wall Paint, and Resignation Letters — 100% free, fast, and private.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-neutral-200/90 dark:border-neutral-800/90 shadow-lg shadow-neutral-900/5 dark:shadow-black/40 space-y-3 sm:space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-accent absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, keyword (e.g. IFSC, SIP, loan, tax, salary)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-neutral-50/90 dark:bg-neutral-800/90 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 p-0.5 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-neutral-500 font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3 text-accent" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-neutral-50/90 dark:bg-neutral-800/90 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 outline-none focus:border-accent cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="trending">Most Used Views</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-accent text-white shadow-xs'
                : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/80'
            }`}
          >
            All Categories ({allActiveTools.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/80'
              }`}
            >
              <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {currentTools.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
            {currentTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center pt-6 pb-2">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                Load More Tools ({filteredTools.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
          <p className="text-sm font-semibold text-neutral-500">No tools found matching "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Community Request CTA */}
      <RequestToolCta initialToolName={searchQuery} className="mt-4 sm:mt-8" />
    </div>
  );
};
