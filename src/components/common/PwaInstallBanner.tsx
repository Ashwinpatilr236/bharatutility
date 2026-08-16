import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PwaInstallBanner: React.FC = () => {
  const { showToast } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bu_pwa_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsSupported(true);
    };

    const handleCustomPrompt = () => {
      handleInstallClick();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('bu:prompt-install', handleCustomPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      showToast('BharatUtility installed successfully! 🎉', 'success');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('bu:prompt-install', handleCustomPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Manual fallback instructions
      showToast('To install BharatUtility, tap Share or Menu (⋮) and select "Add to Home Screen"', 'info');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('Installing BharatUtility...', 'success');
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('bu_pwa_dismissed', 'true');
    } catch {}
  };

  if (isInstalled || isDismissed) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white shadow-lg border border-neutral-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 z-10">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-md shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-display tracking-tight text-white">
                Install BharatUtility App
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                100% Free
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              Keep your everyday tools one tap away with lightning-fast offline calculations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end z-10">
          <button
            id="pwa-install-btn"
            onClick={handleInstallClick}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs inline-flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Install App</span>
          </button>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
