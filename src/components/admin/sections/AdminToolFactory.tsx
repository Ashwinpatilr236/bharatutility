import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  FolderTree,
  FileText,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { adminStore } from '../../../services/adminStore';
import { Tool, ToolQualityCheckResult } from '../../../types/admin';

interface AdminToolFactoryProps {
  onToolCreated?: (tool: Tool) => void;
  onNavigateTools?: () => void;
}

export const AdminToolFactory: React.FC<AdminToolFactoryProps> = ({ onToolCreated, onNavigateTools }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [toolData, setToolData] = useState<Partial<Tool>>({
    name: '',
    slug: '',
    category: 'money',
    description: '',
    status: 'draft',
    icon: 'Calculator',
    badge: 'NEW',
    seo: {
      title: '',
      description: '',
      keywords: [],
    },
    faqs: [
      { question: 'Is this calculation formula compliant with Indian standards?', answer: 'Yes, all calculations are aligned with current Indian statutory norms and financial guidelines.' },
      { question: 'Is my data private and secure?', answer: 'Yes, 100% of calculations run privately in your browser without saving personal inputs to any server.' },
    ],
    relatedTools: ['emi-calculator', 'gst-calculator'],
    disclaimer: 'Calculations provided by BharatUtility are for informational and educational estimation purposes only.',
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const categories = adminStore.getCategories();
  const existingTools = adminStore.getTools();
  const qualityCheck: ToolQualityCheckResult = adminStore.runToolQualityCheck(toolData);

  const handleSlugify = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    return slug;
  };

  const handleNameChange = (name: string) => {
    const autoSlug = handleSlugify(name);
    setToolData(prev => ({
      ...prev,
      name,
      slug: prev.slug ? prev.slug : autoSlug,
      seo: {
        ...prev.seo,
        title: prev.seo?.title || `${name} (Free Online Indian Utility)`,
        description: prev.seo?.description || prev.description || '',
        keywords: prev.seo?.keywords || [],
      },
    }));
  };

  const handleAddFaq = () => {
    setToolData(prev => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: '', answer: '' }],
    }));
  };

  const handleRemoveFaq = (index: number) => {
    setToolData(prev => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== index),
    }));
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    setToolData(prev => ({
      ...prev,
      faqs: (prev.faqs || []).map((faq, i) => (i === index ? { ...faq, [field]: value } : faq)),
    }));
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    const currentKeywords = toolData.seo?.keywords || [];
    if (!currentKeywords.includes(keywordInput.trim())) {
      setToolData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          title: prev.seo?.title || '',
          description: prev.seo?.description || '',
          keywords: [...currentKeywords, keywordInput.trim()],
        },
      }));
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setToolData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        title: prev.seo?.title || '',
        description: prev.seo?.description || '',
        keywords: (prev.seo?.keywords || []).filter(k => k !== kw),
      },
    }));
  };

  const handleFinalSubmit = (status: 'published' | 'draft') => {
    setErrorMessage(null);

    // Validation
    if (!toolData.name || !toolData.slug || !toolData.description) {
      setErrorMessage('Please complete all required fields (Name, Slug, Description).');
      return;
    }

    if (existingTools.some(t => t.slug === toolData.slug)) {
      setErrorMessage(`The slug "/tool/${toolData.slug}" is already in use by another tool. Please pick a unique slug.`);
      return;
    }

    const newTool: Tool = {
      id: 'tool_' + Math.random().toString(36).substring(2, 9),
      name: toolData.name.trim(),
      slug: toolData.slug.trim(),
      category: toolData.category || 'money',
      description: toolData.description.trim(),
      status: status,
      icon: toolData.icon || 'Calculator',
      badge: toolData.badge || '',
      featured: false,
      popular: false,
      trending: false,
      views: 0,
      calculationCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      keywords: toolData.seo?.keywords || [],
      seo: toolData.seo,
      faqs: toolData.faqs || [],
      relatedToolSlugs: toolData.relatedTools || [],
      relatedTools: toolData.relatedTools || [],
      disclaimer: toolData.disclaimer,
    };

    adminStore.addTool(newTool);
    setSuccessMessage(`Tool "${newTool.name}" created successfully as ${status}!`);

    if (onToolCreated) {
      onToolCreated(newTool);
    }

    setTimeout(() => {
      if (onNavigateTools) onNavigateTools();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-display text-neutral-900 dark:text-white">
              Tool Factory & Quality Wizard
            </h2>
            <span className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              Standardized Blueprint
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Build, validate, and launch production-grade Indian utility calculators with mandatory SEO, schema, and compliance checks.
          </p>
        </div>

        {/* Wizard Step Breadcrumbs */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs shadow-2xs">
          {[
            { num: 1, label: '1. Basics' },
            { num: 2, label: '2. SEO & Schema' },
            { num: 3, label: '3. FAQs & Links' },
            { num: 4, label: '4. Quality Gate' },
          ].map(s => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num as any)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                currentStep === s.num
                  ? 'bg-accent text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error / Success Notifications */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Step 1: Basic Metadata */}
      {currentStep === 1 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <span>Step 1: Utility Metadata & Categorization</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Utility Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Gratuity Calculation Estimator"
                value={toolData.name}
                onChange={e => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-r-0 border-neutral-300 dark:border-neutral-700 rounded-l-xl font-mono">
                  /tool/
                </span>
                <input
                  type="text"
                  placeholder="gratuity-calculation-estimator"
                  value={toolData.slug}
                  onChange={e => setToolData(prev => ({ ...prev, slug: handleSlugify(e.target.value) }))}
                  className="w-full px-3 py-2 text-xs rounded-r-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Taxonomy Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={toolData.category}
                onChange={e => setToolData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Display Badge (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. POPULAR, NEW, STATUTORY"
                value={toolData.badge}
                onChange={e => setToolData(prev => ({ ...prev, badge: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Citizen Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe what this tool calculates and citizen use cases..."
                value={toolData.description}
                onChange={e => setToolData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>Next: SEO & Rich Schema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: SEO, Title, Meta Description */}
      {currentStep === 2 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            <span>Step 2: SEO Title, Meta Description & Search Keywords</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-neutral-800 dark:text-neutral-200">
                  Target SEO Title
                </label>
                <span className="font-mono text-neutral-400">
                  {(toolData.seo?.title || '').length} / 60 chars
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. Gratuity Calculator India | Statutory Formula & Tax Limits"
                value={toolData.seo?.title || ''}
                onChange={e =>
                  setToolData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value, description: prev.seo?.description || '', keywords: prev.seo?.keywords || [] },
                  }))
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-neutral-800 dark:text-neutral-200">
                  Target Meta Description
                </label>
                <span className="font-mono text-neutral-400">
                  {(toolData.seo?.description || '').length} / 155 chars
                </span>
              </div>
              <textarea
                rows={2}
                placeholder="Calculate your statutory gratuity payout based on completed service years, monthly basic pay, and current Indian tax exemption limits."
                value={toolData.seo?.description || ''}
                onChange={e =>
                  setToolData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, description: e.target.value, title: prev.seo?.title || '', keywords: prev.seo?.keywords || [] },
                  }))
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>

            {/* Keyword tags */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                SEO Search Opportunity Keywords
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. gratuity tax exemption 2026"
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs"
                >
                  Add Keyword
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(toolData.seo?.keywords || []).map(kw => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 rounded-lg text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 inline-flex items-center gap-1.5"
                  >
                    <span>{kw}</span>
                    <button
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-neutral-400 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Basics</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>Next: FAQs & Link Mesh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: FAQs & Internal Links */}
      {currentStep === 3 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Step 3: Citizen FAQs & Internal Link Mesh</span>
            </h3>
            <button
              type="button"
              onClick={handleAddFaq}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent/10 text-accent hover:bg-accent/20 transition-colors inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add FAQ</span>
            </button>
          </div>

          {/* FAQs list */}
          <div className="space-y-3">
            {(toolData.faqs || []).map((faq, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Citizen Question (e.g. How is gratuity calculated in India?)"
                    value={faq.question}
                    onChange={e => handleUpdateFaq(idx, 'question', e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Clear answer for users and Google Rich FAQ snippet..."
                  value={faq.answer}
                  onChange={e => handleUpdateFaq(idx, 'answer', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600"
                />
              </div>
            ))}
          </div>

          <div className="pt-3 flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to SEO</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>Next: Run Quality Gate</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Quality Gate & Launch */}
      {currentStep === 4 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Step 4: Automated Tool Quality Gate & Verification</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Every tool must pass the BharatUtility checklist before production publishing.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] font-semibold text-neutral-400">Readiness Score</div>
                <div className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                  {qualityCheck.score}%
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                  qualityCheck.isReady
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {qualityCheck.isReady ? 'Ready for Live' : 'Action Required'}
              </span>
            </div>
          </div>

          {/* Checklist items */}
          <div className="space-y-2">
            {qualityCheck.checks.map(check => (
              <div
                key={check.id}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {check.status === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : check.status === 'warn' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white">{check.label}</span>
                    <span className="text-neutral-400 text-[11px] ml-2 font-mono">[{check.category}]</span>
                    <p className="text-neutral-500 dark:text-neutral-400 text-[11.5px] mt-0.5">{check.message}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    check.status === 'pass'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : check.status === 'warn'
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {check.status}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to FAQs</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFinalSubmit('draft')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 transition-colors inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>

              <button
                onClick={() => handleFinalSubmit('published')}
                disabled={!qualityCheck.isReady}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-accent text-white hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish to Production</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
