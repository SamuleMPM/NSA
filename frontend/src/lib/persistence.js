/**
 * Coordinación entre la caché local (localStorage) y la API REST.
 *
 * La UI arranca al instante con la caché y luego se hidrata desde SQLite. Si el
 * backend no está disponible, la consola sigue funcionando en modo local y
 * reintenta en la siguiente escritura.
 */

import { api } from './api';
import {
  loadAlerts,
  loadLogs,
  loadRecords,
  loadRiskHistory,
  loadSuppressedVitals,
  readJSON,
  writeJSON,
  STORAGE_KEYS,
} from './storage';

const timers = new Map();
const DEFAULT_DEBOUNCE_MS = 250;

export const SNAPSHOT_KEYS = ['records', 'alerts', 'logs', 'riskHistory', 'suppressedVitals'];

export function readLocalSnapshot() {
  return {
    records: loadRecords(),
    alerts: loadAlerts(),
    logs: loadLogs(),
    riskHistory: loadRiskHistory(),
    suppressedVitals: loadSuppressedVitals(),
    crew: readJSON(STORAGE_KEYS.crew, []),
  };
}

export function cacheSnapshot(snapshot) {
  writeJSON(STORAGE_KEYS.records, snapshot.records || []);
  writeJSON(STORAGE_KEYS.alerts, snapshot.alerts || []);
  writeJSON(STORAGE_KEYS.logs, (snapshot.logs || []).slice(-120));
  writeJSON(STORAGE_KEYS.riskHistory, (snapshot.riskHistory || []).slice(0, 60));
  writeJSON(STORAGE_KEYS.suppressedVitals, (snapshot.suppressedVitals || []).slice(-120));
  if (snapshot.crew) writeJSON(STORAGE_KEYS.crew, snapshot.crew);
}

export function cacheCrew(crew) {
  writeJSON(STORAGE_KEYS.crew, crew);
}

export function snapshotHasData(snapshot) {
  if (!snapshot) return false;
  return SNAPSHOT_KEYS.some((key) => Array.isArray(snapshot[key]) && snapshot[key].length > 0);
}

export function crewArrayToMap(crew = []) {
  return crew.reduce((acc, profile) => {
    if (profile?.id) acc[profile.id] = profile;
    return acc;
  }, {});
}

/**
 * Programa una escritura por recurso. Varias mutaciones seguidas del mismo
 * recurso se colapsan en una sola petición.
 */
export function scheduleSync(key, task, onResult, delay = DEFAULT_DEBOUNCE_MS) {
  if (timers.has(key)) window.clearTimeout(timers.get(key));
  const timer = window.setTimeout(async () => {
    timers.delete(key);
    try {
      const result = await task();
      onResult?.({ ok: true, result });
    } catch (error) {
      onResult?.({ ok: false, error });
    }
  }, delay);
  timers.set(key, timer);
}

export function cancelScheduledSync(key) {
  if (timers.has(key)) {
    window.clearTimeout(timers.get(key));
    timers.delete(key);
  }
}

/**
 * Primer arranque: si SQLite está vacío pero el navegador conserva registros
 * de la versión localStorage, se importan una única vez.
 */
export async function hydrateFromBackend(localSnapshot) {
  const remote = await api.fetchBootstrap();
  if (snapshotHasData(remote)) {
    return { snapshot: remote, migrated: false };
  }
  if (!snapshotHasData(localSnapshot)) {
    return { snapshot: remote, migrated: false };
  }

  const migrated = await api.replaceState({
    records: localSnapshot.records,
    alerts: localSnapshot.alerts,
    logs: localSnapshot.logs,
    riskHistory: localSnapshot.riskHistory,
    suppressedVitals: localSnapshot.suppressedVitals,
  });
  return { snapshot: migrated, migrated: true };
}
