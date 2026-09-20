import React from 'react';
import { CATEGORIES } from '../../data/categories';
import { MobileBottomSheet } from './MobileBottomSheet';
import { DynamicIcon } from './DynamicIcon';
import { Link } from './Link';
import { Layers } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/haptics';

interface MobileCategoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileCategoriesDrawer: React.FC<MobileCategoriesDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="All Categories & Hubs"
      subtitle="Explore 220+ specialized everyday utilities"
      icon={
        <div className="p-2 rounded-xl bg-accent-subtle text-accent">
          <Layers className="w-5 h-5" />
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              onClick={() => {
                triggerHapticFeedback('light');
                onClose();
              }}
              className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/70 dark:border-neutral-700/70 hover:border-accent active:scale-95 transition-all text-left flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 text-accent border border-neutral-200/60 dark:border-neutral-700/60 shadow-2xs group-hover:scale-105 transition-transform">
                  <DynamicIcon name={cat.icon} className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                  {cat.toolCount}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-accent transition-colors truncate">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Sanatan Next Eco Card in Category Drawer */}
        <Link
          to="/sanatan-next"
          onClick={() => {
            triggerHapticFeedback('medium');
            onClose();
          }}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 text-xs active:scale-98 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🕉️</span>
            <div>
              <span className="font-bold text-neutral-900 dark:text-white block">
                Sanatan Next Hub
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-300">
                12 Jyotirlingas, 51 Shakti Peeths & Live Panchang
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-1 rounded-lg">
            Explore ↗
          </span>
        </Link>
      </div>
    </MobileBottomSheet>
  );
};
