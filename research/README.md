# Equipo 1: Ciencias e Investigación

Este módulo constituye la base científica y fisiológica del proyecto **NSA — Plataforma de Monitorización de Salud Aeroespacial**.

## 👥 Responsables
- **Integrante 1:** Investigación biomédica, formulación de modelos matemáticos y curvas fisiológicas.
- **Integrante 2:** Investigación de misiones espaciales, definición de perfiles ambientales y escenarios de contingencia.

---

## 🔬 Estructura de Investigación
- **`models/physiological_models.py`:** Contiene las funciones de cálculo fisiológico:
  - **Frecuencia Cardíaca (HR):** Ecuación de gasto cardíaco lineal según esfuerzo metabólico y estrés psicofisiológico.
  - **Saturación de Oxígeno (SpO2):** Ecuación alveolar de gases y curva de disociación sigmoide de oxihemoglobina (Ecuación de Hill).
  - **Temperatura Corporal Central:** Balance de calor corporal ($Q_{\text{metabólico}} - Q_{\text{LCVG}} - Q_{\text{radiación}}$).
  - **Frecuencia Respiratoria (RR):** Regulación quimiorreceptora por acumulación de $\text{CO}_2$ arterial y esfuerzo ventilatorio.
- **`scenarios/mission_scenarios.json`:** Especificación formal de los escenarios de simulación:
  - *Microgravedad estándar (Nominal)*
  - *Paseo espacial extravehicular (EVA)*
  - *Alerta de hipoxia por despresurización*
  - *Estrés térmico por fallo de refrigeración LCVG*
  - *Ciclo circadiano de reposo y sueño*

---

## 📚 Referencias Médicas y Rangos Clínicos
Consulte el documento principal de referencia en [docs/DATA_DICTIONARY.md](../docs/DATA_DICTIONARY.md) para consultar los umbrales de alerta y variables monitorizadas.
