import { transaction } from '../db.js';

export function listSuppressedVitals(db) {
  return db
    .prepare('SELECT record_id FROM suppressed_vitals ORDER BY suppressed_at ASC')
    .all()
    .map((row) => row.record_id);
}

export function replaceSuppressedVitals(db, ids) {
  return transaction(db, () => {
    db.exec('DELETE FROM suppressed_vitals');
    const insert = db.prepare('INSERT OR IGNORE INTO suppressed_vitals (record_id, suppressed_at) VALUES (?, ?)');
    const now = new Date().toISOString();
    ids.slice(-500).forEach((id) => insert.run(id, now));
    return listSuppressedVitals(db);
  });
}
