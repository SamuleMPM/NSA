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
} from 'lucide-react';

export const ENVIRONMENTS = [
  {
    id: 'transit',
    name: 'Nave en Tránsito a Marte (Deep Space Transport)',
    shortName: 'Tránsito Interplanetario',
    icon: Rocket,
    color: '#38BDF8',
    gravityG: 0.0,
    gravityText: '0.00 G (Microgravedad Pura)',
    ambientPressureKpa: 101.3,
    radiationRateUsVh: 75.0,
    radiationDailyMsv: 1.8,
    commDelaySeconds: 870,
    commDelayText: '14.5 min (Retardo Tierra-Marte)',
    autonomyRequirement: 'TOTAL (Sin telecirugía ni asistencia en vivo)',
    habitatVolume: '68 m³ (Confinamiento Extremo)',
    elevatedHazards: [
      { name: 'Radiación Cósmica (R)', detail: 'Exposición continua a Rayos Cósmicos Galácticos (GCR) sin la magnetosfera terrestre.' },
      { name: 'Distancia de la Tierra (D)', detail: 'Retardo de 14.5 min en comunicaciones; la tripulación debe autogestionar toda emergencia médica.' },
      { name: 'Gravedad Cero (G)', detail: 'Pérdida acelerada de densidad ósea (1.2%/mes) y atrofia muscular antigravitatoria.' },
    ],
  },
  {
    id: 'station',
    name: 'Estación Orbital (Lunar Gateway / ISS)',
    shortName: 'Estación Orbital',
    icon: Satellite,
    color: '#22D3EE',
    gravityG: 0.0,
    gravityText: '0.00 G (Microgravedad)',
    ambientPressureKpa: 101.3,
    radiationRateUsVh: 22.0,
    radiationDailyMsv: 0.5,
    commDelaySeconds: 1.3,
    commDelayText: '1.3 seg (Soporte Directo Houston)',
    autonomyRequirement: 'MODERADA (Telemedicina asistida en tiempo real)',
    habitatVolume: '388 m³ (Multimódulo)',
    elevatedHazards: [
      { name: 'Desplazamiento Cefálico (G)', detail: 'Riesgo alto de SANS (Síndrome Neuro-Ocular) por redistribución de 2L de fluidos hacia la cabeza.' },
      { name: 'Entorno Cerrado (E)', detail: '16 amaneceres y puestas de sol cada 24 horas; pérdida del ritmo circadiano natural.' },
    ],
  },
  {
    id: 'rover',
    name: 'Vehículo Explorador Presurizado (Mars Rover)',
    shortName: 'Rover Superficial',
    icon: Truck,
    color: '#FBBF24',
    gravityG: 0.38,
    gravityText: '0.38 G (Gravedad Marciana)',
    ambientPressureKpa: 70.3,
    radiationRateUsVh: 45.0,
    radiationDailyMsv: 1.1,
    commDelaySeconds: 870,
    commDelayText: '14.5 min (Enlace diferido)',
    autonomyRequirement: 'ALTA (Cabina biplaza en expedición)',
    habitatVolume: '22 m³ (Alta exigencia ergonómica)',
    elevatedHazards: [
      { name: 'Entornos Hostiles (E)', detail: 'Polvillo de regolito marciano abrasivo y tóxico al ingresar tras paseos EVA.' },
      { name: 'Fatiga Muscular (G + E)', detail: 'Sobrecarga física por caminar en gravedad 0.38g con escafandra pesada de exploración.' },
    ],
  },
  {
    id: 'base',
    name: 'Base Planetaria Superficial (Artemis Base Camp / Mars Hab)',
    shortName: 'Base Planetaria',
    icon: Building2,
    color: '#34D399',
    gravityG: 0.38,
    gravityText: '0.38 G (Gravedad Parcial Marciana)',
    ambientPressureKpa: 101.3,
    radiationRateUsVh: 15.0,
    radiationDailyMsv: 0.36,
    commDelaySeconds: 870,
    commDelayText: '14.5 min (Consulta diferida)',
    autonomyRequirement: 'ALTA (Infraestructura médica de hábitat)',
    habitatVolume: '450 m³ (Bóvedas con regolito)',
    elevatedHazards: [
      { name: 'Aislamiento Crónico (I)', detail: 'Misiones de superficie de más de 500 días; riesgo de depresión y desgaste interpersonal.' },
      { name: 'Gravedad Parcial (G)', detail: 'Adaptación ósea intermedia: los huesos sufren menor pérdida que en 0g pero se requiere ejercicio resistivo continuo.' },
    ],
  },
];

export default function EnvironmentSelector({
  currentEnvironmentId = 'transit',
  onSelectEnvironment,
}) {
  const currentEnv = ENVIRONMENTS.find((e) => e.id === currentEnvironmentId) || ENVIRONMENTS[0];

  return (
    <div className="rounded-2xl border border-space-800 bg-space-900/90 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Encabezado y selector de ambiente */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-space-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-telemetry-cyan" />
            <h3 className="font-heading text-base font-bold text-white">Entorno Operativo de la Misión</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            El entorno altera los riesgos de la NASA (gravedad, radiación, retardo con la Tierra) y modula los protocolos médicos.
          </p>
        </div>

        {/* Botones de selección de entorno */}
        <div className="flex flex-wrap gap-1.5">
          {ENVIRONMENTS.map((env) => {
            const isSelected = env.id === currentEnvironmentId;
            const IconComp = env.icon;

            return (
              <button
                key={env.id}
                type="button"
                onClick={() => onSelectEnvironment && onSelectEnvironment(env.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isSelected
                    ? 'border bg-space-750 text-white shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                    : 'border border-space-800 bg-space-850/80 text-slate-400 hover:text-white'
                }`}
                style={{
                  borderColor: isSelected ? env.color : undefined,
                  boxShadow: isSelected ? `0 0 12px ${env.color}40` : undefined,
                }}
              >
                <IconComp className="h-4 w-4" style={{ color: env.color }} />
                <span>{env.shortName}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-telemetry-green" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta de Especificaciones Físicas y Médicas del Entorno Actual */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Gravedad */}
        <div className="rounded-xl border border-space-800 bg-space-850/70 p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Gauge className="h-3.5 w-3.5 text-cyan-400" />
            <span>Campo Gravitatorio</span>
          </div>
          <div className="mt-1 font-mono text-base font-extrabold text-white">{currentEnv.gravityText}</div>
          <span className="font-mono text-[10px] text-slate-500">
            {currentEnv.gravityG === 0.0 ? 'Desacondicionamiento óseo' : 'Gravedad parcial'}
          </span>
        </div>

        {/* Radiación */}
        <div className="rounded-xl border border-space-800 bg-space-850/70 p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Radiation className="h-3.5 w-3.5 text-amber-400" />
            <span>Tasa de Radiación</span>
          </div>
          <div className="mt-1 font-mono text-base font-extrabold text-white">
            {currentEnv.radiationDailyMsv} <span className="text-xs text-slate-400">mSv/día</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            Tasa: {currentEnv.radiationRateUsVh} µSv/h
          </span>
        </div>

        {/* Retardo con la Tierra */}
        <div className="rounded-xl border border-space-800 bg-space-850/70 p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock className="h-3.5 w-3.5 text-rose-400" />
            <span>Latencia de Enlace</span>
          </div>
          <div className="mt-1 font-mono text-base font-extrabold text-white">{currentEnv.commDelayText.split(' ')[0]}</div>
          <span className="font-mono text-[10px] text-slate-500">
            {currentEnv.commDelaySeconds > 10 ? 'Houston diferido' : 'Telemedicina directa'}
          </span>
        </div>

        {/* Nivel de Autonomía Médica */}
        <div className="rounded-xl border border-space-800 bg-space-850/70 p-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Radio className="h-3.5 w-3.5 text-telemetry-green" />
            <span>Autonomía Requerida</span>
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-telemetry-green uppercase">
            {currentEnv.autonomyRequirement.split(' ')[0]}
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            {currentEnv.habitatVolume}
          </span>
        </div>
      </div>

      {/* Riesgos HRP Elevados en este Entorno Específico */}
      <div className="rounded-xl border border-space-800/80 bg-space-850/40 p-4">
        <span className="text-xs font-bold text-slate-200">
          Factores Críticos de Riesgo NASA en este Entorno ({currentEnv.shortName}):
        </span>
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {currentEnv.elevatedHazards.map((hz, idx) => (
            <div key={idx} className="rounded-lg border border-space-750 bg-space-950/60 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>{hz.name}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{hz.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
