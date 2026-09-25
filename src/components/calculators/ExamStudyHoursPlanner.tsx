import React, { useState, useMemo, useEffect } from 'react';
import { Tool } from '../../types';
import { BookOpen, Check, Copy, ArrowRightLeft } from 'lucide-react';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

export const ExamStudyHoursPlanner: React.FC<Props> = ({ onResultChange }) => {
  const [examDaysRemaining, setExamDaysRemaining] = useState<number>(30);
  const [totalChapters, setTotalChapters] = useState<number>(40);
  const [hoursPerChapter, setHoursPerChapter] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    const totalStudyHoursNeeded = totalChapters * hoursPerChapter;
    const hoursPerDayNeeded = examDaysRemaining > 0 ? (totalStudyHoursNeeded / examDaysRemaining).toFixed(1) : '0.0';

    return { totalStudyHoursNeeded, hoursPerDayNeeded };
  }, [examDaysRemaining, totalChapters, hoursPerChapter]);

  useEffect(() => {
    if (onResultChange && examDaysRemaining > 0) {
      onResultChange(`Study Need: ${results.hoursPerDayNeeded} hrs/day for ${examDaysRemaining} days (${totalChapters} chapters)`);
    }
  }, [examDaysRemaining, totalChapters, results, onResultChange]);

  const handleCopy = () => {
    const text = `Exam Study Hours Planner:
Days Remaining: ${examDaysRemaining} Days
Chapters/Modules: ${totalChapters}
Est. Hours/Chapter: ${hoursPerChapter} Hrs

Total Preparation Effort: ${results.totalStudyHoursNeeded} Hours
Target Study Time: ${results.hoursPerDayNeeded} Hrs / Day

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-fuchsia-600" />
          Exam Study Hours Planner
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Calculate exactly how many hours you need to study every day to complete your syllabus before the exam.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Days Remaining for Exam
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={examDaysRemaining}
                  onChange={(e) => setExamDaysRemaining(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Total Chapters / Modules
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={totalChapters}
                  onChange={(e) => setTotalChapters(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Est. Hours per Chapter
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  step="0.5"
                  value={hoursPerChapter}
                  onChange={(e) => setHoursPerChapter(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <ArrowRightLeft className="w-4 h-4 text-fuchsia-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Daily Study Target</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Total Preparation Effort</span>
                        <span className="font-bold text-white font-mono text-2xl">{results.totalStudyHoursNeeded} <span className="text-sm text-neutral-500 font-normal">Hours</span></span>
                    </div>
                    <div className="flex justify-between items-end pt-1">
                        <span className="text-neutral-400 text-sm">Target Study Time</span>
                        <span className="font-black text-fuchsia-400 font-mono text-3xl">{results.hoursPerDayNeeded} <span className="text-sm text-fuchsia-500 font-normal">Hrs / Day</span></span>
                    </div>
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-fuchsia-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Study Plan'}
          </button>
        </div>
      </div>
    </div>
  );
};
