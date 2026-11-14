/**
 * NSA — Modelos Fisiológicos y Fundamentos Biomédicos (JavaScript / ES Module)
 * Equipo 1: Ciencias e Investigación
 */

export class PhysiologicalModels {
  /**
   * Frecuencia Cardíaca (HR en bpm) según carga metabólica (Watts) y estrés.
   */
  static calculateHeartRate(metabolicRateWatts, stressLevel = 0.0, baselineHr = 70.0) {
    const basalWatts = 75.0;
    const deltaWork = Math.max(0.0, metabolicRateWatts - basalWatts);
    const kWork = 0.28;
    const kStress = 35.0;

    const hr = baselineHr + (kWork * deltaWork) + (kStress * stressLevel);
    return Math.max(40.0, Math.min(200.0, hr));
  }

  /**
   * Saturación de Oxígeno (SpO2 en %) según presión ambiental y fracción de O2 (Ecuación de Hill).
   */
  static calculateSpO2(ambientPressureKpa, o2Fraction = 0.21) {
    const waterVaporPressure = 6.27; // kPa a 37°C
    const dryPressure = Math.max(10.0, ambientPressureKpa - waterVaporPressure);
    const pao2 = dryPressure * o2Fraction - (5.33 / 0.8);

    const n = 2.7;
    const p50 = 3.6; // kPa

    if (pao2 <= 0) return 50.0;

    const saturation = (Math.pow(pao2, n) / (Math.pow(p50, n) + Math.pow(pao2, n))) * 100.0;
    return Math.max(60.0, Math.min(100.0, saturation));
  }

  /**
   * Temperatura central (°C) mediante balance térmico de escafandra (Metabolismo vs LCVG).
   */
  static calculateCoreTemperature(ambientTempC, lcvgCoolingRate, metabolicWatts, baseTemp = 36.6) {
    const coolingWatts = lcvgCoolingRate * 250.0;
    const netHeatWatts = metabolicWatts - coolingWatts;
    const tempDelta = netHeatWatts * 0.003;
    const finalTemp = baseTemp + tempDelta;
    return Math.max(34.0, Math.min(41.5, finalTemp));
  }

  /**
   * Frecuencia Respiratoria (RR en rpm) modulada por nivel de CO2 y esfuerzo.
   */
  static calculateRespiratoryRate(paco2Mmhg, exerciseIntensity = 0.0, baselineRr = 14.0) {
    const normalPaco2 = 40.0;
    const deltaCo2 = Math.max(0.0, paco2Mmhg - normalPaco2);
    const rr = baselineRr + (deltaCo2 * 0.8) + (exerciseIntensity * 8.0);
    return Math.max(8.0, Math.min(45.0, rr));
  }
}
