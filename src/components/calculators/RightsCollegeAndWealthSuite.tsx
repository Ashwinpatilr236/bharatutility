import React, { useState } from 'react';
import {
  Coins,
  FileCheck2,
  Utensils,
  GraduationCap,
  Plane,
  Disc,
  Scale,
  ShieldCheck,
  FileText,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type RightsCollegeWealthMode =
  | 'sgb-gold'
  | 'gift-deed'
  | 'restaurant-gst'
  | 'college-attendance'
  | 'lta-tax'
  | 'tyre-upsize'
  | 'mandi-msp'
  | 'nps-pension'
  | 'rti-appeal'
  | 'bsa-dosage';

interface Props {
  initialMode?: RightsCollegeWealthMode;
  onResultChange?: (result: string) => void;
}

export const RightsCollegeAndWealthSuite: React.FC<Props> = ({
  initialMode = 'sgb-gold'
}) => {
  const [activeTab, setActiveTab] = useState<RightsCollegeWealthMode>(initialMode);

  // 1. SGB Gold State
  const [sgbGrams, setSgbGrams] = useState(50);
  const [sgbIssuePrice, setSgbIssuePrice] = useState(6500);
  const [sgbExpectedMaturityGoldPrice, setSgbExpectedMaturityGoldPrice] = useState(12000);

  // 2. Gift Deed State
  const [giftPropertyValue, setGiftPropertyValue] = useState(5000000);
  const [giftRelation, setGiftRelation] = useState<'blood' | 'nonRelative'>('blood');
  const [giftState, setGiftState] = useState<'up' | 'maharashtra' | 'delhi' | 'karnataka'>('up');

  // 3. Restaurant GST State
  const [foodBillAmount, setFoodBillAmount] = useState(2500);
  const [restaurantType, setRestaurantType] = useState<'standalone' | 'fiveStar'>('standalone');
  const [hasServiceCharge, setHasServiceCharge] = useState(true);
  const [serviceChargeRate, setServiceChargeRate] = useState(10);

  // 4. College Attendance State
  const [totalClassesHeld, setTotalClassesHeld] = useState(60);
  const [classesAttended, setClassesAttended] = useState(42);
  const [targetAttendancePct, setTargetAttendancePct] = useState(75);

  // 5. LTA Tax Exemption State
  const [ltaTravelCost, setLtaTravelCost] = useState(60000);
  const [ltaTravelMode, setLtaTravelMode] = useState<'economyAir' | 'firstAcTrain' | 'taxiBus'>('economyAir');

  // 6. Tyre Upsize State
  const [stockWidth, setStockWidth] = useState(185);
  const [stockProfile, setStockProfile] = useState(65);
  const [stockRim, setStockRim] = useState(15);
  const [newWidth, setNewWidth] = useState(195);
  const [newProfile, setNewProfile] = useState(60);
  const [newRim, setNewRim] = useState(16);

  // 7. Mandi MSP State
  const [cropMsp, setCropMsp] = useState('wheat');
  const [cropQuantityQuintals, setCropQuantityQuintals] = useState(50);

  // 8. NPS Pension State
  const [npsMonthlyContribution, setNpsMonthlyContribution] = useState(5000);
  const [npsYears, setNpsYears] = useState(25);
  const [npsExpectedReturn, setNpsExpectedReturn] = useState(10);

  // 9. RTI Appeal State
  const [rtiDaysPassed, setRtiDaysPassed] = useState(35);
  const [isLifeLiberty, setIsLifeLiberty] = useState(false);

  // 10. BSA Dosage State
  const [patientHeightCm, setPatientHeightCm] = useState(168);
  const [patientWeightKg, setPatientWeightKg] = useState(65);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 text-white shadow-2xl">
      {/* Suite Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6 overflow-x-auto gap-2">
        <div className="flex items-center gap-2">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Coins className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Rights, College, Wealth & Citizen Protection Suite
            </h2>
            <p className="text-xs text-slate-400">
              SGB 2.5% Tax-Free, Family Gift Deed, Food GST & CCPA, 75% Attendance & NPS Pension
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5 p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 mb-8">
        {[
          { id: 'sgb-gold', label: '🥇 SGB Gold', icon: Coins },
          { id: 'gift-deed', label: '🏡 Gift Deed', icon: FileCheck2 },
          { id: 'restaurant-gst', label: '🍽️ Food GST', icon: Utensils },
          { id: 'college-attendance', label: '🎓 75% Bunk', icon: GraduationCap },
          { id: 'lta-tax', label: '✈️ LTA Tax', icon: Plane },
          { id: 'tyre-upsize', label: '🚗 Tyre Upsize', icon: Disc },
          { id: 'mandi-msp', label: '🌾 Mandi MSP', icon: Scale },
          { id: 'nps-pension', label: '🪙 NPS ₹50K', icon: ShieldCheck },
          { id: 'rti-appeal', label: '⚖️ RTI 30-Day', icon: FileText },
          { id: 'bsa-dosage', label: '🩺 Clinical BSA', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as RightsCollegeWealthMode)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/20 scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="truncate w-full text-center">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. RBI Sovereign Gold Bond (SGB) Calculator */}
      {activeTab === 'sgb-gold' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                <Coins className="w-5 h-5" /> RBI SGB 2.5% + 100% Tax-Free Gains
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Gold Quantity: {sgbGrams} Grams
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={sgbGrams}
                  onChange={(e) => setSgbGrams(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Issue Price (₹/g)</label>
                  <input
                    type="number"
                    value={sgbIssuePrice}
                    onChange={(e) => setSgbIssuePrice(parseInt(e.target.value) || 6000)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">8-Yr Gold Rate (₹/g)</label>
                  <input
                    type="number"
                    value={sgbExpectedMaturityGoldPrice}
                    onChange={(e) => setSgbExpectedMaturityGoldPrice(parseInt(e.target.value) || 12000)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SGB Profit Breakdown */}
            {(() => {
              const invested = sgbGrams * sgbIssuePrice;
              const annualInterest = Math.round(invested * 0.025);
              const total8YrInterest = annualInterest * 8;
              const maturityGoldValue = sgbGrams * sgbExpectedMaturityGoldPrice;
              const capitalGains = maturityGoldValue - invested;
              const totalReturn = maturityGoldValue + total8YrInterest;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-amber-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">8-Year Sovereign Gold Returns</h4>

                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <div className="text-slate-400">Total 8-Year Maturity Value (Capital + Interest)</div>
                    <div className="text-3xl font-bold text-amber-400 font-mono mt-1">
                      ₹{Math.round(totalReturn).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between">
                      <span>Total 2.5% Simple Interest Paid:</span>
                      <span className="font-bold text-white font-mono">₹{total8YrInterest.toLocaleString('en-IN')} (₹{annualInterest}/yr)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Capital Gains (100% Tax-Free under 47(viic)):</span>
                      <span className="font-bold text-emerald-400 font-mono">₹{capitalGains.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 2. Family Gift Deed vs Will (Vasiyat) */}
      {activeTab === 'gift-deed' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5" /> Family Gift Deed vs Will Stamp Duty
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Property Market Value: ₹{(giftPropertyValue / 100000).toFixed(1)} Lakhs
                </label>
                <input
                  type="range"
                  min="500000"
                  max="20000000"
                  step="250000"
                  value={giftPropertyValue}
                  onChange={(e) => setGiftPropertyValue(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Recipient Relation</label>
                  <select
                    value={giftRelation}
                    onChange={(e) => setGiftRelation(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="blood">Blood Relative (Parents, Spouse, Child, Sibling)</option>
                    <option value="nonRelative">Non-Relative / Distant Relative</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">State Jurisdiction</label>
                  <select
                    value={giftState}
                    onChange={(e) => setGiftState(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  >
                    <option value="up">Uttar Pradesh (₹5,000 Token Stamp)</option>
                    <option value="maharashtra">Maharashtra (₹200 Token Stamp)</option>
                    <option value="delhi">Delhi (4% - 6% Stamp)</option>
                    <option value="karnataka">Karnataka (₹1,000 - ₹5,000)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Gift Deed Tax & Stamp Results */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/20 space-y-4 text-xs">
              <h4 className="font-semibold text-white text-sm">Legal & Tax Treatment</h4>

              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 space-y-2">
                <div className="font-bold text-emerald-400 text-sm">
                  {giftRelation === 'blood' ? '✅ 100% Tax-Free under Section 56(2)(x)' : '⚠️ Full Property Value Taxed as Income'}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {giftRelation === 'blood'
                    ? 'Gifts received from specified relatives (Spouse, brother, sister, lineal ascendant/descendant) have ZERO Income Tax liability for the receiver.'
                    : 'Gifts of immovable property without consideration from non-relatives exceeding ₹50,000 are taxed as "Income from Other Sources" at your regular income tax slab rate.'}
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Estimated State Stamp Duty:</span>
                <span className="font-mono font-bold text-white">
                  {giftState === 'up' && giftRelation === 'blood'
                    ? '₹5,000 (Concessional Family Scheme)'
                    : giftState === 'maharashtra' && giftRelation === 'blood'
                    ? '₹200 (Article 34 CHS Concession)'
                    : `~₹${Math.round(giftPropertyValue * 0.05).toLocaleString('en-IN')} (Standard 5%)`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Restaurant Bill Food GST & Service Charge Legality */}
      {activeTab === 'restaurant-gst' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                <Utensils className="w-5 h-5" /> Restaurant Bill & CCPA Service Charge Rules
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Food Order Base Amount: ₹{foodBillAmount}
                </label>
                <input
                  type="number"
                  step="100"
                  value={foodBillAmount}
                  onChange={(e) => setFoodBillAmount(Math.max(100, parseInt(e.target.value) || 100))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Dining Venue Type</label>
                <select
                  value={restaurantType}
                  onChange={(e) => setRestaurantType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="standalone">Standalone Restaurant / Cafe (5% GST - No ITC)</option>
                  <option value="fiveStar">5-Star Hotel Dining (Room Tariff &gt; ₹7,500) - 18% GST</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">Service Charge Added on Bill?</div>
                  <div className="text-[11px] text-slate-400">CCPA Guidelines declare forced service charge illegal</div>
                </div>
                <input
                  type="checkbox"
                  checked={hasServiceCharge}
                  onChange={(e) => setHasServiceCharge(e.target.checked)}
                  className="w-5 h-5 accent-rose-500 rounded"
                />
              </div>
            </div>

            {/* Bill Output */}
            {(() => {
              const serviceChargeAmount = hasServiceCharge ? Math.round(foodBillAmount * (serviceChargeRate / 100)) : 0;
              const subtotal = foodBillAmount + serviceChargeAmount;
              const gstRate = restaurantType === 'standalone' ? 0.05 : 0.18;
              const gstAmount = Math.round(subtotal * gstRate);
              const totalBill = subtotal + gstAmount;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-rose-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Transparent Food Bill Breakdown</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-300">Food Items:</span>
                      <span className="font-mono font-bold text-white">₹{foodBillAmount}</span>
                    </div>
                    {hasServiceCharge && (
                      <div className="flex justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-rose-400">Service Charge (10% - Optional):</span>
                        <span className="font-mono font-bold text-rose-400">₹{serviceChargeAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-slate-300">GST ({gstRate * 100}%):</span>
                      <span className="font-mono font-bold text-white">₹{gstAmount}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 flex justify-between items-center">
                    <span className="text-white font-semibold">Total Payable Bill:</span>
                    <span className="text-xl font-bold text-rose-400 font-mono">₹{totalBill}</span>
                  </div>

                  <p className="text-slate-400 text-xs">
                    💡 <strong>CCPA Right:</strong> Under Consumer Protection Guidelines, service charge cannot be added by default. You can request the restaurant manager to waive off the ₹{serviceChargeAmount} service charge immediately.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. College 75% Attendance & Safe Bunk Planner */}
      {activeTab === 'college-attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-purple-400 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" /> University 75% Attendance & Bunk Planner
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Total Classes Held</label>
                  <input
                    type="number"
                    min="1"
                    value={totalClassesHeld}
                    onChange={(e) => setTotalClassesHeld(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Classes Attended</label>
                  <input
                    type="number"
                    min="0"
                    max={totalClassesHeld}
                    value={classesAttended}
                    onChange={(e) => setClassesAttended(Math.min(totalClassesHeld, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Required Target: {targetAttendancePct}% (UGC/AICTE/BCI/NMC Standard)
                </label>
                <input
                  type="range"
                  min="60"
                  max="85"
                  value={targetAttendancePct}
                  onChange={(e) => setTargetAttendancePct(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            {/* Attendance Calculation Results */}
            {(() => {
              const currentPct = (classesAttended / totalClassesHeld) * 100;
              const isEligible = currentPct >= targetAttendancePct;

              // If current >= target, how many can bunk?
              // (attended) / (total + x) >= target/100  =>  x <= (attended*100/target) - total
              const safeBunks = isEligible
                ? Math.floor((classesAttended * 100) / targetAttendancePct - totalClassesHeld)
                : 0;

              // If current < target, how many consecutive classes to attend?
              // (attended + y) / (total + y) >= target/100  =>  y >= (target*total - 100*attended) / (100 - target)
              const classesNeeded = !isEligible
                ? Math.ceil((targetAttendancePct * totalClassesHeld - 100 * classesAttended) / (100 - targetAttendancePct))
                : 0;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-purple-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Attendance Status & Strategy</h4>

                  <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <div className="text-slate-400">Current Attendance Percentage</div>
                    <div className="text-3xl font-bold text-purple-400 font-mono mt-1">
                      {currentPct.toFixed(1)}%
                    </div>
                  </div>

                  {isEligible ? (
                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300 space-y-1">
                      <div className="font-bold text-sm">🎉 You are in the Safe Zone!</div>
                      <div>You can safely skip (bunk) next <strong>{safeBunks} classes</strong> and still maintain &gt;={targetAttendancePct}% attendance.</div>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-300 space-y-1">
                      <div className="font-bold text-sm">⚠️ Shortage Warning (Detain Risk)</div>
                      <div>You must attend next <strong>{classesNeeded} classes consecutively</strong> without missing to reach {targetAttendancePct}%.</div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 5. LTA Tax Exemption Calculator */}
      {activeTab === 'lta-tax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
                <Plane className="w-5 h-5" /> Section 10(5) LTA Tax Exemption
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Total Travel Fare Incurred: ₹{ltaTravelCost.toLocaleString('en-IN')}
                </label>
                <input
                  type="number"
                  step="5000"
                  value={ltaTravelCost}
                  onChange={(e) => setLtaTravelCost(parseInt(e.target.value) || 10000)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Travel Mode</label>
                <select
                  value={ltaTravelMode}
                  onChange={(e) => setLtaTravelMode(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="economyAir">Domestic Airline (Economy Class Airfare)</option>
                  <option value="firstAcTrain">Indian Railways (AC 1st Class / 2-Tier Fare)</option>
                  <option value="taxiBus">Public Transport Deluxe Bus / Taxi</option>
                </select>
              </div>
            </div>

            {/* LTA Rules Card */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-cyan-500/20 space-y-3 text-xs">
              <h4 className="font-semibold text-white text-sm">Income Tax Rules for LTA</h4>

              <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20 space-y-2">
                <div className="font-bold text-cyan-300">Exemption Amount: ₹{ltaTravelCost.toLocaleString('en-IN')}</div>
                <p className="text-slate-300">
                  Under Section 10(5), LTA can be claimed for <strong>2 journeys in a block of 4 calendar years</strong> (Current active block: 2026-2029).
                </p>
              </div>

              <div className="space-y-1 text-slate-400">
                <div>• Only actual travel fare (Air/Train/Bus ticket) is tax-free.</div>
                <div>• Hotel accommodation, food, sightseeing are strictly NOT tax-exempt.</div>
                <div>• Available only under the Old Tax Regime.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Car Tyre Upsize & Speedometer Error */}
      {activeTab === 'tyre-upsize' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-3 text-xs">
              <h3 className="text-base font-semibold text-blue-400 flex items-center gap-2">
                <Disc className="w-5 h-5" /> Tyre Size Upsize & Speedometer Deviation
              </h3>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-300">Stock OEM Tyre (e.g. 185/65 R15)</div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={stockWidth} onChange={(e) => setStockWidth(parseInt(e.target.value))} className="bg-slate-950 p-2 rounded border border-slate-700 text-white" />
                  <input type="number" value={stockProfile} onChange={(e) => setStockProfile(parseInt(e.target.value))} className="bg-slate-950 p-2 rounded border border-slate-700 text-white" />
                  <input type="number" value={stockRim} onChange={(e) => setStockRim(parseInt(e.target.value))} className="bg-slate-950 p-2 rounded border border-slate-700 text-white" />
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-slate-300">New Upsized Tyre (e.g. 195/60 R16)</div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={newWidth} onChange={(e) => setNewWidth(parseInt(e.target.value))} className="bg-slate-950 p-2 rounded border border-slate-700 text-white" />
                  <input type="number" value={newProfile} onChange={(e) => setNewProfile(parseInt(e.target.value))} className="bg-slate-950 p-2 rounded border border-slate-700 text-white" />
                  <input type="number" value={newRim} onChange={(e) => setNewRim(parseInt(e.target.value))} className="bg-slate-950 p-2 rounded border border-slate-700 text-white" />
                </div>
              </div>
            </div>

            {/* Tyre Calculation Results */}
            {(() => {
              const stockDiaMm = stockRim * 25.4 + 2 * ((stockWidth * stockProfile) / 100);
              const newDiaMm = newRim * 25.4 + 2 * ((newWidth * newProfile) / 100);
              const diffPct = ((newDiaMm - stockDiaMm) / stockDiaMm) * 100;
              const isSafe = Math.abs(diffPct) <= 2.5;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-blue-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Diameter & Speedometer Impact</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Stock Diameter</span>
                      <span className="text-lg font-bold text-white font-mono">{stockDiaMm.toFixed(1)} mm</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">New Diameter</span>
                      <span className="text-lg font-bold text-blue-400 font-mono">{newDiaMm.toFixed(1)} mm</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${isSafe ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                    <div className="font-bold text-sm">Diameter Difference: {diffPct.toFixed(2)}%</div>
                    <div className="mt-1">
                      {isSafe
                        ? '✅ Safe Upsize: Deviation is within the recommended +/- 2.5% tolerance limit. ABS & odometer unaffected.'
                        : '⚠️ High Risk: Upsize exceeds 2.5% limit. May cause tyre rubbing with fender and ABS/Speedometer inaccuracies.'}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 7. APMC Mandi MSP Procurement Calculator */}
      {activeTab === 'mandi-msp' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                <Scale className="w-5 h-5" /> Minimum Support Price (MSP) & Mandi Cess
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Crop (Season 2025-2026)</label>
                <select
                  value={cropMsp}
                  onChange={(e) => setCropMsp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white"
                >
                  <option value="wheat">Wheat (Gehu) - MSP: ₹2,425 / quintal</option>
                  <option value="paddy">Paddy Common (Dhan) - MSP: ₹2,300 / quintal</option>
                  <option value="mustard">Mustard (Sarson) - MSP: ₹5,950 / quintal</option>
                  <option value="gram">Gram (Chana) - MSP: ₹5,650 / quintal</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Quantity: {cropQuantityQuintals} Quintals (~{cropQuantityQuintals * 100} kg)
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={cropQuantityQuintals}
                  onChange={(e) => setCropQuantityQuintals(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Mandi MSP Payment */}
            {(() => {
              const rates: Record<string, number> = {
                wheat: 2425,
                paddy: 2300,
                mustard: 5950,
                gram: 5650
              };
              const rate = rates[cropMsp] || 2400;
              const grossMspPayment = cropQuantityQuintals * rate;

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Direct Benefit Transfer (DBT) Payout</h4>

                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="text-slate-400">Total Farmer Direct Bank Transfer (MSP)</div>
                    <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">
                      ₹{grossMspPayment.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <p className="text-slate-300">
                    *Note: Under official FCI/State Procurement portals (e.g. e-Uparjan, Meri Fasal Mera Byora), payment is credited 100% directly to farmer's Aadhaar-linked bank account within 48 to 72 hours.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 8. NPS Tier 1 Section 80CCD(1B) Extra ₹50,000 Pension */}
      {activeTab === 'nps-pension' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> NPS 80CCD(1B) Extra ₹50,000 Tax Benefit
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Monthly Contribution: ₹{npsMonthlyContribution.toLocaleString('en-IN')}
                </label>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={npsMonthlyContribution}
                  onChange={(e) => setNpsMonthlyContribution(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Investment Horizon</label>
                  <input
                    type="number"
                    value={npsYears}
                    onChange={(e) => setNpsYears(parseInt(e.target.value) || 20)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Expected Return (%)</label>
                  <input
                    type="number"
                    value={npsExpectedReturn}
                    onChange={(e) => setNpsExpectedReturn(parseFloat(e.target.value) || 10)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* NPS Pension Corpus */}
            {(() => {
              const r = npsExpectedReturn / 100 / 12;
              const n = npsYears * 12;
              const corpus = npsMonthlyContribution * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
              const lumpSum60 = corpus * 0.60;
              const annuity40 = corpus * 0.40;
              const monthlyPension = (annuity40 * 0.065) / 12; // 6.5% annuity rate

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-amber-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Retirement Corpus at Age 60</h4>

                  <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <div className="text-slate-400">Total Accumulated Pension Corpus</div>
                    <div className="text-3xl font-bold text-amber-400 font-mono mt-1">
                      ₹{Math.round(corpus).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">60% Tax-Free Lump Sum</span>
                      <span className="font-bold text-emerald-400 font-mono">₹{Math.round(lumpSum60).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block">Monthly Pension for Life</span>
                      <span className="font-bold text-white font-mono">₹{Math.round(monthlyPension).toLocaleString('en-IN')} / mo</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 9. RTI Section 6(1) & 30-Day First Appeal */}
      {activeTab === 'rti-appeal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-cyan-400 flex items-center gap-2">
                <FileText className="w-5 h-5" /> RTI Section 6(1) & First Appeal Timeline
              </h3>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Days Elapsed Since Filing Application: {rtiDaysPassed} Days
                </label>
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={rtiDaysPassed}
                  onChange={(e) => setRtiDaysPassed(parseInt(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-white">Life & Liberty Matter?</div>
                  <div className="text-[11px] text-slate-400">Response legally mandatory within 48 Hours</div>
                </div>
                <input
                  type="checkbox"
                  checked={isLifeLiberty}
                  onChange={(e) => setIsLifeLiberty(e.target.checked)}
                  className="w-5 h-5 accent-cyan-500 rounded"
                />
              </div>
            </div>

            {/* RTI Action Protocol */}
            <div className="bg-slate-950/60 p-6 rounded-2xl border border-cyan-500/20 space-y-4 text-xs">
              <h4 className="font-semibold text-white text-sm">Next Legal Course of Action</h4>

              {rtiDaysPassed > 30 ? (
                <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-300 space-y-1">
                  <div className="font-bold text-sm">🚨 30-Day Limit Expired: File First Appeal (Section 19(1))</div>
                  <div>The Public Information Officer (PIO) has failed to respond in time. You can file a First Appeal to the First Appellate Authority (FAA) with zero additional fee.</div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300">
                  ✅ PIO has {30 - rtiDaysPassed} days remaining to provide official response.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. Clinical Body Surface Area (BSA) Mosteller Formula */}
      {activeTab === 'bsa-dosage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                <Activity className="w-5 h-5" /> Mosteller Body Surface Area (BSA) Calculator
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={patientHeightCm}
                    onChange={(e) => setPatientHeightCm(parseInt(e.target.value) || 160)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={patientWeightKg}
                    onChange={(e) => setPatientWeightKg(parseInt(e.target.value) || 60)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* BSA Output */}
            {(() => {
              // Mosteller Formula: BSA = sqrt((height * weight) / 3600)
              const bsa = Math.sqrt((patientHeightCm * patientWeightKg) / 3600);

              return (
                <div className="bg-slate-950/60 p-6 rounded-2xl border border-rose-500/20 space-y-4 text-xs">
                  <h4 className="font-semibold text-white text-sm">Calculated Clinical BSA</h4>

                  <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    <div className="text-slate-400">Body Surface Area (Mosteller Formula)</div>
                    <div className="text-3xl font-bold text-rose-400 font-mono mt-1">
                      {bsa.toFixed(2)} m²
                    </div>
                  </div>

                  <p className="text-slate-300">
                    Standard adult Indian average BSA is ~1.60 to 1.75 m². BSA is standardly used for narrow therapeutic index medication dosing, chemotherapy regimens, and glomerular filtration rate (eGFR) normalization.
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
