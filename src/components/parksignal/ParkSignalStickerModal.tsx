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
  SplitSquareVertical,
  FileCode2
} from 'lucide-react';
import { ParkSignalVehicle } from '../../types';
import { PARKSIGNAL_FULL_LOGO_B64, PARKSIGNAL_EMBLEM_B64 } from './parkSignalLogoBase64';

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
  const [selectedLayout, setSelectedLayout] = useState<StickerLayout>('hazard');
  const [selectedTheme, setSelectedTheme] = useState<StickerTheme>('safety_yellow');
  const [showCutBorder, setShowCutBorder] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const publicUrl = `https://bharatutility.tech/parksignal/alert/${vehicle.qr_token || 'demo'}`;

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
          twoToneRight: '#FF5722',
          accent: '#FF5722',
        };
      case 'clean_white':
        return {
          bg: '#FFFFFF',
          text: '#0B0F19',
          hazardStripe: '#CBD5E1',
          twoToneRight: '#FFFFFF',
          accent: '#0B0F19',
        };
      case 'carbon_dark':
        return {
          bg: '#0F172A',
          text: '#FFFFFF',
          hazardStripe: '#0284C7',
          twoToneRight: '#0F172A',
          accent: '#38BDF8',
        };
      case 'safety_yellow':
      default:
        return {
          bg: '#FFD000',
          text: '#0B0F19',
          hazardStripe: '#FFD000',
          twoToneRight: '#FFD000',
          accent: '#FFD000',
        };
    }
  }, [selectedTheme]);

  // ══════════════════════════════════════════════════════════════════
  // GENERATE MASTER SVG (Featuring Official Artwork WITH the QR Code)
  // ══════════════════════════════════════════════════════════════════
  const masterSvg = useMemo(() => {
    if (!qrDataUrl) return '';

    // Vector Brand Logo Generator (100% Crisp Vector, High-Contrast at Any DPI)
    const getVectorLogoSvg = (x: number, y: number, scale = 1, isDarkBackground = false) => {
      const parkColor = isDarkBackground ? '#FFFFFF' : '#0B0F19';
      const subColor = isDarkBackground ? '#94A3B8' : '#64748B';
      return `
        <g transform="translate(${x}, ${y}) scale(${scale})">
          <!-- Vector Car Silhouette & Radar Waves -->
          <g transform="translate(0, 0)">
            <path d="M 14 10 A 21 21 0 0 1 41 10" stroke="#00E5FF" stroke-width="2.5" stroke-linecap="round" fill="none" />
            <path d="M 18 15 A 15 15 0 0 1 37 15" stroke="#00E5FF" stroke-width="2.5" stroke-linecap="round" fill="none" />
            <path d="M 22 19 A 9 9 0 0 1 33 19" stroke="#00E5FF" stroke-width="2" stroke-linecap="round" fill="none" />
            <rect x="2" y="20" width="8" height="8" rx="1" fill="none" stroke="#0284C7" stroke-width="1.8" />
            <rect x="4" y="22" width="4" height="4" rx="0.5" fill="#00E5FF" />
            <rect x="12" y="20" width="3" height="3" rx="0.5" fill="#06B6D4" />
            <rect x="2" y="30" width="3" height="3" rx="0.5" fill="#0284C7" />
            <rect x="7" y="30" width="2.5" height="2.5" rx="0.5" fill="#38BDF8" />
            <path d="M 12 30 L 18 30 C 20 25 25 23 28 23 C 33 23 37 26 41 30 L 54 33 C 59 34 63 37 64 41 L 51 41 M 40 41 L 23 41 M 12 41 L 8 41 C 6 41 4 39 4 37 L 4 35" stroke="#0284C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <path d="M 20 30 L 27 25 C 33 25 40 28 47 32 L 63 37" stroke="#00E5FF" stroke-width="1.8" stroke-linecap="round" fill="none" />
            <path d="M 22 21 Q 28 19 34 21 L 34 27 Q 34 33 28 36 Q 22 33 22 27 Z" fill="#0B132B" stroke="#00E5FF" stroke-width="1.8" />
            <path d="M 26 27 L 28 29 L 32 24" stroke="#00E5FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
            <circle cx="17.5" cy="41" r="5" fill="#0B132B" stroke="#0284C7" stroke-width="2" />
            <circle cx="17.5" cy="41" r="2" fill="#00E5FF" />
            <circle cx="45.5" cy="41" r="5" fill="#0B132B" stroke="#0284C7" stroke-width="2" />
            <circle cx="45.5" cy="41" r="2" fill="#00E5FF" />
          </g>
          <!-- Bold Brand Typography (High Contrast) -->
          <text x="76" y="30" class="font-sans" font-size="28" font-weight="900" fill="${parkColor}" letter-spacing="-0.5">PARK<tspan fill="#00B4D8">SIGNAL</tspan></text>
          <text x="78" y="44" class="font-sans" font-size="9" font-weight="800" fill="${subColor}" letter-spacing="1.5">BY BHARATUTILITY • SMART PASS</text>
        </g>
      `;
    };

    // ─────────────────────────────────────────────────────────────
    // FORMAT 1: ROAD HAZARD CAUTION TAPE (Official Logo + QR Code)
    // ─────────────────────────────────────────────────────────────
    if (selectedLayout === 'hazard') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1360" height="760" viewBox="0 0 1360 760" style="background:#FFFFFF;">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <clipPath id="hazard-clip">
      <rect x="0" y="0" width="1360" height="760" rx="32" ry="32" />
    </clipPath>
    <!-- Seamless 45-degree repeating caution stripe pattern -->
    <pattern id="hazardStripe" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="25" height="50" fill="#0B0F19" />
      <rect x="25" width="25" height="50" fill="${colors.hazardStripe}" />
    </pattern>
  </defs>

  <!-- Base Card -->
  <g clip-path="url(#hazard-clip)">
    <!-- Vibrant Solid Safety Background -->
    <rect x="0" y="0" width="1360" height="760" fill="${colors.bg}" />

    <!-- Full-Bleed Top Hazard Caution Tape -->
    <rect x="0" y="0" width="1360" height="44" fill="url(#hazardStripe)" />
    <!-- Full-Bleed Bottom Hazard Caution Tape -->
    <rect x="0" y="716" width="1360" height="44" fill="url(#hazardStripe)" />

    <!-- ── LEFT SIDE: WHITE CARD FEATURING OFFICIAL LOGO + QR CODE ── -->
    <g transform="translate(48, 62)">
      <rect x="0" y="0" width="456" height="636" rx="26" fill="#FFFFFF" stroke="#0B0F19" stroke-width="4.5" />
      
      <!-- 1. VECTOR BRAND LOGO EMBEDDED WITH QR (Crisp Vector Graphic) -->
      ${getVectorLogoSvg(44, 28, 1.35, false)}

      <!-- Thin subtle separator -->
      <line x1="36" y1="126" x2="420" y2="126" stroke="#E2E8F0" stroke-width="1.5" />

      <!-- 2. Crisp QR Code -->
      <image href="${qrDataUrl}" x="68" y="142" width="320" height="320" />
      
      <!-- 3. Camera Scanner Pill Badge below QR -->
      <g transform="translate(24, 482)">
        <rect x="0" y="0" width="408" height="66" rx="16" fill="#0B0F19" />
        <text x="204" y="30" class="font-sans" font-size="15" font-weight="900" fill="#FFD000" text-anchor="middle" letter-spacing="0.5">📷 SCAN WITH ANY PHONE CAMERA</text>
        <text x="204" y="50" class="font-sans" font-size="11" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">NO APP • NO OTP • 100% PRIVATE</text>
      </g>
      
      <!-- 4. Security / Website Link -->
      <text x="228" y="582" class="font-sans" font-size="12" font-weight="800" fill="#0B0F19" text-anchor="middle">🔒 PRIVACY-FIRST SMART VEHICLE PROTECTION</text>
      <text x="228" y="602" class="font-sans" font-size="11" font-weight="700" fill="#64748B" text-anchor="middle">bharatutility.tech/parksignal</text>
    </g>

    <!-- ── RIGHT SIDE: PROFILETAP COMMERCIAL SAFETY LAYOUT ── -->
    <g transform="translate(536, 62)">
      <!-- 1. Commercial Safety Headline -->
      <text x="0" y="40" class="font-sans" font-size="34" font-weight="700" fill="#0B0F19">Scan the QR to contact the</text>
      <text x="0" y="86" class="font-sans" font-size="42" font-weight="900" fill="#0B0F19">vehicle owner in case of emergency</text>

      <!-- 2. Row of 7 Standalone Commercial Situation Icons -->
      <g transform="translate(0, 134)">
        <!-- Icon 1: ACCIDENT (Phone Receiver) -->
        <g transform="translate(42, 0)">
          <path d="M-10 14 C-10 24 0 34 10 34 L14 30 C15 29 15 27 14 26 L8 21 C7 20 5 20 4 21 L2 23 C-2 20 -5 17 -8 13 L-6 11 C-5 10 -5 8 -6 7 L-11 1 C-12 0 -14 0 -15 1 L-18 4 C-20 6 -20 7 -19 9" fill="#0B0F19" />
          <text x="0" y="58" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">ACCIDENT</text>
        </g>

        <!-- Icon 2: POLICE (Authority Badge Shield) -->
        <g transform="translate(158, 0)">
          <path d="M-14 4 L0 -4 L14 4 V16 C14 26 0 34 0 34 C0 34 -14 26 -14 16 Z" fill="none" stroke="#0B0F19" stroke-width="3.5" />
          <circle cx="0" cy="14" r="4.5" fill="#0B0F19" />
          <text x="0" y="58" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">POLICE</text>
        </g>

        <!-- Icon 3: BREAKDOWN (Crossed Tools) -->
        <g transform="translate(274, 0)">
          <path d="M-14 2 L14 30 M14 2 L-14 30" stroke="#0B0F19" stroke-width="4.5" stroke-linecap="round" />
          <circle cx="0" cy="16" r="5" fill="#0B0F19" />
          <text x="0" y="58" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">BREAKDOWN</text>
        </g>

        <!-- Icon 4: TOWING (Traffic Safety Cone) -->
        <g transform="translate(390, 0)">
          <path d="M-16 32 L16 32 M-12 30 L-3 2 L3 2 L12 30 Z" fill="none" stroke="#0B0F19" stroke-width="3.5" stroke-linejoin="round" />
          <line x1="-7" y1="18" x2="7" y2="18" stroke="#0B0F19" stroke-width="3" />
          <text x="0" y="58" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">TOWING</text>
        </g>

        <!-- Icon 5: SAFETY (Vehicle with Hazard Exclamation) -->
        <g transform="translate(506, 0)">
          <circle cx="0" cy="16" r="16" fill="none" stroke="#0B0F19" stroke-width="3.5" />
          <path d="M0 6 V16 M0 22 H0.1" stroke="#0B0F19" stroke-width="4" stroke-linecap="round" />
          <text x="0" y="58" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">SAFETY</text>
        </g>

        <!-- Icon 6: THEFT (Padlock / Security) -->
        <g transform="translate(622, 0)">
          <rect x="-12" y="10" width="24" height="20" rx="4" fill="#0B0F19" />
          <path d="M-8 10 V4 C-8 -2 8 -2 8 4 V10" fill="none" stroke="#0B0F19" stroke-width="3.5" />
          <circle cx="0" cy="20" r="2.5" fill="#FFD000" />
          <text x="0" y="58" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">THEFT</text>
        </g>

        <!-- Icon 7: PARKING (Universal Traffic Sign) -->
        <g transform="translate(738, 0)">
          <circle cx="0" cy="16" r="18" fill="#DC2626" />
          <text x="0" y="27" class="font-sans" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle">P</text>
          <text x="0" y="58" class="font-sans" font-size="11" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.5">PARKING</text>
        </g>
      </g>

      <!-- 3. Explanatory Commercial Paragraph (Exact ProfileTap Copy) -->
      <g transform="translate(0, 244)">
        <text x="0" y="24" class="font-sans" font-size="18" font-weight="700" fill="#0B0F19">Facing a parking issue or emergency? Notice something wrong with the vehicle?</text>
        <text x="0" y="50" class="font-sans" font-size="18" font-weight="700" fill="#0B0F19">Please scan the QR tag to contact the owner privately in seconds.</text>
      </g>

      <!-- 4. Authentic Indian HSRP License Plate Strip -->
      <g transform="translate(0, 336)">
        <rect x="0" y="0" width="776" height="84" rx="16" fill="#FFFFFF" stroke="#0B0F19" stroke-width="3.5" />
        <!-- Blue IND Band -->
        <rect x="0" y="0" width="88" height="84" rx="14" fill="#003399" />
        <circle cx="44" cy="30" r="10" fill="none" stroke="#FFFFFF" stroke-width="2" />
        <text x="44" y="64" class="font-sans" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle">IND</text>
        <!-- Vehicle Plate Text -->
        <text x="432" y="55" class="font-mono" font-size="38" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="2">${plateFormatted}</text>
      </g>

      <!-- 5. Official ParkSignal Brand Logo Lockup & Attribution -->
      <g transform="translate(0, 466)">
        ${getVectorLogoSvg(0, 0, 1.15, false)}
        
        <text x="776" y="26" class="font-sans" font-size="14" font-weight="900" fill="#0B0F19" text-anchor="end">Official Fastag-Size Smart Vehicle Pass</text>
        <text x="776" y="46" class="font-sans" font-size="12" font-weight="700" fill="#334155" text-anchor="end">Powered by BharatUtility • bharatutility.tech/parksignal</text>
      </g>
    </g>
  </g>

  <!-- Outer Card Stroke -->
  <rect x="2" y="2" width="1356" height="756" rx="32" fill="none" stroke="#0B0F19" stroke-width="5" />
</svg>`;
    }

    // ─────────────────────────────────────────────────────────────
    // FORMAT 2: EXECUTIVE TWO-TONE SPLIT (Logo + QR Code)
    // ─────────────────────────────────────────────────────────────
    else if (selectedLayout === 'twotone') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1360" height="760" viewBox="0 0 1360 760" style="background:#FFFFFF;">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <clipPath id="twotone-clip">
      <rect x="0" y="0" width="1360" height="760" rx="32" ry="32" />
    </clipPath>
  </defs>

  <g clip-path="url(#twotone-clip)">
    <!-- Left Half: Obsidian Black (53%) -->
    <rect x="0" y="0" width="730" height="760" fill="#0B0F19" />
    <!-- Right Half: Vibrant Safety Yellow (47%) -->
    <rect x="730" y="0" width="630" height="760" fill="${colors.twoToneRight}" />

    <!-- ════════════════ LEFT HALF: BRAND & SITUATIONS ════════════════ -->
    <!-- Brand Logo Row -->
    <g transform="translate(52, 36)">
      ${getVectorLogoSvg(0, 0, 1.25, true)}
    </g>

    <!-- Hairline Separator -->
    <line x1="52" y1="120" x2="678" y2="120" stroke="#1E293B" stroke-width="1.5" />

    <!-- Big Headline -->
    <g transform="translate(52, 164)">
      <text x="0" y="0" class="font-sans" font-size="34" font-weight="900" fill="#FFFFFF">SCAN TO REACH</text>
      <text x="296" y="0" class="font-sans" font-size="34" font-weight="900" fill="${colors.accent}">THE OWNER</text>
      <text x="0" y="28" class="font-sans" font-size="15" font-weight="600" fill="#CBD5E1">Both numbers stay 100% private</text>
      
      <!-- Right Scanner Icon -->
      <g transform="translate(566, -26)" stroke="${colors.accent}" stroke-width="2.5" fill="none">
        <path d="M0 8 V0 H8 M32 0 H40 V8 M40 24 V32 H32 M8 32 H0 V24" />
        <circle cx="20" cy="16" r="3" fill="${colors.accent}" />
      </g>
    </g>

    <!-- Situation Badges Grid (5 badges) -->
    <!-- Row 1: 3 badges (Accident, Parking, Flat Tyre) -->
    <g transform="translate(52, 244)">
      <!-- Badge 1: Accident -->
      <g transform="translate(36, 0)">
        <circle cx="40" cy="40" r="36" fill="#181F2E" stroke="#334155" stroke-width="2" />
        <path d="M22 46 L28 34 L38 34 L42 46 Z" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
        <path d="M58 46 L52 34 L44 34" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
        <path d="M40 24 L42 30 L48 28 L44 34 L48 38 L42 36 L40 42 L38 36 L32 38 L36 34 L32 28 L38 30 Z" fill="${colors.accent}" />
        <text x="40" y="102" class="font-sans" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Accident</text>
      </g>

      <!-- Badge 2: Parking (Universal Red Circle with White P) -->
      <g transform="translate(268, 0)">
        <circle cx="40" cy="40" r="36" fill="#DC2626" />
        <text x="40" y="52" class="font-sans" font-size="38" font-weight="900" fill="#FFFFFF" text-anchor="middle">P</text>
        <text x="40" y="102" class="font-sans" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Parking</text>
      </g>

      <!-- Badge 3: Flat Tyre -->
      <g transform="translate(500, 0)">
        <circle cx="40" cy="40" r="36" fill="#181F2E" stroke="#334155" stroke-width="2" />
        <circle cx="40" cy="38" r="22" fill="none" stroke="#FFFFFF" stroke-width="5" />
        <circle cx="40" cy="38" r="10" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
        <line x1="56" y1="54" x2="42" y2="40" stroke="#EF4444" stroke-width="4.5" stroke-linecap="round" />
        <text x="40" y="102" class="font-sans" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Flat Tyre</text>
      </g>
    </g>

    <!-- Row 2: 2 badges (Notice suspicious, Forgot something) -->
    <g transform="translate(52, 384)">
      <!-- Badge 4: Notice something suspicious -->
      <g transform="translate(144, 0)">
        <circle cx="40" cy="40" r="36" fill="#181F2E" stroke="#334155" stroke-width="2" />
        <path d="M18 48 L25 36 L44 36 L50 48 Z" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linejoin="round" />
        <circle cx="56" cy="30" r="7" fill="${colors.accent}" />
        <path d="M48 48 C48 42 52 39 56 39 C60 39 64 42 64 48" fill="none" stroke="${colors.accent}" stroke-width="2.5" />
        <text x="40" y="102" class="font-sans" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Notice suspicious</text>
      </g>

      <!-- Badge 5: Owner forgot something -->
      <g transform="translate(390, 0)">
        <circle cx="40" cy="40" r="36" fill="#181F2E" stroke="#334155" stroke-width="2" />
        <circle cx="34" cy="28" r="6" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
        <path d="M26 48 C26 40 42 40 42 48" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
        <path d="M48 26 C48 20 56 20 56 25 C56 29 52 30 52 34 M52 39 H52.1" fill="none" stroke="${colors.accent}" stroke-width="3" stroke-linecap="round" />
        <text x="40" y="102" class="font-sans" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle">Forgot something</text>
      </g>
    </g>

    <!-- HSRP License Plate Strip at Bottom-Left -->
    <g transform="translate(52, 638)">
      <rect x="0" y="0" width="626" height="74" rx="14" fill="#FFFFFF" stroke="#000000" stroke-width="2.5" />
      <rect x="0" y="0" width="76" height="74" rx="12" fill="#003399" />
      <circle cx="38" cy="24" r="8" fill="none" stroke="#FFFFFF" stroke-width="1.8" />
      <text x="38" y="54" class="font-sans" font-size="17" font-weight="900" fill="#FFFFFF" text-anchor="middle">IND</text>
      <text x="351" y="48" class="font-mono" font-size="34" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="2">${plateFormatted}</text>
    </g>

    <!-- ════════════════ RIGHT HALF: EMERGENCY CALLOUT & QR WITH LOGO ════════════════ -->
    <!-- Top Black Pill: "Scan This QR In Case Of Emergency" -->
    <g transform="translate(776, 44)">
      <rect x="0" y="0" width="532" height="66" rx="18" fill="#0B0F19" />
      <text x="266" y="27" class="font-sans" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">Scan This QR</text>
      <text x="266" y="51" class="font-sans" font-size="20" font-weight="900" fill="${colors.accent}" text-anchor="middle" letter-spacing="0.5">In Case Of Emergency</text>
    </g>

    <!-- Large White Rounded Card with QR Code AND Official Logo -->
    <g transform="translate(776, 126)">
      <rect x="0" y="0" width="532" height="480" rx="24" fill="#FFFFFF" stroke="#0B0F19" stroke-width="3.5" />
      
      <!-- Vector Brand Logo placed directly on the QR card -->
      ${getVectorLogoSvg(100, 14, 1.25, false)}
      
      <!-- QR Image Centered -->
      <image href="${qrDataUrl}" x="106" y="90" width="320" height="320" />
      
      <text x="266" y="434" class="font-sans" font-size="14" font-weight="800" fill="#0B0F19" text-anchor="middle">🔒 100% PRIVATE • NO APP REQUIRED</text>
      <text x="266" y="456" class="font-sans" font-size="12" font-weight="600" fill="#64748B" text-anchor="middle">Scan with any smartphone camera</text>
    </g>

    <!-- Bottom White Action Pill Button -->
    <g transform="translate(776, 634)">
      <rect x="0" y="0" width="532" height="78" rx="20" fill="#FFFFFF" stroke="#0B0F19" stroke-width="3.5" />
      <text x="266" y="38" class="font-sans" font-size="18" font-weight="900" fill="#0B0F19" text-anchor="middle" letter-spacing="0.8">CONTACT VEHICLE OWNER / DRIVER</text>
      <text x="266" y="60" class="font-sans" font-size="12" font-weight="700" fill="#0284C7" text-anchor="middle">⚡ Powered by ParkSignal • bharatutility.tech/parksignal</text>
    </g>
  </g>

  <!-- Outer Card Stroke -->
  <rect x="2" y="2" width="1356" height="756" rx="32" fill="none" stroke="#0B0F19" stroke-width="5" />
</svg>`;
    }

    // ─────────────────────────────────────────────────────────────
    // FORMAT 3: SQUARE DECAL FORMAT (Logo + QR Code for Bike / Glass)
    // ─────────────────────────────────────────────────────────────
    else {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080" style="background:#FFFFFF;">
  <defs>
    <style>
      .font-sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; }
    </style>
    <clipPath id="square-clip">
      <rect x="0" y="0" width="1080" height="1080" rx="36" ry="36" />
    </clipPath>
    <pattern id="hazardStripeSq" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="25" height="50" fill="#0B0F19" />
      <rect x="25" width="25" height="50" fill="${colors.hazardStripe}" />
    </pattern>
  </defs>

  <g clip-path="url(#square-clip)">
    <rect x="0" y="0" width="1080" height="1080" fill="${colors.hazardStripe}" />

    <!-- Top & Bottom Hazard Tape -->
    <rect x="0" y="0" width="1080" height="42" fill="url(#hazardStripeSq)" />
    <rect x="0" y="1038" width="1080" height="42" fill="url(#hazardStripeSq)" />

    <!-- Top Callout Banner -->
    <g transform="translate(48, 64)">
      <rect x="0" y="0" width="984" height="96" rx="20" fill="#0B0F19" />
      <text x="492" y="42" class="font-sans" font-size="28" font-weight="900" fill="#FFD000" text-anchor="middle">🚨 WRONG PARKING? NEED THIS VEHICLE MOVED?</text>
      <text x="492" y="74" class="font-sans" font-size="17" font-weight="700" fill="#FFFFFF" text-anchor="middle">Scan QR with phone camera to send an instant private alert</text>
    </g>

    <!-- Large White QR Card with Official Logo -->
    <g transform="translate(48, 184)">
      <rect x="0" y="0" width="984" height="630" rx="28" fill="#FFFFFF" stroke="#0B0F19" stroke-width="4.5" />
      
      <!-- Vector Brand Logo above the QR code -->
      ${getVectorLogoSvg(280, 20, 1.5, false)}
      
      <!-- QR Image Centered -->
      <image href="${qrDataUrl}" x="272" y="112" width="440" height="440" />
      
      <text x="492" y="582" class="font-sans" font-size="20" font-weight="900" fill="#0B0F19" text-anchor="middle">📷 SCAN WITH ANY PHONE CAMERA</text>
      <text x="492" y="608" class="font-sans" font-size="14" font-weight="700" fill="#64748B" text-anchor="middle">No App Download • No Login • 100% Free &amp; Private</text>
    </g>

    <!-- HSRP License Plate -->
    <g transform="translate(48, 840)">
      <rect x="0" y="0" width="984" height="96" rx="18" fill="#FFFFFF" stroke="#0B0F19" stroke-width="4" />
      <rect x="0" y="0" width="100" height="96" rx="16" fill="#003399" />
      <circle cx="50" cy="34" r="11" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
      <text x="50" y="74" class="font-sans" font-size="23" font-weight="900" fill="#FFFFFF" text-anchor="middle">IND</text>
      <text x="542" y="62" class="font-mono" font-size="44" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="3">${plateFormatted}</text>
    </g>

    <!-- Privacy Assurance Footer with Brand Logo -->
    <g transform="translate(48, 956)">
      <rect x="0" y="0" width="984" height="62" rx="14" fill="#0B0F19" />
      <text x="492" y="28" class="font-sans" font-size="15" font-weight="900" fill="#FFD000" text-anchor="middle">🔒 100% PRIVATE • OWNER PHONE NUMBER IS NEVER SHARED</text>
      <text x="492" y="48" class="font-sans" font-size="12" font-weight="700" fill="#94A3B8" text-anchor="middle">PARKSIGNAL by BharatUtility • Direct Telegram Alert • bharatutility.tech/parksignal</text>
    </g>
  </g>

  <rect x="2" y="2" width="1076" height="1076" rx="36" fill="none" stroke="#0B0F19" stroke-width="5" />
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
    const exportH = isSquare ? 2160 : 1520;

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
            <span className="font-bold text-neutral-400 text-[11px]">Design:</span>
            <button
              onClick={() => setSelectedLayout('hazard')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'hazard'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>🚧 Road Hazard Caution (ProfileTap Style)</span>
            </button>
            <button
              onClick={() => setSelectedLayout('twotone')}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedLayout === 'twotone'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>🌗 Executive Two-Tone (RepiQR Style)</span>
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
              <strong>100% Commercial Standard:</strong> Official ParkSignal logo with dissolving QR pixels embedded directly with the QR code. Ready for print!
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
