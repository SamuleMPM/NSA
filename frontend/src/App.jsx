import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './modules/Dashboard';
import BiomedicalTelemetry from './modules/BiomedicalTelemetry';
import MissionSimulator from './modules/MissionSimulator';
import MedicalHandbook from './modules/MedicalHandbook';
import DataDictionaryModal from './components/DataDictionaryModal';
import AddAstronautModal from './components/AddAstronautModal';
import { Radio, X, BookOpen } from 'lucide-react';
import {
  ALERTABLE_VITALS,
  evaluateAllVitals,
  severityAtLeast,
} from './lib/clinical';
import {
  buildRiskInputs,
  evaluateRisks,
  RISK_ORDER,
} from './lib/risks';
import {
  buildVitalCandidates,
  buildRiskCandidates,
  buildEcgCandidates,
  reconcileAlerts,
  acknowledgeAlert,
  resolveAlert,
  resolveAlertsForAstronaut,
  summarizeAlerts,
} from './lib/alerts';
import {
  createRecord,
  getLatestRecord,
  mergeCrewProfiles,
  sortRecords,
  summarizeRecords,
} from './lib/records';
import {
  generateHistoryForCrew,
  generateSyntheticSample,
  getScenarioDefinition,
} from './lib/simulation';
import { getEnvironment } from './lib/environments';
import {
  loadRecords,
  loadAlerts,
  loadLogs,
  loadRiskHistory,
  loadSuppressedVitals,
  createId,
  readJSON,
  writeJSON,
  STORAGE_KEYS,
} from './lib/storage';
import { api, describeApiError } from './lib/api';
import {
  crewArrayToMap,
  hydrateFromBackend,
  readLocalSnapshot,
  scheduleSync,
} from './lib/persistence';
import { formatTime } from './lib/format';

const SESSION_USER = {
  name: 'Elena Vance',
  role: 'Flight Surgeon',
  initials: 'EV',
};

const CREW_SEED = {
  ast_001: {
    name: 'Neil A.',
    role: 'Comandante de Misión',
    activity: 'EVA',
    age: 44,
    sex: 'M',
    heightCm: 182,
    weightKg: 78,
    bloodType: 'O+',
    missionDays: 62,
  },
  ast_002: {
    name: 'Ellen O.',
    role: 'Especialista Biomédica',
    activity: 'IVA',
    age: 39,
    sex: 'F',
    heightCm: 168,
    weightKg: 61,
    bloodType: 'A+',
    missionDays: 62,
  },
  ast_003: {
    name: 'Pedro D.',
    role: 'Ingeniero de Vuelo',
    activity: 'REST',
    age: 47,
    sex: 'M',
    heightCm: 176,
    weightKg: 74,
    bloodType: 'B+',
    missionDays: 62,
  },
};

const INITIAL_LOGS = [
  { time: '16:20:00', level: 'INFO', message: 'Sistema modular de telemetría y soporte vital HRP inicializado.' },
  { time: '16:21:15', level: 'SUCCESS', message: 'Enlace telemétrico sintético establecido con las escafandras.' },
  { time: '16:22:40', level: 'INFO', message: 'Motor de alertas y modelo RIDGE cargados.' },
  { time: '16:23:05', level: 'SUCCESS', message: 'Visor biomédico 3D acoplado a la telemetría en tiempo real.' },
];

function calculateEnvironmentalData(environment) {
  return {
    suitPressure: Number((environment.cabinPressureKpa + (Math.random() * 0.4 - 0.2)).toFixed(1)),
    radiation: Number((environment.radiationRateUsVh + (Math.random() * 1.2 - 0.6)).toFixed(1)),
    co2Level: Number((environment.co2MmHg + (Math.random() * 0.2 - 0.1)).toFixed(1)),
  };
}

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [dashboardTab, setDashboardTab] = useState('overview');
  const [selectedAstronautId, setSelectedAstronautId] = useState('ast_001');
  const [currentScenario, setCurrentScenario] = useState('microgravity');
  const [currentEnvironment, setCurrentEnvironment] = useState('transit');
  const [isAutoSimulating, setIsAutoSimulating] = useState(true);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isHandbookOpen, setIsHandbookOpen] = useState(false);
  const [isAddAstronautOpen, setIsAddAstronautOpen] = useState(false);

  const [crewSeed, setCrewSeed] = useState(() => {
    const cached = readJSON(STORAGE_KEYS.crew, null);
    return Array.isArray(cached) && cached.length ? crewArrayToMap(cached) : CREW_SEED;
  });
  const [records, setRecords] = useState(() => loadRecords());
  const [alerts, setAlerts] = useState(() => loadAlerts());
  const [logs, setLogs] = useState(() => {
    const stored = loadLogs();
    return stored.length ? stored : INITIAL_LOGS;
  });
  const [riskHistory, setRiskHistory] = useState(() => loadRiskHistory());
  const [suppressedVitalsIds, setSuppressedVitalsIds] = useState(() => loadSuppressedVitals());
  const [telemetryHistory, setTelemetryHistory] = useState(() => generateHistoryForCrew(crewSeed, 'transit'));
  const [environmentalData, setEnvironmentalData] = useState(() =>
    calculateEnvironmentalData(getEnvironment('transit')),
  );
  const [hydrated, setHydrated] = useState(false);
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [syncEpoch, setSyncEpoch] = useState(0);

  const environment = useMemo(() => getEnvironment(currentEnvironment), [currentEnvironment]);
  const crew = useMemo(() => mergeCrewProfiles(crewSeed, records), [crewSeed, records]);
  const recordSummary = useMemo(() => summarizeRecords(records), [records]);
  const environmentRecord = useMemo(() => getLatestRecord(records, 'environment'), [records]);
  const simulationRecord = useMemo(() => getLatestRecord(records, 'simulation'), [records]);

  const latestVitalsRecords = useMemo(() => {
    const map = {};
    sortRecords(records.filter((record) => record.category === 'vitals' && record.astronautId)).forEach((record) => {
      if (!map[record.astronautId]) map[record.astronautId] = record;
    });
    return map;
  }, [records]);

  const latestVitalsByAstronaut = useMemo(() => {
    const result = {};
    Object.keys(crew).forEach((id) => {
      const history = telemetryHistory[id] || [];
      const lastSample = history[history.length - 1] || generateSyntheticSample('microgravity', environment.id);
      const record = latestVitalsRecords[id];
      const useRecord = record && !suppressedVitalsIds.includes(record.id);

      result[id] = useRecord
        ? {
            ...lastSample,
            ...record.data,
            origin: record.origin || 'manual',
            recordedAt: record.recordedAt,
            timestamp: formatTime(record.recordedAt),
            source: 'Inserción de datos',
            scenario: currentScenario,
            environmentId: currentEnvironment,
          }
        : {
            ...lastSample,
            origin: lastSample.origin || 'simulated',
          };
    });
    return result;
  }, [
    crew,
    telemetryHistory,
    latestVitalsRecords,
    suppressedVitalsIds,
    currentScenario,
    currentEnvironment,
    environment.id,
  ]);

  const selectedLatest = latestVitalsByAstronaut[selectedAstronautId] || {};
  const selectedRecord = latestVitalsRecords[selectedAstronautId];
  const hasSelectedOverlay = Boolean(selectedRecord && !suppressedVitalsIds.includes(selectedRecord.id));
  const baseHistory = telemetryHistory[selectedAstronautId] || [];
  const currentHistory = useMemo(() => {
    if (hasSelectedOverlay) return [...baseHistory.slice(-29), selectedLatest];
    return baseHistory;
  }, [hasSelectedOverlay, baseHistory, selectedLatest]);
  const prevSample = baseHistory.length > 1 ? baseHistory[baseHistory.length - 2] : selectedLatest;

  const evaluations = useMemo(() => evaluateAllVitals(selectedLatest), [selectedLatest]);
  const hasGlobalAlert = ALERTABLE_VITALS.some((key) => severityAtLeast(evaluations[key]?.status, 'critical'));
  const alertSummary = useMemo(() => summarizeAlerts(alerts), [alerts]);

  const runSync = useCallback((key, task) => {
    scheduleSync(key, task, ({ ok, error }) => {
      if (ok) {
        setBackendStatus((previous) => (previous === 'online' ? previous : 'online'));
        return;
      }
      setBackendStatus('offline');
      if (error?.code !== 'network_error') {
        console.warn(`[AeroHealth] Fallo de sincronización (${key}): ${describeApiError(error)}`);
      }
    });
  }, []);

  /**
   * Hidratación inicial: SQLite manda. Si la base está vacía, se importa una
   * sola vez la caché localStorage de versiones anteriores de la consola.
   */
  useEffect(() => {
    let cancelled = false;
    const localSnapshot = readLocalSnapshot();

    (async () => {
      try {
        const { snapshot, migrated } = await hydrateFromBackend(localSnapshot);
        if (cancelled) return;

        setRecords(Array.isArray(snapshot.records) ? snapshot.records : []);
        setAlerts(Array.isArray(snapshot.alerts) ? snapshot.alerts : []);
        if (Array.isArray(snapshot.logs) && snapshot.logs.length) setLogs(snapshot.logs);
        setRiskHistory(Array.isArray(snapshot.riskHistory) ? snapshot.riskHistory : []);
        setSuppressedVitalsIds(Array.isArray(snapshot.suppressedVitals) ? snapshot.suppressedVitals : []);
        if (Array.isArray(snapshot.crew) && snapshot.crew.length) {
          setCrewSeed(crewArrayToMap(snapshot.crew));
        }
        if (migrated) {
          setLogs((previous) => [
            ...previous.slice(-119),
            {
              time: formatTime(new Date()),
              level: 'SUCCESS',
              message: 'Migración localStorage → SQLite completada.',
              timestamp: new Date().toISOString(),
            },
          ]);
        }
        setBackendStatus('online');
      } catch (error) {
        if (cancelled) return;
        console.warn(`[AeroHealth] ${describeApiError(error)}. La consola continúa en modo local.`);
        setBackendStatus('offline');
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Al recuperar la conexión se reintenta el volcado completo del estado.
  useEffect(() => {
    const handleOnline = () => {
      setBackendStatus('connecting');
      setSyncEpoch((value) => value + 1);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const missionDays = crew[selectedAstronautId]?.missionDays ?? 62;
  const riskInputsBundle = useMemo(
    () =>
      buildRiskInputs({
        environment,
        latestSample: selectedLatest,
        environmentRecord,
        simulationRecord,
        scenario: currentScenario,
        missionDays,
      }),
    [environment, selectedLatest, environmentRecord, simulationRecord, currentScenario, missionDays],
  );

  const assessment = useMemo(
    () =>
      evaluateRisks(riskInputsBundle.inputs, {
        environment,
        latestSample: selectedLatest,
        missionDays,
        origin: riskInputsBundle.origin,
      }),
    [riskInputsBundle, environment, selectedLatest, missionDays],
  );

  const alertCandidates = useMemo(
    () => [
      ...buildVitalCandidates(latestVitalsByAstronaut, crew),
      ...buildRiskCandidates(assessment),
      ...buildEcgCandidates(records, crew),
    ],
    [latestVitalsByAstronaut, crew, assessment, records],
  );

  const alertSignatureRef = useRef('');
  useEffect(() => {
    const signature = alertCandidates
      .map((candidate) => `${candidate.dedupeKey}:${candidate.severity}:${candidate.value}`)
      .join('|');
    if (signature === alertSignatureRef.current) return;
    alertSignatureRef.current = signature;
    setAlerts((previous) => reconcileAlerts(previous, alertCandidates));
  }, [alertCandidates]);

  const riskSignatureRef = useRef('');
  useEffect(() => {
    if (!assessment) return;
    const signature = `${assessment.overall.score}:${RISK_ORDER.map((key) => assessment.risks[key].score).join('-')}:${assessment.origin}`;
    if (signature === riskSignatureRef.current) return;
    riskSignatureRef.current = signature;
    setRiskHistory((previous) => [
      {
        id: createId('risk'),
        timestamp: assessment.generatedAt,
        score: assessment.overall.score,
        level: assessment.overall.level,
        levelInfo: assessment.overall.levelInfo,
        worstCode: assessment.overall.worstRisk.code,
        worstName: assessment.overall.worstRisk.shortName,
        origin: assessment.origin,
        scores: RISK_ORDER.reduce((acc, key) => {
          acc[key] = assessment.risks[key].score;
          return acc;
        }, {}),
      },
      ...previous,
    ].slice(0, 60));
  }, [assessment]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.records, records);
    if (!hydrated) return;
    runSync('records', () => api.replaceRecords(records));
  }, [records, hydrated, syncEpoch, runSync]);

  useEffect(() => {
    const suppressed = suppressedVitalsIds.slice(-120);
    writeJSON(STORAGE_KEYS.suppressedVitals, suppressed);
    if (!hydrated) return;
    runSync('suppressed-vitals', () => api.replaceSuppressedVitals(suppressed));
  }, [suppressedVitalsIds, hydrated, syncEpoch, runSync]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.alerts, alerts);
    if (!hydrated) return;
    runSync('alerts', () => api.replaceAlerts(alerts));
  }, [alerts, hydrated, syncEpoch, runSync]);

  useEffect(() => {
    const recent = logs.slice(-120);
    writeJSON(STORAGE_KEYS.logs, recent);
    if (!hydrated) return;
    runSync('logs', () => api.replaceLogs(recent));
  }, [logs, hydrated, syncEpoch, runSync]);

  useEffect(() => {
    const recent = riskHistory.slice(0, 60);
    writeJSON(STORAGE_KEYS.riskHistory, recent);
    if (!hydrated) return;
    runSync('risk-history', () => api.replaceRiskHistory(recent));
  }, [riskHistory, hydrated, syncEpoch, runSync]);

  useEffect(() => {
    writeJSON(STORAGE_KEYS.crew, Object.values(crewSeed));
    if (!hydrated) return;
    runSync('crew', () => api.replaceCrew(Object.values(crewSeed)));
  }, [crewSeed, hydrated, syncEpoch, runSync]);

  const addLog = useCallback((level, message) => {
    setLogs((previous) => [
      ...previous.slice(-119),
      { time: formatTime(new Date()), level, message, timestamp: new Date().toISOString() },
    ]);
  }, []);

  const pushSamples = useCallback(
    (scenarioOverride = null) => {
      setTelemetryHistory((previous) => {
        const next = { ...previous };
        Object.keys(crew).forEach((id) => {
          const scenario =
            scenarioOverride ||
            (id === selectedAstronautId ? currentScenario : id === 'ast_003' ? 'sleep' : 'microgravity');
          next[id] = [...(previous[id] || []).slice(-39), generateSyntheticSample(scenario, currentEnvironment)];
        });
        return next;
      });
      setEnvironmentalData(calculateEnvironmentalData(environment));
    },
    [selectedAstronautId, currentScenario, currentEnvironment, environment, crew],
  );

  useEffect(() => {
    if (!isAutoSimulating) return undefined;
    const interval = window.setInterval(() => pushSamples(), 2500);
    return () => window.clearInterval(interval);
  }, [isAutoSimulating, pushSamples]);

  const handleSelectModule = (id) => {
    setActiveModule(id);
  };

  const handleSelectAstronaut = (id) => {
    setSelectedAstronautId(id);
    addLog('INFO', `Foco telemétrico cambiado a: ${crew[id]?.name || id}`);
  };

  const handleSelectScenario = (scenarioId) => {
    setCurrentScenario(scenarioId);
    const scenario = getScenarioDefinition(scenarioId);
    addLog('INFO', `Escenario de simulación cambiado a [${scenario.code}] ${scenario.name}.`);
    pushSamples(scenarioId);
  };

  const handleSelectEnvironment = (environmentId) => {
    setCurrentEnvironment(environmentId);
    const nextEnvironment = getEnvironment(environmentId);
    setEnvironmentalData(calculateEnvironmentalData(nextEnvironment));
    addLog('INFO', `Entorno operativo actualizado a ${nextEnvironment.name}. Factores RIDGE recalculados.`);
    pushSamples();
  };

  const handleTriggerEmergency = () => {
    setCurrentScenario('hypoxia');
    addLog('CRITICAL', '[EMERGENCIA SIMULADA] Despresurización parcial inyectada en la tripulación.');
    pushSamples('hypoxia');
  };

  const handleResetNominal = () => {
    const now = new Date().toISOString();
    setCurrentScenario('microgravity');
    setSuppressedVitalsIds(Object.values(latestVitalsRecords).map((record) => record.id));
    setAlerts((previous) =>
      previous.map((alert) =>
        alert.kind === 'vital' && alert.status !== 'resolved'
          ? { ...alert, status: 'resolved', resolvedAt: now, lastSeenAt: now }
          : alert,
      ),
    );
    addLog('SUCCESS', 'Telemetría estabilizada a condiciones nominales para toda la tripulación.');
    pushSamples('microgravity');
  };

  const handleApplyCountermeasure = (alert) => {
    if (!alert || alert.kind !== 'vital' || !alert.astronautId) return;
    const astronautRecord = latestVitalsRecords[alert.astronautId];
    if (astronautRecord) {
      setSuppressedVitalsIds((previous) => [...new Set([...previous, astronautRecord.id])]);
    }

    const nominalSample = {
      ...generateSyntheticSample('microgravity', currentEnvironment),
      origin: 'simulated',
      source: 'contramedida_autonoma',
      scenario: 'microgravity',
      recordedAt: new Date().toISOString(),
      timestamp: formatTime(new Date()),
    };

    setTelemetryHistory((previous) => {
      const list = previous[alert.astronautId] || [];
      return {
        ...previous,
        [alert.astronautId]: [...list.slice(-39), nominalSample],
      };
    });

    setAlerts((previous) => resolveAlertsForAstronaut(previous, alert.astronautId));
    if (alert.astronautId === selectedAstronautId) setCurrentScenario('microgravity');
    addLog(
      'SUCCESS',
      `[CONTRAMEDIDA] Protocolo aplicado a ${alert.astronautName || alert.astronautId} (${alert.parameter}). Normalización simulada registrada.`,
    );
  };

  const handleAcknowledgeAlert = (alertId) => {
    setAlerts((previous) => acknowledgeAlert(previous, alertId));
    addLog('INFO', 'Alerta marcada como atendida por el operador.');
  };

  const handleResolveAlert = (alertId) => {
    setAlerts((previous) => resolveAlert(previous, alertId));
    addLog('SUCCESS', 'Alerta marcada como resuelta por el operador.');
  };

  const handleAddAstronaut = useCallback(
    (profile) => {
      const crewCount = Object.keys(crew).length;
      const defaultId = `ast_${String(crewCount + 1).padStart(3, '0')}`;
      const id = (profile.id && profile.id.trim())
        ? profile.id.trim().toLowerCase().replace(/\s+/g, '_')
        : defaultId;

      const newProfile = {
        id,
        name: profile.name?.trim() || 'Nuevo Tripulante',
        role: profile.role?.trim() || 'Especialista de Misión',
        activity: profile.activity || 'IVA',
        age: Number(profile.age) || 38,
        sex: profile.sex || 'O',
        heightCm: profile.heightCm ? Number(profile.heightCm) : null,
        weightKg: profile.weightKg ? Number(profile.weightKg) : null,
        bloodType: profile.bloodType || 'O+',
        missionDays: Number(profile.missionDays) || 0,
      };

      setCrewSeed((previous) => ({
        ...previous,
        [id]: newProfile,
      }));

      const initialHistory = Array.from({ length: 13 }, () =>
        generateSyntheticSample(newProfile.activity === 'EVA' ? 'eva' : 'microgravity', currentEnvironment)
      );
      setTelemetryHistory((previous) => ({
        ...previous,
        [id]: initialHistory,
      }));

      const record = createRecord({
        category: 'astronaut',
        data: {
          astronautId: id,
          fullName: newProfile.name,
          role: newProfile.role,
          activity: newProfile.activity,
          age: newProfile.age,
          sex: newProfile.sex,
          heightCm: newProfile.heightCm,
          weightKg: newProfile.weightKg,
          bloodType: newProfile.bloodType,
          missionDays: newProfile.missionDays,
          notes: profile.notes || 'Tripulante incorporado a la tripulación oficial.',
        },
      });
      setRecords((previous) => [record, ...previous]);

      setSelectedAstronautId(id);

      runSync('crew', () => api.createCrew(newProfile));

      addLog(
        'SUCCESS',
        `Nuevo tripulante incorporado a la misión: ${newProfile.name} (${id.toUpperCase()}) · ${newProfile.role} [${newProfile.activity}].`,
      );

      return newProfile;
    },
    [crew, currentEnvironment, runSync, addLog],
  );

  const handleSaveRecord = ({ category, data, existingId }) => {
    const existing = existingId ? records.find((record) => record.id === existingId) : null;
    const record = createRecord({ category, data, existing });

    setRecords((previous) =>
      existing ? previous.map((item) => (item.id === record.id ? record : item)) : [record, ...previous],
    );

    if (category === 'astronaut') {
      const astId = record.data?.astronautId;
      if (astId) {
        setCrewSeed((previous) => ({
          ...previous,
          [astId]: {
            id: astId,
            name: record.data.fullName || previous[astId]?.name || astId,
            role: record.data.role || previous[astId]?.role || 'Tripulante',
            activity: record.data.activity || previous[astId]?.activity || 'IVA',
            age: record.data.age ?? previous[astId]?.age ?? null,
            sex: record.data.sex ?? previous[astId]?.sex ?? null,
            heightCm: record.data.heightCm ?? previous[astId]?.heightCm ?? null,
            weightKg: record.data.weightKg ?? previous[astId]?.weightKg ?? null,
            bloodType: record.data.bloodType ?? previous[astId]?.bloodType ?? null,
            missionDays: record.data.missionDays ?? previous[astId]?.missionDays ?? 0,
          },
        }));
        setTelemetryHistory((previous) => {
          if (previous[astId]?.length) return previous;
          return {
            ...previous,
            [astId]: Array.from({ length: 13 }, () => generateSyntheticSample('microgravity', currentEnvironment)),
          };
        });
      }
    }

    if (category === 'vitals') {
      setSuppressedVitalsIds((previous) => previous.filter((id) => id !== record.id));
    }

    if (category === 'environment') {
      setEnvironmentalData((previous) => ({
        ...previous,
        suitPressure: record.data.pressureKpa ?? previous.suitPressure,
        radiation: record.data.radiationRateMsvDay ?? previous.radiation,
        co2Level: record.data.co2MmHg ?? previous.co2Level,
      }));
    }

    if (category === 'simulation' && record.data.applyToSimulator) {
      if (record.data.scenario) setCurrentScenario(record.data.scenario);
      if (record.data.environmentId) setCurrentEnvironment(record.data.environmentId);
      addLog('INFO', `[SIMULACIÓN] Escenario aplicado desde registro: ${record.data.scenario} · ${record.data.environmentId}.`);
    }

    addLog(
      'SUCCESS',
      `[INSERCIÓN DE DATOS] ${existing ? 'Registro actualizado' : 'Registro creado'} · ${category} · origen ${record.origin}.`,
    );
    return record;
  };

  const handleDeleteRecord = (recordId) => {
    const record = records.find((item) => item.id === recordId);
    setRecords((previous) => previous.filter((item) => item.id !== recordId));
    setSuppressedVitalsIds((previous) => previous.filter((id) => id !== recordId));
    addLog('INFO', `[INSERCIÓN DE DATOS] Registro eliminado · ${record?.category || 'desconocido'}.`);
  };

  const handleSaveSimulationRun = () => {
    const inputs = riskInputsBundle.inputs;
    const scenario = getScenarioDefinition(currentScenario);
    const data = {
      recordedAt: new Date().toISOString(),
      scenario: currentScenario,
      environmentId: currentEnvironment,
      durationMin: 120,
      gravityG: inputs.gravityG,
      radiationRateMsvDay: inputs.radiationRateMsvDay,
      cumulativeRadiationMsv: inputs.cumulativeRadiationMsv,
      o2Pct: inputs.o2Pct,
      co2MmHg: inputs.co2MmHg,
      cabinTempC: inputs.cabinTempC,
      isolationDays: inputs.isolationDays,
      sleepHours: inputs.sleepHours,
      stressLevel: inputs.stressLevel,
      moodScore: inputs.moodScore,
      socialContactsPerWeek: inputs.socialContactsPerWeek,
      autonomyPct: inputs.autonomyPct,
      medicalStockPct: inputs.medicalStockPct,
      result: `Corrida ${scenario.name} en ${environment.shortName}. Riesgo global ${assessment.overall.score}/100 (${assessment.overall.levelInfo.label}).`,
      origin: 'simulated',
      notes: 'Registro creado desde el simulador. Datos 100% sintéticos.',
      applyToSimulator: false,
    };
    const record = createRecord({ category: 'simulation', data });
    setRecords((previous) => [record, ...previous]);
    addLog('SUCCESS', `[SIMULACIÓN] Corrida guardada · ${scenario.code} · ${environment.shortName}.`);
    return record;
  };

  const openDashboardTab = (tab) => {
    setActiveModule('dashboard');
    setDashboardTab(tab);
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden text-slate-100">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(820px 480px at 76% -8%, rgba(34,211,238,0.08), transparent 62%), radial-gradient(720px 420px at 12% 104%, rgba(96,165,250,0.05), transparent 65%)',
        }}
      />

      <Sidebar
        activeModule={activeModule}
        setActiveModule={handleSelectModule}
        alertCount={alertSummary.active}
      />

      <div className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col">
        <Header user={SESSION_USER} backendStatus={backendStatus} />

        <main className="flex-1 w-full">
          <div className="mx-auto w-full max-w-[1680px] px-3.5 pb-24 pt-4 sm:px-5 sm:pt-5 lg:px-6 lg:pb-6">
            <div key={activeModule} className="animate-slide-up">
              {activeModule === 'dashboard' ? (
                <Dashboard
                  tab={dashboardTab}
                  setTab={setDashboardTab}
                  astronauts={crew}
                  crew={crew}
                  selectedAstronautId={selectedAstronautId}
                  setSelectedAstronautId={handleSelectAstronaut}
                  latestVitalsByAstronaut={latestVitalsByAstronaut}
                  latestSample={selectedLatest}
                  evaluations={evaluations}
                  assessment={assessment}
                  environment={environment}
                  currentScenario={currentScenario}
                  alerts={alerts}
                  alertSummary={alertSummary}
                  records={records}
                  recordSummary={recordSummary}
                  riskHistory={riskHistory}
                  riskInputs={riskInputsBundle.inputs}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onResolveAlert={handleResolveAlert}
                  onApplyCountermeasure={handleApplyCountermeasure}
                  onResetNominal={handleResetNominal}
                  onSaveRecord={handleSaveRecord}
                  onDeleteRecord={handleDeleteRecord}
                  onOpenDictionary={() => setIsDictionaryOpen(true)}
                  onOpenHandbook={() => setIsHandbookOpen(true)}
                  onOpenTelemetry={() => setActiveModule('telemetry')}
                  onOpenSimulator={() => setActiveModule('simulator')}
                  onOpenAddAstronaut={() => setIsAddAstronautOpen(true)}
                />
              ) : null}

              {activeModule === 'telemetry' ? (
                <BiomedicalTelemetry
                  astronauts={crew}
                  selectedAstronautId={selectedAstronautId}
                  setSelectedAstronautId={handleSelectAstronaut}
                  latestVitalsByAstronaut={latestVitalsByAstronaut}
                  currentHistory={currentHistory}
                  latestSample={selectedLatest}
                  prevSample={prevSample}
                  evaluations={evaluations}
                  currentScenario={currentScenario}
                  environment={environment}
                  records={records}
                  alertSummary={alertSummary}
                  hasGlobalAlert={hasGlobalAlert}
                  onOpenAlerts={() => openDashboardTab('alerts')}
                  onOpenData={() => openDashboardTab('data')}
                  onOpenAddAstronaut={() => setIsAddAstronautOpen(true)}
                />
              ) : null}

              {activeModule === 'simulator' ? (
                <MissionSimulator
                  currentScenario={currentScenario}
                  handleSelectScenario={handleSelectScenario}
                  currentEnvironment={currentEnvironment}
                  handleSelectEnvironment={handleSelectEnvironment}
                  isAutoSimulating={isAutoSimulating}
                  setIsAutoSimulating={setIsAutoSimulating}
                  handleTick={() => pushSamples()}
                  handleTriggerEmergency={handleTriggerEmergency}
                  handleResetNominal={handleResetNominal}
                  environmentalData={environmentalData}
                  logs={logs}
                  astronauts={crew}
                  selectedAstronautId={selectedAstronautId}
                  environment={environment}
                  assessment={assessment}
                  riskInputs={riskInputsBundle}
                  records={records}
                  onSaveRun={handleSaveSimulationRun}
                  onOpenRisks={() => openDashboardTab('risks')}
                  onOpenDataEntry={() => openDashboardTab('data')}
                />
              ) : null}
            </div>
          </div>
        </main>

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
              <span>NASA HRP · RIDGE</span>
              <span className="text-slate-700">/</span>
              <span className="flex items-center gap-1.5 text-telemetry-green">
                <span className="h-1.5 w-1.5 rounded-full bg-telemetry-green" />
                BUILD 2.1.0 · API
              </span>
            </div>
          </div>
        </footer>
      </div>

      {isHandbookOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-space-950/80 p-2 backdrop-blur-md sm:p-4">
          <div className="relative my-2 w-full max-w-[1440px] rounded-lg border border-space-700 bg-space-950 shadow-2xl sm:my-4">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-lg border-b border-space-700 bg-space-950/95 px-3 py-2 backdrop-blur-xl">
              <span className="flex items-center gap-2 font-heading text-[12px] font-bold text-slate-200">
                <BookOpen className="h-4 w-4 text-telemetry-cyan" aria-hidden="true" />
                Manual médico NASA HRP · cinco riesgos RIDGE
              </span>
              <button
                type="button"
                onClick={() => setIsHandbookOpen(false)}
                className="btn btn-ghost btn-icon"
                aria-label="Cerrar manual"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="p-2 sm:p-3">
              <MedicalHandbook />
            </div>
          </div>
        </div>
      ) : null}

      <DataDictionaryModal isOpen={isDictionaryOpen} onClose={() => setIsDictionaryOpen(false)} />
      <AddAstronautModal
        isOpen={isAddAstronautOpen}
        onClose={() => setIsAddAstronautOpen(false)}
        onAddAstronaut={handleAddAstronaut}
        existingCrewCount={Object.keys(crew).length}
      />
    </div>
  );
}
