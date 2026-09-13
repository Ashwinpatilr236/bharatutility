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
              <strong>BharatUtility</strong> is India's Digital Utility Super-App — a 100% free, community-first online platform built to simplify everyday Indian financial, legal, citizen, travel, educational, and technical calculations in one unified, lightning-fast web experience.
            </p>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white pt-2">Our Mission & Principles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                  <span className="text-base">🔒</span>
                  <span>100% Client-Side Privacy</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Your calculations, loan figures, PIN codes, and documents are processed locally in your browser. We never harvest, track, or sell your private numbers.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                  <span className="text-base">🌐</span>
                  <span>Open Data & Public APIs</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  We leverage open-source algorithms, official Government guidelines, and free public data feeds (like India Post, Razorpay IFSC, ISRO, and Open-Meteo) for real-time accuracy.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                  <span className="text-base">🇮🇳</span>
                  <span>Indian Context-Specific</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Formulas are specifically tailored for Indian tax slabs, regional land metrics (Gaj, Bigha, Guntha), RTO codes, BNS legal sections, and Central/State welfare schemes.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-neutral-900 dark:text-white">
                  <span className="text-base">⚡</span>
                  <span>Zero Paywalls & No Logins</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Every tool is instant, ad-light, and completely free forever. No registration, no app downloads, and no credit card required.
                </p>
              </div>
            </div>

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
              Public Data, Government Schemes & Calculation Disclaimer
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              The calculations, formulas, estimates, and data displayed on BharatUtility (including but not limited to Government Schemes like SSY, PM Surya Ghar, Ayushman Bharat, PM Mudra, APY, as well as Loan EMI, Income Tax, GST, and IFSC/PIN Lookups) are provided solely for informational, estimation, and educational purposes.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <p className="font-bold">⚠️ Non-Affiliation & Independent Platform Notice:</p>
              <p>
                BharatUtility is an independent public digital utility platform and is not affiliated with, endorsed by, or operated on behalf of any government agency, ministry, or banking institution. All scheme information and eligibility metrics are based on publicly published government notifications, gazettes, and official circulars.
              </p>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              While we make every effort to maintain absolute precision and keep interest rates and formulas updated, actual bank charges, compounding frequencies, and administrative approvals may vary. Users are advised to consult official government portals or certified financial advisors for formal transactions.
            </p>
          </div>
        )}

        {page === 'privacy' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Privacy Policy & Open Data Framework
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              At BharatUtility, user privacy is our foundational promise. We believe utility tools should be powerful without compromising your private figures or personal identity.
            </p>
            
            <h3 className="text-base font-bold text-neutral-900 dark:text-white pt-2">1. In-Browser Client-Side Processing</h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              All financial calculations, salary estimators, PDF tools, image compressors, QR decoders, and voice synthesizers run <strong>100% locally inside your web browser</strong> using native JavaScript, Web Audio, and Web Canvas APIs. Your data never leaves your device.
            </p>

            <h3 className="text-base font-bold text-neutral-900 dark:text-white pt-2">2. Open APIs & Public Data Sources</h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              For live real-time features (such as Indian PIN Code directory, Bank IFSC lookups, ISRO satellite launches, Live ISS space tracking, and Weather/AQI forecasts), we query publicly accessible, open APIs and public datasets. These queries contain only the specific lookup key (e.g. 6-digit PIN code) and zero personally identifiable information.
            </p>

            <h3 className="text-base font-bold text-neutral-900 dark:text-white pt-2">3. Feature & API Removal / Takedown Request Policy</h3>
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
              <p className="font-bold">📢 Notice for API Providers & Content Owners:</p>
              <p>
                BharatUtility is committed to fair open-data use and honoring service provider guidelines. If you are an API provider, institutional authority, or copyright owner and wish to modify, attribute, or request the immediate removal of any feature or API integration from our platform, please reach out to our dedicated support team at:
              </p>
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-accent">
                <Mail className="w-4 h-4" />
                <span>support@bharatutility.tech</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                All legitimate modification or takedown requests are processed and resolved within <strong>24 to 48 hours</strong>.
              </p>
            </div>
          </div>
        )}

        {page === 'terms' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              By accessing and using BharatUtility (https://bharatutility.tech), you agree to these Terms of Service. These tools are provided free of charge for personal, professional, and commercial calculation convenience.
            </p>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white pt-2">Permitted Use</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>You may freely use any calculator, letter template, document converter, or diagnostic utility for individual or business purposes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>You may embed or share generated PDFs, invoices, and calculation results without royalty or licensing fees.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Automated scraping, denial-of-service attempts, or reverse-engineering of backend endpoints is strictly prohibited.</span>
              </li>
            </ul>
          </div>
        )}

        {page === 'contact' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Contact & Support
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Have a suggestion for a new Indian utility calculator, noticed a formula update, or wish to submit an API coordination request? We are here to help!
            </p>
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-semibold text-sm">
                <Mail className="w-4 h-4 text-accent" />
                <span>support@bharatutility.tech</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Official support email for general inquiries, feature suggestions, partnership requests, and API takedown coordination.
              </p>
              <div className="flex items-center gap-2 pt-2 text-[11px] text-neutral-500 dark:text-neutral-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Average Response Time: 24 to 48 hours</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
