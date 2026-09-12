import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from '../common/DynamicIcon';
import { Link } from '../common/Link';
import { Compass, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

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
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow & Task Kits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-display">
            You May Also Need
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Curated combinations of tools designed to help you complete end-to-end tasks without switching websites
          </p>
        </div>
      </div>

      {/* Workflow Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {TOOL_CLUSTERS.map(cluster => {
          const isActive = cluster.id === activeClusterId;
          return (
            <button
              key={cluster.id}
              onClick={() => setActiveClusterId(cluster.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? 'bg-accent text-white border-accent shadow-md shadow-accent/20'
                  : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-accent/40'
              }`}
            >
              <DynamicIcon name={cluster.icon} className="w-4 h-4" />
              <span>{cluster.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Cluster Grid */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/90 dark:border-neutral-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-neutral-100 dark:border-neutral-800 gap-2">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-display flex items-center gap-2">
              <DynamicIcon name={activeCluster.icon} className="w-5 h-5 text-accent" />
              {activeCluster.name}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              {activeCluster.subtitle}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-subtle text-accent w-fit">
            {activeCluster.tools.length} Coordinated Utilities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeCluster.tools.map(tool => (
            <Link
              key={tool.slug}
              to={`/tools/${tool.slug}`}
              className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60 hover:border-accent dark:hover:border-accent hover:bg-white dark:hover:bg-neutral-800 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                  <DynamicIcon name={tool.icon} className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-accent transition-colors">
                  {tool.name}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-neutral-200/60 dark:border-neutral-700/50 flex items-center justify-between text-xs font-semibold text-accent">
                <span>Use Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
