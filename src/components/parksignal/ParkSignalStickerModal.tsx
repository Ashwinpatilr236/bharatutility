import React, { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { ParkSignalLogo } from './ParkSignalLogo';
import {
  X,
  Download,
  ShieldCheck,
  Check,
  Camera,
  Scissors,
  Sparkles,
  Zap,
  Sun,
  Moon,
  Flame,
  LayoutTemplate,
  Layers
} from 'lucide-react';
import { ParkSignalVehicle } from '../../types';

interface ParkSignalStickerModalProps {
  vehicle: ParkSignalVehicle;
  isOpen: boolean;
  onClose: () => void;
}

type StickerTheme = 'bright_yellow' | 'clean_white' | 'carbon_dark' | 'safety_orange';
type StickerLayout = 'landscape' | 'square';

export const ParkSignalStickerModal: React.FC<ParkSignalStickerModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedTheme, setSelectedTheme] = useState<StickerTheme>('bright_yellow');
  const [selectedLayout, setSelectedLayout] = useState<StickerLayout>('landscape');
  const [showCutBorder, setShowCutBorder] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const publicUrl = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token || 'demo'}`;

  // Attention-Grabbing Color Palettes
  const themes = {
    bright_yellow: {
      id: 'bright_yellow',
      name: 'Safety Yellow (Recommended)',
      shortName: 'Safety Yellow',
      icon: Sun,
      cardBg: '#FFDE00', // Vibrant Road Safety Yellow
      cardBorder: '#000000',
      headerBg: '#090D16',
      headerText: '#FFFFFF',
      calloutBg: '#090D16',
      calloutText: '#FFDE00',
      calloutSub: '#FFFFFF',
      qrBg: '#FFFFFF',
      qrBorder: '#000000',
      stripBg: '#090D16',
      stripText: '#FFFFFF',
      accentPillBg: '#000000',
      accentPillText: '#FFDE00',
      footerText: '#000000',
      footerSub: '#333333',
      tagline: 'MAXIMUM DAYLIGHT & TINT VISIBILITY'
    },
    clean_white: {
      id: 'clean_white',
      name: 'Crisp White & Yellow',
      shortName: 'Crisp White',
      icon: Zap,
      cardBg: '#FFFFFF',
      cardBorder: '#090D16',
      headerBg: '#090D16',
      headerText: '#FFFFFF',
      calloutBg: '#FFDE00',
      calloutText: '#000000',
      calloutSub: '#111827',
      qrBg: '#FFFFFF',
      qrBorder: '#FFDE00',
      stripBg: '#F3F4F6',
      stripText: '#111827',
      accentPillBg: '#090D16',
      accentPillText: '#FFDE00',
      footerText: '#047857',
      footerSub: '#4B5563',
      tagline: 'CLEAN EXECUTIVE FINISH'
    },
    carbon_dark: {
      id: 'carbon_dark',
      name: 'Stealth Carbon Black',
      shortName: 'Carbon Black',
      icon: Moon,
      cardBg: '#090D16',
      cardBorder: '#FFDE00',
      headerBg: '#000000',
      headerText: '#FFFFFF',
      calloutBg: '#FFDE00',
      calloutText: '#000000',
      calloutSub: '#000000',
      qrBg: '#FFFFFF',
      qrBorder: '#FFDE00',
      stripBg: '#1F2937',
      stripText: '#F9FAFB',
      accentPillBg: '#1F2937',
      accentPillText: '#FFDE00',
      footerText: '#10B981',
      footerSub: '#9CA3AF',
      tagline: 'HIGH-CONTRAST NIGHT EDITION'
    },
    safety_orange: {
      id: 'safety_orange',
      name: 'Emergency Road Orange',
      shortName: 'Safety Orange',
      icon: Flame,
      cardBg: '#FF5722', // High-Alert Road Orange
      cardBorder: '#000000',
      headerBg: '#090D16',
      headerText: '#FFFFFF',
      calloutBg: '#090D16',
      calloutText: '#FFCCBC',
      calloutSub: '#FFFFFF',
      qrBg: '#FFFFFF',
      qrBorder: '#000000',
      stripBg: '#090D16',
      stripText: '#FFFFFF',
      accentPillBg: '#000000',
      accentPillText: '#FFCCBC',
      footerText: '#000000',
      footerSub: '#262626',
      tagline: 'URGENT HAZARD ALERT GRADE'
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

  // Helper to draw crisp ParkSignal Car & Radar Emblem on Canvas
  const drawParkSignalEmblem = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) => {
    ctx.save();
    // Outer signal wave
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size * 0.44, size * 0.38, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    // Inner signal wave
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size * 0.44, size * 0.24, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();

    // Vehicle roof & hood
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.16, y + size * 0.74);
    ctx.lineTo(x + size * 0.32, y + size * 0.52);
    ctx.lineTo(x + size * 0.68, y + size * 0.52);
    ctx.lineTo(x + size * 0.84, y + size * 0.74);
    ctx.closePath();
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#06B6D4';
    ctx.beginPath();
    ctx.arc(x + size * 0.32, y + size * 0.78, size * 0.08, 0, Math.PI * 2);
    ctx.arc(x + size * 0.68, y + size * 0.78, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Render the Master Canvas (What you see is exactly what downloads)
  const renderMasterCanvas = useCallback(async () => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate crisp QR in offscreen canvas
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, publicUrl, {
      width: 520,
      margin: 1,
      color: {
        dark: '#050811',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    const isLandscape = selectedLayout === 'landscape';
    const W = isLandscape ? 1200 : 1080;
    const H = isLandscape ? 720 : 1080;

    canvas.width = W;
    canvas.height = H;

    // Base background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Optional Cut Guide Border
    const pad = showCutBorder ? 22 : 12;
    if (showCutBorder) {
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✂  CUT ALONG DOTTED LINE & PLACE INSIDE WINDSHIELD FACING OUTWARD  ✂', W / 2, 17);
      ctx.restore();
    }

    const cardW = W - pad * 2;
    const cardH = H - pad * 2;

    // Outer Card Body
    ctx.fillStyle = currentTheme.cardBg;
    drawRoundRect(ctx, pad, pad, cardW, cardH, 26);
    ctx.fill();

    // Outer Border
    ctx.lineWidth = 5;
    ctx.strokeStyle = currentTheme.cardBorder;
    drawRoundRect(ctx, pad, pad, cardW, cardH, 26);
    ctx.stroke();

    // ── Helper to draw Brand Header with Crisp Dual Logos ──
    const drawHeader = (headerH: number, title: string, subtitle: string) => {
      ctx.fillStyle = currentTheme.headerBg;
      drawRoundRect(ctx, pad, pad, cardW, headerH, [24, 24, 0, 0]);
      ctx.fill();

      // 1. Left: BharatUtility Brand Emblem
      const bX = pad + 22;
      const bY = pad + (headerH - 46) / 2;

      // Indigo Monogram Box
      ctx.fillStyle = '#4F46E5';
      drawRoundRect(ctx, bX, bY, 44, 44, 11);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('₹U', bX + 22, bY + 31);

      // BharatUtility Text
      ctx.textAlign = 'left';
      ctx.font = '900 23px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Bharat', bX + 54, bY + 26);
      ctx.fillStyle = '#818CF8';
      ctx.fillText('Utility', bX + 130, bY + 26);

      // TECH Tag
      ctx.fillStyle = '#F59E0B';
      drawRoundRect(ctx, bX + 214, bY + 10, 44, 20, 5);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.font = '900 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TECH', bX + 236, bY + 24);

      // Subtext
      ctx.textAlign = 'left';
      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('OFFICIAL CITIZEN UTILITY PLATFORM', bX + 54, bY + 41);

      // 2. Right: Official ParkSignal Emblem & Title
      const rightEdge = W - pad - 22;
      drawParkSignalEmblem(ctx, rightEdge - 270, bY - 1, 46);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFDE00';
      ctx.font = '900 27px system-ui, -apple-system, sans-serif';
      ctx.fillText(title, rightEdge, bY + 26);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '800 11px system-ui, -apple-system, sans-serif';
      ctx.fillText(subtitle, rightEdge, bY + 41);
    };

    // ─────────────────────────────────────────────────────────────
    // FORMAT 1: LANDSCAPE CARD (FASTAG SIZE - 1200x720)
    // ─────────────────────────────────────────────────────────────
    if (isLandscape) {
      const headerH = 78;
      drawHeader(headerH, 'PARKSIGNAL', 'FASTAG-SIZE SMART VEHICLE PASS');

      // ── LEFT COLUMN: QR CODE CARD ──
      const qrBoxX = pad + 20;
      const qrBoxY = pad + headerH + 16;
      const qrBoxW = 430;
      const qrBoxH = cardH - headerH - 32;

      ctx.fillStyle = currentTheme.qrBg;
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 20);
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = currentTheme.qrBorder;
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 20);
      ctx.stroke();

      // Draw QR Code centered with breathing room
      const qrActual = 370;
      ctx.drawImage(qrCanvas, qrBoxX + (qrBoxW - qrActual) / 2, qrBoxY + 16, qrActual, qrActual);

      // Below QR: Scanner instruction badge
      const qrFootY = qrBoxY + qrActual + 22;
      const qrFootH = 64;
      ctx.fillStyle = '#090D16';
      drawRoundRect(ctx, qrBoxX + 16, qrFootY, qrBoxW - 32, qrFootH, 14);
      ctx.fill();

      ctx.fillStyle = '#FFDE00';
      ctx.font = '900 16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📷 SCAN WITH PHONE CAMERA', qrBoxX + qrBoxW / 2, qrFootY + 28);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('No App Download • Works on Any Phone', qrBoxX + qrBoxW / 2, qrFootY + 48);

      // ── RIGHT COLUMN: USER & SCANNER GUIDES ──
      const rightX = qrBoxX + qrBoxW + 20;
      const rightW = W - pad - rightX - 20;

      // 1. High-Impact Urgent Callout Banner
      const calloutH = 94;
      ctx.fillStyle = currentTheme.calloutBg;
      drawRoundRect(ctx, rightX, qrBoxY, rightW, calloutH, 18);
      ctx.fill();

      // Heading with safety check against text overflow
      const calloutHead = '🚨 NEED THIS VEHICLE MOVED?';
      let calloutHeadSize = 26;
      ctx.font = `900 ${calloutHeadSize}px system-ui, -apple-system, sans-serif`;
      while (ctx.measureText(calloutHead).width > rightW - 40 && calloutHeadSize > 18) {
        calloutHeadSize -= 1;
        ctx.font = `900 ${calloutHeadSize}px system-ui, -apple-system, sans-serif`;
      }
      ctx.textAlign = 'left';
      ctx.fillStyle = currentTheme.calloutText;
      ctx.fillText(calloutHead, rightX + 20, qrBoxY + 38);

      const calloutSub = 'Wrong parking or emergency? Alert owner privately in 5 seconds.';
      ctx.fillStyle = currentTheme.calloutSub;
      ctx.font = '800 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(calloutSub, rightX + 20, qrBoxY + 70);

      // 2. Authentic Indian HSRP Number Plate Badge
      const plateY = qrBoxY + calloutH + 14;
      const plateH = 82;

      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, rightX, plateY, rightW, plateH, 16);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      drawRoundRect(ctx, rightX, plateY, rightW, plateH, 16);
      ctx.stroke();

      // Blue IND Band
      const indBandW = 74;
      ctx.fillStyle = '#003399';
      drawRoundRect(ctx, rightX, plateY, indBandW, plateH, [13, 0, 0, 13]);
      ctx.fill();

      // Chakra Circle
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rightX + indBandW / 2, plateY + 28, 9, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IND', rightX + indBandW / 2, plateY + 58);

      // Plate Text with dynamic font scaling to strictly prevent border collisions
      const plateAvailableW = rightW - indBandW - 30;
      const plateCenter = rightX + indBandW + plateAvailableW / 2;
      const plateText = `${vehicle.vehicle_type.toUpperCase()}  •  ${displayPlate}`;

      let plateFontSize = 38;
      ctx.font = `900 ${plateFontSize}px monospace`;
      while (ctx.measureText(plateText).width > plateAvailableW && plateFontSize > 20) {
        plateFontSize -= 2;
        ctx.font = `900 ${plateFontSize}px monospace`;
      }
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(plateText, plateCenter, plateY + 52);

      // 3. Clear 3-Step Guide (Large & Easy to Read from Distance)
      const stepY = plateY + plateH + 14;
      const stepH = 138;

      ctx.fillStyle = currentTheme.stripBg;
      drawRoundRect(ctx, rightX, stepY, rightW, stepH, 16);
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = currentTheme.cardBorder;
      drawRoundRect(ctx, rightX, stepY, rightW, stepH, 16);
      ctx.stroke();

      ctx.fillStyle = currentTheme.stripText;
      ctx.textAlign = 'left';
      ctx.font = '900 13px system-ui, -apple-system, sans-serif';
      ctx.fillText('HOW TO ALERT OWNER (QUICK & ANONYMOUS):', rightX + 16, stepY + 24);

      // 3 Step Columns side-by-side
      const stepColW = (rightW - 32 - 16) / 3;
      const steps = [
        { num: '1', title: 'Open Camera', desc: 'Scan QR with phone' },
        { num: '2', title: 'Tap Alert', desc: 'Opens in browser' },
        { num: '3', title: 'Send Note', desc: 'Instant Telegram alert' },
      ];

      steps.forEach((step, idx) => {
        const sX = rightX + 16 + idx * (stepColW + 8);
        const sY = stepY + 34;
        const sH = 88;

        ctx.fillStyle = '#FFFFFF';
        drawRoundRect(ctx, sX, sY, stepColW, sH, 12);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#CBD5E1';
        drawRoundRect(ctx, sX, sY, stepColW, sH, 12);
        ctx.stroke();

        // Step Number Badge
        ctx.fillStyle = '#0F172A';
        drawRoundRect(ctx, sX + 10, sY + 10, 24, 24, 6);
        ctx.fill();
        ctx.fillStyle = '#FFDE00';
        ctx.font = '900 13px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(step.num, sX + 22, sY + 26);

        // Step Title
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0F172A';
        ctx.font = '900 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(step.title, sX + 38, sY + 26);

        // Step Description
        ctx.fillStyle = '#64748B';
        ctx.font = '700 11px system-ui, -apple-system, sans-serif';
        ctx.fillText(step.desc, sX + 10, sY + 54);
        ctx.fillText('No App Required', sX + 10, sY + 70);
      });

      // 4. Privacy Footer & Telegram Assurance
      const footY = stepY + stepH + 14;
      const footH = 64;

      ctx.fillStyle = currentTheme.accentPillBg;
      drawRoundRect(ctx, rightX, footY, rightW, footH, 14);
      ctx.fill();

      ctx.fillStyle = currentTheme.accentPillText;
      ctx.font = '900 15px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 100% PRIVATE • OWNER PHONE NUMBER IS NEVER SHARED', rightX + rightW / 2, footY + 27);

      ctx.fillStyle = currentTheme.calloutSub;
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Direct Telegram Alert • No OTP • Free Instant Delivery • bharatutility.tech/parksignal', rightX + rightW / 2, footY + 47);
    }

    // ─────────────────────────────────────────────────────────────
    // FORMAT 2: SQUARE DECAL FORMAT (1080x1080)
    // ─────────────────────────────────────────────────────────────
    else {
      const headerH = 100;
      drawHeader(headerH, 'PARKSIGNAL', 'SMART VEHICLE PRIVACY PASS');

      // 1. Callout Banner
      const callY = pad + headerH + 20;
      const callH = 88;
      ctx.fillStyle = currentTheme.calloutBg;
      drawRoundRect(ctx, pad + 24, callY, cardW - 48, callH, 18);
      ctx.fill();

      ctx.fillStyle = currentTheme.calloutText;
      ctx.textAlign = 'center';
      ctx.font = '900 26px system-ui, -apple-system, sans-serif';
      ctx.fillText('🚨 WRONG PARKING? NEED THIS VEHICLE MOVED?', W / 2, callY + 38);

      ctx.fillStyle = currentTheme.calloutSub;
      ctx.font = '800 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('Scan QR with phone camera to send an instant private alert', W / 2, callY + 68);

      // 2. Large QR Code Box
      const qrBoxSize = 470;
      const qrBoxX = (W - qrBoxSize) / 2;
      const qrBoxY = callY + callH + 20;

      ctx.fillStyle = currentTheme.qrBg;
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = currentTheme.qrBorder;
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.stroke();

      ctx.drawImage(qrCanvas, qrBoxX + 20, qrBoxY + 16, qrBoxSize - 40, qrBoxSize - 40);

      // 3. Authentic Indian HSRP Plate
      const plateY = qrBoxY + qrBoxSize + 20;
      const plateW = cardW - 48;
      const plateH = 82;
      const plateX = (W - plateW) / 2;

      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, plateX, plateY, plateW, plateH, 16);
      ctx.fill();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      drawRoundRect(ctx, plateX, plateY, plateW, plateH, 16);
      ctx.stroke();

      // Blue IND Band
      const indW = 76;
      ctx.fillStyle = '#003399';
      drawRoundRect(ctx, plateX, plateY, indW, plateH, [13, 0, 0, 13]);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(plateX + indW / 2, plateY + 28, 9, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IND', plateX + indW / 2, plateY + 58);

      // Plate Text with dynamic scaling
      const plateAvailableW = plateW - indW - 30;
      const plateCenter = plateX + indW + plateAvailableW / 2;
      const plateText = `${vehicle.vehicle_type.toUpperCase()}  •  ${displayPlate}`;

      let plateFontSize = 38;
      ctx.font = `900 ${plateFontSize}px monospace`;
      while (ctx.measureText(plateText).width > plateAvailableW && plateFontSize > 20) {
        plateFontSize -= 2;
        ctx.font = `900 ${plateFontSize}px monospace`;
      }
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(plateText, plateCenter, plateY + 52);

      // 4. Large Steps & Assurance
      const stepY = plateY + plateH + 16;
      const stepH = 68;

      ctx.fillStyle = currentTheme.stripBg;
      drawRoundRect(ctx, plateX, stepY, plateW, stepH, 14);
      ctx.fill();

      ctx.fillStyle = currentTheme.stripText;
      ctx.textAlign = 'center';
      ctx.font = '900 19px system-ui, -apple-system, sans-serif';
      ctx.fillText('1. Open Camera   ➜   2. Scan QR   ➜   3. Send Alert to Owner', W / 2, stepY + 41);

      // 5. Privacy Footer
      const footY = stepY + stepH + 20;
      const footH = 58;

      ctx.fillStyle = currentTheme.accentPillBg;
      drawRoundRect(ctx, plateX, footY, plateW, footH, 14);
      ctx.fill();

      ctx.fillStyle = currentTheme.accentPillText;
      ctx.textAlign = 'center';
      ctx.font = '900 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('🔒 100% PRIVATE • NO APP • NO LOGIN • NO PHONE NUMBER SHARED', W / 2, footY + 26);

      ctx.fillStyle = currentTheme.calloutSub;
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Direct Telegram Alert • Fastag Pass • bharatutility.tech/parksignal', W / 2, footY + 45);
    }
  }, [isOpen, publicUrl, selectedLayout, selectedTheme, showCutBorder, vehicle.vehicle_number, vehicle.vehicle_type, displayPlate, currentTheme]);

  // Re-render master canvas whenever options change
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
      <div className="relative w-full max-w-4xl bg-neutral-900 text-white rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <ParkSignalLogo variant="emblem" height={34} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Printable Windshield Sticker</span>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-black">
                    Premium Fastag Pass
                  </span>
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                High-visibility smart parking sticker for <strong className="text-white">{vehicle.vehicle_number}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Format, Colors, Cut Border */}
        <div className="px-4 py-3 bg-neutral-950/90 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          {/* Format Selection */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-400 text-[11px]">Format:</span>
            <button
              onClick={() => setSelectedLayout('landscape')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'landscape'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 rotate-90" />
              <span>🚘 Landscape Card (Fastag Size)</span>
            </button>
            <button
              onClick={() => setSelectedLayout('square')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'square'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>🔲 Square Decal</span>
            </button>
          </div>

          {/* Color Palettes */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-400 text-[11px]">Color:</span>
            {(['bright_yellow', 'clean_white', 'carbon_dark', 'safety_orange'] as StickerTheme[]).map((thm) => {
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
                  <Icon className="w-3.5 h-3.5" style={{ color: themes[thm].cardBg === '#FFFFFF' ? '#FFDE00' : themes[thm].cardBg }} />
                  <span>{themes[thm].shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Cut Border Toggle */}
          <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCutBorder}
              onChange={(e) => setShowCutBorder(e.target.checked)}
              className="rounded text-amber-500"
            />
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Cut Border</span>
          </label>
        </div>

        {/* Live Canvas Preview (Zero distortion, 100% pixel-perfect match) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/70">
          <div className="relative w-full max-w-2xl flex items-center justify-center">
            {/* The Master Canvas is displayed directly */}
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto rounded-2xl shadow-2xl transition-all duration-300"
              style={{
                maxHeight: '52vh',
                boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8)'
              }}
            />
          </div>

          <div className="mt-3 text-xs text-neutral-400 text-center flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>100% Scanner Perspective:</strong> No bot or Telegram details are shown to scanners. They simply scan to alert you in 5 seconds without app or login!
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
              Print at home or local photo studio on vinyl sticker / glossy paper.
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
              className="flex-1 sm:flex-none py-2.5 px-7 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-400/20 hover:scale-102"
            >
              <Download className="w-4 h-4" /> Download High-DPI PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
