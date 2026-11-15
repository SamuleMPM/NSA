import { transaction } from '../db.js';

export function mapCrew(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    activity: row.activity,
    age: row.age,
    sex: row.sex,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    bloodType: row.blood_type,
    missionDays: row.mission_days,
  };
}

export function listCrew(db) {
  return db.prepare('SELECT * FROM crew ORDER BY id ASC').all().map(mapCrew);
}

export function getCrewMember(db, id) {
  return mapCrew(db.prepare('SELECT * FROM crew WHERE id = ?').get(id));
}

export function upsertCrew(db, profile) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO crew (id, name, role, activity, age, sex, height_cm, weight_kg, blood_type, mission_days, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      role = excluded.role,
      activity = excluded.activity,
      age = excluded.age,
      sex = excluded.sex,
      height_cm = excluded.height_cm,
      weight_kg = excluded.weight_kg,
      blood_type = excluded.blood_type,
      mission_days = excluded.mission_days,
      updated_at = excluded.updated_at
  `).run(
    profile.id,
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
  return getCrewMember(db, profile.id);
}

/**
 * Un registro de la categoría "astronaut" actualiza el perfil operativo. Así
 * la API mantiene una vista de tripulación coherente con Inserción de datos.
 */
export function upsertCrewFromAstronautRecord(db, record) {
  const data = record.data || {};
  const id = record.astronautId || data.astronautId;
  if (!id) return null;
  const existing = getCrewMember(db, id);
  return upsertCrew(db, {
    id,
    name: data.fullName || existing?.name || id,
    role: data.role || existing?.role || 'Tripulante',
    activity: data.activity || existing?.activity || 'IVA',
    age: data.age ?? existing?.age ?? null,
    sex: data.sex ?? existing?.sex ?? null,
    heightCm: data.heightCm ?? existing?.heightCm ?? null,
    weightKg: data.weightKg ?? existing?.weightKg ?? null,
    bloodType: data.bloodType ?? existing?.bloodType ?? null,
    missionDays: data.missionDays ?? existing?.missionDays ?? 0,
  });
}

export function replaceCrew(db, profiles) {
  return transaction(db, () => {
    db.exec('DELETE FROM crew');
    profiles.forEach((profile) => upsertCrew(db, profile));
    return listCrew(db);
  });
}
