import { transaction } from '../db.js';
import { upsertCrewFromAstronautRecord } from './crew.js';

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function mapRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    astronautId: row.astronaut_id || null,
    origin: row.origin,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    data: parseJson(row.data, {}),
  };
}

function clamp(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(numeric)));
}

export function listRecords(db, filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.category) {
    clauses.push('category = ?');
    params.push(filters.category);
  }
  if (filters.astronautId) {
    clauses.push('astronaut_id = ?');
    params.push(filters.astronautId);
  }
  if (filters.origin) {
    clauses.push('origin = ?');
    params.push(filters.origin);
  }
  if (filters.from) {
    clauses.push('recorded_at >= ?');
    params.push(filters.from);
  }
  if (filters.to) {
    clauses.push('recorded_at <= ?');
    params.push(filters.to);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = clamp(filters.limit, 1, 1000, 500);
  const offset = clamp(filters.offset, 0, Number.MAX_SAFE_INTEGER, 0);

  const totalRow = db.prepare(`SELECT COUNT(*) AS total FROM records ${where}`).get(...params);
  const rows = db
    .prepare(`SELECT * FROM records ${where} ORDER BY recorded_at DESC, created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  return {
    data: rows.map(mapRecord),
    meta: { total: Number(totalRow?.total ?? 0), limit, offset },
  };
}

export function getRecord(db, id) {
  const row = db.prepare('SELECT * FROM records WHERE id = ?').get(id);
  return mapRecord(row);
}

export function createRecord(db, record) {
  return transaction(db, () => {
    db.prepare(`
      INSERT INTO records (id, category, title, astronaut_id, origin, recorded_at, created_at, updated_at, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id,
      record.category,
      record.title,
      record.astronautId,
      record.origin,
      record.recordedAt,
      record.createdAt,
      record.updatedAt,
      JSON.stringify(record.data),
    );
    if (record.category === 'astronaut') upsertCrewFromAstronautRecord(db, record);
    return getRecord(db, record.id);
  });
}

export function updateRecord(db, record) {
  return transaction(db, () => {
    const result = db.prepare(`
      UPDATE records
         SET category = ?, title = ?, astronaut_id = ?, origin = ?, recorded_at = ?,
             created_at = ?, updated_at = ?, data = ?
       WHERE id = ?
    `).run(
      record.category,
      record.title,
      record.astronautId,
      record.origin,
      record.recordedAt,
      record.createdAt,
      record.updatedAt,
      JSON.stringify(record.data),
      record.id,
    );
    if (Number(result.changes) === 0) return null;
    if (record.category === 'astronaut') upsertCrewFromAstronautRecord(db, record);
    return getRecord(db, record.id);
  });
}

export function deleteRecord(db, id) {
  return transaction(db, () => {
    db.prepare('DELETE FROM suppressed_vitals WHERE record_id = ?').run(id);
    const result = db.prepare('DELETE FROM records WHERE id = ?').run(id);
    return Number(result.changes) > 0;
  });
}

export function replaceRecords(db, records) {
  return transaction(db, () => {
    db.exec('DELETE FROM records');
    const insert = db.prepare(`
      INSERT INTO records (id, category, title, astronaut_id, origin, recorded_at, created_at, updated_at, data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    records.forEach((record) => {
      insert.run(
        record.id,
        record.category,
        record.title,
        record.astronautId,
        record.origin,
        record.recordedAt,
        record.createdAt,
        record.updatedAt,
        JSON.stringify(record.data),
      );
    });
    // El perfil operativo debe reflejar el registro de astronauta más reciente,
    // sin depender del orden en que el cliente envíe el listado completo.
    records
      .filter((record) => record.category === 'astronaut')
      .slice()
      .sort((a, b) => {
        const left = Date.parse(a.recordedAt || a.createdAt || 0);
        const right = Date.parse(b.recordedAt || b.createdAt || 0);
        return left - right;
      })
      .forEach((record) => upsertCrewFromAstronautRecord(db, record));
    return listRecords(db, { limit: 1000 }).data;
  });
}

export function summarizeRecords(db) {
  const byCategoryRows = db.prepare('SELECT category, COUNT(*) AS total FROM records GROUP BY category').all();
  const byOriginRows = db.prepare('SELECT origin, COUNT(*) AS total FROM records GROUP BY origin').all();
  const totalRow = db.prepare('SELECT COUNT(*) AS total FROM records').get();
  const latestRow = db.prepare('SELECT * FROM records ORDER BY recorded_at DESC, created_at DESC LIMIT 1').get();

  const byCategory = {};
  byCategoryRows.forEach((row) => {
    byCategory[row.category] = Number(row.total);
  });
  const byOrigin = {};
  byOriginRows.forEach((row) => {
    byOrigin[row.origin] = Number(row.total);
  });

  return {
    total: Number(totalRow?.total ?? 0),
    byCategory,
    byOrigin,
    latest: mapRecord(latestRow),
  };
}
