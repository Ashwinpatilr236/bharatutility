import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { Stethoscope, Copy, Check, Calculator, Info, IndianRupee, AlertTriangle, Activity } from 'lucide-react';

interface Props {
  tool: Tool;
  onResultChange?: (result: string) => void;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export const HealthInsuranceCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [cityTier, setCityTier] = useState<number>(1); // 1 = Tier 1 (Metros), 2 = Tier 2, 3 = Tier 3
  const [familyMembers, setFamilyMembers] = useState<number>(4);
  const [eldestAge, setEldestAge] = useState<number>(45);
  const [preExistingConditions, setPreExistingConditions] = useState<boolean>(false);
  const [existingCorporateCover, setExistingCorporateCover] = useState<number>(300000);

  const [copied, setCopied] = useState(false);

  const {
    baseCover,
    cityMultiplier,
    ageMultiplier,
    conditionMultiplier,
    recommendedCover,
    finalDeficit
  } = useMemo(() => {
    // 1. Base Cover per member (Assuming average hospital stay costs)
    const basePerMember = 250000;
    const baseCover = basePerMember * familyMembers;

    // 2. City Tier Multiplier (Medical inflation and room rents are higher in Metros)
    let cityMultiplier = 1.0;
    if (cityTier === 1) cityMultiplier = 1.5; // Metros
    if (cityTier === 2) cityMultiplier = 1.2; // Tier 2

    // 3. Age Multiplier (Eldest member dictates the risk)
    let ageMultiplier = 1.0;
    if (eldestAge >= 45 && eldestAge < 60) ageMultiplier = 1.3;
    if (eldestAge >= 60) ageMultiplier = 1.6;

    // 4. Pre-existing Conditions Multiplier
    const conditionMultiplier = preExistingConditions ? 1.3 : 1.0;

    // Calculate Recommended Cover
    let calculatedCover = baseCover * cityMultiplier * ageMultiplier * conditionMultiplier;

    // Minimum sensible cover in India today is 5L
    if (calculatedCover < 500000) calculatedCover = 500000;
    
    // Round to nearest Lakh
    const recommendedCover = Math.ceil(calculatedCover / 100000) * 100000;

    // Final deficit after corporate cover
    const finalDeficit = Math.max(0, recommendedCover - existingCorporateCover);

    return {
      baseCover,
      cityMultiplier,
      ageMultiplier,
      conditionMultiplier,
      recommendedCover,
      finalDeficit
    };
  }, [cityTier, familyMembers, eldestAge, preExistingConditions, existingCorporateCover]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(`Suggested Cover: ${formatINR(recommendedCover)} | Shortfall: ${formatINR(finalDeficit)}`);
    }
  }, [recommendedCover, finalDeficit, onResultChange]);

  const copyToClipboard = () => {
    const text = `🏥 Health Insurance Cover Estimate
- Family Members: ${familyMembers}
- Eldest Member Age: ${eldestAge}
- City Tier: ${cityTier === 1 ? 'Metro' : cityTier === 2 ? 'Tier-2' : 'Tier-3'}
- Pre-existing Conditions: ${preExistingConditions ? 'Yes' : 'No'}
- Existing Corporate Cover: ${formatINR(existingCorporateCover)}

✅ Recommended Optimal Cover: ${formatINR(recommendedCover)}
⚠️ Additional Cover Needed (Shortfall): ${formatINR(finalDeficit)}

(Calculated via BharatUtility)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        
        {/* Basic Details */}
        <div className="bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Family & Lifestyle
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Family Members to Cover</label>
                <input
                  type="number" min="1" max="10" value={familyMembers} onChange={(e) => setFamilyMembers(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Eldest Member's Age</label>
                <input
                  type="number" min="18" max="100" value={eldestAge} onChange={(e) => setEldestAge(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">City of Residence (Healthcare Costs)</label>
              <div className="flex bg-slate-800 rounded-lg p-1">
                {[
                  { value: 1, label: 'Metro (Tier 1)' },
                  { value: 2, label: 'Tier 2' },
                  { value: 3, label: 'Tier 3/Rural' }
                ].map(tier => (
                  <button
                    key={tier.value}
                    onClick={() => setCityTier(tier.value)}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${cityTier === tier.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div>
                <label className="block text-xs font-bold text-slate-300">Pre-existing Health Conditions?</label>
                <span className="text-[10px] text-slate-500">e.g. Diabetes, BP, Heart conditions in any member</span>
              </div>
              <button
                onClick={() => setPreExistingConditions(!preExistingConditions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preExistingConditions ? 'bg-emerald-500' : 'bg-slate-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${preExistingConditions ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Existing Corporate / Other Health Cover (₹)</label>
              <input
                type="number" value={existingCorporateCover} onChange={(e) => setExistingCorporateCover(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white font-mono text-lg"
                placeholder="e.g. 300000"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl sticky top-6 space-y-6">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
              Optimal Cover Assessment
            </h4>
            <Stethoscope className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-emerald-500/30 shadow-inner">
            <span className="text-xs font-bold text-slate-400 mb-1 block uppercase tracking-wider">Recommended Total Cover</span>
            <span className="text-4xl font-black font-mono text-emerald-400">
              {formatINR(recommendedCover)}
            </span>
          </div>

          {finalDeficit > 0 ? (
            <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/30">
              <span className="text-xs font-semibold text-rose-400 mb-1 block uppercase tracking-wider">Shortfall (Additional Cover Needed)</span>
              <span className="text-2xl font-bold font-mono text-rose-300">
                {formatINR(finalDeficit)}
              </span>
              <p className="text-[10px] text-rose-300/80 mt-2 leading-tight">
                Your existing corporate cover is not enough. Consider buying a personal super-top-up or base policy for {formatINR(finalDeficit)}.
              </p>
            </div>
          ) : (
            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
               <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                 <Check className="w-4 h-4" /> You are adequately covered!
               </span>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex gap-2.5">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-300">
              Note: Corporate policies disappear if you lose your job. It is highly recommended to have a personal base policy of at least ₹5L independent of your employer.
            </p>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Details!' : 'Copy Cover Breakdown'}
          </button>
        </div>
      </div>
    </div>
  );
};
