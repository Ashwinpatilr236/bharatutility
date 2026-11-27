import React, { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { ParkSignalLogo } from './ParkSignalLogo';
import {
  X,
  Download,
  Check,
  Scissors,
  Sparkles,
  Layers,
  AlertTriangle,
  FileCode2
} from 'lucide-react';
import { ParkSignalVehicle } from '../../types';
import { PARKSIGNAL_DARK_BG_LOGO_B64 } from './parkSignalLogoBase64';

interface ParkSignalStickerModalProps {
  vehicle: ParkSignalVehicle;
  isOpen: boolean;
  onClose: () => void;
}

export type StickerLayout = 'hazard' | 'square';

export const ParkSignalStickerModal: React.FC<ParkSignalStickerModalProps> = ({
  vehicle,
  isOpen,
  onClose,
}) => {
  const [selectedLayout, setSelectedLayout] = useState<StickerLayout>('hazard');
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
        dark: '#111318',
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

  // Safety plate masking: show state+RTO prefix (e.g. GJ06) + dots + last 2 digits only (e.g. 88)
  const cleanPlate = (vehicle.vehicle_number || '').trim().toUpperCase();
  const displayPlate =
    vehicle.display_plate_publicly === 1
      ? cleanPlate
      : cleanPlate.length > 4
      ? `${cleanPlate.slice(0, 4)} •••• ${cleanPlate.slice(-2)}`
      : '••••';

  const vehicleTypeUpper = vehicle.vehicle_type ? vehicle.vehicle_type.toUpperCase() : 'VEHICLE';
  const plateFormatted = `${vehicleTypeUpper} • ${displayPlate}`;

  // ══════════════════════════════════════════════════════════════════
  // GENERATE MASTER SVG (Clean Industrial Automotive Safety Standard)
  // Strict 4-color palette: #FF5A00, #111318, #FFD600, #FFFFFF
  // ══════════════════════════════════════════════════════════════════
  const masterSvg = useMemo(() => {
    if (!qrDataUrl) return '';

    // ─────────────────────────────────────────────────────────────
    // FORMAT 1: LANDSCAPE SAFETY STICKER (1360 x 680)
    // ─────────────────────────────────────────────────────────────
    if (selectedLayout === 'hazard') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1360" height="680" viewBox="0 0 1360 680">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <clipPath id="pass-clip">
      <rect x="0" y="0" width="1360" height="680" rx="28" ry="28" />
    </clipPath>
    <clipPath id="qr-card-clip">
      <rect x="0" y="0" width="440" height="512" rx="22" ry="22" />
    </clipPath>
    <!-- Minimal 45-degree Top & Bottom Hazard Stripes -->
    <pattern id="hazardStripe" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="20" height="40" fill="#111318" />
      <rect x="20" width="20" height="40" fill="#FFD600" />
    </pattern>
  </defs>

  <g clip-path="url(#pass-clip)">
    <!-- Jet Black Base -->
    <rect x="0" y="0" width="1360" height="680" fill="#111318" />

    <!-- Minimal Top & Bottom Hazard Stripes -->
    <rect x="0" y="0" width="1360" height="22" fill="url(#hazardStripe)" />
    <rect x="0" y="658" width="1360" height="22" fill="url(#hazardStripe)" />

    <!-- ── LEFT SECTION: CLEAN QR CARD ── -->
    <g transform="translate(42, 42)">
      <g clip-path="url(#qr-card-clip)">
        <!-- Yellow Header -->
        <rect x="0" y="0" width="440" height="106" fill="#FFD600" />
        <text x="24" y="47" class="font-sans" font-size="31" font-weight="900" fill="#111318" letter-spacing="-0.5">SCAN QR CODE</text>
        <text x="24" y="80" class="font-sans" font-size="18.5" font-weight="700" fill="#111318">Use Any Phone Camera</text>

        <!-- Minimal Phone Scanning Icon -->
        <g transform="translate(362, 18)">
          <rect x="0" y="0" width="44" height="70" rx="7" fill="#111318" />
          <rect x="4" y="8" width="36" height="50" rx="3" fill="#FFFFFF" />
          <rect x="10" y="16" width="24" height="24" rx="2" fill="#111318" />
          <rect x="14" y="20" width="16" height="16" fill="#FFD600" />
          <rect x="17" y="23" width="10" height="10" fill="#111318" />
          <circle cx="22" cy="63" r="2.5" fill="#FFD600" />
        </g>

        <!-- Pure White QR Background -->
        <rect x="0" y="106" width="440" height="406" fill="#FFFFFF" />

        <!-- Actual High-Res Working QR Code -->
        <image href="${qrDataUrl}" x="30" y="116" width="380" height="380" />
      </g>

      <!-- Scan Instruction Pill -->
      <g transform="translate(14, 528)">
        <rect x="0" y="0" width="412" height="48" rx="24" fill="#111318" stroke="#FFD600" stroke-width="2" />
        <text x="206" y="21" class="font-sans" font-size="12.5" font-weight="900" fill="#FFD600" text-anchor="middle" letter-spacing="0.5">SCAN WITH ANY PHONE CAMERA</text>
        <text x="206" y="38" class="font-sans" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.8">• NO APP REQUIRED</text>
      </g>

      <!-- Website -->
      <text x="220" y="596" class="font-sans" font-size="12" font-weight="700" fill="#FFFFFF" opacity="0.75" text-anchor="middle">bharatutility.tech/parksignal</text>
    </g>

    <!-- ── RIGHT SECTION: HIGH-VISIBILITY SAFETY COMMUNICATION ── -->
    <g transform="translate(520, 42)">
      <!-- 1. Top ParkSignal Branding (Clean, no Fastag pill) -->
      <g transform="translate(0, -4)">
        <image href="${PARKSIGNAL_DARK_BG_LOGO_B64}" x="0" y="0" width="225" height="78" preserveAspectRatio="xMidYMid meet" />
      </g>

      <!-- 2. Bold Headline Banner -->
      <g transform="translate(0, 82)">
        <!-- Safety Orange Block -->
        <rect x="0" y="0" width="526" height="82" rx="12" fill="#FF5A00" />
        <text x="24" y="57" class="font-sans" font-size="45" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">PARKING ISSUE?</text>

        <!-- Signal Yellow Block -->
        <rect x="536" y="0" width="260" height="82" rx="12" fill="#FFD600" />
        <text x="554" y="36" class="font-sans" font-size="27" font-weight="900" fill="#111318" letter-spacing="0.4">CONTACT</text>
        <text x="554" y="66" class="font-sans" font-size="22.5" font-weight="900" fill="#111318" letter-spacing="0.3">VEHICLE OWNER</text>
      </g>

      <!-- 3. Three Clearly Numbered Steps -->
      <g transform="translate(0, 184)">
        <!-- Step 01 -->
        <g transform="translate(0, 0)">
          <text x="0" y="54" class="font-sans" font-size="56" font-weight="900" fill="#FF5A00" letter-spacing="-1">01</text>
          <rect x="72" y="10" width="44" height="4" rx="2" fill="#FF5A00" />
          <text x="72" y="34" class="font-sans" font-size="16" font-weight="900" fill="#FFFFFF">SCAN</text>
          <text x="72" y="54" class="font-sans" font-size="14" font-weight="900" fill="#FF5A00">QR</text>
        </g>

        <text x="194" y="46" class="font-sans" font-size="28" font-weight="900" fill="#FFFFFF" opacity="0.6">&gt;</text>

        <!-- Step 02 -->
        <g transform="translate(238, 0)">
          <text x="0" y="54" class="font-sans" font-size="56" font-weight="900" fill="#FF5A00" letter-spacing="-1">02</text>
          <rect x="76" y="10" width="44" height="4" rx="2" fill="#FF5A00" />
          <text x="76" y="34" class="font-sans" font-size="16" font-weight="900" fill="#FFFFFF">OPEN</text>
          <text x="76" y="54" class="font-sans" font-size="14" font-weight="900" fill="#FF5A00">PARKSIGNAL</text>
        </g>

        <text x="476" y="46" class="font-sans" font-size="28" font-weight="900" fill="#FFFFFF" opacity="0.6">&gt;</text>

        <!-- Step 03 -->
        <g transform="translate(520, 0)">
          <text x="0" y="54" class="font-sans" font-size="56" font-weight="900" fill="#FF5A00" letter-spacing="-1">03</text>
          <rect x="76" y="10" width="44" height="4" rx="2" fill="#FF5A00" />
          <text x="76" y="34" class="font-sans" font-size="16" font-weight="900" fill="#FFFFFF">CONTACT</text>
          <text x="76" y="54" class="font-sans" font-size="14" font-weight="900" fill="#FF5A00">OWNER</text>
        </g>
      </g>

      <!-- 4. Compact Row of 6 Emergency Icons -->
      <g transform="translate(0, 276)">
        <!-- 1. ACCIDENT -->
        <g transform="translate(66, 0)">
          <circle cx="0" cy="27" r="27" fill="#FFD600" />
          <path d="M-9 13 C-9 20 -2 27 5 27 L8 24 C9 23 9 21 8 20 L4 17 C3 16 2 16 1 17 L0 18 C-3 16 -5 14 -7 11 L-6 10 C-5 9 -5 8 -6 7 L-9 3 C-10 2 -11 2 -12 3 L-14 5 C-15 7 -15 8 -14 9" fill="#111318" transform="translate(3, 12)" />
          <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">ACCIDENT</text>
        </g>

        <!-- 2. POLICE -->
        <g transform="translate(198, 0)">
          <circle cx="0" cy="27" r="27" fill="#FFD600" />
          <path d="M-11 17 L0 9 L11 17 V28 C11 36 0 42 0 42 C0 42 -11 36 -11 28 Z" fill="none" stroke="#111318" stroke-width="3" />
          <circle cx="0" cy="25" r="4" fill="#111318" />
          <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">POLICE</text>
        </g>

        <!-- 3. BREAKDOWN -->
        <g transform="translate(330, 0)">
          <circle cx="0" cy="27" r="27" fill="#FFD600" />
          <path d="M-10 17 L10 37 M10 17 L-10 37" stroke="#111318" stroke-width="3.5" stroke-linecap="round" />
          <circle cx="0" cy="27" r="4.5" fill="#111318" />
          <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">BREAKDOWN</text>
        </g>

        <!-- 4. TOWING -->
        <g transform="translate(462, 0)">
          <circle cx="0" cy="27" r="27" fill="#FFD600" />
          <path d="M-13 38 L13 38 M-9 36 L-3 15 L3 15 L9 36 Z" fill="none" stroke="#111318" stroke-width="3" stroke-linejoin="round" />
          <line x1="-6" y1="27" x2="6" y2="27" stroke="#111318" stroke-width="2.5" />
          <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">TOWING</text>
        </g>

        <!-- 5. SAFETY -->
        <g transform="translate(594, 0)">
          <circle cx="0" cy="27" r="27" fill="#FFD600" />
          <path d="M0 13 L13 37 L-13 37 Z" fill="none" stroke="#111318" stroke-width="3" stroke-linejoin="round" />
          <line x1="0" y1="21" x2="0" y2="29" stroke="#111318" stroke-width="2.8" stroke-linecap="round" />
          <circle cx="0" cy="33" r="1.8" fill="#111318" />
          <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">SAFETY</text>
        </g>

        <!-- 6. PARKING -->
        <g transform="translate(726, 0)">
          <circle cx="0" cy="27" r="27" fill="#FFD600" />
          <text x="0" y="36" class="font-sans" font-size="26" font-weight="900" fill="#111318" text-anchor="middle">P</text>
          <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">PARKING</text>
        </g>
      </g>

      <!-- 5. Clean Supporting Context Strip -->
      <g transform="translate(0, 374)">
        <rect x="0" y="0" width="796" height="36" rx="8" fill="#1B1F27" />
        <text x="398" y="23" class="font-sans" font-size="13.5" font-weight="600" fill="#FFFFFF" opacity="0.9" text-anchor="middle">Facing a parking issue or emergency? Scan the QR to contact the owner privately.</text>
      </g>

      <!-- 6. Vehicle Number in Clean White Strip (HSRP Format) -->
      <g transform="translate(0, 426)">
        <rect x="0" y="0" width="796" height="88" rx="14" fill="#FFFFFF" />
        <!-- Standard IND Plate Strip -->
        <rect x="0" y="0" width="96" height="88" rx="12" fill="#003399" />
        <circle cx="48" cy="31" r="12" fill="none" stroke="#FFFFFF" stroke-width="2" />
        <text x="48" y="69" class="font-sans" font-size="21" font-weight="900" fill="#FFFFFF" text-anchor="middle">IND</text>
        <!-- Plate Text -->
        <text x="446" y="58" class="font-mono" font-size="40" font-weight="900" fill="#111318" text-anchor="middle" letter-spacing="4">${plateFormatted}</text>
      </g>

      <!-- 7. Privacy Statement -->
      <g transform="translate(0, 536)">
        <text x="398" y="20" class="font-sans" font-size="14" font-weight="900" fill="#FFD600" text-anchor="middle" letter-spacing="0.6">
          🔒 100% PRIVATE • <tspan fill="#FFFFFF">OWNER PHONE NUMBER IS NEVER SHARED</tspan>
        </text>
      </g>
    </g>
  </g>

  <!-- Clean Rounded Outer Border -->
  <rect x="2" y="2" width="1356" height="676" rx="28" fill="none" stroke="#FFD600" stroke-width="3" />
</svg>`;
    }

    // ─────────────────────────────────────────────────────────────
    // FORMAT 2: SQUARE DECAL FORMAT (1080 x 1080)
    // ─────────────────────────────────────────────────────────────
    else {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <clipPath id="square-clip">
      <rect x="0" y="0" width="1080" height="1080" rx="32" ry="32" />
    </clipPath>
    <pattern id="hazardStripeSq" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="20" height="40" fill="#111318" />
      <rect x="20" width="20" height="40" fill="#FFD600" />
    </pattern>
  </defs>

  <g clip-path="url(#square-clip)">
    <rect x="0" y="0" width="1080" height="1080" fill="#111318" />

    <!-- Top & Bottom Hazard Stripes -->
    <rect x="0" y="0" width="1080" height="22" fill="url(#hazardStripeSq)" />
    <rect x="0" y="1058" width="1080" height="22" fill="url(#hazardStripeSq)" />

    <!-- Top Headline Banner -->
    <g transform="translate(48, 44)">
      <rect x="0" y="0" width="664" height="90" rx="14" fill="#FF5A00" />
      <text x="332" y="60" class="font-sans" font-size="46" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">PARKING ISSUE?</text>

      <rect x="676" y="0" width="308" height="90" rx="14" fill="#FFD600" />
      <text x="830" y="40" class="font-sans" font-size="28" font-weight="900" fill="#111318" text-anchor="middle">CONTACT</text>
      <text x="830" y="72" class="font-sans" font-size="24" font-weight="900" fill="#111318" text-anchor="middle">VEHICLE OWNER</text>
    </g>

    <!-- Brand Lockup -->
    <g transform="translate(48, 148)">
      <image href="${PARKSIGNAL_DARK_BG_LOGO_B64}" x="382" y="0" width="220" height="72" preserveAspectRatio="xMidYMid meet" />
    </g>

    <!-- Large White QR Card with Yellow Header -->
    <g transform="translate(180, 234)">
      <rect x="0" y="0" width="720" height="546" rx="26" fill="#FFFFFF" />
      <rect x="0" y="0" width="720" height="92" rx="24" fill="#FFD600" />
      <rect x="0" y="66" width="720" height="26" fill="#FFD600" />
      <text x="360" y="46" class="font-sans" font-size="32" font-weight="900" fill="#111318" text-anchor="middle">SCAN QR CODE</text>
      <text x="360" y="76" class="font-sans" font-size="18" font-weight="700" fill="#111318" text-anchor="middle">Use Any Phone Camera • No App Required</text>

      <!-- Actual High-Res QR Image -->
      <image href="${qrDataUrl}" x="155" y="114" width="410" height="410" />
    </g>

    <!-- Vehicle Number White Strip -->
    <g transform="translate(48, 804)">
      <rect x="0" y="0" width="984" height="96" rx="16" fill="#FFFFFF" />
      <rect x="0" y="0" width="100" height="96" rx="14" fill="#003399" />
      <circle cx="50" cy="34" r="11" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
      <text x="50" y="74" class="font-sans" font-size="23" font-weight="900" fill="#FFFFFF" text-anchor="middle">IND</text>
      <text x="542" y="62" class="font-mono" font-size="44" font-weight="900" fill="#111318" text-anchor="middle" letter-spacing="3">${plateFormatted}</text>
    </g>

    <!-- Privacy Statement & Website Footer -->
    <g transform="translate(48, 924)">
      <rect x="0" y="0" width="984" height="94" rx="14" fill="#1B1F27" />
      <text x="492" y="38" class="font-sans" font-size="16" font-weight="900" fill="#FFD600" text-anchor="middle">🔒 100% PRIVATE • <tspan fill="#FFFFFF">OWNER PHONE NUMBER IS NEVER SHARED</tspan></text>
      <text x="492" y="70" class="font-sans" font-size="15" font-weight="700" fill="#FFFFFF" opacity="0.75" text-anchor="middle">bharatutility.tech/parksignal</text>
    </g>
  </g>

  <rect x="2" y="2" width="1076" height="1076" rx="32" fill="none" stroke="#FFD600" stroke-width="3" />
</svg>`;
    }
  }, [selectedLayout, qrDataUrl, plateFormatted]);

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
        link.download = `ParkSignal-${vehicle.vehicle_number}-${selectedLayout}.png`;
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
                    Safety Pass
                  </span>
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                High-visibility industrial safety pass for <strong className="text-white">{vehicle.vehicle_number}</strong>
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

        {/* Toolbar: Format & Guide */}
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
              <span>Landscape Safety Sticker</span>
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
                  maxHeight: '54vh',
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
              <strong>Industrial Safety Standard:</strong> Bold high-visibility contrast, transparent outer corners, 300 DPI print-ready.
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
