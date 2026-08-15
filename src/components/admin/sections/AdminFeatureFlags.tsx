import React, { useState, useEffect } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Layers,
  Cpu,
  DollarSign,
  FlaskConical,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';
import { FeatureFlagItem } from '../../../types/admin';
import { adminStore } from '../../../services/adminStore';

const CATEGORY_ICONS: Record<FeatureFlagItem['category'], React.ReactNode> = {
  core: <Layers className="w-4 h-4 text-indigo-500" />,
  ui: <Sparkles className="w-4 h-4 text-emerald-500" />,
  ai: <Cpu className="w-4 h-4 text-purple-500" />,
  monetization: <DollarSign className="w-4 h-4 text-amber-500" />,
  experimental: <FlaskConical className="w-4 h-4 text-rose-500" />,
};

export const AdminFeatureFlags: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlagItem[]>(adminStore.getFeatureFlags());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlagItem | null>(null);
  const [formKey, setFormKey] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState<FeatureFlagItem['category']>('core');
  const [formRollout, setFormRollout] = useState<number>(100);
  const [formEnabled, setFormEnabled] = useState(true);

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setFlags(adminStore.getFeatureFlags());
    });
    return unsub;
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggle = (key: string, name: string) => {
    const newState = adminStore.toggleFeatureFlag(key);
    showNotification('success', `Feature flag "${name}" is now ${newState ? 'ENABLED' : 'DISABLED'}.`);
  };

  const handleOpenAdd = () => {
    setEditingFlag(null);
    setFormKey('');
    setFormName('');
    setFormDesc('');
    setFormCategory('core');
    setFormRollout(100);
    setFormEnabled(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (flag: FeatureFlagItem) => {
    setEditingFlag(flag);
    setFormKey(flag.key);
    setFormName(flag.name);
    setFormDesc(flag.description);
    setFormCategory(flag.category);
    setFormRollout(flag.rolloutPercentage);
    setFormEnabled(flag.enabled);
    setIsModalOpen(true);
  };

  const handleSaveFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim() || !formName.trim()) {
      showNotification('error', 'Key and Name are required.');
      return;
    }

    const currentList = [...flags];
    const newFlag: FeatureFlagItem = {
      key: formKey.trim(),
      name: formName.trim(),
      description: formDesc.trim(),
      category: formCategory,
      rolloutPercentage: Number(formRollout),
      enabled: formEnabled,
      updatedAt: new Date().toISOString(),
    };

    const index = currentList.findIndex(f => f.key === newFlag.key);
    if (index >= 0) {
      currentList[index] = newFlag;
    } else {
      currentList.push(newFlag);
    }

    adminStore.saveFeatureFlags(currentList);
    showNotification('success', `Feature flag "${newFlag.name}" saved.`);
    setIsModalOpen(false);
  };

  const handleDeleteFlag = (key: string, name: string) => {
    if (confirm(`Are you sure you want to delete feature flag "${name}"?`)) {
      const filtered = flags.filter(f => f.key !== key);
      adminStore.saveFeatureFlags(filtered);
      showNotification('success', `Feature flag "${name}" removed.`);
    }
  };

  const filteredFlags = flags.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="admin-feature-flags-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Feature Flags & Rollout Control</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Dynamically toggle feature gates, preview experimental calculators, and adjust rollout percentages instantly.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Feature Flag</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm border ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search flags by name or key..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories ({flags.length})</option>
            <option value="core">Core Platform</option>
            <option value="ui">User Interface</option>
            <option value="ai">AI Features</option>
            <option value="monetization">Monetization / Ads</option>
            <option value="experimental">Experimental</option>
          </select>
        </div>
      </div>

      {/* Flags List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFlags.map(flag => {
          return (
            <div
              key={flag.key}
              className={`p-5 rounded-xl border transition-all ${
                flag.enabled
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs'
                  : 'bg-neutral-50/70 dark:bg-neutral-900/50 border-neutral-200/60 dark:border-neutral-800/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-800 shrink-0">
                    {CATEGORY_ICONS[flag.category]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                      {flag.name}
                    </h3>
                    <code className="text-[11px] text-neutral-400 font-mono">
                      {flag.key}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(flag.key, flag.name)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      flag.enabled ? 'bg-emerald-600' : 'bg-neutral-300 dark:bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        flag.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2 leading-relaxed">
                {flag.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-semibold uppercase tracking-wider">
                    {flag.category}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Rollout: <strong className="text-neutral-800 dark:text-neutral-200">{flag.rolloutPercentage}%</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(flag)}
                    className="p-1 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit Flag"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteFlag(flag.key, flag.name)}
                    className="p-1 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Delete Flag"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFlag} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Feature Key (CamelCase or SnakeCase)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. enableSolarRoiCalculator"
                  value={formKey}
                  disabled={!!editingFlag}
                  onChange={e => setFormKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Feature Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rooftop Solar ROI & Subsidy Engine"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe what this feature switch controls..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as FeatureFlagItem['category'])}
                    className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="core">Core Platform</option>
                    <option value="ui">User Interface</option>
                    <option value="ai">AI Features</option>
                    <option value="monetization">Monetization</option>
                    <option value="experimental">Experimental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Rollout ({formRollout}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={formRollout}
                    onChange={e => setFormRollout(Number(e.target.value))}
                    className="w-full mt-2 accent-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="flagEnabledChk"
                  checked={formEnabled}
                  onChange={e => setFormEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="flagEnabledChk" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                  Flag active and enabled by default
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Save Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
