import React from 'react';

interface AdSlotProps {
  format?: 'banner' | 'rectangle' | 'leaderboard' | 'inline';
  className?: string;
  slotId?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ format = 'banner', className = '', slotId = 'default-slot' }) => {
  // Height & styling mapping
  const heightClass =
    format === 'rectangle'
      ? 'min-h-[250px]'
      : format === 'leaderboard'
      ? 'min-h-[90px]'
      : format === 'inline'
      ? 'min-h-[60px]'
      : 'min-h-[100px]';

  return (
    <div
      id={`ad-container-${slotId}`}
      className={`relative my-6 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-hidden flex flex-col items-center justify-center p-3 text-center transition-all ${heightClass} ${className}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
          Advertisement / Sponsored
        </span>
      </div>

      <div className="flex flex-col items-center max-w-md">
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          AdSense Ready Placement • Non-intrusive & Speed Optimized
        </p>
        <span className="text-[11px] text-neutral-400/80 dark:text-neutral-600 mt-0.5">
          (Ads help keep all Indian everyday calculation tools 100% free forever)
        </span>
      </div>
    </div>
  );
};
