import React, { useState, useEffect, useRef } from 'react';
import { ParkSignalLogo } from './ParkSignalLogo';
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
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PhoneCall,
  Lock,
  ArrowRight,
  Sparkles,
  QrCode
} from 'lucide-react';
import { parkSignalService } from '../../services/parkSignalService';
import { ParkSignalPublicVehicle } from '../../types';

interface ParkSignalAlertViewProps {
  token?: string;
}

export const ParkSignalAlertView: React.FC<ParkSignalAlertViewProps> = ({ token }) => {
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

  // Submit Text Alert
  const handleSubmitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCategory) return;

    setIsSubmitting(true);
    setResultState({ status: 'idle' });

    if (isVoiceMode && audioBlob) {
      const res = await parkSignalService.sendVoiceAlert(token, selectedCategory, audioBlob, recordingSeconds);
      setIsSubmitting(false);
      if (res.success && res.delivered) {
        setResultState({
          status: 'success',
          message: 'Voice alert delivered directly to the vehicle owner!'
        });
      } else {
        setResultState({
          status: 'failed',
          message: res.error || 'Failed to deliver voice alert. Please try sending a quick text alert instead.'
        });
      }
    } else {
      const res = await parkSignalService.sendTextAlert(token, selectedCategory, customMessage);
      setIsSubmitting(false);
      if (res.success && res.delivered) {
        setResultState({
          status: 'success',
          message: 'Parking alert delivered to the vehicle owner instantly!'
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
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
          Connecting to ParkSignal...
        </h2>
        <p className="text-xs text-neutral-500">Checking vehicle status securely</p>
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
          Vehicle Alert Inactive
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {vehicle?.message || errorMsg || 'This vehicle QR code is either invalid, revoked, or temporarily disabled by the owner.'}
        </p>
        <div className="p-4 bg-neutral-100 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/60 dark:border-neutral-700/60 text-xs text-neutral-500 text-left space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-neutral-700 dark:text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ParkSignal Privacy & Security Assurance
          </div>
          <p>
            No vehicle owner contact information is disclosed through inactive or active QR codes.
          </p>
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
    { key: 'blocking', text: 'Your vehicle is blocking my vehicle.', icon: '🚗', enabled: s.allowBlocking },
    { key: 'move', text: 'Please move your vehicle.', icon: '🅿️', enabled: s.allowMoveVehicle },
    { key: 'emergency', text: 'Emergency – Please check your vehicle immediately.', icon: '⚠️', isEmergency: true, enabled: s.allowEmergency },
    { key: 'child', text: 'A child or person may be inside your vehicle. Please check immediately.', icon: '👶', isEmergency: true, enabled: s.allowChildPersonInside },
    { key: 'lights', text: 'Your vehicle lights are ON.', icon: '💡', enabled: s.allowLightsOn },
    { key: 'window', text: 'Your window or door appears to be open.', icon: '🪟', enabled: s.allowWindowDoorOpen },
    { key: 'damage', text: 'Possible vehicle damage noticed.', icon: '💥', enabled: s.allowDamageAlert },
    { key: 'custom', text: 'Other / Custom Message', icon: '📝', enabled: s.allowCustomText }
  ].filter((opt) => opt.enabled);

  const isEmergencySelected =
    selectedCategory.includes('Emergency') || selectedCategory.includes('child or person');

  return (
    <div className="max-w-lg mx-auto px-4 py-6 sm:py-10 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-1">
          <ParkSignalLogo variant="full" height={40} className="hover:opacity-95 transition-opacity" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secure Vehicle Alert Portal
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
          Contact Vehicle Owner
        </h1>
        <p className="text-xs text-neutral-500">
          No app download or login required • Instant private notification
        </p>
      </div>

      {/* Vehicle Info & Privacy Pledge Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                {vehicle.vehicleType}
              </span>
              <span className="text-base font-extrabold font-mono text-neutral-900 dark:text-white">
                {vehicle.isPlateMasked ? '•••••••• (Private Plate)' : vehicle.vehicleNumber}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Owner Protected
          </span>
        </div>

        {/* Reassurance Banner */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3 rounded-2xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2 border border-emerald-200/60 dark:border-emerald-900/40">
          <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>100% Private & Anonymous:</strong> Your mobile number and identity are NEVER collected or shared. The vehicle owner receives your polite alert instantly on their private phone.
          </span>
        </div>
      </div>

      {/* Emergency Advisory & Indian Helpline Directory */}
      <div className="bg-rose-50/90 dark:bg-rose-950/40 p-4 sm:p-5 rounded-3xl border border-rose-200 dark:border-rose-900/60 space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <PhoneCall className="w-4 h-4 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="font-black text-rose-800 dark:text-rose-200 text-sm flex items-center gap-2">
              <span>Emergency Advisory (Dial 112)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase font-extrabold tracking-wider">
                India 24x7
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-rose-900/80 dark:text-rose-300/80">
              ParkSignal is designed for polite parking notifications (blocking cars, open windows, lights left on). In life-threatening emergencies, severe accidents, or medical crises, always call national emergency helplines directly.
            </p>
          </div>
        </div>

        {/* Quick Tap-to-Call Buttons for All Indian Emergency Services */}
        <div className="space-y-1.5 pt-1 border-t border-rose-200/60 dark:border-rose-900/40">
          <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700 dark:text-rose-300 block">
            Direct Emergency Dials (Tap to Call):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href="tel:112"
              className="flex items-center justify-between p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-rose-100 font-medium leading-none">All-in-One</span>
                <span className="text-xs font-black">112 National</span>
              </div>
              <PhoneCall className="w-3.5 h-3.5 text-white/80 group-hover:scale-110 transition-transform" />
            </a>

            <a
              href="tel:100"
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-medium leading-none">Police</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400">100 Control</span>
              </div>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </a>

            <a
              href="tel:101"
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-medium leading-none">Fire Brigade</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400">101 Rescue</span>
              </div>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </a>

            <a
              href="tel:108"
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-medium leading-none">Ambulance</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400">108 / 102</span>
              </div>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </a>

            <a
              href="tel:1073"
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-medium leading-none">Road Accident</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400">1073 Traffic</span>
              </div>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </a>

            <a
              href="tel:1033"
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-medium leading-none">Highway NHAI</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400">1033 Assist</span>
              </div>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </a>

            <a
              href="tel:1098"
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-medium leading-none">Childline</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400">1098 Child</span>
              </div>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </a>

            <a
              href="tel:1091"
              className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
            >
              <div className="flex flex-col">
                <span className="text-[10px] text-neutral-400 font-medium leading-none">Women Safety</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400">1091 Helpline</span>
              </div>
              <PhoneCall className="w-3 h-3 text-neutral-400 group-hover:text-rose-600" />
            </a>
          </div>
        </div>
      </div>

      {/* Success / Failure Result States */}
      {resultState.status === 'success' ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-800 text-center space-y-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-100">
              Alert Delivered Successfully!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {resultState.message}
            </p>
          </div>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
            The vehicle owner has been privately notified on their phone. Thank you for helping keep parking safe and considerate!
          </p>
          <button
            onClick={() => {
              setResultState({ status: 'idle' });
              setSelectedCategory('');
              setCustomMessage('');
              deleteRecording();
            }}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-bold text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Send Another Alert
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitAlert} className="space-y-5">
          {/* Predefined Alert Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block px-1">
              Select Parking Alert Reason:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {alertOptions.map((opt) => {
                const isSelected = selectedCategory === opt.text;
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => {
                      setSelectedCategory(opt.text);
                      setResultState({ status: 'idle' });
                    }}
                    className={`w-full p-3.5 rounded-2xl text-left text-xs font-semibold flex items-center gap-3 transition-all ${
                      isSelected
                        ? opt.isEmergency
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 font-bold scale-[1.01]'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-bold scale-[1.01]'
                        : opt.isEmergency
                        ? 'bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900/30'
                        : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    <span className="text-lg shrink-0">{opt.icon}</span>
                    <span className="flex-1">{opt.text}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Voice Message Feature (If enabled by vehicle owner) */}
          {s.allowVoiceMessages && (
            <div className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-neutral-900 dark:text-white">
                    Send Voice Note (Max {s.maxVoiceDurationSeconds}s)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceMode(!isVoiceMode);
                    if (isVoiceMode) deleteRecording();
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-colors ${
                    isVoiceMode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {isVoiceMode ? 'Voice Mode Active' : 'Switch to Voice'}
                </button>
              </div>

              {isVoiceMode && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl space-y-3 border border-neutral-200/60 dark:border-neutral-700/60">
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
                            Recording ({recordingSeconds}s / {s.maxVoiceDurationSeconds}s)
                          </span>
                        ) : (
                          'Tap record to speak your message'
                        )}
                      </div>

                      {isRecording ? (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                        >
                          <Square className="w-3.5 h-3.5" /> Stop
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
                        >
                          <Mic className="w-3.5 h-3.5" /> Start Recording
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Audio Ready ({recordingSeconds}s)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={togglePlayback}
                            className="p-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300"
                            title="Preview playback"
                          >
                            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={deleteRecording}
                            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-200"
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
                  Optional Short Note:
                </label>
                <span className="text-[10px] text-neutral-400">
                  {customMessage.length}/{s.maxCustomTextLength}
                </span>
              </div>
              <textarea
                value={customMessage}
                maxLength={s.maxCustomTextLength}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="e.g. Parked near pillar B-14, need to exit in 5 mins..."
                rows={2}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          )}

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
            className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
              !selectedCategory || isSubmitting
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : isEmergencySelected
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/30'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Delivering Alert to Owner...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Parking Alert
              </>
            )}
          </button>
        </form>
      )}

      {/* ── STORY CARD: WHAT IS PARKSIGNAL? ── */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-7 border border-indigo-500/30 text-white space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] uppercase font-black tracking-wider text-cyan-400">
              Do You Own a Car or Bike?
            </span>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            100% Free Forever
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-black font-display text-white">
            Never leave your phone number on your dashboard again.
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ever been blocked by another car in a crowded market or mall? Or worried about leaving your mobile number on a paper slip where anyone walking by can save it and harass you?
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>ParkSignal</strong> gives your vehicle a <strong>Smart Privacy QR Sticker</strong>. If your car is blocking someone, if lights are left on, or in an emergency, anyone can notify you in 5 seconds without ever seeing your phone number.
          </p>
        </div>

        {/* 3 Quick Value Bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-200">Zero Spam Calls</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-200">Total Driver Privacy</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-200">Free Printable QR</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <a
            href="/parksignal"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <span>Create Your Free Vehicle QR Sticker</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </a>
        </div>
      </div>

      {/* Clean Footer Info */}
      <div className="text-center space-y-1.5 pt-2">
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
          Powered by <strong>ParkSignal</strong> • Free Public Utility by <strong>BharatUtility</strong>
        </p>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
          Your vehicle. Your privacy. Scan. Alert. Connect.
        </p>
      </div>
    </div>
  );
};
