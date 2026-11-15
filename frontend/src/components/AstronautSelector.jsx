import React from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import StatusPill from './ui/StatusPill';

function roleCode(role = '') {
  if (role.toLowerCase().includes('comandante')) return 'CDR';
  if (role.toLowerCase().includes('biomédica')) return 'BMS';
  if (role.toLowerCase().includes('ingeniero')) return 'FE';
  return 'CREW';
}

function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function vitalLevel(variable, value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 'nominal';

  if (variable === 'heart_rate') {
    if (v > 120 || v < 50) return 'critical';
    if (v < 60 || v > 100) return 'warning';
    return 'nominal';
  }
  if (variable === 'spo2') {
    if (v < 90) return 'critical';
    if (v < 95) return 'warning';
    return 'nominal';
  }
  if (variable === 'temperature') {
    if (v > 38.0) return 'critical';
    if (v < 36.1 || v > 37.2) return 'warning';
    return 'nominal';
  }
  if (variable === 'respiratory_rate') {
    if (v > 24 || v < 10) return 'critical';
    if (v < 12 || v > 20) return 'warning';
    return 'nominal';
  }
  return 'nominal';
}

export default function AstronautSelector({
  astronauts = {},
  selectedId,
  onSelect,
  latestVitalsByAstronaut = {},
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {Object.entries(astronauts).map(([id, ast]) => {
        const isSelected = id === selectedId;
        const vitals = latestVitalsByAstronaut[id] || {};
        const isEva = ast.activity === 'EVA';

        const metrics = [
          {
            key: 'heart_rate',
            label: 'HR',
            value: vitals.heart_rate,
            unit: 'bpm',
            icon: Heart,
            color: '#1D4ED8',
          },
          {
            key: 'spo2',
            label: 'SpO2',
            value: vitals.spo2,
            unit: '%',
            icon: Activity,
            color: '#0EA5E9',
          },
          {
            key: 'temperature',
            label: 'TEMP',
            value: vitals.temperature,
            unit: '°C',
            icon: Thermometer,
            color: '#2563EB',
          },
          {
            key: 'respiratory_rate',
            label: 'RR',
            value: vitals.respiratory_rate,
            unit: 'rpm',
            icon: Wind,
            color: '#38BDF8',
          },
        ];

        const levels = metrics.map((metric) => vitalLevel(metric.key, metric.value));
        const worstLevel = levels.includes('critical')
          ? 'critical'
          : levels.includes('warning')
            ? 'warning'
            : 'nominal';
        const isCritical = worstLevel === 'critical';
        const isWarning = worstLevel === 'warning';

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={`panel group relative overflow-hidden p-3 text-left transition-all duration-150 ${
              isCritical
                ? 'panel-critical'
                : isWarning
                  ? 'panel-warning'
                  : isSelected
                    ? 'panel-active border-[#1D4ED8] bg-[#DBEAFE]/25 shadow-co-md'
                    : 'panel-hover'
            }`}
            aria-pressed={isSelected}
          >
            <span
              className="absolute inset-x-0 top-0 h-[2px]"
              style={{
                background: isCritical
                  ? 'linear-gradient(90deg, transparent, #A16207, transparent)'
                  : isWarning
                    ? 'linear-gradient(90deg, transparent, #0369A1, transparent)'
                    : isSelected
                      ? 'linear-gradient(90deg, transparent, #1D4ED8, transparent)'
                      : 'transparent',
              }}
              aria-hidden="true"
            />

            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-heading text-[11px] font-extrabold ${
                    isCritical
                      ? 'border-[#FDE68A] bg-[#FEF3C7] text-[#A16207]'
                      : isWarning
                        ? 'border-[#BAE6FD] bg-[#E0F2FE] text-[#0369A1]'
                        : isSelected
                          ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                          : 'border-[#C9D9F5] bg-[#DBEAFE] text-[#1D4ED8]'
                  }`}
                >
                  {initials(ast.name)}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-heading text-[12.5px] font-bold text-[#0B1B3A]">
                      {ast.name}
                    </span>
                    <span className="mono text-[8.5px] text-[#47598A]">{roleCode(ast.role)}</span>
                    {isCritical || isWarning ? (
                      <AlertTriangle
                        className={`h-3 w-3 shrink-0 ${isCritical ? 'text-[#A16207]' : 'text-[#0369A1]'}`}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <span className="mono mt-0.5 block truncate text-[9px] text-[#47598A]">
                    {id.toUpperCase()} · {ast.role}
                  </span>
                </div>
              </div>

              <span
                className={`mono shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold ${
                  isSelected
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                    : isEva
                      ? 'border-[#C9D9F5] bg-[#DBEAFE] text-[#1D4ED8]'
                      : 'border-[#C9D9F5] bg-white text-[#47598A]'
                }`}
              >
                {ast.activity}
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-4 gap-1.5">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                const level = vitalLevel(metric.key, metric.value);
                const metricColor =
                  level === 'critical' ? '#A16207' : level === 'warning' ? '#0369A1' : metric.color;
                return (
                  <div key={metric.key} className="panel-inset px-1.5 py-1.5">
                    <span className="mono flex items-center gap-1 text-[8px] uppercase tracking-wider text-[#47598A]">
                      <Icon className="h-2.5 w-2.5" style={{ color: metricColor }} aria-hidden="true" />
                      {metric.label}
                    </span>
                    <span
                      className={`mono mt-1 block text-[10.5px] font-bold ${
                        level === 'critical'
                          ? 'text-[#A16207]'
                          : level === 'warning'
                            ? 'text-[#0369A1]'
                            : 'text-[#0B1B3A]'
                      }`}
                    >
                      {metric.value ?? '--'}
                      <span className="ml-0.5 text-[7.5px] font-normal text-[#47598A]">{metric.unit}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#C9D9F5] pt-1.5">
              <StatusPill
                status={isCritical ? 'critical' : isWarning ? 'warning' : 'nominal'}
                dot={false}
              >
                {isCritical || isWarning ? (
                  <>
                    <AlertTriangle className="mr-1 inline h-2.5 w-2.5" aria-hidden="true" />
                    {isCritical ? 'CRÍTICO' : 'ADVERTENCIA'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-1 inline h-2.5 w-2.5" aria-hidden="true" />
                    NOMINAL
                  </>
                )}
              </StatusPill>
              <span className="mono flex items-center gap-0.5 text-[8.5px] font-semibold text-[#47598A] group-hover:text-[#1D4ED8]">
                TELEMETRÍA
                <ChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
