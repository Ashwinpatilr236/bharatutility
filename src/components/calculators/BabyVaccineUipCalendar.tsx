import React from 'react';
import { Tool } from '../../types';
import { Baby, Calendar, Info, HeartPulse } from 'lucide-react';

interface Props {
  tool?: Tool;
  onResultChange?: (result: string) => void;
}

const VACCINE_SCHEDULE = [
  { ageLabel: 'At Birth (0 Days)', vaccines: 'BCG, OPV 0 Dose, Hepatitis B (Birth Dose)', notes: 'Given within 24 hours of birth at hospital' },
  { ageLabel: '6 Weeks (1.5 Months)', vaccines: 'Pentavalent 1, Rotavirus 1, OPV 1, fIPV 1, PCV 1', notes: 'Protects against Diphtheria, Tetanus, Polio, Diarrhea, Pneumonia' },
  { ageLabel: '10 Weeks (2.5 Months)', vaccines: 'Pentavalent 2, Rotavirus 2, OPV 2', notes: 'Second primary immunisation dose' },
  { ageLabel: '14 Weeks (3.5 Months)', vaccines: 'Pentavalent 3, Rotavirus 3, OPV 3, fIPV 2, PCV 2', notes: 'Third primary immunisation dose' },
  { ageLabel: '9 to 12 Months', vaccines: 'MR 1st Dose (Measles Rubella), JE 1, PCV Booster, Vitamin A (1st Dose)', notes: 'Major milestone for measles and brain fever protection' },
  { ageLabel: '16 to 24 Months', vaccines: 'MR 2nd Dose, DPT 1st Booster, OPV Booster, JE 2', notes: 'Toddler booster protection' },
  { ageLabel: '5 to 6 Years', vaccines: 'DPT 2nd Booster', notes: 'School entry immunization' },
  { ageLabel: '10 & 16 Years', vaccines: 'Td Vaccine (Tetanus & adult Diphtheria)', notes: 'Adolescent tetanus protection' },
];

export const BabyVaccineUipCalendar: React.FC<Props> = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-4">
          <HeartPulse className="w-3.5 h-3.5" />
          <span>Ministry of Health (U-WIN & UIP Universal Immunization)</span>
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
          <Baby className="w-6 h-6 text-rose-500" />
          Indian Baby Vaccination Schedule
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          Official Universal Immunization Programme (UIP) India calendar with exact milestone dates for BCG, Pentavalent, Polio, MR, and Boosters. Available free at all Government Hospitals.
        </p>
      </div>

      <div className="space-y-4">
        {VACCINE_SCHEDULE.map((v, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex-1 pl-2">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  {v.ageLabel}
                </span>
              </div>
              <h4 className="text-base font-black text-neutral-900 dark:text-white mt-1">
                {v.vaccines}
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 opacity-70" />
                {v.notes}
              </p>
            </div>
            
            <div className="md:text-right shrink-0">
              <span className="inline-flex px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                Govt Hospital Free
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-xs text-amber-800 dark:text-amber-400/80">
        <strong className="font-bold">Important Note:</strong> Always consult with your pediatrician. This is the standard UIP schedule; private clinics may recommend additional vaccines (like Typhoid, Chickenpox, Hepatitis A) which are optional under the national program but beneficial.
      </div>
    </div>
  );
};
