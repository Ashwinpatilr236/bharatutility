import React, { useState, useEffect } from 'react';
import { GraduationCap, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export type EducationMode = 'attendance' | 'study-time';

interface EducationSuiteCalculatorProps {
  initialMode?: EducationMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const EducationSuiteCalculator: React.FC<EducationSuiteCalculatorProps> = ({
  initialMode = 'attendance',
  onResultChange,
}) => {
  const [mode, setMode] = useState<EducationMode>(initialMode);

  // Attendance State
  const [totalClasses, setTotalClasses] = useState<number>(60);
  const [attendedClasses, setAttendedClasses] = useState<number>(42);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);

  // Study Planner State
  const [examDaysRemaining, setExamDaysRemaining] = useState<number>(30);
  const [totalChapters, setTotalChapters] = useState<number>(15);
  const [hoursPerChapter, setHoursPerChapter] = useState<number>(4);

  // Calculations
  const currentAttendancePct =
    totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '0';

  // How many more classes needed to reach target percentage:
  // (attended + X) / (total + X) >= target / 100
  // attended + X >= target*total/100 + target*X/100
  // X * (1 - target/100) >= target*total/100 - attended
  // X = (target*total - 100*attended) / (100 - target)
  const targetFraction = targetPercentage / 100;
  let classesNeeded = 0;
  let classesCanBunk = 0;

  if (Number(currentAttendancePct) < targetPercentage) {
    classesNeeded = Math.ceil(
      (targetFraction * totalClasses - attendedClasses) / (1 - targetFraction)
    );
    if (classesNeeded < 0) classesNeeded = 0;
  } else {
    // How many can bunk: attended / (total + Y) >= target / 100
    // Y = (100 * attended / target) - total
    classesCanBunk = Math.floor((attendedClasses / targetFraction) - totalClasses);
    if (classesCanBunk < 0) classesCanBunk = 0;
  }

  // Study Planner
  const totalStudyHoursNeeded = totalChapters * hoursPerChapter;
  const hoursPerDayNeeded =
    examDaysRemaining > 0 ? (totalStudyHoursNeeded / examDaysRemaining).toFixed(1) : '0';

  useEffect(() => {
    if (!onResultChange) return;

    if (mode === 'attendance') {
      const statusText =
        Number(currentAttendancePct) >= targetPercentage
          ? `Safe! You can bunk ${classesCanBunk} more classes`
          : `Need to attend next ${classesNeeded} classes consecutively`;
      onResultChange(`Attendance: ${currentAttendancePct}% (${attendedClasses}/${totalClasses}) | ${statusText}`, {
        totalClasses,
        attendedClasses,
        currentAttendancePct,
      });
    } else if (mode === 'study-time') {
      onResultChange(`Study Need: ${hoursPerDayNeeded} hrs/day for ${examDaysRemaining} days (${totalChapters} chapters)`, {
        examDaysRemaining,
        totalChapters,
        hoursPerDayNeeded,
      });
    }
  }, [
    mode,
    totalClasses,
    attendedClasses,
    targetPercentage,
    currentAttendancePct,
    classesNeeded,
    classesCanBunk,
    examDaysRemaining,
    totalChapters,
    hoursPerChapter,
    hoursPerDayNeeded,
  ]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { id: 'attendance', label: '75% Attendance Planner' },
          { id: 'study-time', label: 'Exam Study Hours Planner' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as EducationMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              mode === tab.id
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Classes Conducted
              </label>
              <input
                type="number"
                value={totalClasses || ''}
                onChange={(e) => setTotalClasses(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Classes You Attended
              </label>
              <input
                type="number"
                value={attendedClasses || ''}
                onChange={(e) => setAttendedClasses(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Target Criteria Percentage (%)
              </label>
              <div className="flex gap-2">
                {[75, 80, 85].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTargetPercentage(pct)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                      targetPercentage === pct
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {pct}% Target
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Attendance Status</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Current Attendance:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{currentAttendancePct}%</span>
              </div>

              {Number(currentAttendancePct) >= targetPercentage ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Safe from Hall-Ticket Detainment!</span>
                  </div>
                  <p className="text-xs">
                    You can safely bunk <strong className="font-extrabold">{classesCanBunk}</strong> upcoming classes and still maintain {targetPercentage}%.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Short Attendance Warning</span>
                  </div>
                  <p className="text-xs">
                    You need to attend the next <strong className="font-extrabold">{classesNeeded}</strong> classes consecutively to reach {targetPercentage}%.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mode === 'study-time' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Days Remaining for Exam
              </label>
              <input
                type="number"
                value={examDaysRemaining || ''}
                onChange={(e) => setExamDaysRemaining(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Total Chapters / Modules to Cover
              </label>
              <input
                type="number"
                value={totalChapters || ''}
                onChange={(e) => setTotalChapters(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Estimated Hours per Chapter
              </label>
              <input
                type="number"
                value={hoursPerChapter || ''}
                onChange={(e) => setHoursPerChapter(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Daily Study Target</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Preparation Effort:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{totalStudyHoursNeeded} Hours</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Target Study Time:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{hoursPerDayNeeded} Hrs / Day</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
