import React, { useState, useEffect } from 'react';
import {
  Split,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Trophy,
  Trash2,
  Eye,
  MousePointerClick,
  TrendingUp,
  Percent,
  Edit2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';
import { ExperimentItem, ExperimentVariant } from '../../../types/admin';

export const AdminExperiments: React.FC = () => {
  const [experiments, setExperiments] = useState<ExperimentItem[]>(adminStore.getExperiments());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperimentItem | null>(null);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState<ExperimentItem['type']>('cta_button');
  const [targetToolInput, setTargetToolInput] = useState('');
  const [hypothesisInput, setHypothesisInput] = useState('');
  const [variantsInput, setVariantsInput] = useState<ExperimentVariant[]>([
    { id: 'v_ctrl', name: 'Control (Default)', trafficAllocation: 50, views: 0, clicks: 0, conversions: 0 },
    { id: 'v_var_a', name: 'Variant A', trafficAllocation: 50, views: 0, clicks: 0, conversions: 0 },
  ]);

  const tools = adminStore.getTools();

  useEffect(() => {
    const unsub = adminStore.subscribe(() => {
      setExperiments(adminStore.getExperiments());
    });
    return unsub;
  }, []);

  const openCreateModal = () => {
    setEditingExp(null);
    setNameInput('');
    setTypeInput('cta_button');
    setTargetToolInput('all');
    setHypothesisInput('');
    setVariantsInput([
      { id: 'v_ctrl', name: 'Control (Default)', trafficAllocation: 50, views: 0, clicks: 0, conversions: 0 },
      { id: 'v_var_a', name: 'Variant A', trafficAllocation: 50, views: 0, clicks: 0, conversions: 0 },
    ]);
    setIsModalOpen(true);
  };

  const handleSaveExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    adminStore.saveExperiment({
      id: editingExp ? editingExp.id : undefined,
      name: nameInput.trim(),
      type: typeInput,
      targetToolId: targetToolInput || 'all',
      hypothesis: hypothesisInput.trim(),
      status: editingExp ? editingExp.status : 'running',
      variants: variantsInput,
      startedAt: editingExp ? editingExp.startedAt : new Date().toISOString(),
    });

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: ExperimentItem['status']) => {
    const nextStatus = currentStatus === 'running' ? 'paused' : 'running';
    adminStore.updateExperimentStatus(id, nextStatus);
  };

  const handleDeclareWinner = (expId: string, variantId: string) => {
    if (confirm('Declare this variant as the winner and conclude the experiment?')) {
      adminStore.updateExperimentStatus(expId, 'concluded', variantId);
    }
  };

  const handleDeleteExperiment = (id: string) => {
    if (confirm('Are you sure you want to delete this experiment?')) {
      adminStore.deleteExperiment(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
              A/B Testing & UX Experiments
            </h2>
            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border border-pink-200/60 dark:border-pink-800/60">
              Conversion Optimization
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Test button copy, layout variations, ad placements, and default citizen inputs to maximize tool engagement.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-accent text-white hover:bg-accent/90 shadow-2xs transition-colors inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Experiment</span>
        </button>
      </div>

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.map(exp => (
          <div
            key={exp.id}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-pink-600">
                  <Split className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {exp.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 uppercase">
                      {(exp.type || exp.targetComponent || 'Experiment').replace(/_/g, ' ')}
                    </span>
                  </div>
                  {(exp.hypothesis || exp.description) && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <strong>Hypothesis:</strong> {exp.hypothesis || exp.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase ${
                    exp.status === 'running'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : exp.status === 'paused'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
                  }`}
                >
                  {exp.status}
                </span>

                {exp.status !== 'concluded' && (
                  <button
                    onClick={() => handleToggleStatus(exp.id, exp.status)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title={exp.status === 'running' ? 'Pause Experiment' : 'Resume Experiment'}
                  >
                    {exp.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}

                <button
                  onClick={() => handleDeleteExperiment(exp.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete Experiment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Variants Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(exp.variants || []).map(variant => {
                const views = variant.views || 0;
                const conversions = variant.conversions || 0;
                const convRate = views > 0 ? ((conversions / views) * 100).toFixed(2) : '0.00';
                const isWinner = exp.winningVariantId === variant.id;

                return (
                  <div
                    key={variant.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isWinner
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700'
                        : 'bg-neutral-50/60 dark:bg-neutral-800/40 border-neutral-200/60 dark:border-neutral-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-neutral-900 dark:text-white">
                          {variant.name}
                        </span>
                        {isWinner && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-extrabold uppercase inline-flex items-center gap-1">
                            <Trophy className="w-2.5 h-2.5" />
                            Winner
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">
                        {variant.trafficAllocation ?? 50}% Split
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200/50 dark:border-neutral-700/50 text-center">
                      <div>
                        <div className="text-[10px] text-neutral-400 uppercase font-semibold">Views</div>
                        <div className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
                          {views.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-400 uppercase font-semibold">Calculations</div>
                        <div className="font-mono font-bold text-xs text-neutral-900 dark:text-white">
                          {conversions.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-400 uppercase font-semibold">Conv. Rate</div>
                        <div className="font-mono font-extrabold text-xs text-accent">
                          {convRate}%
                        </div>
                      </div>
                    </div>

                    {exp.status === 'running' && !isWinner && (
                      <div className="pt-3 flex justify-end">
                        <button
                          onClick={() => handleDeclareWinner(exp.id, variant.id)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Trophy className="w-3 h-3" />
                          <span>Declare Winner</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* New Experiment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Create A/B Experiment
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExperiment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Experiment Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. EMI Calculator - Interactive Sliders vs Input Fields"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Experiment Type
                  </label>
                  <select
                    value={typeInput}
                    onChange={e => setTypeInput(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="cta_button">Call to Action (Button text / color)</option>
                    <option value="headline">Page Headline & Subtitle</option>
                    <option value="layout">Layout Variant</option>
                    <option value="default_inputs">Default Input Pre-fills</option>
                    <option value="ad_placement">Ad Slot Placements</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Target Tool
                  </label>
                  <select
                    value={targetToolInput}
                    onChange={e => setTargetToolInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    <option value="all">All Tools (Global)</option>
                    {tools.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Hypothesis
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Using an emerald green 'Calculate Bill Instantly' button will increase completions by 15%."
                  value={hypothesisInput}
                  onChange={e => setHypothesisInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-colors shadow-xs"
                >
                  Launch Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
