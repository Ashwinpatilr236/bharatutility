import React, { useState, useEffect } from 'react';
import { Wifi, Download, Database, Tv, Radio, HelpCircle, Check, ArrowRight } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export type TechnologyMode = 'download' | 'data-usage' | 'storage' | 'screen' | 'wifi' | 'dth';

interface TechnologySuiteCalculatorProps {
  initialMode?: TechnologyMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const TechnologySuiteCalculator: React.FC<TechnologySuiteCalculatorProps> = ({
  initialMode = 'download',
  onResultChange,
}) => {
  const [mode, setMode] = useState<TechnologyMode>(initialMode);

  // Download State
  const [fileSizeGB, setFileSizeGB] = useState<number>(10);
  const [speedMbps, setSpeedMbps] = useState<number>(100);

  // Data Usage State
  const [dailyStreamingHours, setDailyStreamingHours] = useState<number>(3);
  const [videoQuality, setVideoQuality] = useState<'480p' | '1080p' | '4k'>('1080p');

  // Storage Converter State
  const [storageVal, setStorageVal] = useState<number>(512);
  const [fromStorageUnit, setFromStorageUnit] = useState<'GB' | 'TB' | 'MB'>('GB');

  // TV Viewing Distance State
  const [screenSizeInches, setScreenSizeInches] = useState<number>(55);
  const [tvResolution, setTvResolution] = useState<'4k' | '1080p'>('4k');

  // DTH Channel Cost State
  const [selectedChannels, setSelectedChannels] = useState<number>(35);
  const [hasHdChannels, setHasHdChannels] = useState<boolean>(true);

  // Calculations:
  // 1. Download Time
  const totalMB = fileSizeGB * 1024;
  const speedMBps = speedMbps / 8; // MB per sec
  const totalSeconds = speedMBps > 0 ? totalMB / speedMBps : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  const downloadTimeString =
    hours > 0 ? `${hours}h ${remMinutes}m ${seconds}s` : `${minutes}m ${seconds}s`;

  // 2. Data Usage
  const gbPerHour = videoQuality === '4k' ? 7 : videoQuality === '1080p' ? 1.5 : 0.6;
  const dailyDataGB = (dailyStreamingHours * gbPerHour).toFixed(1);
  const monthlyDataGB = (dailyStreamingHours * gbPerHour * 30).toFixed(0);

  // 3. Storage Conversions
  let totalBytes = storageVal;
  if (fromStorageUnit === 'TB') totalBytes = storageVal * 1024 * 1024 * 1024 * 1024;
  if (fromStorageUnit === 'GB') totalBytes = storageVal * 1024 * 1024 * 1024;
  if (fromStorageUnit === 'MB') totalBytes = storageVal * 1024 * 1024;
  const convertedMB = (totalBytes / (1024 * 1024)).toFixed(0);
  const convertedGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2);
  const convertedTB = (totalBytes / (1024 * 1024 * 1024 * 1024)).toFixed(3);

  // 4. TV Distance (THX/SMPTE recommendation)
  const minDistanceFeet = ((screenSizeInches * 1.2) / 12).toFixed(1);
  const maxDistanceFeet = ((screenSizeInches * 1.6) / 12).toFixed(1);
  const idealDistanceMeters = (((Number(minDistanceFeet) + Number(maxDistanceFeet)) / 2) * 0.3048).toFixed(1);

  // 5. DTH Bill Estimate (TRAI NTO 2.0 rules: NCF ₹130 + 18% GST = ₹153 base + Pay channels)
  const baseNcf = 153.4;
  const avgChannelCost = hasHdChannels ? 12 : 7;
  const contentCost = selectedChannels * avgChannelCost;
  const totalDthEstimate = Math.round(baseNcf + contentCost);

  useEffect(() => {
    if (!onResultChange) return;

    if (mode === 'download') {
      onResultChange(`Download Time: ${downloadTimeString} for ${fileSizeGB}GB @ ${speedMbps} Mbps`, {
        fileSizeGB,
        speedMbps,
        downloadTimeString,
      });
    } else if (mode === 'data-usage') {
      onResultChange(`Estimated Monthly Data: ${monthlyDataGB} GB (${dailyDataGB} GB/day)`, {
        dailyStreamingHours,
        videoQuality,
        monthlyDataGB,
      });
    } else if (mode === 'storage') {
      onResultChange(`${storageVal} ${fromStorageUnit} = ${convertedGB} GB (${convertedMB} MB)`, {
        storageVal,
        fromStorageUnit,
        convertedGB,
      });
    } else if (mode === 'screen') {
      onResultChange(`Recommended TV Distance: ${minDistanceFeet} - ${maxDistanceFeet} feet (${idealDistanceMeters}m)`, {
        screenSizeInches,
        minDistanceFeet,
        maxDistanceFeet,
      });
    } else if (mode === 'dth') {
      onResultChange(`Estimated TRAI DTH Bill: ${formatINR(totalDthEstimate)}/mo (${selectedChannels} channels)`, {
        selectedChannels,
        totalDthEstimate,
      });
    }
  }, [
    mode,
    fileSizeGB,
    speedMbps,
    dailyStreamingHours,
    videoQuality,
    storageVal,
    fromStorageUnit,
    screenSizeInches,
    selectedChannels,
    hasHdChannels,
  ]);

  return (
    <div className="w-full space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { id: 'download', label: 'Download Time' },
          { id: 'data-usage', label: 'Data Usage' },
          { id: 'storage', label: 'Storage Converter' },
          { id: 'screen', label: 'TV Viewing Distance' },
          { id: 'dth', label: 'TRAI DTH Bill' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as TechnologyMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              mode === tab.id
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === 'download' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                File Size (GB)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={fileSizeGB || ''}
                onChange={(e) => setFileSizeGB(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Internet Speed (Mbps)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={speedMbps || ''}
                onChange={(e) => setSpeedMbps(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Estimated Duration</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Transfer Speed:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">~{speedMBps.toFixed(1)} MB/sec</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Completion Time:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{downloadTimeString}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'data-usage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Daily Video Streaming (Hours)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={dailyStreamingHours || ''}
                onChange={(e) => setDailyStreamingHours(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Resolution Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['480p', '1080p', '4k'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setVideoQuality(q)}
                    className={`py-2 rounded-xl text-xs font-bold ${
                      videoQuality === q
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {q.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Plan Requirement</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Daily Data Usage:</span>
                <span className="text-base font-extrabold text-neutral-900 dark:text-white">{dailyDataGB} GB/day</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Monthly Broadband Need:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{monthlyDataGB} GB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'screen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                TV Screen Size (Inches Diagonal)
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={screenSizeInches || ''}
                onChange={(e) => setScreenSizeInches(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Optimum Seating Distance</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Recommended Range:</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{minDistanceFeet} - {maxDistanceFeet} Feet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">In Meters:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">~{idealDistanceMeters} Meters</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'dth' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Number of Pay Channels Selected
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={selectedChannels || ''}
                onChange={(e) => setSelectedChannels(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hdCheck"
                checked={hasHdChannels}
                onChange={(e) => setHasHdChannels(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <label htmlFor="hdCheck" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Includes HD (High Definition) Channels
              </label>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">TRAI Monthly Bill Estimate</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Mandatory NCF + 18% GST:</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">₹153.40</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Total Monthly Cost:</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(totalDthEstimate)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'storage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Storage Size
              </label>
              <div className="flex gap-2">
                <input
                  type="number" inputMode="decimal" pattern="[0-9]*"
                  value={storageVal || ''}
                  onChange={(e) => setStorageVal(Number(e.target.value))}
                  className="flex-1 px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
                />
                <select
                  value={fromStorageUnit}
                  onChange={(e) => setFromStorageUnit(e.target.value as any)}
                  className="px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white"
                >
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Storage Equivalents</div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Megabytes (MB):</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{convertedMB} MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Gigabytes (GB):</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{convertedGB} GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-600 dark:text-neutral-400">Terabytes (TB):</span>
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{convertedTB} TB</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
