import React, { useState } from 'react';
import { 
  Database, 
  FileCode2, 
  BookOpen, 
  Terminal, 
  Copy, 
  Check, 
  Download, 
  Heart,
  Activity,
  Thermometer,
  Wind
} from 'lucide-react';

export default function DataIntegration({
  currentJsonPacket = {},
  logs = [],
  selectedAstronautId = "ast_001",
  astronauts = {}
}) {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('json');
  const [logFilter, setLogFilter] = useState('ALL');

  const jsonString = JSON.stringify(currentJsonPacket, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nsa_telemetry_${currentJsonPacket?.astronaut?.id || 'packet'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dictionary = [
    {
      variable: "Frecuencia Cardíaca",
      symbol: "HR",
      unit: "bpm",
      normal: "60 - 100",
      alert: "> 120 o < 50",
      description: "Frecuencia de contracción ventricular monitorizada en derivación continua Lead II.",
      icon: <Heart className="w-3.5 h-3.5 text-red-400" />
    },
    {
      variable: "Saturación de Oxígeno",
      symbol: "SpO2",
      unit: "%",
      normal: "95 - 100",
      alert: "< 90",
      description: "Porcentaje de oxihemoglobina capilar arterial. Crítico en salidas extravehiculares (EVA).",
      icon: <Activity className="w-3.5 h-3.5 text-telemetry-cyan" />
    },
    {
      variable: "Temperatura Corporal",
      symbol: "TEMP",
      unit: "°C",
      normal: "36.1 - 37.2",
      alert: "> 38.0",
      description: "Temperatura del núcleo corporal medida por sensor continuo del traje espacial.",
      icon: <Thermometer className="w-3.5 h-3.5 text-telemetry-amber" />
    },
    {
      variable: "Frecuencia Respiratoria",
      symbol: "RR",
      unit: "rpm",
      normal: "12 - 20",
      alert: "> 24",
      description: "Ciclos de inhalación/exhalación por minuto. Aumenta ante acumulación de CO2 o estrés.",
      icon: <Wind className="w-3.5 h-3.5 text-telemetry-blue" />
    }
  ];

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'ALL') return true;
    return l.level === logFilter;
  });

  return (
    <div className="space-y-3.5">
      
      {/* Header del Módulo */}
      <div className="hud-panel p-3 rounded-lg border border-space-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono uppercase px-2 py-0.2 rounded bg-space-850 text-telemetry-cyan border border-space-700 font-bold tracking-widest">
              MOD-05 // INTEGRACIÓN, CONTRATO & GLOSARIO
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-slate-400">
              DATA ARCHITECTURE INTERFACE
            </span>
          </div>
          <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide">
            CONTRATO JSON Y DICCIONARIO DE DATOS
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-space-850 text-telemetry-cyan border border-space-700 text-xs font-mono font-bold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" /> ARCHITECTURE.MD COMPLIANT
          </span>
        </div>
      </div>

      {/* Selector de Sub-Pestañas */}
      <div className="flex items-center gap-2 border-b border-space-700/60 pb-2 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('json')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
            activeSubTab === 'json'
              ? "bg-space-800 text-telemetry-cyan border-telemetry-cyan font-bold shadow-hud"
              : "bg-space-850 border-space-700 text-slate-400 hover:text-white"
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>CONTRATO JSON (ARCHITECTURE.MD)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dictionary')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
            activeSubTab === 'dictionary'
              ? "bg-space-800 text-telemetry-cyan border-telemetry-cyan font-bold shadow-hud"
              : "bg-space-850 border-space-700 text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>DICCIONARIO MÉDICO (DATA_DICTIONARY.MD)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
            activeSubTab === 'logs'
              ? "bg-space-800 text-telemetry-cyan border-telemetry-cyan font-bold shadow-hud"
              : "bg-space-850 border-space-700 text-slate-400 hover:text-white"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>REGISTROS COMPLETOS ({logs.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: Contrato JSON */}
      {activeSubTab === 'json' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded bg-space-950 border border-space-700 font-mono text-xs text-slate-300">
            <div>
              <span className="font-bold text-white block">PAQUETE DE TELEMETRÍA SINTÉTICA TRANSMITIDO EN VIVO</span>
              <span className="text-slate-400 text-[10px]">
                Validado contra el esquema oficial definido en <code className="text-telemetry-cyan">docs/ARCHITECTURE.md</code>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-space-850 hover:bg-space-800 border border-space-700 text-xs text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-telemetry-green" /> : <Copy className="w-3.5 h-3.5 text-telemetry-cyan" />}
                <span>{copied ? "Copiado!" : "Copiar JSON"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-telemetry-cyan hover:bg-cyan-400 text-space-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .json</span>
              </button>
            </div>
          </div>

          <div className="rounded border border-space-700 bg-[#060913] p-3 overflow-hidden">
            <pre className="h-80 overflow-y-auto p-3 rounded bg-black/70 border border-space-700/80 font-mono text-xs text-telemetry-cyan leading-relaxed selection:bg-cyan-500 selection:text-black">
              {jsonString}
            </pre>
          </div>
        </section>
      )}

      {/* SUBTAB 2: Diccionario Médico */}
      {activeSubTab === 'dictionary' && (
        <section className="hud-panel p-3.5 rounded-lg border border-space-700/80 space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-space-700 text-slate-400 text-[10px]">
                  <th className="pb-2 pl-2">VARIABLE</th>
                  <th className="pb-2">UNIDAD</th>
                  <th className="pb-2">RANGO NOMINAL</th>
                  <th className="pb-2">UMBRAL ALERTA</th>
                  <th className="pb-2 pr-2">DESCRIPCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-700/60">
                {dictionary.map((item, i) => (
                  <tr key={i} className="hover:bg-space-900/60 transition-colors">
                    <td className="py-2.5 pl-2 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.variable}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-telemetry-cyan font-bold">{item.unit}</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-telemetry-green border border-emerald-500/30">
                        {item.normal}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-red-950/60 text-telemetry-crimson border border-red-500/40 font-bold">
                        {item.alert}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-[10px] text-slate-400 max-w-sm leading-tight">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SUBTAB 3: Registros Completos */}
      {activeSubTab === 'logs' && (
        <section className="hud-panel p-3.5 rounded-lg border border-space-700/80 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-space-700/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">FILTRAR SEVERIDAD:</span>
            <div className="flex items-center gap-1 font-mono text-xs">
              {['ALL', 'CRITICAL', 'WARNING', 'SUCCESS', 'INFO'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                    logFilter === lvl
                      ? "bg-space-800 text-telemetry-cyan border-telemetry-cyan font-bold"
                      : "text-slate-400 hover:text-white border-transparent"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 overflow-y-auto font-mono text-xs space-y-1 pr-1 bg-[#060913] p-3 rounded border border-space-700">
            {filteredLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 py-0.5 hover:bg-space-850/40 px-1 rounded transition-colors">
                <span className="text-slate-400 text-[10px] whitespace-nowrap pt-0.2">{log.time}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold border ${
                  log.level === "CRITICAL" ? "bg-red-950 text-telemetry-crimson border-red-500/40" :
                  log.level === "WARNING" ? "bg-amber-950 text-telemetry-amber border-amber-500/40" :
                  log.level === "SUCCESS" ? "bg-emerald-950 text-telemetry-green border-emerald-500/30" :
                  "bg-cyan-950 text-telemetry-cyan border-cyan-500/30"
                }`}>
                  [{log.level.substring(0, 4)}]
                </span>
                <span className="text-slate-300 text-[11px] leading-tight">{log.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
