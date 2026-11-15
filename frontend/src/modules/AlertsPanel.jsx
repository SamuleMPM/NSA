import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Siren,
  AlertTriangle,
  CheckCheck,
  BellRing,
  Filter,
  Radio,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import AlertCard from '../components/AlertCard';
import StatusPill from '../components/ui/StatusPill';
import { SEVERITY_LEVELS } from '../lib/clinical';
import { formatInteger } from '../lib/format';

const STATUS_FILTERS = [
  { id: 'open', label: 'Abiertas' },
  { id: 'active', label: 'Activas' },
  { id: 'resolved', label: 'Historial' },
  { id: 'all', label: 'Todas' },
];

const SEVERITY_FILTERS = [
  { id: 'all', label: 'Todas las severidades' },
  { id: 'emergency', label: 'Emergencia' },
  { id: 'critical', label: 'Crítica' },
  { id: 'warning', label: 'Advertencia' },
  { id: 'info', label: 'Informativa' },
];

function SummaryTile({ icon: Icon, label, value, tone, hint }) {
  return (
    <div className="bento-card p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{label}</span>
        <span
          className="flex h-6 w-6 items-center justify-center rounded border"
          style={{ color: tone, borderColor: `${tone}44`, background: `${tone}12` }}
        >
          <Icon className="h-3 w-3" aria-hidden="true" />
        </span>
      </div>
      <span className="mt-1.5 block value-md" style={{ color: tone }}>{value}</span>
      {hint ? <span className="mono mt-0.5 block text-[8.5px] text-slate-500">{hint}</span> : null}
    </div>
  );
}

export default function AlertsPanel({
  alerts = [],
  alertSummary,
  onAcknowledge,
  onResolve,
  onCountermeasure,
  onOpenRisks,
}) {
  const [statusFilter, setStatusFilter] = useState('open');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = useMemo(() => {
    return alerts
      .filter((alert) => {
        if (statusFilter === 'active') return alert.status === 'active';
        if (statusFilter === 'open') return alert.status === 'active' || alert.status === 'acknowledged';
        if (statusFilter === 'resolved') return alert.status === 'resolved';
        return true;
      })
      .filter((alert) => severityFilter === 'all' || alert.severity === severityFilter)
      .sort((a, b) => {
        const severityDiff = (SEVERITY_LEVELS[b.severity]?.order ?? 0) - (SEVERITY_LEVELS[a.severity]?.order ?? 0);
        if (severityDiff !== 0) return severityDiff;
        return new Date(b.lastSeenAt || b.detectedAt || 0) - new Date(a.lastSeenAt || a.detectedAt || 0);
      });
  }, [alerts, statusFilter, severityFilter]);

  const summary = alertSummary || {};

  return (
    <div className="space-y-3.5">
      <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4" aria-label="Resumen de alertas">
        <SummaryTile
          icon={Siren}
          label="Emergencias activas"
          value={formatInteger(summary.activeEmergency || 0)}
          tone="#F43F5E"
          hint="Umbral configurable de simulación"
        />
        <SummaryTile
          icon={ShieldAlert}
          label="Críticas activas"
          value={formatInteger(summary.activeCritical || 0)}
          tone="#FB7185"
          hint="Rangos documentados"
        />
        <SummaryTile
          icon={BellRing}
          label="Atendidas"
          value={formatInteger(summary.acknowledged || 0)}
          tone="#FBBF24"
          hint="Pendientes de resolución"
        />
        <SummaryTile
          icon={CheckCheck}
          label="Resueltas hoy"
          value={formatInteger(summary.resolvedToday || 0)}
          tone="#34D399"
          hint={`${formatInteger(summary.total || 0)} en el historial`}
        />
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-2.5 border-b border-space-700/70 px-3.5 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-400/25 bg-rose-400/[0.07] text-rose-300">
              <Radio className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow block">DETECCIÓN AUTOMÁTICA EN VIVO</span>
              <h3 className="font-heading text-[13px] font-bold text-slate-100">
                Alertas clínicas, RIDGE y electrocardiográficas
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="segmented" role="tablist" aria-label="Filtro por estado">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`segmented-item ${statusFilter === filter.id ? 'segmented-item-active' : ''}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                className="select !min-h-[32px] !w-auto !py-1 !text-[10px]"
                aria-label="Filtrar por severidad"
              >
                {SEVERITY_FILTERS.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-start gap-2 border-b border-space-700/60 bg-space-900/25 px-3.5 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
          <p className="text-[10px] leading-relaxed text-slate-500">
            Las alertas se recalculan con cada muestra de telemetría y con cada registro manual. Las bandas nominales,
            de advertencia y críticas provienen de <span className="text-slate-300">docs/DATA_DICTIONARY.md</span>;
            los umbrales de emergencia son configurables y no límites oficiales de la NASA.
          </p>
        </div>

        <div className="space-y-2.5 p-3">
          {filtered.length ? (
            filtered.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
                onResolve={onResolve}
                onCountermeasure={onCountermeasure}
                onOpenRisks={onOpenRisks}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-space-700/70 bg-space-900/30 px-4 py-12 text-center">
              <ShieldCheck className="h-8 w-8 text-emerald-300/80" aria-hidden="true" />
              <p className="mt-2 font-heading text-[13px] font-bold text-slate-300">No hay alertas con este filtro</p>
              <p className="mt-1 max-w-sm text-[10.5px] leading-relaxed text-slate-500">
                Cambia el filtro de estado o de severidad. Si la telemetría es nominal, las alertas previas permanecen en el historial como resueltas.
              </p>
              {statusFilter !== 'all' ? (
                <button type="button" onClick={() => setStatusFilter('all')} className="btn mt-3">
                  <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                  Ver todo el historial
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-space-700/60 bg-space-900/30 px-3 py-2">
        <StatusPill status="info" dot={false}>
          <Radio className="h-3 w-3" aria-hidden="true" />
          {formatInteger(summary.byKind?.vital || 0)} vital · {formatInteger(summary.byKind?.risk || 0)} RIDGE · {formatInteger(summary.byKind?.ecg || 0)} ECG
        </StatusPill>
        <span className="mono text-[8.5px] text-slate-600">
          Las recomendaciones son criterios generales de apoyo, no diagnóstico médico.
        </span>
      </div>
    </div>
  );
}
