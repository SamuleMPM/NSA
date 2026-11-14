import React from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  AlertOctagon, 
  Sliders, 
  ShieldCheck, 
  Gauge, 
  Flame, 
  Activity 
} from 'lucide-react';

export default function MissionControls({
  currentScenario,
  onSelectScenario,
  isAutoSimulating,
  onToggleAutoSim,
  onGenerateTick,
  onTriggerEmergency,
  onResetNominal,
  environmentalData = {}
}) {
  const scenarios = [
    {
      id: "microgravity",
      code: "SCN-01",
      name: "Microgravedad Nominal",
      desc: "Condición basal en órbita sin estrés fisiológico.",
      badge: "NOMINAL",
      badgeColor: "bg-emerald-950/60 text-telemetry-green border-emerald-500/40"
    },
    {
      id: "eva",
      code: "SCN-02",
      name: "Paseo Espacial (EVA)",
      desc: "Carga metabólica elevada y consumo de O2 continuo.",
      badge: "HIGH-LOAD",
      badgeColor: "bg-amber-950/60 text-telemetry-amber border-amber-500/40"
    },
    {
      id: "hypoxia",
      code: "SCN-03",
      name: "Alerta de Hipoxia",
      desc: "Despresurización parcial o caída de inyección de O2.",
      badge: "CRITICAL",
      badgeColor: "bg-red-950/80 text-telemetry-crimson border-red-500/60"
    },
    {
      id: "hyperthermia",
      code: "SCN-04",
      name: "Estrés Térmico",
      desc: "Fallo de bomba en prenda de refrigeración líquida LCVG.",
      badge: "WARNING",
      badgeColor: "bg-orange-950/60 text-orange-400 border-orange-500/40"
    },
    {
      id: "sleep",
      code: "SCN-05",
      name: "Ciclo de Sueño",
      desc: "Metabolismo basal y recuperación circadiana.",
      badge: "BASAL",
      badgeColor: "bg-blue-950/60 text-telemetry-blue border-blue-500/40"
    }
  ];

  return (
    <div className="hud-panel p-3.5 rounded-lg border border-space-700/80 space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-space-700/60 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-telemetry-cyan" />
          <h3 className="font-heading font-semibold text-xs tracking-wider text-slate-100 uppercase">
            SIMULACIÓN // INYECCIÓN DE ESCENARIOS
          </h3>
        </div>
        <span className="text-[9px] px-1.5 py-0.2 rounded bg-space-850 text-telemetry-cyan border border-space-700">
          ENGINE: SIM-V1
        </span>
      </div>

      {/* Barra de Controles Operativos */}
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
        <button
          onClick={onToggleAutoSim}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-bold transition-colors cursor-pointer border ${
            isAutoSimulating
              ? "bg-amber-500 hover:bg-amber-400 text-space-950 border-amber-400"
              : "bg-telemetry-cyan hover:bg-cyan-400 text-space-950 border-cyan-300"
          }`}
        >
          {isAutoSimulating ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isAutoSimulating ? "PAUSAR FLUJO" : "TRANSMISIÓN EN VIVO"}</span>
        </button>

        <button
          onClick={onGenerateTick}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-space-850 hover:bg-space-800 border border-space-700 text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3 text-telemetry-cyan" />
          <span>Generar Tick</span>
        </button>

        <button
          onClick={onTriggerEmergency}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-telemetry-crimson transition-colors cursor-pointer ml-auto"
        >
          <AlertOctagon className="w-3 h-3" />
          <span>Inyectar Anomalía</span>
        </button>

        <button
          onClick={onResetNominal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 text-telemetry-green transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>Restablecer</span>
        </button>
      </div>

      {/* Grid de Escenarios Fisiológicos */}
      <div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
          ESCENARIOS FISIOLÓGICOS DISPONIBLES:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 font-mono text-xs">
          {scenarios.map((sc) => {
            const isCurrent = currentScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`p-2 rounded border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-space-800 border-telemetry-cyan text-white shadow-hud"
                    : "bg-space-950/50 border-space-700/80 text-slate-300 hover:bg-space-900 hover:border-space-600"
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold">{sc.code}</span>
                    <span className="font-heading font-semibold text-xs">{sc.name}</span>
                  </div>
                  <span className={`text-[8px] px-1 py-0.2 rounded border font-bold ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <p className="text-[9px] text-slate-400 leading-tight truncate">{sc.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Telemetría Ambiental del Traje y Cabina */}
      <div className="pt-2 border-t border-space-700/60">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
          PARÁMETROS AMBIENTALES DE SOPORTE VITAL (ECLSS):
        </span>
        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          <div className="p-2 rounded bg-space-950 border border-space-700">
            <span className="text-[9px] text-slate-400 block flex items-center gap-1">
              <Gauge className="w-3 h-3 text-telemetry-cyan" /> PRESIÓN TRAJE
            </span>
            <span className="text-sm font-bold text-slate-100">
              {environmentalData.suitPressure || 29.6} <span className="text-[10px] font-normal text-slate-400">kPa</span>
            </span>
          </div>

          <div className="p-2 rounded bg-space-950 border border-space-700">
            <span className="text-[9px] text-slate-400 block flex items-center gap-1">
              <Flame className="w-3 h-3 text-telemetry-amber" /> RADIACIÓN
            </span>
            <span className="text-sm font-bold text-telemetry-amber">
              {environmentalData.radiation || 18.2} <span className="text-[10px] font-normal text-slate-400">μSv/h</span>
            </span>
          </div>

          <div className="p-2 rounded bg-space-950 border border-space-700">
            <span className="text-[9px] text-slate-400 block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-telemetry-green" /> CO2 CIRCUITO
            </span>
            <span className="text-sm font-bold text-slate-100">
              {environmentalData.co2Level || 3.1} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
