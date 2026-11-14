import React from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import StatusPill from './ui/StatusPill';
import Sparkline from './ui/Sparkline';

const METRIC_META = {
  heart_rate: {
    code: 'HR',
    icon: Heart,
    accent: '#FB7185',
    spark: '#FB7185',
    stroke: 'from-rose-400/70',
  },
  spo2: {
    code: 'SpO2',
    icon: Activity,
    accent: '#22D3EE',
    spark: '#22D3EE',
    stroke: 'from-cyan-400/70',
  },
  temperature: {
    code: 'TEMP',
    icon: Thermometer,
    accent: '#FBBF24',
    spark: '#FBBF24',
    stroke: 'from-amber-400/70',
  },
  respiratory_rate: {
    code: 'RR',
    icon: Wind,
    accent: '#60A5FA',
    spark: '#60A5FA',
    stroke: 'from-blue-400/70',
  },
};

const DOMAINS = {
  heart_rate: { min: 40, max: 160, normalMin: 60, normalMax: 100 },
  spo2: { min: 70, max: 100, normalMin: 95, normalMax: 100 },
  temperature: { min: 34.5, max: 40.5, normalMin: 36.1, normalMax: 37.2 },
  respiratory_rate: { min: 6, max: 34, normalMin: 12, normalMax: 20 },
};

function clampPct(n) {
  return Math.min(100, Math.max(0, n));
}

export default function VitalCard({
  title,
  variable,
  value,
  prevValue,
  unit,
  normalRange,
  alertCondition,
  status = 'normal',
  statusMessage,
  history = [],
  index = 0,
}) {
  const isAlert = status === 'alerta';
  const isWarning = status === 'advertencia';
  const meta = METRIC_META[variable] || METRIC_META.heart_rate;
  const Icon = meta.icon;
  const domain = DOMAINS[variable] || DOMAINS.heart_rate;

  const delta =
    prevValue !== undefined && prevValue !== null && Number.isFinite(Number(value)) && Number.isFinite(Number(prevValue))
      ? Number((Number(value) - Number(prevValue)).toFixed(1))
      : 0;

  const values = history
    .slice(-24)
    .map((item) => Number(item[variable]))
    .filter((n) => Number.isFinite(n));

  const gaugePct = clampPct(((Number(value) - domain.min) / (domain.max - domain.min)) * 100);
  const normalStart = clampPct(((domain.normalMin - domain.min) / (domain.max - domain.min)) * 100);
  const normalWidth = clampPct(((domain.normalMax - domain.normalMin) / (domain.max - domain.min)) * 100);

  const alertColor = isAlert ? '#FB7185' : isWarning ? '#FBBF24' : meta.accent;
  const sparkColor = isAlert ? '#FB7185' : isWarning ? '#FBBF24' : meta.spark;

  const deltaTone =
    delta === 0
      ? 'text-slate-500 bg-white/[0.03] border-space-700/70'
      : variable === 'spo2'
        ? delta > 0
          ? 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20'
          : 'text-rose-300 bg-rose-400/10 border-rose-400/20'
        : delta > 0
          ? 'text-amber-300 bg-amber-400/10 border-amber-400/20'
          : 'text-cyan-300 bg-cyan-400/10 border-cyan-400/20';

  return (
    <article
      className={`panel hud-corner group relative overflow-hidden p-3.5 transition-colors ${
        isAlert ? 'panel-critical' : isWarning ? 'panel-warning' : 'panel-hover'
      }`}
      aria-live="polite"
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, transparent, ${alertColor}, transparent)` }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-space-700/80 bg-space-900/80"
            style={{ color: alertColor }}
          >
            <Icon className={`h-4 w-4 ${isAlert ? 'animate-pulse' : ''}`} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="mono text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {meta.code}
              </span>
              <span className="h-2.5 w-px bg-space-700" />
              <span className="mono text-[9px] text-slate-500">REF {normalRange}</span>
            </div>
            <h3 className="mt-0.5 truncate font-heading text-[12.5px] font-bold tracking-tight text-slate-100">
              {title}
            </h3>
          </div>
        </div>

        <StatusPill status={isAlert ? 'critical' : isWarning ? 'warning' : 'nominal'}>
          {isAlert ? 'CRÍTICO' : isWarning ? 'ADVERTENCIA' : 'NOMINAL'}
        </StatusPill>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className="value-lg"
            style={{ color: isAlert || isWarning ? alertColor : '#EAF3FF' }}
          >
            {value !== undefined ? value : '--'}
          </span>
          <span className="mono pb-0.5 text-[10px] font-semibold text-slate-500">{unit}</span>
        </div>

        <span className={`mono inline-flex items-center gap-1 rounded border px-1.5 py-1 text-[9.5px] font-bold ${deltaTone}`}>
          {delta > 0 ? (
            <TrendingUp className="h-3 w-3" aria-hidden="true" />
          ) : delta < 0 ? (
            <TrendingDown className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Minus className="h-3 w-3" aria-hidden="true" />
          )}
          {delta > 0 ? `+${delta}` : delta === 0 ? '0.0' : delta}
        </span>
      </div>

      <div className="mt-1 h-9 w-full">
        <Sparkline
          values={values}
          width={220}
          height={36}
          color={sparkColor}
          id={`${variable}-${index}`}
          className="h-full w-full"
        />
      </div>

      <div className="mt-1.5">
        <div className="vital-rail-track">
          <div
            className={`absolute inset-y-0 left-0 ${
              isAlert ? 'rail-red' : isWarning ? 'rail-amber' : 'rail-cyan'
            }`}
            style={{ width: `${gaugePct}%`, borderRadius: 999 }}
            aria-hidden="true"
          />
          <div
            className="vital-rail-normal z-[2]"
            style={{ left: `${normalStart}%`, width: `${normalWidth}%` }}
            aria-hidden="true"
          />
          <span
            className="absolute top-1/2 z-[3] h-2 w-2 -translate-y-1/2 rounded-full border border-space-950"
            style={{ left: `calc(${gaugePct}% - 4px)`, backgroundColor: alertColor, boxShadow: `0 0 8px ${alertColor}` }}
            aria-hidden="true"
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-2 font-mono text-[8.5px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-emerald-400/80" />
            ZONA NOMINAL
          </span>
          <span className="truncate text-right" title={statusMessage || 'Parámetro nominal'}>
            {statusMessage || 'Parámetro nominal'}
          </span>
        </div>
      </div>

      <div className="mt-2 border-t border-space-700/60 pt-1.5">
        <div className="flex items-center justify-between gap-2 font-mono text-[8.5px] text-slate-500">
          <span>UMBRAL ALERTA</span>
          <span className="font-bold text-slate-400">{alertCondition}</span>
        </div>
      </div>
    </article>
  );
}
