import { transaction } from '../db.js';

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function mapRiskEntry(row) {
  if (!row) return null;
  return {
    id: row.id,
    timestamp: row.timestamp,
    score: row.score,
    level: row.level,
    levelInfo: parseJson(row.level_info, null),
    worstCode: row.worst_code,
    worstName: row.worst_name,
    origin: row.origin,
    scores: parseJson(row.scores, {}),
  };
}

export function listRiskHistory(db, filters = {}) {
  const limit = Math.min(500, Math.max(1, Number(filters.limit) || 60));
  return db
    .prepare('SELECT * FROM risk_history ORDER BY timestamp DESC, created_at DESC LIMIT ?')
    .all(limit)
    .map(mapRiskEntry);
}

function insertRiskEntry(db, entry) {
  db.prepare(`
    INSERT INTO risk_history (id, timestamp, score, level, level_info, worst_code, worst_name, origin, scores, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      timestamp = excluded.timestamp,
      score = excluded.score,
      level = excluded.level,
      level_info = excluded.level_info,
      worst_code = excluded.worst_code,
      worst_name = excluded.worst_name,
      origin = excluded.origin,
      scores = excluded.scores,
      created_at = excluded.created_at
  `).run(
    entry.id,
    entry.timestamp,
    entry.score,
    entry.level ?? null,
    entry.levelInfo ? JSON.stringify(entry.levelInfo) : null,
    entry.worstCode ?? null,
    entry.worstName ?? null,
    entry.origin ?? null,
    JSON.stringify(entry.scores ?? {}),
    new Date().toISOString(),
  );
}

export function appendRiskEntry(db, entry) {
  insertRiskEntry(db, entry);
  return mapRiskEntry(db.prepare('SELECT * FROM risk_history WHERE id = ?').get(entry.id));
}

export function replaceRiskHistory(db, entries) {
  return transaction(db, () => {
    db.exec('DELETE FROM risk_history');
    entries.slice(0, 200).forEach((entry) => insertRiskEntry(db, entry));
    return listRiskHistory(db);
  });
}

export function clearRiskHistory(db) {
  db.exec('DELETE FROM risk_history');
}
