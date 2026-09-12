import React, { useState, useRef } from 'react';
import { 
  ImageIcon, Upload, Download, Sliders, CheckCircle2, 
  Trash2, RefreshCw, FileCheck, Layers, Sparkles
} from 'lucide-react';

interface ConvertedImageItem {
  id: string;
  originalName: string;
  originalSize: number;
  originalFormat: string;
  dataUrl: string;
  newSize: number;
  newFormat: 'png' | 'webp' | 'jpeg';
  width: number;
  height: number;
}

interface ImageConverterSuiteCalculatorProps {
  onResultChange?: (result: string) => void;
}

export const ImageConverterSuiteCalculator: React.FC<ImageConverterSuiteCalculatorProps> = ({ onResultChange }) => {
  const [targetFormat, setTargetFormat] = useState<'webp' | 'png' | 'jpeg'>('webp');
  const [quality, setQuality] = useState<number>(85);
  const [convertedImages, setConvertedImages] = useState<ConvertedImageItem[]>([]);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsConverting(true);
    const newItems: ConvertedImageItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const item = await convertSingleImage(file, targetFormat, quality);
      newItems.push(item);
    }

    setConvertedImages(prev => [...newItems, ...prev]);
    setIsConverting(false);

    if (onResultChange) {
      onResultChange(`Batch Converted ${newItems.length} image(s) to ${targetFormat.toUpperCase()}`);
    }
  };

  const convertSingleImage = (file: File, format: 'webp' | 'png' | 'jpeg', q: number): Promise<ConvertedImageItem> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            if (format === 'jpeg') {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);
          }

          const mime = format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : 'image/png';
          const dataUrl = canvas.toDataURL(mime, q / 100);
          const byteLength = Math.round((dataUrl.length * 3) / 4);

          resolve({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            originalName: file.name,
            originalSize: file.size,
            originalFormat: file.type.replace('image/', '').toUpperCase(),
            dataUrl,
            newSize: byteLength,
            newFormat: format,
            width: img.width,
            height: img.height
          });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDownloadItem = (item: ConvertedImageItem) => {
    const link = document.createElement('a');
    const baseName = item.originalName.replace(/\.[^/.]+$/, '');
    link.download = `${baseName}.${item.newFormat}`;
    link.href = item.dataUrl;
    link.click();
  };

  const handleDownloadAll = () => {
    convertedImages.forEach(item => {
      handleDownloadItem(item);
    });
  };

  const handleRemove = (id: string) => {
    setConvertedImages(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Batch Image Format Multi-Converter</h3>
              <p className="text-xs text-slate-400">Convert JPG, PNG, WebP, and BMP images locally in browser with zero size loss</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              onChange={handleFilesSelected}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Images (Batch)
            </button>
          </div>
        </div>
      </div>

      {/* Conversion Settings Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Target Format */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Select Output Target Format
          </label>
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {(['webp', 'png', 'jpeg'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTargetFormat(fmt)}
                className={`py-2 text-xs font-bold rounded-lg uppercase transition-all ${
                  targetFormat === fmt
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {fmt === 'jpeg' ? 'JPG / JPEG' : fmt}
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Compression Quality: <span className="text-indigo-400 font-mono font-bold">{quality}%</span>
            </label>
            <span className="text-[11px] text-slate-400">
              {quality >= 85 ? 'High Fidelity' : 'Optimized Size'}
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Converted Files Grid */}
      {convertedImages.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Converted Images ({convertedImages.length})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadAll}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download All ({convertedImages.length})
              </button>
              <button
                onClick={() => setConvertedImages([])}
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                title="Clear All"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {convertedImages.map((item) => {
              const sizeDiffPct = Math.round(((item.newSize - item.originalSize) / item.originalSize) * 100);
              const isSmaller = item.newSize < item.originalSize;

              return (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      <img src={item.dataUrl} alt={item.originalName} className="max-h-full max-w-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white truncate">{item.originalName}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {item.width} x {item.height} px
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                          {item.originalFormat} ➔ {item.newFormat}
                        </span>
                        <span className={`text-[10px] font-bold font-mono ${isSmaller ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {(item.newSize / 1024).toFixed(1)} KB ({sizeDiffPct > 0 ? `+${sizeDiffPct}%` : `${sizeDiffPct}%`})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <button
                      onClick={() => handleDownloadItem(item)}
                      className="flex-1 bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
