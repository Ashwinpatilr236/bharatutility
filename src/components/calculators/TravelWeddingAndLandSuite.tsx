import React, { useState } from 'react';
import {
  Train,
  Heart,
  Tractor,
  FileCheck,
  GraduationCap,
  Building2,
  Leaf,
  Droplets,
  Radio,
  Lock,
  CheckCircle2,
  Copy
} from 'lucide-react';

export type TravelWeddingLandToolMode =
  | 'pnr-decoder'
  | 'wedding-budget'
  | 'kcc-loan'
  | 'gazette-guide'
  | 'board-marks'
  | 'rent-escalation'
  | 'ayurveda-prakriti'
  | 'rainwater-tank'
  | 'sar-radiation'
  | 'bank-locker';

interface Props {
  initialMode?: TravelWeddingLandToolMode;
  onResultChange?: (result: string) => void;
}

export const TravelWeddingAndLandSuite: React.FC<Props> = ({
  initialMode = 'pnr-decoder'
}) => {
  const [activeTab, setActiveTab] = useState<TravelWeddingLandToolMode>(initialMode);
  const [copied, setCopied] = useState(false);

  // 1. PNR Decoder State
  const [pnrCode, setPnrCode] = useState('GNWL');
  const [waitingNumber, setWaitingNumber] = useState(15);
  const [travelClass, setTravelClass] = useState('3A');
  const [daysToJourney, setDaysToJourney] = useState(10);

  // 2. Wedding Budget State
  const [totalWeddingBudget, setTotalWeddingBudget] = useState(1500000);
  const [guestCount, setGuestCount] = useState(400);
  const [weddingDays, setWeddingDays] = useState(2);

  // 3. KCC Agriloan State
  const [kccLoanAmount, setKccLoanAmount] = useState(200000);
  const [isPromptRepayment, setIsPromptRepayment] = useState(true);

  // 4. Gazette Guide State
  const [nameChangeReason, setNameChangeReason] = useState('marriage');

  // 5. Board Marks State
  const [subjectMarks, setSubjectMarks] = useState([
    { name: 'Language 1 (English/Hindi)', marks: 88 },
    { name: 'Language 2 / Elective', marks: 82 },
    { name: 'Mathematics / Standard', marks: 74 },
    { name: 'Science / Physics', marks: 79 },
    { name: 'Social Science / Chemistry', marks: 85 },
    { name: '6th Additional / Skill Subject', marks: 92 }
  ]);

  // 6. Rent Escalation State
  const [baseMonthlyRent, setBaseMonthlyRent] = useState(45000);
  const [escalationRate, setEscalationRate] = useState(5);
  const [leaseYears, setLeaseYears] = useState(5);

  // 7. Ayurveda Prakriti State
  const [prakritiAnswers, setPrakritiAnswers] = useState<Record<number, 'vata' | 'pitta' | 'kapha'>>({
    1: 'vata',
    2: 'pitta',
    3: 'vata',
    4: 'pitta'
  });

  // 8. Rainwater Harvesting State
  const [rooftopAreaSqFt, setRooftopAreaSqFt] = useState(1200);
  const [annualRainfallMm, setAnnualRainfallMm] = useState(950);
  const [roofType, setRoofType] = useState<'concrete' | 'metal' | 'tiles'>('concrete');

  // 9. SAR Radiation State
  const [deviceSarHead, setDeviceSarHead] = useState(0.85);
  const [useEarphones, setUseEarphones] = useState(true);

  // 10. Bank Locker State
  const [lockerBank, setLockerBank] = useState('sbi');
  const [lockerSize, setLockerSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Helper copy function
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 text-white shadow-2xl">
      {/* Suite Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <span className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Train className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Travel, Wedding, Agriloan & Citizen Life Suite
            </h2>
            <p className="text-xs text-slate-400">
              IRCTC Quotas, Shaadi Budget, KCC 4% Loan, Gazette Name Change, Board Best-of-5 & Locker 100x
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-8">
        {[
          { id: 'pnr-decoder', label: '🚆 PNR Quotas', icon: Train },
          { id: 'wedding-budget', label: '💍 Shaadi Budget', icon: Heart },
          { id: 'kcc-loan', label: '🌾 KCC 4% Loan', icon: Tractor },
          { id: 'gazette-guide', label: '📜 Gazette Name', icon: FileCheck },
          { id: 'board-marks', label: '🏫 Best of 5', icon: GraduationCap },
          { id: 'rent-escalation', label: '🏢 Rent Escalation', icon: Building2 },
          { id: 'ayurveda-prakriti', label: '🌿 Prakriti Dosha', icon: Leaf },
          { id: 'rainwater-tank', label: '🌧️ Rainwater Sizing', icon: Droplets },
          { id: 'sar-radiation', label: '📱 SAR Radiation', icon: Radio },
          { id: 'bank-locker', label: '🏦 Locker 100x', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TravelWeddingLandToolMode)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. IRCTC PNR Quotas & Waiting Confirmation Decoder */}
      {activeTab === 'pnr-decoder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-orange-400 flex items-center gap-2">
                <Train className="w-5 h-5" /> Indian Railways PNR & Quota Decoder
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Waiting List Type (Quota Code)
                </label>
                <select
                  value={pnrCode}
                  onChange={(e) => setPnrCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="GNWL">GNWL - General Waiting List (Highest Confirmation Priority)</option>
                  <option value="RLWL">RLWL - Remote Location Waiting List (Intermediate Stations)</option>
                  <option value="PQWL">PQWL - Pooled Quota Waiting List (Small Stations)</option>
                  <option value="TQWL">TQWL - Tatkal Waiting List (Lowest Priority)</option>
                  <option value="RAC">RAC - Reservation Against Cancellation (Guaranteed Half Berth)</option>
                  <option value="RSWL">RSWL - Roadside Station Waiting List</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Current Waiting No.
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={waitingNumber}
                    onChange={(e) => setWaitingNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Travel Class
                  </label>
                  <select
                    value={travelClass}
                    onChange={(e) => setTravelClass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value="SL">Sleeper (SL)</option>
                    <option value="3A">AC 3-Tier (3A / 3E)</option>
                    <option value="2A">AC 2-Tier (2A)</option>
                    <option value="1A">AC 1st Class (1A)</option>
                    <option value="CC">AC Chair Car (CC)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Days Left for Charting: {daysToJourney} Days
                </label>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={daysToJourney}
                  onChange={(e) => setDaysToJourney(parseInt(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            {/* PNR Confirmation Insights Card */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-6 rounded-2xl border border-orange-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  Confirmation Probability Analysis
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      `IRCTC Status: ${pnrCode} WL-${waitingNumber} | Class: ${travelClass} | Days: ${daysToJourney}`
                    )
                  }
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-xs text-slate-400">Estimated Confirmation Likelihood</div>
                <div className="text-2xl font-bold text-orange-400 mt-1">
                  {pnrCode === 'RAC'
                    ? '100% Guaranteed Boarding (RAC)'
                    : pnrCode === 'GNWL' && waitingNumber <= 15
                    ? 'High Chance (85% - 95%)'
                    : pnrCode === 'GNWL' && waitingNumber <= 40
                    ? 'Moderate Chance (60% - 75%)'
                    : pnrCode === 'TQWL'
                    ? 'Very Low (< 20% - Tatkal cancellations rare)'
                    : pnrCode === 'PQWL' && waitingNumber > 10
                    ? 'Low Chance (Small Quota Pool)'
                    : 'Moderate (45% - 60%)'}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {pnrCode === 'GNWL' &&
                    'General Waiting List clears first from all cancellations across originating to destination stations.'}
                  {pnrCode === 'RLWL' &&
                    'Remote Location Waiting clears only when someone cancels tickets from that specific intermediate station.'}
                  {pnrCode === 'TQWL' &&
                    'Tatkal Waiting List does NOT get RAC berths. If unconfirmed after final chart (4 hours before departure), ticket auto-refunds 100%.'}
                  {pnrCode === 'RAC' &&
                    'RAC passengers have full right to board train with a dedicated seat (side lower half berth), automatically upgraded to full berth on cancellations.'}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>Senior Citizen Lower Berth:</strong> Male (60+) & Female (45+) auto-assigned lower berth if booking single passenger.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    <strong>Auto-Upgradation:</strong> Free zero-cost upgrade to 2A/1A if higher class vacant at chart preparation.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Indian Wedding & Shaadi 7-Category Budget Planner */}
      {activeTab === 'wedding-budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                <Heart className="w-5 h-5" /> Indian Shaadi Budget & Guest Cost Planner
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Total Wedding Budget: ₹{(totalWeddingBudget / 100000).toFixed(1)} Lakhs
                </label>
                <input
                  type="range"
                  min="300000"
                  max="10000000"
                  step="50000"
                  value={totalWeddingBudget}
                  onChange={(e) => setTotalWeddingBudget(parseInt(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    step="25"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(50, parseInt(e.target.value) || 50))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Number of Days
                  </label>
                  <select
                    value={weddingDays}
                    onChange={(e) => setWeddingDays(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="1">1 Day (Reception / Main Day)</option>
                    <option value="2">2 Days (Haldi/Mehendi + Shaadi)</option>
                    <option value="3">3 Days (Sangeet + Haldi + Wedding)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300">
                Estimated Per-Guest Food Plate Cost Budget: ₹{Math.round((totalWeddingBudget * 0.30) / guestCount)} / guest
              </div>
            </div>

            {/* Shaadi Budget Allocation Breakdown */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-semibold text-white flex items-center justify-between">
                <span>Recommended 7-Category Realistic Allocation</span>
                <span className="text-rose-400 font-mono">₹{totalWeddingBudget.toLocaleString('en-IN')}</span>
              </h4>

              <div className="space-y-2">
                {[
                  { name: '🍲 Catering & Food (30%)', amount: totalWeddingBudget * 0.30 },
                  { name: '🏰 Venue & Lawn / Mandap (20%)', amount: totalWeddingBudget * 0.20 },
                  { name: '💍 Gold, Bridal Jewellery & Gifts (20%)', amount: totalWeddingBudget * 0.20 },
                  { name: '👗 Bridal & Groom Wardrobe / Makeup (10%)', amount: totalWeddingBudget * 0.10 },
                  { name: '📸 Photography & Cinematography (8%)', amount: totalWeddingBudget * 0.08 },
                  { name: '💐 Decor, Music & DJ (7%)', amount: totalWeddingBudget * 0.07 },
                  { name: '🛡️ Emergency Contingency Buffer (5%)', amount: totalWeddingBudget * 0.05 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-300">{item.name}</span>
                    <span className="font-mono font-semibold text-white">₹{Math.round(item.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Kisan Credit Card (KCC) 4% Subvention Interest Calculator */}
      {activeTab === 'kcc-loan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                <Tractor className="w-5 h-5" /> KCC Interest Subvention Scheme (ISS)
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  KCC Crop Loan Amount (Max ₹3 Lakhs for Subsidy): ₹{kccLoanAmount.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="25000"
                  max="300000"
                  step="5000"
                  value={kccLoanAmount}
                  onChange={(e) => setKccLoanAmount(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-white">Prompt Repayment (within 1 Year)</div>
                  <div className="text-xs text-slate-400">Govt gives 3% additional Prompt Repayment Incentive (PRI)</div>
                </div>
                <input
                  type="checkbox"
                  checked={isPromptRepayment}
                  onChange={(e) => setIsPromptRepayment(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <div>• Normal Bank Agri Rate: 9.0%</div>
                <div>• Central Govt Standard Subvention: 2.0% (Rate becomes 7.0%)</div>
                <div>• Prompt Repayment Subvention: {isPromptRepayment ? '3.0% Extra Subsidy' : '0% (Missed)'}</div>
                <div className="font-bold pt-1 text-sm text-emerald-400">
                  Effective Farmer Interest Rate: {isPromptRepayment ? '4.0% per annum' : '7.0% per annum'}
                </div>
              </div>
            </div>

            {/* KCC Farmer Payment Summary */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h4 className="font-semibold text-white text-sm">1-Year Farmer Repayment Breakdown</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Principal Borrowed</span>
                  <span className="text-lg font-bold text-white font-mono">₹{kccLoanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Interest Payable</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    ₹{Math.round(kccLoanAmount * (isPromptRepayment ? 0.04 : 0.07)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Total 1-Year Repayment Amount</div>
                <div className="text-2xl font-bold text-white mt-1 font-mono">
                  ₹{Math.round(kccLoanAmount + kccLoanAmount * (isPromptRepayment ? 0.04 : 0.07)).toLocaleString('en-IN')}
                </div>
                <div className="text-emerald-400 mt-2">
                  Total Government Subsidy Saved: ₹{Math.round(kccLoanAmount * (isPromptRepayment ? 0.05 : 0.02)).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Central Gazette Name Change Step-by-Step Guide */}
      {activeTab === 'gazette-guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
                <FileCheck className="w-5 h-5" /> Official Gazette of India Name Change
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Reason for Name Change</label>
                <select
                  value={nameChangeReason}
                  onChange={(e) => setNameChangeReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="marriage">After Marriage (Surname / Full Name Change)</option>
                  <option value="spelling">Spelling Correction in Aadhaar / 10th Certificate</option>
                  <option value="religion">Religion / Astrological Change</option>
                  <option value="major">Minor to Major Legal Identity Update</option>
                </select>
              </div>

              <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-xs text-cyan-300 space-y-1.5">
                <div className="font-semibold text-cyan-400">Official Portal & Fees:</div>
                <div>• Portal: egazette.gov.in (Department of Publication, Civil Lines, Delhi)</div>
                <div>• Standard Fee: ₹1,100 to ₹1,400 (Paid via BharatKosh.gov.in)</div>
                <div>• Processing Time: 15 to 30 working days</div>
              </div>
            </div>

            {/* 3 Mandatory Steps Roadmap */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-semibold text-white text-sm">3 Mandatory Legal Steps</h4>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400">Step 1: Notarized Affidavit (₹100 Stamp)</div>
                  <p className="text-slate-300">Draft affidavit declaring old name, new name, address, father's name with 2 witness signatures signed before a First Class Magistrate/Notary.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400">Step 2: Newspaper Advertisement (2 Dailies)</div>
                  <p className="text-slate-300">Publish in 1 National English daily + 1 Local Regional language newspaper (e.g. Times of India + Dainik Jagran / Lokmat).</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-cyan-400">Step 3: Gazette Notification Dossier</div>
                  <p className="text-slate-300">Submit CD with softcopy .docx file, original newspaper clippings, BharatKosh receipt, and Proforma to Controller of Publications, Delhi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CBSE / ICSE Board Best-of-5 Percentage Calculator */}
      {activeTab === 'board-marks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
              <h3 className="text-base font-semibold text-purple-400 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" /> 10th / 12th Best of 5 Subjects Calculator
              </h3>

              <div className="space-y-2">
                {subjectMarks.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-44 text-slate-300 truncate">{sub.name}</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={sub.marks}
                      onChange={(e) => {
                        const newMarks = [...subjectMarks];
                        newMarks[idx].marks = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                        setSubjectMarks(newMarks);
                      }}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-center font-mono"
                    />
                    <span className="text-slate-500">/ 100</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best of 5 Results */}
            {(() => {
              const lang1 = subjectMarks[0].marks;
              const rest = subjectMarks.slice(1).map(s => s.marks).sort((a, b) => b - a);
              const best5Total = lang1 + rest.slice(0, 4).reduce((acc, curr) => acc + curr, 0);
              const best5Pct = (best5Total / 500) * 100;
              const all6Total = subjectMarks.reduce((acc, curr) => acc + curr.marks, 0);
              const all6Pct = (all6Total / 600) * 100;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-purple-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Board Percentage Results</h4>

                  <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-slate-400">Best of 5 Percentage (CBSE / College Admission)</div>
                    <div className="text-3xl font-bold text-purple-400 font-mono mt-1">{best5Pct.toFixed(2)}%</div>
                    <div className="text-slate-300 mt-1">Total Marks: {best5Total} / 500</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">All 6 Subjects Aggregate:</span>
                    <span className="font-mono font-bold text-white">{all6Pct.toFixed(2)}% ({all6Total} / 600)</span>
                  </div>

                  <p className="text-slate-400 text-xs">
                    *Rule: Under CBSE policy, if a student fails or scores low in Science/Maths/Social Science, the 6th Skill/Additional subject replaces it in Best of 5.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 6. Commercial Shop & Office Rent Escalation Calculator */}
      {activeTab === 'rent-escalation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-blue-400 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Commercial Shop Rent Escalation
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Starting Monthly Rent: ₹{baseMonthlyRent.toLocaleString('en-IN')}
                </label>
                <input
                  type="number"
                  step="5000"
                  value={baseMonthlyRent}
                  onChange={(e) => setBaseMonthlyRent(Math.max(1000, parseInt(e.target.value) || 1000))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Escalation % ({escalationRate}%)
                  </label>
                  <select
                    value={escalationRate}
                    onChange={(e) => setEscalationRate(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="5">5% (Standard Annual)</option>
                    <option value="10">10% (Commercial High-Street)</option>
                    <option value="15">15% (3-Year Block Compound)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">
                    Lease Term
                  </label>
                  <select
                    value={leaseYears}
                    onChange={(e) => setLeaseYears(parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="3">3 Years (36 Months)</option>
                    <option value="5">5 Years (60 Months)</option>
                    <option value="9">9 Years (108 Months)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Year-by-Year Cashflow Schedule */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-semibold text-white text-sm">Year-wise Rent Cashflow Table</h4>

              <div className="space-y-2">
                {Array.from({ length: leaseYears }, (_, i) => {
                  const year = i + 1;
                  const currentRent = Math.round(baseMonthlyRent * Math.pow(1 + escalationRate / 100, i));
                  const annualPayout = currentRent * 12;
                  return (
                    <div key={year} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-300">Year {year}</span>
                      <span className="font-mono font-bold text-blue-400">₹{currentRent.toLocaleString('en-IN')} / mo</span>
                      <span className="text-slate-400 font-mono">₹{annualPayout.toLocaleString('en-IN')} / yr</span>
                    </div>
                  );
                })}
              </div>

              {baseMonthlyRent * 12 > 240000 && (
                <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-amber-300 text-xs">
                  ⚠️ Annual rent exceeds ₹2.4 Lakhs: Commercial tenant must deduct 10% TDS under Section 194-I.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Ayurvedic Prakriti (Vata, Pitta, Kapha) Dosha Analyzer */}
      {activeTab === 'ayurveda-prakriti' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                <Leaf className="w-5 h-5" /> Charaka Samhita Prakriti Questionnaire
              </h3>

              <div className="space-y-3 text-xs">
                {[
                  { id: 1, q: 'Body Frame & Structure:', opt: { vata: 'Slim, bony, difficulty gaining weight', pitta: 'Medium muscular frame, steady weight', kapha: 'Broad, heavy, gains weight easily' } },
                  { id: 2, q: 'Skin Nature:', opt: { vata: 'Dry, rough, cool, cracks easily', pitta: 'Warm, reddish, prone to moles/acne', kapha: 'Oily, smooth, soft, glowing' } },
                  { id: 3, q: 'Digestion & Appetite:', opt: { vata: 'Irregular, bloating, gas', pitta: 'Strong, intense, cannot skip meals', kapha: 'Slow, heavy, can fast easily' } },
                  { id: 4, q: 'Weather Sensitivity:', opt: { vata: 'Loves warmth, dislikes cold/wind', pitta: 'Loves cold, overheats/sweats easily', kapha: 'Dislikes damp/cold, loves sunlight' } }
                ].map((item) => (
                  <div key={item.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="font-semibold text-white">{item.id}. {item.q}</div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['vata', 'pitta', 'kapha'] as const).map((dosha) => (
                        <button
                          key={dosha}
                          onClick={() => setPrakritiAnswers({ ...prakritiAnswers, [item.id]: dosha })}
                          className={`p-1.5 rounded text-[11px] font-medium border text-center ${
                            prakritiAnswers[item.id] === dosha
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {dosha.toUpperCase()}: {item.opt[dosha].split(',')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prakriti Dominance Card */}
            {(() => {
              const counts: Record<'vata' | 'pitta' | 'kapha', number> = { vata: 0, pitta: 0, kapha: 0 };
              (Object.values(prakritiAnswers) as Array<'vata' | 'pitta' | 'kapha'>).forEach((v) => {
                if (counts[v] !== undefined) counts[v]++;
              });
              const dominant = (Object.entries(counts) as Array<['vata' | 'pitta' | 'kapha', number]>).sort((a, b) => b[1] - a[1])[0][0];

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Your Dominant Ayurvedic Dosha</h4>

                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="text-slate-400">Dominant Constitution</div>
                    <div className="text-2xl font-bold text-emerald-400 capitalize mt-1">{dominant} Dominant (Prakriti)</div>
                    <p className="text-slate-300 mt-2 leading-relaxed">
                      {dominant === 'vata' && 'Vata governs movement, nervous system, and circulation. Balanced by warm, nourishing, oily foods (Ghee, sesame, cooked khichdi) and fixed sleep routines.'}
                      {dominant === 'pitta' && 'Pitta governs digestion, metabolism, and intellect. Balanced by cooling foods (Coconut water, coriander, sweet fruits, cow milk) and avoiding excess spicy/sour foods.'}
                      {dominant === 'kapha' && 'Kapha governs stability, strength, and immunity. Balanced by light, spicy, bitter foods (Ginger, black pepper, honey) and active morning exercise.'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 8. Rainwater Harvesting Tank Sizing Calculator */}
      {activeTab === 'rainwater-tank' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
                <Droplets className="w-5 h-5" /> CGWB Rainwater Harvesting & Tank Sizing
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Rooftop Catchment Area: {rooftopAreaSqFt} Sq Feet (~{Math.round(rooftopAreaSqFt * 0.0929)} sq m)
                </label>
                <input
                  type="range"
                  min="300"
                  max="5000"
                  step="50"
                  value={rooftopAreaSqFt}
                  onChange={(e) => setRooftopAreaSqFt(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Average Annual City Rainfall: {annualRainfallMm} mm/year
                </label>
                <input
                  type="number"
                  step="50"
                  value={annualRainfallMm}
                  onChange={(e) => setAnnualRainfallMm(Math.max(200, parseInt(e.target.value) || 200))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Roof Surface Type</label>
                <select
                  value={roofType}
                  onChange={(e) => setRoofType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="concrete">Concrete RCC Terrace (0.80 Runoff Coeff)</option>
                  <option value="metal">Galvanized Metal Sheet (0.90 Runoff Coeff)</option>
                  <option value="tiles">Terracotta Tiles (0.75 Runoff Coeff)</option>
                </select>
              </div>
            </div>

            {/* Rainwater Harvesting Potential */}
            {(() => {
              const coeff = roofType === 'metal' ? 0.90 : roofType === 'concrete' ? 0.80 : 0.75;
              const areaSqM = rooftopAreaSqFt * 0.0929;
              const totalHarvestLitres = Math.round(areaSqM * annualRainfallMm * coeff);
              const recommendedTankLitres = Math.round(totalHarvestLitres * 0.20);

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-cyan-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Harvesting Potential & Tank Capacity</h4>

                  <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                    <div className="text-slate-400">Total Harvestable Rainwater per Year</div>
                    <div className="text-3xl font-bold text-cyan-400 font-mono mt-1">
                      {totalHarvestLitres.toLocaleString('en-IN')} Litres / Year
                    </div>
                    <div className="text-slate-300 mt-1">~{Math.round(totalHarvestLitres / 1000)} Water Tankers Saved</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Recommended Sump / Tank Size:</span>
                    <span className="font-mono font-bold text-emerald-400">{recommendedTankLitres.toLocaleString('en-IN')} Litres</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 9. Mobile SAR Radiation (*#07#) & Safe Distance Checker */}
      {activeTab === 'sar-radiation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                <Radio className="w-5 h-5" /> Mobile SAR Radiation Limit (DoT India)
              </h3>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-300">
                👉 <strong>How to Check on Your Phone:</strong> Open phone dialer and press <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded">*#07#</span> to view official Head & Body SAR limits.
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Device Head SAR Value: {deviceSarHead} W/kg (Indian Limit: 1.6 W/kg)
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1.6"
                  step="0.05"
                  value={deviceSarHead}
                  onChange={(e) => setDeviceSarHead(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-300">Use Earphones / Speakerphone for Calls</span>
                <input
                  type="checkbox"
                  checked={useEarphones}
                  onChange={(e) => setUseEarphones(e.target.checked)}
                  className="w-5 h-5 accent-amber-500 rounded"
                />
              </div>
            </div>

            {/* Radiation Safety Insights */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
              <h4 className="font-semibold text-white text-sm">DoT India Radiation Guidelines</h4>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Official India Limit:</span>
                  <span className="font-bold text-emerald-400">1.6 W/kg (over 1g tissue)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Your Device Level:</span>
                  <span className="font-bold text-white">{deviceSarHead} W/kg ({Math.round((deviceSarHead / 1.6) * 100)}% of limit)</span>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Keep phone at least 15mm away from body when sleeping.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Never talk when battery is under 15% (phone transmits at maximum power).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. Indian Bank Locker Rent & RBI 100x Liability Compensation Guide */}
      {activeTab === 'bank-locker' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-indigo-400 flex items-center gap-2">
                <Lock className="w-5 h-5" /> Bank Locker Rates & RBI 100x Liability Rule
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Bank Name</label>
                <select
                  value={lockerBank}
                  onChange={(e) => setLockerBank(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="sbi">State Bank of India (SBI)</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="pnb">Punjab National Bank (PNB)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Locker Size</label>
                <select
                  value={lockerSize}
                  onChange={(e) => setLockerSize(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="small">Small (Jewellery/Docs)</option>
                  <option value="medium">Medium (Silver/Multiple sets)</option>
                  <option value="large">Large (Family Heirlooms)</option>
                </select>
              </div>
            </div>

            {/* Locker Rent & 100x Compensation Output */}
            {(() => {
              const rates: Record<string, Record<string, number>> = {
                sbi: { small: 2000, medium: 4000, large: 8000 },
                hdfc: { small: 3500, medium: 7500, large: 15000 },
                icici: { small: 3000, medium: 7000, large: 14000 },
                pnb: { small: 1500, medium: 3500, large: 7000 }
              };
              const annualRent = rates[lockerBank]?.[lockerSize] || 2500;
              const rbiLiability = annualRent * 100;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-indigo-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Locker Pricing & RBI Protection</h4>

                  <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <div className="text-slate-400">Estimated Annual Locker Rent (+18% GST)</div>
                    <div className="text-2xl font-bold text-white font-mono mt-1">
                      ₹{annualRent.toLocaleString('en-IN')} / year <span className="text-xs font-normal text-slate-400">(+₹{Math.round(annualRent * 0.18)} GST)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-400">RBI Mandatory 100x Bank Liability Compensation</div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono">
                      ₹{rbiLiability.toLocaleString('en-IN')}
                    </div>
                    <p className="text-slate-300 text-xs mt-1">
                      Under RBI Revised Locker Directions (2023-2026), in cases of fire, theft, burglary, dacoity, building collapse, or bank employee fraud, the bank is legally bound to pay **100 times the annual rent** as minimum compensation.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
