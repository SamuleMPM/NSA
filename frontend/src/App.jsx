import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import GeneralDashboard from './modules/GeneralDashboard';
import BiomedicalTelemetry from './modules/BiomedicalTelemetry';
import MissionSimulator from './modules/MissionSimulator';
import AlertManagement from './modules/AlertManagement';
import DataIntegration from './modules/DataIntegration';
import JsonModal from './components/JsonModal';
import DataDictionaryModal from './components/DataDictionaryModal';
import { Radio } from 'lucide-react';

const MODULE_LABELS = {
  general: 'Panel General',
  telemetry: 'Telemetría y ECG',
  simulator: 'Simulador de Misión',
  alerts: 'Alertas y Soluciones',
  integration: 'Integración y Datos',
};

// Evaluación clínica de constantes vitales según docs/DATA_DICTIONARY.md
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
  return { status: "normal", msg: "Nominal" };
}

// Generador sintético de telemetría acoplado a escenarios fisiológicos
function generateSyntheticSample(scenario) {
  let hr, spo2, temp, rr;

  switch (scenario) {
    case "eva": // Paseo espacial con alta carga
      hr = Math.round(106 + (Math.random() * 14 - 7));
      spo2 = Number((96.6 + (Math.random() * 1.4 - 0.7)).toFixed(1));
      temp = Number((37.2 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      rr = Math.round(21 + (Math.random() * 3 - 1.5));
      break;

    case "hypoxia": // Alerta de hipoxia / despresurización
      hr = Math.round(134 + (Math.random() * 12 - 6));
      spo2 = Number((86.2 + (Math.random() * 2.4 - 1.2)).toFixed(1));
      temp = Number((36.5 + (Math.random() * 0.3 - 0.15)).toFixed(1));
      rr = Math.round(27 + (Math.random() * 3 - 1.5));
      break;

    case "hyperthermia": // Estrés térmico
      hr = Math.round(119 + (Math.random() * 10 - 5));
      spo2 = Number((95.6 + (Math.random() * 1.2 - 0.6)).toFixed(1));
      temp = Number((38.5 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      rr = Math.round(23 + (Math.random() * 3 - 1.5));
      break;

    case "sleep": // Reposo / Sueño
      hr = Math.round(57 + (Math.random() * 5 - 2.5));
      spo2 = Number((98.9 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      temp = Number((36.3 + (Math.random() * 0.2 - 0.1)).toFixed(1));
      rr = Math.round(12 + (Math.random() * 2 - 1));
      break;

    case "microgravity": // Nominal
    default:
      hr = Math.round(75 + (Math.random() * 8 - 4));
      spo2 = Number((98.3 + (Math.random() * 1.0 - 0.5)).toFixed(1));
      temp = Number((36.6 + (Math.random() * 0.3 - 0.15)).toFixed(1));
      rr = Math.round(15 + (Math.random() * 2 - 1));
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
    respiratory_rate: rr
  };
}

export default function App() {
  const [activeModule, setActiveModule] = useState('general');
  const [selectedAstronautId, setSelectedAstronautId] = useState("ast_001");
  const [currentScenario, setCurrentScenario] = useState("microgravity");
  const [isAutoSimulating, setIsAutoSimulating] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tripulación
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
    { time: "16:20:00", level: "INFO", message: "Sistema modular de telemetría y soporte vital inicializado." },
    { time: "16:21:15", level: "SUCCESS", message: "Enlace telemétrico con escafandras establecido a 100 Mbps." },
    { time: "16:22:40", level: "INFO", message: "Árbol de alertas y protocolos de solución médica cargados." }
  ]);

  // Telemetría ambiental
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
  const latestSample = currentHistory[currentHistory.length - 1] || generateSyntheticSample("microgravity");
  const prevSample = currentHistory.length > 1 ? currentHistory[currentHistory.length - 2] : latestSample;

  const hrEval = evaluateVital("heart_rate", latestSample.heart_rate);
  const spo2Eval = evaluateVital("spo2", latestSample.spo2);
  const tempEval = evaluateVital("temperature", latestSample.temperature);
  const rrEval = evaluateVital("respiratory_rate", latestSample.respiratory_rate);

  const hasGlobalAlert = hrEval.status === "alerta" || spo2Eval.status === "alerta" || tempEval.status === "alerta" || rrEval.status === "alerta";

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

      const isAnyAlert = eHr.status === "alerta" || eSpo2.status === "alerta" || eTemp.status === "alerta" || eRr.status === "alerta";

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
    }
  });

  // Generar un tick de simulación
  const handleTick = (customScenario = null) => {
    const sc = customScenario || currentScenario;
    const newSample = generateSyntheticSample(sc);

    setTelemetryHistory(prev => {
      const currentList = prev[selectedAstronautId] || [];
      const updatedList = [...currentList.slice(-25), newSample];
      return {
        ...prev,
        [selectedAstronautId]: updatedList
      };
    });

    setEnvironmentalData(prevEnv => ({
      suitPressure: Number((29.6 + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      radiation: Number((18.2 + (Math.random() * 0.8 - 0.4)).toFixed(1)),
      co2Level: Number((3.1 + (Math.random() * 0.2 - 0.1)).toFixed(1))
    }));
  };

  // Simulación continua
  useEffect(() => {
    if (!isAutoSimulating) return;

    const interval = setInterval(() => {
      handleTick();
    }, 2000);

    return () => clearInterval(interval);
  }, [isAutoSimulating, currentScenario, selectedAstronautId]);

  // Selección de escenario
  const handleSelectScenario = (scId) => {
    setCurrentScenario(scId);
    addLog("INFO", `Escenario de simulación cambiado a [${scId.toUpperCase()}] para ${astronauts[selectedAstronautId].name}`);
    handleTick(scId);
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
        next[id] = [...currentList.slice(-25), generateSyntheticSample("microgravity")];
      });
      return next;
    });
  };

  // Aplicar contramedida médica para una alerta específica
  const handleApplyCountermeasure = (astId, variableName) => {
    const ast = astronauts[astId];
    addLog("SUCCESS", `[CONTRAMEDIDA] Protocolo médico ejecutado con éxito para ${ast?.name} (${variableName}).`);

    setTelemetryHistory(prev => {
      const currentList = prev[astId] || [];
      const normalizedSample = {
        timestamp: new Date().toTimeString().split(' ')[0],
        heart_rate: 76,
        spo2: 98.4,
        temperature: 36.6,
        respiratory_rate: 15
      };
      return {
        ...prev,
        [astId]: [...currentList.slice(-25), normalizedSample]
      };
    });

    setCurrentScenario("microgravity");
  };

  // Contrato JSON exacto según docs/ARCHITECTURE.md
  const currentJsonPacket = {
    metadata: {
      source: "simulation_engine_v1",
      is_synthetic: true,
      mission_id: "mars_001",
      scenario: currentScenario
    },
    astronaut: {
      id: selectedAstronautId,
      name: astronauts[selectedAstronautId]?.name || "Neil A."
    },
    vital_signs: {
      timestamp: new Date().toISOString(),
      heart_rate: {
        value: latestSample.heart_rate,
        unit: "bpm",
        status: hrEval.status
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

              {activeModule === 'simulator' && (
                <MissionSimulator
                  currentScenario={currentScenario}
                  handleSelectScenario={handleSelectScenario}
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
                NASA Space Apps Challenge
              </span>
              <span className="text-slate-700">/</span>
              <span>AeroHealth Bio-Telemetry Platform</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-end">
              <span>ORION MCC-H</span>
              <span className="text-slate-700">/</span>
              <span>REACT 18 · VITE · TAILWIND</span>
              <span className="text-slate-700">/</span>
              <span className="flex items-center gap-1.5 text-telemetry-green">
                <span className="h-1.5 w-1.5 rounded-full bg-telemetry-green" />
                BUILD 1.0.0
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
