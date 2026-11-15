/**
 * Capa clínica de referencia.
 *
 * Fuente documental primaria: docs/DATA_DICTIONARY.md.
 * Los rangos nominales/advertencia/críticos de las cuatro constantes
 * monitorizadas se corresponden con ese documento del proyecto. Los umbrales
 * de "emergencia" se marcan explícitamente como configurables para simulación
 * y NO se presentan como límites oficiales de la NASA.
 *
 * Las recomendaciones son criterios clínicos generales de soporte y no
 * sustituyen la valoración de un profesional sanitario.
 */

export const SEVERITY_LEVELS = {
  normal: { id: 'normal', label: 'Nominal', order: 0, tone: 'nominal', color: '#34D399' },
  info: { id: 'info', label: 'Informativa', order: 1, tone: 'info', color: '#22D3EE' },
  warning: { id: 'warning', label: 'Advertencia', order: 2, tone: 'warning', color: '#FBBF24' },
  critical: { id: 'critical', label: 'Crítica', order: 3, tone: 'critical', color: '#FB7185' },
  emergency: { id: 'emergency', label: 'Emergencia', order: 4, tone: 'emergency', color: '#F43F5E' },
};

export const ALERTABLE_VITALS = ['heart_rate', 'spo2', 'temperature', 'respiratory_rate'];

const GENERAL_DISCLAIMER =
  'Criterio clínico general de apoyo; no sustituye la evaluación de un profesional de la salud.';

function recommendation(title, detail) {
  return { title, detail, basis: GENERAL_DISCLAIMER };
}

export const VITAL_REFERENCES = {
  heart_rate: {
    key: 'heart_rate',
    label: 'Frecuencia cardíaca',
    short: 'HR',
    unit: 'bpm',
    nominal: [60, 100],
    normalRangeLabel: '60 – 100 bpm',
    warningRangeLabel: '50 – 59 · 101 – 120 bpm',
    criticalRangeLabel: '< 50 · > 120 bpm',
    emergencyRangeLabel: '< 40 · > 150 bpm (configurable)',
    bands: [
      { max: 40, severity: 'emergency', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 50, severity: 'critical', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 60, severity: 'warning', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 100, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 120, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 150, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh:
      'Taquicardia: el corazón late por encima del rango nominal. En vuelo espacial puede reflejar esfuerzo, estrés adrenérgico, hipoxia incipiente, fiebre o desacondicionamiento cardiovascular.',
    explanationLow:
      'Bradicardia: el corazón late por debajo del rango nominal. Puede asociarse a tono vagal elevado, hipotermia, hipercapnia, fármacos o alteraciones de conducción.',
    recommendationsHigh: [
      recommendation(
        'Suspender la actividad física y asegurar el anclaje del tripulante.',
        'Reduce la demanda miocárdica mientras se confirma la lectura con ECG y presión arterial.',
      ),
      recommendation(
        'Aplicar respiración diafragmática guiada y comprobar hidratación/electrolitos.',
        'Contramedida de bajo riesgo para modular la respuesta adrenérgica y el volumen circulante.',
      ),
      recommendation(
        'Revisar ECG, SpO₂, temperatura y contexto de la actividad; si persiste, abortar la EVA y contactar al Flight Surgeon.',
        'La elevación sostenida en un entorno autónomo exige descartar hipoxia, fiebre o arritmia.',
      ),
    ],
    recommendationsLow: [
      recommendation(
        'Confirmar la lectura con el sensor y el ECG antes de intervenir.',
        'Distingue bradicardia real de artefacto de señal o desconexión.',
      ),
      recommendation(
        'Verificar el absorbedor de CO₂, la temperatura corporal y el nivel de consciencia.',
        'La hipercapnia y la hipotermia son causas reversibles relevantes en un hábitat cerrado.',
      ),
      recommendation(
        'Si hay mareo, síncope o bradicardia sostenida, activar evaluación médica y soporte hemodinámico.',
        'Requiere valoración del Flight Surgeon y del protocolo de emergencia disponible a bordo.',
      ),
    ],
    protocolId: 'tachycardia',
    source: 'docs/DATA_DICTIONARY.md',
  },
  spo2: {
    key: 'spo2',
    label: 'Saturación de oxígeno (SpO₂)',
    short: 'SpO₂',
    unit: '%',
    nominal: [95, 100],
    normalRangeLabel: '95 – 100 %',
    warningRangeLabel: '90 – 94.9 %',
    criticalRangeLabel: '< 90 %',
    emergencyRangeLabel: '< 85 % (configurable)',
    bands: [
      { max: 85, severity: 'emergency', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 90, severity: 'critical', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 95, severity: 'warning', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 100, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'warning', direction: 'high', basis: 'Lectura fuera del rango físico; revisar sensor' },
    ],
    explanationHigh:
      'Lectura por encima del 100 %: normalmente indica un artefacto de medición o calibración del sensor. Confirmar la señal antes de interpretar el dato.',
    explanationLow:
      'Hipoxemia: la saturación capilar está por debajo del rango nominal. En espacio puede deberse a baja presión de escafandra, fuga, fallo del ECLSS o hipoventilación.',
    recommendationsHigh: [
      recommendation(
        'Verificar la colocación y calibración del pulsioxímetro.',
        'Una lectura imposible debe tratarse primero como un problema de señal.',
      ),
    ],
    recommendationsLow: [
      recommendation(
        'Confirmar la señal y la perfusión periférica; comparar con la telemetría de la escafandra.',
        'Evita actuar sobre un artefacto de movimiento o mala perfusión.',
      ),
      recommendation(
        'Activar el suministro secundario de oxígeno y revisar la presión del traje o de la cabina.',
        'Contramedida inmediata frente a hipoxia por despresurización o fallo del soporte vital.',
      ),
      recommendation(
        'Si la SpO₂ permanece < 90 %, abortar la EVA, represurizar y preparar soporte ventilatorio.',
        'La hipoxia severa es una emergencia con deterioro cognitivo rápido en un entorno autónomo.',
      ),
    ],
    protocolId: 'hypoxia',
    source: 'docs/DATA_DICTIONARY.md',
  },
  temperature: {
    key: 'temperature',
    label: 'Temperatura corporal',
    short: 'TEMP',
    unit: '°C',
    nominal: [36.1, 37.2],
    normalRangeLabel: '36.1 – 37.2 °C',
    warningRangeLabel: '35.5 – 36.0 · 37.3 – 38.0 °C',
    criticalRangeLabel: '< 35.5 · > 38.0 °C',
    emergencyRangeLabel: '< 34.5 · > 40.0 °C (configurable)',
    bands: [
      { max: 34.5, severity: 'emergency', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 35.5, severity: 'critical', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 36.1, severity: 'warning', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 37.2, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 38.0, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 40.0, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh:
      'Hipertermia: la temperatura central supera el rango nominal. En misión puede relacionarse con fallo de refrigeración del traje, exposición térmica, infección o estrés fisiológico.',
    explanationLow:
      'Hipotermia: la temperatura central está por debajo del rango nominal. Puede deberse a exposición al frío, pérdida de calor en el traje, fatiga o alteración metabólica.',
    recommendationsHigh: [
      recommendation(
        'Aumentar la refrigeración del traje (LCVG) y alejar al tripulante de la exposición solar directa.',
        'Contramedida operativa frente a sobrecalentamiento en EVA o fallo térmico.',
      ),
      recommendation(
        'Asegurar hidratación y retirar capas o equipos que impidan la disipación de calor.',
        'Favorece la termorregulación sin recurrir a fármacos.',
      ),
      recommendation(
        'Monitorizar consciencia, frecuencia cardíaca y temperatura cada 5 minutos; si supera 38.5 °C, activar evaluación médica.',
        'La hipertermia sostenida puede progresar a golpe de calor y disfunción multiorgánica.',
      ),
    ],
    recommendationsLow: [
      recommendation(
        'Confirmar la medición con un segundo sensor y proteger al tripulante del frío.',
        'Distingue hipotermia real de un artefacto de medición.',
      ),
      recommendation(
        'Aplicar calentamiento pasivo, manta térmica y líquidos templados si está consciente.',
        'Estrategia de recalentamiento gradual en un entorno controlado.',
      ),
      recommendation(
        'Si hay confusión, temblor intenso o temperatura < 35 °C, activar evaluación médica urgente.',
        'La hipotermia moderada/grave requiere soporte y seguimiento estrecho.',
      ),
    ],
    protocolId: 'hyperthermia',
    source: 'docs/DATA_DICTIONARY.md',
  },
  respiratory_rate: {
    key: 'respiratory_rate',
    label: 'Frecuencia respiratoria',
    short: 'RR',
    unit: 'rpm',
    nominal: [12, 20],
    normalRangeLabel: '12 – 20 rpm',
    warningRangeLabel: '10 – 11 · 21 – 24 rpm',
    criticalRangeLabel: '< 10 · > 24 rpm',
    emergencyRangeLabel: '< 8 · > 30 rpm (configurable)',
    bands: [
      { max: 8, severity: 'emergency', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 10, severity: 'critical', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 12, severity: 'warning', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 20, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 24, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 30, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh:
      'Taquipnea: la frecuencia respiratoria está elevada. Puede compensar hipoxia, hipercapnia, acidosis metabólica, ansiedad o sobreesfuerzo.',
    explanationLow:
      'Bradipnea: la frecuencia respiratoria está por debajo del rango nominal. Puede asociarse a depresión del centro respiratorio, fatiga, hipotermia o hipercapnia avanzada.',
    recommendationsHigh: [
      recommendation(
        'Verificar la presión parcial de CO₂ y el estado del absorbedor de la cabina o del traje.',
        'La hipercapnia es una causa frecuente y corregible de taquipnea en entornos cerrados.',
      ),
      recommendation(
        'Guiar respiración lenta y controlada; reducir la carga de trabajo y comprobar la SpO₂.',
        'Disminuye la demanda ventilatoria y ayuda a diferenciar ansiedad de causa orgánica.',
      ),
      recommendation(
        'Si la RR supera 24 rpm con disnea o desaturación, retirar al tripulante del entorno y activar evaluación médica.',
        'La insuficiencia respiratoria puede progresar rápidamente en un hábitat confinado.',
      ),
    ],
    recommendationsLow: [
      recommendation(
        'Comprobar consciencia, permeabilidad de la vía aérea y calidad de la señal.',
        'La bradipnea con deterioro del estado mental es una señal de alarma.',
      ),
      recommendation(
        'Revisar CO₂, temperatura y posible efecto de fármacos o fatiga.',
        'Orienta la causa y evita intervenciones innecesarias.',
      ),
      recommendation(
        'Si la RR es < 10 rpm o hay hipoventilación, activar soporte ventilatorio y evaluación médica urgente.',
        'Requiere soporte avanzado y monitorización continua.',
      ),
    ],
    protocolId: 'tachypnea',
    source: 'docs/DATA_DICTIONARY.md',
  },
  systolic_bp: {
    key: 'systolic_bp',
    label: 'Presión arterial sistólica',
    short: 'PAS',
    unit: 'mmHg',
    nominal: [90, 120],
    normalRangeLabel: '90 – 120 mmHg',
    warningRangeLabel: '121 – 139 mmHg',
    criticalRangeLabel: '< 90 · ≥ 140 mmHg',
    emergencyRangeLabel: '< 70 · > 180 mmHg (configurable)',
    bands: [
      { max: 70, severity: 'emergency', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 90, severity: 'critical', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 120, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 140, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 180, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh:
      'Presión sistólica elevada. En microgravedad puede reflejar redistribución de fluidos, estrés adrenérgico o pérdida transitoria del tono barorreceptor.',
    explanationLow:
      'Presión sistólica baja. Puede asociarse a hipovolemia, intolerancia ortostática, sepsis o efectos farmacológicos.',
    recommendationsHigh: [
      recommendation(
        'Reposo, verificación de la técnica de medida y control de sodio/hidratación.',
        'Reduce la variabilidad y evita interpretar una medición aislada.',
      ),
      recommendation(
        'Considerar contramedidas de redistribución de fluidos (LBNP/Chibis) si está disponible y procede.',
        'Contramedida documentada para el desplazamiento cefálico de fluidos.',
      ),
    ],
    recommendationsLow: [
      recommendation(
        'Tumbar al tripulante, elevar las piernas y comprobar hidratación.',
        'Primera respuesta ante hipotensión sintomática.',
      ),
      recommendation(
        'Buscar sangrado, infección o causa farmacológica y activar evaluación médica.',
        'La hipotensión con deterioro es una emergencia.',
      ),
    ],
    protocolId: 'hypertension',
    source: 'docs/DATA_DICTIONARY.md',
  },
  diastolic_bp: {
    key: 'diastolic_bp',
    label: 'Presión arterial diastólica',
    short: 'PAD',
    unit: 'mmHg',
    nominal: [60, 80],
    normalRangeLabel: '60 – 80 mmHg',
    warningRangeLabel: '81 – 89 mmHg',
    criticalRangeLabel: '< 60 · ≥ 90 mmHg',
    emergencyRangeLabel: '< 40 · > 120 mmHg (configurable)',
    bands: [
      { max: 40, severity: 'emergency', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 60, severity: 'critical', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 80, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 90, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 120, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh: 'Presión diastólica elevada; valorar junto con la sistólica y el contexto clínico.',
    explanationLow: 'Presión diastólica baja; valorar hipovolemia, sepsis o efecto farmacológico.',
    recommendationsHigh: [recommendation('Repetir la medición y valorar el conjunto sistólica/diastólica.', 'Una lectura aislada no define hipertensión.')],
    recommendationsLow: [recommendation('Comprobar perfusión, hidratación y estado general.', 'La hipotensión diastólica aislada requiere contexto.')],
    protocolId: 'hypertension',
    source: 'docs/DATA_DICTIONARY.md',
  },
  glucose: {
    key: 'glucose',
    label: 'Glucosa capilar',
    short: 'GLUC',
    unit: 'mg/dL',
    nominal: [70, 110],
    normalRangeLabel: '70 – 110 mg/dL',
    warningRangeLabel: '60 – 69 · 111 – 139 mg/dL',
    criticalRangeLabel: '< 60 · ≥ 140 mg/dL',
    emergencyRangeLabel: '< 50 · > 250 mg/dL (configurable)',
    bands: [
      { max: 50, severity: 'emergency', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 60, severity: 'critical', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 70, severity: 'warning', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 110, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 140, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 250, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh: 'Hiperglucemia: puede reflejar resistencia transitoria a la insulina, estrés metabólico o ajuste nutricional inadecuado.',
    explanationLow: 'Hipoglucemia: puede causar confusión, sudoración y síncope; requiere corrección rápida.',
    recommendationsHigh: [recommendation('Revisar la ración, la actividad y el perfil metabólico; hidratar sin azúcares añadidos.', 'Contextualiza la lectura antes de modificar tratamiento.')],
    recommendationsLow: [recommendation('Si está consciente, administrar 15 g de carbohidrato de absorción rápida y repetir la glucemia en 10–15 min.', 'Corrección estándar de hipoglucemia sintomática.')],
    protocolId: 'glucose',
    source: 'docs/DATA_DICTIONARY.md',
  },
  sleep_hours: {
    key: 'sleep_hours',
    label: 'Horas de sueño',
    short: 'SLEEP',
    unit: 'h',
    nominal: [7, 8.5],
    normalRangeLabel: '7.0 – 8.5 h',
    warningRangeLabel: '6.0 – 6.9 · 8.6 – 10.0 h',
    criticalRangeLabel: '< 6.0 · > 10.0 h',
    emergencyRangeLabel: '< 4.0 h (configurable)',
    bands: [
      { max: 4, severity: 'emergency', direction: 'low', basis: 'Umbral configurable de simulación' },
      { max: 6, severity: 'critical', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 7, severity: 'warning', direction: 'low', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 8.5, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 10, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
    ],
    explanationHigh: 'Sueño prolongado o alteración del ciclo; valorar fatiga, recuperación y calidad del descanso.',
    explanationLow: 'Déficit de sueño; se asocia a deterioro cognitivo, alteración circadiana y estrés de confinamiento.',
    recommendationsHigh: [recommendation('Revisar la calidad del sueño y el ritmo circadiano con luz y horarios regulares.', 'Contramedida de higiene del sueño.')],
    recommendationsLow: [recommendation('Priorizar 7–8.5 h de descanso, luz circadiana y reducción de carga nocturna.', 'Contramedida frente a la desincronización circadiana.')],
    protocolId: 'sleep',
    source: 'docs/DATA_DICTIONARY.md',
  },
  stress_level: {
    key: 'stress_level',
    label: 'Estrés subjetivo',
    short: 'STRESS',
    unit: '%',
    nominal: [0, 35],
    normalRangeLabel: '0 – 35 %',
    warningRangeLabel: '36 – 65 %',
    criticalRangeLabel: '> 65 %',
    emergencyRangeLabel: '> 85 % (configurable)',
    bands: [
      { max: 35, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 65, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 85, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh: 'Estrés elevado: puede afectar sueño, atención, variabilidad cardíaca y convivencia en confinamiento.',
    explanationLow: 'Estrés bajo.',
    recommendationsHigh: [recommendation('Activar check-in psicológico, pausa de recuperación y contacto con apoyo en Tierra.', 'Contramedida frente al riesgo de aislamiento y confinamiento.')],
    recommendationsLow: [],
    protocolId: 'confinement',
    source: 'docs/DATA_DICTIONARY.md',
  },
  onsd_mm: {
    key: 'onsd_mm',
    label: 'Diámetro de vaina del nervio óptico (ONSD)',
    short: 'ONSD',
    unit: 'mm',
    nominal: [4.5, 5.4],
    normalRangeLabel: '4.5 – 5.4 mm',
    warningRangeLabel: '5.5 – 5.8 mm',
    criticalRangeLabel: '> 5.8 mm',
    emergencyRangeLabel: '> 6.5 mm (configurable)',
    bands: [
      { max: 4.5, severity: 'warning', direction: 'low', basis: 'Umbral de referencia del diccionario' },
      { max: 5.4, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 5.8, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 6.5, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh: 'ONSD elevado: sugiere congestión venosa/edema asociado a SANS en microgravedad prolongada.',
    explanationLow: 'ONSD por debajo del rango de referencia; confirmar técnica ecográfica.',
    recommendationsHigh: [recommendation('Realizar ecografía ocular completa y valorar contramedidas de redistribución de fluidos.', 'El SANS requiere seguimiento y evaluación por especialista.')],
    recommendationsLow: [],
    protocolId: 'sans',
    source: 'docs/DATA_DICTIONARY.md',
  },
  bone_loss_monthly: {
    key: 'bone_loss_monthly',
    label: 'Pérdida de densidad ósea',
    short: 'BONE',
    unit: '%/mes',
    nominal: [0, 0.4],
    normalRangeLabel: '< 0.40 %/mes',
    warningRangeLabel: '0.41 – 0.90 %/mes',
    criticalRangeLabel: '> 0.90 %/mes',
    emergencyRangeLabel: '> 1.50 %/mes (configurable)',
    bands: [
      { max: 0.4, severity: 'normal', direction: 'normal', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 0.9, severity: 'warning', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: 1.5, severity: 'critical', direction: 'high', basis: 'Documentado (docs/DATA_DICTIONARY.md)' },
      { max: Infinity, severity: 'emergency', direction: 'high', basis: 'Umbral configurable de simulación' },
    ],
    explanationHigh: 'Pérdida ósea acelerada por ausencia de carga mecánica; aumenta el riesgo de osteopenia y cálculos renales.',
    explanationLow: 'Pérdida ósea dentro del objetivo.',
    recommendationsHigh: [recommendation('Mantener ejercicio resistivo (ARED) y revisar aporte de calcio/vitamina D.', 'Contramedida documentada frente a la desmineralización.')],
    recommendationsLow: [],
    protocolId: 'bone',
    source: 'docs/DATA_DICTIONARY.md',
  },
};

export function classifyValue(reference, value) {
  const numeric = Number(value);
  if (!reference || !Number.isFinite(numeric)) {
    return { severity: 'normal', direction: 'normal', basis: 'Sin dato válido' };
  }
  const band = reference.bands.find((item) => numeric <= item.max) || reference.bands[reference.bands.length - 1];
  return band;
}

export function evaluateVital(vitalKey, value) {
  const reference = VITAL_REFERENCES[vitalKey];
  if (!reference) {
    return {
      key: vitalKey,
      status: 'normal',
      severity: null,
      legacyStatus: 'normal',
      value,
      unit: '',
      referenceRange: '--',
      explanation: 'Parámetro sin referencia configurada.',
      recommendations: [],
      direction: 'normal',
    };
  }

  const numeric = Number(value);
  const valid = Number.isFinite(numeric);
  const band = classifyValue(reference, numeric);
  const severity = valid ? band.severity : 'warning';
  const direction = valid ? band.direction : 'normal';
  const normal = severity === 'normal';
  const explanation = valid
    ? normal
      ? 'Dentro del rango nominal documentado.'
      : direction === 'low'
        ? reference.explanationLow
        : reference.explanationHigh
    : 'Lectura no válida o sensor sin datos. Verificar la fuente antes de interpretar.';

  const recommendations = normal || !valid
    ? []
    : direction === 'low'
      ? reference.recommendationsLow
      : reference.recommendationsHigh;

  return {
    key: vitalKey,
    label: reference.label,
    short: reference.short,
    status: severity === 'normal' ? 'normal' : severity,
    severity: severity === 'normal' ? null : severity,
    legacyStatus: severity === 'normal' ? 'normal' : severity === 'warning' ? 'advertencia' : 'alerta',
    value: valid ? numeric : value,
    unit: reference.unit,
    direction,
    referenceRange: reference.normalRangeLabel,
    rangeDetail: `Nominal ${reference.normalRangeLabel} · Advertencia ${reference.warningRangeLabel} · Crítica ${reference.criticalRangeLabel}`,
    explanation,
    recommendations,
    basis: valid ? band.basis || reference.source : 'Sin dato válido',
    source: reference.source,
    protocolId: reference.protocolId,
    nominal: reference.nominal,
  };
}

export function evaluateAllVitals(sample = {}) {
  return ALERTABLE_VITALS.reduce((acc, vitalKey) => {
    acc[vitalKey] = evaluateVital(vitalKey, sample[vitalKey]);
    return acc;
  }, {});
}

export function evaluateExtendedVitals(sample = {}) {
  return Object.keys(VITAL_REFERENCES).reduce((acc, vitalKey) => {
    if (sample[vitalKey] === undefined || sample[vitalKey] === null || sample[vitalKey] === '') return acc;
    acc[vitalKey] = evaluateVital(vitalKey, sample[vitalKey]);
    return acc;
  }, {});
}

export function worstSeverity(evaluations = {}) {
  const items = Object.values(evaluations).filter(Boolean);
  if (!items.length) return 'normal';
  return items.reduce((worst, evaluation) => {
    const current = SEVERITY_LEVELS[worst]?.order ?? 0;
    const next = SEVERITY_LEVELS[evaluation.status]?.order ?? 0;
    return next > current ? evaluation.status : worst;
  }, 'normal');
}

export function severityAtLeast(severity, threshold) {
  return (SEVERITY_LEVELS[severity]?.order ?? 0) >= (SEVERITY_LEVELS[threshold]?.order ?? 0);
}

export function vitalStatusSummary(sample = {}) {
  const evaluations = evaluateAllVitals(sample);
  const worst = worstSeverity(evaluations);
  return {
    evaluations,
    worst,
    hasAlert: severityAtLeast(worst, 'critical'),
    hasWarning: worst === 'warning',
    hasEmergency: worst === 'emergency',
  };
}

export const CLINICAL_SOURCE_NOTE =
  'Rangos nominales, de advertencia y críticos tomados de docs/DATA_DICTIONARY.md. ' +
  'Los umbrales de emergencia y los valores simulados se señalan como configurables y no son límites oficiales de la NASA.';

export const RECOMMENDATION_DISCLAIMER = GENERAL_DISCLAIMER;
