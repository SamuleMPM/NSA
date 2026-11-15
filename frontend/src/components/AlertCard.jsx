import React from 'react';
import {
  Info,
  AlertTriangle,
  ShieldAlert,
  Siren,
  HeartPulse,
  Activity,
  Radio,
  Check,
  CheckCheck,
  Wrench,
  ArrowUpRight,
  ClipboardList,
  ChevronDown,
} from 'lucide-react';
import StatusPill from './ui/StatusPill';
import DataOriginBadge from './ui/DataOriginBadge';
import { SEVERITY_LEVELS } from '../lib/clinical';
import { ALERT_STATUS } from '../lib/alerts';
import { formatDateTime, relativeTime } from '../lib/format';

const SEVERITY_ICONS = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
  emergency: Siren,
};

const STATUS_TONES = {
  active: 'critical',
  acknowledged: 'warning',
  resolved: 'nominal',
};

const KIND_META = {
  vital: { label: 'Signo vital', icon: HeartPulse },
  risk: { label: 'Riesgo RIDGE', icon: ShieldAlert },
  ecg: { label: 'Electrocardiograma', icon: Activity },
};

export default function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
  onCountermeasure,
  onOpenRisks,
  compact = false,
}) {
  const severity = SEVERITY_LEVELS[alert.severity] || SEVERITY_LEVELS.info;
  const SeverityIcon = SEVERITY_ICONS[alert.severity] || Info;
  const status = ALERT_STATUS[alert.status] || ALERT_STATUS.active;
  const kind = KIND_META[alert.kind] || KIND_META.vital;
  const KindIcon = kind.icon;
  const isOpen = alert.status === 'active' || alert.status === 'acknowledged';
  const canCountermeasure = isOpen && alert.kind === 'vital' && typeof onCountermeasure === 'function';

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2.5 rounded-md border px-2.5 py-2 ${
          alert.status === 'resolved'
            ? 'border-[#C9D9F5] bg-[#F8FAFD] opacity-75'
            : alert.severity === 'emergency'
              ? 'border-[#FDA4AF] bg-[#FFF5F6]'
              : alert.severity === 'critical'
                ? 'border-[#FDE68A] bg-[#FEF3C7]/40'
                : alert.severity === 'warning'
                  ? 'border-[#BAE6FD] bg-[#E0F2FE]/40'
                  : 'border-[#C9D9F5] bg-white'
        }`}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded border"
          style={{
            color: severity.color,
            borderColor: `${severity.color}44`,
            background: `${severity.color}15`,
          }}
        >
          <SeverityIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-heading text-[11px] font-bold text-[#0B1B3A]">{alert.title}</span>
          <span className="mono mt-0.5 block text-[8.5px] text-[#000000]">
            {alert.parameter} · {alert.value}
            {alert.unit ? ` ${alert.unit}` : ''} · {relativeTime(alert.lastSeenAt || alert.detectedAt)}
          </span>
        </div>
        <StatusPill status={severity.tone} dot={false} className="shrink-0">
          {severity.label}
        </StatusPill>
      </div>
    );
  }

  return (
    <article
      className={`panel overflow-hidden ${
        alert.severity === 'emergency'
          ? 'panel-critical border-[#E11D48]/50'
          : alert.severity === 'critical'
            ? 'border-[#FDE68A] bg-[#FEF3C7]/20'
            : alert.severity === 'warning'
              ? 'panel-warning'
              : ''
      }`}
      aria-label={alert.title}
    >
      <div className="flex flex-col gap-2.5 border-b border-[#C9D9F5] px-3.5 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border"
            style={{
              color: severity.color,
              borderColor: `${severity.color}4d`,
              background: `${severity.color}18`,
            }}
          >
            <SeverityIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusPill status={severity.tone} dot={false}>
                {severity.label}
              </StatusPill>
              <span className="pill">
                <KindIcon className="h-3 w-3" aria-hidden="true" />
                {kind.label}
              </span>
              <DataOriginBadge origin={alert.origin} />
            </div>
            <h3 className="mt-1.5 font-heading text-[13px] font-bold leading-snug text-[#0B1B3A]">
              {alert.title}
            </h3>
            <p className="mono mt-0.5 text-[9px] text-[#000000]">
              {alert.astronautName ? `${alert.astronautName} · ` : ''}
              {formatDateTime(alert.detectedAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <StatusPill status={STATUS_TONES[alert.status] || 'neutral'} dot={false}>
            {status.label}
          </StatusPill>
          {alert.recurrenceCount > 0 ? (
            <span className="pill pill-violet" title="Número de reapariciones de la misma condición">
              <Radio className="h-3 w-3" aria-hidden="true" />
              x{alert.recurrenceCount}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 px-3.5 py-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="panel-inset px-2.5 py-2">
            <span className="eyebrow block">PARÁMETRO</span>
            <span className="mt-0.5 block font-heading text-[11.5px] font-bold text-[#0B1B3A]">
              {alert.parameter}
            </span>
          </div>
          <div className="panel-inset px-2.5 py-2">
            <span className="eyebrow block">VALOR OBSERVADO</span>
            <span className="mt-0.5 flex items-baseline gap-1">
              <span className="value-sm" style={{ color: severity.color }}>
                {alert.value}
              </span>
              <span className="mono text-[8.5px] text-[#000000]">{alert.unit}</span>
            </span>
          </div>
          <div className="panel-inset px-2.5 py-2">
            <span className="eyebrow block">RANGO DE REFERENCIA</span>
            <span className="mt-0.5 block text-[10.5px] leading-snug text-[#000000]">
              {alert.referenceRange || '--'}
            </span>
          </div>
        </div>

        <div>
          <span className="eyebrow block">EXPLICACIÓN CLÍNICA</span>
          <p className="mt-1 text-[11px] leading-relaxed text-[#0B1B3A]">{alert.explanation}</p>
        </div>

        {alert.meta?.rangeDetail ? (
          <p className="mono text-[8.5px] leading-relaxed text-[#000000]">{alert.meta.rangeDetail}</p>
        ) : null}

        {alert.meta?.indicators?.length ? (
          <div>
            <span className="eyebrow block">INDICADORES DEL MODELO</span>
            <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {alert.meta.indicators.map((indicator) => (
                <div
                  key={indicator.key}
                  className="flex items-center justify-between gap-2 rounded border border-[#C9D9F5] bg-[#F8FAFD] px-2 py-1"
                >
                  <span className="truncate text-[10px] text-[#000000]">{indicator.label}</span>
                  <span className="mono shrink-0 text-[9px] font-semibold text-[#0B1B3A]">
                    {indicator.value} <span className="text-[#000000]">{indicator.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {alert.recommendations?.length ? (
          <details className="group rounded-md border border-[#C9D9F5] bg-[#F8FAFD]">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-2.5 py-2">
              <span className="mono flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#0B3D91]">
                <ClipboardList className="h-3 w-3 text-[#0B3D91]" aria-hidden="true" />
                Recomendaciones ({alert.recommendations.length})
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[#000000] transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ol className="space-y-2 border-t border-[#C9D9F5] px-3 py-2.5">
              {alert.recommendations.map((recommendation, index) => (
                <li key={`${recommendation.title}-${index}`} className="flex gap-2">
                  <span className="mono mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[#C9D9F5] bg-white text-[8px] font-bold text-[#0B3D91]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold leading-snug text-[#0B1B3A]">{recommendation.title}</p>
                    {recommendation.detail ? (
                      <p className="mt-0.5 text-[10px] leading-relaxed text-[#000000]">{recommendation.detail}</p>
                    ) : null}
                    {recommendation.basis ? (
                      <p className="mono mt-0.5 text-[8px] leading-snug text-[#000000]">{recommendation.basis}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </details>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#C9D9F5] pt-2.5">
          <span className="mono text-[8.5px] text-[#000000]">
            Detectada {relativeTime(alert.firstDetectedAt || alert.detectedAt)}
            {alert.acknowledgedAt ? ` · atendida ${relativeTime(alert.acknowledgedAt)}` : ''}
            {alert.resolvedAt ? ` · resuelta ${relativeTime(alert.resolvedAt)}` : ''}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {onOpenRisks && alert.kind === 'risk' ? (
              <button type="button" onClick={onOpenRisks} className="btn">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                Ver riesgos
              </button>
            ) : null}

            {onAcknowledge && alert.status === 'active' ? (
              <button type="button" onClick={() => onAcknowledge(alert.id)} className="btn">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Atender
              </button>
            ) : null}

            {canCountermeasure ? (
              <button
                type="button"
                onClick={() => onCountermeasure(alert)}
                className="btn btn-success"
                title="Aplicar una normalización simulada y registrar la contramedida"
              >
                <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                Aplicar contramedida
              </button>
            ) : null}

            {onResolve && alert.status !== 'resolved' ? (
              <button type="button" onClick={() => onResolve(alert.id)} className="btn btn-ghost">
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Resolver
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
