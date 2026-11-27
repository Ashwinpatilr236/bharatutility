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
import { PARKSIGNAL_EMBLEM_B64 } from './parkSignalLogoBase64';

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
  // GENERATE MASTER SVG (Matte Industrial Automotive Safety Standard)
  // ══════════════════════════════════════════════════════════════════
  const masterSvg = useMemo(() => {
    if (!qrDataUrl) return '';

    const pad = showCutBorder ? 14 : 0;

    // ─────────────────────────────────────────────────────────────
    // FORMAT 1: LANDSCAPE SAFETY STICKER (1360 x 680 + optional cut margin)
    // ─────────────────────────────────────────────────────────────
    if (selectedLayout === 'hazard') {
      const totalW = 1360 + pad * 2;
      const totalH = 680 + pad * 2;

      return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <!-- Matte Charcoal-Black Gradient -->
    <linearGradient id="matteBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#171A21" />
      <stop offset="55%" stop-color="#111318" />
      <stop offset="100%" stop-color="#0B0D11" />
    </linearGradient>
    <clipPath id="pass-clip">
      <rect x="0" y="0" width="1360" height="680" rx="28" ry="28" />
    </clipPath>
    <clipPath id="qr-card-clip">
      <rect x="0" y="0" width="440" height="510" rx="22" ry="22" />
    </clipPath>
    <!-- Minimal 45-degree Top & Bottom Hazard Stripes -->
    <pattern id="hazardStripe" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="20" height="40" fill="#111318" />
      <rect x="20" width="20" height="40" fill="#FFD600" />
    </pattern>
  </defs>

  ${showCutBorder ? `
  <!-- Real Dotted Cut Guide around the outer edge -->
  <rect x="3" y="3" width="${totalW - 6}" height="${totalH - 6}" rx="34" ry="34" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-dasharray="10 8" />
  ` : ''}

  <g transform="translate(${pad}, ${pad})">
    <g clip-path="url(#pass-clip)">
      <!-- Matte Black-Gray Base -->
      <rect x="0" y="0" width="1360" height="680" fill="url(#matteBg)" />

      <!-- Minimal Top & Bottom Hazard Stripes -->
      <rect x="0" y="0" width="1360" height="20" fill="url(#hazardStripe)" />
      <rect x="0" y="660" width="1360" height="20" fill="url(#hazardStripe)" />

      <!-- ── LEFT SECTION: CLEAN QR CARD ── -->
      <g transform="translate(42, 42)">
        <g clip-path="url(#qr-card-clip)">
          <!-- Signal Yellow Header -->
          <rect x="0" y="0" width="440" height="104" fill="#FFD600" />
          <text x="26" y="46" class="font-sans" font-size="31" font-weight="900" fill="#111318" letter-spacing="-0.5">SCAN QR CODE</text>
          <text x="26" y="79" class="font-sans" font-size="18" font-weight="700" fill="#111318">Use Any Phone Camera</text>

          <!-- Clean Geometric Phone Scanning Icon -->
          <g transform="translate(364, 17)">
            <rect x="0" y="0" width="44" height="70" rx="7" fill="#111318" />
            <rect x="4" y="8" width="36" height="50" rx="3" fill="#FFFFFF" />
            <rect x="10" y="16" width="24" height="24" rx="2" fill="#111318" />
            <rect x="14" y="20" width="16" height="16" fill="#FFD600" />
            <rect x="17" y="23" width="10" height="10" fill="#111318" />
            <circle cx="22" cy="63" r="2.5" fill="#FFD600" />
          </g>

          <!-- Pure White QR Background -->
          <rect x="0" y="104" width="440" height="406" fill="#FFFFFF" />

          <!-- Actual High-Res Working QR Code -->
          <image href="${qrDataUrl}" x="30" y="116" width="380" height="380" />
        </g>

        <!-- Clean Flat Scan Instruction Pill -->
        <g transform="translate(14, 526)">
          <rect x="0" y="0" width="412" height="48" rx="24" fill="#171A21" stroke="#FFD600" stroke-width="1.8" />
          <text x="206" y="21" class="font-sans" font-size="12.5" font-weight="900" fill="#FFD600" text-anchor="middle" letter-spacing="0.6">SCAN WITH ANY PHONE CAMERA</text>
          <text x="206" y="38" class="font-sans" font-size="11" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.8">• NO APP REQUIRED</text>
        </g>

        <!-- Website -->
        <text x="220" y="596" class="font-sans" font-size="12.5" font-weight="700" fill="#FFFFFF" opacity="0.78" text-anchor="middle" letter-spacing="0.4">bharatutility.tech/parksignal</text>
      </g>

      <!-- ── RIGHT SECTION: HIGH-VISIBILITY SAFETY COMMUNICATION ── -->
      <g transform="translate(522, 42)">
        <!-- 1. Centered, Unclipped Brand Identity & Highlighted BharatUtility -->
        <g transform="translate(196, 2)">
          <!-- Complete Unclipped Car-Cyber Emblem (472x316 = 1.49:1) -->
          <image href="${PARKSIGNAL_EMBLEM_B64}" x="0" y="0" width="98" height="66" preserveAspectRatio="xMidYMid meet" />
          <!-- Crisp Brand Lockup -->
          <g transform="translate(112, 6)">
            <text x="0" y="30" class="font-sans" font-size="32" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">PARK<tspan fill="#FFD600">SIGNAL</tspan></text>
            <g transform="translate(0, 40)">
              <text x="0" y="14" class="font-sans" font-size="11" font-weight="700" fill="#94A3B8" letter-spacing="1.4">SMART VEHICLE PASS • BY</text>
              <rect x="176" y="0" width="114" height="20" rx="5" fill="#FFFFFF" opacity="0.12" />
              <text x="233" y="14" class="font-sans" font-size="11" font-weight="900" fill="#FFD600" text-anchor="middle" letter-spacing="0.8">BHARATUTILITY</text>
            </g>
          </g>
        </g>

        <!-- 2. Bold & Crisp Headline Banner -->
        <g transform="translate(0, 82)">
          <!-- Safety Orange Block -->
          <rect x="0" y="0" width="530" height="84" rx="12" fill="#FF5A00" />
          <text x="265" y="59" class="font-sans" font-size="48" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">PARKING ISSUE?</text>

          <!-- Signal Yellow Block -->
          <rect x="542" y="0" width="252" height="84" rx="12" fill="#FFD600" />
          <text x="668" y="37" class="font-sans" font-size="27" font-weight="900" fill="#111318" text-anchor="middle" letter-spacing="0.6">CONTACT</text>
          <text x="668" y="67" class="font-sans" font-size="22.5" font-weight="900" fill="#111318" text-anchor="middle" letter-spacing="0.4">VEHICLE OWNER</text>
        </g>

        <!-- 3. Three Clearly Numbered Steps (Bold & Highly Legible) -->
        <g transform="translate(0, 186)">
          <!-- Step 01 -->
          <g transform="translate(0, 0)">
            <text x="0" y="54" class="font-sans" font-size="58" font-weight="900" fill="#FF5A00" letter-spacing="-1.5">01</text>
            <rect x="74" y="9" width="46" height="4" rx="2" fill="#FF5A00" />
            <text x="74" y="34" class="font-sans" font-size="17" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">SCAN</text>
            <text x="74" y="55" class="font-sans" font-size="15" font-weight="900" fill="#FFD600" letter-spacing="0.5">QR</text>
          </g>

          <text x="196" y="46" class="font-sans" font-size="28" font-weight="900" fill="#FFFFFF" opacity="0.45">&gt;</text>

          <!-- Step 02 -->
          <g transform="translate(236, 0)">
            <text x="0" y="54" class="font-sans" font-size="58" font-weight="900" fill="#FF5A00" letter-spacing="-1.5">02</text>
            <rect x="78" y="9" width="46" height="4" rx="2" fill="#FF5A00" />
            <text x="78" y="34" class="font-sans" font-size="17" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">OPEN</text>
            <text x="78" y="55" class="font-sans" font-size="15.5" font-weight="900" fill="#FFD600" letter-spacing="0.8">PARKSIGNAL</text>
          </g>

          <text x="482" y="46" class="font-sans" font-size="28" font-weight="900" fill="#FFFFFF" opacity="0.45">&gt;</text>

          <!-- Step 03 -->
          <g transform="translate(522, 0)">
            <text x="0" y="54" class="font-sans" font-size="58" font-weight="900" fill="#FF5A00" letter-spacing="-1.5">03</text>
            <rect x="78" y="9" width="46" height="4" rx="2" fill="#FF5A00" />
            <text x="78" y="34" class="font-sans" font-size="17" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">CONTACT</text>
            <text x="78" y="55" class="font-sans" font-size="15" font-weight="900" fill="#FFD600" letter-spacing="0.5">OWNER</text>
          </g>
        </g>

        <!-- 4. Modern Uniform Row of 6 Emergency Icons -->
        <g transform="translate(0, 278)">
          <!-- 1. ACCIDENT (Modern Car Collision Hazard) -->
          <g transform="translate(66, 0)">
            <circle cx="0" cy="27" r="27" fill="#FFD600" />
            <!-- Car Front/Body -->
            <path d="M-13 33 L-11 26 C-10 23 -7 22 -4 22 H4 C7 22 10 23 11 26 L13 33 V38 H10 V36 H-10 V38 H-13 Z" fill="#111318" />
            <circle cx="-7" cy="31" r="2" fill="#FFD600" />
            <circle cx="7" cy="31" r="2" fill="#FFD600" />
            <!-- Impact Burst Lines -->
            <path d="M0 11 V17 M-8 14 L-4 18 M8 14 L4 18" stroke="#111318" stroke-width="2.6" stroke-linecap="round" />
            <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.6">ACCIDENT</text>
          </g>

          <!-- 2. POLICE (Modern Shield Badge) -->
          <g transform="translate(198, 0)">
            <circle cx="0" cy="27" r="27" fill="#FFD600" />
            <path d="M-11 17 L0 11 L11 17 V28 C11 35 0 41 0 41 C0 41 -11 35 -11 28 Z" fill="none" stroke="#111318" stroke-width="2.8" stroke-linejoin="round" />
            <polygon points="0,19 1.8,23.5 6.5,23.8 2.8,26.8 4,31.5 0,28.8 -4,31.5 -2.8,26.8 -6.5,23.8 -1.8,23.5" fill="#111318" />
            <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.6">POLICE</text>
          </g>

          <!-- 3. BREAKDOWN (Modern Crossed Wrench & Tool) -->
          <g transform="translate(330, 0)">
            <circle cx="0" cy="27" r="27" fill="#FFD600" />
            <path d="M-10 37 L10 17 M-10 17 L10 37" stroke="#111318" stroke-width="3.2" stroke-linecap="round" />
            <circle cx="-10" cy="17" r="3.5" fill="#111318" />
            <circle cx="10" cy="37" r="3.5" fill="#111318" />
            <circle cx="0" cy="27" r="4" fill="#FFD600" stroke="#111318" stroke-width="2.5" />
            <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.6">BREAKDOWN</text>
          </g>

          <!-- 4. TOWING (Modern Tow Truck Silhouette) -->
          <g transform="translate(462, 0)">
            <circle cx="0" cy="27" r="27" fill="#FFD600" />
            <path d="M-14 33 H14 V28 L9 22 H2 V33 M-14 33 V28 H-2 M-11 28 L-4 17 L2 22" fill="none" stroke="#111318" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="-8" cy="35" r="3" fill="#111318" />
            <circle cx="8" cy="35" r="3" fill="#111318" />
            <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.6">TOWING</text>
          </g>

          <!-- 5. SAFETY (Modern Hazard Triangle) -->
          <g transform="translate(594, 0)">
            <circle cx="0" cy="27" r="27" fill="#FFD600" />
            <path d="M0 13 L13 36 L-13 36 Z" fill="none" stroke="#111318" stroke-width="2.8" stroke-linejoin="round" />
            <line x1="0" y1="21" x2="0" y2="29" stroke="#111318" stroke-width="2.8" stroke-linecap="round" />
            <circle cx="0" cy="32.5" r="1.7" fill="#111318" />
            <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.6">SAFETY</text>
          </g>

          <!-- 6. PARKING (Modern Roundel P) -->
          <g transform="translate(726, 0)">
            <circle cx="0" cy="27" r="27" fill="#FFD600" />
            <circle cx="0" cy="27" r="19" fill="none" stroke="#111318" stroke-width="2.2" />
            <text x="0" y="35" class="font-sans" font-size="24" font-weight="900" fill="#111318" text-anchor="middle">P</text>
            <text x="0" y="72" class="font-sans" font-size="11.5" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.6">PARKING</text>
          </g>
        </g>

        <!-- 5. Clean Supporting Context Strip -->
        <g transform="translate(0, 376)">
          <rect x="0" y="0" width="794" height="36" rx="8" fill="#1B1F27" />
          <text x="397" y="23" class="font-sans" font-size="13.5" font-weight="600" fill="#FFFFFF" opacity="0.92" text-anchor="middle">Facing a parking issue or emergency? Scan the QR to contact the owner privately.</text>
        </g>

        <!-- 6. Up-scaled Embossed HSRP Vehicle Registration Plate -->
        <g transform="translate(0, 426)">
          <!-- Outer HSRP Plate Frame -->
          <rect x="0" y="0" width="794" height="90" rx="14" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
          <!-- Inner Subtle Emboss Bevel -->
          <rect x="3" y="3" width="788" height="84" rx="11" fill="none" stroke="#E2E8F0" stroke-width="1.5" />

          <!-- Standard IND Blue Strip -->
          <rect x="3" y="3" width="96" height="84" rx="10" fill="#003399" />
          <!-- Detailed Ashoka Chakra -->
          <g transform="translate(51, 31)">
            <circle cx="0" cy="0" r="12" fill="none" stroke="#FFFFFF" stroke-width="1.8" />
            <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
            <line x1="-11" y1="0" x2="11" y2="0" stroke="#FFFFFF" stroke-width="1" />
            <line x1="0" y1="-11" x2="0" y2="11" stroke="#FFFFFF" stroke-width="1" />
            <line x1="-8" y1="-8" x2="8" y2="8" stroke="#FFFFFF" stroke-width="1" />
            <line x1="-8" y1="8" x2="8" y2="-8" stroke="#FFFFFF" stroke-width="1" />
          </g>
          <text x="51" y="71" class="font-sans" font-size="21" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">IND</text>

          <!-- High-Visibility Embossed Plate Text -->
          <text x="447" y="61" class="font-mono" font-size="42" font-weight="900" fill="#111318" text-anchor="middle" letter-spacing="4">${plateFormatted}</text>
        </g>

        <!-- 7. Privacy Statement -->
        <g transform="translate(0, 538)">
          <text x="397" y="20" class="font-sans" font-size="14" font-weight="900" fill="#FFD600" text-anchor="middle" letter-spacing="0.6">
            🔒 100% PRIVATE • <tspan fill="#FFFFFF">OWNER PHONE NUMBER IS NEVER SHARED</tspan>
          </text>
        </g>
      </g>
    </g>

    <!-- Clean Matte Outer Border -->
    <rect x="1.5" y="1.5" width="1357" height="677" rx="28" fill="none" stroke="#FFD600" stroke-width="2.5" />
  </g>
</svg>`;
    }

    // ─────────────────────────────────────────────────────────────
    // FORMAT 2: SQUARE DECAL FORMAT (1080 x 1080 + optional cut margin)
    // ─────────────────────────────────────────────────────────────
    else {
      const totalW = 1080 + pad * 2;
      const totalH = 1080 + pad * 2;

      return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <linearGradient id="matteBgSq" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#171A21" />
      <stop offset="55%" stop-color="#111318" />
      <stop offset="100%" stop-color="#0B0D11" />
    </linearGradient>
    <clipPath id="square-clip">
      <rect x="0" y="0" width="1080" height="1080" rx="32" ry="32" />
    </clipPath>
    <pattern id="hazardStripeSq" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="20" height="40" fill="#111318" />
      <rect x="20" width="20" height="40" fill="#FFD600" />
    </pattern>
  </defs>

  ${showCutBorder ? `
  <rect x="3" y="3" width="${totalW - 6}" height="${totalH - 6}" rx="38" ry="38" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-dasharray="10 8" />
  ` : ''}

  <g transform="translate(${pad}, ${pad})">
    <g clip-path="url(#square-clip)">
      <rect x="0" y="0" width="1080" height="1080" fill="url(#matteBgSq)" />

      <!-- Top & Bottom Hazard Stripes -->
      <rect x="0" y="0" width="1080" height="20" fill="url(#hazardStripeSq)" />
      <rect x="0" y="1060" width="1080" height="20" fill="url(#hazardStripeSq)" />

      <!-- Top Headline Banner -->
      <g transform="translate(48, 44)">
        <rect x="0" y="0" width="664" height="90" rx="14" fill="#FF5A00" />
        <text x="332" y="61" class="font-sans" font-size="47" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.3">PARKING ISSUE?</text>

        <rect x="676" y="0" width="308" height="90" rx="14" fill="#FFD600" />
        <text x="830" y="40" class="font-sans" font-size="28" font-weight="900" fill="#111318" text-anchor="middle">CONTACT</text>
        <text x="830" y="72" class="font-sans" font-size="24" font-weight="900" fill="#111318" text-anchor="middle">VEHICLE OWNER</text>
      </g>

      <!-- Organized Brand Lockup -->
      <g transform="translate(298, 152)">
        <image href="${PARKSIGNAL_EMBLEM_B64}" x="0" y="0" width="86" height="58" preserveAspectRatio="xMidYMid meet" />
        <text x="98" y="30" class="font-sans" font-size="30" font-weight="900" fill="#FFFFFF" letter-spacing="0.5">PARK<tspan fill="#FFD600">SIGNAL</tspan></text>
        <text x="98" y="50" class="font-sans" font-size="11" font-weight="800" fill="#94A3B8" letter-spacing="1.2">BY <tspan fill="#FFD600">BHARATUTILITY</tspan></text>
      </g>

      <!-- Large White QR Card with Yellow Header -->
      <g transform="translate(180, 232)">
        <rect x="0" y="0" width="720" height="546" rx="26" fill="#FFFFFF" />
        <rect x="0" y="0" width="720" height="92" rx="24" fill="#FFD600" />
        <rect x="0" y="66" width="720" height="26" fill="#FFD600" />
        <text x="360" y="46" class="font-sans" font-size="32" font-weight="900" fill="#111318" text-anchor="middle">SCAN QR CODE</text>
        <text x="360" y="76" class="font-sans" font-size="18" font-weight="700" fill="#111318" text-anchor="middle">Use Any Phone Camera • No App Required</text>

        <!-- Actual High-Res QR Image -->
        <image href="${qrDataUrl}" x="155" y="114" width="410" height="410" />
      </g>

      <!-- Up-scaled Embossed HSRP Vehicle Number Strip -->
      <g transform="translate(48, 804)">
        <rect x="0" y="0" width="984" height="96" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
        <rect x="3" y="3" width="978" height="90" rx="13" fill="none" stroke="#E2E8F0" stroke-width="1.5" />
        <rect x="3" y="3" width="100" height="90" rx="12" fill="#003399" />
        <circle cx="53" cy="34" r="11" fill="none" stroke="#FFFFFF" stroke-width="2" />
        <circle cx="53" cy="34" r="2" fill="#FFFFFF" />
        <text x="53" y="74" class="font-sans" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">IND</text>
        <text x="545" y="64" class="font-mono" font-size="44" font-weight="900" fill="#111318" text-anchor="middle" letter-spacing="3">${plateFormatted}</text>
      </g>

      <!-- Privacy Statement & Website Footer -->
      <g transform="translate(48, 924)">
        <rect x="0" y="0" width="984" height="94" rx="14" fill="#1B1F27" />
        <text x="492" y="38" class="font-sans" font-size="16" font-weight="900" fill="#FFD600" text-anchor="middle">🔒 100% PRIVATE • <tspan fill="#FFFFFF">OWNER PHONE NUMBER IS NEVER SHARED</tspan></text>
        <text x="492" y="70" class="font-sans" font-size="15" font-weight="700" fill="#FFFFFF" opacity="0.78" text-anchor="middle">bharatutility.tech/parksignal</text>
      </g>
    </g>

    <rect x="1.5" y="1.5" width="1077" height="1077" rx="32" fill="none" stroke="#FFD600" stroke-width="2.5" />
  </g>
</svg>`;
    }
  }, [selectedLayout, qrDataUrl, plateFormatted, showCutBorder]);

  if (!isOpen) return null;

  // ══════════════════════════════════════════════════════════════════
  // ACTIONS: DOWNLOAD PNG (300+ DPI HIGH-RES) & VECTOR SVG
  // ══════════════════════════════════════════════════════════════════

  const downloadPng = () => {
    if (!masterSvg) return;

    const isSquare = selectedLayout === 'square';
    const pad = showCutBorder ? 28 : 0;
    const exportW = (isSquare ? 2160 : 2720) + pad;
    const exportH = (isSquare ? 2160 : 1360) + pad;

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
                Matte-finish industrial safety pass for <strong className="text-white">{vehicle.vehicle_number}</strong>
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
            <span>Dotted Cut Guide</span>
          </label>
        </div>

        {/* Live Vector SVG Preview Container */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/80">
          {showCutBorder && (
            <div className="mb-2 text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Scissors className="w-3 h-3 text-amber-400" />
              <span>Cut along outer dotted guide &amp; place on windshield facing outward</span>
            </div>
          )}

          <div className="relative w-full max-w-3xl flex items-center justify-center">
            {/* Direct Vector SVG Render (includes real dotted cut line when enabled) */}
            {masterSvg ? (
              <div
                className="w-full h-auto flex items-center justify-center overflow-hidden transition-all duration-300 select-none"
                style={{
                  maxHeight: '54vh',
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
              <strong>Production-Ready Matte Finish:</strong> Real dotted cut-line included in SVG &amp; 300 DPI PNG export.
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
              Print at home or local photo studio on matte vinyl sticker / glossy card.
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
