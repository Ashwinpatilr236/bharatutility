import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getToolBySlug, getPopularTools } from '../../data/toolsRegistry';
import { CATEGORIES } from '../../data/categories';
import { DynamicIcon } from '../common/DynamicIcon';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Link } from '../common/Link';
import { Tool } from '../../types';
import {
  Star,
  Trash2,
  ArrowRight,
  Sparkles,
  Search,
  Plus,
  History,
  Clock,
  ExternalLink
} from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const {
    favorites,
    toggleFavorite,
    navigateToTool,
    navigateToAllTools,
    navigateToHome,
    calculationHistory,
    clearHistory
  } = useApp();

  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolve favorite tools
  const savedTools = useMemo(() => {
    return favorites
      .map(slug => getToolBySlug(slug))
      .filter((t): t is Tool => Boolean(t));
  }, [favorites]);

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return savedTools;
    const q = searchQuery.toLowerCase().trim();
    return savedTools.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.shortName?.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [savedTools, searchQuery]);

  const popularSuggestions = getPopularTools(4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: navigateToHome },
          { label: 'Favorites & Saved', active: true }
        ]}
      />

      {/* Page Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/80 dark:border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-xs">
              <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
                  Saved Utilities
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {favorites.length} Saved
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
                Quick 1-click access to your most frequently used Indian financial, tax, property, and daily utility tools.
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-2xl self-start sm:self-center border border-neutral-200 dark:border-neutral-700/60">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'favorites'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
              <span>Favorites ({favorites.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5 text-accent" />
              <span>Calculations ({calculationHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'favorites' ? (
        <div className="space-y-6">
          {/* Controls Bar when tools exist */}
          {savedTools.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Filter saved tools..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>

              <Link
                to="/tools"
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 self-end sm:self-center"
              >
                <Plus className="w-3.5 h-3.5" />
                Browse & add more tools
              </Link>
            </div>
          )}

          {/* Populated Grid or Empty State */}
          {savedTools.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200/80 dark:border-neutral-800 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
                <Star className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-display">
                  No Favorites Saved Yet
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Keep your favorite calculators handy by clicking the star (⭐) icon on any tool card or calculator page. Everything is saved locally on your device for instant offline access.
                </p>
              </div>

              {/* Quick Add Suggestions */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 max-w-2xl mx-auto space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Popular Tools You Might Want to Save:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {popularSuggestions.map(tool => (
                    <div
                      key={tool.id}
                      className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 flex items-center justify-between"
                    >
                      <Link
                        to={`/tool/${tool.slug}`}
                        className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                      >
                        <div className="p-2 rounded-xl bg-white dark:bg-neutral-800 text-accent">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-neutral-900 dark:text-white block truncate">
                            {tool.name}
                          </span>
                          <span className="text-[10px] text-neutral-400 block truncate">
                            {tool.tagline}
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={() => toggleFavorite(tool.slug)}
                        className="p-2 rounded-lg bg-white dark:bg-neutral-700 text-amber-500 hover:scale-105 transition-transform shrink-0 shadow-2xs"
                        title="Add to Favorites"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/tools"
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore All 16+ Indian Utilities
                </Link>
              </div>
            </div>
          ) : filteredFavorites.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 text-center space-y-2">
              <p className="text-sm text-neutral-500">No saved tools match "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-accent underline"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredFavorites.map(tool => {
                const cat = CATEGORIES.find(c => c.id === tool.category);

                return (
                  <Link
                    key={tool.id}
                    to={`/tool/${tool.slug}`}
                    className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-xs hover:border-accent hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="w-11 h-11 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                          <DynamicIcon name={tool.icon} className="w-5 h-5" />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(tool.slug);
                            }}
                            className="p-1.5 text-amber-500 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Remove from favorites"
                          >
                            <Star className="w-4 h-4 fill-current" />
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
                      <span className="font-medium text-neutral-400">{cat?.name}</span>
                      <span className="font-semibold text-accent group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Open <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white font-display">
                Recent Calculation Snapshots
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Values and inputs from calculations you completed in this browser session.
              </p>
            </div>

            {calculationHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-500 hover:text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear History
              </button>
            )}
          </div>

          {calculationHistory.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <History className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No recent calculations recorded
              </h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                When you compute EMIs, GST amounts, salary breakdowns, or land conversions, your summary results will be securely logged here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {calculationHistory.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigateToTool(item.toolSlug, item.params)}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-accent/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-accent group-hover:underline">
                      {item.toolName}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Click to re-open calculation</span>
                    <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-accent" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
