import React, { useState } from 'react';
import {
  Brain,
  Eye,
  Heart,
  Wind,
  Apple,
  Bone,
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
  Compass,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Smile,
  HelpCircle,
  Play,
  Check,
  Layers,
  ShieldCheck,
  Bot,
  UserCheck,
} from 'lucide-react';
import Astronaut3DViewer from './Astronaut3DViewer';
import StatusPill from './ui/StatusPill';

// Definición de las regiones anatómicas interactivas, su correlación con los 5 Riesgos de la NASA (RIDGE)
// y explicaciones humanas, comprensibles y empáticas para el astronauta.
const ANATOMICAL_SYSTEMS = [
  {
    id: 'brain',
    name: 'Cerebro y Salud Mental',
    category: 'Neurológico / Cognitivo',
    icon: Brain,
    color: '#A78BFA',
    coordinates: { x: 50, y: 11 },
    friendlyTitle: 'Tu Mente, Enfoque y Ritmo de Sueño',
    friendlySummary: 'Tu centro de mando cognitivo. En misiones largas, el confinamiento y los 16 amaneceres al día pueden desorientar tu reloj biológico.',
    metrics: [
      { label: 'Estrés Percibido', key: 'stress', unit: '%', normal: '0 - 35%', friendlyMeaning: 'Nivel de calma y relajación' },
      { label: 'Horas de Descanso', key: 'sleep', unit: 'hrs', normal: '7.0 - 8.5h', friendlyMeaning: 'Sueño reparador acumulado' },
      { label: 'Agilidad Mental', key: 'cognitive', unit: '/100', normal: '> 85', friendlyMeaning: 'Velocidad de cálculo y reflejos' },
    ],
    functionDesc: 'Regulación del ciclo circadiano, toma de decisiones rápidas, control motor y bienestar emocional.',
    hazardImpact: {
      hazard: 'I — Aislamiento y Confinamiento + D — Distancia de la Tierra',
      detail: 'El aislamiento prolongado en volúmenes pequeños y no poder ver la Tierra directamente provocan insomnio y fatiga mental si no se cuida la rutina.'
    },
    symptomsToWatch: [
      'Dificultad para conciliar el sueño en el camarote',
      'Sensación de mente cansada o lentitud en listas de verificación',
      'Irritabilidad o deseos de aislarse de los compañeros'
    ],
    astroDocTip: 'Si sientes la cabeza pesada, activa el modo nocturno ámbar de las pantallas 2 horas antes de dormir y haz 15 minutos de respiración guiada.',
    countermeasure: {
      title: 'Terapia Circadiana & Mindfulness en 0g',
      action: 'Ajustar la iluminación del camarote al espectro azul matutino (460 nm) para despertar con energía, y programar 15 min de relajación con sonidos terrestres.',
      buttonLabel: 'Activar Modo Circadiano Relajante'
    }
  },
  {
    id: 'eyes',
    name: 'Ojos y Visión (SANS)',
    category: 'Oftalmológico / Neuro-Ocular',
    icon: Eye,
    color: '#22D3EE',
    coordinates: { x: 50, y: 15 },
    friendlyTitle: 'Tus Ojos y Síndrome SANS',
    friendlySummary: 'En ingravidez, los líquidos suben a la cabeza y pueden empujar suavemente la parte de atrás de tus ojos, alterando la visión de cerca.',
    metrics: [
      { label: 'Diámetro Vaina Óptica', key: 'onsd', unit: 'mm', normal: '4.5 - 5.4 mm', friendlyMeaning: 'Grosor detrás del ojo (ONSD)' },
      { label: 'Enfoque de Cerca', key: 'acuity', unit: '20/20', normal: 'Nominal', friendlyMeaning: 'Nitidez al leer la consola' },
      { label: 'Presión en Ojos', key: 'iop', unit: 'mmHg', normal: '10 - 21 mmHg', friendlyMeaning: 'Presión interna del ojo' },
    ],
    functionDesc: 'Enfoque de pantallas en cabina, lectura de manuales y protección ante luz solar sin filtro atmosférico.',
    hazardImpact: {
      hazard: 'G — Gravedad Alterada (Microgravedad)',
      detail: 'Sin gravedad que atraiga la sangre hacia los pies, casi 2 litros de líquido se acumulan en el tórax y cráneo, aplanando levemente la retina (SANS).'
    },
    symptomsToWatch: [
      'Tener que alejar la tableta o el manual para leer letras pequeñas',
      'Ver pequeños halos luminosos o manchas tenues al parpadear',
      'Dolor leve o sensación de presión detrás de los ojos'
    ],
    astroDocTip: 'Un chequeo rápido con el ecógrafo ocular toma solo 2 minutos. Si notas vista borrosa, no te asustes: el traje Chibis LBNP te devolverá los líquidos a las piernas.',
    countermeasure: {
      title: 'Prenda de Presión Negativa Chibis (LBNP)',
      action: 'Colocar el traje de succión en piernas por 45 min a -35 mmHg para redistribuir la sangre hacia la mitad inferior del cuerpo y aliviar la presión en tus ojos.',
      buttonLabel: 'Iniciar Descompresión Ocular LBNP'
    }
  },
  {
    id: 'heart',
    name: 'Sistema Cardiovascular',
    category: 'Hemodinámico / Central',
    icon: Heart,
    color: '#FB7185',
    coordinates: { x: 47, y: 28 },
    friendlyTitle: 'Tu Corazón y Circulación Sanguínea',
    friendlySummary: 'El motor principal de tu cuerpo. En gravedad cero no le cuesta esfuerzo bombear hacia arriba, por lo que debemos entrenarlo a diario para que no se debilite.',
    metrics: [
      { label: 'Pulso Cardíaco', key: 'heart_rate', unit: 'bpm', normal: '60 - 100 bpm', friendlyMeaning: 'Latidos por minuto' },
      { label: 'Presión Arterial', key: 'blood_pressure', unit: 'mmHg', normal: '110-120 / 70-80', friendlyMeaning: 'Fuerza de bombeo arterial' },
      { label: 'Flujo Sanguíneo', key: 'cardiac_output', unit: 'L/min', normal: '4.5 - 6.0 L/min', friendlyMeaning: 'Litros de sangre por minuto' },
    ],
    functionDesc: 'Llevar oxígeno y nutrientes a cada célula, regular el calor del cuerpo y mantenerte con energía para las maniobras.',
    hazardImpact: {
      hazard: 'G — Gravedad Cero + R — Radiación Espacial',
      detail: 'Al no tener que luchar contra el peso del cuerpo, el corazón tiende a volverse un poco más perezoso y pequeño si no hacemos ejercicio resistivo y aeróbico constante.'
    },
    symptomsToWatch: [
      'Palpitaciones aceleradas mientras descansas',
      'Mareo repentino al incorporarte de la litera flotante',
      'Sensación de fatiga rápida al hacer tareas en la escafandra'
    ],
    astroDocTip: '¡Tu corazón se mantiene joven haciendo intervalos de carrera en la cinta T2! Hidrátate bien con electrolitos antes de cada sesión.',
    countermeasure: {
      title: 'Entrenamiento Cardiovascular Interválico T2',
      action: 'Realizar 30 minutos de pedaleo o cinta rodante con arnés de carga para estimular la fuerza de bombeo del corazón y proteger las arterias.',
      buttonLabel: 'Iniciar Rutina Cardiovascular T2'
    }
  },
  {
    id: 'lungs',
    name: 'Sistema Pulmonar y Respiración',
    category: 'Intercambio Gaseoso / ECLSS',
    icon: Wind,
    color: '#38BDF8',
    coordinates: { x: 53, y: 31 },
    friendlyTitle: 'Tus Pulmones y el Aire del Hábitat',
    friendlySummary: 'Tus pulmones limpian tu sangre con el oxígeno generado por el soporte vital de la nave. Cuidado con el CO2 que exhalas, ya que en 0g no sube ni baja solo.',
    metrics: [
      { label: 'Oxígeno en Sangre', key: 'spo2', unit: '%', normal: '95 - 100%', friendlyMeaning: 'Oxigenación capilar (SpO2)' },
      { label: 'Respiraciones / min', key: 'respiratory_rate', unit: 'rpm', normal: '12 - 20 rpm', friendlyMeaning: 'Ritmo respiratorio normal' },
      { label: 'Dióxido de Carbono', key: 'co2', unit: 'mmHg', normal: '35 - 45 mmHg', friendlyMeaning: 'CO2 en sangre' },
    ],
    functionDesc: 'Oxigenar el cuerpo, expulsar el dióxido de carbono y proteger los bronquios de cualquier polvillo en suspensión.',
    hazardImpact: {
      hazard: 'E — Entorno Cerrado y Hostil',
      detail: 'Sin ventiladores encendidos, el CO2 exhalado forma una nube invisible alrededor de tu cara mientras duermes, causando dolor de cabeza matutino.'
    },
    symptomsToWatch: [
      'Dolor de cabeza sordo en la frente (indicio de CO2 acumulado)',
      'Sensación de falta de aire o respiración agitada sin motivo',
      'Tos seca o cosquilleo tras quitarte el traje de paseo exterior'
    ],
    astroDocTip: 'Revisa siempre que el ventilador de tu camarote tenga flujo constante de aire fresco. Si te duele la cabeza, purga el aire de tu espacio personal.',
    countermeasure: {
      title: 'Verificación de Ventilación y Depurador ECLSS',
      action: 'Aumentar el caudal del ventilador de cabina y comprobar que los filtros de CO2 (LiOH / MetOx) estén al 100% de eficiencia operativa.',
      buttonLabel: 'Comprobar Purificación de Aire'
    }
  },
  {
    id: 'metabolism',
    name: 'Metabolismo, Nutrición y Glucosa',
    category: 'Endocrino / Nutricional',
    icon: Apple,
    color: '#FBBF24',
    coordinates: { x: 50, y: 44 },
    friendlyTitle: 'Tu Energía, Digestión y Glucosa',
    friendlySummary: 'En el espacio tus músculos consumen el azúcar de forma diferente, y tu estómago digiere los alimentos un poco más despacio por falta de gravedad.',
    metrics: [
      { label: 'Azúcar en Sangre', key: 'glucose', unit: 'mg/dL', normal: '70 - 110 mg/dL', friendlyMeaning: 'Nivel de glucosa capilar' },
      { label: 'Gasto de Energía', key: 'metabolism_mode', unit: 'W', normal: '85 - 110 W', friendlyMeaning: 'Calorías quemadas en reposo' },
      { label: 'Agua Diaria', key: 'hydration', unit: 'L/día', normal: '2.5 - 3.2 L', friendlyMeaning: 'Líquido bebido hoy' },
    ],
    functionDesc: 'Transformar las raciones de comida espacial en energía constante, mantener equilibrada la insulina y nutrirte.',
    hazardImpact: {
      hazard: 'G — Gravedad Cero + E — Entornos Cerrados',
      detail: 'La microgravedad reduce la respuesta natural a la insulina, lo que puede causar subidas de glucosa tras comer y sensación de pesadez.'
    },
    symptomsToWatch: [
      'Ganas repentinas de dormir tras comer (pico de azúcar)',
      'Boca seca o sed constante',
      'Digestión lenta o sensación de comida estancada en el estómago'
    ],
    astroDocTip: 'Come despacio y mastica muy bien. Incluye siempre la bolsa de frutos secos y carbohidratos de asimilación lenta para mantener tu energía estable.',
    countermeasure: {
      title: 'Ajuste de Ración y Control Glucémico',
      action: 'Seleccionar alimentos de bajo índice glucémico con fibra soluble y beber 300 ml de sales de rehidratación antes de las tareas de mantenimiento.',
      buttonLabel: 'Registrar Ración Saludable'
    }
  },
  {
    id: 'skeleton',
    name: 'Huesos, Columna y Músculos',
    category: 'Musculoesquelético / Fuerza',
    icon: Bone,
    color: '#F472B6',
    coordinates: { x: 44, y: 64 },
    friendlyTitle: 'Tus Huesos y Fortaleza Muscular',
    friendlySummary: 'Al flotar, tu cuerpo cree que ya no necesita huesos duros y empieza a perder calcio. Por eso el ejercicio de fuerza en el ARED es tu armadura.',
    metrics: [
      { label: 'Pérdida Ósea Mensual', key: 'bone_loss', unit: '%/mes', normal: '< 0.35 %', friendlyMeaning: 'Pérdida de calcio en fémur' },
      { label: 'Fuerza Muscular', key: 'muscle_tone', unit: '%', normal: '> 90 %', friendlyMeaning: 'Fuerza en piernas y gemelos' },
      { label: 'Entrenamiento ARED', key: 'ared_compliance', unit: 'min', normal: '120 min/día', friendlyMeaning: 'Minutos de pesas hoy' },
    ],
    functionDesc: 'Sostener tu cuerpo, proteger tu médula espinal y permitirte moverte con agilidad tanto en la nave como en la superficie lunar o marciana.',
    hazardImpact: {
      hazard: 'G — Campos Gravitatorios Alterados (0g)',
      detail: 'Sin 2 horas de ejercicio diario con pesas de vacío (ARED), un astronauta puede perder hasta un 1.2% de hueso cada mes en el espacio.'
    },
    symptomsToWatch: [
      'Dolor lumbar al despertar (tu columna se estira hasta 5 cm al no haber gravedad)',
      'Sentir las piernas temblorosas al apoyar el pie en una superficie con agarre',
      'Dolor en la zona de los riñones (posible arenilla por calcio liberado de los huesos)'
    ],
    astroDocTip: '¡El ejercicio en ARED es sagrado! Con 120 minutos de sentadillas y peso muerto en vacío, mantendrás tus huesos tan fuertes como en la Tierra.',
    countermeasure: {
      title: 'Sesión de Resistencia ARED (120 min)',
      action: 'Completar la tabla de sentadillas, levantamiento de talones y peso muerto aplicando hasta 200 kg de resistencia por cilindros de vacío.',
      buttonLabel: 'Iniciar Entrenamiento ARED (+150 pts)'
    }
  },
  {
    id: 'immune',
    name: 'Defensas e Inmunidad (Piel y Sangre)',
    category: 'Inmunológico / Piel',
    icon: Shield,
    color: '#34D399',
    coordinates: { x: 50, y: 52 },
    friendlyTitle: 'Tus Defensas Naturales y Piel',
    friendlySummary: 'Tus glóbulos blancos te protegen de microbios y virus dormidos. La radiación cósmica y el estrés pueden bajarte las defensas si no descansas.',
    metrics: [
      { label: 'Glóbulos Blancos', key: 'wbc', unit: 'k/µL', normal: '4.5 - 11.0', friendlyMeaning: 'Células de defensa en sangre' },
      { label: 'Radiación Cósmica', key: 'radiation_dose', unit: 'mSv', normal: '< 250 mSv', friendlyMeaning: 'Dosis total acumulada' },
      { label: 'Salud de la Piel', key: 'skin_health', unit: 'Status', normal: 'Intacta', friendlyMeaning: 'Sin roces de escafandra' },
    ],
    functionDesc: 'Protegerte de infecciones, cicatrizar pequeños rasguños y mantener a raya virus que todos tenemos dormidos en el cuerpo.',
    hazardImpact: {
      hazard: 'R — Radiación Espacial + I — Aislamiento',
      detail: 'La radiación del espacio profundo y el cortisol del estrés debilitan los linfocitos, permitiendo que aparezcan herpes labiales o eccemas con más facilidad.'
    },
    symptomsToWatch: [
      'Picor, rojez o sarpullido en zonas donde ajusta la escafandra',
      'Aparición de pequeñas llagas en la boca o calenturas labiales',
      'Tardar más de lo normal en cicatrizar un pequeño corte en un dedo'
    ],
    astroDocTip: 'Toma a diario tu cápsula de vitamina D3 y antioxidantes. Limpia bien tu piel tras el traje con toallitas hipoalergénicas.',
    countermeasure: {
      title: 'Refuerzo Inmune y Protocolo Antioxidante',
      action: 'Tomar la dosis pautada de vitamina D3 (2000 UI), polifenoles antioxidantes y aplicar crema regeneradora en las zonas de fricción del traje.',
      buttonLabel: 'Aplicar Suplementación Inmune'
    }
  }
];

// Preguntas frecuentes y sensaciones comunes para la ayuda amigable de AstroDoc
const COMMON_ASTRONAUT_FEELINGS = [
  {
    id: 'congested',
    emoji: '🤕',
    short: 'Siento congestión en la cabeza',
    organId: 'eyes',
    docReply: '¡Es completamente normal, Neil! En gravedad cero no hay peso que tire de la sangre hacia abajo, así que casi 2 litros de líquidos suben a tu pecho y cabeza (el famoso "efecto cara de luna llena"). Usar el traje de vacío inferior Chibis por 30 minutos redirigirá esos líquidos hacia tus piernas y te aliviará enseguida.',
  },
  {
    id: 'vision',
    emoji: '👁️',
    short: 'Me cuesta leer de cerca en la consola',
    organId: 'eyes',
    docReply: 'No te preocupes. Esa molestia es común y se debe al síndrome SANS: los líquidos acumulados aplanan ligeramente el fondo de tus ojos. Vamos a programar una ecografía rápida de la vaina del nervio óptico y mientras tanto puedes usar las gafas de aumento espacial de tu taquilla.',
  },
  {
    id: 'heavy_legs',
    emoji: '🦵',
    short: 'Siento las piernas débiles o flojas',
    organId: 'skeleton',
    docReply: 'Tus músculos están descansando demasiado al flotar en 0g. Al no caminar, las fibras antigravitatorias de tus cuádriceps se relajan. ¡Hoy tocan 45 minutos de sentadillas en el ARED! Verás cómo recuperas el tono muscular de inmediato y sumas 150 Bio-Créditos.',
  },
  {
    id: 'sleep_issue',
    emoji: '🛌',
    short: 'Me costó conciliar el sueño anoche',
    organId: 'brain',
    docReply: 'El zumbido constante de los ventiladores y no tener cama con peso pueden dificultar el sueño. Ajustaremos las luminarias de tu camarote al espectro ámbar relajante 2 horas antes de tu hora de dormir y activaremos el modo de ruido blanco suave.',
  },
  {
    id: 'great',
    emoji: '🚀',
    short: '¡Me siento con mucha energía y al 100%!',
    organId: 'heart',
    docReply: '¡Fantásticas noticias! Tus signos vitales y oxigenación celular están en un nivel óptimo. Mantén esa racha de hidratación y ejercicio para seguir liderando la misión con éxito.',
  },
];

export default function InteractiveBodyMap({
  currentSample = {},
  selectedAstronaut = {},
  onApplyCountermeasure,
  envInfo = {},
}) {
  const [activeSystemId, setActiveSystemId] = useState('heart');
  const [view3DMode, setView3DMode] = useState('xray'); // 'suit', 'xray', 'organs'
  const [displayMode, setDisplayMode] = useState('3d'); // '3d' o '2d'
  const [guidedTourStep, setGuidedTourStep] = useState(null); // null o número de paso
  const [astroDocMessage, setAstroDocMessage] = useState(null);
  const [notification, setNotification] = useState(null);

  const activeSystem = ANATOMICAL_SYSTEMS.find((s) => s.id === activeSystemId) || ANATOMICAL_SYSTEMS[2];

  // Evaluar estado con semáforo amigable
  const getSystemStatus = (systemId) => {
    if (systemId === 'heart') {
      const hr = currentSample.heart_rate || 75;
      const sys = currentSample.systolic_bp || 118;
      if (hr > 120 || hr < 50 || sys > 140) return { level: 'alerta', label: 'Requiere Atención', color: '#FB7185', friendly: 'Tomemos una acción juntos' };
      if (hr > 100 || hr < 60 || sys > 128) return { level: 'advertencia', label: 'Atención Preventiva', color: '#FBBF24', friendly: 'Fácil de corregir' };
      return { level: 'normal', label: 'En Perfecto Estado', color: '#34D399', friendly: 'Todo en orden' };
    }
    if (systemId === 'lungs') {
      const spo2 = currentSample.spo2 || 98;
      const rr = currentSample.respiratory_rate || 15;
      if (spo2 < 90 || rr > 24) return { level: 'alerta', label: 'Oxígeno Bajo', color: '#FB7185', friendly: 'Revisa ventilación de cabina' };
      if (spo2 < 95 || rr > 20) return { level: 'advertencia', label: 'Respiración Levemente Agitada', color: '#FBBF24', friendly: 'Respira hondo y calmo' };
      return { level: 'normal', label: 'Oxigenación Excelente', color: '#34D399', friendly: 'Respiración limpia y nominal' };
    }
    if (systemId === 'eyes') {
      const onsd = currentSample.onsd_mm || 4.9;
      if (onsd >= 5.8) return { level: 'alerta', label: 'Presión Ocular Alta (SANS)', color: '#FB7185', friendly: 'Usa traje LBNP hoy' };
      if (onsd >= 5.4) return { level: 'advertencia', label: 'Leve Congestión Ocular', color: '#FBBF24', friendly: 'Monitorear con ecógrafo' };
      return { level: 'normal', label: 'Visión y Retina Estables', color: '#34D399', friendly: 'Sin edema papilar' };
    }
    if (systemId === 'metabolism') {
      const gluc = currentSample.glucose || 92;
      if (gluc > 140 || gluc < 65) return { level: 'alerta', label: 'Desbalance Glucémico', color: '#FB7185', friendly: 'Ajustemos tu ración de comida' };
      if (gluc > 115 || gluc < 72) return { level: 'advertencia', label: 'Glucosa Levemente Variable', color: '#FBBF24', friendly: 'Bebe agua con electrolitos' };
      return { level: 'normal', label: 'Energía y Glucosa Óptimas', color: '#34D399', friendly: 'Metabolismo equilibrado' };
    }
    if (systemId === 'brain') {
      const stress = currentSample.stress_level || 20;
      const sleep = currentSample.sleep_hours || 7.5;
      if (stress > 70 || sleep < 5.5) return { level: 'alerta', label: 'Fatiga / Necesitas Descanso', color: '#FB7185', friendly: 'Prioricemos tu sueño' };
      if (stress > 45 || sleep < 6.5) return { level: 'advertencia', label: 'Cansancio Acumulado', color: '#FBBF24', friendly: 'Haz una pausa de 15 min' };
      return { level: 'normal', label: 'Mente Serena y Enfocada', color: '#34D399', friendly: 'Listo para las tareas' };
    }
    if (systemId === 'skeleton') {
      const loss = currentSample.bone_loss_monthly || 0.28;
      if (loss > 0.9) return { level: 'alerta', label: 'Huesos Necesitan Estímulo', color: '#FB7185', friendly: 'Hora de entrenar en el ARED' };
      if (loss > 0.5) return { level: 'advertencia', label: 'Huesos en Adaptación', color: '#FBBF24', friendly: 'No olvides tus 2h de pesas' };
      return { level: 'normal', label: 'Huesos Fuertes y Protegidos', color: '#34D399', friendly: 'Protegido con ARED' };
    }
    // Inmune
    const temp = currentSample.temperature || 36.6;
    if (temp > 38.0) return { level: 'alerta', label: 'Temperatura Elevada', color: '#FB7185', friendly: 'Revisa traje o descansa' };
    if (temp > 37.3) return { level: 'advertencia', label: 'Leve Calor Corporal', color: '#FBBF24', friendly: 'Bebe agua fresca' };
    return { level: 'normal', label: 'Defensas al 100%', color: '#34D399', friendly: 'Sistema inmune fuerte' };
  };

  const activeStatus = getSystemStatus(activeSystem.id);

  // Ejecutar contramedida
  const handleExecuteCountermeasure = (system) => {
    if (onApplyCountermeasure) {
      onApplyCountermeasure(selectedAstronaut.id || 'ast_001', system.name);
    }
    setNotification(`¡Excelente, ${selectedAstronaut.name || 'astronauta'}! El protocolo "${system.countermeasure.title}" se ha activado y tu cuerpo se está estabilizando.`);
    setTimeout(() => setNotification(null), 5000);
  };

  // Chequeo Guiado en 60 Segundos paso a paso
  const startGuidedTour = () => {
    setGuidedTourStep(0);
    const firstSystem = ANATOMICAL_SYSTEMS[0];
    setActiveSystemId(firstSystem.id);
    setAstroDocMessage(`¡Iniciando tu Chequeo Corporal Rápido, ${selectedAstronaut.name || 'Neil'}! Primero revisemos tu cabeza: ¿cómo te sientes de ánimo y cómo dormiste anoche?`);
  };

  const nextGuidedTourStep = () => {
    if (guidedTourStep === null) return;
    const nextIdx = guidedTourStep + 1;
    if (nextIdx < ANATOMICAL_SYSTEMS.length) {
      setGuidedTourStep(nextIdx);
      const nextSystem = ANATOMICAL_SYSTEMS[nextIdx];
      setActiveSystemId(nextSystem.id);

      if (nextSystem.id === 'eyes') {
        setAstroDocMessage('Paso 2: Ojos y visión. En el espacio la presión detrás de la retina puede aumentar. Tus lecturas de hoy indican que tu nervio óptico está en rango seguro.');
      } else if (nextSystem.id === 'heart') {
        setAstroDocMessage(`Paso 3: Tu corazón late a ${currentSample.heart_rate || 76} pulsaciones por minuto con ritmo perfecto.`);
      } else if (nextSystem.id === 'lungs') {
        setAstroDocMessage(`Paso 4: Pulmones y oxigenación. Tu SpO2 está en ${currentSample.spo2 || 98.4}%, lo cual es ideal.`);
      } else if (nextSystem.id === 'metabolism') {
        setAstroDocMessage(`Paso 5: Glucosa y digestión. Tu nivel de azúcar está estable en ${currentSample.glucose || 92} mg/dL.`);
      } else if (nextSystem.id === 'skeleton') {
        setAstroDocMessage('Paso 6: Huesos y músculos. Recuerda que flotar es divertido, pero tus huesos necesitan el estímulo del ARED hoy.');
      } else {
        setAstroDocMessage('Paso 7: Defensas y piel. Tu temperatura corporal y recuento inmunológico están protegiéndote adecuadamente.');
      }
    } else {
      // Tour finalizado
      setGuidedTourStep(null);
      setAstroDocMessage(`¡Chequeo corporal completado con éxito, ${selectedAstronaut.name || 'Neil'}! Tu estado general es excelente. Tienes luz verde para todas tus actividades programadas.`);
    }
  };

  const cancelGuidedTour = () => {
    setGuidedTourStep(null);
    setAstroDocMessage(null);
  };

  const handleSelectFeeling = (feeling) => {
    setActiveSystemId(feeling.organId);
    setAstroDocMessage(feeling.docReply);
  };

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 1. COMPAÑERO VIRTUAL AMIGABLE DE SALUD (ASTRODOC)       */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-space-950 via-space-900 to-space-950 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            {/* Avatar amigable de AstroDoc */}
            <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-blue-600/30 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
              <Bot className="h-7 w-7 animate-bounce-slow" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-black font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base font-bold text-white">
                  AstroDoc · Asistente Médico de Vuelo Amigable
                </h2>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                  COMPAÑERO DE SALUD 24/7
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
                {astroDocMessage || (
                  <>
                    ¡Hola <strong className="text-white">{selectedAstronaut.name || 'Neil'}</strong>! Estoy aquí para acompañarte en tu misión. Puedes hacer clic en cualquier parte de tu cuerpo en 3D para ver cómo funciona y cómo cuidarte sin complicaciones técnicas.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Botones de acción amigables para el usuario */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {guidedTourStep !== null ? (
              <div className="flex items-center gap-2 rounded-xl bg-cyan-500/20 p-1.5 border border-cyan-500/40">
                <span className="font-mono text-xs font-bold text-cyan-300 px-2">
                  Paso {guidedTourStep + 1} de {ANATOMICAL_SYSTEMS.length}
                </span>
                <button
                  type="button"
                  onClick={nextGuidedTourStep}
                  className="flex items-center gap-1 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-cyan-400 transition"
                >
                  <span>{guidedTourStep + 1 === ANATOMICAL_SYSTEMS.length ? 'Terminar' : 'Siguiente'}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={cancelGuidedTour}
                  className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startGuidedTour}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-heading text-xs font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] transition hover:brightness-110 active:scale-95"
              >
                <Play className="h-4 w-4" />
                <span>Chequeo Corporal en 60 Segundos</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra interactiva: "¿Cómo te sientes en este momento?" */}
        <div className="mt-3.5 border-t border-space-800/80 pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-mono text-xs text-slate-400 shrink-0 flex items-center gap-1.5">
              <Smile className="h-3.5 w-3.5 text-amber-400" />
              ¿Tienes alguna molestia o sensación hoy?
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_ASTRONAUT_FEELINGS.map((feeling) => (
                <button
                  key={feeling.id}
                  type="button"
                  onClick={() => handleSelectFeeling(feeling)}
                  className="flex items-center gap-1.5 rounded-lg border border-space-700 bg-space-850/80 px-2.5 py-1 text-xs text-slate-300 hover:border-cyan-400 hover:text-white hover:bg-cyan-500/10 transition"
                >
                  <span>{feeling.emoji}</span>
                  <span>{feeling.short}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notificación de éxito al aplicar contramedida */}
      {notification && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. VISOR 3D REALISTA (IZQUIERDA) + PANEL CLÍNICO (DERECHA) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Lado Izquierdo: Astronauta 3D Realista con Three.js */}
        <div className="flex flex-col space-y-3 lg:col-span-5">
          <Astronaut3DViewer
            currentSample={currentSample}
            selectedOrganId={activeSystemId}
            onSelectOrgan={(id) => {
              setActiveSystemId(id);
              const found = ANATOMICAL_SYSTEMS.find((s) => s.id === id);
              if (found) {
                setAstroDocMessage(`Enfocando tu ${found.friendlyTitle}. ${found.astroDocTip}`);
              }
            }}
            viewMode={view3DMode}
            onChangeViewMode={setView3DMode}
          />

          {/* Botonera de acceso rápido por órgano */}
          <div className="flex flex-wrap justify-center gap-1.5 rounded-xl border border-space-800 bg-space-900/80 p-2">
            {ANATOMICAL_SYSTEMS.map((sys) => {
              const isSelected = activeSystem.id === sys.id;
              const status = getSystemStatus(sys.id);
              const IconComp = sys.icon;

              return (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => {
                    setActiveSystemId(sys.id);
                    setAstroDocMessage(`Revisando ${sys.name}. ${sys.astroDocTip}`);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                      : 'border border-space-750 bg-space-850/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <IconComp className="h-3.5 w-3.5" />
                  <span>{sys.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lado Derecho: Ficha Médica Humanizada y Práctica del Órgano */}
        <div className="flex flex-col space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-space-800 bg-space-900/95 p-6 shadow-xl backdrop-blur-xl space-y-4">
            {/* Header del órgano con lenguaje cercano */}
            <div className="flex flex-col gap-3 border-b border-space-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner"
                  style={{
                    borderColor: `${activeSystem.color}50`,
                    backgroundColor: `${activeSystem.color}20`,
                    color: activeSystem.color,
                  }}
                >
                  <activeSystem.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs uppercase text-slate-400">{activeSystem.category}</span>
                    <span
                      className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold"
                      style={{
                        backgroundColor: `${activeStatus.color}20`,
                        color: activeStatus.color,
                        border: `1px solid ${activeStatus.color}40`,
                      }}
                    >
                      ● {activeStatus.label}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-white">{activeSystem.friendlyTitle}</h3>
                </div>
              </div>

              {/* Estado amigable */}
              <div className="rounded-xl bg-space-850/80 px-3.5 py-2 border border-space-750 text-right">
                <span className="font-mono text-[10px] text-slate-400 uppercase block">¿CÓMO ESTÁ AHORA?</span>
                <span className="font-semibold text-xs text-white" style={{ color: activeStatus.color }}>
                  {activeStatus.friendly}
                </span>
              </div>
            </div>

            {/* Resumen Amigable en Lenguaje Sencillo */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 text-xs text-slate-200 leading-relaxed">
              <p>{activeSystem.friendlySummary}</p>
            </div>

            {/* Tarjetas de Métricas en Tiempo Real */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {activeSystem.metrics.map((metric, idx) => {
                let liveVal = '--';
                if (activeSystem.id === 'heart') {
                  if (metric.key === 'heart_rate') liveVal = `${currentSample.heart_rate || 76} bpm`;
                  if (metric.key === 'blood_pressure') liveVal = `${currentSample.systolic_bp || 118}/${currentSample.diastolic_bp || 76} mmHg`;
                  if (metric.key === 'cardiac_output') liveVal = '5.1 L/min';
                } else if (activeSystem.id === 'lungs') {
                  if (metric.key === 'spo2') liveVal = `${currentSample.spo2 || 98.4} %`;
                  if (metric.key === 'respiratory_rate') liveVal = `${currentSample.respiratory_rate || 15} rpm`;
                  if (metric.key === 'co2') liveVal = '38 mmHg';
                } else if (activeSystem.id === 'eyes') {
                  if (metric.key === 'onsd') liveVal = `${currentSample.onsd_mm || 4.9} mm`;
                  if (metric.key === 'acuity') liveVal = '20/20 (Nominal)';
                  if (metric.key === 'iop') liveVal = '16 mmHg';
                } else if (activeSystem.id === 'metabolism') {
                  if (metric.key === 'glucose') liveVal = `${currentSample.glucose || 92} mg/dL`;
                  if (metric.key === 'metabolism_mode') liveVal = '95 W';
                  if (metric.key === 'hydration') liveVal = '2.8 L/día';
                } else if (activeSystem.id === 'brain') {
                  if (metric.key === 'stress') liveVal = `${currentSample.stress_level || 18} %`;
                  if (metric.key === 'sleep') liveVal = `${currentSample.sleep_hours || 7.8} h`;
                  if (metric.key === 'cognitive') liveVal = '95 / 100';
                } else if (activeSystem.id === 'skeleton') {
                  if (metric.key === 'bone_loss') liveVal = `${currentSample.bone_loss_monthly || 0.28} %/mes`;
                  if (metric.key === 'muscle_tone') liveVal = '96 %';
                  if (metric.key === 'ared_compliance') liveVal = '120 min';
                } else {
                  if (metric.key === 'wbc') liveVal = '6.8 k/µL';
                  if (metric.key === 'radiation_dose') liveVal = '142 mSv';
                  if (metric.key === 'skin_health') liveVal = 'Intacta';
                }

                return (
                  <div key={idx} className="rounded-xl border border-space-800 bg-space-850/70 p-3">
                    <span className="text-[11px] font-semibold text-slate-300 block">{metric.label}</span>
                    <div className="mt-1 font-mono text-base font-extrabold text-white">{liveVal}</div>
                    <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                      {metric.friendlyMeaning}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Consejo amigable directo de AstroDoc */}
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Bot className="h-4 w-4" />
                <span>Consejo Práctico de AstroDoc</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSystem.astroDocTip}
              </p>
            </div>

            {/* Señales que debes vigilar */}
            <div className="rounded-xl border border-space-800 bg-space-850/50 p-3.5 space-y-2">
              <span className="text-xs font-bold text-slate-200">
                ¿Qué síntomas debes vigilar tú mismo en la nave?
              </span>
              <ul className="space-y-1.5">
                {activeSystem.symptomsToWatch.map((sym, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contramedida y Tratamiento Inmediato */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Solución Recomendada: {activeSystem.countermeasure.title}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSystem.countermeasure.action}
              </p>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleExecuteCountermeasure(activeSystem)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500/20 px-4 py-2 font-mono text-xs font-bold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition active:scale-95"
                >
                  <span>{activeSystem.countermeasure.buttonLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
