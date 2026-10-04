import React from 'react';
import { Construction } from 'lucide-react';

interface IptvConstructionNoticeProps {
  featureName?: string;
  className?: string;
  compact?: boolean;
}

export const IptvConstructionNotice: React.FC<IptvConstructionNoticeProps> = ({
  featureName,
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.1)] ${className}`}
      >
        <span className="text-sm">🚧</span>
        <span className="font-bold text-amber-300">Under Construction</span>
        <span className="text-neutral-400 text-[11px] hidden sm:inline">•</span>
        <span className="text-amber-200/80 text-[11px] hidden sm:inline">
          Sorry for the inconvenience. We're still working on improving this experience.
        </span>
      </div>
    );
  }

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl bg-neutral-950/80 border border-amber-500/30 text-amber-200 backdrop-blur-xl shadow-[0_4px_25px_rgba(245,158,11,0.12)] flex items-start gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
    >
      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
        <Construction className="w-5 h-5 animate-pulse" />
      </div>
      <div className="space-y-0.5 text-left flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-bold text-xs sm:text-sm text-amber-300 font-display">
            {featureName ? `${featureName} — Under Construction` : 'Under Construction'}
          </h4>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-mono">
            In Progress
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-amber-100/80 leading-relaxed font-sans">
          This feature is under construction. Sorry for the inconvenience. We're still working on improving this experience.
        </p>
      </div>
    </div>
  );
};
