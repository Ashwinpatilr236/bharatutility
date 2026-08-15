import React, { useState } from 'react';
import { Category, CategoryId } from '../../../types';
import { adminStore } from '../../../services/adminStore';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  MoveUp,
  MoveDown,
  Globe,
  Tag,
  Wrench,
  X,
  Save
} from 'lucide-react';

interface AdminCategoriesProps {
  onNavigateToTools?: (category: string) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  onNavigateToTools,
}) => {
  const [categories, setCategories] = useState<Category[]>(adminStore.getCategories());
  const tools = adminStore.getTools();

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [active, setActive] = useState(true);

  const handleRefresh = () => {
    setCategories([...adminStore.getCategories()]);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.id);
    setDescription(cat.description);
    setIcon(cat.icon);
    setSeoTitle(cat.seoTitle || `${cat.name} Calculators & Tools — BharatUtility`);
    setMetaDescription(cat.metaDescription || cat.description);
    setActive(cat.active !== false);
  };

  const handleOpenNew = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('Calculator');
    setSeoTitle('');
    setMetaDescription('');
    setActive(true);
    setIsNewCategoryOpen(true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= categories.length) return;
    const reordered = [...categories];
    const temp = reordered[index];
    reordered[index] = reordered[newIdx];
    reordered[newIdx] = temp;
    adminStore.reorderCategories(reordered);
    handleRefresh();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;

    const catToSave: Category = {
      id: slug.trim() as CategoryId,
      name: name.trim(),
      shortName: name.trim(),
      description: description.trim(),
      icon: icon.trim() || 'Folder',
      color: editingCategory?.color || 'indigo',
      toolCount: editingCategory?.toolCount || 0,
      seoTitle: seoTitle.trim() || `${name} Calculators & Everyday Utilities — BharatUtility`,
      metaDescription: metaDescription.trim() || description.trim(),
      active,
      order: editingCategory?.order || categories.length + 1,
    };

    adminStore.saveCategory(catToSave);
    handleRefresh();
    setEditingCategory(null);
    setIsNewCategoryOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-5 h-5 text-accent" /> Categories Hierarchy
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Structure tool taxonomies, SEO metadata, icons, and display ordering.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider select-none">
              <tr>
                <th className="p-3.5 w-14 text-center">Order</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Assigned Tools</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {categories.map((cat, idx) => {
                const assignedCount = tools.filter((t) => t.category === cat.id).length;

                return (
                  <tr
                    key={cat.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Order Controls */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono font-bold text-neutral-400 w-4">
                          {idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-0.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20"
                          >
                            <MoveUp className="w-3 h-3" />
                          </button>
                          <button
                            disabled={idx === categories.length - 1}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-0.5 text-neutral-400 hover:text-neutral-900 disabled:opacity-20"
                          >
                            <MoveDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Category Name & Slug */}
                    <td className="p-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          ID: {cat.id} • Icon: {cat.icon}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="p-3.5 max-w-xs truncate text-neutral-600 dark:text-neutral-400">
                      {cat.description}
                    </td>

                    {/* Assigned Tools */}
                    <td className="p-3.5">
                      <button
                        onClick={() => onNavigateToTools && onNavigateToTools(cat.id)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                      >
                        <Wrench className="w-3 h-3 text-accent" />
                        {assignedCount} Tools
                      </button>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {cat.active !== false ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold uppercase">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 dark:bg-neutral-800 text-[10px] font-bold uppercase">
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-accent hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {(editingCategory || isNewCategoryOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setIsNewCategoryOpen(false);
                }}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editingCategory) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category Slug / Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  SEO Title Tag
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="e.g. Money & Tax Calculators — BharatUtility"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="cat-active-toggle"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-accent focus:ring-accent"
                />
                <label htmlFor="cat-active-toggle" className="text-xs font-semibold cursor-pointer">
                  Active (Visible on public navigation)
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsNewCategoryOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 hover:bg-accent/90"
                >
                  <Save className="w-4 h-4" /> Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
