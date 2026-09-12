import React, { useState, useEffect, useMemo } from 'react';
import { Train, Clock, MapPin, Search, AlertCircle, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatINR } from '../../../utils/formatters';

type CoachClass = 'SL' | '3A' | '3E' | '2A' | 'CC' | '2S';

export const TrainBerthTatkalFinder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'berth' | 'tatkal' | 'refund'>('berth');

  // Berth Locator States
  const [coachClass, setCoachClass] = useState<CoachClass>('3A');
  const [seatNumber, setSeatNumber] = useState<number>(25);

  // Tatkal Timer State
  const [now, setNow] = useState<Date>(new Date());

  // Ticket Refund Calculator States
  const [ticketClass, setTicketClass] = useState<'1A' | '2A' | '3A' | 'SL' | '2S'>('3A');
  const [ticketFare, setTicketFare] = useState<number>(1450);
  const [cancellationTimeframe, setCancellationTimeframe] = useState<'gt48' | '12to48' | '4to12' | 'lt4'>('gt48');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute Berth Position
  const berthDetails = useMemo(() => {
    const seat = Math.max(1, Math.min(83, seatNumber));

    if (coachClass === 'SL' || coachClass === '3A') {
      // 8 berths per compartment (1-8, 9-16, ...)
      const remainder = seat % 8;
      const bayNumber = Math.ceil(seat / 8);

      let berthType = 'Upper Berth (UB)';
      let isWindow = false;

      if (remainder === 1 || remainder === 4) {
        berthType = 'Lower Berth (LB)';
        isWindow = remainder === 1;
      } else if (remainder === 2 || remainder === 5) {
        berthType = 'Middle Berth (MB)';
      } else if (remainder === 3 || remainder === 6) {
        berthType = 'Upper Berth (UB)';
      } else if (remainder === 7) {
        berthType = 'Side Lower (SL)';
        isWindow = true;
      } else if (remainder === 0) {
        berthType = 'Side Upper (SU)';
      }

      return {
        berthType,
        bayNumber,
        isWindow,
        maxBerths: coachClass === 'SL' ? 72 : 64,
        deck: remainder === 7 || remainder === 0 ? 'Aisle / Side Corridor' : 'Main Inside Cabin',
      };
    }

    if (coachClass === '3E') {
      // 3rd AC Economy (9 berths per compartment)
      const remainder = seat % 9;
      const bayNumber = Math.ceil(seat / 9);
      let berthType = 'Upper Berth';
      let isWindow = false;

      if (remainder === 1 || remainder === 4) {
        berthType = 'Lower Berth (LB)';
        isWindow = remainder === 1;
      } else if (remainder === 2 || remainder === 5) {
        berthType = 'Middle Berth (MB)';
      } else if (remainder === 3 || remainder === 6) {
        berthType = 'Upper Berth (UB)';
      } else if (remainder === 7) {
        berthType = 'Side Lower (SL)';
        isWindow = true;
      } else if (remainder === 8) {
        berthType = 'Side Middle (SM)';
      } else if (remainder === 0) {
        berthType = 'Side Upper (SU)';
      }

      return {
        berthType,
        bayNumber,
        isWindow,
        maxBerths: 83,
        deck: remainder >= 7 || remainder === 0 ? 'Side Berth' : 'Main Cabin',
      };
    }

    if (coachClass === '2A') {
      // 6 berths per compartment
      const remainder = seat % 6;
      const bayNumber = Math.ceil(seat / 6);
      let berthType = 'Upper Berth';
      let isWindow = false;

      if (remainder === 1 || remainder === 3) {
        berthType = 'Lower Berth (LB)';
        isWindow = remainder === 1;
      } else if (remainder === 2 || remainder === 4) {
        berthType = 'Upper Berth (UB)';
      } else if (remainder === 5) {
        berthType = 'Side Lower (SL)';
        isWindow = true;
      } else if (remainder === 0) {
        berthType = 'Side Upper (SU)';
      }

      return {
        berthType,
        bayNumber,
        isWindow,
        maxBerths: 48,
        deck: remainder === 5 || remainder === 0 ? 'Side Berth' : 'Main Cabin',
      };
    }

    // Chair Car (CC / 2S)
    const remainder = seat % 5;
    const isWindow = remainder === 1 || remainder === 0;
    const isAisle = remainder === 3 || remainder === 4;
    const isMiddle = remainder === 2;

    return {
      berthType: isWindow ? 'Window Seat' : isAisle ? 'Aisle Seat' : 'Middle Seat',
      bayNumber: Math.ceil(seat / 5),
      isWindow,
      maxBerths: coachClass === 'CC' ? 78 : 108,
      deck: 'Chair Car Row',
    };
  }, [coachClass, seatNumber]);

  // Tatkal Countdown Math
  const tatkalTimers = useMemo(() => {
    // Current IST time
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();

    // Target 10:00:00 AM (AC) & 11:00:00 AM (Non-AC)
    const targetAc = new Date(now);
    targetAc.setHours(10, 0, 0, 0);
    if (now.getTime() > targetAc.getTime()) {
      targetAc.setDate(targetAc.getDate() + 1); // Next day
    }

    const targetNonAc = new Date(now);
    targetNonAc.setHours(11, 0, 0, 0);
    if (now.getTime() > targetNonAc.getTime()) {
      targetNonAc.setDate(targetNonAc.getDate() + 1);
    }

    const diffAcSec = Math.floor((targetAc.getTime() - now.getTime()) / 1000);
    const diffNonAcSec = Math.floor((targetNonAc.getTime() - now.getTime()) / 1000);

    const formatCountdown = (totalSec: number) => {
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return {
      acCountdown: formatCountdown(diffAcSec),
      nonAcCountdown: formatCountdown(diffNonAcSec),
      isAcActiveNow: currentHours === 10 && currentMinutes < 15,
      isNonAcActiveNow: currentHours === 11 && currentMinutes < 15,
    };
  }, [now]);

  // Railway Refund Math
  const refundMath = useMemo(() => {
    let flatDeduction = 240;
    if (ticketClass === '1A') flatDeduction = 240;
    else if (ticketClass === '2A') flatDeduction = 200;
    else if (ticketClass === '3A') flatDeduction = 180;
    else if (ticketClass === 'SL') flatDeduction = 120;
    else flatDeduction = 60;

    let finalDeduction = flatDeduction;

    if (cancellationTimeframe === 'gt48') {
      finalDeduction = flatDeduction;
    } else if (cancellationTimeframe === '12to48') {
      finalDeduction = Math.max(flatDeduction, ticketFare * 0.25);
    } else if (cancellationTimeframe === '4to12') {
      finalDeduction = Math.max(flatDeduction, ticketFare * 0.5);
    } else {
      finalDeduction = ticketFare; // No refund within 4 hours of chart preparation
    }

    const refundAmount = Math.max(0, ticketFare - finalDeduction);

    return {
      flatDeduction,
      finalDeduction,
      refundAmount,
      refundPercentage: ticketFare > 0 ? (refundAmount / ticketFare) * 100 : 0,
    };
  }, [ticketClass, ticketFare, cancellationTimeframe]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-blue-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 text-blue-300 rounded-2xl">
            <Train className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              IRCTC Train Berth Locator & Tatkal Booking Countdown
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Instant Seat Position, Window View Finder, Tatkal 10:00 AM Clock & Ticket Cancellation Refund Guide
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('berth')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'berth'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Search className="w-4 h-4" />
          Seat & Berth Position Locator
        </button>
        <button
          onClick={() => setActiveTab('tatkal')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'tatkal'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Live Tatkal Booking Clocks
        </button>
        <button
          onClick={() => setActiveTab('refund')}
          className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'refund'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Ticket Refund Calculator
        </button>
      </div>

      {activeTab === 'berth' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Enter Coach Class & Seat Number
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Coach Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { id: '3A', label: '3rd AC (3A)' },
                  { id: 'SL', label: 'Sleeper (SL)' },
                  { id: '3E', label: '3AC Eco (3E)' },
                  { id: '2A', label: '2nd AC (2A)' },
                  { id: 'CC', label: 'Chair Car (CC)' },
                  { id: '2S', label: '2nd Seater' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCoachClass(c.id as CoachClass)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      coachClass === c.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Seat / Berth Number (1 to {berthDetails.maxBerths})
                </label>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  Seat #{seatNumber}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max={berthDetails.maxBerths}
                value={seatNumber}
                onChange={(e) => setSeatNumber(parseInt(e.target.value) || 1)}
                className="w-full accent-blue-600 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex gap-2 mt-3">
                {[1, 7, 15, 23, 31, 47, 55, 63].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setSeatNumber(num)}
                    className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-blue-500/10 hover:text-blue-600"
                  >
                    #{num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Seat Position Result
              </span>
              {berthDetails.isWindow && (
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                  🪟 Window Seat
                </span>
              )}
            </div>

            <div>
              <div className="text-xs text-slate-400">Berth Allocation</div>
              <div className="text-3xl font-black text-white mt-1">{berthDetails.berthType}</div>
              <div className="text-xs text-slate-400 mt-1">
                Cabin / Bay Number: <strong className="text-blue-400">Bay #{berthDetails.bayNumber}</strong>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Coach Type:</span>
                <span className="font-semibold text-white">{coachClass}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Location in Coach:</span>
                <span className="font-semibold text-blue-300">{berthDetails.deck}</span>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'tatkal' ? (
        /* Tatkal Timers Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-amber-500/20 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-amber-400">AC Tatkal Window (10:00 AM IST)</span>
              {tatkalTimers.isAcActiveNow && (
                <span className="animate-pulse text-xs bg-red-600 px-2.5 py-0.5 rounded-full font-bold">
                  OPEN NOW!
                </span>
              )}
            </div>
            <div className="text-4xl font-mono font-black text-amber-400">
              {tatkalTimers.acCountdown}
            </div>
            <p className="text-xs text-slate-400">
              Opens 1 day before journey date for 1A, 2A, 3A, 3E, and Executive CC. Keep IRCTC Master List ready.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-blue-500/20 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-blue-400">Non-AC Tatkal Window (11:00 AM IST)</span>
              {tatkalTimers.isNonAcActiveNow && (
                <span className="animate-pulse text-xs bg-red-600 px-2.5 py-0.5 rounded-full font-bold">
                  OPEN NOW!
                </span>
              )}
            </div>
            <div className="text-4xl font-mono font-black text-blue-400">
              {tatkalTimers.nonAcCountdown}
            </div>
            <p className="text-xs text-slate-400">
              Opens 1 day before journey date for Sleeper (SL) & 2S. Complete UPI payment in under 60 seconds.
            </p>
          </div>
        </div>
      ) : (
        /* Refund Calculator Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">
              Ticket Cancellation Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Class of Travel
                </label>
                <select
                  value={ticketClass}
                  onChange={(e) => setTicketClass(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
                >
                  <option value="1A">AC 1st Class / Executive (₹240 clerkage)</option>
                  <option value="2A">AC 2-Tier (₹200 clerkage)</option>
                  <option value="3A">AC 3-Tier / 3E (₹180 clerkage)</option>
                  <option value="SL">Sleeper Class (₹120 clerkage)</option>
                  <option value="2S">Second Class (₹60 clerkage)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ticket Fare Paid (₹)
                </label>
                <input
                  type="number"
                  min="50"
                  value={ticketFare}
                  onChange={(e) => setTicketFare(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Cancellation Time before Departure
              </label>
              <div className="space-y-2">
                {[
                  { id: 'gt48', label: 'More than 48 Hours before departure', desc: 'Flat clerkage charge only' },
                  { id: '12to48', label: 'Between 12 Hours to 48 Hours before departure', desc: '25% of fare or clerkage (whichever higher)' },
                  { id: '4to12', label: 'Between 4 Hours to 12 Hours before departure', desc: '50% of fare or clerkage (whichever higher)' },
                  { id: 'lt4', label: 'Less than 4 Hours (After Chart Preparation)', desc: 'No refund permissible on confirmed tickets' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCancellationTimeframe(t.id as any)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all ${
                      cancellationTimeframe === t.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Refund Estimate
              </span>
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>

            <div>
              <div className="text-xs text-slate-400">Estimated Net Refund Amount</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {formatINR(Math.round(refundMath.refundAmount))}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Total Cancellation Deduction: <strong className="text-rose-400">{formatINR(Math.round(refundMath.finalDeduction))}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
