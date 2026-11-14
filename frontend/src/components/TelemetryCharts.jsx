import React, { useState } from 'react';
import { LineChart, Activity, Thermometer, Wind, Heart, TrendingUp } from 'lucide-react';

export default function TelemetryCharts({ history = [] }) {
  const [activeMetric, setActiveMetric] = useState('heart_rate');

  if (!history || history.length < 2) {
    return (
      <div className="hud-panel p-6 rounded-lg text-center font-mono text-xs text-slate-400">
        RECOPILANDO TELEMETRÍA PARA ANÁLISIS TEMPORAL...
      </div>
    );
  }

  const metricConfigs = {
    heart_rate: {
      label: 'Frecuencia Cardíaca',
      short: 'FC',
      unit: 'bpm',
      color: '#EF4444',
      gradientId: 'grad-hr-nasa',
      icon: <Heart className="w-3.5 h-3.5 text-red-400" />,
      minRange: 45,
      maxRange: 155,
      normalMin: 60,
      normalMax: 100
    },
    spo2: {
      label: 'Saturación SpO2',
      short: 'SpO2',
      unit: '%',
      color: '#00E5FF',
      gradientId: 'grad-spo2-nasa',
      icon: <Activity className="w-3.5 h-3.5 text-telemetry-cyan" />,
      minRange: 80,
      maxRange: 100,
      normalMin: 95,
      normalMax: 100
    },
    temperature: {
      label: 'Temperatura Corporal',
      short: 'TEMP',
      unit: '°C',
      color: '#F59E0B',
      gradientId: 'grad-temp-nasa',
      icon: <Thermometer className="w-3.5 h-3.5 text-telemetry-amber" />,
      minRange: 35.5,
      maxRange: 39.5,
      normalMin: 36.1,
      normalMax: 37.2
    },
    respiratory_rate: {
      label: 'Frecuencia Respiratoria',
      short: 'FR',
      unit: 'rpm',
      color: '#3B82F6',
      gradientId: 'grad-rr-nasa',
      icon: <Wind className="w-3.5 h-3.5 text-telemetry-blue" />,
      minRange: 8,
      maxRange: 32,
      normalMin: 12,
      normalMax: 20
    }
  };

  const currentCfg = metricConfigs[activeMetric];
  const values = history.map(h => h[activeMetric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const latestVal = values[values.length - 1];
  const avgVal = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);

  // Dimensiones del gráfico SVG
  const svgWidth = 720;
  const svgHeight = 180;
  const paddingX = 45;
  const paddingY = 20;

  const effectiveWidth = svgWidth - paddingX * 2;
  const effectiveHeight = svgHeight - paddingY * 2;

  const yMin = Math.min(currentCfg.minRange, Math.floor(minVal - 2));
  const yMax = Math.max(currentCfg.maxRange, Math.ceil(maxVal + 2));

  // Puntos calculados
  const points = history.map((item, idx) => {
    const x = paddingX + (idx / (history.length - 1)) * effectiveWidth;
    const normY = (item[activeMetric] - yMin) / (yMax - yMin);
    const y = svgHeight - paddingY - normY * effectiveHeight;
    return { x, y, val: item[activeMetric], time: item.timestamp };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Banda de rango normal
  const normYTop = paddingY + (1 - (currentCfg.normalMax - yMin) / (yMax - yMin)) * effectiveHeight;
  const normYBottom = paddingY + (1 - (currentCfg.normalMin - yMin) / (yMax - yMin)) * effectiveHeight;
  const clampedTop = Math.max(paddingY, Math.min(svgHeight - paddingY, normYTop));
  const clampedBottom = Math.max(paddingY, Math.min(svgHeight - paddingY, normYBottom));
  const zoneHeight = Math.max(2, clampedBottom - clampedTop);

  return (
    <div className="hud-panel p-3.5 rounded-lg border border-space-700/80">
      
      {/* Header y Selector de Métrica */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5 pb-2 border-b border-space-700/60 font-mono text-xs">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-telemetry-cyan" />
            <h3 className="font-heading font-semibold text-xs tracking-wider text-slate-100 uppercase">
              SERIE TEMPORAL // TELEMETRÍA BIOMÉDICA
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            BUFFER: {history.length} MUESTRAS • TASA: 0.5 HZ • INTERPOLACIÓN: LINEAL
          </span>
        </div>

        {/* Selector de Canales */}
        <div className="flex items-center gap-1 p-0.5 rounded bg-space-950 border border-space-700">
          {Object.entries(metricConfigs).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeMetric === key
                  ? "bg-space-800 text-telemetry-cyan border border-telemetry-cyan/40 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-space-900 border border-transparent"
              }`}
            >
              {cfg.icon}
              <span>{cfg.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Strip de Estadísticas Rápidas */}
      <div className="grid grid-cols-5 gap-2 mb-2 p-2 rounded bg-space-950 border border-space-700 font-mono text-xs">
        <div>
          <span className="text-[9px] text-slate-400 block">PARÁMETRO</span>
          <span className="font-bold text-slate-200 truncate block">{currentCfg.label}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block">ACTUAL</span>
          <span className="font-bold text-telemetry-cyan">{latestVal} {currentCfg.unit}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block">MÍNIMO</span>
          <span className="font-semibold text-slate-300">{minVal} {currentCfg.unit}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block">PROMEDIO</span>
          <span className="font-semibold text-slate-300">{avgVal} {currentCfg.unit}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 block">MÁXIMO</span>
          <span className="font-bold text-red-400">{maxVal} {currentCfg.unit}</span>
        </div>
      </div>

      {/* Gráfico SVG Técnico */}
      <div className="relative w-full rounded overflow-hidden bg-[#060A14] border border-space-700 p-1">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id={currentCfg.gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentCfg.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={currentCfg.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas de cuadrícula horizontal con etiquetas de valor */}
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
                  stroke="rgba(56, 189, 248, 0.07)"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748B"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {refVal}
                </text>
              </g>
            );
          })}

          {/* Banda de rango normal */}
          <rect
            x={paddingX}
            y={clampedTop}
            width={effectiveWidth}
            height={zoneHeight}
            fill="rgba(16, 185, 129, 0.05)"
            stroke="rgba(16, 185, 129, 0.2)"
            strokeDasharray="2 2"
          />

          {/* Área sombreada */}
          <path d={areaD} fill={`url(#${currentCfg.gradientId})`} />

          {/* Trazo vectorial principal */}
          <path
            d={pathD}
            fill="none"
            stroke={currentCfg.color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Puntos y etiquetas temporales */}
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={i === points.length - 1 ? 3.5 : 2}
                fill={i === points.length - 1 ? "#FFFFFF" : currentCfg.color}
                stroke={currentCfg.color}
                strokeWidth={1}
              />
              {(i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)) && (
                <text
                  x={pt.x}
                  y={svgHeight - 6}
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {pt.time}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

    </div>
  );
}
