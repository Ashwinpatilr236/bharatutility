import React, { useState, useMemo } from 'react';
import { AlertOctagon, Search, ExternalLink, ShieldAlert, Car, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

interface ChallanState {
  code: string;
  name: string;
  portalName: string;
  portalUrl: string;
  virtualCourtUrl: string;
}

const CHALLAN_STATE_PORTALS: ChallanState[] = [
  { code: 'ALL', name: 'All India (National Parivahan)', portalName: 'MoRTH Parivahan eChallan', portalUrl: 'https://echallan.parivahan.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'DL', name: 'Delhi NCR', portalName: 'Delhi Traffic Police Notice Portal', portalUrl: 'https://traffic.delhipolice.gov.in/notices', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'MH', name: 'Maharashtra (Mumbai / Pune)', portalName: 'MahaTraffic One eChallan', portalUrl: 'https://mahatrafficechallan.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'UP', name: 'Uttar Pradesh (Noida / Lucknow)', portalName: 'UP Traffic Police e-Challan', portalUrl: 'https://echallan.parivahan.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'KA', name: 'Karnataka (Bangalore BTP)', portalName: 'Bangalore Traffic Police (BTP)', portalUrl: 'https://btp.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'TS', name: 'Telangana (Hyderabad)', portalName: 'Telangana e-Challan Services', portalUrl: 'https://echallan.tspolice.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'TN', name: 'Tamil Nadu (Chennai)', portalName: 'TN Police e-Payment Portal', portalUrl: 'https://echallan.parivahan.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'GJ', name: 'Gujarat (Ahmedabad / Surat)', portalName: 'Gujarat Police e-Challan', portalUrl: 'https://echallan.gujarat.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'RJ', name: 'Rajasthan (Jaipur)', portalName: 'Rajasthan Traffic e-Challan', portalUrl: 'https://echallan.parivahan.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
  { code: 'WB', name: 'West Bengal (Kolkata)', portalName: 'Kolkata Traffic Police GRIPS', portalUrl: 'https://kolkatatrafficpolice.gov.in/', virtualCourtUrl: 'https://vcourts.gov.in/' },
];

interface MvaFine {
  violation: string;
  mvaSection: string;
  firstOffence: string;
  repeatOffence: string;
  notes: string;
}

const MVA_FINES_2026: MvaFine[] = [
  { violation: 'Over-speeding (LMV Light Motor Vehicle)', mvaSection: 'Section 183', firstOffence: '₹1,000 - ₹2,000', repeatOffence: 'License Impound', notes: 'Automated speed camera detection' },
  { violation: 'Driving without Helmet (Rider / Pillion)', mvaSection: 'Section 194D', firstOffence: '₹1,000', repeatOffence: '₹1,000 + 3 Mo. Suspension', notes: 'Mandatory BIS certified helmet' },
  { violation: 'Driving without Seatbelt', mvaSection: 'Section 194B', firstOffence: '₹1,000', repeatOffence: '₹1,000', notes: 'Applies to rear passengers too in several states' },
  { violation: 'Jumping Red Light / Dangerous Signal', mvaSection: 'Section 184', firstOffence: '₹1,000 - ₹5,000', repeatOffence: '₹10,000 + Jail up to 1 yr', notes: 'RLVD automatic camera capture' },
  { violation: 'Drunk Driving (Breath Alcohol > 30mg/100ml)', mvaSection: 'Section 185', firstOffence: '₹10,000 / 6 Mo Jail', repeatOffence: '₹15,000 / 2 Yr Jail', notes: 'Court challan mandatory (Cannot pay online)' },
  { violation: 'Driving without Valid Motor Insurance', mvaSection: 'Section 196', firstOffence: '₹2,000 / 3 Mo Jail', repeatOffence: '₹4,000', notes: 'Mandatory 3rd party liability insurance' },
  { violation: 'Using Handheld Mobile Phone while Driving', mvaSection: 'Section 184(c)', firstOffence: '₹1,000 - ₹5,000', repeatOffence: '₹10,000', notes: 'Includes holding phone at red traffic signals' },
  { violation: 'Driving without Valid PUCC (Pollution Certificate)', mvaSection: 'Section 190(2)', firstOffence: '₹10,000', repeatOffence: '₹10,000 + 3 Mo Suspension', notes: 'Valid for 6-12 months post registration' },
  { violation: 'Driving without Driving License (No DL)', mvaSection: 'Section 181', firstOffence: '₹5,000', repeatOffence: '₹5,000 + Vehicle Seizure', notes: 'DigiLocker / mParivahan copy valid' },
];

export const TrafficChallanPortalFinder: React.FC = () => {
  const [searchState, setSearchState] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');

  const filteredStates = useMemo(() => {
    if (!searchState) return CHALLAN_STATE_PORTALS;
    return CHALLAN_STATE_PORTALS.filter((s) =>
      s.name.toLowerCase().includes(searchState.toLowerCase())
    );
  }, [searchState]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-rose-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              State-wise Traffic e-Challan Portal & MVA Fine Directory
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Direct Official State Police Payment Portals, Virtual Court Directory & Motor Vehicles Act Penalties
            </p>
          </div>
        </div>
      </div>

      {/* Official Portals Directory */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            Official State Traffic Police Challan Portals
          </h3>
          <input
            type="text"
            placeholder="Filter State (e.g. Delhi, Maharashtra, UP, Karnataka)..."
            value={searchState}
            onChange={(e) => setSearchState(e.target.value)}
            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {filteredStates.map((state) => (
            <div
              key={state.code}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{state.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{state.portalName}</div>
              </div>

              <div className="flex gap-2">
                <a
                  href={state.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  Pay eChallan <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={state.virtualCourtUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  Virtual Court <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MVA Fine Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            2026 Motor Vehicles Act (MVA) Traffic Penalty Guide
          </h3>
          <span className="text-xs text-slate-500">Official Central Rules</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {MVA_FINES_2026.map((fine, idx) => (
            <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  {fine.violation}
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md font-mono">
                    {fine.mvaSection}
                  </span>
                </div>
                <div className="text-xs text-slate-500">{fine.notes}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400">1st: {fine.firstOffence}</div>
                  <div className="text-[11px] text-slate-400">Repeat: {fine.repeatOffence}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
