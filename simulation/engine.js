/**
 * NSA — Motor de Simulación Computacional (JavaScript / Node.js)
 * Equipo 2: Simulación y Backend — Cumplimiento NASA HRP
 */

import { PhysiologicalModels } from '../research/models/physiological_models.js';

export class SimulationEngine {
  constructor(missionId = "mars_001") {
    this.missionId = missionId;
    this.currentScenario = "microgravity";
    this.currentEnvironment = "transit"; // transit, station, rover, base
    this.astronauts = {
      ast_001: { name: "Neil A.", role: "Comandante de Misión", activity: "EVA", baseHr: 68.0, missionDays: 62 },
      ast_002: { name: "Ellen O.", role: "Especialista Biomédica", activity: "IVA", baseHr: 65.0, missionDays: 62 },
      ast_003: { name: "Pedro D.", role: "Ingeniero de Vuelo", activity: "REST", baseHr: 72.0, missionDays: 62 }
    };
  }

  setScenario(scenarioId) {
    if (["microgravity", "eva", "hypoxia", "hyperthermia", "sleep"].includes(scenarioId)) {
      this.currentScenario = scenarioId;
      return true;
    }
    return false;
  }

  setEnvironment(envId) {
    if (["transit", "station", "rover", "base"].includes(envId)) {
      this.currentEnvironment = envId;
      return true;
    }
    return false;
  }

  evaluateStatus(variable, value) {
    if (variable === "heart_rate") {
      if (value > 120 || value < 50) return "alerta";
      if (value < 60 || value > 100) return "advertencia";
      return "normal";
    }
    if (variable === "spo2") {
      if (value < 90) return "alerta";
      if (value < 95) return "advertencia";
      return "normal";
    }
    if (variable === "temperature") {
      if (value > 38.0) return "alerta";
      if (value < 36.1 || value > 37.2) return "advertencia";
      return "normal";
    }
    if (variable === "respiratory_rate") {
      if (value > 24 || value < 10) return "alerta";
      if (value < 12 || value > 20) return "advertencia";
      return "normal";
    }
    if (variable === "systolic_bp") {
      if (value > 140 || value < 90) return "alerta";
      if (value > 130 || value < 100) return "advertencia";
      return "normal";
    }
    if (variable === "diastolic_bp") {
      if (value > 90 || value < 60) return "alerta";
      if (value > 85 || value < 65) return "advertencia";
      return "normal";
    }
    if (variable === "glucose") {
      if (value > 140 || value < 70) return "alerta";
      if (value > 115 || value < 75) return "advertencia";
      return "normal";
    }
    if (variable === "sleep_hours") {
      if (value < 5.0 || value > 11.0) return "alerta";
      if (value < 6.5 || value > 9.0) return "advertencia";
      return "normal";
    }
    if (variable === "stress_level") {
      if (value > 75) return "alerta";
      if (value > 50) return "advertencia";
      return "normal";
    }
    return "normal";
  }

  getEnvironmentParameters() {
    switch (this.currentEnvironment) {
      case "station": // ISS / Lunar Gateway
        return {
          id: "station",
          name: "Estación Orbital (Lunar Gateway)",
          gravityG: 0.0,
          ambientPressureKpa: 101.3,
          radiationDoseRateUsVh: 16.5,
          radiationDailyMsv: 0.4,
          commDelaySeconds: 1.3,
          commDelayText: "1.3 segundos (Soporte directo Houston)",
          isolationScore: "Moderado"
        };
      case "rover": // Vehículo Explorador Superficial
        return {
          id: "rover",
          name: "Vehículo Explorador Presurizado (Rover)",
          gravityG: 0.38,
          ambientPressureKpa: 70.3,
          radiationDoseRateUsVh: 42.0,
          radiationDailyMsv: 1.0,
          commDelaySeconds: 870,
          commDelayText: "14.5 minutos (Autonomía médica requerida)",
          isolationScore: "Alto (Cabina biplaza)"
        };
      case "base": // Base Marciana / Artemis Base Camp
        return {
          id: "base",
          name: "Base Planetaria (Artemis Base Camp / Mars Alpha)",
          gravityG: 0.38,
          ambientPressureKpa: 101.3,
          radiationDoseRateUsVh: 18.0,
          radiationDailyMsv: 0.45,
          commDelaySeconds: 870,
          commDelayText: "14.5 minutos (Consulta diferida)",
          isolationScore: "Controlado (Hábitat de 4-6)"
        };
      case "transit": // Nave en Tránsito Interplanetario
      default:
        return {
          id: "transit",
          name: "Nave en Tránsito Interplanetario (Orion / Deep Space)",
          gravityG: 0.0,
          ambientPressureKpa: 101.3,
          radiationDoseRateUsVh: 75.0,
          radiationDailyMsv: 1.8,
          commDelaySeconds: 870,
          commDelayText: "14.5 minutos (Alta autonomía)",
          isolationScore: "Extremo (Volumen habitable reducido)"
        };
    }
  }

  generatePacket(astronautId = "ast_001") {
    const ast = this.astronauts[astronautId] || { name: "Neil A.", baseHr: 70.0, missionDays: 60 };
    const env = this.getEnvironmentParameters();

    let metabolicWatts = 95.0;
    let ambientPressure = env.ambientPressureKpa;
    let o2Fraction = 0.21;
    let coolingRate = 0.5;
    let paco2 = 40.0;
    let stress = 0.08;
    let sleepHours = 7.6;
    let baseGlucose = 92.0;

    if (this.currentScenario === "eva") {
      metabolicWatts = 250.0 + (Math.random() * 40 - 20);
      ambientPressure = 29.6;
      o2Fraction = 1.0;
      coolingRate = 0.85;
      paco2 = 42.5;
      stress = 0.38;
      sleepHours = 6.8;
      baseGlucose = 84.0;
    } else if (this.currentScenario === "hypoxia") {
      metabolicWatts = 200.0;
      ambientPressure = 21.0;
      o2Fraction = 0.65;
      coolingRate = 0.5;
      paco2 = 48.0;
      stress = 0.95;
      sleepHours = 5.2;
      baseGlucose = 118.0;
    } else if (this.currentScenario === "hyperthermia") {
      metabolicWatts = 275.0;
      ambientPressure = 29.6;
      o2Fraction = 1.0;
      coolingRate = 0.15;
      paco2 = 43.0;
      stress = 0.62;
      sleepHours = 6.0;
      baseGlucose = 104.0;
    } else if (this.currentScenario === "sleep") {
      metabolicWatts = 70.0;
      ambientPressure = 101.3;
      o2Fraction = 0.21;
      coolingRate = 0.4;
      paco2 = 39.5;
      stress = 0.02;
      sleepHours = 8.2;
      baseGlucose = 88.0;
    }

    const hr = Math.round(PhysiologicalModels.calculateHeartRate(metabolicWatts, stress, ast.baseHr));
    const spo2 = Number(PhysiologicalModels.calculateSpO2(ambientPressure, o2Fraction).toFixed(1));
    const temp = Number(PhysiologicalModels.calculateCoreTemperature(22.0, coolingRate, metabolicWatts).toFixed(1));
    const rr = Math.round(PhysiologicalModels.calculateRespiratoryRate(paco2, this.currentScenario === "eva" ? 0.2 : 0.0));

    const bp = PhysiologicalModels.calculateBloodPressure(metabolicWatts, stress, ast.missionDays);
    const glucose = PhysiologicalModels.calculateBloodGlucose(3.0, metabolicWatts, stress, baseGlucose);
    const sleep = PhysiologicalModels.calculateSleepQuality(sleepHours, 55.0, stress);
    const boneLoss = PhysiologicalModels.calculateBoneLossRate(92.0, env.gravityG);
    const sans = PhysiologicalModels.calculateSansRisk(ast.missionDays);

    const timestamp = new Date().toISOString();

    return {
      metadata: {
        source: "simulation_engine_v2_hrp",
        is_synthetic: true,
        mission_id: this.missionId,
        scenario: this.currentScenario,
        environment: env.id
      },
      environment: {
        location: env.name,
        gravity_g: env.gravityG,
        radiation_rate_usvh: env.radiationDoseRateUsVh,
        radiation_daily_msv: env.radiationDailyMsv,
        earth_comm_delay: env.commDelayText,
        isolation_index: env.isolationScore
      },
      astronaut: {
        id: astronautId,
        name: ast.name,
        mission_days: ast.missionDays
      },
      vital_signs: {
        timestamp,
        heart_rate: {
          value: hr,
          unit: "bpm",
          status: this.evaluateStatus("heart_rate", hr)
        },
        spo2: {
          value: spo2,
          unit: "%",
          status: this.evaluateStatus("spo2", spo2)
        },
        temperature: {
          value: temp,
          unit: "°C",
          status: this.evaluateStatus("temperature", temp)
        },
        respiratory_rate: {
          value: rr,
          unit: "rpm",
          status: this.evaluateStatus("respiratory_rate", rr)
        },
        blood_pressure: {
          systolic: bp.systolic,
          diastolic: bp.diastolic,
          mean_arterial: bp.meanArterialPressure,
          unit: "mmHg",
          status: this.evaluateStatus("systolic_bp", bp.systolic)
        },
        blood_glucose: {
          value: glucose,
          unit: "mg/dL",
          status: this.evaluateStatus("glucose", glucose)
        },
        sleep_tracking: {
          duration_hours: sleepHours,
          sleep_quality_score: sleep.score,
          rem_cycles: sleep.remCyclesEstimate,
          unit: "hours",
          status: sleep.status
        },
        mental_health: {
          stress_index: Math.round(stress * 100),
          mood: stress > 0.6 ? "Estrés elevado / Alerta" : stress > 0.3 ? "Exigencia cognitiva moderada" : "Nominal / Enfocado",
          status: this.evaluateStatus("stress_level", Math.round(stress * 100))
        },
        bone_health: {
          loss_rate_monthly_pct: boneLoss,
          unit: "%/mes",
          status: boneLoss > 0.8 ? "advertencia" : "normal"
        },
        ocular_sans: {
          onsd_mm: sans.onsdMm,
          risk: sans.riskLevel,
          status: sans.status
        }
      }
    };
  }
}
