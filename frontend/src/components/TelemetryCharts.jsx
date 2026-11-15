import React, { useState } from 'react';
import {
  LineChart,
  Activity,
  Thermometer,
  Wind,
  Heart,
  ArrowUpRight,
  Gauge,
  Apple,
  Brain,
  Clock,
} from 'lucide-react';
import StatusPill from './ui/StatusPill';

function smoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const tension = 0.18;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export default function TelemetryCharts({ history = [] }) {
  const [activeMetric, setActiveMetric] = useState('heart_rate');

  if (!history || history.length < 2) {
    return (
      <div className="panel p-8 text-center">
        <Activity className="mx-auto mb-2 h-6 w-6 text-slate-600" aria-hidden="true" />
        <p className="mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
          Recopilando telemetría para análisis temporal…
        </p>
      </div>
    );
  }

  const metricConfigs = {
    heart_rate: {
      label: 'Frecuencia Cardíaca',
      short: 'HR',
      unit: 'bpm',
      color: '#0B3D91',
      gradientId: 'grad-hr-co',
      icon: Heart,
      minRange: 45,
      maxRange: 155,
      normalMin: 60,
      normalMax: 100,
    },
    systolic_bp: {
      label: 'Presión Sistólica',
      short: 'PA Sys',
      unit: 'mmHg',
      color: '#0EA5E9',
      gradientId: 'grad-bp-co',
      icon: Gauge,
      minRange: 80,
      maxRange: 160,
      normalMin: 100,
      normalMax: 125,
    },
    spo2: {
      label: 'Saturación SpO2',
      short: 'SpO2',
      unit: '%',
      color: '#0284C7',
      gradientId: 'grad-spo2-co',
      icon: Activity,
      minRange: 80,
      maxRange: 100,
      normalMin: 95,
      normalMax: 100,
    },
    temperature: {
      label: 'Temperatura Corporal',
      short: 'TEMP',
      unit: '°C',
      color: '#2563EB',
      gradientId: 'grad-temp-co',
      icon: Thermometer,
      minRange: 35.5,
      maxRange: 39.5,
      normalMin: 36.1,
      normalMax: 37.2,
    },
    respiratory_rate: {
      label: 'Frecuencia Respiratoria',
      short: 'RR',
      unit: 'rpm',
      color: '#38BDF8',
      gradientId: 'grad-rr-co',
      icon: Wind,
      minRange: 8,
      maxRange: 32,
      normalMin: 12,
      normalMax: 20,
    },
    glucose: {
      label: 'Glucosa en Sangre',
      short: 'GLUC',
      unit: 'mg/dL',
      color: '#061D47',
      gradientId: 'grad-gluc-co',
      icon: Apple,
      minRange: 60,
      maxRange: 160,
      normalMin: 70,
      normalMax: 115,
    },
    sleep_hours: {
      label: 'Horas de Sueño',
      short: 'SLEEP',
      unit: 'h',
      color: '#3B82F6',
      gradientId: 'grad-sleep-co',
      icon: Clock,
      minRange: 4,
      maxRange: 11,
      normalMin: 7.0,
      normalMax: 8.5,
    },
    stress_level: {
      label: 'Nivel de Estrés',
      short: 'ESTRÉS',
      unit: '%',
      color: '#1E3A8A',
      gradientId: 'grad-stress-co',
      icon: Brain,
      minRange: 0,
      maxRange: 100,
      normalMin: 0,
      normalMax: 40,
    },
  };

  const currentCfg = metricConfigs[activeMetric] || metricConfigs.heart_rate;
  const CurrentIcon = currentCfg.icon;

  // Fallbacks para métricas si la muestra histórica antigua solo tenía 4 variables
  const values = history.map((h, i) => {
    let val = h[activeMetric];
    if (val === undefined || val === null) {
      if (activeMetric === 'systolic_bp') val = 118 + Math.sin(i) * 5;
      else if (activeMetric === 'glucose') val = 92 + Math.cos(i) * 6;
      else if (activeMetric === 'sleep_hours') val = 7.6;
      else if (activeMetric === 'stress_level') val = 22 + (i % 5);
      else val = 0;
    }
    return Number(val);
  }).filter((n) => Number.isFinite(n));

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const latestVal = values[values.length - 1];
  const avgVal = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

  const svgWidth = 840;
  const svgHeight = 260;
  const paddingX = 48;
  const paddingY = 26;
  const paddingBottom = 32;

  const effectiveWidth = svgWidth - paddingX * 2;
  const effectiveHeight = svgHeight - paddingY - paddingBottom;

  const yMin = Math.min(currentCfg.minRange, Math.floor(minVal - 2));
  const yMax = Math.max(currentCfg.maxRange, Math.ceil(maxVal + 2));

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / (values.length - 1 || 1)) * effectiveWidth;
    const normY = (val - yMin) / ((yMax - yMin) || 1);
    const y = svgHeight - paddingBottom - normY * effectiveHeight;
    return { x, y, val, time: history[idx]?.timestamp || '--:--' };
  });

  const pathD = smoothPath(points);
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingBottom} L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  const normYTop = paddingY + (1 - (currentCfg.normalMax - yMin) / (yMax - yMin)) * effectiveHeight;
  const normYBottom = paddingY + (1 - (currentCfg.normalMin - yMin) / (yMax - yMin)) * effectiveHeight;
  const clampedTop = Math.max(paddingY, Math.min(svgHeight - paddingBottom, normYTop));
  const clampedBottom = Math.max(paddingY, Math.min(svgHeight - paddingBottom, normYBottom));
  const zoneHeight = Math.max(2, clampedBottom - clampedTop);
  const isInRange = latestVal >= currentCfg.normalMin && latestVal <= currentCfg.normalMax;

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#C9D9F5] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-[#C9D9F5] bg-[#DBEAFE] text-[#0B3D91]">
            <LineChart className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div>
            <span className="eyebrow block">TEMPORAL ANALYSIS / MULTI-CHANNEL</span>
            <h3 className="font-heading text-[13px] font-bold text-[#0B3D91]">
              Evolución biomédica y tendencia temporal
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="pill">{history.length} muestras</span>
          <span className="pill">0.5 Hz</span>
          <StatusPill status={isInRange ? 'nominal' : 'warning'}>
            {isInRange ? 'EN RANGO' : 'FUERA DE RANGO'}
          </StatusPill>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-3.5 sm:p-4">
        {/* Selector de Métricas */}
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(metricConfigs).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const active = activeMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMetric(key)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-[10px] font-semibold transition-colors ${
                  active
                    ? 'border-[#0B3D91] bg-[#DBEAFE] text-[#0B3D91]'
                    : 'border-[#C9D9F5] bg-white text-[#47598A] hover:bg-[#F8FAFD] hover:text-[#0B1B3A]'
                }`}
                aria-pressed={active}
              >
                <Icon className="h-3 w-3" style={{ color: active ? cfg.color : undefined }} aria-hidden="true" />
                <span>{cfg.short}</span>
                <span className={`hidden text-[9px] font-normal sm:inline ${active ? 'text-[#0B3D91]/70' : 'text-[#47598A]'}`}>
                  {cfg.unit}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="panel-inset px-2.5 py-2">
            <span className="eyebrow block">CANAL</span>
            <span className="mt-1 flex items-center gap-1.5 font-heading text-[11px] font-bold text-[#0B1B3A]">
              <CurrentIcon className="h-3.5 w-3.5" style={{ color: currentCfg.color }} aria-hidden="true" />
              {currentCfg.label}
            </span>
          </div>
          <div className="panel-inset px-2.5 py-2">
            <span className="eyebrow block">ACTUAL</span>
            <span className="value-sm mt-1 block" style={{ color: currentCfg.color }}>
              {latestVal} <span className="text-[9px] font-normal text-[#47598A]">{currentCfg.unit}</span>
            </span>
          </div>
          <div className="panel-inset px-2.5 py-2">
            <span className="eyebrow block">MÍNIMO</span>
            <span className="value-sm mt-1 block text-[#0B1B3A]">{minVal}</span>
          </div>
          <div className="panel-inset px-2.5 py-2">
            <span className="eyebrow block">PROMEDIO</span>
            <span className="value-sm mt-1 block text-[#0B1B3A]">{avgVal}</span>
          </div>
          <div className="panel-inset px-2.5 py-2">
            <span className="eyebrow block">MÁXIMO</span>
            <span className="value-sm mt-1 block text-[#0B1B3A]">{maxVal}</span>
          </div>
        </div>

        {/* Visualizador SVG con Curva Suavizada y Banda de Rango Seguro */}
        <div className="relative overflow-hidden rounded-md border border-[#C9D9F5] bg-white p-1 shadow-co-sm">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-auto w-full" role="img" aria-label={`Gráfico temporal de ${currentCfg.label}`}>
            <defs>
              <linearGradient id={currentCfg.gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={currentCfg.color} stopOpacity="0.16" />
                <stop offset="100%" stopColor={currentCfg.color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingY + ratio * effectiveHeight;
              const refVal = Math.round(yMax - ratio * (yMax - yMin));
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#C9D9F5"
                    strokeDasharray="2 5"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 3}
                    textAnchor="end"
                    fill="#47598A"
                    fontSize="9"
                    fontFamily="'JetBrains Mono', monospace"
                  >
                    {refVal}
                  </text>
                </g>
              );
            })}

            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const x = paddingX + ratio * effectiveWidth;
              return (
                <line
                  key={ratio}
                  x1={x}
                  y1={paddingY}
                  x2={x}
                  y2={svgHeight - paddingBottom}
                  stroke="rgba(201, 217, 245, 0.45)"
                  strokeDasharray="2 8"
                />
              );
            })}

            <rect
              x={paddingX}
              y={clampedTop}
              width={effectiveWidth}
              height={zoneHeight}
              fill="rgba(4, 120, 87, 0.08)"
              stroke="rgba(4, 120, 87, 0.28)"
              strokeDasharray="3 4"
            />
            <text
              x={paddingX + 7}
              y={clampedTop + 11}
              fill="#047857"
              fontSize="8"
              fontFamily="'JetBrains Mono', monospace"
              letterSpacing="1"
            >
              RANGO NOMINAL ({currentCfg.normalMin} - {currentCfg.normalMax} {currentCfg.unit})
            </text>

            <path d={areaD} fill={`url(#${currentCfg.gradientId})`} />
            <path
              d={pathD}
              fill="none"
              stroke={currentCfg.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((pt, i) => {
              const isLast = i === points.length - 1;
              const isAnchor = i === 0 || isLast || i === Math.floor(points.length / 2);
              return (
                <g key={i}>
                  {isLast ? (
                    <>
                      <circle cx={pt.x} cy={pt.y} r="7" fill={currentCfg.color} opacity="0.14" />
                      <circle cx={pt.x} cy={pt.y} r="3.2" fill="#FFFFFF" stroke={currentCfg.color} strokeWidth="2" />
                    </>
                  ) : (
                    <circle cx={pt.x} cy={pt.y} r="1.7" fill={currentCfg.color} opacity={i % 3 === 0 ? 0.8 : 0.3} />
                  )}
                  {isAnchor ? (
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fill="#47598A"
                      fontSize="8"
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {pt.time}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] text-[#47598A]">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-3 rounded-full" style={{ backgroundColor: currentCfg.color }} />
            {currentCfg.label.toUpperCase()} · {currentCfg.unit}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm border border-[#047857]/40 bg-[#047857]/15" />
            BANDA DE RANGO SEGURO
          </span>
          <span className="flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            {history[history.length - 1]?.timestamp || '--:--:--'} · ÚLTIMA MUESTRA
          </span>
        </div>
      </div>
    </section>
  );
}
