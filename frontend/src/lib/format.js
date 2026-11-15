/** Utilidades de formato y tiempo compartidas por la consola. */

export function clamp(value, min = 0, max = 100) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return min;
  return Math.min(max, Math.max(min, numeric));
}

export function formatNumber(value, digits = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '--';
  return numeric.toLocaleString('es-ES', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatInteger(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '--';
  return numeric.toLocaleString('es-ES', { maximumFractionDigits: 0 });
}

export function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '--';
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatTime(value) {
  const date = toDate(value);
  if (!date) return '--:--:--';
  return date.toLocaleTimeString('es-ES', { hour12: false });
}

export function formatShortDate(value) {
  const date = toDate(value);
  if (!date) return '--';
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(value, now = Date.now()) {
  const date = toDate(value);
  if (!date) return 'sin registro';
  const diffSeconds = Math.round((now - date.getTime()) / 1000);
  if (Math.abs(diffSeconds) < 10) return 'ahora';
  if (diffSeconds < 60) return `hace ${diffSeconds} s`;
  const minutes = Math.round(diffSeconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

/** Valor compatible con <input type="datetime-local">. */
export function toLocalInputValue(value = new Date()) {
  const date = toDate(value) || new Date();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function toIso(value, fallback = new Date().toISOString()) {
  const date = toDate(value);
  return date ? date.toISOString() : fallback;
}

export function classNames(...values) {
  return values.filter(Boolean).join(' ');
}

export function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function downloadJson(filename, payload) {
  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
