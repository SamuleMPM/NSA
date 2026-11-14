# Diccionario de Datos Biomédicos y Telemetría Fisiológica

Este documento establece el catálogo de variables fisiológicas, rangos operativos, umbrales de alerta y formatos de datos generados sintéticamente por el **Motor de Simulación** para la monitorización en el **Dashboard de Salud Aeroespacial**.

---

## 1. Signos Vitales Primarios

| Variable | Clave JSON | Unidad | Reposo Nominal | Ejercicio / EVA | Alerta Amarilla (Warning) | Alerta Roja (Critical) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frecuencia Cardíaca** | `heart_rate` | bpm | 60 - 85 | 90 - 160 | < 50 o 121 - 150 (reposo) | < 40 o > 160 (reposo) / > 185 (EVA) |
| **Presión Arterial Sistólica** | `blood_pressure_systolic` | mmHg | 100 - 125 | 130 - 180 | 90 - 99 o 135 - 149 | < 85 o > 160 (reposo) |
| **Presión Arterial Diastólica** | `blood_pressure_diastolic` | mmHg | 60 - 80 | 70 - 95 | 50 - 59 o 85 - 94 | < 45 o > 95 |
| **Saturación de Oxígeno** | `oxygen_saturation` (`spo2`) | % | 95 - 100 | 93 - 98 | 90 - 94 | < 90 (Hipoxia crítica) |
| **Frecuencia Respiratoria** | `respiration_rate` | rpm | 12 - 18 | 20 - 35 | 8 - 11 o 21 - 25 | < 8 o > 28 |
| **Temperatura Corporal Central**| `core_temperature` | °C | 36.5 - 37.5 | 37.2 - 38.3 | 37.6 - 38.2 (reposo) | < 35.0 (Hipotermia) o > 38.5 (Hipertermia) |

---

## 2. Biomarcadores Avanzados y Métricas Especializadas

| Variable | Clave JSON | Unidad | Nominal | Estrés / EVA | Warning | Critical |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HRV (RMSSD)** | `hrv_rmssd` | ms | 35 - 75 | 15 - 30 | 15 - 24 (reposo) | < 15 (Agotamiento autonómico severo) |
| **Presión CO2 Espirado** | `end_tidal_co2` (`etco2`) | mmHg | 35 - 45 | 38 - 48 | 46 - 52 (Hipercapnia leve) | > 53 o < 25 |
| **Consumo de Oxígeno** | `vo2` | mL/kg/min | 3.5 - 5.0 | 15.0 - 45.0 | N/A | > 50.0 (Agotamiento anaeróbico inminente) |
| **Tasa de Dosis de Radiación** | `radiation_rate` | \(\mu Sv/h\) | 15 - 50 | 15 - 80 | 100 - 500 (Alerta solar) | > 1000 (> 1 mSv/h, Tormenta SPE) |
| **Dosis Acumulada de Misión** | `cumulative_radiation` | mSv | < 150 | < 300 | 300 - 500 | > 600 (Límite ALARA superado) |
| **Índice de Tensión Fisiológica** | `psi_index` | Escala 0-10 | 0.0 - 2.9 | 3.0 - 6.5 | 6.6 - 8.4 (Estrés alto) | 8.5 - 10.0 (Riesgo inminente de colapso) |
| **Pérdida de Hidratación** | `hydration_loss_pct` | % peso | < 1.0% | 1.0 - 2.5% | 2.6 - 4.0% | > 4.0% (Deshidratación crítica) |

---

## 3. Estados de Clasificación y Triage

- `NOMINAL`: Todos los parámetros dentro de tolerancias basales u operativas.
- `WARNING`: Uno o más parámetros en rango de precaución; requiere monitorización activa o ajuste de parámetros ambientales/carga de trabajo.
- `CRITICAL`: Parámetros vitales en niveles de riesgo inminente; requiere protocolo de intervención médica o aborto inmediato de actividad extravehicular (EVA).
