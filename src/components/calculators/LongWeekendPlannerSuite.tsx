import React, { useState } from 'react';
import { Calendar, Palmtree, Sparkles, Compass, CheckCircle2, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  day: string;
  type: 'Gazetted' | 'Restricted' | 'Observance';
  category: 'National' | 'Festival' | 'State';
}

interface LongWeekend {
  title: string;
  holidayName: string;
  spanDates: string;
  totalDays: number;
  leaveNeeded: string;
  bestFor: string;
}

const HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-26', name: 'Republic Day', day: 'Monday', type: 'Gazetted', category: 'National' },
  { date: '2026-02-15', name: 'Maha Shivratri', day: 'Sunday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-03-04', name: 'Holi', day: 'Wednesday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-03-20', name: 'Eid-ul-Fitr (Ramzan Eid)', day: 'Friday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-04-03', name: 'Good Friday', day: 'Friday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-04-14', name: 'Dr. B.R. Ambedkar Jayanti / Baisakhi', day: 'Tuesday', type: 'Gazetted', category: 'National' },
  { date: '2026-05-01', name: 'Maharashtra Day / May Day', day: 'Friday', type: 'Restricted', category: 'State' },
  { date: '2026-05-31', name: 'Buddha Purnima', day: 'Sunday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-05-27', name: 'Bakrid / Eid al-Adha', day: 'Wednesday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-08-15', name: 'Independence Day', day: 'Saturday', type: 'Gazetted', category: 'National' },
  { date: '2026-08-28', name: 'Raksha Bandhan', day: 'Friday', type: 'Restricted', category: 'Festival' },
  { date: '2026-09-04', name: 'Janmashtami', day: 'Friday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-09-14', name: 'Ganesh Chaturthi', day: 'Monday', type: 'Restricted', category: 'Festival' },
  { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', day: 'Friday', type: 'Gazetted', category: 'National' },
  { date: '2026-10-20', name: 'Dussehra (Vijayadashami)', day: 'Tuesday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-11-08', name: 'Diwali (Deepavali)', day: 'Sunday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-11-24', name: 'Guru Nanak Jayanti', day: 'Tuesday', type: 'Gazetted', category: 'Festival' },
  { date: '2026-12-25', name: 'Christmas Day', day: 'Friday', type: 'Gazetted', category: 'Festival' },
];

const LONG_WEEKENDS_2026: LongWeekend[] = [
  {
    title: 'Republic Day Long Weekend',
    holidayName: 'Republic Day (Monday, 26 Jan)',
    spanDates: '24 Jan (Sat) - 26 Jan (Mon)',
    totalDays: 3,
    leaveNeeded: 'Zero leave required! Pure 3-day weekend.',
    bestFor: 'Jaipur, Udaipur, Rann of Kutch trip'
  },
  {
    title: 'Eid-ul-Fitr Long Weekend',
    holidayName: 'Eid-ul-Fitr (Friday, 20 Mar)',
    spanDates: '20 Mar (Fri) - 22 Mar (Sun)',
    totalDays: 3,
    leaveNeeded: 'Zero leave required! Pure 3-day weekend.',
    bestFor: 'Rishikesh, Gokarna, Munnar spring trip'
  },
  {
    title: 'Good Friday Long Weekend',
    holidayName: 'Good Friday (Friday, 3 Apr)',
    spanDates: '3 Apr (Fri) - 5 Apr (Sun)',
    totalDays: 3,
    leaveNeeded: 'Zero leave required! Pure 3-day weekend.',
    bestFor: 'Ooty, Coorg, Goa weekend getaway'
  },
  {
    title: 'Ambedkar Jayanti 4-Day Mega Weekend',
    holidayName: 'Ambedkar Jayanti (Tuesday, 14 Apr)',
    spanDates: '11 Apr (Sat) - 14 Apr (Tue)',
    totalDays: 4,
    leaveNeeded: 'Take 1 day leave on 13 Apr (Monday)',
    bestFor: 'Manali, Darjeeling, Andaman vacation'
  },
  {
    title: 'Janmashtami Long Weekend',
    holidayName: 'Janmashtami (Friday, 4 Sep)',
    spanDates: '4 Sep (Fri) - 6 Sep (Sun)',
    totalDays: 3,
    leaveNeeded: 'Zero leave required!',
    bestFor: 'Mathura, Vrindavan, Lonavala monsoon trek'
  },
  {
    title: 'Gandhi Jayanti Long Weekend',
    holidayName: 'Gandhi Jayanti (Friday, 2 Oct)',
    spanDates: '2 Oct (Fri) - 4 Oct (Sun)',
    totalDays: 3,
    leaveNeeded: 'Zero leave required!',
    bestFor: 'Shimla, Meghalaya, Pondicherry trip'
  },
  {
    title: 'Christmas Long Weekend',
    holidayName: 'Christmas (Friday, 25 Dec)',
    spanDates: '25 Dec (Fri) - 27 Dec (Sun)',
    totalDays: 3,
    leaveNeeded: 'Zero leave required!',
    bestFor: 'Goa, Kerala backwaters, Manali snowfall'
  },
];

export const LongWeekendPlannerSuite: React.FC = () => {
  const { navigateToTool } = useApp();
  const [filter, setFilter] = useState<'all' | 'Gazetted' | 'National' | 'Festival'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHolidays = HOLIDAYS_2026.filter(h => {
    const matchesFilter = filter === 'all' ? true : filter === 'Gazetted' ? h.type === 'Gazetted' : h.category === filter;
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.day.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
              <Palmtree className="w-3.5 h-3.5" />
              <span>Smart Leave & Vacation Optimization</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white font-display">
              Indian Public Holidays & Smart Long Weekend Planner (2026-2027)
            </h2>
          </div>

          <span className="text-xs text-accent font-bold px-3.5 py-1.5 bg-accent-subtle rounded-xl self-start sm:self-auto">
            7 Long Weekends in 2026
          </span>
        </div>

        {/* Highlighted Smart Long Weekends Showcase */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curated Long Weekends in 2026 (Plan Trips Early!)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LONG_WEEKENDS_2026.map((lw, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-neutral-800/80 dark:via-neutral-900 dark:to-neutral-800/80 border border-indigo-200/70 dark:border-neutral-700/80 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent text-white">
                      {lw.totalDays} Days Trip
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {lw.spanDates.split('-')[0]}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {lw.title}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                    📅 {lw.spanDates}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    💡 {lw.leaveNeeded}
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    ✈️ Ideal: {lw.bestFor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['all', 'Gazetted', 'National', 'Festival'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                {f === 'all' ? 'All Holidays (18)' : f}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search holiday name, month, day..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:border-accent"
          />
        </div>

        {/* Holidays Table */}
        <div className="rounded-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-700 text-neutral-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Day</th>
                  <th className="p-3.5">Holiday Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredHolidays.map((h, i) => (
                  <tr key={i} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-neutral-900 dark:text-white">
                      {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-3.5 font-medium text-neutral-600 dark:text-neutral-300">
                      {h.day}
                    </td>
                    <td className="p-3.5 font-bold text-neutral-900 dark:text-white">
                      {h.name}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        h.type === 'Gazetted' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                      }`}>
                        {h.type}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-500 capitalize">
                      {h.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
