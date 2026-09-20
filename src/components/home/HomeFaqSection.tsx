import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const HOME_FAQS: FaqItem[] = [
  {
    question: 'What is BharatUtility and what tools are available?',
    answer: 'BharatUtility is a free, all-in-one Indian online utility platform. It features 220+ calculators and utilities covering personal finance (EMI, SIP, GST, Salary, SSY), citizen lookups (PIN Code, IFSC, MICR, RTO), document processing (PDF merge, signature resizing, JPG to PDF), vehicle trip calculators, unit converters, and educational grade conversions.'
  },
  {
    question: 'Are all BharatUtility tools completely free to use?',
    answer: 'Yes, 100% of the calculators, lookups, and document converters on BharatUtility are completely free to use. There are no paid tiers, hidden subscriptions, or limits on how many calculations or conversions you can perform.'
  },
  {
    question: 'Do I need to create an account or sign up?',
    answer: 'No sign-up or login is ever required. You can immediately open any tool, calculate, convert files, copy results, or download reports without providing your phone number or email.'
  },
  {
    question: 'Is my personal financial and calculation data secure and private?',
    answer: 'Yes. Calculations, document compression, and unit conversions execute 100% locally on your device inside your browser using client-side JavaScript. Your salary, loan numbers, tax details, and uploaded documents are never transmitted to or stored on external servers.'
  },
  {
    question: 'Do BharatUtility tools work on mobile phones and offline?',
    answer: 'Yes. BharatUtility is designed mobile-first with touch-friendly sliders, responsive layouts, and PWA (Progressive Web App) offline caching so you can continue using mathematical calculators even with poor or zero internet connectivity.'
  },
  {
    question: 'How do I quickly find the exact tool I need?',
    answer: 'You can use the instant search bar at the top of the homepage, press Ctrl+K (or Cmd+K) anywhere on the website to open the Quick Search Spotlight, or browse tools categorized under Money, Business, Citizen Services, Travel, Documents, and more.'
  }
];

export const HomeFaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-1.5 sm:py-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5 sm:mb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
            <HelpCircle className="w-3 h-3" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white font-display">
            Frequently Asked Questions
          </h2>
        </div>
        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
          Everything you need to know about calculations, privacy & usage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
        {HOME_FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs transition-colors self-start"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-2.5 sm:p-3 text-left flex items-center justify-between gap-2.5 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <span className="font-bold text-xs text-neutral-900 dark:text-white leading-snug">
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-3.5 h-3.5 text-accent shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-2.5 pb-2.5 sm:px-3 sm:pb-3 pt-0 text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/80">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
