import React from 'react';
import {
  LayoutDashboard,
  Compass,
  ClipboardCheck,
  Activity,
  Trophy,
  BookOpen,
  SlidersHorizontal,
  ShieldAlert,
  Database,
  Volume2,
  VolumeX,
  X,
  Orbit,
  Radio,
  Users,
  ChevronRight,
} from 'lucide-react';

const MODULES = [
  {
    id: 'general',
    index: '01',
    name: 'Panel General',
    desc: 'Salud de tripulación y ECLSS',
    icon: LayoutDashboard,
  },
  {
    id: 'bodymap',
    index: '02',
    name: 'Astronauta 3D & Chequeo',
    desc: 'Modelo 3D realista y SANS',
    icon: Compass,
  },
  {
    id: 'self_assessment',
    index: '03',
    name: 'Autoevaluación & Datos',
    desc: 'PA, glucosa, sueño y ecógrafo',
    icon: ClipboardCheck,
  },
  {
    id: 'telemetry',
    index: '04',
    name: 'Telemetría y ECG',
    desc: 'Signos vitales y Lead II',
    icon: Activity,
  },
  {
    id: 'gamification',
    index: '05',
    name: 'Rutinas y Gamificación',
    desc: 'AeroQuest, ARED y medallas',
    icon: Trophy,
  },
  {
    id: 'handbook',
    index: '06',
    name: 'Manual Médico HRP',
    desc: '5 Riesgos NASA y guías',
    icon: BookOpen,
  },
  {
    id: 'simulator',
    index: '07',
    name: 'Simulador y Entornos',
    desc: 'Escenarios y multi-entorno',
    icon: SlidersHorizontal,
  },
  {
    id: 'alerts',
    index: '08',
    name: 'Alertas y Soluciones',
    desc: 'Contramedidas clínicas',
    icon: ShieldAlert,
  },
  {
    id: 'integration',
    index: '09',
    name: 'Integración y Datos',
    desc: 'Contrato JSON y auditoría',
    icon: Database,
  },
];

function roleCode(role = '') {
  if (role.toLowerCase().includes('comandante')) return 'CDR';
  if (role.toLowerCase().includes('biomédica')) return 'BMS';
  if (role.toLowerCase().includes('ingeniero')) return 'FE';
  return 'CREW';
}

function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Sidebar({
  activeModule,
  setActiveModule,
  astronauts = {},
  selectedAstronautId,
  setSelectedAstronautId,
  totalAlertsCount = 0,
  soundEnabled = false,
  setSoundEnabled,
  missionId = 'mars_001',
  mobileMenuOpen = false,
  setMobileMenuOpen,
}) {
  const handleSelectModule = (id) => {
    setActiveModule(id);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleSelectAstronaut = (id) => {
    setSelectedAstronautId(id);
    if (setMobileMenuOpen) setMobileMenuOpen(false);
  };

  return (
    <>
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[276px] shrink-0 flex-col border-r border-space-800/90 bg-space-950/95 backdrop-blur-xl transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navegación principal"
      >
        {/* Brand / command masthead */}
        <div className="relative border-b border-space-800/90 px-4 pb-4 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/[0.06] text-telemetry-cyan">
                <Orbit className="h-5 w-5" aria-hidden="true" />
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-telemetry-green shadow-[0_0_8px_#34D399]" />
              </div>
              <div>
                <div className="font-heading text-[15px] font-extrabold tracking-wide text-white">
                  AEROHEALTH
                </div>
                <div className="eyebrow mt-0.5">NASA HRP PLATFORM</div>
              </div>
            </div>

            {setMobileMenuOpen ? (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-ghost btn-icon lg:hidden"
                aria-label="Cerrar menú"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-md border border-space-700/80 bg-space-900/70 px-2.5 py-2">
            <div>
              <span className="eyebrow block">MISSION</span>
              <span className="mono text-[11px] font-bold uppercase tracking-wider text-slate-200">
                {missionId.replace('_', '-')}
              </span>
            </div>
            <div className="text-right">
              <span className="eyebrow block">PHASE</span>
              <span className="mono text-[11px] font-bold text-telemetry-cyan">TRANSIT</span>
            </div>
            <span className="h-7 w-px bg-space-700" />
            <div className="text-right">
              <span className="eyebrow block">CREW</span>
              <span className="mono text-[11px] font-bold text-slate-200">
                {String(Object.keys(astronauts).length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="eyebrow">CONSOLAS / MOD</span>
            <span className="mono text-[9px] text-slate-600">09</span>
          </div>

          <div className="space-y-1">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.id;
              const isAlerts = mod.id === 'alerts';
              const hasCritical = isAlerts && totalAlertsCount > 0;

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(mod.id)}
                  className={`nav-item group ${isActive ? 'nav-item-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      isActive
                        ? 'border-cyan-400/30 bg-cyan-400/10 text-telemetry-cyan'
                        : 'border-space-700/70 bg-space-900/70 text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-heading text-[12.5px] font-bold tracking-tight text-inherit">
                        {mod.name}
                      </span>
                      {hasCritical ? (
                        <span className="mono rounded-full border border-red-400/30 bg-red-400/10 px-1.5 py-0.5 text-[9px] font-bold text-red-300 animate-pulse-soft">
                          {totalAlertsCount}
                        </span>
                      ) : (
                        <span className="mono text-[9px] text-slate-600">{mod.index}</span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-[10.5px] leading-tight text-slate-500">
                      {mod.desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Crew */}
          <div className="mb-2 mt-4 flex items-center justify-between px-1">
            <span className="eyebrow flex items-center gap-1.5">
              <Users className="h-3 w-3" aria-hidden="true" />
              TRIPULACIÓN
            </span>
            <span className="mono text-[9px] text-slate-600">LIVE</span>
          </div>

          <div className="space-y-1">
            {Object.entries(astronauts).map(([id, ast]) => {
              const isSelected = id === selectedAstronautId;
              const isEva = ast.activity === 'EVA';

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectAstronaut(id)}
                  className={`group flex w-full items-center gap-2.5 rounded-md border px-2 py-1.5 text-left transition-colors ${
                    isSelected
                      ? 'border-cyan-400/25 bg-cyan-400/[0.07]'
                      : 'border-transparent hover:border-space-700 hover:bg-space-900/70'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-heading text-[10px] font-extrabold ${
                      isSelected
                        ? 'border-cyan-400/40 bg-cyan-400/10 text-telemetry-cyan'
                        : 'border-space-700 bg-space-900 text-slate-400'
                    }`}
                  >
                    {initials(ast.name)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`truncate font-heading text-[11.5px] font-bold ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                        {ast.name}
                      </span>
                      <span className="mono text-[8.5px] text-slate-600">{roleCode(ast.role)}</span>
                    </span>
                    <span className="mono mt-0.5 block truncate text-[9px] text-slate-500">
                      {ast.role}
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`mono rounded border px-1 py-0.5 text-[8px] font-bold ${
                        isEva
                          ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                          : 'border-space-700 bg-space-900 text-slate-500'
                      }`}
                    >
                      {ast.activity}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${isEva ? 'bg-telemetry-amber' : 'bg-telemetry-green'}`}
                      aria-hidden="true"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer controls */}
        <div className="safe-bottom border-t border-space-800/90 bg-space-950/90 px-3 py-3">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex w-full items-center justify-between rounded-md border px-2.5 py-2 transition-colors ${
              soundEnabled
                ? 'border-cyan-400/30 bg-cyan-400/[0.07] text-cyan-200'
                : 'border-space-700 bg-space-900/60 text-slate-400 hover:border-space-600 hover:text-slate-200'
            }`}
            aria-pressed={soundEnabled}
          >
            <span className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="mono text-[10px] font-bold tracking-wide">
                {soundEnabled ? 'ALARMA SONORA ON' : 'ALARMA SILENCIADA'}
              </span>
            </span>
            {soundEnabled ? (
              <span className="h-1.5 w-1.5 rounded-full bg-telemetry-cyan shadow-[0_0_8px_#22D3EE]" />
            ) : (
              <span className="mono text-[9px] text-slate-600">MUT</span>
            )}
          </button>

          <div className="mt-2.5 rounded-md border border-space-700/70 bg-space-900/50 px-2.5 py-2">
            <div className="flex items-center justify-between">
              <span className="mono flex items-center gap-1.5 text-[9px] text-slate-500">
                <Radio className="h-3 w-3 text-telemetry-green" aria-hidden="true" />
                DSN LINK (MARTE)
              </span>
              <span className="mono text-[9px] font-bold text-telemetry-green">100%</span>
            </div>
            <div className="rail mt-1.5">
              <div className="rail-fill rail-green" style={{ width: '100%' }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between font-mono text-[8.5px] text-slate-600">
              <span>LATENCIA: 14.5 MIN</span>
              <span className="flex items-center gap-1">
                AUTONOMÍA
                <ChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
