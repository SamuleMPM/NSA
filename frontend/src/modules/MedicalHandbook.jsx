import React, { useState } from 'react';
import {
  BookOpen,
  Radiation,
  Users,
  Compass,
  Gauge,
  ShieldAlert,
  Heart,
  Eye,
  Brain,
  Wind,
  Apple,
  Bone,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Radio,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import ModuleHeader from '../components/ui/ModuleHeader';

const HAZARDS_DATA = [
  {
    id: 'radiation',
    letter: 'R',
    title: 'Radiación Espacial (Space Radiation)',
    subtitle: 'Rayos Cósmicos Galácticos (GCR) y Eventos de Partículas Solares (SPE)',
    icon: Radiation,
    color: '#FB7185',
    whyItHappens: 'Fuera del escudo magnético y atmosférico de la Tierra, la radiación ionizante de alta energía atraviesa el fuselaje de la nave a dosis 100 veces mayores que en la superficie terrestre.',
    healthImpact: 'Daño en el ADN celular, cataratas precoces en cristalino, rigidez endotelial cardiovascular y supresión inmunitaria de células T.',
    usefulMetrics: 'Dosimetría ambiental (µSv/h), dosis acumulada (mSv), recuento leucocitario y enzimas de estrés oxidativo.',
    whenToWorry: 'Tasas superiores a 100 µSv/h indican inicio de un Evento de Partículas Solares (tormenta solar) que requiere refugio inmediato.',
    countermeasures: 'Moverse al refugio central rodeado de tanques de agua y alimentos; ingerir antioxidantes y radioprotectores orales prescritos.',
  },
  {
    id: 'isolation',
    letter: 'I',
    title: 'Aislamiento y Confinamiento (Isolation & Confinement)',
    subtitle: 'Salud Mental, Ritmo Circadiano y Cohesión de Tripulación',
    icon: Users,
    color: '#A78BFA',
    whyItHappens: 'Vivir durante meses o años en un volumen hermético reducido con las mismas personas, sin luz solar natural ni contacto en vivo con seres queridos.',
    healthImpact: 'Trastornos del sueño REM, fatiga crónica, desincronización circadiana, irritabilidad, ansiedad de confinamiento y disminución del tiempo de reacción.',
    usefulMetrics: 'Horas y calidad de sueño (actigrafía), escala de estado de ánimo PANAS, variabilidad de frecuencia cardíaca (HRV) y nivel de cortisol.',
    whenToWorry: 'Menos de 5.5 horas de sueño por 3 días seguidos o niveles de estrés sostenidos > 60% con apatía o aislamiento comunicativo.',
    countermeasures: 'Protocolos de luz circadiana en camarotes (luz azul diurna, ámbar nocturna), sesiones de realidad virtual terrestre, mindfulness y rebalance de turnos.',
  },
  {
    id: 'distance',
    letter: 'D',
    title: 'Distancia de la Tierra (Distance from Earth)',
    subtitle: 'Autonomía Médica frente a Retardos de 14 a 22 Minutos',
    icon: Compass,
    color: '#38BDF8',
    whyItHappens: 'En viaje a Marte, la distancia alcanza 400 millones de kilómetros. Las señales de radio tardan hasta 22 minutos en llegar a Houston y otros 22 min en volver.',
    healthImpact: 'Imposibilidad de evacuación médica de emergencia o consulta en vivo durante crisis agudas. El astronauta debe autodiagnosticarse y tratarse con herramientas de a bordo.',
    usefulMetrics: 'Índice de preparación autónoma del software de salud, stock de fármacos estables y tiempo de respuesta ante alertas.',
    whenToWorry: 'Cualquier anomalía de inicio agudo (hipoxia, arritmia, síncope) no puede esperar respuesta de Tierra; se debe actuar según los algoritmos locales.',
    countermeasures: 'Utilizar este software de monitorización para seguir los protocolos paso a paso y registrar las acciones en el paquete diferido para Flight Surgeons.',
  },
  {
    id: 'gravity',
    letter: 'G',
    title: 'Campos Gravitatorios Alterados (Gravity Fields)',
    subtitle: 'Microgravedad (0g), Gravedad Lunar (0.16g) y Marciana (0.38g)',
    icon: Gauge,
    color: '#22D3EE',
    whyItHappens: 'La ausencia continuada de atracción gravitatoria elimina la carga mecánica sobre el esqueleto y redistribuye los líquidos del cuerpo.',
    healthImpact: 'Pérdida de densidad ósea (osteopenia de 1-1.5%/mes en fémur y columna), atrofia muscular, desplazamiento cefálico de 2L de sangre, y Síndrome Neuro-Ocular SANS.',
    usefulMetrics: 'Presión arterial, ecografía de la vaina del nervio óptico (ONSD), espesor muscular por ultrasonido y tasa estimada de pérdida ósea.',
    whenToWorry: 'ONSD > 5.8 mm (edema papilar SANS), pérdida de agudeza visual cercana o hipotensión severa al volver a gravedad.',
    countermeasures: '2 horas de ejercicio diario con ARED (pesas de vacío) y cinta T2; uso de traje de vacío inferior Chibis (LBNP) para descongestionar la cabeza.',
  },
  {
    id: 'environment',
    letter: 'E',
    title: 'Entornos Cerrados y Hostiles (Hostile Closed Environments)',
    subtitle: 'Hábitat Hermético, CO2, Microbios Reciclados y Polvillo Lunar/Marciano',
    icon: ShieldAlert,
    color: '#34D399',
    whyItHappens: 'La atmósfera, el agua y los residuos se reciclan en circuito cerrado dentro de la nave o estación. El regolito abrasivo exterior puede contaminar la cabina.',
    healthImpact: 'Hipercapnia (cefaleas por acumulación de CO2), irritación bronquial por partículas de regolito, alergias cutáneas y alteraciones en la flora intestinal.',
    usefulMetrics: 'pCO2 capilar y ambiental, saturación SpO2, temperatura corporal y niveles de glucosa en sangre.',
    whenToWorry: 'CO2 en hábitat > 4.5 mmHg con cefalea frontal persistente, o SpO2 < 92% con tos seca post-EVA.',
    countermeasures: 'Verificar lechos absorbedores de CO2 (LiOH/Amine Bed), reemplazar filtros HEPA de regolito y calibrar el caudal de ventilación en los camarotes.',
  },
];

const SIMPLE_GUIDES = [
  {
    id: 'bp_guide',
    title: '¿Cómo y por qué medir la Presión Arterial en el espacio?',
    icon: Heart,
    color: '#FB7185',
    whyNecessary: 'En la Tierra, la gravedad tira de la sangre hacia los pies. En microgravedad, 1.5 a 2 litros de sangre suben al tórax y a la cabeza ("efecto cara de luna llena"), elevando temporalmente la presión central.',
    howToMeasure: 'Colóquese el manguito inflable en el brazo izquierdo a la altura del corazón. Asegúrese de estar anclado a la pared con cinchas para evitar flotar o tensar los músculos involuntariamente.',
    interpretation: 'Lo normal es 110-120 mmHg de sistólica y 70-80 mmHg de diastólica. Si supera 140/90 mmHg, reduzca la sal, aumente la hidratación y verifique con el mapa corporal.',
  },
  {
    id: 'glucose_guide',
    title: '¿Por qué la Glucosa en Sangre cambia en órbita?',
    icon: Apple,
    color: '#FBBF24',
    whyNecessary: 'La falta de uso muscular contra la gravedad disminuye la sensibilidad a la insulina, similar a una prediabetes temporal. Además, el estrés metabólico del viaje altera la absorción intestinal.',
    howToMeasure: 'Utilice la microlanceta con cartucho capilar cerrado. En microgravedad, el cartucho absorbe la gota por capilaridad para que no flote por la cabina. Rango normal: 70 a 110 mg/dL en ayunas.',
    interpretation: 'Valores menores a 65 mg/dL causan mareo y temblores (coma una barra de glucosa rápida). Valores superiores a 140 mg/dL requieren ejercicio aeróbico en cicloergómetro y ajuste dietético.',
  },
  {
    id: 'sans_guide',
    title: '¿Cómo hacer un examen de Ultrasonido Ocular (SANS)?',
    icon: Eye,
    color: '#22D3EE',
    whyNecessary: 'El Síndrome Neuro-Ocular Asociado a Vuelos Espaciales (SANS) ocurre cuando el líquido cefalorraquídeo presiona la parte posterior de los ojos, pudiendo dañar la vista permanentemente.',
    howToMeasure: 'Aplique una pequeña cantidad de gel acuoso estéril en el transductor de ultrasonido de alta frecuencia. Apóyelo suavemente sobre el párpado cerrado sin ejercer presión sobre el globo ocular.',
    interpretation: 'Mida la vaina del nervio óptico a 3 mm detrás de la retina. Si mide menos de 5.4 mm es completamente normal. Si supera 5.8 mm, aplique de inmediato 45 min de traje de presión negativa Chibis LBNP.',
  },
  {
    id: 'sleep_guide',
    title: 'Higiene del Sueño en Microgravedad: ¿Cómo descansar bien?',
    icon: Brain,
    color: '#A78BFA',
    whyNecessary: 'Al dar una vuelta a la Tierra cada 90 minutos se ven 16 amaneceres al día, lo que destruye el reloj biológico. Además, en gravedad cero se duerme suspendido en una bolsa sujeta a la pared.',
    howToMeasure: 'Lleve siempre la pulsera de actigrafía en la muñeca durante las 8 horas de sueño asignadas. El software registrará si tuvo despertares o interrupciones de sueño profundo.',
    interpretation: 'Dormir menos de 6 horas deteriora la capacidad de cálculo y respuesta ante emergencias. Dos horas antes de dormir, apague las luces azules y use el modo nocturno ámbar de las pantallas.',
  },
];

export default function MedicalHandbook() {
  const [activeTab, setActiveTab] = useState('hazards'); // hazards, guides, decision_tree
  const [selectedHazardId, setSelectedHazardId] = useState('gravity');
  const [expandedGuideId, setExpandedGuideId] = useState('bp_guide');
  const [searchQuery, setSearchQuery] = useState('');

  const activeHazard = HAZARDS_DATA.find((h) => h.id === selectedHazardId) || HAZARDS_DATA[3];

  return (
    <div className="space-y-5">
      <ModuleHeader
        code="MOD-06"
        kicker="CLEAR INSTRUCTIONS FOR ASTRONAUTS"
        title="Manual Médico de Vuelo Artemis y Guía de los 5 Riesgos (NASA HRP)"
        description="Instrucciones sencillas y directas sin jerga médica pesada para que la tripulación comprenda los riesgos espaciales, aprenda a medirse y actúe con autonomía."
        icon={BookOpen}
      />

      {/* Pestañas de Navegación del Manual */}
      <div className="panel flex flex-wrap gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => setActiveTab('hazards')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-semibold transition ${
              activeTab === 'hazards'
                ? 'bg-telemetry-cyan/20 text-cyan-300 border border-telemetry-cyan/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'bg-space-850 text-slate-400 hover:text-white border border-space-800'
            }`}
          >
            <Radiation className="h-4 w-4 text-rose-400" />
            <span>1. Los 5 Riesgos de la NASA (RIDGE)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guides')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-semibold transition ${
              activeTab === 'guides'
                ? 'bg-telemetry-violet/20 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(167,139,250,0.25)]'
                : 'bg-space-850 text-slate-400 hover:text-white border border-space-800'
            }`}
          >
            <Info className="h-4 w-4 text-amber-400" />
            <span>2. Guía Sencilla de Mediciones en el Espacio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('decision_tree')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-xs font-semibold transition ${
              activeTab === 'decision_tree'
                ? 'bg-telemetry-green/20 text-emerald-300 border border-telemetry-green/50 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                : 'bg-space-850 text-slate-400 hover:text-white border border-space-800'
            }`}
          >
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>3. Matriz de Decisión: Autonomía vs Tierra (14 min delay)</span>
          </button>
      </div>

      {/* Contenido según Pestaña */}
      {activeTab === 'hazards' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Selector de los 5 Riesgos RIDGE (Lado Izquierdo: 4 columnas) */}
          <div className="space-y-2 lg:col-span-4">
            <span className="font-mono text-xs font-bold uppercase text-slate-400">
              Acrónimo RIDGE de la NASA:
            </span>
            <div className="space-y-2">
              {HAZARDS_DATA.map((hazard) => {
                const isSelected = selectedHazardId === hazard.id;
                const IconComp = hazard.icon;

                return (
                  <button
                    key={hazard.id}
                    type="button"
                    onClick={() => setSelectedHazardId(hazard.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                      isSelected
                        ? 'border-cyan-400 bg-space-800 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'border-space-800 bg-space-900/80 text-slate-400 hover:border-space-700 hover:text-white'
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-base font-extrabold border"
                      style={{
                        borderColor: `${hazard.color}50`,
                        backgroundColor: `${hazard.color}20`,
                        color: hazard.color,
                      }}
                    >
                      {hazard.letter}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">{hazard.title.split('(')[0]}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{hazard.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ficha Explicativa del Riesgo Seleccionado (Lado Derecho: 8 columnas) */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-space-800 bg-space-900/95 p-6 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-3 border-b border-space-800 pb-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl border"
                  style={{
                    borderColor: `${activeHazard.color}50`,
                    backgroundColor: `${activeHazard.color}20`,
                    color: activeHazard.color,
                  }}
                >
                  <activeHazard.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-mono text-xs font-bold uppercase text-cyan-300">
                    NASA HUMAN RESEARCH PROGRAM · RIESGO "{activeHazard.letter}"
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">{activeHazard.title}</h3>
                </div>
              </div>

              {/* ¿Por qué ocurre en el espacio? */}
              <div className="rounded-xl border border-space-800 bg-space-850/60 p-4">
                <span className="text-xs font-bold text-slate-200">1. ¿Por qué ocurre esto en el espacio?</span>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{activeHazard.whyItHappens}</p>
              </div>

              {/* Impacto en la Salud */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <span className="text-xs font-bold text-rose-300">2. ¿Cómo afecta al cuerpo humano?</span>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{activeHazard.healthImpact}</p>
              </div>

              {/* Mediciones a realizar */}
              <div className="rounded-xl border border-space-800 bg-space-850/60 p-4">
                <span className="text-xs font-bold text-cyan-300">3. ¿Qué mediciones debemos realizar para detectarlo?</span>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{activeHazard.usefulMetrics}</p>
              </div>

              {/* ¿Cuándo preocuparse? */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <span>4. ¿Cuándo requiere atención inmediata de la tripulación?</span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{activeHazard.whenToWorry}</p>
              </div>

              {/* Contramedidas prácticas */}
              <div className="rounded-xl border border-telemetry-green/30 bg-telemetry-green/10 p-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-telemetry-green">
                  <Sparkles className="h-4 w-4" />
                  <span>5. ¿Qué medidas tomar para prevenir o tratar una afección crítica?</span>
                </div>
                <p className="mt-1 text-xs text-slate-200 leading-relaxed">{activeHazard.countermeasures}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'guides' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SIMPLE_GUIDES.map((guide) => {
              const isExpanded = expandedGuideId === guide.id;
              const IconComp = guide.icon;

              return (
                <div
                  key={guide.id}
                  className="rounded-2xl border border-space-800 bg-space-900/90 p-5 shadow-lg backdrop-blur-md transition hover:border-space-700 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                      style={{
                        borderColor: `${guide.color}40`,
                        backgroundColor: `${guide.color}15`,
                        color: guide.color,
                      }}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-white">{guide.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1 text-xs">
                    <div className="rounded-lg bg-space-850/70 p-3">
                      <span className="font-semibold text-cyan-300">¿Por qué es necesario este examen?</span>
                      <p className="mt-1 text-slate-300 leading-relaxed">{guide.whyNecessary}</p>
                    </div>

                    <div className="rounded-lg bg-space-850/70 p-3">
                      <span className="font-semibold text-amber-300">¿Cómo medirlo correctamente en microgravedad?</span>
                      <p className="mt-1 text-slate-300 leading-relaxed">{guide.howToMeasure}</p>
                    </div>

                    <div className="rounded-lg bg-space-850/70 p-3">
                      <span className="font-semibold text-telemetry-green">Interpretación y Acción Rápida:</span>
                      <p className="mt-1 text-slate-300 leading-relaxed">{guide.interpretation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'decision_tree' && (
        <div className="rounded-2xl border border-space-800 bg-space-900/95 p-6 shadow-xl backdrop-blur-xl space-y-5">
          <div>
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              Matriz de Autonomía Médica: ¿Cuándo actuar solo vs Cuándo reportar a Houston?
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              En misiones a Marte, el retardo de radio es de 14.5 a 22 minutos de ida (hasta 44 minutos ida y vuelta). Los astronautas no pueden esperar a que la Tierra responda ante una emergencia fisiológica.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Nivel Verde: Nominal */}
            <div className="rounded-xl border border-telemetry-green/40 bg-telemetry-green/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-telemetry-green">
                <CheckCircle2 className="h-4 w-4" />
                <span>NIVEL 1: NOMINAL / RUTINA</span>
              </div>
              <p className="text-xs text-slate-300">
                Constantes en rango óptimo: HR 60-100 bpm, SpO2 &gt;95%, PA &lt;130/85, glucosa 70-110 mg/dL.
              </p>
              <div className="rounded bg-space-950/60 p-2 font-mono text-[11px] text-slate-300">
                <span className="font-bold text-telemetry-green">Acción:</span> Continuar tareas regulares y rutina de 2h ARED. Reporte en telemetría rutinaria sin alarma.
              </div>
            </div>

            {/* Nivel Amarillo: Atención Temprana */}
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>NIVEL 2: ATENCIÓN PREVENTIVA</span>
              </div>
              <p className="text-xs text-slate-300">
                Desviaciones leves: PA 135/88, ONSD 5.5-5.7 mm (posible SANS), glucosa 125 mg/dL, o fatiga con &lt;6h sueño.
              </p>
              <div className="rounded bg-space-950/60 p-2 font-mono text-[11px] text-slate-300">
                <span className="font-bold text-amber-300">Acción:</span> Aplicar contramedida autónoma (LBNP Chibis, siesta circadiana, rehidratación). Enviar reporte diferido a Houston.
              </div>
            </div>

            {/* Nivel Rojo: Alerta Médica Crítica */}
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-4 space-y-2.5">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-rose-400">
                <ShieldAlert className="h-4 w-4" />
                <span>NIVEL 3: EMERGENCIA CRÍTICA</span>
              </div>
              <p className="text-xs text-slate-300">
                Peligro inminente: SpO2 &lt;90% (hipoxia de escafandra), HR &gt;130 bpm o &lt;45 bpm, Temp &gt;38.5°C o ONSD &gt;5.9 mm.
              </p>
              <div className="rounded bg-space-950/60 p-2 font-mono text-[11px] text-slate-300">
                <span className="font-bold text-rose-400">Acción:</span> Ejecutar protocolo de soporte vital de inmediato en la cabina. Transmitir paquete telemétrico de alta prioridad a Houston sin esperar respuesta para actuar.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
