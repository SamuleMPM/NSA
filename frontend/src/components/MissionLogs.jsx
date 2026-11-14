import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, AlertTriangle, Info, CheckCircle2, ArrowDownToLine } from 'lucide-react';

const LEVELS = {
  CRITICAL: {
    tag: 'CRIT',
    icon: ShieldAlert,
    pill: 'border-rose-400/30 bg-rose-400/10 text-rose-300',
    text: 'text-rose-200',
  },
  WARNING: {
    tag: 'WARN',
    icon: AlertTriangle,
    pill: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
    text: 'text-amber-100',
  },
  SUCCESS: {
    tag: 'NORM',
    icon: CheckCircle2,
    pill: 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300',
    text: 'text-emerald-100',
  },
  INFO: {
    tag: 'INFO',
    icon: Info,
    pill: 'border-cyan-400/25 bg-cyan-400/[0.07] text-cyan-300',
    text: 'text-slate-300',
  },
};

export default function MissionLogs({ logs = [] }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const counts = logs.reduce(
    (acc, log) => {
      if (log.level === 'CRITICAL') acc.critical += 1;
      else if (log.level === 'WARNING') acc.warning += 1;
      else acc.info += 1;
      return acc;
    },
    { critical: 0, warning: 0, info: 0 }
  );

  return (
    <section className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-space-700/70 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow block">AUDIT STREAM / EVENT LOG</span>
            <h3 className="font-heading text-[13px] font-bold text-slate-100">Terminal de misión</h3>
          </div>
        </div>

        <span className="pill pill-green">
          <span className="pill-dot" />
          STREAMING
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div
          ref={scrollRef}
          className="h-[300px] flex-1 overflow-y-auto rounded-md border border-space-700/80 bg-[#040A12] p-2.5 font-mono text-[10.5px] leading-relaxed sm:h-[340px]"
          aria-live="polite"
          aria-label="Registro cronológico de eventos"
        >
          {logs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <ArrowDownToLine className="h-5 w-5 text-slate-600" aria-hidden="true" />
              <span className="mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
                Iniciando enlace de datos…
              </span>
            </div>
          ) : (
            logs.map((log, index) => {
              const config = LEVELS[log.level] || LEVELS.INFO;
              const Icon = config.icon;
              return (
                <div
                  key={`${log.time}-${index}`}
                  className="group flex items-start gap-2 rounded px-1 py-1 transition-colors hover:bg-white/[0.025]"
                >
                  <span className="w-5 shrink-0 select-none pt-0.5 text-right text-[8.5px] text-slate-700">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="shrink-0 pt-0.5 text-[8.5px] text-slate-600">{log.time}</span>
                  <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded border px-1 py-0.5 text-[7.5px] font-bold ${config.pill}`}>
                    <Icon className="h-2.5 w-2.5" aria-hidden="true" />
                    {config.tag}
                  </span>
                  <span className={`min-w-0 flex-1 text-[10px] leading-snug ${config.text}`}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[8.5px] text-slate-600">
          <span className="flex items-center gap-2">
            <span className="text-rose-300">{counts.critical} CRIT</span>
            <span className="h-2 w-px bg-space-700" />
            <span className="text-amber-300">{counts.warning} WARN</span>
            <span className="h-2 w-px bg-space-700" />
            <span className="text-slate-400">{counts.info} INFO</span>
          </span>
          <span>AUTO-SCROLL / BUFFER 50</span>
        </div>
      </div>
    </section>
  );
}
