import React, { useState, useMemo } from 'react';
import { ContactSubmission } from '../../../types';
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
  CheckCircle2
} from 'lucide-react';

export const AdminMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactSubmission[]>(adminStore.getContactMessages());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleRefresh = () => {
    setMessages([...adminStore.getContactMessages()]);
  };

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = msg.name.toLowerCase().includes(q);
        const matchesEmail = msg.email.toLowerCase().includes(q);
        const matchesSubject = msg.subject?.toLowerCase().includes(q) || false;
        const matchesBody = msg.message.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesSubject && !matchesBody) return false;
      }
      return true;
    });
  }, [messages, searchQuery]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this message?')) {
      adminStore.deleteContactMessage(id);
      handleRefresh();
      if (selectedMessage?.id === id) setSelectedMessage(null);
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
            Incoming inquiries, partnership proposals, and user feedback.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages by sender name, email, or subject..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
          />
        </div>
      </div>

      {/* Two Column Layout: Messages List & Detail Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
          <div className="p-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50 flex justify-between items-center text-xs font-semibold">
            <span>Inbox ({messages.length})</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 max-h-[580px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-400">
                No contact submissions found.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
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
                        {msg.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 line-clamp-1 mt-0.5">
                      {msg.subject || 'General Inquiry'}
                    </span>

                    <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                      {msg.message}
                    </p>
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
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {selectedMessage.name}
                    </span>
                    <span>&lt;{selectedMessage.email}&gt;</span>
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

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700">
                <p className="text-xs leading-relaxed text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Reply via email client */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                    selectedMessage.subject || 'Your message to BharatUtility'
                  )}`}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-xs"
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
