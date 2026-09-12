import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FileCode, Image as ImageIcon, Download, Upload, Copy, Check, 
  Sparkles, RefreshCw, ZoomIn, Eye, Sliders, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface SvgConverterSuiteCalculatorProps {
  onResultChange?: (result: string) => void;
}

const DEFAULT_SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF9933;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#138808;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#grad1)" stroke="#000080" stroke-width="3"/>
  <circle cx="50" cy="50" r="18" fill="none" stroke="#000080" stroke-width="2"/>
  <circle cx="50" cy="50" r="4" fill="#000080"/>
</svg>`;

const PRESET_SIZES = [
  { label: 'Favicon (16x16)', width: 16, height: 16 },
  { label: 'Icon (32x32)', width: 32, height: 32 },
  { label: 'Medium (64x64)', width: 64, height: 64 },
  { label: 'App Icon (128x128)', width: 128, height: 128 },
  { label: 'HD (256x256)', width: 256, height: 256 },
  { label: 'High Res (512x512)', width: 512, height: 512 },
  { label: 'Ultra 4K (1024x1024)', width: 1024, height: 1024 }
];

export const SvgConverterSuiteCalculator: React.FC<SvgConverterSuiteCalculatorProps> = ({ onResultChange }) => {
  const [svgCode, setSvgCode] = useState<string>(DEFAULT_SAMPLE_SVG);
  const [targetWidth, setTargetWidth] = useState<number>(512);
  const [targetHeight, setTargetHeight] = useState<number>(512);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(true);
  const [bgType, setBgType] = useState<'transparent' | 'white' | 'black' | 'custom'>('transparent');
  const [customBgColor, setCustomBgColor] = useState<string>('#0F172A');
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('converted-graphic');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
      setErrorMsg('Please upload a valid .svg file.');
      return;
    }

    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setFileName(nameWithoutExt);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && content.includes('<svg')) {
        setSvgCode(content);
        setErrorMsg('');
      } else {
        setErrorMsg('Invalid SVG markup found in file.');
      }
    };
    reader.readAsText(file);
  };

  // Convert SVG to Canvas and extract Data URL
  useEffect(() => {
    try {
      setErrorMsg('');
      if (!svgCode.trim().includes('<svg')) {
        setErrorMsg('Please enter valid SVG code containing <svg> tags.');
        setPreviewDataUrl('');
        return;
      }

      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = window.URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Background handling
        if (bgType === 'white') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else if (bgType === 'black') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else if (bgType === 'custom') {
          ctx.fillStyle = customBgColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else {
          ctx.clearRect(0, 0, targetWidth, targetHeight);
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const mime = outputFormat === 'webp' ? 'image/webp' : outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mime, 0.95);
        setPreviewDataUrl(dataUrl);
        window.URL.revokeObjectURL(blobURL);

        if (onResultChange) {
          onResultChange(`SVG Converted: ${targetWidth}x${targetHeight}px (${outputFormat.toUpperCase()})`);
        }
      };

      img.onerror = () => {
        setErrorMsg('Could not render SVG. Please check for malformed tags or external resources.');
        window.URL.revokeObjectURL(blobURL);
      };

      img.src = blobURL;
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error processing SVG conversion.');
    }
  }, [svgCode, targetWidth, targetHeight, bgType, customBgColor, outputFormat, onResultChange]);

  const handlePresetSelect = (w: number, h: number) => {
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleDownload = () => {
    if (!previewDataUrl) return;
    const link = document.createElement('a');
    link.download = `${fileName}-${targetWidth}x${targetHeight}.${outputFormat}`;
    link.href = previewDataUrl;
    link.click();
  };

  const handleCopyBase64 = () => {
    if (!previewDataUrl) return;
    navigator.clipboard.writeText(previewDataUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Upload & Options Header */}
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SVG Vector to Raster Converter</h3>
              <p className="text-xs text-slate-400">100% Client-side high-resolution rendering with custom background & format</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".svg,image/svg+xml"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
            >
              <Upload className="w-4 h-4" />
              Upload .SVG File
            </button>
            <button
              onClick={() => {
                setSvgCode(DEFAULT_SAMPLE_SVG);
                setFileName('ashoka-chakra');
              }}
              className="bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sample
            </button>
          </div>
        </div>
      </div>

      {/* Preset Dimensions Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          Target Output Resolution (Presets)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {PRESET_SIZES.map((preset) => {
            const isSelected = targetWidth === preset.width && targetHeight === preset.height;
            return (
              <button
                key={preset.label}
                onClick={() => handlePresetSelect(preset.width, preset.height)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-500/25'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                }`}
              >
                <div>{preset.width}x{preset.height}</div>
                <div className="text-[10px] font-normal opacity-80 mt-0.5">{preset.label.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Editor Left, Preview & Export Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                SVG Source Markup
              </label>
              <span className="text-xs font-mono text-slate-400">
                {svgCode.length} characters
              </span>
            </div>

            <textarea
              rows={10}
              value={svgCode}
              onChange={(e) => setSvgCode(e.target.value)}
              placeholder="Paste <svg> ... </svg> code here..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3.5 text-xs text-slate-200 font-mono outline-none transition-all resize-y"
            />

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Custom Resolution Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Custom Width (px)</label>
                <input
                  type="number"
                  min="8"
                  max="4096"
                  value={targetWidth}
                  onChange={(e) => {
                    const w = Math.max(8, parseInt(e.target.value) || 8);
                    setTargetWidth(w);
                    if (maintainAspect) setTargetHeight(w);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Custom Height (px)</label>
                <input
                  type="number"
                  min="8"
                  max="4096"
                  value={targetHeight}
                  onChange={(e) => {
                    const h = Math.max(8, parseInt(e.target.value) || 8);
                    setTargetHeight(h);
                    if (maintainAspect) setTargetWidth(h);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Background & Format Toggle */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Background</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setBgType('transparent')}
                    className={`py-1.5 text-xs font-bold rounded-lg ${
                      bgType === 'transparent' ? 'bg-purple-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setBgType('white')}
                    className={`py-1.5 text-xs font-bold rounded-lg ${
                      bgType === 'white' ? 'bg-purple-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => setBgType('black')}
                    className={`py-1.5 text-xs font-bold rounded-lg ${
                      bgType === 'black' ? 'bg-purple-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Black
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Format</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['png', 'webp', 'jpeg'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setOutputFormat(fmt)}
                      className={`py-1.5 text-xs font-bold rounded-lg uppercase ${
                        outputFormat === fmt ? 'bg-purple-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Rendered Output & Export */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                Live Render Output ({targetWidth} x {targetHeight} px)
              </label>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                {outputFormat.toUpperCase()} Lossless
              </span>
            </div>

            {/* Canvas Preview Container with Checkerboard BG */}
            <div className="h-64 rounded-xl border border-slate-800 flex items-center justify-center p-4 overflow-hidden relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Converted Vector Preview"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-all"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No preview available
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDownload}
                disabled={!previewDataUrl}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download {outputFormat.toUpperCase()} ({targetWidth}px)
              </button>

              <button
                onClick={handleCopyBase64}
                disabled={!previewDataUrl}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'DataURL Copied!' : 'Copy DataURI'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
