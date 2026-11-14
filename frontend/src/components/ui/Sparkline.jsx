import React from 'react';

function buildPath(values, width, height, padding = 2) {
  if (!values || values.length < 2) return '';

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = values.map((v, i) => ({
    x: padding + (i / (values.length - 1)) * innerW,
    y: padding + (1 - (v - min) / span) * innerH,
  }));

  // Light smoothing keeps the signal legible without overshooting real values.
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const tension = 0.16;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

export default function Sparkline({
  values = [],
  width = 132,
  height = 40,
  color = '#22D3EE',
  fill = true,
  strokeWidth = 1.6,
  className = '',
  id = 'spark',
  showDot = true,
}) {
  const path = buildPath(values, width, height, 3);
  const gradientId = `spark-fill-${id}`;

  if (!path) {
    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <line
          x1="3"
          y1={height / 2}
          x2={width - 3}
          y2={height / 2}
          stroke="rgba(148,197,255,0.16)"
          strokeDasharray="3 4"
        />
      </svg>
    );
  }

  const lastX = width - 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const lastY = 3 + (1 - (values[values.length - 1] - min) / span) * (height - 6);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill ? (
        <path
          d={`${path} L ${lastX} ${height - 1} L 3 ${height - 1} Z`}
          fill={`url(#${gradientId})`}
        />
      ) : null}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {showDot ? (
        <circle cx={lastX} cy={lastY} r="2" fill={color} stroke="#05080F" strokeWidth="1" />
      ) : null}
    </svg>
  );
}
