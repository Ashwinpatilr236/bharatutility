import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parkSignalService } from '../../services/parkSignalService';
import { ParkSignalLogo } from './ParkSignalLogo';
import { ParkSignalScanModal } from './ParkSignalScanModal';
import {
  Car,
  QrCode,
  ShieldCheck,
  BellRing,
  Send,
  Lock,
  Smartphone,
  Mic,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  ExternalLink,
  Bot,
  PhoneCall,
  Camera,
  MessageSquare,
  Clock,
  Sparkles,
  Printer
} from 'lucide-react';

export const ParkSignalLandingView: React.FC = () => {
  const { navigateToParkSignal } = useApp();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const currentUser = parkSignalService.getCurrentUser();

  return (
    <div className="space-y-6 sm:space-y-10 pb-10">
      {/* ── 1. HERO SECTION (Compact, No Duplicate Logos, Zero Wasted Space) ── */}
      <section className="relative overflow-hidden pt-3 sm:pt-6 pb-4 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
          {/* Official Badge Pill */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/80 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Official Fastag-Size Smart Parking Protection
            </div>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-neutral-900 dark:text-white leading-tight">
              Your Vehicle. <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Your Privacy.</span>
            </h1>
            <p className="text-xs sm:text-base font-bold text-neutral-600 dark:text-neutral-300">
              Instant Windshield QR Alerts via Telegram • Zero Phone Number Sharing
            </p>
          </div>

          {/* Subtext */}
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Never write your personal phone number on your car dashboard again. Place a smart ParkSignal QR sticker on your windshield. Anyone can send you instant parking alerts or voice notes through Telegram — without ever seeing your phone number or identity.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <button
              onClick={() => navigateToParkSignal('register')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <QrCode className="w-4 h-4" /> Generate Free QR Sticker
            </button>
            <button
              onClick={() => setIsScanModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-indigo-500/30 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Scan Vehicle Sticker
            </button>
            <button
              onClick={() => navigateToParkSignal(currentUser ? 'dashboard' : 'login')}
              className="w-full sm:w-auto px-4 py-2.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              {currentUser ? 'Open Dashboard' : 'Owner Login'} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Micro trust indicators */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Free Forever
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" /> No Phone Number Shared
            </span>
            <span className="flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-500" /> Powered by @ParkSignal_bot
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. THE PROBLEM VS THE PARKSIGNAL SOLUTION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
            Why Traditional Parking Slips Are Dangerous
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Leaving your mobile number on a piece of paper on your dashboard exposes you to scams, unwanted calls, and harassment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-bold">
              ❌ The Old Risky Way
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Phone Number Written on Paper
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span> Any stranger walking past your car can see and save your phone number.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span> Leads to telemarketing spam, WhatsApp harassment, and financial fraud.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span> Scanners have to save your contact or call you directly.
              </li>
            </ul>
          </div>

          {/* ParkSignal way */}
          <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-4 shadow-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              ✅ The ParkSignal Way
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              Privacy-First Smart QR Sticker
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Zero contact information is visible to scanners or the public.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Alerts are delivered instantly to your Telegram via @ParkSignal_bot.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Scanners need no app or registration — works instantly on any phone camera.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS (4 SIMPLE STEPS) ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-600 dark:text-indigo-400">
            Simple 4-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
            How ParkSignal Works
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Set up your vehicle in less than 2 minutes at ₹0 cost.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 relative group hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-black text-sm flex items-center justify-center">
              1
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Create Account & Add Vehicle
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Register once. Add your car, bike, or scooter with its registration number. You can manage multiple vehicles under one account.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 relative group hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-black text-sm flex items-center justify-center">
              2
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Connect @ParkSignal_bot
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Click Connect Telegram in your dashboard. Tap Start in the bot. Your Telegram is securely bound in seconds without sharing your chat ID.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 relative group hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 font-black text-sm flex items-center justify-center">
              3
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Download & DIY Self-Print
              </h3>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                100% Free
              </span>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Download your high-res sticker in 1-click. Print it yourself at home or at any local Xerox / stationery shop for ₹5-10. No expensive tags or hardware needed!
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 relative group hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-black text-sm flex items-center justify-center">
              4
            </div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Receive Instant Alerts
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              When anyone scans your QR code, they can alert you about blocked driveways, open doors, lights on, or voice notes instantly!
            </p>
          </div>
        </div>
      </section>

      {/* ── 3.5. 100% FREE DIY SELF-PRINT GUIDE ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 dark:border-amber-500/20 backdrop-blur-sm space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-black tracking-wider text-amber-700 dark:text-amber-400">
                    Zero Hardware Cost
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black">
                    100% Free Service
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                  Download, Print Yourself & Stick on Windshield
                </h3>
              </div>
            </div>
            <button
              onClick={() => navigateToParkSignal('register')}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all shrink-0 cursor-pointer"
            >
              Get Free QR Code
            </button>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            You do <strong>not</strong> need to buy any costly plastic device or pay vendor markups. ParkSignal gives you a high-resolution, print-ready sticker matching the standard Fastag size (~10×5 cm). You can print it yourself at home or print at any local photocopy/stationery shop for just ₹5 - ₹10!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>1.</span> Instant Free Download
              </span>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                One-click download in ultra-sharp PNG or vector SVG format with clear scanning borders.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>2.</span> Print at Any Local Shop
              </span>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Ask your nearby Xerox shop for a sticker paper print or print on regular paper & laminate for ₹5.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-amber-200/60 dark:border-amber-900/40 space-y-1">
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <span>3.</span> Stick on Windshield
              </span>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                Stick it neatly inside the front passenger corner or beside your Fastag. Ready to protect your car!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. PREDEFINED ALERTS SHOWCASE ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-neutral-950 text-white rounded-3xl p-8 sm:p-12 space-y-8 shadow-xl">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Complete Control in Your Hands
            </span>
            <h2 className="text-2xl sm:text-4xl font-black font-display tracking-tight">
              Vehicle-Specific Alert Rules
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              You choose what messages people can send for each vehicle. If you disable an alert or voice messages, it is completely hidden on that vehicle's scanner page.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <span>🚗</span> Blocking Vehicle
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <span>🅿️</span> Please Move Vehicle
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <span>⚠️</span> Emergency Alert
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <span>👶</span> Child/Person Inside
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <span>💡</span> Lights Left ON
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <span>🪟</span> Window/Door Open
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <span>💥</span> Vehicle Damage
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2">
              <span>🎙️</span> 60s Voice Messages
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. NOTIFICATION CHANNELS & SERVICE TIERS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Notification Channels
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
            How You Receive Parking Alerts
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Enjoy 100% free unlimited alerts via Telegram today. WhatsApp and SMS channels are in active development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Channel 1: Telegram (Active & Free) */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-b from-blue-50/70 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-500/40 dark:border-blue-500/30 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider border border-emerald-300/60">
                  🟢 100% Free Forever
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Telegram Bot (@ParkSignal_bot)
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Instant real-time push alerts, quick vehicle commands, and 60-second voice note playback.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-blue-200/50 dark:border-blue-900/40">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Unlimited text & voice alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No phone number shared ever</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive /myvehicles commands</span>
                </li>
              </ul>
            </div>
            <a
              href="https://t.me/ParkSignal_bot"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer mt-4"
            >
              <Bot className="w-4 h-4" /> Open @ParkSignal_bot <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Channel 2: WhatsApp (Coming Soon - Paid) */}
          <div className="relative p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4 flex flex-col justify-between opacity-90">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-300/60">
                  🟡 Coming Soon (Paid)
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  WhatsApp Direct Alerts
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Receive verified parking notifications directly inside WhatsApp without sharing numbers.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Official Meta WhatsApp Cloud API</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Paid subscription / token bundle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Currently under active development</span>
                </li>
              </ul>
            </div>
            <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-bold text-center mt-4">
              In Development • Coming Soon
            </div>
          </div>

          {/* Channel 3: SMS Alerts (Coming Soon - Paid) */}
          <div className="relative p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4 flex flex-col justify-between opacity-90">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-300/60">
                  🟡 Coming Soon (Paid)
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  SMS / Cellular Alerts
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Offline carrier SMS fallback for when you don't have active internet connectivity.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Direct Indian telecom DLT route</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Paid cellular gateway bundle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Currently under active development</span>
                </li>
              </ul>
            </div>
            <div className="w-full py-2.5 px-4 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-xs font-bold text-center mt-4">
              In Development • Coming Soon
            </div>
          </div>
        </div>
      </section>

      {/* ── 4.5. EMERGENCY ADVISORY & 24x7 HELPLINES ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-rose-50 dark:bg-rose-950/40 p-5 sm:p-7 rounded-3xl border border-rose-200 dark:border-rose-900/50 space-y-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="font-black text-rose-800 dark:text-rose-200 text-base sm:text-lg flex items-center gap-2">
                <span>Emergency Advisory (Dial 112)</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase font-extrabold tracking-wider">
                  India 24x7
                </span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-rose-900/80 dark:text-rose-300/80">
                ParkSignal is designed for polite parking notifications (blocking cars, open windows, lights left on). In life-threatening emergencies, severe road accidents, or medical crises, always call national emergency helplines directly.
              </p>
            </div>
          </div>

          {/* Quick Tap-to-Call Buttons for All Indian Emergency Services */}
          <div className="space-y-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
            <span className="text-[11px] uppercase font-bold tracking-wider text-rose-700 dark:text-rose-300 block">
              Direct Emergency Helplines (Tap to Call 24x7):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <a
                href="tel:112"
                className="flex items-center justify-between p-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-rose-100 font-medium leading-none">All-in-One</span>
                  <span className="text-xs font-black">112 National</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-white/80 group-hover:scale-110 transition-transform" />
              </a>

              <a
                href="tel:100"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-medium leading-none">Police</span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400">100 Control</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-600" />
              </a>

              <a
                href="tel:101"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-medium leading-none">Fire Brigade</span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400">101 Rescue</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-600" />
              </a>

              <a
                href="tel:108"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-medium leading-none">Ambulance</span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400">108 / 102</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-600" />
              </a>

              <a
                href="tel:1073"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-medium leading-none">Road Accident</span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400">1073 Traffic</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-600" />
              </a>

              <a
                href="tel:1033"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-medium leading-none">Highway NHAI</span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400">1033 Assist</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-600" />
              </a>

              <a
                href="tel:1098"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-medium leading-none">Childline</span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400">1098 Child</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-600" />
              </a>

              <a
                href="tel:1091"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-rose-200 dark:border-rose-900/50 text-neutral-800 dark:text-neutral-200 hover:border-rose-400 transition-colors shadow-2xs group"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-400 font-medium leading-none">Women Safety</span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-400">1091 Helpline</span>
                </div>
                <PhoneCall className="w-3.5 h-3.5 text-neutral-400 group-hover:text-rose-600" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQS ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-neutral-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500">
            Clear answers about ParkSignal privacy, Telegram, and stickers
          </p>
        </div>

        <div className="space-y-3">
          <details className="group p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <summary className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
              Do I need to buy expensive tags or can I print it myself?
              <ChevronRight className="w-4 h-4 text-neutral-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              You can print it yourself 100% free! Simply download the print-ready sticker from your dashboard and print it at home or at any nearby xerox/stationery shop for ₹5 to ₹10. Stick it on your windshield with tape or on a sticker sheet. Zero hardware purchase is required.
            </p>
          </details>

          <details className="group p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <summary className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
              Is ParkSignal really 100% free?
              <ChevronRight className="w-4 h-4 text-neutral-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Yes! ParkSignal is built on Cloudflare Workers, Cloudflare D1, and the official free Telegram Bot API. There are no subscriptions, hidden fees, or premium tiers.
            </p>
          </details>

          <details className="group p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <summary className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
              Does the person scanning my QR code need an app or Telegram?
              <ChevronRight className="w-4 h-4 text-neutral-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              No. Anyone with a smartphone can point their default camera app at your sticker. It opens a fast mobile web page in their browser. They do NOT need an account, login, or Telegram.
            </p>
          </details>

          <details className="group p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <summary className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
              Can someone call or see my phone number?
              <ChevronRight className="w-4 h-4 text-neutral-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Never. The scanner never receives your phone number, email, real name, or Telegram username. All communication travels through our official bot @ParkSignal_bot.
            </p>
          </details>

          <details className="group p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
            <summary className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white cursor-pointer list-none flex items-center justify-between">
              Can I manage multiple cars or two-wheelers?
              <ChevronRight className="w-4 h-4 text-neutral-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Yes. You can add as many vehicles as you own (Cars, Bikes, Scooters) under one owner account. Each vehicle receives its own unique QR code sticker.
            </p>
          </details>
        </div>
      </section>

      {/* ── 6. FINAL CTA BANNER ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 dark:bg-black text-white border border-neutral-800 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black font-display">
            Protect Your Privacy on the Road Today
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
            Takes under 2 minutes. Free printable sticker. Instant Telegram alerts via @ParkSignal_bot.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigateToParkSignal('register')}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all inline-flex items-center gap-2"
            >
              Get Started Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Scan Modal */}
      <ParkSignalScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />
    </div>
  );
};
