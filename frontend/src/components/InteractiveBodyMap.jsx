import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Brain,
  Eye,
  Heart,
  Wind,
  Bone,
  Apple,
  Shield,
  ClipboardCheck,
  BookOpen,
  Sliders,
  Download,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Bot,
  UserCheck,
  Check,
  RotateCw,
  Layers,
  Activity,
  Maximize2,
} from 'lucide-react';
import Astronaut3DViewer from './Astronaut3DViewer';

// Definición de Especialidades Clínicas / Sistemas Anatómicos según el diseño de consola médica
const MEDICAL_SPECIALTIES = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    esName: 'Cardiología',
    icon: Heart,
    color: '#22D3EE',
    accentColor: '#38BDF8',
    targetY: 135, // Coordenada Y en el holograma para el retículo HUD
    targetX: 96,
    organLabel: 'Sistema Cardiovascular Central',
    sectionTitle: 'Hemodynamic & Vascular Health',
    metrics: [
      {
        id: 'hr',
        label: 'Heart Rate',
        short: 'HR',
        value: (sample) => sample.heart_rate || 76,
        unit: 'bpm',
        min: 48,
        max: 130,
        normalMin: 60,
        normalMax: 100,
        arcColor: '#22D3EE',
        waveType: 'ecg',
      },
      {
        id: 'bp',
        label: 'Systemic BP',
        short: 'SYS/DIA',
        value: (sample) => sample.systolic_bp || 118,
        unit: 'mmHg',
        min: 80,
        max: 160,
        normalMin: 100,
        normalMax: 125,
        arcColor: '#FBBF24',
        waveType: 'bp',
      },
      {
        id: 'map',
        label: 'Pulmonary / MAP',
        short: 'PAM',
        value: (sample) => (((2 * (sample.diastolic_bp || 76)) + (sample.systolic_bp || 118)) / 3).toFixed(1),
        unit: 'mmHg',
        min: 50,
        max: 110,
        normalMin: 70,
        normalMax: 95,
        arcColor: '#60A5FA',
        waveType: 'map',
      },
    ],
    statusBreakdown: {
      category: 'Spaceflight Vascular Adaptation',
      stat1: { label: 'Vascular Compliance (Tipo 1)', value: '54.7%' },
      stat2: { label: 'Baroreceptor Reset (Tipo 2)', value: '45.3%' },
      detail: 'La microgravedad reduce la demanda de bombeo contra la gravedad. El gasto cardíaco se mantiene estable y la perfusión miocárdica es nominal.',
    },
    doctor: {
      name: 'Dr. Alice Cooper',
      title: 'MCC-H Flight Surgeon',
      email: 'cooper.medical@nasa.gov',
      phone: '+1 281 483-0123 (Houston)',
      status: 'Enlace Diferido (14.5m delay)',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    },
    prescription: {
      title: 'Protocolo de Mantenimiento Cardiovascular',
      text: 'Mantener 30 min de intervalos en cinta rodante T2 con arnés al 70% de carga. Beber 350 mL de solución de electrolitos previa a las maniobras de EVA. Si la presión sistólica supera 135 mmHg, reposo en cabina.',
      actionLabel: 'Ejecutar Intervalos T2 Cardíacos',
    },
  },
  {
    id: 'neurology',
    name: 'Neurology',
    esName: 'Neurología',
    icon: Brain,
    color: '#A78BFA',
    accentColor: '#C084FC',
    targetY: 55,
    targetX: 100,
    organLabel: 'Cerebro y Salud Cognitiva',
    sectionTitle: 'Neurological & Circadian Status',
    metrics: [
      {
        id: 'stress',
        label: 'Cognitive Stress',
        short: 'ESTRÉS',
        value: (sample) => sample.stress_level || 18,
        unit: '%',
        min: 0,
        max: 100,
        normalMin: 0,
        normalMax: 40,
        arcColor: '#A78BFA',
        waveType: 'stress',
      },
      {
        id: 'sleep',
        label: 'Sleep Duration',
        short: 'SUEÑO',
        value: (sample) => sample.sleep_hours || 7.8,
        unit: 'hrs',
        min: 3,
        max: 11,
        normalMin: 7.0,
        normalMax: 8.5,
        arcColor: '#818CF8',
        waveType: 'sleep',
      },
      {
        id: 'readiness',
        label: 'Mission Readiness',
        short: 'READINESS',
        value: (sample) => 94,
        unit: '/100',
        min: 50,
        max: 100,
        normalMin: 80,
        normalMax: 100,
        arcColor: '#34D399',
        waveType: 'readiness',
      },
    ],
    statusBreakdown: {
      category: 'Circadian Phase & Cognitive Load',
      stat1: { label: 'Fase REM y Profundo', value: '78.2%' },
      stat2: { label: 'Índice de Atención Sostenida', value: '92.4%' },
      detail: 'El ritmo circadiano muestra sincronización estable con el régimen de 24 horas del hábitat. No se detectan lapsos de atención ni fatiga crítica.',
    },
    doctor: {
      name: 'Dr. Marcus Vance',
      title: 'Neuro-Behavioral Lead',
      email: 'vance.behavioral@nasa.gov',
      phone: '+1 281 483-0542',
      status: 'Monitoreo Psicométrico Activo',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    },
    prescription: {
      title: 'Protocolo de Higiene Circadiana',
      text: 'Activar espectro lumínico azul (480 nm) a las 06:00 UTC para estimular el cortisol matutino. 15 minutos de meditación VR inmersiva y cambio a luz cálida 2h antes de dormir.',
      actionLabel: 'Activar Modo Circadiano',
    },
  },
  {
    id: 'optometry',
    name: 'Optometry',
    esName: 'Optometría & SANS',
    icon: Eye,
    color: '#22D3EE',
    accentColor: '#38BDF8',
    targetY: 62,
    targetX: 100,
    organLabel: 'Vaina Óptica & Síndrome SANS',
    sectionTitle: 'Neuro-Ocular & SANS Monitoring',
    metrics: [
      {
        id: 'onsd',
        label: 'Optic Sheath (ONSD)',
        short: 'ONSD',
        value: (sample) => sample.onsd_mm || 4.95,
        unit: 'mm',
        min: 3.5,
        max: 6.5,
        normalMin: 4.5,
        normalMax: 5.4,
        arcColor: '#22D3EE',
        waveType: 'onsd',
      },
      {
        id: 'acuity',
        label: 'Visual Acuity',
        short: 'AGUDEZA',
        value: () => 20,
        unit: '/20',
        min: 15,
        max: 40,
        normalMin: 20,
        normalMax: 20,
        arcColor: '#34D399',
        waveType: 'acuity',
      },
      {
        id: 'iop',
        label: 'Intraocular Press.',
        short: 'PIO',
        value: () => 16,
        unit: 'mmHg',
        min: 8,
        max: 26,
        normalMin: 12,
        normalMax: 20,
        arcColor: '#FBBF24',
        waveType: 'iop',
      },
    ],
    statusBreakdown: {
      category: 'Cephalic Fluid Shift & Globe Flattening',
      stat1: { label: 'Sin Edema de Papila', value: '100%' },
      stat2: { label: 'Gradiente Frisen Grado 0', value: 'Nominal' },
      detail: 'El desplazamiento cefálico de fluidos no ha provocado dilatación patológica de la vaina del nervio óptico (<5.4 mm). La retina se encuentra íntegra.',
    },
    doctor: {
      name: 'Dr. Elena Rostova',
      title: 'Ophthalmic Flight Lead',
      email: 'rostova.sans@nasa.gov',
      phone: '+1 281 483-0887',
      status: 'Protocolo SANS Activo',
      avatar: 'https://images.unsplash.com/photo-1594824813589-a29288f61405?auto=format&fit=crop&w=200&q=80',
    },
    prescription: {
      title: 'Protocolo de Descompresión LBNP Chibis',
      text: 'Utilizar el dispositivo de presión negativa en extremidades inferiores (LBNP) durante 45 minutos a -35 mmHg para redistribuir fluidos hacia las piernas y reducir la presión venosa intracraneal.',
      actionLabel: 'Iniciar Descompresión LBNP',
    },
  },
  {
    id: 'pulmonology',
    name: 'Pulmonology',
    esName: 'Neumología',
    icon: Wind,
    color: '#38BDF8',
    accentColor: '#60A5FA',
    targetY: 130,
    targetX: 104,
    organLabel: 'Vías Respiratorias & Hematosis',
    sectionTitle: 'Pulmonary Mechanics & ECLSS Balance',
    metrics: [
      {
        id: 'spo2',
        label: 'SpO2 Oxygenation',
        short: 'SpO2',
        value: (sample) => sample.spo2 || 98.4,
        unit: '%',
        min: 85,
        max: 100,
        normalMin: 95,
        normalMax: 100,
        arcColor: '#38BDF8',
        waveType: 'spo2',
      },
      {
        id: 'rr',
        label: 'Respiratory Rate',
        short: 'RR',
        value: (sample) => sample.respiratory_rate || 15,
        unit: 'rpm',
        min: 8,
        max: 28,
        normalMin: 12,
        normalMax: 20,
        arcColor: '#60A5FA',
        waveType: 'rr',
      },
      {
        id: 'co2',
        label: 'Expired ppCO2',
        short: 'ppCO2',
        value: () => 3.2,
        unit: 'mmHg',
        min: 1.0,
        max: 6.0,
        normalMin: 2.0,
        normalMax: 4.0,
        arcColor: '#34D399',
        waveType: 'co2',
      },
    ],
    statusBreakdown: {
      category: 'Gas Exchange & Cabin Aerosols',
      stat1: { label: 'Eficiencia Alveolar', value: '98.8%' },
      stat2: { label: 'Depuración LiOH / MetOx', value: 'OK' },
      detail: 'La difusión de oxígeno y la eliminación de dióxido de carbono se realizan sin obstrucción. Sin presencia de aerosoles o regolito abrasivo en vías aéreas.',
    },
    doctor: {
      name: 'Dr. James Thorne',
      title: 'ECLSS Clinical Director',
      email: 'thorne.eclss@nasa.gov',
      phone: '+1 281 483-0311',
      status: 'Circuito Regenerativo OK',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80',
    },
    prescription: {
      title: 'Protocolo de Purga y Ventilación',
      text: 'Verificar el caudal de recirculación de ventiladores en el módulo habitable para evitar bolsas estáticas de CO2. En caso de cefalea, purgar con O2 al 100%.',
      actionLabel: 'Verificar Caudal ECLSS',
    },
  },
  {
    id: 'traumatology',
    name: 'Traumatology',
    esName: 'Osteomuscular',
    icon: Bone,
    color: '#F472B6',
    accentColor: '#FB7185',
    targetY: 260,
    targetX: 92,
    organLabel: 'Densidad Ósea y Fémur',
    sectionTitle: 'Musculoskeletal & Bone Density',
    metrics: [
      {
        id: 'boneloss',
        label: 'Monthly Bone Loss',
        short: 'PÉRDIDA',
        value: (sample) => sample.bone_loss_monthly || 0.28,
        unit: '%/mes',
        min: 0.1,
        max: 1.5,
        normalMin: 0.1,
        normalMax: 0.4,
        arcColor: '#F472B6',
        waveType: 'bone',
      },
      {
        id: 'ared',
        label: 'ARED Load Today',
        short: 'ARED',
        value: () => 120,
        unit: 'min',
        min: 0,
        max: 150,
        normalMin: 90,
        normalMax: 150,
        arcColor: '#34D399',
        waveType: 'ared',
      },
      {
        id: 'muscle',
        label: 'Quadriceps Mass',
        short: 'MASA',
        value: () => 96.2,
        unit: '% base',
        min: 75,
        max: 100,
        normalMin: 90,
        normalMax: 100,
        arcColor: '#22D3EE',
        waveType: 'muscle',
      },
    ],
    statusBreakdown: {
      category: 'Trabecular Remodeling & Atrophy',
      stat1: { label: 'Cumplimiento ARED', value: '100%' },
      stat2: { label: 'Protección Anti-Osteopenia', value: 'Óptima' },
      detail: 'El estímulo mecánico de las cargas axiales en el dispositivo ARED contrarresta eficazmente la pérdida de hidroxiapatita cálcica en fémur y vértebras.',
    },
    doctor: {
      name: 'Dr. Sarah Lin',
      title: 'Biomechanics Specialist',
      email: 'lin.biomechanics@nasa.gov',
      phone: '+1 281 483-0934',
      status: 'ARED Conectado',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    prescription: {
      title: 'Prescripción de Ejercicio Resistivo ARED',
      text: 'Completar la rutina de sentadillas profundas y peso muerto en ARED con resistencia de 180 kg por cilindro. Tomar suplementación de 1000 mg de citrato de calcio y vitamina D3.',
      actionLabel: 'Iniciar Rutina ARED (120 min)',
    },
  },
  {
    id: 'metabolism',
    name: 'Metabolism',
    esName: 'Metabolismo',
    icon: Apple,
    color: '#FBBF24',
    accentColor: '#F59E0B',
    targetY: 175,
    targetX: 100,
    organLabel: 'Páncreas, Glucosa y Nutrición',
    sectionTitle: 'Metabolic & Glycemic Balance',
    metrics: [
      {
        id: 'gluc',
        label: 'Blood Glucose',
        short: 'GLUCOSA',
        value: (sample) => sample.glucose || 92,
        unit: 'mg/dL',
        min: 50,
        max: 180,
        normalMin: 70,
        normalMax: 110,
        arcColor: '#FBBF24',
        waveType: 'gluc',
      },
      {
        id: 'watts',
        label: 'Metabolic Output',
        short: 'POTENCIA',
        value: () => 95,
        unit: 'Watts',
        min: 60,
        max: 220,
        normalMin: 80,
        normalMax: 120,
        arcColor: '#60A5FA',
        waveType: 'watts',
      },
      {
        id: 'water',
        label: 'Hydration Intake',
        short: 'AGUA',
        value: () => 2.8,
        unit: 'L/día',
        min: 1.0,
        max: 4.0,
        normalMin: 2.2,
        normalMax: 3.2,
        arcColor: '#34D399',
        waveType: 'water',
      },
    ],
    statusBreakdown: {
      category: 'Insulin Sensitivity & Nutrient Absorption',
      stat1: { label: 'Sensibilidad a Insulina', value: 'Nominal' },
      stat2: { label: 'Balance Hídrico', value: '2800 mL/d' },
      detail: 'La captación celular de glucosa se mantiene en equilibrio tras la ingesta. No se observan signos de hiperglucemia reactiva ni cetosis por ayuno.',
    },
    doctor: {
      name: 'Dr. Arthur Pendelton',
      title: 'Spaceflight Nutritionist',
      email: 'pendelton.diet@nasa.gov',
      phone: '+1 281 483-0498',
      status: 'Nutrición Calibrada',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    prescription: {
      title: 'Pauta Nutricional Espacial',
      text: 'Ajustar la ración con carbohidratos de asimilación lenta enriquecidos en polifenoles. Ingerir 300 mL de electrolitos orales 30 min antes de la sesión de cicloergómetro.',
      actionLabel: 'Registrar Ración Saludable',
    },
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    esName: 'Inmunología',
    icon: Shield,
    color: '#34D399',
    accentColor: '#10B981',
    targetY: 110,
    targetX: 100,
    organLabel: 'Sistema Inmune y Barrera Dérmica',
    sectionTitle: 'Immunological & Radiation Shielding',
    metrics: [
      {
        id: 'rad',
        label: 'Cosmic Radiation',
        short: 'DOSIS',
        value: () => 142.5,
        unit: 'mSv',
        min: 0,
        max: 300,
        normalMin: 0,
        normalMax: 200,
        arcColor: '#FBBF24',
        waveType: 'rad',
      },
      {
        id: 'wbc',
        label: 'Leukocyte Count',
        short: 'LEUCOS',
        value: () => 6.8,
        unit: 'k/µL',
        min: 3.0,
        max: 13.0,
        normalMin: 4.5,
        normalMax: 11.0,
        arcColor: '#34D399',
        waveType: 'wbc',
      },
      {
        id: 'temp',
        label: 'Core Temperature',
        short: 'TEMP',
        value: (sample) => sample.temperature || 36.6,
        unit: '°C',
        min: 35.0,
        max: 39.5,
        normalMin: 36.1,
        normalMax: 37.2,
        arcColor: '#22D3EE',
        waveType: 'temp',
      },
    ],
    statusBreakdown: {
      category: 'Immune Vigilance & Viral Suppression',
      stat1: { label: 'Dosis Acumulada', value: '142.5 mSv' },
      stat2: { label: 'Integridad Epitelial', value: '100% OK' },
      detail: 'El blindaje del hábitat atenúa el 98.2% de la radiación cósmica. La respuesta inmunitaria celular contra virus latentes (Epstein-Barr) permanece intacta.',
    },
    doctor: {
      name: 'Dr. Rebecca Chen',
      title: 'Immunology Lead',
      email: 'chen.immunology@nasa.gov',
      phone: '+1 281 483-0712',
      status: 'Blindaje Monitoreado',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80',
    },
    prescription: {
      title: 'Refuerzo Inmunitario y Radioprotección',
      text: 'Administrar suplemento de polifenoles y vitamina D3 (2000 UI/día). Aplicar crema emoliente dérmica en puntos de apoyo del traje para prevenir eccema por roce.',
      actionLabel: 'Aplicar Suplemento Inmune',
    },
  },
];

// Generador de ondas ECG y pulsos visuales para los mini-gauges
function renderMiniWave(type, color) {
  if (type === 'ecg') {
    return (
      <svg viewBox="0 0 100 24" className="h-4 w-20 opacity-85">
        <path
          d="M 0 12 L 25 12 L 28 8 L 32 16 L 36 3 L 41 22 L 45 10 L 48 13 L 52 12 L 100 12"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === 'bp' || type === 'map') {
    return (
      <svg viewBox="0 0 100 24" className="h-4 w-20 opacity-85">
        <path
          d="M 0 14 Q 20 4 35 12 T 70 12 T 100 12"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // Onda suave sinusoidal
  return (
    <svg viewBox="0 0 100 24" className="h-4 w-20 opacity-85">
      <path
        d="M 0 12 Q 25 4 50 12 T 100 12"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Componente de Arc Gauge Circular inspirado exactamente en el mockup
function CircularArcGauge({ label, value, unit, min, max, arcColor, waveType }) {
  const numVal = Number(value);
  const clampedVal = Math.max(min, Math.min(max, numVal));
  const pct = (clampedVal - min) / (max - min);

  // Arco circular de 240 grados (de 150° a 390°)
  const radius = 42;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength * (1 - pct);

  return (
    <div className="relative flex flex-col items-center justify-center p-2.5">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
          {/* Fondo de arco gris oscuro */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Arco activo brillante con color temático */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${arcColor}88)`,
            }}
          />
        </svg>

        {/* Contenido Central: Valor numérico y mini-onda */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline gap-0.5">
            <span className="font-heading text-2xl font-bold tracking-tight text-white">
              {value}
            </span>
            <span className="font-mono text-[9px] text-slate-400">{unit}</span>
          </div>
          <span className="font-mono text-[8.5px] uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <div className="mt-1">
            {renderMiniWave(waveType, arcColor)}
          </div>
        </div>
      </div>

      {/* Rangos Mínimo y Máximo en los extremos del arco */}
      <div className="mt-1 flex w-full max-w-[100px] justify-between font-mono text-[9px] text-slate-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function InteractiveBodyMap({
  currentSample = {},
  selectedAstronaut = {},
  onApplyCountermeasure,
  envInfo = {},
  setActiveModule,
}) {
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('cardiology');
  const [activeDateTab, setActiveDateTab] = useState('live');
  const [renderMode, setRenderMode] = useState('hologram'); // 'hologram' (estilo screenshot) o '3d' (three.js)
  const [view3DMode, setView3DMode] = useState('xray');
  const [notification, setNotification] = useState(null);

  const activeSpecialty =
    MEDICAL_SPECIALTIES.find((s) => s.id === selectedSpecialtyId) || MEDICAL_SPECIALTIES[0];

  // Ejecución de prescripción médica con feedback inmediato
  const handleExecutePrescription = () => {
    if (onApplyCountermeasure) {
      onApplyCountermeasure(selectedAstronaut?.id || 'ast_001', activeSpecialty.name);
    }
    setNotification(
      `¡Prescripción médica ejecutada! Protocolo para "${activeSpecialty.esName}" aplicado con éxito a ${selectedAstronaut?.name || 'Neil A.'}.`
    );
    setTimeout(() => setNotification(null), 5000);
  };

  // Exportar informe clínico en formato JSON
  const handleExportData = () => {
    const report = {
      astronaut: selectedAstronaut?.name || 'Neil A.',
      mission: 'ORION MCC-H (Mars Transit)',
      specialty: activeSpecialty.name,
      timestamp: new Date().toISOString(),
      sample: currentSample,
      prescription: activeSpecialty.prescription,
      doctor: activeSpecialty.doctor,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AeroHealth_${activeSpecialty.id}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative mx-auto w-full max-w-[1600px] overflow-hidden rounded-3xl border border-space-800 bg-[#070b14] text-slate-100 shadow-2xl backdrop-blur-2xl">
      {/* Resplandor ambiental de fondo */}
      <div
        className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
      />

      {/* ======================================================== */}
      {/* 1. BARRA SUPERIOR DE LA CONSOLA                          */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-3 border-b border-space-800/80 px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-[#05080f]/90">
        {/* Identidad de la Clínica Espacial */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/15 text-telemetry-cyan shadow-[0_0_12px_rgba(34,211,238,0.25)]">
            <span className="font-heading text-lg font-black leading-none">+</span>
          </div>
          <div>
            <h1 className="font-heading text-sm font-bold tracking-wide text-white">
              AEROHEALTH HOSPITAL
            </h1>
            <span className="font-mono text-[9.5px] uppercase tracking-wider text-slate-500">
              NASA Human Research Program · Flight Health
            </span>
          </div>
        </div>

        {/* Acciones de Contacto & Perfil de Usuario */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <Phone className="h-3.5 w-3.5 text-cyan-400" />
            <span>Enlace Houston (14.5m)</span>
          </div>

          <div className="h-4 w-px bg-space-800 hidden sm:block" />

          {/* Perfil del Astronauta */}
          <div className="flex items-center gap-2.5 rounded-full border border-space-750 bg-space-900/90 py-1 pl-1 pr-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="Astronauta"
              className="h-6 w-6 rounded-full object-cover border border-cyan-400/40"
            />
            <span className="font-heading text-xs font-semibold text-white">
              {selectedAstronaut?.name || 'Neil Armstrong'}
            </span>
          </div>
        </div>
      </div>

      {/* Notificación de protocolo */}
      {notification && (
        <div className="mx-6 mt-3 flex items-center justify-between rounded-xl border border-telemetry-green/40 bg-telemetry-green/10 px-4 py-2.5 text-xs text-telemetry-green animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[11px] text-slate-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CUERPO PRINCIPAL: SIDEBAR + HOLOGRAMA + PANELES       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Barra Lateral Izquierda: Especialidades Médicas (Estilo exacto del mockup) */}
        <div className="flex flex-row overflow-x-auto border-b border-space-800 bg-[#060a12]/95 p-2 lg:col-span-2 lg:flex-col lg:border-b-0 lg:border-r lg:overflow-x-hidden">
          <div className="flex flex-row gap-1.5 lg:flex-col lg:space-y-1 w-full">
            {/* Opción General */}
            <button
              type="button"
              onClick={() => setActiveModule && setActiveModule('general')}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-space-850 hover:text-white transition shrink-0 lg:shrink"
            >
              <LayoutGrid className="h-4 w-4 shrink-0 text-slate-400" />
              <span>General</span>
            </button>

            {/* Lista de Especialidades Médicas */}
            {MEDICAL_SPECIALTIES.map((spec) => {
              const isActive = selectedSpecialtyId === spec.id;
              const IconComp = spec.icon;

              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSelectedSpecialtyId(spec.id)}
                  className={`group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition shrink-0 lg:shrink ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.35)]'
                      : 'text-slate-400 hover:bg-space-850/80 hover:text-slate-200'
                  }`}
                >
                  <IconComp
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}
                  />
                  <span>{spec.name}</span>
                </button>
              );
            })}

            <div className="my-2 border-t border-space-800/80 hidden lg:block" />

            {/* Accesos rápidos a los otros módulos del reto */}
            <button
              type="button"
              onClick={() => setActiveModule && setActiveModule('self_assessment')}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-space-850 hover:text-white transition shrink-0 lg:shrink"
            >
              <ClipboardCheck className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Analysis (Auto-Test)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule && setActiveModule('handbook')}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-space-850 hover:text-white transition shrink-0 lg:shrink"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Help (5 Riesgos)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule && setActiveModule('simulator')}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-400 hover:bg-space-850 hover:text-white transition shrink-0 lg:shrink"
            >
              <Sliders className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>Settings (Simulador)</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* ÁREA CENTRAL: HOLOGRAMA DEL ASTRONAUTA CON PEDESTAL HUD  */}
        {/* ======================================================== */}
        <div className="relative flex flex-col items-center justify-center p-6 border-b border-space-800/80 lg:col-span-5 lg:border-b-0 lg:border-r bg-gradient-to-b from-[#080d19] via-[#050912] to-[#04060c]">
          {/* Selector de Modo: Holograma Sci-Fi vs Visor 3D Three.js */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1 rounded-xl border border-space-700 bg-space-900/85 p-1 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setRenderMode('hologram')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                renderMode === 'hologram'
                  ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Holograma HUD
            </button>
            <button
              type="button"
              onClick={() => setRenderMode('3d')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                renderMode === '3d'
                  ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visor 3D WebGL
            </button>
          </div>

          {renderMode === '3d' ? (
            <div className="w-full h-[520px]">
              <Astronaut3DViewer
                currentSample={currentSample}
                selectedOrganId={activeSpecialty.id}
                onSelectOrgan={(id) => setSelectedSpecialtyId(id)}
                viewMode={view3DMode}
                onChangeViewMode={setView3DMode}
              />
            </div>
          ) : (
            /* Vista Holográfica Idéntica a la Imagen Subida */
            <div className="relative flex h-[500px] w-full max-w-[340px] items-center justify-center">
              <svg
                viewBox="0 0 200 400"
                className="h-full w-full drop-shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                aria-label="Silueta holográfica del astronauta"
              >
                <defs>
                  {/* Gradiente azul holográfico translúcido */}
                  <linearGradient id="holoBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="#0c2340" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#071526" stopOpacity="0.2" />
                  </linearGradient>

                  {/* Resplandor del retículo activo */}
                  <filter id="reticleGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. PEDESTAL CIRCULAR HOLOGRÁFICO EN EL SUELO (Con anillos concéntricos y rotación) */}
                <g className="origin-bottom">
                  {/* Anillo exterior discontinuo */}
                  <ellipse
                    cx="100"
                    cy="365"
                    rx="82"
                    ry="22"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.8"
                    strokeDasharray="10 8"
                    opacity="0.8"
                    className="animate-spin-slow origin-center"
                    style={{ transformOrigin: '100px 365px' }}
                  />
                  {/* Anillo intermedio azul brillante */}
                  <ellipse
                    cx="100"
                    cy="365"
                    rx="68"
                    ry="18"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeDasharray="28 14"
                    opacity="0.9"
                    className="animate-spin-reverse origin-center"
                    style={{ transformOrigin: '100px 365px' }}
                  />
                  {/* Anillo interior sólido */}
                  <ellipse
                    cx="100"
                    cy="365"
                    rx="52"
                    ry="14"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="1.2"
                    opacity="0.6"
                  />
                  {/* Brillo del suelo */}
                  <ellipse
                    cx="100"
                    cy="365"
                    rx="40"
                    ry="10"
                    fill="#22d3ee"
                    opacity="0.12"
                  />
                </g>

                {/* 2. SILUETA HUMANA HOLOGRÁFICA */}
                <g
                  stroke="#38bdf8"
                  strokeWidth="1.2"
                  fill="url(#holoBodyGrad)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Cabeza */}
                  <ellipse cx="100" cy="55" rx="20" ry="24" stroke="#22d3ee" strokeWidth="1.4" />
                  {/* Cuello */}
                  <path d="M 93 78 L 93 90 L 107 90 L 107 78 Z" />
                  {/* Torso */}
                  <path d="M 93 90 L 56 106 L 46 165 L 62 170 L 70 124 L 84 124 L 84 215 L 100 220 L 116 215 L 116 124 L 130 124 L 138 170 L 154 165 L 144 106 L 107 90 Z" />
                  {/* Brazos inferiores */}
                  <path d="M 46 165 L 36 226 L 50 230 L 60 170 Z" />
                  <path d="M 154 165 L 164 226 L 150 230 L 140 170 Z" />
                  {/* Manos */}
                  <ellipse cx="42" cy="238" rx="6" ry="9" />
                  <ellipse cx="158" cy="238" rx="6" ry="9" />
                  {/* Pelvis */}
                  <path d="M 84 215 L 75 245 L 100 252 L 125 245 L 116 215 Z" />
                  {/* Pierna Izquierda */}
                  <path d="M 75 245 L 70 310 L 74 365 L 88 365 L 86 310 L 96 250 Z" />
                  {/* Pierna Derecha */}
                  <path d="M 125 245 L 130 310 L 126 365 L 112 365 L 114 310 L 104 250 Z" />
                </g>

                {/* 3. RETÍCULO SCI-FI CIRCULAR HUD ENFOCADO EN EL ÓRGANO ACTIVO */}
                <g
                  transform={`translate(${activeSpecialty.targetX}, ${activeSpecialty.targetY})`}
                  filter="url(#reticleGlow)"
                  className="cursor-pointer"
                >
                  {/* Anillo exterior de ticks técnicos */}
                  <circle
                    cx="0"
                    cy="0"
                    r="44"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                    opacity="0.8"
                    className="animate-spin-slow origin-center"
                  />

                  {/* Anillo intermedio con segmentos gruesos */}
                  <circle
                    cx="0"
                    cy="0"
                    r="36"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.8"
                    strokeDasharray="22 14"
                    opacity="0.9"
                    className="animate-spin-reverse origin-center"
                  />

                  {/* Anillo interior cerrado */}
                  <circle
                    cx="0"
                    cy="0"
                    r="26"
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    opacity="0.9"
                  />

                  {/* Fondo oscuro del visor circular para destacar el órgano */}
                  <circle
                    cx="0"
                    cy="0"
                    r="24"
                    fill="#040914"
                    opacity="0.85"
                  />

                  {/* Órgano iluminado latiendo / pulsando en el centro exacto */}
                  <g className="animate-pulse">
                    {activeSpecialty.id === 'cardiology' && (
                      <path
                        d="M 0 -7 C -4 -12 -12 -9 -12 -3 C -12 6 0 13 0 13 C 0 13 12 6 12 -3 C 12 -9 4 -12 0 -7 Z"
                        fill="#fb7185"
                        stroke="#f43f5e"
                        strokeWidth="1"
                      />
                    )}
                    {activeSpecialty.id === 'neurology' && (
                      <ellipse cx="0" cy="0" rx="9" ry="8" fill="#a78bfa" stroke="#c084fc" strokeWidth="1" />
                    )}
                    {activeSpecialty.id === 'optometry' && (
                      <g>
                        <ellipse cx="-4" cy="0" rx="3.5" ry="3.5" fill="#22d3ee" />
                        <ellipse cx="4" cy="0" rx="3.5" ry="3.5" fill="#22d3ee" />
                      </g>
                    )}
                    {activeSpecialty.id === 'pulmonology' && (
                      <g>
                        <ellipse cx="-5" cy="0" rx="4" ry="9" fill="#38bdf8" />
                        <ellipse cx="5" cy="0" rx="4" ry="9" fill="#38bdf8" />
                      </g>
                    )}
                    {activeSpecialty.id === 'metabolism' && (
                      <circle cx="0" cy="0" r="7" fill="#fbbf24" />
                    )}
                    {activeSpecialty.id === 'traumatology' && (
                      <rect x="-3" y="-8" width="6" height="16" rx="2" fill="#f472b6" />
                    )}
                    {activeSpecialty.id === 'dermatology' && (
                      <polygon points="0,-8 7,-4 7,4 0,8 -7,4 -7,-4" fill="#34d399" />
                    )}
                  </g>

                  {/* Cruz central de calibración médica */}
                  <line x1="-16" y1="0" x2="-8" y2="0" stroke="#22d3ee" strokeWidth="1.2" />
                  <line x1="8" y1="0" x2="16" y2="0" stroke="#22d3ee" strokeWidth="1.2" />
                  <line x1="0" y1="-16" x2="0" y2="-8" stroke="#22d3ee" strokeWidth="1.2" />
                  <line x1="0" y1="8" x2="0" y2="16" stroke="#22d3ee" strokeWidth="1.2" />
                </g>
              </svg>

              {/* Etiqueta flotante inferior del holograma */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                <span className="font-mono text-[10px] text-cyan-300/80 bg-space-950/80 px-3 py-1 rounded-full border border-cyan-500/30 backdrop-blur-md uppercase tracking-wider">
                  Target: {activeSpecialty.organLabel}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* ÁREA DERECHA: TELEMETRÍA, CURVAS Y PRESCRIPCIÓN CLÍNICA  */}
        {/* ======================================================== */}
        <div className="flex flex-col justify-between p-6 lg:col-span-5 space-y-5 bg-[#070c18]/90">
          {/* Fila Superior: Título de sección, selector de fecha y botón Exportar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-space-800/80 pb-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-wide">
                {activeSpecialty.sectionTitle}
              </h2>
              <span className="font-mono text-[10px] text-cyan-400">
                NASA HRP REAL-TIME BIOMEDICAL FEED
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Fechas / Timestamps chips */}
              <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setActiveDateTab('t1')}
                  className={`px-1.5 py-0.5 rounded ${
                    activeDateTab === 't1' ? 'text-cyan-300 font-bold border-b border-cyan-400' : 'hover:text-slate-200'
                  }`}
                >
                  11.12.26
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDateTab('t2')}
                  className={`px-1.5 py-0.5 rounded ${
                    activeDateTab === 't2' ? 'text-cyan-300 font-bold border-b border-cyan-400' : 'hover:text-slate-200'
                  }`}
                >
                  14.06.26
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDateTab('live')}
                  className={`px-1.5 py-0.5 rounded ${
                    activeDateTab === 'live' ? 'text-cyan-300 font-bold border-b border-cyan-400' : 'hover:text-slate-200'
                  }`}
                >
                  EN VIVO
                </button>
              </div>

              {/* Botón Exportar idéntico al mockup */}
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 font-mono text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition shadow-[0_0_12px_rgba(34,211,238,0.2)]"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Tres Arc Gauges Circulares (Estilo exacto del mockup) */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 rounded-2xl border border-space-800/80 bg-space-900/40 py-2">
            {activeSpecialty.metrics.map((metric) => (
              <CircularArcGauge
                key={metric.id}
                label={metric.label}
                value={metric.value(currentSample)}
                unit={metric.unit}
                min={metric.min}
                max={metric.max}
                arcColor={metric.arcColor}
                waveType={metric.waveType}
              />
            ))}
          </div>

          {/* Fila Intermedia: Estado del Sistema & Gráfico de Onda Sinusoidal Suave */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 rounded-2xl border border-space-800/80 bg-space-900/40 p-4">
            {/* Breakdown de estado (5 columnas) */}
            <div className="sm:col-span-6 space-y-2">
              <h3 className="font-heading text-xs font-bold text-white uppercase tracking-wider">
                {activeSpecialty.statusBreakdown.category}
              </h3>

              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{activeSpecialty.statusBreakdown.stat1.label}</span>
                  <span className="font-bold text-cyan-300">
                    {activeSpecialty.statusBreakdown.stat1.value}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>{activeSpecialty.statusBreakdown.stat2.label}</span>
                  <span className="font-bold text-blue-300">
                    {activeSpecialty.statusBreakdown.stat2.value}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {activeSpecialty.statusBreakdown.detail}
              </p>
            </div>

            {/* Gráfico de Ondas Suaves Sci-Fi idéntico a la imagen (6 columnas) */}
            <div className="sm:col-span-6 flex flex-col justify-center items-center">
              <div className="relative h-28 w-full overflow-hidden rounded-xl bg-[#040812] border border-space-800 p-2">
                {/* Líneas guía discontinuas horizontales */}
                <div className="absolute inset-x-2 top-1/2 border-t border-dashed border-slate-700/60" />
                <div className="absolute inset-x-2 bottom-3 border-t border-dashed border-amber-500/40" />

                {/* Doble onda sinusoidal superpuesta (cian y azul) */}
                <svg viewBox="0 0 200 80" className="h-full w-full">
                  <defs>
                    <linearGradient id="waveCyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Curva 1: Cian Brillante */}
                  <path
                    d="M 0 40 Q 30 5 60 40 T 120 40 T 170 15 T 200 40"
                    fill="none"
                    stroke="url(#waveCyanGrad)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }}
                  />

                  {/* Curva 2: Azul Suave complementaria */}
                  <path
                    d="M 0 45 Q 40 75 80 45 T 140 45 T 200 45"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>

                <div className="absolute bottom-1 right-2 font-mono text-[8px] text-slate-500">
                  REAL-TIME RHYTHM
                </div>
              </div>
            </div>
          </div>

          {/* Fila Inferior: Cajas con esquinas biseladas (Doctor / Flight Surgeon & Prescripción Médica) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            {/* Caja 1: Doctor / Flight Surgeon (5 columnas) */}
            <div className="sm:col-span-5 relative rounded-2xl border border-cyan-500/35 bg-space-900/60 p-3.5 backdrop-blur-md">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-300 block mb-2">
                DOCTOR / FLIGHT SURGEON
              </span>

              <div className="flex items-center gap-3">
                <img
                  src={activeSpecialty.doctor.avatar}
                  alt={activeSpecialty.doctor.name}
                  className="h-11 w-11 rounded-xl object-cover border border-cyan-400/40 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-heading text-xs font-bold text-white truncate">
                    {activeSpecialty.doctor.name}
                  </h4>
                  <p className="font-mono text-[9.5px] text-slate-400 truncate">
                    {activeSpecialty.doctor.email}
                  </p>
                  <p className="font-mono text-[9px] text-cyan-400 mt-0.5">
                    {activeSpecialty.doctor.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Caja 2: Prescripción Médica & Botón de Aplicación (7 columnas) */}
            <div className="sm:col-span-7 relative rounded-2xl border border-cyan-500/35 bg-space-900/60 p-3.5 backdrop-blur-md flex flex-col justify-between">
              <div>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-cyan-300 block mb-1">
                  PRESCRIPTION & TREATMENT PROTOCOL
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300 line-clamp-3">
                  {activeSpecialty.prescription.text}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-space-800/80 pt-2">
                <span className="font-mono text-[9.5px] text-slate-400">
                  Autonomía Médica: Inmediata
                </span>
                <button
                  type="button"
                  onClick={handleExecutePrescription}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 font-mono text-xs font-bold text-white hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(34,211,238,0.3)] active:scale-95"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Aplicar Protocolo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
