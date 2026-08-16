import React, { useState, useEffect } from 'react';
import {
  Layout,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Save,
  Send,
  RotateCcw,
  Sparkles,
  Layers,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Star,
  FolderTree,
  DollarSign,
  Radio,
  Share2,
  ShieldCheck,
  Edit2,
  Clock,
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';
import { HomepageSectionConfig, HomepageBuilderConfig, HomepageSectionType } from '../../../types/admin';

const SECTION_TYPE_METADATA: Record<HomepageSectionType, { label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = {
  hero: {
    label: 'Hero & Quick Search',
    icon: Layout,
    description: 'Header, main title, live search input bar, and category shortcut chips.',
  },
  popular: {
    label: 'Popular Tools Grid',
    icon: Star,
    description: 'Most frequently used tools in India (EMI, GST, Income Tax, Salary).',
  },
  trending: {
    label: 'Trending Tools',
    icon: Flame,
    description: 'Calculators and utilities experiencing high velocity search spikes.',
  },
  categories: {
    label: 'Category Taxonomy Showcase',
    icon: FolderTree,
    description: 'Browse tools organized across 8 Indian civic & daily categories.',
  },
  featured: {
    label: 'Featured Utilities & Tax Tools',
    icon: Sparkles,
    description: 'Custom curated tools selected by administrators.',
  },
  recently_added: {
    label: 'Recently Added & Updated Tools',
    icon: Clock,
    description: 'Freshly published utilities and core calculation formula updates.',
  },
  announcements: {
    label: 'Live Citizen Broadcast Banner',
    icon: Radio,
    description: 'Important public service notices, platform announcements, and system alerts.',
  },
  social: {
    label: 'Social & Community Channels',
    icon: Share2,
    description: 'Connect with Telegram, WhatsApp, YouTube, and GitHub community.',
  },
  ads: {
    label: 'Homepage Native Ad Slot',
    icon: DollarSign,
    description: 'Responsive non-intrusive banner leaderboard slot.',
  },
  custom_info: {
    label: 'Custom Info & Trust Section',
    icon: ShieldCheck,
    description: 'Citizen privacy guarantee and custom announcement card.',
  },
};

export const AdminHomepageBuilder: React.FC = () => {
  const [config, setConfig] = useState<HomepageBuilderConfig>(adminStore.getHomepageConfig());
  const [draftSections, setDraftSections] = useState<HomepageSectionConfig[]>(config.draftSections);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tools = adminStore.getTools();

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      const current = adminStore.getHomepageConfig();
      setConfig(current);
    });
    return unsub;
  }, []);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= draftSections.length) return;

    const updated = [...draftSections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign displayOrder
    const reordered = updated.map((s, idx) => ({ ...s, displayOrder: idx + 1 }));
    setDraftSections(reordered);
  };

  const handleToggleEnable = (id: string) => {
    setDraftSections(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleUpdateSection = (id: string, updates: Partial<HomepageSectionConfig>) => {
    setDraftSections(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleSaveDraft = () => {
    try {
      setValidationError(null);
      adminStore.saveDraftHomepage(draftSections);
      setSuccessMessage('Draft homepage layout saved successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save draft.');
    }
  };

  const handlePublish = () => {
    try {
      setValidationError(null);
      adminStore.saveDraftHomepage(draftSections);
      adminStore.publishHomepageChanges();
      setSuccessMessage('Homepage changes published live! The public website has been updated.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to publish homepage.');
    }
  };

  const handleRestoreDefaults = () => {
    if (confirm('Are you sure you want to reset homepage sections to pristine defaults?')) {
      adminStore.restoreHomepageDefaults();
      const resetConfig = adminStore.getHomepageConfig();
      setDraftSections(resetConfig.draftSections);
      setSuccessMessage('Homepage sections restored to default layout.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
              Homepage Layout Builder
            </h2>
            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              Visual Customizer
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Reorder, toggle, and customize public homepage sections with instant draft saving & zero-code publishing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestoreDefaults}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors inline-flex items-center gap-1.5"
            title="Reset to default sections"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white hover:bg-neutral-50 border border-neutral-300 dark:border-neutral-700 shadow-2xs transition-colors inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-neutral-500" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent/90 shadow-2xs transition-colors inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish to Live Site</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{validationError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60">
        <div className="flex items-center gap-3">
          <span>Active Sections: <strong>{draftSections.filter(s => s.enabled).length} / {draftSections.length}</strong></span>
          <span>•</span>
          <span>Last Published: <strong>{config.lastPublishedAt ? new Date(config.lastPublishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Never'}</strong></span>
        </div>
        <span className="text-[11px] text-neutral-400">Drag/reorder sections using arrows to customize public homepage order.</span>
      </div>

      {/* Section List / Ordering Canvas */}
      <div className="space-y-3">
        {draftSections.map((section, idx) => {
          const meta = SECTION_TYPE_METADATA[section.type] || {
            label: section.title,
            icon: Layout,
            description: section.subtitle || '',
          };
          const Icon = meta.icon;
          const isEditing = activeEditingId === section.id;

          return (
            <div
              key={section.id}
              className={`p-4 rounded-2xl border transition-all ${
                section.enabled
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 shadow-2xs'
                  : 'bg-neutral-50/60 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/40 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left: Move handles + Icon + Title */}
                <div className="flex items-center gap-3 flex-1">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === draftSections.length - 1}
                      className="p-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="w-6 text-center font-mono font-bold text-xs text-neutral-400">
                    #{idx + 1}
                  </span>

                  <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                        {section.title || meta.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase">
                        {section.type}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400 truncate">
                      {section.subtitle || meta.description}
                    </p>
                  </div>
                </div>

                {/* Right: Actions (Toggle, Edit, Style) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveEditingId(isEditing ? null : section.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 ${
                      isEditing
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                    }`}
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditing ? 'Close Settings' : 'Customize'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleEnable(section.id)}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      section.enabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 hover:bg-neutral-200'
                    }`}
                    title={section.enabled ? 'Enabled on homepage' : 'Disabled / Hidden'}
                  >
                    {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Inline Customization Editor Panel */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-100">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={e => handleUpdateSection(section.id, { title: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={section.subtitle || ''}
                      onChange={e => handleUpdateSection(section.id, { subtitle: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                    />
                  </div>

                  {/* Section-specific configs */}
                  {['popular', 'trending', 'featured', 'recently_added'].includes(section.type) && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                        Item Count to Display
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={12}
                        value={section.itemCount || 4}
                        onChange={e => handleUpdateSection(section.id, { itemCount: Number(e.target.value) })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                      Background Styling
                    </label>
                    <select
                      value={section.backgroundStyle || 'default'}
                      onChange={e => handleUpdateSection(section.id, { backgroundStyle: e.target.value as any })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                    >
                      <option value="default">Default Seamless (Clean Canvas)</option>
                      <option value="subtle">Subtle Shaded Box</option>
                      <option value="card">Framed Elevated Card</option>
                      <option value="accent-border">Accent Border Highlight</option>
                    </select>
                  </div>

                  {/* Custom Info Section Content */}
                  {section.type === 'custom_info' && (
                    <div className="md:col-span-2 space-y-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">
                        Custom Guarantee / Trust Content
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Badge text (e.g. PRIVACY FIRST)"
                          value={section.customContent?.badge || ''}
                          onChange={e =>
                            handleUpdateSection(section.id, {
                              customContent: { ...section.customContent, badge: e.target.value },
                            })
                          }
                          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        />
                        <input
                          type="text"
                          placeholder="Button Text (e.g. Read Privacy Policy)"
                          value={section.customContent?.buttonText || ''}
                          onChange={e =>
                            handleUpdateSection(section.id, {
                              customContent: { ...section.customContent, buttonText: e.target.value },
                            })
                          }
                          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        />
                        <input
                          type="text"
                          placeholder="Button Link (e.g. #/legal/privacy)"
                          value={section.customContent?.buttonUrl || ''}
                          onChange={e =>
                            handleUpdateSection(section.id, {
                              customContent: { ...section.customContent, buttonUrl: e.target.value },
                            })
                          }
                          className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
