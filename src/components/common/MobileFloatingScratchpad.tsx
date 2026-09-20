import React, { useState } from 'react';
import { Calculator, X, Delete, RotateCcw } from 'lucide-react';
import { triggerHapticFeedback } from '../../utils/haptics';

export const MobileFloatingScratchpad: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleDigit = (digit: string) => {
    triggerHapticFeedback('light');
    if (display === '0' || resetNext) {
      setDisplay(digit);
      setResetNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOp = (op: string) => {
    triggerHapticFeedback('light');
    const current = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(current);
    } else if (operation) {
      const result = calculate(prevVal, current, operation);
      setPrevVal(result);
      setDisplay(String(result));
    }
    setOperation(op);
    setResetNext(true);
  };

  const calculate = (a: number, b: number, op: string) => {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b !== 0 ? a / b : 0;
      default:
        return b;
    }
  };

  const handleEquals = () => {
    triggerHapticFeedback('medium');
    if (prevVal !== null && operation) {
      const result = calculate(prevVal, parseFloat(display), operation);
      setDisplay(String(result));
      setPrevVal(null);
      setOperation(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    triggerHapticFeedback('medium');
    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
    setResetNext(false);
  };

  return (
    <div className="md:hidden">
      {/* Floating Toggle Pill */}
      {!isOpen && (
        <button
          onClick={() => {
            triggerHapticFeedback('light');
            setIsOpen(true);
          }}
          aria-label="Open Scratchpad Calculator"
          title="Quick Scratchpad"
          className="fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-accent text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center border-2 border-white dark:border-neutral-900 active:scale-90 transition-transform"
        >
          <Calculator className="w-5 h-5" />
        </button>
      )}

      {/* Mini Scratchpad Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-2xs p-3">
          <div className="w-full max-w-xs bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-neutral-900 dark:text-white font-display">
                  Quick Scratchpad
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display */}
            <div className="bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl p-3 text-right">
              <span className="text-[10px] text-neutral-400 font-mono block h-3">
                {prevVal !== null ? `${prevVal} ${operation || ''}` : ''}
              </span>
              <span className="text-2xl font-black font-mono text-neutral-900 dark:text-white truncate block">
                {display}
              </span>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-1.5 text-sm font-bold font-mono">
              <button
                onClick={handleClear}
                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 active:scale-95 transition-all"
              >
                C
              </button>
              <button
                onClick={() => handleOp('÷')}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-accent active:scale-95 transition-all"
              >
                ÷
              </button>
              <button
                onClick={() => handleOp('×')}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-accent active:scale-95 transition-all"
              >
                ×
              </button>
              <button
                onClick={() => handleOp('-')}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-accent active:scale-95 transition-all"
              >
                -
              </button>

              {['7', '8', '9'].map(d => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={() => handleOp('+')}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-accent active:scale-95 transition-all"
              >
                +
              </button>

              {['4', '5', '6'].map(d => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}
              <button
                onClick={handleEquals}
                rowSpan={2}
                className="p-2.5 rounded-xl bg-accent text-white font-black active:scale-95 transition-all row-span-2 flex items-center justify-center text-base"
              >
                =
              </button>

              {['1', '2', '3'].map(d => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}

              <button
                onClick={() => handleDigit('0')}
                className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 col-span-2 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                onClick={() => handleDigit('.')}
                className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 active:scale-95 transition-all"
              >
                .
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
