import React, { useEffect, useState } from 'react';
import {
  X,
  UserPlus,
  Sparkles,
  Shield,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const SUGGESTED_TEMPLATES = [
  {
    name: 'Dra. Jessica Meir',
    role: 'Oficial Médico de Vuelo',
    activity: 'IVA',
    age: 46,
    sex: 'F',
    heightCm: 165,
    weightKg: 60,
    bloodType: 'O+',
    missionDays: 45,
    notes: 'Especialista en medicina aeroespacial y fisiología cardiovascular en microgravedad.',
  },
  {
    name: 'Dr. Kjell Lindgren',
    role: 'Especialista de Carga Útil & EVA',
    activity: 'EVA',
    age: 51,
    sex: 'M',
    heightCm: 178,
    weightKg: 77,
    bloodType: 'A+',
    missionDays: 32,
    notes: 'Certificado para operaciones extravehiculares avanzadas y robótica orbital.',
  },
  {
    name: 'Dra. Kate Rubins',
    role: 'Investigadora Microbiológica',
    activity: 'IVA',
    age: 44,
    sex: 'F',
    heightCm: 170,
    weightKg: 62,
    bloodType: 'B+',
    missionDays: 18,
    notes: 'Secuenciación de ADN en órbita y monitoreo de biomasa microbiana.',
  },
];

export default function AddAstronautModal({
  isOpen,
  onClose,
  onAddAstronaut,
  existingCrewCount = 3,
}) {
  const nextId = `ast_${String(existingCrewCount + 1).padStart(3, '0')}`;

  const [formData, setFormData] = useState({
    id: nextId,
    name: '',
    role: 'Especialista de Misión',
    activity: 'IVA',
    age: 38,
    sex: 'M',
    heightCm: 175,
    weightKg: 72,
    bloodType: 'O+',
    missionDays: 0,
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: `ast_${String(existingCrewCount + 1).padStart(3, '0')}`,
        name: '',
        role: 'Especialista de Misión',
        activity: 'IVA',
        age: 38,
        sex: 'M',
        heightCm: 175,
        weightKg: 72,
        bloodType: 'O+',
        missionDays: 0,
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen, existingCrewCount]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const applyTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      ...template,
      id: prev.id || nextId,
    }));
    setErrors({});
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'El nombre del tripulante es obligatorio.';
    }
    if (!formData.role || !formData.role.trim()) {
      newErrors.role = 'El rol de misión es obligatorio.';
    }
    const ageNum = Number(formData.age);
    if (!Number.isFinite(ageNum) || ageNum < 18 || ageNum > 80) {
      newErrors.age = 'La edad debe estar comprendida entre 18 y 80 años.';
    }
    const daysNum = Number(formData.missionDays);
    if (!Number.isFinite(daysNum) || daysNum < 0) {
      newErrors.missionDays = 'Los días de misión no pueden ser negativos.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddAstronaut({
      ...formData,
      age: Number(formData.age),
      heightCm: formData.heightCm ? Number(formData.heightCm) : null,
      weightKg: formData.weightKg ? Number(formData.weightKg) : null,
      missionDays: Number(formData.missionDays) || 0,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1B3A]/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-astronaut-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl border border-[#C9D9F5] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#C9D9F5] bg-[#EFF5FE] px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#C9D9F5] bg-[#DBEAFE] text-[#0B3D91] shadow-co-sm">
              <UserPlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="mono rounded border border-[#C9D9F5] bg-white px-1.5 py-0.5 text-[8.5px] font-bold text-[#0B3D91]">
                  CREW OPS
                </span>
                <h2 id="add-astronaut-title" className="font-heading text-[15px] font-bold text-[#0B3D91]">
                  Agregar nuevo astronauta
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] text-[#47598A]">
                Incorpora un tripulante a la misión con activación inmediata de telemetría y monitoreo RIDGE.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-icon text-[#47598A] hover:bg-white hover:text-[#0B3D91]"
            aria-label="Cerrar ventana"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Templates rápidos */}
        <div className="border-b border-[#C9D9F5]/70 bg-[#F5F8FE] px-5 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-wider text-[#47598A]">
              <Sparkles className="h-3 w-3 text-[#0B3D91]" aria-hidden="true" />
              Carga rápida:
            </span>
            {SUGGESTED_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="mono rounded border border-[#C9D9F5] bg-white px-2 py-1 text-[9.5px] font-semibold text-[#0B3D91] shadow-co-sm hover:border-[#0B3D91] hover:bg-[#DBEAFE]/40"
              >
                + {tmpl.name} ({tmpl.role.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Fila 1: ID y Nombre */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="field-label block text-[11px] font-bold text-[#0B1B3A]">
                ID Tripulante
              </label>
              <input
                type="text"
                className="input mt-1 w-full uppercase"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                placeholder="ast_004"
              />
              <span className="mt-1 block text-[9.5px] text-[#47598A]">
                Código identificador único
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="field-label block text-[11px] font-bold text-[#0B1B3A]">
                Nombre completo <span className="field-required text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={`input mt-1 w-full ${errors.name ? 'input-error' : ''}`}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej. Dra. Jessica Meir"
                autoFocus
              />
              {errors.name ? (
                <span className="field-error mt-1 flex items-center gap-1 text-[10px] text-rose-600">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.name}
                </span>
              ) : (
                <span className="mt-1 block text-[9.5px] text-[#47598A]">
                  Nombre registrado en el manifiesto oficial
                </span>
              )}
            </div>
          </div>

          {/* Fila 2: Rol y Actividad */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="field-label block text-[11px] font-bold text-[#0B1B3A]">
                Rol en la misión <span className="field-required text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={`input mt-1 w-full ${errors.role ? 'input-error' : ''}`}
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Ej. Especialista Biomédica"
              />
              {errors.role && (
                <span className="field-error mt-1 flex items-center gap-1 text-[10px] text-rose-600">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.role}
                </span>
              )}
            </div>

            <div>
              <label className="field-label block text-[11px] font-bold text-[#0B1B3A]">
                Actividad operativa inicial
              </label>
              <select
                className="select mt-1 w-full"
                value={formData.activity}
                onChange={(e) => handleChange('activity', e.target.value)}
              >
                <option value="IVA">IVA · Actividad Intravehicular</option>
                <option value="EVA">EVA · Paseo Extravehicular</option>
                <option value="REST">REST · Período de Descanso</option>
                <option value="REHAB">REHAB · Protocolo de Rehabilitación</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Parámetros demográficos */}
          <div className="rounded-lg border border-[#C9D9F5] bg-[#F5F8FE] p-3.5">
            <span className="eyebrow mb-2 block font-bold text-[#0B3D91]">
              Perfil Fisiológico & Demografía
            </span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div>
                <label className="field-label block text-[10.5px] font-medium text-[#47598A]">
                  Edad (años) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="18"
                  max="80"
                  className={`input mt-1 w-full ${errors.age ? 'input-error' : ''}`}
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                />
              </div>

              <div>
                <label className="field-label block text-[10.5px] font-medium text-[#47598A]">
                  Sexo
                </label>
                <select
                  className="select mt-1 w-full"
                  value={formData.sex}
                  onChange={(e) => handleChange('sex', e.target.value)}
                >
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              <div>
                <label className="field-label block text-[10.5px] font-medium text-[#47598A]">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  min="130"
                  max="220"
                  step="0.5"
                  className="input mt-1 w-full"
                  value={formData.heightCm}
                  onChange={(e) => handleChange('heightCm', e.target.value)}
                />
              </div>

              <div>
                <label className="field-label block text-[10.5px] font-medium text-[#47598A]">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  min="40"
                  max="150"
                  step="0.1"
                  className="input mt-1 w-full"
                  value={formData.weightKg}
                  onChange={(e) => handleChange('weightKg', e.target.value)}
                />
              </div>

              <div>
                <label className="field-label block text-[10.5px] font-medium text-[#47598A]">
                  Grupo sanguíneo
                </label>
                <select
                  className="select mt-1 w-full"
                  value={formData.bloodType}
                  onChange={(e) => handleChange('bloodType', e.target.value)}
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bt) => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
            </div>
            {errors.age && (
              <span className="mt-1.5 flex items-center gap-1 text-[10px] text-rose-600">
                <AlertTriangle className="h-3 w-3" />
                {errors.age}
              </span>
            )}
          </div>

          {/* Fila 4: Días de misión y notas */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="field-label block text-[11px] font-bold text-[#0B1B3A]">
                Días de misión acumulados
              </label>
              <input
                type="number"
                min="0"
                max="1200"
                className={`input mt-1 w-full ${errors.missionDays ? 'input-error' : ''}`}
                value={formData.missionDays}
                onChange={(e) => handleChange('missionDays', e.target.value)}
              />
              <span className="mt-1 block text-[9.5px] text-[#47598A]">
                Tiempo en vuelo orbital o tránsito
              </span>
              {errors.missionDays && (
                <span className="mt-1 flex items-center gap-1 text-[10px] text-rose-600">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.missionDays}
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="field-label block text-[11px] font-bold text-[#0B1B3A]">
                Observaciones clínicas / operativas
              </label>
              <input
                type="text"
                className="input mt-1 w-full"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Antecedentes, adaptaciones o notas de misión…"
              />
              <span className="mt-1 block text-[9.5px] text-[#47598A]">
                Información complementaria registrada en el expediente
              </span>
            </div>
          </div>

          {/* Footer de acciones */}
          <div className="flex items-center justify-between border-t border-[#C9D9F5] pt-4">
            <span className="mono text-[10px] text-[#47598A]">
              Los signos vitales se inicializarán automáticamente en rango nominal.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                Incorporar tripulante
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
