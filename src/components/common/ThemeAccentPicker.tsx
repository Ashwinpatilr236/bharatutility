import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon, Laptop, Palette, Check } from 'lucide-react';
import { AccentColor } from '../../types';

const ACCENT_OPTIONS: { id: AccentColor; name: string; hex: string }[] = [
  { id: 'indigo', name: 'Indigo', hex: '#6366f1' },
  { id: 'emerald', name: 'Emerald', hex: '#10b981' },
  { id: 'purple', name: 'Purple', hex: '#a855f7' },
  { id: 'amber', name: 'Amber', hex: '#f59e0b' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e' },
  { id: 'cyan', name: 'Cyan', hex: '#06b6d4' },
];

export const ThemeAccentPicker: React.FC = () => {
  const { theme, setTheme, accent, setAccent } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="theme-accent-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customize appearance and theme"
        className="flex items-center gap-1.5 p-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        <div
          className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 shadow-xs"
          style={{ backgroundColor: ACCENT_OPTIONS.find(a => a.id === accent)?.hex }}
        />
        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Theme Mode
            </span>
            <div className="grid grid-cols-3 gap-1.5 mt-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/70 rounded-xl">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'system'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5 text-neutral-400" />
                Auto
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Accent Palette
              </span>
              <span className="text-xs font-medium capitalize text-neutral-600 dark:text-neutral-400">
                {accent}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {ACCENT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setAccent(opt.id)}
                  title={opt.name}
                  aria-label={`Select ${opt.name} accent`}
                  className="group relative flex items-center justify-center h-8 rounded-lg transition-transform hover:scale-105 active:scale-95 border border-black/5 dark:border-white/5"
                  style={{ backgroundColor: opt.hex }}
                >
                  {accent === opt.id && (
                    <Check className="w-4 h-4 text-white drop-shadow-sm stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
