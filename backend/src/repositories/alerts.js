import { transaction } from '../db.js';

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function mapAlert(row) {
  if (!row) return null;
  const payload = parseJson(row.payload, {});
  return {
    ...payload,
    id: row.id,
    status: row.status || payload.status || 'active',
    severity: row.severity || payload.severity || 'info',
    kind: row.kind || payload.kind || 'vital',
  };
}

export function listAlerts(db, filters = {}) {
  const clauses = [];
  const params = [];
  if (filters.status) {
    clauses.push('status = ?');
    params.push(filters.status);
  }
  if (filters.severity) {
    clauses.push('severity = ?');
    params.push(filters.severity);
  }
  if (filters.kind) {
    clauses.push('kind = ?');
    params.push(filters.kind);
  }
  if (filters.astronautId) {
    clauses.push('astronaut_id = ?');
    params.push(filters.astronautId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return db
    .prepare(`SELECT * FROM alerts ${where} ORDER BY last_seen_at DESC, detected_at DESC`)
    .all(...params)
    .map(mapAlert);
}

export function getAlert(db, id) {
  return mapAlert(db.prepare('SELECT * FROM alerts WHERE id = ?').get(id));
}

function insertAlert(db, alert) {
  db.prepare(`
    INSERT INTO alerts (
      id, dedupe_key, kind, parameter_key, severity, status, astronaut_id, origin,
      detected_at, first_detected_at, last_seen_at, acknowledged_at, resolved_at, payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      dedupe_key = excluded.dedupe_key,
      kind = excluded.kind,
      parameter_key = excluded.parameter_key,
      severity = excluded.severity,
      status = excluded.status,
      astronaut_id = excluded.astronaut_id,
      origin = excluded.origin,
      detected_at = excluded.detected_at,
      first_detected_at = excluded.first_detected_at,
      last_seen_at = excluded.last_seen_at,
      acknowledged_at = excluded.acknowledged_at,
      resolved_at = excluded.resolved_at,
      payload = excluded.payload
  `).run(
    alert.id,
    alert.dedupeKey ?? null,
    alert.kind ?? null,
    alert.parameterKey ?? null,
    alert.severity ?? null,
    alert.status ?? null,
    alert.astronautId ?? null,
    alert.origin ?? null,
    alert.detectedAt ?? null,
    alert.firstDetectedAt ?? null,
    alert.lastSeenAt ?? null,
    alert.acknowledgedAt ?? null,
    alert.resolvedAt ?? null,
    JSON.stringify(alert),
  );
}

export function upsertAlert(db, alert) {
  insertAlert(db, alert);
  return getAlert(db, alert.id);
}

export function replaceAlerts(db, alerts) {
  return transaction(db, () => {
    db.exec('DELETE FROM alerts');
    alerts.forEach((alert) => insertAlert(db, alert));
    return listAlerts(db);
  });
}

export function deleteAlert(db, id) {
  const result = db.prepare('DELETE FROM alerts WHERE id = ?').run(id);
  return Number(result.changes) > 0;
}

export function clearAlerts(db) {
  db.exec('DELETE FROM alerts');
}
