import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContactReason } from '../../types';
import { submitContactMessage } from '../../services/contactService';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Shield,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Loader2,
  FileQuestion,
  Lightbulb
} from 'lucide-react';

const CONTACT_REASONS: ContactReason[] = [
  'General Question',
  'Bug Report',
  'Tool Suggestion',
  'Partnership',
  'Advertising',
  'Feedback',
  'Other',
];

export const ContactView: React.FC = () => {
  const { navigateToHome, navigateToRequestTool, showToast } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: 'General Question' as ContactReason,
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState<string>('');

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please enter a subject.';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject should be at least 3 characters.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please provide a bit more detail (minimum 10 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submittedTicketId, setSubmittedTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('Please fix the errors in the form.', 'error');
      return;
    }

    const currentPayload = JSON.stringify(formData);
    if (currentPayload === lastSubmittedPayload) {
      showToast('This message has already been submitted.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitContactMessage(formData);
      if (response.success) {
        setIsSubmitted(true);
        if (response.id) setSubmittedTicketId(response.id);
        setLastSubmittedPayload(currentPayload);
        showToast('Thanks! Your message has been sent successfully.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Something went wrong while sending your message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      reason: 'General Question',
      subject: '',
      message: '',
    });
    setSubmittedTicketId('');
    setErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={navigateToHome}
        className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Home</span>
      </button>

      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-bold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-neutral-900 dark:text-white tracking-tight">
          Contact BharatUtility
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Have a question, feedback, bug report, or partnership inquiry? Send us a message and our team will get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form Card */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-8 shadow-xs">
            {isSubmitted ? (
              /* Success State */
              <div className="text-center py-8 sm:py-12 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 dark:text-white">
                    Thanks! Your message has been sent successfully.
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
                    Our team reviews all incoming inquiries and will respond to your email as soon as possible.
                  </p>

                  {submittedTicketId && (
                    <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-w-xs mx-auto flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500 dark:text-neutral-400 font-sans">Ticket Reference:</span>
                      <span className="font-black text-accent dark:text-accent tracking-wider font-mono">#{submittedTicketId}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Send Another Message
                  </button>
                  <button
                    onClick={navigateToHome}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold hover:bg-accent/90 transition-colors"
                  >
                    Return to Tools
                  </button>
                </div>
              </div>
            ) : (
              /* Main Contact Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Row 1: Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      Name <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="Your full name"
                      disabled={isSubmitting}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                        errors.name
                          ? 'border-red-500 focus:ring-red-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 focus:border-accent focus:ring-accent/20'
                      }`}
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    />
                    {errors.name && (
                      <p id="contact-name-error" className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      Email Address <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-email"
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
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="contact-email-error" className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reason for Contact */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-reason"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Reason for Contact <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="contact-reason"
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value as ContactReason })}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  >
                    {CONTACT_REASONS.map(reason => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Subject <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={formData.subject}
                    onChange={e => {
                      setFormData({ ...formData, subject: e.target.value });
                      if (errors.subject) setErrors({ ...errors, subject: '' });
                    }}
                    placeholder="Brief summary of your inquiry"
                    disabled={isSubmitting}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.subject
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-accent focus:ring-accent/20'
                    }`}
                    aria-required="true"
                    aria-invalid={!!errors.subject}
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  />
                  {errors.subject && (
                    <p id="contact-subject-error" className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Message <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={formData.message}
                    onChange={e => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    placeholder="Describe your inquiry, feedback, or question in detail..."
                    disabled={isSubmitting}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm bg-neutral-50/50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 transition-all resize-y ${
                      errors.message
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-neutral-200 dark:border-neutral-700 focus:border-accent focus:ring-accent/20'
                    }`}
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  />
                  {errors.message && (
                    <p id="contact-message-error" className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Privacy Note */}
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-start gap-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Your information will only be used to respond to your request. Please avoid submitting sensitive personal information.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 rounded-xl bg-accent text-white font-bold text-xs sm:text-sm shadow-md shadow-accent/20 hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar Info & Shortcuts */}
        <div className="space-y-6">
          {/* Quick Help Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold font-display text-neutral-900 dark:text-white">
                Looking to request a new tool?
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              If you have a specific idea for an Indian utility, calculator, or converter that is missing, you can submit a dedicated tool request.
            </p>
            <button
              onClick={navigateToRequestTool}
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Go to Request a Tool</span>
            </button>
          </div>

          {/* Privacy & Response Times */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
              <HelpCircle className="w-4 h-4 text-accent" />
              <span>Response Time</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              We review every submission carefully. Inquiries regarding bug fixes, calculation formula corrections, or critical suggestions are prioritized.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
