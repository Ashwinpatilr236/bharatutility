import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAdminStore } from '../../hooks/useAdminStore';
import { CATEGORIES } from '../../data/categories';
import { getToolsByCategory } from '../../data/toolsRegistry';
import { CategoryId } from '../../types';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Star } from 'lucide-react';
import { RequestToolCta } from '../common/RequestToolCta';
import { AntigravityParticles } from '../common/AntigravityParticles';
import { FloatingBadge } from '../common/FloatingBadge';
import { ToolCard } from '../common/ToolCard';

interface CategoryViewProps {
  categoryId: CategoryId;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categoryId }) => {
  useAdminStore();
  const { isFavorite, toggleFavorite, navigateToHome, navigateToAllTools } = useApp();

  const category = CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  const tools = getToolsByCategory(categoryId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-8 space-y-3.5 sm:space-y-8 animate-in fade-in duration-200 relative">
      {/* Background Subtle Antigravity Ambient Light & Particles */}
      <AntigravityParticles className="opacity-35 dark:opacity-50" particleCount={25} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[250px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full animate-antigravity-pulse" />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/categories', onClick: navigateToAllTools },
          { label: category.name, active: true }
        ]}
      />

      {/* Category Header Hero */}
      <div className="bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-lg shadow-neutral-900/5 dark:shadow-black/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 relative z-10">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-600/20 text-accent flex items-center justify-center shrink-0 border border-neutral-200/90 dark:border-neutral-700/60 shadow-xs">
            <DynamicIcon name={category.icon} className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
                {category.name}
              </h1>
              <FloatingBadge duration={3} distance={3}>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                  {tools.length} Tools
                </span>
              </FloatingBadge>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-3 sm:space-y-4 relative z-10">
        <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-display">
          Available Calculators & Utilities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* Category In-Depth Guide & SEO Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-display">
          Why Use BharatUtility for {category.name}?
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {category.description} All calculators and digital utilities on BharatUtility are tailored for Indian currency notation (₹ Lakhs and Crores), state regulations, tax structures, and standard daily life measurements. Best of all, 100% of calculations run privately in your browser with zero data sharing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 space-y-1">
            <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 font-display">
              ⚡ Instant & Accurate
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Formulas built following standard banking, regulatory, and Indian educational benchmarks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 space-y-1">
            <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 font-display">
              🔒 100% Client-Side Privacy
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Your inputs, financial numbers, and document files never leave your device.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 space-y-1">
            <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 font-display">
              📱 Mobile & Offline Ready
            </span>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Progressive Web App support enables offline access on mobile and desktop anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Category Explorer Bar */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Explore Other Popular Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter(c => c.id !== categoryId).map(otherCat => (
            <Link
              key={otherCat.id}
              to={`/category/${otherCat.id}`}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-accent text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-accent transition-colors flex items-center gap-2 shadow-2xs"
            >
              <DynamicIcon name={otherCat.icon} className="w-3.5 h-3.5 text-accent" />
              <span>{otherCat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Community Request CTA */}
      <RequestToolCta initialToolName={`New ${category.name} Tool`} className="mt-4 sm:mt-8" />
    </div>
  );
};
