import React, { useState } from 'react';
import { adminStore } from '../../../services/adminStore';
import { AppearanceConfig } from '../../../types/admin';
import {
  Palette,
  Save,
  CheckCircle2,
  Sliders,
  Type,
  Layout,
  Eye
} from 'lucide-react';

export const AdminAppearance: React.FC = () => {
  const [config, setConfig] = useState<AppearanceConfig>(adminStore.getAppearanceConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminStore.saveAppearanceConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-indigo-500" /> Site Appearance & Brand Copy
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Customize BharatUtility public brand title, hero slogans, footer copyright, and UI widget behaviors.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save Appearance
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Appearance configuration saved successfully.</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand & Hero Text (Col 1) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Type className="w-4 h-4 text-accent" /> Brand Identity & Hero Copy
          </h2>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Site Brand Title
            </label>
            <input
              type="text"
              value={config.siteTitle}
              onChange={(e) => setConfig({ ...config, siteTitle: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Site Tagline / Header Slogan
            </label>
            <input
              type="text"
              value={config.tagline}
              onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Hero Section Heading
            </label>
            <input
              type="text"
              value={config.heroHeading}
              onChange={(e) => setConfig({ ...config, heroHeading: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Hero Section Subheading Description
            </label>
            <textarea
              rows={3}
              value={config.heroSubheading}
              onChange={(e) => setConfig({ ...config, heroSubheading: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>
        </div>

        {/* Footer & UI Toggles (Col 2) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-accent" /> Footer Copy & Layout Toggles
          </h2>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Footer Copyright Notice
            </label>
            <input
              type="text"
              value={config.footerCopyright}
              onChange={(e) => setConfig({ ...config, footerCopyright: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Footer Tagline
            </label>
            <input
              type="text"
              value={config.footerTagline}
              onChange={(e) => setConfig({ ...config, footerTagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
            />
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-3 mt-4">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
              Public Homepage Widgets
            </span>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={config.showCategoryCounts}
                onChange={(e) => setConfig({ ...config, showCategoryCounts: e.target.checked })}
                className="rounded text-accent focus:ring-accent"
              />
              Show Tool Counts on Category Cards
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={config.showRecentCalculations}
                onChange={(e) => setConfig({ ...config, showRecentCalculations: e.target.checked })}
                className="rounded text-accent focus:ring-accent"
              />
              Show &quot;Recently Used Tools&quot; Quick Access on Homepage
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};
