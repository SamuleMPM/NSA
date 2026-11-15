import React from 'react';
import { Orbit } from 'lucide-react';

/**
 * Barra superior minimalista.
 * Contiene exclusivamente: logo, nombre del sistema y usuario autenticado.
 * La navegación, las alertas y el estado operativo viven en el sidebar y en
 * los módulos, no en el topbar.
 */
const CONNECTION_STATES = {
  online: {
    label: 'API · SQLite',
    title: 'Persistencia remota activa: los registros se guardan en la base de datos.',
    className: 'border-white/30 bg-white/15 text-white',
    dot: 'bg-emerald-300 shadow-none',
  },
  connecting: {
    label: 'Conectando…',
    title: 'Estableciendo enlace con la API AeroHealth.',
    className: 'border-white/30 bg-white/15 text-white',
    dot: 'animate-pulse bg-white shadow-none',
  },
  offline: {
    label: 'Modo local',
    title: 'API no disponible. Los datos se guardan en localStorage y se reintentará la sincronización.',
    className: 'border-white/30 bg-white/15 text-white',
    dot: 'bg-amber-300 shadow-none',
  },
};

export default function Header({
  user = { name: 'Elena Vance', role: 'Flight Surgeon', initials: 'EV' },
  backendStatus = 'connecting',
}) {
  const connection = CONNECTION_STATES[backendStatus] || CONNECTION_STATES.connecting;

  return (
    <header className="sticky top-0 z-30 border-b border-[#C9D9F5]/30 bg-gradient-to-r from-[#061D47] via-[#0B3D91] to-[#0D47A1] text-white shadow-sm">
      <div className="mx-auto flex h-[60px] w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo + nombre del sistema */}
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/15 text-white shadow-none">
            <Orbit className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-emerald-300" />
          </span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="truncate font-heading text-[15px] font-extrabold tracking-[0.08em] text-white">
                AEROHEALTH
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />
              <span className="mono hidden text-[9px] uppercase tracking-[0.16em] text-white/90 sm:block">
                NASA HRP
              </span>
            </div>
            <span className="mono block truncate text-[9.5px] uppercase tracking-[0.12em] text-white/80">
              Sistema de monitorización biomédica espacial
            </span>
          </div>
        </div>

        {/* Estado de persistencia + usuario autenticado */}
        <div className="flex shrink-0 items-center gap-2.5">
          <span
            className={`mono hidden items-center gap-1.5 rounded-md border px-2 py-1 text-[8px] font-bold uppercase tracking-[0.14em] sm:flex ${connection.className}`}
            title={connection.title}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${connection.dot}`} />
            {connection.label}
          </span>
          <span className="hidden text-right sm:block">
            <span className="mono block text-[8.5px] uppercase tracking-[0.14em] text-white/75">Sesión activa</span>
            <span className="block font-heading text-[12px] font-bold leading-tight text-white">{user.name}</span>
            <span className="mono block text-[9px] text-white/80">{user.role} · MCC-H</span>
          </span>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/20 font-heading text-[10px] font-extrabold tracking-wide text-white"
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
