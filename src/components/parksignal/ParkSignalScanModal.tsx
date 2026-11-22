import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, Search, X, AlertCircle, ArrowRight, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parkSignalService } from '../../services/parkSignalService';

interface ParkSignalScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParkSignalScanModal: React.FC<ParkSignalScanModalProps> = ({ isOpen, onClose }) => {
  const { navigateToParkSignal } = useApp();
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setErrorMsg(null);
      setManualCode('');
      return;
    }

    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        startScanningLoop();
      }
    } catch (err: any) {
      setCameraError('Camera access was denied or is not available. You can enter the QR code or plate manually below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setCameraActive(false);
  };

  const handleDetectedToken = (token: string) => {
    stopCamera();
    onClose();
    // Clean token
    let cleanToken = token.trim();
    if (cleanToken.includes('/parksignal/alert/')) {
      cleanToken = cleanToken.split('/parksignal/alert/')[1].split('?')[0];
    } else if (cleanToken.includes('scan=')) {
      cleanToken = cleanToken.split('scan=')[1].split('&')[0];
    } else if (cleanToken.includes('token=')) {
      cleanToken = cleanToken.split('token=')[1].split('&')[0];
    }
    navigateToParkSignal('alert', cleanToken);
  };

  const startScanningLoop = () => {
    // If native BarcodeDetector is supported
    if ('BarcodeDetector' in window) {
      const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      const checkFrame = async () => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0 && barcodes[0].rawValue) {
              handleDetectedToken(barcodes[0].rawValue);
              return;
            }
          } catch {}
        }
        animationFrameRef.current = requestAnimationFrame(checkFrame);
      };
      animationFrameRef.current = requestAnimationFrame(checkFrame);
    }
  };

  // Handle Photo upload fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if ('BarcodeDetector' in window) {
      try {
        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const img = await createImageBitmap(file);
        const barcodes = await barcodeDetector.detect(img);
        if (barcodes.length > 0 && barcodes[0].rawValue) {
          handleDetectedToken(barcodes[0].rawValue);
          return;
        } else {
          setErrorMsg('No QR code detected in the uploaded photo. Please try manual entry.');
        }
      } catch {
        setErrorMsg('Could not process photo. Please type the QR code or vehicle number.');
      }
    } else {
      setErrorMsg('Direct image barcode detection is not supported in this browser. Please type the code manually below.');
    }
  };

  // Manual code or plate submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);

    const input = manualCode.trim();

    // Check if input is a full URL or token
    let token = input;
    if (token.includes('/parksignal/alert/')) {
      token = token.split('/parksignal/alert/')[1].split('?')[0];
    } else if (token.includes('scan=')) {
      token = token.split('scan=')[1].split('&')[0];
    } else if (token.includes('token=')) {
      token = token.split('token=')[1].split('&')[0];
    }

    // Try checking vehicle with token
    const res = await parkSignalService.getPublicVehicle(token);
    setIsSearching(false);

    if (res && res.valid) {
      onClose();
      navigateToParkSignal('alert', token);
    } else {
      setErrorMsg('No active vehicle found with this QR code token. Please check and try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Scan Vehicle QR Sticker
              </h2>
              <span className="text-[11px] text-neutral-500 block">
                Contact driver without knowing their phone number
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1.5 m-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Manual Entry
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-5 space-y-4">
          {activeTab === 'camera' ? (
            <div className="space-y-3">
              {/* Camera Preview */}
              <div className="relative aspect-square max-h-64 rounded-2xl bg-black overflow-hidden flex items-center justify-center border-2 border-dashed border-indigo-400/50">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Reticle Overlay */}
                <div className="absolute inset-8 border-2 border-indigo-400 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
                </div>

                {!cameraActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 space-y-2 bg-neutral-950/80 p-4 text-center">
                    <Camera className="w-8 h-8 animate-pulse text-indigo-400" />
                    <span className="text-xs">Initializing camera...</span>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-300 space-y-2 bg-neutral-950/90 p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                    <span className="text-xs leading-relaxed">{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Upload photo alternative */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Upload Photo of Sticker
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setActiveTab('manual')}
                  className="text-neutral-500 hover:underline"
                >
                  Type code instead →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Enter QR Token or Link
                </label>
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. link_a1b2c3d4 or full sticker URL"
                  className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
                <span className="text-[10px] text-neutral-400">
                  Tip: Look at the small code printed at the bottom of the ParkSignal sticker.
                </span>
              </div>

              <button
                type="submit"
                disabled={!manualCode.trim() || isSearching}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Locating Vehicle...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" /> Open Vehicle Alert Page
                  </>
                )}
              </button>
            </form>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
