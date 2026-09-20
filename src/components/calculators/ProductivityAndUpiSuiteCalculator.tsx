import React, { useState, useEffect, useMemo } from 'react';
import { Tool } from '../../types';
import { MessageSquare, Play, Pause, RotateCcw, QrCode, Sparkles, Check, Copy, ExternalLink, IndianRupee, Timer } from 'lucide-react';

interface Props {
  tool: Tool;
}

const formatINR = (val: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(val));
};

export const ProductivityAndUpiSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. WHATSAPP DIRECT LINK STATE ---
  const [countryCode, setCountryCode] = useState<string>('91');
  const [phoneNumber, setPhoneNumber] = useState<string>('9876543210');
  const [customMessage, setCustomMessage] = useState<string>('Hello! I would like to inquire about your services.');

  // --- 2. POMODORO TIMER STATE ---
  const [timerMode, setTimerMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);

  // --- 3. UPI QR PAYMENT STATE ---
  const [upiId, setUpiId] = useState<string>('ashwin@oksbi');
  const [payeeName, setPayeeName] = useState<string>('Ashwin Patil');
  const [payAmount, setPayAmount] = useState<number>(500);
  const [transactionNote, setTransactionNote] = useState<string>('Consulting Fee');

  // ================= 1. WHATSAPP LINK =================
  const waCleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const waLink = useMemo(() => {
    const fullPhone = `${countryCode}${waCleanPhone}`;
    const encodedMsg = encodeURIComponent(customMessage);
    return `https://wa.me/${fullPhone}?text=${encodedMsg}`;
  }, [countryCode, waCleanPhone, customMessage]);

  const waQrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(waLink)}&color=000000&bgcolor=ffffff`;
  }, [waLink]);

  // ================= 2. POMODORO TIMER =================
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(sec => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
      if (timerMode === 'work') {
        setSessionsCompleted(c => c + 1);
        setTimerMode('shortBreak');
        setSecondsRemaining(5 * 60);
      } else {
        setTimerMode('work');
        setSecondsRemaining(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, timerMode]);

  const setMode = (m: 'work' | 'shortBreak' | 'longBreak') => {
    setTimerMode(m);
    setIsActive(false);
    if (m === 'work') setSecondsRemaining(25 * 60);
    if (m === 'shortBreak') setSecondsRemaining(5 * 60);
    if (m === 'longBreak') setSecondsRemaining(15 * 60);
  };

  const timerMin = Math.floor(secondsRemaining / 60);
  const timerSec = secondsRemaining % 60;
  const formattedTimer = `${timerMin.toString().padStart(2, '0')}:${timerSec.toString().padStart(2, '0')}`;

  // ================= 3. UPI QR LINK =================
  const upiDeepLink = useMemo(() => {
    // Standard NPCI UPI URI Scheme: upi://pay?pa=upiId&pn=PayeeName&am=Amount&tn=Note&cu=INR
    const pnEncoded = encodeURIComponent(payeeName);
    const tnEncoded = encodeURIComponent(transactionNote);
    return `upi://pay?pa=${upiId}&pn=${pnEncoded}&am=${payAmount}&tn=${tnEncoded}&cu=INR`;
  }, [upiId, payeeName, payAmount, transactionNote]);

  const upiQrImageUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}&color=000000&bgcolor=ffffff`;
  }, [upiDeepLink]);

  return (
    <div className="space-y-8">
      {/* ================= 1. WHATSAPP DIRECT LINK ================= */}
      {slug === 'whatsapp-direct-link-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Direct WhatsApp Click-to-Chat</h3>
                <p className="text-xs text-slate-400">Message anyone without saving their phone number</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-1">
                  <label className="block text-slate-400 mb-1">Code</label>
                  <input
                    type="text"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white font-mono text-center"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-slate-400 mb-1">10-Digit Mobile Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Pre-filled Custom Message</label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open in WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(waLink, 'wa-link')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1"
                >
                  {copiedId === 'wa-link' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  Copy
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Scan QR to Start Chatting
              </span>

              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <img
                  src={waQrUrl}
                  alt="WhatsApp Direct QR Code"
                  className="w-48 h-48 rounded-lg"
                  loading="lazy"
                />
              </div>

              <div className="text-xs text-slate-300 font-mono">
                wa.me/+{countryCode}{waCleanPhone}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. POMODORO FOCUS TIMER ================= */}
      {slug === 'pomodoro-focus-timer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 lg:col-start-3 bg-slate-900/60 backdrop-blur-md p-8 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-6">
            <div className="flex items-center gap-2">
              <Timer className="w-6 h-6 text-rose-400" />
              <h3 className="text-lg font-bold text-white">Pomodoro Focus Timer</h3>
            </div>

            <div className="flex gap-2">
              {[
                { id: 'work', label: 'Work (25 min)' },
                { id: 'shortBreak', label: 'Short Break (5 min)' },
                { id: 'longBreak', label: 'Long Break (15 min)' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    timerMode === opt.id ? 'bg-rose-500/20 border-rose-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Huge timer display */}
            <div className="text-6xl sm:text-8xl font-mono font-extrabold text-white tracking-widest my-4 select-none">
              {formattedTimer}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(a => !a)}
                className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
                  isActive ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-rose-500 hover:bg-rose-600 text-white'
                }`}
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {isActive ? 'Pause' : 'Start Focus'}
              </button>
              <button
                type="button"
                onClick={() => setMode(timerMode)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700"
                title="Reset"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-400 pt-3 border-t border-slate-800 w-full flex justify-between">
              <span>Completed Sessions: <strong className="text-white">{sessionsCompleted}</strong></span>
              <span>Daily Goal: <strong className="text-rose-400">8 Sessions</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. UPI QR PAYMENT ================= */}
      {slug === 'upi-qr-payment-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">UPI Scan-to-Pay QR Generator</h3>
                <p className="text-xs text-slate-400">Create instant payment QR codes for GPay, PhonePe, Paytm</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Your VPA / UPI ID (e.g. mobile@upi)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Payee Business / Name</label>
                  <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Amount to Request (₹)</label>
                  <input
                    type="number" inputMode="decimal" pattern="[0-9]*"
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Transaction Note</label>
                <input
                  type="text"
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(upiDeepLink, 'upi-link')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5"
              >
                {copiedId === 'upi-link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy UPI Payment Deep Link
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Scan with any UPI App to Pay
              </span>

              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <img
                  src={upiQrImageUrl}
                  alt={`UPI QR Code for ${upiId}`}
                  className="w-48 h-48 rounded-lg"
                  loading="lazy"
                />
              </div>

              <div className="text-xs text-slate-300">
                <div className="text-xl font-bold font-mono text-white mb-1">{formatINR(payAmount)}</div>
                <span className="text-slate-400">{payeeName} ({upiId})</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
