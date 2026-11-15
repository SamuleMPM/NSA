import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Gauge,
  Database,
  Activity,
  Orbit,
  ShieldCheck,
  FlaskConical,
} from 'lucide-react';
import ModuleHeader from '../components/ui/ModuleHeader';
import StatusPill from '../components/ui/StatusPill';
import DataOriginBadge from '../components/ui/DataOriginBadge';
import DashboardOverview from './DashboardOverview';
import AlertsPanel from './AlertsPanel';
import RisksPanel from './RisksPanel';
import DataEntry from './DataEntry';

const TABS = [
  { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
  { id: 'alerts', label: 'Alertas', icon: ShieldAlert },
  { id: 'risks', label: 'Riesgos RIDGE', icon: Gauge },
  { id: 'data', label: 'Inserción de datos', icon: Database },
];

export default function Dashboard({
  tab = 'overview',
  setTab,
  astronauts = {},
  crew = {},
  selectedAstronautId,
  setSelectedAstronautId,
  latestVitalsByAstronaut = {},
  latestSample = {},
  evaluations = {},
  assessment,
  environment,
  currentScenario,
  alerts = [],
  alertSummary,
  records = [],
  recordSummary,
  riskHistory = [],
  riskInputs = {},
  onAcknowledgeAlert,
  onResolveAlert,
  onApplyCountermeasure,
  onResetNominal,
  onSaveRecord,
  onDeleteRecord,
  onOpenDictionary,
  onOpenHandbook,
  onOpenTelemetry,
  onOpenSimulator,
  onOpenAddAstronaut,
}) {
  const openAlerts = alerts.filter((alert) => alert.status === 'active' || alert.status === 'acknowledged');
  const overall = assessment?.overall;
  const health = overall?.levelInfo;

  return (
    <div className="space-y-3.5">
      <ModuleHeader
        code="MOD-01"
        kicker="CREW HEALTH / MISSION CONTROL"
        title="Dashboard de salud de tripulación"
        description="Vista integrada de constantes vitales, alertas clínicas, los cinco riesgos RIDGE y los registros introducidos manualmente o generados por simulación."
        icon={LayoutDashboard}
        status={
          <>
            <StatusPill status={health?.tone || 'nominal'} dot={false}>
              RIDGE {overall?.score ?? '--'} · {health?.short || '--'}
            </StatusPill>
            <StatusPill
              status={alertSummary?.activeEmergency ? 'emergency' : alertSummary?.activeCritical ? 'critical' : openAlerts.length ? 'warning' : 'nominal'}
              dot={false}
            >
              {openAlerts.length} ALERTAS
            </StatusPill>
            <DataOriginBadge origin={assessment?.origin || 'simulated'} />
          </>
        }
        actions={
          <>
            <span className="hidden items-center gap-1.5 rounded-md border border-space-700/70 bg-space-900/45 px-2.5 py-1.5 sm:flex">
              <Orbit className="h-3.5 w-3.5 text-telemetry-cyan" aria-hidden="true" />
              <span className="mono text-[9px] font-semibold text-slate-300">{environment?.shortName}</span>
            </span>
            <button type="button" onClick={onOpenTelemetry} className="btn">
              <Activity className="h-3.5 w-3.5" aria-hidden="true" />
              Telemetría
            </button>
            <button type="button" onClick={onOpenSimulator} className="btn">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              Simulador
            </button>
            <button type="button" onClick={onResetNominal} className="btn btn-success">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Nominal
            </button>
          </>
        }
      />

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="segmented" role="tablist" aria-label="Secciones del dashboard">
          {TABS.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            const badge =
              item.id === 'alerts'
                ? openAlerts.length
                : item.id === 'data'
                  ? recordSummary?.total
                  : null;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(item.id)}
                className={`segmented-item ${isActive ? 'segmented-item-active' : ''}`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {item.label}
                {badge ? (
                  <span className="mono rounded bg-space-950/70 px-1 py-0.5 text-[8px] font-bold text-slate-400">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mono text-[8.5px] uppercase tracking-wider text-slate-600">
            {currentScenario?.toUpperCase()} · {environment?.gravityText}
          </span>
          <span className="pill pill-violet">DATOS SIMULADOS</span>
        </div>
      </div>

      <div key={tab} className="animate-fade-in">
        {tab === 'overview' ? (
          <DashboardOverview
            astronauts={astronauts}
            selectedAstronautId={selectedAstronautId}
            setSelectedAstronautId={setSelectedAstronautId}
            latestVitalsByAstronaut={latestVitalsByAstronaut}
            latestSample={latestSample}
            evaluations={evaluations}
            assessment={assessment}
            environment={environment}
            currentScenario={currentScenario}
            alerts={alerts}
            alertSummary={alertSummary}
            records={records}
            recordSummary={recordSummary}
            onOpenTab={setTab}
            onApplyCountermeasure={onApplyCountermeasure}
            onResetNominal={onResetNominal}
            onOpenAddAstronaut={onOpenAddAstronaut}
          />
        ) : null}

        {tab === 'alerts' ? (
          <AlertsPanel
            alerts={alerts}
            alertSummary={alertSummary}
            onAcknowledge={onAcknowledgeAlert}
            onResolve={onResolveAlert}
            onCountermeasure={onApplyCountermeasure}
            onOpenRisks={() => setTab('risks')}
          />
        ) : null}

        {tab === 'risks' ? (
          <RisksPanel
            assessment={assessment}
            riskHistory={riskHistory}
            environment={environment}
            onOpenHandbook={onOpenHandbook}
            onOpenAlerts={() => setTab('alerts')}
            onOpenData={() => setTab('data')}
          />
        ) : null}

        {tab === 'data' ? (
          <DataEntry
            astronauts={astronauts}
            crew={crew}
            selectedAstronautId={selectedAstronautId}
            latestSample={latestSample}
            environment={environment}
            currentScenario={currentScenario}
            riskInputs={riskInputs}
            records={records}
            onSaveRecord={onSaveRecord}
            onDeleteRecord={onDeleteRecord}
            onOpenDictionary={onOpenDictionary}
            onOpenAddAstronaut={onOpenAddAstronaut}
          />
        ) : null}
      </div>
    </div>
  );
}
