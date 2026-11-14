import React from 'react';
import MissionControls from '../components/MissionControls';
import MissionLogs from '../components/MissionLogs';
import { Sliders, Cpu, Activity, ShieldCheck } from 'lucide-react';

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
  selectedAstronautId
}) {
  const currentAstronaut = astronauts[selectedAstronautId] || {};

  return (
    <div className="space-y-3.5">
      
      {/* Header del Módulo */}
      <div className="hud-panel p-3 rounded-lg border border-space-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono uppercase px-2 py-0.2 rounded bg-space-850 text-telemetry-cyan border border-space-700 font-bold tracking-widest">
              MOD-03 // MOTOR DE SIMULACIÓN Y ESCENARIOS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-slate-400">
              SYNTHETIC DATA GENERATOR V1
            </span>
          </div>
          <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide">
            CONTROL DE SIMULACIÓN Y ESTADOS FISIOLÓGICOS
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-emerald-950/40 text-telemetry-green border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> MOTOR SINTÉTICO ACTIVO
          </span>
        </div>
      </div>

      {/* Controles y Terminal */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-7">
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

        <div className="lg:col-span-5">
          <MissionLogs logs={logs} />
        </div>
      </section>

      {/* Explicación Técnica de Modelos */}
      <section className="hud-panel p-3.5 rounded-lg border border-space-700/80 font-mono text-xs space-y-2">
        <h4 className="font-heading font-bold text-slate-200 text-xs uppercase tracking-wide flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-telemetry-cyan" />
          ARQUITECTURA DE GENERACIÓN SINTÉTICA Y CONTRATOS
        </h4>
        <p className="text-slate-400 leading-normal text-[11px]">
          Este simulador reproduce respuestas hemodinámicas y metabólicas ante descompresión atmosférica, fallos en la prenda de refrigeración líquida (LCVG) y esfuerzo extravehicular en el vacío, emitiendo paquetes JSON compatibles con <code className="text-telemetry-cyan">docs/ARCHITECTURE.md</code>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[10px]">
          <div className="p-2 rounded bg-space-950 border border-space-700">
            <strong className="text-telemetry-cyan block font-mono">1. Modelo Estocástico</strong>
            <span className="text-slate-400">Distribuciones acopladas al gasto metabólico (Watts) y estrés adinámico.</span>
          </div>
          <div className="p-2 rounded bg-space-950 border border-space-700">
            <strong className="text-telemetry-cyan block font-mono">2. Acoplamiento de Traje</strong>
            <span className="text-slate-400">Presión de escafandra (29.6 kPa) vs saturación capilar (SpO2).</span>
          </div>
          <div className="p-2 rounded bg-space-950 border border-space-700">
            <strong className="text-telemetry-cyan block font-mono">3. Verificación de Contrato</strong>
            <span className="text-slate-400">100% sintético para software testing y Space Apps Challenge.</span>
          </div>
        </div>
      </section>

    </div>
  );
}
