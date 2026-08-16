import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ElectricityTariff,
  ProposedTariffRevision,
  TariffAuditLog,
  TariffSlab
} from '../../types/electricity';
import {
  tariffRepository,
  TariffValidationResult,
  TariffValidationIssue
} from '../../services/tariffRepository';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import {
  ShieldCheck,
  Zap,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  ExternalLink,
  Edit3,
  Database,
  Clock,
  Check,
  X,
  UploadCloud,
  Building2,
  Plus,
  FileCode,
  Sliders,
  Trash2,
  FileCheck2,
  XCircle,
  HelpCircle
} from 'lucide-react';

export const AdminTariffView: React.FC = () => {
  const { navigateToTool, showToast } = useApp();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'tariffs' | 'audit' | 'supabase'>('tariffs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Manual Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importState, setImportState] = useState('Gujarat');
  const [importDiscom, setImportDiscom] = useState('MGVCL');
  const [importCategory, setImportCategory] = useState('Domestic (LT-1 Residential)');
  const [importJsonText, setImportJsonText] = useState('');
  const [validationResult, setValidationResult] = useState<TariffValidationResult | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Edit / Preview Workbench State
  const [previewProposal, setPreviewProposal] = useState<ProposedTariffRevision | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [targetTariffId, setTargetTariffId] = useState<string>('');

  // Version history modal
  const [versionHistoryModal, setVersionHistoryModal] = useState<ElectricityTariff | null>(null);

  // Force re-render key
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

  // Unique 36 States & UTs (excluding national benchmark)
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
        const matchesName =
          t.state.toLowerCase().includes(q) ||
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

  // ── OPEN IMPORT MODAL ──
  const handleOpenImport = (tariff?: ElectricityTariff) => {
    if (tariff) {
      setImportState(tariff.state);
      setImportDiscom(tariff.discom);
      setImportCategory(tariff.category);
      setTargetTariffId(tariff.id);
      setImportJsonText(
        JSON.stringify(
          {
            state: tariff.state,
            discom: tariff.discom,
            consumerCategory: tariff.category,
            tariffName: `${tariff.source} Order (${tariff.effectiveFrom})`,
            effectiveFrom: tariff.effectiveFrom || '2026-04-01',
            fixedCharge: tariff.fixedCharge,
            fixedChargeUnit: tariff.fixedChargeUnit,
            dutyRate: tariff.dutyRate,
            dutyType: tariff.dutyType,
            fuelAdjustmentRate: tariff.fuelAdjustmentChargePerUnit || 0,
            slabs: tariff.slabs,
            subsidy: tariff.subsidy,
            source: tariff.source,
            sourceUrl: tariff.sourceUrl,
            notes: tariff.notes || 'Verified against official SERC retail tariff order schedule.'
          },
          null,
          2
        )
      );
    } else {
      setImportState(stateOptions[0] || 'Gujarat');
      setImportDiscom('MGVCL');
      setImportCategory('Domestic (LT-1 Residential)');
      setTargetTariffId('');
      setImportJsonText(tariffRepository.getSampleTariffJson('Gujarat', 'MGVCL'));
    }
    setValidationResult(null);
    setIsValidated(false);
    setPreviewProposal(null);
    setIsImportModalOpen(true);
  };

  // ── UNIFIED VALIDATE JSON ACTION ──
  const handleValidateJson = () => {
    setIsValidating(true);
    try {
      const result = tariffRepository.validateTariffImport(
        importJsonText,
        importState,
        importDiscom,
        importCategory
      );

      setValidationResult(result);
      setIsValidated(result.isValid);

      if (result.isValid && result.parsedProposal) {
        setPreviewProposal(result.parsedProposal);
        showToast('Tariff JSON validated successfully! Preview ready.', 'success');
      } else {
        setPreviewProposal(null);
        showToast(`Validation failed: ${result.errors.length} issue(s) detected.`, 'error');
      }
    } catch (err: any) {
      const fallbackResult: TariffValidationResult = {
        isValid: false,
        errors: [{ category: 'JSON Syntax', message: err.message || 'Fatal parser error.' }]
      };
      setValidationResult(fallbackResult);
      setIsValidated(false);
      setPreviewProposal(null);
      showToast('Invalid JSON syntax. Please check formatted string.', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  // ── AUTO-FORMAT & CLEAN JSON ──
  const handleAutoFormatJson = () => {
    if (!importJsonText.trim()) return;
    try {
      let rawText = importJsonText.trim();
      if (rawText.includes('```')) {
        const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
        if (fenceMatch && fenceMatch[1]) rawText = fenceMatch[1].trim();
        else rawText = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
      }
      const firstBrace = rawText.indexOf('{');
      const lastBrace = rawText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        rawText = rawText.substring(firstBrace, lastBrace + 1);
      }
      const sanitized = rawText.replace(/,\s*([\]}])/g, '$1');
      const parsed = JSON.parse(sanitized);
      setImportJsonText(JSON.stringify(parsed, null, 2));
      showToast('JSON formatted and cleaned successfully!', 'info');
      // Trigger validation
      const result = tariffRepository.validateTariffImport(
        JSON.stringify(parsed),
        importState,
        importDiscom,
        importCategory
      );
      setValidationResult(result);
      setIsValidated(result.isValid);
      if (result.isValid && result.parsedProposal) {
        setPreviewProposal(result.parsedProposal);
      }
    } catch (e: any) {
      showToast('Could not auto-format. Please ensure opening { and closing } exist.', 'error');
    }
  };

  // ── FILE UPLOAD (Uses same validation pipeline) ──
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = (event.target?.result as string) || '';
      setImportJsonText(content);
      // Auto-validate upon upload
      const result = tariffRepository.validateTariffImport(
        content,
        importState,
        importDiscom,
        importCategory
      );
      setValidationResult(result);
      setIsValidated(result.isValid);
      if (result.isValid && result.parsedProposal) {
        setPreviewProposal(result.parsedProposal);
        showToast('Uploaded JSON validated successfully!', 'success');
      } else {
        setPreviewProposal(null);
        showToast(`Uploaded JSON has ${result.errors.length} error(s).`, 'error');
      }
    };
    reader.readAsText(file);
  };

  // ── INLINE EDITORS FOR PREVIEW PROPOSAL ──
  const handleUpdateSlab = (index: number, field: keyof TariffSlab, value: any) => {
    if (!previewProposal) return;
    const newSlabs = [...previewProposal.slabs];
    newSlabs[index] = { ...newSlabs[index], [field]: value };
    setPreviewProposal({ ...previewProposal, slabs: newSlabs });
  };

  const handleAddSlab = () => {
    if (!previewProposal) return;
    const lastSlab = previewProposal.slabs[previewProposal.slabs.length - 1];
    const newMin = lastSlab ? (lastSlab.maxUnits || lastSlab.minUnits) + 1 : 0;
    const newSlab: TariffSlab = {
      id: `slab_${previewProposal.slabs.length + 1}`,
      minUnits: newMin,
      maxUnits: null,
      ratePerUnit: 5.0,
      label: `${newMin}+ Units`,
      name: `${newMin}+ Units`
    };
    setPreviewProposal({
      ...previewProposal,
      slabs: [...previewProposal.slabs, newSlab]
    });
  };

  const handleRemoveSlab = (index: number) => {
    if (!previewProposal || previewProposal.slabs.length <= 1) return;
    const newSlabs = previewProposal.slabs.filter((_, i) => i !== index);
    setPreviewProposal({ ...previewProposal, slabs: newSlabs });
  };

  // ── ACTION: PUBLISH DIRECTLY TO SUPABASE & PUBLIC CALCULATOR ──
  const handlePublishTariff = async () => {
    // 1. Mandatory pre-publish validation safety check
    if (!previewProposal || !isValidated) {
      showToast('Validation required before publishing.', 'error');
      return;
    }

    // Re-verify payload validity before DB write
    if (
      !previewProposal.stateName ||
      !previewProposal.discomName ||
      previewProposal.slabs.length === 0 ||
      previewProposal.slabs.some(s => isNaN(s.ratePerUnit) || s.ratePerUnit < 0)
    ) {
      showToast('Cannot publish: Tariff payload has invalid rates or missing fields.', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      const tariffId = targetTariffId || previewProposal.discomId;
      await tariffRepository.approveAndPublish(
        tariffId,
        previewProposal,
        'Super Admin (Authorized Publisher)',
        previewProposal.notes || `Published after manual verification against ${previewProposal.sourceName || 'official tariff order'}.`
      );

      refreshRepository();
      showToast(
        `Tariff for ${previewProposal.discomName} (${previewProposal.stateName}) published to Supabase & Live Calculator!`,
        'success'
      );
      setIsImportModalOpen(false);
      setPreviewProposal(null);
      setValidationResult(null);
      setIsValidated(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to publish tariff to Supabase.', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Helper to group validation errors by category
  const groupedErrors = useMemo(() => {
    if (!validationResult || validationResult.isValid) return {};
    const groups: Record<string, string[]> = {};
    validationResult.errors.forEach(issue => {
      const cat = issue.category || 'General Errors';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(issue.message);
    });
    return groups;
  }, [validationResult]);

  return (
    <div className="space-y-6">
      {/* ── HEADER & SUMMARY STATS ── */}
      <div className="bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Zap className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                Electricity Tariff Master Management
              </h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
              Manual Tariff Import &bull; Strict Validation Engine &bull; Side-by-Side Preview &bull; Single-Click Supabase Publishing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenImport()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add / Update Tariff
            </button>
            <button
              onClick={() => navigateToTool('electricity-calculator')}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors inline-flex items-center gap-2 border border-neutral-700 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              Open Calculator
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
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
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
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          Audit Trail &amp; Update History ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('supabase')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'supabase'
              ? 'border-accent text-accent'
              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          Database Connection
        </button>
      </div>

      {/* ── TAB 1: STATE DISCOM TARIFFS TABLE ── */}
      {activeTab === 'tariffs' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search state, DISCOM, category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              {/* State Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[11px] font-semibold">State:</span>
                <select
                  value={selectedStateFilter}
                  onChange={e => setSelectedStateFilter(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white outline-none"
                >
                  <option value="all">All States &amp; UTs ({stateOptions.length})</option>
                  {stateOptions.map(st => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[11px] font-semibold">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={e => setSelectedStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published (Live)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                    <th className="py-3 px-4">State &amp; DISCOM</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">First Slab Rate</th>
                    <th className="py-3 px-4">Fixed Charge</th>
                    <th className="py-3 px-4">Duty / Tax</th>
                    <th className="py-3 px-4">Status &amp; Ver</th>
                    <th className="py-3 px-4">Effective Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredTariffs.map(tariff => {
                    const isArchived = tariff.status === 'archived';
                    const firstSlab = tariff.slabs[0];
                    return (
                      <tr
                        key={tariff.id}
                        className={`hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors ${
                          isArchived ? 'opacity-60 bg-neutral-50/30 dark:bg-neutral-900/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span>{tariff.state}</span>
                            {tariff.unionTerritory && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                                UT
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                            {tariff.discom}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300 font-medium">
                          {tariff.category}
                        </td>
                        <td className="py-3 px-4">
                          {firstSlab ? (
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{firstSlab.ratePerUnit.toFixed(2)}/unit
                            </span>
                          ) : (
                            <span className="text-neutral-400">N/A</span>
                          )}
                          <span className="text-[10px] text-neutral-400 block">
                            {tariff.slabs.length} Total Slabs
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-700 dark:text-neutral-300 font-medium">
                          ₹{tariff.fixedCharge}/{tariff.fixedChargeUnit === 'per_kw_month' ? 'kW/mo' : 'mo'}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-700 dark:text-neutral-300 font-medium">
                          {tariff.dutyRate}
                          {tariff.dutyType === 'percentage' ? '%' : ' ₹/u'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tariff.status === 'archived'
                                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {tariff.status === 'archived' ? 'Archived' : 'Published'}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              v{tariff.versionNumber || 1}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-500 dark:text-neutral-400 text-[11px] font-mono">
                          {tariff.effectiveFrom || '2024-04-01'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenImport(tariff)}
                              className="px-3 py-1.5 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Update tariff data via JSON import"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              Update Tariff
                            </button>
                            <button
                              onClick={() => setVersionHistoryModal(tariff)}
                              className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                              title="View version history"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* ── TAB 2: AUDIT TRAIL ── */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                Immutable Tariff Regulatory Audit Trail
              </h2>
              <p className="text-xs text-neutral-500">
                Logged directly into Supabase `public.tariff_audit_logs` on each tariff approval.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-400">
              {auditLogs.length} Total Logs
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
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      Manual Verified
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

      {/* ── TAB 3: SUPABASE CONFIGURATION ── */}
      {activeTab === 'supabase' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold font-display text-neutral-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              Supabase Authoritative Tariff Storage
            </h2>
            <p className="text-xs text-neutral-500">
              BharatUtility uses Supabase PostgreSQL (`public.tariff_versions` and `public.tariff_audit_logs`) as the authoritative primary source of truth.
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
                {isSupabaseConfigured() ? 'Connected to Remote Supabase' : 'Offline (Verified Seed Fallback Active)'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              When an administrator publishes a tariff update, it immediately commits to Supabase with Row Level Security. All visitors on the public Electricity Calculator receive the updated tariff in real time.
            </p>
          </div>
        </div>
      )}

      {/* ── MODAL: MANUAL TARIFF IMPORT & LIVE PREVIEW / EDIT WORKBENCH ── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-4xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <FileCode className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold font-display text-neutral-900 dark:text-white">
                    Manual Tariff Import &amp; Publishing Workbench
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Paste or upload verified JSON &bull; Live Preview &amp; Field Editor &bull; 1-Click Publish to Supabase
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Context Selector: State / DISCOM / Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    State / Union Territory
                  </label>
                  <select
                    value={importState}
                    onChange={e => {
                      setImportState(e.target.value);
                      setIsValidated(false);
                      setValidationResult(null);
                      setPreviewProposal(null);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-600 font-semibold text-neutral-900 dark:text-white outline-none focus:border-accent"
                  >
                    {stateOptions.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Power DISCOM
                  </label>
                  <input
                    type="text"
                    value={importDiscom}
                    onChange={e => {
                      setImportDiscom(e.target.value);
                      setIsValidated(false);
                      setValidationResult(null);
                      setPreviewProposal(null);
                    }}
                    placeholder="e.g., MGVCL, MSEDCL, BESCOM"
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-600 font-semibold text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Consumer Category
                  </label>
                  <input
                    type="text"
                    value={importCategory}
                    onChange={e => {
                      setImportCategory(e.target.value);
                      setIsValidated(false);
                      setValidationResult(null);
                      setPreviewProposal(null);
                    }}
                    placeholder="Domestic (LT-1 Residential)"
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-600 font-semibold text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* JSON Paste & Upload Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-accent" />
                    Paste Tariff JSON:
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer inline-flex items-center gap-1 border border-neutral-300 dark:border-neutral-600">
                      <UploadCloud className="w-3 h-3 text-accent" />
                      Upload JSON File
                      <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoFormatJson}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer border border-neutral-300 dark:border-neutral-600 inline-flex items-center gap-1"
                      title="Strip markdown formatting and fix trailing commas"
                    >
                      <FileCheck2 className="w-3 h-3 text-emerald-500" />
                      Clean &amp; Format
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = tariffRepository.getSampleTariffJson(importState, importDiscom);
                        setImportJsonText(sample);
                        setValidationResult(null);
                        setIsValidated(false);
                        setPreviewProposal(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 transition-colors cursor-pointer border border-neutral-300 dark:border-neutral-600"
                    >
                      Reset Sample Template
                    </button>
                  </div>
                </div>

                <textarea
                  rows={9}
                  value={importJsonText}
                  onChange={e => {
                    setImportJsonText(e.target.value);
                    // Critical: Editing invalidates previous validation state immediately
                    setValidationResult(null);
                    setIsValidated(false);
                    setPreviewProposal(null);
                  }}
                  placeholder="Paste verified electricity tariff JSON here..."
                  className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-neutral-900 dark:text-white outline-none focus:border-accent resize-y shadow-inner"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleValidateJson}
                    disabled={isValidating || !importJsonText.trim()}
                    className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 disabled:opacity-50 text-white font-bold text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-md shadow-accent/20"
                  >
                    <Check className="w-4 h-4" />
                    {isValidating ? 'Validating...' : 'Validate JSON'}
                  </button>
                  <span className="text-[11px] text-neutral-400">
                    Mandatory: Must validate successfully before publishing is unlocked.
                  </span>
                </div>
              </div>

              {/* ── VALIDATION FEEDBACK BOX ── */}
              {validationResult && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {validationResult.isValid && validationResult.summary ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span>✅ Tariff data is valid and ready for preview &amp; publishing.</span>
                      </div>

                      {/* Summary Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                        <div className="bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-emerald-500/20">
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">State</span>
                          <strong className="text-neutral-900 dark:text-white">{validationResult.summary.state}</strong>
                        </div>
                        <div className="bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-emerald-500/20">
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">DISCOM</span>
                          <strong className="text-neutral-900 dark:text-white">{validationResult.summary.discom}</strong>
                        </div>
                        <div className="bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-emerald-500/20">
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Category</span>
                          <strong className="text-neutral-900 dark:text-white">{validationResult.summary.category}</strong>
                        </div>
                        <div className="bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-emerald-500/20">
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Effective From</span>
                          <strong className="font-mono text-emerald-600 dark:text-emerald-400">{validationResult.summary.effectiveFrom}</strong>
                        </div>
                        <div className="bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-emerald-500/20">
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Slabs</span>
                          <strong className="text-neutral-900 dark:text-white">{validationResult.summary.slabCount} Tiers</strong>
                        </div>
                        <div className="bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-emerald-500/20">
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Fixed Charge</span>
                          <strong className="font-mono text-neutral-900 dark:text-white">₹{validationResult.summary.fixedCharge}/mo</strong>
                        </div>
                        <div className="bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-emerald-500/20">
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Duty Rate</span>
                          <strong className="font-mono text-neutral-900 dark:text-white">{validationResult.summary.dutyRate}%</strong>
                        </div>
                        <div className="bg-white/60 dark:bg-neutral-800/60 p-2.5 rounded-xl border border-emerald-500/20">
                          <span className="text-neutral-400 block text-[10px] uppercase font-bold">Source</span>
                          <strong className="text-neutral-900 dark:text-white truncate block">{validationResult.summary.source}</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 space-y-2 text-rose-700 dark:text-rose-300">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>❌ Validation Errors Detected: Please resolve before previewing or publishing.</span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-rose-200 dark:border-rose-800/40 text-[11px]">
                        {(Object.entries(groupedErrors) as [string, string[]][]).map(([category, errorList]) => (
                          <div key={category} className="space-y-1">
                            <span className="font-bold text-rose-900 dark:text-rose-200 uppercase text-[10px] tracking-wider block">
                              {category}:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 pl-2">
                              {errorList.map((err, i) => (
                                <li key={i} className="text-rose-700 dark:text-rose-300 font-medium">
                                  {err}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── PREVIEW & INLINE EDITING WORKBENCH ── */}
              {previewProposal && isValidated && (
                <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold font-display text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-accent" />
                        Tariff Preview &amp; Inline Field Editor
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Adjust individual rates or metadata before committing directly to Supabase.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Validated &amp; Ready to Publish
                    </span>
                  </div>

                  {/* Top Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        State
                      </label>
                      <input
                        type="text"
                        value={previewProposal.stateName}
                        onChange={e =>
                          setPreviewProposal({ ...previewProposal, stateName: e.target.value })
                        }
                        className="w-full bg-transparent font-bold text-neutral-900 dark:text-white outline-none border-b border-transparent focus:border-accent"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        DISCOM Name
                      </label>
                      <input
                        type="text"
                        value={previewProposal.discomName}
                        onChange={e =>
                          setPreviewProposal({ ...previewProposal, discomName: e.target.value })
                        }
                        className="w-full bg-transparent font-bold text-neutral-900 dark:text-white outline-none border-b border-transparent focus:border-accent"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Fixed Charge (₹/mo)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={previewProposal.fixedCharge}
                        onChange={e =>
                          setPreviewProposal({
                            ...previewProposal,
                            fixedCharge: Number(e.target.value)
                          })
                        }
                        className="w-full bg-transparent font-mono font-bold text-neutral-900 dark:text-white outline-none border-b border-transparent focus:border-accent"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Electricity Duty (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={previewProposal.dutyRate}
                        onChange={e =>
                          setPreviewProposal({
                            ...previewProposal,
                            dutyRate: Number(e.target.value)
                          })
                        }
                        className="w-full bg-transparent font-mono font-bold text-neutral-900 dark:text-white outline-none border-b border-transparent focus:border-accent"
                      />
                    </div>
                  </div>

                  {/* Slabs Grid with Inline Add/Remove */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-neutral-800 dark:text-neutral-200 text-xs">
                        Consumption Slabs Breakdown ({previewProposal.slabs.length} Tiers):
                      </label>
                      <button
                        type="button"
                        onClick={handleAddSlab}
                        className="text-[11px] text-accent font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Tier
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {previewProposal.slabs.map((slab, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                        >
                          <span className="w-6 text-[11px] font-bold text-neutral-400 text-center">
                            #{idx + 1}
                          </span>

                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="number"
                              min={0}
                              value={slab.minUnits}
                              onChange={e =>
                                handleUpdateSlab(idx, 'minUnits', Number(e.target.value))
                              }
                              placeholder="Min Units"
                              className="w-20 px-2 py-1 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-600 font-mono text-xs text-center"
                            />
                            <span className="text-neutral-400">to</span>
                            <input
                              type="text"
                              value={slab.maxUnits === null ? '' : slab.maxUnits}
                              onChange={e => {
                                const val = e.target.value.trim();
                                handleUpdateSlab(
                                  idx,
                                  'maxUnits',
                                  val === '' || val.toLowerCase() === 'null' ? null : Number(val)
                                );
                              }}
                              placeholder="Above (null)"
                              className="w-24 px-2 py-1 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-600 font-mono text-xs text-center"
                            />
                            <span className="text-neutral-400 text-[11px]">Units @ ₹</span>
                            <input
                              type="number"
                              step={0.01}
                              min={0}
                              value={slab.ratePerUnit}
                              onChange={e =>
                                handleUpdateSlab(idx, 'ratePerUnit', Number(e.target.value))
                              }
                              className="w-24 px-2 py-1 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-600 font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 text-center"
                            />
                            <span className="text-neutral-400 text-[11px]">/ unit</span>
                          </div>

                          {previewProposal.slabs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlab(idx)}
                              className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete slab tier"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Effective Date & Source Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Effective From Date
                      </label>
                      <input
                        type="date"
                        value={previewProposal.effectiveFrom}
                        onChange={e =>
                          setPreviewProposal({ ...previewProposal, effectiveFrom: e.target.value })
                        }
                        className="w-full bg-transparent font-mono font-bold text-neutral-900 dark:text-white outline-none border-b border-transparent focus:border-accent"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                        Regulatory Source Authority
                      </label>
                      <input
                        type="text"
                        value={previewProposal.sourceName}
                        onChange={e =>
                          setPreviewProposal({ ...previewProposal, sourceName: e.target.value })
                        }
                        placeholder="e.g. MERC / GERC / DERC"
                        className="w-full bg-transparent font-bold text-neutral-900 dark:text-white outline-none border-b border-transparent focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePublishTariff}
                  disabled={isPublishing || !isValidated || !previewProposal || (validationResult !== null && !validationResult.isValid)}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all inline-flex items-center justify-center gap-2 ${
                    isPublishing || !isValidated || !previewProposal || (validationResult !== null && !validationResult.isValid)
                      ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed opacity-60'
                      : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 cursor-pointer'
                  }`}
                  title={
                    !isValidated
                      ? 'Please validate JSON before publishing'
                      : 'Publish validated tariff to Supabase & Live Calculator'
                  }
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isPublishing ? 'Publishing to Supabase...' : 'Publish Tariff to Production'}
                </button>
              </div>
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
                className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center cursor-pointer"
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
                className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-xs font-bold cursor-pointer"
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
