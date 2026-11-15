import React, { useState } from 'react';
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  Trash2,
  X,
} from 'lucide-react';
import StatusPill from './ui/StatusPill';

function roleCode(role = '') {
  const r = role.toLowerCase();
  if (r.includes('comandante')) return 'CDR';
  if (r.includes('biomédica') || r.includes('médic')) return 'BMS';
  if (r.includes('ingeniero')) return 'FE';
  if (r.includes('científic') || r.includes('investig')) return 'MS';
  if (r.includes('piloto')) return 'PLT';
  return 'CREW';
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'AS';
}

function vitalLevel(variable, value) {
  const v = Number(value);
  if (!Number.isFinite(v)) return 'nominal';

  if (variable === 'heart_rate') {
    if (v > 120 || v < 50) return 'critical';
    if (v < 60 || v > 100) return 'warning';
    return 'nominal';
  }
  if (variable === 'spo2') {
    if (v < 90) return 'critical';
    if (v < 95) return 'warning';
    return 'nominal';
  }
  if (variable === 'temperature') {
    if (v > 38.0) return 'critical';
    if (v < 36.1 || v > 37.2) return 'warning';
    return 'nominal';
  }
  if (variable === 'respiratory_rate') {
    if (v > 24 || v < 10) return 'critical';
    if (v < 12 || v > 20) return 'warning';
    return 'nominal';
  }
  return 'nominal';
}

export default function AstronautSelector({
  astronauts = {},
  selectedId,
  onSelect,
  latestVitalsByAstronaut = {},
  onOpenAddModal,
  onRemoveAstronaut,
}) {
  const [astronautPendingDelete, setAstronautPendingDelete] = useState(null);
  const crewList = Object.entries(astronauts);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <span className="mono rounded border border-[#C9D9F5] bg-[#DBEAFE] px-2 py-0.5 text-[9px] font-bold text-[#0B3D91]">
            TRIPULACIÓN ({crewList.length})
          </span>
          <span className="text-[11px] font-medium text-black">
            Enfoca la telemetría, visor 3D y evaluación clínica en un tripulante
          </span>
        </div>
        {onOpenAddModal ? (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="btn btn-primary !h-7 !min-h-0 !py-1 !px-2.5 text-[10px]"
            title="Agregar un nuevo astronauta a la misión"
          >
            <UserPlus className="h-3 w-3" aria-hidden="true" />
            <span>+ Agregar astronauta</span>
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {crewList.map(([id, ast]) => {
          const isSelected = id === selectedId;
          const vitals = latestVitalsByAstronaut[id] || {};
          const isEva = ast.activity === 'EVA';

          const metrics = [
            {
              key: 'heart_rate',
              label: 'HR',
              value: vitals.heart_rate,
              unit: 'bpm',
              icon: Heart,
              color: '#0B3D91',
            },
            {
              key: 'spo2',
              label: 'SpO2',
              value: vitals.spo2,
              unit: '%',
              icon: Activity,
              color: '#0EA5E9',
            },
            {
              key: 'temperature',
              label: 'TEMP',
              value: vitals.temperature,
              unit: '°C',
              icon: Thermometer,
              color: '#0B3D91',
            },
            {
              key: 'respiratory_rate',
              label: 'RR',
              value: vitals.respiratory_rate,
              unit: 'rpm',
              icon: Wind,
              color: '#38BDF8',
            },
          ];

          const levels = metrics.map((metric) => vitalLevel(metric.key, metric.value));
          const worstLevel = levels.includes('critical')
            ? 'critical'
            : levels.includes('warning')
              ? 'warning'
              : 'nominal';
          const isCritical = worstLevel === 'critical';
          const isWarning = worstLevel === 'warning';

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`panel group relative overflow-hidden p-3 text-left transition-all duration-150 ${
                isCritical
                  ? 'panel-critical'
                  : isWarning
                    ? 'panel-warning'
                    : isSelected
                      ? 'panel-active border-[#0B3D91] bg-[#DBEAFE]/35 shadow-co-md'
                      : 'panel-hover'
              }`}
              aria-pressed={isSelected}
            >
              <span
                className="absolute inset-x-0 top-0 h-[2px]"
                style={{
                  background: isCritical
                    ? 'linear-gradient(90deg, transparent, #A16207, transparent)'
                    : isWarning
                      ? 'linear-gradient(90deg, transparent, #0369A1, transparent)'
                      : isSelected
                        ? 'linear-gradient(90deg, transparent, #0B3D91, transparent)'
                        : 'transparent',
                }}
                aria-hidden="true"
              />

              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-heading text-[11px] font-extrabold ${
                      isCritical
                        ? 'border-[#FDE68A] bg-[#FEF3C7] text-[#A16207]'
                        : isWarning
                          ? 'border-[#BAE6FD] bg-[#E0F2FE] text-[#0369A1]'
                          : isSelected
                            ? 'border-[#0B3D91] bg-[#0B3D91] text-white shadow-sm'
                            : 'border-[#C9D9F5] bg-[#DBEAFE] text-[#0B3D91]'
                    }`}
                  >
                    {initials(ast.name)}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-heading text-[12.5px] font-bold text-black">
                        {ast.name}
                      </span>
                      <span className="mono text-[8.5px] text-black">{roleCode(ast.role)}</span>
                      {isCritical || isWarning ? (
                        <AlertTriangle
                          className={`h-3 w-3 shrink-0 ${isCritical ? 'text-[#A16207]' : 'text-[#0369A1]'}`}
                          aria-hidden="true"
                        />
                      ) : null}
                    </div>
                    <span className="mono mt-0.5 block truncate text-[9px] text-black">
                      {id.toUpperCase()} · {ast.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`mono shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold ${
                      isSelected
                        ? 'border-[#0B3D91] bg-[#0B3D91] text-white'
                        : isEva
                          ? 'border-[#C9D9F5] bg-[#DBEAFE] text-[#0B3D91]'
                          : 'border-[#C9D9F5] bg-white text-black'
                    }`}
                  >
                    {ast.activity}
                  </span>

                  {onRemoveAstronaut ? (
                    <button
                      type="button"
                      disabled={crewList.length <= 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (crewList.length <= 1) return;
                        setAstronautPendingDelete({
                          id,
                          name: ast.name,
                          role: ast.role,
                          activity: ast.activity,
                        });
                      }}
                      className={`flex h-6 w-6 items-center justify-center rounded border transition-colors ${
                        crewList.length <= 1
                          ? 'opacity-30 cursor-not-allowed border-transparent text-gray-400'
                          : 'border-transparent text-black hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      title={
                        crewList.length <= 1
                          ? 'Se requiere al menos un tripulante en la misión'
                          : `Quitar a ${ast.name} de la misión`
                      }
                      aria-label={`Quitar a ${ast.name} de la misión`}
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  const level = vitalLevel(metric.key, metric.value);
                  const metricColor =
                    level === 'critical' ? '#A16207' : level === 'warning' ? '#0369A1' : metric.color;
                  return (
                    <div key={metric.key} className="panel-inset px-1.5 py-1.5">
                      <span className="mono flex items-center gap-1 text-[8px] uppercase tracking-wider text-black">
                        <Icon className="h-2.5 w-2.5" style={{ color: metricColor }} aria-hidden="true" />
                        {metric.label}
                      </span>
                      <span
                        className={`mono mt-1 block text-[10.5px] font-bold ${
                          level === 'critical'
                            ? 'text-[#A16207]'
                            : level === 'warning'
                              ? 'text-[#0369A1]'
                              : 'text-black'
                        }`}
                      >
                        {metric.value ?? '--'}
                        <span className="ml-0.5 text-[7.5px] font-normal text-black">{metric.unit}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#C9D9F5] pt-1.5">
                <StatusPill
                  status={isCritical ? 'critical' : isWarning ? 'warning' : 'nominal'}
                  dot={false}
                >
                  {isCritical || isWarning ? (
                    <>
                      <AlertTriangle className="mr-1 inline h-2.5 w-2.5" aria-hidden="true" />
                      {isCritical ? 'CRÍTICO' : 'ADVERTENCIA'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1 inline h-2.5 w-2.5" aria-hidden="true" />
                      NOMINAL
                    </>
                  )}
                </StatusPill>
                <span className="mono flex items-center gap-0.5 text-[8.5px] font-semibold text-black group-hover:text-[#0B3D91]">
                  TELEMETRÍA
                  <ChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
                </span>
              </div>
            </button>
          );
        })}

        {onOpenAddModal ? (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="panel panel-hover group relative flex min-h-[160px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#C9D9F5] bg-white/60 p-4 text-center transition-all hover:border-[#0B3D91] hover:bg-[#DBEAFE]/30"
            aria-label="Agregar nuevo astronauta"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#C9D9F5] bg-[#DBEAFE] text-[#0B3D91] shadow-co-sm transition-transform duration-200 group-hover:scale-110">
              <UserPlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="mt-2.5 font-heading text-[12.5px] font-bold text-[#0B3D91]">
              + Agregar astronauta
            </span>
            <span className="mono mt-1 text-[9px] text-black">
              Incorporar nuevo tripulante
            </span>
          </button>
        ) : null}
      </div>

      {/* Modal de confirmación para quitar astronauta */}
      {astronautPendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="panel w-full max-w-md overflow-hidden rounded-lg border border-[#C9D9F5] bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-[14px] font-bold text-black">
                    ¿Quitar astronauta de la misión?
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAstronautPendingDelete(null)}
                    className="text-black hover:text-rose-600"
                    aria-label="Cerrar modal"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1 text-[11.5px] leading-relaxed text-black">
                  Estás a punto de retirar a <span className="font-bold text-black">{astronautPendingDelete.name}</span> ({astronautPendingDelete.id.toUpperCase()}) de la tripulación activa.
                </p>
                <div className="mt-2.5 rounded border border-[#C9D9F5] bg-[#F8FAFD] p-2.5 text-[10.5px] text-black space-y-0.5">
                  <div className="mono font-semibold text-black">Rol: {astronautPendingDelete.role}</div>
                  <div className="mono text-black">Actividad: {astronautPendingDelete.activity}</div>
                  <div className="pt-1 text-rose-600 font-semibold">
                    ⚠️ Se suspenderá la simulación de constantes vitales y el monitoreo activo para este tripulante.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#C9D9F5] pt-3">
              <button
                type="button"
                onClick={() => setAstronautPendingDelete(null)}
                className="btn !min-h-[32px] !px-3.5 !py-1 text-[11px] font-semibold text-black"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onRemoveAstronaut) {
                    onRemoveAstronaut(astronautPendingDelete.id);
                  }
                  setAstronautPendingDelete(null);
                }}
                className="btn btn-danger !min-h-[32px] !px-3.5 !py-1 text-[11px] font-bold"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Confirmar baja de la misión</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
