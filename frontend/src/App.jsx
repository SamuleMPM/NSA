import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GeneralDashboard from './modules/GeneralDashboard';
import BiomedicalTelemetry from './modules/BiomedicalTelemetry';
import MissionSimulator from './modules/MissionSimulator';
import AlertManagement from './modules/AlertManagement';
import DataIntegration from './modules/DataIntegration';
import InteractiveBodyMap from './components/InteractiveBodyMap';
import SelfAssessment from './modules/SelfAssessment';
import GamificationHub from './modules/GamificationHub';
import MedicalHandbook from './modules/MedicalHandbook';
import JsonModal from './components/JsonModal';
import DataDictionaryModal from './components/DataDictionaryModal';
import { Radio } from 'lucide-react';

const MODULE_LABELS = {
  general: 'Panel General',
  bodymap: 'Astronauta 3D & Chequeo Corporal',
  self_assessment: 'Autoevaluación de Salud & Ecógrafo',
  telemetry: 'Telemetría y ECG',
  gamification: 'AeroQuest: Rutinas y Gamificación',
  handbook: 'Manual Médico & 5 Riesgos (NASA HRP)',
  simulator: 'Simulador y Entornos Espaciales',
  alerts: 'Alertas y Contramedidas',
  integration: 'Integración y Datos',
};

const ENVIRONMENTS_MAP = {
  transit: {
    id: 'transit',
    name: 'Tránsito a Marte (Deep Space Transport)',
    gravityG: 0.0,
    gravityText: '0.00 G (Microgravedad)',
    dailyRadiation: 1.8,
    commDelay: '14.5 min',
  },
  station: {
    id: 'station',
    name: 'Estación Orbital (Lunar Gateway)',
    gravityG: 0.0,
    gravityText: '0.00 G (Órbita protegida)',
    dailyRadiation: 0.5,
    commDelay: '1.3 seg',
  },
  rover: {
    id: 'rover',
    name: 'Vehículo Explorador Superficial (Rover)',
    gravityG: 0.38,
    gravityText: '0.38 G (Gravedad Marciana)',
    dailyRadiation: 1.1,
    commDelay: '14.5 min',
  },
  base: {
    id: 'base',
    name: 'Base Superficial (Artemis Base Camp / Mars Hab)',
    gravityG: 0.38,
    gravityText: '0.38 G (Bóvedas de regolito)',
    dailyRadiation: 0.36,
    commDelay: '14.5 min',
  },
};

// Evaluación clínica integral de constantes vitales según estándares NASA HRP
function evaluateVital(variable, value) {
  if (variable === "heart_rate") {
    if (value > 120 || value < 50) return { status: "alerta", msg: "Alerta crítica: ritmo cardíaco fuera de límites (>120 o <50 bpm)" };
    if (value < 60 || value > 100) return { status: "advertencia", msg: "Fuera de rango óptimo (60-100 bpm)" };
    return { status: "normal", msg: "Ritmo sinusal nominal" };
  }
  if (variable === "spo2") {
    if (value < 90) return { status: "alerta", msg: "Alerta de hipoxia severa: SpO2 < 90%" };
    if (value < 95) return { status: "advertencia", msg: "Saturación baja (90-94%)" };
    return { status: "normal", msg: "Oxigenación celular nominal" };
  }
  if (variable === "temperature") {
    if (value > 38.0) return { status: "alerta", msg: "Hipertermia / Fiebre detectada (>38.0 °C)" };
    if (value < 36.1 || value > 37.2) return { status: "advertencia", msg: "Temperatura fuera de rango (36.1-37.2 °C)" };
    return { status: "normal", msg: "Termorregulación nominal" };
  }
  if (variable === "respiratory_rate") {
    if (value > 24 || value < 10) return { status: "alerta", msg: "Frecuencia respiratoria crítica (>24 o <10 rpm)" };
    if (value < 12 || value > 20) return { status: "advertencia", msg: "Frecuencia fuera de rango (12-20 rpm)" };
    return { status: "normal", msg: "Patrón ventilatorio nominal" };
  }
  if (variable === "systolic_bp") {
    if (value > 140 || value < 90) return { status: "alerta", msg: "Presión sistólica fuera de límites (>140 o <90 mmHg)" };
    if (value > 125 || value < 100) return { status: "advertencia", msg: "Prehipertensión espacial / fluid shift" };
    return { status: "normal", msg: "Presión sistólica óptima" };
  }
  if (variable === "glucose") {
    if (value > 140 || value < 65) return { status: "alerta", msg: "Desbalance glucémico significativo (>140 o <65 mg/dL)" };
    if (value > 115 || value < 75) return { status: "advertencia", msg: "Variabilidad glucémica fuera del rango basal" };
    return { status: "normal", msg: "Glucemia nominal en reposo" };
  }
  return { status: "normal", msg: "Nominal" };
}

// Generador sintético de telemetría expandido con Presión, Glucosa, Sueño, Estrés y SANS
function generateSyntheticSample(scenario, envId = 'transit') {
  let hr, spo2, temp, rr, systolic, diastolic, glucose, sleepHours, stressLevel, onsd, boneLoss;

  switch (scenario) {
    case "eva": // Paseo espacial con alta carga metabólica
      hr = Math.round(106 + (Math.random() * 14 - 7));
      spo2 = Number((96.6 + (Math.random() * 1.4 - 0.7)).toFixed(1));
      temp = Number((37.2 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      rr = Math.round(21 + (Math.random() * 3 - 1.5));
      systolic = Math.round(128 + (Math.random() * 8 - 4));
      diastolic = Math.round(82 + (Math.random() * 6 - 3));
      glucose = Number((86.0 + (Math.random() * 6 - 3)).toFixed(1));
      sleepHours = 6.8;
      stressLevel = 38;
      onsd = 5.1;
      boneLoss = 0.32;
      break;

    case "hypoxia": // Alerta de hipoxia / despresurización
      hr = Math.round(134 + (Math.random() * 12 - 6));
      spo2 = Number((86.2 + (Math.random() * 2.4 - 1.2)).toFixed(1));
      temp = Number((36.5 + (Math.random() * 0.3 - 0.15)).toFixed(1));
      rr = Math.round(27 + (Math.random() * 3 - 1.5));
      systolic = Math.round(144 + (Math.random() * 10 - 5));
      diastolic = Math.round(92 + (Math.random() * 6 - 3));
      glucose = Number((118.0 + (Math.random() * 8 - 4)).toFixed(1));
      sleepHours = 5.2;
      stressLevel = 88;
      onsd = 5.6;
      boneLoss = 0.35;
      break;

    case "hyperthermia": // Estrés térmico / fallo refrigerante
      hr = Math.round(119 + (Math.random() * 10 - 5));
      spo2 = Number((95.6 + (Math.random() * 1.2 - 0.6)).toFixed(1));
      temp = Number((38.5 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      rr = Math.round(23 + (Math.random() * 3 - 1.5));
      systolic = Math.round(132 + (Math.random() * 8 - 4));
      diastolic = Math.round(84 + (Math.random() * 4 - 2));
      glucose = Number((104.0 + (Math.random() * 6 - 3)).toFixed(1));
      sleepHours = 6.0;
      stressLevel = 62;
      onsd = 5.2;
      boneLoss = 0.30;
      break;

    case "sleep": // Reposo / Sueño circadiano
      hr = Math.round(57 + (Math.random() * 5 - 2.5));
      spo2 = Number((98.9 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      temp = Number((36.3 + (Math.random() * 0.2 - 0.1)).toFixed(1));
      rr = Math.round(12 + (Math.random() * 2 - 1));
      systolic = Math.round(108 + (Math.random() * 4 - 2));
      diastolic = Math.round(68 + (Math.random() * 4 - 2));
      glucose = Number((88.0 + (Math.random() * 4 - 2)).toFixed(1));
      sleepHours = 8.2;
      stressLevel = 10;
      onsd = 4.8;
      boneLoss = 0.28;
      break;

    case "microgravity": // Nominal
    default:
      hr = Math.round(75 + (Math.random() * 8 - 4));
      spo2 = Number((98.3 + (Math.random() * 1.0 - 0.5)).toFixed(1));
      temp = Number((36.6 + (Math.random() * 0.3 - 0.15)).toFixed(1));
      rr = Math.round(15 + (Math.random() * 2 - 1));
      systolic = Math.round(118 + (Math.random() * 6 - 3));
      diastolic = Math.round(76 + (Math.random() * 4 - 2));
      glucose = Number((92.0 + (Math.random() * 5 - 2.5)).toFixed(1));
      sleepHours = 7.8;
      stressLevel = 18;
      onsd = 4.9;
      boneLoss = 0.28;
      break;
  }

  hr = Math.max(35, Math.min(190, hr));
  spo2 = Math.min(100, Math.max(70, spo2));
  temp = Math.min(41, Math.max(34, temp));
  rr = Math.max(6, Math.min(40, rr));

  const timestamp = new Date().toTimeString().split(' ')[0];

  return {
    timestamp,
    heart_rate: hr,
    spo2,
    temperature: temp,
    respiratory_rate: rr,
    systolic_bp: systolic,
    diastolic_bp: diastolic,
    glucose,
    sleep_hours: sleepHours,
    stress_level: stressLevel,
    onsd_mm: onsd,
    bone_loss_monthly: boneLoss,
  };
}

export default function App() {
  const [activeModule, setActiveModule] = useState('general');
  const [selectedAstronautId, setSelectedAstronautId] = useState("ast_001");
  const [currentScenario, setCurrentScenario] = useState("microgravity");
  const [currentEnvironment, setCurrentEnvironment] = useState("transit"); // transit, station, rover, base
  const [isAutoSimulating, setIsAutoSimulating] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gamificación
  const [bioCredits, setBioCredits] = useState(1420);
  const [healthStreak, setHealthStreak] = useState(12);

  // Tripulación Artemis
  const astronauts = {
    ast_001: { name: "Neil A.", role: "Comandante de Misión", activity: "EVA" },
    ast_002: { name: "Ellen O.", role: "Especialista Biomédica", activity: "IVA" },
    ast_003: { name: "Pedro D.", role: "Ingeniero de Vuelo", activity: "REST" }
  };

  // Historial de telemetría por astronauta
  const [telemetryHistory, setTelemetryHistory] = useState(() => {
    const initial = {};
    Object.keys(astronauts).forEach(id => {
      const records = [];
      const sc = id === "ast_001" ? "eva" : id === "ast_003" ? "sleep" : "microgravity";
      for (let i = 12; i >= 0; i--) {
        records.push(generateSyntheticSample(sc));
      }
      initial[id] = records;
    });
    return initial;
  });

  // Logs de la misión
  const [logs, setLogs] = useState([
    { time: "16:20:00", level: "INFO", message: "Sistema modular de telemetría y soporte vital HRP inicializado." },
    { time: "16:21:15", level: "SUCCESS", message: "Enlace telemétrico con escafandras establecido a 100 Mbps (DSN Goldstone)." },
    { time: "16:22:40", level: "INFO", message: "Árbol de alertas y protocolos de solución médica autónoma cargados." },
    { time: "16:23:05", level: "SUCCESS", message: "Holograma biomédico interactivo 3D acoplado a telemetría en tiempo real." }
  ]);

  // Telemetría ambiental ECLSS
  const [environmentalData, setEnvironmentalData] = useState({
    suitPressure: 29.6,
    radiation: 18.2,
    co2Level: 3.1
  });

  const addLog = (level, message) => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs(prev => [...prev.slice(-50), { time, level, message }]);
  };

  // Muestra actual del astronauta activo
  const currentHistory = telemetryHistory[selectedAstronautId] || [];
  const latestSample = currentHistory[currentHistory.length - 1] || generateSyntheticSample("microgravity", currentEnvironment);
  const prevSample = currentHistory.length > 1 ? currentHistory[currentHistory.length - 2] : latestSample;

  const hrEval = evaluateVital("heart_rate", latestSample.heart_rate);
  const spo2Eval = evaluateVital("spo2", latestSample.spo2);
  const tempEval = evaluateVital("temperature", latestSample.temperature);
  const rrEval = evaluateVital("respiratory_rate", latestSample.respiratory_rate);
  const bpEval = evaluateVital("systolic_bp", latestSample.systolic_bp);
  const glucEval = evaluateVital("glucose", latestSample.glucose);

  const hasGlobalAlert = hrEval.status === "alerta" || spo2Eval.status === "alerta" || tempEval.status === "alerta" || rrEval.status === "alerta" || bpEval.status === "alerta";

  // Calcular alertas activas en toda la tripulación
  const activeAlerts = [];
  const latestVitalsByAstronaut = {};

  Object.entries(astronauts).forEach(([id, ast]) => {
    const h = telemetryHistory[id] || [];
    const last = h[h.length - 1];
    if (last) {
      const eHr = evaluateVital("heart_rate", last.heart_rate);
      const eSpo2 = evaluateVital("spo2", last.spo2);
      const eTemp = evaluateVital("temperature", last.temperature);
      const eRr = evaluateVital("respiratory_rate", last.respiratory_rate);
      const eBp = evaluateVital("systolic_bp", last.systolic_bp);

      const isAnyAlert = eHr.status === "alerta" || eSpo2.status === "alerta" || eTemp.status === "alerta" || eRr.status === "alerta" || eBp.status === "alerta";

      latestVitalsByAstronaut[id] = {
        ...last,
        isAlert: isAnyAlert
      };

      if (eHr.status === "alerta") {
        activeAlerts.push({
          astronautId: id,
          astronautName: ast.name,
          variable: "Frecuencia Cardíaca",
          value: last.heart_rate,
          unit: "bpm",
          severity: "CRITICAL",
          message: eHr.msg,
          timestamp: last.timestamp
        });
      }
      if (eSpo2.status === "alerta") {
        activeAlerts.push({
          astronautId: id,
          astronautName: ast.name,
          variable: "SpO2 (Oxígeno)",
          value: last.spo2,
          unit: "%",
          severity: "CRITICAL",
          message: eSpo2.msg,
          timestamp: last.timestamp
        });
      }
      if (eTemp.status === "alerta") {
        activeAlerts.push({
          astronautId: id,
          astronautName: ast.name,
          variable: "Temperatura Corporal",
          value: last.temperature,
          unit: "°C",
          severity: "CRITICAL",
          message: eTemp.msg,
          timestamp: last.timestamp
        });
      }
      if (eRr.status === "alerta") {
        activeAlerts.push({
          astronautId: id,
          astronautName: ast.name,
          variable: "Frecuencia Respiratoria",
          value: last.respiratory_rate,
          unit: "rpm",
          severity: "CRITICAL",
          message: eRr.msg,
          timestamp: last.timestamp
        });
      }
      if (eBp.status === "alerta") {
        activeAlerts.push({
          astronautId: id,
          astronautName: ast.name,
          variable: "Presión Arterial Sistólica",
          value: last.systolic_bp,
          unit: "mmHg",
          severity: "CRITICAL",
          message: eBp.msg,
          timestamp: last.timestamp
        });
      }
    }
  });

  // Generar un tick de simulación
  const handleTick = (customScenario = null) => {
    const sc = customScenario || currentScenario;
    const newSample = generateSyntheticSample(sc, currentEnvironment);

    setTelemetryHistory(prev => {
      const currentList = prev[selectedAstronautId] || [];
      const updatedList = [...currentList.slice(-25), newSample];
      return {
        ...prev,
        [selectedAstronautId]: updatedList
      };
    });

    setEnvironmentalData(() => {
      const envInfo = ENVIRONMENTS_MAP[currentEnvironment] || ENVIRONMENTS_MAP.transit;
      return {
        suitPressure: Number((29.6 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        radiation: Number((envInfo.dailyRadiation * 10 + (Math.random() * 1.2 - 0.6)).toFixed(1)),
        co2Level: Number((3.1 + (Math.random() * 0.2 - 0.1)).toFixed(1))
      };
    });
  };

  // Simulación continua cada 2 segundos
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      handleTick();
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoSimulating, currentScenario, currentEnvironment, selectedAstronautId]);

  // Selección de escenario
  const handleSelectScenario = (scId) => {
    setCurrentScenario(scId);
    addLog("INFO", `Escenario de simulación cambiado a [${scId.toUpperCase()}] para ${astronauts[selectedAstronautId].name}`);
    handleTick(scId);
  };

  // Selección de entorno espacial
  const handleSelectEnvironment = (envId) => {
    setCurrentEnvironment(envId);
    const envInfo = ENVIRONMENTS_MAP[envId] || ENVIRONMENTS_MAP.transit;
    addLog("INFO", `Entorno operativo actualizado a: ${envInfo.name} (${envInfo.gravityText}). Factores RIDGE recalculados.`);
    handleTick();
  };

  // Inyección de anomalía de emergencia
  const handleTriggerEmergency = () => {
    setCurrentScenario("hypoxia");
    addLog("CRITICAL", `[EMERGENCIA] Despresurización simulada en ${astronauts[selectedAstronautId].name}`);
    handleTick("hypoxia");
  };

  // Restablecer nominal
  const handleResetNominal = () => {
    setCurrentScenario("microgravity");
    addLog("SUCCESS", `Sistemas estabilizados a condiciones NOMINALES para toda la tripulación.`);

    setTelemetryHistory(prev => {
      const next = {};
      Object.keys(astronauts).forEach(id => {
        const currentList = prev[id] || [];
        next[id] = [...currentList.slice(-25), generateSyntheticSample("microgravity", currentEnvironment)];
      });
      return next;
    });
  };

  // Aplicar contramedida médica para una alerta específica
  const handleApplyCountermeasure = (astId, variableName) => {
    const ast = astronauts[astId];
    addLog("SUCCESS", `[CONTRAMEDIDA AUTÓNOMA] Protocolo clínico ejecutado para ${ast?.name} (${variableName}).`);

    setTelemetryHistory(prev => {
      const currentList = prev[astId] || [];
      const normalizedSample = {
        timestamp: new Date().toTimeString().split(' ')[0],
        heart_rate: 76,
        spo2: 98.4,
        temperature: 36.6,
        respiratory_rate: 15,
        systolic_bp: 118,
        diastolic_bp: 76,
        glucose: 92,
        sleep_hours: 7.8,
        stress_level: 18,
        onsd_mm: 4.9,
        bone_loss_monthly: 0.28,
      };
      return {
        ...prev,
        [astId]: [...currentList.slice(-25), normalizedSample]
      };
    });

    setBioCredits(prev => prev + 80);
    setCurrentScenario("microgravity");
  };

  // Guardar datos provenientes de la autoevaluación activa del astronauta
  const handleSaveAssessment = (astId, assessmentData) => {
    const ast = astronauts[astId];
    addLog("SUCCESS", `[AUTOEVALUACIÓN] Nuevos registros clínicos cargados por ${ast?.name}: PA ${assessmentData.systolic_bp}/${assessmentData.diastolic_bp}, Glucosa ${assessmentData.glucose} mg/dL.`);

    setTelemetryHistory(prev => {
      const currentList = prev[astId] || [];
      const last = currentList[currentList.length - 1] || generateSyntheticSample("microgravity", currentEnvironment);
      const updatedSample = {
        ...last,
        timestamp: new Date().toTimeString().split(' ')[0],
        systolic_bp: assessmentData.systolic_bp,
        diastolic_bp: assessmentData.diastolic_bp,
        glucose: assessmentData.glucose,
        sleep_hours: assessmentData.sleep_hours,
        stress_level: assessmentData.stress_level,
        onsd_mm: assessmentData.onsd_mm || last.onsd_mm,
      };
      return {
        ...prev,
        [astId]: [...currentList.slice(-25), updatedSample]
      };
    });
  };

  // Otorgar puntos de gamificación
  const handleAwardGamificationPoints = (amount, reason) => {
    setBioCredits(prev => prev + amount);
    addLog("SUCCESS", `[AEROQUEST] +${amount} Bio-Créditos otorgados: ${reason}`);
  };

  const currentEnvInfo = ENVIRONMENTS_MAP[currentEnvironment] || ENVIRONMENTS_MAP.transit;

  // Contrato JSON exacto según docs/ARCHITECTURE.md y estándar NASA HRP
  const currentJsonPacket = {
    metadata: {
      source: "simulation_engine_v2_hrp",
      is_synthetic: true,
      mission_id: "mars_001",
      scenario: currentScenario,
      environment: currentEnvironment,
    },
    environment_context: {
      name: currentEnvInfo.name,
      gravity_g: currentEnvInfo.gravityG,
      daily_radiation_msv: currentEnvInfo.dailyRadiation,
      earth_latency: currentEnvInfo.commDelay,
    },
    astronaut: {
      id: selectedAstronautId,
      name: astronauts[selectedAstronautId]?.name || "Neil A.",
      bio_credits: bioCredits,
      health_streak_days: healthStreak,
    },
    vital_signs: {
      timestamp: new Date().toISOString(),
      heart_rate: {
        value: latestSample.heart_rate,
        unit: "bpm",
        status: hrEval.status
      },
      blood_pressure: {
        systolic: latestSample.systolic_bp || 118,
        diastolic: latestSample.diastolic_bp || 76,
        unit: "mmHg",
        status: bpEval.status
      },
      blood_glucose: {
        value: latestSample.glucose || 92,
        unit: "mg/dL",
        status: glucEval.status
      },
      spo2: {
        value: latestSample.spo2,
        unit: "%",
        status: spo2Eval.status
      },
      temperature: {
        value: latestSample.temperature,
        unit: "°C",
        status: tempEval.status
      },
      respiratory_rate: {
        value: latestSample.respiratory_rate,
        unit: "rpm",
        status: rrEval.status
      },
      sleep_tracking: {
        duration_hours: latestSample.sleep_hours || 7.8,
        quality: "REM Estable",
        status: "normal"
      },
      mental_health: {
        stress_percentage: latestSample.stress_level || 18,
        cognitive_readiness: 94,
        status: "normal"
      },
      ocular_sans: {
        optic_nerve_sheath_diameter_mm: latestSample.onsd_mm || 4.9,
        risk_level: "Bajo (Sin papiledema)",
        status: "normal"
      },
      bone_health: {
        estimated_monthly_loss_pct: latestSample.bone_loss_monthly || 0.28,
        status: "normal"
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden text-slate-100">
      {/* Ambient console backdrop */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(820px 480px at 76% -8%, rgba(34,211,238,0.08), transparent 62%), radial-gradient(720px 420px at 12% 104%, rgba(96,165,250,0.05), transparent 65%)',
        }}
      />

      {/* Sidebar de navegación */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        astronauts={astronauts}
        selectedAstronautId={selectedAstronautId}
        setSelectedAstronautId={(id) => {
          setSelectedAstronautId(id);
          addLog("INFO", `Foco telemétrico cambiado a: ${astronauts[id].name}`);
        }}
        totalAlertsCount={activeAlerts.length}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        missionId="mars_001"
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Área Principal */}
      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">

        {/* Header Superior */}
        <Header
          missionId="mars_001"
          activeModuleLabel={MODULE_LABELS[activeModule]}
          onOpenJson={() => setIsJsonModalOpen(true)}
          onOpenDictionary={() => setIsDictionaryOpen(true)}
          hasAlert={activeAlerts.length > 0}
          alertCount={activeAlerts.length}
          soundEnabled={soundEnabled}
          setSoundEnabled={setSoundEnabled}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          environmentInfo={currentEnvInfo}
          bioCredits={bioCredits}
          healthStreak={healthStreak}
        />

        {/* Módulo Activo */}
        <main className="flex-1 w-full">
          <div className="mx-auto w-full max-w-[1680px] px-3.5 pb-5 pt-4 sm:px-5 sm:pt-5 lg:px-6">
            <div key={activeModule} className="animate-slide-up">

              {activeModule === 'general' && (
                <GeneralDashboard
                  missionId="mars_001"
                  astronauts={astronauts}
                  selectedAstronautId={selectedAstronautId}
                  setSelectedAstronautId={setSelectedAstronautId}
                  latestVitalsByAstronaut={latestVitalsByAstronaut}
                  activeAlerts={activeAlerts}
                  environmentalData={environmentalData}
                  currentScenario={currentScenario}
                  setActiveModule={setActiveModule}
                  onResetNominal={handleResetNominal}
                  currentEnvironmentInfo={currentEnvInfo}
                  latestSample={latestSample}
                  bioCredits={bioCredits}
                  healthStreak={healthStreak}
                />
              )}

              {activeModule === 'bodymap' && (
                <InteractiveBodyMap
                  currentSample={latestSample}
                  selectedAstronaut={astronauts[selectedAstronautId]}
                  onApplyCountermeasure={handleApplyCountermeasure}
                  envInfo={currentEnvInfo}
                />
              )}

              {activeModule === 'self_assessment' && (
                <SelfAssessment
                  astronauts={astronauts}
                  selectedAstronautId={selectedAstronautId}
                  onSaveAssessment={handleSaveAssessment}
                  onAwardGamificationPoints={handleAwardGamificationPoints}
                  currentTelemetry={latestSample}
                />
              )}

              {activeModule === 'telemetry' && (
                <BiomedicalTelemetry
                  astronauts={astronauts}
                  selectedAstronautId={selectedAstronautId}
                  setSelectedAstronautId={setSelectedAstronautId}
                  latestVitalsByAstronaut={latestVitalsByAstronaut}
                  currentHistory={currentHistory}
                  latestSample={latestSample}
                  prevSample={prevSample}
                  hrEval={hrEval}
                  spo2Eval={spo2Eval}
                  tempEval={tempEval}
                  rrEval={rrEval}
                  soundEnabled={soundEnabled}
                  hasGlobalAlert={hasGlobalAlert}
                  currentScenario={currentScenario}
                />
              )}

              {activeModule === 'gamification' && (
                <GamificationHub
                  bioCredits={bioCredits}
                  healthStreak={healthStreak}
                  onAwardPoints={handleAwardGamificationPoints}
                  selectedAstronaut={astronauts[selectedAstronautId]}
                />
              )}

              {activeModule === 'handbook' && (
                <MedicalHandbook />
              )}

              {activeModule === 'simulator' && (
                <MissionSimulator
                  currentScenario={currentScenario}
                  handleSelectScenario={handleSelectScenario}
                  currentEnvironment={currentEnvironment}
                  handleSelectEnvironment={handleSelectEnvironment}
                  isAutoSimulating={isAutoSimulating}
                  setIsAutoSimulating={setIsAutoSimulating}
                  handleTick={handleTick}
                  handleTriggerEmergency={handleTriggerEmergency}
                  handleResetNominal={handleResetNominal}
                  environmentalData={environmentalData}
                  logs={logs}
                  astronauts={astronauts}
                  selectedAstronautId={selectedAstronautId}
                />
              )}

              {activeModule === 'alerts' && (
                <AlertManagement
                  activeAlerts={activeAlerts}
                  onApplyCountermeasure={handleApplyCountermeasure}
                  onResetNominal={handleResetNominal}
                  onTriggerEmergency={handleTriggerEmergency}
                  astronauts={astronauts}
                />
              )}

              {activeModule === 'integration' && (
                <DataIntegration
                  currentJsonPacket={currentJsonPacket}
                  logs={logs}
                  selectedAstronautId={selectedAstronautId}
                  astronauts={astronauts}
                />
              )}

            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-space-800/80 bg-space-950/55">
          <div className="mx-auto flex w-full max-w-[1680px] flex-col items-center justify-between gap-2 px-4 py-3 text-center font-mono text-[10px] text-slate-500 sm:flex-row sm:px-6 sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Radio className="h-3 w-3 text-telemetry-green" aria-hidden="true" />
                NASA Space Apps Challenge · Artemis Mission Health
              </span>
              <span className="text-slate-700">/</span>
              <span>AeroHealth Autonomous Bio-Telemetry & Diagnostic System</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-end">
              <span>ORION MCC-H</span>
              <span className="text-slate-700">/</span>
              <span>NASA HRP (RIDGE COMPLIANT)</span>
              <span className="text-slate-700">/</span>
              <span className="flex items-center gap-1.5 text-telemetry-green">
                <span className="h-1.5 w-1.5 rounded-full bg-telemetry-green" />
                BUILD 2.0.0
              </span>
            </div>
          </div>
        </footer>

      </div>

      {/* Modales Globales */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        currentPacket={currentJsonPacket}
      />

      <DataDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

    </div>
  );
}
