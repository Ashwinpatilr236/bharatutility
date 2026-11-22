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
  Scissors,
  LayoutTemplate,
  Layers,
  Sparkles
} from 'lucide-react';
import { ParkSignalVehicle } from '../../types';

interface ParkSignalStickerModalProps {
  vehicle: ParkSignalVehicle;
  isOpen: boolean;
  onClose: () => void;
}

type StickerTheme = 'high_vis' | 'executive' | 'modern_blue';
type StickerLayout = 'landscape' | 'portrait' | 'square';

export const ParkSignalStickerModal: React.FC<ParkSignalStickerModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<StickerTheme>('high_vis');
  const [selectedLayout, setSelectedLayout] = useState<StickerLayout>('landscape');
  const [showCutGuide, setShowCutGuide] = useState(true);
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const publicUrl = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token || 'demo'}`;

  // Theme Configurations
  const themes = {
    high_vis: {
      name: 'High-Visibility Yellow',
      icon: '⚡',
      primaryDark: '#0f172a',
      accentColor: '#f59e0b',
      accentDark: '#d97706',
      accentText: '#000000',
      badgeBg: '#fef3c7',
      badgeText: '#92400e',
      border: '#f59e0b',
    },
    executive: {
      name: 'Executive Dark Gold',
      icon: '👑',
      primaryDark: '#090d16',
      accentColor: '#d97706',
      accentDark: '#b45309',
      accentText: '#ffffff',
      badgeBg: '#1e293b',
      badgeText: '#fcd34d',
      border: '#d97706',
    },
    modern_blue: {
      name: 'Fleet Navy & Indigo',
      icon: '🛡️',
      primaryDark: '#0f2042',
      accentColor: '#2563eb',
      accentDark: '#1d4ed8',
      accentText: '#ffffff',
      badgeBg: '#eff6ff',
      badgeText: '#1e40af',
      border: '#2563eb',
    }
  };

  const currentTheme = themes[selectedTheme];

  useEffect(() => {
    if (!isOpen || !vehicle.qr_token) return;

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
      .catch((err) => console.error('SVG QR error', err));
  }, [isOpen, vehicle.qr_token, publicUrl]);

  if (!isOpen) return null;

  const displayPlate =
    vehicle.display_plate_publicly === 1
      ? vehicle.vehicle_number
      : vehicle.vehicle_number.length > 4
      ? `${vehicle.vehicle_number.slice(0, 4)} •••• ${vehicle.vehicle_number.slice(-4)}`
      : '••••••••';

  // Helper function to draw the official BharatUtility Brand Emblem
  const drawBharatUtilityBrand = (ctx: CanvasRenderingContext2D, x: number, y: number, isDarkBg: boolean = true) => {
    ctx.save();
    // Logo Icon Box
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.roundRect(x, y, 42, 42, 10);
    ctx.fill();

    // Icon Symbol "₹U"
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('₹U', x + 21, y + 28);

    // Brand Name Typography
    ctx.textAlign = 'left';
    ctx.font = '900 24px sans-serif';
    ctx.fillStyle = isDarkBg ? '#ffffff' : '#0f172a';
    ctx.fillText('Bharat', x + 50, y + 25);

    ctx.fillStyle = '#6366f1';
    ctx.fillText('Utility', x + 130, y + 25);

    // TECH Pill
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(x + 208, y + 10, 48, 18, 5);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '900 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TECH', x + 232, y + 23);

    // Ecosystem Subtitle
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = isDarkBg ? '#94a3b8' : '#64748b';
    ctx.textAlign = 'left';
    ctx.fillText('PARKSIGNAL • OFFICIAL VEHICLE PASS', x + 50, y + 40);
    ctx.restore();
  };

  // High-Resolution 300-DPI Download Engine (Supports Landscape, Portrait, and Square)
  const downloadPng = () => {
    const compCanvas = document.createElement('canvas');
    let width = 1200;
    let height = 720;

    if (selectedLayout === 'portrait') {
      width = 1000;
      height = 1360;
    } else if (selectedLayout === 'square') {
      width = 1000;
      height = 1000;
    }

    compCanvas.width = width;
    compCanvas.height = height;
    const ctx = compCanvas.getContext('2d');
    if (!ctx) return;

    // Canvas Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // A. LANDSCAPE CARD LAYOUT (Visiting Card / Fastag Style)
    // ─────────────────────────────────────────────────────────────
    if (selectedLayout === 'landscape') {
      const pad = 24;
      const cW = width - pad * 2;
      const cH = height - pad * 2;

      // Cut guide line
      if (showCutGuide) {
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✂  CUT ALONG DOTTED LINE & PLACE INSIDE WINDSHIELD FACING OUTWARD  ✂', width / 2, 20);
        ctx.restore();
      }

      // Outer Card Frame
      ctx.fillStyle = currentTheme.primaryDark;
      ctx.beginPath();
      ctx.roundRect(pad, pad, cW, cH, 28);
      ctx.fill();

      // Inner White Card
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(pad + 6, pad + 6, cW - 12, cH - 12, 24);
      ctx.fill();

      // Top Dark Banner (Full Width)
      ctx.fillStyle = currentTheme.primaryDark;
      ctx.beginPath();
      ctx.roundRect(pad + 6, pad + 6, cW - 12, 85, [24, 24, 0, 0]);
      ctx.fill();

      // Accent Stripe
      ctx.fillStyle = currentTheme.accentColor;
      ctx.fillRect(pad + 6, pad + 88, cW - 12, 6);

      // Top Banner Brand Logo & Product Title
      drawBharatUtilityBrand(ctx, pad + 28, pad + 24, true);

      ctx.fillStyle = currentTheme.accentColor;
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('PARKSIGNAL', width - pad - 30, pad + 48);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('SMART VEHICLE ALERT PASS', width - pad - 30, pad + 68);

      // LEFT COLUMN: QR Code Box
      const qrBoxX = pad + 32;
      const qrBoxY = pad + 115;
      const qrSize = 420;

      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrSize, qrSize, 20);
      ctx.fill();
      ctx.stroke();

      if (canvasRef.current) {
        ctx.drawImage(canvasRef.current, qrBoxX + 20, qrBoxY + 20, qrSize - 40, qrSize - 40);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('@ParkSignal_bot', qrBoxX + qrSize / 2, qrBoxY + qrSize - 12);

      // RIGHT COLUMN: Vehicle Details & Instructions
      const rightX = qrBoxX + qrSize + 30;
      const rightW = width - pad - rightX - 25;

      // 1. Problem Callout Box
      ctx.fillStyle = currentTheme.accentColor;
      ctx.beginPath();
      ctx.roundRect(rightX, qrBoxY, rightW, 95, 18);
      ctx.fill();

      ctx.fillStyle = currentTheme.accentText;
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('WRONG PARKING? NEED ME TO MOVE?', rightX + 24, qrBoxY + 40);

      ctx.font = 'bold 17px sans-serif';
      ctx.fillText('📷 Scan QR to send me an instant private alert', rightX + 24, qrBoxY + 72);

      // 2. HSRP Plate Badge
      const plateY = qrBoxY + 115;
      const plateH = 88;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(rightX, plateY, rightW, plateH, 16);
      ctx.fill();
      ctx.stroke();

      // Blue IND Band
      ctx.fillStyle = '#003399';
      ctx.beginPath();
      ctx.roundRect(rightX, plateY, 75, plateH, [14, 0, 0, 14]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IND', rightX + 37, plateY + 52);

      // Plate Text
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${vehicle.vehicle_type.toUpperCase()} • ${displayPlate}`, rightX + 75 + (rightW - 75) / 2, plateY + 56);

      // 3. 3-Step Instruction Strip
      const stepY = plateY + 105;
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(rightX, stepY, rightW, 60, 14);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('1. Open Camera   ➜   2. Scan QR   ➜   3. Send Message', rightX + rightW / 2, stepY + 37);

      // 4. Privacy Footer
      const footY = stepY + 80;
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('🛡️ 100% Privacy Protected • Owner phone number is NEVER shared', rightX, footY + 10);

      ctx.fillStyle = '#64748b';
      ctx.font = '14px sans-serif';
      ctx.fillText('Direct alerts via Telegram @ParkSignal_bot • No app download required', rightX, footY + 34);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('bharatutility.tech/parksignal', rightX, footY + 56);
    }

    // ─────────────────────────────────────────────────────────────
    // B. PORTRAIT CARD LAYOUT (Standard Windshield Permit)
    // ─────────────────────────────────────────────────────────────
    else if (selectedLayout === 'portrait') {
      const pad = 36;
      const cW = width - pad * 2;
      const cH = height - pad * 2;

      // Cut guide
      if (showCutGuide) {
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(15, 15, width - 30, height - 30);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✂  CUT ALONG DOTTED LINE & PLACE INSIDE WINDSHIELD FACING OUTWARD  ✂', width / 2, 28);
        ctx.restore();
      }

      // Card Base
      ctx.fillStyle = currentTheme.primaryDark;
      ctx.beginPath();
      ctx.roundRect(pad, pad, cW, cH, 36);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(pad + 8, pad + 8, cW - 16, cH - 16, 30);
      ctx.fill();

      // Header Banner
      ctx.fillStyle = currentTheme.primaryDark;
      ctx.beginPath();
      ctx.roundRect(pad + 8, pad + 8, cW - 16, 175, [30, 30, 0, 0]);
      ctx.fill();

      ctx.fillStyle = currentTheme.accentColor;
      ctx.fillRect(pad + 8, pad + 180, cW - 16, 6);

      // Header Brand
      drawBharatUtilityBrand(ctx, pad + 32, pad + 32, true);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PARKSIGNAL', width / 2, pad + 130);

      ctx.fillStyle = currentTheme.accentColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('SMART PRIVACY VEHICLE PARKING ALERT', width / 2, pad + 160);

      // Callout Banner
      const callY = pad + 215;
      ctx.fillStyle = currentTheme.accentColor;
      ctx.beginPath();
      ctx.roundRect(pad + 40, callY, cW - 80, 105, 20);
      ctx.fill();

      ctx.fillStyle = currentTheme.accentText;
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WRONG PARKING? NEED ME TO MOVE?', width / 2, callY + 44);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('📷 Scan QR to send me an instant private alert', width / 2, callY + 80);

      // QR Code
      const qrBoxSize = 440;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = callY + 125;

      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();
      ctx.stroke();

      if (canvasRef.current) {
        ctx.drawImage(canvasRef.current, qrBoxX + 20, qrBoxY + 20, qrBoxSize - 40, qrBoxSize - 40);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('@ParkSignal_bot', width / 2, qrBoxY + qrBoxSize - 12);

      // 3 Steps
      const stepY = qrBoxY + qrBoxSize + 25;
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(pad + 40, stepY, cW - 80, 65, 14);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('1. Open Camera   ➜   2. Scan QR   ➜   3. Send Message', width / 2, stepY + 40);

      // HSRP Plate Badge
      const plateY = stepY + 85;
      const plateW = 620;
      const plateH = 92;
      const plateX = (width - plateW) / 2;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(plateX, plateY, plateW, plateH, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#003399';
      ctx.beginPath();
      ctx.roundRect(plateX, plateY, 80, plateH, [16, 0, 0, 16]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.fillText('IND', plateX + 40, plateY + 56);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 40px monospace';
      ctx.fillText(`${vehicle.vehicle_type.toUpperCase()} • ${displayPlate}`, plateX + 350, plateY + 60);

      // Privacy Footer
      const footY = plateY + 125;
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('🛡️ 100% Privacy Protected • Owner phone number is NEVER shared', width / 2, footY);

      ctx.fillStyle = '#64748b';
      ctx.font = '15px sans-serif';
      ctx.fillText('Alerts delivered via Telegram @ParkSignal_bot • No app required', width / 2, footY + 28);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('bharatutility.tech/parksignal', width / 2, footY + 52);
    }

    // ─────────────────────────────────────────────────────────────
    // C. SQUARE CARD LAYOUT (Compact Window Decal)
    // ─────────────────────────────────────────────────────────────
    else {
      const pad = 30;
      const cW = width - pad * 2;
      const cH = height - pad * 2;

      // Card Base
      ctx.fillStyle = currentTheme.primaryDark;
      ctx.beginPath();
      ctx.roundRect(pad, pad, cW, cH, 32);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(pad + 6, pad + 6, cW - 12, cH - 12, 26);
      ctx.fill();

      // Header Banner
      ctx.fillStyle = currentTheme.primaryDark;
      ctx.beginPath();
      ctx.roundRect(pad + 6, pad + 6, cW - 12, 130, [26, 26, 0, 0]);
      ctx.fill();

      ctx.fillStyle = currentTheme.accentColor;
      ctx.fillRect(pad + 6, pad + 135, cW - 12, 5);

      drawBharatUtilityBrand(ctx, pad + 25, pad + 20, true);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('PARKSIGNAL', width - pad - 25, pad + 45);

      ctx.fillStyle = currentTheme.accentColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('SCAN TO ALERT VEHICLE OWNER', width - pad - 25, pad + 70);

      // Centered QR Code
      const qrBoxSize = 460;
      const qrBoxX = (width - qrBoxSize) / 2;
      const qrBoxY = pad + 160;

      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 22);
      ctx.fill();
      ctx.stroke();

      if (canvasRef.current) {
        ctx.drawImage(canvasRef.current, qrBoxX + 20, qrBoxY + 20, qrBoxSize - 40, qrBoxSize - 40);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('@ParkSignal_bot', width / 2, qrBoxY + qrBoxSize - 12);

      // HSRP Badge
      const plateY = qrBoxY + qrBoxSize + 25;
      const plateW = 580;
      const plateH = 80;
      const plateX = (width - plateW) / 2;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(plateX, plateY, plateW, plateH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#003399';
      ctx.beginPath();
      ctx.roundRect(plateX, plateY, 70, plateH, [14, 0, 0, 14]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 20px sans-serif';
      ctx.fillText('IND', plateX + 35, plateY + 48);

      ctx.fillStyle = '#0f172a';
      ctx.font = '900 34px monospace';
      ctx.fillText(`${vehicle.vehicle_type.toUpperCase()} • ${displayPlate}`, plateX + 325, plateY + 52);

      // Privacy Footer
      const footY = plateY + 115;
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText('🛡️ Privacy Protected • No Phone Number Exposed • Free Bot Alerts', width / 2, footY);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText('bharatutility.tech/parksignal', width / 2, footY + 26);
    }

    // Trigger Download
    const link = document.createElement('a');
    link.download = `ParkSignal-${vehicle.vehicle_number}-${selectedLayout}-${selectedTheme}.png`;
    link.href = compCanvas.toDataURL('image/png');
    link.click();
    setDownloadSuccess(`Downloaded high-res ${selectedLayout} PNG!`);
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

  // Dedicated Print Routine that prints ONLY the sticker card cleanly
  const printCleanSticker = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const stickerElem = document.getElementById('parksignal-printable-sticker');
    if (!stickerElem) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ParkSignal QR Sticker - ${vehicle.vehicle_number}</title>
        <style>
          @page { size: auto; margin: 10mm; }
          body { font-family: system-ui, -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 90vh; margin: 0; background: white; }
          .sticker-container { transform: scale(1); max-width: ${selectedLayout === 'landscape' ? '650px' : '400px'}; width: 100%; }
          .cut-guide { border: 2px dashed #94a3b8; padding: 15px; border-radius: 20px; }
          .cut-text { text-align: center; font-size: 11px; color: #64748b; font-weight: bold; margin-bottom: 8px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="sticker-container">
          <div class="cut-guide">
            <div class="cut-text">✂ CUT ALONG DOTTED LINE & PLACE INSIDE WINDSHIELD FACING OUTWARD ✂</div>
            ${stickerElem.outerHTML}
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); window.close(); }, 250);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Printable Windshield Sticker
              </h3>
              <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                Premium Edition
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

        {/* Toolbar: Layout & Theme Selection */}
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          {/* Layout Options */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold text-neutral-500 mr-1 text-[11px]">Card Layout:</span>
            <button
              onClick={() => setSelectedLayout('landscape')}
              className={`py-1 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'landscape'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 rotate-90" />
              <span>Landscape (Visiting Card)</span>
            </button>
            <button
              onClick={() => setSelectedLayout('portrait')}
              className={`py-1 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'portrait'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Portrait Permit</span>
            </button>
            <button
              onClick={() => setSelectedLayout('square')}
              className={`py-1 px-2.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'square'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 border border-neutral-200 dark:border-neutral-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Square Decal</span>
            </button>
          </div>

          {/* Color Themes */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-bold text-neutral-500 mr-1 text-[11px]">Style:</span>
            {(['high_vis', 'executive', 'modern_blue'] as StickerTheme[]).map((thm) => (
              <button
                key={thm}
                onClick={() => setSelectedTheme(thm)}
                className={`py-1 px-2 rounded-lg font-bold text-xs flex items-center gap-1 transition-all ${
                  selectedTheme === thm
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>{themes[thm].icon}</span>
                <span>{thm === 'high_vis' ? 'Yellow' : thm === 'executive' ? 'Gold' : 'Navy'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Sticker Card Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-neutral-100/80 dark:bg-neutral-950/70">
          <div
            id="parksignal-printable-sticker"
            className={`w-full bg-white text-neutral-900 rounded-3xl overflow-hidden shadow-2xl border-4 transition-all duration-300 relative ${
              selectedLayout === 'landscape' ? 'max-w-[540px]' : selectedLayout === 'portrait' ? 'max-w-[340px]' : 'max-w-[380px]'
            } ${
              showCutGuide ? 'ring-2 ring-dashed ring-neutral-400 ring-offset-4 ring-offset-neutral-100 dark:ring-offset-neutral-900' : ''
            }`}
            style={{ borderColor: currentTheme.primaryDark }}
          >
            {/* ─────────────────────────────────────────────────────────────
                PREVIEW: LANDSCAPE LAYOUT
               ───────────────────────────────────────────────────────────── */}
            {selectedLayout === 'landscape' ? (
              <div className="flex flex-col">
                {/* Brand Header */}
                <div
                  className="py-2.5 px-4 text-white flex items-center justify-between"
                  style={{ backgroundColor: currentTheme.primaryDark }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                      ₹U
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-xs leading-none text-white">
                        Bharat<span className="text-indigo-400">Utility</span>
                      </div>
                      <div className="text-[8px] text-neutral-400 font-medium">
                        PARKSIGNAL PASS
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-sm uppercase tracking-wider" style={{ color: currentTheme.accentColor }}>
                      PARKSIGNAL
                    </div>
                    <div className="text-[8px] text-neutral-400 uppercase tracking-widest font-bold">
                      Privacy Parking Pass
                    </div>
                  </div>
                </div>
                <div className="h-1 w-full" style={{ backgroundColor: currentTheme.accentColor }} />

                {/* Body: Left QR, Right Details */}
                <div className="p-4 flex items-center gap-4">
                  {/* Left QR */}
                  <div className="shrink-0 p-2 bg-neutral-50 rounded-2xl border border-neutral-200 text-center shadow-inner">
                    <canvas ref={canvasRef} className="w-36 h-36 block mx-auto" />
                    <div className="text-[9px] font-mono font-bold text-neutral-400 mt-1">
                      @ParkSignal_bot
                    </div>
                  </div>

                  {/* Right Details */}
                  <div className="flex-1 min-w-0 text-left">
                    {/* Callout */}
                    <div
                      className="py-1.5 px-2.5 rounded-xl font-black text-[11px] uppercase tracking-wide mb-2 leading-tight shadow-xs"
                      style={{
                        backgroundColor: currentTheme.accentColor,
                        color: currentTheme.accentText,
                      }}
                    >
                      <div>WRONG PARKING? NEED TO MOVE?</div>
                      <div className="text-[9px] font-bold mt-0.5 opacity-90">
                        Scan QR to send me an instant private alert
                      </div>
                    </div>

                    {/* HSRP Plate */}
                    <div className="flex items-center bg-white rounded-lg border-2 border-neutral-900 overflow-hidden shadow-xs mb-2">
                      <div className="bg-[#003399] text-white px-2 py-1 flex items-center justify-center font-black text-[9px] leading-none">
                        IND
                      </div>
                      <div className="px-2 py-0.5 flex-1 text-center font-mono font-black text-xs tracking-wider text-neutral-900">
                        {vehicle.vehicle_type.toUpperCase()} • {displayPlate}
                      </div>
                    </div>

                    {/* 3 Step Instruction */}
                    <div className="py-1 px-1.5 bg-neutral-100 rounded-lg text-[9px] font-bold text-neutral-700 flex items-center justify-between border border-neutral-200 mb-2">
                      <span>1. Scan QR</span>
                      <span className="text-neutral-300">➜</span>
                      <span>2. Pick Alert</span>
                      <span className="text-neutral-300">➜</span>
                      <span className="text-emerald-700">3. Delivered</span>
                    </div>

                    {/* Privacy */}
                    <div className="text-[8px] text-neutral-500 leading-tight">
                      <div className="font-bold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" /> 100% Privacy Protected
                      </div>
                      Owner phone number is never shared • Free Telegram alerts
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ─────────────────────────────────────────────────────────────
                  PREVIEW: PORTRAIT & SQUARE LAYOUTS
                 ───────────────────────────────────────────────────────────── */
              <div>
                {/* Brand Header */}
                <div
                  className="py-3 px-4 text-white text-center relative"
                  style={{ backgroundColor: currentTheme.primaryDark }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white font-black text-[10px]">
                      ₹U
                    </div>
                    <span className="font-black text-sm tracking-wider uppercase">
                      PARKSIGNAL
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-black">
                      TECH
                    </span>
                  </div>
                  <div
                    className="text-[9px] font-extrabold uppercase tracking-widest"
                    style={{ color: currentTheme.accentColor }}
                  >
                    By BharatUtility • Privacy Vehicle Alert
                  </div>
                  <div
                    className="h-1 w-full absolute bottom-0 left-0"
                    style={{ backgroundColor: currentTheme.accentColor }}
                  />
                </div>

                <div className="p-4 text-center">
                  {/* Urgent Callout */}
                  <div
                    className="py-2 px-2.5 rounded-xl font-black text-xs uppercase tracking-wide shadow-xs leading-tight mb-2.5"
                    style={{
                      backgroundColor: currentTheme.accentColor,
                      color: currentTheme.accentText,
                    }}
                  >
                    <div>WRONG PARKING? NEED ME TO MOVE?</div>
                    <div className="text-[10px] font-bold mt-0.5 opacity-90">
                      Scan QR below to send instant private alert
                    </div>
                  </div>

                  {/* QR Box */}
                  <div className="relative inline-block p-2.5 bg-neutral-50 rounded-2xl border-2 border-neutral-200 shadow-inner my-1">
                    <canvas ref={canvasRef} className="w-40 h-40 sm:w-44 sm:h-44 block mx-auto" />
                    <div className="text-[9px] font-extrabold tracking-wider text-neutral-400 uppercase mt-1">
                      @ParkSignal_bot
                    </div>
                  </div>

                  {/* 3 Step Instruction */}
                  <div className="mt-2 py-1 px-2 bg-neutral-100 rounded-xl text-[9px] font-bold text-neutral-700 flex items-center justify-around border border-neutral-200">
                    <span className="flex items-center gap-0.5">
                      <Camera className="w-2.5 h-2.5 text-neutral-500" /> 1. Scan
                    </span>
                    <span className="text-neutral-300">➜</span>
                    <span className="flex items-center gap-0.5">
                      <Smartphone className="w-2.5 h-2.5 text-neutral-500" /> 2. Alert
                    </span>
                    <span className="text-neutral-300">➜</span>
                    <span className="text-emerald-700 font-black">
                      3. Delivered
                    </span>
                  </div>

                  {/* HSRP Plate Badge */}
                  <div className="mt-2.5 flex items-center justify-center bg-white rounded-xl border-2 border-neutral-900 overflow-hidden shadow-xs">
                    <div className="bg-[#003399] text-white px-2.5 py-1.5 flex flex-col items-center justify-center font-black text-[9px] leading-none">
                      <span>IND</span>
                    </div>
                    <div className="py-1 px-3 text-center flex-1">
                      <div className="text-[8px] font-bold uppercase text-neutral-500 tracking-wider">
                        {vehicle.vehicle_type}
                      </div>
                      <div className="text-xs font-black font-mono tracking-wider text-neutral-900">
                        {displayPlate}
                      </div>
                    </div>
                  </div>

                  {/* Privacy Footer */}
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 text-center">
                    <div className="text-[9px] font-bold text-emerald-700 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      100% Privacy Protected
                    </div>
                    <p className="text-[8px] text-neutral-500 mt-0.5">
                      Owner phone number is never shared • Instant Telegram alert • No app required
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 text-[11px] text-neutral-500 text-center">
            💡 <strong>Recommended Format:</strong> <strong>Landscape (Visiting Card)</strong> is the standard size for car windshield corners & Fastag tags.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70 flex flex-wrap items-center justify-between gap-2.5">
          {downloadSuccess && (
            <div className="w-full text-center text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1 pb-1">
              <Check className="w-4 h-4" /> {downloadSuccess}
            </div>
          )}

          {/* Clean Print (Prints ONLY the sticker card without webpage chrome) */}
          <button
            onClick={printCleanSticker}
            className="py-2.5 px-3.5 rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors shadow-xs"
            title="Prints only the clean sticker without website elements"
          >
            <Printer className="w-4 h-4" /> Print Sticker
          </button>

          {/* Primary High-DPI Download */}
          <button
            onClick={downloadPng}
            className="flex-1 min-w-[160px] py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" /> Download {selectedLayout.toUpperCase()} PNG
          </button>

          {/* SVG Download */}
          <button
            onClick={downloadSvg}
            className="py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-white dark:hover:bg-neutral-800 transition-colors"
            title="Download Vector SVG for vinyl printing"
          >
            SVG
          </button>
        </div>
      </div>
    </div>
  );
};
