import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function MissionLogs({ logs = [] }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogTag = (level) => {
    switch (level) {
      case "CRITICAL":
        return (
          <span className="font-mono text-[9px] text-telemetry-crimson bg-red-950/80 px-1 py-0.2 rounded border border-red-500/40 font-bold shrink-0">
            [CRIT]
          </span>
        );
      case "WARNING":
        return (
          <span className="font-mono text-[9px] text-telemetry-amber bg-amber-950/80 px-1 py-0.2 rounded border border-amber-500/40 font-bold shrink-0">
            [WARN]
          </span>
        );
      case "SUCCESS":
        return (
          <span className="font-mono text-[9px] text-telemetry-green bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-500/30 font-semibold shrink-0">
            [NORM]
          </span>
        );
      default:
        return (
          <span className="font-mono text-[9px] text-telemetry-cyan bg-cyan-950/40 px-1 py-0.2 rounded border border-cyan-500/30 shrink-0">
            [INFO]
          </span>
        );
    }
  };

  return (
    <div className="hud-panel p-3.5 rounded-lg border border-space-700/80 space-y-2">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-space-700/60 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-telemetry-cyan" />
          <h3 className="font-heading font-semibold text-xs tracking-wider text-slate-100 uppercase">
            TERMINAL // LOG DE EVENTOS DE TELEMETRÍA
          </h3>
        </div>
        <span className="text-[9px] text-slate-400">STREAM: ACTIVE</span>
      </div>

      {/* Terminal View */}
      <div 
        ref={scrollRef}
        className="h-44 overflow-y-auto font-mono text-xs space-y-1 pr-1 bg-[#060A14] p-2.5 rounded border border-space-700"
      >
        {logs.length === 0 ? (
          <div className="text-slate-400 text-center py-6 text-xs">INICIANDO ENLACE DE DATOS...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start gap-1.5 py-0.5 hover:bg-space-850/40 px-1 rounded transition-colors">
              <span className="text-slate-400 text-[10px] whitespace-nowrap pt-0.2">{log.time}</span>
              {getLogTag(log.level)}
              <span className={`text-[11px] leading-tight ${
                log.level === "CRITICAL" ? "text-red-300 font-bold" :
                log.level === "WARNING" ? "text-amber-200" :
                log.level === "SUCCESS" ? "text-emerald-300" :
                "text-slate-300"
              }`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
