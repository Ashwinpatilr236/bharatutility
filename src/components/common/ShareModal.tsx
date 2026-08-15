import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { copyToClipboard } from '../../utils/formatters';
import { X, Check, Share2, Copy, Send, MessageCircle } from 'lucide-react';
import { Tool } from '../../types';

interface ShareModalProps {
  tool: Tool;
  calculationSummary?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ tool, calculationSummary, isOpen, onClose }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const shareTitle = `${tool.name} — BharatUtility`;
  const shareText = calculationSummary
    ? `Calculated on BharatUtility: ${calculationSummary}\nTry this free tool:`
    : `Check out the free ${tool.name} on BharatUtility:`;

  const handleCopy = async () => {
    const success = await copyToClipboard(currentUrl);
    if (success) {
      setCopied(true);
      showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${currentUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-accent-subtle text-accent">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
              Share Tool
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Share with friends, family, or colleagues
            </p>
          </div>
        </div>

        {calculationSummary && (
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl mb-4 text-xs font-mono text-neutral-700 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-700/50">
            <span className="font-sans font-semibold block text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
              Result Snapshot:
            </span>
            {calculationSummary}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <button
            onClick={shareToWhatsApp}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50 transition-colors font-medium text-xs gap-1.5"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            WhatsApp
          </button>

          <button
            onClick={shareToTelegram}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800/50 transition-colors font-medium text-xs gap-1.5"
          >
            <Send className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Telegram
          </button>

          <button
            onClick={shareToTwitter}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors font-medium text-xs gap-1.5"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X / Twitter
          </button>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="w-full px-2 py-1 text-xs bg-transparent text-neutral-700 dark:text-neutral-300 outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
};
