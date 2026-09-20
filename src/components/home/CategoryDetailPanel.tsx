import React, { useState } from 'react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { adminStore } from '../../services/adminStore';
import { getToolsByCategory } from '../../data/toolsRegistry';
import { CATEGORIES } from '../../data/categories';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { ScrollableCarousel } from '../common/ScrollableCarousel';
import { ToolCard } from '../common/ToolCard';
import { ArrowRight, LayoutGrid, ChevronRight } from 'lucide-react';

export const CategoryDetailPanel: React.FC = () => {
  useAdminStore();
  const categories = adminStore.getCategories().filter(c => c.active ?? true);
  const [activeCatId, setActiveCatId] = useState<string>(categories[0]?.id ?? '');

  const activeCat = categories.find(c => c.id === activeCatId) ?? categories[0];
  const catTools = activeCat ? getToolsByCategory(activeCat.id).slice(0, 8) : [];

  if (categories.length === 0) return null;

  return (
    <section className="py-2 sm:py-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Browse by Category</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white font-display">
            All {categories.length} Categories
          </h2>
        </div>
        <Link to="/tools" className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent/80 transition-colors">
          <span>All Tools</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ============ DESKTOP: 2-Column Layout ============ */}
      <div className="hidden lg:grid lg:grid-cols-[240px_1fr] gap-4 items-start">
        {/* LEFT: Category Sidebar */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden">
          <div className="py-1.5">
            {categories.map(cat => {
              const isActive = cat.id === activeCatId;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCatId(cat.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-accent/8 dark:bg-accent/10 text-accent border-r-2 border-accent'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover:bg-accent/10 group-hover:text-accent'
                  }`}>
                    <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold truncate ${isActive ? 'text-accent' : ''}`}>
                      {cat.shortName || cat.name}
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      {cat.toolCount} tools
                    </div>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-accent shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Tool Detail Panel */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-4">
          {activeCat && (
            <>
              {/* Category header inside right panel */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                    <DynamicIcon name={activeCat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                      {activeCat.name}
                    </h3>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1 max-w-sm">
                      {activeCat.description}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/category/${activeCat.id}`}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent text-white text-[10px] font-bold hover:bg-accent/90 transition-colors shrink-0"
                >
                  <span>View All {activeCat.toolCount}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Tool Grid — 4 per row on desktop right panel */}
              {catTools.length > 0 ? (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
                  {catTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 py-8 text-center">No tools in this category yet.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ============ MOBILE / TABLET: Horizontal Category Chips + Carousel ============ */}
      <div className="lg:hidden">
        {/* Category chip scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map(cat => {
            const isActive = cat.id === activeCatId;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-accent/40'
                }`}
              >
                <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                <span>{cat.shortName || cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active category tools carousel */}
        {activeCat && catTools.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
                  <DynamicIcon name={activeCat.icon} className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white">{activeCat.name}</span>
              </div>
              <Link
                to={`/category/${activeCat.id}`}
                className="text-[10px] font-bold text-accent inline-flex items-center gap-0.5"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <ScrollableCarousel className="pb-1 -mx-3 px-3 gap-2.5 no-scrollbar">
              {catTools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </ScrollableCarousel>
          </div>
        )}
      </div>
    </section>
  );
};
