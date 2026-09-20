import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { getPopularTools } from '../../data/toolsRegistry';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Star, Sparkles, ArrowRight } from 'lucide-react';
import { ToolCard } from '../common/ToolCard';
import { ScrollableCarousel } from '../common/ScrollableCarousel';

export const PopularToolsSection: React.FC = () => {
  useAdminStore();
  const { toggleFavorite, isFavorite } = useApp();
  const popularTools = getPopularTools(8);

  return (
    <section className="py-2 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 sm:mb-5 gap-1.5 sm:gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Essential Daily Utilities</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
            Popular Tools
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Fast, mathematically accurate calculations built specifically for everyday Indian tasks
          </p>
        </div>
      </div>

      <ScrollableCarousel className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 no-scrollbar">
        {popularTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </ScrollableCarousel>
    </section>
  );
};
