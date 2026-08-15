import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Heart, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { adminStore } from '../../services/adminStore';
import { useApp } from '../../context/AppContext';

interface ToolFeedbackWidgetProps {
  toolSlug: string;
  toolName: string;
}

export const ToolFeedbackWidget: React.FC<ToolFeedbackWidgetProps> = ({ toolSlug, toolName }) => {
  const { showToast } = useApp();
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'yes' | 'no'>('idle');
  const [improvementText, setImprovementText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePositiveFeedback = () => {
    setFeedbackStatus('yes');
    try {
      localStorage.setItem(`bu_feedback_${toolSlug}`, 'positive');
    } catch {}
    adminStore.logActivity('Positive Tool Feedback', 'tool', toolName, 'Citizen marked tool as useful 👍', toolSlug);
    showToast('Thank you for your feedback! ❤️', 'success');
  };

  const handleNegativeFeedback = () => {
    setFeedbackStatus('no');
  };

  const handleImprovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!improvementText.trim()) {
      showToast('Please enter a quick note on what we can improve', 'info');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      adminStore.logActivity(
        'Tool Improvement Suggestion',
        'tool',
        toolName,
        `Feedback: "${improvementText.trim()}"`,
        toolSlug
      );
      try {
        localStorage.setItem(`bu_feedback_${toolSlug}`, 'negative_with_comment');
      } catch {}
      setSubmitted(true);
      setIsSubmitting(false);
      showToast('Thank you! Your feedback will help us improve this tool.', 'success');
    }, 400);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display text-center sm:text-left">
            Was this tool useful?
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center sm:text-left mt-0.5">
            Your anonymous response helps us refine Indian calculations and templates.
          </p>
        </div>

        {feedbackStatus === 'idle' && (
          <div className="flex items-center gap-3">
            <button
              onClick={handlePositiveFeedback}
              className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-neutral-700 dark:text-neutral-200 hover:text-emerald-600 dark:hover:text-emerald-400 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-300 font-semibold text-xs inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Yes</span>
            </button>

            <button
              onClick={handleNegativeFeedback}
              className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-neutral-700 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 border border-neutral-200 dark:border-neutral-700 hover:border-rose-300 font-semibold text-xs inline-flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <ThumbsDown className="w-4 h-4" />
              <span>No</span>
            </button>
          </div>
        )}

        {feedbackStatus === 'yes' && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in zoom-in-95 duration-200">
            <Heart className="w-4 h-4 fill-current text-rose-500 animate-pulse" />
            <span>Glad it helped! ❤️</span>
          </div>
        )}
      </div>

      {feedbackStatus === 'no' && !submitted && (
        <form onSubmit={handleImprovementSubmit} className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 animate-in fade-in duration-200 space-y-3">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            What could we improve? (Optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Add state subsidy option, fix formula step, or simplify inputs..."
              value={improvementText}
              onChange={e => setImprovementText(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-accent"
              maxLength={250}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs inline-flex items-center gap-1.5 hover:bg-accent/90 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
              <button
                type="button"
                onClick={() => setFeedbackStatus('idle')}
                className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {submitted && (
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Feedback received! Thank you for helping us make BharatUtility better.</span>
        </div>
      )}
    </div>
  );
};
