/**
 * Entornos operativos de misión.
 *
 * Los valores de gravedad, radiación, latencia y composición ambiental son
 * parámetros de simulación del proyecto. No sustituyen telemetría ECLSS real
 * ni límites oficiales de la NASA.
 */

export const ENVIRONMENTS = [
  {
    id: 'transit',
    name: 'Nave en Tránsito a Marte (Deep Space Transport)',
    shortName: 'Tránsito Interplanetario',
    iconName: 'rocket',
    color: '#1D4ED8',
    gravityG: 0.0,
    gravityText: '0.00 G (Microgravedad Pura)',
    ambientPressureKpa: 101.3,
    cabinPressureKpa: 101.3,
    radiationRateUsVh: 75.0,
    radiationDailyMsv: 1.8,
    commDelaySeconds: 870,
    commDelayText: '14.5 min (Retardo Tierra-Marte)',
    autonomyRequirement: 'TOTAL (Sin telecirugía ni asistencia en vivo)',
    autonomyPct: 98,
    habitatVolume: '68 m³ (Confinamiento Extremo)',
    earthDistanceMkm: 225,
    evacuationHours: 168,
    medicalStockPct: 82,
    o2Pct: 21.0,
    co2MmHg: 3.1,
    cabinTempC: 22.0,
    humidityPct: 45,
    aqi: 18,
    regolithIndex: 5,
    elevatedHazards: [
      { name: 'Radiación Cósmica (R)', detail: 'Exposición continua a Rayos Cósmicos Galácticos (GCR) sin la magnetosfera terrestre.' },
      { name: 'Distancia de la Tierra (D)', detail: 'Retardo de 14.5 min en comunicaciones; la tripulación debe autogestionar toda emergencia médica.' },
      { name: 'Gravedad Cero (G)', detail: 'Pérdida acelerada de densidad ósea (1.0–1.5 %/mes) y atrofia muscular antigravitatoria.' },
    ],
  },
  {
    id: 'station',
    name: 'Estación Orbital (Lunar Gateway / ISS)',
    shortName: 'Estación Orbital',
    iconName: 'satellite',
    color: '#0EA5E9',
    gravityG: 0.0,
    gravityText: '0.00 G (Microgravedad)',
    ambientPressureKpa: 101.3,
    cabinPressureKpa: 101.3,
    radiationRateUsVh: 22.0,
    radiationDailyMsv: 0.5,
    commDelaySeconds: 1.3,
    commDelayText: '1.3 seg (Soporte Directo Houston)',
    autonomyRequirement: 'MODERADA (Telemedicina asistida en tiempo real)',
    autonomyPct: 55,
    habitatVolume: '388 m³ (Multimódulo)',
    earthDistanceMkm: 0.0004,
    evacuationHours: 6,
    medicalStockPct: 95,
    o2Pct: 21.0,
    co2MmHg: 2.8,
    cabinTempC: 22.5,
    humidityPct: 45,
    aqi: 12,
    regolithIndex: 2,
    elevatedHazards: [
      { name: 'Desplazamiento Cefálico (G)', detail: 'Riesgo de SANS por redistribución de fluidos hacia la cabeza en microgravedad.' },
      { name: 'Entorno Cerrado (E)', detail: '16 amaneceres y puestas de sol cada 24 horas; pérdida del ritmo circadiano natural.' },
    ],
  },
  {
    id: 'rover',
    name: 'Vehículo Explorador Presurizado (Mars Rover)',
    shortName: 'Rover Superficial',
    iconName: 'truck',
    color: '#0369A1',
    gravityG: 0.38,
    gravityText: '0.38 G (Gravedad Marciana)',
    ambientPressureKpa: 0.6,
    cabinPressureKpa: 101.3,
    radiationRateUsVh: 45.0,
    radiationDailyMsv: 1.1,
    commDelaySeconds: 870,
    commDelayText: '14.5 min (Enlace diferido)',
    autonomyRequirement: 'ALTA (Cabina biplaza en expedición)',
    autonomyPct: 90,
    habitatVolume: '22 m³ (Alta exigencia ergonómica)',
    earthDistanceMkm: 225,
    evacuationHours: 168,
    medicalStockPct: 70,
    o2Pct: 21.0,
    co2MmHg: 3.5,
    cabinTempC: 23.0,
    humidityPct: 40,
    aqi: 30,
    regolithIndex: 55,
    elevatedHazards: [
      { name: 'Entornos Hostiles (E)', detail: 'Polvillo de regolito marciano abrasivo y tóxico al ingresar tras paseos EVA.' },
      { name: 'Fatiga Muscular (G + E)', detail: 'Sobrecarga física por caminar en gravedad 0.38 G con escafandra pesada de exploración.' },
    ],
  },
  {
    id: 'base',
    name: 'Base Planetaria Superficial (Artemis Base Camp / Mars Hab)',
    shortName: 'Base Planetaria',
    iconName: 'building',
    color: '#1E40AF',
    gravityG: 0.38,
    gravityText: '0.38 G (Gravedad Parcial Marciana)',
    ambientPressureKpa: 0.6,
    cabinPressureKpa: 101.3,
    radiationRateUsVh: 15.0,
    radiationDailyMsv: 0.36,
    commDelaySeconds: 870,
    commDelayText: '14.5 min (Consulta diferida)',
    autonomyRequirement: 'ALTA (Infraestructura médica de hábitat)',
    autonomyPct: 85,
    habitatVolume: '450 m³ (Bóvedas con regolito)',
    earthDistanceMkm: 225,
    evacuationHours: 168,
    medicalStockPct: 88,
    o2Pct: 21.0,
    co2MmHg: 3.0,
    cabinTempC: 22.0,
    humidityPct: 45,
    aqi: 25,
    regolithIndex: 35,
    elevatedHazards: [
      { name: 'Aislamiento Crónico (I)', detail: 'Misiones de superficie de más de 500 días; riesgo de depresión y desgaste interpersonal.' },
      { name: 'Gravedad Parcial (G)', detail: 'Adaptación ósea intermedia: pérdida menor que en 0 G, pero se requiere ejercicio resistivo continuo.' },
    ],
  },
];

export const ENVIRONMENT_MAP = ENVIRONMENTS.reduce((acc, environment) => {
  acc[environment.id] = environment;
  return acc;
}, {});

export function getEnvironment(id) {
  return ENVIRONMENT_MAP[id] || ENVIRONMENT_MAP.transit;
}

export function getEnvironmentLabel(id) {
  const environment = getEnvironment(id);
  return environment.shortName || environment.name;
}
