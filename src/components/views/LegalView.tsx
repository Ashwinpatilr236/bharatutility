import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, FileText, Info, Mail, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface LegalViewProps {
  page: 'privacy' | 'terms' | 'disclaimer' | 'about' | 'contact';
}

export const LegalView: React.FC<LegalViewProps> = ({ page }) => {
  const { navigateToLegal, navigateToContact, navigateToRequestTool, navigateToHome } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: navigateToHome },
          { label: 'Legal & Info', active: true }
        ]}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80">
        {[
          { id: 'about', label: 'About BharatUtility' },
          { id: 'disclaimer', label: 'Disclaimer' },
          { id: 'privacy', label: 'Privacy Policy' },
          { id: 'terms', label: 'Terms of Use' },
          { id: 'contact', label: 'Contact Us' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'contact') {
                navigateToContact();
              } else {
                navigateToLegal(tab.id as any);
              }
            }}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
              page === tab.id
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
        {page === 'about' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              About BharatUtility
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong>BharatUtility</strong> is India's Utility Super-Site - an independent online platform bringing together practical calculators, finance tools, document tools and everyday digital utilities in one place. Designed specifically for Indian users, BharatUtility offers fast, private, client-side tools - requiring zero sign-up or user account registration.
            </p>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white pt-2">What We Offer</h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Our utility collection includes loan EMI calculators, mutual fund SIP planners, GST invoice tools, CTC to in-hand salary converters, bank FD maturity calculators, age calculators, multi-unit converters, fuel trip cost estimators, CGPA-to-percentage converters, paint & tile estimators, and formal letter generators.
            </p>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white pt-2">Why People Choose BharatUtility</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Indian Financial Accuracy:</strong> Aligned with FY 2024-25 / FY 2025-26 New Tax Regime slabs, the ₹75,000 standard deduction, and Indian commercial bank compounding conventions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Regional Land Metrics:</strong> Native unit conversion support for Gaj, Bigha, Guntha, Cent, Biswa, Ground, and Acres used across Indian states.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Privacy-First & Free:</strong> All calculations run 100% locally on your browser with zero data storage, zero paywalls, and zero account registration required.</span>
              </li>
            </ul>

            {/* Parent Company Callout Banner */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/15 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 font-display">
                <span className="text-lg">🏢</span>
                <span>Parent Company & Technology Ecosystem</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <strong>BharatUtility</strong> is developed, operated, and maintained as a flagship public utility platform under <strong>ARRJS Technologies</strong>.
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                ARRJS Technologies is a modern technology software house engineering consumer digital products, healthcare operational software (Clinical Hub), custom full-stack web applications, and enterprise IT infrastructure.
              </p>
              <div className="pt-1">
                <a
                  href="https://arrjs-technologies.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs shadow-xs hover:scale-102 transition-all"
                >
                  <span>Visit Parent Website: ARRJS Technologies ↗</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {page === 'disclaimer' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Financial & Calculation Disclaimer
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              The calculations, estimates, formulas, and results provided on BharatUtility (including but not limited to Loan EMI, Mutual Fund SIP, In-Hand Salary, GST, and Fixed Deposits) are intended solely for informational, planning, and educational purposes.
            </p>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              While we strive to ensure that all financial formulas and tax slab rules match official Indian government notifications and standard banking conventions, actual financial results may vary depending on bank processing fees, compounding dates, and individual tax circumstances. BharatUtility is not a certified Chartered Accountant or registered SEBI financial advisor.
            </p>
          </div>
        )}

        {page === 'privacy' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              At BharatUtility, we take your privacy extremely seriously. We believe utility tools should respect your confidential numbers and personal information.
            </p>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <strong>Zero Data Selling:</strong> We do not log, sell, or transmit your salary numbers, loan amounts, age, or letter templates to third-party databases. All state is maintained locally in your browser session.
            </div>
          </div>
        )}

        {page === 'terms' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              By accessing BharatUtility, you agree to use these tools for lawful personal or business calculations. The services are provided "as is" without warranty of uninterrupted availability.
            </p>
          </div>
        )}

        {page === 'contact' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Contact & Support
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Have a suggestion for a new Indian utility calculator or noticed a formula discrepancy? We would love to hear from you!
            </p>
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-semibold">
                <Mail className="w-4 h-4 text-accent" />
                <span>support@bharatutility.tech</span>
              </div>
              <p className="text-neutral-500">We typically respond to community feature requests and formula inquiries within 24–48 hours.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
