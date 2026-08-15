import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2 } from 'lucide-react';

export const OfflineStatusIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-500 text-neutral-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-in fade-in duration-200">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        You are currently offline. Core calculators and saved tools continue to work locally on your device.
      </span>
    </div>
  );
};
