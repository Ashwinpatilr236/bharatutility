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
  // Default to Road Hazard Caution (matching user's preferred ProfileTap highway style)
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
  // GENERATE MASTER SVG (True High-End Commercial Retail Graphics)
  // ══════════════════════════════════════════════════════════════════
  const masterSvg = useMemo(() => {
    if (!qrDataUrl) return '';

    // ─────────────────────────────────────────────────────────────
    // FORMAT 1: ROAD HAZARD CAUTION TAPE (Exact ProfileTap Commercial Pass)
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

    <!-- ── LEFT SIDE: LARGE WHITE ROUNDED CONTAINER FOR QR CODE ── -->
    <g transform="translate(48, 62)">
      <rect x="0" y="0" width="456" height="636" rx="26" fill="#FFFFFF" stroke="#0B0F19" stroke-width="4.5" />
      
      <!-- Crisp QR Code (Centered with proper quiet zone) -->
      <image href="${qrDataUrl}" x="28" y="28" width="400" height="400" />
      
      <!-- Camera Scanner Pill Badge below QR -->
      <g transform="translate(24, 460)">
        <rect x="0" y="0" width="408" height="68" rx="18" fill="#0B0F19" />
        <text x="204" y="32" class="font-sans" font-size="16" font-weight="900" fill="#FFD000" text-anchor="middle" letter-spacing="0.5">📷 SCAN WITH ANY PHONE CAMERA</text>
        <text x="204" y="52" class="font-sans" font-size="12" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">NO APP • NO OTP • 100% PRIVATE</text>
      </g>
      
      <!-- Security / Website Link -->
      <text x="228" y="580" class="font-sans" font-size="13" font-weight="800" fill="#0B0F19" text-anchor="middle">🔒 PRIVACY-PROTECTED SMART QR PASS</text>
      <text x="228" y="602" class="font-sans" font-size="12" font-weight="700" fill="#64748B" text-anchor="middle">bharatutility.tech/parksignal</text>
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

      <!-- 5. Official ParkSignal Brand Logo & Attribution Lockup -->
      <g transform="translate(0, 470)">
        <!-- Official ParkSignal Logo Emblem -->
        <g transform="translate(0, 4)">
          <path d="M4 28 L12 14 L32 14 L40 28 Z" fill="none" stroke="#0B0F19" stroke-width="3.5" stroke-linejoin="round" />
          <circle cx="12" cy="33" r="4" fill="#0B0F19" />
          <circle cx="32" cy="33" r="4" fill="#0B0F19" />
          <path d="M10 9 A 18 18 0 0 1 34 9" fill="none" stroke="#0B0F19" stroke-width="3" stroke-linecap="round" />
          <path d="M4 4 A 24 24 0 0 1 40 4" fill="none" stroke="#0B0F19" stroke-width="3.5" stroke-linecap="round" />
        </g>
        <text x="56" y="24" class="font-sans" font-size="24" font-weight="900" fill="#0B0F19" letter-spacing="1">PARKSIGNAL</text>
        <text x="56" y="42" class="font-sans" font-size="12" font-weight="800" fill="#334155" letter-spacing="0.5">OFFICIAL FASTAG-SIZE SMART VEHICLE PASS</text>
        
        <!-- Right Attribution -->
        <text x="776" y="24" class="font-sans" font-size="14" font-weight="900" fill="#0B0F19" text-anchor="end">Powered by BharatUtility</text>
        <text x="776" y="42" class="font-sans" font-size="12" font-weight="700" fill="#475569" text-anchor="end">bharatutility.tech/parksignal</text>
      </g>
    </g>
  </g>

  <!-- Outer Card Stroke -->
  <rect x="2" y="2" width="1356" height="756" rx="32" fill="none" stroke="#0B0F19" stroke-width="5" />
</svg>`;
    }

    // ─────────────────────────────────────────────────────────────
    // FORMAT 2: EXECUTIVE TWO-TONE SPLIT (RepiQR Commercial Luxury Pass)
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
    <g transform="translate(52, 44)">
      <!-- Official ParkSignal Car & Radar Emblem -->
      <g transform="translate(0, 2)">
        <path d="M6 34 L14 18 L36 18 L44 34 Z" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" />
        <circle cx="14" cy="38" r="4" fill="#06B6D4" />
        <circle cx="36" cy="38" r="4" fill="#06B6D4" />
        <path d="M12 12 A 18 18 0 0 1 38 12" fill="none" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round" />
        <path d="M5 6 A 26 26 0 0 1 45 6" fill="none" stroke="#06B6D4" stroke-width="3" stroke-linecap="round" />
      </g>
      <text x="62" y="24" class="font-sans" font-size="28" font-weight="900" fill="#FFFFFF" letter-spacing="1">PARKSIGNAL</text>
      <text x="62" y="44" class="font-sans" font-size="13" font-weight="600" fill="#94A3B8">Smart vehicle safety, one scan away</text>
    </g>

    <!-- Hairline Separator -->
    <line x1="52" y1="112" x2="678" y2="112" stroke="#1E293B" stroke-width="1.5" />

    <!-- Big Headline -->
    <g transform="translate(52, 156)">
      <text x="0" y="0" class="font-sans" font-size="34" font-weight="900" fill="#FFFFFF">SCAN TO REACH</text>
      <text x="296" y="0" class="font-sans" font-size="34" font-weight="900" fill="${colors.accent}">THE OWNER</text>
      <text x="0" y="28" class="font-sans" font-size="15" font-weight="600" fill="#CBD5E1">Both numbers stay 100% private</text>
      
      <!-- Right Scanner Icon -->
      <g transform="translate(566, -26)" stroke="${colors.accent}" stroke-width="2.5" fill="none">
        <path d="M0 8 V0 H8 M32 0 H40 V8 M40 24 V32 H32 M8 32 H0 V24" />
        <circle cx="20" cy="16" r="3" fill="${colors.accent}" />
      </g>
    </g>

    <!-- Situation Badges Grid (5 badges matching Image 3) -->
    <!-- Row 1: 3 badges (Accident, Parking, Flat Tyre) -->
    <g transform="translate(52, 236)">
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
    <g transform="translate(52, 376)">
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

    <!-- ════════════════ RIGHT HALF: EMERGENCY CALLOUT & QR ════════════════ -->
    <!-- Top Black Pill: "Scan This QR In Case Of Emergency" -->
    <g transform="translate(776, 44)">
      <rect x="0" y="0" width="532" height="66" rx="18" fill="#0B0F19" />
      <text x="266" y="27" class="font-sans" font-size="14" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">Scan This QR</text>
      <text x="266" y="51" class="font-sans" font-size="20" font-weight="900" fill="${colors.accent}" text-anchor="middle" letter-spacing="0.5">In Case Of Emergency</text>
    </g>

    <!-- Large White Rounded Card with QR Code -->
    <g transform="translate(776, 128)">
      <rect x="0" y="0" width="532" height="476" rx="24" fill="#FFFFFF" stroke="#0B0F19" stroke-width="3.5" />
      <image href="${qrDataUrl}" x="86" y="22" width="360" height="360" />
      <text x="266" y="420" class="font-sans" font-size="14" font-weight="800" fill="#0B0F19" text-anchor="middle">🔒 100% PRIVATE • NO APP REQUIRED</text>
      <text x="266" y="444" class="font-sans" font-size="13" font-weight="600" fill="#64748B" text-anchor="middle">Scan with any smartphone camera</text>
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
    // FORMAT 3: SQUARE DECAL FORMAT (1080x1080 for Bike / Glass)
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

    <!-- Large White QR Card -->
    <g transform="translate(48, 184)">
      <rect x="0" y="0" width="984" height="630" rx="28" fill="#FFFFFF" stroke="#0B0F19" stroke-width="4.5" />
      <image href="${qrDataUrl}" x="242" y="32" width="500" height="500" />
      <text x="492" y="570" class="font-sans" font-size="20" font-weight="900" fill="#0B0F19" text-anchor="middle">📷 SCAN WITH ANY PHONE CAMERA</text>
      <text x="492" y="602" class="font-sans" font-size="15" font-weight="700" fill="#64748B" text-anchor="middle">No App Download • No Login • 100% Free &amp; Private</text>
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
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <ParkSignalLogo variant="emblem" height={36} />
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
        <div className="px-4 py-3 bg-neutral-950/95 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/80">
          <div className="relative w-full max-w-3xl flex items-center justify-center">
            {showCutBorder && (
              <div className="absolute -inset-2.5 border-2 border-dashed border-neutral-500/50 rounded-[36px] pointer-events-none flex items-start justify-center pt-0.5">
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

          <div className="mt-4 text-xs text-neutral-400 text-center flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>100% Authentic Commercial Grade:</strong> Vector-sharp graphics with official ParkSignal Logo, 7 situation icons, and HSRP number plate. Zero blur, ready for print!
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
