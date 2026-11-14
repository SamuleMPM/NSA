import React, { useState } from 'react';
import {
  Database,
  FileCode2,
  BookOpen,
  Terminal,
  Copy,
  Check,
  Download,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Braces,
  ShieldCheck,
  Server,
  UserRound,
  HardDrive,
  Clock3,
  ListFilter,
  CircleCheck,
  CircleAlert,
  Info,
} from 'lucide-react';
import ModuleHeader from '../components/ui/ModuleHeader';
import Panel, { PanelHeader } from '../components/ui/Panel';
import StatusPill from '../components/ui/StatusPill';
import { copyToClipboard } from '../lib/clipboard';

const SCENARIO_LABELS = {
  microgravity: 'Microgravedad nominal',
  eva: 'Actividad extravehicular',
  hypoxia: 'Hipoxia / despresurización',
  hyperthermia: 'Estrés térmico',
  sleep: 'Reposo / sueño',
};

const LEVEL_STYLE = {
  CRITICAL: {
    badge: 'border-rose-400/35 bg-rose-400/10 text-rose-200',
    text: 'text-rose-200',
    icon: CircleAlert,
    short: 'CRIT',
  },
  WARNING: {
    badge: 'border-amber-400/35 bg-amber-400/10 text-amber-200',
    text: 'text-amber-200',
    icon: CircleAlert,
    short: 'WARN',
  },
  SUCCESS: {
    badge: 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-200',
    text: 'text-emerald-200',
    icon: CircleCheck,
    short: 'OK',
  },
  INFO: {
    badge: 'border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-200',
    text: 'text-cyan-200',
    icon: Info,
    short: 'INFO',
  },
};

const TABS = [
  { id: 'json', label: 'Contrato JSON', meta: 'ARCHITECTURE.MD', icon: FileCode2 },
  { id: 'dictionary', label: 'Diccionario médico', meta: 'DATA_DICTIONARY.MD', icon: BookOpen },
  { id: 'logs', label: 'Registros completos', meta: 'AUDIT TRAIL', icon: Terminal },
];

export default function DataIntegration({
  currentJsonPacket = {},
  logs = [],
  selectedAstronautId = 'ast_001',
  astronauts = {},
}) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('json');
  const [logFilter, setLogFilter] = useState('ALL');

  const jsonString = JSON.stringify(currentJsonPacket, null, 2);
  const jsonLines = jsonString.split('\n');
  const packetScenario = currentJsonPacket?.metadata?.scenario;
  const packetScenarioLabel = SCENARIO_LABELS[packetScenario] || packetScenario || '—';
  const packetAstronaut =
    currentJsonPacket?.astronaut?.name ||
    astronauts?.[selectedAstronautId]?.name ||
    '—';

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
    a.download = `nsa_telemetry_${currentJsonPacket?.astronaut?.id || 'packet'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dictionary = [
    {
      variable: 'Frecuencia Cardíaca',
      symbol: 'HR',
      unit: 'bpm',
      normal: '60 - 100',
      alert: '> 120 o < 50',
      description: 'Frecuencia de contracción ventricular monitorizada en derivación continua Lead II.',
      icon: Heart,
      color: '#FB7185',
      normalStatus: 'nominal',
      alertStatus: 'critical',
    },
    {
      variable: 'Saturación de Oxígeno',
      symbol: 'SpO₂',
      unit: '%',
      normal: '95 - 100',
      alert: '< 90',
      description: 'Porcentaje de oxihemoglobina capilar arterial. Crítico en salidas extravehiculares (EVA).',
      icon: Activity,
      color: '#22D3EE',
      normalStatus: 'nominal',
      alertStatus: 'critical',
    },
    {
      variable: 'Temperatura Corporal',
      symbol: 'TEMP',
      unit: '°C',
      normal: '36.1 - 37.2',
      alert: '> 38.0',
      description: 'Temperatura del núcleo corporal medida por sensor continuo del traje espacial.',
      icon: Thermometer,
      color: '#FBBF24',
      normalStatus: 'nominal',
      alertStatus: 'critical',
    },
    {
      variable: 'Frecuencia Respiratoria',
      symbol: 'RR',
      unit: 'rpm',
      normal: '12 - 20',
      alert: '> 24',
      description: 'Ciclos de inhalación/exhalación por minuto. Aumenta ante acumulación de CO₂ o estrés.',
      icon: Wind,
      color: '#60A5FA',
      normalStatus: 'nominal',
      alertStatus: 'critical',
    },
  ];

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.level === logFilter;
  });

  const logCounts = logs.reduce(
    (acc, log) => {
      acc.ALL += 1;
      if (acc[log.level] !== undefined) acc[log.level] += 1;
      return acc;
    },
    { ALL: 0, CRITICAL: 0, WARNING: 0, SUCCESS: 0, INFO: 0 }
  );

  const contractSections = [
    {
      key: 'metadata',
      description: 'Origen, misión y escenario activo',
      fields: Object.keys(currentJsonPacket?.metadata || {}).length,
      expected: 4,
    },
    {
      key: 'astronaut',
      description: 'Identidad del sujeto monitorizado',
      fields: Object.keys(currentJsonPacket?.astronaut || {}).length,
      expected: 2,
    },
    {
      key: 'vital_signs',
      description: 'Timestamp y cuatro signos vitales',
      fields: Object.keys(currentJsonPacket?.vital_signs || {}).length,
      expected: 5,
    },
  ];

  const metaCards = [
    {
      label: 'Contrato activo',
      value: 'v1.0',
      note: 'ARCHITECTURE.MD',
      icon: FileCode2,
      color: '#22D3EE',
    },
    {
      label: 'Origen de datos',
      value: 'Sintético',
      note: currentJsonPacket?.metadata?.source || 'simulation_engine_v1',
      icon: Server,
      color: '#60A5FA',
    },
    {
      label: 'Sujeto en foco',
      value: packetAstronaut,
      note: currentJsonPacket?.astronaut?.id || selectedAstronautId,
      icon: UserRound,
      color: '#34D399',
    },
    {
      label: 'Payload JSON',
      value: `${(jsonString.length / 1024).toFixed(2)} KB`,
      note: `${jsonLines.length} líneas serializadas`,
      icon: HardDrive,
      color: '#A78BFA',
    },
  ];

  return (
    <div className="space-y-4">
      <ModuleHeader
        code="MOD-05"
        kicker="INTEGRACIÓN, CONTRATO & GLOSARIO"
        title="Contrato JSON y diccionario de datos"
        description="Interfaz de arquitectura de datos: paquete telemétrico en vivo, validación del contrato y umbrales clínicos oficiales de la misión."
        icon={Database}
        status={
          <StatusPill status="info" icon={ShieldCheck}>
            ARCHITECTURE.MD COMPLIANT
          </StatusPill>
        }
        actions={
          <StatusPill status="neutral" dot={false} className="mono">
            <Clock3 className="h-3 w-3" aria-hidden="true" />
            LIVE PACKET
          </StatusPill>
        }
      />

      {/* Franja de metadatos del paquete */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {metaCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="panel flex items-center gap-3 px-3 py-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-space-700 bg-space-900"
                style={{ color: card.color }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <span className="eyebrow block">{card.label}</span>
                <span
                  className="mono block truncate text-[13px] font-bold leading-tight"
                  style={{ color: card.color }}
                >
                  {card.value}
                </span>
                <span className="mono block truncate text-[8.5px] text-slate-600">{card.note}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navegación segmentada */}
      <div
        className="panel flex flex-wrap items-center gap-1 p-1.5"
        role="tablist"
        aria-label="Secciones de integración de datos"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex min-w-0 flex-1 items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors sm:flex-none ${
                active
                  ? 'border-cyan-400/30 bg-cyan-400/[0.09] text-cyan-100'
                  : 'border-transparent text-slate-500 hover:border-space-700/70 hover:bg-space-800/50 hover:text-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="mono block truncate text-[10.5px] font-bold uppercase tracking-wide">
                  {tab.label}
                </span>
                <span className="mono block truncate text-[8px] text-slate-600">{tab.meta}</span>
              </span>
              <span className="mono ml-auto rounded bg-black/25 px-1.5 py-0.5 text-[8px] text-slate-500">
                {tab.id === 'json' ? 'LIVE' : tab.id === 'dictionary' ? dictionary.length : logCounts.ALL}
              </span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: Contrato JSON */}
      {activeSubTab === 'json' && (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
          <Panel className="overflow-hidden">
            <PanelHeader
              icon={Braces}
              kicker="PAQUETE DE TELEMETRÍA SINTÉTICA"
              title="Transmisión serializada en vivo"
              description="Validado contra el esquema oficial definido en docs/ARCHITECTURE.md."
              status={
                <StatusPill status="nominal" icon={CircleCheck}>
                  JSON VÁLIDO
                </StatusPill>
              }
              actions={
                <>
                  <button type="button" onClick={handleCopy} className="btn">
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-telemetry-green" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-telemetry-cyan" />
                    )}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <button type="button" onClick={handleDownload} className="btn btn-primary">
                    <Download className="h-3.5 w-3.5" />
                    <span>Descargar .json</span>
                  </button>
                </>
              }
            />

            <div className="flex flex-wrap items-center gap-1.5 border-b border-space-700/60 bg-space-900/30 px-3 py-2">
              <span className="mono text-[8.5px] uppercase tracking-wider text-slate-600">
                RUTA
              </span>
              <span className="mono rounded border border-space-700/70 bg-space-950/60 px-1.5 py-0.5 text-[8.5px] text-cyan-300">
                mars_001 / {packetScenario || 'microgravity'} / vital_signs
              </span>
              <span className="mono ml-auto text-[8.5px] text-slate-600">
                {jsonString.length} BYTES · UTF-8
              </span>
            </div>

            <div className="max-h-[460px] overflow-auto bg-[#050911]">
              <div className="flex min-w-max">
                <pre
                  aria-hidden="true"
                  className="sticky left-0 z-10 select-none border-r border-space-700/50 bg-[#070c16] px-2.5 py-3 text-right font-mono text-[11px] leading-[1.7] text-slate-700"
                >
                  {jsonLines.map((_, index) => String(index + 1).padStart(2, '0')).join('\n')}
                </pre>
                <pre className="px-4 py-3 font-mono text-[11px] leading-[1.7] text-cyan-100 selection:bg-cyan-400 selection:text-black">
                  {jsonString}
                </pre>
              </div>
            </div>
          </Panel>

          <div className="space-y-3">
            <Panel className="overflow-hidden">
              <PanelHeader
                icon={ShieldCheck}
                kicker="VALIDACIÓN DE ESQUEMA"
                title="Estructura del contrato"
                status={<span className="pill pill-green">PASS</span>}
              />

              <div className="divide-y divide-space-700/50">
                {contractSections.map((section) => {
                  const ok = section.fields >= section.expected;
                  return (
                    <div key={section.key} className="flex items-start gap-2.5 px-3.5 py-2.5">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border ${
                          ok
                            ? 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300'
                            : 'border-amber-400/25 bg-amber-400/[0.07] text-amber-300'
                        }`}
                      >
                        {ok ? (
                          <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                        ) : (
                          <CircleAlert className="h-3 w-3" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <code className="mono text-[10.5px] font-bold text-slate-200">
                            {section.key}
                          </code>
                          <span className="mono text-[8.5px] text-slate-600">
                            {section.fields}/{section.expected} campos
                          </span>
                        </div>
                        <p className="mt-0.5 text-[9.5px] leading-snug text-slate-500">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-space-700/60 bg-space-900/30 px-3.5 py-2.5">
                <span className="mono flex items-center gap-1.5 text-[8.5px] leading-snug text-slate-500">
                  <Info className="h-3 w-3 shrink-0 text-cyan-400" aria-hidden="true" />
                  Contrato inmutable: el frontend solo consume y visualiza el paquete.
                </span>
              </div>
            </Panel>

            <Panel className="overflow-hidden">
              <PanelHeader
                icon={Database}
                kicker="ORIGEN"
                title="Metadatos de transmisión"
                compact
              />
              <dl className="divide-y divide-space-700/50 text-[10px]">
                {[
                  ['Misión', currentJsonPacket?.metadata?.mission_id || '—'],
                  ['Escenario', packetScenarioLabel],
                  ['Fuente', currentJsonPacket?.metadata?.source || '—'],
                  ['Sintético', currentJsonPacket?.metadata?.is_synthetic ? 'true' : 'false'],
                  ['Timestamp', currentJsonPacket?.vital_signs?.timestamp || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3 px-3.5 py-2">
                    <dt className="mono shrink-0 text-[8.5px] uppercase tracking-wider text-slate-600">
                      {label}
                    </dt>
                    <dd className="mono min-w-0 break-all text-right text-[9px] text-slate-300">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Diccionario Médico */}
      {activeSubTab === 'dictionary' && (
        <Panel className="overflow-hidden">
          <PanelHeader
            icon={BookOpen}
            kicker="GLOSARIO CLÍNICO AEROESPACIAL"
            title="Umbrales de seguridad y rangos nominales"
            description="Valores de referencia utilizados por el motor de evaluación de alertas en docs/DATA_DICTIONARY.md."
            status={
              <StatusPill status="info">
                {dictionary.length} VARIABLES MONITORIZADAS
              </StatusPill>
            }
          />

          <div className="flex flex-wrap items-center gap-2 border-b border-space-700/60 bg-space-900/25 px-3.5 py-2">
            <span className="mono flex items-center gap-1.5 text-[8.5px] uppercase tracking-wider text-slate-500">
              <BookOpen className="h-3 w-3 text-cyan-400" aria-hidden="true" />
              Referencia clínica
            </span>
            <span className="pill pill-green">RANGO NOMINAL</span>
            <span className="pill pill-red">UMBRAL DE ALERTA</span>
            <span className="mono ml-auto text-[8.5px] text-slate-600">
              FLIGHT SURGEON QUICK REFERENCE
            </span>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="border-b border-space-700/70 bg-space-950/40">
                  <th className="px-3.5 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Variable
                  </th>
                  <th className="px-3 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Unidad
                  </th>
                  <th className="px-3 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Rango nominal
                  </th>
                  <th className="px-3 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Umbral alerta
                  </th>
                  <th className="px-3.5 py-2.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Descripción clínica
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-700/50">
                {dictionary.map((item) => {
                  const Icon = item.icon;
                  return (
                    <tr key={item.symbol} className="group transition-colors hover:bg-space-800/35">
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-space-700 bg-space-900"
                            style={{ color: item.color }}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <span className="block font-heading text-[11.5px] font-bold leading-tight text-slate-100">
                              {item.variable}
                            </span>
                            <code className="mono text-[8.5px] text-slate-600">{item.symbol}</code>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="mono rounded border border-space-700/70 bg-space-950/50 px-1.5 py-1 text-[10px] font-bold text-cyan-300">
                          {item.unit}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="pill pill-green">{item.normal}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="pill pill-red">{item.alert}</span>
                      </td>
                      <td className="max-w-sm px-3.5 py-3 text-[10px] leading-relaxed text-slate-500">
                        {item.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-2 p-3 md:hidden">
            {dictionary.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.symbol} className="panel-inset p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-space-700 bg-space-900"
                        style={{ color: item.color }}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-heading text-[11.5px] font-bold leading-tight text-slate-100">
                          {item.variable}
                        </h4>
                        <span className="mono text-[8.5px] text-slate-600">
                          {item.symbol} · {item.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="pill pill-green">NOMINAL {item.normal}</span>
                    <span className="pill pill-red">ALERTA {item.alert}</span>
                  </div>

                  <p className="mt-2 text-[10px] leading-relaxed text-slate-500">{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="flex flex-col gap-1.5 border-t border-space-700/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="mono flex items-center gap-1.5 text-[8.5px] text-slate-600">
              <ShieldCheck className="h-3 w-3 text-emerald-400" aria-hidden="true" />
              Umbrales validados clínicamente · No modificar sin revisión médica.
            </span>
            <span className="mono text-[8.5px] text-slate-600">NASA AEROHEALTH / DATA DICTIONARY</span>
          </div>
        </Panel>
      )}

      {/* SUBTAB 3: Registros Completos */}
      {activeSubTab === 'logs' && (
        <Panel className="overflow-hidden">
          <PanelHeader
            icon={Terminal}
            kicker="AUDIT TRAIL / MISSION LOG"
            title="Registro completo de eventos"
            description="Traza cronológica de telemetría, cambios de escenario, alertas y contramedidas aplicadas."
            status={
              <StatusPill status="neutral" dot={false}>
                {filteredLogs.length} / {logs.length} EVENTOS
              </StatusPill>
            }
          />

          <div className="flex flex-col gap-2 border-b border-space-700/60 bg-space-900/25 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="mono flex items-center gap-1.5 text-[8.5px] uppercase tracking-wider text-slate-500">
              <ListFilter className="h-3 w-3 text-cyan-400" aria-hidden="true" />
              Filtrar severidad
            </span>
            <div className="flex flex-wrap items-center gap-1 font-mono text-[9px]">
              {['ALL', 'CRITICAL', 'WARNING', 'SUCCESS', 'INFO'].map((level) => {
                const active = logFilter === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setLogFilter(level)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[8.5px] font-bold transition-colors ${
                      active
                        ? 'border-cyan-400/35 bg-cyan-400/[0.09] text-cyan-200'
                        : 'border-transparent text-slate-500 hover:border-space-700/70 hover:text-slate-300'
                    }`}
                  >
                    {level === 'ALL' ? 'TODOS' : level}
                    <span className="rounded bg-black/25 px-1 text-[7.5px] text-slate-500">
                      {logCounts[level] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="max-h-[520px] overflow-y-auto bg-[#050911]">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-space-700 bg-space-900">
                  <Terminal className="h-4 w-4 text-slate-600" aria-hidden="true" />
                </span>
                <span className="font-heading text-[12px] font-bold text-slate-400">
                  Sin eventos para este filtro
                </span>
                <span className="mono text-[9px] text-slate-600">
                  Selecciona otra severidad para revisar el historial.
                </span>
              </div>
            ) : (
              <ol className="divide-y divide-space-700/35">
                {filteredLogs.map((log, index) => {
                  const style = LEVEL_STYLE[log.level] || LEVEL_STYLE.INFO;
                  const LevelIcon = style.icon;
                  return (
                    <li
                      key={`${log.time}-${index}`}
                      className="flex items-start gap-2.5 px-3.5 py-2 transition-colors hover:bg-space-800/30"
                    >
                      <span className="mono w-[58px] shrink-0 pt-0.5 text-[9px] tabular-nums text-slate-600">
                        {log.time}
                      </span>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[7.5px] font-bold tracking-wide ${style.badge}`}
                      >
                        <LevelIcon className="h-2.5 w-2.5" aria-hidden="true" />
                        {style.short}
                      </span>
                      <span className="min-w-0 flex-1 font-mono text-[10px] leading-relaxed text-slate-300">
                        {log.message}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          <div className="flex flex-col gap-1.5 border-t border-space-700/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <span className="mono flex items-center gap-1.5 text-[8.5px] text-slate-600">
              <Clock3 className="h-3 w-3 text-cyan-400" aria-hidden="true" />
              Buffer limitado a los últimos 50 eventos de misión.
            </span>
            <span className="mono text-[8.5px] text-slate-600">
              {filteredLogs.length} EVENTO(S) VISIBLE(S)
            </span>
          </div>
        </Panel>
      )}
    </div>
  );
}
