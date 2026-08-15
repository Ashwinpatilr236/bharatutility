import React, { useState, useMemo } from 'react';
import { Tool, CategoryId } from '../../../types';
import { adminStore } from '../../../services/adminStore';
import { CATEGORIES } from '../../../data/categories';
import { AdminToolEditorModal } from './AdminToolEditorModal';
import { AdminToolPreviewModal } from './AdminToolPreviewModal';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  Edit2,
  Eye,
  Copy,
  Power,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  ArrowUpDown,
  Sparkles,
  Layers,
  Globe,
  Tag,
  ShieldAlert
} from 'lucide-react';

interface AdminToolsProps {
  initialEditSlug?: string | null;
  onOpenLiveTool?: (slug: string) => void;
}

export const AdminTools: React.FC<AdminToolsProps> = ({
  initialEditSlug,
  onOpenLiveTool,
}) => {
  const [tools, setTools] = useState<Tool[]>(adminStore.getTools());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flagFilter, setFlagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'views' | 'calcs' | 'updated'>('views');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [editingTool, setEditingTool] = useState<Tool | null>(
    initialEditSlug ? adminStore.getToolByIdOrSlug(initialEditSlug) || null : null
  );
  const [isNewToolModalOpen, setIsNewToolModalOpen] = useState(false);
  const [previewTool, setPreviewTool] = useState<Tool | null>(null);

  // Selected tool IDs for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleRefresh = () => {
    setTools([...adminStore.getTools()]);
  };

  const activeToolsCount = useMemo(() => {
    return tools.filter((t) => t.status === 'published' || !t.status).length;
  }, [tools]);

  const inactiveToolsCount = useMemo(() => {
    return tools.filter((t) => t.status === 'inactive' || t.status === 'unpublished' || t.status === 'archived').length;
  }, [tools]);

  const draftToolsCount = useMemo(() => {
    return tools.filter((t) => t.status === 'draft').length;
  }, [tools]);

  // Filter & Sort Logic
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(query);
        const matchesSlug = tool.slug.toLowerCase().includes(query);
        const matchesKeywords = tool.keywords.some((k) => k.toLowerCase().includes(query));
        if (!matchesName && !matchesSlug && !matchesKeywords) return false;
      }

      // Category
      if (categoryFilter !== 'all' && tool.category !== categoryFilter) return false;

      // Status
      const isToolActive = tool.status === 'published' || !tool.status;
      if (statusFilter === 'active' && !isToolActive) return false;
      if (statusFilter === 'inactive' && (isToolActive || tool.status === 'draft')) return false;
      if (statusFilter === 'draft' && tool.status !== 'draft') return false;

      // Flags
      if (flagFilter === 'popular' && !tool.popular) return false;
      if (flagFilter === 'trending' && !tool.trending) return false;
      if (flagFilter === 'featured' && !tool.featured) return false;
      if (flagFilter === 'editorsPick' && !tool.isEditorsPick) return false;
      if (flagFilter === 'missingSeo' && (tool.seo.title.length < 30 || tool.seo.description.length < 60)) return false;

      return true;
    }).sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'views') {
        valA = a.views || 0;
        valB = b.views || 0;
      } else if (sortBy === 'calcs') {
        valA = a.calculationCount || 0;
        valB = b.calculationCount || 0;
      } else if (sortBy === 'updated') {
        valA = new Date(a.updatedAt || 0).getTime();
        valB = new Date(b.updatedAt || 0).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tools, searchQuery, categoryFilter, statusFilter, flagFilter, sortBy, sortOrder]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTools.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveTool = (savedTool: Tool) => {
    adminStore.saveTool(savedTool);
    handleRefresh();
    setEditingTool(null);
    setIsNewToolModalOpen(false);
  };

  const handleToggleActive = (tool: Tool) => {
    adminStore.toggleToolActive(tool.id);
    handleRefresh();
  };

  const handleDuplicate = (toolId: string) => {
    const cloned = adminStore.duplicateTool(toolId);
    if (cloned) {
      handleRefresh();
    }
  };

  // Batch actions
  const handleBatchActivate = () => {
    selectedIds.forEach((id) => adminStore.setToolStatus(id, 'published'));
    handleRefresh();
    setSelectedIds([]);
  };

  const handleBatchDeactivate = () => {
    selectedIds.forEach((id) => adminStore.setToolStatus(id, 'inactive'));
    handleRefresh();
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-accent" /> Tool & Utility Manager
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage all {tools.length} calculators on BharatUtility ({activeToolsCount} Active Live, {inactiveToolsCount} Inactive/Disabled).
          </p>
        </div>

        <button
          onClick={() => setIsNewToolModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Tool
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tool name, slug, keywords..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
            >
              <option value="all">All Categories ({tools.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
            >
              <option value="all">All Tools ({tools.length})</option>
              <option value="active">🟢 Active Tools ({activeToolsCount})</option>
              <option value="inactive">⏸️ Inactive Tools ({inactiveToolsCount})</option>
              {draftToolsCount > 0 && <option value="draft">🟡 Draft Tools ({draftToolsCount})</option>}
            </select>
          </div>

          {/* Flags Filter */}
          <div>
            <select
              value={flagFilter}
              onChange={(e) => setFlagFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
            >
              <option value="all">All Flags</option>
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
              <option value="featured">Featured Hero</option>
              <option value="editorsPick">Editor's Pick</option>
              <option value="missingSeo">⚠️ Needs SEO Improvement</option>
            </select>
          </div>
        </div>

        {/* Batch Actions Bar (when rows selected) */}
        {selectedIds.length > 0 && (
          <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-accent">
              {selectedIds.length} tools selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBatchActivate}
                className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              >
                <PlayCircle className="w-3.5 h-3.5" /> Reactivate Selected (Make Live)
              </button>
              <button
                onClick={handleBatchDeactivate}
                className="px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <PauseCircle className="w-3.5 h-3.5" /> Deactivate Selected (Make Inactive)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Tools Table */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredTools.length &&
                      filteredTools.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded text-accent focus:ring-accent"
                  />
                </th>
                <th className="p-3.5">
                  <button
                    onClick={() => {
                      if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('name'); setSortOrder('asc'); }
                    }}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Tool Name & Slug <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">
                  <button
                    onClick={() => {
                      if (sortBy === 'calcs') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else { setSortBy('calcs'); setSortOrder('desc'); }
                    }}
                    className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Usage & Views <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="p-3.5">SEO Health</th>
                <th className="p-3.5 text-right">Quick Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-400">
                    No tools matching current search or filters.
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool) => {
                  const isSelected = selectedIds.includes(tool.id);
                  const isHealthySeo =
                    tool.seo?.title?.length >= 35 && tool.seo?.description?.length >= 70;
                  const isActive = tool.status === 'published' || !tool.status;
                  const isDraft = tool.status === 'draft';

                  return (
                    <tr
                      key={tool.id}
                      className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                        isSelected ? 'bg-accent/5' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(tool.id)}
                          className="rounded text-accent focus:ring-accent"
                        />
                      </td>

                      {/* Tool Name & Slug */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 dark:text-neutral-100 hover:text-accent cursor-pointer" onClick={() => setEditingTool(tool)}>
                              {tool.name}
                            </span>
                            {tool.popular && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] font-bold">
                                Popular
                              </span>
                            )}
                            {tool.trending && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[9px] font-bold">
                                Trending
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            /tool/{tool.slug}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium capitalize">
                          {tool.category.replace('-', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isActive ? (
                          <span
                            onClick={() => handleToggleActive(tool)}
                            className="cursor-pointer px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
                            title="Click to Deactivate"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active (Live)
                          </span>
                        ) : isDraft ? (
                          <span
                            onClick={() => handleToggleActive(tool)}
                            className="cursor-pointer px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 hover:bg-amber-200 transition-colors"
                            title="Click to Publish Live"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Draft
                          </span>
                        ) : (
                          <span
                            onClick={() => handleToggleActive(tool)}
                            className="cursor-pointer px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 hover:bg-neutral-200 transition-colors"
                            title="Click to Reactivate"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            Inactive (Disabled)
                          </span>
                        )}
                      </td>

                      {/* Usage & Views */}
                      <td className="p-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200">
                            {(tool.calculationCount || 0).toLocaleString('en-IN')} calcs
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {(tool.views || 0).toLocaleString('en-IN')} views
                          </span>
                        </div>
                      </td>

                      {/* SEO Health */}
                      <td className="p-3.5">
                        {isHealthySeo ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Optimal
                          </span>
                        ) : (
                          <span className="text-amber-500 font-semibold flex items-center gap-1 text-[11px]" title="Title or description too short">
                            <Sparkles className="w-3.5 h-3.5" /> Improve SEO
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Inactive (Reactivate) button */}
                          {isActive ? (
                            <button
                              onClick={() => handleToggleActive(tool)}
                              className="px-2 py-1 rounded-lg text-neutral-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-neutral-200/80 dark:border-neutral-700"
                              title="Deactivate Tool (Hides from website, keeps all data safe)"
                            >
                              <Power className="w-3.5 h-3.5 text-amber-500" /> Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleActive(tool)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                              title="Reactivate Tool (Makes live on website immediately)"
                            >
                              <Power className="w-3.5 h-3.5" /> Reactivate
                            </button>
                          )}

                          <button
                            onClick={() => setPreviewTool(tool)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Preview Tool"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingTool(tool)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-indigo-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Edit Tool"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(tool.id)}
                            className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Tool Modal */}
      {(editingTool || isNewToolModalOpen) && (
        <AdminToolEditorModal
          initialTool={editingTool}
          onSave={handleSaveTool}
          onClose={() => {
            setEditingTool(null);
            setIsNewToolModalOpen(false);
          }}
          onPreview={(tool) => setPreviewTool(tool)}
        />
      )}

      {/* Multi-Device Interactive Preview Modal */}
      {previewTool && (
        <AdminToolPreviewModal
          tool={previewTool}
          onClose={() => setPreviewTool(null)}
          onOpenLive={() => {
            if (onOpenLiveTool) onOpenLiveTool(previewTool.slug);
            setPreviewTool(null);
          }}
        />
      )}
    </div>
  );
};

