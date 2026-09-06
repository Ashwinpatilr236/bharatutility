import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { CATEGORIES } from '../../data/categories';
import { getToolsByCategory } from '../../data/toolsRegistry';
import { CategoryId } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Star } from 'lucide-react';
import { RequestToolCta } from '../common/RequestToolCta';

interface CategoryViewProps {
  categoryId: CategoryId;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categoryId }) => {
  useAdminStore();
  const { isFavorite, toggleFavorite, navigateToHome, navigateToAllTools } = useApp();

  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const tools = getToolsByCategory(categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/categories', onClick: navigateToAllTools },
          { label: category.name, active: true }
        ]}
      />

      {/* Category Header Hero */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/80 dark:border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-accent flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-700">
            <DynamicIcon name={category.icon} className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
                {category.name}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                {tools.length} Tools
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
          Available Calculators & Utilities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map(tool => {
            const fav = isFavorite(tool.slug);

            return (
              <Link
                key={tool.id}
                to={`/tool/${tool.slug}`}
                className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer"
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
                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-accent transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {tool.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">{tool.keywords.slice(0, 2).join(', ')}</span>
                  <span className="font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                    Calculate Now →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Category In-Depth Guide & SEO Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
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
      <RequestToolCta initialToolName={`New ${category.name} Tool`} className="mt-8" />
    </div>
  );
};
