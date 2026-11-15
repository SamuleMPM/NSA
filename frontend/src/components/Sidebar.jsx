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
        className={`sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-[#C9D9F5]/30 bg-gradient-to-b from-[#061D47] to-[#0B3D91] text-[#DBEAFE] shadow-co-md transition-[width] duration-200 ease-out lg:flex ${
          collapsed ? 'w-[76px]' : 'w-[264px]'
        }`}
        aria-label="Navegación principal"
      >
        <div className={`flex h-[60px] items-center border-b border-white/15 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/25 bg-white/15 text-white">
              <Orbit className="h-4 w-4" aria-hidden="true" />
            </span>
            {!collapsed ? (
              <div className="min-w-0 leading-tight">
                <span className="mono block text-[8px] uppercase tracking-[0.16em] text-[#DBEAFE]/75">Consola</span>
                <span className="block truncate font-heading text-[11.5px] font-bold text-white">Navegación</span>
              </div>
            ) : null}
          </div>
          {!collapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="btn btn-ghost btn-icon !h-8 !w-8 !min-w-0 text-[#DBEAFE] hover:bg-white/10 hover:text-white"
              aria-label="Contraer barra lateral"
              title="Contraer barra lateral"
              aria-expanded={!collapsed}
            >
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4" aria-label="Módulos principales">
          {!collapsed ? <span className="eyebrow mb-2 block px-2 text-[#DBEAFE]/80">Módulos / 03</span> : null}
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
                  className={`group relative flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-[#0B3D91] shadow-co-sm'
                      : 'text-[#DBEAFE] hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'justify-center !px-0' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? `${module.name} · ${module.desc}` : undefined}
                >
                  <span
                    className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
                      isActive
                        ? 'bg-transparent text-[#0B3D91]'
                        : 'border border-white/20 bg-white/10 text-[#DBEAFE] group-hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {isDashboard ? (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F97316] px-1 font-mono text-[8px] font-bold text-white shadow-none">
                        {alertCount > 9 ? '9+' : alertCount}
                      </span>
                    ) : null}
                  </span>

                  {!collapsed ? (
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className={`truncate font-heading text-[12.5px] font-bold tracking-tight ${isActive ? 'text-[#0B3D91]' : 'text-white'}`}>
                          {module.name}
                        </span>
                        <span className={`mono text-[8.5px] ${isActive ? 'text-[#0B3D91]/70' : 'text-[#DBEAFE]/70'}`}>
                          {module.index}
                        </span>
                      </span>
                      <span className={`mt-0.5 block truncate text-[10px] leading-tight ${isActive ? 'text-[#0B3D91]/85' : 'text-[#DBEAFE]/80'}`}>
                        {module.desc}
                      </span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </nav>

        <div className={`safe-bottom border-t border-white/15 px-2 py-3 ${collapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          {collapsed ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="btn btn-ghost btn-icon !h-9 !w-9 !min-w-0 text-[#DBEAFE] hover:bg-white/10 hover:text-white"
              aria-label="Expandir barra lateral"
              title="Expandir barra lateral"
              aria-expanded={!collapsed}
            >
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <div className="rounded-md border border-white/20 bg-white/10 px-2.5 py-2 text-[#DBEAFE]">
              <div className="flex items-center justify-between gap-2">
                <span className="mono flex items-center gap-1.5 text-[8.5px] uppercase tracking-wider text-white">
                  <ShieldCheck className="h-3 w-3 text-emerald-300" aria-hidden="true" />
                  Persistencia local
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
              </div>
              <p className="mt-1 text-[9.5px] leading-snug text-[#DBEAFE]/85">
                Datos y alertas guardados en el navegador. Preparado para API futura.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Navegación móvil: no ocupa el topbar */}
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-[#C9D9F5]/30 bg-gradient-to-r from-[#061D47] to-[#0B3D91] text-[#DBEAFE] shadow-co-md lg:hidden"
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
                  isActive ? 'bg-white text-[#0B3D91] font-bold shadow-co-sm' : 'text-[#DBEAFE] hover:text-white hover:bg-white/10'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="mono text-[8.5px] font-semibold leading-none">{module.name}</span>
                {module.id === 'dashboard' && alertCount > 0 ? (
                  <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F97316] px-1 font-mono text-[8px] font-bold text-white">
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
