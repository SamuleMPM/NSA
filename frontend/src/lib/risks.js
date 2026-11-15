/**
 * Evaluación de los cinco riesgos del vuelo espacial humano (NASA HRP / RIDGE).
 *
 * Importante:
 * - Las bandas y pesos son un MODELO DE APOYO A LA DECISIÓN configurable.
 * - No son límites oficiales de la NASA ni sustituyen una evaluación médica.
 * - Cada indicador conserva su origen: simulado, manual o derivado de telemetría.
 *
 * Fuente conceptual: docs/NASA_5_HAZARDS.md y docs/DATA_DICTIONARY.md.
 */

import { getEnvironment } from './environments';
import { clamp } from './format';

export const RISK_ORDER = ['radiation', 'isolation', 'distance', 'gravity', 'environment'];

export const RISK_LEVELS = {
  low: { id: 'low', label: 'Bajo', short: 'BAJO', color: '#047857', tone: 'nominal', order: 0 },
  moderate: { id: 'moderate', label: 'Moderado', short: 'MOD', color: '#0369A1', tone: 'warning', order: 1 },
  high: { id: 'high', label: 'Alto', short: 'ALTO', color: '#C2410C', tone: 'high', order: 2 },
  critical: { id: 'critical', label: 'Crítico', short: 'CRÍT', color: '#A16207', tone: 'critical', order: 3 },
};

export const RISK_MODEL_NOTE =
  'Modelo de apoyo a la decisión con bandas y pesos configurables. No constituye un límite oficial de la NASA ni un diagnóstico.';

export const DEFAULT_RISK_INPUTS = {
  // Radiación (R)
  radiationRateMsvDay: null,
  cumulativeRadiationMsv: null,
  // Aislamiento (I)
  isolationDays: null,
  sleepHours: null,
  stressLevel: null,
  socialContactsPerWeek: null,
  moodScore: null,
  // Distancia (D)
  earthDistanceMkm: null,
  commDelayMin: null,
  autonomyPct: null,
  evacuationHours: null,
  medicalStockPct: null,
  // Gravedad (G)
  gravityG: null,
  gravityExposureDays: null,
  boneLossPctMonth: null,
  muscleLossPct: null,
  orthostaticIntolerancePct: null,
  // Entorno cerrado (E)
  o2Pct: null,
  co2MmHg: null,
  cabinTempC: null,
  humidityPct: null,
  pressureKpa: null,
  aqi: null,
  regolithIndex: null,
};

const PICK_KEYS = Object.keys(DEFAULT_RISK_INPUTS);

export const SCENARIO_RISK_EFFECTS = {
  microgravity: {},
  eva: { o2Pct: 20.8, co2MmHg: 3.6, cabinTempC: 23.5 },
  hypoxia: { o2Pct: 16.5, co2MmHg: 5.8, pressureKpa: 72, aqi: 35 },
  hyperthermia: { cabinTempC: 38.5, humidityPct: 22, o2Pct: 20.6 },
  sleep: { cabinTempC: 20.5, humidityPct: 50 },
  radiation: { radiationRateMsvDay: 9.5, aqi: 30 },
  confinement: { isolationDays: 180, sleepHours: 5.2, stressLevel: 78, moodScore: 4, socialContactsPerWeek: 1 },
  co2: { co2MmHg: 9.2, o2Pct: 19.2, aqi: 80 },
  gravity_transition: { gravityG: 2.0, orthostaticIntolerancePct: 70, muscleLossPct: 14 },
};

function pickDefined(source = {}) {
  return PICK_KEYS.reduce((acc, key) => {
    if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
      acc[key] = source[key];
    }
    return acc;
  }, {});
}

function num(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

/** Interpolación lineal sobre puntos [valor, puntuación] ascendentes. */
function scoreCurve(value, points) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric <= points[0][0]) return points[0][1];
  for (let index = 0; index < points.length - 1; index += 1) {
    const [x1, y1] = points[index];
    const [x2, y2] = points[index + 1];
    if (numeric <= x2) {
      const ratio = (numeric - x1) / (x2 - x1 || 1);
      return clamp(y1 + (y2 - y1) * ratio);
    }
  }
  return clamp(points[points.length - 1][1]);
}

function deviationScore(value, target, points) {
  return scoreCurve(Math.abs(num(value) - target), points);
}

function weighted(parts) {
  return clamp(parts.reduce((sum, [score, weight]) => sum + score * weight, 0));
}

function indicator(key, label, value, unit, score, reference, source, origin) {
  return { key, label, value, unit, score: Math.round(score), reference, source, origin };
}

export function levelForScore(score) {
  if (score >= 75) return RISK_LEVELS.critical;
  if (score >= 50) return RISK_LEVELS.high;
  if (score >= 25) return RISK_LEVELS.moderate;
  return RISK_LEVELS.low;
}

export const RISK_DEFINITIONS = {
  radiation: {
    id: 'radiation',
    code: 'R',
    name: 'Radiación espacial',
    shortName: 'Radiación',
    icon: 'radiation',
    color: '#061D47',
    summary: 'Exposición a rayos cósmicos galácticos (GCR) y eventos de partículas solares (SPE).',
    threat: 'Sin magnetosfera terrestre, la radiación ionizante de alta energía puede dañar el ADN, aumentar el riesgo de cáncer y cataratas y alterar la respuesta inmunitaria.',
    dataSource: 'Dosímetro ambiental y personal (no conectado). Valores de entorno simulados o registro manual.',
    formula: '0.65 × puntuación de tasa de dosis + 0.35 × puntuación de dosis acumulada.',
    indicators: [
      { key: 'radiationRateMsvDay', label: 'Tasa de dosis', unit: 'mSv/día', reference: 'Bandas configurables' },
      { key: 'cumulativeRadiationMsv', label: 'Dosis acumulada', unit: 'mSv', reference: 'Bandas configurables' },
      { key: 'exposureDays', label: 'Tiempo de exposición', unit: 'días', reference: 'Duración de misión' },
      { key: 'radiationRateUsVh', label: 'Tasa equivalente', unit: 'µSv/h', reference: 'Conversión de la tasa diaria' },
    ],
    countermeasures: [
      { title: 'Refugio de tormenta solar', detail: 'Masa de polietileno/agua como blindaje pasivo durante eventos SPE.' },
      { title: 'Dosimetría activa con alertas', detail: 'Seguimiento de dosis acumulada y umbrales de exposición por tripulante.' },
      { title: 'Optimizar blindaje y tiempo', detail: 'Reducir tiempo de exposición y aumentar blindaje en zonas de mayor tasa.' },
      { title: 'Seguimiento biomédico', detail: 'Hemograma y biomarcadores de estrés oxidativo cuando haya capacidad de laboratorio.' },
    ],
    explanation:
      'El modelo combina la tasa de dosis del entorno con la dosis acumulada de la misión. Una tasa elevada o una dosis acumulada alta elevan el riesgo de daño celular y de efectos a largo plazo; el refugio y la dosimetría son las contramedidas principales.',
  },
  isolation: {
    id: 'isolation',
    code: 'I',
    name: 'Aislamiento y confinamiento',
    shortName: 'Aislamiento',
    icon: 'isolation',
    color: '#0EA5E9',
    summary: 'Convivencia prolongada en volumen reducido, lejos del entorno social terrestre.',
    threat: 'Puede alterar el ritmo circadiano, el sueño, el estado de ánimo, la atención y la convivencia, con riesgo de depresión reactiva y deterioro del rendimiento.',
    dataSource: 'Cuestionarios de bienestar y registro de sueño. Sueño y estrés pueden venir de telemetría; contactos y estado de ánimo son registros manuales.',
    formula: 'Peso de días de aislamiento, estrés, déficit de sueño, interacción social y estado de ánimo.',
    indicators: [
      { key: 'isolationDays', label: 'Días de aislamiento', unit: 'días', reference: 'Duración acumulada' },
      { key: 'stressLevel', label: 'Estrés subjetivo', unit: '%', reference: '0–35 nominal · >65 crítico' },
      { key: 'sleepHours', label: 'Sueño', unit: 'h', reference: '7.0–8.5 h' },
      { key: 'socialContactsPerWeek', label: 'Contactos sociales', unit: '/semana', reference: 'Frecuencia declarada' },
      { key: 'moodScore', label: 'Estado de ánimo', unit: '1–10', reference: 'Escala subjetiva' },
    ],
    countermeasures: [
      { title: 'Iluminación circadiana', detail: 'Luz azul matutina y luz cálida nocturna para sostener melatonina y fase circadiana.' },
      { title: 'Check-in psicológico', detail: 'Seguimiento periódico del estado de ánimo, estrés y calidad del sueño.' },
      { title: 'Interacción social planificada', detail: 'Contacto con familia/Tierra y actividades recreativas en equipo cuando la latencia lo permita.' },
      { title: 'Realidad virtual y descanso', detail: 'Entornos terrestres inmersivos y pausas de recuperación para reducir cortisol.' },
    ],
    explanation:
      'El índice integra duración del aislamiento, estrés, sueño, contactos sociales y estado de ánimo. El confinamiento prolongado no es solo un problema psicológico: también afecta al sueño, la variabilidad cardíaca y la toma de decisiones.',
  },
  distance: {
    id: 'distance',
    code: 'D',
    name: 'Distancia de la Tierra',
    shortName: 'Distancia',
    icon: 'distance',
    color: '#0B3D91',
    summary: 'Retardo de comunicaciones y ausencia de evacuación o telemedicina en tiempo real.',
    threat: 'Cuanto mayor es la distancia, mayor es la latencia y menor la capacidad de recibir ayuda. La tripulación debe diagnosticar y tratar de forma autónoma.',
    dataSource: 'Efemérides de misión y latencia DSN (no conectadas). Parámetros de entorno simulados o registros manuales.',
    formula: 'Peso de latencia, distancia, autonomía, tiempo de evacuación y stock médico.',
    indicators: [
      { key: 'earthDistanceMkm', label: 'Distancia a la Tierra', unit: 'Mkm', reference: 'Efemérides de misión' },
      { key: 'commDelayMin', label: 'Retardo de comunicación', unit: 'min', reference: 'Ida Tierra–nave' },
      { key: 'autonomyPct', label: 'Autonomía operativa', unit: '%', reference: 'Capacidad de resolver sin Tierra' },
      { key: 'evacuationHours', label: 'Evacuación estimada', unit: 'h', reference: 'Tiempo de retorno' },
      { key: 'medicalStockPct', label: 'Stock médico', unit: '%', reference: 'Disponibilidad a bordo' },
    ],
    countermeasures: [
      { title: 'Protocolos autónomos', detail: 'Árboles de decisión y guías paso a paso para diagnóstico y tratamiento sin telemedicina en vivo.' },
      { title: 'Inventario médico', detail: 'Control de caducidades, stock y reposición planificada.' },
      { title: 'Entrenamiento de la tripulación', detail: 'Simulacros periódicos de emergencia médica con latencia real.' },
      { title: 'Enlace diferido estructurado', detail: 'Paquetes de telemetría y consultas asíncronas con Flight Surgeons.' },
    ],
    explanation:
      'La distancia no produce síntomas por sí misma, pero define el margen de ayuda disponible. Una latencia de 14–22 minutos elimina la telecirugía en vivo y exige autonomía diagnóstica y terapéutica.',
  },
  gravity: {
    id: 'gravity',
    code: 'G',
    name: 'Campos gravitatorios alterados',
    shortName: 'Gravedad',
    icon: 'gravity',
    color: '#2563EB',
    summary: 'Transición entre 1 G, microgravedad, gravedad lunar/marciana y aceleraciones de lanzamiento/reentrada.',
    threat: 'Desacondicionamiento cardiovascular y musculoesquelético, pérdida de densidad ósea, atrofia muscular, desplazamiento cefálico de fluidos y SANS.',
    dataSource: 'Acelerómetro/IMU y ecografía muscular (no conectados). Gravedad del entorno simulada; pérdida ósea estimada por modelo o registro manual.',
    formula: 'Peso de desviación respecto a 1 G, días de exposición, pérdida ósea, pérdida muscular e intolerancia ortostática.',
    indicators: [
      { key: 'gravityG', label: 'Gravedad', unit: 'G', reference: '1 G nominal · 0 G / 0.38 G alteradas' },
      { key: 'gravityExposureDays', label: 'Exposición', unit: 'días', reference: 'Duración acumulada' },
      { key: 'boneLossPctMonth', label: 'Pérdida ósea', unit: '%/mes', reference: '<0.40 objetivo · >0.90 crítico' },
      { key: 'muscleLossPct', label: 'Pérdida muscular', unit: '%', reference: 'Estimación del modelo' },
      { key: 'orthostaticIntolerancePct', label: 'Intolerancia ortostática', unit: '%', reference: 'Escala de riesgo' },
    ],
    countermeasures: [
      { title: 'Ejercicio resistivo (ARED)', detail: 'Carga mecánica diaria para hueso y músculo; objetivo operativo de ~2 h/día.' },
      { title: 'Presión negativa (LBNP/Chibis)', detail: 'Redistribuye fluidos hacia las piernas y reduce la congestión cefálica.' },
      { title: 'Hidratación y electrolitos', detail: 'Preparación pre-reentrada y control del volumen circulante.' },
      { title: 'Vigilancia SANS', detail: 'Ecografía ocular/ONSD y seguimiento de cambios visuales.' },
    ],
    explanation:
      'El riesgo aumenta cuando la gravedad se aleja de 1 G y se prolonga la exposición. La microgravedad produce pérdida ósea y muscular, desplazamiento cefálico de fluidos e intolerancia ortostática al regresar a un campo gravitatorio.',
  },
  environment: {
    id: 'environment',
    code: 'E',
    name: 'Entornos cerrados y hostiles',
    shortName: 'Entorno',
    icon: 'environment',
    color: '#0284C7',
    summary: 'Hábitat hermético con aire, agua y residuos reciclados; polvo, gases y variaciones térmicas.',
    threat: 'Hipoxia, hipercapnia, deshidratación, estrés térmico, irritación por regolito y alteraciones de la microbiota.',
    dataSource: 'Sensores ECLSS de O₂, CO₂, presión, temperatura y humedad (no conectados). Datos simulados o registros manuales.',
    formula: 'Puntuación del peor indicador ambiental (80 %) + media de indicadores (20 %).',
    indicators: [
      { key: 'o2Pct', label: 'Oxígeno', unit: '%', reference: '≈21 % · bandas configurables' },
      { key: 'co2MmHg', label: 'CO₂', unit: 'mmHg', reference: '<4 mmHg referencia del proyecto' },
      { key: 'cabinTempC', label: 'Temperatura de cabina', unit: '°C', reference: 'Confort 18–27 °C' },
      { key: 'humidityPct', label: 'Humedad', unit: '%', reference: '30–60 %' },
      { key: 'pressureKpa', label: 'Presión de cabina', unit: 'kPa', reference: '≈101.3 kPa' },
      { key: 'aqi', label: 'Calidad de aire', unit: 'índice', reference: 'Bandas configurables' },
      { key: 'regolithIndex', label: 'Regolito/partículas', unit: 'índice', reference: 'Bandas configurables' },
    ],
    countermeasures: [
      { title: 'Depuración de CO₂', detail: 'Absorbedores LiOH/MetOx y verificación de la presión parcial.' },
      { title: 'Filtración de partículas', detail: 'Filtros HEPA/electrostáticos y control de regolito en esclusas.' },
      { title: 'Control térmico', detail: 'LCVG y climatización del hábitat; vigilancia de temperatura central.' },
      { title: 'Monitorización continua', detail: 'Seguimiento de O₂, CO₂, presión, humedad y calidad del aire.' },
    ],
    explanation:
      'El entorno puede deteriorarse sin que el tripulante lo perciba de inmediato. La hipoxia y la hipercapnia son especialmente peligrosas por su inicio insidioso; por eso se evalúa el peor indicador ambiental además de la media.',
  },
};

const EVALUATORS = {
  radiation(inputs, context) {
    const rate = num(inputs.radiationRateMsvDay, context.environment.radiationDailyMsv);
    const exposureDays = num(inputs.radiationExposureDays ?? context.missionDays, context.missionDays);
    const cumulative = num(inputs.cumulativeRadiationMsv, rate * exposureDays);
    const rateScore = scoreCurve(rate, [
      [0.2, 5],
      [0.4, 15],
      [0.7, 35],
      [1.0, 50],
      [1.5, 70],
      [2.0, 85],
      [3.0, 100],
    ]);
    const cumulativeScore = scoreCurve(cumulative, [
      [25, 5],
      [50, 15],
      [100, 30],
      [200, 50],
      [300, 65],
      [400, 80],
      [600, 100],
    ]);
    const score = weighted([
      [rateScore, 0.65],
      [cumulativeScore, 0.35],
    ]);
    return {
      score,
      indicators: [
        indicator('radiationRateMsvDay', 'Tasa de dosis', rate, 'mSv/día', rateScore, 'Bandas configurables', 'Entorno/registro', context.origin),
        indicator('cumulativeRadiationMsv', 'Dosis acumulada', cumulative, 'mSv', cumulativeScore, 'Bandas configurables', 'Modelo/registro', context.origin),
        indicator('exposureDays', 'Tiempo de exposición', exposureDays, 'días', scoreCurve(exposureDays, [[7, 5], [30, 20], [90, 45], [180, 70], [365, 100]]), 'Duración de misión', 'Modelo', context.origin),
        indicator('radiationRateUsVh', 'Tasa equivalente', rate * (1000 / 24), 'µSv/h', rateScore, 'Conversión de la tasa diaria', 'Cálculo', context.origin),
      ],
    };
  },

  isolation(inputs, context) {
    const isolationDays = num(inputs.isolationDays, 62);
    const sleepHours = num(inputs.sleepHours ?? context.latestSample?.sleep_hours, 7.8);
    const stressLevel = num(inputs.stressLevel ?? context.latestSample?.stress_level, 18);
    const socialContacts = num(inputs.socialContactsPerWeek, 3);
    const moodScore = num(inputs.moodScore, 7);

    const daysScore = scoreCurve(isolationDays, [
      [14, 10],
      [30, 25],
      [60, 40],
      [90, 55],
      [180, 75],
      [365, 95],
      [500, 100],
    ]);
    const stressScore = clamp(stressLevel);
    const sleepScore = clamp(((8 - sleepHours) / 3) * 100);
    const socialScore = clamp(100 - socialContacts * 18);
    const moodScoreNormalized = clamp((10 - moodScore) * 11);

    const score = weighted([
      [daysScore, 0.25],
      [stressScore, 0.3],
      [sleepScore, 0.2],
      [socialScore, 0.15],
      [moodScoreNormalized, 0.1],
    ]);

    return {
      score,
      indicators: [
        indicator('isolationDays', 'Días de aislamiento', isolationDays, 'días', daysScore, 'Duración acumulada', 'Modelo/registro', context.origin),
        indicator('stressLevel', 'Estrés subjetivo', stressLevel, '%', stressScore, '0–35 nominal · >65 crítico', 'Cuestionario/telemetría', context.origin),
        indicator('sleepHours', 'Sueño', sleepHours, 'h', sleepScore, '7.0–8.5 h', 'Telemetría/registro', context.origin),
        indicator('socialContactsPerWeek', 'Contactos sociales', socialContacts, '/semana', socialScore, 'Frecuencia declarada', 'Registro manual', context.origin),
        indicator('moodScore', 'Estado de ánimo', moodScore, '1–10', moodScoreNormalized, 'Escala subjetiva', 'Registro manual', context.origin),
      ],
    };
  },

  distance(inputs, context) {
    const distance = num(inputs.earthDistanceMkm, context.environment.earthDistanceMkm);
    const delay = num(inputs.commDelayMin, context.environment.commDelaySeconds / 60);
    const autonomy = num(inputs.autonomyPct, context.environment.autonomyPct);
    const evacuation = num(inputs.evacuationHours, context.environment.evacuationHours);
    const medicalStock = num(inputs.medicalStockPct, context.environment.medicalStockPct);

    const distanceScore = scoreCurve(distance, [
      [0.001, 0],
      [0.4, 10],
      [1.5, 25],
      [55, 45],
      [225, 70],
      [400, 85],
      [600, 100],
    ]);
    const delayScore = scoreCurve(delay, [
      [0.05, 5],
      [1, 10],
      [5, 30],
      [14.5, 70],
      [22, 85],
      [44, 100],
    ]);
    const autonomyScore = clamp(100 - autonomy);
    const evacuationScore = scoreCurve(evacuation, [
      [6, 20],
      [24, 45],
      [72, 70],
      [168, 90],
      [336, 100],
    ]);
    const stockScore = clamp(100 - medicalStock);

    const score = weighted([
      [delayScore, 0.3],
      [distanceScore, 0.2],
      [autonomyScore, 0.2],
      [evacuationScore, 0.2],
      [stockScore, 0.1],
    ]);

    return {
      score,
      indicators: [
        indicator('earthDistanceMkm', 'Distancia a la Tierra', distance, 'Mkm', distanceScore, 'Efemérides de misión', 'Entorno/registro', context.origin),
        indicator('commDelayMin', 'Retardo de comunicación', delay, 'min', delayScore, 'Ida Tierra–nave', 'Entorno/registro', context.origin),
        indicator('autonomyPct', 'Autonomía operativa', autonomy, '%', autonomyScore, 'Capacidad de resolver sin Tierra', 'Modelo de misión', context.origin),
        indicator('evacuationHours', 'Evacuación estimada', evacuation, 'h', evacuationScore, 'Tiempo de retorno', 'Modelo de misión', context.origin),
        indicator('medicalStockPct', 'Stock médico', medicalStock, '%', stockScore, 'Disponibilidad a bordo', 'Registro manual', context.origin),
      ],
    };
  },

  gravity(inputs, context) {
    const gravity = num(inputs.gravityG, context.environment.gravityG);
    const exposureDays = num(inputs.gravityExposureDays, context.missionDays);
    const boneLoss = num(inputs.boneLossPctMonth ?? context.latestSample?.bone_loss_monthly, Math.abs(1 - gravity) > 0.5 ? 1.2 : 0.3);
    const muscleLoss = num(inputs.muscleLossPct, 8);
    const orthostatic = num(inputs.orthostaticIntolerancePct, 25);

    const gravityScore = scoreCurve(Math.abs(gravity - 1), [
      [0.05, 5],
      [0.2, 20],
      [0.5, 45],
      [0.7, 60],
      [1.0, 90],
      [1.5, 100],
    ]);
    const exposureScore = scoreCurve(exposureDays, [
      [7, 5],
      [30, 15],
      [90, 35],
      [180, 60],
      [365, 85],
      [500, 100],
    ]);
    const boneScore = scoreCurve(boneLoss, [
      [0.2, 5],
      [0.4, 20],
      [0.6, 35],
      [0.9, 60],
      [1.2, 80],
      [1.5, 100],
    ]);
    const muscleScore = clamp(muscleLoss * 6);
    const orthostaticScore = clamp(orthostatic);

    const score = weighted([
      [gravityScore, 0.35],
      [exposureScore, 0.2],
      [boneScore, 0.2],
      [muscleScore, 0.15],
      [orthostaticScore, 0.1],
    ]);

    return {
      score,
      indicators: [
        indicator('gravityG', 'Gravedad', gravity, 'G', gravityScore, '1 G nominal · 0 G/0.38 G alteradas', 'Entorno/registro', context.origin),
        indicator('gravityExposureDays', 'Exposición', exposureDays, 'días', exposureScore, 'Duración acumulada', 'Modelo', context.origin),
        indicator('boneLossPctMonth', 'Pérdida ósea', boneLoss, '%/mes', boneScore, '<0.40 objetivo · >0.90 crítico', 'Modelo/telemetría', context.origin),
        indicator('muscleLossPct', 'Pérdida muscular', muscleLoss, '%', muscleScore, 'Estimación del modelo', 'Modelo', context.origin),
        indicator('orthostaticIntolerancePct', 'Intolerancia ortostática', orthostatic, '%', orthostaticScore, 'Escala de riesgo', 'Modelo/registro', context.origin),
      ],
    };
  },

  environment(inputs, context) {
    const o2 = num(inputs.o2Pct, context.environment.o2Pct);
    const co2 = num(inputs.co2MmHg, context.environment.co2MmHg);
    const cabinTemp = num(inputs.cabinTempC, context.environment.cabinTempC);
    const humidity = num(inputs.humidityPct, context.environment.humidityPct);
    const pressure = num(inputs.pressureKpa, context.environment.cabinPressureKpa ?? context.environment.ambientPressureKpa);
    const aqi = num(inputs.aqi, context.environment.aqi);
    const regolith = num(inputs.regolithIndex, context.environment.regolithIndex);

    const o2Score = deviationScore(o2, 21, [
      [1.5, 5],
      [2.5, 20],
      [4, 50],
      [6, 80],
      [10, 100],
    ]);
    const co2Score = scoreCurve(co2, [
      [3, 8],
      [4, 25],
      [5, 40],
      [7.6, 75],
      [10, 90],
      [15, 100],
    ]);
    const tempScore = deviationScore(cabinTemp, 22.5, [
      [3, 5],
      [5, 20],
      [8, 45],
      [12, 75],
      [20, 100],
    ]);
    const humidityScore = deviationScore(humidity, 45, [
      [10, 5],
      [20, 20],
      [30, 50],
      [40, 80],
      [55, 100],
    ]);
    const pressureScore = deviationScore(pressure, 101.3, [
      [2, 5],
      [5, 20],
      [10, 50],
      [20, 80],
      [30, 100],
    ]);
    const aqiScore = scoreCurve(aqi, [
      [50, 10],
      [100, 30],
      [150, 50],
      [200, 70],
      [300, 90],
      [500, 100],
    ]);
    const regolithScore = scoreCurve(regolith, [
      [10, 5],
      [25, 20],
      [50, 45],
      [75, 70],
      [90, 100],
    ]);

    const parts = [o2Score, co2Score, tempScore, humidityScore, pressureScore, aqiScore, regolithScore];
    const worst = Math.max(...parts);
    const average = parts.reduce((sum, value) => sum + value, 0) / parts.length;
    const score = clamp(worst * 0.8 + average * 0.2);

    return {
      score,
      indicators: [
        indicator('o2Pct', 'Oxígeno', o2, '%', o2Score, '≈21 % · bandas configurables', 'ECLSS/registro', context.origin),
        indicator('co2MmHg', 'CO₂', co2, 'mmHg', co2Score, '<4 mmHg referencia del proyecto', 'ECLSS/registro', context.origin),
        indicator('cabinTempC', 'Temperatura de cabina', cabinTemp, '°C', tempScore, 'Confort 18–27 °C', 'ECLSS/registro', context.origin),
        indicator('humidityPct', 'Humedad', humidity, '%', humidityScore, '30–60 %', 'ECLSS/registro', context.origin),
        indicator('pressureKpa', 'Presión de cabina', pressure, 'kPa', pressureScore, '≈101.3 kPa', 'ECLSS/registro', context.origin),
        indicator('aqi', 'Calidad de aire', aqi, 'índice', aqiScore, 'Bandas configurables', 'ECLSS/registro', context.origin),
        indicator('regolithIndex', 'Regolito/partículas', regolith, 'índice', regolithScore, 'Bandas configurables', 'ECLSS/registro', context.origin),
      ],
    };
  },
};

/**
 * Combina defaults del entorno, registros manuales y efectos del escenario.
 * Precedencia: contexto < registro de simulación < registro ambiental < escenario activo.
 */
export function buildRiskInputs({
  environment,
  latestSample,
  environmentRecord,
  simulationRecord,
  scenario = 'microgravity',
  missionDays = 62,
} = {}) {
  const env = environment || getEnvironment('transit');
  const simulationData = pickDefined(simulationRecord?.data);
  const environmentData = pickDefined(environmentRecord?.data);
  const effects = SCENARIO_RISK_EFFECTS[scenario] || {};

  const inputs = {
    ...DEFAULT_RISK_INPUTS,
    ...simulationData,
    ...environmentData,
    ...effects,
  };

  inputs.gravityG = inputs.gravityG ?? env.gravityG;
  inputs.radiationRateMsvDay = inputs.radiationRateMsvDay ?? env.radiationDailyMsv;
  inputs.cumulativeRadiationMsv =
    inputs.cumulativeRadiationMsv ?? inputs.radiationRateMsvDay * Math.max(1, missionDays);
  inputs.earthDistanceMkm = inputs.earthDistanceMkm ?? env.earthDistanceMkm;
  inputs.commDelayMin = inputs.commDelayMin ?? env.commDelaySeconds / 60;
  inputs.autonomyPct = inputs.autonomyPct ?? env.autonomyPct;
  inputs.evacuationHours = inputs.evacuationHours ?? env.evacuationHours;
  inputs.medicalStockPct = inputs.medicalStockPct ?? env.medicalStockPct;
  inputs.o2Pct = inputs.o2Pct ?? env.o2Pct;
  inputs.co2MmHg = inputs.co2MmHg ?? env.co2MmHg;
  inputs.cabinTempC = inputs.cabinTempC ?? env.cabinTempC;
  inputs.humidityPct = inputs.humidityPct ?? env.humidityPct;
  inputs.pressureKpa = inputs.pressureKpa ?? env.cabinPressureKpa ?? env.ambientPressureKpa;
  inputs.aqi = inputs.aqi ?? env.aqi;
  inputs.regolithIndex = inputs.regolithIndex ?? env.regolithIndex;
  inputs.sleepHours = inputs.sleepHours ?? latestSample?.sleep_hours ?? 7.8;
  inputs.stressLevel = inputs.stressLevel ?? latestSample?.stress_level ?? 18;
  inputs.boneLossPctMonth = inputs.boneLossPctMonth ?? latestSample?.bone_loss_monthly ?? 0.3;
  inputs.isolationDays = inputs.isolationDays ?? Math.max(1, missionDays);
  inputs.gravityExposureDays = inputs.gravityExposureDays ?? Math.max(1, missionDays);
  inputs.socialContactsPerWeek = inputs.socialContactsPerWeek ?? 3;
  inputs.moodScore = inputs.moodScore ?? 7;
  inputs.muscleLossPct = inputs.muscleLossPct ?? 8;
  inputs.orthostaticIntolerancePct = inputs.orthostaticIntolerancePct ?? 25;

  const hasManualEnvironment = Boolean(environmentRecord);
  const hasSimulationRecord = Boolean(simulationRecord && simulationRecord.origin === 'simulated');
  const origin = hasManualEnvironment
    ? 'manual'
    : latestSample?.origin === 'manual'
      ? 'manual'
      : hasSimulationRecord
        ? 'simulated'
        : 'simulated';

  return { inputs, origin, scenario, environmentId: env.id };
}

export function evaluateRisks(inputs = {}, context = {}) {
  const environment = context.environment || getEnvironment('transit');
  const latestSample = context.latestSample || {};
  const missionDays = context.missionDays ?? 62;
  const origin = context.origin || 'simulated';
  const evaluationContext = { environment, latestSample, missionDays, origin };

  const risks = RISK_ORDER.reduce((acc, key) => {
    const definition = RISK_DEFINITIONS[key];
    const evaluated = EVALUATORS[key](inputs, evaluationContext);
    const level = levelForScore(evaluated.score);
    acc[key] = {
      ...definition,
      score: Math.round(evaluated.score),
      level: level.id,
      levelInfo: level,
      indicators: evaluated.indicators,
      origin,
      alertEligible: level.id === 'high' || level.id === 'critical',
      modelNote: RISK_MODEL_NOTE,
    };
    return acc;
  }, {});

  const scores = RISK_ORDER.map((key) => risks[key].score);
  const worstKey = RISK_ORDER.reduce((worst, key) => (risks[key].score > risks[worst].score ? key : worst), RISK_ORDER[0]);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const overallScore = Math.round(Math.max(...scores) * 0.7 + average * 0.3);
  const worstLevel = risks[worstKey].levelInfo;
  const averageLevel = levelForScore(overallScore);
  const overallLevel = worstLevel.order > averageLevel.order ? worstLevel : averageLevel;

  return {
    risks,
    overall: {
      score: overallScore,
      level: overallLevel.id,
      levelInfo: overallLevel,
      worstKey,
      worstRisk: risks[worstKey],
      activeCount: RISK_ORDER.filter((key) => risks[key].alertEligible).length,
      criticalCount: RISK_ORDER.filter((key) => risks[key].level === 'critical').length,
    },
    generatedAt: new Date().toISOString(),
    origin,
    modelNote: RISK_MODEL_NOTE,
  };
}

export function riskLevelLabel(level) {
  return RISK_LEVELS[level]?.label || 'Desconocido';
}

export function riskInputSnapshot(inputs = {}) {
  return PICK_KEYS.reduce((acc, key) => {
    if (inputs[key] !== undefined && inputs[key] !== null) acc[key] = inputs[key];
    return acc;
  }, {});
}
