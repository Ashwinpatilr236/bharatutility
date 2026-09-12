import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun, Moon, Clock, MapPin, Calendar, Sparkles, AlertTriangle, 
  CheckCircle2, Info, Share2, Copy, Check, Compass, ShieldAlert, Zap
} from 'lucide-react';
import { 
  INDIAN_CITIES, calculateChoghadiya, ChoghadiyaResult, ChoghadiyaSlot 
} from '../../services/choghadiyaService';

interface ChoghadiyaSuiteCalculatorProps {
  onResultChange?: (result: string) => void;
}

export const ChoghadiyaSuiteCalculator: React.FC<ChoghadiyaSuiteCalculatorProps> = ({ onResultChange }) => {
  const [selectedCity, setSelectedCity] = useState<string>('delhi');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'day' | 'night'>('day');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [copied, setCopied] = useState<boolean>(false);

  // Update live clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const data: ChoghadiyaResult = useMemo(() => {
    const target = new Date(selectedDate + 'T12:00:00');
    return calculateChoghadiya(selectedCity, target, currentTime);
  }, [selectedCity, selectedDate, currentTime]);

  useEffect(() => {
    if (onResultChange && data.currentSlot) {
      onResultChange(`${data.cityName}: Current Choghadiya is ${data.currentSlot.name} (${data.currentSlot.hindi}) - ${data.currentSlot.quality}`);
    }
  }, [data, onResultChange]);

  const handleCopySummary = () => {
    const text = `🕉️ Today's Choghadiya & Muhurat (${data.cityName})\n` +
      `📅 Date: ${data.dateStr} (${data.dayOfWeekHindi})\n` +
      `🌅 Sunrise: ${data.sunrise} | 🌇 Sunset: ${data.sunset}\n` +
      (data.currentSlot ? `⚡ Current Choghadiya: ${data.currentSlot.name} (${data.currentSlot.hindi}) [${data.currentSlot.startTimeStr} - ${data.currentSlot.endTimeStr}]\n` : '') +
      `✨ Abhijit Muhurat: ${data.abhijitMuhurat}\n` +
      `⚠️ Rahu Kaal: ${data.rahuKaal}\n\n` +
      `Check live timings at BharatUtility: https://bharatutility.tech/tools/choghadiya-calculator`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSlotBadgeStyle = (slot: ChoghadiyaSlot) => {
    switch (slot.type) {
      case 'amrit':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'shubh':
        return 'bg-green-500/15 text-green-300 border-green-500/30';
      case 'labh':
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
      case 'char':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'rog':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'kaal':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'udveg':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar: City & Date Selector */}
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* City Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Select Indian City / स्थान
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none transition-all cursor-pointer"
            >
              {Object.entries(INDIAN_CITIES).map(([key, city]) => (
                <option key={key} value={key}>
                  {city.name} ({city.hindi_name}) - {city.state}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Select Date / तिथि
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Share & Today Button */}
          <div className="flex items-end gap-2 pt-1 md:pt-0">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Today (आज)
            </button>
            <button
              onClick={handleCopySummary}
              className="flex-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
          </div>
        </div>
      </div>

      {/* Sun & Moon Coordinates Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sunrise / सूर्योदय</div>
            <div className="text-sm font-bold text-white font-mono">{data.sunrise}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sunset / सूर्यास्त</div>
            <div className="text-sm font-bold text-white font-mono">{data.sunset}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Abhijit Muhurat</div>
            <div className="text-xs font-bold text-emerald-300 font-mono">{data.abhijitMuhurat}</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Rahu Kaal / राहुकाल</div>
            <div className="text-xs font-bold text-rose-300 font-mono">{data.rahuKaal}</div>
          </div>
        </div>
      </div>

      {/* Live Current Slot Banner (if Today) */}
      {data.currentSlot && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/40 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-amber-400 rounded-full animate-ping absolute inset-0 m-auto" />
                <div className="w-3 h-3 bg-amber-400 rounded-full relative" />
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-300/90 tracking-wide flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  CURRENT ACTIVE CHOGHADIYA ({data.cityName})
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                  <span>{data.currentSlot.name} ({data.currentSlot.hindi})</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getSlotBadgeStyle(data.currentSlot)}`}>
                    {data.currentSlot.quality}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Slot Duration</div>
              <div className="text-sm font-mono font-bold text-amber-200">
                {data.currentSlot.startTimeStr} - {data.currentSlot.endTimeStr}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300/90 mt-3 pt-2.5 border-t border-amber-500/20">
            {data.currentSlot.description}
          </p>
        </div>
      )}

      {/* Day / Night Tabs */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('day')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'day'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Day Choghadiya (दिन का चौघड़िया)
            </button>
            <button
              onClick={() => setActiveTab('night')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'night'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Night Choghadiya (रात्रि का चौघड़िया)
            </button>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs text-slate-400">Total Duration: </span>
            <span className="text-xs font-bold text-white font-mono">
              {activeTab === 'day' ? data.dayLength : data.nightLength}
            </span>
          </div>
        </div>

        {/* Choghadiya Grid / Table */}
        <div className="space-y-2.5">
          {(activeTab === 'day' ? data.dayChoghadiya : data.nightChoghadiya).map((slot) => {
            const isGood = slot.nature === 'shubh';
            const isBad = slot.nature === 'ashubh';
            return (
              <div
                key={slot.index}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  slot.isCurrent
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5'
                    : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-750/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-400 shrink-0">
                    {slot.index}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{slot.name} ({slot.hindi})</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${getSlotBadgeStyle(slot)}`}>
                        {slot.quality}
                      </span>
                      {slot.isCurrent && (
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                          LIVE NOW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{slot.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-200 block">
                      {slot.startTimeStr} - {slot.endTimeStr}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
                      isGood ? 'text-emerald-400' : isBad ? 'text-rose-400' : 'text-sky-400'
                    }`}>
                      {isGood ? '✓ Auspicious (शुभ)' : isBad ? '✕ Inauspicious (अशुभ)' : '○ Neutral (मध्यम)'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Shubh Muhurat Matrix */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Auspicious & Inauspicious Timings for {data.dateStr}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Abhijit Muhurat (अभिजित मुहूर्त)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{data.abhijitMuhurat}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Best mid-day window to initiate all tasks and travels.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Brahma Muhurta (ब्रह्म मुहूर्त)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{data.brahmaMuhurta}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Supreme pre-dawn window for Yoga, Meditation & Studies.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">Godhuli Muhurat (गोधूलि मुहूर्त)</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{data.godhuliMuhurat}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Sunset auspicious window for evening Aarti and temple prayers.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300">Yamaganda Kaal (यमगण्ड काल)</span>
              <span className="text-xs font-mono font-bold text-rose-400">{data.yamaganda}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Avoid signing contracts or major financial transactions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
