/**
 * NSA — Motor de Simulación Computacional (JavaScript / Node.js)
 * Equipo 2: Simulación y Backend
 */

import { PhysiologicalModels } from '../research/models/physiological_models.js';

export class SimulationEngine {
  constructor(missionId = "mars_001") {
    this.missionId = missionId;
    this.currentScenario = "microgravity";
    this.astronauts = {
      ast_001: { name: "Neil A.", role: "Comandante de Misión", activity: "EVA", baseHr: 68.0 },
      ast_002: { name: "Ellen O.", role: "Especialista Biomédica", activity: "IVA", baseHr: 65.0 },
      ast_003: { name: "Pedro D.", role: "Ingeniero de Vuelo", activity: "REST", baseHr: 72.0 }
    };
  }

  setScenario(scenarioId) {
    if (["microgravity", "eva", "hypoxia", "hyperthermia", "sleep"].includes(scenarioId)) {
      this.currentScenario = scenarioId;
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
    return "normal";
  }

  generatePacket(astronautId) {
    const ast = this.astronauts[astronautId] || { name: "Neil A.", baseHr: 70.0 };

    let metabolicWatts = 95.0;
    let ambientPressure = 101.3;
    let o2Fraction = 0.21;
    let coolingRate = 0.5;
    let paco2 = 40.0;
    let stress = 0.05;

    if (this.currentScenario === "eva") {
      metabolicWatts = 250.0 + (Math.random() * 50 - 25);
      ambientPressure = 29.6;
      o2Fraction = 1.0;
      coolingRate = 0.85;
      paco2 = 42.5;
      stress = 0.35;
    } else if (this.currentScenario === "hypoxia") {
      metabolicWatts = 200.0;
      ambientPressure = 21.0;
      o2Fraction = 0.65;
      coolingRate = 0.5;
      paco2 = 48.0;
      stress = 0.95;
    } else if (this.currentScenario === "hyperthermia") {
      metabolicWatts = 275.0;
      ambientPressure = 29.6;
      o2Fraction = 1.0;
      coolingRate = 0.15;
      paco2 = 43.0;
      stress = 0.6;
    } else if (this.currentScenario === "sleep") {
      metabolicWatts = 70.0;
      ambientPressure = 101.3;
      o2Fraction = 0.21;
      coolingRate = 0.4;
      paco2 = 39.5;
      stress = 0.0;
    }

    const hr = Math.round(PhysiologicalModels.calculateHeartRate(metabolicWatts, stress, ast.baseHr));
    const spo2 = Number(PhysiologicalModels.calculateSpO2(ambientPressure, o2Fraction).toFixed(1));
    const temp = Number(PhysiologicalModels.calculateCoreTemperature(22.0, coolingRate, metabolicWatts).toFixed(1));
    const rr = Math.round(PhysiologicalModels.calculateRespiratoryRate(paco2, this.currentScenario === "eva" ? 0.2 : 0.0));

    const timestamp = new Date().toISOString();

    return {
      metadata: {
        source: "simulation_engine_v1",
        is_synthetic: true,
        mission_id: this.missionId,
        scenario: this.currentScenario
      },
      astronaut: {
        id: astronautId,
        name: ast.name
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
        }
      }
    };
  }
}
