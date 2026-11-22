import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, EyeOff, Bot, Database, Trash2, ArrowLeft } from 'lucide-react';

export const ParkSignalPrivacyView: React.FC = () => {
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
          ParkSignal Privacy Architecture & Policy
        </h1>
        <p className="text-sm text-neutral-500">
          "Your Vehicle. Your Privacy." • How BharatUtility protects vehicle owners and scanners
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Zero Owner Contact Exposure
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            When someone scans your vehicle QR sticker, they will <strong>never</strong> see your phone number, real name, email, or personal identity. All notifications are relayed through the official Telegram bot <strong>@ParkSignal_bot</strong>.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Zero Scanner Registration
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            The person scanning your vehicle QR sticker is not asked for their phone number, email, or Telegram account. They can send an instant alert or optional voice note in seconds right from their mobile browser without downloading any apps.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Secure Telegram Account Linking
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Account linking uses single-use, 10-minute expiring cryptographic tokens. Telegram chat IDs are stored in restricted edge databases and are never accessible via public APIs or rendered in client-side HTML code.
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 space-y-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Ephemeral Audio & Data Purging
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Voice messages sent via the scanner are streamed in memory directly to Telegram Bot API's <code>sendVoice</code> and immediately discarded. No audio recordings are permanently stored on server disks or databases.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 space-y-4 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-600" />
          Our 6 Core Privacy Principles
        </h3>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>No Public Registry:</strong> There is no searchable public directory linking vehicle plates to owners or phone numbers.</li>
          <li><strong>Cryptographic QR Tokens:</strong> QR codes use high-entropy random identifiers rather than sequential database IDs, making them impossible to enumerate or scrape.</li>
          <li><strong>Vehicle-Specific Customization:</strong> Vehicle owners control exactly which alerts can be sent, whether custom text is allowed, and whether voice messages are enabled.</li>
          <li><strong>Plate Privacy Masking:</strong> Owners can choose to mask their registration plate on the public scanner page (e.g. <code>MH 12 •••• 1234</code>).</li>
          <li><strong>Spam & Rate Limiting:</strong> Both IP-based and vehicle-based sliding-window rate limiters prevent harassment, message flooding, or abuse.</li>
          <li><strong>Account Deletion:</strong> Owners can permanently delete their account anytime from the dashboard, executing a complete cascade deletion of all registered vehicles, QR tokens, and alert history.</li>
        </ol>
      </div>
    </div>
  );
};
