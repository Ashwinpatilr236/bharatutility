import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Keyboard, Clock, Award, RotateCcw, CheckCircle2, AlertTriangle, 
  Sparkles, Copy, Check, BarChart2, ShieldCheck, Zap, Volume2, VolumeX
} from 'lucide-react';

interface SpeedTypingSuiteCalculatorProps {
  onResultChange?: (result: string) => void;
}

const ENGLISH_PASSAGES = [
  {
    title: 'SSC CGL / CHSL Official Pattern',
    text: 'India is a vast country with a rich cultural heritage and diversity. Economic reforms and digital governance have empowered citizens across urban and rural sectors. The government initiatives in skill development, transportation, renewable energy, and education continue to drive nationwide progress. Efficient public administration requires dedication, transparency, and timely execution of citizen services.'
  },
  {
    title: 'High Court & District Court Clerk Passage',
    text: 'The Constitution of India is the supreme legal document that establishes the fundamental rights, directive principles, and duties of citizens. The judiciary ensures justice, liberty, equality, and fraternity for all individuals without discrimination. Legal documents must be drafted with precision, clarity, and strict adherence to statutory guidelines and established precedents.'
  },
  {
    title: 'Banking & Financial Awareness (IBPS / SBI)',
    text: 'The Reserve Bank of India regulates the monetary policy to maintain price stability while keeping in mind the objective of economic growth. Digital payment systems like Unified Payments Interface have transformed retail transactions. Financial inclusion ensures that every household has access to affordable banking, credit, and insurance products.'
  },
  {
    title: 'Science & Technology (General Administration)',
    text: 'Advances in space exploration, artificial intelligence, and semiconductor manufacturing are shaping the future of global industries. Indian space missions have demonstrated high cost efficiency and technical excellence. Promoting scientific temper and research in educational institutions strengthens national self reliance and industrial productivity.'
  }
];

const HINDI_PASSAGES = [
  {
    title: 'एसएससी एवं सरकारी भर्ती परीक्षा (हिंदी गद्यांश)',
    text: 'भारत एक विशाल और विविधतापूर्ण राष्ट्र है। यहाँ की सांस्कृतिक धरोहर और प्राकृतिक संपदा विश्व भर में प्रसिद्ध है। डिजिटल भारत अभियान के माध्यम से ग्रामीण क्षेत्रों में भी सूचना और सेवाएँ सहजता से उपलब्ध हो रही हैं। देश के युवाओं को स्वावलंबी बनाने हेतु तकनीकी शिक्षा और कौशल विकास पर विशेष ध्यान दिया जा रहा है।'
  },
  {
    title: 'न्यायालय एवं प्रशासनिक लिपिक अभ्यास',
    text: 'भारतीय संविधान देश की सर्वोच्च विधि है। यह नागरिकों को समानता, स्वतंत्रता और न्याय का अधिकार प्रदान करता है। प्रशासनिक कार्यों में पारदर्शिता, ईमानदारी और समयबद्धता का विशेष महत्व है। किसी भी राष्ट्र की प्रगति उसके नागरिकों के कर्तव्यबोध और सामूहिक प्रयास पर निर्भर करती है।'
  },
  {
    title: 'पर्यावरण एवं सतत विकास निबंध',
    text: 'पर्यावरण संरक्षण आज के समय की सबसे बड़ी आवश्यकता है। वृक्षारोपण, जल संचयन और नवीकरणीय ऊर्जा का उपयोग करके हम अपनी भावी पीढ़ियों के लिए एक सुरक्षित भविष्य का निर्माण कर सकते हैं। प्रदूषण मुक्त वातावरण में ही मानव का सर्वांगीण विकास संभव है।'
  }
];

export const SpeedTypingSuiteCalculator: React.FC<SpeedTypingSuiteCalculatorProps> = ({ onResultChange }) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [selectedDuration, setSelectedDuration] = useState<number>(60); // in seconds
  const [passageIndex, setPassageIndex] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [backspaceCount, setBackspaceCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activePassage = useMemo(() => {
    const list = language === 'en' ? ENGLISH_PASSAGES : HINDI_PASSAGES;
    return list[passageIndex % list.length];
  }, [language, passageIndex]);

  const targetText = activePassage.text;

  // Reset test
  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInputVal('');
    setIsRunning(false);
    setTimeLeft(selectedDuration);
    setIsCompleted(false);
    setBackspaceCount(0);
    if (inputRef.current) inputRef.current.focus();
  };

  // Switch duration or passage
  useEffect(() => {
    handleReset();
  }, [selectedDuration, language, passageIndex]);

  // Timer tick
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // Track keystrokes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isCompleted) return;
    const val = e.target.value;

    if (!isRunning && val.length > 0) {
      setIsRunning(true);
    }

    setInputVal(val);

    if (val.length >= targetText.length) {
      setIsRunning(false);
      setIsCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace') {
      setBackspaceCount((prev) => prev + 1);
    }
  };

  // Calculations
  const stats = useMemo(() => {
    const timeElapsed = selectedDuration - timeLeft;
    const minutes = Math.max(timeElapsed / 60, 1 / 60);

    let correctChars = 0;
    let incorrectChars = 0;

    for (let i = 0; i < inputVal.length; i++) {
      if (i < targetText.length) {
        if (inputVal[i] === targetText[i]) {
          correctChars++;
        } else {
          incorrectChars++;
        }
      }
    }

    const totalChars = inputVal.length;
    // Standard Gross WPM = (Total Typed Chars / 5) / Minutes
    const grossWpm = Math.round((totalChars / 5) / minutes) || 0;
    // Net WPM = ((Correct Chars / 5) - Uncorrected Errors) / Minutes
    const netWpm = Math.max(0, Math.round(((correctChars / 5) / minutes) - (incorrectChars / minutes))) || 0;
    const cpm = Math.round(totalChars / minutes) || 0;
    const accuracy = totalChars > 0 ? Math.max(0, Math.round((correctChars / totalChars) * 100)) : 100;

    // Govt Exam Criteria: English >= 35 WPM & >= 95% Acc | Hindi >= 30 WPM & >= 90% Acc
    const reqWpm = language === 'en' ? 35 : 30;
    const reqAcc = language === 'en' ? 95 : 90;
    const isPassed = netWpm >= reqWpm && accuracy >= reqAcc;

    return {
      grossWpm,
      netWpm,
      cpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars,
      timeElapsed,
      isPassed,
      reqWpm,
      reqAcc
    };
  }, [inputVal, targetText, selectedDuration, timeLeft, language]);

  useEffect(() => {
    if (onResultChange && (isRunning || isCompleted)) {
      onResultChange(`Typing Speed: ${stats.netWpm} Net WPM | Accuracy: ${stats.accuracy}% (${stats.isPassed ? 'Govt Exam Qualified' : 'Practicing'})`);
    }
  }, [stats, isRunning, isCompleted, onResultChange]);

  const handleCopyScorecard = () => {
    const text = `🏆 BharatUtility Speed Typing Test Result\n` +
      `⚡ Net Speed: ${stats.netWpm} WPM (${stats.grossWpm} Gross WPM)\n` +
      `🎯 Accuracy: ${stats.accuracy}%\n` +
      `⏱️ Duration: ${stats.timeElapsed}s / ${selectedDuration}s\n` +
      `⌨️ Characters: ${stats.totalChars} (Correct: ${stats.correctChars}, Errors: ${stats.incorrectChars})\n` +
      `📋 Govt Standard: ${stats.isPassed ? '✅ QUALIFIED (Govt Exam Benchmark Met)' : '⚠️ Needs Practice'}\n\n` +
      `Practice for free on BharatUtility: https://bharatutility.com/tools/speed-typing-test`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-blue-400" />
              Language / भाषा
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setLanguage('en')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English (QWERTY)
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  language === 'hi'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी (Mangal/InScript)
              </button>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Test Duration / समय
            </label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              {[30, 60, 120, 300].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    selectedDuration === dur
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {dur < 60 ? `${dur}s` : `${dur / 60}m`}
                </button>
              ))}
            </div>
          </div>

          {/* Change Passage & Reset */}
          <div className="flex items-end gap-2 pt-1 md:pt-0">
            <button
              onClick={() => setPassageIndex((prev) => prev + 1)}
              className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              New Passage
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Live HUD Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Net Speed</div>
            <div className="text-xl font-black text-white font-mono flex items-baseline gap-1">
              {stats.netWpm} <span className="text-xs font-normal text-blue-400">WPM</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Accuracy</div>
            <div className="text-xl font-black text-emerald-300 font-mono flex items-baseline gap-1">
              {stats.accuracy}%
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Time Left</div>
            <div className={`text-xl font-black font-mono ${timeLeft <= 10 && isRunning ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
              {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Characters</div>
            <div className="text-xl font-black text-slate-200 font-mono flex items-baseline gap-1">
              {stats.totalChars} <span className="text-xs font-normal text-slate-400">cpm: {stats.cpm}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Typing Area */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300 tracking-wide uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            {activePassage.title}
          </span>
          <span className="text-xs font-mono text-slate-400">
            {inputVal.length} / {targetText.length} chars
          </span>
        </div>

        {/* Text Display with Color-Coded Progress */}
        <div 
          onClick={() => inputRef.current?.focus()}
          className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 text-base sm:text-lg leading-relaxed font-mono select-none cursor-text min-h-[140px] tracking-wide"
        >
          {targetText.split('').map((char, index) => {
            let className = 'text-slate-500';
            const isTyped = index < inputVal.length;
            const isCurrent = index === inputVal.length;

            if (isTyped) {
              if (inputVal[index] === char) {
                className = 'text-emerald-400 font-medium bg-emerald-500/10 rounded-sm';
              } else {
                className = 'text-rose-400 bg-rose-500/20 underline decoration-rose-500 font-bold rounded-sm';
              }
            } else if (isCurrent) {
              className = 'text-white border-b-2 border-blue-400 animate-pulse bg-blue-500/20 px-0.5 rounded-sm';
            }

            return (
              <span key={index} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Typing Input */}
        <div>
          <textarea
            ref={inputRef}
            rows={3}
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isCompleted}
            placeholder={isCompleted ? "Test finished! Click Reset to try again." : "Start typing here to begin the timer automatically..."}
            className="w-full bg-slate-950 border-2 border-blue-500/40 focus:border-blue-400 rounded-xl p-4 text-base text-white font-mono outline-none transition-all placeholder:text-slate-600 disabled:opacity-50 resize-none shadow-inner"
          />
        </div>
      </div>

      {/* Completion Modal / Scorecard */}
      {isCompleted && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border-2 border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                stats.isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {stats.isPassed ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Test Complete! Performance Summary</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-3 py-0.5 rounded-full font-bold border ${
                    stats.isPassed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {stats.isPassed ? '✓ QUALIFIED (Govt Criteria Met)' : '⚠️ Below Target Speed'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Target: {stats.reqWpm} WPM & {stats.reqAcc}% Acc
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleCopyScorecard}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Scorecard'}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1 font-semibold">Net Speed (WPM)</span>
              <span className="text-2xl font-black text-white font-mono">{stats.netWpm}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1 font-semibold">Gross Speed (WPM)</span>
              <span className="text-2xl font-black text-blue-400 font-mono">{stats.grossWpm}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1 font-semibold">Accuracy</span>
              <span className="text-2xl font-black text-emerald-400 font-mono">{stats.accuracy}%</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 text-center">
              <span className="text-xs text-slate-400 block mb-1 font-semibold">Errors / Backspaces</span>
              <span className="text-2xl font-black text-rose-400 font-mono">{stats.incorrectChars} / {backspaceCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
