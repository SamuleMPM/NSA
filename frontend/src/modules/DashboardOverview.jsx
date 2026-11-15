import React from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  ShieldAlert,
  ShieldCheck,
  Gauge,
  Orbit,
  Radio,
  ArrowRight,
  Database,
  Compass,
  Users,
  Cpu,
  FlaskConical,
  Clock,
  Layers,
} from 'lucide-react';
import VitalCard from '../components/VitalCard';
import AstronautSelector from '../components/AstronautSelector';
import RiskMatrix from '../components/RiskMatrix';
import AlertCard from '../components/AlertCard';
import StatusPill from '../components/ui/StatusPill';
import DataOriginBadge from '../components/ui/DataOriginBadge';
import { PanelHeader } from '../components/ui/Panel';
import { VITAL_REFERENCES, SEVERITY_LEVELS, worstSeverity } from '../lib/clinical';
import { RECORD_CATEGORIES } from '../lib/records';
import { getScenarioDefinition } from '../lib/simulation';
import { formatInteger, formatNumber } from '../lib/format';

const VITAL_UI = [
  { key: 'heart_rate', title: 'Frecuencia cardíaca', variable: 'heart_rate', icon: Heart, color: '#FB7185' },
  { key: 'spo2', title: 'Saturación de oxígeno', variable: 'spo2', icon: Activity, color: '#22D3EE' },
  { key: 'temperature', title: 'Temperatura corporal', variable: 'temperature', icon: Thermometer, color: '#FBBF24' },
  { key: 'respiratory_rate', title: 'Frecuencia respiratoria', variable: 'respiratory_rate', icon: Wind, color: '#60A5FA' },
];

const SEVERITY_TONE = {
  normal: 'nominal',
  info: 'info',
  warning: 'warning',
  critical: 'critical',
  emergency: 'emergency',
};

function KpiCard({ icon: Icon, label, value, unit, suffix, tone = '#22D3EE', children }) {
  return (
    <div className="bento-card hud-corner p-3.5">
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow">{label}</span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md border"
          style={{ color: tone, borderColor: `${tone}44`, background: `${tone}12` }}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="value-lg" style={{ color: tone }}>{value}</span>
        {unit ? <span className="mono text-[9px] text-slate-600">{unit}</span> : null}
        {suffix ? <span className="mono text-[9px] text-slate-600">{suffix}</span> : null}
      </div>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

export default function DashboardOverview({
  astronauts = {},
  selectedAstronautId,
  setSelectedAstronautId,
  latestVitalsByAstronaut = {},
  latestSample = {},
  evaluations = {},
  assessment,
  environment,
  currentScenario,
  alerts = [],
  alertSummary,
  records = [],
  recordSummary,
  onOpenTab,
  onApplyCountermeasure,
  onResetNominal,
}) {
  const worst = worstSeverity(evaluations);
  const worstInfo = SEVERITY_LEVELS[worst] || SEVERITY_LEVELS.normal;
  const scenario = getScenarioDefinition(currentScenario);
  const openAlerts = alerts.filter((alert) => alert.status === 'active' || alert.status === 'acknowledged');
  const previewAlerts = openAlerts.slice(0, 4);
  const latestRecord = recordSummary?.latest;

  return (
    <div className="space-y-3.5">
      {/* Bento KPI row */}
      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores clave">
        <KpiCard
          icon={worst === 'normal' ? ShieldCheck : ShieldAlert}
          label="Estado de tripulación"
          value={worstInfo.label}
          tone={worstInfo.color}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="mono text-[9px] text-slate-500">
              {worst === 'normal' ? '4 constantes en rango' : 'Revisar alertas activas'}
            </span>
            <StatusPill status={SEVERITY_TONE[worst] || 'nominal'} dot={false}>
              {worst === 'normal' ? 'NOMINAL' : 'ATENCIÓN'}
            </StatusPill>
          </div>
        </KpiCard>

        <KpiCard
          icon={ShieldAlert}
          label="Alertas activas"
          value={formatInteger(alertSummary?.active ?? 0)}
          unit={openAlerts.length ? `${openAlerts.length} abiertas` : 'sin alertas'}
          tone={(alertSummary?.activeEmergency || alertSummary?.activeCritical) ? '#FB7185' : '#34D399'}
        >
          <div className="flex flex-wrap items-center gap-1">
            <span className="pill pill-red">{alertSummary?.activeEmergency || 0} emerg.</span>
            <span className="pill pill-amber">{alertSummary?.activeCritical || 0} crít.</span>
            <span className="pill pill-cyan">{alertSummary?.activeWarning || 0} adv.</span>
          </div>
        </KpiCard>

        <KpiCard
          icon={Gauge}
          label="Riesgo RIDGE global"
          value={assessment?.overall?.score ?? '--'}
          unit="/100"
          tone={assessment?.overall?.levelInfo?.color || '#22D3EE'}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="mono text-[9px] text-slate-500">
              Peor: {assessment?.overall?.worstRisk?.code || '--'} · {assessment?.overall?.worstRisk?.shortName || '--'}
            </span>
            <StatusPill status={assessment?.overall?.levelInfo?.tone || 'nominal'} dot={false}>
              {assessment?.overall?.levelInfo?.short || '--'}
            </StatusPill>
          </div>
        </KpiCard>

        <KpiCard
          icon={Orbit}
          label="Entorno operativo"
          value={environment?.gravityG === 0 ? '0.00 G' : `${formatNumber(environment?.gravityG, 2)} G`}
          tone="#38BDF8"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="mono truncate text-[9px] text-slate-500">{environment?.shortName}</span>
            <StatusPill status="info" dot={false}>
              <Compass className="h-3 w-3" aria-hidden="true" />
              {scenario.shortName}
            </StatusPill>
          </div>
        </KpiCard>
      </section>

      {/* Crew */}
      <section aria-label="Selección de tripulante">
        <AstronautSelector
          astronauts={astronauts}
          selectedId={selectedAstronautId}
          onSelect={setSelectedAstronautId}
          latestVitalsByAstronaut={latestVitalsByAstronaut}
        />
      </section>

      {/* Vitals */}
      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Signos vitales del tripulante">
        {VITAL_UI.map((item, index) => {
          const evaluation = evaluations[item.key] || {};
          const reference = VITAL_REFERENCES[item.key];
          return (
            <VitalCard
              key={item.key}
              title={item.title}
              variable={item.variable}
              value={latestSample[item.key]}
              prevValue={latestSample[`prev_${item.key}`]}
              unit={reference?.unit || evaluation.unit}
              normalRange={reference?.normalRangeLabel || evaluation.referenceRange}
              alertCondition={reference?.criticalRangeLabel || '--'}
              status={evaluation.legacyStatus || 'normal'}
              statusMessage={evaluation.explanation}
              history={[]}
              index={index}
            />
          );
        })}
      </section>

      {/* Risks + alerts */}
      <section className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="panel overflow-hidden xl:col-span-5">
          <PanelHeader
            icon={Gauge}
            kicker="NASA HRP / RIDGE"
            title="Matriz de riesgos"
            description="Modelo de apoyo a la decisión con bandas configurables."
            status={<DataOriginBadge origin={assessment?.origin || 'simulated'} />}
            actions={
              <button type="button" onClick={() => onOpenTab('risks')} className="btn btn-ghost btn-icon" title="Ver riesgos detallados">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            }
          />
          <div className="p-3">
            <RiskMatrix assessment={assessment} variant="compact" />
            <button
              type="button"
              onClick={() => onOpenTab('risks')}
              className="mono mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-space-700/60 bg-space-900/40 py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:border-cyan-400/30 hover:text-cyan-200"
            >
              <Layers className="h-3 w-3" aria-hidden="true" />
              Abrir análisis RIDGE
            </button>
          </div>
        </div>

        <div className="panel overflow-hidden xl:col-span-7">
          <PanelHeader
            icon={ShieldAlert}
            kicker="ALERTAS EN VIVO"
            title={`${openAlerts.length} alertas abiertas`}
            description="Detección automática sobre las últimas muestras y registros."
            status={
              <StatusPill
                status={alertSummary?.activeEmergency ? 'emergency' : alertSummary?.activeCritical ? 'critical' : openAlerts.length ? 'warning' : 'nominal'}
                dot={false}
              >
                {alertSummary?.activeEmergency ? 'EMERGENCIA' : openAlerts.length ? 'VIGILANCIA' : 'SIN ALERTAS'}
              </StatusPill>
            }
            actions={
              <button type="button" onClick={() => onOpenTab('alerts')} className="btn">
                Ver todas
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            }
          />
          <div className="space-y-1.5 p-3">
            {previewAlerts.length ? (
              previewAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  compact
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-space-700/70 bg-space-900/30 px-4 py-8 text-center">
                <ShieldCheck className="h-7 w-7 text-emerald-300/80" aria-hidden="true" />
                <p className="mt-2 font-heading text-[12px] font-bold text-slate-300">Sin alertas abiertas</p>
                <p className="mt-0.5 max-w-sm text-[10.5px] leading-relaxed text-slate-500">
                  Las alertas se generan automáticamente cuando una constante vital, un riesgo RIDGE o el ECG superan sus bandas configuradas.
                </p>
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <button type="button" onClick={onResetNominal} className="btn btn-success">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Restablecer telemetría nominal
              </button>
              <button type="button" onClick={() => onOpenTab('data')} className="btn btn-primary">
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                Insertar datos
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Environment + data summary */}
      <section className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="panel overflow-hidden xl:col-span-7">
          <PanelHeader
            icon={Orbit}
            kicker="ENTORNO DE MISIÓN"
            title={environment?.name || 'Entorno'}
            description="Valores de simulación del entorno; no son telemetría ECLSS real."
            status={<StatusPill status="violet" dot={false}>SIMULADO</StatusPill>}
          />
          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
            {[
              { label: 'Gravedad', value: environment?.gravityText || '--', icon: Orbit, color: '#38BDF8' },
              { label: 'Radiación', value: `${formatNumber(environment?.radiationDailyMsv, 2)} mSv/día`, icon: Radio, color: '#FBBF24' },
              { label: 'Latencia', value: environment?.commDelayText || '--', icon: Clock, color: '#FB7185' },
              { label: 'Autonomía', value: `${environment?.autonomyPct ?? '--'} %`, icon: Cpu, color: '#34D399' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="panel-inset p-2.5">
                  <span className="mono flex items-center gap-1.5 text-[8px] uppercase tracking-wider text-slate-600">
                    <Icon className="h-3 w-3" style={{ color: item.color }} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="mt-1 block font-heading text-[11px] font-bold leading-snug text-slate-200">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-1 gap-2 border-t border-space-700/60 p-3 sm:grid-cols-3">
            {[
              { label: 'O₂', value: `${formatNumber(environment?.o2Pct, 1)} %` },
              { label: 'CO₂', value: `${formatNumber(environment?.co2MmHg, 1)} mmHg` },
              { label: 'Presión', value: `${formatNumber(environment?.cabinPressureKpa, 1)} kPa` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded border border-space-700/60 bg-space-900/35 px-2.5 py-1.5">
                <span className="mono text-[8.5px] uppercase tracking-wider text-slate-500">{item.label}</span>
                <span className="mono text-[10px] font-bold text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel overflow-hidden xl:col-span-5">
          <PanelHeader
            icon={Database}
            kicker="INSERCIÓN DE DATOS"
            title={`${formatInteger(recordSummary?.total ?? 0)} registros persistidos`}
            description="Seis categorías con origen, validación y marca temporal."
            status={<StatusPill status="info" dot={false}>localStorage</StatusPill>}
            actions={
              <button type="button" onClick={() => onOpenTab('data')} className="btn btn-ghost btn-icon" title="Abrir inserción de datos">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            }
          />
          <div className="p-3">
            <div className="grid grid-cols-2 gap-1.5">
              {RECORD_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center justify-between gap-1.5 rounded border border-space-700/60 bg-space-900/35 px-2 py-1.5">
                  <span className="mono truncate text-[8.5px] uppercase tracking-wider text-slate-500">{category.short}</span>
                  <span className="value-sm shrink-0 text-slate-300">{recordSummary?.byCategory?.[category.id] ?? 0}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1">
              <DataOriginBadge origin="manual" label={`${recordSummary?.byOrigin?.manual ?? 0} manual`} />
              <DataOriginBadge origin="simulated" label={`${recordSummary?.byOrigin?.simulated ?? 0} simulado`} />
              <DataOriginBadge origin="automated" label={`${recordSummary?.byOrigin?.automated ?? 0} automático`} />
            </div>

            {latestRecord ? (
              <div className="mt-2 rounded-md border border-space-700/60 bg-space-900/35 px-2.5 py-2">
                <span className="mono flex items-center gap-1.5 text-[8px] uppercase tracking-wider text-slate-600">
                  <FlaskConical className="h-3 w-3" aria-hidden="true" />
                  ÚLTIMO REGISTRO
                </span>
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-snug text-slate-400">{latestRecord.title}</p>
              </div>
            ) : (
              <div className="mt-2 rounded-md border border-dashed border-space-700/60 bg-space-900/25 px-2.5 py-2">
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Aún no hay registros manuales. La telemetría mostrada proviene del motor de simulación y está marcada como simulada.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => onOpenTab('data')}
              className="btn btn-primary mt-2 w-full"
            >
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Abrir inserción de datos
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-space-700/60 bg-space-900/30 px-3 py-2">
        <span className="mono flex items-center gap-1.5 text-[8.5px] text-slate-600">
          <Users className="h-3 w-3 text-telemetry-cyan" aria-hidden="true" />
          {Object.keys(astronauts).length} tripulantes · {currentScenario.toUpperCase()} · datos sintéticos
        </span>
        <span className="mono flex items-center gap-1.5 text-[8.5px] text-slate-600">
          <FlaskConical className="h-3 w-3 text-violet-300" aria-hidden="true" />
          Los valores simulados no representan mediciones reales
        </span>
      </div>
    </div>
  );
}
