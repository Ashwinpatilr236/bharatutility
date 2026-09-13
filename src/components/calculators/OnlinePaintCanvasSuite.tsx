import React, { useState, useRef, useEffect } from 'react';
import {
  Paintbrush,
  Pen,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Minus,
  MoveRight,
  Type,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Copy,
  Check,
  Grid,
  Sun,
  Moon,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

type ToolMode = 'pen' | 'brush' | 'highlighter' | 'eraser' | 'line' | 'arrow' | 'rect' | 'circle' | 'text';

const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b', // Slate
  '#78350f'  // Brown
];

export const OnlinePaintCanvasSuite: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<ToolMode>('brush');
  const [color, setColor] = useState<string>('#3b82f6');
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [canvasBg, setCanvasBg] = useState<'white' | 'dark' | 'grid'>('white');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);
  const [copied, setCopied] = useState(false);
  
  // History for Undo / Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set resolution to 1200x700
    canvas.width = 1200;
    canvas.height = 700;

    // Default white fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state to history
    const initial = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initial]);
    setHistoryIndex(0);
  }, []);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentImg);
    if (newHistory.length > 20) newHistory.shift(); // keep max 20 states
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = canvasBg === 'dark' ? '#171717' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);

    // Save snapshot for shape previews
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = canvasBg === 'dark' ? '#171717' : '#ffffff';
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = color;
      ctx.globalAlpha = 1.0;
    }

    if (tool === 'pen' || tool === 'brush' || tool === 'eraser' || tool === 'highlighter') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (tool === 'pen' || tool === 'brush' || tool === 'eraser' || tool === 'highlighter') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (snapshot) {
      // Shape Preview: Restore snapshot then draw fresh preview
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;

      if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === 'arrow') {
        const headlen = 15;
        const dx = coords.x - startPos.x;
        const dy = coords.y - startPos.y;
        const angle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.lineTo(coords.x - headlen * Math.cos(angle - Math.PI / 6), coords.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(coords.x - headlen * Math.cos(angle + Math.PI / 6), coords.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (tool === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(coords.x - startPos.x, 2) + Math.pow(coords.y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.globalAlpha = 1.0; // reset
      }
    }
    saveState();
  };

  // Image Upload on Canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw image centered maintaining aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        saveState();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Export as PNG / JPG
  const handleDownload = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `bharatutility_drawing_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = canvas.toDataURL(`image/${format}`, 0.95);
    link.click();
  };

  // Copy Canvas Image to Clipboard
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async blob => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          alert('Could not copy image to clipboard in this browser.');
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Tool Selectors */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 font-semibold transition-all ${
              tool === 'brush' ? 'bg-accent text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
            title="Smooth Brush"
          >
            <Paintbrush className="w-4 h-4" />
            <span className="hidden sm:inline">Brush</span>
          </button>

          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 font-semibold transition-all ${
              tool === 'pen' ? 'bg-accent text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
            title="Fine Pencil"
          >
            <Pen className="w-4 h-4" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 font-semibold transition-all ${
              tool === 'highlighter' ? 'bg-accent text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
            title="Translucent Highlighter / Marker"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline">Highlight</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 font-semibold transition-all ${
              tool === 'eraser' ? 'bg-accent text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Eraser</span>
          </button>

          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700 mx-1 hidden sm:block" />

          {/* Shapes */}
          <button
            onClick={() => setTool('line')}
            className={`p-2 rounded-xl text-xs transition-all ${
              tool === 'line' ? 'bg-accent text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
            title="Straight Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('arrow')}
            className={`p-2 rounded-xl text-xs transition-all ${
              tool === 'arrow' ? 'bg-accent text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
            title="Arrow Pointer"
          >
            <MoveRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('rect')}
            className={`p-2 rounded-xl text-xs transition-all ${
              tool === 'rect' ? 'bg-accent text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setTool('circle')}
            className={`p-2 rounded-xl text-xs transition-all ${
              tool === 'circle' ? 'bg-accent text-white shadow-xs' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
        </div>

        {/* History, Upload & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 disabled:opacity-40 transition-colors"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 disabled:opacity-40 transition-colors"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Upload Image to Draw On */}
          <label className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer transition-colors" title="Insert Image / Screenshot">
            <Upload className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {/* Copy Canvas Image */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={() => handleDownload('png')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 text-xs font-semibold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save PNG</span>
          </button>

          {/* Clear Canvas */}
          <button
            onClick={handleClear}
            className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Colors & Stroke Thickness Ribbon */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Color Palette */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c ? 'scale-125 border-accent shadow-xs' : 'border-neutral-300 dark:border-neutral-700 hover:scale-110'
              }`}
            />
          ))}
          {/* Custom Color Input */}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-7 h-7 rounded-full border-none cursor-pointer bg-transparent"
            title="Custom Color Picker"
          />
        </div>

        {/* Stroke Thickness Slider */}
        <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400">
          <span>Thickness:</span>
          <input
            type="range"
            min="1"
            max="40"
            value={lineWidth}
            onChange={e => setLineWidth(Number(e.target.value))}
            className="w-28 sm:w-36 accent-accent cursor-pointer"
          />
          <span className="font-mono font-bold text-neutral-900 dark:text-white w-6">{lineWidth}px</span>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 p-2 sm:p-4 flex items-center justify-center shadow-inner">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="w-full max-w-[1100px] h-auto aspect-[12/7] rounded-2xl bg-white shadow-md cursor-crosshair touch-none select-none"
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-2">
        <p>💡 Tip: Use touch or mouse to sketch, annotate screenshots, draw signatures, or plan diagrams.</p>
        <span className="font-mono">1200 × 700 HD Canvas</span>
      </div>
    </div>
  );
};
