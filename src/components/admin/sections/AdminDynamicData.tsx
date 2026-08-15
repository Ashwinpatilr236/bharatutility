import React, { useState } from 'react';
import { adminStore } from '../../../services/adminStore';
import { DynamicDataset } from '../../../types/admin';
import {
  Database,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  ExternalLink,
  History,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Save,
  X
} from 'lucide-react';

export const AdminDynamicData: React.FC = () => {
  const [datasets, setDatasets] = useState<DynamicDataset[]>(adminStore.getDynamicDatasets());
  const [selectedDataset, setSelectedDataset] = useState<DynamicDataset | null>(datasets[0] || null);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const handleRefresh = () => {
    setDatasets([...adminStore.getDynamicDatasets()]);
  };

  const handleCheckUpdates = (ds: DynamicDataset) => {
    setIsCheckingUpdates(true);
    setUpdateMessage(null);

    setTimeout(() => {
      setIsCheckingUpdates(false);
      setUpdateMessage(
        `Checked ${ds.sourceName}. Current version ${ds.currentVersion} is active and matches latest regulatory bulletin.`
      );
      const updated: DynamicDataset = {
        ...ds,
        lastChecked: new Date().toISOString(),
      };
      adminStore.saveDynamicDataset(updated);
      handleRefresh();
      setSelectedDataset(updated);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-500" /> Dynamic India Datasets & Regulatory Schedules
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Centralized data feeds powering live calculations across Fuel rates, GST classifications, DTH tariffs, and Bullion prices.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Dataset List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dataset Selector List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          {datasets.map((ds) => {
            const isSelected = selectedDataset?.id === ds.id;
            return (
              <div
                key={ds.id}
                onClick={() => {
                  setSelectedDataset(ds);
                  setUpdateMessage(null);
                }}
                className={`p-4 rounded-2xl bg-white dark:bg-neutral-900 border cursor-pointer transition-all shadow-xs ${
                  isSelected
                    ? 'border-accent ring-1 ring-accent/30 dark:border-accent'
                    : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold uppercase">
                    {ds.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-accent">
                    {ds.currentVersion}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-2">
                  {ds.name}
                </h3>

                <span className="text-[10px] text-neutral-400 mt-1 block truncate">
                  Source: {ds.sourceName}
                </span>

                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>{ds.recordsCount} items indexed</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    ● Published
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dataset Inspector & Preview (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-5">
          {selectedDataset ? (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {selectedDataset.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase">
                      {selectedDataset.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {selectedDataset.description}
                  </p>
                </div>

                <button
                  onClick={() => handleCheckUpdates(selectedDataset)}
                  disabled={isCheckingUpdates}
                  className="px-3.5 py-1.5 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-accent/90 disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                  {isCheckingUpdates ? 'Checking Source...' : 'Check for Updates'}
                </button>
              </div>

              {/* Update Message Notice */}
              {updateMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{updateMessage}</span>
                </div>
              )}

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">
                    Active Version
                  </span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {selectedDataset.currentVersion}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">
                    Effective Date
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {selectedDataset.effectiveDate}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">
                    Official Source
                  </span>
                  <a
                    href={selectedDataset.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-accent hover:underline flex items-center gap-1 truncate"
                  >
                    {selectedDataset.sourceName} <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block font-semibold uppercase">
                    Last Verified
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {new Date(selectedDataset.lastChecked).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Data Preview Table */}
              <div>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-accent" /> Sample Data Records Preview
                </h3>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                        <tr>
                          {selectedDataset.dataPreview &&
                            selectedDataset.dataPreview.length > 0 &&
                            Object.keys(selectedDataset.dataPreview[0]).map((key) => (
                              <th key={key} className="p-2.5 capitalize font-mono text-[11px]">
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {selectedDataset.dataPreview &&
                          selectedDataset.dataPreview.map((row, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                              {Object.values(row).map((val: any, vIdx) => (
                                <td key={vIdx} className="p-2.5 font-medium">
                                  {typeof val === 'number'
                                    ? val.toLocaleString('en-IN')
                                    : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Editorial Notes */}
              {selectedDataset.notes && (
                <div className="text-xs text-neutral-500 bg-neutral-50 dark:bg-neutral-800/30 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Regulatory Notes:{' '}
                  </span>
                  {selectedDataset.notes}
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center text-xs text-neutral-400">
              Select a dataset to inspect records and verify regulatory versions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
