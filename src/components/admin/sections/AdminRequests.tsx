import React, { useState, useEffect, useMemo } from 'react';
import { ToolRequest, ToolRequestStatus } from '../../../types';
import { adminStore } from '../../../services/adminStore';
import {
  Inbox,
  Search,
  Trash2,
  Sparkles,
  RefreshCw,
  User,
  Mail,
  Calendar
} from 'lucide-react';
import { AdminSection } from '../../../types/admin';

interface AdminRequestsProps {
  onConvertToTool?: (prefill: { name: string; category: string; description: string }) => void;
  onNavigate?: (section: AdminSection) => void;
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; optionLabel: string }> = {
  new: {
    label: 'New',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    optionLabel: '🟣 New',
  },
  reviewing: {
    label: 'Reviewing',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
    optionLabel: '🟡 Reviewing',
  },
  planned: {
    label: 'Planned',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
    optionLabel: '🔵 Planned',
  },
  in_development: {
    label: 'In Development',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    optionLabel: '🔷 In Development',
  },
  completed: {
    label: 'Completed',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    optionLabel: '🟢 Completed',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    optionLabel: '🔴 Rejected',
  },
};

function normalizeStatus(status?: string): string {
  if (!status) return 'new';
  const s = status.toLowerCase().replace(/\s+/g, '_');
  if (s === 'under_review') return 'reviewing';
  if (s === 'declined') return 'rejected';
  return STATUS_CONFIG[s] ? s : 'new';
}

export const AdminRequests: React.FC<AdminRequestsProps> = ({
  onConvertToTool,
  onNavigate,
}) => {
  const [requests, setRequests] = useState<ToolRequest[]>(adminStore.getToolRequests());
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ToolRequest | null>(null);

  // Load latest requests from Supabase public.tool_requests on mount
  useEffect(() => {
    loadRequestsFromSupabase();
  }, []);

  const loadRequestsFromSupabase = async () => {
    setIsLoading(true);
    try {
      const data = await adminStore.fetchToolRequestsFromSupabase();
      setRequests(data);
      if (selectedRequest) {
        const fresh = data.find((r) => r.id === selectedRequest.id);
        if (fresh) setSelectedRequest(fresh);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const toolTitle = req.requested_tool || req.toolName || '';
      const desc = req.description || '';
      const cat = req.category || '';
      const reqName = req.name || '';
      const reqEmail = req.email || '';

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = toolTitle.toLowerCase().includes(q);
        const matchesDesc = desc.toLowerCase().includes(q);
        const matchesCat = cat.toLowerCase().includes(q);
        const matchesUser = reqName.toLowerCase().includes(q) || reqEmail.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesUser) return false;
      }

      const norm = normalizeStatus(req.status);
      if (statusFilter !== 'all' && norm !== statusFilter) return false;

      return true;
    });
  }, [requests, searchQuery, statusFilter]);

  const handleStatusChange = async (req: ToolRequest, newStatus: string) => {
    const updated: ToolRequest = { ...req, status: newStatus as ToolRequestStatus };
    // Update local state immediately for instant feedback
    setRequests((prev) => prev.map((r) => (r.id === req.id ? updated : r)));
    if (selectedRequest?.id === req.id) {
      setSelectedRequest(updated);
    }
    // Persist to Supabase public.tool_requests
    await adminStore.updateToolRequest(updated);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this tool request?')) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (selectedRequest?.id === id) setSelectedRequest(null);
      await adminStore.deleteToolRequest(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Inbox className="w-5 h-5 text-purple-500" /> Tool Requests & Demand Center
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Review citizen calculator submissions directly from Supabase, update development status, and convert into live utilities.
          </p>
        </div>

        <button
          onClick={loadRequestsFromSupabase}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Syncing...' : 'Refresh from Supabase'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tool requests by title, problem, name, or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
        >
          <option value="all">All Statuses ({requests.length})</option>
          <option value="new">🟣 New ({requests.filter((r) => normalizeStatus(r.status) === 'new').length})</option>
          <option value="reviewing">🟡 Reviewing ({requests.filter((r) => normalizeStatus(r.status) === 'reviewing').length})</option>
          <option value="planned">🔵 Planned ({requests.filter((r) => normalizeStatus(r.status) === 'planned').length})</option>
          <option value="in_development">🔷 In Development ({requests.filter((r) => normalizeStatus(r.status) === 'in_development').length})</option>
          <option value="completed">🟢 Completed ({requests.filter((r) => normalizeStatus(r.status) === 'completed').length})</option>
          <option value="rejected">🔴 Rejected ({requests.filter((r) => normalizeStatus(r.status) === 'rejected').length})</option>
        </select>
      </div>

      {/* Two Column Layout: Table & Request Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Requests Table (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider select-none">
                <tr>
                  <th className="p-3.5">Requested Utility</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-neutral-400">
                      No tool requests found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const isSelected = selectedRequest?.id === req.id;
                    const norm = normalizeStatus(req.status);
                    const cfg = STATUS_CONFIG[norm] || STATUS_CONFIG.new;
                    const toolTitle = req.requested_tool || req.toolName || 'Untitled Tool';

                    return (
                      <tr
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors ${
                          isSelected ? 'bg-accent/5' : ''
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-neutral-900 dark:text-neutral-100">
                              {toolTitle}
                            </span>
                            <span className="text-[10.5px] text-neutral-400 line-clamp-1">
                              {req.description}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10.5px] capitalize">
                            {req.category || 'General'}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase inline-flex items-center gap-1 ${cfg.badgeClass}`}
                          >
                            {cfg.label}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onConvertToTool) {
                                onConvertToTool({
                                  name: toolTitle,
                                  category: req.category || 'General',
                                  description: req.description || '',
                                });
                              } else if (onNavigate) {
                                onNavigate('tools');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                            title="Convert into a live tool draft"
                          >
                            <Sparkles className="w-3 h-3" /> Build
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Request Inspector Details (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          {selectedRequest ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-400 font-mono">
                  REQUEST #{selectedRequest.id?.slice(0, 8)}
                </span>
                <button
                  onClick={() => handleDelete(selectedRequest.id)}
                  className="text-neutral-400 hover:text-rose-500 p-1"
                  title="Delete Request"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {selectedRequest.requested_tool || selectedRequest.toolName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-1">
                  <span>Category: {selectedRequest.category || 'General'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedRequest.created_at || selectedRequest.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Requester Information */}
              {(selectedRequest.name || selectedRequest.email) && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-1.5 text-xs">
                  {selectedRequest.name && (
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="font-semibold">{selectedRequest.name}</span>
                    </div>
                  )}
                  {selectedRequest.email && (
                    <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <a href={`mailto:${selectedRequest.email}`} className="text-accent hover:underline font-mono">
                        {selectedRequest.email}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <span className="text-[11px] font-bold text-neutral-500 block mb-1">
                  User Description / Problem Statement:
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Status Update Control */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Update Development Status
                </label>
                <select
                  value={normalizeStatus(selectedRequest.status)}
                  onChange={(e) => handleStatusChange(selectedRequest, e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold outline-hidden cursor-pointer"
                >
                  <option value="new">🟣 New</option>
                  <option value="reviewing">🟡 Reviewing</option>
                  <option value="planned">🔵 Planned</option>
                  <option value="in_development">🔷 In Development</option>
                  <option value="completed">🟢 Completed</option>
                  <option value="rejected">🔴 Rejected</option>
                </select>
              </div>

              {/* Convert to Tool Button */}
              <button
                onClick={() => {
                  const toolTitle = selectedRequest.requested_tool || selectedRequest.toolName || 'New Tool';
                  if (onConvertToTool) {
                    onConvertToTool({
                      name: toolTitle,
                      category: selectedRequest.category || 'General',
                      description: selectedRequest.description || '',
                    });
                  } else if (onNavigate) {
                    onNavigate('tools');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-accent text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-accent/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Convert to New Tool Draft
              </button>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-neutral-400">
              Select a tool request from the table to inspect details or convert to a utility.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
