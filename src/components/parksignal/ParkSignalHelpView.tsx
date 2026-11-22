import React from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, QrCode, Bot, Printer, Shield, ArrowLeft, PhoneCall } from 'lucide-react';

export const ParkSignalHelpView: React.FC = () => {
  const { navigateToParkSignal } = useApp();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 space-y-8 animate-fadeIn">
      <div className="space-y-3 text-center sm:text-left">
        <button
          onClick={() => navigateToParkSignal('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to ParkSignal
        </button>
        <h1 className="text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
          ParkSignal Setup Guide & Help Center
        </h1>
        <p className="text-sm text-neutral-500">
          Everything you need to know about setting up your vehicle QR sticker and Telegram bot
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
              1
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Create Your Owner Account & Register Vehicles
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-11">
            Register your permanent owner account at <a href="/parksignal/register" className="text-indigo-600 font-bold hover:underline">bharatutility.tech/parksignal/register</a>. Enter your vehicle registration number (e.g., <code>MH 12 AB 1234</code>, <code>DL 01 A 1234</code>, or Bharat Series <code>22 BH 1234 AA</code>). You can register multiple vehicles under a single account!
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
              2
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Connect Telegram with @ParkSignal_bot
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-11">
            In your dashboard, click <strong>"Connect Telegram"</strong>. This generates a secure one-time linking token and opens our official Telegram bot: <a href="https://t.me/ParkSignal_bot" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">https://t.me/ParkSignal_bot</a>. Tap <strong>START</strong> in Telegram. You will instantly receive a confirmation message that your account is linked!
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
              3
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Print & Mount Your QR Sticker
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-11">
            Click <strong>"View & Print Sticker"</strong> on your vehicle card. Download the high-resolution PNG or vector SVG. Print it on standard paper or a photo sticker sheet and affix it to the inside of your front windshield (bottom corner) or rear glass so scanners can easily aim their phone cameras at it.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
              4
            </span>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              Customize Alert Rules & Voice Messages
            </h2>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-11">
            From your dashboard, click <strong>"Customize Alerts"</strong> for any vehicle. You can toggle each of the 8 alert categories, decide whether to allow custom text notes, enable or disable 60-second voice messages, and configure quiet hours. Changes take effect immediately without needing to reprint your QR code!
          </p>
        </div>

        {/* Emergency Advisory & Indian Helpline Directory */}
        <div className="bg-rose-50 dark:bg-rose-950/40 p-5 sm:p-6 rounded-3xl border border-rose-200 dark:border-rose-900/50 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="font-black text-rose-800 dark:text-rose-200 text-sm sm:text-base flex items-center gap-2">
                <span>Emergency Advisory (Dial 112)</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase font-extrabold tracking-wider">
                  India 24x7
                </span>
              </div>
              <p className="text-xs leading-relaxed text-rose-900/80 dark:text-rose-300/80">
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
      </div>
    </div>
  );
};
