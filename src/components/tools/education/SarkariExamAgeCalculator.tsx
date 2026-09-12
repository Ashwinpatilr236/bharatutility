import React, { useState, useMemo } from 'react';
import { GraduationCap, CheckCircle2, XCircle, AlertCircle, Calendar, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';

interface ExamRule {
  id: string;
  name: string;
  conductingBody: string;
  minAge: number;
  maxAgeGen: number;
  cutoffMonthDay: string; // "08-01" -> 1st Aug
  attemptsGen: number | string;
  attemptsObc: number | string;
  attemptsScSt: number | string;
  description: string;
}

const EXAMS_DATABASE: ExamRule[] = [
  {
    id: 'upsc_cse',
    name: 'UPSC Civil Services (IAS / IPS / IFS)',
    conductingBody: 'UPSC',
    minAge: 21,
    maxAgeGen: 32,
    cutoffMonthDay: '08-01',
    attemptsGen: 6,
    attemptsObc: 9,
    attemptsScSt: 'Unlimited',
    description: 'Premier central civil services examination for administrative posts.',
  },
  {
    id: 'ssc_cgl',
    name: 'SSC Combined Graduate Level (CGL)',
    conductingBody: 'Staff Selection Commission',
    minAge: 18,
    maxAgeGen: 30, // Some posts 32
    cutoffMonthDay: '08-01',
    attemptsGen: 'Unlimited',
    attemptsObc: 'Unlimited',
    attemptsScSt: 'Unlimited',
    description: 'Group B & C officer posts across central ministries and departments.',
  },
  {
    id: 'ibps_po',
    name: 'IBPS / SBI Bank Probationary Officer (PO)',
    conductingBody: 'IBPS / SBI',
    minAge: 20,
    maxAgeGen: 30,
    cutoffMonthDay: '04-01',
    attemptsGen: 4,
    attemptsObc: 7,
    attemptsScSt: 'Unlimited',
    description: 'Scale-I Officer posts across all Indian Public Sector Banks.',
  },
  {
    id: 'rrb_ntpc',
    name: 'Railway RRB NTPC (Graduate Posts)',
    conductingBody: 'Railway Recruitment Boards',
    minAge: 18,
    maxAgeGen: 33,
    cutoffMonthDay: '07-01',
    attemptsGen: 'Unlimited',
    attemptsObc: 'Unlimited',
    attemptsScSt: 'Unlimited',
    description: 'Station Master, Goods Train Manager, Senior Clerk across Indian Railways.',
  },
  {
    id: 'nda',
    name: 'NDA & NA (National Defence Academy)',
    conductingBody: 'UPSC / Armed Forces',
    minAge: 16.5,
    maxAgeGen: 19.5,
    cutoffMonthDay: '07-01',
    attemptsGen: 'Age Bound',
    attemptsObc: 'Age Bound',
    attemptsScSt: 'Age Bound',
    description: 'Entry for Army, Navy, and Air Force officer training after Class 12.',
  },
  {
    id: 'cds',
    name: 'CDS (Combined Defence Services)',
    conductingBody: 'UPSC / Armed Forces',
    minAge: 19,
    maxAgeGen: 24,
    cutoffMonthDay: '07-01',
    attemptsGen: 'Age Bound',
    attemptsObc: 'Age Bound',
    attemptsScSt: 'Age Bound',
    description: 'Graduate entry for Indian Military Academy, Naval Academy & Air Force.',
  },
];

type ReservationCategory = 'UR' | 'EWS' | 'OBC' | 'SC_ST' | 'PWD_GEN' | 'PWD_OBC' | 'PWD_SC_ST' | 'EX_SERVICEMAN';

export const SarkariExamAgeCalculator: React.FC = () => {
  const [selectedExamId, setSelectedExamId] = useState<string>('upsc_cse');
  const [dob, setDob] = useState<string>('2000-05-15');
  const [category, setCategory] = useState<ReservationCategory>('UR');
  const [targetYear, setTargetYear] = useState<number>(2026);

  const selectedExam = EXAMS_DATABASE.find((e) => e.id === selectedExamId) || EXAMS_DATABASE[0];

  // Category relaxation in years
  const ageRelaxationYears = useMemo(() => {
    switch (category) {
      case 'OBC':
        return 3;
      case 'SC_ST':
        return 5;
      case 'PWD_GEN':
        return 10;
      case 'PWD_OBC':
        return 13;
      case 'PWD_SC_ST':
        return 15;
      case 'EX_SERVICEMAN':
        return 5;
      default:
        return 0; // UR / EWS
    }
  }, [category]);

  // Exact Age as on Cut-off Date
  const evaluation = useMemo(() => {
    if (!dob) return null;

    const [cutMonth, cutDay] = selectedExam.cutoffMonthDay.split('-').map(Number);
    const cutoffDate = new Date(targetYear, cutMonth - 1, cutDay);
    const birthDate = new Date(dob);

    if (isNaN(birthDate.getTime())) return null;

    let years = cutoffDate.getFullYear() - birthDate.getFullYear();
    let months = cutoffDate.getMonth() - birthDate.getMonth();
    let days = cutoffDate.getDate() - birthDate.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonthLastDay = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), 0).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const exactAgeDecimal = years + months / 12 + days / 365.25;
    const effectiveMaxAge = selectedExam.maxAgeGen + ageRelaxationYears;
    const isUnderAge = exactAgeDecimal < selectedExam.minAge;
    const isOverAge = exactAgeDecimal > effectiveMaxAge;
    const isEligible = !isUnderAge && !isOverAge;

    let attemptsAllowed = selectedExam.attemptsGen;
    if (category === 'OBC' || category === 'PWD_OBC') attemptsAllowed = selectedExam.attemptsObc;
    if (category === 'SC_ST' || category === 'PWD_SC_ST') attemptsAllowed = selectedExam.attemptsScSt;

    return {
      years,
      months,
      days,
      exactAgeDecimal,
      effectiveMaxAge,
      cutoffDateStr: cutoffDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      isUnderAge,
      isOverAge,
      isEligible,
      attemptsAllowed,
      yearsRemaining: effectiveMaxAge - exactAgeDecimal,
    };
  }, [dob, selectedExam, ageRelaxationYears, targetYear, category]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Header Grid */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-purple-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Sarkari Exam & Govt Job Age Eligibility Analyzer
              <span className="text-xs px-2.5 py-0.5 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-full font-semibold">
                2026-2027 Cut-offs
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Instant Cut-off Date Age Verification, Category Age Relaxations & Attempt Counter
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            Candidate & Examination Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Competitive Examination
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
            >
              {EXAMS_DATABASE.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.conductingBody})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date of Birth (As per 10th Certificate)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Exam Year
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
              >
                <option value={2026}>2026 Recruitment Cycle</option>
                <option value={2027}>2027 Recruitment Cycle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reservation Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'UR', label: 'General (UR)', desc: 'No Relaxation' },
                { id: 'EWS', label: 'EWS', desc: 'No Age Relax.' },
                { id: 'OBC', label: 'OBC (NCL)', desc: '+3 Years' },
                { id: 'SC_ST', label: 'SC / ST', desc: '+5 Years' },
                { id: 'PWD_GEN', label: 'PwD (Gen)', desc: '+10 Years' },
                { id: 'PWD_OBC', label: 'PwD (OBC)', desc: '+13 Years' },
                { id: 'PWD_SC_ST', label: 'PwD (SC/ST)', desc: '+15 Years' },
                { id: 'EX_SERVICEMAN', label: 'Ex-Servicemen', desc: '+5 Years' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as ReservationCategory)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    category === cat.id
                      ? 'bg-purple-600 text-white font-bold border-purple-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs">{cat.label}</div>
                  <div className={`text-[10px] ${category === cat.id ? 'text-purple-200' : 'text-slate-400'}`}>
                    {cat.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Eligibility Card */}
        {evaluation && (
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Eligibility Verdict
              </span>
              {evaluation.isEligible ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Eligible
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                  <XCircle className="w-4 h-4" /> Not Eligible
                </span>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-400">Exact Age as of {evaluation.cutoffDateStr}</div>
              <div className="text-3xl font-black text-white mt-1">
                {evaluation.years} <span className="text-lg font-normal text-slate-400">Years</span> {evaluation.months}{' '}
                <span className="text-lg font-normal text-slate-400">Months</span> {evaluation.days}{' '}
                <span className="text-lg font-normal text-slate-400">Days</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Prescribed Age Limit:</span>
                <span className="font-semibold text-white">
                  {selectedExam.minAge} to {evaluation.effectiveMaxAge} Years
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Category Age Relaxation:</span>
                <span className="font-semibold text-purple-300">+{ageRelaxationYears} Years</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Attempts Permitted:</span>
                <span className="font-semibold text-emerald-400">{evaluation.attemptsAllowed}</span>
              </div>

              {evaluation.isEligible && (
                <div className="flex justify-between text-slate-300">
                  <span>Remaining Window:</span>
                  <span className="font-semibold text-amber-300">
                    ~{Math.max(0, Math.floor(evaluation.yearsRemaining))} Years Left
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Official Verification Note:
              </div>
              <p>
                Cut-off calculations follow official DoPT rules. Always cross-verify with the official notification released by {selectedExam.conductingBody}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
