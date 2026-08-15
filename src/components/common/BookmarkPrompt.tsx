import React, { useState, useEffect } from 'react';
import { Bookmark, Check, Share2, Star, Sparkles, X } from 'lucide-react';

interface BookmarkPromptProps {
  variant?: 'card' | 'inline' | 'banner';
}

export const BookmarkPrompt: React.FC<BookmarkPromptProps> = ({ variant = 'card' }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [osShortcut, setOsShortcut] = useState('Ctrl + D');

  useEffect(() => {
    // Detect OS for keyboard shortcut hint
    if (typeof window !== 'undefined') {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      setOsShortcut(isMac ? '⌘ + D' : 'Ctrl + D');
      
      const dismissed = localStorage.getItem('bu_bookmark_dismissed');
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleBookmarkClick = () => {
    setIsBookmarked(true);
    setTimeout(() => setIsBookmarked(false), 3000);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('bu_bookmark_dismissed', 'true');
  };

  if (isDismissed) return null;

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/60 dark:border-indigo-800/60 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
              Bookmark BharatUtility for instant daily access
            </h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
              Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[10px] font-bold text-neutral-700 dark:text-neutral-300">{osShortcut}</kbd> anytime to save this page to your browser bar.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-neutral-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-lg relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Fast Daily Access</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold font-display text-white">
            Need this calculator frequently?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Bookmark <strong className="text-white">BharatUtility</strong> or press{' '}
            <kbd className="px-2 py-0.5 rounded-md bg-neutral-800 border border-neutral-700 font-mono text-xs font-bold text-amber-300">
              {osShortcut}
            </kbd>{' '}
            to keep India's fastest zero-ads everyday tools just 1 click away.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleBookmarkClick}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-indigo-500/25 transition-all"
          >
            {isBookmarked ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Bookmark Pressed ({osShortcut})</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Bookmark This Page</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
