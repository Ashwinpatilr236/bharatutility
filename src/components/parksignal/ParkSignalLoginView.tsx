import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parkSignalService } from '../../services/parkSignalService';
import { ParkSignalLogo } from './ParkSignalLogo';
import { Lock, Mail, ArrowRight, AlertCircle, KeyRound, Check, ShieldCheck } from 'lucide-react';

export const ParkSignalLoginView: React.FC = () => {
  const { navigateToParkSignal, showToast } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await parkSignalService.login(email.trim(), password);
      setLoading(false);

      if (res.success) {
        showToast('Welcome back to ParkSignal!', 'success');
        navigateToParkSignal('dashboard');
      } else {
        const rawErr = res.error || 'Invalid email or password.';
        const cleanErr = rawErr.includes('<!DOCTYPE') || rawErr.includes('not valid JSON')
          ? 'Network or server timeout. Please try again or check connection.'
          : rawErr;
        setError(cleanErr);
      }
    } catch (err: any) {
      setLoading(false);
      setError('Could not connect to authentication service. Please try again.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotError(null);
    setForgotLoading(true);
    try {
      const res = await parkSignalService.requestPasswordReset(forgotEmail.trim());
      setForgotLoading(false);
      if (res.success) {
        setForgotSubmitted(true);
        showToast('Password reset link sent! Check your inbox or spam.', 'info');
      } else {
        setForgotError(res.error || 'Could not send reset email. Please try again.');
      }
    } catch {
      setForgotLoading(false);
      setForgotError('Network error while sending reset link. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-14 space-y-6">
      <div className="text-center space-y-3">
        {/* Official Brand Logo */}
        <div className="flex justify-center mb-1">
          <ParkSignalLogo variant="full" height={44} className="hover:opacity-95 transition-opacity" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          ParkSignal Owner Login
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
          Sign In to Dashboard
        </h1>
        <p className="text-xs text-neutral-500">
          Access your registered vehicles, QR stickers, and Telegram settings
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-5">
        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Log In to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <p className="text-xs text-neutral-500">
            Don't have a ParkSignal account yet?{' '}
            <button
              onClick={() => navigateToParkSignal('register')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 max-w-sm w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Reset Password
                </h3>
                <p className="text-[11px] text-neutral-500">
                  Enter your registered email address
                </p>
              </div>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Reset link sent if account exists!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-700/90 dark:text-emerald-300/90">
                    Since we provide ParkSignal as a <strong>100% free service</strong>, the email will arrive from{' '}
                    <strong className="font-mono">Supabase Auth (noreply@mail.app.supabase.io)</strong> with subject{' '}
                    <strong>"Reset your password"</strong>. Please also check your Spam/Promotions folder if not seen in Inbox.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setShowForgotModal(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                {forgotError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300">
                    {forgotError}
                  </div>
                )}
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong>Heads up:</strong> Because we try to keep ParkSignal <strong>100% free</strong> for everyone, you will receive an email from{' '}
                  <span className="font-mono font-semibold">Supabase Auth (noreply@mail.app.supabase.io)</span> titled{' '}
                  <strong>"Reset your password"</strong> (powered by Supabase). That email is genuine!
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotError(null);
                      setShowForgotModal(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
