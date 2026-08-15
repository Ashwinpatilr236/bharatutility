import React, { useState, useMemo } from 'react';
import { ToolRequest } from '../../../types';
import { adminStore } from '../../../services/adminStore';
import {
  Inbox,
  Search,
  Filter,
  Plus,
  Wrench,
  Trash2,
  CheckCircle2,
  Clock,
  Code2,
  XCircle,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import { AdminSection } from '../../../types/admin';

interface AdminRequestsProps {
  onConvertToTool?: (prefill: { name: string; category: string; description: string }) => void;
  onNavigate?: (section: AdminSection) => void;
}

export const AdminRequests: React.FC<AdminRequestsProps> = ({
  onConvertToTool,
  onNavigate,
}) => {
  const [requests, setRequests] = useState<ToolRequest[]>(adminStore.getToolRequests());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ToolRequest | null>(null);

  const handleRefresh = () => {
    setRequests([...adminStore.getToolRequests()]);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = req.toolName.toLowerCase().includes(q);
        const matchesDesc = req.description.toLowerCase().includes(q);
        const matchesCat = req.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      if (statusFilter !== 'all' && req.status !== statusFilter) return false;

      return true;
    });
  }, [requests, searchQuery, statusFilter]);

  const handleStatusChange = (req: ToolRequest, newStatus: ToolRequest['status']) => {
    const updated = { ...req, status: newStatus };
    adminStore.updateToolRequest(updated);
    handleRefresh();
    if (selectedRequest?.id === req.id) {
      setSelectedRequest(updated);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this tool request?')) {
      adminStore.deleteToolRequest(id);
      handleRefresh();
      if (selectedRequest?.id === id) setSelectedRequest(null);
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
            Review citizen calculator submissions, update development status, and convert popular ideas into live utilities.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tool requests by title, keyword, or problem description..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
        >
          <option value="all">All Statuses ({requests.length})</option>
          <option value="New">New ({requests.filter((r) => r.status === 'New').length})</option>
          <option value="Under Review">Under Review</option>
          <option value="Planned">Planned</option>
          <option value="In Development">In Development</option>
          <option value="Completed">Completed</option>
          <option value="Declined">Declined</option>
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
                              {req.toolName}
                            </span>
                            <span className="text-[10.5px] text-neutral-400 line-clamp-1">
                              {req.description}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10.5px] capitalize">
                            {req.category}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              req.status === 'New'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                : req.status === 'In Development'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : req.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : req.status === 'Declined'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onConvertToTool) {
                                onConvertToTool({
                                  name: req.toolName,
                                  category: req.category,
                                  description: req.description,
                                });
                              } else if (onNavigate) {
                                onNavigate('tools');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                            title="Convert into a live tool"
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
                  REQUEST #{selectedRequest.id}
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
                  {selectedRequest.toolName}
                </h3>
                <span className="text-xs text-neutral-400 mt-0.5 block">
                  Category: {selectedRequest.category} • Submitted{' '}
                  {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <span className="text-[11px] font-bold text-neutral-500 block mb-1">
                  User Description / Problem Statement:
                </span>
                <p className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  {selectedRequest.description}
                </p>
              </div>

              {selectedRequest.email && (
                <div className="text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Contact Email:{' '}
                  </span>
                  <a
                    href={`mailto:${selectedRequest.email}`}
                    className="text-accent hover:underline font-mono"
                  >
                    {selectedRequest.email}
                  </a>
                </div>
              )}

              {/* Status Update Control */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Update Development Status
                </label>
                <select
                  value={selectedRequest.status}
                  onChange={(e) =>
                    handleStatusChange(selectedRequest, e.target.value as any)
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold outline-hidden"
                >
                  <option value="New">🟣 New</option>
                  <option value="Under Review">🟡 Under Review</option>
                  <option value="Planned">🔵 Planned</option>
                  <option value="In Development">🔷 In Development</option>
                  <option value="Completed">🟢 Completed</option>
                  <option value="Declined">🔴 Declined</option>
                </select>
              </div>

              {/* Convert to Tool Button */}
              <button
                onClick={() => {
                  if (onConvertToTool) {
                    onConvertToTool({
                      name: selectedRequest.toolName,
                      category: selectedRequest.category,
                      description: selectedRequest.description,
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
