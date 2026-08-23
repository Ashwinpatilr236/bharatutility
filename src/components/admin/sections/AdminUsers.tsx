import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Mail,
  Calendar,
  Lock,
  Trash2,
  Edit2,
  RefreshCw,
  KeyRound,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AdminUser, AdminRole } from '../../../types/admin';
import { adminAuth } from '../../../services/adminAuthService';
import { adminStore } from '../../../services/adminStore';

const ROLE_BADGES: Record<AdminRole, { label: string; bg: string; text: string; border: string; desc: string }> = {
  super_admin: {
    label: 'Super Admin',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    desc: 'Unrestricted access to all tools, categories, ads, SEO, users, flags & settings.',
  },
  content_admin: {
    label: 'Content Admin',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    desc: 'Create and publish calculators, edit categories, SEO, announcements & view analytics.',
  },
  data_admin: {
    label: 'Data Admin',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    desc: 'Manage tax slabs, fuel prices, currency rates & dynamic datasets.',
  },
  support_admin: {
    label: 'Support Admin',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    desc: 'Review user tool requests, reply to contact inbox & handle citizen feedback.',
  },
  analyst: {
    label: 'Analyst / Viewer',
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-800',
    desc: 'Read-only access to analytics telemetry, search discovery & opportunity center.',
  },
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(adminAuth.getAllUsers());
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(adminAuth.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('content_admin');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended' | 'invited'>('active');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsub = adminAuth.subscribe(u => {
      setCurrentUser(u);
      setUsers(adminAuth.getAllUsers());
    });
    return unsub;
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleOpenInvite = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole('content_admin');
    setFormStatus('active');
    setIsInviteModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsInviteModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim()) {
      showNotification('error', 'Name and email are required.');
      return;
    }

    if (editingUser) {
      const updated: AdminUser = {
        ...editingUser,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        status: formStatus,
      };
      adminAuth.saveUser(updated);
      adminStore.logActivity('Admin User Updated', 'user', updated.name, `Role: ${updated.role} | Status: ${updated.status}`, updated.id);
      showNotification('success', `User ${updated.name} updated successfully.`);
    } else {
      const newUser: AdminUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        role: formRole,
        status: formStatus,
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      adminAuth.saveUser(newUser);
      adminStore.logActivity('Admin User Invited / Created', 'user', newUser.name, `Role: ${newUser.role}`, newUser.id);
      showNotification('success', `Admin profile created for ${newUser.name}. Authenticated via Supabase Auth.`);
    }

    setUsers(adminAuth.getAllUsers());
    setIsInviteModalOpen(false);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (currentUser?.id === userId) {
      showNotification('error', 'You cannot delete your own active administrator account.');
      return;
    }
    if (confirm(`Are you sure you want to revoke admin access for ${name}?`)) {
      adminAuth.deleteUser(userId);
      adminStore.logActivity('Admin User Revoked', 'user', name, 'User deleted from administration', userId);
      setUsers(adminAuth.getAllUsers());
      showNotification('success', `Admin account for ${name} removed.`);
    }
  };

  const handleSwitchActiveRole = (role: AdminRole) => {
    adminAuth.switchRole(role);
    showNotification('success', `Switched active preview role to: ${ROLE_BADGES[role].label}`);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6" id="admin-users-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Admin Users & RBAC Control</h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage team permissions, role-based access control, and administrator invitations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenInvite}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Admin</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800'
          }`}
        >
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Role Quick Tester Banner */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 p-4 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-white">
                Live RBAC Role Tester
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                You are currently previewing as{' '}
                <span className="font-bold text-neutral-900 dark:text-white">
                  {currentUser?.name} ({ROLE_BADGES[currentUser?.role || 'super_admin'].label})
                </span>
                . Switch roles to test restricted section gates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(ROLE_BADGES) as AdminRole[]).map(r => (
              <button
                key={r}
                onClick={() => handleSwitchActiveRole(r)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  currentUser?.role === r
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                {ROLE_BADGES[r].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search admins by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="super_admin">Super Admins</option>
            <option value="content_admin">Content Admins</option>
            <option value="data_admin">Data Admins</option>
            <option value="support_admin">Support Admins</option>
            <option value="analyst">Analysts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600 dark:text-neutral-400">
            <thead className="bg-neutral-50/80 dark:bg-neutral-800/50 text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-3.5">Administrator</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Active</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredUsers.map(user => {
                const roleConfig = ROLE_BADGES[user.role] || ROLE_BADGES.content_admin;
                const isSelf = currentUser?.id === user.id;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm uppercase shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>{user.name}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                            <Mail className="w-3 h-3" />
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {roleConfig.label}
                        </span>
                        <p className="text-[11px] text-neutral-400 max-w-xs leading-tight">
                          {roleConfig.desc}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : user.status === 'suspended'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active'
                              ? 'bg-emerald-500'
                              : user.status === 'suspended'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        />
                        <span className="capitalize">{user.status}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(user.lastActive).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                          title="Edit User Role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1.5 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                            title="Revoke Admin Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Matrix Overview */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-xs">
        <h2 className="text-base font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          Role-Based Access Control (RBAC) Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(ROLE_BADGES) as AdminRole[]).map(roleKey => {
            const role = ROLE_BADGES[roleKey];
            return (
              <div
                key={roleKey}
                className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${role.bg} ${role.text} ${role.border}`}
                  >
                    {role.label}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {users.filter(u => u.role === roleKey).length} active
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {role.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite / Edit Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                {editingUser ? 'Edit Administrator Permissions' : 'Invite New Administrator'}
              </h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Official Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@bharatutility.tools"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Assigned Administrative Role
                </label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as AdminRole)}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="super_admin">Super Admin (Full Platform Control)</option>
                  <option value="content_admin">Content Admin (Tools, Categories, SEO)</option>
                  <option value="data_admin">Data Admin (Fuel, Tax & Slabs)</option>
                  <option value="support_admin">Support Admin (Requests & Messages)</option>
                  <option value="analyst">Analyst (Metrics & Insights Viewer)</option>
                </select>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
                  {ROLE_BADGES[formRole].desc}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300">
                <p className="font-semibold mb-1">🔐 Managed via Supabase Authentication</p>
                <p className="text-[11px] leading-relaxed opacity-90">
                  Authentication credentials and password resets are managed directly by Supabase Auth service.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Account Status
                </label>
                <div className="flex items-center gap-3">
                  {(['active', 'invited', 'suspended'] as const).map(st => (
                    <label key={st} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input
                        type="radio"
                        name="accountStatus"
                        value={st}
                        checked={formStatus === st}
                        onChange={() => setFormStatus(st)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="capitalize">{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  {editingUser ? 'Save Changes' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
