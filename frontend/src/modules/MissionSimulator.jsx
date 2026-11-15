import React from 'react';
import MissionControls from '../components/MissionControls';
import MissionLogs from '../components/MissionLogs';
import EnvironmentSelector from '../components/EnvironmentSelector';
import RiskMatrix from '../components/RiskMatrix';
import ModuleHeader from '../components/ui/ModuleHeader';
import StatusPill from '../components/ui/StatusPill';
import DataOriginBadge from '../components/ui/DataOriginBadge';
import {
  SlidersHorizontal,
  Cpu,
  Activity,
  ShieldCheck,
  Gauge,
  Orbit,
  Radio,
  FlaskConical,
  Save,
  Database,
  ArrowUpRight,
} from 'lucide-react';
import { getScenarioDefinition } from '../lib/simulation';
import { formatInteger, formatNumber } from '../lib/format';

export default function MissionSimulator({
  currentScenario,
  handleSelectScenario,
  currentEnvironment = 'transit',
  handleSelectEnvironment,
  isAutoSimulating,
  setIsAutoSimulating,
  handleTick,
  handleTriggerEmergency,
  handleResetNominal,
  environmentalData,
  logs = [],
  astronauts = {},
  selectedAstronautId,
  environment,
  assessment,
  riskInputs = {},
  onSaveRun,
  onOpenRisks,
  onOpenDataEntry,
  records = [],
}) {
  const currentAstronaut = astronauts[selectedAstronautId] || {};
  const scenario = getScenarioDefinition(currentScenario);
  const inputs = riskInputs.inputs || {};
  const simulationRecords = records.filter((record) => record.category === 'simulation');

  const architecture = [
    {
      icon: Activity,
      title: 'Modelo estocástico HRP',
      desc: 'Distribuciones acopladas al gasto metabólico, estrés y resistencia a la insulina.',
    },
    {
      icon: Gauge,
      title: 'Acoplamiento de traje y hábitat',
      desc: 'Presión de escafandra, saturación capilar y gradientes de CO₂ del entorno.',
    },
    {
      icon: ShieldCheck,
      title: 'Trazabilidad del dato',
      desc: 'Cada corrida puede guardarse como registro firmado con origen simulado.',
    },
  ];

  return (
    <div className="space-y-4">
      <ModuleHeader
        code="MOD-03"
        kicker="SIMULATION ENGINE / SYNTHETIC DATA GENERATOR"
        title="Simulador de misión y entornos espaciales"
        description="Inyección de escenarios fisiológicos, selección de entornos (tránsito, órbita, rover, base) y evaluación RIDGE con telemetría ambiental sintética."
        icon={SlidersHorizontal}
        status={
          <>
            <StatusPill status={isAutoSimulating ? 'nominal' : 'warning'}>
              {isAutoSimulating ? 'STREAMING' : 'FLUJO PAUSADO'}
            </StatusPill>
            <DataOriginBadge origin="simulated" />
            <span className="pill pill-violet">NASA-HRP</span>
          </>
        }
        actions={
          <>
            <div className="flex items-center gap-2 rounded-md border border-space-700/70 bg-space-900/50 px-2.5 py-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-violet-400/25 bg-violet-400/[0.07] text-violet-300">
                <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <span className="mono block text-[8px] uppercase tracking-wider text-slate-500">TARGET</span>
                <span className="mono block text-[9px] font-bold text-slate-300">
                  {currentAstronaut.name || 'CREW'} · {currentAstronaut.activity || 'IVA'}
                </span>
              </div>
            </div>
            <button type="button" onClick={onSaveRun} className="btn btn-primary">
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              Guardar corrida
            </button>
          </>
        }
      />

      <EnvironmentSelector
        currentEnvironmentId={currentEnvironment}
        onSelectEnvironment={handleSelectEnvironment}
      />

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <MissionControls
            currentScenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            isAutoSimulating={isAutoSimulating}
            onToggleAutoSim={() => setIsAutoSimulating(!isAutoSimulating)}
            onGenerateTick={() => handleTick()}
            onTriggerEmergency={handleTriggerEmergency}
            onResetNominal={handleResetNominal}
            environmentalData={environmentalData}
            environment={environment}
          />
        </div>

        <div className="xl:col-span-4">
          <MissionLogs logs={logs} />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3.5 xl:grid-cols-12">
        <div className="panel overflow-hidden xl:col-span-7">
          <div className="flex flex-col gap-2 border-b border-space-700/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
                <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <span className="eyebrow block">EVALUACIÓN RIDGE DEL ESCENARIO</span>
                <h3 className="font-heading text-[13px] font-bold text-slate-100">
                  {scenario.name} · {environment?.shortName}
                </h3>
              </div>
            </div>
            <button type="button" onClick={onOpenRisks} className="btn">
              Detalle
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <div className="p-3.5">
            <RiskMatrix assessment={assessment} variant="full" onSelectRisk={onOpenRisks} />
            <p className="mono mt-2 text-[8.5px] leading-relaxed text-slate-600">
              Las puntuaciones son un modelo configurable de apoyo; no son límites oficiales de la NASA.
            </p>
          </div>
        </div>

        <div className="panel overflow-hidden xl:col-span-5">
          <div className="flex items-center justify-between border-b border-space-700/70 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-violet-400/25 bg-violet-400/[0.06] text-violet-300">
                <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <span className="eyebrow block">VARIABLES DE ENTRADA</span>
                <h3 className="font-heading text-[13px] font-bold text-slate-100">Condiciones de la corrida</h3>
              </div>
            </div>
            <span className="pill pill-violet">{simulationRecords.length} registros</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-3.5">
            {[
              { label: 'Gravedad', value: `${formatNumber(inputs.gravityG, 2)} G` },
              { label: 'Radiación', value: `${formatNumber(inputs.radiationRateMsvDay, 2)} mSv/día` },
              { label: 'Dosis acumulada', value: `${formatNumber(inputs.cumulativeRadiationMsv, 1)} mSv` },
              { label: 'Aislamiento', value: `${formatInteger(inputs.isolationDays)} días` },
              { label: 'Sueño', value: `${formatNumber(inputs.sleepHours, 1)} h` },
              { label: 'Estrés', value: `${formatInteger(inputs.stressLevel)} %` },
              { label: 'O₂', value: `${formatNumber(inputs.o2Pct, 1)} %` },
              { label: 'CO₂', value: `${formatNumber(inputs.co2MmHg, 1)} mmHg` },
              { label: 'Autonomía', value: `${formatInteger(inputs.autonomyPct)} %` },
              { label: 'Stock médico', value: `${formatInteger(inputs.medicalStockPct)} %` },
            ].map((item) => (
              <div key={item.label} className="rounded border border-space-700/60 bg-space-900/35 px-2 py-1.5">
                <span className="mono block text-[8px] uppercase tracking-wider text-slate-600">{item.label}</span>
                <span className="mono mt-0.5 block text-[10px] font-bold text-slate-300">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-space-700/60 px-3.5 py-2.5">
            <span className="mono flex items-center gap-1.5 text-[8px] text-slate-600">
              <FlaskConical className="h-3 w-3 text-violet-300" aria-hidden="true" />
              Corrida sintética
            </span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={onOpenDataEntry} className="btn">
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                Insertar datos
              </button>
              <button type="button" onClick={onSaveRun} className="btn btn-primary">
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-space-700/70 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
              <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow block">ENGINE ARCHITECTURE</span>
              <h3 className="font-heading text-[13px] font-bold text-slate-100">Generación sintética y contratos biomédicos</h3>
            </div>
          </div>
          <span className="pill">ARCHITECTURE.MD</span>
        </div>

        <div className="grid grid-cols-1 gap-2 p-3.5 sm:grid-cols-3">
          {architecture.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="panel-inset p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded border border-space-700 bg-space-900 text-telemetry-cyan">
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="mono text-[8.5px] font-bold text-slate-600">0{index + 1}</span>
                </div>
                <h4 className="mt-2 font-heading text-[11.5px] font-bold text-slate-200">{item.title}</h4>
                <p className="mt-1 text-[10.5px] leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-space-700/60 px-4 py-2.5">
          <span className="mono flex items-center gap-1.5 text-[9px] text-slate-600">
            <Radio className="h-3 w-3 text-telemetry-green" aria-hidden="true" />
            SALIDA COMPATIBLE CON EL CONTRATO JSON DE TELEMETRÍA
          </span>
          <span className="mono flex items-center gap-1.5 text-[9px] text-slate-600">
            <Orbit className="h-3 w-3 text-telemetry-blue" aria-hidden="true" />
            DATOS 100% SINTÉTICOS · SIMULACIÓN MULTI-ENTORNO
          </span>
        </div>
      </section>
    </div>
  );
}
