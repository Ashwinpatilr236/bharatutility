import React from 'react';
import { ShieldCheck, Zap, Smartphone, Sparkles, HeartHandshake } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trustPoints = [
    {
      icon: Zap,
      title: 'Lightning Fast Calculations',
      description: 'Zero loading spinners for mathematical operations. Instant reactive inputs that update as you type or adjust sliders.',
    },
    {
      icon: ShieldCheck,
      title: '100% Private & Client-Side',
      description: 'Your financial salary, loan amounts, and personal dates never leave your browser. Zero tracking of sensitive calculation numbers.',
    },
    {
      icon: Smartphone,
      title: 'Crafted for Indian Mobile Users',
      description: 'Optimized touch targets, one-handed slider controls, and fast rendering on 4G/5G Indian mobile networks.',
    },
    {
      icon: HeartHandshake,
      title: '100% Free Forever',
      description: 'No forced paywalls, no login obstacles, and no mandatory app installations. Use whenever you need.',
    },
  ];

  return (
    <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
          Why People Across India Use BharatUtility
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
          Designed from the ground up for speed, mathematical accuracy, and effortless utility.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {trustPoints.map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 text-left shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center mb-4">
              <item.icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display mb-1.5">
              {item.title}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Parent Company Ecosystem Callout Banner */}
      <div className="mt-10 p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-base shrink-0">
            🏢
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display">An ARRJS Technologies Ecosystem Product</h4>
            <p className="text-xs text-neutral-400">BharatUtility is engineered and operated under the ARRJS Technologies digital software division.</p>
          </div>
        </div>
        <a
          href="https://arrjs-technologies.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-all shrink-0 inline-flex items-center gap-1.5 shadow-xs"
        >
          <span>Explore Parent Website ↗</span>
        </a>
      </div>
    </section>
  );
};
