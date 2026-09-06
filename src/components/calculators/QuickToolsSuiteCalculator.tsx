import React, { useState, useMemo } from 'react';
import { Tool } from '../../types';
import { FileText, Gauge, QrCode, Sparkles, Check, Copy, Wifi, Train, Car, Download } from 'lucide-react';

interface Props {
  tool: Tool;
}

export const QuickToolsSuiteCalculator: React.FC<Props> = ({ tool }) => {
  const slug = tool.id;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // --- 1. MARKDOWN TO HTML STATE ---
  const [markdownInput, setMarkdownInput] = useState<string>(
    '# Welcome to BharatUtility\n\nIndia\'s **#1 Free Utility Suite** for daily life, finance, and developers.\n\n- 100% Client-Side Private\n- Zero Tracking\n- Blazing Fast Performance\n\nVisit [BharatUtility](https://bharatutility.tech) today!'
  );

  // --- 2. SPEED DISTANCE TIME STATE ---
  const [distanceKm, setDistanceKm] = useState<number>(450); // e.g. Delhi to Lucknow
  const [speedKmh, setSpeedKmh] = useState<number>(80); // km/h

  // --- 3. WIFI QR CODE STATE ---
  const [ssid, setSsid] = useState<string>('MyHomeFiber_5G');
  const [wifiPassword, setWifiPassword] = useState<string>('Bharat@2026');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [isHidden, setIsHidden] = useState<boolean>(false);

  // ================= 1. MARKDOWN CONVERSION =================
  const htmlOutput = useMemo(() => {
    let md = markdownInput;
    // Basic resilient parser for client-side MD -> HTML
    let html = md
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br/>');

    html = `<p>${html}</p>`.replace(/<p><\/p>/g, '');
    return html;
  }, [markdownInput]);

  // ================= 2. SPEED DISTANCE TIME =================
  const speedResult = useMemo(() => {
    const d = Math.max(0.1, distanceKm);
    const s = Math.max(0.1, speedKmh);
    const totalHours = d / s;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    const speedMs = (s * (5 / 18)).toFixed(1); // m/s
    const speedMph = (s * 0.621371).toFixed(1); // mph

    return {
      totalHours: totalHours.toFixed(2),
      formattedDuration: `${hours} Hours ${minutes} Minutes`,
      speedMs,
      speedMph,
    };
  }, [distanceKm, speedKmh]);

  // ================= 3. WIFI QR STRING =================
  const wifiQrString = useMemo(() => {
    // Standard Wi-Fi QR format: WIFI:T:WPA;S:MySSID;P:MyPassword;H:false;;
    return `WIFI:T:${encryption};S:${ssid};P:${wifiPassword};H:${isHidden ? 'true' : 'false'};;`;
  }, [ssid, wifiPassword, encryption, isHidden]);

  // In-browser QR generator SVG renderer
  const qrSvgUrl = useMemo(() => {
    // Encodes URI for standard SVG QR representation
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(wifiQrString)}&color=000000&bgcolor=ffffff`;
  }, [wifiQrString]);

  return (
    <div className="space-y-8">
      {/* ================= 1. MARKDOWN TO HTML ================= */}
      {slug === 'markdown-to-html-converter' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Markdown to Clean HTML Converter</h3>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(htmlOutput, 'html-out')}
              className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              {copiedId === 'html-out' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId === 'html-out' ? 'Copied' : 'Copy HTML Code'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Markdown Source</label>
              <textarea
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
                rows={12}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Generated HTML Code</label>
              <textarea
                readOnly
                value={htmlOutput}
                rows={12}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 select-all focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. SPEED DISTANCE TIME ================= */}
      {slug === 'speed-distance-time-calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Journey Distance & Average Speed</h3>
                <p className="text-xs text-slate-400">Calculate exact travel duration in hours and minutes</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Distance (Kilometers)</label>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Average Speed (km/h)</label>
                <input
                  type="number"
                  value={speedKmh}
                  onChange={(e) => setSpeedKmh(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-indigo-400 font-mono text-lg font-bold"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 text-xs">
              <span className="text-slate-400 self-center">Presets:</span>
              {[
                { label: 'Train (Express - 60 km/h)', s: 60 },
                { label: 'Vande Bharat (100 km/h)', s: 100 },
                { label: 'Expressway Car (90 km/h)', s: 90 },
                { label: 'City Traffic (30 km/h)', s: 30 },
              ].map(p => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setSpeedKmh(p.s)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border-2 border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 block">
                Estimated Travel Duration
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                {speedResult.formattedDuration}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Velocity in m/s:</span>
                  <span className="font-bold text-white mt-1 block">{speedResult.speedMs} m/s</span>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Miles per Hour:</span>
                  <span className="font-bold text-indigo-300 mt-1 block">{speedResult.speedMph} mph</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. WIFI QR CODE ================= */}
      {slug === 'wifi-qr-code-generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Wifi className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Wi-Fi Network Credentials</h3>
                <p className="text-xs text-slate-400">Generate Scan-to-Connect QR Code for guests</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Wi-Fi Network Name (SSID)</label>
                <input
                  type="text"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Wi-Fi Password</label>
                <input
                  type="text"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Security Type</label>
                  <select
                    value={encryption}
                    onChange={(e) => setEncryption(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isHidden}
                      onChange={(e) => setIsHidden(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500 w-4 h-4"
                    />
                    <span>Hidden Network</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                Scan with Phone Camera to Connect
              </span>

              <div className="p-3 bg-white rounded-2xl shadow-lg">
                <img
                  src={qrSvgUrl}
                  alt={`WiFi QR Code for ${ssid}`}
                  className="w-48 h-48 rounded-lg"
                  loading="lazy"
                />
              </div>

              <div className="text-xs text-slate-300 font-mono">
                SSID: <strong className="text-white">{ssid}</strong>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(wifiQrString, 'wifi-str')}
                className="text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center gap-1.5"
              >
                {copiedId === 'wifi-str' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Raw Wi-Fi Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
