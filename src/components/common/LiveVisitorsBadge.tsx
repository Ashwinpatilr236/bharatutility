import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';

interface LiveVisitorsBadgeProps {
  variant?: 'header' | 'footer' | 'pill';
  showLabel?: boolean;
}

export const LiveVisitorsBadge: React.FC<LiveVisitorsBadgeProps> = ({
  variant = 'header',
  showLabel = true,
}) => {
  const [count, setCount] = useState<number>(analyticsService.getLiveVisitorsCount());

  useEffect(() => {
    const unsubscribe = analyticsService.subscribeLiveCount(liveCount => {
      setCount(liveCount);
    });
    return () => unsubscribe();
  }, []);

  if (variant === 'footer') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>
          <strong>{count}</strong> Active Visitors Online Now
        </span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shadow-xs select-none"
      title="Live users active on BharatUtility right now"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span>
        {count} {showLabel && <span className="font-normal opacity-90 hidden sm:inline">Online</span>}
      </span>
    </div>
  );
};
