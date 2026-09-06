import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Copy, Check, Sparkles, FileText, Type, Hash, Clock, ArrowRightLeft, Trash2 } from 'lucide-react';

interface Props {
  tool: Tool;
}

// Indian Number to Words Helper
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertTwoDigits(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return tens[t] + (u !== 0 ? ' ' + ones[u] : '');
}

function convertThreeDigits(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  let res = '';
  if (hundred > 0) {
    res += ones[hundred] + ' Hundred';
  }
  if (rest > 0) {
    if (res) res += ' and ';
    res += convertTwoDigits(rest);
  }
  return res;
}

function convertIndianNumberToWords(num: number): { words: string; paiseWords: string; breakdown: { label: string; value: number }[] } {
  if (isNaN(num) || num < 0) return { words: 'Zero', paiseWords: '', breakdown: [] };
  if (num === 0) return { words: 'Zero', paiseWords: '', breakdown: [] };

  const intPart = Math.floor(num);
  const fracPart = Math.round((num - intPart) * 100);

  const crores = Math.floor(intPart / 10000000);
  let rem = intPart % 10000000;
  const lakhs = Math.floor(rem / 100000);
  rem = rem % 100000;
  const thousands = Math.floor(rem / 1000);
  rem = rem % 1000;
  const hundredsAndUnits = rem;

  const parts: string[] = [];
  const breakdown: { label: string; value: number }[] = [];

  if (crores > 0) {
    parts.push(convertThreeDigits(crores) + ' Crore');
    breakdown.push({ label: 'Crores (10,000,000s)', value: crores });
  }
  if (lakhs > 0) {
    parts.push(convertTwoDigits(lakhs) + ' Lakh');
    breakdown.push({ label: 'Lakhs (100,000s)', value: lakhs });
  }
  if (thousands > 0) {
    parts.push(convertTwoDigits(thousands) + ' Thousand');
    breakdown.push({ label: 'Thousands (1,000s)', value: thousands });
  }
  if (hundredsAndUnits > 0) {
    parts.push(convertThreeDigits(hundredsAndUnits));
    breakdown.push({ label: 'Hundreds & Units', value: hundredsAndUnits });
  }

  let paiseWords = '';
  if (fracPart > 0) {
    paiseWords = convertTwoDigits(fracPart) + ' Paise';
    breakdown.push({ label: 'Paise (Decimals)', value: fracPart });
  }

  return {
    words: parts.join(' ') || 'Zero',
    paiseWords,
    breakdown,
  };
}

export const TextAndLanguageSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Number to words states
  const [numInput, setNumInput] = useState<string>('2450000');
  const [currencyPrefix, setCurrencyPrefix] = useState<'Rupees' | 'USD' | 'None'>('Rupees');
  const [includeOnly, setIncludeOnly] = useState<boolean>(true);

  // Word counter states
  const [counterText, setCounterText] = useState<string>(
    'BharatUtility provides 100% free, private, and instant tools crafted specifically for Indian citizens, students, developers, and tax payers. All calculations and text processing happen entirely inside your web browser without sending any data to external servers.'
  );

  // Case converter states
  const [caseInputText, setCaseInputText] = useState<string>('Welcome to Bharat Utility! Calculate taxes, convert units, and format text with ease.');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. NUMBER TO WORDS CALCULATION ---
  const numParsed = parseFloat(numInput.replace(/,/g, '')) || 0;
  const numberWordsData = useMemo(() => {
    return convertIndianNumberToWords(numParsed);
  }, [numParsed]);

  const chequeSentence = useMemo(() => {
    let base = numberWordsData.words;
    if (numberWordsData.paiseWords) {
      base += ' and ' + numberWordsData.paiseWords;
    }
    if (currencyPrefix === 'Rupees') {
      base = `Rupees ${base}`;
    } else if (currencyPrefix === 'USD') {
      base = `US Dollars ${base}`;
    }
    if (includeOnly) {
      base += ' Only';
    }
    return base;
  }, [numberWordsData, currencyPrefix, includeOnly]);

  // --- 2. WORD & CHARACTER COUNTER CALCULATION ---
  const wordStats = useMemo(() => {
    const text = counterText;
    const wordsArray = text.trim().match(/\b[^\s]+\b/g) || [];
    const wordCount = wordsArray.length;
    const charCountWithSpaces = text.length;
    const charCountWithoutSpaces = text.replace(/\s/g, '').length;
    const sentences = text.trim() ? (text.match(/[.!?]+(?:\s|$)/g) || []).length || (text.trim().length > 0 ? 1 : 0) : 0;
    const paragraphs = text.trim() ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;
    const readingTimeMinutes = Math.ceil(wordCount / 200);
    const speakingTimeMinutes = Math.ceil(wordCount / 130);

    // Keyword density
    const freqMap: { [k: string]: number } = {};
    wordsArray.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 2) {
        freqMap[clean] = (freqMap[clean] || 0) + 1;
      }
    });

    const topKeywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        percent: ((count / (wordCount || 1)) * 100).toFixed(1),
      }));

    return {
      wordCount,
      charCountWithSpaces,
      charCountWithoutSpaces,
      sentences,
      paragraphs,
      readingTimeMinutes,
      speakingTimeMinutes,
      topKeywords,
    };
  }, [counterText]);

  // --- 3. TEXT CASE CONVERTER TRANSFORMATIONS ---
  const caseTransformations = useMemo(() => {
    const text = caseInputText;
    const upper = text.toUpperCase();
    const lower = text.toLowerCase();
    
    // Title Case
    const title = text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase());
    
    // Sentence Case
    const sentence = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    
    // camelCase
    const words = text.replace(/[^a-zA-Z0-9\s]/g, ' ').trim().split(/\s+/);
    const camel = words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()).join('');
    
    // PascalCase
    const pascal = words.map(w => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()).join('');
    
    // snake_case
    const snake = words.map(w => w.toLowerCase()).join('_');
    
    // kebab-case
    const kebab = words.map(w => w.toLowerCase()).join('-');
    
    // CONSTANT_CASE
    const constant = words.map(w => w.toUpperCase()).join('_');
    
    // Alternating cAsE
    const alternating = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');

    return [
      { id: 'title', label: 'Title Case (Cheque / Heading)', result: title },
      { id: 'upper', label: 'UPPERCASE (All Capitals)', result: upper },
      { id: 'lower', label: 'lowercase (Small Letters)', result: lower },
      { id: 'sentence', label: 'Sentence case (Normal Document)', result: sentence },
      { id: 'camel', label: 'camelCase (JavaScript / Variables)', result: camel },
      { id: 'pascal', label: 'PascalCase (React / Class Names)', result: pascal },
      { id: 'snake', label: 'snake_case (Python / Database)', result: snake },
      { id: 'kebab', label: 'kebab-case (URLs / CSS Class)', result: kebab },
      { id: 'constant', label: 'CONSTANT_CASE (Env Variables)', result: constant },
      { id: 'alternating', label: 'aLtErNaTiNg CaSe (Meme Text)', result: alternating },
    ];
  }, [caseInputText]);

  return (
    <div className="space-y-8">
      {/* ----------------- 1. NUMBER TO WORDS CONVERTER ----------------- */}
      {slug === 'number-to-words-converter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Hash className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enter Amount in Digits</h3>
                <p className="text-xs text-slate-400">Supports Indian Lakhs, Crores, and decimal Paise</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Numerical Amount (₹)
              </label>
              <input
                type="number"
                value={numInput}
                onChange={(e) => setNumInput(e.target.value)}
                placeholder="e.g. 1524000"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3.5 text-white font-mono text-xl focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {[10000, 50000, 250000, 1000000, 5000000, 10000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setNumInput(val.toString())}
                    className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition-colors"
                  >
                    ₹{(val).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Prefix Style</label>
                <select
                  value={currencyPrefix}
                  onChange={(e) => setCurrencyPrefix(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Rupees">Rupees ...</option>
                  <option value="USD">US Dollars ...</option>
                  <option value="None">None (Pure Numbers)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Suffix Suffix</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOnly}
                    onChange={(e) => setIncludeOnly(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">Add &apos;Only&apos; at end</span>
                </label>
              </div>
            </div>

            {/* Indian Denomination Breakdown */}
            {numberWordsData.breakdown.length > 0 && (
              <div className="border-t border-slate-800/80 pt-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Indian System Breakdown
                </h4>
                <div className="space-y-1.5">
                  {numberWordsData.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1 px-3 bg-slate-800/40 rounded-lg border border-slate-800">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="font-semibold text-emerald-400">{item.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Display */}
          <div className="lg:col-span-6 space-y-6">
            {/* Primary Cheque Card */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 border-2 border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Bank Cheque / RTGS Words
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(chequeSentence, 'cheque')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold rounded-lg text-xs transition-all shadow-md active:scale-95"
                >
                  {copiedId === 'cheque' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === 'cheque' ? 'Copied!' : 'Copy For Cheque'}
                </button>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <p className="text-lg md:text-xl font-serif font-medium text-white leading-relaxed select-all">
                  &quot;{chequeSentence}&quot;
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80 gap-2">
                <span>Digits: <strong className="text-slate-200">₹{numParsed.toLocaleString('en-IN')}</strong></span>
                <span>System: <strong className="text-emerald-400">Indian Lakh / Crore</strong></span>
              </div>
            </div>

            {/* Quick Copy Variations */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alternative Casing Formats</h4>
              
              <div className="space-y-2">
                {[
                  { label: 'Cheque Title Case', text: chequeSentence },
                  { label: 'ALL UPPERCASE (Legal / Invoice)', text: chequeSentence.toUpperCase() },
                  { label: 'all lowercase', text: chequeSentence.toLowerCase() },
                ].map((format, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
                    <div className="pr-4 overflow-hidden">
                      <span className="block text-[11px] text-slate-400">{format.label}</span>
                      <span className="text-xs text-slate-200 truncate block font-mono mt-0.5">{format.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(format.text, `fmt-${i}`)}
                      className="shrink-0 p-2 bg-slate-700/60 hover:bg-slate-600 text-slate-200 rounded-lg text-xs transition-colors"
                      title="Copy"
                    >
                      {copiedId === `fmt-${i}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- 2. WORD & CHARACTER COUNTER ----------------- */}
      {slug === 'word-character-counter' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Words', val: wordStats.wordCount, color: 'text-emerald-400', icon: Type },
              { label: 'Characters', val: wordStats.charCountWithSpaces, color: 'text-cyan-400', icon: Hash },
              { label: 'No Spaces', val: wordStats.charCountWithoutSpaces, color: 'text-blue-400', icon: FileText },
              { label: 'Sentences', val: wordStats.sentences, color: 'text-purple-400', icon: Sparkles },
              { label: 'Paragraphs', val: wordStats.paragraphs, color: 'text-amber-400', icon: FileText },
              { label: 'Reading Time', val: `${wordStats.readingTimeMinutes} min`, color: 'text-rose-400', icon: Clock },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <span className="text-xs text-slate-400">{stat.label}</span>
                <span className={`text-2xl font-bold font-mono mt-1 ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Text Editor */}
            <div className="lg:col-span-8 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Live Text Editor</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(counterText, 'editor')}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                  >
                    {copiedId === 'editor' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'editor' ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCounterText('')}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={counterText}
                onChange={(e) => setCounterText(e.target.value)}
                placeholder="Type or paste your text, article, essay, or tweet here..."
                rows={12}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-slate-200 font-sans text-sm focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCounterText(counterText.replace(/\s+/g, ' ').trim())}
                  className="text-xs px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                >
                  Remove Extra Spaces
                </button>
                <button
                  type="button"
                  onClick={() => setCounterText(counterText.split('\n').map(l => l.trim()).join('\n'))}
                  className="text-xs px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                >
                  Trim Line Whitespaces
                </button>
              </div>
            </div>

            {/* Keyword Density & Speaking speed */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Top Keyword Density
                </h4>
                {wordStats.topKeywords.length > 0 ? (
                  <div className="space-y-2.5">
                    {wordStats.topKeywords.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300 font-medium capitalize">{item.word}</span>
                          <span className="text-slate-400 font-mono">{item.count} times ({item.percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, parseFloat(item.percent) * 4)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Enter some text to see keyword frequency.</p>
                )}
              </div>

              <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Estimated Audio Speeds
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Silent Reading (200 wpm):</span>
                    <span className="font-semibold text-white">{wordStats.readingTimeMinutes} min</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-400">Speech / Presentation (130 wpm):</span>
                    <span className="font-semibold text-cyan-400">{wordStats.speakingTimeMinutes} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- 3. TEXT CASE CONVERTER ----------------- */}
      {slug === 'text-case-converter' && (
        <div className="space-y-6">
          {/* Input Box */}
          <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Enter Your Raw Text</h3>
              </div>
              <button
                type="button"
                onClick={() => setCaseInputText('')}
                className="text-xs px-2.5 py-1 text-slate-400 hover:text-rose-400 transition-colors"
              >
                Clear text
              </button>
            </div>
            <textarea
              value={caseInputText}
              onChange={(e) => setCaseInputText(e.target.value)}
              placeholder="Paste any text to instantly convert into UPPERCASE, lowercase, Title Case, camelCase, snake_case..."
              rows={4}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-slate-200 font-sans text-sm focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* Transformation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caseTransformations.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/60 backdrop-blur-md p-5 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-all space-y-2 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-400 tracking-wide">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.result, item.id)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all active:scale-95"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === item.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-200 break-all select-all min-h-[44px] flex items-center">
                  {item.result || <span className="text-slate-600 italic">No text provided</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
