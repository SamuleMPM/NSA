import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApiServer } from '../src/server.js';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aerohealth-api-'));
const dbPath = path.join(tempDir, 'test.db');

let server;
let baseUrl;

async function request(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : null,
  };
}

before(async () => {
  server = createApiServer({ dbPath, logRequests: false });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(tempDir, { recursive: true, force: true });
});

test('health responde y la semilla de tripulación existe', async () => {
  const health = await request('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.data.status, 'ok');

  const bootstrap = await request('/api/bootstrap');
  assert.equal(bootstrap.status, 200);
  assert.equal(bootstrap.body.data.crew.length, 3);
  assert.deepEqual(bootstrap.body.data.records, []);
});

test('crea, lista, actualiza y elimina un registro', async () => {
  const created = await request('/api/records', {
    method: 'POST',
    body: {
      id: 'rec_test_vitals',
      category: 'vitals',
      astronautId: 'ast_001',
      origin: 'manual',
      recordedAt: '2026-05-20T14:30:00.000Z',
      data: {
        heart_rate: 88,
        spo2: 97,
        temperature: 36.7,
        respiratory_rate: 15,
        notes: 'Prueba de integración',
      },
    },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.category, 'vitals');
  assert.match(created.body.data.title, /HR 88 bpm/);

  const list = await request('/api/records?category=vitals&astronautId=ast_001');
  assert.equal(list.status, 200);
  assert.equal(list.body.meta.total, 1);
  assert.equal(list.body.data[0].id, 'rec_test_vitals');

  const updated = await request('/api/records/rec_test_vitals', {
    method: 'PATCH',
    body: { data: { heart_rate: 92 }, title: 'Vitales corregidos' },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.data.heart_rate, 92);
  assert.equal(updated.body.data.data.spo2, 97);
  assert.equal(updated.body.data.title, 'Vitales corregidos');

  const duplicate = await request('/api/records', {
    method: 'POST',
    body: { id: 'rec_test_vitals', category: 'vitals', data: { heart_rate: 80 } },
  });
  assert.equal(duplicate.status, 409);

  const exported = await request('/api/records/export?category=vitals');
  assert.equal(exported.status, 200);
  assert.equal(exported.body.records.length, 1);

  const removed = await request('/api/records/rec_test_vitals', { method: 'DELETE' });
  assert.equal(removed.status, 204);

  const missing = await request('/api/records/rec_test_vitals');
  assert.equal(missing.status, 404);
});

test('un registro de astronauta actualiza el perfil de tripulación', async () => {
  const created = await request('/api/records', {
    method: 'POST',
    body: {
      category: 'astronaut',
      astronautId: 'ast_002',
      origin: 'manual',
      data: {
        astronautId: 'ast_002',
        fullName: 'Ellen O. Vega',
        role: 'Comandante de Reserva',
        activity: 'IVA',
        age: 40,
        missionDays: 70,
      },
    },
  });
  assert.equal(created.status, 201);

  const profile = await request('/api/crew/ast_002');
  assert.equal(profile.status, 200);
  assert.equal(profile.body.data.name, 'Ellen O. Vega');
  assert.equal(profile.body.data.missionDays, 70);
});

test('al reemplazar registros, el perfil usa el astronauta más reciente', async () => {
  const base = {
    category: 'astronaut',
    astronautId: 'ast_003',
    origin: 'manual',
    data: { astronautId: 'ast_003', fullName: 'Pedro D.', role: 'Ingeniero de Vuelo', activity: 'REST' },
  };
  const older = {
    ...base,
    id: 'rec_ast_older',
    recordedAt: '2026-05-19T10:00:00.000Z',
    data: { ...base.data, age: 46 },
  };
  const newer = {
    ...base,
    id: 'rec_ast_newer',
    recordedAt: '2026-05-20T10:00:00.000Z',
    data: { ...base.data, age: 48 },
  };

  // El cliente envía el listado de más reciente a más antiguo.
  const replaced = await request('/api/records', {
    method: 'PUT',
    body: { records: [newer, older] },
  });
  assert.equal(replaced.status, 200);

  const profile = await request('/api/crew/ast_003');
  assert.equal(profile.status, 200);
  assert.equal(profile.body.data.age, 48);
});

test('sincroniza alertas, logs, riesgos y vitales suprimidos', async () => {
  const alerts = [
    {
      id: 'alert_test_1',
      dedupeKey: 'vital:ast_001:heart_rate',
      kind: 'vital',
      parameterKey: 'heart_rate',
      severity: 'warning',
      status: 'active',
      astronautId: 'ast_001',
      title: 'FC elevada',
      detectedAt: '2026-05-20T14:30:00.000Z',
    },
  ];
  const replacedAlerts = await request('/api/alerts', { method: 'PUT', body: { alerts } });
  assert.equal(replacedAlerts.status, 200);
  assert.equal(replacedAlerts.body.data.length, 1);
  assert.equal(replacedAlerts.body.data[0].title, 'FC elevada');

  const ack = await request('/api/alerts/alert_test_1', {
    method: 'PATCH',
    body: { status: 'acknowledged', acknowledgedAt: '2026-05-20T14:35:00.000Z' },
  });
  assert.equal(ack.status, 200);
  assert.equal(ack.body.data.status, 'acknowledged');

  const filtered = await request('/api/alerts?status=acknowledged');
  assert.equal(filtered.body.data.length, 1);

  const logs = await request('/api/logs', {
    method: 'PUT',
    body: {
      logs: [
        { time: '16:20:00', level: 'INFO', message: 'Sistema iniciado' },
        { time: '16:21:00', level: 'SUCCESS', message: 'Enlace establecido' },
      ],
    },
  });
  assert.equal(logs.status, 200);
  assert.equal(logs.body.data.length, 2);

  const risks = await request('/api/risk-history', {
    method: 'PUT',
    body: {
      riskHistory: [
        {
          id: 'risk_test_1',
          timestamp: '2026-05-20T14:30:00.000Z',
          score: 42,
          level: 'moderate',
          levelInfo: { label: 'Moderado' },
          worstCode: 'R',
          worstName: 'Radiación',
          origin: 'simulated',
          scores: { radiation: 42, isolation: 10 },
        },
      ],
    },
  });
  assert.equal(risks.status, 200);
  assert.equal(risks.body.data[0].score, 42);

  const suppressed = await request('/api/suppressed-vitals', {
    method: 'PUT',
    body: { suppressedVitals: ['rec_a', 'rec_b'] },
  });
  assert.equal(suppressed.status, 200);
  assert.deepEqual(suppressed.body.data, ['rec_a', 'rec_b']);
});

test('importa y exporta un snapshot completo', async () => {
  const payload = {
    records: [
      {
        id: 'rec_state_1',
        category: 'environment',
        origin: 'manual',
        recordedAt: '2026-05-20T15:00:00.000Z',
        data: { o2Pct: 21, co2MmHg: 3.2, pressureKpa: 101.3, cabinTempC: 22 },
      },
    ],
    alerts: [],
    logs: [{ time: '15:00:00', level: 'INFO', message: 'Snapshot importado' }],
    riskHistory: [],
    suppressedVitals: [],
  };

  const imported = await request('/api/state', { method: 'PUT', body: payload });
  assert.equal(imported.status, 200);
  assert.equal(imported.body.data.records.length, 1);
  assert.equal(imported.body.data.records[0].id, 'rec_state_1');
  assert.equal(imported.body.data.logs[0].message, 'Snapshot importado');

  const stats = await request('/api/stats');
  assert.equal(stats.status, 200);
  assert.equal(stats.body.data.records.total, 1);
});

test('valida categorías y cuerpos inválidos', async () => {
  const invalidCategory = await request('/api/records', {
    method: 'POST',
    body: { category: 'desconocida', data: {} },
  });
  assert.equal(invalidCategory.status, 400);
  assert.equal(invalidCategory.body.error.code, 'bad_request');

  const invalidJsonResponse = await fetch(`${baseUrl}/api/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{no-json',
  });
  assert.equal(invalidJsonResponse.status, 400);
});
