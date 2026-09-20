import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { adminStore } from '../../services/adminStore';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Star, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { ToolCard } from '../common/ToolCard';
import { ScrollableCarousel } from '../common/ScrollableCarousel';
import { Tool } from '../../types';

interface NewToolsSectionProps {
  itemCount?: number;
}

export const NewToolsSection: React.FC<NewToolsSectionProps> = ({ itemCount = 4 }) => {
  useAdminStore();
  const { toggleFavorite, isFavorite } = useApp();

  const activeTools = adminStore.getActiveTools();

  const newTools = [...activeTools]
    .filter(t => t.isNew || t.updatedAt || t.category === 'business' || t.category === 'technology')
    .slice(0, itemCount);

  const displayTools = newTools.length > 0 ? newTools : activeTools.slice(0, itemCount);

  if (displayTools.length === 0) return null;

  return (
    <section className="py-2 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Latest Releases</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            New on BharatUtility
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Freshly built utilities, upgraded calculation engines, and everyday Indian templates
          </p>
        </div>

        <Link
          to="/tools"
          className="self-start sm:self-center px-4 py-2 rounded-xl text-xs font-bold text-accent hover:bg-accent-subtle transition-colors inline-flex items-center gap-1.5"
        >
          <span>Explore All Tools</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ScrollableCarousel className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 no-scrollbar">
        {displayTools.map((tool: Tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </ScrollableCarousel>
    </section>
  );
};
