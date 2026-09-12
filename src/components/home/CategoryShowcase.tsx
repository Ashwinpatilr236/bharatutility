import React from 'react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { adminStore } from '../../services/adminStore';
import { getToolsByCategory } from '../../data/toolsRegistry';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Layers, ArrowRight } from 'lucide-react';

export const CategoryShowcase: React.FC = () => {
  useAdminStore();
  const categories = adminStore.getCategories().filter(c => c.active ?? true);
  return (
    <section className="py-12 bg-neutral-100/50 dark:bg-neutral-900/30 border-y border-neutral-200/80 dark:border-neutral-800/80 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Explore by Domain</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
              Browse by Category
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Everyday tools organized for your personal finances, home projects, and career
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(cat => {
            const categoryTools = getToolsByCategory(cat.id).slice(0, 3);

            return (
              <div
                key={cat.id}
                className="flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-accent-subtle text-accent shadow-xs">
                      <DynamicIcon name={cat.icon} className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {cat.toolCount} Utilities
                    </span>
                  </div>

                  <Link
                    to={`/category/${cat.id}`}
                    className="text-lg font-bold text-neutral-900 dark:text-white font-display hover:text-accent cursor-pointer transition-colors block"
                  >
                    {cat.name}
                  </Link>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>

                  {/* Top 3 tool links */}
                  <div className="mt-4 space-y-1.5 border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Featured in this category:
                    </span>
                    {categoryTools.map(t => (
                      <Link
                        key={t.id}
                        to={`/tools/${t.slug}`}
                        className="w-full flex items-center justify-between text-left py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:text-accent dark:hover:text-white font-medium group transition-colors"
                      >
                        <span className="truncate">• {t.shortName || t.name}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <Link
                    to={`/category/${cat.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-colors"
                  >
                    <span>View All {cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
