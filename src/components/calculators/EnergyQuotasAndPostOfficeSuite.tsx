import React, { useState } from 'react';
import {
  Flame,
  Scale,
  CreditCard,
  Sun,
  Heart,
  Store,
  Mail,
  Luggage,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export type EnergyQuotasPostOfficeMode =
  | 'lpg-price'
  | 'ews-checker'
  | 'fastag-blacklist'
  | 'kusum-solar'
  | 'blood-pressure'
  | 'gumasta-license'
  | 'post-office-calc'
  | 'train-luggage'
  | 'imei-validator'
  | 'epf-higher-pension';

interface Props {
  initialMode?: EnergyQuotasPostOfficeMode;
  onResultChange?: (result: string) => void;
}

export const EnergyQuotasAndPostOfficeSuite: React.FC<Props> = ({
  initialMode = 'lpg-price'
}) => {
  const [activeTab, setActiveTab] = useState<EnergyQuotasPostOfficeMode>(initialMode);

  // 1. LPG Gas State
  const [selectedCity, setSelectedCity] = useState('delhi');
  const [isUjjwalaBeneficiary, setIsUjjwalaBeneficiary] = useState(true);

  // 2. EWS & OBC-NCL State
  const [familyAnnualIncome, setFamilyAnnualIncome] = useState(550000);
  const [agriLandAcres, setAgriLandAcres] = useState(2);
  const [flatAreaSqFt, setFlatAreaSqFt] = useState(850);

  // 3. FASTag Blacklist State
  const [fastagBalance, setFastagBalance] = useState(80);
  const [isKycDone, setIsKycDone] = useState(false);

  // 4. PM KUSUM Solar Pump State
  const [pumpHp, setPumpHp] = useState<3 | 5 | 7.5>(5);

  // 5. Blood Pressure State
  const [systolicBp, setSystolicBp] = useState(132);
  const [diastolicBp, setDiastolicBp] = useState(86);

  // 6. Gumasta License State
  const [employeeCount, setEmployeeCount] = useState(4);

  // 7. Post Office Schemes State
  const [poDepositAmount, setPoDepositAmount] = useState(200000);
  const [poScheme, setPoScheme] = useState<'pomis' | 'nsc' | 'kvp' | 'scss'>('pomis');

  // 8. Train Luggage State
  const [trainTravelClass, setTrainTravelClass] = useState<'SL' | '3A' | '2A' | '1A'>('3A');
  const [luggageWeightKg, setLuggageWeightKg] = useState(55);

  // 9. IMEI Luhn Validator State
  const [imeiInput, setImeiInput] = useState('863456041234567');

  // 10. EPF Higher Pension State
  const [lastBasicSalary, setLastBasicSalary] = useState(75000);
  const [pensionServiceYears, setPensionServiceYears] = useState(28);

  return (
    <div className="w-full">
      {/* 1. LPG 14.2kg Price & DBTL Subsidy */}
      {activeTab === 'lpg-price' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-orange-400 flex items-center gap-2">
                <Flame className="w-5 h-5" /> LPG 14.2kg Domestic Cylinder Price & Subsidy
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Select City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="delhi">Delhi (₹803)</option>
                  <option value="mumbai">Mumbai (₹802.50)</option>
                  <option value="kolkata">Kolkata (₹829)</option>
                  <option value="chennai">Chennai (₹818.50)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">PM Ujjwala Beneficiary?</div>
                  <div className="text-[11px] text-slate-400">₹300 direct subsidy credited into bank account</div>
                </div>
                <input
                  type="checkbox"
                  checked={isUjjwalaBeneficiary}
                  onChange={(e) => setIsUjjwalaBeneficiary(e.target.checked)}
                  className="w-5 h-5 accent-orange-500 rounded"
                />
              </div>
            </div>

            {/* LPG Bill Output */}
            {(() => {
              const cityRates: Record<string, number> = {
                delhi: 803,
                mumbai: 802.5,
                kolkata: 829,
                chennai: 818.5
              };
              const basePrice = cityRates[selectedCity] || 803;
              const subsidy = isUjjwalaBeneficiary ? 300 : 0;
              const effectiveCost = basePrice - subsidy;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-orange-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Cylinder Payout Summary</h4>

                  <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                    <div className="text-slate-400">Effective Cylinder Cost After Subsidy</div>
                    <div className="text-3xl font-bold text-orange-400 font-mono mt-1">
                      ₹{effectiveCost.toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span>Delivery Upfront Price:</span>
                      <span className="font-bold text-white font-mono">₹{basePrice.toFixed(2)}</span>
                    </div>
                    {isUjjwalaBeneficiary && (
                      <div className="flex justify-between text-emerald-400">
                        <span>DBTL Bank Cash Subsidy:</span>
                        <span className="font-bold font-mono">-₹300.00</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 2. EWS & OBC-NCL Eligibility */}
      {activeTab === 'ews-checker' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3 text-xs">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                <Scale className="w-5 h-5" /> Central Government EWS 10% Quota Criteria
              </h3>

              <div>
                <label className="text-slate-400 block mb-1">
                  Family Gross Annual Income: ₹{(familyAnnualIncome / 100000).toFixed(1)} Lakhs (Limit: ₹8 Lakhs)
                </label>
                <input
                  type="range"
                  min="100000"
                  max="1200000"
                  step="25000"
                  value={familyAnnualIncome}
                  onChange={(e) => setFamilyAnnualIncome(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Agricultural Land: {agriLandAcres} Acres (Limit: &lt; 5 Acres)</label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={agriLandAcres}
                  onChange={(e) => setAgriLandAcres(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Residential Flat: {flatAreaSqFt} Sq Ft (Limit: &lt; 1000 Sq Ft)</label>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="50"
                  value={flatAreaSqFt}
                  onChange={(e) => setFlatAreaSqFt(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* EWS Status Result */}
            {(() => {
              const isIncomeEligible = familyAnnualIncome < 800000;
              const isLandEligible = agriLandAcres < 5;
              const isFlatEligible = flatAreaSqFt < 1000;
              const isOverallEligible = isIncomeEligible && isLandEligible && isFlatEligible;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Eligibility Assessment</h4>

                  <div className={`p-4 rounded-xl border ${isOverallEligible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                    <div className="font-bold text-sm">
                      {isOverallEligible ? '✅ 100% Eligible for Central EWS 10% Certificate' : '❌ Disqualified under Asset/Income Ceiling'}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex items-center gap-2">
                      {isIncomeEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      <span>Family Gross Annual Income &lt; ₹8 Lakhs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLandEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      <span>Agricultural Land &lt; 5 Acres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFlatEligible ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                      <span>Residential Flat &lt; 1,000 Sq Ft</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 3. FASTag Blacklist Reason & Toll Penalty */}
      {activeTab === 'fastag-blacklist' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
                <CreditCard className="w-5 h-5" /> FASTag Blacklist Diagnostics & Toll Exemption
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  FASTag Wallet Balance: ₹{fastagBalance} (Threshold: ₹150 minimum)
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  value={fastagBalance}
                  onChange={(e) => setFastagBalance(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">FASTag KYC Completed?</div>
                  <div className="text-[11px] text-slate-400">NHAI 'One Vehicle One FASTag' compliance</div>
                </div>
                <input
                  type="checkbox"
                  checked={isKycDone}
                  onChange={(e) => setIsKycDone(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 rounded"
                />
              </div>
            </div>

            {/* Blacklist Status */}
            {(() => {
              const isBlacklisted = fastagBalance < 150 || !isKycDone;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-cyan-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Toll Plaza Status</h4>

                  <div className={`p-4 rounded-xl border ${isBlacklisted ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
                    <div className="font-bold text-sm">
                      {isBlacklisted ? '🚨 FASTag is at Risk of Being BLACKLISTED' : '✅ Active & Green: Seamless Toll Passing'}
                    </div>
                  </div>

                  {isBlacklisted && (
                    <p className="text-slate-300 leading-relaxed">
                      If your FASTag is blacklisted at the toll plaza, you will be forced to pay <strong>Double Cash Toll</strong>. To fix instantly: Recharge via UPI handle <code className="bg-slate-900 px-1 py-0.5 rounded text-white">netc.yourvehiclenumber@bankupi</code>.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. PM KUSUM Solar Pump 60% Subsidy */}
      {activeTab === 'kusum-solar' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                <Sun className="w-5 h-5" /> PM KUSUM Solar Agri-Pump 60% Subsidy
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Pump Capacity (HP)</label>
                <div className="grid grid-cols-3 gap-2">
                  {([3, 5, 7.5] as const).map((hp) => (
                    <button
                      key={hp}
                      onClick={() => setPumpHp(hp)}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${pumpHp === hp ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      {hp} HP Pump
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* KUSUM Subsidy Breakdown */}
            {(() => {
              const baseCosts = { 3: 165000, 5: 240000, 7.5: 350000 };
              const totalCost = baseCosts[pumpHp];
              const centralSubsidy = Math.round(totalCost * 0.30);
              const stateSubsidy = Math.round(totalCost * 0.30);
              const farmerShare = Math.round(totalCost * 0.40); // 40% farmer or 10% farmer + 30% bank loan

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-amber-500/20 space-y-3 text-xs">
                  <h4 className="font-semibold text-white text-sm">60% Government Subsidy Breakdown</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Total Benchmark System Cost:</span>
                      <span className="font-mono font-bold text-white">₹{totalCost.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-emerald-400">Central Govt Subsidy (30%):</span>
                      <span className="font-mono font-bold text-emerald-400">-₹{centralSubsidy.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-emerald-400">State Govt Subsidy (30%):</span>
                      <span className="font-mono font-bold text-emerald-400">-₹{stateSubsidy.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex justify-between items-center">
                    <span className="text-white font-semibold">Farmer Final Contribution (40%):</span>
                    <span className="text-lg font-bold text-amber-400 font-mono">₹{farmerShare.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 5. Indian Blood Pressure & DASH Diet */}
      {activeTab === 'blood-pressure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                <Heart className="w-5 h-5" /> Indian Blood Pressure & DASH Diet Analyzer
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Systolic (Upper mmHg)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(parseInt(e.target.value) || 120)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Diastolic (Lower mmHg)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(parseInt(e.target.value) || 80)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* BP Stage Output */}
            {(() => {
              let category = 'Normal';
              let color = 'text-emerald-400';
              if (systolicBp >= 140 || diastolicBp >= 90) {
                category = 'Stage 2 Hypertension';
                color = 'text-rose-400';
              } else if (systolicBp >= 130 || diastolicBp >= 80) {
                category = 'Stage 1 Hypertension';
                color = 'text-amber-400';
              } else if (systolicBp >= 120 && diastolicBp < 80) {
                category = 'Elevated Blood Pressure';
                color = 'text-yellow-400';
              }

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-rose-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Clinical Category & Indian Diet Advice</h4>

                  <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <div className="text-slate-400">Cardiology Society of India Classification</div>
                    <div className={`text-2xl font-bold font-mono mt-1 ${color}`}>{category}</div>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    💡 <strong>Indian DASH Diet Tips:</strong> Restrict salt intake to &lt; 5g/day. Limit papad, pickle (achar), and processed namkeen. Increase garlic (Lahsun), flaxseeds, and potassium-rich coconut water.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 6. Gumasta License & Trade Registration */}
      {activeTab === 'gumasta-license' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-blue-400 flex items-center gap-2">
                <Store className="w-5 h-5" /> Shop & Establishment (Gumasta License)
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Number of Employees: {employeeCount}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(parseInt(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-xs text-blue-300">
                Mandatory legal requirement to open a Current Bank Account for any retail shop, clinic, or commercial firm.
              </div>
            </div>

            {/* Gumasta Rules */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-semibold text-white text-sm">Key Legal Mandates</h4>

              <div className="space-y-2 text-slate-300">
                <div>• Must apply within 30 days of opening shop via State Labour Department portal (e.g. Aaple Sarkar in MH).</div>
                <div>• 0 to 9 employees: Simple intimation / Zero government renewal fee in many states.</div>
                <div>• 10+ employees: Full registration with mandatory EPF/ESIC compliance.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Post Office Schemes (POMIS, NSC, KVP) */}
      {activeTab === 'post-office-calc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-indigo-400 flex items-center gap-2">
                <Mail className="w-5 h-5" /> India Post Savings Schemes (Sovereign Guaranteed)
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Scheme</label>
                <select
                  value={poScheme}
                  onChange={(e) => setPoScheme(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="pomis">POMIS (Post Office Monthly Income Scheme - 7.4% p.a.)</option>
                  <option value="nsc">NSC (National Savings Certificate - 7.7% p.a. Compounded)</option>
                  <option value="kvp">KVP (Kisan Vikas Patra - 7.5% p.a. Doubles in 115 Mos)</option>
                  <option value="scss">SCSS (Senior Citizen Savings Scheme - 8.2% p.a.)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Deposit Amount: ₹{poDepositAmount.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="10000"
                  max="1500000"
                  step="10000"
                  value={poDepositAmount}
                  onChange={(e) => setPoDepositAmount(parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>

            {/* Post Office Results */}
            {(() => {
              let resultLabel = 'Monthly Income Payout';
              let resultValue = `₹${Math.round((poDepositAmount * 0.074) / 12).toLocaleString('en-IN')} / month`;

              if (poScheme === 'nsc') {
                resultLabel = '5-Year Maturity Value (7.7% Compounded)';
                resultValue = `₹${Math.round(poDepositAmount * Math.pow(1 + 0.077, 5)).toLocaleString('en-IN')}`;
              } else if (poScheme === 'kvp') {
                resultLabel = 'Maturity Value (Doubles in 115 Months)';
                resultValue = `₹${(poDepositAmount * 2).toLocaleString('en-IN')}`;
              } else if (poScheme === 'scss') {
                resultLabel = 'Quarterly Payout (8.2% p.a.)';
                resultValue = `₹${Math.round((poDepositAmount * 0.082) / 4).toLocaleString('en-IN')} / quarter`;
              }

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-indigo-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Maturity & Returns</h4>

                  <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <div className="text-slate-400">{resultLabel}</div>
                    <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{resultValue}</div>
                  </div>

                  <p className="text-slate-300">
                    100% Sovereign Guarantee: Unlike commercial bank deposits which are insured up to ₹5 Lakhs by DICGC, Indian Post Office deposits have an unlimited sovereign guarantee from the Government of India.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 8. IRCTC Train Luggage Free Allowance */}
      {activeTab === 'train-luggage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
                <Luggage className="w-5 h-5" /> Indian Railways Luggage Free Allowance
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Travel Class</label>
                <select
                  value={trainTravelClass}
                  onChange={(e) => setTrainTravelClass(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="1A">AC 1st Class (70 kg Free Allowance)</option>
                  <option value="2A">AC 2-Tier (50 kg Free Allowance)</option>
                  <option value="3A">AC 3-Tier / Chair Car (40 kg Free Allowance)</option>
                  <option value="SL">Sleeper Class (40 kg Free Allowance)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Your Luggage Weight: {luggageWeightKg} kg
                </label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={luggageWeightKg}
                  onChange={(e) => setLuggageWeightKg(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            {/* Luggage Rules */}
            {(() => {
              const freeLimits = { '1A': 70, '2A': 50, '3A': 40, 'SL': 40 };
              const freeLimit = freeLimits[trainTravelClass];
              const excess = Math.max(0, luggageWeightKg - freeLimit);

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-cyan-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Allowance Status</h4>

                  <div className={`p-4 rounded-xl border ${excess > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'}`}>
                    <div className="font-bold text-sm">
                      {excess > 0 ? `⚠️ ${excess} kg Excess Luggage (Book at Parcel Office)` : '✅ Within Free Allowance Limit'}
                    </div>
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <div>• Free Allowance: <strong>{freeLimit} kg</strong></div>
                    <div>• Maximum Permissible in Coach: {freeLimit + 10} kg</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 9. IMEI Luhn Validator & CEIR Stolen Phone Guide */}
      {activeTab === 'imei-validator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-purple-400 flex items-center gap-2">
                <Smartphone className="w-5 h-5" /> 15-Digit IMEI Luhn Validator & Sanchar Saathi
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Enter 15-Digit IMEI Number</label>
                <input
                  type="text"
                  maxLength={15}
                  value={imeiInput}
                  onChange={(e) => setImeiInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            {/* IMEI Validation Result */}
            {(() => {
              // Luhn algorithm for IMEI check
              const isValidLength = imeiInput.length === 15;
              let isLuhnValid = false;
              if (isValidLength) {
                let sum = 0;
                for (let i = 0; i < 15; i++) {
                  let d = parseInt(imeiInput.charAt(i));
                  if (i % 2 === 1) {
                    d *= 2;
                    if (d > 9) d = (d % 10) + 1;
                  }
                  sum += d;
                }
                isLuhnValid = sum % 10 === 0;
              }

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-purple-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">IMEI Structure Check</h4>

                  <div className={`p-4 rounded-xl border ${isLuhnValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                    <div className="font-bold text-sm">
                      {isLuhnValid ? '✅ Structurally Valid 15-Digit IMEI' : '❌ Invalid IMEI Number'}
                    </div>
                  </div>

                  <p className="text-slate-300">
                    If your phone is lost or stolen, immediately block the IMEI at <strong>ceir.sancharsaathi.gov.in</strong> to prevent SIM misuse across all Indian telecom operators.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 10. EPF Higher Pension (Supreme Court 2022 Ruling) */}
      {activeTab === 'epf-higher-pension' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Higher Pension on Actual Salary (SC 2022)
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Last 60-Months Average Basic + DA: ₹{lastBasicSalary.toLocaleString('en-IN')}
                </label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  step="5000"
                  value={lastBasicSalary}
                  onChange={(e) => setLastBasicSalary(parseInt(e.target.value) || 15000)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Pensionable Service Years: {pensionServiceYears} Years
                </label>
                <input
                  type="range"
                  min="10"
                  max="35"
                  value={pensionServiceYears}
                  onChange={(e) => setPensionServiceYears(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Higher Pension Comparison */}
            {(() => {
              const capPension = Math.round((15000 * pensionServiceYears) / 70);
              const actualPension = Math.round((lastBasicSalary * pensionServiceYears) / 70);

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Monthly Pension Comparison</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Capped Pension (₹15,000 Wage Ceiling)</span>
                      <span className="text-lg font-bold text-slate-300 font-mono">₹{capPension.toLocaleString('en-IN')} / mo</span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                      <span className="text-emerald-300 font-semibold block">Higher Pension (Actual Salary)</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono">₹{actualPension.toLocaleString('en-IN')} / mo</span>
                    </div>
                  </div>

                  <p className="text-slate-300">
                    *Trade-off: Opting for higher pension transfers 8.33% with interest from your EPF lump-sum provident fund into the EPS pension pool.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
