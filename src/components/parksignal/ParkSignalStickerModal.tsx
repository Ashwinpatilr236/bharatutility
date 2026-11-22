import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  Car,
  Check,
  Camera,
  Smartphone,
  AlertTriangle,
  Sparkles,
  Scissors
} from 'lucide-react';
import { ParkSignalVehicle } from '../../types';

interface ParkSignalStickerModalProps {
  vehicle: ParkSignalVehicle;
  isOpen: boolean;
  onClose: () => void;
}

type StickerTheme = 'executive' | 'high_vis' | 'modern_blue';

export const ParkSignalStickerModal: React.FC<ParkSignalStickerModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<StickerTheme>('high_vis');
  const [showCutGuide, setShowCutGuide] = useState(true);
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const publicUrl = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token || 'demo'}`;

  // Theme Configurations
  const themes = {
    high_vis: {
      name: 'High-Visibility Traffic',
      icon: '⚡',
      borderColor: '#f59e0b',
      headerBg: '#0f172a',
      accentBg: '#f59e0b',
      accentText: '#000000',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      tagline: 'MAXIMUM WINDSHIELD VISIBILITY'
    },
    executive: {
      name: 'Executive Dark Gold',
      icon: '👑',
      borderColor: '#d97706',
      headerBg: '#090d16',
      accentBg: '#d97706',
      accentText: '#ffffff',
      badgeBg: '#1e293b',
      badgeText: '#fcd34d',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      tagline: 'PREMIUM LUXURY EDITION'
    },
    modern_blue: {
      name: 'Modern Navy & Cyan',
      icon: '🛡️',
      borderColor: '#2563eb',
      headerBg: '#1e3a8a',
      accentBg: '#2563eb',
      accentText: '#ffffff',
      badgeBg: '#eff6ff',
      badgeText: '#1e40af',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      tagline: 'CLEAN FLEET EDITION'
    }
  };

  const currentTheme = themes[selectedTheme];

  useEffect(() => {
    if (!isOpen || !vehicle.qr_token) return;

    // Generate high-resolution QR canvas
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, publicUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
    }

    // Generate SVG string
    QRCode.toString(publicUrl, {
      type: 'svg',
      width: 450,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((svgString) => {
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        setSvgDataUrl(URL.createObjectURL(blob));
      })
      .catch((err) => console.error('SVG QR generation error', err));
  }, [isOpen, vehicle.qr_token, publicUrl]);

  if (!isOpen) return null;

  const displayPlate =
    vehicle.display_plate_publicly === 1
      ? vehicle.vehicle_number
      : vehicle.vehicle_number.length > 4
      ? `${vehicle.vehicle_number.slice(0, 4)} •••• ${vehicle.vehicle_number.slice(-4)}`
      : '••••••••';

  // High-Resolution 300-DPI Canvas Rendering
  const downloadPng = () => {
    const compCanvas = document.createElement('canvas');
    compCanvas.width = 1000;
    compCanvas.height = 1450;
    const ctx = compCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1000, 1450);

    // Optional Dotted Cut Border
    if (showCutGuide) {
      ctx.setLineDash([12, 12]);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.strokeRect(30, 30, 940, 1390);
      ctx.setLineDash([]);

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✂  CUT ALONG DOTTED LINE & TAPE INSIDE WINDSHIELD FACING OUTWARD  ✂', 500, 60);
    }

    const cardX = 60;
    const cardY = 85;
    const cardW = 880;
    const cardH = 1310;

    // Sticker Outer Card Border
    ctx.fillStyle = currentTheme.headerBg;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 44);
    ctx.fill();

    // Inner White Card
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cardX + 8, cardY + 8, cardW - 16, cardH - 16, 38);
    ctx.fill();

    // Top Header Banner
    ctx.fillStyle = currentTheme.headerBg;
    ctx.beginPath();
    ctx.roundRect(cardX + 8, cardY + 8, cardW - 16, 210, [38, 38, 0, 0]);
    ctx.fill();

    // Accent Line
    ctx.fillStyle = currentTheme.borderColor;
    ctx.fillRect(cardX + 8, cardY + 215, cardW - 16, 8);

    // Header Content
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARKSIGNAL', 500, cardY + 85);

    ctx.fillStyle = currentTheme.borderColor;
    ctx.font = 'bold 22px sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText('PRIVACY VEHICLE PARKING ALERT', 500, cardY + 130);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('BY BHARATUTILITY • SCAN TO CONNECT OWNER', 500, cardY + 170);

    // Callout Box
    ctx.fillStyle = currentTheme.accentBg;
    ctx.beginPath();
    ctx.roundRect(cardX + 40, cardY + 250, cardW - 80, 110, 24);
    ctx.fill();

    ctx.fillStyle = currentTheme.accentText;
    ctx.font = '900 32px sans-serif';
    ctx.fillText('WRONG PARKING? NEED ME TO MOVE?', 500, cardY + 298);
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('📷 Scan QR to send me an instant private alert', 500, cardY + 338);

    // QR Code Frame with corner markers
    const qrBoxX = 260;
    const qrBoxY = cardY + 395;
    const qrBoxSize = 480;

    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 32);
    ctx.fill();
    ctx.stroke();

    // Draw QR canvas
    if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, qrBoxX + 25, qrBoxY + 25, qrBoxSize - 50, qrBoxSize - 50);
    }

    // Step by step 3-chip banner
    const chipY = qrBoxY + qrBoxSize + 30;
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.roundRect(cardX + 40, chipY, cardW - 80, 75, 18);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('1. Open Camera  ➜  2. Scan QR  ➜  3. Send Alert / Voice Note', 500, chipY + 45);

    // HSRP Indian Number Plate Badge
    const plateY = chipY + 105;
    const plateW = 680;
    const plateH = 100;
    const plateX = 500 - plateW / 2;

    // Plate background
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(plateX, plateY, plateW, plateH, 20);
    ctx.fill();
    ctx.stroke();

    // Blue IND Band on left
    ctx.fillStyle = '#003399';
    ctx.beginPath();
    ctx.roundRect(plateX, plateY, 90, plateH, [18, 0, 0, 18]);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('IND', plateX + 45, plateY + 60);

    // Plate number text
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 44px monospace';
    ctx.fillText(`${vehicle.vehicle_type.toUpperCase()} • ${displayPlate}`, plateX + 390, plateY + 65);

    // Privacy & Security Footer
    const footerY = plateY + 140;
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🛡️ 100% Privacy Protected • Owner phone number is NEVER shared', 500, footerY);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.fillText('Instant Telegram alert delivered via @ParkSignal_bot • No app download required', 500, footerY + 36);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.fillText('bharatutility.tech/parksignal', 500, footerY + 68);

    const link = document.createElement('a');
    link.download = `ParkSignal-Sticker-${vehicle.vehicle_number}-${selectedTheme}.png`;
    link.href = compCanvas.toDataURL('image/png');
    link.click();
    setDownloadSuccess('High-resolution PNG downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const downloadSvg = () => {
    if (!svgDataUrl) return;
    const link = document.createElement('a');
    link.download = `ParkSignal-QR-${vehicle.vehicle_number}.svg`;
    link.href = svgDataUrl;
    link.click();
    setDownloadSuccess('Vector SVG downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const printSticker = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Printable Windshield Sticker
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                Premium
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              High-DPI smart QR sticker for {vehicle.vehicle_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Selector Toolbar */}
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="font-bold text-neutral-500 mr-1 text-[11px]">Style:</span>
            {(['high_vis', 'executive', 'modern_blue'] as StickerTheme[]).map((thm) => (
              <button
                key={thm}
                onClick={() => setSelectedTheme(thm)}
                className={`py-1 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                  selectedTheme === thm
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>{themes[thm].icon}</span>
                <span>{thm === 'high_vis' ? 'Traffic Yellow' : thm === 'executive' ? 'Executive Gold' : 'Fleet Navy'}</span>
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCutGuide}
              onChange={(e) => setShowCutGuide(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <Scissors className="w-3 h-3 text-neutral-400" />
            <span>Cut Border</span>
          </label>
        </div>

        {/* Sticker Preview Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center bg-neutral-100/70 dark:bg-neutral-950/50">
          {/* Physical Sticker Card Preview */}
          <div
            id="parksignal-printable-sticker"
            className={`w-full max-w-[340px] bg-white text-neutral-900 rounded-[32px] overflow-hidden shadow-2xl border-4 transition-all duration-300 relative ${
              showCutGuide ? 'ring-2 ring-dashed ring-neutral-400 ring-offset-4 ring-offset-neutral-100 dark:ring-offset-neutral-900' : ''
            }`}
            style={{ borderColor: currentTheme.headerBg }}
          >
            {/* Header Badge */}
            <div
              className="text-white py-3 px-4 text-center relative"
              style={{ backgroundColor: currentTheme.headerBg }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Car className="w-4 h-4" style={{ color: currentTheme.borderColor }} />
                <span className="font-black text-base tracking-wider uppercase">
                  PARKSIGNAL
                </span>
              </div>
              <div
                className="text-[10px] font-extrabold uppercase tracking-widest"
                style={{ color: currentTheme.borderColor }}
              >
                Privacy Vehicle Parking Alert
              </div>
              <div className="text-[9px] text-neutral-400 font-medium">
                By BharatUtility • Scan to Connect Owner
              </div>
              <div
                className="h-1 w-full absolute bottom-0 left-0"
                style={{ backgroundColor: currentTheme.borderColor }}
              />
            </div>

            {/* Instruction Banner */}
            <div className="p-3 pb-2 text-center">
              <div
                className="py-2 px-2.5 rounded-2xl font-black text-xs uppercase tracking-wide shadow-xs leading-tight mb-2"
                style={{
                  backgroundColor: currentTheme.accentBg,
                  color: currentTheme.accentText,
                }}
              >
                <div>WRONG PARKING? NEED ME TO MOVE?</div>
                <div className="text-[10px] font-bold mt-0.5 opacity-90">
                  Scan QR below to send instant private alert
                </div>
              </div>

              {/* QR Code Container with sleek corner styling */}
              <div className="relative inline-block p-3 bg-white rounded-2xl border-2 border-neutral-200 shadow-inner my-1">
                <canvas ref={canvasRef} className="w-44 h-44 sm:w-48 sm:h-48 block mx-auto" />
                {/* Micro center brand watermark */}
                <div className="text-[9px] font-extrabold tracking-wider text-neutral-400 uppercase mt-1">
                  @ParkSignal_bot
                </div>
              </div>

              {/* 3 Step Instruction Chips */}
              <div className="mt-2.5 py-1.5 px-2 bg-neutral-100 rounded-xl text-[10px] font-bold text-neutral-700 flex items-center justify-around border border-neutral-200">
                <span className="flex items-center gap-1">
                  <Camera className="w-3 h-3 text-neutral-500" /> 1. Scan
                </span>
                <span className="text-neutral-300">➜</span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-neutral-500" /> 2. Alert
                </span>
                <span className="text-neutral-300">➜</span>
                <span className="flex items-center gap-1 text-emerald-700 font-black">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> 3. Connected
                </span>
              </div>

              {/* HSRP Plate Badge */}
              <div className="mt-3 flex items-center justify-center bg-white rounded-xl border-2 border-neutral-900 overflow-hidden shadow-xs">
                <div className="bg-[#003399] text-white px-2.5 py-1.5 flex flex-col items-center justify-center font-black text-[10px] leading-none">
                  <span>IND</span>
                </div>
                <div className="py-1 px-3 text-center flex-1">
                  <div className="text-[9px] font-bold uppercase text-neutral-500 tracking-wider">
                    {vehicle.vehicle_type}
                  </div>
                  <div className="text-sm font-black font-mono tracking-wider text-neutral-900">
                    {displayPlate}
                  </div>
                </div>
              </div>

              {/* Privacy Footer */}
              <div className="mt-3 pt-2 border-t border-neutral-100 text-center">
                <div className="text-[10px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Privacy Protected
                </div>
                <p className="text-[9px] text-neutral-500 mt-0.5 leading-snug">
                  Owner's phone number is never shared. Instant alerts via Telegram. No app required.
                </p>
                <div className="text-[8px] text-neutral-400 font-mono mt-1">
                  bharatutility.tech/parksignal
                </div>
              </div>
            </div>
          </div>

          {/* Placement Notice */}
          <div className="mt-4 p-3 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400 max-w-sm text-center shadow-xs">
            💡 <strong>Windshield Tip:</strong> Print and stick on the <strong>bottom-left or bottom-right inside corner of your front windshield</strong> so guards and passersby can easily scan from outside.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 flex flex-wrap items-center justify-between gap-2.5">
          {downloadSuccess && (
            <div className="w-full text-center text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1 pb-1">
              <Check className="w-4 h-4" /> {downloadSuccess}
            </div>
          )}
          <button
            onClick={printSticker}
            className="flex-1 min-w-[110px] py-2.5 px-3 rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Sticker
          </button>
          <button
            onClick={downloadPng}
            className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" /> Download High-DPI PNG
          </button>
          <button
            onClick={downloadSvg}
            className="py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-white dark:hover:bg-neutral-800 transition-colors"
            title="Download Vector SVG"
          >
            SVG
          </button>
        </div>
      </div>
    </div>
  );
};
