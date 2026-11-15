import React, { useState, useRef } from 'react';
import {
  ClipboardCheck,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Apple,
  Eye,
  Brain,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileText,
  Sliders,
  RotateCcw,
  Star,
  Info,
} from 'lucide-react';
import StatusPill from '../components/ui/StatusPill';

const ULTRASOUND_PRESETS = {
  onsd: {
    id: 'onsd',
    title: 'Ultrasonido Ocular: Vaina del Nervio Óptico (SANS)',
    organ: 'Globo Ocular y Nervio Óptico Posterior',
    desc: 'Medición ecográfica a 3 mm detrás de la retina para detectar hipertensión intracraneal y riesgo de Síndrome Neuro-Ocular Asociado a Vuelos Espaciales (SANS).',
    normalRange: '4.5 – 5.4 mm',
    alertThreshold: '> 5.8 mm',
    sampleMeasurement: 4.95,
    sampleImage: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    unit: 'mm',
  },
  quadriceps: {
    id: 'quadriceps',
    title: 'Ecografía Musculoesquelética: Cuádriceps y Masa Muscular',
    organ: 'Músculo Recto Femoral',
    desc: 'Medición de espesor transversal muscular para cuantificar atrofia por desuso gravitatorio y verificar la eficacia de la contramedida ARED.',
    normalRange: '22 – 30 mm',
    alertThreshold: '< 18 mm',
    sampleMeasurement: 24.2,
    sampleImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    unit: 'mm',
  },
  lung: {
    id: 'lung',
    title: 'Ecografía Pulmonar: Detección de Líneas B y Congestión',
    organ: 'Parénquima Pulmonar y Pleura',
    desc: 'Exploración de espacios intercostales para descartar extravasación de líquido o edema alveolar causado por el desplazamiento de fluidos en 0g.',
    normalRange: 'Líneas A normales (0-2 líneas B)',
    alertThreshold: '≥ 3 líneas B coalescentes',
    sampleMeasurement: 1.0,
    sampleImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80',
    unit: 'Líneas B',
  },
};

export default function SelfAssessment({
  astronauts = {},
  selectedAstronautId = 'ast_001',
  onSaveAssessment,
  onAwardGamificationPoints,
  currentTelemetry = {},
}) {
  const [activeTab, setActiveTab] = useState('vitals'); // vitals, psychological, ultrasound
  const [astronautId, setAstronautId] = useState(selectedAstronautId);

  // Formulario de constantes y signos vitales
  const [systolic, setSystolic] = useState(118);
  const [diastolic, setDiastolic] = useState(76);
  const [glucose, setGlucose] = useState(92);
  const [glucoseContext, setGlucoseContext] = useState('fasting'); // fasting, postprandial, post_exercise
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState(4); // 1-5 estrellas
  const [sleepWakeups, setSleepWakeups] = useState(1);

  // Evaluación psicológica y salud mental
  const [mood, setMood] = useState('stable'); // optimal, stable, fatigued, isolated
  const [stressLevel, setStressLevel] = useState(25); // 0-100
  const [cognitiveClarity, setCognitiveClarity] = useState('high'); // high, medium, low
  const [notes, setNotes] = useState('');

  // Ultrasonido e imágenes
  const [selectedPresetKey, setSelectedPresetKey] = useState('onsd');
  const [ultrasoundCalipers, setUltrasoundCalipers] = useState(4.95);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Diagnóstico calculado
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef(null);

  const activePreset = ULTRASOUND_PRESETS[selectedPresetKey];
  const activeAstronaut = astronauts[astronautId] || { name: 'Neil A.', role: 'Comandante de Misión' };

  // Evaluar Presión Arterial
  const getBpCategory = () => {
    if (systolic >= 140 || diastolic >= 90) return { label: 'Hipertensión Espacial (Alerta)', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    if (systolic >= 125 || diastolic >= 82) return { label: 'Prehipertensión / Fluid Shift Leve', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    if (systolic < 90 || diastolic < 60) return { label: 'Hipotensión Ortostática (Atención)', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Presión Arterial Óptima', color: 'text-telemetry-green', bg: 'bg-telemetry-green/10 border-telemetry-green/30' };
  };

  // Evaluar Glucosa
  const getGlucoseCategory = () => {
    if (glucose > 140) return { label: 'Hiperglucemia / Resistencia a Insulina', color: 'text-rose-400' };
    if (glucose < 65) return { label: 'Hipoglucemia (Riesgo de mareo)', color: 'text-rose-400' };
    if (glucose > 115) return { label: 'Elevación Postprandial Leve', color: 'text-amber-400' };
    return { label: 'Glucemia Nominal', color: 'text-telemetry-green' };
  };

  // Manejar subida de archivo para ultrasonido
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setUploadedImage(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simular escaneo de ultrasonido con IA
  const handleRunScanAnalysis = () => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      let calculatedVal = activePreset.sampleMeasurement;
      if (selectedPresetKey === 'onsd') {
        calculatedVal = Number((4.6 + Math.random() * 0.9).toFixed(2));
      } else if (selectedPresetKey === 'quadriceps') {
        calculatedVal = Number((22.0 + Math.random() * 5.0).toFixed(1));
      } else {
        calculatedVal = Math.floor(Math.random() * 3);
      }
      setUltrasoundCalipers(calculatedVal);

      let status = 'nominal';
      let diagnosis = 'Estructura dentro de los márgenes fisiológicos esperados.';
      if (selectedPresetKey === 'onsd') {
        if (calculatedVal >= 5.8) {
          status = 'alerta';
          diagnosis = 'Alerta SANS: Vaina óptica dilatada (>5.8mm). Desplazamiento de fluidos severo. Recomendado traje Chibis LBNP de inmediato.';
        } else if (calculatedVal >= 5.5) {
          status = 'advertencia';
          diagnosis = 'Atención SANS: Ligera dilatación de la vaina óptica. Se aconseja repetir en 48 horas.';
        } else {
          status = 'nominal';
          diagnosis = 'Sin signos de hipertensión intracraneal ni edema papilar (SANS negativo).';
        }
      }

      setScanResult({
        measurement: calculatedVal,
        unit: activePreset.unit,
        status,
        diagnosis,
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 1400);
  };

  // Calcular la evaluación holística global
  const handleCalculateAssessment = () => {
    let score = 100;
    const recommendations = [];

    // Presión arterial
    if (systolic >= 140 || diastolic >= 90) {
      score -= 22;
      recommendations.push('Presión elevada: reducir ingesta de sodio a <2.0g/día, asegurar hidratación y verificar presurización de hábitat.');
    } else if (systolic >= 125 || diastolic >= 82) {
      score -= 8;
      recommendations.push('Monitorear presión dos veces al día para comprobar redistribución de fluidos cefálicos.');
    }

    // Glucosa
    if (glucose > 140 || glucose < 65) {
      score -= 18;
      recommendations.push('Nivel de glucosa fuera de rango: ajustar ración alimenticia con carbohidratos complejos y verificar hidratación con electrólitos.');
    } else if (glucose > 115) {
      score -= 5;
      recommendations.push('Glucemia postprandial ligeramente alta: programar sesión de 30 min en cicloergómetro tras comidas.');
    }

    // Sueño
    if (sleepHours < 6.0) {
      score -= 18;
      recommendations.push('Déficit de sueño acumulado: programar protocolo de luz nocturna cálida (sin luz azul) y siesta reparadora de 30 min.');
    } else if (sleepHours < 7.0 || sleepQuality < 3) {
      score -= 8;
      recommendations.push('Descanso no reparador: verificar ruido de ventiladores en el camarote y usar tapones auditivos certificados.');
    }

    // Estrés y salud mental
    if (stressLevel > 60 || mood === 'isolated') {
      score -= 16;
      recommendations.push('Nivel de estrés o aislamiento elevado: realizar sesión de relajación asistida por audio, programar llamada diferida con familia y check-in con la tripulación.');
    } else if (stressLevel > 40 || mood === 'fatigued') {
      score -= 8;
      recommendations.push('Fatiga acumulada: reducir horas de sobrecarga operativa y dedicar tiempo a recreación.');
    }

    // Ultrasonido
    if (scanResult && scanResult.status === 'alerta') {
      score -= 20;
      recommendations.push(`Hallazgo ecográfico prioritario: ${scanResult.diagnosis}`);
    }

    score = Math.max(25, Math.min(100, score));

    let riskLevel = 'Bajo (Nominal)';
    let summaryText = 'El estado de salud general es óptimo para las demandas de la misión.';
    if (score < 65) {
      riskLevel = 'Elevado (Requiere contramedidas inmediatas)';
      summaryText = 'Se detectan desviaciones significativas en múltiples indicadores fisiológicos. Se requiere aplicar contramedidas preventivas de forma autónoma.';
    } else if (score < 82) {
      riskLevel = 'Moderado (Atención preventiva temprana)';
      summaryText = 'Varios indicadores muestran fatiga o adaptación subóptima al entorno espacial. Aplicar recomendaciones para evitar progresión clínica.';
    }

    const calculatedResult = {
      score,
      riskLevel,
      summaryText,
      recommendations,
      timestamp: new Date().toLocaleTimeString(),
      systolic,
      diastolic,
      glucose,
      sleepHours,
      stressLevel,
      mood,
      ultrasound: scanResult ? `${scanResult.measurement} ${scanResult.unit} (${scanResult.status.toUpperCase()})` : 'No realizado',
    };

    setAssessmentResult(calculatedResult);
    setIsSubmitted(true);

    // Otorgar puntos de gamificación por completar la autoevaluación
    if (onAwardGamificationPoints) {
      onAwardGamificationPoints(120, 'Autoevaluación de Salud Completa Registrada');
    }

    // Guardar en la telemetría central
    if (onSaveAssessment) {
      onSaveAssessment(astronautId, {
        systolic_bp: systolic,
        diastolic_bp: diastolic,
        glucose,
        sleep_hours: sleepHours,
        stress_level: stressLevel,
        mood,
        onsd_mm: ultrasoundCalipers,
      });
    }
  };

  const bpCat = getBpCategory();
  const glucCat = getGlucoseCategory();

  return (
    <div className="space-y-5">
      {/* Encabezado del Módulo de Autoevaluación */}
      <div className="rounded-xl border border-space-800 bg-space-900/90 p-5 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-telemetry-cyan/40 bg-telemetry-cyan/10 text-telemetry-cyan">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-white">
                  Autoevaluación y Diagnóstico de Salud Espacial
                </h2>
                <span className="rounded bg-telemetry-cyan/20 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300">
                  AUTONOMOUS CREW TOOL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Herramienta interactiva para que los astronautas registren, evalúen indicadores clave (presión, glucosa, sueño, salud mental, ultrasonido) y apliquen tratamientos autónomos.
              </p>
            </div>
          </div>

          {/* Selector de Astronauta evaluador */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">Tripulante:</span>
            <select
              value={astronautId}
              onChange={(e) => setAstronautId(e.target.value)}
              className="rounded-lg border border-space-700 bg-space-850 px-3 py-1.5 font-mono text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none"
            >
              {Object.entries(astronauts).map(([id, ast]) => (
                <option key={id} value={id}>
                  {ast.name} ({ast.role?.split(' ')[0] || 'Astronauta'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pestañas de entrada de datos */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-space-800 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('vitals')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition ${
              activeTab === 'vitals'
                ? 'bg-telemetry-cyan/20 text-cyan-300 border border-telemetry-cyan/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
                : 'bg-space-850 text-slate-400 hover:text-white border border-space-800'
            }`}
          >
            <Heart className="h-4 w-4 text-rose-400" />
            <span>1. Constantes Vitales & Glucosa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('psychological')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition ${
              activeTab === 'psychological'
                ? 'bg-telemetry-violet/20 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(167,139,250,0.25)]'
                : 'bg-space-850 text-slate-400 hover:text-white border border-space-800'
            }`}
          >
            <Brain className="h-4 w-4 text-purple-400" />
            <span>2. Salud Mental & Sueño</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ultrasound')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition ${
              activeTab === 'ultrasound'
                ? 'bg-telemetry-green/20 text-emerald-300 border border-telemetry-green/50 shadow-[0_0_12px_rgba(52,211,153,0.25)]'
                : 'bg-space-850 text-slate-400 hover:text-white border border-space-800'
            }`}
          >
            <Eye className="h-4 w-4 text-cyan-400" />
            <span>3. Laboratorio de Ultrasonido (SANS / Músculo)</span>
          </button>
        </div>
      </div>

      {/* Contenido según la pestaña activa */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Formulario de Entrada (Lado Izquierdo: 7 columnas) */}
        <div className="lg:col-span-7">
          {activeTab === 'vitals' && (
            <div className="space-y-4 rounded-2xl border border-space-800 bg-space-900/90 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-space-800 pb-3">
                <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-400" />
                  Presión Arterial y Metabolismo Glucémico
                </h3>
                <span className="font-mono text-[11px] text-slate-400">Entrada Teclado / Sensores</span>
              </div>

              {/* Presión Arterial */}
              <div className="rounded-xl border border-space-800 bg-space-850/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Presión Arterial (PA)</span>
                    <p className="text-[11px] text-slate-400">
                      Vigilar elevación cefálica de fluidos (desplazamiento de 2L de sangre al tórax en 0g).
                    </p>
                  </div>
                  <span className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${bpCat.bg} ${bpCat.color}`}>
                    {bpCat.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-slate-300 flex justify-between">
                      <span>Sistólica (mmHg):</span>
                      <span className="font-mono font-bold text-white">{systolic}</span>
                    </label>
                    <input
                      type="range"
                      min="80"
                      max="180"
                      value={systolic}
                      onChange={(e) => setSystolic(Number(e.target.value))}
                      className="mt-2 w-full accent-cyan-400"
                    />
                    <div className="flex justify-between font-mono text-[9px] text-slate-500 mt-1">
                      <span>80 (Baja)</span>
                      <span>120 (Normal)</span>
                      <span>180 (Alta)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-300 flex justify-between">
                      <span>Diastólica (mmHg):</span>
                      <span className="font-mono font-bold text-white">{diastolic}</span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="115"
                      value={diastolic}
                      onChange={(e) => setDiastolic(Number(e.target.value))}
                      className="mt-2 w-full accent-cyan-400"
                    />
                    <div className="flex justify-between font-mono text-[9px] text-slate-500 mt-1">
                      <span>50 (Baja)</span>
                      <span>80 (Normal)</span>
                      <span>115 (Alta)</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-space-950/60 p-2 font-mono text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Presión Arterial Media (PAM):</span>
                  <span className="font-bold text-cyan-300">
                    {((2 * diastolic + systolic) / 3).toFixed(1)} mmHg
                  </span>
                </div>
              </div>

              {/* Nivel de Glucosa en Sangre */}
              <div className="rounded-xl border border-space-800 bg-space-850/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Nivel de Glucosa en Sangre (mg/dL)</span>
                    <p className="text-[11px] text-slate-400">
                      La microgravedad altera la sensibilidad muscular a la insulina.
                    </p>
                  </div>
                  <span className={`font-mono text-xs font-bold ${glucCat.color}`}>
                    {glucCat.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-slate-400">Momento de la toma:</span>
                  <div className="flex gap-1.5">
                    {[
                      { id: 'fasting', label: 'Ayuno (Matutino)' },
                      { id: 'postprandial', label: '2h Post-Comida' },
                      { id: 'post_exercise', label: 'Post-Entrenamiento ARED' },
                    ].map((ctx) => (
                      <button
                        key={ctx.id}
                        type="button"
                        onClick={() => setGlucoseContext(ctx.id)}
                        className={`rounded px-2.5 py-1 text-[11px] font-medium transition ${
                          glucoseContext === ctx.id
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50'
                            : 'bg-space-900 text-slate-400 border border-space-700'
                        }`}
                      >
                        {ctx.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="220"
                    value={glucose}
                    onChange={(e) => setGlucose(Number(e.target.value))}
                    className="flex-1 accent-amber-400"
                  />
                  <div className="flex items-center gap-1.5 rounded-lg border border-space-700 bg-space-950 px-3 py-1.5">
                    <input
                      type="number"
                      value={glucose}
                      onChange={(e) => setGlucose(Number(e.target.value))}
                      className="w-14 bg-transparent font-mono text-base font-bold text-amber-300 focus:outline-none"
                    />
                    <span className="font-mono text-xs text-slate-400">mg/dL</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'psychological' && (
            <div className="space-y-4 rounded-2xl border border-space-800 bg-space-900/90 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-space-800 pb-3">
                <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  Salud Mental, Confinamiento y Ritmo Circadiano
                </h3>
                <span className="font-mono text-[11px] text-slate-400">NASA HRP Behavioral Health</span>
              </div>

              {/* Horas de Sueño Diarias */}
              <div className="rounded-xl border border-space-800 bg-space-850/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white">Horas de Sueño en las Últimas 24h:</label>
                  <span className="font-mono text-sm font-bold text-cyan-300">{sleepHours} horas</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="11.0"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between font-mono text-[10px] text-slate-500">
                  <span>3h (Severo)</span>
                  <span>7.5h - 8.5h (Óptimo en Órbita)</span>
                  <span>11h</span>
                </div>

                {/* Calidad de Sueño (Estrellas) */}
                <div className="mt-3 flex items-center justify-between border-t border-space-800/80 pt-2">
                  <span className="text-xs text-slate-300">Calidad percibida del descanso:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSleepQuality(star)}
                        className="text-slate-600 hover:text-amber-400"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= sleepQuality ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estado de Ánimo y Aislamiento */}
              <div className="rounded-xl border border-space-800 bg-space-850/60 p-4 space-y-3">
                <span className="text-xs font-bold text-white">Estado de Ánimo y Resiliencia:</span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: 'optimal', label: 'Enfocado / Motivado', color: 'border-emerald-500/40 text-emerald-300' },
                    { id: 'stable', label: 'Estable / Calmo', color: 'border-cyan-500/40 text-cyan-300' },
                    { id: 'fatigued', label: 'Fatigado / Sobrecarga', color: 'border-amber-500/40 text-amber-300' },
                    { id: 'isolated', label: 'Aislado / Confinado', color: 'border-rose-500/40 text-rose-300' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMood(m.id)}
                      className={`rounded-lg border p-2 text-center text-xs font-medium transition ${
                        mood === m.id
                          ? `bg-space-750 font-bold ${m.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`
                          : 'border-space-800 bg-space-950/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Slider de Estrés Subjetivo */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Nivel Subjetivo de Estrés (0-100%):</span>
                    <span className="font-mono font-bold text-purple-300">{stressLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="w-full accent-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ultrasound' && (
            <div className="space-y-4 rounded-2xl border border-space-800 bg-space-900/90 p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-space-800 pb-3">
                <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="h-4 w-4 text-cyan-400" />
                  Módulo de Ultrasonido y Bio-Imágenes Espaciales
                </h3>
                <span className="font-mono text-[11px] text-slate-400">IA & Visión Computacional</span>
              </div>

              {/* Selector de Protocolo de Ultrasonido */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {Object.entries(ULTRASOUND_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedPresetKey(key);
                      setScanResult(null);
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      selectedPresetKey === key
                        ? 'border-cyan-400 bg-cyan-400/15 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                        : 'border-space-800 bg-space-850/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-[10px] text-cyan-300 uppercase">{preset.organ}</div>
                    <div className="mt-1 font-semibold text-xs text-white">{preset.title.split(':')[0]}</div>
                    <div className="mt-1 font-mono text-[10px] text-slate-400">Rango: {preset.normalRange}</div>
                  </button>
                ))}
              </div>

              {/* Visor de Ecografía con Retícula y Calipers */}
              <div className="relative overflow-hidden rounded-xl border border-space-700 bg-black p-4">
                <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-lg border border-space-800 bg-space-950">
                  {/* Imagen Ecográfica simulada o subida */}
                  <img
                    src={uploadedImage || activePreset.sampleImage}
                    alt="Ecografía espacial"
                    className="h-full w-full object-cover opacity-60 mix-blend-luminosity filter contrast-125"
                  />

                  {/* Retícula ecográfica médica sobrepuesta */}
                  <div className="absolute inset-0 bg-console-grid opacity-40 pointer-events-none" />

                  {/* Calipers milimétricos interactivos */}
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex items-center justify-between border-t-2 border-dashed border-cyan-400 px-4">
                    <div className="h-4 w-1 bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                    <div className="rounded bg-black/80 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/50">
                      CALIPER: {ultrasoundCalipers} {activePreset.unit}
                    </div>
                    <div className="h-4 w-1 bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                  </div>

                  {isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs">
                      <Sparkles className="h-8 w-8 text-cyan-400 animate-spin" />
                      <span className="mt-2 font-mono text-xs text-cyan-300">
                        ANALIZANDO ECOESTRUCTURA Y ESPESOR TISULAR…
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones de Ultrasonido: Cargar archivo, Capturar y Analizar */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg border border-space-700 bg-space-850 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Cargar Imagen</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="flex items-center gap-1.5 rounded-lg border border-space-700 bg-space-850 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Preset Estándar</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunScanAnalysis}
                    disabled={isScanning}
                    className="flex items-center gap-2 rounded-lg bg-cyan-500/20 px-4 py-2 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition shadow-[0_0_12px_rgba(34,211,238,0.25)]"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Ejecutar Análisis Automatizado</span>
                  </button>
                </div>

                {/* Resultado del escaneo */}
                {scanResult && (
                  <div
                    className={`mt-3 rounded-lg border p-3 ${
                      scanResult.status === 'alerta'
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                        : scanResult.status === 'advertencia'
                        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                        : 'border-telemetry-green/40 bg-telemetry-green/10 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-bold">
                      <span>MEDICIÓN OBTENIDA: {scanResult.measurement} {scanResult.unit}</span>
                      <span className="uppercase">{scanResult.status}</span>
                    </div>
                    <p className="mt-1 text-xs">{scanResult.diagnosis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón Maestro para Calcular Evaluación Holística */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleCalculateAssessment}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-mono text-sm font-bold text-white shadow-[0_0_20px_rgba(34,211,238,0.35)] transition hover:brightness-110 active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              <span>Generar Diagnóstico y Plan de Acción de Salud</span>
            </button>
          </div>
        </div>

        {/* Panel de Diagnóstico & Plan de Acción (Lado Derecho: 5 columnas) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-space-800 bg-space-900/95 p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-space-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <h3 className="font-heading text-sm font-bold text-white">Informe Clínico del Astronauta</h3>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {activeAstronaut.name}
              </span>
            </div>

            {assessmentResult ? (
              <div className="mt-4 space-y-4 animate-fade-in">
                {/* Score Circular / Índice AeroHealth */}
                <div className="flex items-center justify-between rounded-xl border border-space-700 bg-space-850/80 p-4">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      ÍNDICE AEROHEALTH
                    </span>
                    <div className="font-mono text-3xl font-extrabold text-white">
                      {assessmentResult.score} <span className="text-base text-slate-500">/ 100</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-cyan-400">
                      Riesgo: {assessmentResult.riskLevel}
                    </span>
                  </div>

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                    <span className="font-mono text-lg font-bold text-white">
                      {assessmentResult.score >= 85 ? 'A+' : assessmentResult.score >= 70 ? 'B' : 'C-'}
                    </span>
                  </div>
                </div>

                {/* Resumen Clínico */}
                <div className="rounded-xl border border-space-800 bg-space-850/50 p-3.5 text-xs leading-relaxed text-slate-300">
                  <p>{assessmentResult.summaryText}</p>
                </div>

                {/* Plan de Acción Paso a Paso */}
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Plan de Acción y Tratamientos Recomendados:
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {assessmentResult.recommendations.length > 0 ? (
                      assessmentResult.recommendations.map((rec, rIdx) => (
                        <li
                          key={rIdx}
                          className="flex items-start gap-2 rounded-lg border border-space-750 bg-space-850/60 p-2.5 text-xs text-slate-200"
                        >
                          <ChevronRight className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-center gap-2 rounded-lg border border-telemetry-green/30 bg-telemetry-green/10 p-3 text-xs text-telemetry-green">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Todos los indicadores dentro del rango nominal. Mantener rutina de 2h de ARED y cicloergómetro.</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Notificación de enlace diferido a Tierra */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-amber-200/90 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="h-3.5 w-3.5 text-amber-400" />
                    <span>Autonomía Médica & Latencia de Comunicación</span>
                  </div>
                  <p className="text-slate-300">
                    El retardo con el Centro de Control en Houston es de ~14.5 minutos. No espere respuesta en tiempo real para aplicar las contramedidas listadas arriba.
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-8 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-space-700 bg-space-850 text-slate-500">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Complete los datos de constantes vitales, estado mental o ultrasonido y presione <strong className="text-cyan-300">"Generar Diagnóstico"</strong> para obtener el plan de bienestar espacial personalizado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
