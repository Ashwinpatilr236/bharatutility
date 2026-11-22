import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Printer, ShieldCheck, Car, Check } from 'lucide-react';
import { ParkSignalVehicle } from '../../types';

interface ParkSignalStickerModalProps {
  vehicle: ParkSignalVehicle;
  isOpen: boolean;
  onClose: () => void;
}

export const ParkSignalStickerModal: React.FC<ParkSignalStickerModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const publicUrl = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token || 'demo'}`;

  useEffect(() => {
    if (!isOpen || !vehicle.qr_token) return;

    // Generate high-resolution QR canvas
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, publicUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
    }

    // Generate SVG string
    QRCode.toString(publicUrl, {
      type: 'svg',
      width: 400,
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

    setQrUrl(publicUrl);
  }, [isOpen, vehicle.qr_token, publicUrl]);

  if (!isOpen) return null;

  const displayPlate =
    vehicle.display_plate_publicly === 1
      ? vehicle.vehicle_number
      : vehicle.vehicle_number.length > 4
      ? `${vehicle.vehicle_number.slice(0, 4)} •••• ${vehicle.vehicle_number.slice(-4)}`
      : '••••••••';

  const downloadPng = () => {
    // Render full sticker on a composite canvas for download
    const compCanvas = document.createElement('canvas');
    compCanvas.width = 800;
    compCanvas.height = 1000;
    const ctx = compCanvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(0, 0, 800, 1000, 40);
    ctx.fill();

    // Border
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#0f172a';
    ctx.roundRect(10, 10, 780, 980, 36);
    ctx.stroke();

    // Header Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 10, 780, 160);

    // Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARKSIGNAL', 400, 75);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('BY BHARATUTILITY • PARKING ALERT SYSTEM', 400, 115);

    // Callout
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(80, 200, 640, 60);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('SCAN TO CONTACT VEHICLE OWNER', 400, 242);

    // QR Code
    if (canvasRef.current) {
      ctx.drawImage(canvasRef.current, 180, 290, 440, 440);
    }

    // Vehicle Plate box
    ctx.fillStyle = '#f1f5f9';
    ctx.roundRect(100, 760, 600, 90, 16);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`${vehicle.vehicle_type.toUpperCase()} • ${displayPlate}`, 400, 818);

    // Privacy Footer
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('🛡️ Privacy Protected • Instant Telegram Alerts via @ParkSignal_bot', 400, 890);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('bharatutility.tech/parksignal', 400, 930);

    const link = document.createElement('a');
    link.download = `ParkSignal-Sticker-${vehicle.vehicle_number}.png`;
    link.href = compCanvas.toDataURL('image/png');
    link.click();
    setDownloadSuccess('PNG downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const downloadSvg = () => {
    if (!svgDataUrl) return;
    const link = document.createElement('a');
    link.download = `ParkSignal-QR-${vehicle.vehicle_number}.svg`;
    link.href = svgDataUrl;
    link.click();
    setDownloadSuccess('SVG downloaded!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const printSticker = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Printable Windshield Sticker
            </h3>
            <p className="text-xs text-neutral-500">
              High-resolution QR sticker for {vehicle.vehicle_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticker Preview Container */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          <div
            id="parksignal-printable-sticker"
            className="w-full max-w-xs bg-white text-neutral-900 rounded-3xl p-5 border-4 border-slate-900 shadow-xl flex flex-col items-center text-center relative"
          >
            {/* Header Badge */}
            <div className="w-full bg-slate-900 text-white rounded-2xl py-2 px-3 mb-3">
              <span className="font-extrabold text-sm tracking-wider uppercase block">
                PARKSIGNAL
              </span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
                BY BHARATUTILITY
              </span>
            </div>

            {/* Instruction Banner */}
            <div className="w-full bg-amber-400 text-slate-950 font-black text-xs py-1.5 px-2 rounded-xl uppercase tracking-wider mb-3 shadow-xs">
              Scan to Contact Vehicle Owner
            </div>

            {/* Rendered QR Code */}
            <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-inner my-1">
              <canvas ref={canvasRef} className="w-48 h-48 block" />
            </div>

            {/* Vehicle Plate & Type */}
            <div className="w-full bg-slate-100 rounded-xl py-2 px-3 my-3 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                {vehicle.vehicle_type}
              </span>
              <span className="text-sm font-black font-mono tracking-wider text-slate-900">
                {displayPlate}
              </span>
            </div>

            {/* Privacy Footer */}
            <div className="text-[9px] text-slate-500 font-medium leading-tight">
              <div className="flex items-center justify-center gap-1 font-semibold text-slate-700 mb-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Privacy Protected
              </div>
              Alerts delivered instantly via Telegram @ParkSignal_bot
            </div>
          </div>

          {/* Quick Notice */}
          <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 text-xs text-neutral-500 max-w-xs text-center">
            💡 <strong>Placement Tip:</strong> Print and tape inside your vehicle's front or rear windshield so scanners can easily view it from outside.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3">
          {downloadSuccess && (
            <div className="w-full text-center text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1">
              <Check className="w-4 h-4" /> {downloadSuccess}
            </div>
          )}
          <button
            onClick={printSticker}
            className="flex-1 min-w-[120px] py-2.5 px-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Sticker
          </button>
          <button
            onClick={downloadPng}
            className="flex-1 min-w-[120px] py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            <Download className="w-4 h-4" /> Download PNG
          </button>
          <button
            onClick={downloadSvg}
            className="py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Download Vector SVG"
          >
            SVG
          </button>
        </div>
      </div>
    </div>
  );
};
