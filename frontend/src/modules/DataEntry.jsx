import React, { useEffect, useMemo, useState } from 'react';
import {
  Database,
  UserRound,
  HeartPulse,
  Radio,
  Activity,
  Globe2,
  FlaskConical,
  Save,
  Trash2,
  PencilLine,
  Download,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  ClipboardList,
} from 'lucide-react';
import StatusPill from '../components/ui/StatusPill';
import DataOriginBadge from '../components/ui/DataOriginBadge';
import { PanelHeader } from '../components/ui/Panel';
import {
  RECORD_CATEGORIES,
  getCategoryMeta,
  getSchema,
  groupFieldsBySection,
  validateRecord,
  buildDefaults,
  sortRecords,
  recordToExport,
  summarizeRecords,
} from '../lib/records';
import { SCENARIO_DEFINITIONS } from '../lib/simulation';
import { ENVIRONMENTS } from '../lib/environments';
import { downloadJson, formatDateTime, formatInteger, toLocalInputValue } from '../lib/format';

const CATEGORY_ICONS = {
  astronaut: UserRound,
  vitals: HeartPulse,
  telemetry: Radio,
  ecg: Activity,
  environment: Globe2,
  simulation: FlaskConical,
};

function resolveOptions(field, astronauts) {
  if (field.options) return field.options;
  if (field.optionsSource === 'crew') {
    return Object.entries(astronauts).map(([id, astronaut]) => ({
      value: id,
      label: `${astronaut.name} · ${astronaut.role}`,
    }));
  }
  if (field.optionsSource === 'scenarios') {
    return SCENARIO_DEFINITIONS.map((scenario) => ({
      value: scenario.id,
      label: `${scenario.code} · ${scenario.name}`,
    }));
  }
  if (field.optionsSource === 'environments') {
    return ENVIRONMENTS.map((environment) => ({
      value: environment.id,
      label: environment.name,
    }));
  }
  return [];
}

function FieldControl({ field, value, error, astronauts, onChange }) {
  const options = resolveOptions(field, astronauts);
  const inputClass = `input ${error ? 'input-error' : ''}`;
  const selectClass = `select ${error ? 'input-error' : ''}`;
  const textareaClass = `textarea ${error ? 'input-error' : ''}`;

  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-start gap-2 rounded-md border border-space-700/70 bg-space-900/40 px-2.5 py-2">
        <input
          type="checkbox"
          className="checkbox mt-0.5"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.key, event.target.checked, field.type)}
        />
        <span>
          <span className="block text-[11px] font-semibold leading-snug text-slate-300">{field.label}</span>
          {field.help ? <span className="mt-0.5 block text-[9.5px] leading-snug text-slate-600">{field.help}</span> : null}
        </span>
      </label>
    );
  }

  return (
    <label className="field">
      <span className="field-label">
        <span>
          {field.label}
          {field.required ? <span className="field-required"> *</span> : null}
          {field.unit ? <span className="ml-1 font-normal text-slate-600">({field.unit})</span> : null}
        </span>
      </span>

      {field.type === 'select' ? (
        <select
          className={selectClass}
          value={value ?? ''}
          onChange={(event) => onChange(field.key, event.target.value, field.type)}
        >
          <option value="">Seleccionar…</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          className={textareaClass}
          rows={field.rows || 3}
          value={value ?? ''}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.key, event.target.value, field.type)}
        />
      ) : (
        <input
          className={inputClass}
          type={field.type === 'datetime-local' ? 'datetime-local' : field.type === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.key, event.target.value, field.type)}
        />
      )}

      {field.help ? <span className="field-help">{field.help}</span> : null}
      {error ? (
        <span className="field-error">
          <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden="true" />
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default function DataEntry({
  astronauts = {},
  crew = {},
  selectedAstronautId,
  latestSample = {},
  environment,
  currentScenario = 'microgravity',
  riskInputs = {},
  records = [],
  onSaveRecord,
  onDeleteRecord,
  onOpenDictionary,
  onOpenAddAstronaut,
}) {
  const [category, setCategory] = useState('vitals');
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const context = useMemo(
    () => ({
      astronautId: selectedAstronautId,
      latestSample,
      environment,
      scenario: currentScenario,
      riskInputs,
      crew,
    }),
    // La muestra cambia cada tick; no debe reiniciar el formulario.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedAstronautId, environment?.id, currentScenario, crew],
  );

  const fields = useMemo(() => getSchema(category), [category]);
  const sections = useMemo(() => groupFieldsBySection(fields), [fields]);
  const categoryRecords = useMemo(
    () => sortRecords(records.filter((record) => record.category === category)),
    [records, category],
  );
  const summary = useMemo(() => summarizeRecords(records), [records]);
  const categoryMeta = getCategoryMeta(category);
  const CategoryIcon = CATEGORY_ICONS[categoryMeta.id] || Database;

  useEffect(() => {
    if (editingId) return;
    setValues(buildDefaults(category, context));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, context]);

  const notify = (tone, text) => {
    setFeedback({ tone, text });
    window.setTimeout(() => setFeedback(null), 4200);
  };

  const handleChange = (key, value, type) => {
    // Al cambiar de tripulante en el formulario de perfil, recarga sus datos
    // para no guardar el perfil de otro miembro de la tripulación.
    if (category === 'astronaut' && key === 'astronautId' && !editingId) {
      setValues(buildDefaults(category, { ...context, astronautId: value }));
      setErrors({});
      return;
    }

    setValues((previous) => ({
      ...previous,
      [key]: type === 'checkbox' ? Boolean(value) : value,
    }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setErrors({});
    setValues(buildDefaults(category, context));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateRecord(category, values);
    if (Object.keys(validation).length) {
      setErrors(validation);
      notify('error', 'Revisa los campos marcados antes de guardar.');
      return;
    }
    const saved = onSaveRecord({ category, data: values, existingId: editingId });
    if (saved) {
      notify(
        'success',
        editingId
          ? 'Registro actualizado. Los módulos que lo consumen se han recalculado.'
          : 'Registro guardado y propagado a Dashboard, Telemetría, Alertas y Riesgos.',
      );
      setEditingId(null);
      setErrors({});
      setValues(buildDefaults(category, context));
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setErrors({});
    setFeedback(null);
    setValues({
      ...record.data,
      recordedAt: toLocalInputValue(record.data?.recordedAt || record.recordedAt),
    });
  };

  const handleDelete = (record) => {
    onDeleteRecord(record.id);
    if (editingId === record.id) resetForm();
    notify('success', 'Registro eliminado. Las alertas y riesgos derivados se han actualizado.');
  };

  const handleExport = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      category,
      records: categoryRecords.map(recordToExport),
    };
    const ok = downloadJson(`aerohealth-${category}-${Date.now()}.json`, payload);
    notify(ok ? 'success' : 'error', ok ? 'Exportación JSON descargada.' : 'No se pudo generar la descarga.');
  };

  return (
    <div className="space-y-3.5">
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6" aria-label="Categorías de datos">
        {RECORD_CATEGORIES.map((item) => {
          const Icon = CATEGORY_ICONS[item.id] || Database;
          const isActive = category === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCategory(item.id);
                setEditingId(null);
                setErrors({});
                setFeedback(null);
              }}
              className={`group relative overflow-hidden rounded-md border p-2.5 text-left transition-all duration-150 ${
                isActive
                  ? 'border-cyan-400/45 bg-cyan-400/[0.07] shadow-hud-glow'
                  : 'border-space-700/70 bg-space-900/45 hover:border-space-500/70 hover:bg-space-800/55'
              }`}
              aria-pressed={isActive}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-md border"
                  style={{ color: item.color, borderColor: `${item.color}44`, background: `${item.color}10` }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="mono text-[8px] font-bold text-slate-600">{summary.byCategory?.[item.id] ?? 0}</span>
              </div>
              <span className="mt-1.5 block truncate font-heading text-[11px] font-bold text-slate-200">{item.short}</span>
              <span className="mono mt-0.5 block truncate text-[8px] text-slate-600">{item.label}</span>
            </button>
          );
        })}
      </section>

      {feedback ? (
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-2 ${
            feedback.tone === 'error'
              ? 'border-rose-400/30 bg-rose-400/[0.06] text-rose-200'
              : 'border-emerald-400/25 bg-emerald-400/[0.05] text-emerald-200'
          }`}
          role="status"
        >
          {feedback.tone === 'error' ? (
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="text-[11px] font-medium">{feedback.text}</span>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="panel overflow-hidden xl:col-span-8">
          <div className="flex flex-col gap-2 border-b border-space-700/70 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border"
                style={{ color: categoryMeta.color, borderColor: `${categoryMeta.color}44`, background: `${categoryMeta.color}10` }}
              >
                <CategoryIcon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <span className="eyebrow block">{editingId ? 'EDITANDO REGISTRO' : 'NUEVO REGISTRO'}</span>
                <h3 className="font-heading text-[13px] font-bold text-slate-100">{categoryMeta.label}</h3>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{categoryMeta.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {category === 'astronaut' && onOpenAddAstronaut ? (
                <button
                  type="button"
                  onClick={onOpenAddAstronaut}
                  className="btn btn-primary !h-7 !min-h-0 !py-1 !px-2.5 text-[10px]"
                >
                  <UserRound className="h-3 w-3" />
                  <span>+ Nuevo tripulante</span>
                </button>
              ) : null}
              <StatusPill status="info" dot={false}>VALIDACIÓN ACTIVA</StatusPill>
              {editingId ? (
                <button type="button" onClick={resetForm} className="btn btn-ghost">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Cancelar
                </button>
              ) : null}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 p-3.5">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="h-px flex-1 bg-space-700/60" />
                  <span className="eyebrow">{section.title}</span>
                  <span className="h-px flex-1 bg-space-700/60" />
                </div>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {section.fields.map((field) => (
                    <FieldControl
                      key={field.key}
                      field={field}
                      value={values[field.key]}
                      error={errors[field.key]}
                      astronauts={astronauts}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-space-700/60 pt-3">
              <span className="mono flex items-center gap-1.5 text-[8.5px] text-slate-600">
                <Database className="h-3 w-3 text-telemetry-cyan" aria-hidden="true" />
                Persistencia API REST · SQLite
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={handleExport} className="btn">
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Exportar JSON
                </button>
                {onOpenDictionary ? (
                  <button type="button" onClick={onOpenDictionary} className="btn">
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    Diccionario
                  </button>
                ) : null}
                <button type="submit" className="btn btn-primary">
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  {editingId ? 'Guardar cambios' : 'Guardar registro'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <aside className="panel overflow-hidden xl:col-span-4">
          <PanelHeader
            icon={ClipboardList}
            kicker="REGISTROS PERSISTIDOS"
            title={`${categoryMeta.short} · ${formatInteger(categoryRecords.length)}`}
            description="Los registros alimentan la telemetría, las alertas y los riesgos."
            status={<StatusPill status="violet" dot={false}>{formatInteger(summary.total)} total</StatusPill>}
          />

          <div className="max-h-[560px] space-y-1.5 overflow-y-auto p-3">
            {categoryRecords.length ? (
              categoryRecords.map((record) => (
                <div
                  key={record.id}
                  className={`rounded-md border p-2.5 ${
                    editingId === record.id
                      ? 'border-cyan-400/40 bg-cyan-400/[0.06]'
                      : 'border-space-700/60 bg-space-900/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[10.5px] leading-snug text-slate-300">{record.title}</p>
                      <span className="mono mt-1 block text-[8px] text-slate-600">{formatDateTime(record.recordedAt)}</span>
                    </div>
                    <DataOriginBadge origin={record.origin} showIcon={false} className="shrink-0" />
                  </div>

                  <div className="mt-1.5 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleEdit(record)}
                      className="btn btn-ghost !min-h-[26px] !px-1.5 !py-1"
                      title="Editar registro"
                    >
                      <PencilLine className="h-3 w-3" aria-hidden="true" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record)}
                      className="btn btn-danger !min-h-[26px] !px-1.5 !py-1"
                      title="Eliminar registro"
                    >
                      <Trash2 className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-space-700/60 bg-space-900/25 px-3 py-10 text-center">
                <Plus className="h-6 w-6 text-slate-600" aria-hidden="true" />
                <p className="mt-2 font-heading text-[11.5px] font-bold text-slate-400">Sin registros en esta categoría</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">
                  Completa el formulario para crear el primer registro validado.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-space-700/60 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1">
              <DataOriginBadge origin="manual" label={`${summary.byOrigin?.manual ?? 0}`} />
              <DataOriginBadge origin="simulated" label={`${summary.byOrigin?.simulated ?? 0}`} />
              <DataOriginBadge origin="automated" label={`${summary.byOrigin?.automated ?? 0}`} />
            </div>
            <p className="mt-1.5 text-[9.5px] leading-relaxed text-slate-600">
              Cada registro conserva fecha, origen y validación. Los datos simulados se etiquetan y no deben interpretarse como mediciones reales.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
