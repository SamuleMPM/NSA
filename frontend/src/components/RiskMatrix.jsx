import React from 'react';
import { Radiation, Users, Satellite, Orbit, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { RISK_ORDER } from '../lib/risks';

const RISK_ICONS = {
  radiation: Radiation,
  isolation: Users,
  distance: Satellite,
  gravity: Orbit,
  environment: ShieldAlert,
};

function RiskRow({ risk, selected, onSelect, detailed }) {
  const Icon = RISK_ICONS[risk.id] || ShieldAlert;
  const interactive = typeof onSelect === 'function';
  const Tag = interactive ? 'button' : 'div';

  return (
    <Tag
      {...(interactive
        ? {
            type: 'button',
            onClick: () => onSelect(risk.id),
            'aria-pressed': selected,
          }
        : {})}
      className={`group relative w-full overflow-hidden rounded-md border p-2.5 text-left transition-all duration-150 ${
        selected
          ? 'border-cyan-400/45 bg-cyan-400/[0.07]'
          : 'border-space-700/70 bg-space-900/40 hover:border-space-500/70 hover:bg-space-800/50'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border"
          style={{
            color: risk.color,
            borderColor: `${risk.color}44`,
            background: `${risk.color}12`,
          }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-1.5">
              <span className="mono text-[8.5px] font-bold text-slate-600">{risk.code}</span>
              <span className="truncate font-heading text-[11.5px] font-bold text-slate-200">
                {risk.shortName}
              </span>
            </span>
            <span className="flex shrink-0 items-baseline gap-1">
              <span className="value-sm" style={{ color: risk.levelInfo.color }}>
                {risk.score}
              </span>
              <span className="mono text-[8px] text-slate-600">/100</span>
            </span>
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <div className="rail flex-1">
              <div
                className="rail-fill"
                style={{
                  width: `${risk.score}%`,
                  background: `linear-gradient(90deg, ${risk.levelInfo.color}55, ${risk.levelInfo.color})`,
                  boxShadow: `0 0 10px ${risk.levelInfo.color}55`,
                }}
              />
            </div>
            <span
              className="mono shrink-0 text-[8px] font-bold uppercase tracking-wider"
              style={{ color: risk.levelInfo.color }}
            >
              {risk.levelInfo.short}
            </span>
          </div>

          {detailed ? (
            <p className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-slate-500">{risk.summary}</p>
          ) : null}
        </div>

        {interactive ? (
          <ArrowUpRight
            className="h-3.5 w-3.5 shrink-0 text-slate-700 transition-colors group-hover:text-cyan-300"
            aria-hidden="true"
          />
        ) : null}
      </div>
    </Tag>
  );
}

export default function RiskMatrix({
  assessment,
  variant = 'compact',
  selectedRiskId,
  onSelectRisk,
  className = '',
}) {
  if (!assessment?.risks) return null;
  const detailed = variant === 'full';

  return (
    <div className={className}>
      {detailed && assessment.overall ? (
        <div className="mb-2.5 flex items-center justify-between gap-3 rounded-md border border-space-700/70 bg-space-900/45 px-3 py-2.5">
          <div>
            <span className="eyebrow block">RIESGO GLOBAL RIDGE</span>
            <span className="mt-0.5 block font-heading text-[12px] font-bold text-slate-200">
              {assessment.overall.levelInfo.label} · peor riesgo {assessment.overall.worstRisk.code}
            </span>
          </div>
          <div className="text-right">
            <span className="value-md" style={{ color: assessment.overall.levelInfo.color }}>
              {assessment.overall.score}
            </span>
            <span className="mono ml-1 text-[8px] text-slate-600">/100</span>
          </div>
        </div>
      ) : null}

      <div className={`grid gap-1.5 ${detailed ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {RISK_ORDER.map((key) => {
          const risk = assessment.risks[key];
          if (!risk) return null;
          return (
            <RiskRow
              key={key}
              risk={risk}
              selected={selectedRiskId === key}
              onSelect={onSelectRisk}
              detailed={detailed}
            />
          );
        })}
      </div>
    </div>
  );
}
