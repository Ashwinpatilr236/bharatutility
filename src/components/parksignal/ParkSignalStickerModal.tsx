import React, { useEffect, useState, useMemo } from 'react';
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
  FileCode2
} from 'lucide-react';
import { ParkSignalVehicle } from '../../types';
import { PARKSIGNAL_FULL_LOGO_B64, PARKSIGNAL_EMBLEM_B64 } from './parkSignalLogoBase64';

interface ParkSignalStickerModalProps {
  vehicle: ParkSignalVehicle;
  isOpen: boolean;
  onClose: () => void;
}

export type StickerLayout = 'hazard' | 'square';
export type StickerTheme = 'safety_yellow' | 'emergency_orange' | 'clean_white' | 'carbon_dark';

export const ParkSignalStickerModal: React.FC<ParkSignalStickerModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const [selectedLayout, setSelectedLayout] = useState<StickerLayout>('hazard');
  const [selectedTheme, setSelectedTheme] = useState<StickerTheme>('safety_yellow');
  const [showCutBorder, setShowCutBorder] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const publicUrl = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token || ''}`;

  // Generate ultra high-resolution QR data URL on mount or URL change
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(publicUrl, {
      width: 900,
      margin: 1,
      color: {
        dark: '#0B0F19',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => console.error('Error generating QR:', err));

    return () => {
      isMounted = false;
    };
  }, [publicUrl]);

  const displayPlate =
    vehicle.display_plate_publicly === 1
      ? vehicle.vehicle_number
      : vehicle.vehicle_number.length > 4
      ? `${vehicle.vehicle_number.slice(0, 4)} •••• ${vehicle.vehicle_number.slice(-4)}`
      : '••••••••';

  const vehicleTypeUpper = vehicle.vehicle_type ? vehicle.vehicle_type.toUpperCase() : 'VEHICLE';
  const plateFormatted = `${vehicleTypeUpper}  •  ${displayPlate}`;

  // Dynamic colors for themes
  const colors = useMemo(() => {
    switch (selectedTheme) {
      case 'emergency_orange':
        return {
          bg: '#FF5722',
          text: '#FFFFFF',
          hazardStripe: '#FF5722',
          accent: '#FF5722',
        };
      case 'clean_white':
        return {
          bg: '#FFFFFF',
          text: '#0B0F19',
          hazardStripe: '#CBD5E1',
          accent: '#0B0F19',
        };
      case 'carbon_dark':
        return {
          bg: '#0F172A',
          text: '#FFFFFF',
          hazardStripe: '#0284C7',
          accent: '#38BDF8',
        };
      case 'safety_yellow':
      default:
        return {
          bg: '#FFD000',
          text: '#0B0F19',
          hazardStripe: '#FFD000',
          accent: '#FFD000',
        };
    }
  }, [selectedTheme]);

  // ══════════════════════════════════════════════════════════════════
  // GENERATE MASTER SVG (Retail Commercial Automotive Standard)
  // ══════════════════════════════════════════════════════════════════
  const masterSvg = useMemo(() => {
    if (!qrDataUrl) return '';

    // Precision Vector Brand Logo Lockup
    const getVectorLogoSvg = (x: number, y: number, scale = 1, isDarkBackground = false) => {
      const parkColor = isDarkBackground ? '#FFFFFF' : '#0B0F19';
      const subColor = isDarkBackground ? '#94A3B8' : '#475569';
      return `
        <g transform="translate(${x}, ${y}) scale(${scale})">
          <!-- Sleek Modern Automotive Shield Emblem -->
          <g transform="translate(0, 2)">
            <!-- Outer Shield Base -->
            <path d="M 4 8 C 18 4 32 4 46 8 C 46 26 32 42 25 48 C 18 42 4 26 4 8 Z" fill="#0B0F19" />
            <!-- Aerodynamic Car Silhouette -->
            <path d="M 12 32 C 14 26 19 24 23 24 L 27 24 C 31 24 36 26 38 32 L 40 33 C 41 33 42 34 42 35 L 42 37 C 42 38 41 39 40 39 L 38 39 C 38 41 36 42 34 42 C 32 42 30 41 30 39 L 20 39 C 20 41 18 42 16 42 C 14 42 12 41 12 39 L 10 39 C 9 39 8 38 8 37 L 8 35 C 8 34 9 33 10 33 Z" fill="#00D2FF" />
            <!-- Radar Pulse Waves -->
            <path d="M 16 14 C 21 11 29 11 34 14" stroke="#00D2FF" stroke-width="2.5" stroke-linecap="round" fill="none" />
            <path d="M 19 18 C 22 16 28 16 31 18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none" />
            <!-- Micro Pulse Dot -->
            <circle cx="25" cy="21" r="1.5" fill="#FFC700" />
          </g>
          <!-- Typography -->
          <text x="56" y="29" class="font-sans" font-size="28" font-weight="900" fill="${parkColor}" letter-spacing="-0.5">PARK<tspan fill="#0284C7">SIGNAL</tspan></text>
          <text x="58" y="44" class="font-sans" font-size="9" font-weight="800" fill="${subColor}" letter-spacing="1.8">SMART VEHICLE PASS • BHARATUTILITY</text>
        </g>
      `;
    };

    // ─────────────────────────────────────────────────────────────
    // FORMAT 1: COMMERCIAL FASTAG PASS (ProfileTap / Retail Standard)
    // ─────────────────────────────────────────────────────────────
    if (selectedLayout === 'hazard') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1360" height="680" viewBox="0 0 1360 680" style="background:#FFFFFF;">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <clipPath id="pass-clip">
      <rect x="0" y="0" width="1360" height="680" rx="28" ry="28" />
    </clipPath>
    <!-- Sharp 45-degree Repeating Caution Hazard Tape Pattern -->
    <pattern id="hazardStripe" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="22" height="44" fill="#0B0F19" />
      <rect x="22" width="22" height="44" fill="${colors.hazardStripe}" />
    </pattern>
  </defs>

  <!-- Base Card -->
  <g clip-path="url(#pass-clip)">
    <!-- Solid Safety Background -->
    <rect x="0" y="0" width="1360" height="680" fill="${colors.bg}" />

    <!-- Thin Crisp Top Hazard Caution Tape -->
    <rect x="0" y="0" width="1360" height="24" fill="url(#hazardStripe)" />
    <!-- Thin Crisp Bottom Hazard Caution Tape -->
    <rect x="0" y="656" width="1360" height="24" fill="url(#hazardStripe)" />

    <!-- ── LEFT SIDE: CLEAN WHITE CARD FOR QR CODE (NO CLUTTER) ── -->
    <g transform="translate(44, 44)">
      <rect x="0" y="0" width="440" height="592" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />

      <!-- High-Resolution Centered QR Code with Generous Breathing Room -->
      <image href="${qrDataUrl}" x="25" y="25" width="390" height="390" />

      <!-- Minimalist Dark Camera Scan Badge -->
      <g transform="translate(20, 436)">
        <rect x="0" y="0" width="400" height="66" rx="16" fill="#0B0F19" />
        <text x="200" y="30" class="font-sans" font-size="13.5" font-weight="900" fill="#FFC700" text-anchor="middle" letter-spacing="0.5">📷 SCAN WITH ANY PHONE CAMERA</text>
        <text x="200" y="50" class="font-sans" font-size="10.5" font-weight="700" fill="#94A3B8" text-anchor="middle" letter-spacing="0.5">NO APP REQUIRED • 100% PRIVATE ALERT</text>
      </g>

      <!-- Bottom Micro URL -->
      <text x="220" y="540" class="font-sans" font-size="11" font-weight="700" fill="#64748B" text-anchor="middle">bharatutility.tech/parksignal</text>
    </g>

    <!-- ── RIGHT SIDE: COMMERCIAL SAFETY LAYOUT ── -->
    <g transform="translate(528, 44)">
      <!-- 1. Header Bar: Official Brand Lockup & Size Pill -->
      <g transform="translate(0, 0)">
        ${getVectorLogoSvg(0, 2, 1.15, false)}

        <!-- FASTAG Verification Pill -->
        <g transform="translate(548, 6)">
          <rect x="0" y="0" width="240" height="34" rx="10" fill="#0B0F19" />
          <text x="120" y="22" class="font-sans" font-size="11" font-weight="900" fill="#FFC700" text-anchor="middle" letter-spacing="0.8">FASTAG SIZE • SMART PASS</text>
        </g>
      </g>

      <!-- 2. Commercial Safety Headline -->
      <g transform="translate(0, 78)">
        <text x="0" y="28" class="font-sans" font-size="30" font-weight="700" fill="#0B0F19">Scan the QR to contact the</text>
        <text x="0" y="70" class="font-sans" font-size="40" font-weight="900" fill="#0B0F19" letter-spacing="-0.5">vehicle owner in case of emergency</text>
      </g>

      <!-- 3. Row of 6 Uniform Automotive Situation Icons -->
      <g transform="translate(0, 180)">
        <!-- Icon 1: ACCIDENT (Phone Receiver) -->
        <g transform="translate(40, 0)">
          <circle cx="0" cy="22" r="22" fill="#0B0F19" />
          <path d="M-8 8 C-8 15 -1 22 6 22 L9 19 C10 18 10 16 9 15 L5 12 C4 11 3 11 2 12 L1 13 C-2 11 -4 9 -6 6 L-5 5 C-4 4 -4 3 -5 2 L-8 -2 C-9 -3 -10 -3 -11 -2 L-13 0 C-14 2 -14 3 -13 4" fill="#FFC700" />
          <text x="0" y="62" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">ACCIDENT</text>
        </g>

        <!-- Icon 2: POLICE (Shield Badge with Star) -->
        <g transform="translate(180, 0)">
          <circle cx="0" cy="22" r="22" fill="#0B0F19" />
          <path d="M-10 14 L0 7 L10 14 V23 C10 30 0 36 0 36 C0 36 -10 30 -10 23 Z" fill="none" stroke="#FFC700" stroke-width="2.5" />
          <circle cx="0" cy="21" r="3.5" fill="#FFC700" />
          <text x="0" y="62" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">POLICE</text>
        </g>

        <!-- Icon 3: BREAKDOWN (Crossed Tools) -->
        <g transform="translate(320, 0)">
          <circle cx="0" cy="22" r="22" fill="#0B0F19" />
          <path d="M-9 13 L9 31 M9 13 L-9 31" stroke="#FFC700" stroke-width="3" stroke-linecap="round" />
          <circle cx="0" cy="22" r="3.5" fill="#FFC700" />
          <text x="0" y="62" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">BREAKDOWN</text>
        </g>

        <!-- Icon 4: TOWING (Traffic Safety Cone) -->
        <g transform="translate(460, 0)">
          <circle cx="0" cy="22" r="22" fill="#0B0F19" />
          <path d="M-11 32 L11 32 M-8 30 L-2 12 L2 12 L8 30 Z" fill="none" stroke="#FFC700" stroke-width="2.5" stroke-linejoin="round" />
          <line x1="-5" y1="22" x2="5" y2="22" stroke="#FFC700" stroke-width="2" />
          <text x="0" y="62" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">TOWING</text>
        </g>

        <!-- Icon 5: SAFETY (Hazard Warning Triangle) -->
        <g transform="translate(600, 0)">
          <circle cx="0" cy="22" r="22" fill="#0B0F19" />
          <path d="M0 10 L12 32 L-12 32 Z" fill="none" stroke="#FFC700" stroke-width="2.5" stroke-linejoin="round" />
          <line x1="0" y1="16" x2="0" y2="24" stroke="#FFC700" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="0" cy="28" r="1.5" fill="#FFC700" />
          <text x="0" y="62" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">SAFETY</text>
        </g>

        <!-- Icon 6: PARKING (Uniform Black Roundel with P) -->
        <g transform="translate(740, 0)">
          <circle cx="0" cy="22" r="22" fill="#0B0F19" />
          <text x="0" y="30" class="font-sans" font-size="22" font-weight="900" fill="#FFC700" text-anchor="middle">P</text>
          <text x="0" y="62" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">PARKING</text>
        </g>
      </g>

      <!-- 4. Explanatory Safety Notice Paragraph -->
      <g transform="translate(0, 276)">
        <text x="0" y="20" class="font-sans" font-size="16" font-weight="700" fill="#0B0F19">Facing a parking issue or emergency? Notice something wrong with the vehicle?</text>
        <text x="0" y="44" class="font-sans" font-size="16" font-weight="700" fill="#0B0F19">Please scan the QR tag to contact the owner privately in seconds.</text>
      </g>

      <!-- 5. Authentic Indian HSRP License Plate Strip -->
      <g transform="translate(0, 344)">
        <rect x="0" y="0" width="788" height="84" rx="14" fill="#FFFFFF" stroke="#0B0F19" stroke-width="2.5" />
        <!-- Blue IND Band -->
        <rect x="0" y="0" width="92" height="84" rx="12" fill="#003399" />
        <circle cx="46" cy="30" r="11" fill="none" stroke="#FFFFFF" stroke-width="2" />
        <text x="46" y="66" class="font-sans" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">IND</text>
        <!-- Vehicle Plate Text -->
        <text x="440" y="55" class="font-mono" font-size="38" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="4">${plateFormatted}</text>
      </g>

      <!-- 6. Bottom Security Assurance Footer -->
      <g transform="translate(0, 448)">
        <rect x="0" y="0" width="788" height="42" rx="10" fill="#0B0F19" />
        <text x="394" y="26" class="font-sans" font-size="12" font-weight="800" fill="#FFC700" text-anchor="middle" letter-spacing="0.5">🔒 100% PRIVATE • OWNER PHONE NUMBER IS NEVER SHARED • bharatutility.tech/parksignal</text>
      </g>
    </g>
  </g>

  <!-- Clean Outer Die-Cut Stroke -->
  <rect x="1.5" y="1.5" width="1357" height="677" rx="28" fill="none" stroke="#CBD5E1" stroke-width="3" />
</svg>`;
    }

    // ─────────────────────────────────────────────────────────────
    // FORMAT 2: SQUARE DECAL FORMAT (Logo + QR Code for Bike / Glass)
    // ─────────────────────────────────────────────────────────────
    else {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" style="background:#FFFFFF;">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <clipPath id="square-clip">
      <rect x="0" y="0" width="1080" height="1080" rx="32" ry="32" />
    </clipPath>
    <pattern id="hazardStripeSq" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="22" height="44" fill="#0B0F19" />
      <rect x="22" width="22" height="44" fill="${colors.hazardStripe}" />
    </pattern>
  </defs>

  <g clip-path="url(#square-clip)">
    <rect x="0" y="0" width="1080" height="1080" fill="${colors.bg}" />

    <!-- Top & Bottom Hazard Tape -->
    <rect x="0" y="0" width="1080" height="24" fill="url(#hazardStripeSq)" />
    <rect x="0" y="1056" width="1080" height="24" fill="url(#hazardStripeSq)" />

    <!-- Top Callout Banner -->
    <g transform="translate(48, 48)">
      <rect x="0" y="0" width="984" height="92" rx="18" fill="#0B0F19" />
      <text x="492" y="38" class="font-sans" font-size="26" font-weight="900" fill="#FFC700" text-anchor="middle">🚨 WRONG PARKING? NEED THIS VEHICLE MOVED?</text>
      <text x="492" y="70" class="font-sans" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">Scan QR with phone camera to send an instant private alert</text>
    </g>

    <!-- Large White QR Card with Official Logo -->
    <g transform="translate(48, 160)">
      <rect x="0" y="0" width="984" height="660" rx="26" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2.5" />

      <!-- Vector Brand Logo centered above QR -->
      ${getVectorLogoSvg(332, 28, 1.35, false)}

      <!-- QR Image Centered -->
      <image href="${qrDataUrl}" x="282" y="104" width="420" height="420" />

      <!-- Minimalist Dark Camera Scan Badge -->
      <g transform="translate(262, 544)">
        <rect x="0" y="0" width="460" height="62" rx="16" fill="#0B0F19" />
        <text x="230" y="28" class="font-sans" font-size="14" font-weight="900" fill="#FFC700" text-anchor="middle">📷 SCAN WITH ANY PHONE CAMERA</text>
        <text x="230" y="48" class="font-sans" font-size="11" font-weight="700" fill="#94A3B8" text-anchor="middle">No App Download • 100% Free &amp; Private</text>
      </g>
    </g>

    <!-- HSRP License Plate -->
    <g transform="translate(48, 842)">
      <rect x="0" y="0" width="984" height="96" rx="18" fill="#FFFFFF" stroke="#0B0F19" stroke-width="3" />
      <rect x="0" y="0" width="100" height="96" rx="16" fill="#003399" />
      <circle cx="50" cy="34" r="11" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
      <text x="50" y="74" class="font-sans" font-size="23" font-weight="900" fill="#FFFFFF" text-anchor="middle">IND</text>
      <text x="542" y="62" class="font-mono" font-size="44" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="3">${plateFormatted}</text>
    </g>

    <!-- Privacy Assurance Footer -->
    <g transform="translate(48, 958)">
      <rect x="0" y="0" width="984" height="64" rx="14" fill="#0B0F19" />
      <text x="492" y="28" class="font-sans" font-size="15" font-weight="900" fill="#FFC700" text-anchor="middle">🔒 100% PRIVATE • OWNER PHONE NUMBER IS NEVER SHARED</text>
      <text x="492" y="50" class="font-sans" font-size="12" font-weight="700" fill="#94A3B8" text-anchor="middle">PARKSIGNAL by BharatUtility • Direct Telegram Alert • bharatutility.tech/parksignal</text>
    </g>
  </g>

  <rect x="1.5" y="1.5" width="1077" height="1077" rx="32" fill="none" stroke="#CBD5E1" stroke-width="3" />
</svg>`;
    }
  }, [selectedLayout, colors, qrDataUrl, plateFormatted]);

  if (!isOpen) return null;

  // ══════════════════════════════════════════════════════════════════
  // ACTIONS: DOWNLOAD PNG (300+ DPI HIGH-RES) & VECTOR SVG
  // ══════════════════════════════════════════════════════════════════

  const downloadPng = () => {
    if (!masterSvg) return;

    const isSquare = selectedLayout === 'square';
    const exportW = isSquare ? 2160 : 2720;
    const exportH = isSquare ? 2160 : 1360;

    const img = new Image();
    const svgBlob = new Blob([masterSvg], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = exportW;
      canvas.height = exportH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, exportW, exportH);
        const link = document.createElement('a');
        link.download = `ParkSignal-${vehicle.vehicle_number}-${selectedLayout}-${selectedTheme}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        setDownloadSuccess(`Downloaded Ultra High-DPI (300 DPI) ${selectedLayout.toUpperCase()} PNG!`);
        setTimeout(() => setDownloadSuccess(null), 3500);
      }
      URL.revokeObjectURL(blobURL);
    };
    img.src = blobURL;
  };

  const downloadSvg = () => {
    if (!masterSvg) return;
    const blob = new Blob([masterSvg], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ParkSignal-${vehicle.vehicle_number}-${selectedLayout}.svg`;
    link.click();
    setDownloadSuccess('Downloaded Vector SVG for vinyl printing!');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-neutral-900 text-white rounded-3xl shadow-2xl border border-neutral-800 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <ParkSignalLogo variant="emblem" height={36} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>Printable Windshield Sticker</span>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-black">
                    Official Commercial Pass
                  </span>
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Authentic retail format for <strong className="text-white">{vehicle.vehicle_number}</strong>
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

        {/* Toolbar: Design Layouts, Color Schemes, Guide */}
        <div className="px-4 py-2.5 bg-neutral-950/95 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2.5">
          {/* Layout Selection */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-400 text-[11px]">Format:</span>
            <button
              onClick={() => setSelectedLayout('hazard')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedLayout === 'hazard'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Landscape Card (Fastag Size)</span>
            </button>
            <button
              onClick={() => setSelectedLayout('square')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedLayout === 'square'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Square Decal</span>
            </button>
          </div>

          {/* Color Palettes */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-400 text-[11px]">Accent:</span>
            {[
              { id: 'safety_yellow', label: 'Safety Yellow', icon: Sun, color: '#FFD000' },
              { id: 'emergency_orange', label: 'Safety Orange', icon: Flame, color: '#FF5722' },
              { id: 'clean_white', label: 'Arctic White', icon: Zap, color: '#FFFFFF' },
              { id: 'carbon_dark', label: 'Stealth Blue', icon: Moon, color: '#0284C7' },
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

        {/* Live Vector SVG Preview Container */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/80">
          <div className="relative w-full max-w-3xl flex items-center justify-center">
            {showCutBorder && (
              <div className="absolute -inset-2 border-2 border-dashed border-neutral-500/50 rounded-[34px] pointer-events-none flex items-start justify-center pt-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 bg-neutral-900 px-3 py-0.5 rounded-full border border-neutral-700">
                  ✂ Cut along dotted guide &amp; place on windshield facing outward ✂
                </span>
              </div>
            )}

            {/* Direct Vector SVG Render */}
            {masterSvg ? (
              <div
                className="w-full h-auto flex items-center justify-center rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 select-none"
                style={{
                  maxHeight: '52vh',
                  boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9)',
                }}
                dangerouslySetInnerHTML={{ __html: masterSvg }}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-neutral-400 text-sm">
                Generating high-resolution pass...
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-neutral-400 text-center flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>100% Commercial Standard:</strong> Official retail-grade ParkSignal Windshield Pass matching ProfileTap &amp; RepiQR products. Ready for print!
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-800 bg-neutral-950/80 flex flex-wrap items-center justify-between gap-3">
          {downloadSuccess ? (
            <div className="w-full text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1 pb-1">
              <Check className="w-4 h-4" /> {downloadSuccess}
            </div>
          ) : (
            <div className="text-xs text-neutral-400 hidden sm:block">
              Print at home or local photo studio on vinyl sticker / glossy card.
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
              onClick={downloadSvg}
              title="Download Vector SVG for Vinyl Plotters"
              className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <FileCode2 className="w-4 h-4" />
              <span>SVG</span>
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
