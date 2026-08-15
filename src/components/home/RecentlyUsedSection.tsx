import React from 'react';
import { useApp } from '../../context/AppContext';
import { getToolBySlug } from '../../data/toolsRegistry';
import { DynamicIcon } from '../common/DynamicIcon';
import { Clock, ArrowRight, X, Trash2 } from 'lucide-react';
import { Tool } from '../../types';

export const RecentlyUsedSection: React.FC = () => {
  const { recentTools, removeRecentTool, clearRecentTools, navigateToTool } = useApp();

  if (!recentTools || recentTools.length === 0) return null;

  const validTools = recentTools
    .map(slug => getToolBySlug(slug))
    .filter((t): t is Tool => Boolean(t))
    .slice(0, 6);

  if (validTools.length === 0) return null;

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
      <div className="p-5 sm:p-6 rounded-3xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white font-display">
                Recently Used Tools
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Continue your calculations without searching again
              </p>
            </div>
          </div>

          <button
            onClick={clearRecentTools}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
            title="Clear recently used history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {validTools.map(tool => (
            <div
              key={tool.id}
              onClick={() => navigateToTool(tool.slug)}
              className="relative group flex flex-col justify-between p-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 hover:border-accent/60 shadow-2xs hover:shadow-md text-left transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="p-2 rounded-xl bg-accent-subtle text-accent group-hover:scale-105 transition-transform">
                  <DynamicIcon name={tool.icon} className="w-4 h-4" />
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    removeRecentTool(tool.slug);
                  }}
                  aria-label={`Remove ${tool.name} from recent tools`}
                  className="p-1 rounded-lg text-neutral-300 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 group-hover:text-accent transition-colors line-clamp-1">
                  {tool.shortName || tool.name}
                </h4>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-400 capitalize mt-0.5 truncate">
                  {tool.category}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
