import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  FileCode2, 
  BookOpen, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Menu,
  X,
  Radio
} from 'lucide-react';

export default function Header({ 
  missionId = "mars_001", 
  onOpenJson, 
  onOpenDictionary, 
  hasAlert = false, 
  soundEnabled = false, 
  setSoundEnabled,
  mobileMenuOpen = false,
  setMobileMenuOpen
}) {
  const [metTime, setMetTime] = useState({ days: 142, hours: 8, minutes: 24, seconds: 19 });
  const [utcTime, setUtcTime] = useState("");

  // Reloj MET (Mission Elapsed Time)
  useEffect(() => {
    const timer = setInterval(() => {
      setMetTime(prev => {
        let s = prev.seconds + 1;
        let m = prev.minutes;
        let h = prev.hours;
        let d = prev.days;

        if (s >= 60) { s = 0; m += 1; }
        if (m >= 60) { m = 0; h += 1; }
        if (h >= 24) { h = 0; d += 1; }

        return { days: d, hours: h, minutes: m, seconds: s };
      });

      const now = new Date();
      setUtcTime(now.toTimeString().split(' ')[0] + " UTC");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const f2 = (n) => String(n).padStart(2, '0');

  return (
    <header className="border-b border-space-700 bg-space-950/95 sticky top-0 z-30 backdrop-blur-md">
      <div className="w-full px-3 sm:px-5 py-2">
        <div className="flex items-center justify-between gap-2.5">
          
          {/* Botón menú móvil + Logo de Misión */}
          <div className="flex items-center gap-2.5">
            {setMobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 rounded bg-space-850 border border-space-700 text-slate-300 hover:text-telemetry-cyan cursor-pointer transition-colors"
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded bg-space-850 border border-telemetry-cyan/40 text-telemetry-cyan shadow-hud">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-heading font-extrabold text-xs sm:text-sm tracking-widest text-slate-100 uppercase">
                    NASA // MCC-H
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded bg-space-800 text-telemetry-cyan border border-space-700 font-bold">
                    BIO-TELEMETRY
                  </span>
                  <span className="hidden lg:inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                  <span className="hidden lg:inline-block text-[11px] font-mono text-slate-400">
                    ORION-01 // {missionId.toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-telemetry-green font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-telemetry-green animate-pulse"></span>
                    DSN GOLDSTONE 70M
                  </span>
                  <span className="text-slate-600">•</span>
                  <span>RTT: 324ms (NOMINAL)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Relojes MET y UTC + Alarma Maestra */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Reloj de Vuelo (MET) */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-space-900 border border-space-700 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-telemetry-cyan shrink-0" />
              <div>
                <span className="text-[8px] text-slate-400 block leading-none uppercase">MISSION ELAPSED (MET)</span>
                <span className="text-telemetry-cyan font-bold tracking-wider text-xs">
                  T+{metTime.days}d {f2(metTime.hours)}:{f2(metTime.minutes)}:{f2(metTime.seconds)}
                </span>
              </div>
            </div>

            {/* Alerta Maestra (Dual: Icono + Color + Texto) */}
            {hasAlert ? (
              <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-red-950/80 border border-telemetry-crimson text-telemetry-crimson text-xs font-mono font-bold animate-pulse shadow-hud-danger">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="text-[11px]">ALARM // [CRIT]</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-emerald-950/40 border border-telemetry-green/40 text-telemetry-green text-xs font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">SYS // [NOMINAL]</span>
              </div>
            )}

            {/* Acciones de Operación */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Silenciar alarmas acústicas" : "Activar alarmas acústicas"}
                className={`p-1.5 rounded border text-xs transition-colors cursor-pointer ${
                  soundEnabled 
                    ? "bg-telemetry-cyan/15 border-telemetry-cyan/50 text-telemetry-cyan" 
                    : "bg-space-850 border-space-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onOpenJson}
                className="flex items-center gap-1 px-2 py-1 rounded bg-space-850 hover:bg-space-800 border border-space-700 text-xs font-mono text-slate-300 hover:text-telemetry-cyan transition-colors cursor-pointer"
              >
                <FileCode2 className="w-3.5 h-3.5 text-telemetry-cyan" />
                <span className="hidden md:inline">JSON</span>
              </button>

              <button
                onClick={onOpenDictionary}
                className="flex items-center gap-1 px-2 py-1 rounded bg-space-850 hover:bg-space-800 border border-space-700 text-xs font-mono text-slate-300 hover:text-telemetry-cyan transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-telemetry-blue" />
                <span className="hidden md:inline">Glosario</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
