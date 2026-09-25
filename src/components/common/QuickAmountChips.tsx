import React from 'react';
import { triggerHapticFeedback } from '../../utils/haptics';
import { Plus, RotateCcw } from 'lucide-react';

interface QuickAmountChipsProps {
  currentValue: number;
  onValueChange?: (newValue: number) => void;
  onChange?: (newValue: number) => void;
  min?: number;
  max?: number;
  chips?: { label: string; value: number }[];
  defaultValue?: number;
  resetValue?: number;
}

const DEFAULT_INDIAN_CHIPS = [
  { label: '+10K', value: 10000 },
  { label: '+50K', value: 50000 },
  { label: '+1L', value: 100000 },
  { label: '+5L', value: 500000 },
  { label: '+10L', value: 1000000 },
];

export const QuickAmountChips: React.FC<QuickAmountChipsProps> = ({
  currentValue,
  onValueChange,
  onChange,
  max = 100000000,
  chips = DEFAULT_INDIAN_CHIPS,
  defaultValue = 0,
  resetValue,
}) => {
  const handleChange = onValueChange || onChange || (() => {});
  const resetTarget = resetValue !== undefined ? resetValue : defaultValue;

  const handleAdd = (amount: number) => {
    triggerHapticFeedback('light');
    const next = Math.min(max, (currentValue || 0) + amount);
    handleChange(next);
  };

  const handleReset = () => {
    triggerHapticFeedback('medium');
    handleChange(resetTarget);
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar select-none">
      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 shrink-0 mr-0.5">
        Quick +:
      </span>
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => handleAdd(chip.value)}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-accent/10 hover:text-accent border border-neutral-200/80 dark:border-neutral-700/80 active:scale-95 transition-all shrink-0 flex items-center gap-0.5 shadow-2xs"
        >
          <Plus className="w-2.5 h-2.5 opacity-70" />
          <span>{chip.label}</span>
        </button>
      ))}

      {resetTarget > 0 && currentValue !== resetTarget && (
        <button
          type="button"
          onClick={handleReset}
          title="Reset to default"
          className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shrink-0 active:scale-95"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
