import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Mic, 
  Volume2, 
  Compass, 
  BatteryCharging, 
  Zap, 
  Train, 
  Play, 
  Pause, 
  Square, 
  VolumeX, 
  Maximize2, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

export type DiagnosticMode = 
  | 'mobile-tester' 
  | 'voice-studio' 
  | 'noise-meter' 
  | 'vastu-compass' 
  | 'ev-charging' 
  | 'inverter-calculator' 
  | 'tatkal-timing';

interface Props {
  initialMode?: DiagnosticMode;
  onResultChange?: (result: string) => void;
}

// EV Models Dataset
const INDIAN_EV_MODELS = [
  { name: 'Tata Nexon EV LR', type: 'Car', batteryKwh: 40.5, claimedRangeKm: 465, maxDcRateKw: 50, slowChargerKw: 3.3 },
  { name: 'Tata Punch EV LR', type: 'Car', batteryKwh: 35.0, claimedRangeKm: 421, maxDcRateKw: 50, slowChargerKw: 3.3 },
  { name: 'MG ZS EV', type: 'Car', batteryKwh: 50.3, claimedRangeKm: 461, maxDcRateKw: 50, slowChargerKw: 7.4 },
  { name: 'Mahindra XUV400 EL Pro', type: 'Car', batteryKwh: 39.4, claimedRangeKm: 456, maxDcRateKw: 50, slowChargerKw: 7.2 },
  { name: 'Tata Tiago EV', type: 'Car', batteryKwh: 24.0, claimedRangeKm: 315, maxDcRateKw: 25, slowChargerKw: 3.3 },
  { name: 'Ola S1 Pro (Gen 2)', type: 'Scooter', batteryKwh: 4.0, claimedRangeKm: 195, maxDcRateKw: 3.0, slowChargerKw: 0.75 },
  { name: 'Ather 450X (3.7 kWh)', type: 'Scooter', batteryKwh: 3.7, claimedRangeKm: 150, maxDcRateKw: 3.0, slowChargerKw: 0.7 },
  { name: 'TVS iQube ST', type: 'Scooter', batteryKwh: 5.1, claimedRangeKm: 150, maxDcRateKw: 1.5, slowChargerKw: 0.65 },
];

// Major Indian Railway Stations
const POPULAR_TRAIN_STATIONS = [
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'Delhi', zone: 'Northern Railway (NR)' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', zone: 'Central Railway (CR)' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', zone: 'South Western Railway (SWR)' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', zone: 'Eastern Railway (ER)' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', zone: 'Southern Railway (SR)' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', zone: 'Western Railway (WR)' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', zone: 'East Central Railway (ECR)' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', zone: 'Central Railway (CR)' },
  { code: 'HYB', name: 'Hyderabad Deccan Nampally', city: 'Hyderabad', zone: 'South Central Railway (SCR)' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', zone: 'North Central Railway (NCR)' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', zone: 'North Eastern Railway (NER)' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', zone: 'North Western Railway (NWR)' },
];

export const HardwareAndDiagnosticSuiteCalculator: React.FC<Props> = ({
  initialMode = 'mobile-tester',
  onResultChange,
}) => {
  const [activeTab, setActiveTab] = useState<DiagnosticMode>(initialMode);

  // 1. Mobile Screen Tester State
  const [fullscreenColor, setFullscreenColor] = useState<string | null>(null);
  const [detectedFps, setDetectedFps] = useState<number>(60);
  const [touchPointsCount, setTouchPointsCount] = useState<number>(0);

  // 2. Voice Studio State
  const [voiceText, setVoiceText] = useState<string>(
    'नमस्ते! भारत यूटिलिटी में आपका स्वागत है। यह टूल भारतीय भाषाओं में टेक्स्ट को आवाज में बदलता है।'
  );
  const [selectedLang, setSelectedLang] = useState<string>('hi-IN');
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [speechPitch, setSpeechPitch] = useState<number>(1);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // 3. Noise Meter State
  const [isMeasuringNoise, setIsMeasuringNoise] = useState<boolean>(false);
  const [decibels, setDecibels] = useState<number>(38);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 4. Vastu Compass State
  const [compassHeading, setCompassHeading] = useState<number>(45); // Degrees

  // 5. EV State
  const [selectedEvIdx, setSelectedEvIdx] = useState<number>(0);
  const [homeElectricityRate, setHomeElectricityRate] = useState<number>(7.5);
  const [publicDcRate, setPublicDcRate] = useState<number>(21.0);

  // 6. Inverter State
  const [fansCount, setFansCount] = useState<number>(3); // 75W each
  const [ledCount, setLedCount] = useState<number>(5); // 15W each
  const [tvCount, setTvCount] = useState<number>(1); // 100W
  const [fridgeCount, setFridgeCount] = useState<number>(1); // 200W
  const [batteryAh, setBatteryAh] = useState<number>(150); // 150Ah or 200Ah

  // 7. Tatkal Timing State
  const [stationSearch, setStationSearch] = useState<string>('');
  const [timeUntilAcTatkal, setTimeUntilAcTatkal] = useState<string>('');
  const [timeUntilNonAcTatkal, setTimeUntilNonAcTatkal] = useState<string>('');

  // FPS Detection
  useEffect(() => {
    let frameCount = 0;
    let startTime = performance.now();
    let animId: number;

    const countFrames = (now: number) => {
      frameCount++;
      if (now - startTime >= 1000) {
        setDetectedFps(Math.round((frameCount * 1000) / (now - startTime)));
        frameCount = 0;
        startTime = now;
      }
      animId = requestAnimationFrame(countFrames);
    };

    animId = requestAnimationFrame(countFrames);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Tatkal Countdown Timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const acTarget = new Date();
      acTarget.setHours(10, 0, 0, 0);
      if (now > acTarget) acTarget.setDate(acTarget.getDate() + 1);

      const nonAcTarget = new Date();
      nonAcTarget.setHours(11, 0, 0, 0);
      if (now > nonAcTarget) nonAcTarget.setDate(nonAcTarget.getDate() + 1);

      const diffAc = Math.max(0, Math.floor((acTarget.getTime() - now.getTime()) / 1000));
      const diffNonAc = Math.max(0, Math.floor((nonAcTarget.getTime() - now.getTime()) / 1000));

      const formatDiff = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h}h ${m}m ${s}s`;
      };

      setTimeUntilAcTatkal(formatDiff(diffAc));
      setTimeUntilNonAcTatkal(formatDiff(diffNonAc));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Device orientation for Vastu Compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setCompassHeading(Math.round(e.alpha));
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Web Speech Synthesis
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support Speech Synthesis API.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(voiceText);
    utterance.lang = selectedLang;
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Noise Meter Handler
  const toggleNoiseMeter = async () => {
    if (isMeasuringNoise) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setIsMeasuringNoise(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateDecibels = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // scale approx 30 dB to 95 dB
        const approxDb = Math.round(30 + (average / 255) * 65);
        setDecibels(approxDb);
        animFrameRef.current = requestAnimationFrame(updateDecibels);
      };

      setIsMeasuringNoise(true);
      updateDecibels();
    } catch (err) {
      alert('Microphone access is required to measure ambient room noise level.');
    }
  };

  // Stereo Audio Test
  const playStereoTest = (channel: 'left' | 'right') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const panner = ctx.createStereoPanner();
      panner.pan.value = channel === 'left' ? -1 : 1;
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.connect(panner);
      panner.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 1000);
    } catch (e) {
      alert('Web Audio API not supported on this browser.');
    }
  };

  // Inverter Calculations
  const totalInverterWattage =
    fansCount * 75 + ledCount * 15 + tvCount * 100 + fridgeCount * 200;
  const recommendedInverterVA = Math.round(totalInverterWattage / 0.8 / 100) * 100 + 200;
  // Battery backup hours: (Ah * 12V * 0.8 efficiency) / Total Watts
  const backupHours =
    totalInverterWattage > 0
      ? ((batteryAh * 12 * 0.8) / totalInverterWattage).toFixed(1)
      : '10.0';

  // EV Calculations
  const currentEv = INDIAN_EV_MODELS[selectedEvIdx];
  const evDcTimeMin = Math.round(((currentEv.batteryKwh * 0.8) / currentEv.maxDcRateKw) * 60);
  const evAcTimeHours = ((currentEv.batteryKwh * 1.1) / currentEv.slowChargerKw).toFixed(1);
  const homeCostFull = Math.round(currentEv.batteryKwh * homeElectricityRate);
  const dcCostFull = Math.round(currentEv.batteryKwh * publicDcRate);
  const homeCostPerKm = (homeCostFull / currentEv.claimedRangeKm).toFixed(2);
  const dcCostPerKm = (dcCostFull / currentEv.claimedRangeKm).toFixed(2);

  // Vastu Zone
  const getVastuZone = (deg: number) => {
    if (deg >= 22.5 && deg < 67.5) return { name: 'North-East (Ishanya)', element: 'Water 💧', room: 'Mandir / Puja Room & Study', color: 'text-blue-600' };
    if (deg >= 67.5 && deg < 112.5) return { name: 'East (Purva)', element: 'Air 🌬️', room: 'Main Entrance & Living Area', color: 'text-emerald-600' };
    if (deg >= 112.5 && deg < 157.5) return { name: 'South-East (Agneya)', element: 'Fire 🔥', room: 'Kitchen & Electrical Panels', color: 'text-amber-600' };
    if (deg >= 157.5 && deg < 202.5) return { name: 'South (Dakshin)', element: 'Fire/Earth', room: 'Bedroom & Rest', color: 'text-orange-600' };
    if (deg >= 202.5 && deg < 247.5) return { name: 'South-West (Nairutya)', element: 'Earth 🪨', room: 'Master Bedroom & Locker / Safe', color: 'text-amber-800' };
    if (deg >= 247.5 && deg < 292.5) return { name: 'West (Pashchim)', element: 'Space 🌌', room: 'Dining Room & Children Study', color: 'text-purple-600' };
    if (deg >= 292.5 && deg < 337.5) return { name: 'North-West (Vayavya)', element: 'Wind 💨', room: 'Guest Room & Washroom', color: 'text-teal-600' };
    return { name: 'North (Uttar)', element: 'Water 🌊', room: 'Treasury / Cash Locker & Work Desk', color: 'text-cyan-600' };
  };
  const vastuZone = getVastuZone(compassHeading);

  const filteredStations = POPULAR_TRAIN_STATIONS.filter(
    (st) =>
      st.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
      st.code.toLowerCase().includes(stationSearch.toLowerCase()) ||
      st.city.toLowerCase().includes(stationSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Fullscreen Dead Pixel Modal */}
      {fullscreenColor && (
        <div
          onClick={() => {
            if (fullscreenColor === '#ff0000') setFullscreenColor('#00ff00');
            else if (fullscreenColor === '#00ff00') setFullscreenColor('#0000ff');
            else if (fullscreenColor === '#0000ff') setFullscreenColor('#ffffff');
            else if (fullscreenColor === '#ffffff') setFullscreenColor('#000000');
            else setFullscreenColor(null);
          }}
          style={{ backgroundColor: fullscreenColor }}
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none"
        >
          <div className="p-4 rounded-2xl bg-black/60 text-white text-xs font-bold text-center backdrop-blur-md">
            Tap anywhere to switch color (Red → Green → Blue → White → Black → Exit)
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700">
        {[
          { id: 'mobile-tester', label: '📱 Screen & Touch Tester', icon: Smartphone },
          { id: 'voice-studio', label: '🗣️ Indian Voice Speech Studio', icon: Volume2 },
          { id: 'noise-meter', label: '🎙️ Live Room Noise (dB) Meter', icon: Mic },
          { id: 'vastu-compass', label: '🧭 Vastu Shastra Compass', icon: Compass },
          { id: 'ev-charging', label: '⚡ Indian EV Charging Matrix', icon: BatteryCharging },
          { id: 'inverter-calculator', label: '🔋 Inverter & Battery Calculator', icon: Zap },
          { id: 'tatkal-timing', label: '🚂 IRCTC Tatkal Clock & Stations', icon: Train },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DiagnosticMode)}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
        
        {/* 1. Mobile Screen Tester */}
        {activeTab === 'mobile-tester' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
                <span>Hardware Self-Diagnostic Test Suite</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Mobile Screen & Touch Diagnostic Tester (Used / Refurbished)
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Check second-hand or new phones for dead pixels, touch ghosting, display refresh rate (FPS / Hz), and stereo speaker channels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Dead Pixel Check */}
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                    🔴 Fullscreen Dead Pixel Test
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Cycle through pure RGB solid colors to identify stuck or dead pixels on AMOLED / LCD displays.
                  </p>
                </div>
                <button
                  onClick={() => setFullscreenColor('#ff0000')}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs hover:scale-102 transition-all flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Start Color Test</span>
                </button>
              </div>

              {/* Refresh Rate FPS */}
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                    ⚡ Live Display Refresh Rate
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Real-time hardware frame rate detection via requestAnimationFrame.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-center">
                  <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {detectedFps} Hz
                  </span>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {detectedFps >= 110 ? 'Ultra Smooth (120Hz)' : detectedFps >= 85 ? 'Smooth (90Hz)' : 'Standard (60Hz)'}
                  </div>
                </div>
              </div>

              {/* Multi-Touch Grid */}
              <div
                onTouchStart={(e) => setTouchPointsCount(e.touches.length)}
                onTouchEnd={(e) => setTouchPointsCount(e.touches.length)}
                className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3 select-none"
              >
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                    👆 Multi-Touch Detector
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Place multiple fingers on this box to test screen touch controller limit.
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-center">
                  <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {touchPointsCount} Touch
                  </span>
                  <div className="text-[10px] text-neutral-500 mt-0.5">Simultaneous points detected</div>
                </div>
              </div>

              {/* Stereo Sound Test */}
              <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-display">
                    🔊 Speaker L/R Balance
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Test bottom vs top earpiece stereo speaker sound isolation.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => playStereoTest('left')}
                    className="py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white text-xs font-bold hover:bg-accent hover:text-white transition-all"
                  >
                    🔊 Left (L)
                  </button>
                  <button
                    onClick={() => playStereoTest('right')}
                    className="py-2 rounded-xl bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white text-xs font-bold hover:bg-accent hover:text-white transition-all"
                  >
                    🔊 Right (R)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Indian Voice Studio */}
        {activeTab === 'voice-studio' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2">
                <span>Native Web Speech Synthesis API</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Multi-Language Indian Voice Speech Studio
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Convert any text to natural audio speech in Indian English, Hindi, Marathi, Tamil, Telugu, Bengali, and Gujarati.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'hi-IN', label: '🇮🇳 हिन्दी (Hindi)' },
                  { id: 'en-IN', label: '🇮🇳 Indian English' },
                  { id: 'mr-IN', label: '🇮🇳 मराठी (Marathi)' },
                  { id: 'ta-IN', label: '🇮🇳 தமிழ் (Tamil)' },
                  { id: 'te-IN', label: '🇮🇳 తెలుగు (Telugu)' },
                  { id: 'bn-IN', label: '🇮🇳 বাংলা (Bengali)' },
                  { id: 'gu-IN', label: '🇮🇳 ગુજરાતી (Gujarati)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLang(l.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      selectedLang === l.id
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    <span>Speaking Speed (Rate): {speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    <span>Voice Pitch: {speechPitch}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSpeak}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-sm hover:scale-102 transition-all ${
                    isSpeaking ? 'bg-rose-600' : 'bg-purple-600'
                  }`}
                >
                  {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Stop Speaking' : 'Play Voice Audio'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Live Room Noise Meter */}
        {activeTab === 'noise-meter' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>Native Web Audio API Sound Meter</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Live Room Noise & Decibel (dB) Sound Meter
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Measure environmental sound levels in real-time to check if your study room, office, or bedroom has healthy acoustic levels.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-4">
              <div className="text-center">
                <div className="text-6xl sm:text-7xl font-black font-mono text-neutral-900 dark:text-white tracking-tight">
                  {isMeasuringNoise ? decibels : '--'} <span className="text-2xl font-bold text-neutral-500">dB</span>
                </div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {decibels < 45
                    ? '🟢 Quiet Room (Ideal for study & sleep)'
                    : decibels < 65
                    ? '🟡 Moderate Sound (Normal conversation / Office)'
                    : decibels < 80
                    ? '🟠 Loud (Traffic / Busy restaurant)'
                    : '🔴 Hazardous Sound Level (>80 dB Danger)'}
                </div>
              </div>

              <button
                onClick={toggleNoiseMeter}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-sm hover:scale-102 transition-all ${
                  isMeasuringNoise ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isMeasuringNoise ? 'Stop Meter' : 'Start Live dB Meter'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. Vastu Shastra Compass */}
        {activeTab === 'vastu-compass' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
                <span>16-Zone Digital Orientation Guide</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Vastu Shastra Digital Compass & Home Energy Zone Analyzer
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Point your phone in any room or adjust the degree slider to view ideal room placements according to classical Vedic Vastu Shastra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Facing Direction (0° to 360°)
                    </label>
                    <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                      {compassHeading}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    value={compassHeading}
                    onChange={(e) => setCompassHeading(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Vastu Zone:</span>
                    <span className={`font-black ${vastuZone.color}`}>{vastuZone.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Ruling Element:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{vastuZone.element}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Best Suitable For:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{vastuZone.room}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                <div
                  style={{ transform: `rotate(${compassHeading}deg)` }}
                  className="w-24 h-24 rounded-full border-4 border-amber-500 flex items-center justify-center transition-transform duration-150"
                >
                  <div className="w-1 h-10 bg-rose-600 rounded-full origin-bottom"></div>
                </div>
                <div className="text-xs text-neutral-500 pt-1">
                  Compass dial pointing {compassHeading}°
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Indian EV Charging Matrix */}
        {activeTab === 'ev-charging' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <span>Indian EV Charging Standards & Cost Calculator</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Indian EV Fast-Charging Time & Running Cost Matrix
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Compare 0-80% DC fast charger speeds, home electricity charging duration, and per-kilometer running costs for top Indian EVs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Select Indian EV Model:
                  </label>
                  <select
                    value={selectedEvIdx}
                    onChange={(e) => setSelectedEvIdx(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                  >
                    {INDIAN_EV_MODELS.map((ev, idx) => (
                      <option key={idx} value={idx}>
                        {ev.name} ({ev.batteryKwh} kWh, {ev.claimedRangeKm} km range)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Home Tariff (₹/Unit)
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      step="0.5"
                      value={homeElectricityRate}
                      onChange={(e) => setHomeElectricityRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Highway DC Tariff (₹/kWh)
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      step="0.5"
                      value={publicDcRate}
                      onChange={(e) => setPublicDcRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* EV Output */}
              <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    0-80% DC Fast Charge Time (CCS2)
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ~{evDcTimeMin} Minutes
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Home Cost / KM</span>
                    <div className="text-sm font-black text-emerald-600">₹{homeCostPerKm} / km</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Highway DC Cost / KM</span>
                    <div className="text-sm font-black text-neutral-900 dark:text-white">₹{dcCostPerKm} / km</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Home Inverter Calculator */}
        {activeTab === 'inverter-calculator' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2">
                <span>Power Sizing & Battery Duration Sizing</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                Home Inverter & Battery Backup Hours Calculator
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Select your fans, lights, TV, and fridge to calculate total wattage, required inverter VA rating, and tubular battery backup duration.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Ceiling Fans (75W)
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      min="0"
                      max="10"
                      value={fansCount}
                      onChange={(e) => setFansCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      LED Bulbs (15W)
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      min="0"
                      max="20"
                      value={ledCount}
                      onChange={(e) => setLedCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      TV / Entertainment (100W)
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      min="0"
                      max="3"
                      value={tvCount}
                      onChange={(e) => setTvCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                      Refrigerator (200W)
                    </label>
                    <input
                      type="number" inputMode="decimal" pattern="[0-9]*"
                      min="0"
                      max="2"
                      value={fridgeCount}
                      onChange={(e) => setFridgeCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
                    Battery Capacity
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[150, 200].map((ah) => (
                      <button
                        key={ah}
                        onClick={() => setBatteryAh(ah)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          batteryAh === ah
                            ? 'bg-amber-500 text-white border-amber-600'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {ah} Ah Tubular Battery
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inverter Output */}
              <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                    Estimated Backup Duration
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-white font-mono">
                    ~{backupHours} Hours
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Total Connected Load</span>
                    <div className="text-sm font-black text-neutral-900 dark:text-white">{totalInverterWattage} Watts</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 text-[10px]">Recommended Inverter</span>
                    <div className="text-sm font-black text-amber-600">{recommendedInverterVA} VA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. IRCTC Tatkal Clock & Stations */}
        {activeTab === 'tatkal-timing' && (
          <div className="space-y-6">
            <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
                <span>Indian Railways CRIS Official Tatkal Windows</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white font-display">
                IRCTC Tatkal Booking Timing Countdown & Station Code Directory
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Live countdown to 10:00 AM (AC Tatkal) and 11:00 AM (Non-AC Sleeper Tatkal) booking windows plus railway station code lookup.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-indigo-500/15 border border-indigo-500/30 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  🧊 AC Classes Tatkal (1A, 2A, 3A, 3E, CC)
                </div>
                <div className="text-sm text-neutral-500">Opens Daily at 10:00 AM IST</div>
                <div className="text-3xl font-black font-mono text-neutral-900 dark:text-white pt-2">
                  {timeUntilAcTatkal}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-rose-500/15 border border-rose-500/30 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  🚂 Non-AC Tatkal (Sleeper SL, 2S)
                </div>
                <div className="text-sm text-neutral-500">Opens Daily at 11:00 AM IST</div>
                <div className="text-3xl font-black font-mono text-neutral-900 dark:text-white pt-2">
                  {timeUntilNonAcTatkal}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  placeholder="Search Indian Railway station by name (e.g. New Delhi, Howrah, CSMT, Bengaluru, Patna)..."
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStations.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-black text-sm text-accent">{st.code}</span>
                      <span className="text-[10px] text-neutral-400">{st.city}</span>
                    </div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white font-display">
                      {st.name}
                    </div>
                    <div className="text-[11px] text-neutral-500">{st.zone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
