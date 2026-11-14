import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Wrench,
  Check,
  ShieldCheck,
  Zap,
  Info,
  ListChecks,
  Users,
  ChevronRight,
} from 'lucide-react';
import ModuleHeader from '../components/ui/ModuleHeader';
import StatusPill from '../components/ui/StatusPill';

export default function AlertManagement({
  activeAlerts = [],
  onApplyCountermeasure,
  onResetNominal,
  onTriggerEmergency,
  astronauts = {},
}) {
  const [selectedFilter, setSelectedFilter] = useState('active');

  const alertProtocolsCatalog = [
    {
      id: 'hypoxia_critical',
      title: 'Hipoxia Severa / Despresurización',
      variable: 'SpO2 (Oxígeno)',
      threshold: '< 90%',
      severity: 'CRITICAL',
      icon: Activity,
      color: '#22D3EE',
      causes: [
        'Fuga o microfisura en la escafandra espacial (despresurización)',
        'Fallo del regulador de inyección de O2',
        'Agotamiento del tanque primario de oxígeno',
      ],
      solutions: [
        {
          step: 1,
          action: 'Activar Pack Secundario de Oxígeno (SOP) de emergencia en la mochila PLSS.',
          detail: 'Garantiza flujo continuo de O2 puro a 4.3 PSI durante 30 minutos.',
        },
        {
          step: 2,
          action: 'Abrir válvula de purga de escafandra (Purge Valve).',
          detail: 'Barre la acumulación residual de nitrógeno y vapor de agua del casco.',
        },
        {
          step: 3,
          action: 'Aborto inmediato de Actividad Extravehicular (EVA).',
          detail: 'Compañero asiste el retorno obligatorio a la esclusa de aire (Airlock) para represurización rápida.',
        },
      ],
    },
    {
      id: 'tachycardia_critical',
      title: 'Taquicardia Severa por Esfuerzo o Estrés',
      variable: 'Frecuencia Cardíaca (HR)',
      threshold: '> 120 bpm',
      severity: 'CRITICAL',
      icon: Heart,
      color: '#FB7185',
      causes: [
        'Sobrecarga física extrema en operaciones exteriores',
        'Respuesta adrenérgica aguda en vacío espacial',
        'Compensación hemodinámica ante hipoxia incipiente',
      ],
      solutions: [
        {
          step: 1,
          action: 'Detener inmediatamente la actividad física y anclarse a la estructura.',
          detail: 'Cesar todo movimiento biomecánico para reducir la demanda miocárdica de O2.',
        },
        {
          step: 2,
          action: 'Instruir respiración diafragmática y maniobras vagales controladas.',
          detail: 'Estimula el tono parasimpático mediante guía de voz desde el Centro de Control.',
        },
        {
          step: 3,
          action: 'Ingesta de electrolitos por la pajilla interna del casco.',
          detail: 'Si la FC no desciende a <100 bpm en 10 minutos, finalizar la salida extravehicular.',
        },
      ],
    },
    {
      id: 'bradycardia_critical',
      title: 'Bradicardia Severa / Reflejo Vagal',
      variable: 'Frecuencia Cardíaca (HR)',
      threshold: '< 50 bpm',
      severity: 'CRITICAL',
      icon: Heart,
      color: '#60A5FA',
      causes: [
        'Hipotermia corporal severa por sombra orbital',
        'Intoxicación o acumulación excesiva de CO2 (Hipercapnia)',
        'Respuesta neurocardiogénica refleja por compresión del traje',
      ],
      solutions: [
        {
          step: 1,
          action: 'Conmutar al cartucho absorbedor de CO2 (LiOH) de reserva.',
          detail: 'Descartar intoxicación por dióxido de carbono en el circuito respiratorio.',
        },
        {
          step: 2,
          action: 'Ajustar calentadores eléctricos de guantes y botas a nivel ALTO.',
          detail: 'Reestablecer la temperatura periférica y el retorno venoso.',
        },
        {
          step: 3,
          action: 'Estimulación acústica continua y preparación de atropina en botiquín de cabina.',
          detail: 'Protocolo médico de emergencia en caso de depresión hemodinámica.',
        },
      ],
    },
    {
      id: 'hyperthermia_critical',
      title: 'Hipertermia / Fallo Refrigeración LCVG',
      variable: 'Temperatura Corporal (TEMP)',
      threshold: '> 38.0 °C',
      severity: 'CRITICAL',
      icon: Thermometer,
      color: '#FBBF24',
      causes: [
        'Bomba de refrigeración líquida del traje (LCVG) obstruida',
        'Sublimador de hielo del PLSS bloqueado por contaminantes',
        'Exposición solar directa prolongada sin apantallamiento térmico',
      ],
      solutions: [
        {
          step: 1,
          action: 'Aumentar manualmente el selector de refrigeración LCVG a flujo MÁXIMO (Nivel 3).',
          detail: 'Fuerza la circulación de agua fría por la prenda interior de cuerpo completo.',
        },
        {
          step: 2,
          action: 'Maniobrar al astronauta hacia la sombra estructural de la nave.',
          detail: 'Evita la radiación solar directa de hasta +120°C en la superficie exterior del traje.',
        },
        {
          step: 3,
          action: 'Ingesta obligatoria de agua fría desde la bolsa de bebida (In-suit Drink Bag).',
          detail: 'Ayuda a la termorregulación interna para evitar golpe de calor y deshidratación.',
        },
      ],
    },
    {
      id: 'tachypnea_critical',
      title: 'Taquipnea / Hiperventilación Aguda',
      variable: 'Frecuencia Respiratoria (RR)',
      threshold: '> 24 rpm',
      severity: 'CRITICAL',
      icon: Wind,
      color: '#60A5FA',
      causes: [
        'Fallo en la absorción de CO2 del traje (reinhalación de gas)',
        'Ansiedad aguda claustrofóbica o sobreesfuerzo torácico',
        'Alcalosis respiratoria por pérdida de regulación automática de presión',
      ],
      solutions: [
        {
          step: 1,
          action: 'Verificar telemetría de presión parcial de CO2 (ppCO2).',
          detail: 'Si ppCO2 > 7.6 mmHg, abrir la válvula de ventilación de emergencia.',
        },
        {
          step: 2,
          action: 'Iniciar protocolo de ventilación asistida verbal por el Especialista Biomédico.',
          detail: 'Cadencia forzada: inhalar en 3s, sostener 2s, exhalar en 4s para reequilibrar el pH sanguíneo.',
        },
        {
          step: 3,
          action: 'Sustituir cartucho absorbedor LiOH / Metal Oxide (MetOx) al ingresar a esclusa.',
          detail: 'Restaura la capacidad nominal de filtración de dióxido de carbono.',
        },
      ],
    },
  ];

  const kpis = [
    {
      label: 'ALERTAS ACTIVAS',
      value: activeAlerts.length,
      note: activeAlerts.length > 0 ? 'Requieren respuesta' : 'Sin anomalías',
      icon: ShieldAlert,
      color: activeAlerts.length > 0 ? '#FB7185' : '#34D399',
    },
    {
      label: 'PROTOCOLOS',
      value: alertProtocolsCatalog.length,
      note: 'Contramedidas cargadas',
      icon: ListChecks,
      color: '#22D3EE',
    },
    {
      label: 'TRIPULACIÓN',
      value: Object.keys(astronauts).length,
      note: 'Bajo monitoreo continuo',
      icon: Users,
      color: '#60A5FA',
    },
    {
      label: 'UMBRALES',
      value: '4',
      note: 'Validados clínicamente',
      icon: ShieldCheck,
      color: '#34D399',
    },
  ];

  return (
    <div className="space-y-4">
      <ModuleHeader
        code="MOD-04"
        kicker="CLINICAL RESPONSE / CONTINGENCY PROTOCOLS"
        title="Gestión de anomalías y protocolos de solución"
        description="Detección automática de desviaciones, diagnóstico de causas raíz y checklist de contramedidas operativas para el Flight Surgeon."
        icon={ShieldAlert}
        status={
          <StatusPill status={activeAlerts.length > 0 ? 'critical' : 'nominal'}>
            {activeAlerts.length > 0 ? `${activeAlerts.length} ALERTA(S) CRÍTICA(S)` : 'SIN ALERTAS ACTIVAS'}
          </StatusPill>
        }
        actions={
          <>
            <button type="button" onClick={onTriggerEmergency} className="btn btn-danger">
              <Zap className="h-3.5 w-3.5" />
              Simular alerta
            </button>
            <button type="button" onClick={onResetNominal} className="btn btn-success">
              <ShieldCheck className="h-3.5 w-3.5" />
              Restablecer todo
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="panel flex items-center gap-3 px-3 py-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-space-700 bg-space-900"
                style={{ color: kpi.color }}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <span className="eyebrow block">{kpi.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="value-md" style={{ color: kpi.color }}>{kpi.value}</span>
                  <span className="mono truncate text-[8px] text-slate-600">{kpi.note}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-b border-space-700/60 pb-2.5">
        <button
          type="button"
          onClick={() => setSelectedFilter('active')}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[10px] font-bold transition-colors ${
            selectedFilter === 'active'
              ? activeAlerts.length > 0
                ? 'border-rose-400/40 bg-rose-400/10 text-rose-200'
                : 'border-emerald-400/35 bg-emerald-400/[0.08] text-emerald-200'
              : 'border-space-700/70 bg-space-900/40 text-slate-500 hover:border-space-600 hover:text-slate-300'
          }`}
          aria-pressed={selectedFilter === 'active'}
        >
          <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
          ALERTAS ACTIVAS
          <span className="mono rounded bg-black/25 px-1 text-[8px]">{activeAlerts.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('catalog')}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 font-mono text-[10px] font-bold transition-colors ${
            selectedFilter === 'catalog'
              ? 'border-cyan-400/35 bg-cyan-400/[0.08] text-cyan-200'
              : 'border-space-700/70 bg-space-900/40 text-slate-500 hover:border-space-600 hover:text-slate-300'
          }`}
          aria-pressed={selectedFilter === 'catalog'}
        >
          <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
          CATÁLOGO DE PROTOCOLOS
          <span className="mono rounded bg-black/25 px-1 text-[8px]">{alertProtocolsCatalog.length}</span>
        </button>
      </div>

      {selectedFilter === 'active' ? (
        activeAlerts.length === 0 ? (
          <section className="panel flex flex-col items-center justify-center gap-3 border-emerald-400/20 px-4 py-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.06]">
              <CheckCircle2 className="h-7 w-7 text-emerald-300" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-heading text-[15px] font-bold uppercase tracking-wide text-emerald-200">
                Todos los parámetros en rango nominal
              </h3>
              <p className="mx-auto mt-1.5 max-w-md text-[11px] leading-relaxed text-slate-500">
                No hay alertas activas. Los signos vitales de la tripulación cumplen con los límites de seguridad de{' '}
                <span className="mono text-slate-300">docs/DATA_DICTIONARY.md</span>.
              </p>
            </div>
            <button type="button" onClick={onTriggerEmergency} className="btn">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              Inyectar alerta de prueba
            </button>
          </section>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert, idx) => {
              const matchedProtocol =
                alertProtocolsCatalog.find(
                  (p) =>
                    p.variable.toLowerCase().includes(alert.variable.toLowerCase()) ||
                    (alert.variable.includes('Frecuencia Cardíaca') && p.id.includes('tachycardia')) ||
                    (alert.variable.includes('SpO2') && p.id.includes('hypoxia')) ||
                    (alert.variable.includes('Temperatura') && p.id.includes('hyperthermia')) ||
                    (alert.variable.includes('Respiratoria') && p.id.includes('tachypnea'))
                ) || alertProtocolsCatalog[0];

              return (
                <article
                  key={`${alert.astronautId}-${alert.variable}-${idx}`}
                  className="panel overflow-hidden border-rose-400/35"
                >
                  <div className="flex flex-col gap-2 border-b border-space-700/60 bg-rose-400/[0.035] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-rose-400/30 bg-rose-400/10 text-rose-300">
                        <AlertTriangle className="h-4 w-4 animate-pulse" aria-hidden="true" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="pill pill-red">ALERTA CRÍTICA</span>
                          <span className="mono text-[8.5px] text-slate-500">{alert.timestamp}</span>
                        </div>
                        <h3 className="mt-1 font-heading text-[13px] font-bold text-white">
                          {alert.astronautName} <span className="text-slate-500">/</span> {alert.variable}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <span className="mono text-[8.5px] uppercase tracking-wider text-slate-500">Lectura</span>
                      <span className="mono rounded-md border border-rose-400/35 bg-rose-400/10 px-2 py-1 text-[14px] font-bold text-rose-100">
                        {alert.value} <span className="text-[9px] font-normal text-rose-300/70">{alert.unit}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-3.5 lg:grid-cols-12">
                    <div className="rounded-md border border-space-700/70 bg-space-900/35 p-2.5 lg:col-span-4">
                      <strong className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-amber-300">
                        <Info className="h-3 w-3" aria-hidden="true" />
                        Posibles causas fisiológicas
                      </strong>
                      <ul className="mt-2 space-y-1.5">
                        {matchedProtocol.causes.map((cause, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1.5 text-[10px] leading-snug text-slate-400">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400/70" />
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-md border border-space-700/70 bg-space-900/35 p-2.5 lg:col-span-8">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-cyan-300">
                          <Wrench className="h-3 w-3" aria-hidden="true" />
                          Protocolo de solución operativa
                        </strong>
                        <span className="mono text-[8px] text-slate-600">CHECKLIST FLIGHT SURGEON</span>
                      </div>

                      <div className="mt-2 space-y-1.5">
                        {matchedProtocol.solutions.map((sol) => (
                          <div key={sol.step} className="flex items-start gap-2 rounded border border-space-700/60 bg-space-950/50 px-2 py-1.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-cyan-400/25 bg-cyan-400/[0.07] font-mono text-[8px] font-bold text-cyan-300">
                              {sol.step}
                            </span>
                            <div>
                              <span className="block font-heading text-[10.5px] font-bold leading-snug text-slate-200">
                                {sol.action}
                              </span>
                              <span className="mt-0.5 block text-[9.5px] leading-snug text-slate-500">{sol.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-space-700/60 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="mono text-[9px] text-slate-600">
                      Ejecutar contramedida para normalizar las constantes del tripulante seleccionado.
                    </span>
                    <button
                      type="button"
                      onClick={() => onApplyCountermeasure(alert.astronautId, alert.variable)}
                      className="btn btn-success"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      Ejecutar contramedida operativa
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        <section className="space-y-3">
          <div className="panel flex flex-col gap-1 px-4 py-3">
            <h4 className="flex items-center gap-2 font-heading text-[12.5px] font-bold text-white">
              <ListChecks className="h-4 w-4 text-telemetry-cyan" aria-hidden="true" />
              Guía de contramedidas clínicas aeroespaciales // NASA spec
            </h4>
            <p className="text-[10.5px] leading-relaxed text-slate-500">
              Protocolos de contingencia y estabilización inmediata para la misión a Marte según los umbrales definidos en{' '}
              <span className="mono text-cyan-300">docs/DATA_DICTIONARY.md</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {alertProtocolsCatalog.map((proto) => {
              const Icon = proto.icon;
              return (
                <article key={proto.id} className="panel hud-corner overflow-hidden">
                  <div className="flex items-start justify-between gap-2 border-b border-space-700/60 px-3.5 py-3">
                    <div className="flex items-start gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-space-700 bg-space-900"
                        style={{ color: proto.color }}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <h4 className="font-heading text-[12px] font-bold leading-snug text-slate-100">{proto.title}</h4>
                        <p className="mono mt-0.5 text-[8.5px] text-slate-500">{proto.variable}</p>
                      </div>
                    </div>
                    <StatusPill status="critical">{proto.threshold}</StatusPill>
                  </div>

                  <div className="space-y-1.5 p-3.5">
                    {proto.solutions.map((sol) => (
                      <div key={sol.step} className="flex items-start gap-2 rounded border border-space-700/60 bg-space-950/45 px-2 py-1.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-space-850 font-mono text-[8px] font-bold text-cyan-300">
                          {sol.step}
                        </span>
                        <div>
                          <span className="block font-heading text-[10.5px] font-bold leading-snug text-slate-200">{sol.action}</span>
                          <span className="mt-0.5 block text-[9px] leading-snug text-slate-500">{sol.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-space-700/60 px-3.5 py-2">
                    <span className="mono text-[8.5px] text-slate-600">{proto.causes.length} CAUSAS IDENTIFICADAS</span>
                    <span className="mono flex items-center gap-1 text-[8.5px] font-semibold text-slate-500">
                      PROTOCOLO CLÍNICO
                      <ChevronRight className="h-2.5 w-2.5" aria-hidden="true" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
