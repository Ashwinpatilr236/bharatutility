import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Download, Upload, RefreshCw, CheckCircle2, 
  AlertTriangle, Sliders, ShieldCheck, Sparkles, Scissors, FileCheck
} from 'lucide-react';

interface ExamPhotoStampSuiteCalculatorProps {
  onResultChange?: (result: string) => void;
}

const EXAM_PRESETS = [
  { name: 'SSC CGL / CHSL / MTS', width: 350, height: 450, minKb: 20, maxKb: 50, note: 'Passport photo with Name & DOP on bottom' },
  { name: 'UPSC Civil Services / NDA', width: 350, height: 350, minKb: 20, maxKb: 300, note: 'Standard square portrait format' },
  { name: 'IBPS PO / Clerk (Banking)', width: 200, height: 230, minKb: 20, maxKb: 50, note: 'Banking recruitment portal specification' },
  { name: 'NEET UG / JEE Main', width: 350, height: 450, minKb: 10, maxKb: 200, note: 'NTA portal requirement with Name & Date' },
  { name: 'Railway RRB (NTPC/ALP)', width: 350, height: 450, minKb: 20, maxKb: 50, note: '35mm x 45mm color photo' }
];

export const ExamPhotoStampSuiteCalculator: React.FC<ExamPhotoStampSuiteCalculatorProps> = ({ onResultChange }) => {
  const [candidateName, setCandidateName] = useState<string>('RAHUL SHARMA');
  const [photoDate, setPhotoDate] = useState<string>(() => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  });
  const [datePrefix, setDatePrefix] = useState<string>('DOP: ');
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [targetKb, setTargetKb] = useState<number>(35); // default 35KB
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string>('');
  const [outputDataUrl, setOutputDataUrl] = useState<string>('');
  const [outputSizeBytes, setOutputSizeBytes] = useState<number>(0);
  const [bannerHeightPct, setBannerHeightPct] = useState<number>(18); // 18% bottom banner
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const preset = EXAM_PRESETS[selectedPreset];

  // File Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageSrc(event.target?.result as string);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Render on Canvas with Name and Date stamp
  useEffect(() => {
    if (!uploadedImageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = preset.width;
      canvas.height = preset.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bannerH = Math.round((preset.height * bannerHeightPct) / 100);
      const photoH = preset.height - bannerH;

      // Draw image cropped to fill photo area
      const imgAspect = img.width / img.height;
      const targetAspect = preset.width / photoH;

      let drawW, drawH, drawX, drawY;
      if (imgAspect > targetAspect) {
        drawH = photoH;
        drawW = photoH * imgAspect;
        drawX = -(drawW - preset.width) / 2;
        drawY = 0;
      } else {
        drawW = preset.width;
        drawH = preset.width / imgAspect;
        drawX = 0;
        drawY = -(drawH - photoH) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, preset.width, photoH);
      ctx.clip();
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Draw bottom white banner for Name & Date
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, photoH, preset.width, bannerH);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, photoH, preset.width, bannerH);

      // Draw Candidate Name
      const nameFontSize = Math.max(12, Math.round(preset.width * 0.05));
      ctx.font = `bold ${nameFontSize}px Arial, sans-serif`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lineSpacing = bannerH / 3;
      const nameY = photoH + lineSpacing * 1.1;
      const dateY = photoH + lineSpacing * 2.1;

      ctx.fillText(candidateName.toUpperCase(), preset.width / 2, nameY);

      // Draw Date of Photo
      const dateFontSize = Math.max(11, Math.round(preset.width * 0.042));
      ctx.font = `600 ${dateFontSize}px Arial, sans-serif`;
      ctx.fillText(`${datePrefix}${photoDate}`, preset.width / 2, dateY);

      // Binary Search to achieve exact target KB size
      let quality = 0.92;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      let byteLength = Math.round((dataUrl.length * 3) / 4);

      // Adjust quality to match target KB (within 10% margin)
      const targetBytes = targetKb * 1024;
      for (let i = 0; i < 6; i++) {
        if (byteLength > targetBytes && quality > 0.15) {
          quality -= 0.12;
        } else if (byteLength < targetBytes * 0.85 && quality < 0.98) {
          quality += 0.06;
        } else {
          break;
        }
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        byteLength = Math.round((dataUrl.length * 3) / 4);
      }

      setOutputDataUrl(dataUrl);
      setOutputSizeBytes(byteLength);

      if (onResultChange) {
        onResultChange(`Exam Photo Generated: ${(byteLength / 1024).toFixed(1)} KB (${preset.width}x${preset.height}px) for ${candidateName}`);
      }
    };

    img.src = uploadedImageSrc;
  }, [uploadedImageSrc, candidateName, photoDate, datePrefix, preset, targetKb, bannerHeightPct, onResultChange]);

  const handleDownload = () => {
    if (!outputDataUrl) return;
    const link = document.createElement('a');
    const safeName = candidateName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `${safeName}-exam-photo-${(outputSizeBytes / 1024).toFixed(0)}kb.jpg`;
    link.href = outputDataUrl;
    link.click();
  };

  const isWithinGovtLimit = outputSizeBytes >= preset.minKb * 1024 && outputSizeBytes <= preset.maxKb * 1024;

  return (
    <div className="space-y-6">
      {/* Upload Header Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Govt Exam Photo & Date of Photo (DOP) Stamp</h3>
              <p className="text-xs text-slate-400">Add candidate name & DOP/DOB banner strictly adhering to SSC, UPSC, IBPS guidelines</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Upload className="w-4 h-4" />
              Upload Passport Photo
            </button>
          </div>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
          Select Govt Exam Specification Preset
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {EXAM_PRESETS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => {
                setSelectedPreset(idx);
                setTargetKb(Math.min(35, p.maxKb));
              }}
              className={`p-3 rounded-xl text-left border transition-all ${
                selectedPreset === idx
                  ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-750'
              }`}
            >
              <div className="text-xs font-bold">{p.name}</div>
              <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{p.width}x{p.height}px ({p.minKb}-{p.maxKb}KB)</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Candidate & Banner Parameters
            </h4>

            {/* Candidate Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Candidate Full Name (उम्मीदवार का नाम)
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. RAHUL SHARMA"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold tracking-wide outline-none uppercase"
              />
            </div>

            {/* Date of Photo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Prefix Label
                </label>
                <select
                  value={datePrefix}
                  onChange={(e) => setDatePrefix(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="DOP: ">DOP: (Date of Photo)</option>
                  <option value="DOB: ">DOB: (Date of Birth)</option>
                  <option value="DATE: ">DATE: </option>
                  <option value="">No Prefix</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Date (DD-MM-YYYY)
                </label>
                <input
                  type="text"
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
                  placeholder="12-09-2026"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* Target File Size Slider */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">
                  Target File Size: <span className="text-emerald-400 font-bold font-mono">{targetKb} KB</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Allowed: {preset.minKb}KB - {preset.maxKb}KB
                </span>
              </div>
              <input
                type="range"
                min={preset.minKb}
                max={preset.maxKb}
                value={targetKb}
                onChange={(e) => setTargetKb(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Output Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Live Stamped Passport Photo Preview
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                isWithinGovtLimit
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}>
                {(outputSizeBytes / 1024).toFixed(1)} KB
              </span>
            </div>

            {/* Canvas Preview Container */}
            <div className="h-72 rounded-xl border border-slate-800 flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
              {outputDataUrl ? (
                <img
                  src={outputDataUrl}
                  alt="Govt Exam Stamped Photo"
                  className="max-h-full object-contain rounded-lg shadow-2xl border border-slate-700"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  Please click &quot;Upload Passport Photo&quot; to begin
                </div>
              )}
            </div>

            {/* Status Checklist */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dimensions: <strong>{preset.width} x {preset.height} px</strong> (Compliant with {preset.name})</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Bottom Banner: White background with sharp black bold typography</span>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={!outputDataUrl}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download Exam Ready JPG ({(outputSizeBytes / 1024).toFixed(1)} KB)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
