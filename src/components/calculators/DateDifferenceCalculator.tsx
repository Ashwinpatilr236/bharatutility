import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, Plus, Minus, CheckCircle, Briefcase, Sun, ArrowRight } from 'lucide-react';

interface DateDifferenceCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const DateDifferenceCalculator: React.FC<DateDifferenceCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [mode, setMode] = useState<'diff' | 'add'>('diff');

  // Mode 1: Date Difference
  const todayStr = new Date().toISOString().split('T')[0];
  const endDefaultStr = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(endDefaultStr);
  const [excludeSundays, setExcludeSundays] = useState<boolean>(true);
  const [excludeSaturdays, setExcludeSaturdays] = useState<boolean>(true);

  // Mode 2: Add / Subtract Days
  const [baseDate, setBaseDate] = useState<string>(todayStr);
  const [daysToAdd, setDaysToAdd] = useState<number>(45);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');

  // Calculation for Difference
  const start = new Date(startDate);
  const end = new Date(endDate);

  const isInvalidRange = isNaN(start.getTime()) || isNaN(end.getTime());
  
  const d1 = start < end ? start : end;
  const d2 = start < end ? end : start;

  // Calculate Total Days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDaysInWeek = totalDays % 7;

  // Working Days Count
  let workingDaysCount = 0;
  let sundaysCount = 0;
  let saturdaysCount = 0;

  if (!isInvalidRange && totalDays > 0) {
    const cur = new Date(d1);
    while (cur < d2) {
      cur.setDate(cur.getDate() + 1);
      const dayOfWeek = cur.getDay(); // 0 is Sunday, 6 is Saturday
      if (dayOfWeek === 0) {
        sundaysCount++;
      } else if (dayOfWeek === 6) {
        saturdaysCount++;
      }

      const isOff = (excludeSundays && dayOfWeek === 0) || (excludeSaturdays && dayOfWeek === 6);
      if (!isOff) {
        workingDaysCount++;
      }
    }
  }

  // Calculate Year, Month, Day breakdown
  let yDiff = d2.getFullYear() - d1.getFullYear();
  let mDiff = d2.getMonth() - d1.getMonth();
  let dayDiff = d2.getDate() - d1.getDate();

  if (dayDiff < 0) {
    mDiff -= 1;
    const prevMonthDays = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
    dayDiff += prevMonthDays;
  }
  if (mDiff < 0) {
    yDiff -= 1;
    mDiff += 12;
  }

  // Calculation for Add/Subtract
  const targetCalculatedDate = new Date(baseDate);
  if (!isNaN(targetCalculatedDate.getTime())) {
    const multiplier = operation === 'add' ? 1 : -1;
    targetCalculatedDate.setDate(targetCalculatedDate.getDate() + (daysToAdd * multiplier));
  }

  useEffect(() => {
    if (onResultChange) {
      if (mode === 'diff') {
        const summary = `${startDate} to ${endDate}: ${totalDays} Days (${workingDaysCount} Working Days)`;
        onResultChange(summary, { mode: 'diff', startDate, endDate, totalDays, workingDaysCount });
      } else {
        const dateFormatted = targetCalculatedDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        const summary = `${baseDate} ${operation} ${daysToAdd} days = ${dateFormatted}`;
        onResultChange(summary, { mode: 'add', baseDate, daysToAdd, operation, result: dateFormatted });
      }
    }
  }, [mode, startDate, endDate, totalDays, workingDaysCount, baseDate, daysToAdd, operation]);

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 max-w-md">
        <button
          onClick={() => setMode('diff')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            mode === 'diff'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Duration Between Dates
        </button>
        <button
          onClick={() => setMode('add')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            mode === 'add'
              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
          }`}
        >
          Add / Subtract Days
        </button>
      </div>

      {mode === 'diff' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Inputs */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Select Start and End Dates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block">
                Quick Ranges from Today
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '30 Days', days: 30 },
                  { label: '60 Days', days: 60 },
                  { label: '90 Days (Quarter)', days: 90 },
                  { label: '180 Days (Half Year)', days: 180 },
                  { label: '365 Days (1 Year)', days: 365 },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setStartDate(todayStr);
                      const future = new Date(Date.now() + p.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                      setEndDate(future);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    +{p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Working Days Filters */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                Working Days Exclusion Rules:
              </span>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={excludeSundays}
                    onChange={e => setExcludeSundays(e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
                  />
                  Exclude Sundays ({sundaysCount} days)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={excludeSaturdays}
                    onChange={e => setExcludeSaturdays(e.target.checked)}
                    className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
                  />
                  Exclude Saturdays ({saturdaysCount} days)
                </label>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                Total Duration
              </span>
              <div className="text-4xl font-extrabold font-mono text-white mb-2">
                {totalDays} <span className="text-xl font-normal text-neutral-400">Calendar Days</span>
              </div>
              <p className="text-sm font-medium text-neutral-300 mb-6">
                {yDiff > 0 && `${yDiff} year${yDiff > 1 ? 's' : ''}, `}
                {mDiff > 0 && `${mDiff} month${mDiff > 1 ? 's' : ''}, `}
                {dayDiff} day{dayDiff !== 1 ? 's' : ''}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800 text-xs">
                <div className="p-3 rounded-2xl bg-neutral-800/60">
                  <span className="text-neutral-400 block mb-0.5">Working Days</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{workingDaysCount}</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-800/60">
                  <span className="text-neutral-400 block mb-0.5">Total Weeks</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {totalWeeks} <span className="text-xs text-neutral-400">w {remainingDaysInWeek} d</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                <div className="flex justify-between">
                  <span>Start Weekday:</span>
                  <span className="text-neutral-200 font-medium">
                    {start.toLocaleDateString('en-IN', { weekday: 'long' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>End Weekday:</span>
                  <span className="text-neutral-200 font-medium">
                    {end.toLocaleDateString('en-IN', { weekday: 'long' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hours:</span>
                  <span className="text-neutral-200 font-mono">{(totalDays * 24).toLocaleString('en-IN')} hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Add / Subtract Days */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display border-b border-neutral-100 dark:border-neutral-800 pb-3">
              Add or Subtract Days to Date
            </h3>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Base Date
              </label>
              <input
                type="date"
                value={baseDate}
                onChange={e => setBaseDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-medium text-neutral-900 dark:text-white outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Operation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOperation('add')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      operation === 'add'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                  <button
                    onClick={() => setOperation('subtract')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      operation === 'subtract'
                        ? 'bg-accent text-white border-accent'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" /> Subtract
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  Number of Days
                </label>
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  min="1"
                  max="10000"
                  value={daysToAdd || ''}
                  onChange={e => setDaysToAdd(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white border border-neutral-800 shadow-xl relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                Calculated Date
              </span>
              <div className="text-3xl font-extrabold font-display text-white mb-2">
                {targetCalculatedDate.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
              <p className="text-sm text-neutral-300 mb-4">
                {targetCalculatedDate.toLocaleDateString('en-IN', { weekday: 'long' })}
              </p>

              <div className="p-3 rounded-2xl bg-neutral-800/60 text-xs text-neutral-300">
                {operation === 'add' ? 'Added' : 'Subtracted'} {daysToAdd} days to {baseDate}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
