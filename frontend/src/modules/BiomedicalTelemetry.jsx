import React, { useMemo, useState } from 'react';
import VitalCard from '../components/VitalCard';
import ECGWaveform from '../components/ECGWaveform';
import TelemetryCharts from '../components/TelemetryCharts';
import AstronautSelector from '../components/AstronautSelector';
import Astronaut3DViewer from '../components/Astronaut3DViewer';
import ModuleHeader from '../components/ui/ModuleHeader';
import StatusPill from '../components/ui/StatusPill';
import DataOriginBadge from '../components/ui/DataOriginBadge';
import {
  Activity,
  ShieldAlert,
  AlertTriangle,
  Heart,
  Thermometer,
  Wind,
  Radio,
  Clock,
  Cpu,
  UserRound,
  Database,
  ArrowRight,
  ScanLine,
} from 'lucide-react';
import {
  ALERTABLE_VITALS,
  VITAL_REFERENCES,
  evaluateAllVitals,
  severityAtLeast,
  worstSeverity,
} from '../lib/clinical';
import { getScenarioDefinition } from '../lib/simulation';
import { getLatestRecord, ECG_ABNORMAL_RHYTHMS } from '../lib/records';
import { formatDateTime, formatNumber } from '../lib/format';

const VITAL_UI = [
  { key: 'heart_rate', title: 'Frecuencia cardíaca', variable: 'heart_rate', icon: Heart, color: '#FB7185' },
  { key: 'spo2', title: 'Saturación de oxígeno', variable: 'spo2', icon: Activity, color: '#22D3EE' },
  { key: 'temperature', title: 'Temperatura corporal', variable: 'temperature', icon: Thermometer, color: '#FBBF24' },
  { key: 'respiratory_rate', title: 'Frecuencia respiratoria', variable: 'respiratory_rate', icon: Wind, color: '#60A5FA' },
];

const SEVERITY_LABEL = {
  info: 'INFO',
  warning: 'WARN',
  critical: 'CRIT',
  emergency: 'EMERG',
  normal: 'NOM',
};

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function BiomedicalTelemetry({
  astronauts = {},
  selectedAstronautId,
  setSelectedAstronautId,
  latestVitalsByAstronaut = {},
  currentHistory = [],
  latestSample = {},
  prevSample = {},
  evaluations = {},
  currentScenario = 'microgravity',
  environment,
  records = [],
  alertSummary,
  hasGlobalAlert = false,
  onOpenAlerts,
  onOpenData,
}) {
  const [viewMode, setViewMode] = useState('xray');
  const [selectedOrganId, setSelectedOrganId] = useState('heart');

  const currentAstronaut = astronauts[selectedAstronautId] || {};
  const vitals = useMemo(
    () => (Object.keys(evaluations || {}).length ? evaluations : evaluateAllVitals(latestSample)),
    [evaluations, latestSample],
  );
  const latestEcgRecord = useMemo(
    () => getLatestRecord(records, 'ecg', selectedAstronautId),
    [records, selectedAstronautId],
  );
  const latestTelemetryRecord = useMemo(
    () => getLatestRecord(records, 'telemetry', selectedAstronautId),
    [records, selectedAstronautId],
  );

  const worst = worstSeverity(vitals);
  const alertMessages = ALERTABLE_VITALS
    .map((key) => vitals[key])
    .filter((evaluation) => evaluation && severityAtLeast(evaluation.status, 'critical'))
    .map((evaluation) => `${evaluation.short}: ${evaluation.explanation}`);
  const warningMessages = ALERTABLE_VITALS
    .map((key) => vitals[key])
    .filter((evaluation) => evaluation && evaluation.status === 'warning')
    .map((evaluation) => `${evaluation.short}: ${evaluation.explanation}`);
  const hasWarning = !hasGlobalAlert && warningMessages.length > 0;
  const ecgAbnormal = Boolean(latestEcgRecord && latestEcgRecord.data?.rhythm && latestEcgRecord.data.rhythm !== 'sinus');
  const ecgRhythmLabel = latestEcgRecord
    ? latestEcgRecord.data?.rhythm === 'sinus'
      ? 'Sinusal'
      : ECG_ABNORMAL_RHYTHMS[latestEcgRecord.data?.rhythm]?.label || 'No concluyente'
    : '--';
  const scenario = getScenarioDefinition(currentScenario);

  return (
    <div className="space-y-4">
      <ModuleHeader
        code="MOD-02"
        kicker="BIOMEDICAL TELEMETRY / LEAD II / 3D"
        title={`Foco telemétrico · ${currentAstronaut.name || 'Astronauta'}`}
        description={`Adquisición biomédica del tripulante ${selectedAstronautId?.toUpperCase()} con ECG Lead II, análisis temporal, modelo 3D y lecturas evaluadas contra docs/DATA_DICTIONARY.md.`}
        icon={Activity}
        status={
          <>
            <StatusPill status={hasGlobalAlert ? 'critical' : hasWarning ? 'warning' : 'nominal'}>
              {hasGlobalAlert ? 'DESVIACIÓN CLÍNICA' : hasWarning ? 'FUERA DE RANGO' : 'PACIENTE ESTABLE'}
            </StatusPill>
            <DataOriginBadge origin={latestSample.origin || 'simulated'} />
            <span className="pill pill-cyan">
              <Radio className="h-3 w-3" aria-hidden="true" />
              LIVE · 0.5 Hz
            </span>
          </>
        }
        actions={
          <>
            <div className="flex items-center gap-2 rounded-md border border-space-700/70 bg-space-900/50 px-2.5 py-1.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/[0.08] font-heading text-[10px] font-extrabold text-cyan-200">
                {initials(currentAstronaut.name)}
              </span>
              <div className="leading-tight">
                <span className="mono block text-[8px] uppercase tracking-wider text-slate-500">{currentAstronaut.role || 'CREW'}</span>
                <span className="mono block text-[9px] font-bold text-slate-300">
                  {selectedAstronautId?.toUpperCase()} · {currentAstronaut.activity || 'IVA'}
                </span>
              </div>
            </div>
            <button type="button" onClick={onOpenData} className="btn">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Insertar datos
            </button>
          </>
        }
      />

      <section aria-label="Selección de tripulante">
        <AstronautSelector
          astronauts={astronauts}
          selectedId={selectedAstronautId}
          onSelect={setSelectedAstronautId}
          latestVitalsByAstronaut={latestVitalsByAstronaut}
        />
      </section>

      {hasGlobalAlert ? (
        <div className="panel panel-critical flex flex-col gap-2 border-l-2 border-l-rose-400 p-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-rose-400/30 bg-rose-400/10 text-rose-300">
              <ShieldAlert className="h-4 w-4 animate-pulse" aria-hidden="true" />
            </span>
            <div>
              <span className="font-heading text-[11.5px] font-bold uppercase tracking-wide text-rose-200">
                Desviación clínica detectada · {currentAstronaut.name}
              </span>
              <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-rose-100/70">
                {alertMessages.join(' · ')}
              </p>
            </div>
          </div>
          <button type="button" onClick={onOpenAlerts} className="btn btn-danger shrink-0">
            Ver alertas
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      {hasWarning ? (
        <div className="panel panel-warning flex flex-col gap-2 border-l-2 border-l-amber-400 p-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <span className="font-heading text-[11.5px] font-bold uppercase tracking-wide text-amber-200">
                Parámetro fuera del rango óptimo · {currentAstronaut.name}
              </span>
              <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-amber-100/70">
                {warningMessages.join(' · ')}
              </p>
            </div>
          </div>
          <StatusPill status="warning" className="shrink-0">VIGILANCIA CLÍNICA</StatusPill>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Signos vitales">
        {VITAL_UI.map((item, index) => {
          const evaluation = vitals[item.key] || {};
          const reference = VITAL_REFERENCES[item.key];
          return (
            <VitalCard
              key={item.key}
              title={item.title}
              variable={item.variable}
              value={latestSample[item.key]}
              prevValue={prevSample?.[item.key]}
              unit={reference?.unit || evaluation.unit}
              normalRange={reference?.normalRangeLabel || evaluation.referenceRange}
              alertCondition={reference?.criticalRangeLabel || '--'}
              status={evaluation.legacyStatus || 'normal'}
              statusMessage={evaluation.explanation}
              history={currentHistory}
              index={index}
            />
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        <div className="space-y-3.5 xl:col-span-7">
          <ECGWaveform
            heartRate={latestSample.heart_rate}
            isAlert={severityAtLeast(vitals.heart_rate?.status || worst, 'critical') || ecgAbnormal}
            soundEnabled={false}
          />

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-space-700/70 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <ScanLine className="h-3.5 w-3.5 text-telemetry-cyan" aria-hidden="true" />
                <span className="font-heading text-[12px] font-bold text-slate-100">Registro ECG validado</span>
              </div>
              <DataOriginBadge origin={latestEcgRecord?.origin || 'simulated'} />
            </div>
            {latestEcgRecord ? (
              <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
                {[
                  { label: 'Ritmo', value: ecgRhythmLabel },
                  { label: 'PR', value: `${latestEcgRecord.data?.pr_ms ?? '--'} ms` },
                  { label: 'QRS', value: `${latestEcgRecord.data?.qrs_ms ?? '--'} ms` },
                  { label: 'QTc', value: `${latestEcgRecord.data?.qtc_ms ?? '--'} ms` },
                ].map((item) => (
                  <div key={item.label} className="panel-inset px-2.5 py-2">
                    <span className="eyebrow block">{item.label}</span>
                    <span className="mono mt-0.5 block truncate text-[10.5px] font-bold text-slate-200">{item.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-3 py-6 text-center">
                <Activity className="h-5 w-5 text-slate-600" aria-hidden="true" />
                <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
                  Sin ECG registrado. Añade un registro en <span className="text-slate-300">Inserción de datos → ECG</span> para validar el ritmo.
                </p>
                <button type="button" onClick={onOpenData} className="btn mt-2">
                  <Database className="h-3.5 w-3.5" aria-hidden="true" />
                  Añadir ECG
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-5">
          <Astronaut3DViewer
            currentSample={latestSample}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={setSelectedOrganId}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            isScanning={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <TelemetryCharts history={currentHistory} />
        </div>

        <aside className="panel overflow-hidden xl:col-span-4">
          <div className="flex items-center justify-between border-b border-space-700/70 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <UserRound className="h-3.5 w-3.5 text-telemetry-cyan" aria-hidden="true" />
              <span className="font-heading text-[12px] font-bold text-slate-100">Perfil biomédico</span>
            </div>
            <span className="mono text-[8.5px] text-slate-600">SAMPLE {currentHistory.length}</span>
          </div>

          <div className="space-y-2.5 p-3.5">
            <div className="panel-inset p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="eyebrow block">ESCENARIO ACTIVO</span>
                  <span className="mt-0.5 block font-heading text-[11px] font-bold text-slate-200">
                    {scenario.name}
                  </span>
                  <span className="mono mt-0.5 block text-[8.5px] text-slate-600">
                    {environment?.shortName} · {environment?.gravityText}
                  </span>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
                  <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {VITAL_UI.map((item) => {
                const evaluation = vitals[item.key] || {};
                const Icon = item.icon;
                const status = evaluation.status || 'normal';
                return (
                  <div key={item.key} className="flex items-center gap-2 rounded-md border border-space-700/60 bg-space-900/35 px-2 py-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: item.color }} aria-hidden="true" />
                    <span className="mono min-w-0 flex-1 truncate text-[9px] uppercase tracking-wider text-slate-500">
                      {item.title}
                    </span>
                    <span className="value-sm text-slate-200">{latestSample[item.key] ?? '--'}</span>
                    <span className="mono w-7 text-right text-[8px] text-slate-600">{VITAL_REFERENCES[item.key]?.unit}</span>
                    <StatusPill status={status === 'normal' ? 'nominal' : status} dot={false} className="min-w-[54px] justify-center">
                      {SEVERITY_LABEL[status] || 'NOM'}
                    </StatusPill>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between rounded-md border border-space-700/60 bg-space-900/35 px-2.5 py-2">
              <span className="mono flex items-center gap-1.5 text-[8.5px] text-slate-600">
                <Clock className="h-3 w-3" aria-hidden="true" />
                ÚLTIMA MUESTRA
              </span>
              <span className="mono text-[9px] font-semibold text-slate-300">
                {latestSample.timestamp || formatDateTime(latestSample.recordedAt)}
              </span>
            </div>

            {latestTelemetryRecord ? (
              <div className="rounded-md border border-space-700/60 bg-space-900/35 px-2.5 py-2">
                <span className="eyebrow block">TELEMETRÍA REGISTRADA</span>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="mono text-[9px] text-slate-400">
                    {latestTelemetryRecord.data?.source || '--'} · {formatNumber(latestTelemetryRecord.data?.sampling_hz, 1)} Hz
                  </span>
                  <DataOriginBadge origin={latestTelemetryRecord.origin} showIcon={false} />
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-2 rounded-md border border-emerald-400/15 bg-emerald-400/[0.035] px-2.5 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
              <p className="text-[9.5px] leading-snug text-slate-500">
                Umbrales documentados en <span className="text-slate-300">docs/DATA_DICTIONARY.md</span>. Los umbrales de emergencia son configurables.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-space-700/60 pt-2.5">
              <span className="mono text-[8.5px] text-slate-600">
                {alertSummary?.active ?? 0} alertas activas
              </span>
              <button type="button" onClick={onOpenAlerts} className="btn btn-ghost !min-h-[28px]">
                Ver alertas
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
