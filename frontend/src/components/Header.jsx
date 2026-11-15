import React from 'react';
import { Orbit } from 'lucide-react';

/**
 * Barra superior minimalista.
 * Contiene exclusivamente: logo, nombre del sistema y usuario autenticado.
 * La navegación, las alertas y el estado operativo viven en el sidebar y en
 * los módulos, no en el topbar.
 */
export default function Header({ user = { name: 'Elena Vance', role: 'Flight Surgeon', initials: 'EV' } }) {
  return (
    <header className="sticky top-0 z-30 border-b border-space-800/80 bg-space-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo + nombre del sistema */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/[0.07] text-telemetry-cyan shadow-[0_0_22px_-8px_rgba(34,211,238,0.75)]">
            <Orbit className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-telemetry-green shadow-[0_0_8px_#34D399]" />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="truncate font-heading text-[15px] font-extrabold tracking-[0.08em] text-white">
                AEROHEALTH
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:block" />
              <span className="mono hidden text-[9px] uppercase tracking-[0.16em] text-telemetry-cyan/80 sm:block">
                NASA HRP
              </span>
            </div>
            <span className="mono block truncate text-[9.5px] uppercase tracking-[0.12em] text-slate-500">
              Sistema de monitorización biomédica espacial
            </span>
          </div>
        </div>

        {/* Usuario autenticado */}
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="hidden text-right sm:block">
            <span className="mono block text-[8.5px] uppercase tracking-[0.14em] text-slate-500">Sesión activa</span>
            <span className="block font-heading text-[12px] font-bold leading-tight text-slate-200">{user.name}</span>
            <span className="mono block text-[9px] text-slate-500">{user.role} · MCC-H</span>
          </span>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 font-heading text-[10px] font-extrabold tracking-wide text-cyan-100"
            title={`${user.name} · ${user.role}`}
            aria-label={`Usuario conectado: ${user.name}, ${user.role}`}
          >
            {user.initials}
          </span>
        </div>
      </div>
    </header>
  );
}
