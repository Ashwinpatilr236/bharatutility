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
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-neutral-200/90 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 transition-all shadow-xs group"
      >
        <div
          className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/20 shadow-xs shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: ACCENT_OPTIONS.find(a => a.id === accent)?.hex }}
        />
        <div className="relative w-4 h-4 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400 transition-all duration-300 transform rotate-0 scale-100" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500 transition-all duration-300 transform rotate-0 scale-100" />
          ) : (
            <Laptop className="w-4 h-4 text-neutral-400 transition-all duration-300 transform rotate-0 scale-100" />
          )}
        </div>
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
