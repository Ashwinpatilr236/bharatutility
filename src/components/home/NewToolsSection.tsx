import React from 'react';
import { useApp } from '../../context/AppContext';
import { adminStore } from '../../services/adminStore';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Sparkles, ArrowRight, Star, Clock } from 'lucide-react';
import { Tool } from '../../types';

interface NewToolsSectionProps {
  itemCount?: number;
}

export const NewToolsSection: React.FC<NewToolsSectionProps> = ({ itemCount = 4 }) => {
  const { toggleFavorite, isFavorite } = useApp();

  const activeTools = adminStore.getActiveTools();

  const newTools = [...activeTools]
    .filter(t => t.isNew || t.updatedAt || t.category === 'business' || t.category === 'technology')
    .slice(0, itemCount);

  const displayTools = newTools.length > 0 ? newTools : activeTools.slice(0, itemCount);

  if (displayTools.length === 0) return null;

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Latest Releases</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            New on BharatUtility
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Freshly built utilities, upgraded calculation engines, and everyday Indian templates
          </p>
        </div>

        <Link
          to="/tools"
          className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-accent hover:bg-accent-subtle transition-colors inline-flex items-center gap-1.5"
        >
          <span>Explore All 24+ Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayTools.map((tool: Tool) => {
          const favorite = isFavorite(tool.slug);

          return (
            <Link
              key={tool.id}
              to={`/tool/${tool.slug}`}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 hover:border-accent/60 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 group-hover:bg-accent-subtle group-hover:text-accent transition-all">
                    <DynamicIcon name={tool.icon} className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5" />
                      NEW
                    </span>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(tool.slug);
                      }}
                      aria-label="Favorite tool"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display group-hover:text-accent transition-colors line-clamp-1">
                  {tool.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-accent">
                <span className="capitalize text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  {tool.category}
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Launch
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
