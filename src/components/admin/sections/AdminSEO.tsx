import React, { useState } from 'react';
import { adminStore } from '../../../services/adminStore';
import { GlobalSEOConfig } from '../../../types/admin';
import { Tool } from '../../../types';
import { AdminSection } from '../../../types/admin';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  FileCode,
  Sparkles,
  ExternalLink,
  Edit2,
  Layers,
  Check
} from 'lucide-react';

interface AdminSEOProps {
  onEditToolSeo?: (tool: Tool) => void;
  onNavigate?: (section: AdminSection) => void;
}

export const AdminSEO: React.FC<AdminSEOProps> = ({ onEditToolSeo, onNavigate }) => {
  const [config, setConfig] = useState<GlobalSEOConfig>(adminStore.getSeoConfig());
  const [tools, setTools] = useState<Tool[]>(adminStore.getTools());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'global' | 'auditor' | 'robots'>('global');

  // Preview tool for Google snippet simulator
  const [selectedPreviewTool, setSelectedPreviewTool] = useState<Tool>(tools[0]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminStore.saveSeoConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-blue-500" /> Search Engine Optimization (SEO) & Indexing
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage global meta tags, robots.txt, dynamic sitemaps, and audit tool-level SEO scores for Indian search engines.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save SEO Settings
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>SEO configuration successfully saved and written to metadata layer.</span>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {[
          { id: 'global', label: 'Global Metadata & Snippet Preview' },
          { id: 'auditor', label: `Per-Tool SEO Health Audit (${tools.length})` },
          { id: 'robots', label: 'Robots.txt & Sitemap' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === tab.id
                ? 'bg-accent text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: GLOBAL METADATA */}
      {activeSubTab === 'global' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Global Default Meta Tags
            </h2>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Default Site Title Tag
              </label>
              <input
                type="text"
                value={config.defaultTitle}
                onChange={(e) => setConfig({ ...config, defaultTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                {config.defaultTitle.length} characters
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Default Meta Description
              </label>
              <textarea
                rows={3}
                value={config.defaultDescription}
                onChange={(e) => setConfig({ ...config, defaultDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                {config.defaultDescription.length} characters (Optimal: 120-160)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Canonical Domain URL
                </label>
                <input
                  type="text"
                  value={config.canonicalDomain}
                  onChange={(e) => setConfig({ ...config, canonicalDomain: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Twitter / X Creator Handle
                </label>
                <input
                  type="text"
                  value={config.twitterHandle || ''}
                  onChange={(e) => setConfig({ ...config, twitterHandle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Default OpenGraph & Twitter Card Image URL
              </label>
              <input
                type="text"
                value={config.defaultOgImage || ''}
                onChange={(e) => setConfig({ ...config, defaultOgImage: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono outline-hidden"
              />
            </div>
          </div>

          {/* Google Search Live Snippet Simulator (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Search className="w-4 h-4 text-accent" /> Google Search Preview Simulator
              </h2>
            </div>

            <p className="text-xs text-neutral-400">
              Live simulation of how BharatUtility calculator results appear in Google search on desktop and mobile in India.
            </p>

            {/* Tool Selector for Preview */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                Select Tool to Preview
              </label>
              <select
                value={selectedPreviewTool.slug}
                onChange={(e) => {
                  const t = tools.find((tool) => tool.slug === e.target.value);
                  if (t) setSelectedPreviewTool(t);
                }}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
              >
                {tools.map((t) => (
                  <option key={t.id} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Google SERP Card Preview */}
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center text-[9px] font-bold">
                  BU
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-neutral-800 dark:text-neutral-200 font-medium leading-none">
                    BharatUtility
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    https://bharatutility.tech › tool › {selectedPreviewTool.slug}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1 pt-1">
                {selectedPreviewTool.seo?.title || selectedPreviewTool.name}
              </h4>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                {selectedPreviewTool.seo?.description || selectedPreviewTool.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDITOR */}
      {activeSubTab === 'auditor' && (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Per-Tool SEO & Meta Tags Auditor
              </h3>
              <p className="text-xs text-neutral-400">
                Audits title tag lengths, meta description density, and FAQ schema inclusion.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="p-3.5">Tool</th>
                  <th className="p-3.5">SEO Title (50-60)</th>
                  <th className="p-3.5">Meta Description (120-160)</th>
                  <th className="p-3.5">FAQs Schema</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {tools.map((t) => {
                  const titleLen = t.seo?.title?.length || 0;
                  const descLen = t.seo?.description?.length || 0;
                  const hasFaqs = (t.faqs?.length || 0) > 0;

                  const isTitleGood = titleLen >= 35 && titleLen <= 65;
                  const isDescGood = descLen >= 80 && descLen <= 165;

                  return (
                    <tr key={t.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                      <td className="p-3.5">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {t.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          /tool/{t.slug}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {isTitleGood ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span className={isTitleGood ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                            {titleLen} chars
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {isDescGood ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span className={isDescGood ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                            {descLen} chars
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {hasFaqs ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            {t.faqs?.length} FAQ Items
                          </span>
                        ) : (
                          <span className="text-neutral-400 text-[10px]">None</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            if (onEditToolSeo) {
                              onEditToolSeo(t);
                            } else if (onNavigate) {
                              onNavigate('tools');
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Edit SEO
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROBOTS.TXT */}
      {activeSubTab === 'robots' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-accent" /> Robots.txt & Dynamic Sitemap
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Robots.txt Content
            </label>
            <textarea
              rows={6}
              value={config.robotsTxt || ''}
              onChange={(e) => setConfig({ ...config, robotsTxt: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs outline-hidden"
            />
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-neutral-500">
            <span>Sitemap Endpoint: /sitemap.xml (Auto-generated with all published tools)</span>
          </div>
        </div>
      )}
    </div>
  );
};
