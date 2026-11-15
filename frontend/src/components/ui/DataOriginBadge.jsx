import React from 'react';
import { PencilLine, FlaskConical, Cpu } from 'lucide-react';
import { getOriginMeta } from '../../lib/records';

const ICONS = {
  manual: PencilLine,
  simulated: FlaskConical,
  automated: Cpu,
};

const TONES = {
  info: 'cyan',
  violet: 'violet',
  nominal: 'green',
};

/**
 * Marca el origen de un dato: manual, simulado o automatizado.
 * Un dato simulado nunca debe presentarse como una medición real.
 */
export default function DataOriginBadge({ origin = 'simulated', label, className = '', showIcon = true }) {
  const meta = getOriginMeta(origin);
  const Icon = ICONS[meta.value] || FlaskConical;

  return (
    <span
      className={`pill pill-${TONES[meta.tone] || 'cyan'} ${className}`}
      title={meta.description}
    >
      {showIcon ? <Icon className="h-3 w-3 shrink-0" aria-hidden="true" /> : <span className="pill-dot" aria-hidden="true" />}
      <span>{label || meta.short}</span>
    </span>
  );
}
