import React from 'react';
import { useApp } from '../../context/AppContext';
import { getPopularTools } from '../../data/toolsRegistry';
import { DynamicIcon } from '../common/DynamicIcon';
import { Star, ArrowRight, TrendingUp, Sparkles } from 'lucide-react';

export const PopularToolsSection: React.FC = () => {
  const { navigateToTool, toggleFavorite, isFavorite } = useApp();
  const popularTools = getPopularTools(8);

  return (
    <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Essential Daily Utilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            Most Popular Tools
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Fast, mathematically accurate calculations built specifically for Indian users
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {popularTools.map(tool => {
          const isFav = isFavorite(tool.slug);

          return (
            <div
              key={tool.id}
              onClick={() => navigateToTool(tool.slug)}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 hover:border-accent/50 dark:hover:border-accent/50 shadow-sm hover:shadow-xl hover:shadow-neutral-900/5 dark:hover:shadow-black/40 transition-all duration-200 cursor-pointer"
            >
              <div>
                {/* Header with Icon and Favorite */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-accent group-hover:bg-accent group-hover:text-white transition-colors duration-200 shadow-xs">
                    <DynamicIcon name={tool.icon} className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {tool.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent-subtle text-accent border border-accent/20">
                        {tool.badge}
                      </span>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(tool.slug);
                      }}
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      aria-label="Toggle bookmark"
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-neutral-300 dark:text-neutral-600 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title and Tagline */}
                <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display group-hover:text-accent transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-accent">
                <span className="capitalize text-[11px] text-neutral-400 font-medium">
                  {tool.category}
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Tool
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
