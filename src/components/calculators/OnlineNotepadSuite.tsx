import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Copy,
  Download,
  Trash2,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Search,
  Check,
  Eye,
  Edit3,
  Type,
  AlignLeft,
  Sparkles,
  RefreshCw,
  Clock,
  BookOpen,
  Plus,
  FolderOpen
} from 'lucide-react';

interface NoteItem {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

const DEFAULT_NOTE: NoteItem = {
  id: 'note-1',
  title: 'Quick Scratchpad',
  content: `# Welcome to BharatUtility Online Notepad & Scratchpad 📝

Yeh ek fast, lightweight aur 100% private in-browser notepad hai:
- ✅ **Auto-Save:** Aapka text browser local storage me automatically save rehta hai.
- ✅ **No Signup / Zero Data Leak:** Aapke notes kisi server par nahi jaate.
- ✅ **Offline Ready:** Internet band hone par bhi seamlessly kaam karega.

## Quick Shortcuts:
- Try **Speech-to-Text** voice typing with the microphone button.
- Format case, find & replace, and export as **.txt** or **.md** anytime!
`,
  updatedAt: new Date().toISOString()
};

export const OnlineNotepadSuite: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('bharatutility_notepad_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [DEFAULT_NOTE];
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(() => notes[0]?.id || 'note-1');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [paperTheme, setPaperTheme] = useState<'default' | 'sepia' | 'dark' | 'matrix'>('default');
  
  // Find & Replace
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  // Voice recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0] || DEFAULT_NOTE;

  // Auto-persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bharatutility_notepad_notes', JSON.stringify(notes));
    } catch {
      // ignore quota errors
    }
  }, [notes]);

  const updateContent = (text: string) => {
    setNotes(prev =>
      prev.map(n => {
        if (n.id === activeNote.id) {
          // auto update title from first non-empty line
          const firstLine = text.trim().split('\n')[0]?.replace(/^[#\s*-_]+/, '').trim();
          const autoTitle = firstLine ? firstLine.slice(0, 30) : 'Untitled Note';
          return { ...n, content: text, title: autoTitle, updatedAt: new Date().toISOString() };
        }
        return n;
      })
    );
  };

  const createNewNote = () => {
    const newId = `note-${Date.now()}`;
    const newNote: NoteItem = {
      id: newId,
      title: 'New Note',
      content: '',
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newId);
  };

  const deleteActiveNote = () => {
    if (notes.length <= 1) {
      updateContent('');
      return;
    }
    const remaining = notes.filter(n => n.id !== activeNote.id);
    setNotes(remaining);
    setActiveNoteId(remaining[0].id);
  };

  // Text Stats
  const rawText = activeNote.content || '';
  const charCount = rawText.length;
  const charNoSpaces = rawText.replace(/\s/g, '').length;
  const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const lines = rawText ? rawText.split('\n').length : 0;
  const readingTimeMins = Math.ceil(words / 200);

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export TXT / MD
  const handleDownload = (ext: 'txt' | 'md') => {
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeNote.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Voice Dictation (Speech to Text)
  const toggleVoiceDictation = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Supports Hindi + Indian English

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript) {
          updateContent((rawText ? rawText + ' ' : '') + transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  // Quick text transformations
  const transformCase = (type: 'upper' | 'lower' | 'title' | 'cleanSpaces') => {
    let result = rawText;
    if (type === 'upper') result = rawText.toUpperCase();
    if (type === 'lower') result = rawText.toLowerCase();
    if (type === 'title') {
      result = rawText.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    if (type === 'cleanSpaces') {
      result = rawText.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    }
    updateContent(result);
  };

  // Find & Replace
  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const replaced = rawText.replace(regex, replaceQuery);
    updateContent(replaced);
  };

  // Paper Theme Styles
  const themeClasses = {
    default: 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800',
    sepia: 'bg-[#faf6eb] dark:bg-[#2b2720] text-[#433422] dark:text-[#f0e6d2] border-[#e8ddc7] dark:border-[#3e372e]',
    dark: 'bg-neutral-950 text-neutral-100 border-neutral-800',
    matrix: 'bg-black text-emerald-400 border-emerald-950 font-mono'
  }[paperTheme];

  const fontClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  }[fontFamily];

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-neutral-950 p-4 sm:p-6 overflow-y-auto' : ''}`}>
      {/* Top Controls & Tabs Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Note Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {notes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                note.id === activeNote.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{note.title || 'Untitled'}</span>
            </button>
          ))}
          <button
            onClick={createNewNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-accent/10 hover:text-accent text-neutral-600 dark:text-neutral-300 transition-colors border border-dashed border-neutral-300 dark:border-neutral-700"
            title="Create New Note"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Voice Dictation */}
          <button
            onClick={toggleVoiceDictation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
            title="Voice Typing / Dictation (Hindi & English)"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
            <span>{isListening ? 'Listening...' : 'Voice Type'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={() => handleDownload('txt')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Download Plain Text (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>

          <button
            onClick={() => handleDownload('md')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
            title="Download Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          {/* Find & Replace Toggle */}
          <button
            onClick={() => setShowFindReplace(prev => !prev)}
            className={`p-2 rounded-xl text-xs transition-colors ${
              showFindReplace
                ? 'bg-accent/15 text-accent font-bold'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
            title="Find & Replace"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-2 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Distraction-Free Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Delete Note */}
          <button
            onClick={deleteActiveNote}
            className="p-2 rounded-xl text-xs bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
            title="Delete Current Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formatting & Preferences Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Case Transforms */}
          <span className="font-semibold text-[11px] uppercase tracking-wider text-neutral-400">Transform:</span>
          <button
            onClick={() => transformCase('upper')}
            className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold"
          >
            UPPER
          </button>
          <button
            onClick={() => transformCase('lower')}
            className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 lowercase font-medium"
          >
            lower
          </button>
          <button
            onClick={() => transformCase('title')}
            className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium"
          >
            Title Case
          </button>
          <button
            onClick={() => transformCase('cleanSpaces')}
            className="px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium"
          >
            Clean Spaces
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Font Family */}
          <select
            value={fontFamily}
            onChange={e => setFontFamily(e.target.value as any)}
            className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-lg px-2 py-1 border border-neutral-200 dark:border-neutral-700 outline-none"
          >
            <option value="sans">Sans Serif</option>
            <option value="serif">Serif / Book</option>
            <option value="mono">Monospace / Code</option>
          </select>

          {/* Theme Palette */}
          <select
            value={paperTheme}
            onChange={e => setPaperTheme(e.target.value as any)}
            className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-lg px-2 py-1 border border-neutral-200 dark:border-neutral-700 outline-none"
          >
            <option value="default">Default Paper</option>
            <option value="sepia">Warm Sepia</option>
            <option value="dark">Midnight Dark</option>
            <option value="matrix">Matrix Green</option>
          </select>

          {/* Font Size */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
              className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold"
            >
              -
            </button>
            <span className="font-mono text-neutral-600 dark:text-neutral-300">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Find & Replace Bar (Collapsible) */}
      {showFindReplace && (
        <div className="bg-neutral-100 dark:bg-neutral-800/80 rounded-xl p-3 border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Find text..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceQuery}
              onChange={e => setReplaceQuery(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={handleReplaceAll}
            className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
          >
            Replace All
          </button>
        </div>
      )}

      {/* Main Text Editor Area */}
      <div className={`relative rounded-3xl border shadow-sm transition-all overflow-hidden ${themeClasses}`}>
        <textarea
          ref={textareaRef}
          value={activeNote.content}
          onChange={e => updateContent(e.target.value)}
          placeholder="Start typing your notes, code, thoughts, or draft here... (Auto-saved continuously)"
          style={{ fontSize: `${fontSize}px` }}
          className={`w-full min-h-[450px] p-6 bg-transparent border-none outline-none resize-y leading-relaxed ${fontClasses}`}
          spellCheck={true}
        />
      </div>

      {/* Live Text Analytics & Statistics Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 divide-x divide-neutral-200 dark:divide-neutral-800">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
            <Type className="w-4 h-4 text-accent" />
            <span>Words: <strong className="text-neutral-900 dark:text-white font-bold">{words.toLocaleString('en-IN')}</strong></span>
          </div>

          <div className="pl-4 sm:pl-6 text-neutral-600 dark:text-neutral-400">
            <span>Characters: <strong className="text-neutral-900 dark:text-white font-bold">{charCount.toLocaleString('en-IN')}</strong> ({charNoSpaces} no spaces)</span>
          </div>

          <div className="pl-4 sm:pl-6 text-neutral-600 dark:text-neutral-400">
            <span>Lines: <strong className="text-neutral-900 dark:text-white font-bold">{lines}</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-6 text-neutral-600 dark:text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Read Time: <strong className="text-neutral-900 dark:text-white font-bold">~{readingTimeMins} min</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Auto-Saved Locally</span>
        </div>
      </div>
    </div>
  );
};
