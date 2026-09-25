import React, { useState } from 'react';
import { calculateSSYvsPPF } from '../../utils/ssyMath';
import {
  CreditCard,
  Sparkles,
  Home,
  Zap,
  Wheat,
  ShieldCheck,
  Building,
  Plane,
  HeartPulse,
  Award,
  CheckCircle2,
  Copy,
  AlertTriangle,
  FileText
} from 'lucide-react';

export type DigitalFinanceMobilityMode =
  | 'upi-limits'
  | 'ssy-ppf'
  | 'tds-rent'
  | 'ev-petrol'
  | 'fasal-bima'
  | 'rto-quiz'
  | 'society-maintenance'
  | 'tatkaal-passport'
  | 'senior-fd'
  | 'abha-card';

interface Props {
  initialMode?: DigitalFinanceMobilityMode;
  onResultChange?: (result: string) => void;
}

export const DigitalFinanceAndMobilitySuite: React.FC<Props> = ({
  initialMode = 'upi-limits'
}) => {
  const [activeTab, setActiveTab] = useState<DigitalFinanceMobilityMode>(initialMode);
  const [copied, setCopied] = useState(false);

  // 1. UPI Limits State
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [txnCategory, setTxnCategory] = useState<'p2p' | 'hospital' | 'ipo'>('p2p');
  const [isRecentSimChange, setIsRecentSimChange] = useState(false);

  // 2. SSY vs PPF State
  const [annualInvestment, setAnnualInvestment] = useState(150000);
  const [girlAge, setGirlAge] = useState(3);

  // 3. TDS on Rent 194-IB State
  const [monthlyRent, setMonthlyRent] = useState(65000);
  const [isLandlordPanAvailable, setIsLandlordPanAvailable] = useState(true);

  // 4. EV vs Petrol Scooter State
  const [dailyKm, setDailyKm] = useState(35);
  const [petrolPrice, setPetrolPrice] = useState(102);
  const [petrolMileage, setPetrolMileage] = useState(45);
  const [electricityUnitCost, setElectricityUnitCost] = useState(8);

  // 5. PM Fasal Bima State
  const [cropType, setCropType] = useState<'kharif' | 'rabi' | 'commercial'>('kharif');
  const [cropSumInsured, setCropSumInsured] = useState(150000);

  // 6. RTO Driving License Signs Quiz State
  const [activeQuizQuestion, setActiveQuizQuestion] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  // 7. Society Maintenance State
  const [flatAreaSqFt, setFlatAreaSqFt] = useState(1150);
  const [constructionRateSqFt, setConstructionRateSqFt] = useState(3000);

  // 8. Tatkaal Passport State
  const [passportTatkaalMode, setPassportTatkaalMode] = useState<'fresh' | 'reissue'>('fresh');

  // 9. Senior Citizen FD State
  const [seniorFdAmount, setSeniorFdAmount] = useState(500000);
  const [seniorAgeGroup, setSeniorAgeGroup] = useState<'senior' | 'superSenior'>('senior');

  // 10. ABHA Health ID State
  const [abhaCreationMethod, setAbhaCreationMethod] = useState<'aadhaar' | 'dl'>('aadhaar');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      {/* 1. UPI Daily Limits & Cool-off Tracker */}
      {activeTab === 'upi-limits' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> NPCI UPI Limits & Bank Cool-off
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Your Primary Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="sbi">State Bank of India (SBI) - ₹1 Lakh / 10 Txns</option>
                  <option value="hdfc">HDFC Bank - ₹1 Lakh (₹5 Lakhs P2M)</option>
                  <option value="icici">ICICI Bank - ₹10,000 P2P (GooglePay/PhonePe: ₹1L)</option>
                  <option value="axis">Axis Bank - ₹1 Lakh / 20 Txns</option>
                  <option value="pnb">Punjab National Bank (PNB) - ₹1 Lakh</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Transaction Category</label>
                <select
                  value={txnCategory}
                  onChange={(e) => setTxnCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="p2p">Normal Peer-to-Peer / Merchant (Max ₹1 Lakh/day)</option>
                  <option value="hospital">Hospital / Educational Institution / Tax (Max ₹5 Lakhs/day)</option>
                  <option value="ipo">IPO & Capital Markets Subscription (Max ₹5 Lakhs/day)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">Recent SIM Swap / Device Reset?</div>
                  <div className="text-[11px] text-slate-400">24-hour mandatory safety cool-off applies</div>
                </div>
                <input
                  type="checkbox"
                  checked={isRecentSimChange}
                  onChange={(e) => setIsRecentSimChange(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 rounded"
                />
              </div>
            </div>

            {/* UPI Limit Results */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/20 space-y-4 text-xs">
              <h4 className="font-semibold text-white text-sm">NPCI Permissible Daily Limit</h4>

              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="text-slate-400">Maximum Allowed Amount</div>
                <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">
                  {isRecentSimChange
                    ? '₹5,000 (24-Hour Cool-Off Limit)'
                    : txnCategory === 'hospital' || txnCategory === 'ipo'
                    ? '₹5,00,000 / day'
                    : '₹1,00,000 / day'}
                </div>
                <div className="text-slate-300 mt-1">
                  {isRecentSimChange
                    ? '⚠️ After SIM change or app re-install, RBI caps total UPI transfer to ₹5,000 for the first 24 hours to prevent fraud.'
                    : txnCategory === 'hospital'
                    ? '🏥 NPCI has elevated the limit for Verified Hospitals & Colleges to ₹5 Lakhs per single transaction.'
                    : 'Max 20 transactions permitted within any rolling 24-hour window.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Sukanya Samriddhi (SSY 8.2%) vs PPF (7.1%) */}
      {activeTab === 'ssy-ppf' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-pink-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Sukanya Samriddhi vs PPF Comparison
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Annual Investment: ₹{annualInvestment.toLocaleString('en-IN')} (Max ₹1.5L for 80C)
                </label>
                <input
                  type="range"
                  min="10000"
                  max="150000"
                  step="5000"
                  value={annualInvestment}
                  onChange={(e) => setAnnualInvestment(parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Girl Child Age: {girlAge} Years</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={girlAge}
                  onChange={(e) => setGirlAge(parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>
            </div>

            {/* SSY vs PPF Wealth Results (Shared Engine: src/utils/ssyMath.ts) */}
            {(() => {
              const { ssyCorpus, ppfCorpus, totalInvested } = calculateSSYvsPPF(annualInvestment, 8.2, 7.1);

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-pink-500/20 space-y-3 text-xs">
                  <h4 className="font-semibold text-white text-sm">Tax-Free Maturity Corpus (EEE Status)</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20">
                      <span className="text-pink-300 font-semibold block">🌸 SSY (8.2% Sovereign)</span>
                      <span className="text-xl font-bold text-white font-mono">₹{Math.round(ssyCorpus).toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-400 block mt-1">At age 21 (100% Tax Free)</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold block">🏛️ PPF (7.1% Sovereign)</span>
                      <span className="text-xl font-bold text-slate-300 font-mono">₹{Math.round(ppfCorpus).toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-500 block mt-1">15-Year Maturity</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-slate-300">
                    Total Invested: <span className="text-white font-bold font-mono">₹{totalInvested.toLocaleString('en-IN')}</span> | SSY Advantage: <span className="text-emerald-400 font-bold font-mono">+₹{Math.round(ssyCorpus - ppfCorpus).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 3. TDS on Rent (Section 194-IB) */}
      {activeTab === 'tds-rent' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-indigo-400 flex items-center gap-2">
                <Home className="w-5 h-5" /> TDS on Rent (Section 194-IB) & Form 26QC
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Monthly House Rent: ₹{monthlyRent.toLocaleString('en-IN')} (Threshold: ₹50,000/mo)
                </label>
                <input
                  type="range"
                  min="20000"
                  max="200000"
                  step="5000"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">Landlord PAN Available?</div>
                  <div className="text-[11px] text-slate-400">If PAN missing, TDS rate jumps to 20% under Section 206AA</div>
                </div>
                <input
                  type="checkbox"
                  checked={isLandlordPanAvailable}
                  onChange={(e) => setIsLandlordPanAvailable(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 rounded"
                />
              </div>
            </div>

            {/* TDS Liability Card */}
            {(() => {
              const isTdsApplicable = monthlyRent > 50000;
              const tdsRate = !isLandlordPanAvailable ? 20 : 5;
              const annualRent = monthlyRent * 12;
              const annualTds = isTdsApplicable ? Math.round(annualRent * (tdsRate / 100)) : 0;
              const netRentLastMonth = isTdsApplicable ? monthlyRent - annualTds : monthlyRent;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-indigo-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Tenant TDS Responsibility</h4>

                  {isTdsApplicable ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <div className="text-slate-400">Annual TDS to Deduct & Deposit (Form 26QC)</div>
                        <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
                          ₹{annualTds.toLocaleString('en-IN')} ({tdsRate}% TDS)
                        </div>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                        <span className="text-slate-400">Net Rent Payable in March (or Last Month):</span>
                        <span className="font-bold text-emerald-400 font-mono">₹{netRentLastMonth.toLocaleString('en-IN')}</span>
                      </div>

                      <p className="text-slate-400">
                        *Rule: Tenant does NOT need a TAN number. Simply pay online via Challan Form 26QC within 30 days and issue Form 16C to landlord.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300">
                      ✅ Rent is under ₹50,000/month. No TDS deduction is required by individual/HUF tenant.
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. EV Scooter vs Petrol Activa 5-Year TCO */}
      {activeTab === 'ev-petrol' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3 text-xs">
              <h3 className="text-base font-semibold text-teal-400 flex items-center gap-2">
                <Zap className="w-5 h-5" /> 5-Year EV vs Petrol Scooter Comparison
              </h3>

              <div>
                <label className="text-slate-400 block mb-1">Daily Commute Distance: {dailyKm} km/day</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={dailyKm}
                  onChange={(e) => setDailyKm(parseInt(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Petrol Price (₹/L)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={petrolPrice}
                    onChange={(e) => setPetrolPrice(parseFloat(e.target.value) || 100)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Petrol Mileage (kmpl)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={petrolMileage}
                    onChange={(e) => setPetrolMileage(parseFloat(e.target.value) || 45)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* EV Savings 5-Year Results */}
            {(() => {
              const annualKm = dailyKm * 300; // 300 active riding days
              const fiveYearKm = annualKm * 5;

              const petrolFuelCost = (fiveYearKm / petrolMileage) * petrolPrice;
              const petrolService = 5 * 4000; // 4 services/yr @ ₹1000
              const totalPetrol5Yr = 95000 + petrolFuelCost + petrolService; // ₹95k purchase price

              const evElectricityCost = (fiveYearKm / 30) * electricityUnitCost; // ~30 km per unit (kWh)
              const evService = 5 * 1000;
              const totalEv5Yr = 130000 + evElectricityCost + evService; // ₹1.3L purchase price

              const fiveYearSavings = totalPetrol5Yr - totalEv5Yr;
              const breakEvenMonths = Math.round((35000 / ((petrolFuelCost - evElectricityCost) / 60)));

              return (
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-teal-500/20 space-y-3 text-xs">
                  <h4 className="font-semibold text-white text-sm">5-Year Total Cost of Ownership</h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">⛽ Petrol Scooter 5-Yr</span>
                      <span className="text-lg font-bold text-rose-400 font-mono">₹{Math.round(totalPetrol5Yr).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                      <span className="text-teal-300 font-semibold block">⚡ EV Scooter 5-Yr</span>
                      <span className="text-lg font-bold text-teal-400 font-mono">₹{Math.round(totalEv5Yr).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Net 5-Year Pocket Savings:</span>
                      <span className="font-bold text-emerald-400 font-mono">₹{Math.round(fiveYearSavings).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">EV Extra Cost Break-Even Period:</span>
                      <span className="font-bold text-white font-mono">~{breakEvenMonths} Months</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 5. PM Fasal Bima Yojana (PMFBY) Crop Insurance */}
      {activeTab === 'fasal-bima' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                <Wheat className="w-5 h-5" /> PM Fasal Bima Yojana (PMFBY) Premium
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Season / Crop Category</label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="kharif">Kharif Crops (Paddy, Maize, Cotton) - Farmer Share: 2.0%</option>
                  <option value="rabi">Rabi Crops (Wheat, Mustard, Gram) - Farmer Share: 1.5%</option>
                  <option value="commercial">Commercial / Horticultural Crops (Sugarcane, Fruits) - 5.0%</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Total Insured Crop Sum (Sum Insured): ₹{cropSumInsured.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="25000"
                  max="500000"
                  step="5000"
                  value={cropSumInsured}
                  onChange={(e) => setCropSumInsured(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* PMFBY Results */}
            {(() => {
              const rate = cropType === 'kharif' ? 0.02 : cropType === 'rabi' ? 0.015 : 0.05;
              const farmerPremium = Math.round(cropSumInsured * rate);
              const totalActuarialRate = 0.12; // average 12%
              const govtSubsidy = Math.round(cropSumInsured * (totalActuarialRate - rate));

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-amber-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Farmer Payable Bima Premium</h4>

                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <div className="text-slate-400">Total Premium Payable by Farmer ({rate * 100}%)</div>
                    <div className="text-3xl font-bold text-amber-400 font-mono mt-1">
                      ₹{farmerPremium.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Govt (Central + State) Subsidy Paid:</span>
                    <span className="font-bold text-emerald-400 font-mono">₹{govtSubsidy.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 6. RTO Driving License Simulator */}
      {activeTab === 'rto-quiz' && (
        <div className="space-y-6">
          <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80 space-y-4">
            <h3 className="text-base font-semibold text-purple-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Sarathi Parivahan Learner's License Computer Test Quiz
            </h3>

            {(() => {
              const questions = [
                {
                  q: 'What does a circular sign with a red border and an inverted triangle mean?',
                  options: ['Stop', 'Give Way (Raasta Dijiye)', 'No Entry', 'Hospital Ahead'],
                  correct: 1,
                  explanation: 'An inverted triangle is the universal international and Indian sign for "GIVE WAY".'
                },
                {
                  q: 'While overtaking a vehicle on an Indian road, from which side must you overtake?',
                  options: ['Always from the Left', 'Always from the Right', 'Any side based on lane', 'From Left with horn'],
                  correct: 1,
                  explanation: 'Under Motor Vehicles Regulations, overtaking must strictly be done from the RIGHT side.'
                },
                {
                  q: 'What is the valid legal blood alcohol concentration (BAC) limit while driving in India?',
                  options: ['30 mg per 100 ml blood', '50 mg per 100 ml blood', '100 mg per 100 ml blood', 'Zero tolerance'],
                  correct: 0,
                  explanation: 'Section 185 of MVA penalizes BAC exceeding 30 mg per 100 ml of blood.'
                }
              ];
              const q = questions[activeQuizQuestion];

              return (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-slate-400">Question {activeQuizQuestion + 1} of {questions.length}</div>
                    <div className="text-sm font-semibold text-white">{q.q}</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedQuizAnswer(idx)}
                          className={`p-3 rounded-xl border text-left font-medium transition-all ${
                            selectedQuizAnswer === idx
                              ? idx === q.correct
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                : 'bg-rose-500/20 border-rose-500 text-rose-300'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {selectedQuizAnswer !== null && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                        {selectedQuizAnswer === q.correct ? '✅ Correct! ' : '❌ Incorrect. '}
                        {q.explanation}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      disabled={activeQuizQuestion === 0}
                      onClick={() => { setActiveQuizQuestion(activeQuizQuestion - 1); setSelectedQuizAnswer(null); }}
                      className="px-4 py-2 bg-slate-800 rounded-xl text-slate-300 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      disabled={activeQuizQuestion === questions.length - 1}
                      onClick={() => { setActiveQuizQuestion(activeQuizQuestion + 1); setSelectedQuizAnswer(null); }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-semibold disabled:opacity-40"
                    >
                      Next Question
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 7. Cooperative Housing Society Maintenance Sizing */}
      {activeTab === 'society-maintenance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-blue-400 flex items-center gap-2">
                <Building className="w-5 h-5" /> CHS Society Maintenance & Sinking Fund Sizing
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Flat Carpet Area: {flatAreaSqFt} Sq Feet
                </label>
                <input
                  type="range"
                  min="400"
                  max="3500"
                  step="50"
                  value={flatAreaSqFt}
                  onChange={(e) => setFlatAreaSqFt(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Base Construction Cost (₹/sq ft): ₹{constructionRateSqFt}
                </label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  step="250"
                  value={constructionRateSqFt}
                  onChange={(e) => setConstructionRateSqFt(parseInt(e.target.value) || 2500)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            {/* Society Maintenance Results */}
            {(() => {
              const flatCost = flatAreaSqFt * constructionRateSqFt;
              const sinkingFundMonthly = Math.round((flatCost * 0.0025) / 12); // 0.25% per annum
              const repairFundMonthly = Math.round((flatCost * 0.0075) / 12); // 0.75% per annum
              const commonServicesMonthly = 1800; // Security, lift, garden
              const totalMonthlyMaintenance = sinkingFundMonthly + repairFundMonthly + commonServicesMonthly;

              return (
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-blue-500/20 space-y-3 text-xs">
                  <h4 className="font-semibold text-white text-sm">State Cooperative Bye-Laws Breakdown</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-300">Sinking Fund (0.25% / yr statutory):</span>
                      <span className="font-mono font-bold text-white">₹{sinkingFundMonthly} / mo</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-300">Repair & Painting Fund (0.75% / yr):</span>
                      <span className="font-mono font-bold text-white">₹{repairFundMonthly} / mo</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-300">Common Lift, Security & Water:</span>
                      <span className="font-mono font-bold text-white">₹{commonServicesMonthly} / mo</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 flex justify-between items-center">
                    <span className="text-slate-300 font-semibold">Total Fair Monthly Maintenance:</span>
                    <span className="text-lg font-bold text-blue-400 font-mono">₹{totalMonthlyMaintenance} / month</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 8. Tatkaal Passport Document Checklist */}
      {activeTab === 'tatkaal-passport' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
                <Plane className="w-5 h-5" /> Tatkaal Passport Document Checklist (3-7 Days)
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Application Type</label>
                <select
                  value={passportTatkaalMode}
                  onChange={(e) => setPassportTatkaalMode(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="fresh">Fresh Tatkaal Passport (₹3,500 Fee)</option>
                  <option value="reissue">Re-issue / Renewal Tatkaal (₹3,500 Fee)</option>
                </select>
              </div>

              <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-xs text-cyan-300 space-y-1">
                <div>• Normal Fee: ₹1,500 | Tatkaal Additional: ₹2,000</div>
                <div>• Dispatch Timeline: Within 1-3 working days without waiting for police verification.</div>
              </div>
            </div>

            {/* 3 Mandatory Documents Checklist */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-semibold text-white text-sm">Any 3 Mandatory Official Proofs Required</h4>

              <div className="space-y-2">
                {[
                  '1. Aadhaar Card / e-Aadhaar with 12-digit number',
                  '2. PAN Card issued by Income Tax Department',
                  '3. Voter ID (EPIC) / Electoral Photo Identity Card',
                  '4. Driving License / Service Photo ID Card',
                  '5. Scheduled Bank Passbook with applicant photo'
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-slate-300">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Senior Citizen FD 0.50% & Form 15H Saver */}
      {activeTab === 'senior-fd' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5" /> Senior Citizen FD & Form 15H TDS Saver
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Fixed Deposit Principal: ₹{seniorFdAmount.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="50000"
                  max="2500000"
                  step="25000"
                  value={seniorFdAmount}
                  onChange={(e) => setSeniorFdAmount(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Age Category</label>
                <select
                  value={seniorAgeGroup}
                  onChange={(e) => setSeniorAgeGroup(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="senior">Senior Citizen (Age 60 to 79) - +0.50% Extra Rate</option>
                  <option value="superSenior">Super Senior Citizen (Age 80+) - +0.75% Extra Rate</option>
                </select>
              </div>
            </div>

            {/* Senior FD Results */}
            {(() => {
              const baseRate = 7.0;
              const seniorRate = seniorAgeGroup === 'senior' ? 7.5 : 7.75;
              const annualInterest = Math.round(seniorFdAmount * (seniorRate / 100));
              const isForm15HNeeded = annualInterest > 50000;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-amber-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Interest Payout & Section 80TTB</h4>

                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <div className="text-slate-400">Annual Interest Payout ({seniorRate}% rate)</div>
                    <div className="text-3xl font-bold text-amber-400 font-mono mt-1">
                      ₹{annualInterest.toLocaleString('en-IN')} / year
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="font-bold text-white mb-1">Section 80TTB Tax Exemption:</div>
                    <p className="text-slate-300">
                      Senior citizens enjoy **₹50,000 tax-free interest** from bank FDs/savings.
                      {isForm15HNeeded
                        ? ' ⚠️ Since interest exceeds ₹50,000, submit Form 15H at bank branch in April to stop 10% TDS deduction if taxable income is nil.'
                        : ' ✅ Interest is within ₹50,000 limit — bank will deduct zero TDS.'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 10. ABHA 14-Digit Digital Health Card Guide */}
      {activeTab === 'abha-card' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                <HeartPulse className="w-5 h-5" /> Ayushman Bharat Digital Health Account (ABHA)
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Creation Method</label>
                <select
                  value={abhaCreationMethod}
                  onChange={(e) => setAbhaCreationMethod(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="aadhaar">Via Aadhaar OTP (Instant 14-Digit ABHA Card)</option>
                  <option value="dl">Via Driving License / Mobile Number</option>
                </select>
              </div>

              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300 space-y-1">
                <div>• Official Portal: healthid.abdm.gov.in (NHA)</div>
                <div>• Zero physical paperwork: 14-digit ABHA ID links all lab records, prescriptions, and scans across India.</div>
              </div>
            </div>

            {/* ABHA Benefits Card */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-semibold text-white text-sm">Key Citizen Health Benefits</h4>

              <div className="space-y-2">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="font-bold text-rose-400">1. Instant OPD Hospital Registration</div>
                  <p className="text-slate-300">Scan QR code at AIIMS or government hospitals via ABHA app for instant OPD card without standing in line.</p>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="font-bold text-rose-400">2. Seamless Doctor Sharing</div>
                  <p className="text-slate-300">Share your digital health history with any specialist doctor with 100% consent control.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
