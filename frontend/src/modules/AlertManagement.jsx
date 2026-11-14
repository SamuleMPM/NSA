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
  Info 
} from 'lucide-react';

export default function AlertManagement({
  activeAlerts = [],
  onApplyCountermeasure,
  onResetNominal,
  onTriggerEmergency,
  astronauts = {}
}) {
  const [selectedFilter, setSelectedFilter] = useState('active');

  const alertProtocolsCatalog = [
    {
      id: "hypoxia_critical",
      title: "Hipoxia Severa / Despresurización",
      variable: "SpO2 (Oxígeno)",
      threshold: "< 90%",
      severity: "CRITICAL",
      icon: <Activity className="w-4 h-4 text-telemetry-cyan" />,
      causes: [
        "Fuga o microfisura en la escafandra espacial (despresurización)",
        "Fallo del regulador de inyección de O2",
        "Agotamiento del tanque primario de oxígeno"
      ],
      solutions: [
        {
          step: 1,
          action: "Activar Pack Secundario de Oxígeno (SOP) de emergencia en la mochila PLSS.",
          detail: "Garantiza flujo continuo de O2 puro a 4.3 PSI durante 30 minutos."
        },
        {
          step: 2,
          action: "Abrir válvula de purga de escafandra (Purge Valve).",
          detail: "Barre la acumulación residual de nitrógeno y vapor de agua del casco."
        },
        {
          step: 3,
          action: "Aborto inmediato de Actividad Extravehicular (EVA).",
          detail: "Compañero asiste el retorno obligatorio a la esclusa de aire (Airlock) para represurización rápida."
        }
      ]
    },
    {
      id: "tachycardia_critical",
      title: "Taquicardia Severa por Esfuerzo o Estrés",
      variable: "Frecuencia Cardíaca (HR)",
      threshold: "> 120 bpm",
      severity: "CRITICAL",
      icon: <Heart className="w-4 h-4 text-red-400" />,
      causes: [
        "Sobrecarga física extrema en operaciones exteriores",
        "Respuesta adrenérgica aguda en vacío espacial",
        "Compensación hemodinámica ante hipoxia incipiente"
      ],
      solutions: [
        {
          step: 1,
          action: "Detener inmediatamente la actividad física y anclarse a la estructura.",
          detail: "Cesar todo movimiento biomecánico para reducir la demanda miocárdica de O2."
        },
        {
          step: 2,
          action: "Instruir respiración diafragmática y maniobras vagales controladas.",
          detail: "Estimula el tono parasimpático mediante guía de voz desde el Centro de Control."
        },
        {
          step: 3,
          action: "Ingesta de electrolitos por la pajilla interna del casco.",
          detail: "Si la FC no desciende a <100 bpm en 10 minutos, finalizar la salida extravehicular."
        }
      ]
    },
    {
      id: "bradycardia_critical",
      title: "Bradicardia Severa / Reflejo Vagal",
      variable: "Frecuencia Cardíaca (HR)",
      threshold: "< 50 bpm",
      severity: "CRITICAL",
      icon: <Heart className="w-4 h-4 text-telemetry-blue" />,
      causes: [
        "Hipotermia corporal severa por sombra orbital",
        "Intoxicación o acumulación excesiva de CO2 (Hipercapnia)",
        "Respuesta neurocardiogénica refleja por compresión del traje"
      ],
      solutions: [
        {
          step: 1,
          action: "Conmutar al cartucho absorbedor de CO2 (LiOH) de reserva.",
          detail: "Descartar intoxicación por dióxido de carbono en el circuito respiratorio."
        },
        {
          step: 2,
          action: "Ajustar calentadores eléctricos de guantes y botas a nivel ALTO.",
          detail: "Reestablecer la temperatura periférica y el retorno venoso."
        },
        {
          step: 3,
          action: "Estimulación acústica continua y preparación de atropina en botiquín de cabina.",
          detail: "Protocolo médico de emergencia en caso de depresión hemodinámica."
        }
      ]
    },
    {
      id: "hyperthermia_critical",
      title: "Hipertermia / Fallo Refrigeración LCVG",
      variable: "Temperatura Corporal (TEMP)",
      threshold: "> 38.0 °C",
      severity: "CRITICAL",
      icon: <Thermometer className="w-4 h-4 text-telemetry-amber" />,
      causes: [
        "Bomba de refrigeración líquida del traje (LCVG) obstruida",
        "Sublimador de hielo del PLSS bloqueado por contaminantes",
        "Exposición solar directa prolongada sin apantallamiento térmico"
      ],
      solutions: [
        {
          step: 1,
          action: "Aumentar manualmente el selector de refrigeración LCVG a flujo MÁXIMO (Nivel 3).",
          detail: "Fuerza la circulación de agua fría por la prenda interior de cuerpo completo."
        },
        {
          step: 2,
          action: "Maniobrar al astronauta hacia la sombra estructural de la nave.",
          detail: "Evita la radiación solar directa de hasta +120°C en la superficie exterior del traje."
        },
        {
          step: 3,
          action: "Ingesta obligatoria de agua fría desde la bolsa de bebida (In-suit Drink Bag).",
          detail: "Ayuda a la termorregulación interna para evitar golpe de calor y deshidratación."
        }
      ]
    },
    {
      id: "tachypnea_critical",
      title: "Taquipnea / Hiperventilación Aguda",
      variable: "Frecuencia Respiratoria (RR)",
      threshold: "> 24 rpm",
      severity: "CRITICAL",
      icon: <Wind className="w-4 h-4 text-telemetry-blue" />,
      causes: [
        "Fallo en la absorción de CO2 del traje (reinhalación de gas)",
        "Ansiedad aguda claustrofóbica o sobreesfuerzo torácico",
        "Alcalosis respiratoria por pérdida de regulación automática de presión"
      ],
      solutions: [
        {
          step: 1,
          action: "Verificar telemetría de presión parcial de CO2 (ppCO2).",
          detail: "Si ppCO2 > 7.6 mmHg, abrir la válvula de ventilación de emergencia."
        },
        {
          step: 2,
          action: "Iniciar protocolo de ventilación asistida verbal por el Especialista Biomédico.",
          detail: "Cadencia forzada: inhalar en 3s, sostener 2s, exhalar en 4s para reequilibrar el pH sanguíneo."
        },
        {
          step: 3,
          action: "Sustituir cartucho absorbedor LiOH / Metal Oxide (MetOx) al ingresar a esclusa.",
          detail: "Restaura la capacidad nominal de filtración de dióxido de carbono."
        }
      ]
    }
  ];

  return (
    <div className="space-y-3.5">
      
      {/* Header del Módulo */}
      <div className="hud-panel p-3 rounded-lg border border-space-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono uppercase px-2 py-0.2 rounded bg-red-950/60 text-telemetry-crimson border border-red-500/40 font-bold tracking-widest">
              MOD-04 // SISTEMA DE ALERTAS & CONTRAMEDIDAS
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[10px] font-mono text-slate-400">
              CLINICAL RESPONSE PROTOCOLS
            </span>
          </div>
          <h2 className="text-lg font-heading font-bold text-white uppercase tracking-wide">
            GESTIÓN DE ANOMALÍAS Y PROTOCOLOS DE SOLUCIÓN
          </h2>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerEmergency}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-red-950/60 hover:bg-red-900/60 border border-red-500/50 text-xs font-mono text-telemetry-crimson transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simular Alerta</span>
          </button>

          <button
            onClick={onResetNominal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/40 text-xs font-mono text-telemetry-green transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Restablecer Todo</span>
          </button>
        </div>
      </div>

      {/* Pestañas de Filtrado */}
      <div className="flex items-center gap-2 border-b border-space-700/60 pb-2 font-mono text-xs">
        <button
          onClick={() => setSelectedFilter('active')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
            selectedFilter === 'active'
              ? "bg-red-950/80 text-telemetry-crimson border-red-500/60 font-bold shadow-hud-danger"
              : "bg-space-850 border-space-700 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>ALERTAS ACTIVAS ({activeAlerts.length})</span>
        </button>

        <button
          onClick={() => setSelectedFilter('catalog')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-colors cursor-pointer ${
            selectedFilter === 'catalog'
              ? "bg-space-800 text-telemetry-cyan border-telemetry-cyan font-bold shadow-hud"
              : "bg-space-850 border-space-700 text-slate-400 hover:text-white"
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>CATÁLOGO DE PROTOCOLOS ({alertProtocolsCatalog.length})</span>
        </button>
      </div>

      {/* VISTA 1: Alertas Activas en Tiempo Real con Solución Interactiva */}
      {selectedFilter === 'active' && (
        <section className="space-y-3">
          {activeAlerts.length === 0 ? (
            <div className="hud-panel p-6 rounded-lg text-center space-y-2 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 text-telemetry-green mx-auto" />
              <h3 className="font-heading font-bold text-sm text-telemetry-green uppercase tracking-wide">
                TODOS LOS PARÁMETROS SE ENCUENTRAN EN RANGO NOMINAL
              </h3>
              <p className="font-mono text-xs text-slate-400 max-w-md mx-auto leading-normal">
                No hay alertas activas en este momento. Los signos vitales de la tripulación cumplen con los límites de seguridad de <code className="text-slate-200">docs/DATA_DICTIONARY.md</code>.
              </p>
              <button
                onClick={onTriggerEmergency}
                className="mt-2 px-3 py-1.5 rounded bg-space-850 hover:bg-space-800 border border-space-700 text-xs font-mono text-slate-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-telemetry-amber" />
                <span>Inyectar Alerta de Prueba (Simulador)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((alert, idx) => {
                const matchedProtocol = alertProtocolsCatalog.find(
                  p => p.variable.toLowerCase().includes(alert.variable.toLowerCase()) || 
                       (alert.variable.includes("Frecuencia Cardíaca") && p.id.includes("tachycardia")) ||
                       (alert.variable.includes("SpO2") && p.id.includes("hypoxia")) ||
                       (alert.variable.includes("Temperatura") && p.id.includes("hyperthermia")) ||
                       (alert.variable.includes("Respiratoria") && p.id.includes("tachypnea"))
                ) || alertProtocolsCatalog[0];

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-red-500/70 bg-red-950/30 shadow-hud-danger space-y-3"
                  >
                    {/* Header de la Alerta */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-space-700/60 font-mono text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded bg-red-950 border border-red-500/60 text-telemetry-crimson">
                          <AlertTriangle className="w-4 h-4 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-telemetry-crimson bg-red-950 px-1.5 py-0.2 rounded border border-red-500/40 text-[10px]">
                              [ALERTA CRÍTICA]
                            </span>
                            <span className="text-slate-400 text-[10px]">• {alert.timestamp}</span>
                          </div>
                          <h3 className="font-heading font-bold text-sm text-white mt-0.5">
                            {alert.astronautName} ({alert.astronautId}) — {alert.variable}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px]">LECTURA ACTUAL:</span>
                        <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/60 font-bold text-red-300 text-sm">
                          {alert.value} {alert.unit}
                        </span>
                      </div>
                    </div>

                    {/* Causas y Procedimiento */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 font-mono text-xs">
                      <div className="lg:col-span-4 p-2.5 rounded bg-space-950 border border-space-700 space-y-1.5">
                        <strong className="text-telemetry-amber block text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Info className="w-3 h-3" /> Posibles Causas Fisiológicas:
                        </strong>
                        <ul className="space-y-1 text-slate-300 text-[10px] list-disc list-inside">
                          {matchedProtocol.causes.map((cause, cIdx) => (
                            <li key={cIdx} className="leading-tight">{cause}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="lg:col-span-8 p-2.5 rounded bg-space-950 border border-space-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <strong className="text-telemetry-cyan block text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> Protocolo de Solución Operativa:
                          </strong>
                          <span className="text-[9px] text-slate-400 font-semibold">CHECKLIST FLIGHT SURGEON</span>
                        </div>

                        <div className="space-y-1">
                          {matchedProtocol.solutions.map((sol) => (
                            <div key={sol.step} className="flex items-start gap-2 bg-space-900/60 p-1.5 rounded border border-space-700/60">
                              <span className="w-4 h-4 rounded bg-space-850 text-telemetry-cyan border border-space-700 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                                {sol.step}
                              </span>
                              <div>
                                <span className="font-bold text-slate-100 text-[10px] block">{sol.action}</span>
                                <span className="text-slate-400 text-[9px] leading-tight block">{sol.detail}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Botón de Acción Directa */}
                    <div className="flex items-center justify-between pt-2 border-t border-space-700/60 font-mono text-xs">
                      <span className="text-slate-400 text-[10px]">
                        Ejecutar contramedida médica para normalizar constantes vitales de {alert.astronautName}.
                      </span>

                      <button
                        onClick={() => onApplyCountermeasure(alert.astronautId, alert.variable)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-space-950 font-bold transition-colors cursor-pointer text-xs"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Ejecutar Contramedida Operativa</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* VISTA 2: Catálogo de Protocolos Oficial */}
      {selectedFilter === 'catalog' && (
        <section className="space-y-3">
          <div className="hud-panel p-3 rounded-lg border border-space-700 font-mono text-xs text-slate-300">
            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-wide mb-0.5">
              GUÍA DE CONTRAMEDIDAS CLÍNICAS AEROESPACIALES // NASA SPEC
            </h4>
            <p className="text-slate-400 text-[10px]">
              Protocolos de contingencia y estabilización inmediata para la misión a Marte según los umbrales definidos en <code className="text-telemetry-cyan">docs/DATA_DICTIONARY.md</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertProtocolsCatalog.map((proto) => (
              <div
                key={proto.id}
                className="hud-panel p-3 rounded-lg border border-space-700/80 space-y-2 font-mono text-xs"
              >
                <div className="flex items-start justify-between pb-1.5 border-b border-space-700/60">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-space-850 border border-space-700">
                      {proto.icon}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-slate-100 text-xs">{proto.title}</h4>
                      <p className="text-[9px] text-slate-400">{proto.variable}</p>
                    </div>
                  </div>

                  <span className="px-1.5 py-0.2 rounded bg-red-950/60 text-telemetry-crimson border border-red-500/40 text-[9px] font-bold">
                    UMBRAL: {proto.threshold}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 text-[9px] uppercase block font-bold">Protocolo de Contingencia:</span>
                  {proto.solutions.map((sol) => (
                    <div key={sol.step} className="p-1.5 rounded bg-space-950 border border-space-700 flex items-start gap-1.5">
                      <span className="text-telemetry-cyan font-bold text-[9px] mt-0.5">{sol.step}.</span>
                      <div>
                        <span className="text-slate-200 text-[10px] font-semibold block">{sol.action}</span>
                        <span className="text-slate-400 text-[9px] block leading-tight">{sol.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
