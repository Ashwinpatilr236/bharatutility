import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../data/categories';
import { getToolsByCategory } from '../../data/toolsRegistry';
import { CategoryId } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DynamicIcon } from '../common/DynamicIcon';
import { Star, ArrowRight, Sparkles } from 'lucide-react';
import { RequestToolCta } from '../common/RequestToolCta';

interface CategoryViewProps {
  categoryId: CategoryId;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categoryId }) => {
  const { navigateToTool, isFavorite, toggleFavorite } = useApp();

  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const tools = getToolsByCategory(categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => window.location.hash = '#/' },
          { label: 'Categories', onClick: () => window.location.hash = '#/all-tools' },
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
              <div
                key={tool.id}
                onClick={() => navigateToTool(tool.slug)}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Request CTA */}
      <RequestToolCta initialToolName={`New ${category.name} Tool`} className="mt-8" />
    </div>
  );
};
