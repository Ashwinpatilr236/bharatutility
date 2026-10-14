import React, { useState, useMemo } from 'react';
import {
  Smartphone,
  FolderLock,
  Fingerprint,
  Car,
  ShieldAlert,
  Train,
  Smile,
  Zap,
  PhoneCall,
  HeartPulse,
  CheckCircle2,
  ExternalLink,
  Info,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Send,
  Timer
} from 'lucide-react';

export type OfficialGovtAppMode =
  | 'umang-app'
  | 'digilocker-guide'
  | 'maadhaar-lock'
  | 'mparivahan-guide'
  | 'tafcop-sims'
  | 'railmadad-guide'
  | 'pmkisan-face'
  | 'bhim-offline'
  | 'emergency-112'
  | 'abha-digital';

interface Props {
  initialMode?: OfficialGovtAppMode;
  onResultChange?: (result: string) => void;
}

export const OfficialGovtAppsMasterSuite: React.FC<Props> = ({
  initialMode = 'umang-app'
}) => {
  const [activeTab] = useState<OfficialGovtAppMode>(initialMode);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // 1. UMANG State
  const [umangService, setUmangService] = useState<'epfo' | 'nps' | 'lpg' | 'cbse' | 'pan'>('epfo');
  const [umangStepsDone, setUmangStepsDone] = useState<Record<string, boolean>>({});

  // 2. DigiLocker State
  const [digiDocType, setDigiDocType] = useState<'dl' | 'rc' | 'aadhaar' | 'insurance' | 'marksheet'>('dl');
  const [policeOfficerState, setPoliceOfficerState] = useState<'normal' | 'arguing'>('normal');

  // 3. mAadhaar Lock State
  const [aepsAnswers, setAepsAnswers] = useState({
    simAgentPhotocopy: false,
    hotelCheckinCopy: true,
    registryLandSale: false,
    primaryBankAepsActive: true,
  });
  const [lockSimulationState, setLockSimulationState] = useState<'unlocked' | 'locking' | 'locked' | 'temp-unlock'>('unlocked');
  const [tempUnlockTimer, setTempUnlockTimer] = useState(600); // 10 mins

  // 4. mParivahan State
  const [vehicleNo, setVehicleNo] = useState('DL01AB1234');
  const [rcCheckedItems, setRcCheckedItems] = useState<Record<string, boolean>>({});

  // 5. TAFCOP State
  const [simsCount, setSimsCount] = useState<number>(3);
  const [stateRegion, setStateRegion] = useState<'general' | 'restricted'>('general');
  const [familyMembersUsingMyId, setFamilyMembersUsingMyId] = useState<number>(1);

  // 6. RailMadad State
  const [trainNo, setTrainNo] = useState('12951');
  const [pnrNo, setPnrNo] = useState('');
  const [coachBerth, setCoachBerth] = useState('B2-45');
  const [railIssue, setRailIssue] = useState<'cleanliness' | 'medical' | 'ac' | 'water' | 'security'>('cleanliness');

  // 7. PM-Kisan State
  const [kisanLandSeeded, setKisanLandSeeded] = useState(true);
  const [kisanAadhaarDbt, setKisanAadhaarDbt] = useState(true);
  const [kisanEkycDone, setKisanEkycDone] = useState(false);

  // 8. BHIM Offline *99# State
  const [ussdBank, setUssdBank] = useState('sbi');
  const [ussdAction, setUssdAction] = useState<'balance' | 'send' | 'pin'>('balance');
  const [ussdSendAmount, setUssdSendAmount] = useState('500');

  // 9. Emergency 112 State
  const [iceName, setIceName] = useState('');
  const [iceBlood, setIceBlood] = useState('O+');
  const [iceEmergencyPhone, setIceEmergencyPhone] = useState('');
  const [iceAllergies, setIceAllergies] = useState('No known drug allergies');

  // 10. ABHA State
  const [abhaAge, setAbhaAge] = useState(30);
  const [abhaFamilyMembers, setAbhaFamilyMembers] = useState(4);
  const [hasAyushmanCard, setHasAyushmanCard] = useState(false);

  // Toggle checklist helper
  const toggleCheck = (stateObj: Record<string, boolean>, setObj: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, key: string) => {
    setObj(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. UMANG App */}
      {activeTab === 'umang-app' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-blue-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                  <Smartphone className="w-3.5 h-3.5" /> MeitY & NeGD Certified Hub
                </div>
                <h3 className="text-xl font-bold text-white">UMANG Multi-Department Service Resolver</h3>
              </div>
              <a
                href="https://web.umang.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                Launch web.umang.gov.in <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-300 text-sm">
              Select your urgent government need to get the exact direct steps, prerequisite checklist, and direct portal link instead of hunting across 1,200+ disjointed tabs.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'epfo', label: 'EPFO Passbook' },
                { id: 'nps', label: 'NPS Tier-1' },
                { id: 'lpg', label: 'LPG Gas Booking' },
                { id: 'cbse', label: 'CBSE Results' },
                { id: 'pan', label: 'PAN Card Services' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setUmangService(item.id as any)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all text-left ${
                    umangService === item.id
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-300 uppercase tracking-wider">Required Prerequisites Checklist</span>
                <span className="text-slate-400">Tick as you verify:</span>
              </div>

              {umangService === 'epfo' && (
                <div className="space-y-2 text-xs text-slate-200">
                  {[
                    { key: 'uan', label: '12-digit UAN (Universal Account Number) is activated' },
                    { key: 'aadhaar_link', label: 'Aadhaar is linked with UAN on EPFO portal' },
                    { key: 'mobile_otp', label: 'Aadhaar-linked mobile is active to receive SMS OTP' },
                    { key: 'kyc_bank', label: 'Bank account & IFSC verified by employer' },
                  ].map(step => (
                    <label key={step.key} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950">
                      <input
                        type="checkbox"
                        checked={!!umangStepsDone[step.key]}
                        onChange={() => toggleCheck(umangStepsDone, setUmangStepsDone, step.key)}
                        className="rounded accent-blue-500 w-4 h-4 cursor-pointer"
                      />
                      <span className={umangStepsDone[step.key] ? 'line-through text-slate-500' : ''}>{step.label}</span>
                    </label>
                  ))}
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-200">
                    💡 <strong>Pro Tip:</strong> On UMANG app, search <em>"EPFO"</em> &rarr; Click <em>"View Passbook"</em> &rarr; Enter UAN and OTP. Your full balance with employer share is displayed in under 15 seconds.
                  </div>
                </div>
              )}

              {umangService === 'lpg' && (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>Works for all 3 national oil marketing companies: <strong>Indane (IOCL)</strong>, <strong>Bharat Gas (BPCL)</strong>, and <strong>HP Gas (HPCL)</strong>.</p>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-200">
                    ✅ Enter your 17-digit LPG Consumer ID once on UMANG. Book refills with 1 click & track subsidy credit directly into your linked bank account.
                  </div>
                </div>
              )}

              {umangService === 'cbse' && (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>Official digital marksheet, migration certificate, and passing certificate can be fetched directly without visiting school.</p>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-200">
                    ✅ Requires Roll Number, School Code, Center Number, and Admit Card ID.
                  </div>
                </div>
              )}

              {umangService === 'nps' && (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>Check Tier-1 & Tier-2 pension corpus, scheme-wise NAV, and download PRAN e-statement for Section 80CCD(1B) tax deduction.</p>
                </div>
              )}

              {umangService === 'pan' && (
                <div className="space-y-2 text-xs text-slate-200">
                  <p>Services supported: Track PAN Application status, Link Aadhaar with PAN, and Request Reprint of physical PAN card.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DigiLocker Legal Validator */}
      {activeTab === 'digilocker-guide' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-cyan-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                  <FolderLock className="w-3.5 h-3.5" /> Rule 9A IT Rules 2016 Law Engine
                </div>
                <h3 className="text-xl font-bold text-white">DigiLocker Legal Standing & Traffic Police Notice Generator</h3>
              </div>
              <a
                href="https://www.digilocker.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                Open DigiLocker <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-300 text-sm">
              Under Rule 9A of the Information Technology (Preservation and Retention of Information by Intermediaries Providing Digital Locker Facilities) Rules, 2016, electronic records in DigiLocker are treated at par with physical documents.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Document Questioned by Authority:</label>
                <select
                  value={digiDocType}
                  onChange={(e) => setDigiDocType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="dl">Driving Licence (DL)</option>
                  <option value="rc">Registration Certificate (RC / Vehicle Book)</option>
                  <option value="insurance">Motor Insurance Policy Certificate</option>
                  <option value="aadhaar">Aadhaar Card / e-Aadhaar</option>
                  <option value="marksheet">Class 10th / 12th Board Marksheet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Authority Context:</label>
                <select
                  value={policeOfficerState}
                  onChange={(e) => setPoliceOfficerState(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="normal">Standard Verification (Routine Check)</option>
                  <option value="arguing">Officer Insisting on Physical Original Paper</option>
                </select>
              </div>
            </div>

            {/* Generated Legal Notice Box */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Ready-to-Show Statutory Legal Notice:
                </span>
                <button
                  onClick={() => copyText('digi-legal', `Under Rule 9A of the IT Rules 2016 and MoRTH Notification No. RT-11036/64/2017-MVL dated 17/12/2018, documents produced via DigiLocker / mParivahan have legal standing identical to original physical certificates. Demand of physical papers is in direct violation of Central Government Notification.`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg text-xs font-semibold transition-all"
                >
                  {copiedId === 'digi-legal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'digi-legal' ? 'Copied Gazette Text!' : 'Copy Legal Statement'}
                </button>
              </div>

              <blockquote className="p-3 bg-cyan-950/20 border-l-4 border-cyan-500 rounded-r-xl text-slate-200 text-xs leading-relaxed font-mono">
                "As per MoRTH Advisory No. RT-11036/64/2017-MVL and Rule 9A of IT Rules 2016: Electronic forms of {digiDocType.toUpperCase()} available on DigiLocker or mParivahan are legally recognised at par with original physical documents. Police/Enforcement officers cannot impound physical papers if authentic digital record is presented with verified QR."
              </blockquote>

              <div className="text-[11px] text-slate-400">
                📌 If an officer insists on physical paper, politely cite <strong>MoRTH Notification RT-11036/64/2017-MVL</strong>. They cannot issue a challan under Section 130 of the Motor Vehicles Act for not carrying original papers.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. mAadhaar Biometric Lock */}
      {activeTab === 'maadhaar-lock' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-emerald-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <Fingerprint className="w-3.5 h-3.5" /> AePS Clone Fraud Shield
                </div>
                <h3 className="text-xl font-bold text-white">mAadhaar Biometric Risk Calculator & Lock Guide</h3>
              </div>
              <a
                href="https://myaadhaar.uidai.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                Open myaadhaar.uidai.gov.in <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-300 text-sm">
              AePS (Aadhaar Enabled Payment System) allows withdrawals using only your Aadhaar number and fingerprint. Scammers use cloned silicone fingerprints stolen from registry documents. Locking your biometrics 100% blocks this attack.
            </p>

            {/* Risk Assessment Quiz */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">AePS Fraud Risk Calculator (Check What Applies to You):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                {[
                  { key: 'simAgentPhotocopy', label: 'Given physical photocopy of Aadhaar to roadside SIM agent or shopkeeper' },
                  { key: 'hotelCheckinCopy', label: 'Given physical paper copy of Aadhaar during hotel check-in' },
                  { key: 'registryLandSale', label: 'Signed property deed / registry with thumb impression at sub-registrar' },
                  { key: 'primaryBankAepsActive', label: 'Bank account with savings has AePS active by default' },
                ].map(item => (
                  <label key={item.key} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-emerald-500/50">
                    <input
                      type="checkbox"
                      checked={(aepsAnswers as any)[item.key]}
                      onChange={() => setAepsAnswers(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                      className="rounded accent-emerald-500 w-4 h-4 mt-0.5"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              {/* Calculated Score */}
              {(() => {
                const count = Object.values(aepsAnswers).filter(Boolean).length;
                const riskLevel = count >= 3 ? 'CRITICAL RISK' : count >= 1 ? 'MODERATE RISK' : 'LOW RISK';
                const riskColor = count >= 3 ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : count >= 1 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                return (
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${riskColor}`}>
                    <div>
                      <div className="text-sm font-bold">Your Exposure Rating: {riskLevel}</div>
                      <div className="text-xs opacity-90">
                        {count >= 2 ? 'Your thumbprints and Aadhaar details are likely present on public/semi-public records. You must lock biometrics immediately!' : 'Relatively safe, but locking biometrics provides zero-cost bulletproof peace of mind.'}
                      </div>
                    </div>
                    <button
                      onClick={() => setLockSimulationState(lockSimulationState === 'locked' ? 'unlocked' : 'locked')}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs transition-all shrink-0"
                    >
                      {lockSimulationState === 'locked' ? '🔒 Biometrics Are LOCKED' : 'Simulate Locking Now'}
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <h5 className="font-bold text-white text-sm">3 Steps to Lock on Official UIDAI Portal:</h5>
              <div>1. Go to <strong>myaadhaar.uidai.gov.in</strong> &rarr; Click <em>"Login with Aadhaar & OTP"</em>.</div>
              <div>2. Click <strong>"Lock/Unlock Biometrics"</strong> tile &rarr; Confirm.</div>
              <div>3. Whenever you need to authenticate at bank or RTO, tap <em>"Temporary Unlock"</em> — it automatically re-locks itself in 10 minutes!</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. mParivahan */}
      {activeTab === 'mparivahan-guide' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-purple-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                  <Car className="w-3.5 h-3.5" /> NextGen MoRTH Tools
                </div>
                <h3 className="text-xl font-bold text-white">mParivahan Virtual RC & e-Challan Hub</h3>
              </div>
              <a
                href="https://echallan.parivahan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                Check e-Challan Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Enter Vehicle Registration Number:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="e.g. DL01AB1234"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-purple-500"
                  />
                  <a
                    href={`https://echallan.parivahan.gov.in/index/accused-challan`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    Check Challan <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="text-[11px] text-slate-400">
                  Direct lookup redirects to Parivahan e-Challan accused portal where you can enter Chassis/Engine last 5 digits to verify pending camera fines.
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-purple-300">Virtual RC Creation Checklist (NextGen App):</div>
                {[
                  { key: 'chassis', label: 'Last 5 digits of Chassis Number' },
                  { key: 'engine', label: 'Last 5 digits of Engine Number' },
                  { key: 'puc', label: 'Active PUC certificate on Parivahan' },
                  { key: 'insurance', label: 'Valid third-party/comprehensive insurance' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!rcCheckedItems[item.key]}
                      onChange={() => toggleCheck(rcCheckedItems, setRcCheckedItems, item.key)}
                      className="rounded accent-purple-500 w-3.5 h-3.5"
                    />
                    <span className={rcCheckedItems[item.key] ? 'line-through text-slate-500' : ''}>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAFCOP Portal */}
      {activeTab === 'tafcop-sims' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-rose-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5" /> Department of Telecommunications (DoT)
                </div>
                <h3 className="text-xl font-bold text-white">TAFCOP SIM Limit & Identity Theft Calculator</h3>
              </div>
              <a
                href="https://tafcop.sancharsaathi.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                Launch TAFCOP Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-300 text-sm">
              DoT rules limit maximum mobile SIM connections per individual. If cybercriminals register SIM cards under your name without your knowledge, you are legally accountable for crimes committed using those numbers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">State / Jurisdiction:</label>
                <select
                  value={stateRegion}
                  onChange={(e) => setStateRegion(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="general">Rest of India (Max 9 SIMs)</option>
                  <option value="restricted">J&K, Assam, North East (Max 6 SIMs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">How many SIMs are you using personally?</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={simsCount}
                  onChange={(e) => setSimsCount(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">SIMs given to family on your Aadhaar:</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={familyMembersUsingMyId}
                  onChange={(e) => setFamilyMembersUsingMyId(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Calculations Result */}
            {(() => {
              const maxAllowed = stateRegion === 'restricted' ? 6 : 9;
              const totalKnown = simsCount + familyMembersUsingMyId;
              const remaining = maxAllowed - totalKnown;
              const isOverLimit = totalKnown > maxAllowed;

              return (
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isOverLimit
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  <div>
                    <div className="text-sm font-bold">
                      {isOverLimit ? '⚠️ Exceeding DoT Statutory Limit!' : '✅ Within Legal Permissible Limit'}
                    </div>
                    <div className="text-xs opacity-90 mt-0.5">
                      Legal Quota: {maxAllowed} SIMs | Your Known Total: {totalKnown} SIMs | {remaining >= 0 ? `${remaining} connections still available.` : `Over limit by ${Math.abs(remaining)}. Extra SIMs can be disconnected without notice!`}
                    </div>
                  </div>
                  <a
                    href="https://tafcop.sancharsaathi.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shrink-0 transition-all"
                  >
                    Verify Active Numbers on TAFCOP &rarr;
                  </a>
                </div>
              );
            })()}

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400">
              💡 <strong>How to Use TAFCOP:</strong> Visit <em>tafcop.sancharsaathi.gov.in</em> &rarr; Enter your mobile number &rarr; Enter OTP &rarr; The portal displays all mobile numbers registered against your Aadhaar. If any number is unfamiliar, click <strong>"Not My Number"</strong> to trigger immediate carrier suspension.
            </div>
          </div>
        </div>
      )}

      {/* 6. RailMadad */}
      {activeTab === 'railmadad-guide' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-orange-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-orange-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-semibold">
                  <Train className="w-3.5 h-3.5" /> Indian Railways Rapid Redressal
                </div>
                <h3 className="text-xl font-bold text-white">RailMadad Quick Complaint & Tweet Generator</h3>
              </div>
              <a
                href="https://railmadad.indianrailways.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                Official RailMadad Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-300 text-sm">
              Generate a formatted SOS complaint message ready to copy-paste for the RailMadad app, 139 helpline, or tagging official Indian Railways X (Twitter) handles for fastest resolution while on running trains.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Train No./Name:</label>
                <input
                  type="text"
                  value={trainNo}
                  onChange={(e) => setTrainNo(e.target.value)}
                  placeholder="e.g. 12951"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PNR Number (Optional):</label>
                <input
                  type="text"
                  value={pnrNo}
                  onChange={(e) => setPnrNo(e.target.value)}
                  placeholder="10-digit PNR"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coach & Berth:</label>
                <input
                  type="text"
                  value={coachBerth}
                  onChange={(e) => setCoachBerth(e.target.value)}
                  placeholder="e.g. B2-45"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Category:</label>
                <select
                  value={railIssue}
                  onChange={(e) => setRailIssue(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="cleanliness">Coach / Toilet Cleanliness</option>
                  <option value="ac">AC Not Cooling / Fan Fault</option>
                  <option value="water">No Water in Toilets</option>
                  <option value="medical">Medical Assistance / First Aid</option>
                  <option value="security">Security / RPF Assistance</option>
                </select>
              </div>
            </div>

            {/* Formatted Output */}
            {(() => {
              const issueMap: Record<string, string> = {
                cleanliness: 'Severe lack of cleanliness in coach and toilets. Foul odor, trash not removed by OBHS staff.',
                ac: 'AC cooling failure in running coach. High temperature causing distress to senior citizens and children.',
                water: 'Complete lack of water in coach washrooms and washbasins.',
                medical: 'URGENT: Passenger requires emergency medical attention and doctor on arrival at upcoming station.',
                security: 'URGENT: Unauthorized entry / dispute in coach. RPF escort assistance requested.'
              };

              const tweetText = `URGENT RAILMADAD COMPLAINT:\nTrain: ${trainNo || 'Express'}\nCoach/Berth: ${coachBerth || 'Confirmed'}\nPNR: ${pnrNo || 'N/A'}\nIssue: ${issueMap[railIssue]}\nKindly attend at next scheduled station. @RailMinIndia @RailwaySeva`;

              return (
                <div className="p-4 bg-slate-950 rounded-2xl border border-orange-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-400">Formatted Ready-to-Send Complaint:</span>
                    <button
                      onClick={() => copyText('rail-complaint', tweetText)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-xs font-semibold"
                    >
                      {copiedId === 'rail-complaint' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === 'rail-complaint' ? 'Copied Message!' : 'Copy Complaint'}
                    </button>
                  </div>
                  <pre className="p-3 bg-slate-900 rounded-xl text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                    {tweetText}
                  </pre>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>📞 Or dial directly: <strong className="text-white">139</strong></span>
                    <span>|</span>
                    <span>SMS to: <strong className="text-white">139</strong></span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 7. PM-Kisan Face Auth */}
      {activeTab === 'pmkisan-face' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-emerald-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <Smile className="w-3.5 h-3.5" /> Ministry of Agriculture & Farmers Welfare
                </div>
                <h3 className="text-xl font-bold text-white">PM-Kisan Installment Eligibility & Face e-KYC Checker</h3>
              </div>
              <a
                href="https://pmkisan.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                Official pmkisan.gov.in <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-300 text-sm">
              Under PM-Kisan Samman Nidhi, ₹6,000 per year is disbursed in 3 equal installments of ₹2,000. Installments get blocked if any of the 3 statutory mandates are incomplete.
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">3 Mandatory Conditions Verification:</h4>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>1. Land Seeding (Khasra / Khatauni mapped with PM-Kisan ID)</span>
                  <input
                    type="checkbox"
                    checked={kisanLandSeeded}
                    onChange={(e) => setKisanLandSeeded(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>2. Bank Account Aadhaar DBT Seeding (NPCI Direct Benefit Transfer active)</span>
                  <input
                    type="checkbox"
                    checked={kisanAadhaarDbt}
                    onChange={(e) => setKisanAadhaarDbt(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                  <span>3. Biometric / Face e-KYC Completed</span>
                  <input
                    type="checkbox"
                    checked={kisanEkycDone}
                    onChange={(e) => setKisanEkycDone(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* Status Outcome */}
              {(() => {
                const allDone = kisanLandSeeded && kisanAadhaarDbt && kisanEkycDone;
                return (
                  <div className={`p-4 rounded-xl border ${
                    allDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    <div className="text-sm font-bold">
                      {allDone ? '✅ 100% Eligible for Next ₹2,000 Installment' : '⚠️ Installment Will Be Blocked! Action Required:'}
                    </div>
                    {!allDone && (
                      <ul className="text-xs list-disc list-inside mt-2 space-y-1 opacity-90">
                        {!kisanLandSeeded && <li>Visit local Lekhpal / Patwari or District Agriculture Office for Land Seeding.</li>}
                        {!kisanAadhaarDbt && <li>Visit bank branch to submit Aadhaar DBT Mandate consent form (NPCI mapping).</li>}
                        {!kisanEkycDone && <li>Install <strong>PM Kisan App</strong> + <strong>Aadhaar FaceRD App</strong> on your phone for instant OTP-free face scan!</li>}
                      </ul>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 8. BHIM Offline *99# USSD */}
      {activeTab === 'bhim-offline' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Zap className="w-3.5 h-3.5" /> NPCI NUUP Technology
                </div>
                <h3 className="text-xl font-bold text-white">*99# Offline USSD UPI Simulator (Zero Internet)</h3>
              </div>
              <button
                onClick={() => copyText('dial-ussd', '*99#')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                {copiedId === 'dial-ussd' ? 'Copied *99#!' : 'Copy *99# Code'} <Copy className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-slate-300 text-sm">
              Works across all GSM mobile operators (BSNL, Airtel, Jio, Vi) and basic keypad feature phones (Nokia 105, JioPhone, etc.) even when internet connection or data pack is zero.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Bank:</label>
                <select
                  value={ussdBank}
                  onChange={(e) => setUssdBank(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="sbi">State Bank of India (SBI)</option>
                  <option value="pnb">Punjab National Bank (PNB)</option>
                  <option value="bob">Bank of Baroda (BOB)</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="canara">Canara Bank</option>
                  <option value="union">Union Bank of India</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Action to Perform:</label>
                <select
                  value={ussdAction}
                  onChange={(e) => setUssdAction(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="balance">Check Account Balance</option>
                  <option value="send">Send Money (P2P Transfer)</option>
                  <option value="pin">Change / Reset UPI PIN</option>
                </select>
              </div>

              {ussdAction === 'send' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount to Transfer (₹):</label>
                  <input
                    type="number"
                    value={ussdSendAmount}
                    onChange={(e) => setUssdSendAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* USSD Screen Simulation */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3 font-mono">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                📱 Simulated Phone Dialing Sequence:
              </div>
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs text-emerald-400">
                <div>Step 1: Open Phone Dialer &rarr; Type <strong>*99#</strong> &rarr; Press Call (From bank registered SIM)</div>
                {ussdAction === 'balance' && (
                  <>
                    <div>Step 2: Menu pops up &rarr; Reply with <strong>3</strong> (Check Balance)</div>
                    <div>Step 3: Enter your 4-digit or 6-digit UPI PIN &rarr; Press Send</div>
                    <div className="text-white bg-slate-950 p-2.5 rounded border border-slate-800 mt-2">
                      📲 Screen displays: "Your {ussdBank.toUpperCase()} A/c ending with XXXX balance is Rs. XX,XXX.00"
                    </div>
                  </>
                )}
                {ussdAction === 'send' && (
                  <>
                    <div>Step 2: Reply with <strong>1</strong> (Send Money)</div>
                    <div>Step 3: Select recipient mode (1: Mobile No, 2: UPI ID, 3: Saved Beneficiary)</div>
                    <div>Step 4: Enter Amount: <strong>₹{ussdSendAmount}</strong></div>
                    <div>Step 5: Enter UPI PIN &rarr; Instant IMPS settlement 24x7!</div>
                  </>
                )}
                {ussdAction === 'pin' && (
                  <>
                    <div>Step 2: Reply with <strong>7</strong> (UPI PIN)</div>
                    <div>Step 3: Select 1 (Set/Forgot UPI PIN) &rarr; Enter debit card last 6 digits + Expiry MM/YY</div>
                  </>
                )}
              </div>
              <div className="text-[11px] text-slate-400">
                * Note: Telecom operators may charge a statutory USSD fee of up to ₹0.50 per session as regulated by TRAI.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Emergency 112 */}
      {activeTab === 'emergency-112' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-rose-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-rose-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                  <PhoneCall className="w-3.5 h-3.5" /> ERSS All-India Network
                </div>
                <h3 className="text-xl font-bold text-white">Emergency 112 & ICE Medical Card Generator</h3>
              </div>
              <a
                href="tel:112"
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto animate-pulse"
              >
                Dial 112 Directly <PhoneCall className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-300 text-sm">
              Single unified emergency number across all 36 States and UTs unifying Police (100), Fire (101), Ambulance (108), and Disaster teams.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">Generate In-Case-of-Emergency (ICE) Card:</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Your Full Name:</label>
                    <input
                      type="text"
                      value={iceName}
                      onChange={(e) => setIceName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1">Blood Group:</label>
                      <select
                        value={iceBlood}
                        onChange={(e) => setIceBlood(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">Emergency Contact Phone:</label>
                      <input
                        type="tel"
                        value={iceEmergencyPhone}
                        onChange={(e) => setIceEmergencyPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Critical Medical Condition / Allergies:</label>
                    <input
                      type="text"
                      value={iceAllergies}
                      onChange={(e) => setIceAllergies(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Printable ICE Card Preview */}
              <div className="p-5 bg-gradient-to-br from-rose-900/30 to-slate-950 rounded-2xl border border-rose-500/40 flex flex-col justify-between text-xs space-y-4 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      🚨 EMERGENCY MEDICAL CARD (ICE)
                    </span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">INDIA 112</span>
                  </div>
                  <div className="space-y-1.5 text-slate-200">
                    <div>Name: <strong className="text-white">{iceName || 'Your Name'}</strong></div>
                    <div>Blood Group: <strong className="text-rose-400 font-bold">{iceBlood}</strong></div>
                    <div>ICE Contact: <strong className="text-emerald-400">{iceEmergencyPhone || '+91-XXXXX-XXXXX'}</strong></div>
                    <div>Allergies: <span className="text-slate-300">{iceAllergies}</span></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Keep screenshot in phone lockscreen</span>
                  <button
                    onClick={() => copyText('ice-card', `ICE EMERGENCY CARD:\nName: ${iceName || 'Citizen'}\nBlood: ${iceBlood}\nEmergency Contact: ${iceEmergencyPhone}\nAllergies: ${iceAllergies}\nEmergency: Dial 112`)}
                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg font-semibold text-xs"
                  >
                    {copiedId === 'ice-card' ? 'Copied Card Text!' : 'Copy Info'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. ABHA Digital Health Card */}
      {activeTab === 'abha-digital' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-950/40 via-slate-900/60 to-slate-950/80 p-6 rounded-3xl border border-teal-500/20 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
                  <HeartPulse className="w-3.5 h-3.5" /> Ayushman Bharat Digital Mission (ABDM)
                </div>
                <h3 className="text-xl font-bold text-white">ABHA 14-Digit Health ID & OPD Queue Bypass Hub</h3>
              </div>
              <a
                href="https://abha.abdm.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md self-start sm:self-auto"
              >
                Create ABHA ID <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-slate-300 text-sm">
              ABHA (Ayushman Bharat Health Account) is your unique 14-digit identifier. It creates a digital health locker for lab reports, prescriptions, and allows scan-and-share OPD tokens at AIIMS, Safdarjung, and government hospitals in under 30 seconds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Your Age:</label>
                <input
                  type="number"
                  value={abhaAge}
                  onChange={(e) => setAbhaAge(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Family Members Count:</label>
                <input
                  type="number"
                  value={abhaFamilyMembers}
                  onChange={(e) => setAbhaFamilyMembers(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasAyushmanCard}
                    onChange={(e) => setHasAyushmanCard(e.target.checked)}
                    className="rounded accent-teal-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Have PM-JAY Ayushman Card (₹5 Lakh cover)</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-teal-500/30 space-y-3 text-xs">
              <h4 className="font-bold text-teal-300 uppercase tracking-wider">Top 4 ABHA Privileges You Can Unlock:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-200">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <strong className="text-white">1. Scan & Share OPD Token:</strong>
                  <p className="text-slate-400 mt-1">Skip 2-hour long hospital registration queues at government hospitals. Just scan the counter QR code with ABHA app to get an immediate OPD slip on phone.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <strong className="text-white">2. Paperless Diagnostic History:</strong>
                  <p className="text-slate-400 mt-1">Blood test results from Dr Lal, SRL, or district hospitals get automatically pushed into your encrypted phone vault.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <strong className="text-white">3. Zero Data Sharing without Consent:</strong>
                  <p className="text-slate-400 mt-1">No doctor, insurer, or clinic can view past medical records unless you approve the prompt on your personal phone.</p>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <strong className="text-white">4. Link with Ayushman Bharat PM-JAY:</strong>
                  <p className="text-slate-400 mt-1">{hasAyushmanCard ? 'Your ₹5,00,000 cashless insurance family wallet connects seamlessly across 27,000+ empanelled hospitals.' : 'You can verify if your family qualifies for the ₹5 Lakh free hospitalization scheme under SECC 2011.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
