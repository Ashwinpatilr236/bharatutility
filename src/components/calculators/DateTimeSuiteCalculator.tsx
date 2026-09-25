import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, ArrowRight } from 'lucide-react';

export type DateTimeMode = 'add-days' | 'working-days' | 'timezone' | 'date-to-day';

interface DateTimeSuiteCalculatorProps {
  initialMode?: DateTimeMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const DateTimeSuiteCalculator: React.FC<DateTimeSuiteCalculatorProps> = ({
  initialMode = 'add-days',
  onResultChange,
}) => {
  const [mode, setMode] = useState<DateTimeMode>(initialMode);

  // Add/Sub Days State
  const [baseDate, setBaseDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [daysOffset, setDaysOffset] = useState<number>(30);
  const [offsetOp, setOffsetOp] = useState<'add' | 'subtract'>('add');

  // Working Days State
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [excludeSundays, setExcludeSundays] = useState<boolean>(true);
  const [excludeSaturdays, setExcludeSaturdays] = useState<boolean>(true);

  // Timezone Converter State (IST to US/UK/Dubai/Singapore)
  const [istTime, setIstTime] = useState<string>('14:30');

  // Date to Day Finder State
  const [lookupDate, setLookupDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // 1. Add/Subtract Days Calculation
  const resultDateObj = new Date(baseDate || new Date());
  if (!isNaN(resultDateObj.getTime())) {
    const delta = offsetOp === 'add' ? daysOffset : -daysOffset;
    resultDateObj.setDate(resultDateObj.getDate() + delta);
  }
  const resultDateString = !isNaN(resultDateObj.getTime())
    ? resultDateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // 2. Working Days Calculation
  const s = new Date(startDate);
  const e = new Date(endDate);
  let totalCalendarDays = 0;
  let workingDaysCount = 0;
  let weekendDaysCount = 0;

  if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s <= e) {
    const cur = new Date(s);
    while (cur <= e) {
      totalCalendarDays++;
      const day = cur.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = (excludeSundays && day === 0) || (excludeSaturdays && day === 6);
      if (isWeekend) {
        weekendDaysCount++;
      } else {
        workingDaysCount++;
      }
      cur.setDate(cur.getDate() + 1);
    }
  }

  // 3. Timezone conversion from IST
  const [istH, istM] = istTime.split(':').map(Number);
  const now = new Date();
  const istDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), istH - 5, istM - 30));

  const formatTz = (offsetHours: number, offsetMinutes: number = 0) => {
    const d = new Date(istDate.getTime() + (offsetHours * 60 + offsetMinutes) * 60 * 1000);
    const hrs = d.getUTCHours();
    const mins = d.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    const h12 = hrs % 12 || 12;
    return `${h12}:${mins} ${ampm}`;
  };

  // 4. Date to day finder
  const lookupDateObj = new Date(lookupDate);
  const dayOfWeek = !isNaN(lookupDateObj.getTime())
    ? lookupDateObj.toLocaleDateString('en-IN', { weekday: 'long' })
    : '';
  const fullFormattedDate = !isNaN(lookupDateObj.getTime())
    ? lookupDateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  useEffect(() => {
    if (!onResultChange) return;

    if (mode === 'add-days') {
      onResultChange(`Date Result: ${resultDateString} (${offsetOp} ${daysOffset} days)`, {
        baseDate,
        daysOffset,
        resultDateString,
      });
    } else if (mode === 'working-days') {
      onResultChange(`Working Days: ${workingDaysCount} Days (${totalCalendarDays} Total Days, ${weekendDaysCount} Weekend Days)`, {
        startDate,
        endDate,
        workingDaysCount,
      });
    } else if (mode === 'timezone') {
      onResultChange(`IST ${istTime} = US ET ${formatTz(-5)}, UK ${formatTz(0)}, Dubai ${formatTz(4)}, SG ${formatTz(8)}`, {
        istTime,
      });
    } else if (mode === 'date-to-day') {
      onResultChange(`${fullFormattedDate} falls on a ${dayOfWeek}`, {
        lookupDate,
        dayOfWeek,
      });
    }
  }, [
    mode,
    baseDate,
    daysOffset,
    offsetOp,
    resultDateString,
    startDate,
    endDate,
    workingDaysCount,
    totalCalendarDays,
    istTime,
    lookupDate,
    dayOfWeek,
  ]);

  return (
    <div className="w-full space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { id: 'add-days', label: 'Add / Subtract Days' },
          { id: 'working-days', label: 'Working Days Calculator' },
          { id: 'timezone', label: 'IST Global Timezone' },
          { id: 'date-to-day', label: 'Date to Day Finder' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as DateTimeMode)}
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

      {mode === 'add-days' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOffsetOp('add')}
                className={`py-2 rounded-xl text-xs font-bold ${
                  offsetOp === 'add' ? 'bg-indigo-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                + Add Days
              </button>
              <button
                onClick={() => setOffsetOp('subtract')}
                className={`py-2 rounded-xl text-xs font-bold ${
                  offsetOp === 'subtract' ? 'bg-indigo-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                - Subtract Days
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Number of Days
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={daysOffset || ''}
                onChange={(e) => setDaysOffset(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Calculated Date</div>
            <div className="space-y-3">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {resultDateString}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {offsetOp === 'add' ? `${daysOffset} days after` : `${daysOffset} days before`} {baseDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {mode === 'working-days' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={excludeSundays}
                  onChange={(e) => setExcludeSundays(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Exclude Sundays
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <input
                  type="checkbox"
                  checked={excludeSaturdays}
                  onChange={(e) => setExcludeSaturdays(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Exclude Saturdays
              </label>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Business Days Summary</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Working Days:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{workingDaysCount} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Calendar Days:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{totalCalendarDays} Days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Weekend Days:</span>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{weekendDaysCount} Days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'timezone' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Indian Standard Time (IST - UTC+5:30)
              </label>
              <input
                type="time"
                value={istTime}
                onChange={(e) => setIstTime(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Corresponding World Times</div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">🇺🇸 US Eastern (ET):</span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{formatTz(-5)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">🇬🇧 UK (GMT / BST):</span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{formatTz(0)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">🇦🇪 Dubai (GST):</span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{formatTz(4)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">🇸🇬 Singapore (SGT):</span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{formatTz(8)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'date-to-day' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Select Date
              </label>
              <input
                type="date"
                value={lookupDate}
                onChange={(e) => setLookupDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Day of the Week</div>
            <div className="space-y-2">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-display">
                {dayOfWeek}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {fullFormattedDate}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
