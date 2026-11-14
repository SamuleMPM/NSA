import React from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Gauge,
  Zap,
  CheckCircle2,
  ArrowRight,
  Radio,
  Sliders,
  Users,
  ChevronRight,
  Orbit,
  Cpu,
} from 'lucide-react';
import StatusPill from '../components/ui/StatusPill';
import RadialGauge from '../components/ui/RadialGauge';
import { PanelHeader } from '../components/ui/Panel';

const SCENARIO_LABELS = {
  microgravity: 'Microgravedad nominal',
  eva: 'Paseo espacial EVA',
  hypoxia: 'Alerta de hipoxia',
  hyperthermia: 'Estrés térmico',
  sleep: 'Ciclo de sueño',
};

const VITAL_META = {
  heart_rate: { label: 'HR', unit: 'bpm', icon: Heart, color: '#FB7185', name: 'Pulso' },
  spo2: { label: 'SpO2', unit: '%', icon: Activity, color: '#22D3EE', name: 'Oxígeno' },
  temperature: { label: 'TEMP', unit: '°C', icon: Thermometer, color: '#FBBF24', name: 'Temperatura' },
  respiratory_rate: { label: 'RR', unit: 'rpm', icon: Wind, color: '#60A5FA', name: 'Respiración' },
};

function roleCode(role = '') {
  if (role.toLowerCase().includes('comandante')) return 'CDR';
  if (role.toLowerCase().includes('biomédica')) return 'BMS';
  if (role.toLowerCase().includes('ingeniero')) return 'FE';
  return 'CREW';
}

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function vitalState(variable, value) {
  if (!Number.isFinite(Number(value))) return 'nominal';
  const v = Number(value);

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

function stateColor(state, fallback) {
  if (state === 'critical') return '#FB7185';
  if (state === 'warning') return '#FBBF24';
  return fallback;
}

function HealthBadge({ score }) {
  if (score >= 90) return <StatusPill status="nominal">NOMINAL</StatusPill>;
  if (score >= 70) return <StatusPill status="warning">ATENCIÓN</StatusPill>;
  return <StatusPill status="critical">CRÍTICO</StatusPill>;
}

export default function GeneralDashboard({
  missionId = 'mars_001',
  astronauts = {},
  selectedAstronautId,
  setSelectedAstronautId,
  latestVitalsByAstronaut = {},
  activeAlerts = [],
  environmentalData = {},
  currentScenario = 'microgravity',
  setActiveModule,
  onResetNominal,
}) {
  let totalScore = 100;
  activeAlerts.forEach((a) => {
    if (a.severity === 'CRITICAL') totalScore -= 18;
    else if (a.severity === 'WARNING') totalScore -= 7;
  });
  totalScore = Math.max(35, Math.min(100, totalScore));

  const healthColor = totalScore >= 90 ? '#34D399' : totalScore >= 70 ? '#FBBF24' : '#FB7185';
  const crewEntries = Object.entries(astronauts);
  const evaCount = crewEntries.filter(([, ast]) => ast.activity === 'EVA').length;
  const alertingCrew = Object.values(latestVitalsByAstronaut).filter((v) => v.isAlert).length;

  const eclssItems = [
    {
      label: 'PRESIÓN DEL TRAJE',
      value: environmentalData.suitPressure || 29.6,
      unit: 'kPa',
      range: '28.0 – 32.0 kPa',
      pct: 78,
      color: '#22D3EE',
      rail: 'rail-cyan',
      icon: Gauge,
      status: 'NOMINAL',
    },
    {
      label: 'RADIACIÓN CÓSMICA',
      value: environmentalData.radiation || 18.2,
      unit: 'μSv/h',
      range: 'BLINDAJE 98.2%',
      pct: 42,
      color: '#FBBF24',
      rail: 'rail-amber',
      icon: Zap,
      status: 'VIGILANCIA',
    },
    {
      label: 'CO₂ EN CIRCUITO',
      value: environmentalData.co2Level || 3.1,
      unit: 'mmHg',
      range: 'SCRUBBER LiOH · OK',
      pct: 26,
      color: '#34D399',
      rail: 'rail-green',
      icon: Wind,
      status: 'NOMINAL',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Command overview */}
      <section className="panel hud-corner relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(700px 260px at 82% -30%, rgba(34,211,238,0.14), transparent 70%), radial-gradient(420px 220px at 8% 120%, rgba(96,165,250,0.08), transparent 72%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(96,165,250,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.25) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.75), transparent 88%)',
          }}
          aria-hidden="true"
        />

        <div className="relative grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pill pill-cyan">MOD-01</span>
              <span className="eyebrow">FLIGHT SURGEON CONSOLE</span>
              <span className="h-1 w-1 rounded-full bg-slate-700" />
              <span className="mono flex items-center gap-1.5 text-[9px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_#34D399]" />
                TELEMETRÍA EN VIVO
              </span>
            </div>

            <h1 className="mt-2 font-heading text-[24px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[30px]">
              Estado biomédico de la tripulación
            </h1>
            <p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-slate-400">
              Monitoreo fisiológico holístico en tiempo real de los {crewEntries.length} astronautas de la misión{' '}
              <span className="mono font-semibold text-cyan-300">{missionId.toUpperCase()}</span>. Flujo continuo
              generado mediante modelos matemáticos sintéticos.
            </p>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <div className="panel-inset flex items-center gap-2 px-2.5 py-1.5">
                <Users className="h-3.5 w-3.5 text-telemetry-cyan" aria-hidden="true" />
                <span className="mono text-[9px] text-slate-500">TRIPULACIÓN</span>
                <span className="mono text-[11px] font-bold text-slate-200">{crewEntries.length}</span>
              </div>
              <div className="panel-inset flex items-center gap-2 px-2.5 py-1.5">
                <Orbit className="h-3.5 w-3.5 text-telemetry-blue" aria-hidden="true" />
                <span className="mono text-[9px] text-slate-500">EVA</span>
                <span className="mono text-[11px] font-bold text-amber-300">{evaCount}</span>
              </div>
              <div className="panel-inset flex items-center gap-2 px-2.5 py-1.5">
                <ShieldAlert className={`h-3.5 w-3.5 ${activeAlerts.length > 0 ? 'text-rose-300' : 'text-emerald-300'}`} aria-hidden="true" />
                <span className="mono text-[9px] text-slate-500">ALERTAS</span>
                <span className={`mono text-[11px] font-bold ${activeAlerts.length > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                  {activeAlerts.length}
                </span>
              </div>
              <div className="panel-inset hidden items-center gap-2 px-2.5 py-1.5 sm:flex">
                <Radio className="h-3.5 w-3.5 text-telemetry-green" aria-hidden="true" />
                <span className="mono text-[9px] text-slate-500">ENLACE</span>
                <span className="mono text-[11px] font-bold text-emerald-300">100%</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setActiveModule('telemetry')} className="btn btn-primary">
                <Activity className="h-3.5 w-3.5" />
                Abrir telemetría
              </button>
              <button type="button" onClick={() => setActiveModule('simulator')} className="btn">
                <Sliders className="h-3.5 w-3.5 text-telemetry-cyan" />
                Simulador
              </button>
              <button type="button" onClick={() => setActiveModule('alerts')} className="btn">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                Protocolos
              </button>
            </div>
          </div>

          {/* Consolidated health index */}
          <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
            <div className="panel-inset flex items-center gap-4 px-4 py-3.5">
              <RadialGauge value={totalScore} size={108} stroke={8} color={healthColor} label="Índice de salud">
                <span className="value-lg" style={{ color: healthColor }}>{totalScore}</span>
                <span className="mono text-[8px] uppercase tracking-[0.14em] text-slate-500">SALUD / 100</span>
              </RadialGauge>

              <div className="min-w-[112px]">
                <span className="eyebrow block">ÍNDICE GLOBAL</span>
                <div className="mt-1">
                  <HealthBadge score={totalScore} />
                </div>
                <p className="mono mt-1.5 text-[9px] leading-relaxed text-slate-500">
                  {activeAlerts.length === 0
                    ? 'SIN ANOMALÍAS ACTIVAS'
                    : `${activeAlerts.length} ANOMALÍA(S) EN CURSO`}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-space-800">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${totalScore}%`, backgroundColor: healthColor, boxShadow: `0 0 8px ${healthColor}` }}
                    />
                  </span>
                  <span className="mono text-[8px] text-slate-600">100</span>
                </div>
              </div>
            </div>

            <div className="panel-inset grid grid-cols-3 gap-0 px-3 py-2.5 sm:grid-cols-3 lg:grid-cols-3">
              <div className="px-2 text-center">
                <span className="value-sm block text-slate-200">{alertingCrew}</span>
                <span className="mono mt-0.5 block text-[8px] uppercase tracking-wider text-slate-600">BAJO ALERTA</span>
              </div>
              <div className="border-x border-space-700/70 px-2 text-center">
                <span className="value-sm block text-slate-200">{evaCount}</span>
                <span className="mono mt-0.5 block text-[8px] uppercase tracking-wider text-slate-600">EN EVA</span>
              </div>
              <div className="px-2 text-center">
                <span className="value-sm block text-emerald-300">03</span>
                <span className="mono mt-0.5 block text-[8px] uppercase tracking-wider text-slate-600">SENSORES</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crew matrix */}
      <section className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded border border-space-700 bg-space-900 text-telemetry-cyan">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow block">CREW BIOMEDICAL MATRIX</span>
              <h2 className="font-heading text-[14px] font-bold text-slate-100">Matriz de tripulación</h2>
            </div>
          </div>
          <span className="mono hidden text-[9px] text-slate-600 sm:block">
            SELECCIONA UN ASTRONAUTA PARA ABRIR MOD-02
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {crewEntries.map(([id, ast]) => {
            const vitals = latestVitalsByAstronaut[id] || {};
            const isAlert = Boolean(vitals.isAlert);
            const isSelected = id === selectedAstronautId;
            const states = Object.keys(VITAL_META).map((key) => vitalState(key, vitals[key]));
            const worstState = states.includes('critical') ? 'critical' : states.includes('warning') ? 'warning' : 'nominal';

            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSelectedAstronautId(id);
                  setActiveModule('telemetry');
                }}
                className={`panel hud-corner group relative overflow-hidden p-3.5 text-left transition-all duration-150 ${
                  worstState === 'critical'
                    ? 'panel-critical'
                    : worstState === 'warning'
                      ? 'panel-warning'
                      : isSelected
                        ? 'panel-active'
                        : 'panel-hover'
                }`}
                aria-label={`Abrir telemetría de ${ast.name}`}
              >
                <span
                  className="absolute inset-x-0 top-0 h-[2px]"
                  style={{
                    background:
                      worstState === 'critical'
                        ? 'linear-gradient(90deg, transparent, #FB7185, transparent)'
                        : worstState === 'warning'
                          ? 'linear-gradient(90deg, transparent, #FBBF24, transparent)'
                          : isSelected
                            ? 'linear-gradient(90deg, transparent, #22D3EE, transparent)'
                            : 'transparent',
                  }}
                  aria-hidden="true"
                />

                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-heading text-[10px] font-extrabold ${
                        worstState === 'critical'
                          ? 'border-rose-400/40 bg-rose-400/10 text-rose-200'
                          : isSelected
                            ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
                            : 'border-space-700 bg-space-900 text-slate-400'
                      }`}
                    >
                      {initials(ast.name)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-heading text-[13px] font-bold text-slate-100">{ast.name}</span>
                        <span className="mono text-[8px] text-slate-600">{roleCode(ast.role)}</span>
                        {worstState === 'critical' ? (
                          <AlertTriangle className="h-3 w-3 shrink-0 text-rose-300" aria-hidden="true" />
                        ) : null}
                      </div>
                      <span className="mono mt-0.5 block truncate text-[9px] text-slate-500">
                        {id.toUpperCase()} · {ast.role}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`mono shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold ${
                      ast.activity === 'EVA'
                        ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                        : 'border-space-700 bg-space-900 text-slate-500'
                    }`}
                  >
                    {ast.activity}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {Object.entries(VITAL_META).map(([key, meta]) => {
                    const Icon = meta.icon;
                    const state = vitalState(key, vitals[key]);
                    const color = stateColor(state, meta.color);
                    return (
                      <div key={key} className="panel-inset px-2 py-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="mono flex items-center gap-1 text-[8px] uppercase tracking-wider text-slate-600">
                            <Icon className="h-2.5 w-2.5" style={{ color }} aria-hidden="true" />
                            {meta.label}
                          </span>
                          <span
                            className={`h-1 w-1 rounded-full ${state === 'critical' ? 'bg-rose-400' : state === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="value-sm" style={{ color: state === 'nominal' ? '#EAF3FF' : color }}>
                            {vitals[key] ?? '--'}
                          </span>
                          <span className="mono text-[7.5px] text-slate-600">{meta.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-space-700/60 pt-2">
                  <span className="mono flex items-center gap-1.5 text-[8.5px] font-semibold text-slate-500">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        worstState === 'critical'
                          ? 'bg-rose-400'
                          : worstState === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                      }`}
                    />
                    {worstState === 'critical' ? 'DESVIACIÓN CRÍTICA' : worstState === 'warning' ? 'FUERA DE RANGO' : 'PARÁMETROS NOMINALES'}
                  </span>
                  <span className="mono flex items-center gap-0.5 text-[8.5px] font-semibold text-slate-500 transition-colors group-hover:text-cyan-300">
                    LEAD II
                    <ChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ECLSS + Alerts */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <section className="panel overflow-hidden lg:col-span-7">
          <PanelHeader
            icon={ShieldCheck}
            kicker="ENVIRONMENTAL CONTROL"
            title="Soporte vital y entorno · ECLSS"
            status={<StatusPill status="nominal">OPERACIONAL</StatusPill>}
          />

          <div className="space-y-3 p-3.5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {eclssItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="panel-inset p-2.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="mono flex items-center gap-1.5 text-[8px] uppercase tracking-wider text-slate-500">
                        <Icon className="h-3 w-3" style={{ color: item.color }} aria-hidden="true" />
                        {item.label}
                      </span>
                      <span className="mono text-[7.5px] font-bold" style={{ color: item.color }}>{item.status}</span>
                    </div>
                    <div className="mt-1.5 flex items-baseline justify-between gap-1">
                      <span className="value-md" style={{ color: item.color }}>{item.value}</span>
                      <span className="mono text-[8px] text-slate-600">{item.unit}</span>
                    </div>
                    <div className="rail mt-2">
                      <div className={`rail-fill ${item.rail}`} style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="mono mt-1.5 block text-[8px] text-slate-600">{item.range}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-space-700/70 bg-space-900/40 px-2.5 py-2">
              <span className="mono flex items-center gap-2 text-[10px] text-slate-400">
                <Radio className="h-3.5 w-3.5 text-telemetry-cyan animate-pulse" aria-hidden="true" />
                Escenario activo:
                <strong className="font-bold uppercase text-slate-100">
                  {SCENARIO_LABELS[currentScenario] || currentScenario}
                </strong>
              </span>
              <button type="button" onClick={() => setActiveModule('simulator')} className="btn btn-ghost !min-h-0 !px-2 !py-1 text-[10px]">
                Ajustar escenario
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <section className="panel flex flex-col overflow-hidden lg:col-span-5">
          <PanelHeader
            icon={ShieldAlert}
            kicker="CLINICAL ALERTS"
            title="Alertas activas"
            status={
              <StatusPill status={activeAlerts.length > 0 ? 'critical' : 'nominal'}>
                {activeAlerts.length > 0 ? `${activeAlerts.length} CRÍTICAS` : 'NOMINAL'}
              </StatusPill>
            }
          />

          <div className="flex flex-1 flex-col justify-between p-3.5">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-md border border-emerald-400/15 bg-emerald-400/[0.035] px-4 py-6 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.07]">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                </span>
                <div>
                  <h4 className="font-heading text-[12px] font-bold text-emerald-200">Todos los parámetros en rango</h4>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">
                    Ningún astronauta se encuentra fuera de los límites clínicos definidos en DATA_DICTIONARY.md.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                {activeAlerts.map((alert, idx) => (
                  <div
                    key={`${alert.astronautId}-${alert.variable}-${idx}`}
                    className="rounded-md border border-rose-400/25 bg-rose-400/[0.045] px-2.5 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-rose-300" aria-hidden="true" />
                        <span className="truncate font-heading text-[10.5px] font-bold text-rose-100">
                          {alert.astronautName}
                        </span>
                        <span className="mono truncate text-[8.5px] text-slate-500">{alert.variable}</span>
                      </div>
                      <span className="mono shrink-0 rounded border border-rose-400/30 bg-rose-400/10 px-1 py-0.5 text-[8px] font-bold text-rose-200">
                        {alert.value} {alert.unit}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[9.5px] leading-snug text-slate-400">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex flex-col gap-2 border-t border-space-700/60 pt-2.5 sm:flex-row sm:items-center">
              {activeAlerts.length > 0 ? (
                <button type="button" onClick={onResetNominal} className="btn btn-success sm:flex-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Estabilizar tripulación
                </button>
              ) : (
                <span className="mono flex items-center gap-1.5 text-[9px] text-slate-600 sm:flex-1">
                  <Cpu className="h-3 w-3" aria-hidden="true" />
                  ÁRBOL DE ALERTAS MONITOREANDO
                </span>
              )}
              <button type="button" onClick={() => setActiveModule('alerts')} className="btn sm:flex-1">
                Abrir MOD-04
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
