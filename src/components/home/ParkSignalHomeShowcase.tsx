import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, BellRing, QrCode, PhoneCall, ArrowRight, Camera, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { ParkSignalScanModal } from '../parksignal/ParkSignalScanModal';

export const ParkSignalHomeShowcase: React.FC = () => {
  const { navigateToParkSignal } = useApp();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-indigo-500/30 p-5 sm:p-8 shadow-xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8">
          {/* Left Column: Brand & Value Pitch */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            {/* New Launch Pill */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-cyan-300 text-[11px] font-extrabold border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>NEW PRODUCT LAUNCH</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Free Forever
              </span>
            </div>

            {/* Title & Branding */}
            <div className="space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <img
                  src="/parksignal-emblem-transparent.png"
                  alt="ParkSignal"
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain filter drop-shadow-md"
                />
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-white">
                  Park<span className="text-cyan-400">Signal</span>
                </h2>
              </div>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Smart Privacy QR Stickers for Your Car & Bike. Never leave your phone number exposed on your windshield again. Allow anyone to notify you about blocking, open windows, lights left on, or emergencies in 5 seconds privately.
              </p>
            </div>

            {/* Micro Feature Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold text-slate-200">Zero Phone Spam</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold text-slate-200">Instant Alert</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-slate-200">Self-Print Anywhere</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-slate-200">100% Free Service</span>
              </div>
            </div>

            {/* DIY Print Banner */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2 text-left">
              <span className="text-base">🖨️</span>
              <span>
                <strong>100% Free DIY Print:</strong> Download your vehicle QR sticker in 1-click and print it at home or any local xerox/stationery shop. No hardware or device purchase needed!
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => navigateToParkSignal('landing')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Generate Free Vehicle QR</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                onClick={() => setIsScanModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Scan a Vehicle Sticker</span>
              </button>

              <button
                onClick={() => navigateToParkSignal('help')}
                className="px-4 py-3 text-slate-400 hover:text-white font-semibold text-xs transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer"
              >
                <span>How it works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Visual Sticker Card */}
          <div className="shrink-0 w-full lg:w-80 flex flex-col items-center">
            <div className="w-full bg-slate-900/90 rounded-2xl border border-indigo-500/40 p-4.5 space-y-3 shadow-2xl relative">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                  Vehicle Protection Pass
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-extrabold">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-20 h-20 bg-white p-1.5 rounded-xl shadow-inner shrink-0 flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-950" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Car / SUV Sticker
                  </span>
                  <span className="text-sm font-black font-mono text-white block">
                    MH12 AB 9999
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Shield Active
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                Bystanders scan with any smartphone camera to politely notify you. Your mobile number stays completely hidden.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Scan Modal */}
      <ParkSignalScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </section>
  );
};
