import React, { useState, useMemo } from 'react';
import { Pill, Search, ShieldCheck, HeartPulse, ArrowDownRight, Info, Building2, Sparkles } from 'lucide-react';
import { formatINR } from '../../../utils/formatters';

interface MedicineEntry {
  brand: string;
  genericSalt: string;
  category: string;
  dosage: string;
  brandedPrice: number;
  janAushadhiPrice: number;
  uses: string;
}

const MEDICINE_DATABASE: MedicineEntry[] = [
  { brand: 'Augmentin 625 Duo', genericSalt: 'Amoxycillin (500mg) + Clavulanic Acid (125mg)', category: 'Antibiotic', dosage: '10 Tablets', brandedPrice: 205, janAushadhiPrice: 52, uses: 'Bacterial infections, respiratory, dental & ear infections' },
  { brand: 'Pan-D / Pantocid-D', genericSalt: 'Pantoprazole (40mg) + Domperidone (30mg SR)', category: 'Acidity / GERD', dosage: '10 Capsules', brandedPrice: 198, janAushadhiPrice: 28, uses: 'Acid reflux, heartburn, gastritis & indigestion' },
  { brand: 'Dolo 650 / Calpol 650', genericSalt: 'Paracetamol (650mg)', category: 'Fever & Pain', dosage: '15 Tablets', brandedPrice: 34, janAushadhiPrice: 9, uses: 'Fever reduction, headache, body ache & viral infection pain' },
  { brand: 'Glycomet-GP 1 / 2', genericSalt: 'Glimepiride (1mg/2mg) + Metformin (500mg)', category: 'Diabetes (Type 2)', dosage: '15 Tablets', brandedPrice: 175, janAushadhiPrice: 24, uses: 'Blood sugar control in Type-2 Diabetes' },
  { brand: 'Telma 40 / Telmikind', genericSalt: 'Telmisartan (40mg)', category: 'Blood Pressure (BP)', dosage: '15 Tablets', brandedPrice: 168, janAushadhiPrice: 22, uses: 'Hypertension, high blood pressure & stroke prevention' },
  { brand: 'Atorva 10 / Lipitor', genericSalt: 'Atorvastatin (10mg)', category: 'Cholesterol / Heart', dosage: '10 Tablets', brandedPrice: 110, janAushadhiPrice: 14, uses: 'Lowers LDL bad cholesterol and reduces heart attack risk' },
  { brand: 'Shelcal 500 / Cipcal', genericSalt: 'Calcium (500mg) + Vitamin D3 (250 IU)', category: 'Bone & Joints', dosage: '15 Tablets', brandedPrice: 142, janAushadhiPrice: 26, uses: 'Calcium deficiency, bone density, osteoporosis & arthritis' },
  { brand: 'Montair-LC / Telekast-L', genericSalt: 'Montelukast (10mg) + Levocetirizine (5mg)', category: 'Allergy & Asthma', dosage: '10 Tablets', brandedPrice: 215, janAushadhiPrice: 32, uses: 'Allergic rhinitis, sneezing, running nose & dust allergy' },
  { brand: 'Thyronorm 50 / 100 mcg', genericSalt: 'Thyroxine Sodium (100mcg)', category: 'Thyroid', dosage: '120 Tablets', brandedPrice: 245, janAushadhiPrice: 65, uses: 'Hypothyroidism hormone replacement' },
  { brand: 'Azithral 500 / Azee', genericSalt: 'Azithromycin (500mg)', category: 'Antibiotic', dosage: '5 Tablets', brandedPrice: 135, janAushadhiPrice: 38, uses: 'Throat infection, tonsillitis & chest congestion' },
];

export const JanAushadhiGenericSaver: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMed, setSelectedMed] = useState<MedicineEntry>(MEDICINE_DATABASE[0]);

  // Monthly Medicine Budget Calculator
  const [monthlyBrandedSpend, setMonthlyBrandedSpend] = useState<number>(2500);

  const filteredMeds = useMemo(() => {
    if (!searchQuery) return MEDICINE_DATABASE;
    const q = searchQuery.toLowerCase();
    return MEDICINE_DATABASE.filter(
      (m) =>
        m.brand.toLowerCase().includes(q) ||
        m.genericSalt.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const savingsPercentage = Math.round(
    ((selectedMed.brandedPrice - selectedMed.janAushadhiPrice) / selectedMed.brandedPrice) * 100
  );

  const monthlySavings = Math.round(monthlyBrandedSpend * 0.75); // Avg 75% savings
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white p-6 rounded-3xl border border-emerald-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Jan Aushadhi Generic Medicine Price Saver
              <span className="text-xs px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 rounded-full font-semibold">
                PMBJP Scheme Guide
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Compare Branded vs Generic Chemical Salt Prices & Save up to 80% on Monthly Healthcare Expenses
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Brand Name (e.g. Augmentin, Dolo, Pan-D, Telma) or Salt (Paracetamol, Pantoprazole)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-medium text-sm text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Main Grid: Medicine Comparator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Medicine List / Selector */}
        <div className="lg:col-span-6 space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {filteredMeds.map((med) => (
            <button
              key={med.brand}
              onClick={() => setSelectedMed(med)}
              className={`w-full p-4 rounded-2xl border text-left transition-all ${
                selectedMed.brand === med.brand
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{med.brand}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{med.genericSalt}</div>
                </div>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md font-semibold">
                  {med.category}
                </span>
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="text-slate-500">Branded: <strong className="text-rose-600 line-through">₹{med.brandedPrice}</strong></span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Jan Aushadhi: ₹{med.janAushadhiPrice} ({med.dosage})</span>
              </div>
            </button>
          ))}
        </div>

        {/* Comparison Result Card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Price Comparison Card
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              {savingsPercentage}% Price Reduction
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-400">Selected Medicine ({selectedMed.dosage})</div>
            <h3 className="text-xl font-bold text-white mt-1">{selectedMed.brand}</h3>
            <div className="text-xs text-emerald-300 font-mono mt-0.5">{selectedMed.genericSalt}</div>
            <p className="text-xs text-slate-400 mt-2">{selectedMed.uses}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <span className="text-xs text-rose-300">Branded MRP</span>
              <div className="text-2xl font-black text-rose-400 mt-0.5">₹{selectedMed.brandedPrice}</div>
              <span className="text-[11px] text-slate-400">Retail Chemist Price</span>
            </div>

            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <span className="text-xs text-emerald-300">Jan Aushadhi Price</span>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">₹{selectedMed.janAushadhiPrice}</div>
              <span className="text-[11px] text-slate-400">Govt Jan Aushadhi Kendra</span>
            </div>
          </div>

          {/* Monthly Budget Estimator */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-semibold">Your Family Monthly Medicine Bill</span>
              <span className="font-bold text-emerald-400">{formatINR(monthlyBrandedSpend)}</span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="500"
              value={monthlyBrandedSpend}
              onChange={(e) => setMonthlyBrandedSpend(parseInt(e.target.value) || 500)}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 flex justify-between items-center">
              <span>Estimated Annual Savings:</span>
              <strong className="text-emerald-400 text-sm font-black">{formatINR(yearlySavings)} / Year</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
