import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { CATEGORIES } from '../../data/categories';
import { getToolsByCategory } from '../../data/toolsRegistry';
import { CategoryId } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Star, Search, Layers, ArrowRight } from 'lucide-react';
import { RequestToolCta } from '../common/RequestToolCta';
import { AntigravityParticles } from '../common/AntigravityParticles';
import { FloatingBadge } from '../common/FloatingBadge';
import { ToolCard } from '../common/ToolCard';

interface CategoryViewProps {
  categoryId: CategoryId;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categoryId }) => {
  useAdminStore();
  const { isFavorite, toggleFavorite, navigateToHome, navigateToAllTools, navigateToCategory } = useApp();

  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const allCategoryTools = useMemo(() => getToolsByCategory(categoryId), [categoryId]);

  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(24);

  // Filter tools by local query
  const filteredTools = useMemo(() => {
    if (!query.trim()) return allCategoryTools;
    const q = query.toLowerCase();
    return allCategoryTools.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.tagline.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [allCategoryTools, query]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  // Reset pagination when category or query changes
  React.useEffect(() => {
    setVisibleCount(24);
    setQuery('');
  }, [categoryId]);

  const currentTools = filteredTools.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTools.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-8 space-y-4 sm:space-y-8 animate-in fade-in duration-200 relative">
      {/* Background Subtle Antigravity Ambient Light & Particles */}
      <AntigravityParticles className="opacity-35 dark:opacity-50" particleCount={25} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[250px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full animate-antigravity-pulse" />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'All Tools', href: '/tools', onClick: navigateToAllTools },
          { label: category.name, active: true }
        ]}
      />

      {/* Category Header Hero */}
      <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-xl shadow-neutral-900/5 dark:shadow-black/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-accent/15 via-purple-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-600/20 text-accent flex items-center justify-center shrink-0 border border-neutral-200/90 dark:border-neutral-700/60 shadow-xs">
              <DynamicIcon name={category.icon} className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
                  {category.name}
                </h1>
                <FloatingBadge duration={3} distance={3}>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {allCategoryTools.length} Utilities
                  </span>
                </FloatingBadge>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            </div>
          </div>

          <button
            onClick={navigateToAllTools}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <span>Explore All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Sibling Category Switch Bar */}
        <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar relative z-10 text-xs">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">Switch:</span>
          {CATEGORIES.map(cat => {
            const isCurrent = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                onClick={() => navigateToCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/80'
                }`}
              >
                <DynamicIcon name={cat.icon} className="w-3 h-3" />
                <span>{cat.shortName || cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Section with In-Category Instant Filter */}
      <div className="space-y-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span>Available {category.name} Calculators & Tools</span>
            <span className="text-xs font-normal text-neutral-400">({filteredTools.length})</span>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${category.name}...`}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-accent"
            />
          </div>
        </div>

        {currentTools.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              No tools matching "{query}" in {category.name}
            </p>
            <button
              onClick={() => setQuery('')}
              className="text-xs font-bold text-accent hover:underline cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {currentTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
        
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
      </div>

      {/* Category In-Depth Guide & SEO Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-display">
          Why Use BharatUtility for {category.name}?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {category.description} All calculators and digital utilities on BharatUtility are tailored for Indian currency notation (₹ Lakhs and Crores), state regulations, tax structures, and standard daily life measurements. Best of all, 100% of calculations run privately in your browser with zero data sharing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 space-y-1">
            <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 font-display">
              ⚡ Instant & Accurate
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Formulas built following standard banking, regulatory, and Indian educational benchmarks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 space-y-1">
            <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 font-display">
              🔒 100% Client-Side Privacy
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Your inputs, financial numbers, and document files never leave your device.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 space-y-1">
            <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 font-display">
              📱 Mobile & Offline Ready
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Progressive Web App support enables offline access on mobile and desktop anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Category Explorer Bar */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Explore Other Popular Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter(c => c.id !== categoryId).map(otherCat => (
            <Link
              key={otherCat.id}
              to={`/category/${otherCat.id}`}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-accent text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-accent transition-colors flex items-center gap-2 shadow-2xs"
            >
              <DynamicIcon name={otherCat.icon} className="w-3.5 h-3.5 text-accent" />
              <span>{otherCat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Community Request CTA */}
      <RequestToolCta initialToolName={`New ${category.name} Tool`} className="mt-4 sm:mt-8" />
    </div>
  );
};
