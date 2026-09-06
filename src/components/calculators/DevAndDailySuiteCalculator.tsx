import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { Code, Key, Lock, ArrowRightLeft, FileCode, Check, Copy, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, Trash2, Eye, EyeOff } from 'lucide-react';

interface Props {
  tool: Tool;
}

export const DevAndDailySuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. JSON FORMATTER & VALIDATOR STATE ---
  const [rawJson, setRawJson] = useState<string>(
    '{"appName":"BharatUtility","version":"2.0.0","features":["100% Client-Side","Free Indian Calculators","Zero Tracking"],"seo":{"indexedPages":76,"domain":"bharatutility.tech"}}'
  );
  const [jsonIndent, setJsonIndent] = useState<2 | 4 | 'min'>(2);

  // --- 2. BASE64 ENCODER & DECODER STATE ---
  const [base64Input, setBase64Input] = useState<string>('BharatUtility: 100% Free Indian Utilities & Calculators');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');

  // --- 3. PASSWORD GENERATOR STATE ---
  const [passLength, setPassLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [seed, setSeed] = useState<number>(1);
  const [showPassword, setShowPassword] = useState<boolean>(true);

  // --- 4. DIFF CHECKER STATE ---
  const [originalText, setOriginalText] = useState<string>('Hello Bharat!\nCalculate GST and Home Loan EMI instantly.\nSave time with free tools.');
  const [modifiedText, setModifiedText] = useState<string>('Hello Bharat!\nCalculate GST, PPF, and Home Loan EMI with precision.\nSave hours with free private tools.');

  // --- 5. ASPECT RATIO CALCULATOR STATE ---
  const [srcWidth, setSrcWidth] = useState<number>(1920);
  const [srcHeight, setSrcHeight] = useState<number>(1080);
  const [newWidth, setNewWidth] = useState<number>(1080);

  // ================= 1. JSON FORMATTER =================
  const jsonResult = useMemo(() => {
    if (!rawJson.trim()) {
      return { isValid: true, output: '', error: null, sizeBytes: 0 };
    }
    try {
      const parsed = JSON.parse(rawJson);
      let output = '';
      if (jsonIndent === 'min') {
        output = JSON.stringify(parsed);
      } else {
        output = JSON.stringify(parsed, null, jsonIndent);
      }
      return {
        isValid: true,
        output,
        error: null,
        sizeBytes: new Blob([output]).size,
      };
    } catch (e: any) {
      return {
        isValid: false,
        output: rawJson,
        error: e.message || 'Invalid JSON syntax',
        sizeBytes: 0,
      };
    }
  }, [rawJson, jsonIndent]);

  // ================= 2. BASE64 ENCODER/DECODER =================
  const base64Result = useMemo(() => {
    try {
      if (base64Mode === 'encode') {
        // UTF-8 safe encode
        const encoded = btoa(unescape(encodeURIComponent(base64Input)));
        return { result: encoded, error: null };
      } else {
        // UTF-8 safe decode
        const decoded = decodeURIComponent(escape(atob(base64Input)));
        return { result: decoded, error: null };
      }
    } catch (e: any) {
      return { result: '', error: 'Could not process Base64 string. Verify valid format.' };
    }
  }, [base64Input, base64Mode]);

  // ================= 3. PASSWORD GENERATOR =================
  const passwordResult = useMemo(() => {
    // Generate secure password
    let chars = '';
    if (includeUppercase) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (includeLowercase) chars += 'abcdefghijkmnpqrstuvwxyz';
    if (includeNumbers) chars += '23456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) chars = 'abcdefghijkmnpqrstuvwxyz23456789';

    let pass = '';
    const array = new Uint32Array(passLength);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < passLength; i++) {
        pass += chars[array[i] % chars.length];
      }
    } else {
      for (let i = 0; i < passLength; i++) {
        pass += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    // Entropy calculation
    const poolSize = chars.length;
    const entropyBits = Math.round(passLength * Math.log2(poolSize));
    let strengthLabel = 'Weak';
    let strengthColor = 'text-rose-400';
    if (entropyBits >= 80) {
      strengthLabel = 'Very Strong (Military Grade)';
      strengthColor = 'text-emerald-400';
    } else if (entropyBits >= 55) {
      strengthLabel = 'Strong';
      strengthColor = 'text-cyan-400';
    } else if (entropyBits >= 36) {
      strengthLabel = 'Fair';
      strengthColor = 'text-amber-400';
    }

    return {
      password: pass,
      entropyBits,
      strengthLabel,
      strengthColor,
    };
  }, [passLength, includeUppercase, includeLowercase, includeNumbers, includeSymbols, seed]);

  // ================= 4. DIFF CHECKER =================
  const diffResult = useMemo(() => {
    const lines1 = originalText.split('\n');
    const lines2 = modifiedText.split('\n');
    const maxLen = Math.max(lines1.length, lines2.length);
    const diffRows = [];

    for (let i = 0; i < maxLen; i++) {
      const l1 = lines1[i] !== undefined ? lines1[i] : null;
      const l2 = lines2[i] !== undefined ? lines2[i] : null;
      const isIdentical = l1 === l2;
      diffRows.push({ lineNum: i + 1, left: l1, right: l2, isIdentical });
    }

    return diffRows;
  }, [originalText, modifiedText]);

  // ================= 5. ASPECT RATIO =================
  const aspectRatioResult = useMemo(() => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(Math.max(1, srcWidth), Math.max(1, srcHeight));
    const ratioW = srcWidth / divisor;
    const ratioH = srcHeight / divisor;

    // Computed height for new width: H = (W * srcHeight) / srcWidth
    const computedHeight = Math.round((newWidth * srcHeight) / Math.max(1, srcWidth));

    return {
      ratioString: `${ratioW}:${ratioH}`,
      computedHeight,
      ratioDecimal: (srcWidth / Math.max(1, srcHeight)).toFixed(3),
    };
  }, [srcWidth, srcHeight, newWidth]);

  return (
    <div className="space-y-8">
      {/* ================= 1. JSON FORMATTER ================= */}
      {slug === 'json-formatter-validator' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">JSON Formatter & Validator</h3>
              {jsonResult.isValid ? (
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Valid JSON
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full text-xs font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Syntax Error
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Indentation:</span>
              {[
                { label: '2 Spaces', val: 2 },
                { label: '4 Spaces', val: 4 },
                { label: 'Minify (1 line)', val: 'min' },
              ].map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setJsonIndent(opt.val as any)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    jsonIndent === opt.val
                      ? 'bg-emerald-500/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => copyToClipboard(jsonResult.output, 'json-out')}
                className="text-xs px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedId === 'json-out' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedId === 'json-out' ? 'Copied' : 'Copy Formatted'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Raw JSON Input</label>
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder="Paste your JSON here..."
                rows={14}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Formatted & Validated Output</label>
              <textarea
                readOnly
                value={jsonResult.isValid ? jsonResult.output : jsonResult.error || ''}
                rows={14}
                className={`w-full bg-slate-950/80 border rounded-xl p-4 font-mono text-xs select-all focus:outline-none ${
                  jsonResult.isValid ? 'border-slate-800 text-emerald-400' : 'border-rose-500/50 text-rose-400'
                }`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. BASE64 ENCODER & DECODER ================= */}
      {slug === 'base64-encoder-decoder' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Base64 Text Encoder & Decoder</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBase64Mode('encode')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold ${
                  base64Mode === 'encode' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Encode Text → Base64
              </button>
              <button
                type="button"
                onClick={() => setBase64Mode('decode')}
                className={`text-xs px-3 py-1.5 rounded-lg border font-semibold ${
                  base64Mode === 'decode' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Decode Base64 → Text
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Input String</label>
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="Type or paste input here..."
                rows={8}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Result</label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(base64Result.result, 'b64-res')}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md flex items-center gap-1"
                >
                  {copiedId === 'b64-res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy
                </button>
              </div>
              <textarea
                readOnly
                value={base64Result.error || base64Result.result}
                rows={8}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 break-all select-all focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. SECURE PASSWORD GENERATOR ================= */}
      {slug === 'secure-password-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Password Rules & Options</h3>
                <p className="text-xs text-slate-400">Cryptographically secure randomized in-browser generator</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Password Length</span>
                  <span className="font-mono font-bold text-emerald-400">{passLength} Characters</span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={64}
                  value={passLength}
                  onChange={(e) => setPassLength(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                {[
                  { label: 'Uppercase Letters (A-Z)', val: includeUppercase, set: setIncludeUppercase },
                  { label: 'Lowercase Letters (a-z)', val: includeLowercase, set: setIncludeLowercase },
                  { label: 'Numbers (0-9)', val: includeNumbers, set: setIncludeNumbers },
                  { label: 'Special Symbols (!@#$%^&*)', val: includeSymbols, set: setIncludeSymbols },
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={opt.val}
                      onChange={(e) => opt.set(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSeed(s => s + 1)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 text-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Generate New Password
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Generated Secure Password
              </span>

              <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <span className="font-mono text-base sm:text-lg text-white break-all select-all font-semibold">
                  {showPassword ? passwordResult.password : '••••••••••••••••••••'}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                    title={showPassword ? 'Hide' : 'Show'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(passwordResult.password, 'pass')}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-bold"
                    title="Copy"
                  >
                    {copiedId === 'pass' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Entropy Strength:</span>
                  <span className={`font-bold ${passwordResult.strengthColor}`}>{passwordResult.strengthLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Entropy Score:</span>
                  <span className="font-mono text-white">{passwordResult.entropyBits} bits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. DIFF CHECKER ================= */}
      {slug === 'diff-checker-tool' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Side-by-Side Text Difference Checker</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Original Text</label>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                rows={6}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Modified Text</label>
              <textarea
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                rows={6}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
            <div className="grid grid-cols-2 bg-slate-950 p-2 border-b border-slate-800 text-[11px] font-bold text-slate-400">
              <div>Original</div>
              <div>Modified</div>
            </div>
            <div className="divide-y divide-slate-800/60 max-h-96 overflow-y-auto">
              {diffResult.map((row) => (
                <div
                  key={row.lineNum}
                  className={`grid grid-cols-2 p-2 ${row.isIdentical ? 'text-slate-400' : 'bg-amber-500/10 text-amber-200'}`}
                >
                  <div className="pr-2 border-r border-slate-800 truncate">{row.left !== null ? row.left : ''}</div>
                  <div className="pl-2 truncate">{row.right !== null ? row.right : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. ASPECT RATIO CALCULATOR ================= */}
      {slug === 'aspect-ratio-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Source Dimensions (Width × Height)</h3>
                <p className="text-xs text-slate-400">Scale YouTube thumbnails, Reels & images</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Width (px)</label>
                <input
                  type="number"
                  value={srcWidth}
                  onChange={(e) => setSrcWidth(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Source Height (px)</label>
                <input
                  type="number"
                  value={srcHeight}
                  onChange={(e) => setSrcHeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { label: '16:9 (YouTube)', w: 1920, h: 1080 },
                { label: '9:16 (Reels/Shorts)', w: 1080, h: 1920 },
                { label: '1:1 (Insta Post)', w: 1080, h: 1080 },
                { label: '4:3 (Classic)', w: 1024, h: 768 },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => { setSrcWidth(preset.w); setSrcHeight(preset.h); }}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-300 mb-1">Resize To Target Width (px)</label>
              <input
                type="number"
                value={newWidth}
                onChange={(e) => setNewWidth(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-cyan-400 font-mono font-bold"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border-2 border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
                Aspect Ratio Output
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Aspect Ratio</span>
                  <span className="text-2xl font-bold font-mono text-cyan-400 block">
                    {aspectRatioResult.ratioString}
                  </span>
                  <span className="text-[10px] text-slate-400">({aspectRatioResult.ratioDecimal})</span>
                </div>
                <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">Calculated Height</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 block">
                    {aspectRatioResult.computedHeight} px
                  </span>
                  <span className="text-[10px] text-slate-400">For width {newWidth}px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
