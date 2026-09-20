import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Compass, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { ToolCard } from '../common/ToolCard';
import { ScrollableCarousel } from '../common/ScrollableCarousel';
import { getToolBySlug } from '../../data/toolsRegistry';

interface ToolCluster {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  tools: {
    slug: string;
    name: string;
    tagline: string;
    icon: string;
  }[];
}

const TOOL_CLUSTERS: ToolCluster[] = [
  {
    id: 'citizen-essentials',
    name: 'Citizen & Location Essentials',
    subtitle: 'Everything needed for address, post office and banking lookups',
    icon: 'MapPin',
    tools: [
      {
        slug: 'pin-code-finder',
        name: 'PIN Code Finder',
        tagline: 'Lookup 1,50,000+ Indian Post Offices & PIN codes',
        icon: 'MapPin'
      },
      {
        slug: 'ifsc-code-finder',
        name: 'IFSC Code Finder',
        tagline: 'Branch search, NEFT & RTGS codes across all banks',
        icon: 'Building2'
      },
      {
        slug: 'micr-code-finder',
        name: 'MICR Code Finder',
        tagline: 'Cheque clearing codes for all Indian bank branches',
        icon: 'CreditCard'
      },
      {
        slug: 'rto-code-finder',
        name: 'RTO Vehicle Code Finder',
        tagline: 'Identify vehicle registration state & district codes',
        icon: 'Car'
      }
    ]
  },
  {
    id: 'loan-property',
    name: 'Home Loan & Property Planning',
    subtitle: 'Plan EMIs, prepayments, rent vs buy and land plots',
    icon: 'Home',
    tools: [
      {
        slug: 'emi-calculator',
        name: 'EMI Calculator',
        tagline: 'Equated monthly installments with amortization schedules',
        icon: 'Calculator'
      },
      {
        slug: 'home-loan-prepayment-calculator',
        name: 'Home Loan Prepayment',
        tagline: 'Calculate interest savings with partial extra payments',
        icon: 'TrendingDown'
      },
      {
        slug: 'rent-vs-buy-calculator',
        name: 'Rent vs Buy Calculator',
        tagline: 'Compare renting and investing vs buying a home in India',
        icon: 'Building'
      },
      {
        slug: 'land-area-converter',
        name: 'Indian Land Area Converter',
        tagline: 'Convert Bigha, Guntha, Ground, Gaj, Cent & Sq Ft',
        icon: 'LandPlot'
      }
    ]
  },
  {
    id: 'business-gst',
    name: 'Business, Billing & GST',
    subtitle: 'Tools for Indian shopkeepers, traders and freelancers',
    icon: 'Briefcase',
    tools: [
      {
        slug: 'gst-calculator',
        name: 'GST Calculator',
        tagline: 'Inclusive and exclusive GST breakdown for 5%, 12%, 18%, 28%',
        icon: 'Receipt'
      },
      {
        slug: 'gstin-validator',
        name: 'GSTIN Format Validator',
        tagline: 'Verify 15-digit GST identification number structure',
        icon: 'CheckSquare'
      },
      {
        slug: 'upi-qr-payment-generator',
        name: 'UPI QR Payment Generator',
        tagline: 'Generate custom QR for instant GPay, PhonePe & Paytm payments',
        icon: 'QrCode'
      },
      {
        slug: 'cash-denomination-tally-calculator',
        name: 'Cash Denomination Tally',
        tagline: 'Daily cash register tally for ₹500, ₹200, ₹100 notes',
        icon: 'Coins'
      }
    ]
  },
  {
    id: 'salary-wealth',
    name: 'Salary, Savings & Wealth',
    subtitle: 'Maximize take-home salary and plan long-term investments',
    icon: 'Wallet',
    tools: [
      {
        slug: 'salary-calculator',
        name: 'In-Hand Salary Calculator',
        tagline: 'Calculate monthly take-home pay after PF, PT and TDS',
        icon: 'Banknote'
      },
      {
        slug: 'sip-calculator',
        name: 'SIP Calculator',
        tagline: 'Forecast compounding returns on monthly mutual fund investments',
        icon: 'TrendingUp'
      },
      {
        slug: 'crorepati-sip-goal-calculator',
        name: '₹1 Crore Crorepati Planner',
        tagline: 'Find required monthly SIP to achieve ₹1 Crore corpus',
        icon: 'Target'
      },
      {
        slug: 'ppf-calculator',
        name: 'PPF Calculator',
        tagline: '15-year Public Provident Fund interest & maturity calculator',
        icon: 'PiggyBank'
      }
    ]
  },
  {
    id: 'student-docs',
    name: 'Exams, Forms & Documents',
    subtitle: 'Essential utilities for government applications and admissions',
    icon: 'GraduationCap',
    tools: [
      {
        slug: 'age-calculator',
        name: 'Age Calculator',
        tagline: 'Calculate exact age in years, months and days for exam cutoffs',
        icon: 'Calendar'
      },
      {
        slug: 'signature-resizer',
        name: 'Signature & Photo Resizer',
        tagline: 'Resize photos to exact 20KB-50KB limits for online portals',
        icon: 'Image'
      },
      {
        slug: 'pdf-merge',
        name: 'PDF Merger (100% Client-Side)',
        tagline: 'Combine multiple PDF files securely inside your browser',
        icon: 'FileText'
      },
      {
        slug: 'cgpa-calculator',
        name: 'CGPA to Percentage',
        tagline: 'Standard CBSE & University 9.5 multiplier conversion',
        icon: 'Percent'
      }
    ]
  }
];

export const YouMayAlsoNeedSection: React.FC = () => {
  const [activeClusterId, setActiveClusterId] = useState<string>('citizen-essentials');
  const activeCluster = TOOL_CLUSTERS.find(c => c.id === activeClusterId) || TOOL_CLUSTERS[0];

  return (
    <section className="py-2 sm:py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3 sm:mb-5 gap-1.5 sm:gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow &amp; Task Kits</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
            You May Also Need
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Curated combinations of tools designed to help you complete end-to-end tasks without switching websites
          </p>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 sm:mb-4 scrollbar-none">
        {TOOL_CLUSTERS.map(cluster => {
          const isActive = cluster.id === activeClusterId;
          return (
            <button
              key={cluster.id}
              onClick={() => setActiveClusterId(cluster.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border cursor-pointer ${
                isActive
                  ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-accent/40'
              }`}
            >
              <DynamicIcon name={cluster.icon} className="w-3.5 h-3.5" />
              <span>{cluster.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Cluster Grid */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-neutral-200/90 dark:border-neutral-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 mb-2.5 sm:pb-4 sm:mb-4 border-b border-neutral-100 dark:border-neutral-800 gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white font-display flex items-center gap-1.5">
              <DynamicIcon name={activeCluster.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
              {activeCluster.name}
            </h3>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              {activeCluster.subtitle}
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent w-fit">
            {activeCluster.tools.length} Coordinated Utilities
          </span>
        </div>

        <ScrollableCarousel className="pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 no-scrollbar">
          {activeCluster.tools.map(tool => {
            const fullTool = getToolBySlug(tool.slug);
            if (!fullTool) return null;
            return <ToolCard key={tool.slug} tool={fullTool} />;
          })}
        </ScrollableCarousel>
      </div>
    </section>
  );
};
