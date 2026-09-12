import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { adminStore } from '../../services/adminStore';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Flame, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Tool } from '../../types';
import { formatIndianCompact } from '../../utils/formatters';

interface TrendingToolsSectionProps {
  itemCount?: number;
}

export const TrendingToolsSection: React.FC<TrendingToolsSectionProps> = ({ itemCount = 6 }) => {
  useAdminStore();
  const { isFavorite, toggleFavorite } = useApp();
  const [tools, setTools] = useState<Tool[]>(() => {
    return adminStore.getTrendingTools().slice(0, itemCount);
  });

  useEffect(() => {
    const update = () => {
      setTools(adminStore.getTrendingTools().slice(0, itemCount));
    };
    return adminStore.subscribe(update);
  }, [itemCount]);

  if (tools.length === 0) return null;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>High Civic Volume</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            Trending Today
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Most frequently used financial, tax, and loan calculators across India
          </p>
        </div>

        <Link
          to="/tools"
          className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-accent hover:bg-accent-subtle transition-colors inline-flex items-center gap-1.5"
        >
          <span>View All Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => {
          const isFav = isFavorite(tool.slug);
          const views = tool.views || 18500;

          return (
            <Link
              key={tool.id}
              to={`/tools/${tool.slug}`}
              className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 hover:border-rose-300 dark:hover:border-rose-900/60 shadow-xs hover:shadow-md cursor-pointer transition-all group relative"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0 group-hover:scale-105 group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <DynamicIcon name={tool.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-accent transition-colors truncate">
                      {tool.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" />
                      {formatIndianCompact(views)}+ uses
                    </span>
                    <span className="text-[11px] text-neutral-400 capitalize">
                      • {tool.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-3">
                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(tool.slug);
                  }}
                  title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isFav
                      ? 'text-amber-500 hover:text-rose-500'
                      : 'text-neutral-300 dark:text-neutral-600 hover:text-amber-500'
                  }`}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
