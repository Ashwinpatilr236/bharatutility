import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QrCode, Camera, Search, X, AlertCircle, ArrowRight, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parkSignalService } from '../../services/parkSignalService';
import jsQR from 'jsqr';

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isScanningRef = useRef(false);

  const stopCamera = useCallback(() => {
    isScanningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const handleDetectedToken = useCallback((rawResult: string) => {
    stopCamera();
    onClose();

    // Clean token from full URL or query params
    let cleanToken = rawResult.trim();
    if (cleanToken.includes('/parksignal/alert/')) {
      cleanToken = cleanToken.split('/parksignal/alert/')[1].split('?')[0];
    } else if (cleanToken.includes('scan=')) {
      cleanToken = cleanToken.split('scan=')[1].split('&')[0];
    } else if (cleanToken.includes('token=')) {
      cleanToken = cleanToken.split('token=')[1].split('&')[0];
    } else if (cleanToken.includes('/parksignal?')) {
      const match = cleanToken.match(/[\?\&](?:scan|token)=([a-zA-Z0-9_\-]+)/);
      if (match) cleanToken = match[1];
    }

    navigateToParkSignal('alert', cleanToken);
  }, [stopCamera, onClose, navigateToParkSignal]);

  const scanFrame = useCallback(() => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Lazy init hidden canvas
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDetectedToken(code.data);
          return;
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleDetectedToken]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Critical for iOS
        videoRef.current.setAttribute('webkit-playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        isScanningRef.current = true;
        animationFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera permission was denied or camera is in use by another app. You can upload a photo or type the code manually below.'
      );
      setCameraActive(false);
    }
  }, [stopCamera, scanFrame]);

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
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Handle Photo upload fallback (universal for any phone camera)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          handleDetectedToken(code.data);
        } else {
          setErrorMsg('No QR code could be detected in this image. Please ensure the QR sticker is clear, or enter the code manually.');
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
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

    const res = await parkSignalService.getPublicVehicle(token);
    setIsSearching(false);

    if (res && res.valid) {
      onClose();
      navigateToParkSignal('alert', token);
    } else {
      setErrorMsg(
        res?.message || 'Invalid QR token or vehicle not found. Please double-check the code on the sticker.'
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
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
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1.5 mx-4 mt-3 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-neutral-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Camera Scanner
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white dark:bg-neutral-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Manual Entry
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {activeTab === 'camera' ? (
            <div className="space-y-3">
              {/* Camera Preview */}
              <div className="relative aspect-square max-h-60 sm:max-h-64 rounded-2xl bg-black overflow-hidden flex items-center justify-center border-2 border-dashed border-cyan-500/40">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Reticle Overlay */}
                <div className="absolute inset-8 border-2 border-cyan-400/80 rounded-2xl pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                  <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-cyan-400/60 animate-pulse" />
                </div>

                {!cameraActive && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 space-y-2 bg-neutral-950/90 p-4 text-center">
                    <Camera className="w-8 h-8 animate-pulse text-cyan-400" />
                    <span className="text-xs font-semibold">Starting mobile camera...</span>
                  </div>
                )}

                {cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-300 space-y-2 bg-neutral-950/95 p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-rose-500 shrink-0" />
                    <span className="text-xs leading-relaxed">{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Upload Photo Alternative */}
              <div className="pt-1 flex flex-col gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-cyan-500/50 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-cyan-600" /> Upload QR Image / Take Photo
                </button>
                <p className="text-[11px] text-center text-neutral-400">
                  Point camera at the ParkSignal windshield sticker to scan automatically.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                  Enter QR Token or Scan Link:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8a9f4c2e or https://bharatutility.tech?scan=..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <span className="text-[10px] text-neutral-400 block">
                  You can type the 8-16 character code printed directly below the QR code sticker.
                </span>
              </div>

              <button
                type="submit"
                disabled={!manualCode.trim() || isSearching}
                className="w-full py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-600/20"
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Finding Vehicle...
                  </>
                ) : (
                  <>
                    <span>Open Alert Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
