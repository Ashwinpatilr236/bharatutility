import React, { useState, useRef } from 'react';
import { 
  FileText, Upload, Download, Copy, Check, FileCode, 
  Sparkles, Search, Sliders, CheckCircle2, AlertTriangle, 
  Trash2, RefreshCw, FileUp, Eye, BookOpen, Layers
} from 'lucide-react';
import { 
  extractTextFromPdf, extractTextFromDocx, generatePdfFromText, TextToPdfOptions 
} from '../../utils/documentParsers';

interface DocumentConvertersSuiteCalculatorProps {
  initialMode?: 'pdf-to-text' | 'word-to-text' | 'text-to-pdf' | 'word-to-pdf';
  onResultChange?: (result: string) => void;
}

export const DocumentConvertersSuiteCalculator: React.FC<DocumentConvertersSuiteCalculatorProps> = ({
  initialMode = 'pdf-to-text',
  onResultChange
}) => {
  const [activeMode, setActiveMode] = useState<'pdf-to-text' | 'word-to-text' | 'text-to-pdf' | 'word-to-pdf'>(initialMode);
  
  // File & Text States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Text to PDF configuration states
  const [inputDocText, setInputDocText] = useState<string>(
    `BHARATUTILITY OFFICIAL DOCUMENTATION
====================================

BharatUtility is a 100% free, private, and client-side utility platform tailored specifically for Indian citizens, students, freelancers, developers, and tax professionals.

KEY FEATURES & ADVANTAGES:
1. Zero Server Uploads: All text and document processing runs inside your browser memory.
2. Lightning Fast Execution: Native WebAssembly and HTML5 Canvas engines for instant rendering.
3. India-Centric Rules: Full support for Lakhs/Crores, GST, Income Tax slabs, and Govt Exam formats.

Thank you for choosing BharatUtility for your daily digital needs.`
  );
  const [docTitle, setDocTitle] = useState<string>('My Document');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [fontSize, setFontSize] = useState<number>(11);
  const [fontFamily, setFontFamily] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle File Upload and Extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsLoading(true);
    setStatusMsg(null);
    setExtractedText('');

    try {
      if (activeMode === 'pdf-to-text') {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          throw new Error('Please select a valid .pdf document.');
        }
        const res = await extractTextFromPdf(file);
        setExtractedText(res.text);
        setPageCount(res.pages);
        setStatusMsg({ type: 'success', text: `Successfully extracted text from ${res.pages} page(s)!` });
        if (onResultChange) onResultChange(`Extracted ${res.text.length} characters from ${file.name}`);
      } else if (activeMode === 'word-to-text') {
        if (!file.name.toLowerCase().endsWith('.docx')) {
          throw new Error('Please select a valid .docx Word document.');
        }
        const res = await extractTextFromDocx(file);
        setExtractedText(res.text);
        setPageCount(res.paragraphs.length);
        setStatusMsg({ type: 'success', text: `Extracted ${res.paragraphs.length} paragraph(s) from Word document!` });
        if (onResultChange) onResultChange(`Extracted ${res.text.length} characters from ${file.name}`);
      } else if (activeMode === 'word-to-pdf') {
        if (!file.name.toLowerCase().endsWith('.docx')) {
          throw new Error('Please select a valid .docx Word document.');
        }
        const res = await extractTextFromDocx(file);
        setInputDocText(res.text);
        setDocTitle(file.name.replace('.docx', ''));
        setStatusMsg({ type: 'success', text: 'Word document loaded! Click "Generate & Download PDF" below.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error parsing document.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate & Download PDF
  const handleGeneratePdf = async () => {
    if (!inputDocText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please enter or upload some text to convert to PDF.' });
      return;
    }

    setIsLoading(true);
    try {
      const pdfBytes = await generatePdfFromText(inputDocText, {
        title: docTitle,
        pageSize,
        fontSize,
        fontFamily,
        includePageNumbers
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${docTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'document'}.pdf`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      setStatusMsg({ type: 'success', text: 'PDF generated and downloaded successfully!' });
      if (onResultChange) onResultChange(`Generated PDF: ${docTitle} (${pageSize})`);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error generating PDF.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = activeMode === 'text-to-pdf' || activeMode === 'word-to-pdf' ? inputDocText : extractedText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const textToDownload = activeMode === 'text-to-pdf' || activeMode === 'word-to-pdf' ? inputDocText : extractedText;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'extracted-text'}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordCount = (extractedText || inputDocText).trim().split(/\s+/).filter(Boolean).length;
  const charCount = (extractedText || inputDocText).length;

  return (
    <div className="space-y-6">
      {/* Mode Navigation Tabs */}
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { id: 'pdf-to-text', label: 'PDF to Text', icon: FileText, desc: 'Extract text from PDF' },
            { id: 'word-to-text', label: 'Word (.docx) to Text', icon: FileCode, desc: 'Extract from MS Word' },
            { id: 'text-to-pdf', label: 'Text to PDF Maker', icon: FileUp, desc: 'Create formatted PDF' },
            { id: 'word-to-pdf', label: 'Word to PDF', icon: Layers, desc: 'Convert .docx to PDF' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveMode(tab.id as any);
                  setStatusMsg(null);
                  setSelectedFile(null);
                  setExtractedText('');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-750'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                <div className="text-[11px] opacity-75 mt-0.5">{tab.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Alerts */}
      {statusMsg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
          statusMsg.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : statusMsg.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
        }`}>
          {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ---------------- MODE 1 & 2: PDF / WORD TO TEXT ---------------- */}
      {(activeMode === 'pdf-to-text' || activeMode === 'word-to-text') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Upload Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                Upload {activeMode === 'pdf-to-text' ? 'PDF File' : 'Word (.docx) Document'}
              </h3>
              <p className="text-xs text-slate-400">
                100% offline & private extraction. Your files are never sent to external servers.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept={activeMode === 'pdf-to-text' ? '.pdf,application/pdf' : '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/70"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-white">Click or Drag & Drop File Here</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supports {activeMode === 'pdf-to-text' ? '.PDF documents' : '.DOCX Microsoft Word files'}
                </div>
              </div>

              {selectedFile && (
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white truncate max-w-[200px]">{selectedFile.name}</div>
                    <div className="text-slate-400 text-[11px]">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setExtractedText('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Document Stats Box */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">Words</span>
                <span className="text-xl font-bold text-white font-mono">{wordCount}</span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block mb-1">Characters</span>
                <span className="text-xl font-bold text-blue-400 font-mono">{charCount}</span>
              </div>
            </div>
          </div>

          {/* Right Extracted Text View */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Extracted Text Output
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyText}
                    disabled={!extractedText}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    disabled={!extractedText}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 disabled:opacity-40"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .TXT
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                rows={16}
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                placeholder="Extracted plain text will appear here once you upload a document..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-4 text-xs sm:text-sm text-slate-200 font-mono outline-none leading-relaxed resize-y"
              />
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODE 3 & 4: TEXT TO PDF / WORD TO PDF ---------------- */}
      {(activeMode === 'text-to-pdf' || activeMode === 'word-to-pdf') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Text Editor & Settings */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Document Content (Type or Paste)
                </label>
                {activeMode === 'word-to-pdf' && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    Load .docx File
                  </button>
                )}
              </div>

              {activeMode === 'word-to-pdf' && (
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              )}

              <textarea
                rows={14}
                value={inputDocText}
                onChange={(e) => setInputDocText(e.target.value)}
                placeholder="Enter your document content here..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-4 text-xs sm:text-sm text-slate-200 font-mono outline-none leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Right PDF Styling & Export Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" />
                PDF Layout & Typography Settings
              </h3>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Document Header Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Project Report 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-medium outline-none focus:border-blue-500"
                />
              </div>

              {/* Page Size & Font Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Page Size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="A4">A4 (Standard Indian)</option>
                    <option value="Letter">US Letter</option>
                    <option value="Legal">Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="10">10 pt (Compact)</option>
                    <option value="11">11 pt (Standard)</option>
                    <option value="12">12 pt (Large)</option>
                    <option value="14">14 pt (Readable)</option>
                  </select>
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Font Family</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['Helvetica', 'TimesRoman', 'Courier'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFontFamily(f)}
                      className={`py-1.5 text-xs font-bold rounded-lg ${
                        fontFamily === f ? 'bg-blue-600 text-white' : 'text-slate-400'
                      }`}
                    >
                      {f === 'TimesRoman' ? 'Times' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Page Number Toggle */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePageNumbers}
                  onChange={(e) => setIncludePageNumbers(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-300">Add footer &quot;Page X of Y&quot; numbering</span>
              </label>

              {/* Action Button */}
              <button
                onClick={handleGeneratePdf}
                disabled={isLoading || !inputDocText.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isLoading ? 'Generating PDF...' : 'Generate & Download PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
