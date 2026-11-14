import React from 'react';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Wind, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Minus 
} from 'lucide-react';

export default function VitalCard({
  title,
  variable,
  value,
  prevValue,
  unit,
  normalRange,
  alertCondition,
  status = "normal", // "normal" | "advertencia" | "alerta"
  statusMessage
}) {
  const isAlert = status === "alerta";
  const isWarning = status === "advertencia";

  const delta = prevValue !== undefined && prevValue !== null 
    ? Number((value - prevValue).toFixed(1)) 
    : 0;

  // Icono vectorial técnico
  const getIcon = () => {
    switch (variable) {
      case "heart_rate":
        return <Heart className={`w-3.5 h-3.5 text-red-400 ${isAlert ? "animate-pulse" : ""}`} />;
      case "spo2":
        return <Activity className="w-3.5 h-3.5 text-telemetry-cyan" />;
      case "temperature":
        return <Thermometer className="w-3.5 h-3.5 text-telemetry-amber" />;
      case "respiratory_rate":
        return <Wind className="w-3.5 h-3.5 text-telemetry-blue" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-telemetry-cyan" />;
    }
  };

  // Clases del panel según estado
  const getPanelClasses = () => {
    if (isAlert) return "hud-panel-danger";
    if (isWarning) return "hud-panel-warning";
    return "hud-panel";
  };

  // Badge de estado accesible (Doble canal: icono + color + texto)
  const getStatusBadge = () => {
    if (isAlert) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-950/90 text-telemetry-crimson border border-red-500/60 shadow-hud-danger">
          <ShieldAlert className="w-3 h-3 text-telemetry-crimson" />
          <span>[CRÍTICO]</span>
        </span>
      );
    }
    if (isWarning) {
      return (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/90 text-telemetry-amber border border-amber-500/60 shadow-hud-warning">
          <AlertTriangle className="w-3 h-3 text-telemetry-amber" />
          <span>[ADVERTENCIA]</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-950/50 text-telemetry-green border border-emerald-500/40">
        <CheckCircle2 className="w-3 h-3 text-telemetry-green" />
        <span>[NOMINAL]</span>
      </span>
    );
  };

  // Porcentaje para la escala horizontal
  const getGaugePercentage = () => {
    if (variable === "heart_rate") {
      return Math.min(100, Math.max(0, ((value - 40) / 120) * 100));
    }
    if (variable === "spo2") {
      return Math.min(100, Math.max(0, ((value - 70) / 30) * 100));
    }
    if (variable === "temperature") {
      return Math.min(100, Math.max(0, ((value - 34.5) / 6.0) * 100));
    }
    if (variable === "respiratory_rate") {
      return Math.min(100, Math.max(0, ((value - 6) / 28) * 100));
    }
    return 50;
  };

  return (
    <div className={`p-3 rounded-lg border hud-corner relative transition-all duration-150 ${getPanelClasses()}`}>
      
      {/* Encabezado técnico */}
      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-space-700/60">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded bg-space-850 border border-space-700">
            {getIcon()}
          </div>
          <div>
            <span className="text-[11px] font-heading font-bold text-slate-200 tracking-wide uppercase block leading-tight">
              {title}
            </span>
            <span className="text-[9px] font-mono text-slate-400 block leading-none">
              REF: {normalRange}
            </span>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      {/* Lectura digital principal */}
      <div className="flex items-baseline justify-between my-1.5">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight ${
            isAlert ? "text-telemetry-crimson" : isWarning ? "text-telemetry-amber" : "text-slate-100"
          }`}>
            {value !== undefined ? value : "--"}
          </span>
          <span className="text-xs font-mono font-semibold text-slate-400">
            {unit}
          </span>
        </div>

        {/* Delta de cambio */}
        <div className="flex items-center gap-1 font-mono text-xs">
          {delta !== 0 ? (
            <span className={`flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
              delta > 0 
                ? (variable === "spo2" ? "text-telemetry-green bg-emerald-950/40" : "text-telemetry-amber bg-amber-950/40")
                : (variable === "spo2" ? "text-telemetry-crimson bg-red-950/40" : "text-telemetry-cyan bg-cyan-950/40")
            }`}>
              {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{delta > 0 ? `+${delta}` : delta}</span>
            </span>
          ) : (
            <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] text-slate-400 bg-space-850">
              <Minus className="w-3 h-3" /> 0.0
            </span>
          )}
        </div>
      </div>

      {/* Barra de calibración */}
      <div className="my-2">
        <div className="relative w-full h-1 bg-space-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-300 ${
              isAlert 
                ? "bg-telemetry-crimson shadow-[0_0_6px_#EF4444]" 
                : isWarning
                ? "bg-telemetry-amber shadow-[0_0_6px_#F59E0B]"
                : "bg-telemetry-cyan shadow-[0_0_6px_#00E5FF]"
            }`}
            style={{ width: `${getGaugePercentage()}%` }}
          />
        </div>
        <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-1">
          <span>MIN</span>
          <span className="text-slate-400">RANGO NOMINAL</span>
          <span>MAX</span>
        </div>
      </div>

      {/* Mensaje de estado inferior */}
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-space-700/60">
        <span className="truncate max-w-[65%]" title={statusMessage}>
          {statusMessage || "Parámetro nominal"}
        </span>
        <span className="text-slate-400 shrink-0">
          ALERTA: {alertCondition}
        </span>
      </div>

    </div>
  );
}
