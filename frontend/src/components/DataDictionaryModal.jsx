import React, { useEffect } from 'react';
import { X, BookOpen, Heart, Activity, Thermometer, Wind, ShieldCheck } from 'lucide-react';
import StatusPill from './ui/StatusPill';

const DICTIONARY = [
  {
    variable: 'Frecuencia Cardíaca',
    symbol: 'HR',
    unit: 'bpm',
    normal: '60 – 100',
    alert: '> 120 o < 50',
    description: 'Frecuencia de contracción ventricular. Monitorizada continuamente mediante derivación Lead II.',
    Icon: Heart,
    color: '#FB7185',
  },
  {
    variable: 'Saturación de Oxígeno',
    symbol: 'SpO2',
    unit: '%',
    normal: '95 – 100',
    alert: '< 90',
    description: 'Porcentaje de oxihemoglobina en sangre capilar arterial. Crítico en paseos espaciales (EVA).',
    Icon: Activity,
    color: '#22D3EE',
  },
  {
    variable: 'Temperatura Corporal',
    symbol: 'TEMP',
    unit: '°C',
    normal: '36.1 – 37.2',
    alert: '> 38.0',
    description: 'Temperatura del núcleo corporal medida por sensor axilar / ótico continuo del traje espacial.',
    Icon: Thermometer,
    color: '#FBBF24',
  },
  {
    variable: 'Frecuencia Respiratoria',
    symbol: 'RR',
    unit: 'rpm',
    normal: '12 – 20',
    alert: '> 24',
    description: 'Ciclos de inhalación/exhalación por minuto. Incrementa bajo estrés o acumulación de CO₂.',
    Icon: Wind,
    color: '#60A5FA',
  },
];

export default function DataDictionaryModal({ isOpen, onClose }) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6 animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dictionary-modal-title"
    >
      <div className="panel flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden shadow-hud-glow">
        <div className="flex items-start justify-between gap-3 border-b border-space-700/70 px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow block">CLINICAL REFERENCE / DATA_DICTIONARY.MD</span>
              <h3 id="dictionary-modal-title" className="font-heading text-[15px] font-bold text-white">
                Diccionario de datos y rangos médicos
              </h3>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Cerrar diccionario">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3.5 sm:p-4">
          <div className="hidden overflow-x-auto rounded-md border border-space-700/70 md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-space-700/80 bg-space-900/60">
                  <th className="px-3 py-2.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">Variable</th>
                  <th className="px-3 py-2.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">Unidad</th>
                  <th className="px-3 py-2.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">Rango nominal</th>
                  <th className="px-3 py-2.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">Umbral alerta</th>
                  <th className="px-3 py-2.5 font-mono text-[9px] uppercase tracking-wider text-slate-500">Descripción clínica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-700/50">
                {DICTIONARY.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <tr key={item.symbol} className="transition-colors hover:bg-white/[0.025]">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-space-700 bg-space-900"
                            style={{ color: item.color }}
                          >
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <div>
                            <span className="block font-heading text-[11.5px] font-bold text-slate-200">
                              {item.variable}
                            </span>
                            <span className="mono text-[9px] text-slate-600">{item.symbol}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="mono text-[10px] font-bold text-cyan-300">{item.unit}</span>
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill status="nominal">{item.normal}</StatusPill>
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill status="critical">{item.alert}</StatusPill>
                      </td>
                      <td className="max-w-sm px-3 py-3 text-[11px] leading-relaxed text-slate-400">
                        {item.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-2 md:hidden">
            {DICTIONARY.map((item) => {
              const Icon = item.Icon;
              return (
                <div key={item.symbol} className="panel-inset p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-space-700 bg-space-900"
                        style={{ color: item.color }}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div>
                        <span className="block font-heading text-[11.5px] font-bold text-slate-200">{item.variable}</span>
                        <span className="mono text-[9px] text-slate-600">{item.symbol} · {item.unit}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <StatusPill status="nominal">NOMINAL {item.normal}</StatusPill>
                    <StatusPill status="critical">ALERTA {item.alert}</StatusPill>
                  </div>
                  <p className="mt-2 text-[10.5px] leading-relaxed text-slate-400">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex items-start gap-2.5 rounded-md border border-cyan-400/15 bg-cyan-400/[0.04] p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-telemetry-cyan" aria-hidden="true" />
            <div className="text-[11px] leading-relaxed text-slate-400">
              <strong className="block font-heading text-[11px] font-bold text-slate-200">
                Nota de medicina aeroespacial
              </strong>
              En microgravedad, la pérdida de gradiente hidrostático provoca un desplazamiento cefálico de fluidos de
              aprox. 1.5 a 2 litros, alterando los volúmenes telediastólicos y los reflejos de barorreceptores.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-space-700/70 px-4 py-3">
          <span className="mono text-[9px] text-slate-600">FUENTE: docs/DATA_DICTIONARY.md</span>
          <button type="button" onClick={onClose} className="btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
