import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  X,
  Copy,
  Check,
  Laptop,
  Smartphone,
  Command,
  Star,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [os, setOs] = useState<'mac' | 'windows' | 'ios' | 'android' | 'other'>('windows');

  useEffect(() => {
    // Detect operating system for tailored instructions
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios');
    } else if (/android/.test(userAgent)) {
      setOs('android');
    } else if (/macintosh|mac os x/.test(userAgent)) {
      setOs('mac');
    } else if (/windows/.test(userAgent)) {
      setOs('windows');
    } else {
      setOs('windows');
    }
  }, []);

  if (!isOpen) return null;

  const currentUrl = window.location.href.split('#')[0];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmark-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 id="bookmark-modal-title" className="text-xl font-bold text-neutral-900 dark:text-white font-display">
              Bookmark BharatUtility
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Save BharatUtility in your browser bookmarks for instant 1-click access to all 50+ Indian utility tools.
            </p>
          </div>
        </div>

        {/* OS Specific Guidance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3">
          {os === 'mac' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <Laptop className="w-4 h-4 text-accent" />
                <span>Quick Shortcut for Mac:</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm font-mono font-bold text-neutral-900 dark:text-white shadow-xs flex items-center gap-1">
                  <Command className="w-3.5 h-3.5" /> + D
                </kbd>
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Press Command + D on your keyboard right now.
                </span>
              </div>
            </div>
          )}

          {(os === 'windows' || os === 'other') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                <Laptop className="w-4 h-4 text-accent" />
                <span>Quick Shortcut for Windows / Linux:</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm font-mono font-bold text-neutral-900 dark:text-white shadow-xs">
                  Ctrl + D
                </kbd>
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                  Press Ctrl + D on your keyboard to instantly add to Bookmarks bar.
                </span>
              </div>
            </div>
          )}

          {os === 'ios' && (
            <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2 font-bold">
                <Smartphone className="w-4 h-4 text-accent" />
                <span>iPhone / iPad (Safari) Instructions:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-600 dark:text-neutral-400 pl-1">
                <li>Tap the <strong>Share</strong> button (📤) at the bottom of Safari.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong> or <strong>Add Bookmark</strong>.</li>
              </ol>
            </div>
          )}

          {os === 'android' && (
            <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2 font-bold">
                <Smartphone className="w-4 h-4 text-accent" />
                <span>Android (Chrome) Instructions:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-600 dark:text-neutral-400 pl-1">
                <li>Tap the three dots (<strong>⋮</strong>) in the top-right corner.</li>
                <li>Tap the <strong>⭐ Star icon</strong> to bookmark, or tap <strong>Add to Home screen</strong>.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Copy Website Link Row */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
            Or Copy Website Link:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-800 dark:text-neutral-200 select-all"
            />
            <button
              onClick={handleCopyUrl}
              className="px-4 py-2.5 bg-accent text-white rounded-xl text-xs font-bold hover:bg-accent/90 transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            100% Free & No Account Needed
          </span>
          <button
            onClick={onClose}
            className="font-bold text-neutral-700 dark:text-neutral-300 hover:underline"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
