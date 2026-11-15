import React from 'react';

const VARIANTS = {
  nominal: 'pill-green',
  warning: 'pill-amber',
  high: 'pill-high',
  critical: 'pill-red',
  emergency: 'pill-emergency',
  info: 'pill-cyan',
  accent: 'pill-cyan',
  violet: 'pill-violet',
  simulated: 'pill-violet',
  neutral: '',
};

export default function StatusPill({
  status = 'neutral',
  children,
  className = '',
  dot = true,
  icon: Icon,
}) {
  return (
    <span className={`pill ${VARIANTS[status] || ''} ${className}`}>
      {Icon ? (
        <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      ) : dot ? (
        <span className="pill-dot" aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </span>
  );
}
