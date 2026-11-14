import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Download, FileCode2, ShieldCheck, Database } from 'lucide-react';
import StatusPill from './ui/StatusPill';
import { copyToClipboard } from '../lib/clipboard';

export default function JsonModal({ isOpen, onClose, currentPacket }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(currentPacket, null, 2);
  const lines = jsonString.split('\n');
  const metadata = currentPacket?.metadata || {};
  const astronaut = currentPacket?.astronaut || {};

  const handleCopy = async () => {
    const success = await copyToClipboard(jsonString);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nsa_telemetry_${astronaut?.id || 'packet'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6 animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-modal-title"
    >
      <div className="panel flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden shadow-hud-glow">
        <div className="flex items-start justify-between gap-3 border-b border-space-700/70 px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
              <FileCode2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow block">DATA CONTRACT / ARCHITECTURE.MD</span>
              <h3 id="json-modal-title" className="font-heading text-[15px] font-bold text-white">
                Paquete de telemetría sintética
              </h3>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Cerrar visor JSON">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-space-700/60 px-4 py-2.5 sm:grid-cols-4">
          <div>
            <span className="eyebrow block">SOURCE</span>
            <span className="mono mt-0.5 block truncate text-[10px] font-semibold text-cyan-300">
              {metadata.source || 'simulation_engine_v1'}
            </span>
          </div>
          <div>
            <span className="eyebrow block">MISSION</span>
            <span className="mono mt-0.5 block truncate text-[10px] font-semibold text-slate-300">
              {metadata.mission_id || 'mars_001'}
            </span>
          </div>
          <div>
            <span className="eyebrow block">ASTRONAUT</span>
            <span className="mono mt-0.5 block truncate text-[10px] font-semibold text-slate-300">
              {astronaut.name || 'N/A'}
            </span>
          </div>
          <div>
            <span className="eyebrow block">MODE</span>
            <StatusPill status={metadata.is_synthetic ? 'amber' : 'nominal'} className="mt-1">
              {metadata.is_synthetic ? 'SYNTHETIC' : 'LIVE'}
            </StatusPill>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-[#040A12] p-3">
          <div className="h-[52vh] overflow-auto rounded-md border border-space-700/80 bg-black/35">
            <pre className="min-w-max p-3 font-mono text-[10.5px] leading-[1.65] text-slate-300">
              {lines.map((line, index) => (
                <div key={index} className="flex">
                  <span className="w-8 shrink-0 select-none pr-3 text-right text-slate-700">{index + 1}</span>
                  <span className="whitespace-pre text-cyan-200/90">{line}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-space-700/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="mono flex items-center gap-1.5 text-[9px] text-slate-500">
            <Database className="h-3 w-3 text-telemetry-cyan" aria-hidden="true" />
            ESQUEMA VALIDADO · {lines.length} LÍNEAS
          </span>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCopy} className="btn">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5 text-telemetry-cyan" />}
              {copied ? 'Copiado' : 'Copiar JSON'}
            </button>

            <button type="button" onClick={handleDownload} className="btn btn-primary">
              <Download className="h-3.5 w-3.5" />
              Descargar .json
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
