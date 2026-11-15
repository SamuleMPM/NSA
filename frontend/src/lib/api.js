/**
 * Cliente HTTP de la API AeroHealth.
 *
 * En desarrollo Vite reenvía /api al backend (ver vite.config.js). En
 * producción el propio servidor Node sirve el bundle y la API en el mismo
 * origen. VITE_API_URL permite apuntar a otro host.
 */

const RAW_BASE = import.meta.env?.VITE_API_URL || '/api';
export const API_BASE = String(RAW_BASE).replace(/\/+$/, '');
export const API_DISABLED = import.meta.env?.VITE_DISABLE_API === 'true';

export class ApiRequestError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function buildUrl(path, params) {
  const base = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (!params) return base;
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

async function request(path, { method = 'GET', body, params, timeoutMs = 9000, signal } = {}) {
  if (API_DISABLED) {
    throw new ApiRequestError('La API está desactivada por configuración.', { code: 'api_disabled' });
  }

  const controller = new AbortController();
  const timeout = timeoutMs > 0 ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
  const abortFromCaller = () => controller.abort();
  if (signal) signal.addEventListener('abort', abortFromCaller, { once: true });

  try {
    const response = await fetch(buildUrl(path, params), {
      method,
      headers: body === undefined ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 204) return null;

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      throw new ApiRequestError(
        payload?.error?.message || `La API respondió ${response.status}.`,
        {
          status: response.status,
          code: payload?.error?.code || 'http_error',
          details: payload?.error?.details,
        },
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    if (error?.name === 'AbortError') {
      throw new ApiRequestError('La API no respondió a tiempo.', { code: 'timeout' });
    }
    throw new ApiRequestError('No se pudo conectar con la API.', { code: 'network_error' });
  } finally {
    if (timeout) window.clearTimeout(timeout);
    if (signal) signal.removeEventListener('abort', abortFromCaller);
  }
}

function unwrap(payload) {
  return payload?.data;
}

export const api = {
  health: () => request('/health', { timeoutMs: 4000 }),

  fetchBootstrap: async () => unwrap(await request('/bootstrap')),

  replaceState: async (state) => unwrap(await request('/state', { method: 'PUT', body: state })),

  fetchStats: async () => unwrap(await request('/stats')),

  listRecords: async (params) => {
    const payload = await request('/records', { params });
    return { records: payload?.data || [], meta: payload?.meta || {} };
  },

  createRecord: async (record) => unwrap(await request('/records', { method: 'POST', body: record })),

  replaceRecords: async (records) => unwrap(await request('/records', { method: 'PUT', body: { records } })),

  updateRecord: async (id, record) => unwrap(await request(`/records/${encodeURIComponent(id)}`, { method: 'PUT', body: record })),

  deleteRecord: (id) => request(`/records/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  replaceAlerts: async (alerts) => unwrap(await request('/alerts', { method: 'PUT', body: { alerts } })),

  replaceLogs: async (logs) => unwrap(await request('/logs', { method: 'PUT', body: { logs } })),

  appendLog: async (log) => unwrap(await request('/logs', { method: 'POST', body: log })),

  replaceRiskHistory: async (riskHistory) => unwrap(await request('/risk-history', { method: 'PUT', body: { riskHistory } })),

  replaceSuppressedVitals: async (suppressedVitals) => unwrap(await request('/suppressed-vitals', { method: 'PUT', body: { suppressedVitals } })),

  listCrew: async () => unwrap(await request('/crew')),

  createCrew: async (profile) => unwrap(await request('/crew', { method: 'POST', body: profile })),

  replaceCrew: async (crew) => unwrap(await request('/crew', { method: 'PUT', body: { crew } })),

  updateCrew: async (id, profile) => unwrap(await request(`/crew/${encodeURIComponent(id)}`, { method: 'PUT', body: profile })),
};

export function describeApiError(error) {
  if (!(error instanceof ApiRequestError)) return 'Error desconocido';
  if (error.code === 'network_error') return 'API no disponible';
  if (error.code === 'timeout') return 'API sin respuesta';
  return error.message;
}
