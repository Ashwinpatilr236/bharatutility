import React, { useState } from 'react';
import { Tool } from '../../../types';
import { ToolPageLayout } from '../../tools/ToolPageLayout';
import {
  Monitor,
  Tablet,
  Smartphone,
  X,
  ExternalLink,
  Shield,
  Eye
} from 'lucide-react';

interface AdminToolPreviewModalProps {
  tool: Tool;
  onClose: () => void;
  onOpenLive?: () => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const AdminToolPreviewModal: React.FC<AdminToolPreviewModalProps> = ({
  tool,
  onClose,
  onOpenLive,
}) => {
  const [device, setDevice] = useState<DeviceMode>('desktop');

  const containerWidthClass =
    device === 'mobile'
      ? 'w-[375px] max-h-[85vh]'
      : device === 'tablet'
      ? 'w-[768px] max-h-[85vh]'
      : 'w-full max-h-[88vh]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[96vh] flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
        {/* Preview Toolbar */}
        <div className="h-14 px-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Tool Preview
              </span>
            </div>
            <span className="hidden sm:inline text-xs text-neutral-400 border-l border-neutral-800 pl-3">
              {tool.name}
            </span>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                device === 'desktop' ? 'bg-accent text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Desktop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                device === 'tablet' ? 'bg-accent text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                device === 'mobile' ? 'bg-accent text-white shadow-xs' : 'text-neutral-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Mobile</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onOpenLive && (
              <button
                onClick={onOpenLive}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Open Public Page"
              >
                <ExternalLink className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">Live URL</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas */}
        <div className="flex-1 bg-neutral-950/80 p-4 overflow-y-auto flex items-start justify-center">
          <div
            className={`transition-all duration-300 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-y-auto ${containerWidthClass}`}
          >
            {/* Embedded Live Public Tool Layout */}
            <div className="p-3 sm:p-6">
              <ToolPageLayout tool={tool} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
