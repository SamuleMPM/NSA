import React from 'react';
import VitalCard from '../components/VitalCard';
import ECGWaveform from '../components/ECGWaveform';
import TelemetryCharts from '../components/TelemetryCharts';
import AstronautSelector from '../components/AstronautSelector';
import ModuleHeader from '../components/ui/ModuleHeader';
import StatusPill from '../components/ui/StatusPill';
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
} from 'lucide-react';

const SCENARIO_LABELS = {
  microgravity: 'Microgravedad nominal',
  eva: 'Paseo espacial EVA',
  hypoxia: 'Alerta de hipoxia',
  hyperthermia: 'Estrés térmico',
  sleep: 'Ciclo de sueño',
};

function initials(name = '') {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function evalToStatus(status) {
  if (status === 'alerta') return 'critical';
  if (status === 'advertencia') return 'warning';
  return 'nominal';
}

export default function BiomedicalTelemetry({
  astronauts = {},
  selectedAstronautId,
  setSelectedAstronautId,
  latestVitalsByAstronaut = {},
  currentHistory = [],
  latestSample = {},
  prevSample = {},
  hrEval = {},
  spo2Eval = {},
  tempEval = {},
  rrEval = {},
  soundEnabled = false,
  hasGlobalAlert = false,
  currentScenario = 'microgravity',
}) {
  const currentAstronaut = astronauts[selectedAstronautId] || {};
  const evaluations = [
    { key: 'heart_rate', label: 'Frecuencia cardíaca', short: 'HR', unit: 'bpm', icon: Heart, color: '#FB7185', eval: hrEval, value: latestSample.heart_rate },
    { key: 'spo2', label: 'Saturación SpO2', short: 'SpO2', unit: '%', icon: Activity, color: '#22D3EE', eval: spo2Eval, value: latestSample.spo2 },
    { key: 'temperature', label: 'Temperatura corporal', short: 'TEMP', unit: '°C', icon: Thermometer, color: '#FBBF24', eval: tempEval, value: latestSample.temperature },
    { key: 'respiratory_rate', label: 'Frecuencia respiratoria', short: 'RR', unit: 'rpm', icon: Wind, color: '#60A5FA', eval: rrEval, value: latestSample.respiratory_rate },
  ];

  const alertMessages = evaluations
    .filter((item) => item.eval.status === 'alerta')
    .map((item) => `${item.short}: ${item.eval.msg}`);

  const warningMessages = evaluations
    .filter((item) => item.eval.status === 'advertencia')
    .map((item) => `${item.short}: ${item.eval.msg}`);

  const hasWarning = !hasGlobalAlert && warningMessages.length > 0;

  return (
    <div className="space-y-4">
      <ModuleHeader
        code="MOD-02"
        kicker="BIOMEDICAL TELEMETRY / LEAD II"
        title={`Foco telemétrico · ${currentAstronaut.name || 'Astronauta'}`}
        description={`Adquisición biomédica continua del tripulante ${selectedAstronautId?.toUpperCase()} con osciloscopio ECG en vivo y análisis temporal multicanal.`}
        icon={Activity}
        status={
          <>
            <StatusPill status={hasGlobalAlert ? 'critical' : hasWarning ? 'warning' : 'nominal'}>
              {hasGlobalAlert ? 'DESVIACIÓN CLÍNICA' : hasWarning ? 'FUERA DE RANGO' : 'PACIENTE ESTABLE'}
            </StatusPill>
            <span className="pill pill-cyan">
              <Radio className="h-3 w-3" aria-hidden="true" />
              LIVE · 0.5 Hz
            </span>
          </>
        }
        actions={
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
              <p className="mt-0.5 text-[10.5px] leading-snug text-rose-100/70">
                {alertMessages.join(' · ')}
              </p>
            </div>
          </div>
          <StatusPill status="critical" className="shrink-0">PROTOCOLO MOD-04</StatusPill>
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
              <p className="mt-0.5 text-[10.5px] leading-snug text-amber-100/70">
                {warningMessages.join(' · ')}
              </p>
            </div>
          </div>
          <StatusPill status="warning" className="shrink-0">VIGILANCIA CLÍNICA</StatusPill>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Signos vitales">
        <VitalCard
          title="Frecuencia Cardíaca"
          variable="heart_rate"
          value={latestSample.heart_rate}
          prevValue={prevSample?.heart_rate}
          unit="bpm"
          normalRange="60 – 100"
          alertCondition=">120 o <50"
          status={hrEval.status}
          statusMessage={hrEval.msg}
          history={currentHistory}
          index={0}
        />

        <VitalCard
          title="Saturación de Oxígeno"
          variable="spo2"
          value={latestSample.spo2}
          prevValue={prevSample?.spo2}
          unit="%"
          normalRange="95 – 100"
          alertCondition="<90"
          status={spo2Eval.status}
          statusMessage={spo2Eval.msg}
          history={currentHistory}
          index={1}
        />

        <VitalCard
          title="Temperatura Corporal"
          variable="temperature"
          value={latestSample.temperature}
          prevValue={prevSample?.temperature}
          unit="°C"
          normalRange="36.1 – 37.2"
          alertCondition=">38.0"
          status={tempEval.status}
          statusMessage={tempEval.msg}
          history={currentHistory}
          index={2}
        />

        <VitalCard
          title="Frecuencia Respiratoria"
          variable="respiratory_rate"
          value={latestSample.respiratory_rate}
          prevValue={prevSample?.respiratory_rate}
          unit="rpm"
          normalRange="12 – 20"
          alertCondition=">24"
          status={rrEval.status}
          statusMessage={rrEval.msg}
          history={currentHistory}
          index={3}
        />
      </section>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <ECGWaveform
            heartRate={latestSample.heart_rate}
            isAlert={hrEval.status === 'alerta'}
            soundEnabled={soundEnabled}
          />
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
                    {SCENARIO_LABELS[currentScenario] || currentScenario}
                  </span>
                </div>
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
                  <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              {evaluations.map((item) => {
                const Icon = item.icon;
                const status = evalToStatus(item.eval.status);
                return (
                  <div key={item.key} className="flex items-center gap-2 rounded-md border border-space-700/60 bg-space-900/35 px-2 py-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: item.color }} aria-hidden="true" />
                    <span className="mono min-w-0 flex-1 truncate text-[9px] uppercase tracking-wider text-slate-500">
                      {item.label}
                    </span>
                    <span className="value-sm text-slate-200">{item.value ?? '--'}</span>
                    <span className="mono w-7 text-right text-[8px] text-slate-600">{item.unit}</span>
                    <StatusPill status={status} dot={false} className="min-w-[54px] justify-center">
                      {status === 'critical' ? 'CRIT' : status === 'warning' ? 'WARN' : 'NOM'}
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
              <span className="mono text-[9px] font-semibold text-slate-300">{latestSample.timestamp || '--:--:--'}</span>
            </div>

            <div className="flex items-center gap-2 rounded-md border border-emerald-400/15 bg-emerald-400/[0.035] px-2.5 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
              <p className="text-[9.5px] leading-snug text-slate-500">
                Umbrales clínicos validados contra <span className="text-slate-300">docs/DATA_DICTIONARY.md</span>.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <TelemetryCharts history={currentHistory} />
    </div>
  );
}
