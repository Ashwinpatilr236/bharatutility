import React, { useState } from 'react';
import { adminStore } from '../../../services/adminStore';
import {
  Share2,
  Save,
  CheckCircle2,
  ExternalLink,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Github,
  Send,
  MessageCircle
} from 'lucide-react';

interface SocialLinksConfig {
  twitter: string;
  linkedin: string;
  youtube: string;
  instagram: string;
  whatsappChannel: string;
  telegram: string;
  github: string;
}

const SOCIAL_STORAGE_KEY = 'bu_admin_social_links';

const DEFAULT_SOCIAL: SocialLinksConfig = {
  twitter: 'https://x.com/bharatutility',
  linkedin: 'https://linkedin.com/company/bharatutility',
  youtube: 'https://youtube.com/@bharatutility',
  instagram: 'https://instagram.com/bharatutility',
  whatsappChannel: 'https://whatsapp.com/channel/0029VaBharatUtility',
  telegram: 'https://t.me/bharatutility',
  github: 'https://github.com/bharatutility/tools',
};

export const AdminSocial: React.FC = () => {
  const [links, setLinks] = useState<SocialLinksConfig>(() => {
    try {
      const stored = localStorage.getItem(SOCIAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_SOCIAL;
    } catch {
      return DEFAULT_SOCIAL;
    }
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(links));
    adminStore.logActivity('Social Media Links Updated', 'setting', 'Global Social Channel URLs');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-purple-500" /> Social Channels & Follow Links
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage official social media URLs linked across public headers, footers, and tool sharing dialogs.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save Social Links
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Social channel links updated successfully.</span>
        </div>
      )}

      {/* Social Form Matrix */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Twitter className="w-3.5 h-3.5 text-neutral-800 dark:text-white" /> X (formerly Twitter)
            </label>
            <input
              type="url"
              value={links.twitter}
              onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-blue-600" /> LinkedIn Organization
            </label>
            <input
              type="url"
              value={links.linkedin}
              onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube Channel
            </label>
            <input
              type="url"
              value={links.youtube}
              onChange={(e) => setLinks({ ...links, youtube: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram Handle
            </label>
            <input
              type="url"
              value={links.instagram}
              onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Updates Channel
            </label>
            <input
              type="url"
              value={links.whatsappChannel}
              onChange={(e) => setLinks({ ...links, whatsappChannel: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-sky-500" /> Telegram Community
            </label>
            <input
              type="url"
              value={links.telegram}
              onChange={(e) => setLinks({ ...links, telegram: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-neutral-800 dark:text-neutral-200" /> GitHub Repository
            </label>
            <input
              type="url"
              value={links.github}
              onChange={(e) => setLinks({ ...links, github: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
