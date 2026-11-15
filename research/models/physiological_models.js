/**
 * NSA — Modelos Fisiológicos y Fundamentos Biomédicos (JavaScript / ES Module)
 * Equipo 1: Ciencias e Investigación Aeroespacial (NASA HRP Standards)
 */

export class PhysiologicalModels {
  /**
   * Frecuencia Cardíaca (HR en bpm) según carga metabólica (Watts) y estrés adinámico.
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

  /**
   * Presión Arterial (Sistólica / Diastólica en mmHg).
   * Considera desplazamiento cefálico de fluidos en microgravedad, estrés y vasoconstricción.
   */
  static calculateBloodPressure(metabolicWatts, stressLevel = 0.0, microgravityDays = 30, baseSystolic = 118, baseDiastolic = 76) {
    // En microgravedad aguda hay elevación inicial de presión central por redistribución de 1.5-2L de fluido hacia tórax y cabeza
    const fluidShiftFactor = Math.min(6.0, microgravityDays * 0.2);
    const workFactor = Math.max(0.0, (metabolicWatts - 75.0) * 0.12);
    const stressFactor = stressLevel * 18.0;

    const systolic = Math.round(baseSystolic + fluidShiftFactor + workFactor + stressFactor);
    const diastolic = Math.round(baseDiastolic + (stressFactor * 0.5) + (workFactor * 0.3));

    return {
      systolic: Math.max(80, Math.min(210, systolic)),
      diastolic: Math.max(50, Math.min(130, diastolic)),
      meanArterialPressure: Number(((2 * diastolic + systolic) / 3).toFixed(1))
    };
  }

  /**
   * Nivel de Glucosa en Sangre (mg/dL).
   * Modulado por metabolismo espacial, resistencia a la insulina en ingravidez y gasto calórico.
   */
  static calculateBloodGlucose(hoursSinceMeal = 3.5, exerciseWatts = 95.0, stressLevel = 0.1, baseGlucose = 92.0) {
    // El ejercicio consume glucosa; el estrés libera cortisol/epinefrina aumentando la glucemia
    const exerciseBurn = (exerciseWatts - 75.0) * 0.08;
    const stressElevation = stressLevel * 25.0;
    const fastingDecay = (hoursSinceMeal - 2.0) * 2.5;

    const glucose = baseGlucose + stressElevation - exerciseBurn - (fastingDecay > 0 ? fastingDecay : 0);
    return Math.max(55.0, Math.min(220.0, Number(glucose.toFixed(1))));
  }

  /**
   * Calidad del Sueño y Alineación del Ritmo Circadiano (Puntuación 0 - 100).
   * Depende de horas de sueño, ruido ambiental en cabina (dB) y radiación solar.
   */
  static calculateSleepQuality(sleepDurationHours, cabinNoiseDb = 58.0, stressLevel = 0.1) {
    // 7.5 - 8.5 horas óptimas en microgravedad
    let durationScore = 100 - Math.abs(8.0 - sleepDurationHours) * 16;
    durationScore = Math.max(20, Math.min(100, durationScore));

    const noisePenalty = Math.max(0, (cabinNoiseDb - 50.0) * 0.8);
    const stressPenalty = stressLevel * 30.0;

    const score = Math.round(Math.max(10, Math.min(100, durationScore - noisePenalty - stressPenalty)));
    return {
      score,
      remCyclesEstimate: Math.max(1, Math.round(sleepDurationHours / 1.5)),
      status: score >= 80 ? "nominal" : score >= 60 ? "advertencia" : "alerta"
    };
  }

  /**
   * Tasa de Pérdida de Densidad Mineral Ósea (BMD % por mes en hueso trabecular/fémur).
   * Sin contramedidas se pierde ~1.2% por mes. El uso de ARED y nutrición cálcica reduce la pérdida a ~0.2-0.4%.
   */
  static calculateBoneLossRate(exerciseCompliancePct = 95.0, microgravityG = 0.0) {
    if (microgravityG >= 0.9) return 0.0; // En la Tierra
    const basalLossRate = 1.35 * (1.0 - microgravityG); // % mensual en ingravidez
    const reductionFromExercise = (exerciseCompliancePct / 100.0) * 0.95;
    const netLossRate = Math.max(0.1, basalLossRate * (1.0 - reductionFromExercise));
    return Number(netLossRate.toFixed(2));
  }

  /**
   * Riesgo SANS (Spaceflight-Associated Neuro-ocular Syndrome).
   * ONSD (Optic Nerve Sheath Diameter) normal es 4.5 - 5.5 mm. > 5.8 mm sugiere papiledema por presión intracraneal.
   */
  static calculateSansRisk(microgravityDays = 45, baselineOnsdMm = 4.8) {
    const cephalicShiftExpansion = Math.min(1.4, (microgravityDays / 120.0) * 1.0);
    const currentOnsd = Number((baselineOnsdMm + cephalicShiftExpansion).toFixed(2));

    let riskLevel = "Bajo (Nominal)";
    let status = "nominal";

    if (currentOnsd >= 5.9) {
      riskLevel = "Alto (Riesgo de Edema Papilar SANS Grado II-III)";
      status = "alerta";
    } else if (currentOnsd >= 5.5) {
      riskLevel = "Moderado (Dilatación de vaina óptica detectada)";
      status = "advertencia";
    }

    return {
      onsdMm: currentOnsd,
      riskLevel,
      status
    };
  }
}
