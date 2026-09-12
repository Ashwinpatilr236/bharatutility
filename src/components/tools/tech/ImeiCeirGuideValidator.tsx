import React, { useState, useMemo } from 'react';
import { Smartphone, CheckCircle2, XCircle, ShieldCheck, ShieldAlert, ExternalLink, Info, Search } from 'lucide-react';

export const ImeiCeirGuideValidator: React.FC = () => {
  const [imeiInput, setImeiInput] = useState<string>('867942041234567');

  // Luhn Algorithm (Mod 10) Checksum for 15-digit IMEI
  const validation = useMemo(() => {
    const cleanImei = imeiInput.replace(/\D/g, '');
    if (cleanImei.length !== 15) {
      return {
        isValid: false,
        isLengthValid: false,
        cleanImei,
        tac: cleanImei.slice(0, 8),
        serial: cleanImei.slice(8, 14),
        checkDigit: cleanImei.slice(14),
      };
    }

    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let digit = parseInt(cleanImei.charAt(i), 10);
      if (i % 2 !== 0) {
        digit *= 2;
        if (digit > 9) digit = (digit % 10) + 1;
      }
      sum += digit;
    }

    const isValid = sum % 10 === 0;

    return {
      isValid,
      isLengthValid: true,
      cleanImei,
      tac: cleanImei.slice(0, 8),
      serial: cleanImei.slice(8, 14),
      checkDigit: cleanImei.slice(14),
    };
  }, [imeiInput]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-teal-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/20 text-teal-300 rounded-2xl">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              IMEI Number Validator & CEIR Lost Phone Guide
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              15-Digit Luhn Checksum Verification, TAC Breakdown & Govt Sanchar Saathi CEIR Portal Guide
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-teal-600" />
            Enter 15-Digit IMEI Number
          </h3>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Dial *#06# on any phone to get IMEI
              </label>
              <span className="text-xs text-slate-400">{validation.cleanImei.length}/15 Digits</span>
            </div>
            <input
              type="text"
              maxLength={18}
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              placeholder="e.g. 867942041234567"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">TAC (Type Code)</span>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                {validation.tac || '--------'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Serial Number</span>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                {validation.serial || '------'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Luhn Check Digit</span>
              <div className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400 mt-1">
                {validation.checkDigit || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Status & CEIR Guide */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Luhn Algorithm Result
            </span>
            {validation.isValid ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" /> Valid IMEI Checksum
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                <XCircle className="w-4 h-4" /> Invalid / Incomplete
              </span>
            )}
          </div>

          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              DoT Sanchar Saathi (CEIR) Portal
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              If your phone is lost or stolen anywhere in India, you can block its IMEI instantly across all networks (Jio, Airtel, Vi, BSNL) using the Govt CEIR portal.
            </p>
          </div>

          <a
            href="https://ceir.sancharsaathi.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
          >
            Open Official CEIR Sanchar Saathi Portal <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-amber-400">Second-Hand Buying Tip:</div>
            <p>Always check `KYM` (Know Your Mobile) on Sanchar Saathi before paying for a used phone on OLX/Cashify.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
