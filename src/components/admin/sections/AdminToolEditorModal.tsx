import React, { useState } from 'react';
import { Tool, CategoryId, FAQItem } from '../../../types';
import { CATEGORIES } from '../../../data/categories';
import {
  X,
  Save,
  Plus,
  Trash2,
  Globe,
  Sparkles,
  HelpCircle,
  Code2,
  Tag,
  CheckCircle2,
  FileText,
  Eye,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AdminToolEditorModalProps {
  initialTool?: Tool | null;
  onSave: (tool: Tool) => void;
  onClose: () => void;
  onPreview?: (tool: Tool) => void;
}

export const AdminToolEditorModal: React.FC<AdminToolEditorModalProps> = ({
  initialTool,
  onSave,
  onClose,
  onPreview,
}) => {
  const isEdit = Boolean(initialTool && initialTool.id);

  // Active sub-tab in modal
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'formula' | 'faq' | 'seo' | 'flags'>('basic');

  // Form states
  const [name, setName] = useState(initialTool?.name || '');
  const [shortName, setShortName] = useState(initialTool?.shortName || '');
  const [slug, setSlug] = useState(initialTool?.slug || '');
  const [tagline, setTagline] = useState(initialTool?.tagline || '');
  const [description, setDescription] = useState(initialTool?.description || '');
  const [category, setCategory] = useState<CategoryId>(initialTool?.category || 'money');
  const [icon, setIcon] = useState(initialTool?.icon || 'Calculator');
  const [badge, setBadge] = useState(initialTool?.badge || '');
  const [status, setStatus] = useState<'published' | 'draft' | 'unpublished' | 'archived'>(
    initialTool?.status || 'published'
  );

  // Keywords
  const [keywordsStr, setKeywordsStr] = useState(initialTool?.keywords.join(', ') || '');

  // Flags
  const [popular, setPopular] = useState(Boolean(initialTool?.popular));
  const [trending, setTrending] = useState(Boolean(initialTool?.trending));
  const [featured, setFeatured] = useState(Boolean(initialTool?.featured));
  const [isEditorsPick, setIsEditorsPick] = useState(Boolean(initialTool?.isEditorsPick));
  const [featuredRank, setFeaturedRank] = useState(initialTool?.featuredRank || 1);

  // Formula & Steps
  const [formulaDescription, setFormulaDescription] = useState(initialTool?.formulaDescription || '');
  const [formulaLatex, setFormulaLatex] = useState(initialTool?.formulaLatex || '');
  const [exampleSummary, setExampleSummary] = useState(initialTool?.workedExample?.inputSummary || '');
  const [exampleSteps, setExampleSteps] = useState(initialTool?.workedExample?.calculationSteps.join('\n') || '');
  const [exampleResult, setExampleResult] = useState(initialTool?.workedExample?.finalResult || '');

  // FAQs
  const [faqs, setFaqs] = useState<FAQItem[]>(initialTool?.faqs || [
    { question: 'How is this calculated in India?', answer: 'Calculated using standard regulatory and financial formulas applicable across Indian jurisdictions.' },
  ]);

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialTool?.seo?.title || '');
  const [seoDescription, setSeoDescription] = useState(initialTool?.seo?.description || '');
  const [seoKeywords, setSeoKeywords] = useState(initialTool?.seo?.keywords.join(', ') || '');
  const [seoH1, setSeoH1] = useState(initialTool?.seo?.h1 || '');

  // Auto-slug generator on Name change
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && (!slug || slug === '')) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleUpdateFaq = (index: number, field: 'question' | 'answer', val: string) => {
    const updated = [...faqs];
    updated[index][field] = val;
    setFaqs(updated);
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, idx) => idx !== index));
  };

  const buildToolObject = (): Tool => {
    const cleanedKeywords = keywordsStr
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const cleanedSeoKeywords = seoKeywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    const stepsArray = exampleSteps
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    return {
      id: initialTool?.id || slug || 'tool_' + Math.random().toString(36).substring(2, 9),
      slug: slug.trim() || 'custom-tool',
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      tagline: tagline.trim(),
      description: description.trim(),
      category,
      icon: icon.trim() || 'Calculator',
      badge: badge.trim() || undefined,
      keywords: cleanedKeywords,
      popular,
      trending,
      featured,
      isEditorsPick,
      featuredRank,
      status,
      views: initialTool?.views || 1200,
      calculationCount: initialTool?.calculationCount || 540,
      favoritesCount: initialTool?.favoritesCount || 45,
      sharesCount: initialTool?.sharesCount || 12,
      updatedAt: new Date().toISOString(),
      seo: {
        title: seoTitle.trim() || `${name} — BharatUtility India`,
        description: seoDescription.trim() || description.trim(),
        keywords: cleanedSeoKeywords.length ? cleanedSeoKeywords : cleanedKeywords,
        canonicalSlug: slug.trim(),
        h1: seoH1.trim() || undefined,
      },
      formulaDescription: formulaDescription.trim() || undefined,
      formulaLatex: formulaLatex.trim() || undefined,
      workedExample: exampleSummary.trim()
        ? {
            inputSummary: exampleSummary.trim(),
            calculationSteps: stepsArray,
            finalResult: exampleResult.trim(),
          }
        : undefined,
      faqs: faqs.filter(f => f.question.trim() && f.answer.trim()),
      relatedToolSlugs: initialTool?.relatedToolSlugs || ['emi-calculator', 'gst-calculator'],
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      alert('Tool name and URL slug are mandatory.');
      return;
    }
    const tool = buildToolObject();
    onSave(tool);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {isEdit ? `Edit Tool: ${name || initialTool?.name}` : 'Create New Utility / Tool'}
              </h2>
              <p className="text-xs text-neutral-400">
                Configure tool metadata, calculation formulas, SEO indexing, and publishing status.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPreview && (
              <button
                type="button"
                onClick={() => onPreview(buildToolObject())}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-accent" /> Preview
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto bg-neutral-50/30 dark:bg-neutral-900/30 shrink-0">
          {[
            { id: 'basic', label: 'Basic Info & Category', icon: Tag },
            { id: 'formula', label: 'Formula & Example', icon: Code2 },
            { id: 'faq', label: `FAQs (${faqs.length})`, icon: HelpCircle },
            { id: 'seo', label: 'SEO & Schema', icon: Globe },
            { id: 'flags', label: 'Flags & Status', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-accent text-accent font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. EPF / PF Withdrawal Calculator"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium focus:ring-2 focus:ring-accent outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <span className="px-2.5 text-[11px] text-neutral-400 font-mono">/tool/</span>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      placeholder="epf-withdrawal-calculator"
                      className="w-full px-2 py-2 bg-transparent text-xs font-mono font-medium outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Short / Card Name
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={e => setShortName(e.target.value)}
                    placeholder="e.g. PF Calculator"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CategoryId)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Icon Name (Lucide)
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    placeholder="e.g. Calculator, Home, Zap"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Tagline (Subtitle on Header)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="e.g. Calculate taxable amount, interest corpus & TDS rate on EPF withdrawal"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Tool Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailed description explaining utility purpose, Indian legal rules, and features."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Search Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={keywordsStr}
                  onChange={e => setKeywordsStr(e.target.value)}
                  placeholder="pf, epf withdrawal, epf interest, sbi pf, section 10 12, tax on epf"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: FORMULA & WORKED EXAMPLE */}
          {activeTab === 'formula' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Mathematical Formula Explanation
                </label>
                <textarea
                  rows={2}
                  value={formulaDescription}
                  onChange={e => setFormulaDescription(e.target.value)}
                  placeholder="e.g. Gratuity = (15 × Last Drawn Basic Salary × Completed Years of Service) / 26"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Formula LaTeX Code (Optional)
                </label>
                <input
                  type="text"
                  value={formulaLatex}
                  onChange={e => setFormulaLatex(e.target.value)}
                  placeholder="e.g. G = \frac{15 \times S \times Y}{26}"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono font-medium outline-hidden"
                />
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Worked Step-by-Step Example
                </h4>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Input Summary
                  </label>
                  <input
                    type="text"
                    value={exampleSummary}
                    onChange={e => setExampleSummary(e.target.value)}
                    placeholder="e.g. Employee with ₹50,000 basic salary and 8 years service"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Calculation Steps (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={exampleSteps}
                    onChange={e => setExampleSteps(e.target.value)}
                    placeholder="15 × 50,000 = 7,50,000&#10;7,50,000 × 8 = 60,00,000&#10;60,00,000 / 26 = ₹2,30,769"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    Final Result Text
                  </label>
                  <input
                    type="text"
                    value={exampleResult}
                    onChange={e => setExampleResult(e.target.value)}
                    placeholder="Total Gratuity Payable: ₹2,30,769 (100% Tax Exempt under Sec 10(10))"
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAQs */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Frequently Asked Questions (FAQs)
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    Structured FAQs are automatically converted into Schema.org FAQPage JSON-LD.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1 hover:bg-accent/90"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-accent font-mono">Q{idx + 1}.</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFaq(idx)}
                        className="text-neutral-400 hover:text-rose-500 p-1"
                        title="Remove FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={e => handleUpdateFaq(idx, 'question', e.target.value)}
                      placeholder="Question: e.g. Is gratuity taxable in India?"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold outline-hidden"
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={e => handleUpdateFaq(idx, 'answer', e.target.value)}
                      placeholder="Answer with exact legal / tax references."
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  SEO Title Tag (50-60 chars)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={e => setSeoTitle(e.target.value)}
                  placeholder="e.g. Loan EMI Calculator India — Home, Personal & Car Loan EMI"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Length: {seoTitle.length} chars (Optimal: 50-60)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Meta Description (120-155 chars)
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={e => setSeoDescription(e.target.value)}
                  placeholder="e.g. Free Indian calculator for estimating monthly loan EMI payments, total interest payout and full amortization schedule."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Length: {seoDescription.length} chars (Optimal: 120-155)
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  H1 Heading Override (optional)
                </label>
                <input
                  type="text"
                  value={seoH1}
                  onChange={e => setSeoH1(e.target.value)}
                  placeholder="e.g. Calculate Your Exact Monthly Home Loan EMI"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={e => setSeoKeywords(e.target.value)}
                  placeholder="loan emi calculator, home loan emi, calculate monthly emi"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 5: FLAGS & STATUS */}
          {activeTab === 'flags' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold outline-hidden"
                  >
                    <option value="published">🟢 Active (Live on Website)</option>
                    <option value="inactive">⏸️ Inactive (Disabled / Hidden)</option>
                    <option value="draft">🟡 Draft (Admin Only)</option>
                    <option value="unpublished">⚪ Unpublished</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Badge Tag (e.g. Top Tool, Essential, New)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    placeholder="e.g. Top Tool"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium outline-hidden"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
                <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Featured & Discovery Flags
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={popular}
                      onChange={e => setPopular(e.target.checked)}
                      className="rounded text-accent focus:ring-accent"
                    />
                    Popular Section
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trending}
                      onChange={e => setTrending(e.target.checked)}
                      className="rounded text-accent focus:ring-accent"
                    />
                    Trending Section
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="rounded text-accent focus:ring-accent"
                    />
                    Featured Hero
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEditorsPick}
                      onChange={e => setIsEditorsPick(e.target.checked)}
                      className="rounded text-accent focus:ring-accent"
                    />
                    Editor's Pick
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-accent/90 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Tool Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
