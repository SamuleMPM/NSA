import { transaction } from '../db.js';

export function mapLog(row) {
  if (!row) return null;
  return {
    id: row.id,
    time: row.time,
    level: row.level,
    message: row.message,
    timestamp: row.timestamp,
  };
}

export function listLogs(db, filters = {}) {
  const limit = Math.min(1000, Math.max(1, Number(filters.limit) || 200));
  const rows = db.prepare('SELECT * FROM logs ORDER BY id DESC LIMIT ?').all(limit);
  return rows.map(mapLog).reverse();
}

function insertLog(db, log) {
  db.prepare(`
    INSERT INTO logs (time, level, message, timestamp, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(log.time, log.level, log.message, log.timestamp ?? null, new Date().toISOString());
}

export function appendLog(db, log) {
  const result = db.prepare(`
    INSERT INTO logs (time, level, message, timestamp, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(log.time, log.level, log.message, log.timestamp ?? null, new Date().toISOString());
  return mapLog(db.prepare('SELECT * FROM logs WHERE id = ?').get(result.lastInsertRowid));
}

export function replaceLogs(db, logs) {
  return transaction(db, () => {
    db.exec('DELETE FROM logs');
    logs.slice(-500).forEach((log) => insertLog(db, log));
    return listLogs(db);
  });
}

export function clearLogs(db) {
  db.exec('DELETE FROM logs');
}
