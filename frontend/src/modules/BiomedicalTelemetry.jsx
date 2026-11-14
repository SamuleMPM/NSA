import React from 'react';
import VitalCard from '../components/VitalCard';
import ECGWaveform from '../components/ECGWaveform';
import TelemetryCharts from '../components/TelemetryCharts';
import AstronautSelector from '../components/AstronautSelector';
import { Activity, ShieldAlert, AlertTriangle } from 'lucide-react';

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
  hasGlobalAlert = false
}) {
  const currentAstronaut = astronauts[selectedAstronautId] || {};

  return (
    <div className="space-y-3.5">
      
      {/* Header del Módulo */}
      <div className="hud-panel p-3 rounded-lg border border-space-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono uppercase px-2 py-0.2 rounded bg-space-850 text-telemetry-cyan border border-space-700 font-bold tracking-widest">
              MOD-02 // TELEMETRÍA FISIOLÓGICA & ECG
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-slate-400">
              BIO-SENSOR ARRAY LEAD II
            </span>
          </div>
          <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide">
            FOCO TELEMÉTRICO: {currentAstronaut.name} ({selectedAstronautId.toUpperCase()})
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 text-[11px]">ROL ASIGNADO:</span>
          <span className="px-2 py-0.5 rounded bg-space-850 text-slate-200 border border-space-700 font-semibold text-[11px]">
            {currentAstronaut.role}
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-950/60 text-telemetry-amber border border-amber-500/40 font-bold uppercase text-[11px]">
            {currentAstronaut.activity}
          </span>
        </div>
      </div>

      {/* Selector de Astronauta */}
      <section>
        <AstronautSelector
          astronauts={astronauts}
          selectedId={selectedAstronautId}
          onSelect={setSelectedAstronautId}
          latestVitalsByAstronaut={latestVitalsByAstronaut}
        />
      </section>

      {/* Banner de Desviación Clínica si existe */}
      {hasGlobalAlert && (
        <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/70 shadow-hud-danger animate-pulse font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-telemetry-crimson shrink-0" />
            <div>
              <strong className="text-red-200 block text-xs tracking-wide uppercase">
                DESVIACIÓN CLÍNICA DETECTADA // {currentAstronaut.name?.toUpperCase()}
              </strong>
              <p className="text-red-300 text-[11px] mt-0.5">
                {[
                  hrEval.status === "alerta" ? `Cardio: ${hrEval.msg}` : null,
                  spo2Eval.status === "alerta" ? `Oxígeno: ${spo2Eval.msg}` : null,
                  tempEval.status === "alerta" ? `Térmico: ${tempEval.msg}` : null,
                  rrEval.status === "alerta" ? `Respiratorio: ${rrEval.msg}` : null,
                ].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cuadrícula de 4 Signos Vitales Principales */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <VitalCard
          title="Frecuencia Cardíaca"
          variable="heart_rate"
          value={latestSample.heart_rate}
          prevValue={prevSample?.heart_rate}
          unit="bpm"
          normalRange="60 - 100"
          alertCondition=">120 o <50"
          status={hrEval.status}
          statusMessage={hrEval.msg}
        />

        <VitalCard
          title="Saturación de Oxígeno"
          variable="spo2"
          value={latestSample.spo2}
          prevValue={prevSample?.spo2}
          unit="%"
          normalRange="95 - 100"
          alertCondition="<90"
          status={spo2Eval.status}
          statusMessage={spo2Eval.msg}
        />

        <VitalCard
          title="Temperatura Corporal"
          variable="temperature"
          value={latestSample.temperature}
          prevValue={prevSample?.temperature}
          unit="°C"
          normalRange="36.1 - 37.2"
          alertCondition=">38.0"
          status={tempEval.status}
          statusMessage={tempEval.msg}
        />

        <VitalCard
          title="Frecuencia Respiratoria"
          variable="respiratory_rate"
          value={latestSample.respiratory_rate}
          prevValue={prevSample?.respiratory_rate}
          unit="rpm"
          normalRange="12 - 20"
          alertCondition=">24"
          status={rrEval.status}
          statusMessage={rrEval.msg}
        />
      </section>

      {/* Osciloscopio ECG en Tiempo Real */}
      <section>
        <ECGWaveform
          heartRate={latestSample.heart_rate}
          isAlert={hrEval.status === "alerta"}
          soundEnabled={soundEnabled}
        />
      </section>

      {/* Gráfico de Tendencias Multicanal */}
      <section>
        <TelemetryCharts history={currentHistory} />
      </section>

    </div>
  );
}
