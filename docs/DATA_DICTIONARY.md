# Diccionario de Datos Biomédicos y Factores Ambientales (NASA HRP)

Este documento define las variables biomédicas, indicadores de salud y factores ambientales monitorizados por la plataforma de salud de misiones espaciales. Cumple con los estándares del **NASA Human Research Program (HRP)** y los cinco riesgos de los vuelos tripulados (**RIDGE**).

---

## 1. Constantes Vitales y Telemetría Hemodinámica

| Variable | Identificador | Unidad | Rango Nominal | Advertencia | Alerta Crítica | Impacto Espacial (RIDGE) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frecuencia Cardíaca** | `heart_rate` | bpm | 60 – 100 | 50 – 59 o 101 – 120 | < 50 o > 120 | Desacondicionamiento cardiovascular por microgravedad, pérdida de tono autonómico y arritmias. |
| **Saturación de Oxígeno** | `spo2` | % | 95.0 – 100.0 | 90.0 – 94.9 | < 90.0 | Hipoxia por baja presión de escafandra en paseos espaciales (EVA) o fallas en el soporte vital (ECLSS). |
| **Temperatura Corporal** | `temperature` | °C | 36.1 – 37.2 | 37.3 – 38.0 o < 36.1 | > 38.0 | Hipertermia espacial por fallo de refrigeración líquida (LCVG) o inmunosupresión e infecciones. |
| **Frecuencia Respiratoria** | `respiratory_rate` | rpm | 12 – 20 | 21 – 24 o 10 – 11 | > 24 o < 10 | Respuesta compensatoria a la acumulación de dióxido de carbono ($CO_2$) o acidosis metabólica. |
| **Presión Arterial (Sistólica / Diastólica)** | `blood_pressure` | mmHg | 90–120 / 60–80 | 121–139 / 81–89 | ≥ 140/90 o < 90/60 | Redistribución cefálica de fluidos (1.5 a 2 litros hacia tórax y cabeza) e hipotensión ortostática al reingreso. |

---

## 2. Indicadores Metabólicos, Neuro-Oculares y Musculoesqueléticos

| Variable | Identificador | Unidad | Rango Nominal | Advertencia | Alerta Crítica | Impacto Espacial (RIDGE) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Glucosa en Sangre** | `blood_glucose` | mg/dL | 70 – 110 | 111 – 139 o 60 – 69 | > 140 o < 60 | Resistencia transitoria a la insulina en microgravedad, estrés metabólico y variabilidad en la dieta espacial. |
| **Horas de Sueño Diarias** | `sleep_duration` | horas | 7.0 – 8.5 | 6.0 – 6.9 | < 6.0 o > 10.0 | Pérdida de referencias circadianas (16 amaneceres/puestas de sol cada 24h), ruido de ventiladores y microgravedad. |
| **Estrés y Salud Mental** | `stress_index` | % (0–100) | 0 – 35 | 36 – 65 | > 65 | Aislamiento extremo, confinamiento prolongado, distancia con seres queridos y sobrecarga operativa. |
| **Pérdida de Densidad Ósea** | `bone_loss_rate` | % / mes | < 0.40 | 0.41 – 0.90 | > 0.90 | Desmineralización por falta de carga mecánica (osteopenia de ingravidez); mitigable con 2h diarias de ejercicio resistivo (ARED). |
| **Ultrasonido Ocular SANS (ONSD)** | `ocular_onsd` | mm | 4.5 – 5.4 | 5.5 – 5.8 | > 5.8 | Síndrome Neuro-ocular Asociado a Vuelos Espaciales (edema de papila y dilatación de la vaina del nervio óptico). |

---

## 3. Factores Ambientales y Entornos de Misión

| Entorno de Misión | Gravedad ($g$) | Radiación Típica | Retardo a la Tierra | Grado de Autonomía Médica |
| :--- | :--- | :--- | :--- | :--- |
| **Nave en Tránsito Interplanetario (Orion / Mars Transit)** | 0.00 $g$ | 1.5 – 2.0 mSv/día | ~14.5 minutos (22 min máx) | **Total**: No hay evacuación ni telemedicina en vivo; la tripulación debe diagnosticarse y tratarse autónomamente. |
| **Estación Espacial Orbital (Lunar Gateway / ISS)** | 0.00 $g$ | 0.4 – 0.7 mSv/día | 1.3 segundos | **Asistida**: Telemetría y teleconsulta en tiempo real con Flight Surgeons en Houston. |
| **Vehículo Explorador Presurizado (Rover)** | 0.16 $g$ (Luna) / 0.38 $g$ (Marte) | 0.9 – 1.3 mSv/día | Dependiente de órbita | **Alta**: Espacio confinado biplaza con actividad extravehicular intensiva. |
| **Base Superficial Planetaria (Artemis Base Camp / Mars Hab)** | 0.16 $g$ / 0.38 $g$ | 0.3 – 0.5 mSv/día (con blindaje de regolito) | ~14.5 minutos | **Autónoma**: Infraestructura clínica de hábitat con centrifugadora y bio-laboratorio. |
