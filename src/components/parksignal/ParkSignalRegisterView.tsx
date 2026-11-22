import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parkSignalService } from '../../services/parkSignalService';
import { ParkSignalLogo } from './ParkSignalLogo';
import { Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export const ParkSignalRegisterView: React.FC = () => {
  const { navigateToParkSignal, showToast } = useApp();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept the Privacy Policy & Terms of Service.');
      return;
    }

    setLoading(true);
    try {
      const res = await parkSignalService.register(fullName.trim(), email.trim(), password);
      setLoading(false);

      if (res.success) {
        showToast('Account created successfully! Welcome to ParkSignal.', 'success');
        navigateToParkSignal('dashboard');
      } else {
        const rawErr = res.error || 'Failed to create account.';
        const cleanErr = rawErr.includes('<!DOCTYPE') || rawErr.includes('not valid JSON')
          ? 'Network or server timeout. Please try again or check connection.'
          : rawErr;
        setError(cleanErr);
      }
    } catch (err: any) {
      setLoading(false);
      setError('Something went wrong during account creation. Please try again.');
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
          ParkSignal Owner Account
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-neutral-900 dark:text-white">
          Create Permanent Account
        </h1>
        <p className="text-xs text-neutral-500">
          Manage your vehicles, QR stickers, and Telegram alerts anytime
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
              Full Name (Kept strictly private)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

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
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Password (Min 8 characters)
            </label>
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

          <div>
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="terms" className="text-xs text-neutral-600 dark:text-neutral-400 leading-normal">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => navigateToParkSignal('privacy')}
                className="text-indigo-600 dark:text-indigo-400 font-bold underline hover:text-indigo-700"
              >
                Privacy Policy
              </button>{' '}
              and confirm my contact details will never be exposed to public QR scanners.
            </label>
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
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <p className="text-xs text-neutral-500">
            Already have an owner account?{' '}
            <button
              onClick={() => navigateToParkSignal('login')}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Log in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
