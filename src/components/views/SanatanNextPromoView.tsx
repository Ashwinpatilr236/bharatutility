import React from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Link } from '../common/Link';
import {
  ExternalLink,
  Sparkles,
  BookOpen,
  Calendar,
  Compass,
  MapPin,
  Flame,
  ShieldCheck,
  Code2,
  Layers,
  ArrowRight,
  Sun,
  Globe2,
  CheckCircle2,
  Heart
} from 'lucide-react';

export const SanatanNextPromoView: React.FC = () => {
  const { navigateToHome, navigateToAllTools } = useApp();

  const SANATAN_NEXT_URL = 'https://sanatannext.netlify.app/';
  const SANATAN_NEXT_GITHUB_URL = 'https://github.com/Ashwinpatilr236/sanatannext';
  const ARRJS_TECH_URL = 'https://arrjs-technologies.netlify.app/';

  const exploreFeatures = [
    {
      icon: Flame,
      title: '12 Sacred Jyotirlingas',
      tagline: 'Somnath to Kashi Vishwanath',
      description: 'Comprehensive guides to the 12 sacred Jyotirlinga shrines across India with sthala mahatmya, history, geographical routes, and temple timings.',
      badge: 'Sacred Geography',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
    },
    {
      icon: MapPin,
      title: '51 Shakti Peeth Shrines',
      tagline: 'Divine Shrines Across the Subcontinent',
      description: 'Explore the 51 revered Shakti Peeth locations across India, Nepal, and neighboring regions with body part associations and spiritual context.',
      badge: 'Spiritual Heritage',
      color: 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
    },
    {
      icon: Calendar,
      title: 'Sanatan Panchang & Tithi',
      tagline: 'Solar & Lunar Hindu Calendar',
      description: 'Accurate daily tithi, nakshatra, paksha, rahu kaal, auspicious muhurats, and solar transitions for daily spiritual mindfulness.',
      badge: 'Daily Guide',
      color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
    },
    {
      icon: Sparkles,
      title: 'Festivals, Vrats & Utsavs',
      tagline: 'Significance, Timelines & Rituals',
      description: 'Discover the cultural background, fasting rules, significance, and stories behind major Sanatan festivals like Diwali, Holi, Navratri, and Shivratri.',
      badge: 'Culture & Traditions',
      color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400'
    },
    {
      icon: BookOpen,
      title: 'Indian Traditions & Shlokas',
      tagline: 'Timeless Wisdom for Modern Life',
      description: 'Clear explanations of daily customs, the scientific and philosophical significance behind traditions, and selected sacred shlokas with Hindi & English meanings.',
      badge: 'Knowledge',
      color: 'from-amber-500/20 to-emerald-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
    },
    {
      icon: Globe2,
      title: 'State-wise Cultural Heritage',
      tagline: 'Diverse Traditions Across Bharat',
      description: 'A structured journey through regional temple architectures, sacred rivers, folk traditions, and local heritage across all Indian states and regions.',
      badge: 'Regional Diversity',
      color: 'from-teal-500/20 to-amber-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16 animate-in fade-in duration-200">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: navigateToHome },
          { label: 'Sanatan Next Showcase', active: true }
        ]}
      />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-neutral-50 dark:from-neutral-900 dark:via-neutral-900/90 dark:to-neutral-950 border border-amber-200/70 dark:border-amber-500/20 p-6 sm:p-12 shadow-sm text-center lg:text-left">
        {/* Subtle background heritage glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            {/* Ecosystem Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-spin-slow" />
              <span>PART OF ARRJS TECHNOLOGIES ECOSYSTEM • STANDALONE PLATFORM</span>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
                SANATAN <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 bg-clip-text text-transparent">NEXT</span>
              </h1>
              <p className="text-lg sm:text-2xl font-bold text-amber-700 dark:text-amber-400 font-display italic">
                &ldquo;Aane wali peedhi ke liye Sanatan gyan&rdquo;
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
              Explore Sanatan knowledge, traditions, festivals, sacred places, and cultural heritage through a modern, elegant digital platform. Built to make timeless Indian wisdom accessible, structured, and easy to discover for upcoming generations.
            </p>

            {/* CTA Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <a
                href={SANATAN_NEXT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm sm:text-base shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.99] transition-all inline-flex items-center gap-2.5"
              >
                <span>Explore Sanatan Next</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={SANATAN_NEXT_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/80 font-bold text-sm shadow-2xs hover:scale-[1.02] active:scale-[0.99] transition-all inline-flex items-center gap-2"
              >
                <Code2 className="w-4 h-4 text-neutral-500" />
                <span>View on GitHub</span>
              </a>
            </div>

            {/* Standalone Clarification note */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Opens the standalone website at <strong>sanatannext.netlify.app</strong> • 100% Free to use</span>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl bg-white/90 dark:bg-neutral-800/90 border border-amber-200/80 dark:border-amber-500/30 p-6 shadow-xl backdrop-blur-xs space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-sm">
                    ॐ
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white block">Sanatan Next</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">sanatannext.netlify.app</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Live Project
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>51 Shakti Peeth Geography & Guides</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>12 Jyotirlinga Darshan & Route Maps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Daily Hindu Panchang & Auspicious Muhurats</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Festival Significance, Vrats & Rituals</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>State-wise Traditions & Shloka Insights</span>
                </div>
              </div>

              <a
                href={SANATAN_NEXT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold text-center block transition-colors"
              >
                Visit sanatannext.netlify.app ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What is Sanatan Next? */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            About the Initiative
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            What is Sanatan Next?
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Sanatan Next is a free digital platform created to make Sanatan knowledge, traditions and cultural heritage easier to discover in a modern, structured and accessible format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Digital Accessibility
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Preserving rich cultural wisdom in an organized, searchable layout tailored for students, researchers, and everyday seekers across all devices.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Structured Heritage
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Making sacred geography, temple architectures, and panchang calculations intuitive with verified historical contexts and clean visual presentation.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              100% Free & Open
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Developed as a public digital initiative with zero paywalls, no subscriptions, and an open approach to knowledge dissemination.
            </p>
          </div>
        </div>
      </section>

      {/* 4. What You Can Explore (Feature Highlights) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Key Highlights
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            What You Can Explore on Sanatan Next
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Discover rich knowledge hubs, interactive sacred maps, panchang guides, and cultural insights available on the standalone website.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exploreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-amber-500/40 dark:hover:border-amber-500/40 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center border`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {feat.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {feat.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-amber-600/80 dark:text-amber-400/80 block">
                      {feat.tagline}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <a
                    href={SANATAN_NEXT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all"
                  >
                    <span>Explore on Sanatan Next</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Project Transparency & ARRJS Technologies Ecosystem */}
      <section className="rounded-3xl bg-neutral-100/80 dark:bg-neutral-900/80 border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-10 space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5 text-accent" />
            <span>PROJECT TRANSPARENCY & PHILOSOPHY</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            Built as an Independent Digital Project
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Sanatan Next is developed as a separate project with its own standalone website and codebase. Both <strong>BharatUtility</strong> and <strong>Sanatan Next</strong> are initiatives under the <strong>ARRJS Technologies</strong> ecosystem.
          </p>
        </div>

        {/* Ecosystem Tree Map */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Node 1: Parent Organization */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Parent Ecosystem</span>
            <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              ARRJS Technologies
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Technology holding organization building modern digital products and utilities for India.
            </p>
            <a
              href={ARRJS_TECH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 pt-1"
            >
              arrjs-technologies.netlify.app ↗
            </a>
          </div>

          {/* Node 2: BharatUtility (This Project) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-indigo-500/30 dark:border-indigo-500/30 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Active Website</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600">You Are Here</span>
            </div>
            <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              BharatUtility
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              100% free everyday calculations, financial calculators, document suites, and civic utilities for India.
            </p>
            <span className="text-xs font-bold text-neutral-400 block pt-1">
              bharatutility.tech
            </span>
          </div>

          {/* Node 3: Sanatan Next (Promoted Platform) */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-amber-500/40 dark:border-amber-500/40 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Featured Initiative</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600">Standalone</span>
            </div>
            <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Sanatan Next
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Digital knowledge platform for Sanatan heritage, sacred geography, panchang, and traditions.
            </p>
            <a
              href={SANATAN_NEXT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
            >
              sanatannext.netlify.app ↗
            </a>
          </div>
        </div>

        {/* Disclaimer / Honesty statement */}
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/70 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed text-center">
          <p>
            <strong>Note on Independence:</strong> Sanatan Next is a free digital knowledge and cultural exploration project. It does not claim official religious organization, government affiliation, or temple trust authority. All content is designed for educational appreciation and cultural preservation.
          </p>
        </div>
      </section>

      {/* 6. Final Discovery CTA Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-8 sm:p-12 shadow-lg text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
            Discover Sanatan Next
          </span>
          <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight">
            Ready to explore Indian heritage & traditions?
          </h2>
          <p className="text-sm text-amber-100 leading-relaxed">
            Visit the standalone Sanatan Next platform today to experience sacred geography guides, panchang tools, and traditional wisdom in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={SANATAN_NEXT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-white text-neutral-900 hover:bg-neutral-100 font-extrabold text-sm sm:text-base shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span>Launch Sanatan Next ↗</span>
          </a>

          <Link
            to="/tools"
            className="px-6 py-3.5 rounded-2xl bg-black/25 hover:bg-black/40 text-white border border-white/20 font-bold text-sm hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <span>Explore BharatUtility Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
