import React, { useState } from 'react';
import { getStandaloneHtml } from '../utils/standaloneHtml';
import { Copy, Check, Download, X, Code2, Globe } from 'lucide-react';

interface StandaloneHtmlModalProps {
  onClose: () => void;
}

export const StandaloneHtmlModal: React.FC<StandaloneHtmlModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const htmlCode = getStandaloneHtml();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apex-racer-2d.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-40 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-racing tracking-wide uppercase">
                Kode Standalone Single-File HTML
              </h3>
              <p className="text-xs text-slate-400">
                HTML, CSS, &amp; JavaScript murni (HTML5 Canvas) tanpa library luar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Instructions */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800 text-xs text-slate-300 flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <b>Cara Pakai:</b> Simpan kode ini ke file bernama <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded">game.html</code>, lalu klik 2x untuk langsung bermain di browser apa saja tanpa internet!
          </span>
        </div>

        {/* Code Preview */}
        <div className="flex-1 overflow-auto p-4 bg-slate-950 text-slate-300 font-mono text-xs leading-relaxed select-text">
          <pre className="whitespace-pre-wrap">{htmlCode.slice(0, 1800)}... (dan seterusnya)</pre>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Total {htmlCode.split('\n').length} baris kode siap pakai.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Seluruh Kode</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-racing uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh .html</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
