import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import {
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  RotateCcw,
  Sparkles,
  Check,
  Copy,
  IndianRupee,
  Users,
  Briefcase,
  Layers,
  Award,
  CalendarDays
} from 'lucide-react';

interface Props {
  tool: Tool;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(val));
};

interface HabitItem {
  id: string;
  name: string;
  category: string;
  completedDates: string[]; // ISO date strings 'YYYY-MM-DD'
  createdDate: string;
}

export const WorkAndHabitSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // =========================================================================
  // 1. OVERTIME & HOURLY SALARY WAGE STATE
  // =========================================================================
  const [monthlyGrossSalary, setMonthlyGrossSalary] = useState<number>(45000);
  const [workingDaysInMonth, setWorkingDaysInMonth] = useState<number>(26);
  const [standardHoursPerDay, setStandardHoursPerDay] = useState<number>(8);
  const [overtimeHoursWorked, setOvertimeHoursWorked] = useState<number>(18);
  const [overtimeRateMultiplier, setOvertimeRateMultiplier] = useState<number>(2.0); // 2.0x Indian Factories Act

  // =========================================================================
  // 2. HABIT STREAK & DAILY ROUTINE TRACKER STATE (100% localStorage)
  // =========================================================================
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem('bharatutility_habits_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: '1', name: '30 Min DSA / Tech Upskilling', category: 'Career', completedDates: [], createdDate: new Date().toISOString() },
      { id: '2', name: 'Drink 3 Litres Water', category: 'Health', completedDates: [], createdDate: new Date().toISOString() },
      { id: '3', name: '45 Min Gym / Morning Walk', category: 'Fitness', completedDates: [], createdDate: new Date().toISOString() },
      { id: '4', name: 'Read 10 Pages Book', category: 'Personal', completedDates: [], createdDate: new Date().toISOString() },
    ];
  });

  const [newHabitName, setNewHabitName] = useState<string>('');
  const [newHabitCategory, setNewHabitCategory] = useState<string>('Productivity');

  // Save to localStorage automatically on state change
  useEffect(() => {
    try {
      localStorage.setItem('bharatutility_habits_v1', JSON.stringify(habits));
    } catch {}
  }, [habits]);

  // =========================================================================
  // 3. CHIT FUND & COMMITTEE DIVIDEND STATE
  // =========================================================================
  const [chitFundTotalValue, setChitFundTotalValue] = useState<number>(500000); // 5 Lakhs
  const [chitTotalMembers, setChitTotalMembers] = useState<number>(20); // 20 members / 20 months
  const [chitAuctionDiscount, setChitAuctionDiscount] = useState<number>(60000); // Winning auction bid discount
  const [foremanCommissionPercent, setForemanCommissionPercent] = useState<number>(5); // Standard 5% Chit Funds Act

  // =========================================================================
  // 1. OVERTIME CALCULATION
  // =========================================================================
  const overtimeResult = useMemo(() => {
    const totalWorkingHours = Math.max(1, workingDaysInMonth * standardHoursPerDay);
    const standardHourlyWage = monthlyGrossSalary / totalWorkingHours;
    const effectiveOvertimeHourlyWage = standardHourlyWage * overtimeRateMultiplier;
    const totalOvertimeEarnings = overtimeHoursWorked * effectiveOvertimeHourlyWage;
    const totalSalaryWithOvertime = monthlyGrossSalary + totalOvertimeEarnings;
    const percentageIncrease = monthlyGrossSalary > 0 ? (totalOvertimeEarnings / monthlyGrossSalary) * 100 : 0;

    return {
      totalWorkingHours,
      standardHourlyWage: Math.round(standardHourlyWage),
      effectiveOvertimeHourlyWage: Math.round(effectiveOvertimeHourlyWage),
      totalOvertimeEarnings: Math.round(totalOvertimeEarnings),
      totalSalaryWithOvertime: Math.round(totalSalaryWithOvertime),
      percentageIncrease: percentageIncrease.toFixed(1),
    };
  }, [monthlyGrossSalary, workingDaysInMonth, standardHoursPerDay, overtimeHoursWorked, overtimeRateMultiplier]);

  // =========================================================================
  // 2. HABIT TRACKER HELPERS & STATS
  // =========================================================================
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Last 7 days helper list
  const past7Days = useMemo(() => {
    const days: { dateStr: string; dayLabel: string; shortDate: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'narrow' });
      const shortDate = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      days.push({ dateStr, dayLabel, shortDate });
    }
    return days;
  }, []);

  const toggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const exists = h.completedDates.includes(dateStr);
        const updated = exists
          ? h.completedDates.filter((d) => d !== dateStr)
          : [...h.completedDates, dateStr];
        return { ...h, completedDates: updated };
      })
    );
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newH: HabitItem = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      category: newHabitCategory,
      completedDates: [todayStr],
      createdDate: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newH]);
    setNewHabitName('');
  };

  const removeHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const calculateStreak = (completedDates: string[]): { currentStreak: number; bestStreak: number } => {
    if (!completedDates.length) return { currentStreak: 0, bestStreak: 0 };
    const dateSet = new Set(completedDates);
    
    // Calculate current streak backward from today
    let currentStreak = 0;
    const checkDate = new Date();
    
    // If today is not done, check if yesterday was done to keep streak alive
    const todayFormatted = checkDate.toISOString().split('T')[0];
    if (dateSet.has(todayFormatted)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayFormatted = checkDate.toISOString().split('T')[0];
      if (dateSet.has(yesterdayFormatted)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    while (true) {
      const formatted = checkDate.toISOString().split('T')[0];
      if (dateSet.has(formatted)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Best streak count
    const sorted = [...completedDates].sort();
    let best = 0;
    let temp = 0;
    let prevD: Date | null = null;

    for (const dStr of sorted) {
      const cur = new Date(dStr);
      if (!prevD) {
        temp = 1;
      } else {
        const diffDays = Math.round((cur.getTime() - prevD.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          temp++;
        } else if (diffDays > 1) {
          temp = 1;
        }
      }
      prevD = cur;
      if (temp > best) best = temp;
    }

    return { currentStreak, bestStreak: Math.max(best, currentStreak) };
  };

  const totalCompletionsToday = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const todayCompletionRate = habits.length > 0 ? Math.round((totalCompletionsToday / habits.length) * 100) : 0;

  // =========================================================================
  // 3. CHIT FUND & COMMITTEE CALCULATION
  // =========================================================================
  const chitResult = useMemo(() => {
    const baseInstallment = chitTotalMembers > 0 ? chitFundTotalValue / chitTotalMembers : 0;
    const foremanCommission = (chitFundTotalValue * foremanCommissionPercent) / 100;
    
    // Remaining auction discount distributed among all members
    const netDividendPool = Math.max(0, chitAuctionDiscount - foremanCommission);
    const dividendPerMember = chitTotalMembers > 0 ? netDividendPool / chitTotalMembers : 0;
    
    // Actual installment to be paid this month by non-prized members
    const effectiveInstallmentPaid = Math.max(0, baseInstallment - dividendPerMember);
    
    // Winning Bidder prize money received in hand
    const prizeMoneyInHand = chitFundTotalValue - chitAuctionDiscount;

    // Approximate borrowing cost / annualized interest rate of bidding
    const monthsRemaining = Math.max(1, chitTotalMembers);
    const effectiveDiscountPercent = (chitAuctionDiscount / chitFundTotalValue) * 100;

    return {
      baseInstallment: Math.round(baseInstallment),
      foremanCommission: Math.round(foremanCommission),
      netDividendPool: Math.round(netDividendPool),
      dividendPerMember: Math.round(dividendPerMember),
      effectiveInstallmentPaid: Math.round(effectiveInstallmentPaid),
      prizeMoneyInHand: Math.round(prizeMoneyInHand),
      effectiveDiscountPercent: effectiveDiscountPercent.toFixed(1),
    };
  }, [chitFundTotalValue, chitTotalMembers, chitAuctionDiscount, foremanCommissionPercent]);

  return (
    <div className="space-y-8">
      {/* =========================================================================
          1. OVERTIME & HOURLY SALARY WAGE CALCULATOR
      ========================================================================= */}
      {slug === 'overtime-salary-wage-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Overtime & Hourly Wage Calculator</h3>
                <p className="text-xs text-slate-400">Indian Factories Act Section 59 (2x Double Rate)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Monthly Gross / Basic Salary (₹)</label>
                <input
                  type="number"
                  value={monthlyGrossSalary}
                  onChange={(e) => setMonthlyGrossSalary(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Working Days in Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={workingDaysInMonth}
                    onChange={(e) => setWorkingDaysInMonth(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Daily Work Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={standardHoursPerDay}
                    onChange={(e) => setStandardHoursPerDay(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Total Overtime Hours Worked</label>
                <input
                  type="number"
                  min="0"
                  value={overtimeHoursWorked}
                  onChange={(e) => setOvertimeHoursWorked(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Overtime Rate Multiplier</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOvertimeRateMultiplier(2.0)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      overtimeRateMultiplier === 2.0
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    2.0x (Factories Act)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOvertimeRateMultiplier(1.5)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      overtimeRateMultiplier === 1.5
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    1.5x (Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOvertimeRateMultiplier(1.0)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      overtimeRateMultiplier === 1.0
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    1.0x (Flat Rate)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overtime Payout Breakdown</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {overtimeRateMultiplier}x Multiplier Applied
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Standard Hourly Rate</span>
                  <span className="text-xl font-bold font-mono text-white">{formatINR(overtimeResult.standardHourlyWage)}/hr</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Based on {overtimeResult.totalWorkingHours} hrs/mo</span>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Overtime Hourly Rate</span>
                  <span className="text-xl font-bold font-mono text-amber-400">{formatINR(overtimeResult.effectiveOvertimeHourlyWage)}/hr</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{overtimeRateMultiplier}x normal wage</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                <span className="text-xs font-medium text-emerald-300 block">Total Overtime Bonus Earned</span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">
                  +{formatINR(overtimeResult.totalOvertimeEarnings)}
                </div>
                <span className="text-xs text-slate-400 block">
                  For {overtimeHoursWorked} hours of overtime work (+{overtimeResult.percentageIncrease}% boost)
                </span>
              </div>

              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 text-xs text-slate-300 flex justify-between items-center">
                <span>Total Monthly Payout with Overtime:</span>
                <strong className="text-white text-base font-mono">{formatINR(overtimeResult.totalSalaryWithOvertime)}</strong>
              </div>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `Overtime Calculation:\nBase Salary: ${formatINR(monthlyGrossSalary)}\nStandard Rate: ${formatINR(overtimeResult.standardHourlyWage)}/hr\nOT Rate (${overtimeRateMultiplier}x): ${formatINR(overtimeResult.effectiveOvertimeHourlyWage)}/hr\nOT Hours: ${overtimeHoursWorked} hrs\nOT Earnings: ${formatINR(overtimeResult.totalOvertimeEarnings)}\nTotal Gross Salary: ${formatINR(overtimeResult.totalSalaryWithOvertime)}`,
                  'ot-summary'
                )
              }
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              {copiedId === 'ot-summary' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedId === 'ot-summary' ? 'Copied Calculation!' : 'Copy Overtime Summary'}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          2. HABIT STREAK & DAILY ROUTINE TRACKER (100% localStorage)
      ========================================================================= */}
      {slug === 'habit-streak-routine-tracker' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-3.5">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Today's Progress</span>
                <span className="text-xl font-bold text-white">{todayCompletionRate}% Completed</span>
                <span className="text-[11px] text-emerald-400 block">{totalCompletionsToday} of {habits.length} habits done</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-3.5">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Active Habits</span>
                <span className="text-xl font-bold text-white">{habits.length} Tracking</span>
                <span className="text-[11px] text-amber-400 block">100% Saved in Local Browser</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-3.5">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Privacy Guarantee</span>
                <span className="text-xl font-bold text-white">0% Server Tracking</span>
                <span className="text-[11px] text-purple-400 block">Offline & LocalStorage only</span>
              </div>
            </div>
          </div>

          {/* Add Habit Bar */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="text"
              placeholder="e.g. 20 min Meditation, 5km Run, Leetcode practice..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full"
            />
            <select
              value={newHabitCategory}
              onChange={(e) => setNewHabitCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white w-full sm:w-auto"
            >
              <option value="Productivity">Productivity</option>
              <option value="Health">Health & Diet</option>
              <option value="Fitness">Fitness & Gym</option>
              <option value="Career">Career & Coding</option>
              <option value="Personal">Mindfulness</option>
            </select>
            <button
              onClick={addHabit}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Habit
            </button>
          </div>

          {/* Habits Table / List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Your Daily Routine & Streaks</span>
              <span className="text-[11px] text-slate-400">Click checkboxes to mark habit completed for that day</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Habit Name</th>
                    <th className="py-3 px-3 text-center">Streak</th>
                    {past7Days.map((d) => (
                      <th key={d.dateStr} className="py-3 px-2 text-center">
                        <span className="block font-bold text-white">{d.dayLabel}</span>
                        <span className="text-[10px] text-slate-500">{d.shortDate}</span>
                      </th>
                    ))}
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {habits.map((h) => {
                    const { currentStreak } = calculateStreak(h.completedDates);
                    return (
                      <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-white block">{h.name}</span>
                          <span className="text-[10px] text-indigo-400">{h.category}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[11px]">
                            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {currentStreak}d
                          </span>
                        </td>
                        {past7Days.map((d) => {
                          const isDone = h.completedDates.includes(d.dateStr);
                          return (
                            <td key={d.dateStr} className="py-3 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => toggleHabitDate(h.id, d.dateStr)}
                                className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-sm scale-105'
                                    : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                                }`}
                              >
                                {isDone && <Check className="w-4 h-4" />}
                              </button>
                            </td>
                          );
                        })}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => removeHabit(h.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete Habit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {habits.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No habits added yet. Type a routine above to start your streak!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          3. CHIT FUND & COMMITTEE DIVIDEND CALCULATOR
      ========================================================================= */}
      {slug === 'chit-fund-committee-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Chit Fund & Committee Calculator</h3>
                <p className="text-xs text-slate-400">Auction Discount, Dividend Distribution & Yield</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Total Chit Fund Value (₹)</label>
                <input
                  type="number"
                  value={chitFundTotalValue}
                  onChange={(e) => setChitFundTotalValue(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Total Members / Months</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={chitTotalMembers}
                    onChange={(e) => setChitTotalMembers(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Foreman Commission (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={foremanCommissionPercent}
                    onChange={(e) => setForemanCommissionPercent(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Auction Bid Discount (₹): {formatINR(chitAuctionDiscount)}</span>
                  <span className="text-emerald-400 font-semibold">{chitResult.effectiveDiscountPercent}% of total</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={chitFundTotalValue * 0.4}
                  step="5000"
                  value={chitAuctionDiscount}
                  onChange={(e) => setChitAuctionDiscount(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg"
                />
              </div>

              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>Standard Monthly Installment:</span>
                  <span className="font-bold text-white">{formatINR(chitResult.baseInstallment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Foreman / Organizer Fee:</span>
                  <span className="font-semibold text-rose-400">{formatINR(chitResult.foremanCommission)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Distribution</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Chit Funds Act 1982
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-xs text-emerald-300 block mb-1">Dividend Per Member</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">+{formatINR(chitResult.dividendPerMember)}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Discount earned this month</span>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block mb-1">Effective Payment to Make</span>
                  <span className="text-2xl font-bold font-mono text-white">{formatINR(chitResult.effectiveInstallmentPaid)}</span>
                  <span className="text-[11px] text-emerald-400 block mt-0.5">Saved {formatINR(chitResult.dividendPerMember)}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Prize Money to Winning Bidder:</span>
                  <strong className="text-emerald-400 text-sm font-mono">{formatINR(chitResult.prizeMoneyInHand)}</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Total Net Dividend Pool Distributed:</span>
                  <strong className="text-white">{formatINR(chitResult.netDividendPool)}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                copyToClipboard(
                  `Chit Fund Committee Breakdown:\nChit Value: ${formatINR(chitFundTotalValue)}\nMembers: ${chitTotalMembers}\nAuction Discount: ${formatINR(chitAuctionDiscount)}\nPrize Money In Hand: ${formatINR(chitResult.prizeMoneyInHand)}\nDividend Per Member: ${formatINR(chitResult.dividendPerMember)}\nActual Installment to Pay: ${formatINR(chitResult.effectiveInstallmentPaid)}`,
                  'chit-quote'
                )
              }
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              {copiedId === 'chit-quote' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedId === 'chit-quote' ? 'Copied Calculation!' : 'Copy Chit Fund Breakdown'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
