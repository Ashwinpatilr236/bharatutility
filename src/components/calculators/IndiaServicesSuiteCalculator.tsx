import React, { useState, useEffect } from 'react';
import { Landmark, Search, CheckCircle, AlertCircle, ExternalLink, ShieldCheck, Calendar, MapPin, Building, CreditCard, Hash, Map, Loader2 } from 'lucide-react';
import { searchByPincode, searchByPostOffice, PostOfficeRecord } from '../../services/postalService';

export type IndiaServicesMode =
  | 'ifsc-finder'
  | 'pin-finder'
  | 'rto-finder'
  | 'gstin-validator'
  | 'pan-validator'
  | 'bank-holidays'
  | 'gov-directory';

interface IndiaServicesSuiteCalculatorProps {
  initialMode?: IndiaServicesMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

// Curated data samples for offline search
const POPULAR_BANKS_IFSC = [
  { bank: 'State Bank of India', code: 'SBIN', sampleIfsc: 'SBIN0000300', city: 'Mumbai', branch: 'Main Branch' },
  { bank: 'HDFC Bank', code: 'HDFC', sampleIfsc: 'HDFC0000060', city: 'Delhi', branch: 'Connaught Place' },
  { bank: 'ICICI Bank', code: 'ICIC', sampleIfsc: 'ICIC0000007', city: 'Bengaluru', branch: 'MG Road' },
  { bank: 'Punjab National Bank', code: 'PUNB', sampleIfsc: 'PUNB0000100', city: 'Kolkata', branch: 'BBD Bagh' },
  { bank: 'Axis Bank', code: 'UTIB', sampleIfsc: 'UTIB0000001', city: 'Ahmedabad', branch: 'Main Branch' },
  { bank: 'Bank of Baroda', code: 'BARB', sampleIfsc: 'BARB0VJMUMB', city: 'Mumbai', branch: 'Fort' },
  { bank: 'Kotak Mahindra Bank', code: 'KKBK', sampleIfsc: 'KKBK0000958', city: 'Pune', branch: 'Deccan' },
  { bank: 'Canara Bank', code: 'CNRB', sampleIfsc: 'CNRB0000001', city: 'Bengaluru', branch: 'Town Hall' },
  { bank: 'Union Bank of India', code: 'UBIN', sampleIfsc: 'UBIN0530018', city: 'Hyderabad', branch: 'Koti' },
  { bank: 'IndusInd Bank', code: 'INDB', sampleIfsc: 'INDB0000001', city: 'Chennai', branch: 'Nungambakkam' },
];

const POPULAR_PIN_CODES = [
  { pin: '110001', area: 'Connaught Place', city: 'New Delhi', state: 'Delhi' },
  { pin: '400001', area: 'Fort / Nariman Point', city: 'Mumbai', state: 'Maharashtra' },
  { pin: '560001', area: 'MG Road / Residency', city: 'Bengaluru', state: 'Karnataka' },
  { pin: '600001', area: 'Parrys / George Town', city: 'Chennai', state: 'Tamil Nadu' },
  { pin: '700001', area: 'BBD Bagh', city: 'Kolkata', state: 'West Bengal' },
  { pin: '500001', area: 'Abids', city: 'Hyderabad', state: 'Telangana' },
  { pin: '380001', area: 'Bhadra', city: 'Ahmedabad', state: 'Gujarat' },
  { pin: '411001', area: 'Pune Station', city: 'Pune', state: 'Maharashtra' },
  { pin: '302001', area: 'Johari Bazaar', city: 'Jaipur', state: 'Rajasthan' },
  { pin: '226001', area: 'Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh' },
];

const POPULAR_RTO_CODES = [
  { code: 'MH01', location: 'Mumbai South', state: 'Maharashtra' },
  { code: 'MH02', location: 'Mumbai West (Andheri)', state: 'Maharashtra' },
  { code: 'MH12', location: 'Pune', state: 'Maharashtra' },
  { code: 'DL01', location: 'Delhi North (Mall Road)', state: 'Delhi' },
  { code: 'DL03', location: 'Delhi South (Sheikh Sarai)', state: 'Delhi' },
  { code: 'KA01', location: 'Bengaluru Central (Koramangala)', state: 'Karnataka' },
  { code: 'KA03', location: 'Bengaluru East (Indiranagar)', state: 'Karnataka' },
  { code: 'TN01', location: 'Chennai Central', state: 'Tamil Nadu' },
  { code: 'WB01', location: 'Kolkata Beltala', state: 'West Bengal' },
  { code: 'GJ01', location: 'Ahmedabad Subcity', state: 'Gujarat' },
  { code: 'TS07', location: 'Ranga Reddy (Hyderabad)', state: 'Telangana' },
  { code: 'UP32', location: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'HR26', location: 'Gurugram', state: 'Haryana' },
];

const BANK_HOLIDAYS_2026 = [
  { date: '26 Jan 2026', day: 'Monday', occasion: 'Republic Day', type: 'National Holiday' },
  { date: '04 Mar 2026', day: 'Wednesday', occasion: 'Holi', type: 'Festival' },
  { date: '30 Mar 2026', day: 'Monday', occasion: 'Ram Navami', type: 'Festival' },
  { date: '03 Apr 2026', day: 'Friday', occasion: 'Good Friday', type: 'Gazetted Holiday' },
  { date: '14 Apr 2026', day: 'Tuesday', occasion: 'Ambedkar Jayanti', type: 'Gazetted Holiday' },
  { date: '01 May 2026', day: 'Friday', occasion: 'May Day / Maharashtra Day', type: 'State Holiday' },
  { date: '15 Aug 2026', day: 'Saturday', occasion: 'Independence Day', type: 'National Holiday' },
  { date: '04 Sep 2026', day: 'Friday', occasion: 'Janmashtami', type: 'Festival' },
  { date: '14 Sep 2026', day: 'Monday', occasion: 'Ganesh Chaturthi', type: 'Festival' },
  { date: '02 Oct 2026', day: 'Friday', occasion: 'Gandhi Jayanti', type: 'National Holiday' },
  { date: '20 Oct 2026', day: 'Tuesday', occasion: 'Dussehra / Vijayadashami', type: 'Festival' },
  { date: '08 Nov 2026', day: 'Sunday', occasion: 'Diwali / Laxmi Pujan', type: 'Festival' },
  { date: '25 Dec 2026', day: 'Friday', occasion: 'Christmas Day', type: 'National Holiday' },
];

const GOV_PORTALS = [
  { name: 'Aadhaar (UIDAI)', category: 'Identity', desc: 'Download e-Aadhaar, check update status, locate enrollment centre', url: 'https://uidai.gov.in/', official: true },
  { name: 'e-Filing Income Tax', category: 'Taxation', desc: 'File ITR, link PAN-Aadhaar, check refund status', url: 'https://www.incometax.gov.in/', official: true },
  { name: 'GST Portal', category: 'Taxation', desc: 'GST registration, GSTR filing, track application status', url: 'https://www.gst.gov.in/', official: true },
  { name: 'Passport Seva', category: 'Passport', desc: 'Apply fresh passport, renew passport, track application', url: 'https://passportindia.gov.in/', official: true },
  { name: 'Parivahan Sewa (RTO)', category: 'Driving & Vehicle', desc: 'Driving license renewal, vehicle RC details, challan payment', url: 'https://parivahan.gov.in/', official: true },
  { name: 'Voters Service Portal', category: 'Electoral', desc: 'Voter ID registration, search name in electoral roll, correction', url: 'https://voters.eci.gov.in/', official: true },
  { name: 'EPFO Member Portal', category: 'PF & Pension', desc: 'Check EPF balance, UAN passbook, claim withdrawal online', url: 'https://unifiedportal-mem.epfindia.gov.in/', official: true },
  { name: 'DigiLocker', category: 'Document Storage', desc: 'Issued government digital documents, Marksheets, DL, RC', url: 'https://www.digilocker.gov.in/', official: true },
];

export const IndiaServicesSuiteCalculator: React.FC<IndiaServicesSuiteCalculatorProps> = ({
  initialMode = 'ifsc-finder',
  onResultChange,
}) => {
  const [mode, setMode] = useState<IndiaServicesMode>(initialMode);

  // Search queries
  const [ifscSearch, setIfscSearch] = useState('');
  const [pinSearch, setPinSearch] = useState('110001');
  const [rtoSearch, setRtoSearch] = useState('');
  const [postalSearchType, setPostalSearchType] = useState<'pin' | 'office'>('pin');

  // Live Supabase Postal Records State
  const [livePostalRecords, setLivePostalRecords] = useState<PostOfficeRecord[]>([]);
  const [postalLoading, setPostalLoading] = useState<boolean>(false);

  // GSTIN state
  const [gstin, setGstin] = useState('');
  // PAN state
  const [pan, setPan] = useState('');

  // Live postal search effect
  useEffect(() => {
    if (mode !== 'pin-finder' || !pinSearch.trim()) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      setPostalLoading(true);
      let results: PostOfficeRecord[] = [];
      const query = pinSearch.trim();

      if (postalSearchType === 'pin' || /^\d+$/.test(query)) {
        results = await searchByPincode(query);
      } else {
        results = await searchByPostOffice(query);
      }

      if (isMounted) {
        setLivePostalRecords(results);
        setPostalLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [mode, pinSearch, postalSearchType]);

  // IFSC Validation & Lookup
  const searchIfscResult = POPULAR_BANKS_IFSC.filter(
    b =>
      b.bank.toLowerCase().includes(ifscSearch.toLowerCase()) ||
      b.code.toLowerCase().includes(ifscSearch.toLowerCase()) ||
      b.sampleIfsc.toLowerCase().includes(ifscSearch.toLowerCase()) ||
      b.city.toLowerCase().includes(ifscSearch.toLowerCase())
  );

  // PIN Lookup
  const searchPinResult = POPULAR_PIN_CODES.filter(
    p =>
      p.pin.includes(pinSearch) ||
      p.area.toLowerCase().includes(pinSearch.toLowerCase()) ||
      p.city.toLowerCase().includes(pinSearch.toLowerCase()) ||
      p.state.toLowerCase().includes(pinSearch.toLowerCase())
  );

  // RTO Lookup
  const searchRtoResult = POPULAR_RTO_CODES.filter(
    r =>
      r.code.toLowerCase().includes(rtoSearch.toLowerCase()) ||
      r.location.toLowerCase().includes(rtoSearch.toLowerCase()) ||
      r.state.toLowerCase().includes(rtoSearch.toLowerCase())
  );

  // GSTIN Logic
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  const isGstinValid = gstinRegex.test(gstin.trim().toUpperCase());
  const cleanGstin = gstin.trim().toUpperCase();
  const gstinStateCode = isGstinValid ? cleanGstin.substring(0, 2) : '';
  const gstinPan = isGstinValid ? cleanGstin.substring(2, 12) : '';
  const gstinEntityDigit = isGstinValid ? cleanGstin.charAt(12) : '';

  // PAN Logic
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const cleanPan = pan.trim().toUpperCase();
  const isPanValid = panRegex.test(cleanPan);
  const panTypeChar = isPanValid ? cleanPan.charAt(3) : '';
  
  const getPanType = (char: string) => {
    switch (char) {
      case 'P': return 'Individual Person';
      case 'C': return 'Company';
      case 'H': return 'Hindu Undivided Family (HUF)';
      case 'F': return 'Partnership Firm';
      case 'A': return 'Association of Persons (AOP)';
      case 'T': return 'Trust';
      case 'B': return 'Body of Individuals (BOI)';
      case 'L': return 'Local Authority';
      case 'J': return 'Artificial Juridical Person';
      case 'G': return 'Government';
      default: return 'Entity';
    }
  };

  useEffect(() => {
    if (!onResultChange) return;

    if (mode === 'ifsc-finder') {
      onResultChange(`IFSC Finder: ${searchIfscResult.length} bank matches`, { search: ifscSearch });
    } else if (mode === 'gstin-validator') {
      onResultChange(
        isGstinValid ? `GSTIN ${cleanGstin} Validated (State Code ${gstinStateCode})` : 'GSTIN Validation Pending/Invalid',
        { gstin: cleanGstin, isValid: isGstinValid }
      );
    } else if (mode === 'pan-validator') {
      onResultChange(
        isPanValid ? `PAN ${cleanPan} Valid (${getPanType(panTypeChar)})` : 'PAN Validation Pending/Invalid',
        { pan: cleanPan, isValid: isPanValid }
      );
    } else if (mode === 'pin-finder') {
      onResultChange(`PIN Code Finder (${searchPinResult.length} matches)`, { search: pinSearch });
    } else if (mode === 'rto-finder') {
      onResultChange(`RTO Code Finder (${searchRtoResult.length} matches)`, { search: rtoSearch });
    } else if (mode === 'bank-holidays') {
      onResultChange('Indian Bank Holidays 2026 List', { count: BANK_HOLIDAYS_2026.length });
    } else if (mode === 'gov-directory') {
      onResultChange('Official Government Services Portal Directory', { portals: GOV_PORTALS.length });
    }
  }, [mode, ifscSearch, pinSearch, rtoSearch, gstin, pan, isGstinValid, isPanValid]);

  return (
    <div className="w-full space-y-6">
      {/* Mode 1: IFSC Code Finder */}
      {mode === 'ifsc-finder' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Bank Name (e.g. SBI, HDFC), City, or IFSC Code..."
              value={ifscSearch}
              onChange={e => setIfscSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchIfscResult.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-accent" />
                    {item.bank}
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20">
                    {item.sampleIfsc}
                  </span>
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex justify-between">
                  <span>Branch: {item.branch}</span>
                  <span>City: {item.city}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Note on Bank Branch Verification:
            </div>
            <p>
              Always cross-verify your IFSC code on your official bank chequebook or passbook before completing high-value RTGS, NEFT, or IMPS transactions.
            </p>
          </div>
        </div>
      )}

      {/* Mode 2: GSTIN Validator */}
      {mode === 'gstin-validator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Enter 15-Digit GSTIN Number
              </label>
              <input
                type="text"
                maxLength={15}
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={gstin}
                onChange={e => setGstin(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white uppercase focus:ring-2 focus:ring-accent"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Format: 2 digits (State) + 10 chars (PAN) + 1 digit (Entity) + Z + 1 Check digit
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Validation Breakdown</div>
            {gstin.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {isGstinValid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <span className={`font-bold text-sm ${isGstinValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isGstinValid ? 'Valid GSTIN Structure' : 'Invalid GSTIN Format'}
                  </span>
                </div>

                {isGstinValid && (
                  <div className="space-y-2 text-xs pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">State Code:</span>
                      <span className="font-bold text-neutral-900 dark:text-white font-mono">{gstinStateCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Associated PAN:</span>
                      <span className="font-bold text-neutral-900 dark:text-white font-mono">{gstinPan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Registration Number:</span>
                      <span className="font-bold text-neutral-900 dark:text-white font-mono">Entity #{gstinEntityDigit}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic">Enter a GSTIN to analyze structure.</div>
            )}
          </div>
        </div>
      )}

      {/* Mode 3: PAN Validator */}
      {mode === 'pan-validator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Enter 10-Character Permanent Account Number (PAN)
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. ABCDE1234F"
                value={pan}
                onChange={e => setPan(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white uppercase focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">PAN Verification Result</div>
            {pan.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {isPanValid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <span className={`font-bold text-sm ${isPanValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isPanValid ? 'Valid PAN Format' : 'Invalid PAN Structure'}
                  </span>
                </div>

                {isPanValid && (
                  <div className="space-y-2 text-xs pt-2 border-t border-neutral-200 dark:border-neutral-700">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Holder Type (4th char '{panTypeChar}'):</span>
                      <span className="font-bold text-neutral-900 dark:text-white">{getPanType(panTypeChar)}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic">Enter a PAN card number to verify formatting.</div>
            )}
          </div>
        </div>
      )}

      {/* Mode 4: PIN Code Finder */}
      {mode === 'pin-finder' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder={postalSearchType === 'pin' ? "Enter 6-digit PIN code (e.g. 110001, 400001, 390001)..." : "Enter Post Office Branch Name (e.g. Connaught Place, Baroda House)..."}
                value={pinSearch}
                onChange={e => setPinSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-accent"
              />
              {postalLoading && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-4 text-accent" />
              )}
            </div>

            <div className="flex rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1 shrink-0">
              <button
                onClick={() => setPostalSearchType('pin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  postalSearchType === 'pin'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                By PIN Code
              </button>
              <button
                onClick={() => setPostalSearchType('office')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  postalSearchType === 'office'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                By Branch Name
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center justify-between">
              <span>Matching Post Offices ({livePostalRecords.length > 0 ? livePostalRecords.length : searchPinResult.length})</span>
              <span className="text-[10px] text-neutral-400 font-normal">Database-backed</span>
            </div>

            {livePostalRecords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {livePostalRecords.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-bold text-sm text-neutral-900 dark:text-white">{p.name}</div>
                        <div className="text-xs text-neutral-500">{p.district}, {p.state} ({p.circle})</div>
                      </div>
                      <span className="font-mono text-sm font-black px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                        {p.pincode}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800/80 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-700 font-semibold text-neutral-700 dark:text-neutral-300">
                        {p.branchType}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-semibold ${p.deliveryStatus === 'Delivery' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                        {p.deliveryStatus}
                      </span>
                      <span className="text-neutral-400 ml-auto">{p.country}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchPinResult.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-sm text-neutral-900 dark:text-white">{p.area}</div>
                      <div className="text-xs text-neutral-500">{p.city}, {p.state}</div>
                    </div>
                    <span className="font-mono text-sm font-black px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      {p.pin}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 5: RTO Code Finder */}
      {mode === 'rto-finder' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by RTO Code (e.g. MH01, DL01, KA01) or City..."
              value={rtoSearch}
              onChange={e => setRtoSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {searchRtoResult.map((r, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-1">
                <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-block">
                  {r.code}
                </span>
                <div className="font-bold text-sm text-neutral-900 dark:text-white">{r.location}</div>
                <div className="text-xs text-neutral-500">{r.state}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 6: Bank Holidays */}
      {mode === 'bank-holidays' && (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Indian Bank Holidays Calendar 2026
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {BANK_HOLIDAYS_2026.map((h, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-white">{h.occasion}</div>
                  <div className="text-xs text-neutral-500">{h.day} • {h.type}</div>
                </div>
                <span className="font-mono text-xs font-bold px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                  {h.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode 7: Official Government Services Directory */}
      {mode === 'gov-directory' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-800 dark:text-indigo-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Direct Official Portal Links
            </div>
            <p>
              BharatUtility provides direct navigation to verified official government portals. BharatUtility is an independent platform and does not store or process government identification records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GOV_PORTALS.map((portal, idx) => (
              <a
                key={idx}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 hover:border-accent hover:shadow-md transition-all group block space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-accent transition-colors flex items-center gap-1.5">
                    {portal.name}
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-accent" />
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Official Govt Portal
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {portal.desc}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
