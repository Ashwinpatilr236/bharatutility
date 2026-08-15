import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Cake, Calendar, Clock, Sparkles, RefreshCw } from 'lucide-react';
import { triggerCelebration } from '../../utils/formatters';

interface AgeCalculatorProps {
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const AgeCalculator: React.FC<AgeCalculatorProps> = ({ onResultChange }) => {
  const { currentToolParams } = useApp();

  const [dob, setDob] = useState<string>(() => {
    return currentToolParams?.dob || '1998-08-15';
  });
  const [targetDate, setTargetDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Calculate Exact Age
  const birth = new Date(dob);
  const target = new Date(targetDate);

  let years = 0;
  let months = 0;
  let days = 0;
  let totalDays = 0;
  let nextBirthdayDays = 0;
  let dayOfWeek = '';
  let zodiacSign = '';

  if (!isNaN(birth.getTime()) && !isNaN(target.getTime()) && target >= birth) {
    // Exact Day of Week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayOfWeek = daysOfWeek[birth.getDay()];

    // Zodiac Sign
    const month = birth.getMonth() + 1;
    const day = birth.getDate();
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiacSign = 'Aries ♈ (Mesh)';
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiacSign = 'Taurus ♉ (Vrishabh)';
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiacSign = 'Gemini ♊ (Mithun)';
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiacSign = 'Cancer ♋ (Kark)';
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiacSign = 'Leo ♌ (Simha)';
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiacSign = 'Virgo ♍ (Kanya)';
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiacSign = 'Libra ♎ (Tula)';
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiacSign = 'Scorpio ♏ (Vrishchik)';
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiacSign = 'Sagittarius ♐ (Dhanu)';
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiacSign = 'Capricorn ♑ (Makar)';
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiacSign = 'Aquarius ♒ (Kumbh)';
    else zodiacSign = 'Pisces ♓ (Meen)';

    // Date math
    years = target.getFullYear() - birth.getFullYear();
    months = target.getMonth() - birth.getMonth();
    days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total milliseconds & days
    const diffTime = Math.abs(target.getTime() - birth.getTime());
    totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Next Birthday calculation
    const currentYear = target.getFullYear();
    let nextBday = new Date(currentYear, birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday = new Date(currentYear + 1, birth.getMonth(), birth.getDate());
    }
    const diffNext = nextBday.getTime() - target.getTime();
    nextBirthdayDays = Math.ceil(diffNext / (1000 * 60 * 60 * 24));
  }

  useEffect(() => {
    if (onResultChange && years >= 0) {
      const summary = `Age: ${years} Years, ${months} Months, ${days} Days | Born on ${dayOfWeek}`;
      onResultChange(summary, { dob, targetDate });
    }
  }, [dob, targetDate, years, months, days]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-display">
              Birth Dates
            </h3>
            <button
              onClick={() => {
                setDob('1998-08-15');
                setTargetDate(new Date().toISOString().split('T')[0]);
              }}
              className="text-xs text-neutral-400 hover:text-accent font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Date of Birth Input */}
          <div className="space-y-2">
            <label htmlFor="dob-date-picker" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Date of Birth (DOB)
            </label>
            <div className="relative">
              <input
                id="dob-date-picker"
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Reference Date Input */}
          <div className="space-y-2">
            <label htmlFor="age-at-date-picker" className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Age as of Date (Reference Date)
            </label>
            <div className="relative">
              <input
                id="age-at-date-picker"
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-base text-neutral-900 dark:text-white outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer"
              />
            </div>
          </div>

          {/* Fun Birthday Milestone Celebration */}
          {nextBirthdayDays === 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <Cake className="w-5 h-5" />
                <span>Happy Birthday Today! 🎉</span>
              </div>
              <button
                onClick={triggerCelebration}
                className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-semibold"
              >
                Celebrate!
              </button>
            </div>
          )}
        </div>

        {/* Right Output Panel (6 Cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Hero Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/20 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
              Your Exact Age
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-2">
              {years} <span className="text-lg text-neutral-400 font-normal">Years</span> {months}{' '}
              <span className="text-lg text-neutral-400 font-normal">Months</span> {days}{' '}
              <span className="text-lg text-neutral-400 font-normal">Days</span>
            </div>
            <p className="text-xs text-neutral-400 mb-6">
              Born on a <strong className="text-white">{dayOfWeek}</strong> • Zodiac: {zodiacSign}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Next Birthday In
                </span>
                <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                  {nextBirthdayDays === 0 ? 'Today! 🎉' : `${nextBirthdayDays} Days`}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/60 border border-neutral-700/50">
                <span className="text-[11px] font-semibold text-neutral-400 block">
                  Total Days Lived
                </span>
                <span className="text-base font-bold font-mono text-indigo-400 mt-0.5 block">
                  {totalDays.toLocaleString()} Days
                </span>
              </div>
            </div>
          </div>

          {/* Life Milestones Grid */}
          <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
              Lifetime Milestones Breakdown
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Months</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white mt-1 block">
                  {years * 12 + months}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Weeks</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white mt-1 block">
                  {Math.floor(totalDays / 7).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Hours</span>
                <span className="text-sm font-bold font-mono text-neutral-900 dark:text-white mt-1 block">
                  {(totalDays * 24).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
