import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode2 } from 'lucide-react';

export default function JsonModal({ isOpen, onClose, currentPacket }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(currentPacket, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nsa_telemetry_${currentPacket?.astronaut?.id || 'packet'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-lg border border-space-700 bg-space-950 shadow-hud-glow overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-space-700 bg-space-900">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-telemetry-cyan" />
            <div>
              <h3 className="font-heading font-semibold text-xs text-white uppercase tracking-wider">
                CONTRATO DE INTEGRACIÓN JSON // ARCHITECTURE.MD
              </h3>
              <p className="text-[10px] text-slate-400">ESPECIFICACIÓN OFICIAL DE TRANSMISIÓN DE DATOS</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* JSON Preview */}
        <div className="p-3 bg-[#060913]">
          <pre className="h-80 overflow-y-auto p-3 rounded bg-black/70 border border-space-700/80 font-mono text-xs text-telemetry-cyan leading-relaxed selection:bg-cyan-500 selection:text-black">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-space-700 bg-space-900">
          <span className="text-[10px] text-slate-400">
            FUENTE: <strong className="text-telemetry-cyan">simulation_engine_v1</strong> (Sintético)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-space-850 hover:bg-space-800 border border-space-700 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-telemetry-green" /> : <Copy className="w-3.5 h-3.5 text-telemetry-cyan" />}
              <span>{copied ? "Copiado!" : "Copiar JSON"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-telemetry-cyan hover:bg-cyan-400 text-space-950 text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .json</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
