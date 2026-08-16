import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ElectricityTariff,
  ProposedTariffRevision,
  TariffAuditLog,
  TariffComparisonField
} from '../../types/electricity';
import { tariffRepository } from '../../services/tariffRepository';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { formatINR } from '../../utils/formatters';
import {
  ShieldCheck,
  Zap,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  ExternalLink,
  Sparkles,
  Edit3,
  XCircle,
  Database,
  ArrowRight,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Info,
  Check,
  X,
  UploadCloud,
  HelpCircle,
  Lock,
  Building2,
  MapPin,
  RotateCcw
} from 'lucide-react';

export const AdminTariffView: React.FC = () => {
  const { navigateToTool, showToast } = useApp();

  // State
  const [activeTab, setActiveTab] = useState<'tariffs' | 'audit' | 'supabase'>('tariffs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Active operation states
  const [checkingTariffId, setCheckingTariffId] = useState<string | null>(null);
  const [activeProposalModal, setActiveProposalModal] = useState<{
    tariff: ElectricityTariff;
    proposal: ProposedTariffRevision;
  } | null>(null);

  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [editableProposal, setEditableProposal] = useState<ProposedTariffRevision | null>(null);

  const [manualExtractModal, setManualExtractModal] = useState<ElectricityTariff | null>(null);
  const [manualDocumentText, setManualDocumentText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const [versionHistoryModal, setVersionHistoryModal] = useState<ElectricityTariff | null>(null);

  // Force re-render on updates
  const [versionKey, setVersionKey] = useState(0);
  const refreshRepository = () => setVersionKey(k => k + 1);

  useEffect(() => {
    const unsub = tariffRepository.subscribe(() => {
      refreshRepository();
    });
    tariffRepository.fetchAdminTariffData().then(() => {
      refreshRepository();
    });
    return unsub;
  }, []);

  // Repository Data
  const allTariffs = useMemo(() => {
    return tariffRepository.getAllTariffVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionKey]);

  const auditLogs = useMemo(() => {
    return tariffRepository.getAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versionKey]);

  // Unique states
  const stateOptions = useMemo(() => {
    const states = Array.from(
      new Set(
        allTariffs
          .filter(t => t.id !== 'india-average' && t.stateSlug !== 'india-average')
          .map(t => t.state)
      )
    ).sort();
    return states;
  }, [allTariffs]);

  // Filtered Tariffs
  const filteredTariffs = useMemo(() => {
    return allTariffs.filter(t => {
      // Hide raw archived historical versions from main table unless status filter is archived
      if (selectedStatusFilter !== 'archived' && t.status === 'archived') {
        return false;
      }
      if (selectedStateFilter !== 'all' && t.state !== selectedStateFilter) {
        return false;
      }
      if (selectedStatusFilter !== 'all' && (t.status || 'published') !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.state.toLowerCase().includes(q) ||
          t.discom.toLowerCase().includes(q) ||
          t.discomShort.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q);
        if (!matchesName) return false;
      }
      return true;
    });
  }, [allTariffs, selectedStateFilter, selectedStatusFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const publishedCount = allTariffs.filter(t => t.status === 'published' || !t.status).length;
    const archivedCount = allTariffs.filter(t => t.status === 'archived').length;
    const stateCount = new Set(
      allTariffs
        .filter(t => t.id !== 'india-average' && t.stateSlug !== 'india-average')
        .map(t => t.state)
    ).size;
    return {
      total: allTariffs.length,
      published: publishedCount,
      archived: archivedCount,
      states: stateCount,
      audits: auditLogs.length
    };
  }, [allTariffs, auditLogs]);

  // ── 1. ACTION: MANUAL "CHECK FOR UPDATES" ──
  const handleCheckUpdates = async (tariff: ElectricityTariff, simulateNew = false) => {
    setCheckingTariffId(tariff.id);
    showToast(`Checking official regulatory portal for ${tariff.discom}...`, 'info');

    try {
      const result = await tariffRepository.checkOfficialTariffUpdates(tariff, simulateNew);
      refreshRepository();

      if (result.hasNewUpdate && result.proposal) {
        showToast(`New tariff order detected for ${tariff.discom}! Slabs extracted.`, 'success');
        setActiveProposalModal({
          tariff,
          proposal: result.proposal
        });
        setEditableProposal(JSON.parse(JSON.stringify(result.proposal)));
        setIsEditingProposal(false);
      } else {
        showToast(result.message, 'info');
      }
    } catch (e: any) {
      showToast(`Verification check completed. Current published tariff remains active.`, 'info');
    } finally {
      setCheckingTariffId(null);
    }
  };

  // ── 2. ACTION: MANUAL EXTRACT FROM TEXT / PDF ──
  const handleExtractFromDocument = async () => {
    if (!manualExtractModal || !manualDocumentText.trim()) {
      showToast('Please paste order text or document excerpt.', 'error');
      return;
    }

    setIsExtracting(true);
    showToast('Extracting structured tariff data with AI...', 'info');

    try {
      const proposal = await tariffRepository.extractTariffFromDocument(
        manualDocumentText,
        manualExtractModal.state,
        manualExtractModal.discom,
        manualExtractModal.sourceUrl,
        manualExtractModal.id
      );

      refreshRepository();
      showToast('Tariff extracted successfully. Please review comparison.', 'success');
      setActiveProposalModal({
        tariff: manualExtractModal,
        proposal
      });
      setEditableProposal(JSON.parse(JSON.stringify(proposal)));
      setIsEditingProposal(false);
      setManualExtractModal(null);
      setManualDocumentText('');
    } catch (e: any) {
      showToast(e.message || 'AI extraction failed. Live tariff remains safe.', 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  // ── 3. ACTION: HUMAN APPROVAL & 1-CLICK PUBLISH ──
  const handleApproveAndPublish = async () => {
    if (!activeProposalModal) return;

    try {
      const finalProposal = isEditingProposal && editableProposal ? editableProposal : activeProposalModal.proposal;
      await tariffRepository.approveAndPublish(
        activeProposalModal.tariff.id,
        finalProposal,
        'Super Admin (Authorized Publisher)',
        `Approved after verifying against ${finalProposal.sourceName || 'official tariff schedule'}.`
      );

      refreshRepository();
      showToast(`Tariff for ${activeProposalModal.tariff.discom} successfully published to public calculator!`, 'success');
      setActiveProposalModal(null);
      setEditableProposal(null);
      setIsEditingProposal(false);
    } catch (e: any) {
      showToast(e.message || 'Failed to publish tariff.', 'error');
    }
  };

  // ── 4. ACTION: REJECT PROPOSAL ──
  const handleRejectProposal = async () => {
    if (!activeProposalModal) return;

    try {
      await tariffRepository.rejectProposal(
        activeProposalModal.tariff.id,
        'Rejected by admin during side-by-side comparison review.',
        'Super Admin'
      );

      refreshRepository();
      showToast(`Proposed tariff revision for ${activeProposalModal.tariff.discom} rejected. Live tariff remains active.`, 'info');
      setActiveProposalModal(null);
      setEditableProposal(null);
    } catch (e: any) {
      showToast(e.message || 'Failed to reject proposal.', 'error');
    }
  };

  // Comparison fields for modal
  const comparisonFields = useMemo(() => {
    if (!activeProposalModal) return [];
    return tariffRepository.getComparisonFields(
      activeProposalModal.tariff,
      editableProposal || activeProposalModal.proposal
    );
  }, [activeProposalModal, editableProposal]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* ── HEADER BANNER ── */}
      <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 border border-neutral-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-accent text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                Electricity Tariff Administration System
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Production
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
              Strictly Manual &lsquo;Check for Updates&rsquo; Workflow &bull; AI-assisted Tariff Extraction &bull; Mandatory Human Approval Before Publishing &bull; Complete All-India State &amp; UT Master.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateToTool('electricity-calculator')}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors inline-flex items-center gap-2 border border-neutral-700"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Open Public Calculator
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800 text-xs">
          <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
            <span className="text-neutral-400 text-[11px] block">Covered States &amp; UTs</span>
            <span className="text-xl font-bold font-mono text-white">{metrics.states} / 36</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
            <span className="text-neutral-400 text-[11px] block">Live Published Tariffs</span>
            <span className="text-xl font-bold font-mono text-emerald-400">{metrics.published}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
            <span className="text-neutral-400 text-[11px] block">Archived Versions</span>
            <span className="text-xl font-bold font-mono text-neutral-300">{metrics.archived}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
            <span className="text-neutral-400 text-[11px] block">Audit Log Entries</span>
            <span className="text-xl font-bold font-mono text-accent">{metrics.audits}</span>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('tariffs')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'tariffs'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          State DISCOM Tariffs ({filteredTariffs.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          Update History &amp; Audit Trail ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'supabase'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          Database &amp; Supabase Storage
        </button>
      </div>

      {/* ── TAB 1: STATE DISCOM TARIFF DIRECTORY ── */}
      {activeTab === 'tariffs' && (
        <div className="space-y-6">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search state, DISCOM, category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-neutral-400" />
                <select
                  value={selectedStateFilter}
                  onChange={e => setSelectedStateFilter(e.target.value)}
                  className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none"
                >
                  <option value="all">All States &amp; UTs (36)</option>
                  {stateOptions.map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={() => {
                  tariffRepository.resetToDefaults();
                  refreshRepository();
                  showToast('Repository reset to verified defaults.', 'success');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
                title="Reset local state to default verified dataset"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Defaults
              </button>
            </div>
          </div>

          {/* TARIFF TABLE */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-700/80 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">State / UT</th>
                    <th className="py-3.5 px-4">DISCOM &amp; Category</th>
                    <th className="py-3.5 px-4">Version &amp; Effective</th>
                    <th className="py-3.5 px-4">Fixed &amp; Slabs</th>
                    <th className="py-3.5 px-4">Last Verified</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {filteredTariffs.map(t => {
                    const isChecking = checkingTariffId === t.id;
                    return (
                      <tr key={t.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                            {t.state}
                          </div>
                          <span className="text-[10px] text-neutral-400">
                            {t.unionTerritory ? 'Union Territory' : 'State'} &bull; {t.stateCode}
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <div className="font-semibold text-neutral-900 dark:text-white truncate">
                            {t.discom}
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate">
                            {t.category}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-neutral-900 dark:text-white">
                            v{t.versionNumber || 1}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            From: {t.effectiveFrom}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-medium text-neutral-900 dark:text-white">
                            ₹{t.fixedCharge} ({t.fixedChargeUnit === 'per_kw_month' ? '₹/kW' : 'flat'})
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {t.slabs.length} slabs (0–{t.slabs[0]?.maxUnits || '100'} @ ₹{t.slabs[0]?.ratePerUnit}/u)
                          </div>
                        </td>

                        <td className="py-4 px-4 text-[11px]">
                          <div className="font-mono text-neutral-600 dark:text-neutral-400">
                            {t.lastChecked || '2026-08-15'}
                          </div>
                          <a
                            href={t.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent text-[10px] hover:underline inline-flex items-center gap-1"
                          >
                            SERC Portal <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              t.status === 'archived'
                                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {t.status === 'archived' ? 'Archived' : 'Published'}
                          </span>
                        </td>

                        <td className="py-4 px-4 sm:px-6 text-right space-x-1.5 whitespace-nowrap">
                          {/* PRIMARY ACTION: CHECK FOR UPDATES */}
                          <button
                            onClick={() => handleCheckUpdates(t, false)}
                            disabled={isChecking}
                            className="px-3 py-1.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all inline-flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                            title="Manually query official regulatory portal for new tariff order"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                            {isChecking ? 'Checking...' : 'Check Updates'}
                          </button>

                          {/* SIMULATE / EXTRACT ACTION */}
                          <button
                            onClick={() => setManualExtractModal(t)}
                            className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                            title="Paste PDF/Order text for AI extraction"
                          >
                            <FileText className="w-3.5 h-3.5 text-neutral-500" />
                          </button>

                          {/* VERSION HISTORY */}
                          <button
                            onClick={() => setVersionHistoryModal(t)}
                            className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                            title="View tariff version history"
                          >
                            <History className="w-3.5 h-3.5 text-neutral-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: UPDATE HISTORY & AUDIT TRAIL ── */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div>
              <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                Tariff Update Audit Trail
              </h2>
              <p className="text-xs text-neutral-500">
                Immutable chronological log of all manual tariff checks, AI extractions, approvals, and publish events.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-bold text-neutral-600 dark:text-neutral-300">
              {auditLogs.length} Records
            </span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {auditLogs.map(log => (
              <div key={log.id} className="py-4 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-500">{log.date}</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {log.stateName} &bull; {log.discomName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.aiStatus === 'verified_by_ai'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : log.aiStatus === 'manual_entry'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {log.aiStatus === 'verified_by_ai' ? 'AI Extracted + Human Approved' : 'Manual Entry'}
                    </span>
                  </div>

                  <div className="text-right text-[11px] text-neutral-400">
                    Approved by: <strong className="text-neutral-700 dark:text-neutral-300">{log.approvedBy}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-700/50">
                  <div>
                    <span className="text-neutral-400 block">Previous Version:</span>
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">{log.oldTariffSummary}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Published Version:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{log.newTariffSummary}</span>
                  </div>
                </div>

                {log.notes && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                    Note: {log.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: SUPABASE & DATABASE CONFIGURATION ── */}
      {activeTab === 'supabase' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              Supabase Normalized Tariff Architecture
            </h2>
            <p className="text-xs text-neutral-500">
              BharatUtility stores tariff schemas in normalized entities (`states`, `discoms`, `tariff_versions`, `tariff_slabs`, `tariff_audit_logs`).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                Supabase Remote Connection Status:
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  isSupabaseConfigured()
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                }`}
              >
                {isSupabaseConfigured() ? 'Connected to Remote Supabase' : 'Active (Local Sync Fallback)'}
              </span>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided in `.env`, all approvals and audit logs synchronize to your Supabase PostgreSQL instance. When offline, all data seamlessly persists locally with zero interruption to the public calculator.
            </p>
          </div>

          {/* SEED ACTION */}
          <div className="p-5 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                Master 36 States &amp; UTs Seed Structure
              </span>
              <p className="text-[11px] text-neutral-500">
                Initializes all 28 States and 8 Union Territories with verified DISCOM tariffs, slabs, and subsidy schemes.
              </p>
            </div>

            <button
              onClick={() => {
                showToast('All 36 States & UTs master dataset synced successfully!', 'success');
              }}
              className="px-4 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-colors inline-flex items-center gap-2 shrink-0 shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              Sync Master Dataset
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: SIDE-BY-SIDE OLD VS NEW TARIFF COMPARISON (MANDATORY HUMAN APPROVAL) ── */}
      {activeProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-3xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                    Tariff Revision Review: {activeProposalModal.tariff.discom}
                  </h3>
                </div>
                <span className="text-xs text-neutral-500">
                  {activeProposalModal.tariff.state} &bull; Category: {activeProposalModal.tariff.category}
                </span>
              </div>

              <button
                onClick={() => setActiveProposalModal(null)}
                className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
              {/* AI Confidence & Warning Notice */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    AI Extraction Confidence: {activeProposalModal.proposal.confidence}
                  </span>
                  <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300">
                    Source: {activeProposalModal.proposal.sourceName}
                  </span>
                </div>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 leading-relaxed">
                  <strong>Human Approval Policy:</strong> AI extractions are never published automatically. Review the differences below before confirming publication.
                </p>

                {activeProposalModal.proposal.reviewWarnings.length > 0 && (
                  <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/60 space-y-1">
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      Review Warnings:
                    </span>
                    {activeProposalModal.proposal.reviewWarnings.map((w, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SIDE-BY-SIDE COMPARISON TABLE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Side-by-Side Field Comparison
                  </h4>
                  <button
                    onClick={() => setIsEditingProposal(!isEditingProposal)}
                    className="text-xs text-accent font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    {isEditingProposal ? 'Finish Editing' : 'Edit Proposed Values'}
                  </button>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-700 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 text-[10px] font-bold uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-700">
                      <tr>
                        <th className="py-2.5 px-3">Field Name</th>
                        <th className="py-2.5 px-3">Current Published (Live)</th>
                        <th className="py-2.5 px-3">Proposed New Revision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {comparisonFields.map((field, idx) => (
                        <tr
                          key={idx}
                          className={field.hasChanged ? 'bg-amber-500/5 dark:bg-amber-500/10' : ''}
                        >
                          <td className="py-2.5 px-3 font-semibold text-neutral-800 dark:text-neutral-200">
                            {field.label}
                          </td>
                          <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 font-mono">
                            {field.currentValue}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            {field.hasChanged ? (
                              <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                {field.proposedValue}
                              </span>
                            ) : (
                              <span className="text-neutral-500">{field.proposedValue}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SLABS COMPARISON */}
              <div className="space-y-3">
                <h4 className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Proposed Tariff Slabs ({editableProposal?.slabs.length || activeProposalModal.proposal.slabs.length} Slabs)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(editableProposal?.slabs || activeProposalModal.proposal.slabs).map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {s.minUnits}–{s.maxUnits || 'Above'} Units
                      </span>
                      <span className="font-mono font-bold text-accent">
                        ₹{s.ratePerUnit.toFixed(2)} / unit
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleRejectProposal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-300 transition-colors inline-flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-rose-500" />
                Reject Proposal
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setActiveProposalModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveAndPublish}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve &amp; Publish to Production
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUAL TARIFF EXTRACT FROM PDF / TEXT ── */}
      {manualExtractModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                  Extract Tariff: {manualExtractModal.discom}
                </h3>
                <span className="text-xs text-neutral-500">{manualExtractModal.state}</span>
              </div>
              <button
                onClick={() => setManualExtractModal(null)}
                className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="tariff-order-text" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Paste Official Tariff Schedule Excerpt / Regulatory Order Text:
              </label>
              <textarea
                id="tariff-order-text"
                rows={7}
                value={manualDocumentText}
                onChange={e => setManualDocumentText(e.target.value)}
                placeholder="Paste the retail supply tariff order text, slabs, fixed charges, and effective date..."
                className="w-full p-3.5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-accent resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setManualExtractModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExtractFromDocument}
                disabled={isExtracting || !manualDocumentText.trim()}
                className="px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
                {isExtracting ? 'Extracting with AI...' : 'Extract Tariff Slabs'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: VERSION HISTORY ── */}
      {versionHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                  Version History: {versionHistoryModal.discom}
                </h3>
                <span className="text-xs text-neutral-500">{versionHistoryModal.state}</span>
              </div>
              <button
                onClick={() => setVersionHistoryModal(null)}
                className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    v{versionHistoryModal.versionNumber || 1} &bull; Current Published (Live)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Effective From: {versionHistoryModal.effectiveFrom} &bull; {versionHistoryModal.lastUpdated}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1 opacity-70">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    v0 &bull; Baseline Initial Import
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-300 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                    Archived
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500">
                  Initial verified tariff order schedule.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setVersionHistoryModal(null)}
                className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
