import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight
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
          message: 'Voice message delivered to vehicle owner via Telegram @ParkSignal_bot!'
        });
      } else {
        setResultState({
          status: 'failed',
          message: res.error || 'Failed to deliver voice alert. Please try sending a standard text message.'
        });
      }
    } else {
      const res = await parkSignalService.sendTextAlert(token, selectedCategory, customMessage);
      setIsSubmitting(false);
      if (res.success && res.delivered) {
        setResultState({
          status: 'success',
          message: 'Parking alert delivered to the vehicle owner successfully!'
        });
      } else {
        setResultState({
          status: 'failed',
          message: res.error || 'Delivery failed. The owner might not have connected Telegram notifications yet.'
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
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
          <Car className="w-3.5 h-3.5" />
          ParkSignal • BharatUtility
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
          Contact Vehicle Owner
        </h1>
        <p className="text-xs text-neutral-500">
          Your Vehicle. Your Privacy. • Scan. Alert. Connect.
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
        <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 rounded-2xl text-[11px] text-neutral-600 dark:text-neutral-400 flex items-start gap-2 border border-neutral-200/50 dark:border-neutral-700/50">
          <Lock className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Personal Data Sharing:</strong> Your identity and phone number will NOT be asked or shared. The owner will receive this alert instantly on Telegram via <strong>@ParkSignal_bot</strong>.
          </span>
        </div>
      </div>

      {/* Emergency 112 Callout Notice */}
      <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-3xl border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
        <PhoneCall className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-extrabold text-rose-700 dark:text-rose-300">
            Emergency Notice (Call 112 directly)
          </div>
          <p className="text-[11px] leading-relaxed text-rose-800 dark:text-rose-300/80">
            If someone is in medical danger, a child is trapped, or there is an urgent safety risk, please dial <strong>112 (National Emergency Helpline)</strong> immediately. ParkSignal is an alert relay and not an emergency dispatch service.
          </p>
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
              Alert Sent Successfully!
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {resultState.message}
            </p>
          </div>
          <p className="text-[11px] text-neutral-500">
            The owner has been notified on their Telegram app. Thank you for helping keep parking safe and considerate.
          </p>
          <button
            onClick={() => {
              setResultState({ status: 'idle' });
              setSelectedCategory('');
              setCustomMessage('');
              deleteRecording();
            }}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-bold text-xs border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 transition-colors"
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
                Dispatching Alert via Telegram...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Send Parking Alert
              </>
            )}
          </button>
        </form>
      )}

      {/* Footer Info */}
      <div className="text-center space-y-2 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/60">
        <div className="text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
          <span>Powered by <strong>ParkSignal</strong></span>
          <span>•</span>
          <span>Official Telegram: <strong>@ParkSignal_bot</strong></span>
        </div>
        <p className="text-[10px] text-neutral-400">
          Want a free QR sticker for your vehicle? Visit <a href="/parksignal" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">bharatutility.tech/parksignal</a>
        </p>
      </div>
    </div>
  );
};
