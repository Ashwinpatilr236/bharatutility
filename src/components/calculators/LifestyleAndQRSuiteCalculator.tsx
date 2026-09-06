import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Moon, Droplets, Contact, Sparkles, Check, Copy, Clock, Bed, Flame, Utensils, QrCode } from 'lucide-react';

interface Props {
  tool: Tool;
}

export const LifestyleAndQRSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. SLEEP CYCLE STATE ---
  const [sleepMode, setSleepMode] = useState<'sleep-now' | 'wake-at'>('sleep-now');
  const [targetWakeTime, setTargetWakeTime] = useState<string>('06:30');

  // --- 2. CALORIE & WATER STATE ---
  const [userGender, setUserGender] = useState<'male' | 'female'>('male');
  const [userAge, setUserAge] = useState<number>(26);
  const [userWeightKg, setUserWeightKg] = useState<number>(70);
  const [userHeightCm, setUserHeightCm] = useState<number>(172);
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('light');

  // --- 3. VCARD QR GENERATOR STATE ---
  const [contactName, setContactName] = useState<string>('Ashwin Patil');
  const [contactPhone, setContactPhone] = useState<string>('+91 98765 43210');
  const [contactEmail, setContactEmail] = useState<string>('ashwin@example.com');
  const [contactOrg, setContactOrg] = useState<string>('ARRJS Technologies');
  const [contactCity, setContactCity] = useState<string>('Mumbai, Maharashtra');

  // ================= 1. SLEEP CYCLE CALCULATION =================
  const sleepResult = useMemo(() => {
    // 90-minute REM sleep cycles + 15 min avg time to fall asleep
    const cycles = [6, 5, 4, 3]; // 9h, 7.5h, 6h, 4.5h

    if (sleepMode === 'sleep-now') {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15); // +15 min fall asleep buffer

      const wakeTimes = cycles.map(c => {
        const time = new Date(now.getTime() + c * 90 * 60 * 1000);
        return {
          cycles: c,
          hours: (c * 1.5).toFixed(1),
          timeStr: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          isOptimal: c === 5 || c === 6,
        };
      });

      return { wakeTimes, mode: 'sleep-now' };
    } else {
      const [h, m] = targetWakeTime.split(':').map(Number);
      const wake = new Date();
      wake.setHours(h, m, 0, 0);

      const bedtimeList = cycles.map(c => {
        const bed = new Date(wake.getTime() - (c * 90 + 15) * 60 * 1000);
        return {
          cycles: c,
          hours: (c * 1.5).toFixed(1),
          timeStr: bed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          isOptimal: c === 5 || c === 6,
        };
      });

      return { wakeTimes: bedtimeList, mode: 'wake-at' };
    }
  }, [sleepMode, targetWakeTime]);

  // ================= 2. CALORIE & WATER CALCULATION =================
  const healthResult = useMemo(() => {
    // Mifflin-St Jeor BMR Equation
    let bmr = 10 * userWeightKg + 6.25 * userHeightCm - 5 * userAge;
    if (userGender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // TDEE Activity Multipliers
    let multiplier = 1.2;
    if (activityLevel === 'light') multiplier = 1.375;
    if (activityLevel === 'moderate') multiplier = 1.55;
    if (activityLevel === 'active') multiplier = 1.725;

    const tdee = Math.round(bmr * multiplier);
    const weightLossCalories = Math.round(tdee - 400);
    const weightGainCalories = Math.round(tdee + 400);

    // Water requirement (~35 ml per kg body weight in warm Indian climate)
    const dailyWaterLitres = ((userWeightKg * 35) / 1000).toFixed(1);
    const waterGlasses = Math.round((Number(dailyWaterLitres) * 1000) / 250); // 250ml glass

    return {
      bmr: Math.round(bmr),
      tdee,
      weightLossCalories,
      weightGainCalories,
      dailyWaterLitres,
      waterGlasses,
    };
  }, [userGender, userAge, userWeightKg, userHeightCm, activityLevel]);

  // ================= 3. VCARD STRING & QR =================
  const vcardString = useMemo(() => {
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nORG:${contactOrg}\nADR:;;${contactCity};;;;\nEND:VCARD`;
  }, [contactName, contactPhone, contactEmail, contactOrg, contactCity]);

  const qrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(vcardString)}&color=000000&bgcolor=ffffff`;
  }, [vcardString]);

  return (
    <div className="space-y-8">
      {/* ================= 1. SLEEP CYCLE CALCULATOR ================= */}
      {slug === 'sleep-cycle-alarm-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">90-Minute REM Sleep Cycles</h3>
                <p className="text-xs text-slate-400">Wake up refreshed between sleep cycles without grogginess</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSleepMode('sleep-now')}
                  className={`p-3 rounded-xl border text-left ${
                    sleepMode === 'sleep-now' ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-sm">I am going to sleep NOW</div>
                  <div className="text-[10px] text-slate-400">Find optimal wake times</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSleepMode('wake-at')}
                  className={`p-3 rounded-xl border text-left ${
                    sleepMode === 'wake-at' ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="text-sm">I need to wake up AT...</div>
                  <div className="text-[10px] text-slate-400">Find best bedtime</div>
                </button>
              </div>

              {sleepMode === 'wake-at' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Alarm Wake Up Time</label>
                  <input
                    type="time"
                    value={targetWakeTime}
                    onChange={(e) => setTargetWakeTime(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border-2 border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                {sleepMode === 'sleep-now' ? 'Suggested Alarm Times to Wake Up' : 'Suggested Bedtimes to Sleep'}
              </span>

              <div className="grid grid-cols-2 gap-3">
                {sleepResult.wakeTimes.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border ${
                      item.isOptimal ? 'bg-indigo-500/20 border-indigo-500/60 shadow-md' : 'bg-slate-950/80 border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] text-slate-400">{item.hours} Hours ({item.cycles} Cycles)</span>
                      {item.isOptimal && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">Recommended</span>}
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {item.timeStr}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. CALORIE & WATER CALCULATOR ================= */}
      {slug === 'daily-calorie-water-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dietary & Hydration Target</h3>
                <p className="text-xs text-slate-400">Calculate BMR, TDEE maintenance calories & water target</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Gender</label>
                <select
                  value={userGender}
                  onChange={(e) => setUserGender(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Age</label>
                <input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={userWeightKg}
                  onChange={(e) => setUserWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={userHeightCm}
                  onChange={(e) => setUserHeightCm(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              >
                <option value="sedentary">Sedentary (Desk job, little exercise)</option>
                <option value="light">Light Activity (1-3 days workout/week)</option>
                <option value="moderate">Moderate Activity (3-5 days workout/week)</option>
                <option value="active">High Activity (Daily heavy training/sports)</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-rose-950/40 border-2 border-rose-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
                Daily Calorie Maintenance (TDEE)
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {healthResult.tdee} <span className="text-xs text-slate-400 font-normal">kcal / day</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Fat Loss Deficit:</span>
                  <span className="font-bold text-emerald-400 mt-1 block">{healthResult.weightLossCalories} kcal</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Daily Water Intake:</span>
                  <span className="font-bold text-cyan-400 mt-1 block">{healthResult.dailyWaterLitres} Litres ({healthResult.waterGlasses} glasses)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. VCARD QR GENERATOR ================= */}
      {slug === 'vcard-qr-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Contact className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Digital Visiting Card (vCard)</h3>
                <p className="text-xs text-slate-400">Scan QR to save contact directly into smartphone address book</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Organization / Company</label>
                <input
                  type="text"
                  value={contactOrg}
                  onChange={(e) => setContactOrg(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">City / Location</label>
                <input
                  type="text"
                  value={contactCity}
                  onChange={(e) => setContactCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Scan with Smartphone to Save Contact
              </span>

              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <img
                  src={qrImageUrl}
                  alt={`vCard QR for ${contactName}`}
                  className="w-48 h-48 rounded-lg"
                  loading="lazy"
                />
              </div>

              <div className="text-xs text-slate-300">
                <strong className="text-white block text-sm">{contactName}</strong>
                <span className="text-slate-400">{contactPhone} | {contactOrg}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
