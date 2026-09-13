import React, { useState } from 'react';
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
  Info
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
  const [activeTab, setActiveTab] = useState<OfficialGovtAppMode>(initialMode);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 text-white shadow-2xl">
      {/* Suite Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Smartphone className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Official Government of India Apps & Portals Suite
            </h2>
            <p className="text-xs text-slate-400">
              UMANG, DigiLocker Rule 9A, mAadhaar Biometric Lock, TAFCOP SIMs & 112 SOS
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-8">
        {[
          { id: 'umang-app', label: '📱 UMANG (1200+)', icon: Smartphone },
          { id: 'digilocker-guide', label: '📂 DigiLocker 9A', icon: FolderLock },
          { id: 'maadhaar-lock', label: '🆔 mAadhaar Lock', icon: Fingerprint },
          { id: 'mparivahan-guide', label: '🚗 mParivahan', icon: Car },
          { id: 'tafcop-sims', label: '🛡️ TAFCOP SIMs', icon: ShieldAlert },
          { id: 'railmadad-guide', label: '🚆 RailMadad 139', icon: Train },
          { id: 'pmkisan-face', label: '🌾 Face e-KYC', icon: Smile },
          { id: 'bhim-offline', label: '💸 Offline *99#', icon: Zap },
          { id: 'emergency-112', label: '🚨 112 India SOS', icon: PhoneCall },
          { id: 'abha-digital', label: '🏥 ABHA Health', icon: HeartPulse },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as OfficialGovtAppMode)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. UMANG App */}
      {activeTab === 'umang-app' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-blue-400 flex items-center gap-2">
              <Smartphone className="w-5 h-5" /> UMANG App (Unified Mobile App for New-Age Governance)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Developed by Ministry of Electronics and IT (MeitY) and NeGD. Acts as the single central hub for over 1,200+ central and state government services.
            </p>
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-300">
              Direct Official Portal: <strong>web.umang.gov.in</strong>
            </div>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white text-sm">Top Services in UMANG</h4>
            <div className="space-y-1.5 text-slate-300">
              <div>• <strong>EPFO:</strong> Check monthly EPF passbook balance & raise claim.</div>
              <div>• <strong>NPS:</strong> View Tier-1 pension holdings and PRAN statement.</div>
              <div>• <strong>LPG Gas:</strong> Book refill for Bharat Gas, HP Gas, or Indane.</div>
              <div>• <strong>CBSE / Boards:</strong> View official 10th and 12th board results.</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DigiLocker & Rule 9A IT Act */}
      {activeTab === 'digilocker-guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
              <FolderLock className="w-5 h-5" /> DigiLocker & IT Act Rule 9A Legal Power
            </h3>
            <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-300 space-y-2">
              <div className="font-bold text-sm">⚖️ Rule 9A Legal Equal Standing:</div>
              <p className="text-slate-200">
                Under Rule 9A of IT Rules 2016 and Section 4 of IT Act, electronic documents issued in DigiLocker (Aadhaar, Driving License, RC, Insurance) are legally equivalent to physical original paper documents.
              </p>
            </div>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-semibold text-white text-sm">Traffic Police Notice</h4>
            <p className="text-slate-300">
              If an inspector or police officer demands physical RC or DL, you can show the digital document in DigiLocker or mParivahan. They cannot seize the physical document or fine you for not carrying original papers.
            </p>
          </div>
        </div>
      )}

      {/* 3. mAadhaar Biometric Lock */}
      {activeTab === 'maadhaar-lock' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
              <Fingerprint className="w-5 h-5" /> mAadhaar Biometric Lock against AePS Fraud
            </h3>
            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 space-y-2">
              <div className="font-bold text-sm">🛡️ Prevent AePS Biometric Clone Theft:</div>
              <p className="text-slate-200">
                Locking your biometrics prevents anyone from using silicone cloned fingerprints to siphon money from your bank account via AePS (Aadhaar Enabled Payment System).
              </p>
            </div>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-semibold text-white text-sm">How to Lock/Unlock:</h4>
            <div className="space-y-1 text-slate-300">
              <div>1. Open mAadhaar app / myaadhaar.uidai.gov.in</div>
              <div>2. Click on 'Lock / Unlock Biometrics'.</div>
              <div>3. Unlock temporarily for 10 minutes when giving fingerprints at bank/RTO.</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. mParivahan */}
      {activeTab === 'mparivahan-guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-purple-400 flex items-center gap-2">
              <Car className="w-5 h-5" /> NextGen mParivahan (MoRTH)
            </h3>
            <p className="text-slate-300">
              Official Ministry of Road Transport and Highways app to generate QR-coded Virtual RC and Virtual Driving License.
            </p>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <h4 className="font-semibold text-white text-sm">Key Features:</h4>
            <div>• Real-time checking of e-Challan status on vehicle.</div>
            <div>• Check Insurance validity and PUC pollution certificate expiry.</div>
            <div>• Share Virtual RC with family members securely.</div>
          </div>
        </div>
      )}

      {/* 5. TAFCOP Sanchar Saathi */}
      {activeTab === 'tafcop-sims' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> TAFCOP Portal (Check SIMs Registered on your Name)
            </h3>
            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-300">
              Portal: <strong>tafcop.sancharsaathi.gov.in</strong>
            </div>
            <p className="text-slate-300">
              DoT rules allow a maximum of <strong>9 mobile connections</strong> per individual. Use TAFCOP to see all active numbers under your Aadhaar and report unknown fake numbers immediately.
            </p>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <h4 className="font-semibold text-white text-sm">3 Sanchar Saathi Modules:</h4>
            <div>• <strong>TAFCOP:</strong> Know your mobile connections.</div>
            <div>• <strong>CEIR:</strong> Block lost or stolen mobile phone.</div>
            <div>• <strong>Chakshu:</strong> Report suspected fraud WhatsApp/SMS calls.</div>
          </div>
        </div>
      )}

      {/* 6. RailMadad 139 */}
      {activeTab === 'railmadad-guide' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-orange-400 flex items-center gap-2">
              <Train className="w-5 h-5" /> RailMadad & UTS Mobile (Indian Railways)
            </h3>
            <p className="text-slate-300">
              Single emergency helpline <strong>139</strong> and real-time app for complaints on coach cleanliness, medical assistance, food quality, or security on running trains.
            </p>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <h4 className="font-semibold text-white text-sm">UTS on Mobile App:</h4>
            <p>Book unreserved general train tickets and local suburban monthly passes without standing in station ticket queues.</p>
          </div>
        </div>
      )}

      {/* 7. PM Kisan Face Auth e-KYC */}
      {activeTab === 'pmkisan-face' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
              <Smile className="w-5 h-5" /> PM-Kisan Face Authentication e-KYC
            </h3>
            <p className="text-slate-300">
              Farmers can complete mandatory e-KYC directly on their smartphone using the PM-Kisan mobile app with Aadhaar FaceRD without visiting any CSC center or using fingerprint scanners.
            </p>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <h4 className="font-semibold text-white text-sm">Install 2 Apps:</h4>
            <div>1. <strong>PM Kisan App</strong> (Ministry of Agriculture)</div>
            <div>2. <strong>Aadhaar FaceRD App</strong> (UIDAI)</div>
          </div>
        </div>
      )}

      {/* 8. BHIM Offline *99# UPI */}
      {activeTab === 'bhim-offline' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5" /> USSD *99# Offline UPI (No Internet Needed)
            </h3>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300">
              Dial <strong>*99#</strong> from your registered mobile SIM.
            </div>
            <p className="text-slate-300">
              Works on all basic keypad feature phones across GSM networks (BSNL, Airtel, Jio, Vi) without internet or mobile data.
            </p>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <h4 className="font-semibold text-white text-sm">USSD *99# Menu:</h4>
            <div>1. Send Money (via Mobile/UPI ID/Account)</div>
            <div>2. Request Money</div>
            <div>3. Check Bank Balance</div>
            <div>4. My Profile & UPI PIN reset</div>
          </div>
        </div>
      )}

      {/* 9. Emergency 112 India */}
      {activeTab === 'emergency-112' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
              <PhoneCall className="w-5 h-5" /> 112 India (Emergency Response Support System)
            </h3>
            <p className="text-slate-300">
              Single emergency number and app unifying Police (100), Fire (101), Ambulance (102/108), and Disaster Management.
            </p>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <h4 className="font-semibold text-white text-sm">SOS Button:</h4>
            <p>Triggers immediate GPS location broadcast to nearby police control room and sends automatic SMS alerts to emergency family contacts.</p>
          </div>
        </div>
      )}

      {/* 10. ABHA Digital Health Card */}
      {activeTab === 'abha-digital' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3">
            <h3 className="text-base font-semibold text-teal-400 flex items-center gap-2">
              <HeartPulse className="w-5 h-5" /> ABHA App (Ayushman Bharat Health Account)
            </h3>
            <p className="text-slate-300">
              14-digit digital health ID card to securely link lab reports, doctor prescriptions, and discharge summaries across all hospitals in India.
            </p>
          </div>
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-2 text-slate-300">
            <h4 className="font-semibold text-white text-sm">Key Features:</h4>
            <div>• Scan QR code at hospital registration desk for zero-line OPD card.</div>
            <div>• 100% user consent before sharing health records with any clinic or insurer.</div>
          </div>
        </div>
      )}
    </div>
  );
};
