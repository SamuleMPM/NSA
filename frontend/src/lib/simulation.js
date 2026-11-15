/**
 * Motor de simulación fisiológica del cliente.
 *
 * Todo dato generado aquí es SINTÉTICO y se etiqueta como tal. El motor está
 * pensado para probar la interfaz, las alertas y el modelo RIDGE mientras no
 * exista telemetría de hardware real.
 */

import { getEnvironment } from './environments';
import { clamp } from './format';

export const SCENARIO_DEFINITIONS = [
  {
    id: 'microgravity',
    code: 'SCN-01',
    name: 'Microgravedad nominal',
    shortName: 'Microgravedad',
    desc: 'Condición basal en órbita sin estrés fisiológico añadido.',
    badge: 'NOMINAL',
    tone: 'green',
    icon: 'circle',
  },
  {
    id: 'eva',
    code: 'SCN-02',
    name: 'Paseo espacial (EVA)',
    shortName: 'EVA',
    desc: 'Carga metabólica elevada y consumo de O₂ continuo.',
    badge: 'HIGH-LOAD',
    tone: 'amber',
    icon: 'orbit',
  },
  {
    id: 'hypoxia',
    code: 'SCN-03',
    name: 'Alerta de hipoxia',
    shortName: 'Hipoxia',
    desc: 'Despresurización parcial o caída de inyección de O₂.',
    badge: 'CRITICAL',
    tone: 'red',
    icon: 'wind',
  },
  {
    id: 'hyperthermia',
    code: 'SCN-04',
    name: 'Estrés térmico',
    shortName: 'Hipertermia',
    desc: 'Fallo de refrigeración líquida LCVG o exposición térmica.',
    badge: 'WARNING',
    tone: 'amber',
    icon: 'flame',
  },
  {
    id: 'sleep',
    code: 'SCN-05',
    name: 'Ciclo de sueño',
    shortName: 'Sueño',
    desc: 'Metabolismo basal y recuperación circadiana.',
    badge: 'BASAL',
    tone: 'cyan',
    icon: 'moon',
  },
  {
    id: 'radiation',
    code: 'SCN-06',
    name: 'Tormenta de radiación (SPE)',
    shortName: 'Radiación',
    desc: 'Evento de partículas solares con aumento brusco de dosis.',
    badge: 'RADIATION',
    tone: 'amber',
    icon: 'radiation',
  },
  {
    id: 'confinement',
    code: 'SCN-07',
    name: 'Confinamiento prolongado',
    shortName: 'Confinamiento',
    desc: 'Aislamiento, déficit de sueño y sobrecarga psicológica.',
    badge: 'PSYCH',
    tone: 'violet',
    icon: 'brain',
  },
  {
    id: 'co2',
    code: 'SCN-08',
    name: 'Fuga de CO₂',
    shortName: 'Fuga CO₂',
    desc: 'Fallo del absorbedor y acumulación de dióxido de carbono.',
    badge: 'CRITICAL',
    tone: 'red',
    icon: 'cloud',
  },
  {
    id: 'gravity_transition',
    code: 'SCN-09',
    name: 'Transición gravitatoria',
    shortName: 'Transición G',
    desc: 'Aceleración de reentrada y desacondicionamiento ortostático.',
    badge: 'G-LOAD',
    tone: 'cyan',
    icon: 'orbit',
  },
];

export const SCENARIO_LABELS = SCENARIO_DEFINITIONS.reduce((acc, scenario) => {
  acc[scenario.id] = scenario.name;
  return acc;
}, {});

export function getScenarioDefinition(id) {
  return SCENARIO_DEFINITIONS.find((scenario) => scenario.id === id) || SCENARIO_DEFINITIONS[0];
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

const BASE = {
  microgravity: {
    hr: [72, 8],
    spo2: [98.3, 1.0],
    temp: [36.6, 0.3],
    rr: [15, 2],
    systolic: [118, 6],
    diastolic: [76, 4],
    glucose: [92, 5],
    sleep: 7.8,
    stress: 18,
    onsd: 4.9,
    bone: 0.28,
  },
  eva: {
    hr: [106, 14],
    spo2: [96.6, 1.4],
    temp: [37.2, 0.4],
    rr: [21, 3],
    systolic: [128, 8],
    diastolic: [82, 6],
    glucose: [86, 6],
    sleep: 6.8,
    stress: 38,
    onsd: 5.1,
    bone: 0.32,
  },
  hypoxia: {
    hr: [134, 12],
    spo2: [86.2, 2.4],
    temp: [36.5, 0.3],
    rr: [27, 3],
    systolic: [144, 10],
    diastolic: [92, 6],
    glucose: [118, 8],
    sleep: 5.2,
    stress: 88,
    onsd: 5.6,
    bone: 0.35,
  },
  hyperthermia: {
    hr: [119, 10],
    spo2: [95.6, 1.2],
    temp: [38.5, 0.4],
    rr: [23, 3],
    systolic: [132, 8],
    diastolic: [84, 4],
    glucose: [104, 6],
    sleep: 6.0,
    stress: 62,
    onsd: 5.2,
    bone: 0.3,
  },
  sleep: {
    hr: [57, 5],
    spo2: [98.9, 0.6],
    temp: [36.3, 0.2],
    rr: [12, 2],
    systolic: [108, 4],
    diastolic: [68, 4],
    glucose: [88, 4],
    sleep: 8.2,
    stress: 10,
    onsd: 4.8,
    bone: 0.28,
  },
  radiation: {
    hr: [82, 9],
    spo2: [97.4, 1.0],
    temp: [36.8, 0.3],
    rr: [17, 2],
    systolic: [122, 7],
    diastolic: [78, 5],
    glucose: [96, 5],
    sleep: 6.4,
    stress: 54,
    onsd: 5.0,
    bone: 0.34,
  },
  confinement: {
    hr: [88, 10],
    spo2: [97.2, 1.0],
    temp: [36.7, 0.3],
    rr: [18, 3],
    systolic: [126, 8],
    diastolic: [80, 5],
    glucose: [101, 7],
    sleep: 5.1,
    stress: 79,
    onsd: 5.1,
    bone: 0.36,
  },
  co2: {
    hr: [112, 11],
    spo2: [91.2, 2.0],
    temp: [36.9, 0.3],
    rr: [25, 3],
    systolic: [136, 8],
    diastolic: [86, 5],
    glucose: [106, 6],
    sleep: 5.8,
    stress: 70,
    onsd: 5.2,
    bone: 0.33,
  },
  gravity_transition: {
    hr: [128, 12],
    spo2: [95.4, 1.4],
    temp: [37.1, 0.4],
    rr: [24, 3],
    systolic: [146, 10],
    diastolic: [94, 6],
    glucose: [108, 6],
    sleep: 6.2,
    stress: 66,
    onsd: 5.2,
    bone: 0.42,
  },
};

function noise([center, spread]) {
  return center + (Math.random() * 2 - 1) * spread;
}

export function generateSyntheticSample(scenario = 'microgravity', environmentOrId = 'transit', overrides = {}) {
  const environment = typeof environmentOrId === 'string' ? getEnvironment(environmentOrId) : environmentOrId;
  const profile = BASE[scenario] || BASE.microgravity;
  const gravity = environment?.gravityG ?? 0;

  const hr = noise(profile.hr) + (gravity > 0.2 && gravity < 0.6 ? 3 : 0);
  const spo2 = noise(profile.spo2);
  const temp = noise(profile.temp);
  const rr = noise(profile.rr);
  const systolic = noise(profile.systolic) + (gravity > 0.2 && gravity < 0.6 ? 2 : 0);
  const diastolic = noise(profile.diastolic);

  const now = new Date();

  return {
    id: `sim_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now.toLocaleTimeString('es-ES', { hour12: false }),
    recordedAt: now.toISOString(),
    origin: 'simulated',
    source: 'motor_simulacion_cliente',
    scenario,
    environmentId: environment?.id || 'transit',
    heart_rate: Math.round(clamp(hr, 35, 190)),
    spo2: round(clamp(spo2, 70, 100), 1),
    temperature: round(clamp(temp, 34, 41), 1),
    respiratory_rate: Math.round(clamp(rr, 6, 40)),
    systolic_bp: Math.round(clamp(systolic, 70, 190)),
    diastolic_bp: Math.round(clamp(diastolic, 40, 120)),
    glucose: round(clamp(noise(profile.glucose), 55, 180), 1),
    sleep_hours: profile.sleep,
    stress_level: profile.stress,
    onsd_mm: profile.onsd,
    bone_loss_monthly: profile.bone,
    hrv_ms: Math.round(clamp(58 - profile.stress * 0.35 + (Math.random() * 10 - 5), 18, 110)),
    ecg_rhythm: 'sinus',
    signal_quality: Math.round(clamp(97 - Math.random() * 4, 80, 100)),
    ...overrides,
  };
}

export function generateHistoryForCrew(crew = {}, environmentId = 'transit', samples = 13) {
  const initial = {};
  Object.keys(crew).forEach((id) => {
    const scenario = id === 'ast_001' ? 'eva' : id === 'ast_003' ? 'sleep' : 'microgravity';
    initial[id] = Array.from({ length: samples }, () => generateSyntheticSample(scenario, environmentId));
  });
  return initial;
}

export function normalizeSample(sample = {}) {
  return {
    ...sample,
    origin: sample.origin || 'simulated',
  };
}
