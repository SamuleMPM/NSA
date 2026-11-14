import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Sliders, 
  ShieldAlert, 
  Database, 
  User, 
  Volume2, 
  VolumeX, 
  X,
  Radio
} from 'lucide-react';

export default function Sidebar({
  activeModule,
  setActiveModule,
  astronauts = {},
  selectedAstronautId,
  setSelectedAstronautId,
  totalAlertsCount = 0,
  soundEnabled = false,
  setSoundEnabled,
  missionId = "mars_001",
  mobileMenuOpen = false,
  setMobileMenuOpen
}) {
  const modules = [
    {
      id: 'general',
      index: '01',
      name: 'Panel General',
      desc: 'Salud global y soporte vital ECLSS',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null
    },
    {
      id: 'telemetry',
      index: '02',
      name: 'Telemetría y ECG',
      desc: 'Signos vitales y osciloscopio Lead II',
      icon: <Activity className="w-4 h-4" />,
      badge: null
    },
    {
      id: 'simulator',
      index: '03',
      name: 'Simulador de Misión',
      desc: 'Inyección de escenarios fisiológicos',
      icon: <Sliders className="w-4 h-4" />,
      badge: 'ENGINE'
    },
    {
      id: 'alerts',
      index: '04',
      name: 'Alertas y Soluciones',
      desc: 'Diagnóstico y contramedidas médicas',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: totalAlertsCount > 0 ? `${totalAlertsCount} [CRIT]` : '[NOMINAL]',
      badgeColor: totalAlertsCount > 0 
        ? 'bg-red-950/80 text-telemetry-crimson border-red-500/60 font-bold animate-pulse' 
        : 'bg-emerald-950/40 text-telemetry-green border-emerald-500/30'
    },
    {
      id: 'integration',
      index: '05',
      name: 'Integración y Datos',
      desc: 'Contrato JSON y terminal de auditoría',
      icon: <Database className="w-4 h-4" />,
      badge: null
    }
  ];

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
      {/* Backdrop móvil */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Contenedor del Sidebar (Drawer en móvil, Columna fija en desktop) */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-auto
        w-64 bg-space-950 border-r border-space-700 flex flex-col shrink-0 min-h-screen select-none
        transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        {/* Console Header */}
        <div className="p-3 border-b border-space-700 bg-space-900/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-telemetry-cyan shadow-[0_0_8px_#00E5FF]"></div>
            <span className="font-heading font-extrabold text-xs tracking-widest text-slate-100 uppercase">
              MCC-H // CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-telemetry-green font-semibold">[LIVE]</span>
            {setMobileMenuOpen && (
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navegación por Módulos */}
        <div className="flex-1 px-2.5 py-2.5 space-y-1 overflow-y-auto">
          <div className="px-2 pb-1 flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
            <span>SISTEMAS OPERACIONALES</span>
            <span>MOD</span>
          </div>

          {modules.map((mod) => {
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleSelectModule(mod.id)}
                className={`w-full text-left p-2.5 rounded border transition-all duration-150 relative cursor-pointer group ${
                  isActive
                    ? "bg-space-850 border-telemetry-cyan/60 text-slate-100 shadow-hud"
                    : "bg-transparent border-transparent text-slate-300 hover:bg-space-900 hover:border-space-700 hover:text-white"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-telemetry-cyan shadow-[0_0_6px_#00E5FF]" />
                )}

                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <div className={`${
                      isActive ? "text-telemetry-cyan" : "text-slate-400 group-hover:text-slate-200"
                    }`}>
                      {mod.icon}
                    </div>
                    <span className="font-heading text-xs font-semibold tracking-wide">
                      {mod.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {mod.badge && (
                      <span className={`text-[8px] font-mono px-1 py-0.2 rounded border ${
                        mod.badgeColor || "bg-space-800 text-slate-400 border-space-700"
                      }`}>
                        {mod.badge}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-slate-400">
                      {mod.index}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] font-mono text-slate-400 pl-6 leading-tight truncate">
                  {mod.desc}
                </p>
              </button>
            );
          })}

          {/* Separador de Tripulación */}
          <div className="pt-2.5 pb-1 px-2">
            <div className="border-t border-space-700 mb-2" />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
              <span>TRIPULACIÓN ACTIVA</span>
              <span>ESTADO</span>
            </div>
          </div>

          {/* Selector de Astronautas */}
          <div className="space-y-1">
            {Object.entries(astronauts).map(([id, ast]) => {
              const isSelected = id === selectedAstronautId;
              return (
                <button
                  key={id}
                  onClick={() => handleSelectAstronaut(id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border text-xs font-mono transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-space-850 text-telemetry-cyan border-space-600 font-bold"
                      : "text-slate-300 hover:text-white hover:bg-space-900 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-400 font-bold">{ast.role.split(' ')[0]}</span>
                    <span>{ast.name}</span>
                  </div>
                  <span className={`text-[9px] px-1 py-0.2 rounded border ${
                    ast.activity === "EVA" 
                      ? "bg-amber-950/60 text-telemetry-amber border-amber-500/50" 
                      : "bg-space-800 text-slate-400 border-space-700"
                  }`}>
                    {ast.activity}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-2.5 border-t border-space-700 bg-space-900/80 font-mono text-xs space-y-1.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded border text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? "bg-telemetry-cyan/10 border-telemetry-cyan/40 text-telemetry-cyan"
                : "bg-space-850 border-space-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-telemetry-cyan" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="text-[11px]">{soundEnabled ? "ALARMA SONORA ON" : "SILENCIADO"}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">{soundEnabled ? "ACT" : "MUT"}</span>
          </button>

          <div className="px-2 py-0.5 text-[9px] text-slate-400 flex items-center justify-between">
            <span>LINK ORBITAL:</span>
            <span className="text-telemetry-green font-semibold">100% NOMINAL</span>
          </div>
        </div>

      </aside>
    </>
  );
}
