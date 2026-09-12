import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { getActiveTools } from '../../data/toolsRegistry';
import { CATEGORIES } from '../../data/categories';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Search, Star } from 'lucide-react';
import { RequestToolCta } from '../common/RequestToolCta';

export const AllToolsView: React.FC = () => {
  useAdminStore();
  const { isFavorite, toggleFavorite } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'trending'>('popular');

  const filteredTools = useMemo(() => {
    const activeTools = getActiveTools();
    return activeTools.filter(tool => {
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
  }, [searchQuery, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
          All-in-One Utility Suite
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight">
          Browse All Free Everyday Indian Calculators
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
          From Loan EMIs, SIPs, and GST to Land Measurement, Wall Paint, and Resignation Letters - 100% free, fast, and secure.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, keyword (e.g. loan, tax, gaj, salary)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white outline-none focus:border-accent"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs text-neutral-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 outline-none focus:border-accent"
            >
              <option value="popular">Most Popular</option>
              <option value="trending">Most Used Views</option>
              <option value="name">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All Tools ({getActiveTools().length})
          </button>
          {CATEGORIES.map(cat => {
            const count = getActiveTools().filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map(tool => {
            const fav = isFavorite(tool.slug);
            const cat = CATEGORIES.find(c => c.id === tool.category);

            return (
              <Link
                key={tool.id}
                to={`/tools/${tool.slug}`}
                className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer relative"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-accent flex items-center justify-center group-hover:scale-105 transition-transform border border-neutral-200/60 dark:border-neutral-700/60">
                      <DynamicIcon name={tool.icon} className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      {tool.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                          {tool.badge}
                        </span>
                      )}
                      <button
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(tool.slug);
                        }}
                        className="p-1.5 text-neutral-400 hover:text-amber-400 transition-colors"
                        title={fav ? 'Favorited' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-accent transition-colors line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {tool.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-medium text-neutral-500 dark:text-neutral-400">{cat?.name}</span>
                  <span className="font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                    Open Tool →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
          <p className="text-sm text-neutral-500">No tools found matching "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Community Request CTA */}
      <RequestToolCta initialToolName={searchQuery} className="mt-8" />
    </div>
  );
};
