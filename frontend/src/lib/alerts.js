/**
 * Motor de alertas clínicas y de riesgo.
 *
 * - Recibe las últimas muestras de las cuatro constantes monitorizadas.
 * - Evalúa los cinco riesgos RIDGE y el último ECG registrado.
 * - Mantiene un ciclo de vida: activa → atendida → resuelta.
 * - Evita duplicados mediante dedupeKey y auto-resuelve cuando la condición
 *   deja de estar presente.
 */

import { ALERTABLE_VITALS, SEVERITY_LEVELS, evaluateVital, severityAtLeast } from './clinical';
import { ECG_ABNORMAL_RHYTHMS } from './records';
import { formatDateTime } from './format';
import { createId } from './storage';

export const ALERT_STATUS = {
  active: { id: 'active', label: 'Activa' },
  acknowledged: { id: 'acknowledged', label: 'Atendida' },
  resolved: { id: 'resolved', label: 'Resuelta' },
};

function candidateBase({ dedupeKey, kind, parameterKey, parameter, value, unit, referenceRange, severity, title, explanation, recommendations, origin, detectedAt, astronautId, astronautName, meta }) {
  return {
    dedupeKey,
    kind,
    parameterKey,
    parameter,
    value,
    unit,
    referenceRange,
    severity,
    title,
    explanation,
    recommendations: recommendations || [],
    origin: origin || 'simulated',
    detectedAt: detectedAt || new Date().toISOString(),
    astronautId: astronautId || null,
    astronautName: astronautName || null,
    meta: meta || {},
  };
}

export function buildVitalCandidates(latestVitalsByAstronaut = {}, crew = {}) {
  const candidates = [];
  Object.entries(latestVitalsByAstronaut).forEach(([astronautId, sample]) => {
    if (!sample) return;
    const astronautName = crew[astronautId]?.name || astronautId;
    ALERTABLE_VITALS.forEach((vitalKey) => {
      const evaluation = evaluateVital(vitalKey, sample[vitalKey]);
      if (!evaluation.severity || evaluation.severity === 'normal') return;
      candidates.push(
        candidateBase({
          dedupeKey: `vital:${astronautId}:${vitalKey}`,
          kind: 'vital',
          parameterKey: vitalKey,
          parameter: evaluation.label,
          value: evaluation.value,
          unit: evaluation.unit,
          referenceRange: evaluation.referenceRange,
          severity: evaluation.severity,
          title: `${evaluation.label} ${evaluation.direction === 'low' ? 'por debajo' : 'por encima'} del rango · ${astronautName}`,
          explanation: evaluation.explanation,
          recommendations: evaluation.recommendations,
          origin: sample.origin || 'simulated',
          detectedAt: sample.recordedAt || new Date().toISOString(),
          astronautId,
          astronautName,
          meta: {
            direction: evaluation.direction,
            rangeDetail: evaluation.rangeDetail,
            basis: evaluation.basis,
            source: evaluation.source,
            protocolId: evaluation.protocolId,
            scenario: sample.scenario || null,
            environmentId: sample.environmentId || null,
            recordedAtLabel: formatDateTime(sample.recordedAt),
          },
        }),
      );
    });
  });
  return candidates;
}

export function buildRiskCandidates(assessment) {
  if (!assessment?.risks) return [];
  return Object.values(assessment.risks)
    .filter((risk) => risk.alertEligible)
    .map((risk) => {
      const severity = risk.score >= 90 ? 'emergency' : risk.level === 'critical' ? 'critical' : 'warning';
      return candidateBase({
        dedupeKey: `risk:${risk.id}`,
        kind: 'risk',
        parameterKey: risk.id,
        parameter: risk.name,
        value: risk.score,
        unit: '/100',
        referenceRange: '0–24 bajo · 25–49 moderado · 50–74 alto · 75–100 crítico',
        severity,
        title: `Riesgo ${risk.code} · ${risk.levelInfo.label} · ${risk.shortName}`,
        explanation: risk.explanation,
        recommendations: risk.countermeasures.map((measure) => ({
          title: measure.title,
          detail: measure.detail,
          basis: risk.modelNote,
        })),
        origin: risk.origin,
        detectedAt: assessment.generatedAt,
        astronautId: null,
        astronautName: null,
        meta: {
          riskId: risk.id,
          riskCode: risk.code,
          score: risk.score,
          level: risk.level,
          indicators: risk.indicators.slice(0, 4),
          dataSource: risk.dataSource,
          modelNote: risk.modelNote,
        },
      });
    });
}

export function buildEcgCandidates(records = [], crew = {}) {
  const latestByAstronaut = {};
  records
    .filter((record) => record.category === 'ecg' && record.astronautId)
    .sort((a, b) => new Date(b.recordedAt || b.createdAt) - new Date(a.recordedAt || a.createdAt))
    .forEach((record) => {
      if (!latestByAstronaut[record.astronautId]) latestByAstronaut[record.astronautId] = record;
    });

  return Object.entries(latestByAstronaut)
    .map(([astronautId, record]) => {
      const rhythm = record.data?.rhythm;
      if (!rhythm || rhythm === 'sinus') return null;
      const abnormal = ECG_ABNORMAL_RHYTHMS[rhythm];
      if (!abnormal) return null;
      const astronautName = crew[astronautId]?.name || astronautId;
      return candidateBase({
        dedupeKey: `ecg:${astronautId}:${rhythm}`,
        kind: 'ecg',
        parameterKey: 'ecg_rhythm',
        parameter: 'Ritmo ECG',
        value: abnormal.label,
        unit: '',
        referenceRange: 'Ritmo sinusal 60–100 bpm',
        severity: abnormal.severity,
        title: `ECG · ${abnormal.label} · ${astronautName}`,
        explanation:
          record.data?.interpretation ||
          `El último ECG registrado muestra ${abnormal.label.toLowerCase()}. Correlacionar con síntomas, frecuencia cardíaca y calidad de señal.`,
        recommendations: [
          {
            title: 'Confirmar la calidad de la señal y repetir el ECG.',
            detail: 'Descartar artefacto o mala colocación de electrodos antes de actuar.',
          },
          {
            title: 'Correlacionar con frecuencia cardíaca, presión arterial y síntomas.',
            detail: 'La interpretación aislada de un trazado no sustituye la valoración clínica.',
          },
          {
            title: 'Si hay inestabilidad, dolor torácico o síncope, activar protocolo de emergencia.',
            detail: 'Requiere evaluación médica y soporte avanzado según recursos disponibles a bordo.',
          },
        ],
        origin: record.origin || 'manual',
        detectedAt: record.recordedAt || record.createdAt,
        astronautId,
        astronautName,
        meta: {
          recordId: record.id,
          rhythm,
          heartRate: record.data?.heart_rate,
          prMs: record.data?.pr_ms,
          qrsMs: record.data?.qrs_ms,
          qtcMs: record.data?.qtc_ms,
          stSegment: record.data?.st_segment,
          source: 'Inserción de datos · ECG',
        },
      });
    })
    .filter(Boolean);
}

const AUTO_RESOLVE_KINDS = new Set(['vital', 'risk', 'ecg']);

export function reconcileAlerts(previous = [], candidates = [], now = new Date().toISOString()) {
  const next = new Map();
  const candidateMap = new Map(candidates.map((candidate) => [candidate.dedupeKey, candidate]));

  previous.forEach((alert) => {
    if (alert?.dedupeKey) next.set(alert.dedupeKey, alert);
  });

  candidateMap.forEach((candidate, key) => {
    const current = next.get(key);
    if (!current) {
      next.set(key, {
        ...candidate,
        id: createId('alert'),
        status: 'active',
        firstDetectedAt: candidate.detectedAt,
        lastSeenAt: now,
        acknowledgedAt: null,
        resolvedAt: null,
        recurrenceCount: 0,
      });
      return;
    }

    if (current.status === 'resolved') {
      const escalated =
        severityAtLeast(candidate.severity, 'critical') &&
        (SEVERITY_LEVELS[candidate.severity]?.order ?? 0) > (SEVERITY_LEVELS[current.severity]?.order ?? 0);

      // Una resolución manual se mantiene mientras la condición siga presente.
      // Solo se reabre si la severidad escala o si la condición desaparece y vuelve.
      if (current.manuallyResolved && !escalated) {
        next.set(key, current);
        return;
      }

      next.set(key, {
        ...current,
        ...candidate,
        id: current.id,
        status: 'active',
        firstDetectedAt: now,
        detectedAt: now,
        lastSeenAt: now,
        acknowledgedAt: null,
        resolvedAt: null,
        manuallyResolved: false,
        recurrenceCount: (current.recurrenceCount || 0) + 1,
      });
      return;
    }

    next.set(key, {
      ...current,
      ...candidate,
      id: current.id,
      status: current.status,
      firstDetectedAt: current.firstDetectedAt || current.detectedAt,
      lastSeenAt: now,
      acknowledgedAt: current.acknowledgedAt || null,
      resolvedAt: null,
    });
  });

  next.forEach((alert, key) => {
    if (!candidateMap.has(key) && AUTO_RESOLVE_KINDS.has(alert.kind) && alert.status !== 'resolved') {
      next.set(key, {
        ...alert,
        status: 'resolved',
        manuallyResolved: false,
        resolvedAt: now,
        lastSeenAt: now,
      });
    } else if (!candidateMap.has(key) && alert.status === 'resolved' && alert.manuallyResolved) {
      // La condición ya no está presente: una futura reaparición debe reabrir la alerta.
      next.set(key, { ...alert, manuallyResolved: false });
    }
  });

  return [...next.values()]
    .sort((a, b) => {
      const statusOrder = { active: 0, acknowledged: 1, resolved: 2 };
      const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
      if (statusDiff !== 0) return statusDiff;
      const severityDiff = (SEVERITY_LEVELS[b.severity]?.order ?? 0) - (SEVERITY_LEVELS[a.severity]?.order ?? 0);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.lastSeenAt || b.detectedAt) - new Date(a.lastSeenAt || a.detectedAt);
    })
    .slice(0, 300);
}

export function acknowledgeAlert(alerts = [], alertId, now = new Date().toISOString()) {
  return alerts.map((alert) =>
    alert.id === alertId && alert.status === 'active'
      ? { ...alert, status: 'acknowledged', acknowledgedAt: now, lastSeenAt: now }
      : alert,
  );
}

export function resolveAlert(alerts = [], alertId, now = new Date().toISOString()) {
  return alerts.map((alert) =>
    alert.id === alertId && alert.status !== 'resolved'
      ? { ...alert, status: 'resolved', manuallyResolved: true, resolvedAt: now, lastSeenAt: now }
      : alert,
  );
}

export function resolveAlertsForAstronaut(alerts = [], astronautId, now = new Date().toISOString()) {
  return alerts.map((alert) =>
    alert.astronautId === astronautId && alert.kind === 'vital' && alert.status !== 'resolved'
      ? { ...alert, status: 'resolved', manuallyResolved: false, resolvedAt: now, lastSeenAt: now }
      : alert,
  );
}

export function summarizeAlerts(alerts = []) {
  const summary = {
    total: alerts.length,
    active: 0,
    acknowledged: 0,
    resolved: 0,
    activeCritical: 0,
    activeEmergency: 0,
    activeWarning: 0,
    activeInfo: 0,
    bySeverity: { info: 0, warning: 0, critical: 0, emergency: 0 },
    byKind: { vital: 0, risk: 0, ecg: 0 },
    resolvedToday: 0,
  };
  const today = new Date().toDateString();

  alerts.forEach((alert) => {
    if (summary[alert.status] !== undefined) summary[alert.status] += 1;
    if (alert.status === 'active' || alert.status === 'acknowledged') {
      if (summary.bySeverity[alert.severity] !== undefined) summary.bySeverity[alert.severity] += 1;
      if (summary.byKind[alert.kind] !== undefined) summary.byKind[alert.kind] += 1;
    }
    if (alert.status === 'active') {
      if (alert.severity === 'critical') summary.activeCritical += 1;
      if (alert.severity === 'emergency') summary.activeEmergency += 1;
      if (alert.severity === 'warning') summary.activeWarning += 1;
      if (alert.severity === 'info') summary.activeInfo += 1;
    }
    if (alert.status === 'resolved' && alert.resolvedAt && new Date(alert.resolvedAt).toDateString() === today) {
      summary.resolvedToday += 1;
    }
  });

  return summary;
}

export function activeAlerts(alerts = []) {
  return alerts.filter((alert) => alert.status === 'active');
}

export function openAlerts(alerts = []) {
  return alerts.filter((alert) => alert.status === 'active' || alert.status === 'acknowledged');
}

export function severityLabel(severity) {
  return SEVERITY_LEVELS[severity]?.label || 'Informativa';
}

export function alertIsCritical(alert) {
  return severityAtLeast(alert.severity, 'critical');
}
