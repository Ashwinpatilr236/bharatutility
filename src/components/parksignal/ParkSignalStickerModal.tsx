import React, { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Download,
  ShieldCheck,
  Car,
  Check,
  Camera,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
  Zap,
  Flame,
  Shield
} from 'lucide-react';
import { ParkSignalVehicle } from '../../types';

interface ParkSignalStickerModalProps {
  vehicle: ParkSignalVehicle;
  isOpen: boolean;
  onClose: () => void;
}

type StickerTheme = 'neon_yellow' | 'fire_orange' | 'cyber_cyan';
type StickerLayout = 'landscape' | 'square';

export const ParkSignalStickerModal: React.FC<ParkSignalStickerModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<StickerTheme>('neon_yellow');
  const [selectedLayout, setSelectedLayout] = useState<StickerLayout>('landscape');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);

  const publicUrl = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token || 'demo'}`;

  // High-Attention Attention-Grabbing Color Palettes
  const themes = {
    neon_yellow: {
      name: 'Electric Neon Yellow',
      shortName: 'Neon Yellow',
      icon: Zap,
      accent: '#FFDE00', // Eye-catching neon yellow
      accentText: '#000000',
      badgeBg: '#FFF9C4',
      badgeText: '#7A5E00',
      darkBg: '#090D16', // Deep Jet Black
      cardBorder: '#FFDE00',
      highlightBar: '#FFE600',
      tagline: 'MAXIMUM DAY & NIGHT VISIBILITY'
    },
    fire_orange: {
      name: 'Safety Fire Orange',
      shortName: 'Safety Orange',
      icon: Flame,
      accent: '#FF5722', // High-alert road safety orange
      accentText: '#FFFFFF',
      badgeBg: '#FFCCBC',
      badgeText: '#BF360C',
      darkBg: '#0B0D14',
      cardBorder: '#FF5722',
      highlightBar: '#FF7043',
      tagline: 'EMERGENCY ROAD ALERT GRADE'
    },
    cyber_cyan: {
      name: 'Cyber Electric Cyan',
      shortName: 'Cyber Cyan',
      icon: Shield,
      accent: '#00E5FF', // High-tech luminous cyan
      accentText: '#000000',
      badgeBg: '#E0F7FA',
      badgeText: '#006064',
      darkBg: '#070C18',
      cardBorder: '#00E5FF',
      highlightBar: '#18FFFF',
      tagline: 'EXECUTIVE LUXURY PASS'
    }
  };

  const currentTheme = themes[selectedTheme];

  const displayPlate =
    vehicle.display_plate_publicly === 1
      ? vehicle.vehicle_number
      : vehicle.vehicle_number.length > 4
      ? `${vehicle.vehicle_number.slice(0, 4)} •••• ${vehicle.vehicle_number.slice(-4)}`
      : '••••••••';

  // Helper to draw rounded rectangle
  const drawRoundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number | number[]
  ) => {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  };

  // Render the Master Canvas (What you see is exactly what downloads)
  const renderMasterCanvas = useCallback(async () => {
    if (!isOpen || !canvasRef.current) return;
    setIsRendering(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate QR in an offscreen canvas
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, publicUrl, {
      width: 480,
      margin: 1,
      color: {
        dark: '#050811',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    const isLandscape = selectedLayout === 'landscape';
    const W = isLandscape ? 1200 : 1080;
    const H = isLandscape ? 740 : 1080;

    canvas.width = W;
    canvas.height = H;

    // Clear background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    const drawBharatUtilityBrand = (x: number, y: number) => {
      ctx.save();
      // Icon Box
      ctx.fillStyle = '#4F46E5';
      drawRoundRect(ctx, x, y, 48, 48, 12);
      ctx.fill();

      // Icon Text ₹U
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('₹U', x + 24, y + 33);

      // Brand Wordmark
      ctx.textAlign = 'left';
      ctx.font = '900 28px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Bharat', x + 60, y + 33);
      ctx.fillStyle = '#818CF8';
      ctx.fillText('Utility', x + 154, y + 33);

      // TECH Pill
      ctx.fillStyle = currentTheme.accent;
      drawRoundRect(ctx, x + 248, y + 15, 54, 22, 6);
      ctx.fill();
      ctx.fillStyle = currentTheme.accentText;
      ctx.font = '900 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TECH', x + 275, y + 31);
      ctx.restore();
    };

    // ─────────────────────────────────────────────────────────────
    // FORMAT 1: LANDSCAPE FASTAG / VISITING CARD FORMAT (1200x740)
    // ─────────────────────────────────────────────────────────────
    if (isLandscape) {
      const pad = 24;
      const cardW = W - pad * 2;
      const cardH = H - pad * 2;

      // Outer Deep Dark Card Body
      ctx.fillStyle = currentTheme.darkBg;
      drawRoundRect(ctx, pad, pad, cardW, cardH, 32);
      ctx.fill();

      // Outer Glow / Border
      ctx.lineWidth = 5;
      ctx.strokeStyle = currentTheme.cardBorder;
      drawRoundRect(ctx, pad, pad, cardW, cardH, 32);
      ctx.stroke();

      // ── TOP HEADER BAR ──
      const headerH = 92;
      ctx.fillStyle = '#06080F';
      drawRoundRect(ctx, pad, pad, cardW, headerH, [32, 32, 0, 0]);
      ctx.fill();

      // Accent dividing line
      ctx.fillStyle = currentTheme.accent;
      ctx.fillRect(pad, pad + headerH, cardW, 5);

      // BharatUtility Brand Logo (Left)
      drawBharatUtilityBrand(pad + 28, pad + 22);

      // Product Title (Right)
      ctx.textAlign = 'right';
      ctx.fillStyle = currentTheme.accent;
      ctx.font = '900 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('PARKSIGNAL', W - pad - 28, pad + 50);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '800 13px system-ui, -apple-system, sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('SMART PRIVACY PARKING TAG', W - pad - 28, pad + 72);

      // ── LEFT SIDE: QR CODE CAPSULE ──
      const qrBoxX = pad + 32;
      const qrBoxY = pad + headerH + 32;
      const qrSize = 440;

      // QR White Container
      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrSize, qrSize, 28);
      ctx.fill();

      // QR Inner Border with Theme Accent
      ctx.lineWidth = 4;
      ctx.strokeStyle = currentTheme.accent;
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrSize, qrSize, 28);
      ctx.stroke();

      // Draw QR Code
      ctx.drawImage(qrCanvas, qrBoxX + 24, qrBoxY + 20, qrSize - 48, qrSize - 48);

      // Micro Bot Footer on QR
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ @ParkSignal_bot', qrBoxX + qrSize / 2, qrBoxY + qrSize - 16);

      // ── RIGHT SIDE: CALLOUT & VEHICLE INFO ──
      const rightX = qrBoxX + qrSize + 32;
      const rightW = W - pad - rightX - 28;

      // 1. HIGH-ALERT ATTENTION CALLOUT BANNER
      const bannerH = 112;
      ctx.fillStyle = currentTheme.accent;
      drawRoundRect(ctx, rightX, qrBoxY, rightW, bannerH, 20);
      ctx.fill();

      ctx.fillStyle = currentTheme.accentText;
      ctx.textAlign = 'left';
      ctx.font = '900 27px system-ui, -apple-system, sans-serif';
      ctx.fillText('🚨 WRONG PARKING? NEED TO MOVE?', rightX + 24, qrBoxY + 44);

      ctx.font = '800 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('📷 Point phone camera at QR to alert me instantly', rightX + 24, qrBoxY + 84);

      // 2. AUTHENTIC HSRP NUMBER PLATE BADGE
      const plateY = qrBoxY + bannerH + 24;
      const plateH = 92;

      // Plate White Embossed Base
      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, rightX, plateY, rightW, plateH, 18);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      drawRoundRect(ctx, rightX, plateY, rightW, plateH, 18);
      ctx.stroke();

      // Left Blue IND Band
      ctx.fillStyle = '#003399';
      drawRoundRect(ctx, rightX, plateY, 84, plateH, [16, 0, 0, 16]);
      ctx.fill();

      // Chakra Symbol Circle
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rightX + 42, plateY + 34, 10, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 20px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IND', rightX + 42, plateY + 68);

      // Vehicle Plate Text
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 42px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${vehicle.vehicle_type.toUpperCase()} • ${displayPlate}`, rightX + 84 + (rightW - 84) / 2, plateY + 60);

      // 3. 3-STEP QUICK SCAN STRIP
      const stepY = plateY + plateH + 20;
      const stepH = 64;

      ctx.fillStyle = '#111827';
      drawRoundRect(ctx, rightX, stepY, rightW, stepH, 16);
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = '#374151';
      drawRoundRect(ctx, rightX, stepY, rightW, stepH, 16);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#F3F4F6';
      ctx.font = '800 17px system-ui, -apple-system, sans-serif';
      ctx.fillText('1. Open Camera   ➜   2. Scan QR   ➜   3. Send Alert', rightX + rightW / 2, stepY + 39);

      // 4. PRIVACY FOOTER
      const footY = stepY + stepH + 26;
      ctx.textAlign = 'left';
      ctx.fillStyle = '#10B981'; // Emerald 500
      ctx.font = '900 17px system-ui, -apple-system, sans-serif';
      ctx.fillText('🛡️ 100% Privacy Protected • Owner phone number is NEVER shared', rightX, footY + 14);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Instant alert delivered via @ParkSignal_bot • No app download required', rightX, footY + 38);

      ctx.fillStyle = currentTheme.accent;
      ctx.font = '700 13px monospace';
      ctx.fillText('bharatutility.tech/parksignal', rightX, footY + 60);
    }

    // ─────────────────────────────────────────────────────────────
    // FORMAT 2: SQUARE SMART WINDOW DECAL (1080x1080)
    // ─────────────────────────────────────────────────────────────
    else {
      const pad = 36;
      const cardW = W - pad * 2;
      const cardH = H - pad * 2;

      // Outer Deep Dark Card Body
      ctx.fillStyle = currentTheme.darkBg;
      drawRoundRect(ctx, pad, pad, cardW, cardH, 36);
      ctx.fill();

      // Border Glow
      ctx.lineWidth = 6;
      ctx.strokeStyle = currentTheme.cardBorder;
      drawRoundRect(ctx, pad, pad, cardW, cardH, 36);
      ctx.stroke();

      // Header Banner
      const headerH = 135;
      ctx.fillStyle = '#06080F';
      drawRoundRect(ctx, pad, pad, cardW, headerH, [36, 36, 0, 0]);
      ctx.fill();

      ctx.fillStyle = currentTheme.accent;
      ctx.fillRect(pad, pad + headerH, cardW, 6);

      // Brand Logo in Header
      drawBharatUtilityBrand(pad + 32, pad + 24);

      ctx.textAlign = 'right';
      ctx.fillStyle = currentTheme.accent;
      ctx.font = '900 34px system-ui, -apple-system, sans-serif';
      ctx.fillText('PARKSIGNAL', W - pad - 32, pad + 54);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '800 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('VEHICLE ALERT PASS', W - pad - 32, pad + 78);

      // Urgent Callout
      const callY = pad + headerH + 30;
      ctx.fillStyle = currentTheme.accent;
      drawRoundRect(ctx, pad + 40, callY, cardW - 80, 100, 20);
      ctx.fill();

      ctx.fillStyle = currentTheme.accentText;
      ctx.textAlign = 'center';
      ctx.font = '900 27px system-ui, -apple-system, sans-serif';
      ctx.fillText('🚨 WRONG PARKING? NEED ME TO MOVE?', W / 2, callY + 42);

      ctx.font = '800 18px system-ui, -apple-system, sans-serif';
      ctx.fillText('📷 Scan QR to send me an instant private alert', W / 2, callY + 76);

      // Centered QR Code
      const qrBoxSize = 420;
      const qrBoxX = (W - qrBoxSize) / 2;
      const qrBoxY = callY + 125;

      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 26);
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = currentTheme.accent;
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 26);
      ctx.stroke();

      ctx.drawImage(qrCanvas, qrBoxX + 20, qrBoxY + 16, qrBoxSize - 40, qrBoxSize - 40);

      ctx.fillStyle = '#0F172A';
      ctx.font = '900 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ @ParkSignal_bot', W / 2, qrBoxY + qrBoxSize - 14);

      // HSRP Plate Badge
      const plateY = qrBoxY + qrBoxSize + 28;
      const plateW = cardW - 80;
      const plateH = 88;
      const plateX = (W - plateW) / 2;

      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, plateX, plateY, plateW, plateH, 18);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      drawRoundRect(ctx, plateX, plateY, plateW, plateH, 18);
      ctx.stroke();

      ctx.fillStyle = '#003399';
      drawRoundRect(ctx, plateX, plateY, 84, plateH, [16, 0, 0, 16]);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 20px system-ui, -apple-system, sans-serif';
      ctx.fillText('IND', plateX + 42, plateY + 62);

      ctx.fillStyle = '#0F172A';
      ctx.font = '900 40px monospace';
      ctx.fillText(`${vehicle.vehicle_type.toUpperCase()} • ${displayPlate}`, plateX + 84 + (plateW - 84) / 2, plateY + 58);

      // Privacy Footer
      const footY = plateY + plateH + 24;
      ctx.fillStyle = '#10B981';
      ctx.font = '900 17px system-ui, -apple-system, sans-serif';
      ctx.fillText('🛡️ 100% Privacy Protected • Owner phone number is NEVER shared', W / 2, footY + 12);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 14px system-ui, -apple-system, sans-serif';
      ctx.fillText('Free alerts via Telegram @ParkSignal_bot • No app download required', W / 2, footY + 36);

      ctx.fillStyle = currentTheme.accent;
      ctx.font = '700 13px monospace';
      ctx.fillText('bharatutility.tech/parksignal', W / 2, footY + 58);
    }

    setIsRendering(false);
  }, [isOpen, publicUrl, selectedLayout, selectedTheme, vehicle.vehicle_number, vehicle.vehicle_type, displayPlate, currentTheme]);

  // Re-render master canvas whenever theme or layout changes
  useEffect(() => {
    if (isOpen) {
      renderMasterCanvas();
    }
  }, [isOpen, renderMasterCanvas]);

  if (!isOpen) return null;

  // Direct PNG Download from the Master Canvas
  const downloadPng = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `ParkSignal-${vehicle.vehicle_number}-${selectedLayout}-${selectedTheme}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    setDownloadSuccess(`Downloaded high-res ${selectedLayout} sticker!`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-neutral-900 text-white rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/60">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Printable Windshield Sticker</span>
                <span
                  className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: currentTheme.accent,
                    color: currentTheme.accentText
                  }}
                >
                  HD Tag
                </span>
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              High-visibility smart parking sticker for <strong className="text-white">{vehicle.vehicle_number}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Layout & Colors */}
        <div className="px-4 py-3 bg-neutral-950/80 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          {/* Layout Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-400 text-[11px]">Format:</span>
            <button
              onClick={() => setSelectedLayout('landscape')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'landscape'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <span>🚘 Landscape Card (Fastag Size)</span>
            </button>
            <button
              onClick={() => setSelectedLayout('square')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'square'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <span>🔲 Square Window Decal</span>
            </button>
          </div>

          {/* Color Switcher */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-400 text-[11px]">Color:</span>
            {(['neon_yellow', 'fire_orange', 'cyber_cyan'] as StickerTheme[]).map((thm) => {
              const Icon = themes[thm].icon;
              return (
                <button
                  key={thm}
                  onClick={() => setSelectedTheme(thm)}
                  className={`py-1 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                    selectedTheme === thm
                      ? 'ring-2 ring-white text-white bg-neutral-800 shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: themes[thm].accent }} />
                  <span>{themes[thm].shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Canvas Preview (Zero distortion, 100% pixel-perfect match) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/60">
          <div className="relative w-full max-w-xl flex items-center justify-center">
            {/* The Master Canvas is displayed directly */}
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-2xl shadow-2xl border-2 border-neutral-700 transition-all duration-300"
              style={{
                maxHeight: '52vh',
                boxShadow: `0 20px 50px -10px ${currentTheme.accent}25`
              }}
            />
          </div>

          <div className="mt-3 text-xs text-neutral-400 text-center flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>100% Exact Preview:</strong> What you see above is the exact high-resolution file that will be downloaded.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3">
          {downloadSuccess ? (
            <div className="w-full text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1 pb-1">
              <Check className="w-4 h-4" /> {downloadSuccess}
            </div>
          ) : (
            <div className="text-xs text-neutral-400 hidden sm:block">
              Print at home or local shop on vinyl sticker / glossy paper.
            </div>
          )}

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors"
            >
              Close
            </button>
            <button
              onClick={downloadPng}
              className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-102"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.accentText,
                boxShadow: `0 10px 25px -5px ${currentTheme.accent}50`
              }}
            >
              <Download className="w-4 h-4" /> Download High-DPI PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
