import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { adminStore } from '../../services/adminStore';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Flame, Star, TrendingUp, ArrowRight } from 'lucide-react';
import { ToolCard } from '../common/ToolCard';
import { ScrollableCarousel } from '../common/ScrollableCarousel';
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
    <section className="py-2 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Flame className="w-3 h-3 fill-current" />
            <span>High Civic Volume</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            Trending Today
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
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

      <ScrollableCarousel className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 gap-3 sm:gap-4">
        {tools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </ScrollableCarousel>
    </section>
  );
};
