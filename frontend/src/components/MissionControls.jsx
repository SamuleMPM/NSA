import React from 'react';
import {
  Play,
  Pause,
  RefreshCw,
  AlertOctagon,
  ShieldCheck,
  Gauge,
  Flame,
  Wind,
  Moon,
  Orbit,
  CircleDot,
  SlidersHorizontal,
  Radio,
  Radiation,
  Brain,
  Cloud,
  FlaskConical,
} from 'lucide-react';
import { SCENARIO_DEFINITIONS } from '../lib/simulation';
import { formatNumber } from '../lib/format';

const SCENARIO_ICONS = {
  circle: CircleDot,
  orbit: Orbit,
  wind: Wind,
  flame: Flame,
  moon: Moon,
  radiation: Radiation,
  brain: Brain,
  cloud: Cloud,
};

const TONES = {
  green: 'border-emerald-400/25 bg-emerald-400/[0.06] text-emerald-300',
  amber: 'border-amber-400/25 bg-amber-400/[0.06] text-amber-300',
  red: 'border-rose-400/30 bg-rose-400/[0.07] text-rose-300',
  cyan: 'border-cyan-400/25 bg-cyan-400/[0.06] text-cyan-300',
  violet: 'border-violet-400/25 bg-violet-400/[0.06] text-violet-300',
};

export default function MissionControls({
  currentScenario,
  onSelectScenario,
  isAutoSimulating,
  onToggleAutoSim,
  onGenerateTick,
  onTriggerEmergency,
  onResetNominal,
  environmentalData = {},
  environment,
}) {
  const envItems = [
    {
      label: 'PRESIÓN DE CABINA',
      value: environmentalData.suitPressure ?? environment?.cabinPressureKpa ?? 101.3,
      unit: 'kPa',
      icon: Gauge,
      color: '#22D3EE',
      rail: 'rail-cyan',
      pct: 78,
      range: '≈101.3 kPa · parámetro de simulación',
    },
    {
      label: 'RADIACIÓN',
      value: environmentalData.radiation ?? environment?.radiationRateUsVh ?? 75,
      unit: 'µSv/h',
      icon: Flame,
      color: '#FBBF24',
      rail: 'rail-amber',
      pct: 42,
      range: `${formatNumber(environment?.radiationDailyMsv, 2)} mSv/día`,
    },
    {
      label: 'CO₂ EN CIRCUITO',
      value: environmentalData.co2Level ?? environment?.co2MmHg ?? 3.1,
      unit: 'mmHg',
      icon: Wind,
      color: '#34D399',
      rail: 'rail-green',
      pct: 26,
      range: 'Referencia del proyecto <4 mmHg',
    },
  ];

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-space-700/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow block">SIMULATION ENGINE / SCENARIO INJECTION</span>
            <h3 className="font-heading text-[13px] font-bold text-slate-100">
              Control de escenarios fisiológicos
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="pill pill-violet">
            <FlaskConical className="h-3 w-3" aria-hidden="true" />
            SIMULADO
          </span>
          <span className="pill">ENGINE SIM-V2</span>
        </div>
      </div>

      <div className="space-y-3 p-3.5 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onToggleAutoSim}
            className={`btn ${isAutoSimulating ? 'btn-danger' : 'btn-primary'} sm:min-w-[154px]`}
          >
            {isAutoSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isAutoSimulating ? 'PAUSAR FLUJO' : 'TRANSMISIÓN EN VIVO'}
          </button>

          <button type="button" onClick={onGenerateTick} className="btn">
            <RefreshCw className="h-3.5 w-3.5 text-telemetry-cyan" aria-hidden="true" />
            Generar tick
          </button>

          <button type="button" onClick={onTriggerEmergency} className="btn btn-danger sm:ml-auto">
            <AlertOctagon className="h-3.5 w-3.5" aria-hidden="true" />
            Inyectar hipoxia
          </button>

          <button type="button" onClick={onResetNominal} className="btn btn-success">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Restablecer
          </button>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="eyebrow">ESCENARIOS DISPONIBLES · 9</span>
            <span className="mono text-[9px] text-slate-600">SELECCIONA PARA INYECTAR</span>
          </div>

          <div className="grid max-h-[340px] grid-cols-1 gap-1.5 overflow-y-auto pr-0.5 sm:grid-cols-2">
            {SCENARIO_DEFINITIONS.map((scenario) => {
              const Icon = SCENARIO_ICONS[scenario.icon] || CircleDot;
              const isCurrent = currentScenario === scenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => onSelectScenario(scenario.id)}
                  className={`group relative overflow-hidden rounded-md border p-2.5 text-left transition-all duration-150 ${
                    isCurrent
                      ? 'border-cyan-400/45 bg-cyan-400/[0.07] shadow-hud-glow'
                      : 'border-space-700/70 bg-space-900/45 hover:border-space-500/70 hover:bg-space-800/55'
                  }`}
                  aria-pressed={isCurrent}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${TONES[scenario.tone] || TONES.cyan}`}>
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="mono text-[8.5px] text-slate-600">{scenario.code}</span>
                          <span className="truncate font-heading text-[11.5px] font-bold text-slate-200">
                            {scenario.name}
                          </span>
                        </div>
                        <p className="mono mt-0.5 line-clamp-1 text-[8.5px] text-slate-500">
                          {scenario.desc}
                        </p>
                      </div>
                    </div>

                    <span className={`mono shrink-0 rounded border px-1 py-0.5 text-[7.5px] font-bold ${TONES[scenario.tone] || TONES.cyan}`}>
                      {scenario.badge}
                    </span>
                  </div>

                  {isCurrent ? (
                    <span className="mono mt-2 flex items-center gap-1 text-[8px] font-bold text-cyan-300">
                      <Radio className="h-2.5 w-2.5 animate-pulse" aria-hidden="true" />
                      ESCENARIO ACTIVO
                    </span>
                  ) : (
                    <span className="mono mt-2 flex items-center gap-1 text-[8px] text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
                      INYECTAR ESCENARIO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-space-700/60 pt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="eyebrow">SOPORTE VITAL / ECLSS SIMULADO</span>
            <span className="mono flex items-center gap-1 text-[9px] text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              OPERACIONAL
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {envItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="panel-inset px-2.5 py-2">
                  <span className="mono flex items-center gap-1.5 text-[8.5px] uppercase tracking-wider text-slate-500">
                    <Icon className="h-3 w-3" style={{ color: item.color }} aria-hidden="true" />
                    {item.label}
                  </span>
                  <div className="mt-1 flex items-baseline justify-between gap-1">
                    <span className="value-sm" style={{ color: item.color }}>{item.value}</span>
                    <span className="mono text-[8.5px] text-slate-600">{item.unit}</span>
                  </div>
                  <div className="rail mt-1.5">
                    <div className={`rail-fill ${item.rail}`} style={{ width: `${item.pct}%` }} />
                  </div>
                  <span className="mono mt-1 block truncate text-[8px] text-slate-600">{item.range}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mono text-[8.5px] leading-relaxed text-slate-600">
          Todos los valores generados por este motor son sintéticos y están marcados como simulados. No representan telemetría real de la NASA.
        </p>
      </div>
    </section>
  );
}
