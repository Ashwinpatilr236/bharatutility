import React from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquarePlus, ArrowRight, Sparkles, Compass } from 'lucide-react';

interface RequestToolCtaProps {
  className?: string;
  initialToolName?: string;
  variant?: 'card' | 'banner' | 'compact';
}

export const RequestToolCta: React.FC<RequestToolCtaProps> = ({
  className = '',
  initialToolName,
  variant = 'card'
}) => {
  const { navigateToRequestTool } = useApp();

  const handleRequestClick = () => {
    if (initialToolName) {
      try {
        sessionStorage.setItem('bu_requested_tool_prefill', initialToolName);
      } catch {}
    }
    navigateToRequestTool();
  };

  if (variant === 'compact') {
    return (
      <div className={`p-4 rounded-2xl bg-gradient-to-r from-accent/5 via-indigo-500/5 to-purple-500/5 border border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-xl bg-accent-subtle text-accent shrink-0">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white font-display">
              Can't find the exact tool you need?
            </h4>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Submit your request and our engineering team will build it for free.
            </p>
          </div>
        </div>
        <button
          onClick={handleRequestClick}
          className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 shadow-xs whitespace-nowrap shrink-0"
        >
          <span>Request a Tool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-neutral-50/80 to-indigo-50/30 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-indigo-950/20 border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 text-center sm:text-left shadow-xs ${className}`}>
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle border border-accent/20 text-accent text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community-Driven Platform</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
            Can't find the tool or calculator you need?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            BharatUtility is constantly evolving. Whether it's a specific tax calculation, financial formula, or workplace template - tell us what you need and we'll build it.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <button
            onClick={handleRequestClick}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-accent text-white font-bold text-sm inline-flex items-center justify-center gap-2 hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 shadow-md shadow-accent/20"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Request a Tool →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
