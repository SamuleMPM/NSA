import fs from 'node:fs';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { DB_PATH } from './config.js';
import { CREW_SEED } from './seed.js';

const SCHEMA_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');
const SCHEMA = readFileSync(SCHEMA_PATH, 'utf8');
const CURRENT_SCHEMA_VERSION = 1;

export function transaction(db, callback) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = callback();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // La transacción pudo haberse cerrado sola; se propaga el error original.
    }
    throw error;
  }
}

function migrate(db) {
  db.exec(SCHEMA);
  const row = db.prepare('PRAGMA user_version').get();
  const version = Number(row?.user_version ?? 0);
  if (version < CURRENT_SCHEMA_VERSION) {
    db.exec(`PRAGMA user_version = ${CURRENT_SCHEMA_VERSION}`);
  }
}

function seedCrew(db) {
  const insert = db.prepare(`
    INSERT INTO crew (id, name, role, activity, age, sex, height_cm, weight_kg, blood_type, mission_days, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING
  `);
  const now = new Date().toISOString();
  for (const [id, profile] of Object.entries(CREW_SEED)) {
    insert.run(
      id,
      profile.name,
      profile.role,
      profile.activity,
      profile.age ?? null,
      profile.sex ?? null,
      profile.heightCm ?? null,
      profile.weightKg ?? null,
      profile.bloodType ?? null,
      profile.missionDays ?? 0,
      now,
    );
  }
}

export function openDatabase(dbPath = DB_PATH) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  migrate(db);
  seedCrew(db);
  return db;
}

export function closeDatabase(db) {
  try {
    db.close();
  } catch {
    // Cierre idempotente.
  }
}
