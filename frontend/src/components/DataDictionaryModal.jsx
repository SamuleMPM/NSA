import React from 'react';
import { X, BookOpen, Heart, Activity, Thermometer, Wind, ShieldCheck } from 'lucide-react';

export default function DataDictionaryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const dictionary = [
    {
      variable: "Frecuencia Cardíaca",
      symbol: "HR",
      unit: "bpm",
      normal: "60 - 100",
      alert: "> 120 o < 50",
      description: "Frecuencia de contracción ventricular. Monitorizada continuamente mediante derivación Lead II.",
      icon: <Heart className="w-4 h-4 text-red-400" />
    },
    {
      variable: "Saturación de Oxígeno",
      symbol: "SpO2",
      unit: "%",
      normal: "95 - 100",
      alert: "< 90",
      description: "Porcentaje de oxihemoglobina en sangre capilar arterial. Crítico en paseos espaciales (EVA).",
      icon: <Activity className="w-4 h-4 text-telemetry-cyan" />
    },
    {
      variable: "Temperatura Corporal",
      symbol: "TEMP",
      unit: "°C",
      normal: "36.1 - 37.2",
      alert: "> 38.0",
      description: "Temperatura del núcleo corporal medida por sensor axilar / ótico continuo del traje espacial.",
      icon: <Thermometer className="w-4 h-4 text-telemetry-amber" />
    },
    {
      variable: "Frecuencia Respiratoria",
      symbol: "RR",
      unit: "rpm",
      normal: "12 - 20",
      alert: "> 24",
      description: "Ciclos de inhalación/exhalación por minuto. Incrementa bajo estrés o acumulación de CO2.",
      icon: <Wind className="w-4 h-4 text-telemetry-blue" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-lg border border-space-700 bg-space-950 shadow-hud-glow overflow-hidden font-mono text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-space-700 bg-space-900">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-telemetry-cyan" />
            <div>
              <h3 className="font-heading font-semibold text-xs text-white uppercase tracking-wider">
                DICCIONARIO DE DATOS Y RANGOS MÉDICOS // DATA_DICTIONARY.MD
              </h3>
              <p className="text-[10px] text-slate-400">VALORES CLÍNICOS DE REFERENCIA Y UMBRALES DE ALERTA</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-space-700 text-slate-400 text-[10px]">
                  <th className="pb-2 pl-2">VARIABLE</th>
                  <th className="pb-2">UNIDAD</th>
                  <th className="pb-2">RANGO NOMINAL</th>
                  <th className="pb-2">UMBRAL ALERTA</th>
                  <th className="pb-2 pr-2">DESCRIPCIÓN CLÍNICA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-space-700/60">
                {dictionary.map((item, i) => (
                  <tr key={i} className="hover:bg-space-900/60 transition-colors">
                    <td className="py-2.5 pl-2 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.variable}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-telemetry-cyan font-bold">{item.unit}</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-telemetry-green border border-emerald-500/30">
                        {item.normal}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-red-950/60 text-telemetry-crimson border border-red-500/40 font-bold">
                        {item.alert}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-[10px] text-slate-400 max-w-xs leading-relaxed">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded bg-space-900 border border-space-700 text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-telemetry-cyan shrink-0 mt-0.5" />
            <div className="text-[10px] leading-relaxed">
              <strong className="text-white block">Nota de Medicina Aeroespacial:</strong>
              En microgravedad, la pérdida de gradiente hidrostático provoca un desplazamiento cefálico de fluidos de aprox. 1.5 a 2 litros, alterando los volúmenes telediastólicos y los reflejos de barorreceptores.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-space-700 bg-space-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-space-850 hover:bg-space-800 text-slate-300 text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
