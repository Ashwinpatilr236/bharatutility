import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { GraduationCap, BookOpen, Calculator, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface CgpaCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

interface UniversityFormula {
  id: string;
  name: string;
  formulaDesc: string;
  convert: (cgpa: number) => number;
}

const UNIVERSITY_FORMULAS: UniversityFormula[] = [
  {
    id: 'cbse',
    name: 'CBSE Standard (Class 10 / 12)',
    formulaDesc: 'Percentage = CGPA × 9.5',
    convert: (cgpa) => cgpa * 9.5
  },
  {
    id: 'aicte',
    name: 'AICTE / VTU / Engineering Standard',
    formulaDesc: 'Percentage = (CGPA - 0.75) × 10',
    convert: (cgpa) => Math.max(0, (cgpa - 0.75) * 10)
  },
  {
    id: 'mumbai',
    name: 'Mumbai University',
    formulaDesc: 'Percentage = (CGPA × 7.1) + 11',
    convert: (cgpa) => Math.min(100, (cgpa * 7.1) + 11)
  },
  {
    id: 'anna',
    name: 'Anna University / MAKAUT',
    formulaDesc: 'Percentage = CGPA × 10',
    convert: (cgpa) => cgpa * 10
  },
  {
    id: 'ktu',
    name: 'KTU (APJ Abdul Kalam Tech Uni)',
    formulaDesc: 'Percentage = (CGPA × 10) - 3.75',
    convert: (cgpa) => Math.max(0, (cgpa * 10) - 3.75)
  }
];

interface Semester {
  id: string;
  name: string;
  sgpa: number;
  credits: number;
}

export const CgpaCalculator: React.FC<CgpaCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [calcTab, setCalcTab] = useState<'cgpa-to-pct' | 'sgpa-to-cgpa'>('cgpa-to-pct');

  // CGPA to Percentage state
  const [cgpaInput, setCgpaInput] = useState<number>(8.6);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>('cbse');

  // SGPA state
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Semester 1', sgpa: 8.2, credits: 20 },
    { id: '2', name: 'Semester 2', sgpa: 8.6, credits: 22 },
    { id: '3', name: 'Semester 3', sgpa: 9.0, credits: 24 },
    { id: '4', name: 'Semester 4', sgpa: 8.8, credits: 24 }
  ]);

  const selectedFormula = UNIVERSITY_FORMULAS.find(f => f.id === selectedFormulaId) || UNIVERSITY_FORMULAS[0];
  const calculatedPercentage = Math.min(100, Math.max(0, selectedFormula.convert(cgpaInput)));

  // SGPA to CGPA weighted average
  const totalCredits = semesters.reduce((acc, s) => acc + (Number(s.credits) || 0), 0);
  const weightedPoints = semesters.reduce((acc, s) => acc + ((Number(s.sgpa) || 0) * (Number(s.credits) || 0)), 0);
  const aggregateCgpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;

  // Grade classification
  const getClassification = (pct: number) => {
    if (pct >= 75) return 'First Class with Distinction';
    if (pct >= 60) return 'First Class';
    if (pct >= 50) return 'Second Class';
    if (pct >= 40) return 'Pass Class';
    return 'Fail';
  };

  const addSemester = () => {
    const nextNum = semesters.length + 1;
    setSemesters([
      ...semesters,
      { id: Math.random().toString(36).substring(2, 7), name: `Semester ${nextNum}`, sgpa: 8.0, credits: 22 }
    ]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length <= 1) return;
    setSemesters(semesters.filter(s => s.id !== id));
  };

  const updateSemester = (id: string, field: 'sgpa' | 'credits', val: number) => {
    setSemesters(semesters.map(s => (s.id === id ? { ...s, [field]: val } : s)));
  };

  useEffect(() => {
    if (onResultChange) {
      if (calcTab === 'cgpa-to-pct') {
        const summary = `${cgpaInput} CGPA = ${calculatedPercentage.toFixed(2)}% (${selectedFormula.name})`;
        onResultChange(summary, { tab: 'cgpa-to-pct', cgpa: cgpaInput, formula: selectedFormula.name, percentage: calculatedPercentage });
      } else {
        const summary = `Aggregated CGPA across ${semesters.length} semesters = ${aggregateCgpa.toFixed(2)}`;
        onResultChange(summary, { tab: 'sgpa-to-cgpa', semestersCount: semesters.length, aggregateCgpa });
      }
    }
  }, [calcTab, cgpaInput, selectedFormulaId, calculatedPercentage, aggregateCgpa]);

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 max-w-md">
        <button
          onClick={() => setCalcTab('cgpa-to-pct')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            calcTab === 'cgpa-to-pct'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          CGPA to Percentage
        </button>
        <button
          onClick={() => setCalcTab('sgpa-to-cgpa')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            calcTab === 'sgpa-to-cgpa'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Semester SGPA to CGPA
        </button>
      </div>

      {calcTab === 'cgpa-to-pct' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Enter CGPA (10-Point Scale)
            </h3>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Cumulative Grade Point Average (CGPA)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpaInput || ''}
                onChange={e => setCgpaInput(Math.min(10, Math.max(0, Number(e.target.value))))}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-lg text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Select Indian Board / University Conversion Formula
              </label>
              <div className="space-y-2">
                {UNIVERSITY_FORMULAS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFormulaId(f.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      selectedFormulaId === f.id
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/20 text-neutral-900 dark:text-white'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block text-neutral-900 dark:text-white">{f.name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{f.formulaDesc}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-accent">
                      {Math.min(100, Math.max(0, f.convert(cgpaInput))).toFixed(2)}%
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                Equivalent Percentage
              </span>
              <div className="text-5xl font-extrabold font-mono text-white mb-2">
                {calculatedPercentage.toFixed(2)}%
              </div>
              <p className="text-xs text-neutral-400 mb-6">
                Formula: {selectedFormula.formulaDesc}
              </p>

              <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/50 text-xs space-y-1">
                <span className="text-neutral-400 block text-[11px]">Academic Classification:</span>
                <span className="font-bold text-white text-base">{getClassification(calculatedPercentage)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: SGPA to CGPA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
                Semester-wise SGPA & Credits
              </h3>
              <button
                onClick={addSemester}
                className="p-1.5 px-3 rounded-xl bg-accent text-white text-xs font-semibold flex items-center gap-1 hover:bg-accent/90 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Semester
              </button>
            </div>

            <div className="space-y-3">
              {semesters.map((sem, idx) => (
                <div
                  key={sem.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800"
                >
                  <div className="col-span-5 font-semibold text-xs text-neutral-800 dark:text-neutral-200 pl-2">
                    Semester {idx + 1}
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={sem.sgpa}
                      onChange={e => updateSemester(sem.id, 'sgpa', Number(e.target.value))}
                      placeholder="SGPA"
                      className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-xs text-neutral-900 dark:text-white outline-none focus:border-accent text-center"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="1"
                      value={sem.credits}
                      onChange={e => updateSemester(sem.id, 'credits', Number(e.target.value))}
                      placeholder="Credits"
                      className="w-full px-2 py-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 font-mono text-xs text-neutral-900 dark:text-white outline-none focus:border-accent text-center"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    {semesters.length > 1 && (
                      <button
                        onClick={() => removeSemester(sem.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                Cumulative CGPA
              </span>
              <div className="text-5xl font-extrabold font-mono text-white mb-2">
                {aggregateCgpa.toFixed(2)}
              </div>
              <p className="text-xs text-neutral-400 mb-6">
                Weighted across {totalCredits} total semester credits
              </p>

              <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/50 text-xs">
                <span className="text-neutral-400 block text-[11px]">CBSE / AICTE Equivalent %:</span>
                <span className="font-bold text-emerald-400 text-lg font-mono">
                  {(aggregateCgpa * 9.5).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
