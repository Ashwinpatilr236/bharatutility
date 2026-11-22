import React, { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { ParkSignalLogo } from './ParkSignalLogo';
import {
  X,
  Download,
  Check,
  Scissors,
  Sparkles,
  Zap,
  Sun,
  Moon,
  Flame,
  Layers,
  AlertTriangle,
  SplitSquareVertical
} from 'lucide-react';
import { ParkSignalVehicle } from '../../types';

interface ParkSignalStickerModalProps {
  vehicle: ParkSignalVehicle;
  isOpen: boolean;
  onClose: () => void;
}

export type StickerLayout = 'hazard' | 'twotone' | 'square';
export type StickerTheme = 'safety_yellow' | 'emergency_orange' | 'clean_white' | 'carbon_dark';

export const ParkSignalStickerModal: React.FC<ParkSignalStickerModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedLayout, setSelectedLayout] = useState<StickerLayout>('hazard');
  const [selectedTheme, setSelectedTheme] = useState<StickerTheme>('safety_yellow');
  const [showCutBorder, setShowCutBorder] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const publicUrl = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token || 'demo'}`;

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

  // Helper: Draw authentic 45-degree Safety Hazard Stripes (Caution Tape)
  const drawHazardStripes = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    stripeW = 26,
    stripeColor = '#0B0F19',
    bgColor = '#FFD000'
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = stripeColor;
    const totalW = w + h * 2;
    for (let pos = -h * 2; pos < totalW; pos += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x + pos, y);
      ctx.lineTo(x + pos + stripeW, y);
      ctx.lineTo(x + pos + stripeW - h, y + h);
      ctx.lineTo(x + pos - h, y + h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  // Helper to draw crisp vector situation icons directly on Canvas
  const drawIconCircle = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    radius: number,
    bgColor: string,
    borderColor?: string
  ) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Vector Icon: Accident / Collision
  const drawAccidentIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Left Car
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.45, cy + size * 0.2);
    ctx.lineTo(cx - size * 0.35, cy - size * 0.05);
    ctx.lineTo(cx - size * 0.15, cy - size * 0.05);
    ctx.lineTo(cx - size * 0.05, cy + size * 0.2);
    ctx.closePath();
    ctx.stroke();

    // Right Car
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.45, cy + size * 0.2);
    ctx.lineTo(cx + size * 0.35, cy - size * 0.05);
    ctx.lineTo(cx + size * 0.15, cy - size * 0.05);
    ctx.lineTo(cx + size * 0.05, cy + size * 0.2);
    ctx.closePath();
    ctx.stroke();

    // Impact Starburst in center
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.35);
    ctx.lineTo(cx + size * 0.1, cy - size * 0.15);
    ctx.lineTo(cx + size * 0.3, cy - size * 0.2);
    ctx.lineTo(cx + size * 0.15, cy - size * 0.05);
    ctx.lineTo(cx + size * 0.25, cy + size * 0.15);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx - size * 0.25, cy + size * 0.15);
    ctx.lineTo(cx - size * 0.15, cy - size * 0.05);
    ctx.lineTo(cx - size * 0.3, cy - size * 0.2);
    ctx.lineTo(cx - size * 0.1, cy - size * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Vector Icon: Parking Badge ("P" inside circle)
  const drawParkingIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
    ctx.stroke();

    // Letter P
    ctx.font = `900 ${Math.round(size * 0.58)}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', cx, cy + 1);
    ctx.restore();
  };

  // Vector Icon: Breakdown (Crossed Wrench & Spanner)
  const drawBreakdownIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Tool 1
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.3, cy - size * 0.3);
    ctx.lineTo(cx + size * 0.3, cy + size * 0.3);
    ctx.stroke();

    // Tool 2
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.3, cy - size * 0.3);
    ctx.lineTo(cx - size * 0.3, cy + size * 0.3);
    ctx.stroke();

    // Center bolt
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Vector Icon: Towing / Traffic Cone
  const drawTowingIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;

    // Traffic cone base
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.4, cy + size * 0.35);
    ctx.lineTo(cx + size * 0.4, cy + size * 0.35);
    ctx.stroke();

    // Cone body
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.28, cy + size * 0.32);
    ctx.lineTo(cx - size * 0.08, cy - size * 0.32);
    ctx.lineTo(cx + size * 0.08, cy - size * 0.32);
    ctx.lineTo(cx + size * 0.28, cy + size * 0.32);
    ctx.closePath();
    ctx.stroke();

    // White stripe in cone
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.18, cy + size * 0.05);
    ctx.lineTo(cx + size * 0.18, cy + size * 0.05);
    ctx.stroke();
    ctx.restore();
  };

  // Vector Icon: Police / Authority Shield
  const drawPoliceIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(cx - size * 0.32, cy - size * 0.3);
    ctx.lineTo(cx + size * 0.32, cy - size * 0.3);
    ctx.lineTo(cx + size * 0.32, cy);
    ctx.quadraticCurveTo(cx + size * 0.32, cy + size * 0.38, cx, cy + size * 0.45);
    ctx.quadraticCurveTo(cx - size * 0.32, cy + size * 0.38, cx - size * 0.32, cy);
    ctx.closePath();
    ctx.stroke();

    // Small star inside shield
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy - size * 0.02, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Vector Icon: Flat Tyre
  const drawFlatTyreIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Deflated tyre (oval squished at bottom)
    ctx.beginPath();
    ctx.ellipse(cx, cy - size * 0.05, size * 0.36, size * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Rim circle
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - size * 0.05, size * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    // Nail/Puncture entering bottom right
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.25, cy + size * 0.38);
    ctx.lineTo(cx + size * 0.1, cy + size * 0.2);
    ctx.stroke();
    ctx.restore();
  };

  // Vector Icon: Suspicious / Window Light
  const drawSuspiciousIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    // Eye shape
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.38, cy);
    ctx.quadraticCurveTo(cx, cy - size * 0.28, cx + size * 0.38, cy);
    ctx.quadraticCurveTo(cx, cy + size * 0.28, cx - size * 0.38, cy);
    ctx.stroke();

    // Pupil
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Vector Icon: Forgot Item / Key
  const drawKeyIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color = '#FFFFFF') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;

    // Key head
    ctx.beginPath();
    ctx.arc(cx - size * 0.15, cy - size * 0.1, size * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    // Key shaft
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.02);
    ctx.lineTo(cx + size * 0.32, cy + size * 0.28);
    // Key teeth
    ctx.lineTo(cx + size * 0.38, cy + size * 0.22);
    ctx.moveTo(cx + size * 0.22, cy + size * 0.18);
    ctx.lineTo(cx + size * 0.28, cy + size * 0.12);
    ctx.stroke();
    ctx.restore();
  };

  // Helper to draw ParkSignal Car & Radar Emblem on Canvas
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

  // Render the Master Canvas
  const renderMasterCanvas = useCallback(async () => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate crisp QR in offscreen canvas with high error correction
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, publicUrl, {
      width: 600,
      margin: 1,
      color: {
        dark: '#050811',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

    // Theme color sets
    const isThemeOrange = selectedTheme === 'emergency_orange';
    const isThemeWhite = selectedTheme === 'clean_white';
    const isThemeDark = selectedTheme === 'carbon_dark';

    const primaryYellow = isThemeOrange ? '#FF5722' : isThemeWhite ? '#FFFFFF' : isThemeDark ? '#0F172A' : '#FFCE00';
    const hazardStripeBg = isThemeOrange ? '#FF5722' : isThemeWhite ? '#E2E8F0' : '#FFCE00';
    const primaryDark = '#090D16';

    // ═════════════════════════════════════════════════════════════════
    // LAYOUT 1: ROAD HAZARD CAUTION TAPE (Commercial Image 2 Style)
    // ═════════════════════════════════════════════════════════════════
    if (selectedLayout === 'hazard') {
      const W = 1360;
      const H = 760;
      canvas.width = W;
      canvas.height = H;

      // Base background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      // Optional Cut Guide Border
      const pad = showCutBorder ? 26 : 14;
      if (showCutBorder) {
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, W - 20, H - 20);
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✂  CUT ALONG DOTTED LINE & PLACE INSIDE WINDSHIELD FACING OUTWARD  ✂', W / 2, 18);
        ctx.restore();
      }

      const cardW = W - pad * 2;
      const cardH = H - pad * 2;
      const cornerR = 28;

      // Card Body Fill (Vibrant Yellow / Orange)
      ctx.fillStyle = primaryYellow;
      drawRoundRect(ctx, pad, pad, cardW, cardH, cornerR);
      ctx.fill();

      // Top Hazard Caution Stripe Band
      const stripeH = 38;
      ctx.save();
      drawRoundRect(ctx, pad, pad, cardW, cardH, cornerR);
      ctx.clip();
      drawHazardStripes(ctx, pad, pad, cardW, stripeH, 24, primaryDark, hazardStripeBg);
      // Bottom Hazard Caution Stripe Band
      drawHazardStripes(ctx, pad, pad + cardH - stripeH, cardW, stripeH, 24, primaryDark, hazardStripeBg);
      ctx.restore();

      // Outer Card Border
      ctx.lineWidth = 5;
      ctx.strokeStyle = primaryDark;
      drawRoundRect(ctx, pad, pad, cardW, cardH, cornerR);
      ctx.stroke();

      // Content Boundaries inside the stripes
      const contentY = pad + stripeH + 14;

      // ── LEFT SIDE: LARGE WHITE ROUNDED CARD WITH QR CODE ──
      const qrBoxW = 460;
      const qrBoxH = cardH - stripeH * 2 - 28;
      const qrBoxX = pad + 24;
      const qrBoxY = contentY;

      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 22);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = primaryDark;
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 22);
      ctx.stroke();

      // Draw high-res QR Code
      const qrSize = 390;
      const qrOffset = (qrBoxW - qrSize) / 2;
      ctx.drawImage(qrCanvas, qrBoxX + qrOffset, qrBoxY + 16, qrSize, qrSize);

      // Bottom Scanner Guide inside QR box
      const scanPillY = qrBoxY + qrSize + 24;
      const scanPillH = 56;
      ctx.fillStyle = primaryDark;
      drawRoundRect(ctx, qrBoxX + 16, scanPillY, qrBoxW - 32, scanPillH, 14);
      ctx.fill();

      ctx.fillStyle = '#FFDE00';
      ctx.font = '900 16px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📷 SCAN WITH PHONE CAMERA', qrBoxX + qrBoxW / 2, scanPillY + 26);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('NO APP DOWNLOAD • 100% PRIVATE & FREE', qrBoxX + qrBoxW / 2, scanPillY + 44);

      // ── RIGHT SIDE: MAIN COPY & SITUATION ICONS (ProfileTap style) ──
      const rightX = qrBoxX + qrBoxW + 28;
      const rightW = W - pad - rightX - 24;

      // 1. Big Bold Headline: "Scan the QR to contact the vehicle owner in case of emergency"
      ctx.textAlign = 'left';
      ctx.fillStyle = primaryDark;
      ctx.font = '900 34px system-ui, -apple-system, sans-serif';
      ctx.fillText('Scan the QR to contact the', rightX, contentY + 36);

      ctx.font = '900 38px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = isThemeOrange ? '#FFFFFF' : '#000000';
      ctx.fillText('vehicle owner in case of emergency', rightX, contentY + 76);

      // 2. Horizontal Row of 6 Situation Icons (Accident, Police, Breakdown, Towing, Safety, Parking)
      const iconRowY = contentY + 104;
      const icons = [
        { label: 'ACCIDENT', draw: drawAccidentIcon },
        { label: 'POLICE', draw: drawPoliceIcon },
        { label: 'BREAKDOWN', draw: drawBreakdownIcon },
        { label: 'TOWING', draw: drawTowingIcon },
        { label: 'SAFETY', draw: drawSuspiciousIcon },
        { label: 'PARKING', draw: drawParkingIcon },
      ];

      const iconCount = icons.length;
      const iconGap = (rightW - iconCount * 76) / (iconCount - 1);

      icons.forEach((item, idx) => {
        const iX = rightX + idx * (76 + iconGap);
        const circleCenterX = iX + 38;
        const circleCenterY = iconRowY + 36;

        // Dark circle background
        drawIconCircle(ctx, circleCenterX, circleCenterY, 32, primaryDark);

        // Vector icon drawn crisp in gold/white
        item.draw(ctx, circleCenterX, circleCenterY, 34, '#FFDE00');

        // Label below icon
        ctx.fillStyle = primaryDark;
        ctx.font = '900 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, circleCenterX, iconRowY + 88);
      });

      // 3. Clear Instruction Paragraph (Exactly like Image 2)
      const descY = iconRowY + 116;
      ctx.textAlign = 'left';
      ctx.fillStyle = primaryDark;
      ctx.font = '700 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('Facing a parking issue or emergency? Notice something wrong with the vehicle?', rightX, descY);
      ctx.fillText('Please scan the QR tag to contact the owner privately in seconds.', rightX, descY + 22);

      // 4. Authentic Indian HSRP License Plate Strip
      const plateY = descY + 44;
      const plateH = 78;

      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, rightX, plateY, rightW, plateH, 16);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = primaryDark;
      drawRoundRect(ctx, rightX, plateY, rightW, plateH, 16);
      ctx.stroke();

      // Blue IND Band
      const indBandW = 76;
      ctx.fillStyle = '#003399';
      drawRoundRect(ctx, rightX, plateY, indBandW, plateH, [13, 0, 0, 13]);
      ctx.fill();

      // Chakra Circle
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rightX + indBandW / 2, plateY + 26, 9, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 18px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IND', rightX + indBandW / 2, plateY + 56);

      // Plate Text with dynamic scaling
      const plateAvailW = rightW - indBandW - 30;
      const plateCenter = rightX + indBandW + plateAvailW / 2;
      const plateText = `${vehicle.vehicle_type.toUpperCase()}  •  ${displayPlate}`;

      let plateFontSize = 38;
      ctx.font = `900 ${plateFontSize}px monospace`;
      while (ctx.measureText(plateText).width > plateAvailW && plateFontSize > 20) {
        plateFontSize -= 2;
        ctx.font = `900 ${plateFontSize}px monospace`;
      }
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(plateText, plateCenter, plateY + 50);

      // 5. Subtle Footer Brand & Watermark
      const footY = plateY + plateH + 22;
      ctx.fillStyle = primaryDark;
      ctx.font = '800 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PARKSIGNAL SMART PASS', rightX, footY + 14);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#1E293B';
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Powered by BharatUtility • bharatutility.tech/parksignal', rightX + rightW, footY + 14);
    }

    // ═════════════════════════════════════════════════════════════════
    // LAYOUT 2: EXECUTIVE TWO-TONE SPLIT (Commercial Image 3 Style)
    // ═════════════════════════════════════════════════════════════════
    else if (selectedLayout === 'twotone') {
      const W = 1360;
      const H = 760;
      canvas.width = W;
      canvas.height = H;

      // Base background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      // Optional Cut Guide Border
      const pad = showCutBorder ? 26 : 14;
      if (showCutBorder) {
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, W - 20, H - 20);
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✂  CUT ALONG DOTTED LINE & PLACE INSIDE WINDSHIELD FACING OUTWARD  ✂', W / 2, 18);
        ctx.restore();
      }

      const cardW = W - pad * 2;
      const cardH = H - pad * 2;
      const cornerR = 28;

      // Split 50% left & 50% right
      const splitX = pad + cardW * 0.49;

      // Left Half: Obsidian Carbon Black (#0B0F19)
      ctx.save();
      drawRoundRect(ctx, pad, pad, cardW, cardH, cornerR);
      ctx.clip();

      ctx.fillStyle = '#090D16';
      ctx.fillRect(pad, pad, cardW * 0.49, cardH);

      // Right Half: Vibrant Safety Yellow (#FFD000) or selected color
      ctx.fillStyle = isThemeOrange ? '#FF5722' : isThemeWhite ? '#FFFFFF' : '#FFCE00';
      ctx.fillRect(splitX, pad, cardW - (splitX - pad), cardH);

      // ── LEFT SIDE (CARBON BLACK): LOGO, HEADLINE, SITUATION BADGES ──
      const leftPadX = pad + 38;
      const leftW = splitX - leftPadX - 28;

      // 1. Brand Logo & Tagline (RepiQR style)
      drawParkSignalEmblem(ctx, leftPadX, pad + 34, 48);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 28px system-ui, -apple-system, sans-serif';
      ctx.fillText('PARKSIGNAL', leftPadX + 58, pad + 56);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '800 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Family safety, one scan away', leftPadX + 58, pad + 74);

      // Thin separator
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftPadX, pad + 98);
      ctx.lineTo(leftPadX + leftW, pad + 98);
      ctx.stroke();

      // 2. High-Impact Headline
      ctx.fillStyle = '#FFCE00';
      ctx.font = '900 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('SCAN TO REACH', leftPadX, pad + 138);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('THE OWNER', leftPadX + 266, pad + 138);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '800 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('Both numbers stay 100% private', leftPadX, pad + 168);

      // 3. Situation Badges Grid (5 items matching Image 3)
      const gridY = pad + 196;
      const badges = [
        { label: 'Accident', draw: drawAccidentIcon },
        { label: 'Parking', draw: drawParkingIcon },
        { label: 'Flat Tyre', draw: drawFlatTyreIcon },
        { label: 'Notice suspicious', draw: drawSuspiciousIcon },
        { label: 'Forgot something', draw: drawKeyIcon },
      ];

      // Row 1: 3 badges
      const r1Y = gridY;
      const col3W = leftW / 3;
      badges.slice(0, 3).forEach((item, idx) => {
        const bX = leftPadX + idx * col3W + col3W / 2;
        drawIconCircle(ctx, bX, r1Y + 30, 26, '#1E293B', '#334155');
        item.draw(ctx, bX, r1Y + 30, 28, '#FFFFFF');

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, bX, r1Y + 76);
      });

      // Row 2: 2 wider badges
      const r2Y = gridY + 98;
      const col2W = leftW / 2;
      badges.slice(3, 5).forEach((item, idx) => {
        const bX = leftPadX + idx * col2W + col2W / 2;
        drawIconCircle(ctx, bX, r2Y + 28, 26, '#1E293B', '#334155');
        item.draw(ctx, bX, r2Y + 28, 28, '#FFFFFF');

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.label, bX, r2Y + 72);
      });

      // 4. Vehicle Plate Badge at Bottom-Left
      const plateY = pad + cardH - 100;
      const plateH = 68;

      ctx.fillStyle = '#0F172A';
      drawRoundRect(ctx, leftPadX, plateY, leftW, plateH, 14);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#334155';
      drawRoundRect(ctx, leftPadX, plateY, leftW, plateH, 14);
      ctx.stroke();

      // IND Blue tag
      const indW = 56;
      ctx.fillStyle = '#003399';
      drawRoundRect(ctx, leftPadX, plateY, indW, plateH, [12, 0, 0, 12]);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 15px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IND', leftPadX + indW / 2, plateY + 40);

      // Plate Number
      const pAvailW = leftW - indW - 20;
      const pCenter = leftPadX + indW + pAvailW / 2;
      const pText = `${vehicle.vehicle_type.toUpperCase()}  •  ${displayPlate}`;
      let pFontSize = 28;
      ctx.font = `900 ${pFontSize}px monospace`;
      while (ctx.measureText(pText).width > pAvailW && pFontSize > 16) {
        pFontSize -= 2;
        ctx.font = `900 ${pFontSize}px monospace`;
      }
      ctx.fillStyle = '#FFCE00';
      ctx.textAlign = 'center';
      ctx.fillText(pText, pCenter, plateY + 43);

      // ── RIGHT SIDE (SAFETY YELLOW): EMERGENCY PILL, WHITE QR CARD, CONTACT BUTTON ──
      const rightPadX = splitX + 38;
      const rightW = W - pad - rightPadX - 38;

      // 1. Top Pill: "Scan This QR In Case Of Emergency"
      const topPillH = 64;
      const topPillY = pad + 32;
      ctx.fillStyle = '#090D16';
      drawRoundRect(ctx, rightPadX, topPillY, rightW, topPillH, 16);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 15px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scan This QR', rightPadX + rightW / 2, topPillY + 26);

      ctx.fillStyle = '#FFDE00';
      ctx.font = '900 19px system-ui, -apple-system, sans-serif';
      ctx.fillText('In Case Of Emergency', rightPadX + rightW / 2, topPillY + 50);

      // 2. Large White Rounded QR Card
      const qrCardY = topPillY + topPillH + 18;
      const qrCardH = 430;
      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, rightPadX, qrCardY, rightW, qrCardH, 24);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#090D16';
      drawRoundRect(ctx, rightPadX, qrCardY, rightW, qrCardH, 24);
      ctx.stroke();

      // QR Code centered
      const qrActual = 340;
      const qrX = rightPadX + (rightW - qrActual) / 2;
      ctx.drawImage(qrCanvas, qrX, qrCardY + 20, qrActual, qrActual);

      // Website Link below QR
      ctx.fillStyle = '#090D16';
      ctx.font = '900 13px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('bharatutility.tech/parksignal', rightPadX + rightW / 2, qrCardY + qrActual + 48);

      // 3. Bottom White Rounded Pill (RepiQR style): "CONTACT TO VEHICLE OWNER"
      const botPillY = qrCardY + qrCardH + 18;
      const botPillH = 60;
      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, rightPadX, botPillY, rightW, botPillH, 16);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#090D16';
      drawRoundRect(ctx, rightPadX, botPillY, rightW, botPillH, 16);
      ctx.stroke();

      ctx.fillStyle = '#090D16';
      ctx.font = '900 17px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CONTACT TO VEHICLE OWNER / DRIVER', rightPadX + rightW / 2, botPillY + 36);

      ctx.restore();

      // Outer Card Stroke
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#090D16';
      drawRoundRect(ctx, pad, pad, cardW, cardH, cornerR);
      ctx.stroke();
    }

    // ═════════════════════════════════════════════════════════════════
    // LAYOUT 3: SQUARE DECAL FORMAT (1080x1080 for Bike / Glass)
    // ═════════════════════════════════════════════════════════════════
    else {
      const W = 1080;
      const H = 1080;
      canvas.width = W;
      canvas.height = H;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, W, H);

      const pad = showCutBorder ? 26 : 14;
      if (showCutBorder) {
        ctx.save();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, W - 20, H - 20);
        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✂  CUT ALONG DOTTED LINE & PLACE INSIDE WINDSHIELD FACING OUTWARD  ✂', W / 2, 18);
        ctx.restore();
      }

      const cardW = W - pad * 2;
      const cardH = H - pad * 2;
      const cornerR = 28;

      ctx.fillStyle = primaryYellow;
      drawRoundRect(ctx, pad, pad, cardW, cardH, cornerR);
      ctx.fill();

      // Hazard Stripes on top and bottom
      const stripeH = 36;
      ctx.save();
      drawRoundRect(ctx, pad, pad, cardW, cardH, cornerR);
      ctx.clip();
      drawHazardStripes(ctx, pad, pad, cardW, stripeH, 24, primaryDark, hazardStripeBg);
      drawHazardStripes(ctx, pad, pad + cardH - stripeH, cardW, stripeH, 24, primaryDark, hazardStripeBg);
      ctx.restore();

      ctx.lineWidth = 5;
      ctx.strokeStyle = primaryDark;
      drawRoundRect(ctx, pad, pad, cardW, cardH, cornerR);
      ctx.stroke();

      // Header Banner
      const headY = pad + stripeH + 18;
      const headH = 88;
      ctx.fillStyle = primaryDark;
      drawRoundRect(ctx, pad + 24, headY, cardW - 48, headH, 18);
      ctx.fill();

      ctx.fillStyle = '#FFDE00';
      ctx.textAlign = 'center';
      ctx.font = '900 25px system-ui, -apple-system, sans-serif';
      ctx.fillText('🚨 WRONG PARKING? NEED THIS VEHICLE MOVED?', W / 2, headY + 38);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 16px system-ui, -apple-system, sans-serif';
      ctx.fillText('Scan QR to contact vehicle owner privately in 5 seconds', W / 2, headY + 66);

      // Large QR Card
      const qrBoxSize = 480;
      const qrBoxX = (W - qrBoxSize) / 2;
      const qrBoxY = headY + headH + 22;

      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = primaryDark;
      drawRoundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.stroke();

      ctx.drawImage(qrCanvas, qrBoxX + 25, qrBoxY + 20, qrBoxSize - 50, qrBoxSize - 50);

      // Number Plate
      const plateY = qrBoxY + qrBoxSize + 22;
      const plateW = cardW - 48;
      const plateH = 82;
      const plateX = (W - plateW) / 2;

      ctx.fillStyle = '#FFFFFF';
      drawRoundRect(ctx, plateX, plateY, plateW, plateH, 16);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = primaryDark;
      drawRoundRect(ctx, plateX, plateY, plateW, plateH, 16);
      ctx.stroke();

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

      const pAvailW = plateW - indW - 30;
      const pCenter = plateX + indW + pAvailW / 2;
      const pText = `${vehicle.vehicle_type.toUpperCase()}  •  ${displayPlate}`;
      let pFontSize = 38;
      ctx.font = `900 ${pFontSize}px monospace`;
      while (ctx.measureText(pText).width > pAvailW && pFontSize > 20) {
        pFontSize -= 2;
        ctx.font = `900 ${pFontSize}px monospace`;
      }
      ctx.fillStyle = '#0F172A';
      ctx.textAlign = 'center';
      ctx.fillText(pText, plateCenter, plateY + 52);

      // Privacy Footer
      const footY = plateY + plateH + 20;
      const footH = 64;
      ctx.fillStyle = primaryDark;
      drawRoundRect(ctx, plateX, footY, plateW, footH, 14);
      ctx.fill();

      ctx.fillStyle = '#FFDE00';
      ctx.textAlign = 'center';
      ctx.font = '900 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('🔒 100% PRIVATE • OWNER PHONE NUMBER IS NEVER SHARED', W / 2, footY + 27);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '700 12px system-ui, -apple-system, sans-serif';
      ctx.fillText('Instant Telegram Alert • No OTP • bharatutility.tech/parksignal', W / 2, footY + 48);
    }
  }, [isOpen, publicUrl, selectedLayout, selectedTheme, showCutBorder, vehicle.vehicle_number, vehicle.vehicle_type, displayPlate]);

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
                    Official Commercial Pass
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
          {/* Format Selection with Clear Commercial Names */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-400 text-[11px]">Design:</span>
            <button
              onClick={() => setSelectedLayout('hazard')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'hazard'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-black" />
              <span>🚧 Road Hazard Caution</span>
            </button>
            <button
              onClick={() => setSelectedLayout('twotone')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'twotone'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-black" />
              <span>🌗 Executive Two-Tone</span>
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
              <span>🔲 Square Pass</span>
            </button>
          </div>

          {/* Color Palettes */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-400 text-[11px]">Color:</span>
            {[
              { id: 'safety_yellow', label: 'Safety Yellow', icon: Sun, color: '#FFCE00' },
              { id: 'emergency_orange', label: 'Safety Orange', icon: Flame, color: '#FF5722' },
              { id: 'clean_white', label: 'Crisp White', icon: Zap, color: '#FFFFFF' },
              { id: 'carbon_dark', label: 'Carbon Black', icon: Moon, color: '#090D16' },
            ].map((thm) => {
              const Icon = thm.icon;
              return (
                <button
                  key={thm.id}
                  onClick={() => setSelectedTheme(thm.id as StickerTheme)}
                  className={`py-1 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                    selectedTheme === thm.id
                      ? 'ring-2 ring-white text-white bg-neutral-800 shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: thm.color }} />
                  <span>{thm.label}</span>
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
            <span>Cut Guide</span>
          </label>
        </div>

        {/* Live Canvas Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/70">
          <div className="relative w-full max-w-2xl flex items-center justify-center">
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
              <strong>100% Commercial Standard:</strong> Authentic vehicle windshield format matching ProfileTap &amp; RepiQR products. Ready to print on vinyl sticker or photo paper!
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
