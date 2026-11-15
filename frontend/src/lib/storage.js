/**
 * Persistencia local de la consola.
 *
 * El repositorio no incluye backend funcional (backend/README.md es un
 * placeholder). La aplicación usa localStorage detrás de esta abstracción para
 * que pueda sustituirse por una API REST sin tocar los módulos.
 */

const PREFIX = 'aerohealth.v2.';

export const STORAGE_KEYS = {
  records: 'records',
  alerts: 'alerts',
  logs: 'logs',
  riskHistory: 'riskHistory',
  suppressedVitals: 'vitals.suppressed',
  sidebarCollapsed: 'ui.sidebarCollapsed',
};

function namespaced(key) {
  return `${PREFIX}${key}`;
}

export function storageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = `${PREFIX}__probe__`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readJSON(key, fallback) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    const raw = window.localStorage.getItem(namespaced(key));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem(namespaced(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeJSON(key) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.removeItem(namespaced(key));
    return true;
  } catch {
    return false;
  }
}

export function clearAppStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

export function createId(prefix = 'id') {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}_${crypto.randomUUID()}`;
    }
  } catch {
    // Fallback determinista para navegadores antiguos.
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function loadRecords() {
  const records = readJSON(STORAGE_KEYS.records, []);
  return Array.isArray(records) ? records : [];
}

export function loadAlerts() {
  const alerts = readJSON(STORAGE_KEYS.alerts, []);
  return Array.isArray(alerts) ? alerts : [];
}

export function loadLogs() {
  const logs = readJSON(STORAGE_KEYS.logs, []);
  return Array.isArray(logs) ? logs : [];
}

export function loadRiskHistory() {
  const history = readJSON(STORAGE_KEYS.riskHistory, []);
  return Array.isArray(history) ? history : [];
}

/**
 * Registros de constantes vitales que ya han sido neutralizados por una
 * contramedida o un restablecimiento. Persisten para que la alerta no vuelva
 * a abrirse automáticamente al recargar la consola.
 */
export function loadSuppressedVitals() {
  const value = readJSON(STORAGE_KEYS.suppressedVitals, []);
  return Array.isArray(value) ? value : [];
}

export function loadSidebarCollapsed() {
  const value = readJSON(STORAGE_KEYS.sidebarCollapsed, false);
  return Boolean(value);
}
