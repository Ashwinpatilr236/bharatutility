import React, { useState } from 'react';
import { adminStore } from '../../../services/adminStore';
import { AdsManagementConfig, AdSlotConfig } from '../../../types/admin';
import {
  DollarSign,
  Save,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  Layers,
  Layout,
  Sliders,
  Eye
} from 'lucide-react';

export const AdminAds: React.FC = () => {
  const [config, setConfig] = useState<AdsManagementConfig>(adminStore.getAdsConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleGlobalAds = () => {
    setConfig((prev) => ({
      ...prev,
      adsEnabled: !prev.adsEnabled,
    }));
  };

  const handleToggleDevMode = () => {
    setConfig((prev) => ({
      ...prev,
      devPlaceholderMode: !prev.devPlaceholderMode,
    }));
  };

  const handleToggleSlot = (slotId: string) => {
    setConfig((prev) => ({
      ...prev,
      slots: prev.slots.map((s) =>
        s.id === slotId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const handleUpdateSlotId = (slotId: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      slots: prev.slots.map((s) =>
        s.id === slotId ? { ...s, slotId: value } : s
      ),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    adminStore.saveAdsConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-emerald-500" /> Ads & Monetization Control Center
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configure Google AdSense publisher credentials, non-intrusive ad unit placements, and preview placeholder mode.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> Save Ads Configuration
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Ads configuration successfully saved and applied across BharatUtility slots.</span>
        </div>
      )}

      {/* Global Master Settings Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accent" /> Master Ad Engine Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Master Ad Serving Toggle */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                Global Ad Serving
              </span>
              <span className="text-[11px] text-neutral-400">
                Master switch to enable or disable all advertisements site-wide.
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleGlobalAds}
              className={`p-1 rounded-xl text-2xl transition-colors ${
                config.adsEnabled ? 'text-accent' : 'text-neutral-300 dark:text-neutral-600'
              }`}
            >
              {config.adsEnabled ? (
                <ToggleRight className="w-8 h-8 text-accent" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Dev / Placeholder Mode Toggle */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                Development Placeholder Mode
              </span>
              <span className="text-[11px] text-neutral-400">
                Render clean preview boxes to verify layout geometry without AdSense policy risk.
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleDevMode}
              className={`p-1 rounded-xl text-2xl transition-colors ${
                config.devPlaceholderMode ? 'text-accent' : 'text-neutral-300 dark:text-neutral-600'
              }`}
            >
              {config.devPlaceholderMode ? (
                <ToggleRight className="w-8 h-8 text-accent" />
              ) : (
                <ToggleLeft className="w-8 h-8" />
              )}
            </button>
          </div>
        </div>

        {/* Publisher ID Input */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            Google AdSense Publisher ID (ca-pub-...)
          </label>
          <input
            type="text"
            value={config.publisherId || ''}
            onChange={(e) => setConfig({ ...config, publisherId: e.target.value })}
            placeholder="ca-pub-9841284759238411"
            className="w-full max-w-md px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-medium outline-hidden"
          />
        </div>
      </div>

      {/* Ad Placements Matrix */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Ad Slot Placements & Formats
            </h3>
            <p className="text-xs text-neutral-400">
              Control which specific page locations display ad slots and assign their AdSense slot IDs.
            </p>
          </div>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {config.slots.map((slot) => (
            <div
              key={slot.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0">
                  <Layout className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-neutral-900 dark:text-white">
                      {slot.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono uppercase">
                      {slot.format}
                    </span>
                  </div>
                  <span className="text-[10.5px] text-neutral-400 font-mono mt-0.5">
                    Placement ID: {slot.placement}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-neutral-400 font-mono">Slot ID:</span>
                  <input
                    type="text"
                    value={slot.slotId || ''}
                    onChange={(e) => handleUpdateSlotId(slot.id, e.target.value)}
                    placeholder="e.g. 8273918234"
                    className="w-32 px-2 py-1 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSlot(slot.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                    slot.enabled
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {slot.enabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
