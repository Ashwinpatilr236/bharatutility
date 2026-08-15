import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Plus, Trash2, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';
import { formatIndianNumber } from '../../utils/formatters';

interface MarksPercentageCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

interface Subject {
  id: string;
  name: string;
  obtained: number;
  total: number;
}

export const MarksPercentageCalculator: React.FC<MarksPercentageCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'English Core', obtained: 88, total: 100 },
    { id: '2', name: 'Mathematics', obtained: 92, total: 100 },
    { id: '3', name: 'Science / Physics', obtained: 85, total: 100 },
    { id: '4', name: 'Social Studies / Chemistry', obtained: 90, total: 100 },
    { id: '5', name: 'Hindi / 2nd Language', obtained: 80, total: 100 },
  ]);

  const [useBestOfFive, setUseBestOfFive] = useState<boolean>(false);

  // Calculations
  const activeSubjectList = useBestOfFive && subjects.length > 5
    ? [...subjects].sort((a, b) => (b.obtained / b.total) - (a.obtained / a.total)).slice(0, 5)
    : subjects;

  const totalObtained = activeSubjectList.reduce((acc, s) => acc + (Number(s.obtained) || 0), 0);
  const totalMaxMarks = activeSubjectList.reduce((acc, s) => acc + (Number(s.total) || 100), 0);
  const percentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;

  // Grade determination (CBSE standard)
  const getGradeInfo = (pct: number) => {
    if (pct >= 91) return { grade: 'A1', gp: 10.0, label: 'Outstanding (Top 1/8th of passed candidates)' };
    if (pct >= 81) return { grade: 'A2', gp: 9.0, label: 'Excellent' };
    if (pct >= 71) return { grade: 'B1', gp: 8.0, label: 'Very Good' };
    if (pct >= 61) return { grade: 'B2', gp: 7.0, label: 'Good' };
    if (pct >= 51) return { grade: 'C1', gp: 6.0, label: 'Fair' };
    if (pct >= 41) return { grade: 'C2', gp: 5.0, label: 'Average' };
    if (pct >= 33) return { grade: 'D', gp: 4.0, label: 'Pass' };
    return { grade: 'E', gp: 0.0, label: 'Essential Repeat / Needs Improvement' };
  };

  const getDivision = (pct: number) => {
    if (pct >= 75) return 'First Division with Distinction';
    if (pct >= 60) return 'First Division';
    if (pct >= 50) return 'Second Division';
    if (pct >= 33) return 'Third Division';
    return 'Failed / Compartment';
  };

  const gradeInfo = getGradeInfo(percentage);
  const division = getDivision(percentage);

  const addSubject = () => {
    const nextNum = subjects.length + 1;
    setSubjects([...subjects, {
      id: Math.random().toString(36).substring(2, 7),
      name: `Subject ${nextNum}`,
      obtained: 80,
      total: 100
    }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const updateSubject = (id: string, field: 'name' | 'obtained' | 'total', val: any) => {
    setSubjects(subjects.map(s => (s.id === id ? { ...s, [field]: val } : s)));
  };

  useEffect(() => {
    if (onResultChange) {
      const summary = `Scored ${totalObtained}/${totalMaxMarks} (${percentage.toFixed(2)}%) — Grade ${gradeInfo.grade} (${division})`;
      onResultChange(summary, {
        totalObtained,
        totalMaxMarks,
        percentage,
        grade: gradeInfo.grade,
        division
      });
    }
  }, [totalObtained, totalMaxMarks, percentage, gradeInfo.grade, division]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Subject Table */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              Subject-wise Marks Entry
            </h3>
            <button
              onClick={addSubject}
              className="p-1.5 px-3 rounded-xl bg-accent text-white text-xs font-semibold flex items-center gap-1 hover:bg-accent/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subject
            </button>
          </div>

          <div className="space-y-3">
            {subjects.map((sub, idx) => (
              <div
                key={sub.id}
                className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-800"
              >
                <div className="col-span-6 sm:col-span-5">
                  <input
                    type="text"
                    value={sub.name}
                    onChange={e => updateSubject(sub.id, 'name', e.target.value)}
                    placeholder={`Subject ${idx + 1}`}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-3 sm:col-span-3">
                  <input
                    type="number"
                    min="0"
                    max={sub.total}
                    value={sub.obtained}
                    onChange={e => updateSubject(sub.id, 'obtained', Number(e.target.value))}
                    placeholder="Marks"
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-xs text-neutral-900 dark:text-white outline-none focus:border-accent text-center"
                  />
                </div>

                <div className="col-span-2 sm:col-span-3 text-center">
                  <div className="flex items-center justify-center gap-1 font-mono text-xs text-neutral-500">
                    <span>/</span>
                    <input
                      type="number"
                      min="1"
                      value={sub.total}
                      onChange={e => updateSubject(sub.id, 'total', Number(e.target.value))}
                      className="w-14 px-1.5 py-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 font-mono text-xs text-neutral-700 dark:text-neutral-300 outline-none text-center"
                    />
                  </div>
                </div>

                <div className="col-span-1 text-right">
                  {subjects.length > 1 && (
                    <button
                      onClick={() => removeSubject(sub.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors"
                      title="Remove subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {subjects.length > 5 && (
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useBestOfFive}
                  onChange={e => setUseBestOfFive(e.target.checked)}
                  className="w-4 h-4 rounded text-accent accent-accent"
                />
                Calculate based on Top 5 Highest-Scoring Subjects (CBSE Best-of-5 Rule)
              </label>
            </div>
          )}
        </div>

        {/* Output Column */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
              Overall Board Percentage
            </span>
            <div className="text-5xl font-extrabold font-mono text-white mb-1">
              {percentage.toFixed(2)}%
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              Total Marks: {totalObtained} / {totalMaxMarks} ({activeSubjectList.length} subjects counted)
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-800/60">
                <span className="text-neutral-400 block mb-0.5">CBSE Grade</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono text-emerald-400">{gradeInfo.grade}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({gradeInfo.gp.toFixed(1)} GP)</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60">
                <span className="text-neutral-400 block mb-0.5">Equivalent CGPA</span>
                <span className="text-2xl font-bold font-mono text-white">{(percentage / 9.5).toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/50 text-xs">
              <span className="text-neutral-400 block text-[11px]">Academic Classification:</span>
              <span className="font-bold text-neutral-100 text-sm">{division}</span>
              <span className="text-[10px] text-neutral-400 block mt-1">{gradeInfo.label}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
