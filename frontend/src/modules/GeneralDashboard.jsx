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
  User, 
  CheckCircle2, 
  ArrowRight,
  Radio,
  Sliders,
  Cpu
} from 'lucide-react';

export default function GeneralDashboard({
  missionId = "mars_001",
  astronauts = {},
  selectedAstronautId,
  setSelectedAstronautId,
  latestVitalsByAstronaut = {},
  activeAlerts = [],
  environmentalData = {},
  currentScenario = "microgravity",
  setActiveModule,
  onResetNominal
}) {
  // Cálculo de índice de salud consolidado de la tripulación
  let totalScore = 100;
  activeAlerts.forEach(a => {
    if (a.severity === "CRITICAL") totalScore -= 18;
    else if (a.severity === "WARNING") totalScore -= 7;
  });
  totalScore = Math.max(35, Math.min(100, totalScore));

  const getHealthBadge = () => {
    if (totalScore >= 90) {
      return {
        label: "[NOMINAL]",
        style: "bg-emerald-950/60 text-telemetry-green border-emerald-500/40",
        desc: "Sistemas biológicos en rango óptimo"
      };
    }
    if (totalScore >= 70) {
      return {
        label: "[ATENCIÓN]",
        style: "bg-amber-950/60 text-telemetry-amber border-amber-500/40",
        desc: "Desviaciones menores en curso"
      };
    }
    return {
      label: "[CRÍTICO]",
      style: "bg-red-950/80 text-telemetry-crimson border-red-500/60 animate-pulse shadow-hud-danger",
      desc: "Anomalía médica activa en tripulación"
    };
  };

  const healthBadge = getHealthBadge();

  return (
    <div className="space-y-3.5">
      
      {/* Banner de Estado Global de la Misión (NASA MCC-H Header Strip) */}
      <div className="hud-panel p-4 rounded-lg border border-space-700/80 hud-corner">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono uppercase px-2 py-0.2 rounded bg-space-850 text-telemetry-cyan border border-space-700 font-bold tracking-widest">
                MOD-01 // PANEL DE COMANDO GENERAL
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-[10px] font-mono text-slate-400">
                ORION-01 // FLIGHT SURGEON CONSOLE
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-wider uppercase">
              ESTADO BIOMÉDICO Y TELEMETRÍA DE TRIPULACIÓN
            </h2>
            <p className="text-xs font-mono text-slate-300 mt-0.5 max-w-2xl leading-normal">
              Monitoreo fisiológico holístico en tiempo real de los 3 astronautas en la misión <strong className="text-telemetry-cyan">{missionId.toUpperCase()}</strong>.
              Flujo continuo generado mediante modelos matemáticos sintéticos.
            </p>
          </div>

          {/* Tarjeta de Índice Fisiológico Consolidado */}
          <div className="flex items-center gap-3.5 p-2.5 rounded bg-space-950 border border-space-700 shrink-0 font-mono">
            <div className={`flex flex-col items-center justify-center w-14 h-14 rounded border ${healthBadge.style}`}>
              <span className="text-xl font-bold font-mono leading-none">{totalScore}%</span>
              <span className="text-[7px] uppercase mt-0.5 tracking-wider font-bold">ÍNDICE</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">SALUD CONSOLIDADA</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-xs font-bold px-1.5 py-0.2 rounded border ${healthBadge.style}`}>
                  {healthBadge.label}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                {activeAlerts.length === 0 ? "Sin anomalías activas" : `${activeAlerts.length} anomalía(s) activa(s)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Matriz Biomédica de la Tripulación (3 Astronautas) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-telemetry-cyan" />
            <h3 className="font-heading font-bold uppercase tracking-wider text-slate-200 text-xs">
              MATRIZ BIOMÉDICA DE TRIPULACIÓN
            </h3>
          </div>
          <span className="text-[10px]">SELECCIONA PARA ABRIR FOCO DE TELEMETRÍA EN MOD-02</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(astronauts).map(([id, ast]) => {
            const vitals = latestVitalsByAstronaut[id] || {};
            const isAlert = vitals.isAlert;
            const isSelected = id === selectedAstronautId;

            return (
              <div
                key={id}
                onClick={() => {
                  setSelectedAstronautId(id);
                  setActiveModule('telemetry');
                }}
                className={`p-3.5 rounded-lg border transition-all duration-150 cursor-pointer relative hud-corner ${
                  isAlert
                    ? "hud-panel-danger"
                    : isSelected
                    ? "hud-panel-active"
                    : "hud-panel hover:bg-space-900"
                }`}
              >
                {/* Header del astronauta */}
                <div className="flex items-start justify-between mb-2.5 pb-1.5 border-b border-space-700/60">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs border ${
                      isAlert 
                        ? "bg-red-950 text-telemetry-crimson border-red-500" 
                        : "bg-space-850 text-telemetry-cyan border-telemetry-cyan/50"
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading font-bold text-sm text-white">
                          {ast.name}
                        </span>
                        {isAlert && <AlertTriangle className="w-3.5 h-3.5 text-telemetry-crimson animate-pulse" />}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block leading-tight">
                        {id.toUpperCase()} • {ast.role}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border ${
                    ast.activity === "EVA" 
                      ? "bg-amber-950/60 text-telemetry-amber border-amber-500/50"
                      : "bg-space-800 text-slate-300 border-space-700"
                  }`}>
                    {ast.activity}
                  </span>
                </div>

                {/* Grid 2x2 de Signos Vitales */}
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs mb-2.5">
                  <div className="p-2 rounded bg-space-950 border border-space-700/60">
                    <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" /> PULSO (HR)
                    </span>
                    <span className={`text-base font-bold tracking-tight ${
                      vitals.heart_rate > 120 || vitals.heart_rate < 50 ? "text-telemetry-crimson" : "text-slate-100"
                    }`}>
                      {vitals.heart_rate || "--"} <span className="text-[10px] font-normal text-slate-400">bpm</span>
                    </span>
                  </div>

                  <div className="p-2 rounded bg-space-950 border border-space-700/60">
                    <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                      <Activity className="w-3 h-3 text-telemetry-cyan" /> OXÍGENO (SpO2)
                    </span>
                    <span className={`text-base font-bold tracking-tight ${
                      vitals.spo2 < 90 ? "text-telemetry-crimson" : "text-slate-100"
                    }`}>
                      {vitals.spo2 || "--"} <span className="text-[10px] font-normal text-slate-400">%</span>
                    </span>
                  </div>

                  <div className="p-2 rounded bg-space-950 border border-space-700/60">
                    <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-telemetry-amber" /> TEMP CORP
                    </span>
                    <span className={`text-base font-bold tracking-tight ${
                      vitals.temperature > 38.0 ? "text-telemetry-crimson" : "text-slate-100"
                    }`}>
                      {vitals.temperature || "--"} <span className="text-[10px] font-normal text-slate-400">°C</span>
                    </span>
                  </div>

                  <div className="p-2 rounded bg-space-950 border border-space-700/60">
                    <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                      <Wind className="w-3 h-3 text-telemetry-blue" /> RESP (RR)
                    </span>
                    <span className={`text-base font-bold tracking-tight ${
                      vitals.respiratory_rate > 24 ? "text-telemetry-crimson" : "text-slate-100"
                    }`}>
                      {vitals.respiratory_rate || "--"} <span className="text-[10px] font-normal text-slate-400">rpm</span>
                    </span>
                  </div>
                </div>

                {/* Footer de acción */}
                <div className="flex items-center justify-between text-xs font-mono text-telemetry-cyan pt-1.5 border-t border-space-700/60">
                  <span className="text-[10px]">Inspeccionar Lead II & tendencias</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Soporte Vital (ECLSS) y Centro de Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* ECLSS - 7 cols */}
        <div className="lg:col-span-7 hud-panel p-3.5 rounded-lg border border-space-700/80 space-y-3">
          <div className="flex items-center justify-between border-b border-space-700/60 pb-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-telemetry-green" />
              <h3 className="font-heading font-semibold text-xs tracking-wider text-white uppercase">
                SOPORTE VITAL Y ENTORNO // ECLSS
              </h3>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950/40 text-telemetry-green border border-emerald-500/40">
              STATUS: OPERACIONAL
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="p-2.5 rounded bg-space-950 border border-space-700">
              <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                <Gauge className="w-3 h-3 text-telemetry-cyan" /> PRESIÓN TRAJE
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-slate-100">{environmentalData.suitPressure || 29.6}</span>
                <span className="text-slate-400 text-[10px]">kPa</span>
              </div>
              <div className="w-full bg-space-800 h-1 rounded-full overflow-hidden mt-1.5">
                <div className="bg-telemetry-cyan h-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-[8px] text-slate-400 block mt-1">Rango: 28.0 - 32.0 kPa</span>
            </div>

            <div className="p-2.5 rounded bg-space-950 border border-space-700">
              <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                <Zap className="w-3 h-3 text-telemetry-amber" /> RADIACIÓN
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-telemetry-amber">{environmentalData.radiation || 18.2}</span>
                <span className="text-slate-400 text-[10px]">μSv/h</span>
              </div>
              <div className="w-full bg-space-800 h-1 rounded-full overflow-hidden mt-1.5">
                <div className="bg-telemetry-amber h-full" style={{ width: '42%' }}></div>
              </div>
              <span className="text-[8px] text-slate-400 block mt-1">Blindaje: 98.2%</span>
            </div>

            <div className="p-2.5 rounded bg-space-950 border border-space-700">
              <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-telemetry-green" /> CO2 CIRCUITO
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold text-telemetry-green">{environmentalData.co2Level || 3.1}</span>
                <span className="text-slate-400 text-[10px]">mmHg</span>
              </div>
              <div className="w-full bg-space-800 h-1 rounded-full overflow-hidden mt-1.5">
                <div className="bg-telemetry-green h-full" style={{ width: '25%' }}></div>
              </div>
              <span className="text-[8px] text-slate-400 block mt-1">Scrubber LiOH: OK</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-space-950 border border-space-700 font-mono text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-telemetry-cyan animate-pulse" />
              <span>Escenario activo: <strong className="text-white uppercase">{currentScenario}</strong></span>
            </span>
            <button
              onClick={() => setActiveModule('simulator')}
              className="text-telemetry-cyan hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <span>Ajustar Escenario</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Centro de Alertas - 5 cols */}
        <div className="lg:col-span-5 hud-panel p-3.5 rounded-lg border border-space-700/80 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-space-700/60 pb-2 font-mono text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-telemetry-crimson" />
                <h3 className="font-heading font-semibold text-xs tracking-wider text-white uppercase">
                  ALERTAS CLÍNICAS ACTIVAS
                </h3>
              </div>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                activeAlerts.length > 0 
                  ? "bg-red-950/80 text-telemetry-crimson border border-red-500/60 animate-pulse shadow-hud-danger" 
                  : "bg-emerald-950/40 text-telemetry-green border border-emerald-500/40"
              }`}>
                {activeAlerts.length > 0 ? `${activeAlerts.length} [CRIT]` : "[NOMINAL]"}
              </span>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="p-4 rounded bg-emerald-950/20 border border-emerald-500/20 text-center space-y-1.5 mt-2">
                <CheckCircle2 className="w-6 h-6 text-telemetry-green mx-auto" />
                <h4 className="font-mono font-bold text-xs text-telemetry-green">Parámetros Nominales</h4>
                <p className="font-mono text-[10px] text-slate-400">
                  Ningún astronauta se encuentra en condiciones de riesgo o fuera de los límites clínicos.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 mt-2">
                {activeAlerts.map((alt, idx) => (
                  <div key={idx} className="p-2 rounded bg-red-950/40 border border-red-500/40 font-mono text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-200 flex items-center gap-1 text-[11px]">
                        <AlertTriangle className="w-3 h-3 text-telemetry-crimson" />
                        {alt.astronautName} ({alt.astronautId})
                      </span>
                      <span className="text-[9px] text-telemetry-crimson bg-red-950 px-1 rounded border border-red-500/50 font-bold">
                        {alt.variable}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">{alt.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-space-700/60 flex items-center justify-between gap-2 font-mono text-xs">
            {activeAlerts.length > 0 && (
              <button
                onClick={onResetNominal}
                className="px-2.5 py-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/50 text-telemetry-green border border-emerald-500/40 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Estabilizar
              </button>
            )}

            <button
              onClick={() => setActiveModule('alerts')}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-space-850 hover:bg-space-800 border border-space-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <span>Abrir Sistema de Alertas y Soluciones (MOD-04)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
