import React from 'react';
import { User, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function AstronautSelector({ 
  astronauts = {}, 
  selectedId, 
  onSelect, 
  latestVitalsByAstronaut = {} 
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {Object.entries(astronauts).map(([id, ast]) => {
        const isSelected = id === selectedId;
        const vitals = latestVitalsByAstronaut[id] || {};
        const isAlert = vitals.isAlert;

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`p-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer relative ${
              isSelected
                ? isAlert 
                  ? "bg-red-950/60 border-telemetry-crimson shadow-hud-danger" 
                  : "bg-space-850 border-telemetry-cyan shadow-hud-glow"
                : isAlert
                ? "bg-red-950/30 border-red-500/50 hover:bg-red-950/40"
                : "bg-space-900 border-space-700 hover:border-space-600 hover:bg-space-850"
            }`}
          >
            {/* Header del astronauta */}
            <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-space-700/60">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs border ${
                  isSelected 
                    ? isAlert 
                      ? "bg-red-950 text-telemetry-crimson border-red-500" 
                      : "bg-space-800 text-telemetry-cyan border-telemetry-cyan/50"
                    : "bg-space-850 text-slate-300 border-space-700"
                }`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-xs text-slate-100">
                      {ast.name}
                    </span>
                    {isAlert && <AlertTriangle className="w-3.5 h-3.5 text-telemetry-crimson animate-pulse" />}
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 block leading-none">
                    {id.toUpperCase()} • {ast.role}
                  </span>
                </div>
              </div>

              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border ${
                ast.activity === "EVA" 
                  ? "bg-amber-950/60 text-telemetry-amber border-amber-500/50"
                  : "bg-space-800 text-slate-300 border-space-700"
              }`}>
                {ast.activity}
              </span>
            </div>

            {/* Muestra rápida de parámetros biomédicos */}
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px] pt-0.5">
              <div className="bg-space-950/70 p-1 rounded border border-space-700/40">
                <span className="text-[8px] text-slate-400 block">PULSO</span>
                <span className={`font-bold ${
                  vitals.heart_rate > 120 || vitals.heart_rate < 50 ? "text-telemetry-crimson" : "text-slate-200"
                }`}>
                  {vitals.heart_rate ? `${vitals.heart_rate} bpm` : "--"}
                </span>
              </div>
              <div className="bg-space-950/70 p-1 rounded border border-space-700/40">
                <span className="text-[8px] text-slate-400 block">SpO2</span>
                <span className={`font-bold ${
                  vitals.spo2 < 90 ? "text-telemetry-crimson" : "text-slate-200"
                }`}>
                  {vitals.spo2 ? `${vitals.spo2}%` : "--"}
                </span>
              </div>
              <div className="bg-space-950/70 p-1 rounded border border-space-700/40">
                <span className="text-[8px] text-slate-400 block">TEMP</span>
                <span className={`font-bold ${
                  vitals.temperature > 38.0 ? "text-telemetry-crimson" : "text-slate-200"
                }`}>
                  {vitals.temperature ? `${vitals.temperature}°C` : "--"}
                </span>
              </div>
            </div>

          </button>
        );
      })}
    </div>
  );
}
