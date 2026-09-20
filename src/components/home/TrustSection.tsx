import React from 'react';
import { ShieldCheck, Zap, Smartphone, Sparkles, HeartHandshake } from 'lucide-react';
import { ScrollableCarousel } from '../common/ScrollableCarousel';

export const TrustSection: React.FC = () => {
  const trustPoints = [
    {
      icon: Zap,
      title: 'Zero Lag Calculations',
      description: 'Instant reactive mathematical formulas. Updates as you type without waiting for servers.',
    },
    {
      icon: ShieldCheck,
      title: '100% Private in Browser',
      description: 'Financial salary, loan data, and dates stay on your device. Zero sensitive data tracking.',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Indian UI',
      description: 'Optimized touch targets, one-handed sliders, and works reliably on 4G/5G networks.',
    },
    {
      icon: HeartHandshake,
      title: 'Free Forever, No Signup',
      description: 'No paywalls, no login obstacles, no mandatory phone numbers. Instant utility for everyone.',
    },
  ];

  return (
    <section className="py-1.5 sm:py-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5 sm:mb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">
            <ShieldCheck className="w-3 h-3" />
            <span>Guaranteed Privacy & Quality</span>
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white font-display">
            Why People Across India Rely on BharatUtility
          </h2>
        </div>
        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
          Client-side calculations • Zero tracking • High accuracy
        </p>
      </div>

      <ScrollableCarousel className="pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 gap-2 sm:gap-2.5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {trustPoints.map((item, i) => (
          <div
            key={i}
            className="p-2.5 sm:p-3 min-w-[68vw] sm:min-w-0 snap-start rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 text-left shadow-xs flex-1 hover:border-accent/40 transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mb-1.5">
              <item.icon className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white font-display mb-0.5">
              {item.title}
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </ScrollableCarousel>
    </section>
  );
};
