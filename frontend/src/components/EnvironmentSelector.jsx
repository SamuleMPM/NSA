import React from 'react';
import {
  Rocket,
  Satellite,
  Truck,
  Building2,
  Radio,
  Radiation,
  Compass,
  AlertTriangle,
  Clock,
  Gauge,
  Check,
  FlaskConical,
} from 'lucide-react';
import { ENVIRONMENTS } from '../lib/environments';

const ICONS = {
  rocket: Rocket,
  satellite: Satellite,
  truck: Truck,
  building: Building2,
};

export default function EnvironmentSelector({
  currentEnvironmentId = 'transit',
  onSelectEnvironment,
}) {
  const currentEnv = ENVIRONMENTS.find((environment) => environment.id === currentEnvironmentId) || ENVIRONMENTS[0];

  return (
    <div className="glass-panel space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b border-space-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-telemetry-cyan" aria-hidden="true" />
            <h3 className="font-heading text-[14px] font-bold text-white">Entorno operativo de la misión</h3>
            <span className="pill pill-violet">
              <FlaskConical className="h-3 w-3" aria-hidden="true" />
              SIMULADO
            </span>
          </div>
          <p className="mt-0.5 max-w-2xl text-[10.5px] leading-relaxed text-slate-400">
            El entorno altera gravedad, radiación, latencia y autonomía del modelo RIDGE. Los valores son parámetros de simulación, no telemetría ECLSS real.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ENVIRONMENTS.map((env) => {
            const isSelected = env.id === currentEnvironmentId;
            const IconComp = ICONS[env.iconName] || Rocket;

            return (
              <button
                key={env.id}
                type="button"
                onClick={() => onSelectEnvironment && onSelectEnvironment(env.id)}
                className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[10.5px] font-semibold transition ${
                  isSelected
                    ? 'bg-space-750 text-white'
                    : 'border-space-800 bg-space-850/80 text-slate-400 hover:text-white'
                }`}
                style={{
                  borderColor: isSelected ? env.color : undefined,
                  boxShadow: isSelected ? `0 0 14px ${env.color}35` : undefined,
                }}
                aria-pressed={isSelected}
              >
                <IconComp className="h-3.5 w-3.5" style={{ color: env.color }} aria-hidden="true" />
                <span>{env.shortName}</span>
                {isSelected ? <Check className="h-3 w-3 text-telemetry-green" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <div className="rounded-md border border-space-800 bg-space-850/70 p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Gauge className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />
            <span>Campo gravitatorio</span>
          </div>
          <div className="mt-1 font-mono text-[12px] font-extrabold text-white">{currentEnv.gravityText}</div>
          <span className="font-mono text-[9px] text-slate-500">
            {currentEnv.gravityG === 0 ? 'Desacondicionamiento óseo' : 'Gravedad parcial'}
          </span>
        </div>

        <div className="rounded-md border border-space-800 bg-space-850/70 p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Radiation className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span>Tasa de radiación</span>
          </div>
          <div className="mt-1 font-mono text-[12px] font-extrabold text-white">
            {currentEnv.radiationDailyMsv} <span className="text-[9px] text-slate-400">mSv/día</span>
          </div>
          <span className="font-mono text-[9px] text-slate-500">
            Tasa: {currentEnv.radiationRateUsVh} µSv/h
          </span>
        </div>

        <div className="rounded-md border border-space-800 bg-space-850/70 p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Clock className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
            <span>Latencia de enlace</span>
          </div>
          <div className="mt-1 font-mono text-[12px] font-extrabold text-white">{currentEnv.commDelayText.split(' ')[0]}</div>
          <span className="font-mono text-[9px] text-slate-500">
            {currentEnv.commDelaySeconds > 10 ? 'Houston diferido' : 'Telemedicina directa'}
          </span>
        </div>

        <div className="rounded-md border border-space-800 bg-space-850/70 p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Radio className="h-3.5 w-3.5 text-telemetry-green" aria-hidden="true" />
            <span>Autonomía requerida</span>
          </div>
          <div className="mt-1 font-mono text-[11px] font-bold uppercase text-telemetry-green">
            {currentEnv.autonomyRequirement.split(' ')[0]}
          </div>
          <span className="font-mono text-[9px] text-slate-500">{currentEnv.habitatVolume}</span>
        </div>
      </div>

      <div className="rounded-md border border-space-800/80 bg-space-850/40 p-3">
        <span className="text-[10.5px] font-bold text-slate-200">
          Factores críticos de riesgo NASA en este entorno ({currentEnv.shortName}):
        </span>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {currentEnv.elevatedHazards.map((hazard) => (
            <div key={hazard.name} className="rounded-md border border-space-750 bg-space-950/60 p-2.5">
              <div className="flex items-center gap-1.5 text-[10.5px] font-semibold text-cyan-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>{hazard.name}</span>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">{hazard.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
