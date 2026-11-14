import React from 'react';
import MissionControls from '../components/MissionControls';
import MissionLogs from '../components/MissionLogs';
import ModuleHeader from '../components/ui/ModuleHeader';
import StatusPill from '../components/ui/StatusPill';
import {
  SlidersHorizontal,
  Cpu,
  Activity,
  ShieldCheck,
  Gauge,
  Orbit,
  Radio,
} from 'lucide-react';

export default function MissionSimulator({
  currentScenario,
  handleSelectScenario,
  isAutoSimulating,
  setIsAutoSimulating,
  handleTick,
  handleTriggerEmergency,
  handleResetNominal,
  environmentalData,
  logs,
  astronauts,
  selectedAstronautId,
}) {
  const currentAstronaut = astronauts[selectedAstronautId] || {};

  const architecture = [
    {
      icon: Activity,
      title: 'Modelo estocástico',
      desc: 'Distribuciones acopladas al gasto metabólico (Watts) y al estrés adinámico.',
    },
    {
      icon: Gauge,
      title: 'Acoplamiento de traje',
      desc: 'Presión de escafandra (29.6 kPa) frente a saturación capilar (SpO₂).',
    },
    {
      icon: ShieldCheck,
      title: 'Verificación de contrato',
      desc: 'Telemetría 100% sintética para pruebas de software y Space Apps Challenge.',
    },
  ];

  return (
    <div className="space-y-4">
      <ModuleHeader
        code="MOD-03"
        kicker="SIMULATION ENGINE / SYNTHETIC DATA GENERATOR"
        title="Control de simulación y estados fisiológicos"
        description="Inyección de escenarios fisiológicos, anomalías críticas y telemetría ambiental ECLSS para validar protocolos de respuesta médica."
        icon={SlidersHorizontal}
        status={
          <>
            <StatusPill status={isAutoSimulating ? 'nominal' : 'warning'}>
              {isAutoSimulating ? 'STREAMING' : 'FLUJO PAUSADO'}
            </StatusPill>
            <span className="pill pill-violet">SIM-V1</span>
          </>
        }
        actions={
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
        }
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
          />
        </div>

        <div className="xl:col-span-4">
          <MissionLogs logs={logs} />
        </div>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-space-700/70 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
              <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow block">ENGINE ARCHITECTURE</span>
              <h3 className="font-heading text-[13px] font-bold text-slate-100">Generación sintética y contratos</h3>
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
            ORION-01 · SIMULACIÓN ORBITAL
          </span>
        </div>
      </section>
    </div>
  );
}
