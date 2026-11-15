-- Esquema de persistencia de AeroHealth.
-- Las entidades clínicas mantienen un payload JSON íntegro para no perder
-- campos nuevos del frontend, y exponen columnas indexables para consultas.

CREATE TABLE IF NOT EXISTS crew (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'Tripulante',
  activity      TEXT NOT NULL DEFAULT 'IVA',
  age           INTEGER,
  sex           TEXT,
  height_cm     REAL,
  weight_kg     REAL,
  blood_type    TEXT,
  mission_days  INTEGER NOT NULL DEFAULT 0,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS records (
  id            TEXT PRIMARY KEY,
  category      TEXT NOT NULL,
  title         TEXT NOT NULL DEFAULT '',
  astronaut_id  TEXT,
  origin        TEXT NOT NULL DEFAULT 'manual',
  recorded_at   TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  data          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_category ON records (category);
CREATE INDEX IF NOT EXISTS idx_records_astronaut ON records (astronaut_id);
CREATE INDEX IF NOT EXISTS idx_records_recorded_at ON records (recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_origin ON records (origin);

CREATE TABLE IF NOT EXISTS alerts (
  id                TEXT PRIMARY KEY,
  dedupe_key        TEXT,
  kind              TEXT,
  parameter_key     TEXT,
  severity          TEXT,
  status            TEXT,
  astronaut_id      TEXT,
  origin            TEXT,
  detected_at       TEXT,
  first_detected_at TEXT,
  last_seen_at      TEXT,
  acknowledged_at   TEXT,
  resolved_at       TEXT,
  payload           TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts (severity);
CREATE INDEX IF NOT EXISTS idx_alerts_astronaut ON alerts (astronaut_id);

CREATE TABLE IF NOT EXISTS logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  time        TEXT NOT NULL,
  level       TEXT NOT NULL,
  message     TEXT NOT NULL,
  timestamp   TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs (created_at DESC);

CREATE TABLE IF NOT EXISTS risk_history (
  id          TEXT PRIMARY KEY,
  timestamp   TEXT NOT NULL,
  score       REAL NOT NULL,
  level       TEXT,
  level_info  TEXT,
  worst_code  TEXT,
  worst_name  TEXT,
  origin      TEXT,
  scores      TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_history_timestamp ON risk_history (timestamp DESC);

CREATE TABLE IF NOT EXISTS suppressed_vitals (
  record_id     TEXT PRIMARY KEY,
  suppressed_at TEXT NOT NULL
);
