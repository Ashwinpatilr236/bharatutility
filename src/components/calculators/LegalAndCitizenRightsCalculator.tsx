import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  FileText, 
  GraduationCap, 
  Map, 
  ShieldAlert, 
  Globe2, 
  FlaskConical, 
  Heart, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  PhoneCall
} from 'lucide-react';

export type LegalRightsMode = 
  | 'ipc-bns' 
  | 'rti-generator' 
  | 'ugc-verifier' 
  | 'all-india-bhulekh' 
  | 'cybercrime-1930' 
  | 'visa-free-passport' 
  | 'food-adulteration' 
  | 'blood-compatibility';

interface Props {
  initialMode?: LegalRightsMode;
  onResultChange?: (result: string) => void;
}

// BNS / IPC Mapping Data
const IPC_BNS_DATA = [
  { ipc: 'Section 420', title: 'Cheating and dishonestly inducing delivery of property', bns: 'BNS Section 318(4)', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: 'Up to 7 years imprisonment + Fine' },
  { ipc: 'Section 302', title: 'Punishment for murder', bns: 'BNS Section 103(1)', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: 'Death or Imprisonment for life + Fine' },
  { ipc: 'Section 304A', title: 'Causing death by negligence (Rash driving)', bns: 'BNS Section 106(1)', bailable: 'Bailable', cognizable: 'Cognizable', punishment: 'Up to 5 years imprisonment + Fine' },
  { ipc: 'Section 307', title: 'Attempt to murder', bns: 'BNS Section 109', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: 'Up to 10 years or life imprisonment + Fine' },
  { ipc: 'Section 378 / 379', title: 'Theft / Punishment for theft', bns: 'BNS Section 303(2)', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: 'Up to 3 years or community service' },
  { ipc: 'Section 375 / 376', title: 'Rape / Punishment for rape', bns: 'BNS Section 64', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: 'Rigorous imprisonment 10 yrs to Life' },
  { ipc: 'Section 354', title: 'Assault or criminal force to woman with intent to outrage modesty', bns: 'BNS Section 74', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: '1 to 5 years imprisonment + Fine' },
  { ipc: 'Section 498A', title: 'Husband or relative of husband subjecting woman to cruelty', bns: 'BNS Section 85 & 86', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: 'Up to 3 years imprisonment + Fine' },
  { ipc: 'Section 506', title: 'Punishment for criminal intimidation', bns: 'BNS Section 351(2)', bailable: 'Bailable', cognizable: 'Non-Cognizable', punishment: 'Up to 2 years imprisonment or Fine' },
  { ipc: 'Section 323', title: 'Voluntarily causing hurt', bns: 'BNS Section 115(2)', bailable: 'Bailable', cognizable: 'Non-Cognizable', punishment: 'Up to 1 year or ₹1,000 fine or both' },
  { ipc: 'Section 34', title: 'Acts done by several persons in furtherance of common intention', bns: 'BNS Section 3(5)', bailable: 'As per main offence', cognizable: 'As per main offence', punishment: 'Joint liability' },
  { ipc: 'Section 120B', title: 'Punishment of criminal conspiracy', bns: 'BNS Section 61(2)', bailable: 'As per offence', cognizable: 'As per offence', punishment: 'Same as abetment of offence' },
  { ipc: 'Section 406', title: 'Punishment for criminal breach of trust', bns: 'BNS Section 316(2)', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: 'Up to 5 years imprisonment + Fine' },
  { ipc: 'Section 467 / 468', title: 'Forgery for purpose of cheating', bns: 'BNS Section 336(3)', bailable: 'Non-Bailable', cognizable: 'Cognizable', punishment: 'Up to 7 years imprisonment + Fine' },
  { ipc: 'Section 279', title: 'Rash driving or riding on a public way', bns: 'BNS Section 281', bailable: 'Bailable', cognizable: 'Cognizable', punishment: 'Up to 6 months or ₹1,000 fine' },
  { ipc: 'Section 144 / 149', title: 'Unlawful assembly with deadly weapons', bns: 'BNS Section 190 / 191', bailable: 'Bailable / Non-Bailable', cognizable: 'Cognizable', punishment: 'Up to 2 years or Fine' },
];

// All-India Bhulekh Portals
const STATE_BHULEKH_LIST = [
  { state: 'Uttar Pradesh', portal: 'UP Bhulekh', url: 'https://upbhulekh.gov.in', recordTypes: 'Khasra, Khatauni, Bhu-Naksha, Registry Verification' },
  { state: 'Maharashtra', portal: 'Mahabhulekh (7/12 & 8A)', url: 'https://bhulekh.mahabhumi.gov.in', recordTypes: 'Satbara (7/12), 8A Extract, Ferfar mutation' },
  { state: 'Madhya Pradesh', portal: 'MP Bhulekh', url: 'https://mpbhulekh.gov.in', recordTypes: 'Khasra, Khatauni, Bhu-Abhilekh, Land Parcel Map' },
  { state: 'Bihar', portal: 'Bihar Bhumi (Revenue & Land Reforms)', url: 'https://biharbhumi.bihar.gov.in', recordTypes: 'Dakhil Kharij, Jamabandi, LPC certificate' },
  { state: 'Rajasthan', portal: 'Apna Khata (E-Dharti)', url: 'https://apnakhata.rajasthan.gov.in', recordTypes: 'Jamabandi Nakal, Khasra Map, Mutation status' },
  { state: 'Gujarat', portal: 'AnyRoR Gujarat', url: 'https://anyror.gujarat.gov.in', recordTypes: 'VF7 (Survey No), VF8A (Khata), 135-D Notice' },
  { state: 'Karnataka', portal: 'Bhoomi Karnataka', url: 'https://landrecords.karnataka.gov.in', recordTypes: 'RTC (Pahani), Mutation Status, Revenue Maps' },
  { state: 'Telangana', portal: 'Dharani Integrated Land Records', url: 'https://dharani.telangana.gov.in', recordTypes: 'Passbook Data, Mutation, Land Status' },
  { state: 'Andhra Pradesh', portal: 'Meebhoomi AP', url: 'https://meebhoomi.ap.gov.in', recordTypes: '1B Record, Adangal, Village 1-B, Survey No' },
  { state: 'Haryana', portal: 'Jamabandi Haryana (HALRIS)', url: 'https://jamabandi.nic.in', recordTypes: 'Jamabandi Nakal, Mutation Orders, Cadastral Maps' },
  { state: 'Punjab', portal: 'PLRS Punjab Land Records', url: 'https://plrs.org.in', recordTypes: 'Fard Jamabandi, Mutation verification' },
  { state: 'West Bengal', portal: 'BanglarBhumi', url: 'https://banglarbhumi.gov.in', recordTypes: 'Khatian & Plot Information, Warish Application' },
  { state: 'Odisha', portal: 'Bhulekh Odisha', url: 'https://bhulekh.ori.nic.in', recordTypes: 'ROR Front Page, ROR Back Page, Map View' },
  { state: 'Tamil Nadu', portal: 'e-Services Tamil Nadu (Patta/Chitta)', url: 'https://eservices.tn.gov.in/eservicesnew', recordTypes: 'Patta, Chitta, A-Register Extract, FMB Sketch' },
];

// Visa-Free & VoA Countries for Indian Passport
const VISA_COUNTRIES = [
  { country: 'Thailand', type: 'Visa-Free', duration: '60 Days', notes: 'Valid till declared extension, return flight required' },
  { country: 'Malaysia', type: 'Visa-Free', duration: '30 Days', notes: 'MDAC digital arrival card to be filled 3 days prior' },
  { country: 'Sri Lanka', type: 'Visa-Free / Free ETA', duration: '30 Days', notes: 'Free tourism ETA via official portal' },
  { country: 'Mauritius', type: 'Visa-Free', duration: '90 Days', notes: 'Proof of hotel stay + sufficient foreign exchange' },
  { country: 'Nepal', type: 'Freedom of Movement (No Visa)', duration: 'Indefinite', notes: 'Voter ID card or Indian Passport valid for entry' },
  { country: 'Bhutan', type: 'Entry Permit on Arrival', duration: '14 Days', notes: 'SDF (Sustainable Development Fee) applies' },
  { country: 'Indonesia (Bali)', type: 'Visa on Arrival (VoA)', duration: '30 Days (Extendable)', notes: 'Fee ~$35 USD payable at airport counter or e-VOA' },
  { country: 'United Arab Emirates (Dubai)', type: 'Visa on Arrival / 14-Day', duration: '14 Days', notes: 'For Indians with valid US, UK, or Schengen Visa' },
  { country: 'Maldives', type: 'Free Visa on Arrival', duration: '30 Days', notes: 'Pre-booked hotel confirmation + IMUGA form' },
  { country: 'Seychelles', type: 'Visitor Permit on Arrival', duration: '30 Days', notes: 'Free visitor permit on arrival with return ticket' },
  { country: 'Vietnam', type: 'e-Visa (Fast 3-Day)', duration: '30 to 90 Days', notes: 'Online application with $25 USD fee' },
  { country: 'Kenya', type: 'eTA (Electronic Travel Auth)', duration: '90 Days', notes: 'Online ETA required before boarding' },
  { country: 'Oman', type: 'Visa-Free / VoA', duration: '14 Days', notes: 'For holders of valid US/UK/Schengen/Canada visas' },
  { country: 'Qatar', type: 'Free Visa on Arrival', duration: '30 Days', notes: 'Valid passport + return ticket + hotel booking' },
  { country: 'Iran', type: 'Visa-Free', duration: '15 Days', notes: 'For tourism entry once every 6 months via air' },
  { country: 'Kazakhstan', type: 'Visa-Free', duration: '14 Days', notes: 'Direct flights from Delhi/Mumbai' },
];

// FSSAI DART Home Tests
const FOOD_TESTS = [
  {
    item: '🥛 Milk & Dairy',
    adulterant: 'Detergent & Synthetic Chemical',
    testName: 'Shake & Lather Persistence Test',
    steps: 'Take 10ml of milk in a clean transparent glass. Add 10ml of water and shake vigorously for 15 seconds.',
    pureResult: 'Lather/foam subsides completely within 30-40 seconds.',
    adulteratedResult: 'Dense, thick soap-like lather persists for a long time (>2 minutes). Milk feels slippery between fingers.',
  },
  {
    item: '🍯 Pure Honey',
    adulterant: 'Sugar / Invert Sugar Syrup (Jaggery/Cane)',
    testName: 'Water Dissolution & Cotton Flame Test',
    steps: '1. Drop a spoonful of honey into a glass of cold water without stirring. 2. Dip a dry cotton wick in honey and light it with a matchstick.',
    pureResult: '1. Pure honey settles at the bottom as a dense lump without dissolving immediately. 2. Cotton wick burns smoothly.',
    adulteratedResult: '1. Honey dissolves quickly and clouds the water. 2. Cotton wick crackles loudly due to added water/syrup.',
  },
  {
    item: '🟡 Haldi (Turmeric Powder)',
    adulterant: 'Metanil Yellow (Toxic Industrial Dye) / Lead Chromate',
    testName: 'Concentrated Acid / Lemon Test',
    steps: 'Add half a teaspoon of turmeric powder to a test glass of water. Add a few drops of lemon juice or diluted acid.',
    pureResult: 'Water stays bright yellow.',
    adulteratedResult: 'Water instantly turns deep magenta / bright violet red.',
  },
  {
    item: '🧈 Desi Ghee',
    adulterant: 'Vanaspati (Hydrogenated Fat) / Animal Tallow',
    testName: 'Sugar + Hydrochloric Acid (Baudouin Test)',
    steps: 'Take 5ml of melted ghee. Add a pinch of sugar and shake well. Add 5ml of concentrated HCl acid.',
    pureResult: 'No pink/crimson color layer appears.',
    adulteratedResult: 'A crimson red / pink color forms within 5 minutes indicating presence of sesame oil/vanaspati.',
  },
  {
    item: '🌶️ Lal Mirch (Red Chilli Powder)',
    adulterant: 'Brick Powder / Artificial Red Dyes',
    testName: 'Water Sedimentation Test',
    steps: 'Add a teaspoon of red chilli powder into a glass of plain water.',
    pureResult: 'Chilli floats or leaves a light natural color without leaving abrasive mud at bottom.',
    adulteratedResult: 'Heavy brick sediment settles at the bottom instantly with gritty sand texture when rubbed.',
  },
  {
    item: '⚫ Kali Mirch (Black Pepper)',
    adulterant: 'Papaya Seeds & Light Berries',
    testName: 'Alcohol / Water Floatation Test',
    steps: 'Add black pepper to a glass of water or rubbing alcohol.',
    pureResult: 'Genuine black pepper corns are dense and sink directly to the bottom.',
    adulteratedResult: 'Papaya seeds have lower density and float to the surface.',
  },
];

export const LegalAndCitizenRightsCalculator: React.FC<Props> = ({
  initialMode = 'ipc-bns',
  onResultChange,
}) => {
  const [activeTab, setActiveTab] = useState<LegalRightsMode>(initialMode);
  const [copied, setCopied] = useState(false);

  // Search states
  const [lawSearch, setLawSearch] = useState('');
  const [bhulekhSearch, setBhulekhSearch] = useState('');
  const [visaSearch, setVisaSearch] = useState('');
  const [ugcSearch, setUgcSearch] = useState('');

  // RTI Form State
  const [rtiDept, setRtiDept] = useState('Public Works Department (PWD) / Municipal Corporation');
  const [rtiSubject, setRtiSubject] = useState('Information regarding status of road repair & tender expenditure');
  const [rtiQuery, setRtiQuery] = useState('1. Certified copy of work order and sanction budget for Road No. 4.\n2. Date of commencement and contractual completion date.\n3. Name and designation of the inspecting engineer.');
  const [rtiApplicant, setRtiApplicant] = useState('Rajesh Sharma');
  const [rtiAddress, setRtiAddress] = useState('Flat 402, Greenfield Apts, Sector 12, New Delhi - 110075');
  const [rtiLang, setRtiLang] = useState<'en' | 'hi'>('en');

  // Blood Group State
  const [selectedBlood, setSelectedBlood] = useState('O+');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLaws = useMemo(() => {
    if (!lawSearch.trim()) return IPC_BNS_DATA;
    const q = lawSearch.toLowerCase();
    return IPC_BNS_DATA.filter(
      (item) =>
        item.ipc.toLowerCase().includes(q) ||
        item.bns.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q)
    );
  }, [lawSearch]);

  const filteredBhulekh = useMemo(() => {
    if (!bhulekhSearch.trim()) return STATE_BHULEKH_LIST;
    const q = bhulekhSearch.toLowerCase();
    return STATE_BHULEKH_LIST.filter(
      (item) =>
        item.state.toLowerCase().includes(q) ||
        item.portal.toLowerCase().includes(q) ||
        item.recordTypes.toLowerCase().includes(q)
    );
  }, [bhulekhSearch]);

  const filteredVisa = useMemo(() => {
    if (!visaSearch.trim()) return VISA_COUNTRIES;
    const q = visaSearch.toLowerCase();
    return VISA_COUNTRIES.filter(
      (item) =>
        item.country.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
  }, [visaSearch]);

  // RTI Template Output
  const generateRtiText = () => {
    if (rtiLang === 'hi') {
      return `सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के तहत आवेदन

सेवा में,
जन सूचना अधिकारी (PIO),
${rtiDept}

विषय: ${rtiSubject}

महोदय/महोदया,
मैं, ${rtiApplicant}, भारत का नागरिक, सूचना का अधिकार अधिनियम 2005 के तहत निम्नलिखित सूचना की प्रमाणित प्रतिलिपि प्राप्त करना चाहता हूँ:

${rtiQuery}

1. मैं ₹10 का आवेदन शुल्क (IPO / कोर्ट फीस स्टैंप / ऑनलाइन रसीद संख्या: ________) संलग्न कर रहा हूँ।
2. यदि मांगी गई सूचना आपके विभाग से संबंधित नहीं है, तो RTI एक्ट की धारा 6(3) के तहत 5 दिनों के भीतर संबंधित विभाग को अंतरित करने की कृपा करें।

आवेदक का नाम: ${rtiApplicant}
पता: ${rtiAddress}
दिनांक: ${new Date().toLocaleDateString('hi-IN')}
हस्ताक्षर: ____________________`;
    }

    return `APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer (PIO),
${rtiDept}

SUBJECT: ${rtiSubject}

Respected Sir/Madam,
I, ${rtiApplicant}, a citizen of India, hereby request you to kindly provide certified copies / information regarding the following queries under the RTI Act, 2005:

${rtiQuery}

1. Application Fee: I have enclosed the statutory application fee of Rs. 10/- via (IPO / Demand Draft / Court Fee Stamp / Online Receipt No: ________).
2. Transfer of Application: In case any of the requested information falls under another public authority, kindly transfer this application within 5 days under Section 6(3) of the RTI Act 2005.

Applicant Name: ${rtiApplicant}
Postal Address: ${rtiAddress}
Date: ${new Date().toLocaleDateString('en-IN')}
Signature: ____________________`;
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700">
        {[
          { id: 'ipc-bns', label: '⚖️ IPC to BNS Law Finder', icon: Scale },
          { id: 'rti-generator', label: '📜 RTI Application Maker', icon: FileText },
          { id: 'all-india-bhulekh', label: '🗺️ State Land Records (Bhulekh)', icon: Map },
          { id: 'cybercrime-1930', label: '🚨 1930 Cyber Fraud Emergency', icon: ShieldAlert },
          { id: 'visa-free-passport', label: '🌍 Indian Passport Visa-Free', icon: Globe2 },
          { id: 'food-adulteration', label: '🧪 Food Adulteration Test (FSSAI)', icon: FlaskConical },
          { id: 'blood-compatibility', label: '🩸 Blood Group & eRaktKosh', icon: Heart },
          { id: 'ugc-verifier', label: '🎓 UGC University Verifier', icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as LegalRightsMode)}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
        
        {/* 1. IPC to BNS Law Finder */}
        {activeTab === 'ipc-bns' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
                <span>New Criminal Laws of India (Effective July 1, 2024)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                IPC to BNS (Bharatiya Nyaya Sanhita) Law Section Finder
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Instantly map old Indian Penal Code (IPC 1860) sections to new Bharatiya Nyaya Sanhita (BNS 2023) sections with bailable status & legal punishments.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                value={lawSearch}
                onChange={(e) => setLawSearch(e.target.value)}
                placeholder="Search by IPC section (e.g. 420, 302, 307), BNS, or crime name (cheating, murder, theft)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLaws.map((law, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                        Old Law: {law.ipc}
                      </div>
                      <div className="text-sm font-black text-neutral-900 dark:text-white font-display">
                        New Law: {law.bns}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        law.bailable === 'Bailable'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {law.bailable}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                    {law.title}
                  </p>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-[11px] space-y-1">
                    <div className="flex justify-between text-neutral-500">
                      <span>Nature:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{law.cognizable}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Punishment:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{law.punishment}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. RTI Application Generator */}
        {activeTab === 'rti-generator' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
                <span>DoPT Section 6(1) Compliant Legal Format</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                RTI Application & First Appeal Form Generator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Generate a ready-to-print, legally compliant RTI Application Letter for any Central or State Government department.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setRtiLang('en')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      rtiLang === 'en' ? 'bg-indigo-600 text-white' : 'bg-neutral-50 dark:bg-neutral-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setRtiLang('hi')}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                      rtiLang === 'hi' ? 'bg-indigo-600 text-white' : 'bg-neutral-50 dark:bg-neutral-800'
                    }`}
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Public Authority / Department Name
                  </label>
                  <input
                    type="text"
                    value={rtiDept}
                    onChange={(e) => setRtiDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={rtiSubject}
                    onChange={(e) => setRtiSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Questions / Information Required (Point-wise)
                  </label>
                  <textarea
                    rows={4}
                    value={rtiQuery}
                    onChange={(e) => setRtiQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Applicant Name
                    </label>
                    <input
                      type="text"
                      value={rtiApplicant}
                      onChange={(e) => setRtiApplicant(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Postal Address
                    </label>
                    <input
                      type="text"
                      value={rtiAddress}
                      onChange={(e) => setRtiAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* RTI Preview Card */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Official Ready-to-Print Format
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(generateRtiText())}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-accent text-white text-xs font-bold shadow-xs hover:scale-102 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Letter'}</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white text-xs font-bold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>

                <pre className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto text-neutral-800 dark:text-neutral-200">
                  {generateRtiText()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 3. All-India Land Records (Bhulekh) */}
        {activeTab === 'all-india-bhulekh' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>Digital India Land Records (DILRMP)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                All-India Land Records (Bhulekh / Khasra-Khatauni) Directory
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Direct access to official certified digital land portals, Khasra, Khatauni, Satbara (7/12), Pahani, and Bhu-Naksha across 28 Indian States.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                value={bhulekhSearch}
                onChange={(e) => setBhulekhSearch(e.target.value)}
                placeholder="Search by state name (e.g. Uttar Pradesh, Maharashtra, Bihar, Gujarat)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBhulekh.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {item.state}
                    </div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white font-display mt-0.5">
                      {item.portal}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {item.recordTypes}
                    </p>
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-accent hover:scale-102 transition-all"
                  >
                    <span>Open Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 1930 Cyber Fraud Emergency */}
        {activeTab === 'cybercrime-1930' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
                <span>MHA Citizen Financial Cyber Fraud Reporting System</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                1930 Cyber Crime & Digital Arrest Emergency Action Guide
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Immediate protocol to freeze stolen funds within the Golden 2-Hour window and report UPI/digital arrest scams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                  <PhoneCall className="w-4 h-4" />
                  <span>STEP 1: Call 1930 Instantly</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Call the national cyber financial helpline <strong>1930</strong> within 2 hours of money transfer. PIO alerts bank nodal officers to freeze recipient accounts immediately.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>STEP 2: Cybercrime.gov.in FIR</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Log on to <code>cybercrime.gov.in</code>. File an incident with UTR number, screenshot of chat/transaction, phone numbers, and bank passbook.
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Digital Arrest Warning</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  <strong>NO Police, CBI, or ED conducts arrest over Skype/WhatsApp video calls.</strong> There is no legal provision for "Digital Arrest" under Indian Law.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. Indian Passport Visa-Free */}
        {activeTab === 'visa-free-passport' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
                <span>Passport Power Directory (60+ International Destinations)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Indian Passport Visa-Free & Visa-on-Arrival Country Explorer
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Explore countries where Indian citizens can travel without prior visa embassy appointments or with fast e-Visa / VoA at the airport.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                value={visaSearch}
                onChange={(e) => setVisaSearch(e.target.value)}
                placeholder="Search country (e.g. Thailand, Malaysia, Bali, Dubai, Mauritius)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVisa.map((country, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white font-display">
                      {country.country}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      {country.type}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Permitted Stay: <strong className="text-neutral-800 dark:text-neutral-200">{country.duration}</strong>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                    {country.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Food Adulteration */}
        {activeTab === 'food-adulteration' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>FSSAI DART (Detect Adulteration with Rapid Test) Manual</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Indian Food Adulteration Quick Home Test Guide
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Simple step-by-step scientific kitchen tests to detect synthetic chemicals, dyes, and adulterants in daily groceries.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FOOD_TESTS.map((test, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3"
                >
                  <div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                      {test.item}
                    </div>
                    <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                      Adulterant: {test.adulterant}
                    </div>
                  </div>

                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    <strong>Test Procedure:</strong> {test.steps}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                      <strong>✅ Pure:</strong> {test.pureResult}
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
                      <strong>❌ Adulterated:</strong> {test.adulteratedResult}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Blood Group & eRaktKosh */}
        {activeTab === 'blood-compatibility' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
                <span>MoHFW eRaktKosh Central Blood Bank Directory</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Emergency Blood Compatibility & eRaktKosh Directory
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Check universal donor/recipient matching, donation recovery guidelines, and official national blood bank inventory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                  Select Patient Blood Group:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <button
                      key={bg}
                      onClick={() => setSelectedBlood(bg)}
                      className={`py-3 rounded-2xl text-sm font-black border transition-all ${
                        selectedBlood === bg
                          ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                          : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Universal Red Blood Donor:</span>
                    <span className="font-bold text-rose-600">O Negative (O-)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Universal Red Blood Recipient:</span>
                    <span className="font-bold text-emerald-600">AB Positive (AB+)</span>
                  </div>
                </div>
              </div>

              {/* Compatibility Output */}
              <div className="p-6 rounded-3xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-4">
                <div>
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                    Matching Profile for {selectedBlood}
                  </div>
                  <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Can safely RECEIVE blood from:
                  </div>
                  <div className="text-lg font-black text-neutral-900 dark:text-white font-mono mt-1">
                    {selectedBlood === 'O-' && 'O- only'}
                    {selectedBlood === 'O+' && 'O+, O-'}
                    {selectedBlood === 'A-' && 'A-, O-'}
                    {selectedBlood === 'A+' && 'A+, A-, O+, O-'}
                    {selectedBlood === 'B-' && 'B-, O-'}
                    {selectedBlood === 'B+' && 'B+, B-, O+, O-'}
                    {selectedBlood === 'AB-' && 'AB-, A-, B-, O-'}
                    {selectedBlood === 'AB+' && 'Universal Recipient (All Types: A+, A-, B+, B-, AB+, AB-, O+, O-)'}
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-200 dark:border-rose-800">
                  <a
                    href="https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/stockAvailability.cnt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:scale-102 transition-all"
                  >
                    <span>Search eRaktKosh Live Blood Stock ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. UGC Verifier */}
        {activeTab === 'ugc-verifier' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
                <span>University Grants Commission (Ministry of Education)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                UGC & NAAC University Genuine vs Fake Status Verifier
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Check whether an Indian university holds Section 2(f) & 12(B) UGC approval and verify against the official UGC Fake Universities List.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>UGC Official Blacklist Warning:</span>
              </div>
              <p>
                Institutions functioning without statutory UGC approval cannot confer valid degrees (BA, B.Sc, B.Tech, MBA, Ph.D). Always check official recognition before taking admission.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="font-bold text-neutral-900 dark:text-white">UGC Official Recognition Directories:</div>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li><a href="https://www.ugc.gov.in/centraluniversity.aspx" target="_blank" rel="noopener noreferrer" className="text-accent underline">Central Universities List ↗</a></li>
                  <li><a href="https://www.ugc.gov.in/stateuniversity.aspx" target="_blank" rel="noopener noreferrer" className="text-accent underline">State Public Universities ↗</a></li>
                  <li><a href="https://www.ugc.gov.in/privatuniversity.aspx" target="_blank" rel="noopener noreferrer" className="text-accent underline">State Private Universities ↗</a></li>
                  <li><a href="https://www.ugc.gov.in/page/fake-universities.aspx" target="_blank" rel="noopener noreferrer" className="text-rose-600 underline font-bold">UGC Official Fake Universities Blacklist ↗</a></li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <div className="font-bold text-neutral-900 dark:text-white">NAAC & NIRF Rankings:</div>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li><a href="http://naac.gov.in" target="_blank" rel="noopener noreferrer" className="text-accent underline">NAAC Institutional Accreditation (A++, A+, A) ↗</a></li>
                  <li><a href="https://www.nirfindia.org" target="_blank" rel="noopener noreferrer" className="text-accent underline">NIRF National Institutional Ranking Framework ↗</a></li>
                  <li><a href="https://www.aicte-india.org" target="_blank" rel="noopener noreferrer" className="text-accent underline">AICTE Approved Technical Colleges ↗</a></li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
