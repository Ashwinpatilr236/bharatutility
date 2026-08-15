import React, { useState } from 'react';
import { adminStore } from '../../../services/adminStore';
import { SiteAnnouncement } from '../../../types/admin';
import {
  BellRing,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Megaphone,
  Save,
  X
} from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>(adminStore.getAnnouncements());
  const [editingAnn, setEditingAnn] = useState<SiteAnnouncement | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [style, setStyle] = useState<SiteAnnouncement['style']>('new');
  const [enabled, setEnabled] = useState(true);

  const handleRefresh = () => {
    setAnnouncements([...adminStore.getAnnouncements()]);
  };

  const handleOpenEdit = (ann: SiteAnnouncement) => {
    setEditingAnn(ann);
    setTitle(ann.title);
    setMessage(ann.message);
    setCtaText(ann.ctaText || '');
    setCtaUrl(ann.ctaUrl || '');
    setStyle(ann.style);
    setEnabled(ann.enabled);
  };

  const handleOpenNew = () => {
    setEditingAnn(null);
    setTitle('');
    setMessage('');
    setCtaText('Check Out');
    setCtaUrl('#/tool/electricity-bill-calculator');
    setStyle('new');
    setEnabled(true);
    setIsNewOpen(true);
  };

  const handleToggle = (ann: SiteAnnouncement) => {
    const updated = { ...ann, enabled: !ann.enabled };
    adminStore.saveAnnouncement(updated);
    handleRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this announcement?')) {
      adminStore.deleteAnnouncement(id);
      handleRefresh();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const annToSave: SiteAnnouncement = {
      id: editingAnn?.id || 'ann_' + Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      message: message.trim(),
      ctaText: ctaText.trim() || undefined,
      ctaUrl: ctaUrl.trim() || undefined,
      style,
      enabled,
      createdAt: editingAnn?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    adminStore.saveAnnouncement(annToSave);
    handleRefresh();
    setEditingAnn(null);
    setIsNewOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-rose-500" /> Site-Wide Announcement Banners
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Broadcast major utility updates, regulatory tariff changes, or site maintenance notices to all visitors.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-5 rounded-2xl bg-white dark:bg-neutral-900 border transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              ann.enabled
                ? 'border-accent/40 dark:border-accent/40 ring-1 ring-accent/20'
                : 'border-neutral-200/80 dark:border-neutral-800 opacity-75'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    ann.style === 'new'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      : ann.style === 'warning'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : ann.style === 'success'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {ann.style}
                </span>

                <span className="font-bold text-xs text-neutral-900 dark:text-white">
                  {ann.title}
                </span>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {ann.message}
              </p>

              {ann.ctaText && (
                <span className="text-[11px] text-accent font-semibold block">
                  Button: &quot;{ann.ctaText}&quot; → {ann.ctaUrl}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleToggle(ann)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  ann.enabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {ann.enabled ? '● Active' : '○ Inactive'}
              </button>

              <button
                onClick={() => handleOpenEdit(ann)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleDelete(ann.id)}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {(editingAnn || isNewOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingAnn ? 'Edit Announcement' : 'Create Site Announcement'}
              </h2>
              <button
                onClick={() => {
                  setEditingAnn(null);
                  setIsNewOpen(false);
                }}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ⚡ All-India Electricity Tariffs Updated"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Message Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Now calculate domestic power bills across all 28 States & 8 UTs..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Calculate Bill"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    CTA Target URL
                  </label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    placeholder="#/tool/electricity-bill-calculator"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Visual Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                >
                  <option value="new">🟣 New Feature / Purple</option>
                  <option value="info">🔵 Information / Blue</option>
                  <option value="success">🟢 Success / Green</option>
                  <option value="warning">🟡 Notice / Amber</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ann-enabled-toggle"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                <label htmlFor="ann-enabled-toggle" className="text-xs font-semibold cursor-pointer">
                  Activate banner immediately
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAnn(null);
                    setIsNewOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 hover:bg-accent/90"
                >
                  <Save className="w-4 h-4" /> Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
