import React, { useState } from 'react';
import { Tool } from '../../types';
import { useApp } from '../../context/AppContext';
import { Copy, Check, Share2, Star, MessageSquare } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/haptics';

interface MobileToolActionBarProps {
  tool: Tool;
  calculationSummary?: string;
  onOpenShareModal: () => void;
}

export const MobileToolActionBar: React.FC<MobileToolActionBarProps> = ({
  tool,
  calculationSummary,
  onOpenShareModal,
}) => {
  const { isFavorite, toggleFavorite, showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const fav = isFavorite(tool.slug);

  const handleCopyResult = async () => {
    triggerHapticFeedback('light');
    const textToCopy = calculationSummary
      ? `${tool.name} Result:\n${calculationSummary}\n\nCalculated on BharatUtility: ${window.location.href}`
      : `${tool.name} - ${tool.tagline}\n${window.location.href}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      showToast('Result copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  };

  const handleNativeShare = async () => {
    triggerHapticFeedback('medium');
    const shareText = calculationSummary
      ? `${tool.name} Calculation:\n${calculationSummary}\n\nCheck full details on BharatUtility:`
      : `${tool.name} - Free Indian Online Calculator`;

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: tool.name,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    // Fallback to WhatsApp
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      shareText + ' ' + window.location.href
    )}`;
    window.open(waUrl, '_blank');
  };

  const handleToggleFav = () => {
    triggerHapticFeedback('light');
    toggleFavorite(tool.slug);
    showToast(fav ? 'Removed from favorites' : 'Saved to favorites!', 'success');
  };

  return (
    <div className="md:hidden fixed bottom-14 inset-x-0 z-40 px-3 py-2 pointer-events-none">
      <div className="max-w-md mx-auto bg-neutral-900/95 dark:bg-neutral-900/95 text-white backdrop-blur-xl rounded-2xl p-1.5 border border-neutral-700/80 shadow-2xl flex items-center justify-between gap-1.5 pointer-events-auto select-none">
        {/* 1. Copy Result Button */}
        <button
          onClick={handleCopyResult}
          className="flex-1 py-2 px-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-neutral-300" />
              <span>Copy</span>
            </>
          )}
        </button>

        {/* 2. WhatsApp / OS Share */}
        <button
          onClick={handleNativeShare}
          className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* 3. Favorite Star */}
        <button
          onClick={handleToggleFav}
          className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center ${
            fav
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'bg-neutral-800/80 text-neutral-300 hover:text-white'
          }`}
          title={fav ? 'Saved' : 'Save'}
        >
          <Star className={`w-4 h-4 ${fav ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        {/* 4. More Options */}
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            onOpenShareModal();
          }}
          className="p-2 rounded-xl bg-neutral-800/80 text-neutral-300 hover:text-white active:scale-95 transition-all"
          title="Share Card & QR"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
