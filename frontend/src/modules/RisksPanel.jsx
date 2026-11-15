import React, { useState } from 'react';
import {
  Gauge,
  Radiation,
  Users,
  Satellite,
  Orbit,
  ShieldAlert,
  BookOpen,
  ArrowUpRight,
  Database,
  Info,
  ListChecks,
  Activity,
  Clock,
  FlaskConical,
} from 'lucide-react';
import RiskMatrix from '../components/RiskMatrix';
import StatusPill from '../components/ui/StatusPill';
import DataOriginBadge from '../components/ui/DataOriginBadge';
import { RISK_ORDER, RISK_MODEL_NOTE } from '../lib/risks';
import { formatDateTime, formatNumber, relativeTime } from '../lib/format';

const RISK_ICONS = {
  radiation: Radiation,
  isolation: Users,
  distance: Satellite,
  gravity: Orbit,
  environment: ShieldAlert,
};

function IndicatorRow({ indicator }) {
  const color = indicator.score >= 75 ? '#FB7185' : indicator.score >= 50 ? '#FB923C' : indicator.score >= 25 ? '#FBBF24' : '#34D399';
  return (
    <div className="rounded-md border border-space-700/60 bg-space-900/35 p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="block truncate text-[11px] font-semibold text-slate-300">{indicator.label}</span>
          <span className="mono mt-0.5 block text-[8.5px] text-slate-600">{indicator.reference}</span>
        </div>
        <span className="mono shrink-0 text-right text-[10px] font-bold text-slate-200">
          {typeof indicator.value === 'number' ? formatNumber(indicator.value, 2) : indicator.value}
          <span className="ml-1 text-[8px] font-normal text-slate-600">{indicator.unit}</span>
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="rail flex-1">
          <div
            className="rail-fill"
            style={{ width: `${indicator.score}%`, background: `linear-gradient(90deg, ${color}55, ${color})` }}
          />
        </div>
        <span className="mono w-9 text-right text-[8.5px] font-bold" style={{ color }}>{indicator.score}</span>
      </div>
      <span className="mono mt-1 block text-[8px] text-slate-600">Fuente: {indicator.source} · Origen: {indicator.origin}</span>
    </div>
  );
}

export default function RisksPanel({
  assessment,
  riskHistory = [],
  environment,
  onOpenHandbook,
  onOpenAlerts,
  onOpenData,
}) {
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const risks = assessment?.risks || {};
  const fallbackKey = assessment?.overall?.worstKey || RISK_ORDER[0];
  const activeKey = selectedRiskId && risks[selectedRiskId] ? selectedRiskId : fallbackKey;
  const risk = risks[activeKey];
  const Icon = risk ? RISK_ICONS[risk.id] || ShieldAlert : ShieldAlert;

  if (!risk) {
    return (
      <div className="panel p-8 text-center">
        <Gauge className="mx-auto h-7 w-7 text-slate-600" aria-hidden="true" />
        <p className="mt-2 text-[11px] text-slate-500">Calculando el modelo RIDGE…</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <section className="grid grid-cols-1 gap-2.5 sm:grid-cols-3" aria-label="Resumen de riesgos">
        <div className="bento-card p-3.5">
          <span className="eyebrow">RIESGO GLOBAL</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="value-lg" style={{ color: assessment.overall.levelInfo.color }}>
              {assessment.overall.score}
            </span>
            <span className="mono text-[9px] text-slate-600">/100</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="mono text-[9px] text-slate-500">Peor riesgo: {assessment.overall.worstRisk.code}</span>
            <StatusPill status={assessment.overall.levelInfo.tone} dot={false}>
              {assessment.overall.levelInfo.short}
            </StatusPill>
          </div>
        </div>

        <div className="bento-card p-3.5">
          <span className="eyebrow">RIESGOS ELEVADOS</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="value-lg" style={{ color: assessment.overall.activeCount ? '#FBBF24' : '#34D399' }}>
              {assessment.overall.activeCount}
            </span>
            <span className="mono text-[9px] text-slate-600">/ 5</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="mono text-[9px] text-slate-500">{assessment.overall.criticalCount} en nivel crítico</span>
            <button type="button" onClick={onOpenAlerts} className="mono text-[8.5px] font-bold text-cyan-300 hover:text-cyan-200">
              VER ALERTAS
            </button>
          </div>
        </div>

        <div className="bento-card p-3.5">
          <span className="eyebrow">ENTORNO EVALUADO</span>
          <span className="mt-1 block font-heading text-[13px] font-bold text-slate-100">
            {environment?.shortName || '--'}
          </span>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="mono text-[9px] text-slate-500">{environment?.gravityText || '--'}</span>
            <DataOriginBadge origin={assessment.origin} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="panel overflow-hidden xl:col-span-4">
          <div className="border-b border-space-700/70 px-3.5 py-3">
            <span className="eyebrow block">NASA HRP / RIDGE</span>
            <h3 className="font-heading text-[13px] font-bold text-slate-100">Cinco riesgos del vuelo humano</h3>
          </div>
          <div className="p-3">
            <RiskMatrix
              assessment={assessment}
              variant="full"
              selectedRiskId={activeKey}
              onSelectRisk={setSelectedRiskId}
            />
          </div>
        </div>

        <div className="panel overflow-hidden xl:col-span-8">
          <div className="flex flex-col gap-2.5 border-b border-space-700/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                style={{ color: risk.color, borderColor: `${risk.color}44`, background: `${risk.color}12` }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="pill" style={{ color: risk.color, borderColor: `${risk.color}55` }}>{risk.code}</span>
                  <span className="eyebrow">RIESGO {risk.levelInfo.label.toUpperCase()}</span>
                </div>
                <h3 className="mt-0.5 font-heading text-[15px] font-bold text-slate-100">{risk.name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="value-lg" style={{ color: risk.levelInfo.color }}>{risk.score}</span>
                <span className="mono ml-1 text-[8px] text-slate-600">/100</span>
              </div>
              <StatusPill status={risk.levelInfo.tone} dot={false}>{risk.levelInfo.short}</StatusPill>
            </div>
          </div>

          <div className="space-y-3 p-3.5">
            <p className="text-[11.5px] leading-relaxed text-slate-400">{risk.explanation}</p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="panel-inset p-2.5">
                <span className="eyebrow block">FÓRMULA DEL MODELO</span>
                <p className="mt-1 text-[10.5px] leading-relaxed text-slate-400">{risk.formula}</p>
              </div>
              <div className="panel-inset p-2.5">
                <span className="eyebrow block">FUENTE DE DATOS</span>
                <p className="mt-1 text-[10.5px] leading-relaxed text-slate-400">{risk.dataSource}</p>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="eyebrow">INDICADORES MEDIBLES</span>
                <span className="mono text-[8.5px] text-slate-600">{risk.indicators.length} variables</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {risk.indicators.map((indicator) => (
                  <IndicatorRow key={indicator.key} indicator={indicator} />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <ListChecks className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                <span className="eyebrow">CONTRAMEDIDAS</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {risk.countermeasures.map((measure) => (
                  <div key={measure.title} className="rounded-md border border-emerald-400/15 bg-emerald-400/[0.03] p-2.5">
                    <span className="block text-[11px] font-semibold text-emerald-200/90">{measure.title}</span>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">{measure.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-space-700/60 pt-2.5">
              <span className="mono flex items-center gap-1.5 text-[8.5px] text-slate-600">
                <Info className="h-3 w-3 text-amber-300" aria-hidden="true" />
                {RISK_MODEL_NOTE}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={onOpenData} className="btn">
                  <Database className="h-3.5 w-3.5" aria-hidden="true" />
                  Editar indicadores
                </button>
                <button type="button" onClick={onOpenHandbook} className="btn btn-primary">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  Manual HRP
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-space-700/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] text-telemetry-cyan">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div>
              <span className="eyebrow block">HISTORIAL DE RIESGOS</span>
              <h3 className="font-heading text-[13px] font-bold text-slate-100">Evolución del modelo RIDGE</h3>
            </div>
          </div>
          <span className="pill pill-violet">{riskHistory.length} instantáneas</span>
        </div>

        {riskHistory.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-space-700/60">
                  {['Fecha', 'Global', 'Peor riesgo', 'Nivel', 'Origen'].map((header) => (
                    <th key={header} className="mono px-3 py-2 text-[8.5px] font-bold uppercase tracking-wider text-slate-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riskHistory.slice(0, 10).map((snapshot) => (
                  <tr key={snapshot.id} className="border-b border-space-700/40 last:border-0">
                    <td className="px-3 py-2 text-[10px] text-slate-400">{formatDateTime(snapshot.timestamp)}</td>
                    <td className="px-3 py-2">
                      <span className="value-sm" style={{ color: snapshot.levelInfo?.color || '#94A3B8' }}>{snapshot.score}</span>
                    </td>
                    <td className="px-3 py-2 text-[10px] text-slate-400">{snapshot.worstCode || '--'}</td>
                    <td className="px-3 py-2">
                      <StatusPill status={snapshot.levelInfo?.tone || 'neutral'} dot={false}>{snapshot.levelInfo?.short || '--'}</StatusPill>
                    </td>
                    <td className="px-3 py-2"><DataOriginBadge origin={snapshot.origin} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-8 text-center">
            <Activity className="mx-auto h-6 w-6 text-slate-600" aria-hidden="true" />
            <p className="mt-2 text-[10.5px] text-slate-500">El historial se completa a medida que cambian las puntuaciones del modelo.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-space-700/60 px-3.5 py-2">
          <span className="mono flex items-center gap-1.5 text-[8.5px] text-slate-600">
            <FlaskConical className="h-3 w-3 text-violet-300" aria-hidden="true" />
            Scores recalculados con telemetría, registros y escenario activo
          </span>
          <span className="mono text-[8.5px] text-slate-600">
            Última evaluación {relativeTime(assessment.generatedAt)}
          </span>
        </div>
      </section>
    </div>
  );
}
