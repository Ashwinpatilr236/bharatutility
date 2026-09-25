import React, { useState } from 'react';
import { Tool } from '../../types';
import { useApp } from '../../context/AppContext';
import { getToolBySlug, getToolsByCategory, getPopularTools } from '../../data/toolsRegistry';
import { CATEGORIES } from '../../data/categories';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DynamicIcon } from '../common/DynamicIcon';
import { ShareModal } from '../common/ShareModal';
import { AdSlot } from '../common/AdSlot';
import { ToolFeedbackWidget } from '../common/ToolFeedbackWidget';
import { RequestToolCta } from '../common/RequestToolCta';
import { BookmarkPrompt } from '../common/BookmarkPrompt';
import { Link } from '../common/Link';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { AntigravityParticles } from '../common/AntigravityParticles';
import { FloatingBadge } from '../common/FloatingBadge';
import { ToolCard } from '../common/ToolCard';
import { ScrollableCarousel } from '../common/ScrollableCarousel';

// Lazy-loaded Calculator Components for isolated bundle chunks & instant public loading
const TdsCalculator = React.lazy(() => import('../calculators/TdsCalculator'));
const InvestmentPlanner80C80D = React.lazy(() => import('../calculators/InvestmentPlanner80C80D'));
const BreakEvenPointCalculator = React.lazy(() => import('../calculators/BreakEvenPointCalculator'));
const EmiCalculator = React.lazy(() => import('../calculators/EmiCalculator').then(m => ({ default: m.EmiCalculator })));
const SipCalculator = React.lazy(() => import('../calculators/SipCalculator').then(m => ({ default: m.SipCalculator })));
const FdCalculator = React.lazy(() => import('../calculators/FdCalculator').then(m => ({ default: m.FdCalculator })));
const GstCalculator = React.lazy(() => import('../calculators/GstCalculator').then(m => ({ default: m.GstCalculator })));
const SalaryCalculator = React.lazy(() => import('../calculators/SalaryCalculator').then(m => ({ default: m.SalaryCalculator })));
const AgeCalculator = React.lazy(() => import('../calculators/AgeCalculator').then(m => ({ default: m.AgeCalculator })));
const PercentageCalculator = React.lazy(() => import('../calculators/PercentageCalculator').then(m => ({ default: m.PercentageCalculator })));
const DateDifferenceCalculator = React.lazy(() => import('../calculators/DateDifferenceCalculator').then(m => ({ default: m.DateDifferenceCalculator })));
const UnitConverter = React.lazy(() => import('../calculators/UnitConverter').then(m => ({ default: m.UnitConverter })));
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
const IndiaServicesSuiteCalculator = React.lazy(() => import('../calculators/IndiaServicesSuiteCalculator').then(m => ({ default: m.IndiaServicesSuiteCalculator })));
const DocumentToolsSuiteCalculator = React.lazy(() => import('../calculators/DocumentToolsSuiteCalculator').then(m => ({ default: m.DocumentToolsSuiteCalculator })));
const VehicleUtilitySuiteCalculator = React.lazy(() => import('../calculators/VehicleUtilitySuiteCalculator').then(m => ({ default: m.VehicleUtilitySuiteCalculator })));
const TravelUtilitySuiteCalculator = React.lazy(() => import('../calculators/TravelUtilitySuiteCalculator').then(m => ({ default: m.TravelUtilitySuiteCalculator })));
const GovernmentSavingsSuiteCalculator = React.lazy(() => import('../calculators/GovernmentSavingsSuiteCalculator').then(m => ({ default: m.GovernmentSavingsSuiteCalculator })));
const TextAndLanguageSuiteCalculator = React.lazy(() => import('../calculators/TextAndLanguageSuiteCalculator').then(m => ({ default: m.TextAndLanguageSuiteCalculator })));
const StudentAndLandSuiteCalculator = React.lazy(() => import('../calculators/StudentAndLandSuiteCalculator').then(m => ({ default: m.StudentAndLandSuiteCalculator })));
const EnergyAndJewelrySuiteCalculator = React.lazy(() => import('../calculators/EnergyAndJewelrySuiteCalculator').then(m => ({ default: m.EnergyAndJewelrySuiteCalculator })));
const RealEstateAndRetirementSuiteCalculator = React.lazy(() => import('../calculators/RealEstateAndRetirementSuiteCalculator').then(m => ({ default: m.RealEstateAndRetirementSuiteCalculator })));
const DevAndDailySuiteCalculator = React.lazy(() => import('../calculators/DevAndDailySuiteCalculator').then(m => ({ default: m.DevAndDailySuiteCalculator })));
const HomeAndHealthSuiteCalculator = React.lazy(() => import('../calculators/HomeAndHealthSuiteCalculator').then(m => ({ default: m.HomeAndHealthSuiteCalculator })));
const QuickToolsSuiteCalculator = React.lazy(() => import('../calculators/QuickToolsSuiteCalculator').then(m => ({ default: m.QuickToolsSuiteCalculator })));
const FinanceAndInvoiceSuiteCalculator = React.lazy(() => import('../calculators/FinanceAndInvoiceSuiteCalculator').then(m => ({ default: m.FinanceAndInvoiceSuiteCalculator })));
const LifestyleAndQRSuiteCalculator = React.lazy(() => import('../calculators/LifestyleAndQRSuiteCalculator').then(m => ({ default: m.LifestyleAndQRSuiteCalculator })));
const SalaryAndGstSuiteCalculator = React.lazy(() => import('../calculators/SalaryAndGstSuiteCalculator').then(m => ({ default: m.SalaryAndGstSuiteCalculator })));
const ProductivityAndUpiSuiteCalculator = React.lazy(() => import('../calculators/ProductivityAndUpiSuiteCalculator').then(m => ({ default: m.ProductivityAndUpiSuiteCalculator })));
const SpecializedTaxAndLoanSuiteCalculator = React.lazy(() => import('../calculators/SpecializedTaxAndLoanSuiteCalculator').then(m => ({ default: m.SpecializedTaxAndLoanSuiteCalculator })));
const WorkAndHabitSuiteCalculator = React.lazy(() => import('../calculators/WorkAndHabitSuiteCalculator').then(m => ({ default: m.WorkAndHabitSuiteCalculator })));
const ChoghadiyaSuiteCalculator = React.lazy(() => import('../calculators/ChoghadiyaSuiteCalculator').then(m => ({ default: m.ChoghadiyaSuiteCalculator })));
const SpeedTypingSuiteCalculator = React.lazy(() => import('../calculators/SpeedTypingSuiteCalculator').then(m => ({ default: m.SpeedTypingSuiteCalculator })));
const SvgConverterSuiteCalculator = React.lazy(() => import('../calculators/SvgConverterSuiteCalculator').then(m => ({ default: m.SvgConverterSuiteCalculator })));
const ExamPhotoStampSuiteCalculator = React.lazy(() => import('../calculators/ExamPhotoStampSuiteCalculator').then(m => ({ default: m.ExamPhotoStampSuiteCalculator })));
const DocumentConvertersSuiteCalculator = React.lazy(() => import('../calculators/DocumentConvertersSuiteCalculator').then(m => ({ default: m.DocumentConvertersSuiteCalculator })));
const DataConvertersSuiteCalculator = React.lazy(() => import('../calculators/DataConvertersSuiteCalculator').then(m => ({ default: m.DataConvertersSuiteCalculator })));
const ImageConverterSuiteCalculator = React.lazy(() => import('../calculators/ImageConverterSuiteCalculator').then(m => ({ default: m.ImageConverterSuiteCalculator })));
const CurrencyConverterSuite = React.lazy(() => import('../calculators/CurrencyConverterSuite').then(m => ({ default: m.CurrencyConverterSuite })));
const AqiAndWeatherSuite = React.lazy(() => import('../calculators/AqiAndWeatherSuite').then(m => ({ default: m.AqiAndWeatherSuite })));
const IpInspectorSuite = React.lazy(() => import('../calculators/IpInspectorSuite').then(m => ({ default: m.IpInspectorSuite })));
const FuelPriceTrackerSuite = React.lazy(() => import('../calculators/FuelPriceTrackerSuite').then(m => ({ default: m.FuelPriceTrackerSuite })));
const QrScannerSuite = React.lazy(() => import('../calculators/QrScannerSuite').then(m => ({ default: m.QrScannerSuite })));
const LongWeekendPlannerSuite = React.lazy(() => import('../calculators/LongWeekendPlannerSuite').then(m => ({ default: m.LongWeekendPlannerSuite })));
const OnlineNotepadSuite = React.lazy(() => import('../calculators/OnlineNotepadSuite').then(m => ({ default: m.OnlineNotepadSuite })));
const OnlinePaintCanvasSuite = React.lazy(() => import('../calculators/OnlinePaintCanvasSuite').then(m => ({ default: m.OnlinePaintCanvasSuite })));

// New Mega Expansion Suites
const GovernmentSchemesSuiteCalculator = React.lazy(() => import('../calculators/GovernmentSchemesSuiteCalculator').then(m => ({ default: m.GovernmentSchemesSuiteCalculator })));
const LegalAndCitizenRightsCalculator = React.lazy(() => import('../calculators/LegalAndCitizenRightsCalculator').then(m => ({ default: m.LegalAndCitizenRightsCalculator })));
const LivePublicApisSuiteCalculator = React.lazy(() => import('../calculators/LivePublicApisSuiteCalculator').then(m => ({ default: m.LivePublicApisSuiteCalculator })));
const HardwareAndDiagnosticSuiteCalculator = React.lazy(() => import('../calculators/HardwareAndDiagnosticSuiteCalculator').then(m => ({ default: m.HardwareAndDiagnosticSuiteCalculator })));
const IndianGovtAndCivicExpansionSuite = React.lazy(() => import('../calculators/IndianGovtAndCivicExpansionSuite').then(m => ({ default: m.IndianGovtAndCivicExpansionSuite })));
const DailyIndianMassUtilitySuite = React.lazy(() => import('../calculators/DailyIndianMassUtilitySuite').then(m => ({ default: m.DailyIndianMassUtilitySuite })));
const TravelWeddingAndLandSuite = React.lazy(() => import('../calculators/TravelWeddingAndLandSuite').then(m => ({ default: m.TravelWeddingAndLandSuite })));
const DigitalFinanceAndMobilitySuite = React.lazy(() => import('../calculators/DigitalFinanceAndMobilitySuite').then(m => ({ default: m.DigitalFinanceAndMobilitySuite })));
const RightsCollegeAndWealthSuite = React.lazy(() => import('../calculators/RightsCollegeAndWealthSuite').then(m => ({ default: m.RightsCollegeAndWealthSuite })));
const EnergyQuotasAndPostOfficeSuite = React.lazy(() => import('../calculators/EnergyQuotasAndPostOfficeSuite').then(m => ({ default: m.EnergyQuotasAndPostOfficeSuite })));
const OfficialGovtAppsMasterSuite = React.lazy(() => import('../calculators/OfficialGovtAppsMasterSuite').then(m => ({ default: m.OfficialGovtAppsMasterSuite })));

// 13 New Power Utilities
const GoldSilverRateCalculator = React.lazy(() => import('./money/GoldSilverRateCalculator').then(m => ({ default: m.GoldSilverRateCalculator })));
const CryptoInrTaxCalculator = React.lazy(() => import('./money/CryptoInrTaxCalculator').then(m => ({ default: m.CryptoInrTaxCalculator })));
const SarkariExamAgeCalculator = React.lazy(() => import('./education/SarkariExamAgeCalculator').then(m => ({ default: m.SarkariExamAgeCalculator })));
const TrainBerthTatkalFinder = React.lazy(() => import('./travel/TrainBerthTatkalFinder').then(m => ({ default: m.TrainBerthTatkalFinder })));
const NetworkSpeedPingProbe = React.lazy(() => import('./tech/NetworkSpeedPingProbe').then(m => ({ default: m.NetworkSpeedPingProbe })));
const StockMarketHoursTracker = React.lazy(() => import('./business/StockMarketHoursTracker').then(m => ({ default: m.StockMarketHoursTracker })));
const JanAushadhiGenericSaver = React.lazy(() => import('./daily/JanAushadhiGenericSaver').then(m => ({ default: m.JanAushadhiGenericSaver })));
const RentAgreementStampDuty = React.lazy(() => import('./documents/RentAgreementStampDuty').then(m => ({ default: m.RentAgreementStampDuty })));
const TrafficChallanPortalFinder = React.lazy(() => import('./vehicle/TrafficChallanPortalFinder').then(m => ({ default: m.TrafficChallanPortalFinder })));
const ImeiCeirGuideValidator = React.lazy(() => import('./tech/ImeiCeirGuideValidator').then(m => ({ default: m.ImeiCeirGuideValidator })));
const PropertyStampDutyCalculator = React.lazy(() => import('./home/PropertyStampDutyCalculator').then(m => ({ default: m.PropertyStampDutyCalculator })));
const IndianBabyNamesRashi = React.lazy(() => import('./daily/IndianBabyNamesRashi').then(m => ({ default: m.IndianBabyNamesRashi })));
const PasswordBreachChecker = React.lazy(() => import('./tech/PasswordBreachChecker').then(m => ({ default: m.PasswordBreachChecker })));
const StockAverageCalculator = React.lazy(() => import('../calculators/StockAverageCalculator').then(m => ({ default: m.StockAverageCalculator })));
const HraTaxExemptionCalculator = React.lazy(() => import('../calculators/HraTaxExemptionCalculator').then(m => ({ default: m.HraTaxExemptionCalculator })));
const EvTcoCalculator = React.lazy(() => import('../calculators/EvTcoCalculator').then(m => ({ default: m.EvTcoCalculator })));
const IncomeTaxCalculator = React.lazy(() => import('../calculators/IncomeTaxCalculator').then(m => ({ default: m.IncomeTaxCalculator })));
const CagrCalculator = React.lazy(() => import('../calculators/CagrCalculator').then(m => ({ default: m.CagrCalculator })));
const LumpsumCalculator = React.lazy(() => import('../calculators/LumpsumCalculator').then(m => ({ default: m.LumpsumCalculator })));
const SwpCalculator = React.lazy(() => import('../calculators/SwpCalculator').then(m => ({ default: m.SwpCalculator })));
const XirrCalculator = React.lazy(() => import('../calculators/XirrCalculator').then(m => ({ default: m.XirrCalculator })));
const HomeLoanEligibilityCalculator = React.lazy(() => import('../calculators/HomeLoanEligibilityCalculator').then(m => ({ default: m.HomeLoanEligibilityCalculator })));
const TermInsuranceCalculator = React.lazy(() => import('../calculators/TermInsuranceCalculator').then(m => ({ default: m.TermInsuranceCalculator })));
const HealthInsuranceCalculator = React.lazy(() => import('../calculators/HealthInsuranceCalculator').then(m => ({ default: m.HealthInsuranceCalculator })));
const CarIdvCalculator = React.lazy(() => import('../calculators/CarIdvCalculator').then(m => ({ default: m.CarIdvCalculator })));







import {
  Star,
  Share2,
  Copy,
  Printer,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Layers,
  BookOpen,
  Compass,
  Search,
  ArrowRight
} from 'lucide-react';
import { StarRatingWidget } from '../common/seo/StarRatingWidget';

interface ToolPageLayoutProps {
  tool: Tool;
}

export const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ tool }) => {
  const {
    isFavorite,
    toggleFavorite,
    addCalculationHistory,
    showToast,
    navigateToHome,
    navigateToCategory,
    navigateToAllTools,
    setCommandPaletteOpen
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

  // Dynamic 3-6 Related Tools (never empty, fallback to category/popular)
  const explicitRelated = (tool.relatedToolSlugs || [])
    .map(slug => getToolBySlug(slug))
    .filter((t): t is Tool => Boolean(t) && t.slug !== tool.slug);

  const categoryFallback = getToolsByCategory(tool.category)
    .filter(t => t.slug !== tool.slug && !explicitRelated.some(r => r.slug === t.slug));

  const popularFallback = getPopularTools(6)
    .filter(t => t.slug !== tool.slug && !explicitRelated.some(r => r.slug === t.slug) && !categoryFallback.some(c => c.slug === t.slug));

  const relatedTools = [...explicitRelated, ...categoryFallback, ...popularFallback].slice(0, 4);

  // Render the matching calculator component
  const renderCalculatorComponent = () => {
    switch (tool.id) {
      case 'tds-calculator':
        return <TdsCalculator />;
      case '80c-80d-investment-planner':
        return <InvestmentPlanner80C80D />;
      case 'break-even-point-calculator':
        return <BreakEvenPointCalculator />;
      case 'emi-calculator':
      case 'home-loan-emi-calculator':
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
      case 'compound-interest-calculator':
      case 'simple-interest-calculator':
        return <FdCalculator onResultChange={handleResultChange} />;

      // Government Savings & Retirement Tools
      case 'ppf-calculator':
      case 'sukanya-samriddhi-calculator':
      case 'gratuity-calculator':
      case 'nps-calculator':
      case 'epf-calculator':
      case 'home-loan-prepayment-calculator':
        return <GovernmentSavingsSuiteCalculator tool={tool} />;

      // Text, Numbers & Language Tools
      case 'number-to-words-converter':
      case 'word-character-counter':
      case 'text-case-converter':
        return <TextAndLanguageSuiteCalculator tool={tool} />;

      // Student, Attendance & Land Tools
      case 'attendance-calculator':
      case 'land-area-converter':
      case 'indian-land-area-converter':
      case 'concrete-cement-sand-calculator':
      case 'construction-material-estimator':
        return <StudentAndLandSuiteCalculator tool={tool} />;

      // Energy, Solar, Gold & Cash Tally Tools
      case 'electricity-bill-calculator':
      case 'solar-rooftop-calculator':
      case 'gold-jewellery-price-calculator':
      case 'cash-denomination-tally-calculator':
        return <EnergyAndJewelrySuiteCalculator tool={tool} />;

      // Real Estate, Rent vs Buy, Crorepati SIP & FIRE Tools
      case 'rent-vs-buy-calculator':
      case 'rental-yield-calculator':
      case 'crorepati-sip-goal-calculator':
      case 'fire-retirement-calculator':
        return <RealEstateAndRetirementSuiteCalculator tool={tool} />;

      // Developer, Encoding, Security & Media Tools
      case 'json-formatter-validator':
      case 'base64-encoder-decoder':
      case 'secure-password-generator':
      case 'diff-checker-tool':
      case 'aspect-ratio-calculator':
        return <DevAndDailySuiteCalculator tool={tool} />;

      // Home Utilities & Indian Health Tools
      case 'water-tank-filling-time-calculator':
      case 'lpg-cylinder-price-calculator':
      case 'bmi-indian-health-calculator':
        return <HomeAndHealthSuiteCalculator tool={tool} />;

      // Quick Tools, Markdown, Speed & Wi-Fi Tools
      case 'markdown-to-html-converter':
      case 'speed-distance-time-calculator':
      case 'wifi-qr-code-generator':
        return <QuickToolsSuiteCalculator tool={tool} />;

      // Credit, Step-Up SIP & GST Invoice Tools
      case 'cibil-score-simulator':
      case 'gst-tax-invoice-generator':
      case 'sip-step-up-calculator':
        return <FinanceAndInvoiceSuiteCalculator tool={tool} />;

      // Lifestyle, REM Sleep, Calorie & vCard QR Tools
      case 'sleep-cycle-alarm-calculator':
      case 'daily-calorie-water-calculator':
      case 'vcard-qr-generator':
        return <LifestyleAndQRSuiteCalculator tool={tool} />;

      // Salary Hike, GST Late Fee & Daily Compound Interest Tools
      case 'salary-hike-percentage-calculator':
      case 'gst-late-fee-calculator':
      case 'compound-daily-interest-calculator':
        return <SalaryAndGstSuiteCalculator tool={tool} />;

      // WhatsApp Direct Link, Pomodoro Timer & UPI Payment QR Tools
      case 'whatsapp-direct-link-generator':
      case 'pomodoro-focus-timer':
      case 'upi-qr-payment-generator':
        return <ProductivityAndUpiSuiteCalculator tool={tool} />;

      // Specialized Indian Finance & Tax Tools
      case 'mutual-fund-capital-gains-tax-calculator':
      case 'gold-loan-eligibility-calculator':
      case 'section-44ada-freelance-tax-calculator':
      case 'post-office-mis-calculator':
        return <SpecializedTaxAndLoanSuiteCalculator tool={tool} />;

      // Work & Habit Productivity Tools
      case 'overtime-salary-wage-calculator':
      case 'habit-streak-routine-tracker':
      case 'chit-fund-committee-calculator':
        return <WorkAndHabitSuiteCalculator tool={tool} />;

      // Indian Choghadiya & Shubh Muhurat
      case 'choghadiya-calculator':
      case 'choghadiya-rahu-kaal-panchang':
      case 'shubh-muhurat-calculator':
        return <ChoghadiyaSuiteCalculator onResultChange={handleResultChange} />;

      // Govt Exam Speed Typing Test
      case 'speed-typing-test':
      case 'hindi-typing-test':
        return <SpeedTypingSuiteCalculator onResultChange={handleResultChange} />;

      // SVG Vector to PNG / WebP Converter
      case 'svg-to-png-converter':
      case 'svg-to-webp-converter':
        return <SvgConverterSuiteCalculator onResultChange={handleResultChange} />;

      // Govt Exam Photo & Date of Photo (DOP) Stamp
      case 'exam-photo-date-stamp':
      case 'passport-photo-date-maker':
        return <ExamPhotoStampSuiteCalculator onResultChange={handleResultChange} />;

      // Document Converters (PDF to Text, Word to Text, Text to PDF, Word to PDF)
      case 'pdf-to-text-converter':
        return <DocumentConvertersSuiteCalculator initialMode="pdf-to-text" onResultChange={handleResultChange} />;
      case 'word-to-text-converter':
        return <DocumentConvertersSuiteCalculator initialMode="word-to-text" onResultChange={handleResultChange} />;
      case 'text-to-pdf-converter':
        return <DocumentConvertersSuiteCalculator initialMode="text-to-pdf" onResultChange={handleResultChange} />;
      case 'word-to-pdf-converter':
        return <DocumentConvertersSuiteCalculator initialMode="word-to-pdf" onResultChange={handleResultChange} />;

      // Data Converters (CSV to JSON, JSON to CSV)
      case 'csv-to-json-converter':
        return <DataConvertersSuiteCalculator initialMode="csv-to-json" onResultChange={handleResultChange} />;
      case 'json-to-csv-converter':
        return <DataConvertersSuiteCalculator initialMode="json-to-csv" onResultChange={handleResultChange} />;

      // Image Format Multi-Converter
      case 'image-format-converter':
      case 'jpg-png-webp-converter':
        return <ImageConverterSuiteCalculator onResultChange={handleResultChange} />;

      // 6 New Free API-Powered Utilities
      case 'currency-converter':
      case 'live-currency-converter-inr':
      case 'live-currency-converter':
        return <CurrencyConverterSuite onResultChange={handleResultChange} />;

      case 'aqi-weather-forecast':
      case 'live-aqi-weather-forecast':
        return <AqiAndWeatherSuite onResultChange={handleResultChange} />;

      case 'ip-isp-inspector':
      case 'my-ip-inspector':
        return <IpInspectorSuite onResultChange={handleResultChange} />;

      case 'daily-fuel-price-tracker':
      case 'fuel-price-tracker':
        return <FuelPriceTrackerSuite onResultChange={handleResultChange} />;

      case 'qr-code-scanner-reader':
      case 'camera-qr-scanner':
      case 'qr-scanner':
        return <QrScannerSuite onResultChange={handleResultChange} />;

      case 'long-weekend-holiday-planner':
      case 'long-weekend-planner':
        return <LongWeekendPlannerSuite onResultChange={handleResultChange} />;

      // Free Online Notepad & Scratchpad
      case 'free-online-notepad-scratchpad':
      case 'online-notepad':
      case 'notepad':
      case 'scratchpad':
        return <OnlineNotepadSuite />;

      // Free Online Paint & Canvas Drawing Tool
      case 'online-paint-canvas-drawing-tool':
      case 'online-paint':
      case 'paint':
      case 'paint-tool':
      case 'canvas-drawing':
        return <OnlinePaintCanvasSuite />;

      case 'gst-calculator':
      case 'discount-calculator':
        return <GstCalculator onResultChange={handleResultChange} />;

      case 'salary-calculator':
        return <SalaryCalculator onResultChange={handleResultChange} />;
      case 'stock-average-calculator':
        return <StockAverageCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'hra-tax-exemption-calculator':
        return <HraTaxExemptionCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'ev-tco-calculator':
        return <EvTcoCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'income-tax-calculator':
        return <IncomeTaxCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'cagr-calculator':
        return <CagrCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'lumpsum-calculator':
        return <LumpsumCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'swp-calculator':
        return <SwpCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'xirr-calculator':
        return <XirrCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'home-loan-eligibility-calculator':
        return <HomeLoanEligibilityCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'term-insurance-calculator':
        return <TermInsuranceCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'health-insurance-calculator':
        return <HealthInsuranceCalculator tool={tool} onResultChange={handleResultChange} />;
      case 'vehicle-idv-calculator':
        return <CarIdvCalculator tool={tool} onResultChange={handleResultChange} />;

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
      case 'water-tank-capacity-calculator':
        return <ConstructionSuiteCalculator initialMode="water-tank" onResultChange={handleResultChange} />;

      // Education Tools
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

      // India Services Hub
      case 'ifsc-code-finder':
        return <IndiaServicesSuiteCalculator initialMode="ifsc-finder" onResultChange={handleResultChange} />;
      case 'micr-code-finder':
        return <IndiaServicesSuiteCalculator initialMode="ifsc-finder" onResultChange={handleResultChange} />;
      case 'pin-code-finder':
        return <IndiaServicesSuiteCalculator initialMode="pin-finder" onResultChange={handleResultChange} />;
      case 'rto-code-finder':
        return <IndiaServicesSuiteCalculator initialMode="rto-finder" onResultChange={handleResultChange} />;
      case 'gstin-validator':
        return <IndiaServicesSuiteCalculator initialMode="gstin-validator" onResultChange={handleResultChange} />;
      case 'pan-format-validator':
        return <IndiaServicesSuiteCalculator initialMode="pan-validator" onResultChange={handleResultChange} />;
      case 'indian-bank-holidays':
        return <IndiaServicesSuiteCalculator initialMode="bank-holidays" onResultChange={handleResultChange} />;
      case 'government-services-directory':
        return <IndiaServicesSuiteCalculator initialMode="gov-directory" onResultChange={handleResultChange} />;

      // Document Tools
      case 'pdf-merge':
        return <DocumentToolsSuiteCalculator initialMode="pdf-merge" onResultChange={handleResultChange} />;
      case 'pdf-split':
        return <DocumentToolsSuiteCalculator initialMode="pdf-merge" onResultChange={handleResultChange} />;
      case 'pdf-compress':
        return <DocumentToolsSuiteCalculator initialMode="image-compressor-resizer" onResultChange={handleResultChange} />;
      case 'pdf-to-jpg':
        return <DocumentToolsSuiteCalculator initialMode="jpg-to-pdf" onResultChange={handleResultChange} />;
      case 'jpg-to-pdf':
        return <DocumentToolsSuiteCalculator initialMode="jpg-to-pdf" onResultChange={handleResultChange} />;
      case 'pdf-page-organizer':
        return <DocumentToolsSuiteCalculator initialMode="pdf-merge" onResultChange={handleResultChange} />;
      case 'image-compressor-resizer':
        return <DocumentToolsSuiteCalculator initialMode="image-compressor-resizer" onResultChange={handleResultChange} />;
      case 'passport-photo-maker':
        return <DocumentToolsSuiteCalculator initialMode="signature-resizer" onResultChange={handleResultChange} />;
      case 'signature-resizer':
        return <DocumentToolsSuiteCalculator initialMode="signature-resizer" onResultChange={handleResultChange} />;
      case 'qr-code-generator':
        return <DocumentToolsSuiteCalculator initialMode="qr-generator" onResultChange={handleResultChange} />;
      case 'barcode-generator':
        return <DocumentToolsSuiteCalculator initialMode="qr-generator" onResultChange={handleResultChange} />;
      case 'file-size-calculator':
        return <DocumentToolsSuiteCalculator initialMode="file-size-calc" onResultChange={handleResultChange} />;

      // Vehicle Utility
      case 'vehicle-fuel-cost-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="fuel-cost" onResultChange={handleResultChange} />;
      case 'vehicle-mileage-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="fuel-cost" onResultChange={handleResultChange} />;
      case 'ev-cost-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="ev-charging" onResultChange={handleResultChange} />;
      case 'ev-vs-petrol-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="ev-vs-petrol" onResultChange={handleResultChange} />;
      case 'ev-charging-time-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="ev-charging" onResultChange={handleResultChange} />;
      case 'vehicle-depreciation-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="vehicle-depreciation" onResultChange={handleResultChange} />;
      case 'car-loan-emi-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="car-loan-emi" onResultChange={handleResultChange} />;
      case 'bike-loan-emi-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="car-loan-emi" onResultChange={handleResultChange} />;
      case 'tyre-size-calculator':
        return <VehicleUtilitySuiteCalculator initialMode="tyre-size" onResultChange={handleResultChange} />;

      // Travel Utility
      case 'trip-cost-calculator':
        return <TravelUtilitySuiteCalculator initialMode="trip-cost" onResultChange={handleResultChange} />;
      case 'road-trip-planner':
        return <TravelUtilitySuiteCalculator initialMode="road-trip" onResultChange={handleResultChange} />;
      case 'group-expense-split':
        return <TravelUtilitySuiteCalculator initialMode="group-split" onResultChange={handleResultChange} />;
      case 'travel-budget-calculator':
        return <TravelUtilitySuiteCalculator initialMode="travel-budget" onResultChange={handleResultChange} />;
      case 'currency-converter-tool':
        return <TravelUtilitySuiteCalculator initialMode="currency-converter" onResultChange={handleResultChange} />;
      case 'time-zone-converter-tool':
        return <TravelUtilitySuiteCalculator initialMode="timezone-converter" onResultChange={handleResultChange} />;
      case 'travel-checklist-generator':
        return <TravelUtilitySuiteCalculator initialMode="packing-checklist" onResultChange={handleResultChange} />;

      // 13 New Power Utilities
      case 'gold-silver-rate-calculator':
        return <GoldSilverRateCalculator />;
      case 'crypto-inr-tax-calculator':
        return <CryptoInrTaxCalculator />;
      case 'sarkari-exam-age-calculator':
        return <SarkariExamAgeCalculator />;
      case 'train-berth-tatkal-finder':
        return <TrainBerthTatkalFinder />;
      case 'network-speed-ping-probe':
        return <NetworkSpeedPingProbe />;
      case 'stock-market-hours-tracker':
        return <StockMarketHoursTracker />;
      case 'jan-aushadhi-generic-saver':
        return <JanAushadhiGenericSaver />;
      case 'rent-agreement-stamp-duty':
        return <RentAgreementStampDuty />;
      case 'traffic-challan-portal-finder':
        return <TrafficChallanPortalFinder />;
      case 'imei-ceir-guide-validator':
        return <ImeiCeirGuideValidator />;
      case 'property-stamp-duty-calculator':
        return <PropertyStampDutyCalculator />;
      case 'indian-baby-names-rashi':
        return <IndianBabyNamesRashi />;
      case 'password-breach-checker':
        return <PasswordBreachChecker />;

      // Government Schemes Suite
      case 'sukanya-samriddhi-yojana-calculator':
        return <GovernmentSchemesSuiteCalculator initialMode="ssy" onResultChange={handleResultChange} />;
      case 'pm-surya-ghar-solar-calculator':
        return <GovernmentSchemesSuiteCalculator initialMode="pm-surya-ghar" onResultChange={handleResultChange} />;
      case 'ayushman-bharat-eligibility-checker':
        return <GovernmentSchemesSuiteCalculator initialMode="ayushman-bharat" onResultChange={handleResultChange} />;
      case 'atal-pension-yojana-calculator':
        return <GovernmentSchemesSuiteCalculator initialMode="atal-pension" onResultChange={handleResultChange} />;
      case 'pm-kisan-eligibility-checker':
        return <GovernmentSchemesSuiteCalculator initialMode="pm-kisan" onResultChange={handleResultChange} />;
      case 'pm-mudra-loan-eligibility-calculator':
        return <GovernmentSchemesSuiteCalculator initialMode="pm-mudra" onResultChange={handleResultChange} />;
      case 'pm-awas-yojana-subsidy-calculator':
        return <GovernmentSchemesSuiteCalculator initialMode="pm-awas" onResultChange={handleResultChange} />;
      case 'pm-matru-vandana-yojana-calculator':
        return <GovernmentSchemesSuiteCalculator initialMode="pm-matru-vandana" onResultChange={handleResultChange} />;

      // Legal & Citizen Rights Suite
      case 'ipc-to-bns-law-finder':
        return <LegalAndCitizenRightsCalculator initialMode="ipc-bns" onResultChange={handleResultChange} />;
      case 'rti-application-generator':
        return <LegalAndCitizenRightsCalculator initialMode="rti-generator" onResultChange={handleResultChange} />;
      case 'all-india-bhulekh-land-records':
        return <LegalAndCitizenRightsCalculator initialMode="all-india-bhulekh" onResultChange={handleResultChange} />;
      case 'cybercrime-1930-fraud-emergency-guide':
        return <LegalAndCitizenRightsCalculator initialMode="cybercrime-1930" onResultChange={handleResultChange} />;
      case 'indian-passport-visa-free-countries':
        return <LegalAndCitizenRightsCalculator initialMode="visa-free-passport" onResultChange={handleResultChange} />;
      case 'food-adulteration-test-kit':
        return <LegalAndCitizenRightsCalculator initialMode="food-adulteration" onResultChange={handleResultChange} />;
      case 'blood-group-compatibility-eraktkosh':
        return <LegalAndCitizenRightsCalculator initialMode="blood-compatibility" onResultChange={handleResultChange} />;
      case 'ugc-university-recognition-verifier':
        return <LegalAndCitizenRightsCalculator initialMode="ugc-verifier" onResultChange={handleResultChange} />;

      // Live Public APIs Suite
      case 'iss-tracker-india-pass':
        return <LivePublicApisSuiteCalculator initialMode="iss-tracker" onResultChange={handleResultChange} />;
      case 'isro-satellites-missions-directory':
        return <LivePublicApisSuiteCalculator initialMode="isro-directory" onResultChange={handleResultChange} />;
      case 'apmc-mandi-bhav-live-tracker':
        return <LivePublicApisSuiteCalculator initialMode="mandi-bhav" onResultChange={handleResultChange} />;

      // Hardware & Diagnostic Suite
      case 'mobile-screen-hardware-tester':
        return <HardwareAndDiagnosticSuiteCalculator initialMode="mobile-tester" onResultChange={handleResultChange} />;
      case 'indian-voice-speech-studio':
        return <HardwareAndDiagnosticSuiteCalculator initialMode="voice-studio" onResultChange={handleResultChange} />;
      case 'live-room-noise-decibel-meter':
        return <HardwareAndDiagnosticSuiteCalculator initialMode="noise-meter" onResultChange={handleResultChange} />;
      case 'vastu-shastra-digital-compass':
        return <HardwareAndDiagnosticSuiteCalculator initialMode="vastu-compass" onResultChange={handleResultChange} />;
      case 'ev-fast-charging-cost-matrix':
        return <HardwareAndDiagnosticSuiteCalculator initialMode="ev-charging" onResultChange={handleResultChange} />;
      case 'home-inverter-battery-backup-calculator':
        return <HardwareAndDiagnosticSuiteCalculator initialMode="inverter-calculator" onResultChange={handleResultChange} />;
      case 'irctc-tatkal-timing-station-finder':
        return <HardwareAndDiagnosticSuiteCalculator initialMode="tatkal-timing" onResultChange={handleResultChange} />;

      // Indian Civic & Governance Expansion Suite
      case 'state-electricity-slab-calculator':
        return <IndianGovtAndCivicExpansionSuite initialMode="electricity-slab" onResultChange={handleResultChange} />;
      case 'seventh-to-eighth-cpc-calculator':
        return <IndianGovtAndCivicExpansionSuite initialMode="cpc-salary" onResultChange={handleResultChange} />;
      case 'nhai-fastag-toll-calculator':
        return <IndianGovtAndCivicExpansionSuite initialMode="fastag-toll" onResultChange={handleResultChange} />;
      case 'panchang-choghadiya-muhurat-clock':
        return <IndianGovtAndCivicExpansionSuite initialMode="panchang-muhurat" onResultChange={handleResultChange} />;
      case 'indian-diet-macro-bmi-planner':
        return <IndianGovtAndCivicExpansionSuite initialMode="indian-diet-bmi" onResultChange={handleResultChange} />;
      case 'mva-traffic-challan-fine-decoder':
        return <IndianGovtAndCivicExpansionSuite initialMode="mva-fines" onResultChange={handleResultChange} />;
      case 'epf-passbook-eps95-pension-calculator':
        return <IndianGovtAndCivicExpansionSuite initialMode="epf-eps95" onResultChange={handleResultChange} />;
      case 'dgca-flight-delay-compensation-calculator':
        return <IndianGovtAndCivicExpansionSuite initialMode="dgca-flight-claim" onResultChange={handleResultChange} />;
      case 'home-loan-prepayment-tenure-calculator':
        return <IndianGovtAndCivicExpansionSuite initialMode="loan-prepayment" onResultChange={handleResultChange} />;
      case 'mrp-margin-gst-breakdown-calculator':
        return <IndianGovtAndCivicExpansionSuite initialMode="mrp-breakdown" onResultChange={handleResultChange} />;

      // Daily Indian Mass Utility Suite
      case 'jewellery-gold-making-charge-calculator':
        return <DailyIndianMassUtilitySuite initialMode="gold-jewellery" onResultChange={handleResultChange} />;
      case 'dairy-milk-fat-snf-calculator':
        return <DailyIndianMassUtilitySuite initialMode="milk-fat" onResultChange={handleResultChange} />;
      case 'all-india-land-unit-converter':
        return <DailyIndianMassUtilitySuite initialMode="land-units" onResultChange={handleResultChange} />;
      case 'gratuity-leave-encashment-calculator':
        return <DailyIndianMassUtilitySuite initialMode="gratuity-calc" onResultChange={handleResultChange} />;
      case 'baby-vaccination-schedule-calculator':
        return <DailyIndianMassUtilitySuite initialMode="baby-vaccine" onResultChange={handleResultChange} />;
      case 'non-judicial-stamp-paper-guide':
        return <DailyIndianMassUtilitySuite initialMode="stamp-paper" onResultChange={handleResultChange} />;
      case 'old-vehicle-resale-valuation-calculator':
        return <DailyIndianMassUtilitySuite initialMode="car-valuation" onResultChange={handleResultChange} />;
      case 'freelancer-44ada-tax-calculator':
        return <DailyIndianMassUtilitySuite initialMode="tax-44ada" onResultChange={handleResultChange} />;
      case 'consumer-court-complaint-notice-generator':
        return <DailyIndianMassUtilitySuite initialMode="consumer-notice" onResultChange={handleResultChange} />;
      case 'branded-vs-generic-medicine-comparator':
        return <DailyIndianMassUtilitySuite initialMode="medicine-compare" onResultChange={handleResultChange} />;

      // Batch 3: Travel, Wedding, Agriloan & Citizen Life Suite
      case 'irctc-pnr-quotas-confirmation-decoder':
        return <TravelWeddingAndLandSuite initialMode="pnr-decoder" onResultChange={handleResultChange} />;
      case 'indian-wedding-shaadi-budget-planner':
        return <TravelWeddingAndLandSuite initialMode="wedding-budget" onResultChange={handleResultChange} />;
      case 'kisan-credit-card-4percent-calculator':
        return <TravelWeddingAndLandSuite initialMode="kcc-loan" onResultChange={handleResultChange} />;
      case 'central-gazette-name-change-guide':
        return <TravelWeddingAndLandSuite initialMode="gazette-guide" onResultChange={handleResultChange} />;
      case 'cbse-icse-best-of-five-percentage-calculator':
        return <TravelWeddingAndLandSuite initialMode="board-marks" onResultChange={handleResultChange} />;
      case 'commercial-rent-escalation-calculator':
        return <TravelWeddingAndLandSuite initialMode="rent-escalation" onResultChange={handleResultChange} />;
      case 'ayurvedic-prakriti-dosha-analyzer':
        return <TravelWeddingAndLandSuite initialMode="ayurveda-prakriti" onResultChange={handleResultChange} />;
      case 'rainwater-harvesting-tank-sizing-calculator':
        return <TravelWeddingAndLandSuite initialMode="rainwater-tank" onResultChange={handleResultChange} />;
      case 'mobile-sar-radiation-checker':
        return <TravelWeddingAndLandSuite initialMode="sar-radiation" onResultChange={handleResultChange} />;
      case 'bank-locker-rent-and-liability-guide':
        return <TravelWeddingAndLandSuite initialMode="bank-locker" onResultChange={handleResultChange} />;

      // Batch 4: Digital Finance, Mobility & Rights Suite
      case 'upi-daily-limits-and-cooloff-tracker':
        return <DigitalFinanceAndMobilitySuite initialMode="upi-limits" onResultChange={handleResultChange} />;
      case 'sukanya-samriddhi-vs-ppf-comparator':
        return <DigitalFinanceAndMobilitySuite initialMode="ssy-ppf" onResultChange={handleResultChange} />;
      case 'tds-on-rent-194ib-calculator':
        return <DigitalFinanceAndMobilitySuite initialMode="tds-rent" onResultChange={handleResultChange} />;
      case 'ev-vs-petrol-scooter-tco-calculator':
        return <DigitalFinanceAndMobilitySuite initialMode="ev-petrol" onResultChange={handleResultChange} />;
      case 'pm-fasal-bima-crop-insurance-calculator':
        return <DigitalFinanceAndMobilitySuite initialMode="fasal-bima" onResultChange={handleResultChange} />;
      case 'rto-dl-test-traffic-signs-simulator':
        return <DigitalFinanceAndMobilitySuite initialMode="rto-quiz" onResultChange={handleResultChange} />;
      case 'housing-society-maintenance-sinking-fund-calculator':
        return <DigitalFinanceAndMobilitySuite initialMode="society-maintenance" onResultChange={handleResultChange} />;
      case 'tatkaal-passport-checklist-and-timeline':
        return <DigitalFinanceAndMobilitySuite initialMode="tatkaal-passport" onResultChange={handleResultChange} />;
      case 'senior-citizen-fd-form15h-calculator':
        return <DigitalFinanceAndMobilitySuite initialMode="senior-fd" onResultChange={handleResultChange} />;
      case 'ayushman-abha-digital-health-id-guide':
        return <DigitalFinanceAndMobilitySuite initialMode="abha-card" onResultChange={handleResultChange} />;

      // Batch 5: Rights, College, Wealth & Protection Suite
      case 'rbi-sovereign-gold-bond-sgb-calculator':
        return <RightsCollegeAndWealthSuite initialMode="sgb-gold" onResultChange={handleResultChange} />;
      case 'family-gift-deed-vs-will-stamp-duty-guide':
        return <RightsCollegeAndWealthSuite initialMode="gift-deed" onResultChange={handleResultChange} />;
      case 'restaurant-bill-gst-service-charge-checker':
        return <RightsCollegeAndWealthSuite initialMode="restaurant-gst" onResultChange={handleResultChange} />;
      case 'college-75-percent-attendance-bunk-planner':
        return <RightsCollegeAndWealthSuite initialMode="college-attendance" onResultChange={handleResultChange} />;
      case 'leave-travel-allowance-lta-calculator':
        return <RightsCollegeAndWealthSuite initialMode="lta-tax" onResultChange={handleResultChange} />;
      case 'car-tyre-size-upsize-speedometer-calculator':
        return <RightsCollegeAndWealthSuite initialMode="tyre-upsize" onResultChange={handleResultChange} />;
      case 'apmc-mandi-msp-procurement-calculator':
        return <RightsCollegeAndWealthSuite initialMode="mandi-msp" onResultChange={handleResultChange} />;
      case 'nps-tier1-80ccd1b-pension-calculator':
        return <RightsCollegeAndWealthSuite initialMode="nps-pension" onResultChange={handleResultChange} />;
      case 'rti-application-first-appeal-timeline-guide':
        return <RightsCollegeAndWealthSuite initialMode="rti-appeal" onResultChange={handleResultChange} />;
      case 'body-surface-area-clinical-dosage-calculator':
        return <RightsCollegeAndWealthSuite initialMode="bsa-dosage" onResultChange={handleResultChange} />;

      // Batch 6: Energy, Quota, Post Office & Civic Suite
      case 'lpg-cylinder-price-ujjwala-subsidy-tracker':
        return <EnergyQuotasAndPostOfficeSuite initialMode="lpg-price" onResultChange={handleResultChange} />;
      case 'ews-obc-ncl-income-asset-criteria-checker':
        return <EnergyQuotasAndPostOfficeSuite initialMode="ews-checker" onResultChange={handleResultChange} />;
      case 'fastag-blacklist-double-toll-penalty-guide':
        return <EnergyQuotasAndPostOfficeSuite initialMode="fastag-blacklist" onResultChange={handleResultChange} />;
      case 'pm-kusum-solar-pump-subsidy-calculator':
        return <EnergyQuotasAndPostOfficeSuite initialMode="kusum-solar" onResultChange={handleResultChange} />;
      case 'indian-blood-pressure-dash-diet-analyzer':
        return <EnergyQuotasAndPostOfficeSuite initialMode="blood-pressure" onResultChange={handleResultChange} />;
      case 'shop-and-establishment-gumasta-guide':
        return <EnergyQuotasAndPostOfficeSuite initialMode="gumasta-license" onResultChange={handleResultChange} />;
      case 'post-office-schemes-pomis-kvp-nsc-calculator':
        return <EnergyQuotasAndPostOfficeSuite initialMode="post-office-calc" onResultChange={handleResultChange} />;
      case 'irctc-luggage-weight-excess-baggage-rates':
        return <EnergyQuotasAndPostOfficeSuite initialMode="train-luggage" onResultChange={handleResultChange} />;
      case 'mobile-imei-luhn-validator-ceir-guide':
        return <EnergyQuotasAndPostOfficeSuite initialMode="imei-validator" onResultChange={handleResultChange} />;
      case 'epf-higher-pension-vs-eps95-calculator':
        return <EnergyQuotasAndPostOfficeSuite initialMode="epf-higher-pension" onResultChange={handleResultChange} />;

      // Batch 7: Official Government Apps & Digital Portals Suite
      case 'umang-app-all-in-one-govt-services-guide':
        return <OfficialGovtAppsMasterSuite initialMode="umang-app" onResultChange={handleResultChange} />;
      case 'digilocker-rule-9a-it-act-compliance-guide':
        return <OfficialGovtAppsMasterSuite initialMode="digilocker-guide" onResultChange={handleResultChange} />;
      case 'maadhaar-biometric-lock-unlock-fraud-protection':
        return <OfficialGovtAppsMasterSuite initialMode="maadhaar-lock" onResultChange={handleResultChange} />;
      case 'mparivahan-virtual-rc-dl-portal-guide':
        return <OfficialGovtAppsMasterSuite initialMode="mparivahan-guide" onResultChange={handleResultChange} />;
      case 'sanchar-saathi-tafcop-sim-checker-guide':
        return <OfficialGovtAppsMasterSuite initialMode="tafcop-sims" onResultChange={handleResultChange} />;
      case 'railmadad-139-uts-mobile-railway-guide':
        return <OfficialGovtAppsMasterSuite initialMode="railmadad-guide" onResultChange={handleResultChange} />;
      case 'pm-kisan-face-auth-ekyc-mobile-guide':
        return <OfficialGovtAppsMasterSuite initialMode="pmkisan-face" onResultChange={handleResultChange} />;
      case 'bhim-upi-offline-star99hash-guide':
        return <OfficialGovtAppsMasterSuite initialMode="bhim-offline" onResultChange={handleResultChange} />;
      case 'emergency-112-india-erss-sos-guide':
        return <OfficialGovtAppsMasterSuite initialMode="emergency-112" onResultChange={handleResultChange} />;
      case 'abha-health-card-digital-records-guide':
        return <OfficialGovtAppsMasterSuite initialMode="abha-digital" onResultChange={handleResultChange} />;

      default:
        return <EmiCalculator onResultChange={handleResultChange} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-8 space-y-3 sm:space-y-8 animate-in fade-in duration-200 relative">
      {/* Background Subtle Antigravity Ambient Light & Particles */}
      <AntigravityParticles className="opacity-35 dark:opacity-50" particleCount={25} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[250px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full animate-antigravity-pulse" />

      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          {
            label: category ? category.name : 'Calculators',
            href: category ? `/category/${category.id}` : '/tools',
            onClick: () => category && navigateToCategory(category.id)
          },
          { label: tool.shortName || tool.name, active: true }
        ]}
      />

      {/* Tool Header Banner */}
      <div className="bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-neutral-200/90 dark:border-neutral-800/90 shadow-lg shadow-neutral-900/5 dark:shadow-black/40 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-600/20 text-accent dark:bg-neutral-800/80 flex items-center justify-center shrink-0 border border-neutral-200/90 dark:border-neutral-700/60 shadow-xs">
              <DynamicIcon name={tool.icon} className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-900 dark:text-white font-display tracking-tight">
                  {tool.name}
                </h1>
                {tool.badge && (
                  <FloatingBadge duration={3} distance={3}>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      {tool.badge}
                    </span>
                  </FloatingBadge>
                )}
              </div>
              <p className="hidden md:block text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
                {tool.description}
              </p>
              <StarRatingWidget tool={tool} />
              
              {/* Freshness / Source Indicator for Time-Sensitive Tools */}
              {(tool.lastUpdated || tool.officialSource || tool.needsManualVerification) && (
                <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                  {tool.lastUpdated && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Last updated: {tool.lastUpdated}
                    </div>
                  )}
                  {tool.officialSource && (
                    <div className="flex items-center gap-1 border-l border-neutral-300 dark:border-neutral-700 pl-3">
                      Source: {tool.officialSource}
                    </div>
                  )}

                </div>
              )}
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
        <ErrorBoundary fallbackTitle={`${tool.name} Workbench`}>
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
        </ErrorBoundary>
      </div>

      {/* Tool Feedback & Rating Widget */}
      <ToolFeedbackWidget toolSlug={tool.slug} toolName={tool.name} />

      {/* Bookmark BharatUtility Prompt */}
      <BookmarkPrompt variant="card" />

      {/* Ad Slot Banner between Calculator and Content */}
      <AdSlot format="horizontal" />

      {/* Dynamic Extended SEO Content Sections */}
      {tool.seoSections && tool.seoSections.length > 0 && (
        <div className="hidden md:block space-y-6">
          {tool.seoSections.map((sec, idx) => (
            <div
              key={idx}
              id={`seo-section-${idx}`}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3"
            >
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white font-display">
                {sec.h2}
              </h2>
              {sec.paragraphs && sec.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {p}
                </p>
              ))}
              {sec.bullets && (
                <ul className="space-y-2 pt-1 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  {sec.bullets.map((b, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2">
                      <span className="text-accent font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {sec.steps && (
                <div className="space-y-2 pt-1 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                  {sec.steps.map((st, stIdx) => (
                    <div key={stIdx} className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50 leading-relaxed font-medium">
                      {st}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formula & Explanation Section */}
      {tool.formulaDescription && (
        <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
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
        <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
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
        <div id="tool-faqs" className="hidden md:block bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
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

      {/* Related Tools Recommendation Grid (Cross-Tool Discovery Engine) */}
      {relatedTools.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              More Useful Tools
            </h3>
            {category && (
              <button
                onClick={() => navigateToCategory(category.id)}
                className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View all {category.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <ScrollableCarousel className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 no-scrollbar">
            {relatedTools.map(rt => (
              <ToolCard key={rt.id} tool={rt} />
            ))}
          </ScrollableCarousel>

          {/* Quick Discovery Navigation Bar */}
          <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300 font-medium">
              <Compass className="w-4 h-4 text-accent" />
              <span>Looking for another utility?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-accent font-semibold text-neutral-800 dark:text-neutral-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-accent" />
                <span>Search Tools (Ctrl+K)</span>
              </button>
              <button
                onClick={navigateToAllTools}
                className="px-3 py-1.5 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>Browse All 220+ Tools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Request a Tool CTA Card */}
      <RequestToolCta initialToolName={tool.name} variant="card" />

      {/* Informational Disclaimer Banner */}
      {tool.disclaimer && (
        <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          {tool.disclaimer}
        </div>
      )}

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
