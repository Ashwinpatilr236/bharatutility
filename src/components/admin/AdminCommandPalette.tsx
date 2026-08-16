import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Wrench,
  DollarSign,
  Layout,
  Link2,
  ShieldCheck,
  Split,
  FolderTree,
  Sliders,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Database,
  Radio,
  FileQuestion,
} from 'lucide-react';
import { adminStore } from '../../services/adminStore';
import { AdminSection } from '../../types/admin';

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection: (section: AdminSection) => void;
  onOpenEditTool?: (toolId: string) => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
  onOpenEditTool,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const tools = adminStore.getTools();
  const redirects = adminStore.getRedirects();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const adminSectionsList: { section: AdminSection; title: string; category: string; icon: any }[] = [
    { section: 'dashboard', title: 'Dashboard Overview', category: 'Navigation', icon: Layout },
    { section: 'revenue', title: 'Revenue & Monetization Analytics', category: 'Growth & Ads', icon: DollarSign },
    { section: 'homepage', title: 'Homepage Layout Builder', category: 'Design & Pages', icon: Layout },
    { section: 'redirects', title: 'Redirects & 404 URL Manager', category: 'SEO & Routing', icon: Link2 },
    { section: 'seo-health', title: 'SEO Health & Schema Center', category: 'SEO & Routing', icon: ShieldCheck },
    { section: 'tool-factory', title: 'Tool Factory & Quality Wizard', category: 'Tool Management', icon: Wrench },
    { section: 'experiments', title: 'A/B Testing & Experiments', category: 'Growth & Ads', icon: Split },
    { section: 'tools', title: 'Tool Management (All Tools)', category: 'Tool Management', icon: Wrench },
    { section: 'categories', title: 'Category Taxonomy', category: 'Tool Management', icon: FolderTree },
    { section: 'requests', title: 'Citizen Tool Requests', category: 'Feedback', icon: MessageSquare },
    { section: 'messages', title: 'Contact Submissions', category: 'Feedback', icon: MessageSquare },
    { section: 'ads', title: 'Ad Slots & Monetization Placements', category: 'Growth & Ads', icon: DollarSign },
    { section: 'seo', title: 'Global SEO & Social Tags', category: 'SEO & Routing', icon: Search },
    { section: 'dynamic-data', title: 'Dynamic Datasets & Tax Slabs', category: 'Dynamic Data', icon: Database },
    { section: 'feature-flags', title: 'Feature Flags & Experiments', category: 'Settings', icon: Sliders },
    { section: 'announcements', title: 'Public Citizen Broadcasts', category: 'Feedback', icon: Radio },
    { section: 'settings', title: 'System Settings & Backups', category: 'Settings', icon: Sliders },
  ];

  const filteredSections = adminSectionsList.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.category.toLowerCase().includes(query.toLowerCase()) ||
    s.section.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.slug.toLowerCase().includes(query.toLowerCase()) ||
    t.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const handleSelectSection = (section: AdminSection) => {
    onNavigateSection(section);
    onClose();
  };

  const handleSelectTool = (toolId: string) => {
    if (onOpenEditTool) {
      onOpenEditTool(toolId);
    } else {
      onNavigateSection('tools');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="p-3.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Quick search admin sections, tools, categories, redirects, SEO..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Sections List */}
          {filteredSections.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
                Admin Modules & Portals
              </div>
              {filteredSections.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.section}
                    onClick={() => handleSelectSection(s.section)}
                    className="w-full px-3 py-2 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-neutral-900 dark:text-white">
                          {s.title}
                        </div>
                        <div className="text-[10.5px] text-neutral-400 font-medium">
                          {s.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Tools List */}
          {filteredTools.length > 0 && (
            <div className="space-y-1 border-t border-neutral-100 dark:border-neutral-800/80 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
                Direct Tool Quick Edit
              </div>
              {filteredTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  className="w-full px-3 py-2 rounded-xl text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">
                        {tool.name}
                      </div>
                      <div className="text-[10.5px] font-mono text-neutral-400">
                        /tool/{tool.slug} • {tool.category}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    Edit Tool
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredSections.length === 0 && filteredTools.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-400">
              No matching admin sections or tools found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
