import React from 'react';
import { useApp } from '../../context/AppContext';
import { MobileBottomSheet } from './MobileBottomSheet';
import { History, Clock, ArrowRight, Trash2, Calculator } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/haptics';

interface RecentCalculationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecentCalculationsDrawer: React.FC<RecentCalculationsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { calculationHistory, clearHistory, navigateToTool } = useApp();

  const handleOpenTool = (slug: string, inputs: Record<string, any>) => {
    triggerHapticFeedback('light');
    onClose();
    navigateToTool(slug, inputs);
  };

  const handleClear = () => {
    triggerHapticFeedback('medium');
    clearHistory();
  };

  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Recent Calculations"
      subtitle="Last used tools and inputs"
      icon={
        <div className="p-2 rounded-xl bg-accent-subtle text-accent">
          <History className="w-5 h-5" />
        </div>
      }
    >
      {calculationHistory.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
            <Calculator className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No recent calculations yet
          </p>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Whenever you calculate EMI, SIP, GST, or tax, your results will be saved here for quick 1-tap access.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              {calculationHistory.length} Saved in Memory
            </span>
            <button
              onClick={handleClear}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {calculationHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                onClick={() => handleOpenTool(item.toolSlug, item.inputs)}
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700/80 hover:border-accent hover:shadow-md transition-all active:scale-98 cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-neutral-900 dark:text-white group-hover:text-accent transition-colors">
                    {item.toolName}
                  </span>
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 text-xs font-mono font-bold text-accent border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="truncate">{item.resultSummary}</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0 group-hover:translate-x-1 transition-transform ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </MobileBottomSheet>
  );
};
