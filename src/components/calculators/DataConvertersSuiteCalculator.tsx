import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, FileCode, ArrowRightLeft, Copy, Check, 
  Download, Upload, Sparkles, Sliders, Table, Eye, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { parseCsvToJson, parseJsonToCsv } from '../../utils/documentParsers';

interface DataConvertersSuiteCalculatorProps {
  initialMode?: 'csv-to-json' | 'json-to-csv' | 'base64-converter';
  onResultChange?: (result: string) => void;
}

const SAMPLE_CSV = `Name,Role,City,Salary
Rahul Sharma,Senior Developer,Bengaluru,1850000
Pooja Patel,Product Designer,Mumbai,1420000
Amit Verma,Data Analyst,New Delhi,1150000
Sneha Kulkarni,DevOps Engineer,Pune,1600000`;

const SAMPLE_JSON = `[
  { "Name": "Rahul Sharma", "Role": "Senior Developer", "City": "Bengaluru", "Salary": 1850000 },
  { "Name": "Pooja Patel", "Role": "Product Designer", "City": "Mumbai", "Salary": 1420000 },
  { "Name": "Amit Verma", "Role": "Data Analyst", "City": "New Delhi", "Salary": 1150000 },
  { "Name": "Sneha Kulkarni", "Role": "DevOps Engineer", "City": "Pune", "Salary": 1600000 }
]`;

export const DataConvertersSuiteCalculator: React.FC<DataConvertersSuiteCalculatorProps> = ({
  initialMode = 'csv-to-json',
  onResultChange
}) => {
  const [direction, setDirection] = useState<'csv-to-json' | 'json-to-csv'>(
    initialMode === 'json-to-csv' ? 'json-to-csv' : 'csv-to-json'
  );
  const [rawInput, setRawInput] = useState<string>(direction === 'csv-to-json' ? SAMPLE_CSV : SAMPLE_JSON);
  const [delimiter, setDelimiter] = useState<string>(',');
  const [beautifyJson, setBeautifyJson] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Conversion Result
  const convertedData = useMemo(() => {
    setErrorMsg('');
    if (!rawInput.trim()) return { text: '', tableData: [] };

    try {
      if (direction === 'csv-to-json') {
        const jsonArr = parseCsvToJson(rawInput, delimiter);
        const jsonText = beautifyJson ? JSON.stringify(jsonArr, null, 2) : JSON.stringify(jsonArr);
        if (onResultChange) onResultChange(`Converted ${jsonArr.length} CSV rows to JSON`);
        return { text: jsonText, tableData: jsonArr };
      } else {
        const parsed = JSON.parse(rawInput);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const csvText = parseJsonToCsv(arr, delimiter);
        if (onResultChange) onResultChange(`Converted ${arr.length} JSON objects to CSV`);
        return { text: csvText, tableData: arr };
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid format input.');
      return { text: '', tableData: [] };
    }
  }, [rawInput, direction, delimiter, beautifyJson, onResultChange]);

  const handleCopy = () => {
    if (!convertedData.text) return;
    navigator.clipboard.writeText(convertedData.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!convertedData.text) return;
    const ext = direction === 'csv-to-json' ? 'json' : 'csv';
    const mime = direction === 'csv-to-json' ? 'application/json' : 'text/csv';
    const blob = new Blob([convertedData.text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `converted_data_${Date.now()}.${ext}`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSwitchDirection = () => {
    if (direction === 'csv-to-json') {
      setDirection('json-to-csv');
      setRawInput(convertedData.text || SAMPLE_JSON);
    } else {
      setDirection('csv-to-json');
      setRawInput(convertedData.text || SAMPLE_CSV);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Direction Switch */}
      <div className="bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {direction === 'csv-to-json' ? 'CSV to JSON Converter' : 'JSON to CSV Converter'}
              </h3>
              <p className="text-xs text-slate-400">100% Client-side tabular data transformer with live spreadsheet view</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchDirection}
              className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Switch to {direction === 'csv-to-json' ? 'JSON ➔ CSV' : 'CSV ➔ JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Options Toolbar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400">Delimiter:</label>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="&#9;">Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          {direction === 'csv-to-json' && (
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={beautifyJson}
                onChange={(e) => setBeautifyJson(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-teal-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-xs text-slate-300 font-medium">Beautify JSON</span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRawInput(direction === 'csv-to-json' ? SAMPLE_CSV : SAMPLE_JSON)}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
          >
            Load Sample
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setRawInput('')}
            className="text-xs text-slate-400 hover:text-rose-400 font-semibold"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main Split Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Textarea */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {direction === 'csv-to-json' ? 'Input CSV Data' : 'Input JSON Data'}
              </label>
              <span className="text-xs font-mono text-slate-400">
                {rawInput.length} chars
              </span>
            </div>

            <textarea
              rows={14}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={direction === 'csv-to-json' ? "Paste CSV rows here..." : "Paste JSON array here..."}
              className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl p-3.5 text-xs text-slate-200 font-mono outline-none leading-relaxed resize-y"
            />
          </div>
        </div>

        {/* Right: Output Textarea */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {direction === 'csv-to-json' ? 'Converted JSON Output' : 'Converted CSV Output'}
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!convertedData.text}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!convertedData.text}
                  className="bg-teal-600 hover:bg-teal-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-teal-500/20 disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>

            {errorMsg ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            ) : (
              <textarea
                rows={14}
                readOnly
                value={convertedData.text}
                placeholder="Converted output will appear here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-teal-300 font-mono outline-none leading-relaxed resize-y"
              />
            )}
          </div>
        </div>
      </div>

      {/* Live Table Preview */}
      {convertedData.tableData.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 overflow-hidden">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Table className="w-4 h-4 text-teal-400" />
            Live Table Preview ({convertedData.tableData.length} records)
          </h4>

          <div className="overflow-x-auto max-h-72 border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0">
                <tr>
                  {Object.keys(convertedData.tableData[0] || {}).map((header) => (
                    <th key={header} className="p-3 font-semibold text-slate-300 border-r border-slate-800/60 last:border-r-0">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {convertedData.tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    {Object.values(row).map((val: any, cIdx) => (
                      <td key={cIdx} className="p-3 text-slate-200 border-r border-slate-800/60 last:border-r-0">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
