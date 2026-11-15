import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Dumbbell,
  Heart,
  Eye,
  Brain,
  Shield,
  Apple,
  TrendingUp,
  Calendar,
  AlertCircle,
  Bell,
  Check,
} from 'lucide-react';
import StatusPill from '../components/ui/StatusPill';

const INITIAL_ROUTINES = [
  {
    id: 'routine_01',
    time: '07:00',
    category: 'Cardiovascular & Metabólico',
    title: 'Chequeo Matutino de Presión y Glucosa',
    desc: 'Registrar la presión arterial con manguito en decúbito y glucemia capilar en ayunas.',
    points: 50,
    icon: Heart,
    color: '#FB7185',
    completed: true,
  },
  {
    id: 'routine_02',
    time: '09:30',
    category: 'Musculoesquelético',
    title: 'Entrenamiento Resistivo ARED (120 min)',
    desc: 'Sentadillas, peso muerto y ejercicios resistivos de 200kg en vacío para mitigar osteopenia.',
    points: 150,
    icon: Dumbbell,
    color: '#F472B6',
    completed: false,
  },
  {
    id: 'routine_03',
    time: '12:30',
    category: 'Nutrición & Hidratación',
    title: 'Hidratación Isotónica y Calcio Espacial',
    desc: 'Ingerir 750 mL de solución de sales minerales y suplemento de 1000 mg de citrato de calcio.',
    points: 40,
    icon: Apple,
    color: '#FBBF24',
    completed: true,
  },
  {
    id: 'routine_04',
    time: '15:30',
    category: 'Neuro-Ocular (SANS)',
    title: 'Ecografía Ocular ONSD / Fondo de Ojo',
    desc: 'Medición de la vaina del nervio óptico con ultrasonido portátil para vigilar presión intracraneal.',
    points: 100,
    icon: Eye,
    color: '#22D3EE',
    completed: false,
  },
  {
    id: 'routine_05',
    time: '18:00',
    category: 'Salud Mental & Aislamiento',
    title: 'Check-in Psicológico y Meditación en 0g',
    desc: '15 minutos de respiración guiada con VR de paisajes terrestres para aliviar la tensión de aislamiento.',
    points: 80,
    icon: Brain,
    color: '#A78BFA',
    completed: false,
  },
  {
    id: 'routine_06',
    time: '21:30',
    category: 'Ritmo Circadiano',
    title: 'Ajuste de Luz Nocturna y Descanso',
    desc: 'Atenuación de luminarias de camarote al espectro ámbar (<3000K) y colocación de antifaz.',
    points: 50,
    icon: Clock,
    color: '#34D399',
    completed: false,
  },
];

const BADGES = [
  {
    id: 'badge_bone',
    title: 'Guardián Óseo (Bone Guardian)',
    desc: '7 sesiones consecutivas de contramedida ARED completadas.',
    icon: Dumbbell,
    color: '#F472B6',
    unlocked: true,
    progress: '7/7 Días',
    rarity: 'Épico',
  },
  {
    id: 'badge_zen',
    title: 'Zen Orbital (Cosmic Calm)',
    desc: 'Mantener nivel de estrés < 25% por 5 días en aislamiento extremo.',
    icon: Brain,
    color: '#A78BFA',
    unlocked: true,
    progress: '5/5 Días',
    rarity: 'Raro',
  },
  {
    id: 'badge_glucose',
    title: 'Metabolismo de Marte',
    desc: 'Registrar 10 mediciones de glucosa consecutivas dentro del rango óptimo.',
    icon: Apple,
    color: '#FBBF24',
    unlocked: false,
    progress: '8/10 Días',
    rarity: 'Legendario',
  },
  {
    id: 'badge_sans',
    title: 'Visión Artemis (Clear SANS)',
    desc: 'Completar 3 escaneos ecográficos de nervio óptico con ONSD < 5.4 mm.',
    icon: Eye,
    color: '#22D3EE',
    unlocked: true,
    progress: '3/3 Escaneos',
    rarity: 'Épico',
  },
  {
    id: 'badge_shield',
    title: 'Escudo de Radiación',
    desc: 'Verificar dosimetría y protocolo de tormenta solar durante tránsito.',
    icon: Shield,
    color: '#34D399',
    unlocked: false,
    progress: '1/3 Dosis',
    rarity: 'Común',
  },
  {
    id: 'badge_commander',
    title: 'Comandante Autónomo',
    desc: 'Resolver autónomamente 3 alertas médicas sin esperar enlace de Houston.',
    icon: Award,
    color: '#FB7185',
    unlocked: true,
    progress: '3/3 Resueltas',
    rarity: 'Legendario',
  },
];

export default function GamificationHub({
  bioCredits = 1420,
  healthStreak = 12,
  onAwardPoints,
  selectedAstronaut = {},
}) {
  const [routines, setRoutines] = useState(INITIAL_ROUTINES);
  const [activeNotification, setActiveNotification] = useState(null);

  const completedCount = routines.filter((r) => r.completed).length;
  const totalRoutines = routines.length;
  const completionPercentage = Math.round((completedCount / totalRoutines) * 100);

  // Obtener Rango del Astronauta según sus Bio-Créditos
  const getRankInfo = (points) => {
    if (points >= 2000) return { rank: 'Comandante Artemis Biomédico', level: 5, nextLevel: 2500, color: 'text-amber-400' };
    if (points >= 1200) return { rank: 'Oficial Médico de Misión', level: 4, nextLevel: 2000, color: 'text-cyan-400' };
    if (points >= 700) return { rank: 'Ingeniero de Vuelo Saludable', level: 3, nextLevel: 1200, color: 'text-emerald-400' };
    if (points >= 300) return { rank: 'Especialista Biomédico', level: 2, nextLevel: 700, color: 'text-blue-400' };
    return { rank: 'Cadete Espacial', level: 1, nextLevel: 300, color: 'text-slate-300' };
  };

  const rankInfo = getRankInfo(bioCredits);

  // Marcar una rutina como completada
  const handleToggleRoutine = (id) => {
    setRoutines((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextState = !r.completed;
          if (nextState) {
            if (onAwardPoints) {
              onAwardPoints(r.points, `Rutina completada: ${r.title}`);
            }
            setActiveNotification(`¡+${r.points} Bio-Créditos! Tarea "${r.title}" completada.`);
            setTimeout(() => setActiveNotification(null), 4000);
          }
          return { ...r, completed: nextState };
        }
        return r;
      })
    );
  };

  return (
    <div className="space-y-5">
      {/* Encabezado y Estadísticas de Gamificación */}
      <div className="rounded-2xl border border-space-800 bg-space-900/90 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-space-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg font-bold text-white">
                  AeroQuest: Rutinas de Misión y Gamificación de Salud
                </h2>
                <span className="rounded bg-amber-400/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                  CREW HEALTH ENGAGEMENT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sistema de recompensas de salud para motivar a los astronautas a cumplir con el ejercicio diario (ARED), chequeos de glucosa, descanso y salud mental.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">Astronauta:</span>
            <span className="rounded-lg border border-space-700 bg-space-850 px-3 py-1 font-mono text-xs font-bold text-white">
              {selectedAstronaut.name || 'Neil A.'}
            </span>
          </div>
        </div>

        {/* Tarjetas de Métricas de Gamificación */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Bio-Créditos */}
          <div className="rounded-xl border border-space-800 bg-space-850/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Bio-Créditos Ganados</span>
              <Sparkles className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-amber-300">
              {bioCredits} <span className="text-xs font-normal text-slate-400">pts</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              Siguiente nivel: {rankInfo.nextLevel} pts
            </span>
          </div>

          {/* Racha de Salud */}
          <div className="rounded-xl border border-space-800 bg-space-850/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Racha de Salud Activa</span>
              <Flame className="h-4 w-4 text-rose-400 animate-pulse" />
            </div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-rose-400">
              {healthStreak} <span className="text-xs font-normal text-slate-400">días</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              ¡Objetivos cumplidos sin interrupción!
            </span>
          </div>

          {/* Rango de Vuelo */}
          <div className="rounded-xl border border-space-800 bg-space-850/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Rango Biomédico</span>
              <Award className="h-4 w-4 text-cyan-400" />
            </div>
            <div className={`mt-1 font-mono text-sm font-bold ${rankInfo.color} truncate`}>
              {rankInfo.rank}
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              Nivel {rankInfo.level} de Vuelo Espacial
            </span>
          </div>

          {/* Progreso del Día */}
          <div className="rounded-xl border border-space-800 bg-space-850/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Rutinas de Hoy</span>
              <CheckCircle2 className="h-4 w-4 text-telemetry-green" />
            </div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-telemetry-green">
              {completedCount} <span className="text-xs font-normal text-slate-400">/ {totalRoutines}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-space-950">
              <div
                className="h-full bg-telemetry-green transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notificación interactiva de recompensa */}
      {activeNotification && (
        <div className="flex items-center justify-between rounded-xl border border-amber-400/40 bg-amber-400/10 p-3.5 text-xs font-semibold text-amber-200 animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>{activeNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveNotification(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Grid de Rutinas Diarias Programadas + Insignias de la Misión */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Rutinas Diarias Programadas (Lado Izquierdo: 7 columnas) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="rounded-2xl border border-space-800 bg-space-900/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-space-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <h3 className="font-heading text-sm font-bold text-white">
                  Cronograma de Salud Diario del Astronauta
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {completionPercentage}% Completado
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {routines.map((routine) => {
                const IconComp = routine.icon;

                return (
                  <div
                    key={routine.id}
                    className={`flex flex-col gap-3 rounded-xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                      routine.completed
                        ? 'border-telemetry-green/30 bg-telemetry-green/5 opacity-85'
                        : 'border-space-800 bg-space-850/70 hover:border-space-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                        style={{
                          borderColor: `${routine.color}40`,
                          backgroundColor: `${routine.color}15`,
                          color: routine.color,
                        }}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-300">
                            [{routine.time}]
                          </span>
                          <span className="text-[10px] font-semibold uppercase text-slate-400">
                            {routine.category}
                          </span>
                        </div>
                        <h4
                          className={`mt-0.5 text-xs font-bold ${
                            routine.completed ? 'line-through text-slate-400' : 'text-white'
                          }`}
                        >
                          {routine.title}
                        </h4>
                        <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                          {routine.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        +{routine.points} pts
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRoutine(routine.id)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition ${
                          routine.completed
                            ? 'bg-telemetry-green/20 text-telemetry-green border border-telemetry-green/40'
                            : 'bg-space-800 text-slate-300 hover:bg-space-750 hover:text-white border border-space-700'
                        }`}
                      >
                        {routine.completed ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Hecho</span>
                          </>
                        ) : (
                          <span>Marcar Hecho</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Insignias y Logros de Salud de la NASA (Lado Derecho: 5 columnas) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-space-800 bg-space-900/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-space-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <h3 className="font-heading text-sm font-bold text-white">
                  Medallas y Logros de Salud Espacial
                </h3>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {BADGES.filter((b) => b.unlocked).length} / {BADGES.length} Desbloqueadas
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {BADGES.map((badge) => {
                const IconComp = badge.icon;

                return (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                      badge.unlocked
                        ? 'border-space-750 bg-space-850/80 shadow-[0_0_12px_rgba(255,255,255,0.03)]'
                        : 'border-space-800/60 bg-space-950/40 opacity-60'
                    }`}
                  >
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                        badge.unlocked ? '' : 'grayscale opacity-50'
                      }`}
                      style={{
                        borderColor: badge.unlocked ? `${badge.color}50` : '#334155',
                        backgroundColor: badge.unlocked ? `${badge.color}20` : '#0f172a',
                        color: badge.color,
                      }}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate">
                          {badge.title}
                        </span>
                        <span
                          className={`font-mono text-[9px] font-bold uppercase rounded px-1.5 py-0.2 ${
                            badge.unlocked
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {badge.unlocked ? 'DESBLOQUEADO' : 'EN PROGRESO'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-400 leading-tight">
                        {badge.desc}
                      </p>
                      <div className="mt-1 font-mono text-[10px] text-cyan-400">
                        Progreso: {badge.progress}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
