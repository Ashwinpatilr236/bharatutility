import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getToolBySlug } from '../../data/toolsRegistry';
import { DynamicIcon } from '../common/DynamicIcon';
import { Star, ArrowRight, Trash2, Sparkles, X } from 'lucide-react';
import { Tool } from '../../types';

export const YourFavoritesSection: React.FC = () => {
  const { favorites, toggleFavorite, clearFavorites, navigateToTool, navigateToFavorites } = useApp();
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!favorites || favorites.length === 0) return null;

  const validTools = favorites
    .map(slug => getToolBySlug(slug))
    .filter((t): t is Tool => Boolean(t));

  if (validTools.length === 0) return null;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Personalized Toolbox ({validTools.length})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            Your Favorites
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Your pinned everyday tools saved locally on this browser
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {showConfirmClear ? (
            <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-xl border border-rose-200 dark:border-rose-800">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold px-2">
                Clear all favorites?
              </span>
              <button
                onClick={() => {
                  clearFavorites();
                  setShowConfirmClear(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowConfirmClear(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
                title="Clear all saved favorites"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
              <button
                onClick={navigateToFavorites}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-accent hover:bg-accent-subtle transition-colors inline-flex items-center gap-1"
              >
                <span>View All Saved</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {validTools.map(tool => (
          <div
            key={tool.id}
            onClick={() => navigateToTool(tool.slug)}
            className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 hover:border-amber-400/60 dark:hover:border-amber-400/60 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <DynamicIcon name={tool.icon} className="w-5 h-5" />
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleFavorite(tool.slug);
                  }}
                  title="Remove from favorites"
                  className="p-1.5 rounded-lg text-amber-500 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              </div>

              <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display group-hover:text-accent transition-colors line-clamp-1">
                {tool.name}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {tool.tagline}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-accent">
              <span className="capitalize text-[11px] text-neutral-400 font-medium">
                {tool.category}
              </span>
              <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
