import React, { useState, useMemo, useEffect } from 'react';
import { Tool } from '../../types';
import { GraduationCap, AlertCircle, CheckCircle2, Check, Copy, ArrowRightLeft } from 'lucide-react';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

export const CollegeAttendanceCalculator: React.FC<Props> = ({ onResultChange }) => {
  const [totalClasses, setTotalClasses] = useState<number>(40);
  const [attendedClasses, setAttendedClasses] = useState<number>(30);
  const [targetPercentage, setTargetPercentage] = useState<number>(75);
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    const currentAttendancePct = totalClasses > 0 ? ((attendedClasses / totalClasses) * 100).toFixed(1) : '0.0';
    
    let classesNeeded = 0;
    let classesCanBunk = 0;
    
    if (Number(currentAttendancePct) < targetPercentage) {
      classesNeeded = Math.ceil((targetPercentage * totalClasses - 100 * attendedClasses) / (100 - targetPercentage));
    } else {
      classesCanBunk = Math.floor((100 * attendedClasses - targetPercentage * totalClasses) / targetPercentage);
    }

    return { currentAttendancePct, classesNeeded, classesCanBunk, isSafe: Number(currentAttendancePct) >= targetPercentage };
  }, [totalClasses, attendedClasses, targetPercentage]);

  useEffect(() => {
    if (onResultChange && totalClasses > 0) {
      const statusText = results.isSafe
        ? `Safe: Can bunk ${results.classesCanBunk} classes`
        : `Short: Need ${results.classesNeeded} more classes`;
      onResultChange(`${results.currentAttendancePct}% Attendance | Target: ${targetPercentage}% | ${statusText}`);
    }
  }, [totalClasses, targetPercentage, results, onResultChange]);

  const handleCopy = () => {
    const statusText = results.isSafe
      ? `You can safely bunk ${results.classesCanBunk} upcoming classes and still maintain ${targetPercentage}%.`
      : `You need to attend the next ${results.classesNeeded} classes consecutively to reach ${targetPercentage}%.`;
      
    const text = `College Attendance Calculator:
Classes Conducted: ${totalClasses}
Classes Attended: ${attendedClasses}
Current Attendance: ${results.currentAttendancePct}%
Target: ${targetPercentage}%

Status: ${statusText}

Calculated via BharatUtility`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-purple-600" />
          College Attendance Calculator (75% Criteria)
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Find out exactly how many classes you need to attend or can safely skip to meet your university's hall-ticket criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-5">
          <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-5">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Classes Conducted
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1.5 uppercase tracking-wider">
                  Classes Attended
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={attendedClasses}
                  onChange={(e) => setAttendedClasses(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-bold text-lg text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2 uppercase tracking-wider">
                Target Criteria Percentage
              </label>
              <div className="flex gap-2">
                {[75, 80, 85].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTargetPercentage(pct)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                      targetPercentage === pct
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {pct}% Target
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-grow p-6 sm:p-8 bg-neutral-900 dark:bg-black rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                    <ArrowRightLeft className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">Attendance Status</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-neutral-800 pb-3">
                        <span className="text-neutral-400 text-sm">Current Attendance</span>
                        <span className="font-black text-purple-400 font-mono text-3xl">{results.currentAttendancePct}<span className="text-xl">%</span></span>
                    </div>

                    {results.isSafe ? (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1 mt-4">
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Safe from Detainment!</span>
                          </div>
                          <p className="text-xs text-emerald-200/80">
                            You can safely bunk <strong className="font-black text-emerald-400">{results.classesCanBunk}</strong> upcoming classes and still maintain {targetPercentage}%.
                          </p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1 mt-4">
                          <div className="flex items-center gap-2 font-bold text-sm">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Short Attendance Warning</span>
                          </div>
                          <p className="text-xs text-rose-200/80">
                            You need to attend the next <strong className="font-black text-rose-400">{results.classesNeeded}</strong> classes consecutively to reach {targetPercentage}%.
                          </p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="w-full py-3 px-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {copied ? <Check className="w-4 h-4 text-purple-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Results'}
          </button>
        </div>
      </div>
    </div>
  );
};
