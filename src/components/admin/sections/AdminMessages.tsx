import React, { useState, useEffect, useMemo } from 'react';
import { ContactSubmission, ContactMessageStatus } from '../../../types';
import { adminStore } from '../../../services/adminStore';
import {
  MessageSquare,
  Search,
  Mail,
  Trash2,
  Reply,
  Copy,
  Check,
  Clock,
  User,
  RefreshCw,
  AlertCircle,
  Calendar,
  Tag
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; optionLabel: string }> = {
  new: {
    label: 'New',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300',
    optionLabel: '🟣 New',
  },
  read: {
    label: 'Read',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    optionLabel: '🔵 Read',
  },
  replied: {
    label: 'Replied',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    optionLabel: '🟢 Replied',
  },
  closed: {
    label: 'Closed',
    badgeClass: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    optionLabel: '⚪ Closed',
  },
  spam: {
    label: 'Spam',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
    optionLabel: '🔴 Spam',
  },
};

function normalizeStatus(status?: string): string {
  if (!status) return 'new';
  const s = status.toLowerCase().replace(/\s+/g, '_');
  return STATUS_CONFIG[s] ? s : 'new';
}

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    loadMessagesFromSupabase();
  }, []);

  const loadMessagesFromSupabase = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const data = await adminStore.fetchContactMessagesFromSupabase();
      setMessages(data);
      if (selectedMessage) {
        const fresh = data.find((m) => m.id === selectedMessage.id);
        if (fresh) setSelectedMessage(fresh);
      }
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load contact messages from Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const msgName = msg.name || '';
      const msgEmail = msg.email || '';
      const msgSubject = msg.subject || '';
      const msgBody = msg.message || '';

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = msgName.toLowerCase().includes(q);
        const matchesEmail = msgEmail.toLowerCase().includes(q);
        const matchesSubject = msgSubject.toLowerCase().includes(q);
        const matchesBody = msgBody.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSubject && !matchesBody) return false;
      }

      const norm = normalizeStatus(msg.status);
      if (statusFilter !== 'all' && norm !== statusFilter) return false;

      return true;
    });
  }, [messages, searchQuery, statusFilter]);

  const handleStatusChange = async (msg: ContactSubmission, newStatus: string) => {
    const updated: ContactSubmission = {
      ...msg,
      status: newStatus as ContactMessageStatus,
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage(updated);
    }
    await adminStore.updateContactMessageStatus(msg.id, newStatus);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this contact message?')) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      await adminStore.deleteContactMessage(id);
    }
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-teal-500" /> Contact Inquiries & Support
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Incoming citizen inquiries, support requests, and feedback stored in Supabase public.contact_messages.
          </p>
        </div>

        <button
          onClick={loadMessagesFromSupabase}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Syncing...' : 'Refresh from Supabase'}</span>
        </button>
      </div>

      {/* Error Alert State */}
      {fetchError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold">Failed to load messages from Supabase</h3>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={loadMessagesFromSupabase}
            className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors self-start sm:self-auto"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages by sender name, email, subject, or content..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
        >
          <option value="all">All Statuses ({messages.length})</option>
          <option value="new">🟣 New ({messages.filter((m) => normalizeStatus(m.status) === 'new').length})</option>
          <option value="read">🔵 Read ({messages.filter((m) => normalizeStatus(m.status) === 'read').length})</option>
          <option value="replied">🟢 Replied ({messages.filter((m) => normalizeStatus(m.status) === 'replied').length})</option>
          <option value="closed">⚪ Closed ({messages.filter((m) => normalizeStatus(m.status) === 'closed').length})</option>
          <option value="spam">🔴 Spam ({messages.filter((m) => normalizeStatus(m.status) === 'spam').length})</option>
        </select>
      </div>

      {/* Two Column Layout: Messages List & Detail Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 flex justify-between items-center text-xs font-semibold">
            <span>Inbox ({messages.length})</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 max-h-[580px] overflow-y-auto">
            {isLoading ? (
              <div className="p-10 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                <span>Loading messages...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-10 text-center text-xs text-neutral-400 font-medium">
                {messages.length === 0 ? 'No messages yet.' : 'No messages matching query.'}
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const norm = normalizeStatus(msg.status);
                const cfg = STATUS_CONFIG[norm] || STATUS_CONFIG.new;

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 cursor-pointer transition-colors ${
                      isSelected ? 'bg-accent/5 border-l-2 border-accent' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        {msg.name || 'Anonymous'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 line-clamp-1 mt-0.5">
                      {msg.subject || 'General Inquiry'}
                    </span>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                      {msg.message}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-1.5">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(msg.created_at || msg.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Detail Reader (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          {selectedMessage ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {selectedMessage.subject || 'Inquiry'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-500">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {selectedMessage.name || 'Anonymous'}
                    </span>
                    <span>&lt;{selectedMessage.email}&gt;</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(selectedMessage.created_at || selectedMessage.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyEmail(selectedMessage.email)}
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Copy Email Address"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700">
                <span className="text-[11px] font-bold text-neutral-500 block mb-1">Message Content:</span>
                <p className="text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Status Update Control */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Status:</span>
                  <select
                    value={normalizeStatus(selectedMessage.status)}
                    onChange={(e) => handleStatusChange(selectedMessage, e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold outline-hidden cursor-pointer"
                  >
                    <option value="new">🟣 New</option>
                    <option value="read">🔵 Read</option>
                    <option value="replied">🟢 Replied</option>
                    <option value="closed">⚪ Closed</option>
                    <option value="spam">🔴 Spam</option>
                  </select>
                </div>

                {/* Reply via email client */}
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || 'Your message to BharatUtility'
                  )}`}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors shadow-xs"
                >
                  <Reply className="w-3.5 h-3.5" /> Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-neutral-400">
              Select a message from the inbox to read the submission.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
