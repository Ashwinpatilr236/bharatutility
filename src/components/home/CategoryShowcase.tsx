import React from 'react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { adminStore } from '../../services/adminStore';
import { getToolsByCategory } from '../../data/toolsRegistry';
import { DynamicIcon } from '../common/DynamicIcon';
import { ScrollableCarousel } from '../common/ScrollableCarousel';
import { Link } from '../common/Link';
import { Layers, ArrowRight } from 'lucide-react';

export const CategoryShowcase: React.FC = () => {
  useAdminStore();
  const categories = adminStore.getCategories().filter(c => c.active ?? true);
  return (
    <section className="py-3 sm:py-7 bg-neutral-100/50 dark:bg-neutral-900/30 border-y border-neutral-200/80 dark:border-neutral-800/80 my-2 sm:my-5">
      <div className="py-0 sm:py-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 sm:mb-5 gap-1.5 sm:gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-0.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Explore by Domain</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Browse by Category
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Everyday tools organized for your personal finances, home projects, and career
            </p>
          </div>
        </div>

        <ScrollableCarousel className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5 no-scrollbar">
          {categories.map(cat => {
            const categoryTools = getToolsByCategory(cat.id).slice(0, 3);

            return (
              <div
                key={cat.id}
                className="flex flex-col justify-between p-3 sm:p-4 min-w-[72vw] sm:min-w-0 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-accent-subtle text-accent shadow-xs">
                      <DynamicIcon name={cat.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {cat.toolCount} Utilities
                    </span>
                  </div>

                  <Link
                    to={`/category/${cat.id}`}
                    className="text-sm font-bold text-neutral-900 dark:text-white font-display hover:text-accent cursor-pointer transition-colors block"
                  >
                    {cat.name}
                  </Link>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Top 3 tool links */}
                  <div className="mt-2.5 space-y-1 border-t border-neutral-100 dark:border-neutral-800/60 pt-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                      Featured in this category:
                    </span>
                    {categoryTools.map(t => (
                      <Link
                        key={t.id}
                        to={`/tools/${t.slug}`}
                        className="w-full flex items-center justify-between text-left py-0.5 text-[10px] text-neutral-700 dark:text-neutral-300 hover:text-accent dark:hover:text-white font-medium group transition-colors"
                      >
                        <span className="truncate">• {t.shortName || t.name}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-3">
                  <Link
                    to={`/category/${cat.id}`}
                    className="w-full flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px] font-semibold hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors"
                  >
                    <span>View All {cat.name}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </ScrollableCarousel>
      </div>
    </section>
  );
};
