import React, { useEffect } from 'react';
import {
  X,
  BookOpen,
  Heart,
  Activity,
  Thermometer,
  Wind,
  ShieldCheck,
  Apple,
  Eye,
  Brain,
  Bone,
  Gauge,
} from 'lucide-react';
import StatusPill from './ui/StatusPill';

const DICTIONARY = [
  {
    variable: 'Frecuencia Cardíaca',
    symbol: 'HR',
    unit: 'bpm',
    normal: '60 – 100',
    alert: '> 120 o < 50',
    description: 'Frecuencia de contracción ventricular. Monitorizada continuamente mediante derivación Lead II.',
    hazardLink: 'G — Desacondicionamiento cardiovascular por ingravidez',
    Icon: Heart,
    color: '#FB7185',
  },
  {
    variable: 'Presión Arterial (Sistólica/Diastólica)',
    symbol: 'PA',
    unit: 'mmHg',
    normal: '100-120 / 60-80',
    alert: '> 140/90 o < 90/60',
    description: 'Fuerza hemodinámica arterial. Elevada en fase aguda por redistribución de 2L de fluidos a cabeza y tórax.',
    hazardLink: 'G — Desplazamiento cefálico de fluidos & barorreflejos',
    Icon: Gauge,
    color: '#F472B6',
  },
  {
    variable: 'Saturación de Oxígeno',
    symbol: 'SpO2',
    unit: '%',
    normal: '95 – 100',
    alert: '< 90',
    description: 'Porcentaje de oxihemoglobina en sangre capilar arterial. Crítico en paseos espaciales (EVA).',
    hazardLink: 'E — Fuga de traje o despresurización de hábitat',
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
    hazardLink: 'E — Fallo de refrigeración LCVG o infección',
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
    hazardLink: 'E — Hipercapnia por bolsa de CO2 sin convección',
    Icon: Wind,
    color: '#60A5FA',
  },
  {
    variable: 'Glucosa en Sangre',
    symbol: 'GLUC',
    unit: 'mg/dL',
    normal: '70 – 110',
    alert: '> 140 o < 65',
    description: 'Concentración de glucosa capilar. En 0g hay resistencia transitoria a insulina por falta de uso muscular.',
    hazardLink: 'G / E — Alteración del metabolismo y nutrición espacial',
    Icon: Apple,
    color: '#FBBF24',
  },
  {
    variable: 'Horas y Calidad de Sueño',
    symbol: 'SLEEP',
    unit: 'h',
    normal: '7.0 – 8.5',
    alert: '< 6.0 o > 10.0',
    description: 'Duración y fases del descanso registradas por actigrafía. Vital para la toma de decisiones críticas.',
    hazardLink: 'I — Desincronización circadiana (16 amaneceres/día)',
    Icon: Brain,
    color: '#A78BFA',
  },
  {
    variable: 'Estrés y Salud Mental',
    symbol: 'STRESS',
    unit: '%',
    normal: '0 – 35',
    alert: '> 65',
    description: 'Índice psicométrico de tensión cognitiva y bienestar emocional en hábitat cerrado.',
    hazardLink: 'I / D — Confinamiento prolongado y distancia con la Tierra',
    Icon: Brain,
    color: '#A78BFA',
  },
  {
    variable: 'Vaina Nervio Óptico (SANS)',
    symbol: 'ONSD',
    unit: 'mm',
    normal: '4.5 – 5.4',
    alert: '> 5.8',
    description: 'Diámetro ecográfico retrobulbar. > 5.8 mm indica hipertensión intracraneal y edema de papila por fluid shift.',
    hazardLink: 'G — Síndrome Neuro-Ocular Asociado a Vuelos Espaciales',
    Icon: Eye,
    color: '#22D3EE',
  },
  {
    variable: 'Pérdida de Densidad Ósea',
    symbol: 'BMD',
    unit: '%/mes',
    normal: '< 0.35',
    alert: '> 0.90',
    description: 'Tasa mensual de resorción ósea en fémur y columna lumbar. Mitigable con 120 min de ejercicio ARED.',
    hazardLink: 'G — Desmineralización por falta de carga mecánica en 0g',
    Icon: Bone,
    color: '#34D399',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-dict-title"
    >
      <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-space-800 bg-space-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-space-800 p-5 bg-space-950/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 id="data-dict-title" className="font-heading text-base font-bold text-white">
                Diccionario de Indicadores Biomédicos (NASA HRP)
              </h2>
              <p className="text-xs text-slate-400">
                Variables fisiológicas, rangos operacionales, umbrales de alerta y vínculo con los 5 Riesgos RIDGE.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-space-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {DICTIONARY.map((item, idx) => {
            const IconComp = item.Icon;

            return (
              <div
                key={idx}
                className="rounded-xl border border-space-800 bg-space-850/60 p-4 transition hover:border-space-700 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                      style={{
                        borderColor: `${item.color}40`,
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      }}
                    >
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.variable}</span>
                        <span className="rounded bg-space-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                          {item.symbol}
                        </span>
                        <span className="font-mono text-xs text-slate-400">({item.unit})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded bg-telemetry-green/10 border border-telemetry-green/30 px-2.5 py-1 font-mono text-xs text-telemetry-green">
                      Nominal: {item.normal}
                    </div>
                    <div className="rounded bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 font-mono text-xs text-rose-300">
                      Alerta: {item.alert}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-12">
                  {item.description}
                </p>

                <div className="pl-12 flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                  <span className="text-slate-500">Riesgo NASA:</span>
                  <span>{item.hazardLink}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-space-800 p-4 bg-space-950/70 font-mono text-xs text-slate-400">
          <span>Estándar: NASA Human Research Program — Artemis Clinical Specs</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-space-800 px-4 py-1.5 text-white hover:bg-space-700 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
