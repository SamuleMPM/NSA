import React, { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Orbit,
  ShieldCheck,
} from 'lucide-react';
import { loadSidebarCollapsed, writeJSON, STORAGE_KEYS } from '../lib/storage';

const PRIMARY_MODULES = [
  {
    id: 'dashboard',
    index: '01',
    name: 'Dashboard',
    desc: 'Estado de salud y riesgos',
    icon: LayoutDashboard,
  },
  {
    id: 'telemetry',
    index: '02',
    name: 'Telemetría y ECG',
    desc: 'Vitales, ECG y astronauta 3D',
    icon: Activity,
  },
  {
    id: 'simulator',
    index: '03',
    name: 'Simulador y entornos',
    desc: 'Escenarios espaciales',
    icon: SlidersHorizontal,
  },
];

export default function Sidebar({ activeModule, setActiveModule, alertCount = 0 }) {
  const [collapsed, setCollapsed] = useState(() => loadSidebarCollapsed());

  const toggleCollapsed = () => {
    setCollapsed((previous) => {
      const next = !previous;
      writeJSON(STORAGE_KEYS.sidebarCollapsed, next);
      return next;
    });
  };

  const handleSelect = (id) => setActiveModule(id);

  return (
    <>
      {/* Sidebar de escritorio, expandible/contraíble */}
      <aside
        className={`sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-space-800/90 bg-space-950/95 backdrop-blur-xl transition-[width] duration-200 ease-out lg:flex ${
          collapsed ? 'w-[76px]' : 'w-[264px]'
        }`}
        aria-label="Navegación principal"
      >
        <div className={`flex h-[60px] items-center border-b border-space-800/90 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
              <Orbit className="h-4 w-4" aria-hidden="true" />
            </span>
            {!collapsed ? (
              <div className="min-w-0 leading-tight">
                <span className="mono block text-[8px] uppercase tracking-[0.16em] text-slate-500">Consola</span>
                <span className="block truncate font-heading text-[11.5px] font-bold text-slate-200">Navegación</span>
              </div>
            ) : null}
          </div>
          {!collapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="btn btn-ghost btn-icon !h-8 !w-8 !min-w-0"
              aria-label="Contraer barra lateral"
              title="Contraer barra lateral"
              aria-expanded={!collapsed}
            >
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4" aria-label="Módulos principales">
          {!collapsed ? <span className="eyebrow mb-2 block px-2">Módulos / 03</span> : null}
          <div className="space-y-1.5">
            {PRIMARY_MODULES.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              const isDashboard = module.id === 'dashboard' && alertCount > 0;
              return (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => handleSelect(module.id)}
                  className={`nav-item group ${isActive ? 'nav-item-active' : ''} ${
                    collapsed ? 'justify-center !px-0' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? `${module.name} · ${module.desc}` : undefined}
                >
                  <span
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      isActive
                        ? 'border-cyan-400/35 bg-cyan-400/10 text-telemetry-cyan'
                        : 'border-space-700/70 bg-space-900/70 text-slate-500 group-hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {isDashboard ? (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-space-950 bg-rose-400 px-1 font-mono text-[8px] font-bold text-space-950">
                        {alertCount > 9 ? '9+' : alertCount}
                      </span>
                    ) : null}
                  </span>

                  {!collapsed ? (
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-heading text-[12.5px] font-bold tracking-tight">{module.name}</span>
                        <span className="mono text-[8.5px] text-slate-600">{module.index}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] leading-tight text-slate-500">{module.desc}</span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>

        <div className={`safe-bottom border-t border-space-800/90 px-2 py-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {collapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="btn btn-ghost btn-icon !h-9 !w-9 !min-w-0"
              aria-label="Expandir barra lateral"
              title="Expandir barra lateral"
              aria-expanded={!collapsed}
            >
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="rounded-md border border-space-700/70 bg-space-900/45 px-2.5 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="mono flex items-center gap-1.5 text-[8.5px] uppercase tracking-wider text-slate-500">
                  <ShieldCheck className="h-3 w-3 text-emerald-300" aria-hidden="true" />
                  Persistencia local
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              </div>
              <p className="mt-1 text-[9.5px] leading-snug text-slate-600">
                Datos y alertas guardados en el navegador. Preparado para API futura.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Navegación móvil: no ocupa el topbar */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-space-800/90 bg-space-950/95 backdrop-blur-xl lg:hidden"
        aria-label="Navegación principal móvil"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-2 py-1.5">
          {PRIMARY_MODULES.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => handleSelect(module.id)}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 transition-colors ${
                  isActive ? 'bg-cyan-400/[0.08] text-cyan-200' : 'text-slate-500 hover:text-slate-300'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="mono text-[8.5px] font-semibold leading-none">{module.name}</span>
                {module.id === 'dashboard' && alertCount > 0 ? (
                  <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-400 px-1 font-mono text-[8px] font-bold text-space-950">
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
