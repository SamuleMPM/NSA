/**
 * Esquemas, validación y utilidades de los registros de "Inserción de datos".
 *
 * Los registros son la fuente persistente de la aplicación. Las categorías
 * siguen el enunciado del proyecto y cada registro conserva fecha, origen y
 * validación antes de alimentar Dashboard, Telemetría, Alertas o Riesgos.
 */

import { createId } from './storage';
import { getEnvironment } from './environments';
import { toIso, toLocalInputValue } from './format';

export const ORIGIN_OPTIONS = [
  {
    value: 'manual',
    label: 'Manual',
    short: 'MANUAL',
    tone: 'info',
    description: 'Introducido por el operador a partir de una medición o cuestionario.',
  },
  {
    value: 'simulated',
    label: 'Simulado',
    short: 'SIMULADO',
    tone: 'violet',
    description: 'Generado por el motor de simulación; no es una medición real.',
  },
  {
    value: 'automated',
    label: 'Automatizado',
    short: 'AUTOMÁTICO',
    tone: 'nominal',
    description: 'Reservado para una futura integración con sensores o telemetría real.',
  },
];

export const RECORD_CATEGORIES = [
  {
    id: 'astronaut',
    label: 'Datos del astronauta',
    short: 'Astronauta',
    iconName: 'astronaut',
    color: '#0B3D91',
    description: 'Identificación, demografía, rol y contexto de misión del tripulante.',
  },
  {
    id: 'vitals',
    label: 'Signos vitales',
    short: 'Vitales',
    iconName: 'vitals',
    color: '#0EA5E9',
    description: 'Frecuencia cardíaca, SpO₂, temperatura y frecuencia respiratoria.',
  },
  {
    id: 'telemetry',
    label: 'Datos de telemetría',
    short: 'Telemetría',
    iconName: 'telemetry',
    color: '#061D47',
    description: 'Calidad de señal, HRV, fuente y frecuencia de muestreo biomédico.',
  },
  {
    id: 'ecg',
    label: 'Datos del ECG',
    short: 'ECG',
    iconName: 'ecg',
    color: '#2563EB',
    description: 'Ritmo, intervalos y interpretación electrocardiográfica.',
  },
  {
    id: 'environment',
    label: 'Entorno espacial',
    short: 'Entorno',
    iconName: 'environment',
    color: '#047857',
    description: 'O₂, CO₂, presión, temperatura, humedad, calidad de aire y radiación.',
  },
  {
    id: 'simulation',
    label: 'Datos de simulación',
    short: 'Simulación',
    iconName: 'simulation',
    color: '#6D28D9',
    description: 'Escenario, condiciones iniciales, variables RIDGE y resultados de la prueba.',
  },
];

export const CATEGORY_LABELS = RECORD_CATEGORIES.reduce((acc, category) => {
  acc[category.id] = category.label;
  return acc;
}, {});

export function getCategoryMeta(id) {
  return RECORD_CATEGORIES.find((category) => category.id === id) || RECORD_CATEGORIES[0];
}

export function getOriginMeta(origin) {
  return ORIGIN_OPTIONS.find((option) => option.value === origin) || ORIGIN_OPTIONS[0];
}

const COMMON_ID = {
  key: 'astronautId',
  label: 'Tripulante',
  type: 'select',
  section: 'Identificación',
  optionsSource: 'crew',
  required: true,
};

const COMMON_TIME = {
  key: 'recordedAt',
  label: 'Fecha y hora del registro',
  type: 'datetime-local',
  section: 'Trazabilidad',
  required: true,
  help: 'Se guarda con zona horaria local y se normaliza a ISO 8601.',
};

const COMMON_ORIGIN = {
  key: 'origin',
  label: 'Origen del dato',
  type: 'select',
  section: 'Trazabilidad',
  options: ORIGIN_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
  required: true,
  help: 'Distingue dato manual, simulado o automatizado.',
};

const NOTES = {
  key: 'notes',
  label: 'Observaciones',
  type: 'textarea',
  section: 'Trazabilidad',
  placeholder: 'Contexto, incidencias de medición o comentarios del operador…',
  rows: 3,
};

const VITAL_FIELDS = [
  {
    key: 'heart_rate',
    label: 'Frecuencia cardíaca',
    unit: 'bpm',
    type: 'number',
    section: 'Constantes vitales',
    required: true,
    min: 25,
    max: 220,
    step: 1,
    help: 'Rango fisiológico plausible para validación. Referencia nominal: 60–100 bpm.',
  },
  {
    key: 'spo2',
    label: 'Saturación de oxígeno (SpO₂)',
    unit: '%',
    type: 'number',
    section: 'Constantes vitales',
    required: true,
    min: 50,
    max: 100,
    step: 0.1,
    help: 'Referencia nominal: 95–100 %.',
  },
  {
    key: 'temperature',
    label: 'Temperatura corporal',
    unit: '°C',
    type: 'number',
    section: 'Constantes vitales',
    required: true,
    min: 30,
    max: 43,
    step: 0.1,
    help: 'Referencia nominal: 36.1–37.2 °C.',
  },
  {
    key: 'respiratory_rate',
    label: 'Frecuencia respiratoria',
    unit: 'rpm',
    type: 'number',
    section: 'Constantes vitales',
    required: true,
    min: 4,
    max: 60,
    step: 1,
    help: 'Referencia nominal: 12–20 rpm.',
  },
  {
    key: 'systolic_bp',
    label: 'Presión sistólica',
    unit: 'mmHg',
    type: 'number',
    section: 'Constantes adicionales',
    min: 60,
    max: 220,
    step: 1,
    help: 'Opcional. Referencia nominal: 90–120 mmHg.',
  },
  {
    key: 'diastolic_bp',
    label: 'Presión diastólica',
    unit: 'mmHg',
    type: 'number',
    section: 'Constantes adicionales',
    min: 30,
    max: 140,
    step: 1,
    help: 'Opcional. Referencia nominal: 60–80 mmHg.',
  },
  {
    key: 'glucose',
    label: 'Glucosa capilar',
    unit: 'mg/dL',
    type: 'number',
    section: 'Constantes adicionales',
    min: 30,
    max: 400,
    step: 1,
    help: 'Opcional. Referencia nominal: 70–110 mg/dL.',
  },
  {
    key: 'sleep_hours',
    label: 'Sueño en las últimas 24 h',
    unit: 'h',
    type: 'number',
    section: 'Bienestar',
    min: 0,
    max: 16,
    step: 0.1,
    help: 'Opcional. Objetivo del proyecto: 7.0–8.5 h.',
  },
  {
    key: 'stress_level',
    label: 'Estrés subjetivo',
    unit: '%',
    type: 'number',
    section: 'Bienestar',
    min: 0,
    max: 100,
    step: 1,
    help: 'Opcional. Referencia: 0–35 % nominal.',
  },
];

export const CATEGORY_SCHEMAS = {
  astronaut: [
    { ...COMMON_ID, section: 'Identificación', optionsSource: 'crew', help: 'Selecciona el tripulante cuyo perfil se actualiza.' },
    { key: 'fullName', label: 'Nombre completo', type: 'text', section: 'Identificación', required: true, placeholder: 'Nombre y apellido' },
    { key: 'role', label: 'Rol de misión', type: 'text', section: 'Identificación', required: true, placeholder: 'Comandante, especialista biomédica…' },
    {
      key: 'activity',
      label: 'Actividad operativa',
      type: 'select',
      section: 'Identificación',
      required: true,
      options: [
        { value: 'EVA', label: 'EVA / actividad extravehicular' },
        { value: 'IVA', label: 'IVA / actividad intravehicular' },
        { value: 'REST', label: 'Descanso' },
        { value: 'REHAB', label: 'Rehabilitación' },
      ],
    },
    { key: 'age', label: 'Edad', unit: 'años', type: 'number', section: 'Demografía', min: 18, max: 80, step: 1, required: true },
    {
      key: 'sex',
      label: 'Sexo registrado',
      type: 'select',
      section: 'Demografía',
      options: [
        { value: 'F', label: 'Femenino' },
        { value: 'M', label: 'Masculino' },
        { value: 'O', label: 'Otro / no declarado' },
      ],
    },
    { key: 'heightCm', label: 'Altura', unit: 'cm', type: 'number', section: 'Demografía', min: 120, max: 230, step: 0.5 },
    { key: 'weightKg', label: 'Peso', unit: 'kg', type: 'number', section: 'Demografía', min: 35, max: 180, step: 0.1 },
    {
      key: 'bloodType',
      label: 'Grupo sanguíneo',
      type: 'select',
      section: 'Demografía',
      options: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((value) => ({ value, label: value })),
    },
    { key: 'missionDays', label: 'Días de misión acumulados', unit: 'días', type: 'number', section: 'Misión', min: 0, max: 1000, step: 1 },
    NOTES,
  ],
  vitals: [COMMON_ID, COMMON_TIME, ...VITAL_FIELDS, COMMON_ORIGIN, NOTES],
  telemetry: [
    COMMON_ID,
    COMMON_TIME,
    {
      key: 'source',
      label: 'Fuente de señal',
      type: 'select',
      section: 'Adquisición',
      required: true,
      options: [
        { value: 'ecg_lead_ii', label: 'ECG Lead II' },
        { value: 'ppg_wearable', label: 'PPG wearable' },
        { value: 'suit_sensor', label: 'Sensor de escafandra' },
        { value: 'manual_import', label: 'Importación manual' },
      ],
    },
    { key: 'sampling_hz', label: 'Frecuencia de muestreo', unit: 'Hz', type: 'number', section: 'Adquisición', min: 0.2, max: 2000, step: 0.1, required: true },
    { key: 'hrv_ms', label: 'Variabilidad cardíaca (HRV)', unit: 'ms', type: 'number', section: 'Señal', min: 5, max: 300, step: 1 },
    { key: 'signal_quality', label: 'Calidad de señal', unit: '%', type: 'number', section: 'Señal', min: 0, max: 100, step: 1 },
    {
      key: 'rhythm',
      label: 'Ritmo observado',
      type: 'select',
      section: 'Señal',
      options: [
        { value: 'sinus', label: 'Sinusal' },
        { value: 'sinus_bradycardia', label: 'Bradicardia sinusal' },
        { value: 'sinus_tachycardia', label: 'Taquicardia sinusal' },
        { value: 'arrhythmia', label: 'Arritmia no especificada' },
      ],
    },
    COMMON_ORIGIN,
    NOTES,
  ],
  ecg: [
    COMMON_ID,
    COMMON_TIME,
    {
      key: 'rhythm',
      label: 'Ritmo',
      type: 'select',
      section: 'Electrocardiograma',
      required: true,
      options: [
        { value: 'sinus', label: 'Sinusal' },
        { value: 'sinus_bradycardia', label: 'Bradicardia sinusal' },
        { value: 'sinus_tachycardia', label: 'Taquicardia sinusal' },
        { value: 'atrial_fibrillation', label: 'Fibrilación auricular' },
        { value: 'premature_beats', label: 'Extrasístoles' },
        { value: 'ventricular_tachycardia', label: 'Taquicardia ventricular' },
        { value: 'other', label: 'Otro / no concluyente' },
      ],
    },
    { key: 'heart_rate', label: 'Frecuencia cardíaca', unit: 'bpm', type: 'number', section: 'Electrocardiograma', min: 25, max: 260, step: 1 },
    { key: 'pr_ms', label: 'Intervalo PR', unit: 'ms', type: 'number', section: 'Intervalos', min: 60, max: 400, step: 1 },
    { key: 'qrs_ms', label: 'Duración QRS', unit: 'ms', type: 'number', section: 'Intervalos', min: 40, max: 240, step: 1 },
    { key: 'qtc_ms', label: 'QT corregido', unit: 'ms', type: 'number', section: 'Intervalos', min: 200, max: 600, step: 1 },
    {
      key: 'st_segment',
      label: 'Segmento ST',
      type: 'select',
      section: 'Interpretación',
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'elevation', label: 'Elevación' },
        { value: 'depression', label: 'Depresión' },
        { value: 'indeterminate', label: 'Indeterminado' },
      ],
    },
    { key: 'interpretation', label: 'Interpretación', type: 'textarea', section: 'Interpretación', rows: 3, placeholder: 'Hallazgos y contexto clínico…' },
    COMMON_ORIGIN,
    NOTES,
  ],
  environment: [
    COMMON_TIME,
    {
      key: 'o2Pct',
      label: 'Oxígeno (O₂)',
      unit: '%',
      type: 'number',
      section: 'Atmósfera',
      min: 10,
      max: 30,
      step: 0.1,
      help: 'Referencia operativa del proyecto: ≈21 %.',
    },
    { key: 'co2MmHg', label: 'Dióxido de carbono (CO₂)', unit: 'mmHg', type: 'number', section: 'Atmósfera', min: 0, max: 20, step: 0.1, help: 'Referencia del proyecto: <4 mmHg.' },
    { key: 'pressureKpa', label: 'Presión de cabina', unit: 'kPa', type: 'number', section: 'Atmósfera', min: 40, max: 110, step: 0.1, help: 'Referencia: ≈101.3 kPa.' },
    { key: 'cabinTempC', label: 'Temperatura de cabina', unit: '°C', type: 'number', section: 'Atmósfera', min: -20, max: 60, step: 0.1 },
    { key: 'humidityPct', label: 'Humedad relativa', unit: '%', type: 'number', section: 'Atmósfera', min: 0, max: 100, step: 1 },
    { key: 'aqi', label: 'Calidad de aire (índice)', type: 'number', section: 'Calidad ambiental', min: 0, max: 500, step: 1, help: 'Índice configurable de partículas/VOC.' },
    { key: 'regolithIndex', label: 'Regolito / partículas', type: 'number', section: 'Calidad ambiental', min: 0, max: 100, step: 1, help: 'Índice configurable 0–100.' },
    { key: 'radiationRateMsvDay', label: 'Tasa de radiación', unit: 'mSv/día', type: 'number', section: 'Radiación', min: 0, max: 20, step: 0.01 },
    { key: 'cumulativeRadiationMsv', label: 'Dosis acumulada', unit: 'mSv', type: 'number', section: 'Radiación', min: 0, max: 2000, step: 0.1 },
    { key: 'earthDistanceMkm', label: 'Distancia a la Tierra', unit: 'Mkm', type: 'number', section: 'Enlace', min: 0, max: 1000, step: 0.001 },
    { key: 'commDelayMin', label: 'Retardo de comunicación', unit: 'min', type: 'number', section: 'Enlace', min: 0, max: 60, step: 0.1 },
    COMMON_ORIGIN,
    NOTES,
  ],
  simulation: [
    COMMON_TIME,
    {
      key: 'scenario',
      label: 'Escenario fisiológico',
      type: 'select',
      section: 'Escenario',
      optionsSource: 'scenarios',
      required: true,
    },
    {
      key: 'environmentId',
      label: 'Entorno espacial',
      type: 'select',
      section: 'Escenario',
      optionsSource: 'environments',
      required: true,
    },
    { key: 'durationMin', label: 'Duración de la prueba', unit: 'min', type: 'number', section: 'Escenario', min: 1, max: 10080, step: 1, required: true },
    { key: 'gravityG', label: 'Gravedad', unit: 'G', type: 'number', section: 'Condiciones iniciales', min: 0, max: 3, step: 0.01 },
    { key: 'radiationRateMsvDay', label: 'Tasa de radiación', unit: 'mSv/día', type: 'number', section: 'Condiciones iniciales', min: 0, max: 20, step: 0.01 },
    { key: 'cumulativeRadiationMsv', label: 'Dosis acumulada', unit: 'mSv', type: 'number', section: 'Condiciones iniciales', min: 0, max: 2000, step: 0.1 },
    { key: 'o2Pct', label: 'Oxígeno', unit: '%', type: 'number', section: 'Condiciones ambientales', min: 10, max: 30, step: 0.1 },
    { key: 'co2MmHg', label: 'CO₂', unit: 'mmHg', type: 'number', section: 'Condiciones ambientales', min: 0, max: 20, step: 0.1 },
    { key: 'cabinTempC', label: 'Temperatura de cabina', unit: '°C', type: 'number', section: 'Condiciones ambientales', min: -20, max: 60, step: 0.1 },
    { key: 'isolationDays', label: 'Días de aislamiento', unit: 'días', type: 'number', section: 'Variables RIDGE', min: 0, max: 1000, step: 1 },
    { key: 'sleepHours', label: 'Sueño', unit: 'h', type: 'number', section: 'Variables RIDGE', min: 0, max: 16, step: 0.1 },
    { key: 'stressLevel', label: 'Estrés subjetivo', unit: '%', type: 'number', section: 'Variables RIDGE', min: 0, max: 100, step: 1 },
    { key: 'moodScore', label: 'Estado de ánimo', unit: '1–10', type: 'number', section: 'Variables RIDGE', min: 1, max: 10, step: 1 },
    { key: 'socialContactsPerWeek', label: 'Contactos sociales', unit: '/semana', type: 'number', section: 'Variables RIDGE', min: 0, max: 50, step: 1 },
    { key: 'autonomyPct', label: 'Autonomía operativa', unit: '%', type: 'number', section: 'Variables RIDGE', min: 0, max: 100, step: 1 },
    { key: 'medicalStockPct', label: 'Stock médico', unit: '%', type: 'number', section: 'Variables RIDGE', min: 0, max: 100, step: 1 },
    { key: 'result', label: 'Resultados / observaciones de la prueba', type: 'textarea', section: 'Resultado', rows: 3, placeholder: 'Comportamiento observado, conclusiones o incidencias…' },
    {
      key: 'applyToSimulator',
      label: 'Aplicar este escenario al simulador al guardar',
      type: 'checkbox',
      section: 'Resultado',
      help: 'Si se activa, el escenario y el entorno del simulador se actualizan con este registro.',
    },
    COMMON_ORIGIN,
    NOTES,
  ],
};

export function getSchema(category) {
  return CATEGORY_SCHEMAS[category] || [];
}

export function groupFieldsBySection(fields = []) {
  const groups = [];
  fields.forEach((field) => {
    const section = field.section || 'General';
    let group = groups.find((item) => item.title === section);
    if (!group) {
      group = { title: section, fields: [] };
      groups.push(group);
    }
    group.fields.push(field);
  });
  return groups;
}

export function buildDefaults(category, context = {}) {
  const {
    astronautId,
    latestSample,
    environment,
    scenario = 'microgravity',
    riskInputs = {},
    crew = {},
  } = context;
  const env = environment || getEnvironment('transit');
  const defaults = {
    recordedAt: toLocalInputValue(),
    origin: category === 'simulation' ? 'simulated' : 'manual',
    astronautId,
  };

  if (category === 'astronaut' && astronautId && crew[astronautId]) {
    const profile = crew[astronautId];
    defaults.fullName = profile.name || '';
    defaults.role = profile.role || '';
    defaults.activity = profile.activity || 'IVA';
    defaults.age = profile.age ?? '';
    defaults.sex = profile.sex || '';
    defaults.heightCm = profile.heightCm ?? '';
    defaults.weightKg = profile.weightKg ?? '';
    defaults.bloodType = profile.bloodType || '';
    defaults.missionDays = profile.missionDays ?? 62;
  }

  if (category === 'simulation') {
    defaults.scenario = scenario;
    defaults.environmentId = env.id;
    defaults.durationMin = 120;
    defaults.gravityG = riskInputs.gravityG ?? env.gravityG;
    defaults.radiationRateMsvDay = riskInputs.radiationRateMsvDay ?? env.radiationDailyMsv;
    defaults.cumulativeRadiationMsv = riskInputs.cumulativeRadiationMsv ?? '';
    defaults.o2Pct = riskInputs.o2Pct ?? env.o2Pct;
    defaults.co2MmHg = riskInputs.co2MmHg ?? env.co2MmHg;
    defaults.cabinTempC = riskInputs.cabinTempC ?? env.cabinTempC;
    defaults.isolationDays = riskInputs.isolationDays ?? 62;
    defaults.sleepHours = riskInputs.sleepHours ?? latestSample?.sleep_hours ?? 7.8;
    defaults.stressLevel = riskInputs.stressLevel ?? latestSample?.stress_level ?? 18;
    defaults.moodScore = riskInputs.moodScore ?? 7;
    defaults.socialContactsPerWeek = riskInputs.socialContactsPerWeek ?? 3;
    defaults.autonomyPct = riskInputs.autonomyPct ?? env.autonomyPct;
    defaults.medicalStockPct = riskInputs.medicalStockPct ?? env.medicalStockPct;
  }

  return defaults;
}

const NUMERIC_TYPES = new Set(['number']);

function isEmpty(value) {
  return value === undefined || value === null || value === '';
}

export function validateRecord(category, data = {}) {
  const fields = getSchema(category);
  const errors = {};

  fields.forEach((field) => {
    const value = data[field.key];
    if (field.required && isEmpty(value) && field.type !== 'checkbox') {
      errors[field.key] = 'Campo obligatorio.';
      return;
    }
    if (isEmpty(value)) return;
    if (NUMERIC_TYPES.has(field.type)) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors[field.key] = 'Introduce un valor numérico válido.';
        return;
      }
      if (field.min !== undefined && numeric < field.min) {
        errors[field.key] = `El valor mínimo es ${field.min}${field.unit ? ` ${field.unit}` : ''}.`;
      }
      if (field.max !== undefined && numeric > field.max) {
        errors[field.key] = `El valor máximo es ${field.max}${field.unit ? ` ${field.unit}` : ''}.`;
      }
    }
    if (field.type === 'text' && String(value).trim().length === 0) {
      errors[field.key] = 'Campo obligatorio.';
    }
  });

  if (category === 'vitals') {
    const requiredVitals = ['heart_rate', 'spo2', 'temperature', 'respiratory_rate'];
    const missing = requiredVitals.filter((key) => isEmpty(data[key]));
    if (missing.length) {
      requiredVitals.forEach((key) => {
        if (isEmpty(data[key])) errors[key] = 'Los cuatro signos vitales principales son obligatorios.';
      });
    }
  }

  return errors;
}

export function normalizeRecordData(category, data = {}) {
  const fields = getSchema(category);
  const normalized = {};
  fields.forEach((field) => {
    const value = data[field.key];
    if (field.type === 'checkbox') {
      normalized[field.key] = Boolean(value);
      return;
    }
    if (isEmpty(value)) return;
    if (NUMERIC_TYPES.has(field.type)) {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) normalized[field.key] = numeric;
      return;
    }
    if (field.type === 'text' || field.type === 'textarea') {
      normalized[field.key] = String(value).trim();
      return;
    }
    normalized[field.key] = value;
  });
  normalized.recordedAt = toIso(normalized.recordedAt || new Date());
  normalized.origin = normalized.origin || (category === 'simulation' ? 'simulated' : 'manual');
  return normalized;
}

function summaryFor(category, data) {
  if (category === 'vitals') {
    return `HR ${data.heart_rate ?? '--'} bpm · SpO₂ ${data.spo2 ?? '--'} % · T ${data.temperature ?? '--'} °C · RR ${data.respiratory_rate ?? '--'} rpm`;
  }
  if (category === 'astronaut') {
    return `${data.fullName || 'Tripulante'} · ${data.role || 'rol sin definir'} · ${data.activity || 'IVA'}`;
  }
  if (category === 'telemetry') {
    return `${data.source || 'fuente'} · ${data.sampling_hz ?? '--'} Hz · calidad ${data.signal_quality ?? '--'} %`;
  }
  if (category === 'ecg') {
    return `${data.rhythm || 'ritmo'} · PR ${data.pr_ms ?? '--'} ms · QRS ${data.qrs_ms ?? '--'} ms · QTc ${data.qtc_ms ?? '--'} ms`;
  }
  if (category === 'environment') {
    return `O₂ ${data.o2Pct ?? '--'} % · CO₂ ${data.co2MmHg ?? '--'} mmHg · ${data.pressureKpa ?? '--'} kPa · ${data.cabinTempC ?? '--'} °C`;
  }
  if (category === 'simulation') {
    return `${data.scenario || 'escenario'} · ${data.environmentId || 'entorno'} · ${data.durationMin ?? '--'} min`;
  }
  return 'Registro';
}

export function createRecord({ category, data, existing }) {
  const now = new Date().toISOString();
  const normalized = normalizeRecordData(category, data);
  return {
    id: existing?.id || createId('rec'),
    category,
    title: summaryFor(category, normalized),
    astronautId: normalized.astronautId || null,
    origin: normalized.origin,
    recordedAt: normalized.recordedAt,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    data: normalized,
  };
}

export function sortRecords(records = []) {
  return [...records].sort((a, b) => {
    const aTime = new Date(a.recordedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.recordedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export function getLatestRecord(records = [], category, astronautId) {
  const filtered = records.filter((record) => {
    if (record.category !== category) return false;
    if (astronautId && record.astronautId && record.astronautId !== astronautId) return false;
    return true;
  });
  return sortRecords(filtered)[0] || null;
}

export function getLatestRecordsByCategory(records = []) {
  return RECORD_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = getLatestRecord(records, category.id);
    return acc;
  }, {});
}

export function mergeCrewProfiles(seed = {}, records = []) {
  const crew = Object.entries(seed).reduce((acc, [id, profile]) => {
    acc[id] = {
      id,
      name: profile.name,
      role: profile.role,
      activity: profile.activity,
      age: profile.age ?? null,
      sex: profile.sex || null,
      heightCm: profile.heightCm ?? null,
      weightKg: profile.weightKg ?? null,
      bloodType: profile.bloodType || null,
      missionDays: profile.missionDays ?? 62,
    };
    return acc;
  }, {});

  // sortRecords devuelve de más reciente a más antiguo; se recorre al revés
  // para que el registro más reciente sea el que prevalezca.
  sortRecords(records.filter((record) => record.category === 'astronaut'))
    .reverse()
    .forEach((record) => {
      const data = record.data || {};
      const id = data.astronautId;
      if (!id) return;
      crew[id] = {
        ...(crew[id] || { id }),
        id,
        name: data.fullName || crew[id]?.name || id,
        role: data.role || crew[id]?.role || 'Tripulante',
        activity: data.activity || crew[id]?.activity || 'IVA',
        age: data.age ?? crew[id]?.age ?? null,
        sex: data.sex ?? crew[id]?.sex ?? null,
        heightCm: data.heightCm ?? crew[id]?.heightCm ?? null,
        weightKg: data.weightKg ?? crew[id]?.weightKg ?? null,
        bloodType: data.bloodType ?? crew[id]?.bloodType ?? null,
        missionDays: data.missionDays ?? crew[id]?.missionDays ?? 62,
      };
    });

  return crew;
}

export function summarizeRecords(records = []) {
  const byCategory = RECORD_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = 0;
    return acc;
  }, {});
  const byOrigin = ORIGIN_OPTIONS.reduce((acc, origin) => {
    acc[origin.value] = 0;
    return acc;
  }, {});

  records.forEach((record) => {
    if (byCategory[record.category] !== undefined) byCategory[record.category] += 1;
    if (byOrigin[record.origin] !== undefined) byOrigin[record.origin] += 1;
  });

  return {
    total: records.length,
    byCategory,
    byOrigin,
    latest: sortRecords(records)[0] || null,
  };
}

export function recordToExport(record) {
  return {
    id: record.id,
    category: record.category,
    origin: record.origin,
    recordedAt: record.recordedAt,
    astronautId: record.astronautId,
    data: record.data,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

export const ECG_ABNORMAL_RHYTHMS = {
  sinus_bradycardia: { label: 'Bradicardia sinusal', severity: 'info' },
  sinus_tachycardia: { label: 'Taquicardia sinusal', severity: 'warning' },
  atrial_fibrillation: { label: 'Fibrilación auricular', severity: 'critical' },
  premature_beats: { label: 'Extrasístoles', severity: 'warning' },
  ventricular_tachycardia: { label: 'Taquicardia ventricular', severity: 'emergency' },
  other: { label: 'Ritmo no concluyente', severity: 'info' },
};
