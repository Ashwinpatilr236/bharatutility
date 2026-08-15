import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { submitToolRequest } from '../../services/toolRequestService';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowLeft,
  Loader2,
  Compass,
  Layers,
  Link as LinkIcon,
  HelpCircle
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Money & Finance',
  'Daily Life',
  'Home',
  'Education',
  'Technology',
  'Travel',
  'Business',
  'Documents',
  'Other',
];

export const RequestToolView: React.FC = () => {
  const { navigateToHome, navigateToContact, showToast } = useApp();

  const [formData, setFormData] = useState(() => {
    let prefillToolName = '';
    try {
      prefillToolName = sessionStorage.getItem('bu_requested_tool_prefill') || '';
      if (prefillToolName) {
        sessionStorage.removeItem('bu_requested_tool_prefill');
      }
    } catch {}

    return {
      name: '',
      email: '',
      toolName: prefillToolName,
      category: 'Money & Finance',
      description: '',
      usefulness: '',
      referenceUrl: '',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.toolName.trim()) {
      newErrors.toolName = 'Please enter a proposed name or title for the tool.';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Please select a category.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please explain what this tool should calculate or do.';
    } else if (formData.description.trim().length < 15) {
      newErrors.description = 'Please provide a little more detail (minimum 15 characters).';
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address if provided.';
      }
    }

    if (formData.referenceUrl && formData.referenceUrl.trim()) {
      try {
        const url = formData.referenceUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          newErrors.referenceUrl = 'URL should begin with https:// or http://';
        }
      } catch {
        newErrors.referenceUrl = 'Please enter a valid URL.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please check the required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitToolRequest(formData);
      if (response.success) {
        setIsSubmitted(true);
        showToast('Tool request submitted successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit tool request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      toolName: '',
      category: 'Money & Finance',
      description: '',
      usefulness: '',
      referenceUrl: '',
    });
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Button */}
      <button
        onClick={navigateToHome}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Home</span>
      </button>

      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Feature & Calculator Requests</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight">
          Request a Tool
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Can&apos;t find the tool you need? Tell us what you need and we&apos;ll consider adding it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Request Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
            {isSubmitted ? (
              /* Success State */
              <div className="text-center py-8 sm:py-12 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center mx-auto border border-accent/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white">
                    Tool request submitted!
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                    Thanks for helping us improve BharatUtility. Your suggestion has been received.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Submit Another Request
                  </button>
                  <button
                    onClick={navigateToHome}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors"
                  >
                    Explore Existing Tools
                  </button>
                </div>
              </div>
            ) : (
              /* Request Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Tool Name (Required) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="request-tool-name"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Tool Name <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="request-tool-name"
                    type="text"
                    value={formData.toolName}
                    onChange={e => {
                      setFormData({ ...formData, toolName: e.target.value });
                      if (errors.toolName) setErrors({ ...errors, toolName: '' });
                    }}
                    placeholder="Example: Home Renovation Cost Calculator"
                    disabled={isSubmitting}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.toolName
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-accent focus:ring-accent/20'
                    }`}
                    aria-required="true"
                    aria-invalid={!!errors.toolName}
                    aria-describedby={errors.toolName ? 'request-tool-name-error' : undefined}
                  />
                  {errors.toolName && (
                    <p id="request-tool-name-error" className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.toolName}
                    </p>
                  )}
                </div>

                {/* Category (Required) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="request-category"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Category <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="request-category"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  >
                    {CATEGORY_OPTIONS.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* What should this tool do? (Required) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="request-description"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    What should this tool do? <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="request-description"
                    rows={5}
                    value={formData.description}
                    onChange={e => {
                      setFormData({ ...formData, description: e.target.value });
                      if (errors.description) setErrors({ ...errors, description: '' });
                    }}
                    placeholder="Describe the required inputs (e.g. dimensions, rates), calculation formulas, and expected outputs or breakdown..."
                    disabled={isSubmitting}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all resize-y ${
                      errors.description
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-accent focus:ring-accent/20'
                    }`}
                    aria-required="true"
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? 'request-description-error' : undefined}
                  />
                  {errors.description && (
                    <p id="request-description-error" className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Why would this tool be useful? (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="request-usefulness"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      Why would this tool be useful?
                    </label>
                    <span className="text-[11px] text-neutral-400">Optional</span>
                  </div>
                  <input
                    id="request-usefulness"
                    type="text"
                    value={formData.usefulness}
                    onChange={e => setFormData({ ...formData, usefulness: e.target.value })}
                    placeholder="E.g. Helps Indian home buyers estimate interior renovation budgets accurately"
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white text-xs sm:text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                </div>

                {/* Reference / Example URL (Optional) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="request-reference-url"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      Reference / Example URL
                    </label>
                    <span className="text-[11px] text-neutral-400">Optional</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="request-reference-url"
                      type="url"
                      value={formData.referenceUrl}
                      onChange={e => {
                        setFormData({ ...formData, referenceUrl: e.target.value });
                        if (errors.referenceUrl) setErrors({ ...errors, referenceUrl: '' });
                      }}
                      placeholder="https://example.com/reference-calculator"
                      disabled={isSubmitting}
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.referenceUrl
                          ? 'border-red-500 focus:ring-red-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 focus:border-accent focus:ring-accent/20'
                      }`}
                    />
                  </div>
                  {errors.referenceUrl && (
                    <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.referenceUrl}
                    </p>
                  )}
                </div>

                {/* Optional Submitter Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  {/* Name (Optional) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="request-name"
                        className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                      >
                        Your Name
                      </label>
                      <span className="text-[11px] text-neutral-400">Optional</span>
                    </div>
                    <input
                      id="request-name"
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      disabled={isSubmitting}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white text-xs sm:text-sm placeholder-neutral-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="request-email"
                        className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                      >
                        Your Email
                      </label>
                      <span className="text-[11px] text-neutral-400">Optional</span>
                    </div>
                    <input
                      id="request-email"
                      type="email"
                      value={formData.email}
                      onChange={e => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="name@example.com"
                      disabled={isSubmitting}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-red-500 focus:ring-red-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 focus:border-accent focus:ring-accent/20'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Clear Privacy Notice */}
                <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Please do not submit passwords, financial account details, or other sensitive personal information.
                  </span>
                </div>

                {/* Submit Request Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl bg-accent text-white font-bold text-xs sm:text-sm shadow-md shadow-accent/20 hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting tool request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* How It Works Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-accent-subtle text-accent">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-display text-neutral-900 dark:text-white">
                How We Review Tools
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>We evaluate feasibility, formula accuracy, and relevance to Indian users.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>Calculators with high everyday demand are prioritized and scheduled for rollout.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>All tools are launched with 100% free client-side execution and zero ads.</span>
              </li>
            </ul>
          </div>

          {/* Contact Alternative */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
              <HelpCircle className="w-4 h-4 text-accent" />
              <span>General Questions?</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              If you need help with an existing calculation or wish to report a formula issue, please use our contact page.
            </p>
            <button
              onClick={navigateToContact}
              className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 pt-1"
            >
              Contact BharatUtility team →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
