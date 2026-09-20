import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import QRCode from 'qrcode';
import {
  FileText,
  Upload,
  Download,
  Image as ImageIcon,
  RotateCw,
  QrCode,
  Sliders,
  Scissors,
  CheckCircle,
  FileCheck,
  Shield,
  Trash2,
  HardDrive
} from 'lucide-react';

export type DocumentToolsMode =
  | 'pdf-merge'
  | 'pdf-split'
  | 'pdf-compress'
  | 'jpg-to-pdf'
  | 'pdf-page-organizer'
  | 'image-compressor-resizer'
  | 'passport-photo'
  | 'signature-resizer'
  | 'qr-generator'
  | 'file-size-calc';

interface DocumentToolsSuiteCalculatorProps {
  initialMode?: DocumentToolsMode;
  onResultChange?: (summary: string, params: Record<string, any>) => void;
}

export const DocumentToolsSuiteCalculator: React.FC<DocumentToolsSuiteCalculatorProps> = ({
  initialMode = 'pdf-merge',
  onResultChange,
}) => {
  const [mode, setMode] = useState<DocumentToolsMode>(initialMode);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // 1. PDF Merge state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);

  // 2. JPG to PDF state
  const [imgFiles, setImgFiles] = useState<File[]>([]);

  // 3. Image Resizer state
  const [imgToResize, setImgToResize] = useState<File | null>(null);
  const [targetQuality, setTargetQuality] = useState<number>(80);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [resizedDataUrl, setResizedDataUrl] = useState<string>('');

  // 4. Passport Photo state
  const [passportImg, setPassportImg] = useState<File | null>(null);
  const [passportResultUrl, setPassportResultUrl] = useState<string>('');

  // 5. Signature Resizer state
  const [sigImg, setSigImg] = useState<File | null>(null);
  const [targetKB, setTargetKB] = useState<number>(20);
  const [sigResultUrl, setSigResultUrl] = useState<string>('');
  const [sigResultKB, setSigResultKB] = useState<number>(0);

  // 6. QR Code state
  const [qrText, setQrText] = useState<string>('https://bharatutility.tech');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // 7. File Size Calc state
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(10485760); // 10 MB

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // QR Code generator effect
  useEffect(() => {
    if (mode === 'qr-generator' && qrText) {
      QRCode.toDataURL(qrText, { width: 300, margin: 2 })
        .then(url => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [qrText, mode]);

  // Handle PDF Merge
  const handleMergePdf = async () => {
    if (mergeFiles.length < 2) {
      setStatusMsg('Please select at least 2 PDF files to merge.');
      return;
    }
    try {
      setStatusMsg('Merging PDFs locally in browser...');
      const mergedPdf = await PDFDocument.create();

      for (const file of mergeFiles) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `merged_bharatutility_${Date.now()}.pdf`;
      a.click();
      setStatusMsg('PDF files merged successfully!');
    } catch (err: any) {
      setStatusMsg(`Error merging PDFs: ${err.message || 'Invalid PDF file'}`);
    }
  };

  // Handle JPG to PDF
  const handleJpgToPdf = async () => {
    if (imgFiles.length === 0) {
      setStatusMsg('Please select at least one image file.');
      return;
    }
    try {
      setStatusMsg('Converting images to PDF locally...');
      const pdfDoc = await PDFDocument.create();

      for (const file of imgFiles) {
        const buffer = await file.arrayBuffer();
        let image;
        if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(buffer);
        } else {
          image = await pdfDoc.embedJpg(buffer);
        }
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `images_to_pdf_bharatutility.pdf`;
      a.click();
      setStatusMsg('Images converted to PDF successfully!');
    } catch (err: any) {
      setStatusMsg(`Error converting images: ${err.message}`);
    }
  };

  // Handle Image Resizer
  const handleImageResize = () => {
    if (!imgToResize) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const aspect = img.height / img.width;
        canvas.width = targetWidth;
        canvas.height = targetWidth * aspect;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', targetQuality / 100);
          setResizedDataUrl(dataUrl);
          setStatusMsg('Image resized & compressed!');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(imgToResize);
  };

  // Handle Signature / Exam Photo Resizer
  const handleSignatureResize = () => {
    if (!sigImg) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        // Standard exam signature box width ~ 300px
        canvas.width = 300;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          let kb = Math.round((dataUrl.length * 0.75) / 1024);

          while (kb > targetKB && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            kb = Math.round((dataUrl.length * 0.75) / 1024);
          }

          setSigResultUrl(dataUrl);
          setSigResultKB(kb);
          setStatusMsg(`Signature resized to ${kb} KB (Target max: ${targetKB} KB)`);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(sigImg);
  };

  useEffect(() => {
    if (!onResultChange) return;
    onResultChange(`Document Tool: ${mode}`, { mode });
  }, [mode]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-neutral-100 dark:border-neutral-800">
        {[
          { id: 'pdf-merge', label: 'Merge PDF', icon: FileText },
          { id: 'jpg-to-pdf', label: 'Images to PDF', icon: ImageIcon },
          { id: 'image-compressor-resizer', label: 'Image Compressor', icon: Sliders },
          { id: 'signature-resizer', label: 'Exam Signature / Photo', icon: Scissors },
          { id: 'qr-generator', label: 'QR Code Generator', icon: QrCode },
          { id: 'file-size-calc', label: 'File Size Calculator', icon: HardDrive },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setMode(tab.id as DocumentToolsMode);
                setStatusMsg('');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                mode === tab.id
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
        <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          <strong>100% Client-Side Privacy:</strong> Your documents & photos never leave your browser. All conversions and compressions happen locally on your device.
        </span>
      </div>

      {/* Hidden Canvas for operations */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Mode 1: PDF Merge */}
      {mode === 'pdf-merge' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-8 text-center space-y-3 bg-neutral-50/50 dark:bg-neutral-800/30">
            <Upload className="w-8 h-8 text-accent mx-auto" />
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              Select or Drop PDF Files to Merge
            </div>
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={e => setMergeFiles(Array.from(e.target.files || []))}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="inline-block px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs cursor-pointer hover:bg-accent/90 transition-colors"
            >
              Choose PDF Files
            </label>
          </div>

          {mergeFiles.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Selected Files ({mergeFiles.length}):</div>
              <div className="space-y-2">
                {mergeFiles.map((f, i) => (
                  <div key={i} className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-mono flex justify-between items-center">
                    <span>{f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                    <button onClick={() => setMergeFiles(mergeFiles.filter((_, idx) => idx !== i))} className="text-rose-500 hover:text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleMergePdf}
                className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Merge & Download Combined PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Images to PDF */}
      {mode === 'jpg-to-pdf' && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-3xl p-8 text-center space-y-3 bg-neutral-50/50 dark:bg-neutral-800/30">
            <ImageIcon className="w-8 h-8 text-indigo-500 mx-auto" />
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              Select JPG / PNG Images to Convert to PDF
            </div>
            <input
              type="file"
              multiple
              accept="image/jpeg, image/jpg, image/png"
              onChange={e => setImgFiles(Array.from(e.target.files || []))}
              className="hidden"
              id="img-upload"
            />
            <label
              htmlFor="img-upload"
              className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              Choose Image Files
            </label>
          </div>

          {imgFiles.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Selected Images ({imgFiles.length}):</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imgFiles.map((f, i) => (
                  <div key={i} className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] truncate text-center">
                    {f.name}
                  </div>
                ))}
              </div>
              <button
                onClick={handleJpgToPdf}
                className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Convert & Download PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Image Compressor & Resizer */}
      {mode === 'image-compressor-resizer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Select Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && setImgToResize(e.target.files[0])}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Target Width: {targetWidth}px
              </label>
              <input
                type="range"
                min={200}
                max={2400}
                step={50}
                value={targetWidth}
                onChange={e => setTargetWidth(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Quality: {targetQuality}%
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={targetQuality}
                onChange={e => setTargetQuality(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <button
              onClick={handleImageResize}
              disabled={!imgToResize}
              className="w-full py-3 rounded-2xl bg-accent text-white font-bold text-xs hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              Resize & Compress Image
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 text-center space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Preview & Download</div>
            {resizedDataUrl ? (
              <div className="space-y-3">
                <img src={resizedDataUrl} alt="Resized Preview" className="max-h-48 mx-auto rounded-xl border shadow-xs" />
                <a
                  href={resizedDataUrl}
                  download="compressed_image_bharatutility.jpg"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Resized Image
                </a>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic py-10">Upload an image and click Process to preview.</div>
            )}
          </div>
        </div>
      )}

      {/* Mode 4: Exam Signature / Photo Resizer */}
      {mode === 'signature-resizer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Upload Photo / Signature Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => e.target.files?.[0] && setSigImg(e.target.files[0])}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Maximum File Size Limit for Exam Portal: {targetKB} KB
              </label>
              <select
                value={targetKB}
                onChange={e => setTargetKB(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white"
              >
                <option value={10}>10 KB (SSC / IBPS Signature)</option>
                <option value={20}>20 KB (UPSC / NTA Signature)</option>
                <option value={50}>50 KB (Standard Exam Photo)</option>
                <option value={100}>100 KB (Govt Document Upload)</option>
              </select>
            </div>

            <button
              onClick={handleSignatureResize}
              disabled={!sigImg}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Resize to Govt Exam Specs
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 text-center space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Resized Output</div>
            {sigResultUrl ? (
              <div className="space-y-3">
                <img src={sigResultUrl} alt="Exam Signature" className="max-h-32 mx-auto rounded-xl border bg-white p-2 shadow-xs" />
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Size: {sigResultKB} KB (Compliant with max {targetKB} KB)
                </div>
                <a
                  href={sigResultUrl}
                  download={`exam_signature_${sigResultKB}kb.jpg`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download Exam Photo/Signature
                </a>
              </div>
            ) : (
              <div className="text-xs text-neutral-400 italic py-10">Upload signature/photo to format for Indian portal.</div>
            )}
          </div>
        </div>
      )}

      {/* Mode 5: QR Code Generator */}
      {mode === 'qr-generator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Enter URL or Text Payload
              </label>
              <textarea
                rows={4}
                value={qrText}
                onChange={e => setQrText(e.target.value)}
                placeholder="Enter website link, UPI ID, or custom text..."
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-mono text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 text-center space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Generated QR Code</div>
            {qrDataUrl && (
              <div className="space-y-4">
                <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-2xl border p-2 bg-white shadow-xs" />
                <a
                  href={qrDataUrl}
                  download="qr_code_bharatutility.png"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download High-Res QR Code
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 6: File Size Calculator */}
      {mode === 'file-size-calc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                File Size in Bytes
              </label>
              <input
                type="number" inputMode="decimal" pattern="[0-9]*"
                value={fileSizeBytes}
                onChange={e => setFileSizeBytes(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 font-mono text-base font-bold text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Conversions</div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">Kilobytes (KB):</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">{(fileSizeBytes / 1024).toFixed(2)} KB</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">Megabytes (MB):</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{(fileSizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">Gigabytes (GB):</span>
              <span className="font-mono font-bold text-neutral-900 dark:text-white">{(fileSizeBytes / (1024 * 1024 * 1024)).toFixed(4)} GB</span>
            </div>
          </div>
        </div>
      )}

      {statusMsg && (
        <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 text-center">
          {statusMsg}
        </div>
      )}
    </div>
  );
};
