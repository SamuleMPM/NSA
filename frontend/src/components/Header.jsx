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
  Radio,
  ChevronRight,
  Orbit,
} from 'lucide-react';

export default function Header({
  missionId = 'mars_001',
  activeModuleLabel = 'Panel General',
  onOpenJson,
  onOpenDictionary,
  hasAlert = false,
  alertCount = 0,
  soundEnabled = false,
  setSoundEnabled,
  mobileMenuOpen = false,
  setMobileMenuOpen,
}) {
  const [metTime, setMetTime] = useState({ days: 142, hours: 8, minutes: 24, seconds: 19 });
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const tick = () => {
      setMetTime((prev) => {
        let s = prev.seconds + 1;
        let m = prev.minutes;
        let h = prev.hours;
        let d = prev.days;

        if (s >= 60) { s = 0; m += 1; }
        if (m >= 60) { m = 0; h += 1; }
        if (h >= 24) { h = 0; d += 1; }

        return { days: d, hours: h, minutes: m, seconds: s };
      });

      setUtcTime(new Date().toTimeString().split(' ')[0]);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const f2 = (n) => String(n).padStart(2, '0');

  return (
    <header className="sticky top-0 z-30 border-b border-space-800/80 bg-space-950/80 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[64px] w-full max-w-[1680px] items-center justify-between gap-3 px-3.5 py-2 sm:px-5 lg:px-6">
        {/* Identity */}
        <div className="flex min-w-0 items-center gap-2.5">
          {setMobileMenuOpen ? (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-ghost btn-icon lg:hidden"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          ) : null}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan md:h-8 md:w-8">
            <Activity className="h-4 w-4 animate-pulse" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="whitespace-nowrap font-heading text-[12px] font-extrabold uppercase tracking-[0.14em] text-slate-100">
                MCC-H
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-600 xl:block" />
              <span className="mono hidden whitespace-nowrap text-[10px] uppercase tracking-wider text-slate-500 xl:block">
                ORION-01 / {missionId.replace('_', '-')}
              </span>
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
              <span className="mono text-[10px] text-slate-500">CONSOLE</span>
              <ChevronRight className="h-2.5 w-2.5 shrink-0 text-slate-700" aria-hidden="true" />
              <span className="mono truncate text-[10px] font-semibold text-cyan-300/90">
                {activeModuleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Flight clocks */}
        <div className="hidden items-center gap-1.5 xl:flex">
          <div className="flex items-center gap-2 rounded-md border border-space-700/70 bg-space-900/60 px-2.5 py-1.5">
            <Clock className="h-3.5 w-3.5 text-telemetry-cyan" aria-hidden="true" />
            <div>
              <span className="mono block text-[8px] uppercase tracking-[0.14em] text-slate-500">
                MISSION ELAPSED
              </span>
              <span className="mono block text-[11px] font-bold tracking-wider text-telemetry-cyan">
                T+{metTime.days}d {f2(metTime.hours)}:{f2(metTime.minutes)}:{f2(metTime.seconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-space-700/70 bg-space-900/60 px-2.5 py-1.5">
            <Orbit className="h-3.5 w-3.5 text-telemetry-blue" aria-hidden="true" />
            <div>
              <span className="mono block text-[8px] uppercase tracking-[0.14em] text-slate-500">
                UTC / GROUND
              </span>
              <span className="mono block text-[11px] font-bold tracking-wider text-slate-200">
                {utcTime || '--:--:--'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-400/[0.05] px-2.5 py-1.5">
            <Radio className="h-3.5 w-3.5 text-telemetry-green" aria-hidden="true" />
            <div>
              <span className="mono block text-[8px] uppercase tracking-[0.14em] text-slate-500">
                DSN GOLDSTONE 70M
              </span>
              <span className="mono block text-[11px] font-bold tracking-wider text-telemetry-green">
                LINK NOMINAL · 324ms
              </span>
            </div>
          </div>
        </div>

        {/* Alarms and tools */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="hidden 2xl:block">
            {hasAlert ? (
              <span className="pill pill-red shadow-hud-danger">
                <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                MASTER ALARM · {alertCount}
              </span>
            ) : (
              <span className="pill pill-green">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                SYSTEM NOMINAL
              </span>
            )}
          </div>

          <span className="hidden h-6 w-px bg-space-700 2xl:block" />

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Silenciar alarmas acústicas' : 'Activar alarmas acústicas'}
            aria-label={soundEnabled ? 'Silenciar alarmas acústicas' : 'Activar alarmas acústicas'}
            aria-pressed={soundEnabled}
            className={`btn btn-icon ${
              soundEnabled
                ? 'border-cyan-400/30 bg-cyan-400/[0.08] text-telemetry-cyan'
                : 'text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onOpenJson}
            className="btn"
            title="Ver contrato JSON de telemetría"
          >
            <FileCode2 className="h-3.5 w-3.5 text-telemetry-cyan" aria-hidden="true" />
            <span className="hidden xl:inline">JSON</span>
          </button>

          <button
            type="button"
            onClick={onOpenDictionary}
            className="btn"
            title="Abrir diccionario médico"
          >
            <BookOpen className="h-3.5 w-3.5 text-telemetry-blue" aria-hidden="true" />
            <span className="hidden xl:inline">Glosario</span>
          </button>

          <div className="ml-0.5 hidden h-8 items-center gap-2 rounded-md border border-space-700/70 bg-space-900/60 pl-1.5 pr-2.5 2xl:flex">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/25 to-blue-500/20 font-heading text-[8px] font-extrabold text-cyan-200">
              FS
            </span>
            <div className="leading-none">
              <span className="mono block text-[8px] uppercase tracking-wider text-slate-500">OPERATOR</span>
              <span className="mono block text-[9px] font-bold text-slate-300">FLIGHT SURGEON</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile flight status strip */}
      <div className="flex items-center justify-between gap-2 border-t border-space-800/70 px-3.5 py-1.5 2xl:hidden xl:justify-end sm:px-5">
        <div className="flex items-center gap-2 xl:hidden">
          <span className="mono flex items-center gap-1.5 text-[9px] font-semibold text-telemetry-cyan">
            <Clock className="h-3 w-3" aria-hidden="true" />
            T+{metTime.days}d {f2(metTime.hours)}:{f2(metTime.minutes)}:{f2(metTime.seconds)}
          </span>
          <span className="h-2.5 w-px bg-space-700" />
          <span className="mono text-[9px] text-slate-500">{utcTime || '--:--:--'} UTC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${hasAlert ? 'bg-telemetry-crimson' : 'bg-telemetry-green'}`} />
          <span className={`mono text-[9px] font-bold ${hasAlert ? 'text-red-300' : 'text-telemetry-green'}`}>
            {hasAlert ? `${alertCount} ALERTA(S)` : 'NOMINAL'}
          </span>
        </div>
      </div>
    </header>
  );
}
