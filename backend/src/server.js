import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_VERSION, BODY_LIMIT_BYTES, CORS_ORIGIN, DB_PATH, FRONTEND_DIST, HOST, PORT } from './config.js';
import { openDatabase } from './db.js';
import { ApiError, asNumber, asString, badRequest, isPlainObject, normalizeAlertInput, normalizeCrewInput, normalizeLogInput, normalizeRecordInput, normalizeRiskInput, notFound } from './validation.js';
import {
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  replaceRecords,
  summarizeRecords,
  updateRecord,
} from './repositories/records.js';
import {
  clearAlerts,
  deleteAlert,
  listAlerts,
  replaceAlerts,
  upsertAlert,
} from './repositories/alerts.js';
import { appendLog, clearLogs, listLogs, replaceLogs } from './repositories/logs.js';
import { appendRiskEntry, clearRiskHistory, listRiskHistory, replaceRiskHistory } from './repositories/risk-history.js';
import { listSuppressedVitals, replaceSuppressedVitals } from './repositories/suppressed-vitals.js';
import { getCrewMember, listCrew, replaceCrew, upsertCrew } from './repositories/crew.js';
import { applyCors, readJsonBody, requireArray, sendError, sendJson, sendNoContent } from './http.js';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

function jsonData(data, meta) {
  return meta === undefined ? { data } : { data, meta };
}

function getSnapshot(db) {
  return {
    records: listRecords(db, { limit: 1000 }).data,
    alerts: listAlerts(db),
    logs: listLogs(db, { limit: 120 }),
    riskHistory: listRiskHistory(db, { limit: 60 }),
    suppressedVitals: listSuppressedVitals(db),
    crew: listCrew(db),
  };
}

function normalizeStateBody(body) {
  if (!isPlainObject(body)) throw badRequest('El estado debe ser un objeto JSON.');
  const now = new Date().toISOString();
  const records = body.records === undefined ? [] : requireArray(body.records, 'records', 2000)
    .map((record) => normalizeRecordInput(record));
  const alerts = body.alerts === undefined ? [] : requireArray(body.alerts, 'alerts', 500)
    .map((alert) => normalizeAlertInput(alert, now));
  const logs = body.logs === undefined ? [] : requireArray(body.logs, 'logs', 500)
    .map((log) => normalizeLogInput(log, now));
  const riskHistory = body.riskHistory === undefined ? [] : requireArray(body.riskHistory, 'riskHistory', 200)
    .map((entry) => normalizeRiskInput(entry, now));
  const suppressedVitals = body.suppressedVitals === undefined ? [] : requireArray(body.suppressedVitals, 'suppressedVitals', 500)
    .map((id) => asString(id, 120))
    .filter(Boolean);
  const crew = body.crew === undefined ? null : requireArray(body.crew, 'crew', 100)
    .map((profile, index) => ({ ...normalizeCrewInput(profile), id: asString(profile.id, 80) || `ast_${index + 1}` }));

  return { records, alerts, logs, riskHistory, suppressedVitals, crew };
}

async function handleApi(req, res, db, url) {
  const pathname = decodeURIComponent(url.pathname);
  const query = url.searchParams;
  const method = req.method || 'GET';

  // Salud y metadatos -------------------------------------------------------
  if (pathname === '/api/health' && method === 'GET') {
    db.prepare('SELECT 1 AS ok').get();
    sendJson(res, 200, {
      data: {
        status: 'ok',
        service: 'aerohealth-api',
        version: APP_VERSION,
        database: 'sqlite',
        time: new Date().toISOString(),
      },
    });
    return;
  }

  // Snapshot completo -------------------------------------------------------
  if ((pathname === '/api/bootstrap' || pathname === '/api/state') && method === 'GET') {
    sendJson(res, 200, jsonData(getSnapshot(db), { generatedAt: new Date().toISOString() }));
    return;
  }

  if (pathname === '/api/state' && method === 'PUT') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const state = normalizeStateBody(body);
    replaceRecords(db, state.records);
    replaceAlerts(db, state.alerts);
    replaceLogs(db, state.logs);
    replaceRiskHistory(db, state.riskHistory);
    replaceSuppressedVitals(db, state.suppressedVitals);
    if (state.crew) replaceCrew(db, state.crew);
    sendJson(res, 200, jsonData(getSnapshot(db)));
    return;
  }

  if (pathname === '/api/stats' && method === 'GET') {
    const alerts = listAlerts(db);
    sendJson(res, 200, jsonData({
      records: summarizeRecords(db),
      alerts: {
        total: alerts.length,
        active: alerts.filter((alert) => alert.status === 'active').length,
        acknowledged: alerts.filter((alert) => alert.status === 'acknowledged').length,
        resolved: alerts.filter((alert) => alert.status === 'resolved').length,
      },
      crew: listCrew(db).length,
      riskHistory: listRiskHistory(db, { limit: 1 })[0] || null,
    }));
    return;
  }

  // Registros ---------------------------------------------------------------
  if (pathname === '/api/records/export' && method === 'GET') {
    const category = asString(query.get('category'), 40);
    const records = listRecords(db, { category, limit: 1000 }).data;
    sendJson(res, 200, {
      exported_at: new Date().toISOString(),
      category: category || 'all',
      records,
    });
    return;
  }

  if (pathname === '/api/records' && method === 'GET') {
    const result = listRecords(db, {
      category: asString(query.get('category'), 40),
      astronautId: asString(query.get('astronautId'), 80),
      origin: asString(query.get('origin'), 20),
      from: asString(query.get('from'), 40),
      to: asString(query.get('to'), 40),
      limit: asNumber(query.get('limit'), 500),
      offset: asNumber(query.get('offset'), 0),
    });
    sendJson(res, 200, jsonData(result.data, result.meta));
    return;
  }

  if (pathname === '/api/records' && method === 'POST') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const input = normalizeRecordInput(body);
    if (getRecord(db, input.id)) {
      throw new ApiError(409, 'conflict', `Ya existe un registro con id ${input.id}.`);
    }
    const record = createRecord(db, input);
    sendJson(res, 201, jsonData(record));
    return;
  }

  if (pathname === '/api/records' && method === 'PUT') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const list = Array.isArray(body) ? body : body.records;
    const records = requireArray(list, 'records', 2000).map((record) => normalizeRecordInput(record));
    sendJson(res, 200, jsonData(replaceRecords(db, records)));
    return;
  }

  const recordMatch = pathname.match(/^\/api\/records\/([^/]+)$/);
  if (recordMatch) {
    const id = recordMatch[1];
    if (method === 'GET') {
      const record = getRecord(db, id);
      if (!record) throw notFound('Registro no encontrado.');
      sendJson(res, 200, jsonData(record));
      return;
    }
    if (method === 'PUT' || method === 'PATCH') {
      const existing = getRecord(db, id);
      if (!existing) throw notFound('Registro no encontrado.');
      const body = await readJsonBody(req, BODY_LIMIT_BYTES);
      const input = normalizeRecordInput({ ...body, id }, { existing, partial: true });
      const record = updateRecord(db, input);
      if (!record) throw notFound('Registro no encontrado.');
      sendJson(res, 200, jsonData(record));
      return;
    }
    if (method === 'DELETE') {
      if (!deleteRecord(db, id)) throw notFound('Registro no encontrado.');
      sendNoContent(res);
      return;
    }
  }

  // Alertas ----------------------------------------------------------------
  if (pathname === '/api/alerts' && method === 'GET') {
    sendJson(res, 200, jsonData(listAlerts(db, {
      status: asString(query.get('status'), 20),
      severity: asString(query.get('severity'), 20),
      kind: asString(query.get('kind'), 20),
      astronautId: asString(query.get('astronautId'), 80),
    })));
    return;
  }

  if (pathname === '/api/alerts' && method === 'POST') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const alert = upsertAlert(db, normalizeAlertInput(body));
    sendJson(res, 201, jsonData(alert));
    return;
  }

  if (pathname === '/api/alerts' && method === 'PUT') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const list = Array.isArray(body) ? body : body.alerts;
    const alerts = requireArray(list, 'alerts', 500).map((alert) => normalizeAlertInput(alert));
    sendJson(res, 200, jsonData(replaceAlerts(db, alerts)));
    return;
  }

  if (pathname === '/api/alerts' && method === 'DELETE') {
    clearAlerts(db);
    sendNoContent(res);
    return;
  }

  const alertMatch = pathname.match(/^\/api\/alerts\/([^/]+)$/);
  if (alertMatch) {
    const id = alertMatch[1];
    if (method === 'PUT' || method === 'PATCH') {
      const body = await readJsonBody(req, BODY_LIMIT_BYTES);
      const current = listAlerts(db).find((alert) => alert.id === id) || {};
      const alert = upsertAlert(db, normalizeAlertInput({ ...current, ...body, id }));
      sendJson(res, 200, jsonData(alert));
      return;
    }
    if (method === 'DELETE') {
      if (!deleteAlert(db, id)) throw notFound('Alerta no encontrada.');
      sendNoContent(res);
      return;
    }
  }

  // Logs -------------------------------------------------------------------
  if (pathname === '/api/logs' && method === 'GET') {
    sendJson(res, 200, jsonData(listLogs(db, { limit: asNumber(query.get('limit'), 200) })));
    return;
  }

  if (pathname === '/api/logs' && method === 'POST') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const log = appendLog(db, normalizeLogInput(body));
    sendJson(res, 201, jsonData(log));
    return;
  }

  if (pathname === '/api/logs' && method === 'PUT') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const list = Array.isArray(body) ? body : body.logs;
    const logs = requireArray(list, 'logs', 500).map((log) => normalizeLogInput(log));
    sendJson(res, 200, jsonData(replaceLogs(db, logs)));
    return;
  }

  if (pathname === '/api/logs' && method === 'DELETE') {
    clearLogs(db);
    sendNoContent(res);
    return;
  }

  // Historial de riesgos ----------------------------------------------------
  if (pathname === '/api/risk-history' && method === 'GET') {
    sendJson(res, 200, jsonData(listRiskHistory(db, { limit: asNumber(query.get('limit'), 60) })));
    return;
  }

  if (pathname === '/api/risk-history' && method === 'POST') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const entry = appendRiskEntry(db, normalizeRiskInput(body));
    sendJson(res, 201, jsonData(entry));
    return;
  }

  if (pathname === '/api/risk-history' && method === 'PUT') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const list = Array.isArray(body) ? body : body.riskHistory;
    const entries = requireArray(list, 'riskHistory', 200).map((entry) => normalizeRiskInput(entry));
    sendJson(res, 200, jsonData(replaceRiskHistory(db, entries)));
    return;
  }

  if (pathname === '/api/risk-history' && method === 'DELETE') {
    clearRiskHistory(db);
    sendNoContent(res);
    return;
  }

  // Vitales suprimidos ------------------------------------------------------
  if (pathname === '/api/suppressed-vitals' && method === 'GET') {
    sendJson(res, 200, jsonData(listSuppressedVitals(db)));
    return;
  }

  if (pathname === '/api/suppressed-vitals' && method === 'PUT') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const list = Array.isArray(body) ? body : body.suppressedVitals;
    const ids = requireArray(list, 'suppressedVitals', 500)
      .map((id) => asString(id, 120))
      .filter(Boolean);
    sendJson(res, 200, jsonData(replaceSuppressedVitals(db, ids)));
    return;
  }

  // Tripulación -------------------------------------------------------------
  if (pathname === '/api/crew' && method === 'GET') {
    sendJson(res, 200, jsonData(listCrew(db)));
    return;
  }

  if (pathname === '/api/crew' && method === 'POST') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    if (!body.id) {
      const existing = listCrew(db);
      body.id = `ast_${String(existing.length + 1).padStart(3, '0')}`;
    }
    const profile = normalizeCrewInput(body);
    const saved = upsertCrew(db, profile);
    sendJson(res, 201, jsonData(saved));
    return;
  }

  if (pathname === '/api/crew' && method === 'PUT') {
    const body = await readJsonBody(req, BODY_LIMIT_BYTES);
    const list = Array.isArray(body) ? body : body.crew;
    const profiles = requireArray(list, 'crew', 100).map((profile, index) => ({
      ...normalizeCrewInput(profile),
      id: asString(profile.id, 80) || `ast_${index + 1}`,
    }));
    sendJson(res, 200, jsonData(replaceCrew(db, profiles)));
    return;
  }

  const crewMatch = pathname.match(/^\/api\/crew\/([^/]+)$/);
  if (crewMatch) {
    const id = crewMatch[1];
    if (method === 'GET') {
      const profile = getCrewMember(db, id);
      if (!profile) throw notFound('Tripulante no encontrado.');
      sendJson(res, 200, jsonData(profile));
      return;
    }
    if (method === 'PUT' || method === 'PATCH') {
      const existing = getCrewMember(db, id);
      if (!existing) throw notFound('Tripulante no encontrado.');
      const body = await readJsonBody(req, BODY_LIMIT_BYTES);
      const profile = normalizeCrewInput({ ...body, id }, existing);
      sendJson(res, 200, jsonData(upsertCrew(db, profile)));
      return;
    }
  }

  throw notFound(`Ruta no encontrada: ${method} ${pathname}`);
}

function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: { code: 'method_not_allowed', message: 'Método no permitido.' } });
    return;
  }

  const distRoot = path.resolve(FRONTEND_DIST);
  let relativePath = decodeURIComponent(url.pathname);
  if (relativePath === '/') relativePath = '/index.html';

  const candidate = path.resolve(distRoot, `.${relativePath}`);
  const withinDist = candidate === distRoot || candidate.startsWith(`${distRoot}${path.sep}`);

  let filePath = withinDist && fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null;
  if (!filePath) {
    const fallback = path.join(distRoot, 'index.html');
    if (fs.existsSync(fallback)) filePath = fallback;
  }

  if (!filePath) {
    sendJson(res, 200, {
      data: {
        service: 'aerohealth-api',
        message: 'API en ejecución. El frontend no está compilado; usa "npm run dev" en frontend/ o "npm run build" y vuelve a cargar.',
        api: '/api/health',
        frontendDist: distRoot,
      },
    });
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[extension] || 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', extension === '.html' ? 'no-store' : 'public, max-age=3600');
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}

export function createApiServer({ dbPath = DB_PATH, corsOrigin = CORS_ORIGIN, logRequests = process.env.LOG_REQUESTS === '1' } = {}) {
  const db = openDatabase(dbPath);

  const server = http.createServer(async (req, res) => {
    const startedAt = Date.now();
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (applyCors(req, res, corsOrigin)) return;

    try {
      if (url.pathname.startsWith('/api/')) {
        await handleApi(req, res, db, url);
      } else {
        serveStatic(req, res, url);
      }
    } catch (error) {
      sendError(res, error);
    } finally {
      if (logRequests) {
        console.log(`[api] ${req.method} ${url.pathname}${url.search} → ${res.statusCode} (${Date.now() - startedAt} ms)`);
      }
    }
  });

  server.db = db;
  server.on('close', () => {
    try {
      db.close();
    } catch {
      // Cierre idempotente.
    }
  });

  return server;
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  const server = createApiServer();
  server.listen(PORT, HOST, () => {
    console.log('');
    console.log('  AeroHealth API · NASA Space Apps Challenge');
    console.log(`  → http://${HOST}:${PORT}/api/health`);
    console.log(`  → SQLite: ${DB_PATH}`);
    console.log(`  → Estático: ${FRONTEND_DIST}`);
    console.log('');
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
