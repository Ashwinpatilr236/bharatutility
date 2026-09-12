import React from 'react';
import { TOOLS_REGISTRY } from '../../data/toolsRegistry';
import { ShieldCheck, ArrowUp } from 'lucide-react';
import { Link } from './Link';
import { LiveVisitorsBadge } from './LiveVisitorsBadge';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-12 border-t border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                ₹U
              </div>
              <span className="font-extrabold text-xl font-display tracking-tight text-neutral-900 dark:text-white">
                Bharat<span className="text-accent">Utility</span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 max-w-sm">
              Useful tools for everyday India. Fast, privacy-friendly, and 100% free calculations tailored for Indian tax slabs, land units, loan formats, and everyday utilities.
            </p>

            {/* Live Visitors Counter in Footer */}
            <div className="pt-1">
              <LiveVisitorsBadge variant="footer" />
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>No login required • Client-side private calculations</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3 font-display">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/tools"
                  className="hover:text-accent dark:hover:text-white transition-colors text-left"
                >
                  All Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/favorites"
                  className="hover:text-accent dark:hover:text-white transition-colors text-left"
                >
                  Favorites
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="hover:text-accent dark:hover:text-white transition-colors text-left"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/request-tool"
                  className="hover:text-accent dark:hover:text-white transition-colors text-left font-medium text-accent"
                >
                  Request a Tool
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-accent dark:hover:text-white transition-colors text-left"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Calculators */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3 font-display">
              Popular Tools
            </h4>
            <ul className="space-y-2 text-xs">
              {[
                'emi-calculator',
                'sip-calculator',
                'gst-calculator',
                'salary-calculator',
                'fd-calculator',
                'age-calculator',
                'percentage-calculator',
                'unit-converter'
              ].map(slug => {
                const tool = TOOLS_REGISTRY.find(t => t.slug === slug);
                if (!tool) return null;
                return (
                  <li key={slug}>
                    <Link
                      to={`/tools/${slug}`}
                      className="hover:text-accent dark:hover:text-white transition-colors text-left"
                    >
                      {tool.shortName || tool.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white mb-3 font-display">
              Trust & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/about"
                  className="hover:text-accent dark:hover:text-white transition-colors"
                >
                  About BharatUtility
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/disclaimer"
                  className="hover:text-accent dark:hover:text-white transition-colors"
                >
                  Calculation Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/privacy"
                  className="hover:text-accent dark:hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/legal/terms"
                  className="hover:text-accent dark:hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-accent dark:hover:text-white transition-colors"
                >
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Parent Company Ecosystem Attribution Banner */}
        <div className="mt-10 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏢</span>
            <div>
              <span className="font-bold text-neutral-900 dark:text-white font-display">Part of the ARRJS Technologies Ecosystem</span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                BharatUtility is an India-focused public utility platform developed & operated by <strong>ARRJS Technologies</strong>.
              </p>
            </div>
          </div>
          <a
            href="https://arrjs-technologies.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all shrink-0 inline-flex items-center gap-1 shadow-xs"
          >
            <span>Visit Parent Site (ARRJS Tech) ↗</span>
          </a>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-900 text-[11px] text-neutral-400 dark:text-neutral-500 leading-normal">
          <p>
            <strong>Disclaimer:</strong> BharatUtility calculators and generators provide estimates for general informational purposes based on Indian standard financial, mathematical, and tax formulas. Actual loan interest, income tax assessments, and material estimates may vary depending on state policies, bank guidelines, and specific vendor parameters.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} BharatUtility • A Flagship Division of <a href="https://arrjs-technologies.netlify.app/" target="_blank" rel="noopener noreferrer" className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-accent underline">ARRJS Technologies</a>. Built for everyday India.</p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
