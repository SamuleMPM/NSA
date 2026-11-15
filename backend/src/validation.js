import { createId } from './ids.js';

export const RECORD_CATEGORIES = [
  'astronaut',
  'vitals',
  'telemetry',
  'ecg',
  'environment',
  'simulation',
];

export const ORIGINS = ['manual', 'simulated', 'automated'];

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message, details) {
  return new ApiError(400, 'bad_request', message, details);
}

export function notFound(message = 'Recurso no encontrado.') {
  return new ApiError(404, 'not_found', message);
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function asString(value, maxLength = 2000) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, maxLength);
}

export function asIsoDate(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString();
}

export function asNumber(value, fallback = null) {
  if (value === undefined || value === null || value === '') return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function requireRecordCategory(value) {
  const category = asString(value, 40);
  if (!category || !RECORD_CATEGORIES.includes(category)) {
    throw badRequest(`Categoría inválida. Valores admitidos: ${RECORD_CATEGORIES.join(', ')}.`);
  }
  return category;
}

export function requireOrigin(value, fallback = 'manual') {
  const origin = asString(value, 20) || fallback;
  if (!ORIGINS.includes(origin)) {
    throw badRequest(`Origen inválido. Valores admitidos: ${ORIGINS.join(', ')}.`);
  }
  return origin;
}

/**
 * Normaliza el cuerpo de un registro. El servidor tolera registros creados por
 * el cliente y completa identidad, fechas y título si faltan.
 */
export function normalizeRecordInput(body, { existing = null, partial = false } = {}) {
  if (!isPlainObject(body)) throw badRequest('El registro debe ser un objeto JSON.');

  const category = body.category !== undefined
    ? requireRecordCategory(body.category)
    : existing?.category;

  if (!category) throw badRequest('El campo "category" es obligatorio.');

  const rawData = body.data !== undefined
    ? (partial && existing && isPlainObject(existing.data) ? { ...existing.data, ...body.data } : body.data)
    : existing?.data;
  if (!isPlainObject(rawData)) throw badRequest('El campo "data" debe ser un objeto JSON.');

  const now = new Date().toISOString();
  const recordedAt = asIsoDate(body.recordedAt, existing?.recordedAt || asIsoDate(rawData.recordedAt, now));
  const origin = requireOrigin(body.origin ?? rawData.origin, existing?.origin || (category === 'simulation' ? 'simulated' : 'manual'));

  const data = { ...rawData };
  if (!data.recordedAt) data.recordedAt = recordedAt;
  if (!data.origin) data.origin = origin;

  const astronautId = asString(
    body.astronautId !== undefined ? body.astronautId : data.astronautId ?? existing?.astronautId,
    80,
  );

  if (category !== 'environment' && category !== 'simulation' && body.astronautId === undefined && data.astronautId === undefined && !existing) {
    // La categoría astronauta exige tripulante; el resto puede no tenerlo.
    if (category === 'astronaut') throw badRequest('El campo "astronautId" es obligatorio para la categoría astronauta.');
  }

  const title = asString(body.title, 300)
    || existing?.title
    || buildTitle(category, data);

  const id = asString(body.id, 120) || existing?.id || createId('rec');
  if (id.length > 120) throw badRequest('El identificador del registro es demasiado largo.');

  const createdAt = partial && existing ? existing.createdAt : asIsoDate(body.createdAt, existing?.createdAt || now);

  return {
    id,
    category,
    title,
    astronautId: astronautId || null,
    origin,
    recordedAt,
    createdAt,
    updatedAt: now,
    data,
  };
}

function buildTitle(category, data = {}) {
  if (category === 'vitals') {
    return `HR ${data.heart_rate ?? '--'} bpm · SpO₂ ${data.spo2 ?? '--'} % · T ${data.temperature ?? '--'} °C · RR ${data.respiratory_rate ?? '--'} rpm`;
  }
  if (category === 'astronaut') {
    return `${data.fullName || 'Tripulante'} · ${data.role || 'rol sin definir'} · ${data.activity || 'IVA'}`;
  }
  if (category === 'telemetry') {
    return `${data.source || 'fuente'} · ${data.sampling_hz ?? '--'} Hz · calidad ${data.signal_quality ?? '--'} %`;
  }
  if (category === 'ecg') {
    return `${data.rhythm || 'ritmo'} · PR ${data.pr_ms ?? '--'} ms · QRS ${data.qrs_ms ?? '--'} ms · QTc ${data.qtc_ms ?? '--'} ms`;
  }
  if (category === 'environment') {
    return `O₂ ${data.o2Pct ?? '--'} % · CO₂ ${data.co2MmHg ?? '--'} mmHg · ${data.pressureKpa ?? '--'} kPa · ${data.cabinTempC ?? '--'} °C`;
  }
  if (category === 'simulation') {
    return `${data.scenario || 'escenario'} · ${data.environmentId || 'entorno'} · ${data.durationMin ?? '--'} min`;
  }
  return 'Registro';
}

export function normalizeAlertInput(value, now = new Date().toISOString()) {
  if (!isPlainObject(value)) throw badRequest('Cada alerta debe ser un objeto JSON.');
  const payload = { ...value };
  const id = asString(payload.id, 120) || createId('alert');
  payload.id = id;
  payload.status = asString(payload.status, 20) || 'active';
  payload.severity = asString(payload.severity, 20) || 'info';
  payload.kind = asString(payload.kind, 20) || 'vital';
  payload.detectedAt = asIsoDate(payload.detectedAt, now);
  payload.firstDetectedAt = asIsoDate(payload.firstDetectedAt, payload.detectedAt);
  payload.lastSeenAt = asIsoDate(payload.lastSeenAt, now);
  includeJsonSafe(payload);
  return payload;
}

export function normalizeLogInput(value, now = new Date().toISOString()) {
  if (!isPlainObject(value)) throw badRequest('Cada log debe ser un objeto JSON.');
  const message = asString(value.message, 4000);
  if (!message) throw badRequest('El log requiere "message".');
  return {
    time: asString(value.time, 20) || now.slice(11, 19),
    level: (asString(value.level, 20) || 'INFO').toUpperCase(),
    message,
    timestamp: asIsoDate(value.timestamp, now),
  };
}

export function normalizeRiskInput(value, now = new Date().toISOString()) {
  if (!isPlainObject(value)) throw badRequest('Cada entrada de riesgo debe ser un objeto JSON.');
  const score = asNumber(value.score, null);
  if (score === null) throw badRequest('Cada entrada de riesgo requiere "score" numérico.');
  return {
    id: asString(value.id, 120) || createId('risk'),
    timestamp: asIsoDate(value.timestamp, now),
    score,
    level: asString(value.level, 30) || 'unknown',
    levelInfo: isPlainObject(value.levelInfo) ? value.levelInfo : null,
    worstCode: asString(value.worstCode, 10) || null,
    worstName: asString(value.worstName, 120) || null,
    origin: asString(value.origin, 20) || 'simulated',
    scores: isPlainObject(value.scores) ? value.scores : {},
  };
}

export function normalizeCrewInput(body, existing = null) {
  if (!isPlainObject(body)) throw badRequest('El perfil debe ser un objeto JSON.');
  const name = asString(body.name, 120) || existing?.name;
  if (!name) throw badRequest('El perfil requiere "name".');
  return {
    id: asString(body.id, 80) || existing?.id,
    name,
    role: asString(body.role, 120) || existing?.role || 'Tripulante',
    activity: asString(body.activity, 20) || existing?.activity || 'IVA',
    age: asNumber(body.age, existing?.age ?? null),
    sex: asString(body.sex, 10) ?? existing?.sex ?? null,
    heightCm: asNumber(body.heightCm, existing?.heightCm ?? null),
    weightKg: asNumber(body.weightKg, existing?.weightKg ?? null),
    bloodType: asString(body.bloodType, 10) ?? existing?.bloodType ?? null,
    missionDays: asNumber(body.missionDays, existing?.missionDays ?? 0),
  };
}

/**
 * node:sqlite solo acepta null/number/bigint/string/Uint8Array. Se eliminan
 * undefined y funciones antes de serializar el payload completo.
 */
function includeJsonSafe(value) {
  if (value === undefined) return;
  if (typeof value === 'function' || typeof value === 'symbol') return;
  if (Array.isArray(value)) {
    value.forEach(includeJsonSafe);
    return;
  }
  if (isPlainObject(value)) {
    Object.keys(value).forEach((key) => {
      if (value[key] === undefined || typeof value[key] === 'function') delete value[key];
      else includeJsonSafe(value[key]);
    });
  }
}
