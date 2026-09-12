import React, { useState, useMemo } from 'react';
import { Sparkles, Heart, Copy, Check, Search, Moon, Sun, Filter } from 'lucide-react';

interface RashiInfo {
  id: string;
  name: string;
  english: string;
  syllables: string[];
  element: string;
}

const RASHIS: RashiInfo[] = [
  { id: 'mesh', name: 'Mesh (मेष)', english: 'Aries', syllables: ['A', 'L', 'E', 'I', 'O'], element: 'Fire' },
  { id: 'vrishabh', name: 'Vrishabh (वृषभ)', english: 'Taurus', syllables: ['B', 'V', 'U', 'W'], element: 'Earth' },
  { id: 'mithun', name: 'Mithun (मिथुन)', english: 'Gemini', syllables: ['K', 'CHH', 'GH', 'Q', 'C'], element: 'Air' },
  { id: 'kark', name: 'Kark (कर्क)', english: 'Cancer', syllables: ['DD', 'H'], element: 'Water' },
  { id: 'simha', name: 'Simha (सिंह)', english: 'Leo', syllables: ['M', 'TT'], element: 'Fire' },
  { id: 'kanya', name: 'Kanya (कन्या)', english: 'Virgo', syllables: ['P', 'TTH', 'NN'], element: 'Earth' },
  { id: 'tula', name: 'Tula (तुला)', english: 'Libra', syllables: ['R', 'T'], element: 'Air' },
  { id: 'vrishchik', name: 'Vrishchik (वृश्चिक)', english: 'Scorpio', syllables: ['N', 'Y'], element: 'Water' },
  { id: 'dhanu', name: 'Dhanu (धनु)', english: 'Sagittarius', syllables: ['BH', 'DH', 'F', 'PHA'], element: 'Fire' },
  { id: 'makar', name: 'Makar (मकर)', english: 'Capricorn', syllables: ['KH', 'J'], element: 'Earth' },
  { id: 'kumbh', name: 'Kumbh (कुंभ)', english: 'Aquarius', syllables: ['G', 'S', 'SH'], element: 'Air' },
  { id: 'meen', name: 'Meen (मीन)', english: 'Pisces', syllables: ['D', 'CH', 'Z', 'TH'], element: 'Water' },
];

interface BabyName {
  name: string;
  gender: 'boy' | 'girl' | 'unisex';
  meaning: string;
  rashi: string;
  startingLetter: string;
  numerology: number;
}

const CURATED_NAMES: BabyName[] = [
  { name: 'Aarav', gender: 'boy', meaning: 'Peaceful, calm sound, wisdom', rashi: 'mesh', startingLetter: 'A', numerology: 1 },
  { name: 'Ananya', gender: 'girl', meaning: 'Unique, matchless, Goddess Parvati', rashi: 'mesh', startingLetter: 'A', numerology: 7 },
  { name: 'Advik', gender: 'boy', meaning: 'Unique, unparalleled', rashi: 'mesh', startingLetter: 'A', numerology: 9 },
  { name: 'Vihaan', gender: 'boy', meaning: 'Dawn, morning, beginning of a new era', rashi: 'vrishabh', startingLetter: 'V', numerology: 3 },
  { name: 'Vanya', gender: 'girl', meaning: 'Gracious gift of God', rashi: 'vrishabh', startingLetter: 'V', numerology: 5 },
  { name: 'Kabir', gender: 'boy', meaning: 'Great, famous saint poet', rashi: 'mithun', startingLetter: 'K', numerology: 6 },
  { name: 'Kiara', gender: 'girl', meaning: 'Bright, clear, light', rashi: 'mithun', startingLetter: 'K', numerology: 8 },
  { name: 'Hridaan', gender: 'boy', meaning: 'Heart of gold, gift of heart', rashi: 'kark', startingLetter: 'H', numerology: 4 },
  { name: 'Hitakshi', gender: 'girl', meaning: 'Warm-hearted, one who possesses well-wishing eyes', rashi: 'kark', startingLetter: 'H', numerology: 2 },
  { name: 'Manan', gender: 'boy', meaning: 'Deep contemplation, intellect', rashi: 'simha', startingLetter: 'M', numerology: 1 },
  { name: 'Miraaya', gender: 'girl', meaning: 'Devotee of Lord Krishna, prosperous', rashi: 'simha', startingLetter: 'M', numerology: 6 },
  { name: 'Pranav', gender: 'boy', meaning: 'Sacred syllable Om', rashi: 'kanya', startingLetter: 'P', numerology: 7 },
  { name: 'Pari', gender: 'girl', meaning: 'Fairy, angel of beauty', rashi: 'kanya', startingLetter: 'P', numerology: 3 },
  { name: 'Reyansh', gender: 'boy', meaning: 'Ray of sunlight, Lord Vishnu', rashi: 'tula', startingLetter: 'R', numerology: 8 },
  { name: 'Riya', gender: 'girl', meaning: 'Graceful singer, one who dances with rhythm', rashi: 'tula', startingLetter: 'R', numerology: 9 },
  { name: 'Yuvaan', gender: 'boy', meaning: 'Youthful strength, Lord Shiva', rashi: 'vrishchik', startingLetter: 'Y', numerology: 5 },
  { name: 'Navya', gender: 'girl', meaning: 'Fresh, modern, worthy of praise', rashi: 'vrishchik', startingLetter: 'N', numerology: 2 },
  { name: 'Bhavin', gender: 'boy', meaning: 'Living, existing, blessing', rashi: 'dhanu', startingLetter: 'BH', numerology: 4 },
  { name: 'Dhriti', gender: 'girl', meaning: 'Patience, courage, moral steadfastness', rashi: 'dhanu', startingLetter: 'DH', numerology: 1 },
  { name: 'Kiaan', gender: 'boy', meaning: 'Grace of God, royal ancient king', rashi: 'makar', startingLetter: 'KH', numerology: 3 },
  { name: 'Jhanvi', gender: 'girl', meaning: 'Daughter of sage Jahnu, River Ganga', rashi: 'makar', startingLetter: 'J', numerology: 7 },
  { name: 'Shaurya', gender: 'boy', meaning: 'Valour, bravery, heroism', rashi: 'kumbh', startingLetter: 'SH', numerology: 9 },
  { name: 'Saanvi', gender: 'girl', meaning: 'Goddess Lakshmi, follower of truth', rashi: 'kumbh', startingLetter: 'S', numerology: 6 },
  { name: 'Devansh', gender: 'boy', meaning: 'Part of God, divine incarnation', rashi: 'meen', startingLetter: 'D', numerology: 5 },
  { name: 'Dia', gender: 'girl', meaning: 'Light, divine lamp', rashi: 'meen', startingLetter: 'D', numerology: 3 },
];

export const IndianBabyNamesRashi: React.FC = () => {
  const [selectedRashi, setSelectedRashi] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'boy' | 'girl'>('all');
  const [searchLetter, setSearchLetter] = useState<string>('');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const filteredNames = useMemo(() => {
    return CURATED_NAMES.filter((item) => {
      const matchRashi = selectedRashi === 'all' || item.rashi === selectedRashi;
      const matchGender = selectedGender === 'all' || item.gender === selectedGender || item.gender === 'unisex';
      const matchLetter =
        !searchLetter ||
        item.name.toLowerCase().includes(searchLetter.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchLetter.toLowerCase());
      return matchRashi && matchGender && matchLetter;
    });
  }, [selectedRashi, selectedGender, searchLetter]);

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pink-900 via-slate-900 to-purple-950 text-white p-6 rounded-3xl border border-pink-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-500/20 text-pink-300 rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Indian Baby Names by Rashi, Nakshatra & Numerology
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              12 Vedic Rashis, Auspicious Starting Syllables (Shubh Akshar), Sanskrit Origins & Numerology Life Path Numbers
            </p>
          </div>
        </div>
      </div>

      {/* Rashi Filter Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Filter by Zodiac Rashi (राशि)
          </span>
          <button
            onClick={() => setSelectedRashi('all')}
            className={`text-xs px-3 py-1 rounded-full font-semibold ${
              selectedRashi === 'all' ? 'bg-pink-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All 12 Rashis
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {RASHIS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRashi(r.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all ${
                selectedRashi === r.id
                  ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-500 font-bold'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white">{r.name}</div>
              <div className="text-[10px] text-pink-600 dark:text-pink-400 font-mono mt-0.5">
                {r.syllables.join(', ')}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gender & Search Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1 shrink-0">
          {(['all', 'boy', 'girl'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGender(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedGender === g
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {g === 'all' ? 'All' : g === 'boy' ? 'Baby Boy 👦' : 'Baby Girl 👧'}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or Sanskrit meaning..."
            value={searchLetter}
            onChange={(e) => setSearchLetter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Names Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNames.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-pink-300 dark:hover:border-pink-800 transition-all"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.name}</h3>
                  <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                    {item.gender === 'boy' ? '👦 Baby Boy' : item.gender === 'girl' ? '👧 Baby Girl' : '✨ Unisex'}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(item.name)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-pink-600 transition-all"
                  title="Copy Name"
                >
                  {copiedName === item.name ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                {item.meaning}
              </p>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <span>Letter: <strong className="text-slate-700 dark:text-slate-300">{item.startingLetter}</strong></span>
              <span>Numerology: <strong className="text-pink-600 dark:text-pink-400">#{item.numerology}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
