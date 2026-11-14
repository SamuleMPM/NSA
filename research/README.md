# Equipo 1: Ciencias e Investigación

Este equipo es responsable de definir el marco científico, la caracterización fisiopatológica humana en ambientes espaciales, y los modelos matemáticos biomédicos necesarios para la generación de datos sintéticos y el diseño de escenarios de misión.

---

## Estructura de Trabajo y Responsabilidades

### 🔬 Integrante 1: Investigación Biomédica y Fisiológica
- **Estado:** ✅ **Completado**
- **Documento principal:** [Investigación Biomédica y Fisiológica Aeroespacial](./investigacion_biomedica_fisiologica.md)
- **Alcance entregado:**
  1. **Fisiopatología por sistemas en microgravedad y radiación:**
     - Sistema Cardiovascular: *Cephalic fluid shift*, remodelado miocárdico, intolerancia ortostática y arritmias.
     - Sistema Respiratorio: Mecánica en \(0\ g\), riesgos de hipoxia y acumulación de \(CO_2\) (hipercapnia en hábitats cerrados).
     - Termorregulación y Metabolismo: Disipación térmica sin convección, "Space Fever" y gasto metabólico en EVAs.
     - Sistema Musculoesquelético: Pérdida de masa ósea (1.0-1.5%/mes), hipercalciuria/litiasis renal y sarcopenia.
     - Sistema Neurovestibular: Síndrome de Adaptación al Espacio (SAS) y cinetosis.
     - Hematología e Inmunología: Anemia espacial por hemólisis acelerada y desregulación inmunológica.
     - Radiobiología: Dosis de radiación cósmica galáctica (GCR) y eventos de partículas solares (SPE).
     - Psicofisiología: Variabilidad de la frecuencia cardíaca (HRV) y ciclos circadianos.
  2. **Catálogo de variables y matriz de rangos clínicos:**
     - Signos vitales primarios (HR, BP sistólica/diastólica, SpO2, RR, Temperatura central).
     - Biomarcadores avanzados (HRV-RMSSD, EtCO2, VO2, PSI, hidratación, dosimetría).
     - Umbrales de alerta: *Nominal*, *Warning* (Alerta amarilla) y *Critical* (Alerta roja).
  3. **Modelos matemáticos dinámicos para el Motor de Simulación:**
     - Respuesta cardiorrespiratoria a la carga de trabajo (\(HR\), \(RR\)).
     - Curva de Hill y desaturación de \(SpO_2\) ante eventos de hipoxia.
     - Acumulación de \(CO_2\) y respuesta hemodinámica.
     - Índice de Tensión Fisiológica (*Physiological Strain Index* - PSI).
     - Componentes de ruido rosa estocástico (\(1/f\)) y variabilidad biológica.
  4. **Especificación del contrato JSON de telemetría:**
     - Payload ampliado compatible con `docs/ARCHITECTURE.md`.

---

### 🚀 Integrante 2: Investigación de Misiones y Escenarios
- **Estado:** ⏳ Pendiente / En progreso
- **Responsabilidades:**
  - Definición de misiones (LEO/ISS, Tránsito Lunar/Artemis, Hábitat en Marte).
  - Especificación de perfiles de misión, cronogramas de actividades y condiciones de emergencia ambiental.
  - Articulación con los escenarios de estrés fisiológico definidos por el Integrante 1.
