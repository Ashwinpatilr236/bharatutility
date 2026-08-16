import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  Download,
  Link2,
  FileQuestion,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';
import { UrlRedirect, BrokenUrlLog } from '../../../types/admin';

export const AdminRedirects: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'redirects' | 'broken_urls'>('redirects');
  const [redirects, setRedirects] = useState<UrlRedirect[]>(adminStore.getRedirects());
  const [brokenUrls, setBrokenUrls] = useState<BrokenUrlLog[]>(adminStore.getBrokenUrls());
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for adding/editing redirect
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<UrlRedirect | null>(null);
  const [oldUrlInput, setOldUrlInput] = useState('');
  const [newUrlInput, setNewUrlInput] = useState('');
  const [typeInput, setTypeInput] = useState<301 | 302>(301);
  const [notesInput, setNotesInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setRedirects(adminStore.getRedirects());
      setBrokenUrls(adminStore.getBrokenUrls());
    });
    return unsub;
  }, []);

  const openCreateModal = (prefillOldUrl?: string, prefillNewUrl?: string) => {
    setEditingRedirect(null);
    setOldUrlInput(prefillOldUrl || '');
    setNewUrlInput(prefillNewUrl || '');
    setTypeInput(301);
    setNotesInput('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (r: UrlRedirect) => {
    setEditingRedirect(r);
    setOldUrlInput(r.oldUrl);
    setNewUrlInput(r.newUrl);
    setTypeInput(r.type);
    setNotesInput(r.notes || '');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = adminStore.saveRedirect({
      id: editingRedirect ? editingRedirect.id : undefined,
      oldUrl: oldUrlInput,
      newUrl: newUrlInput,
      type: typeInput,
      notes: notesInput,
      status: editingRedirect ? editingRedirect.status : 'active',
    });

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to save redirect.');
      return;
    }

    setIsModalOpen(false);
    setSuccessMessage('Redirect configured and activated successfully.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteRedirect = (id: string) => {
    if (confirm('Are you sure you want to delete this redirect?')) {
      adminStore.deleteRedirect(id);
    }
  };

  const handleToggleStatus = (id: string) => {
    adminStore.toggleRedirectStatus(id);
  };

  const handleExportCsv = () => {
    const csv = adminStore.exportDataAsCsv(activeTab === 'redirects' ? 'redirects' : 'broken_urls');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bharatutility_${activeTab}_export.csv`);
    link.click();
  };

  const filteredRedirects = redirects.filter(
    r =>
      r.oldUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.newUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBroken = brokenUrls.filter(
    b =>
      b.requestedUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.referrer && b.referrer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
              Redirect & Broken URL Manager
            </h2>
            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
              SEO Engine
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Safeguard PageRank, manage 301/302 routing rules, prevent redirect loops, and resolve 404 errors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openCreateModal()}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent/90 shadow-2xs transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Redirect</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('redirects')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2 ${
            activeTab === 'redirects'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Active URL Redirects ({redirects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broken_urls')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2 ${
            activeTab === 'broken_urls'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <FileQuestion className="w-3.5 h-3.5" />
          <span>
            404 Broken URL Logs (
            {brokenUrls.filter(b => b.status === 'unresolved').length} Unresolved)
          </span>
        </button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={activeTab === 'redirects' ? 'Search redirects by old/new URL or notes...' : 'Search 404 URL errors or referrers...'}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white"
        />
      </div>

      {/* Tab 1: Redirects List */}
      {activeTab === 'redirects' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Old Path (Source)</th>
                  <th className="py-3 px-2"></th>
                  <th className="py-3 px-4">Destination (Target)</th>
                  <th className="py-3 px-3 text-center">Type</th>
                  <th className="py-3 px-3 text-center">Hits</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredRedirects.map(r => (
                  <tr key={r.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900 dark:text-white">
                      <div>{r.oldUrl}</div>
                      {r.notes && <div className="text-[10.5px] font-sans text-neutral-400 font-normal">{r.notes}</div>}
                    </td>
                    <td className="py-3 px-2 text-neutral-400">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-accent">
                      {r.newUrl}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.type === 301
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}
                      >
                        {r.type} {r.type === 301 ? 'Permanent' : 'Temp'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-neutral-700 dark:text-neutral-300">
                      {r.hits.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(r.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                          r.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                        }`}
                      >
                        {r.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Edit Redirect"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRedirect(r.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Redirect"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: 404 Broken URLs List */}
      {activeTab === 'broken_urls' && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 text-neutral-500 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Missing Requested URL</th>
                  <th className="py-3 px-3 text-center">404 Hits</th>
                  <th className="py-3 px-4">Referrer Source</th>
                  <th className="py-3 px-4">Suggested Resolution</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredBroken.map(b => (
                  <tr key={b.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      <div>{b.requestedUrl}</div>
                      <div className="text-[10.5px] font-sans text-neutral-400 font-normal">
                        Last hit: {b.lastRequested}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-neutral-700 dark:text-neutral-300">
                      {b.hits}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px] truncate max-w-xs">
                      {b.referrer}
                    </td>
                    <td className="py-3 px-4 font-mono text-accent text-[11.5px]">
                      {b.suggestedDestination || '/all-tools'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.status === 'unresolved' ? (
                        <button
                          onClick={() => openCreateModal(b.requestedUrl, b.suggestedDestination || '/all-tools')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1"
                        >
                          <span>Create Redirect</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Redirect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingRedirect ? 'Edit Redirect Rule' : 'Create URL Redirect Rule'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveRedirect} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Old Source URL / Path (Match)
                </label>
                <input
                  type="text"
                  placeholder="/old-calculator or /tool/old-slug"
                  value={oldUrlInput}
                  onChange={e => setOldUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Target Destination URL / Path
                </label>
                <input
                  type="text"
                  placeholder="/tool/gst-calculator"
                  value={newUrlInput}
                  onChange={e => setNewUrlInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    HTTP Redirect Code
                  </label>
                  <select
                    value={typeInput}
                    onChange={e => setTypeInput(Number(e.target.value) as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value={301}>301 - Permanent (SEO Safe)</option>
                    <option value={302}>302 - Temporary</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Internal Admin Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Migrated tool slug alias"
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-colors shadow-xs"
                >
                  Save Redirect Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
