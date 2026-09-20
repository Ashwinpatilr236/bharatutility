import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { adminStore } from '../../services/adminStore';
import { getPopularTools, getTrendingTools, getNewTools } from '../../data/toolsRegistry';
import { Link } from '../common/Link';
import { Flame, Star, Sparkles, ArrowRight } from 'lucide-react';
import { ToolCard } from '../common/ToolCard';
import { ScrollableCarousel } from '../common/ScrollableCarousel';
import { Tool } from '../../types';

type TabId = 'trending' | 'popular' | 'new';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: Tab[] = [
  { id: 'trending', label: 'Trending', icon: null, description: 'Most used right now across India' },
  { id: 'popular',  label: 'Popular',  icon: null, description: 'All-time essential daily tools' },
  { id: 'new',      label: 'New',      icon: null, description: 'Recently launched utilities' },
];

const TAB_INACTIVE: Record<TabId, string> = {
  trending: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  popular:  'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
  new:      'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800',
};

const TAB_ACTIVE: Record<TabId, string> = {
  trending: 'bg-rose-500 text-white border-rose-500',
  popular:  'bg-amber-500 text-white border-amber-500',
  new:      'bg-indigo-500 text-white border-indigo-500',
};

export const ToolDiscoveryWidget: React.FC = () => {
  useAdminStore();
  const [activeTab, setActiveTab] = useState<TabId>('trending');
  const [allTools, setAllTools] = useState<Record<TabId, Tool[]>>(() => ({
    trending: getTrendingTools(8),
    popular:  getPopularTools(8),
    new:      (() => { const n = getNewTools(8); return n.length > 0 ? n : getPopularTools(8); })(),
  }));

  useEffect(() => {
    const update = () => {
      setAllTools({
        trending: getTrendingTools(8),
        popular:  getPopularTools(8),
        new:      (() => { const n = getNewTools(8); return n.length > 0 ? n : getPopularTools(8); })(),
      });
    };
    return adminStore.subscribe(update);
  }, []);

  const tools = allTools[activeTab];
  const activeDesc = TABS.find(t => t.id === activeTab)?.description ?? '';
  if (!tools || tools.length === 0) return null;

  return (
    <section className="py-2 sm:py-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="shrink-0">
          <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            Discover Tools
          </h2>
          <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{activeDesc}</p>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {TABS.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
                  isActive ? `${TAB_ACTIVE[tab.id]} shadow-md` : `${TAB_INACTIVE[tab.id]} hover:opacity-80`
                }`}
              >
                {tab.id === 'trending' && <Flame className="w-3 h-3" />}
                {tab.id === 'popular'  && <Star className="w-3 h-3" />}
                {tab.id === 'new'      && <Sparkles className="w-3 h-3" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <Link to="/tools" className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent/80 transition-colors shrink-0">
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <ScrollableCarousel className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 no-scrollbar">
        {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
      </ScrollableCarousel>
      <div className="flex sm:hidden justify-center mt-2">
        <Link to="/tools" className="inline-flex items-center gap-1 text-xs font-bold text-accent transition-colors">
          <span>View All Tools</span><ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};
