import React, { useState } from 'react';
import { Tool } from '../../types';
import { useApp } from '../../context/AppContext';
import { getToolBySlug } from '../../data/toolsRegistry';
import { CATEGORIES } from '../../data/categories';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DynamicIcon } from '../common/DynamicIcon';
import { ShareModal } from '../common/ShareModal';
import { AdSlot } from '../common/AdSlot';
import { ToolFeedbackWidget } from '../common/ToolFeedbackWidget';
import { RequestToolCta } from '../common/RequestToolCta';
import { BookmarkPrompt } from '../common/BookmarkPrompt';

// Lazy-loaded Calculator Components for isolated bundle chunks & instant public loading
const EmiCalculator = React.lazy(() => import('../calculators/EmiCalculator').then(m => ({ default: m.EmiCalculator })));
const SipCalculator = React.lazy(() => import('../calculators/SipCalculator').then(m => ({ default: m.SipCalculator })));
const FdCalculator = React.lazy(() => import('../calculators/FdCalculator').then(m => ({ default: m.FdCalculator })));
const GstCalculator = React.lazy(() => import('../calculators/GstCalculator').then(m => ({ default: m.GstCalculator })));
const SalaryCalculator = React.lazy(() => import('../calculators/SalaryCalculator').then(m => ({ default: m.SalaryCalculator })));
const AgeCalculator = React.lazy(() => import('../calculators/AgeCalculator').then(m => ({ default: m.AgeCalculator })));
const PercentageCalculator = React.lazy(() => import('../calculators/PercentageCalculator').then(m => ({ default: m.PercentageCalculator })));
const DateDifferenceCalculator = React.lazy(() => import('../calculators/DateDifferenceCalculator').then(m => ({ default: m.DateDifferenceCalculator })));
const UnitConverter = React.lazy(() => import('../calculators/UnitConverter').then(m => ({ default: m.UnitConverter })));
const ElectricityCalculator = React.lazy(() => import('../calculators/ElectricityCalculator').then(m => ({ default: m.ElectricityCalculator })));
const PaintCalculator = React.lazy(() => import('../calculators/PaintCalculator').then(m => ({ default: m.PaintCalculator })));
const TileCalculator = React.lazy(() => import('../calculators/TileCalculator').then(m => ({ default: m.TileCalculator })));
const MarksPercentageCalculator = React.lazy(() => import('../calculators/MarksPercentageCalculator').then(m => ({ default: m.MarksPercentageCalculator })));
const CgpaCalculator = React.lazy(() => import('../calculators/CgpaCalculator').then(m => ({ default: m.CgpaCalculator })));
const FuelCostCalculator = React.lazy(() => import('../calculators/FuelCostCalculator').then(m => ({ default: m.FuelCostCalculator })));
const LetterGenerator = React.lazy(() => import('../calculators/LetterGenerator').then(m => ({ default: m.LetterGenerator })));
const BusinessSuiteCalculator = React.lazy(() => import('../calculators/BusinessSuiteCalculator').then(m => ({ default: m.BusinessSuiteCalculator })));
const TechnologySuiteCalculator = React.lazy(() => import('../calculators/TechnologySuiteCalculator').then(m => ({ default: m.TechnologySuiteCalculator })));
const ConstructionSuiteCalculator = React.lazy(() => import('../calculators/ConstructionSuiteCalculator').then(m => ({ default: m.ConstructionSuiteCalculator })));
const EducationSuiteCalculator = React.lazy(() => import('../calculators/EducationSuiteCalculator').then(m => ({ default: m.EducationSuiteCalculator })));
const DateTimeSuiteCalculator = React.lazy(() => import('../calculators/DateTimeSuiteCalculator').then(m => ({ default: m.DateTimeSuiteCalculator })));

import {
  Star,
  Share2,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Calculator,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';

interface ToolPageLayoutProps {
  tool: Tool;
}

export const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ tool }) => {
  const {
    isFavorite,
    toggleFavorite,
    addCalculationHistory,
    showToast,
    navigateToTool,
    navigateToCategory
  } = useApp();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [calculationSummary, setCalculationSummary] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const category = CATEGORIES.find(c => c.id === tool.category);
  const fav = isFavorite(tool.slug);

  const handleResultChange = (summary: string, params: Record<string, any>) => {
    setCalculationSummary(summary);
    addCalculationHistory({
      toolId: tool.id,
      toolName: tool.name,
      toolSlug: tool.slug,
      summary,
      params
    });
  };

  const copyResultSnapshot = () => {
    if (!calculationSummary) {
      showToast('Perform a calculation first to copy results', 'info');
      return;
    }
    navigator.clipboard.writeText(`${tool.name} Result:\n${calculationSummary}\nCalculated via BharatUtility`);
    showToast('Calculation snapshot copied to clipboard!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const relatedTools = (tool.relatedToolSlugs || [])
    .map(slug => getToolBySlug(slug))
    .filter((t): t is Tool => Boolean(t));

  // Render the matching calculator component
  const renderCalculatorComponent = () => {
    switch (tool.id) {
      case 'emi-calculator':
      case 'home-loan-emi-calculator':
      case 'car-loan-emi-calculator':
      case 'personal-loan-emi-calculator':
      case 'loan-prepayment-calculator':
      case 'loan-eligibility-calculator':
        return <EmiCalculator onResultChange={handleResultChange} />;

      case 'sip-calculator':
      case 'mutual-fund-lumpsum-calculator':
      case 'sip-goal-planner':
        return <SipCalculator onResultChange={handleResultChange} />;

      case 'fd-calculator':
      case 'rd-calculator':
      case 'ppf-calculator':
      case 'epf-calculator':
      case 'gratuity-calculator':
      case 'compound-interest-calculator':
      case 'simple-interest-calculator':
        return <FdCalculator onResultChange={handleResultChange} />;

      case 'gst-calculator':
      case 'discount-calculator':
        return <GstCalculator onResultChange={handleResultChange} />;

      case 'salary-calculator':
      case 'income-tax-calculator':
        return <SalaryCalculator onResultChange={handleResultChange} />;

      case 'age-calculator':
      case 'next-birthday-calculator':
        return <AgeCalculator onResultChange={handleResultChange} />;

      case 'percentage-calculator':
      case 'ratio-calculator':
      case 'average-calculator':
        return <PercentageCalculator onResultChange={handleResultChange} />;

      case 'date-difference-calculator':
        return <DateDifferenceCalculator onResultChange={handleResultChange} />;

      case 'unit-converter':
        return <UnitConverter onResultChange={handleResultChange} />;

      case 'electricity-calculator':
      case 'ac-power-calculator':
        return <ElectricityCalculator onResultChange={handleResultChange} />;

      case 'paint-calculator':
        return <PaintCalculator onResultChange={handleResultChange} />;

      case 'tile-calculator':
        return <TileCalculator onResultChange={handleResultChange} />;

      case 'marks-percentage-calculator':
        return <MarksPercentageCalculator onResultChange={handleResultChange} />;

      case 'cgpa-calculator':
      case 'sgpa-calculator':
        return <CgpaCalculator onResultChange={handleResultChange} />;

      case 'fuel-cost-calculator':
      case 'mileage-calculator':
      case 'road-trip-cost-splitter':
        return <FuelCostCalculator onResultChange={handleResultChange} />;

      case 'letter-generator':
      case 'resignation-letter-generator':
      case 'leave-application-generator':
      case 'noc-application-generator':
      case 'bank-account-closure-letter':
      case 'rent-agreement-draft':
        return <LetterGenerator onResultChange={handleResultChange} />;

      // Business Tools
      case 'profit-margin-calculator':
        return <BusinessSuiteCalculator initialMode="margin" onResultChange={handleResultChange} />;
      case 'break-even-calculator':
        return <BusinessSuiteCalculator initialMode="breakeven" onResultChange={handleResultChange} />;
      case 'sales-commission-calculator':
        return <BusinessSuiteCalculator initialMode="commission" onResultChange={handleResultChange} />;
      case 'salary-cost-to-company-calculator':
        return <BusinessSuiteCalculator initialMode="salary-cost" onResultChange={handleResultChange} />;
      case 'business-loan-calculator':
        return <BusinessSuiteCalculator initialMode="business-loan" onResultChange={handleResultChange} />;

      // Technology Tools
      case 'download-time-calculator':
        return <TechnologySuiteCalculator initialMode="download" onResultChange={handleResultChange} />;
      case 'data-usage-calculator':
        return <TechnologySuiteCalculator initialMode="data-usage" onResultChange={handleResultChange} />;
      case 'digital-storage-converter':
        return <TechnologySuiteCalculator initialMode="storage" onResultChange={handleResultChange} />;
      case 'tv-viewing-distance-calculator':
        return <TechnologySuiteCalculator initialMode="screen" onResultChange={handleResultChange} />;
      case 'wifi-diagnostics-guide':
        return <TechnologySuiteCalculator initialMode="wifi" onResultChange={handleResultChange} />;
      case 'dth-channel-cost-calculator':
        return <TechnologySuiteCalculator initialMode="dth" onResultChange={handleResultChange} />;

      // Construction & Land Tools
      case 'construction-material-estimator':
        return <ConstructionSuiteCalculator initialMode="materials" onResultChange={handleResultChange} />;
      case 'indian-land-area-converter':
        return <ConstructionSuiteCalculator initialMode="land-area" onResultChange={handleResultChange} />;
      case 'water-tank-capacity-calculator':
        return <ConstructionSuiteCalculator initialMode="water-tank" onResultChange={handleResultChange} />;

      // Education Tools
      case 'attendance-calculator':
        return <EducationSuiteCalculator initialMode="attendance" onResultChange={handleResultChange} />;
      case 'study-hours-planner':
        return <EducationSuiteCalculator initialMode="study-time" onResultChange={handleResultChange} />;

      // Date Time Tools
      case 'add-subtract-days-calculator':
        return <DateTimeSuiteCalculator initialMode="add-days" onResultChange={handleResultChange} />;
      case 'working-days-calculator':
        return <DateTimeSuiteCalculator initialMode="working-days" onResultChange={handleResultChange} />;
      case 'ist-time-zone-converter':
        return <DateTimeSuiteCalculator initialMode="timezone" onResultChange={handleResultChange} />;
      case 'date-to-day-finder':
        return <DateTimeSuiteCalculator initialMode="date-to-day" onResultChange={handleResultChange} />;

      default:
        return <EmiCalculator onResultChange={handleResultChange} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => window.location.hash = '#/' },
          {
            label: category ? category.name : 'Calculators',
            onClick: () => category && navigateToCategory(category.id)
          },
          { label: tool.shortName || tool.name, active: true }
        ]}
      />

      {/* Tool Header Banner */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/20 text-accent dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200/80 dark:border-neutral-700/60 shadow-xs">
              <DynamicIcon name={tool.icon} className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
                  {tool.name}
                </h1>
                {tool.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
                {tool.description}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={() => toggleFavorite(tool.slug)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                fav
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
              }`}
              title={fav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-4 h-4 ${fav ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">{fav ? 'Favorited' : 'Favorite'}</span>
            </button>

            <button
              onClick={() => setIsShareModalOpen(true)}
              className="p-2.5 rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Share this tool"
            >
              <Share2 className="w-4 h-4 text-accent" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {calculationSummary && (
              <button
                onClick={copyResultSnapshot}
                className="p-2.5 rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Copy calculated result"
              >
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Result</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl border bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Print page"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Calculator Area */}
      <div id="calculator-workbench">
        <React.Suspense
          fallback={
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm animate-pulse space-y-6">
              <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="h-12 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl"></div>
                  <div className="h-12 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl"></div>
                  <div className="h-12 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl"></div>
                </div>
                <div className="h-56 bg-neutral-100 dark:bg-neutral-800/60 rounded-2xl"></div>
              </div>
            </div>
          }
        >
          {renderCalculatorComponent()}
        </React.Suspense>
      </div>

      {/* Bookmark BharatUtility Prompt */}
      <BookmarkPrompt variant="card" />

      {/* Ad Slot Banner between Calculator and Formula */}
      <AdSlot format="horizontal" />

      {/* Formula & Explanation Section */}
      {tool.formulaDescription && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <BookOpen className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
              Formula & Calculation Methodology
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {tool.formulaDescription}
          </p>

          {tool.formulaLatex && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/50 font-mono text-sm text-neutral-900 dark:text-neutral-200 overflow-x-auto">
              <code>{tool.formulaLatex}</code>
            </div>
          )}
        </div>
      )}

      {/* Step-by-Step Worked Indian Example */}
      {tool.workedExample && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
              Real-World Worked Example
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 space-y-2.5">
            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Scenario:
            </div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              {tool.workedExample.inputSummary}
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                Calculation Steps:
              </span>
              <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300 list-disc list-inside">
                {tool.workedExample.calculationSteps.map((step, idx) => (
                  <li key={idx} className="font-mono text-xs">{step}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-accent/10 text-accent font-semibold text-xs mt-3">
              {tool.workedExample.finalResult}
            </div>
          </div>
        </div>
      )}

      {/* Frequently Asked Questions (FAQ) Section */}
      {tool.faqs && tool.faqs.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <HelpCircle className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-display">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {tool.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 bg-neutral-50/50 dark:bg-neutral-800/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white dark:bg-neutral-900 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Related Tools Recommendation Grid */}
      {relatedTools.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            Related Everyday Indian Tools
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map(rt => (
              <button
                key={rt.id}
                onClick={() => navigateToTool(rt.slug)}
                className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-left hover:border-accent hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                  <DynamicIcon name={rt.icon} className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-accent transition-colors line-clamp-1">
                  {rt.name}
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1">
                  {rt.tagline}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tool Feedback & Rating Widget */}
      <ToolFeedbackWidget toolSlug={tool.slug} toolName={tool.name} />

      {/* Request a Tool CTA Card */}
      <RequestToolCta initialToolName={tool.name} variant="card" />

      {/* Share Modal Dialog */}
      <ShareModal
        tool={tool}
        calculationSummary={calculationSummary}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
