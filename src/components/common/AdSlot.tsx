import React, { useEffect } from 'react';

interface AdSlotProps {
  format?: 'banner' | 'rectangle' | 'leaderboard' | 'inline' | 'horizontal';
  className?: string;
  slotId?: string;
  adClient?: string;
  adSlot?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ 
  format = 'banner', 
  className = '', 
  slotId = 'default-slot',
  adClient = 'ca-pub-1234567890123456', // Replace with your actual AdSense publisher ID
  adSlot = '1234567890' // Replace with your actual AdSense slot ID if needed
}) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  // Height & styling mapping
  const heightClass =
    format === 'rectangle'
      ? 'min-h-[250px]'
      : format === 'leaderboard'
      ? 'min-h-[90px]'
      : format === 'inline' || format === 'horizontal'
      ? 'min-h-[60px]'
      : 'min-h-[100px]';

  return (
    <div
      id={`ad-container-${slotId}`}
      className={`relative my-6 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-hidden flex flex-col items-center justify-center p-3 text-center transition-all ${heightClass} ${className}`}
    >
      <div className="flex items-center gap-2 mb-1.5 w-full">
        <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 absolute top-2 right-2 z-10">
          Advertisement
        </span>
      </div>

      <ins 
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
