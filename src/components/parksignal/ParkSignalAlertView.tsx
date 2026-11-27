import React, { useState, useEffect, useRef } from 'react';
import { ParkSignalLogo } from './ParkSignalLogo';
import { useApp } from '../../context/AppContext';
import {
  ALERT_LANGUAGES,
  ALERT_TRANSLATIONS,
  AlertLanguage
} from './parkSignalAlertI18n';
import {
  Car,
  ShieldCheck,
  AlertTriangle,
  Send,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Lock,
  ArrowRight,
  Sparkles,
  QrCode,
  MapPin,
  Star,
  Navigation,
  Check,
  BellRing,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { parkSignalService } from '../../services/parkSignalService';
import { ParkSignalPublicVehicle } from '../../types';

interface ParkSignalAlertViewProps {
  token?: string;
}

export const ParkSignalAlertView: React.FC<ParkSignalAlertViewProps> = ({ token }) => {
  const { theme, setTheme } = useApp();
  const [lang, setLang] = useState<AlertLanguage>('en');
  const t = ALERT_TRANSLATIONS[lang];

  const isDarkActive =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState<ParkSignalPublicVehicle | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Alert Selection State
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultState, setResultState] = useState<{
    status: 'idle' | 'success' | 'failed';
    message?: string;
  }>({ status: 'idle' });

  // Voice Recording State
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Optional Location Sharing State
  const [locationText, setLocationText] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Customer Review & Rating State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!token) {
      setErrorMsg('No QR token provided in the URL.');
      setLoading(false);
      return;
    }

    parkSignalService.getPublicVehicle(token).then((res) => {
      setVehicle(res);
      setLoading(false);
    });
  }, [token]);

  // Cleanup audio URLs
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [audioUrl]);

  // Voice recording handlers
  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      const maxSec = vehicle?.settings?.maxVoiceDurationSeconds || 60;
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev + 1 >= maxSec) {
            stopRecording();
            return maxSec;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setMicError('Microphone access was denied or is not supported. You can still send a text alert below.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    if (isRecording) stopRecording();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setIsPlayingAudio(false);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // GPS Location Trigger
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('GPS is not supported by your mobile browser.');
      return;
    }
    setIsGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGettingLocation(false);
        const coords = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        setLocationCoords(coords);
      },
      (err) => {
        setIsGettingLocation(false);
        setLocationError('Unable to fetch GPS. You can type the parking spot or landmark manually.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    await parkSignalService.submitReview({
      rating: reviewRating,
      reviewerName: reviewerName.trim() || 'Bystander',
      reviewerRole: 'Bystander',
      comment: reviewComment.trim() || undefined,
      vehicleNumber: vehicle?.vehicleNumber || undefined,
    });
    setIsSubmittingReview(false);
    setReviewSubmitted(true);
  };

  // Submit Alert (Text or Voice)
  const handleSubmitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCategory) return;

    setIsSubmitting(true);
    setResultState({ status: 'idle' });

    if (isVoiceMode && audioBlob) {
      const res = await parkSignalService.sendVoiceAlert(
        token,
        selectedCategory,
        audioBlob,
        recordingSeconds,
        locationText.trim() || undefined,
        locationCoords || undefined
      );
      setIsSubmitting(false);
      if (res.success && res.delivered) {
        setResultState({
          status: 'success',
          message: t.successVoiceMsg
        });
      } else {
        setResultState({
          status: 'failed',
          message: res.error || 'Failed to deliver voice alert. Please try sending a quick text alert instead.'
        });
      }
    } else {
      const res = await parkSignalService.sendTextAlert(
        token,
        selectedCategory,
        customMessage.trim() || undefined,
        locationText.trim() || undefined,
        locationCoords || undefined
      );
      setIsSubmitting(false);
      if (res.success && res.delivered) {
        setResultState({
          status: 'success',
          message: t.successTextMsg
        });
      } else {
        setResultState({
          status: 'failed',
          message: res.error || 'Delivery failed. The owner might not be currently receiving notifications.'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
          {t.connectingTitle}
        </h2>
        <p className="text-xs text-neutral-500">{t.connectingSub}</p>
      </div>
    );
  }

  // Error / Inactive State
  if (errorMsg || !vehicle || !vehicle.valid) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg shadow-amber-500/10">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black font-display text-neutral-900 dark:text-white">
          {t.inactiveTitle}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {vehicle?.message || errorMsg || 'This vehicle QR code is either invalid, revoked, or temporarily disabled by the owner.'}
        </p>
        <div className="p-4 bg-neutral-100 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 text-xs text-neutral-500 text-left space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {t.privacyAssuranceTitle}
          </div>
          <p>{t.privacyAssuranceDesc}</p>
        </div>
      </div>
    );
  }

  // Define alert choices filtered by owner settings
  const s = vehicle.settings || {
    allowBlocking: true,
    allowMoveVehicle: true,
    allowEmergency: true,
    allowChildPersonInside: true,
    allowLightsOn: true,
    allowWindowDoorOpen: true,
    allowDamageAlert: true,
    allowCustomText: true,
    allowVoiceMessages: false,
    maxCustomTextLength: 200,
    maxVoiceDurationSeconds: 60
  };

  const alertOptions = [
    {
      key: 'blocking',
      title: t.options.blocking.title,
      sub: t.options.blocking.sub,
      icon: '🚗',
      fullText: 'Your vehicle is blocking my vehicle. Please move.',
      enabled: s.allowBlocking,
      isEmergency: false
    },
    {
      key: 'move',
      title: t.options.move.title,
      sub: t.options.move.sub,
      icon: '🅿️',
      fullText: 'Please move your vehicle slightly when convenient.',
      enabled: s.allowMoveVehicle,
      isEmergency: false
    },
    {
      key: 'lights',
      title: t.options.lights.title,
      sub: t.options.lights.sub,
      icon: '💡',
      fullText: 'Your vehicle lights are ON. Battery may drain.',
      enabled: s.allowLightsOn,
      isEmergency: false
    },
    {
      key: 'window',
      title: t.options.window.title,
      sub: t.options.window.sub,
      icon: '🪟',
      fullText: 'Your window or door appears to be open.',
      enabled: s.allowWindowDoorOpen,
      isEmergency: false
    },
    {
      key: 'damage',
      title: t.options.damage.title,
      sub: t.options.damage.sub,
      icon: '💥',
      fullText: 'Possible vehicle damage, flat tyre or dent noticed.',
      enabled: s.allowDamageAlert,
      isEmergency: false
    },
    {
      key: 'emergency',
      title: t.options.emergency.title,
      sub: t.options.emergency.sub,
      icon: '⚠️',
      fullText: 'Emergency – Please check your vehicle immediately.',
      enabled: s.allowEmergency,
      isEmergency: true
    },
    {
      key: 'child',
      title: t.options.child.title,
      sub: t.options.child.sub,
      icon: '🚨',
      fullText: 'A child or person may be inside your vehicle. Please check immediately.',
      enabled: s.allowChildPersonInside,
      isEmergency: true
    },
    {
      key: 'custom',
      title: t.options.custom.title,
      sub: t.options.custom.sub,
      icon: '📝',
      fullText: 'Other / Custom Message',
      enabled: s.allowCustomText,
      isEmergency: false
    }
  ].filter((opt) => opt.enabled);

  const isEmergencySelected =
    selectedCategory.includes('Emergency') || selectedCategory.includes('child or person');

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-7 space-y-5">
      {/* ── TOP UTILITY BAR: LANGUAGE SELECTION + DARK/LIGHT MODE ── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-neutral-900 px-3 py-2.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-neutral-500 dark:text-neutral-400 mr-1">
            <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          </span>
          {ALERT_LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                lang === l.id
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              {l.native}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setTheme(isDarkActive ? 'light' : 'dark')}
          className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
          title={isDarkActive ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkActive ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xs:inline">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* ── HEADER BRANDING ── */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <ParkSignalLogo variant="full" height={36} />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-[11px] font-bold border border-cyan-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.portalBadge}</span>
          <span className="text-neutral-400">•</span>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">{t.passBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
          {t.pageTitle}
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          {t.pageSubtitle}
        </p>
      </div>

      {/* ── 1. CAR DETAILS: EMBOSSED INDIAN HSRP NUMBER PLATE ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            {t.sec1Title}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
            <ShieldCheck className="w-3 h-3" />
            {t.verifiedPass}
          </span>
        </div>

        {/* Authentic Indian HSRP Number Plate Card (Adaptive Light & Dark Mode) */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700/80 shadow-lg p-4 sm:p-5 text-neutral-900 dark:text-white">
          {/* Subtle reflective top gloss */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 opacity-85" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* The HSRP Plate */}
            <div className="inline-flex items-stretch rounded-xl border-2 border-neutral-300 dark:border-neutral-800 shadow-sm overflow-hidden bg-white text-neutral-950 font-mono">
              {/* Blue IND Strip */}
              <div className="bg-[#002B7F] text-white px-2.5 py-2 flex flex-col items-center justify-center min-w-[36px] select-none border-r border-blue-900">
                {/* Ashoka Chakra vector representation */}
                <svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                  <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4L18.4 5.6" stroke="currentColor" strokeWidth="1" />
                </svg>
                <span className="text-[10px] font-black tracking-widest mt-0.5 leading-none">IND</span>
              </div>

              {/* Monospace Embossed Plate Number (Shows GJ06 •••• 88 when masked) */}
              <div className="px-4 py-2 flex items-center justify-center bg-gradient-to-b from-white to-neutral-100">
                <span className="text-xl sm:text-2xl font-black tracking-widest uppercase font-mono drop-shadow-xs text-neutral-950">
                  {vehicle.vehicleNumber || '••••••••'}
                </span>
              </div>
            </div>

            {/* Vehicle Metadata Badges */}
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-right">
              <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {vehicle.vehicleType || 'Vehicle'}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800/60 text-[10px] font-semibold text-cyan-700 dark:text-cyan-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                {t.verifiedPass}
              </span>
            </div>
          </div>

          {/* Privacy & Instant Delivery Banner */}
          <div className="mt-3.5 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              {t.anonymousNotice}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-neutral-400 dark:text-neutral-500">
              {t.avgDelivery}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. PARKING ALERT REASONS (TOUCH-OPTIMIZED 1-TAP CARDS) ── */}
      {resultState.status === 'success' ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800 text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-100">
              {t.successTitle}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium max-w-md mx-auto">
              {resultState.message}
            </p>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
            {t.successDesc}
          </p>

          {/* ── User Feedback & Rating Card ── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800 text-left space-y-3 shadow-xs">
            {reviewSubmitted ? (
              <div className="text-center py-3 space-y-1">
                <span className="text-2xl">🎉</span>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Thank you for your feedback!
                </p>
                <p className="text-[11px] text-neutral-500">
                  Your feedback helps BharatUtility improve vehicle parking across India.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Rate Your Experience (1-Tap):
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 dark:text-neutral-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Your Name / Landmark (Optional, e.g. Rahul / Gate 2)"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  maxLength={60}
                  className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <textarea
                  placeholder="How did ParkSignal work for you? Any suggestions?"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  maxLength={300}
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Feedback ⭐'}
                </button>
              </form>
            )}
          </div>

          <button
            onClick={() => {
              setResultState({ status: 'idle' });
              setSelectedCategory('');
              setCustomMessage('');
              setLocationText('');
              setLocationCoords(null);
              deleteRecording();
              setReviewSubmitted(false);
            }}
            className="px-6 py-2.5 rounded-xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-bold text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            {t.sendAnother}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitAlert} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] uppercase tracking-wider font-extrabold text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {t.sec2Title}
              </label>
              <span className="text-[10px] text-neutral-400">{t.oneTap}</span>
            </div>

            {/* Grid of Alert Reasons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {alertOptions.map((opt) => {
                const isSelected = selectedCategory === opt.fullText;
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => {
                      setSelectedCategory(opt.fullText);
                      setResultState({ status: 'idle' });
                    }}
                    className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer border flex items-start gap-3 relative ${
                      isSelected
                        ? opt.isEmergency
                          ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/50 shadow-md'
                          : 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/50 shadow-md'
                        : opt.isEmergency
                        ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/50 hover:border-rose-400'
                        : 'bg-white dark:bg-neutral-900 border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 shadow-2xs'
                    }`}
                  >
                    <span className="text-2xl shrink-0 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800">
                      {opt.icon}
                    </span>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white leading-tight">
                        {opt.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5">
                        {opt.sub}
                      </div>
                    </div>
                    {/* Radio Check Circle */}
                    <div className="absolute top-3.5 right-3.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? opt.isEmergency
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'bg-cyan-600 border-cyan-600 text-white'
                            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Voice Message Feature (If enabled by vehicle owner) */}
          {s.allowVoiceMessages && (
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    {t.voiceNoteTitle} (Max {s.maxVoiceDurationSeconds}s)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceMode(!isVoiceMode);
                    if (isVoiceMode) deleteRecording();
                  }}
                  className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                    isVoiceMode
                      ? 'bg-cyan-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  {isVoiceMode ? t.voiceActive : t.switchToVoice}
                </button>
              </div>

              {isVoiceMode && (
                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-3 border border-neutral-200/60 dark:border-neutral-700/60">
                  {micError && (
                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                      ⚠️ {micError}
                    </div>
                  )}

                  {!audioBlob ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-neutral-600 dark:text-neutral-300">
                        {isRecording ? (
                          <span className="flex items-center gap-2 text-rose-600 font-bold animate-pulse">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                            {t.recording} ({recordingSeconds}s / {s.maxVoiceDurationSeconds}s)
                          </span>
                        ) : (
                          t.tapToRecord
                        )}
                      </div>

                      {isRecording ? (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5" /> {t.stop}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 hover:bg-cyan-700 cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5" /> {t.startRecording}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t.audioReady} ({recordingSeconds}s)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={togglePlayback}
                            className="p-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 cursor-pointer"
                            title="Preview playback"
                          >
                            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={deleteRecording}
                            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-200 cursor-pointer"
                            title="Delete and re-record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Optional Short Custom Message (If enabled) */}
          {s.allowCustomText && (!isVoiceMode || !audioBlob) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                  {t.customNoteLabel}
                </label>
                <span className="text-[10px] text-neutral-400">
                  {customMessage.length}/{s.maxCustomTextLength}
                </span>
              </div>
              <textarea
                value={customMessage}
                maxLength={s.maxCustomTextLength}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={t.customNotePlaceholder}
                rows={2}
                className="w-full p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
              />
            </div>
          )}

          {/* Optional Location / Parking Spot Section */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {t.locationLabel}
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Navigation className="w-3 h-3" />
                {isGettingLocation ? t.fetchingGps : locationCoords ? t.gpsAttached : t.attachGps}
              </button>
            </div>

            <input
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder={t.locationPlaceholder}
              maxLength={150}
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none"
            />

            {locationCoords && (
              <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60">
                <span className="font-mono flex items-center gap-1">
                  📍 GPS: {locationCoords}
                </span>
                <button
                  type="button"
                  onClick={() => setLocationCoords(null)}
                  className="text-emerald-700 hover:text-rose-600 font-bold ml-2 cursor-pointer"
                >
                  {t.removeGps}
                </button>
              </div>
            )}

            {locationError && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                ⚠️ {locationError}
              </p>
            )}
          </div>

          {/* Failure Alert Notice */}
          {resultState.status === 'failed' && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{resultState.message}</span>
            </div>
          )}

          {/* Submit Alert Button */}
          <button
            type="submit"
            disabled={!selectedCategory || isSubmitting || (isVoiceMode && !audioBlob && isRecording)}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              !selectedCategory || isSubmitting
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : isEmergencySelected
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-lg shadow-rose-600/30'
                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t.sendingButton}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> {t.sendButton}
              </>
            )}
          </button>
        </form>
      )}

      {/* ── 3. EMERGENCY NUMBERS: DIRECT INDIAN HELPLINE DIRECTORY ── */}
      <div className="bg-rose-50/90 dark:bg-rose-950/30 rounded-3xl p-4 sm:p-5 border border-rose-200 dark:border-rose-900/50 space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <PhoneCall className="w-4 h-4 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <div className="font-black text-rose-900 dark:text-rose-100 text-sm flex items-center gap-2">
              <span>{t.sec3Title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase font-extrabold tracking-wider">
                {t.india24x7}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-800/80 dark:text-rose-300/80">
              {t.sec3Desc}
            </p>
          </div>
        </div>

        {/* Primary 112 National Banner */}
        <a
          href="tel:112"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 transition-all shadow-md group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-black">
              🚨
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-rose-100">
                {t.allInOne}
              </div>
              <div className="text-base font-black tracking-wide">
                {t.dial112}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-rose-600 font-extrabold text-xs group-hover:scale-105 transition-transform">
            <PhoneCall className="w-3.5 h-3.5" /> {t.tapToCall}
          </div>
        </a>

        {/* Quick Tap-to-Call Buttons for Specific Helplines */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <a
            href="tel:100"
            className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Police</span>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </div>
            <span className="text-sm font-black text-rose-700 dark:text-rose-400">100 Control</span>
          </a>

          <a
            href="tel:108"
            className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Ambulance</span>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </div>
            <span className="text-sm font-black text-rose-700 dark:text-rose-400">108 / 102</span>
          </a>

          <a
            href="tel:1033"
            className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Highway</span>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </div>
            <span className="text-sm font-black text-rose-700 dark:text-rose-400">1033 NHAI</span>
          </a>

          <a
            href="tel:101"
            className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Fire Rescue</span>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </div>
            <span className="text-sm font-black text-rose-700 dark:text-rose-400">101 Fire</span>
          </a>

          <a
            href="tel:1091"
            className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Women</span>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </div>
            <span className="text-sm font-black text-rose-700 dark:text-rose-400">1091 Safety</span>
          </a>

          <a
            href="tel:1098"
            className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Childline</span>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </div>
            <span className="text-sm font-black text-rose-700 dark:text-rose-400">1098 Child</span>
          </a>

          <a
            href="tel:1073"
            className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Traffic</span>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </div>
            <span className="text-sm font-black text-rose-700 dark:text-rose-400">1073 Traffic</span>
          </a>

          <a
            href="tel:1070"
            className="flex flex-col p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition-all shadow-2xs group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400">Disaster</span>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </div>
            <span className="text-sm font-black text-rose-700 dark:text-rose-400">1070 Relief</span>
          </a>
        </div>
      </div>

      {/* ── 4. BAKI SAB: PROMO VIRAL CARD FOR FREE VEHICLE QR STICKER ── */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 rounded-3xl p-5 sm:p-7 border border-cyan-500/30 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] uppercase font-black tracking-wider text-cyan-400">
              {t.promoBadge}
            </span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {t.freeForever}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-black font-display text-white">
            {t.promoTitle}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {t.promoDesc}
          </p>
        </div>

        {/* 3 Value Bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-200">{t.zeroSpam}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-200">{t.driverPrivacy}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-200">{t.printablePass}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <a
            href="/parksignal"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <span>{t.createFreeQr}</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </a>
        </div>
      </div>

      {/* Clean Footer Info */}
      <div className="text-center space-y-1.5 pt-2">
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          {t.footerPowered}
        </p>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
          {t.footerTagline}
        </p>
      </div>
    </div>
  );
};
