import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Search,
  ExternalLink,
  Edit3,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';
import { SeoAuditIssue } from '../../../types/admin';

interface AdminSeoHealthProps {
  onOpenEditTool?: (toolId: string) => void;
  onNavigateSection?: (section: any) => void;
}

export const AdminSeoHealth: React.FC<AdminSeoHealthProps> = ({ onOpenEditTool, onNavigateSection }) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditTimestamp, setAuditTimestamp] = useState(new Date());

  const auditResult = adminStore.runSeoHealthAudit();

  const handleRerun = () => {
    setAuditTimestamp(new Date());
  };

  const filteredIssues = auditResult.issues.filter(issue => {
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    const matchesSearch =
      issue.pageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.pageUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.problem.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
              SEO Health & Rich Snippets Auditor
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider ${
                auditResult.overallStatus === 'good'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                  : auditResult.overallStatus === 'needs_attention'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
              }`}
            >
              {auditResult.overallStatus.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Automated crawler auditing meta tags, slug sanctity, duplicate titles, internal link meshes, and FAQ schema.
          </p>
        </div>

        <button
          onClick={handleRerun}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Re-run Full Audit</span>
        </button>
      </div>

      {/* Audit Score Card & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Health Score</div>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-0.5">
              {auditResult.score}<span className="text-sm font-normal text-neutral-400">/100</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-accent/10 text-accent">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">Critical Errors</div>
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
              {auditResult.issuesCount.critical}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">Warnings</div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
              {auditResult.issuesCount.warning}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">Optimization Info</div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
              {auditResult.issuesCount.info}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-600">
            <Info className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/60 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60">
          {(['all', 'critical', 'warning', 'info'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filterSeverity === sev
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {sev === 'all' ? 'All Issues' : sev}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter issues by tool name or path..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white"
          />
        </div>
      </div>

      {/* Issues Table / List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">All Clear! No SEO Issues Found</h3>
            <p className="text-xs text-neutral-500">Every page meets Indian civic SEO and schema standards.</p>
          </div>
        ) : (
          filteredIssues.map(issue => (
            <div
              key={issue.id}
              className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      issue.severity === 'critical'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30'
                        : issue.severity === 'warning'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30'
                    }`}
                  >
                    {issue.severity === 'critical' ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : issue.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900 dark:text-white">
                        {issue.pageTitle}
                      </span>
                      <span className="font-mono text-[11px] text-neutral-400">
                        {issue.pageUrl}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                      {issue.problem}
                    </p>

                    <p className="text-[11.5px] text-neutral-500 dark:text-neutral-400">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {issue.fixAction.type === 'edit_tool' && onOpenEditTool && (
                    <button
                      onClick={() => onOpenEditTool(issue.fixAction.targetId)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Fix in Tool Editor</span>
                    </button>
                  )}

                  {issue.fixAction.type === 'edit_seo' && onNavigateSection && (
                    <button
                      onClick={() => onNavigateSection('seo')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Configure Global SEO</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
